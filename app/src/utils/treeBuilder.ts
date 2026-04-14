/**
 * utils/treeBuilder.ts — Genealogy tree data layer and d3 layout math.
 *
 * Pure logic: computes x,y positions for 211 biblical people.
 * No rendering, no gestures — just math.
 *
 * Layout constants from PWA people.html:
 *   nodeSize: [90, 140] (horizontal, vertical)
 *   spouseXOffset: 88
 *   spouseYSpread: 58
 */

import { hierarchy, tree, type HierarchyPointNode } from 'd3-hierarchy';
import type { AssociationType, Person } from '../types';
import { isMessianic as checkMessianic } from './messianicLine';
import { applyTribalBloom } from './genealogyOrganic';
import { assignTier, type PersonTier } from './treeTiers';
import { logger } from './logger';

// ── Constants ───────────────────────────────────────────────────────

export const TREE_CONSTANTS = {
  nodeSize: [90, 140] as [number, number],
  spouseXOffset: 88,
  spouseYSpread: 58,
  spineRadius: 7,
  satelliteRadius: 5,
  spineFontSize: 11,
  satelliteFontSize: 9.5,
  touchTargetRadius: 18,
  minZoom: 0.15,
  // With the viewBox camera architecture the SVG is screen-sized, so
  // the Metal texture limit that forced a 1.5 cap no longer applies.
  maxZoom: 3.0,
  initialScaleMobile: 0.45,
  initialScaleTablet: 0.75,
  marriageTickHeight: 10,
  marriageTickGap: 6,
  /** Spine node radius — matches SPINE_R in TreeNode.tsx (Card #1281). */
  spineCardHalfW: 24,
  /** Satellite node radius — matches SAT_R in TreeNode.tsx (Card #1281). */
  satCardHalfW: 18,
} as const;

// ── Types ───────────────────────────────────────────────────────────

export interface TreePerson extends Person {
  nodeType: 'spine' | 'satellite';
  /** Satellite positioned around an anchor via associated_with (#1290). */
  isAssociate?: boolean;
}

export interface LayoutNode {
  data: TreePerson;
  x: number;
  y: number;
  parent: LayoutNode | null;
  children: LayoutNode[];
  depth: number;
  isSpouse: boolean;
  /** Structural tier for semantic zoom. Assigned by treeTiers.assignTier(). */
  tier: PersonTier;
}

export interface MarriageBar {
  partnerId: string;
  spouseId: string;
  x1: number;
  x2: number;
  y: number;
  midX: number;
}

export interface SpouseConnector {
  /** Anchor partner ID — used for dimming lookups at render time. */
  partnerId: string;
  x: number;
  yTop: number;
  yBottom: number;
}

export interface TreeLink {
  sourceId: string;
  targetId: string;
  sourceEra: string | null;
  targetEra: string | null;
  source: { x: number; y: number };
  target: { x: number; y: number };
  isSpine: boolean;
  /** Both source and target are on the messianic line (Matthew 1 lineage). */
  isMessianic: boolean;
}

/** Dotted connector from an anchor to one of its associated_with satellites (#1288). */
export interface AssociationLink {
  anchorId: string;
  memberId: string;
  source: { x: number; y: number };
  target: { x: number; y: number };
  type: AssociationType | null;
}

/** Text label placed at the apex of a type sub-bloom — "disciples",
 *  "contemporaries", etc. Rendered at mid-zoom+ so overview stays clean. */
export interface AssociateBloomLabel {
  anchorId: string;
  type: AssociationType;
  text: string;
  x: number;
  y: number;
}

/** Thick trail line from the anchor to an offset bloom's apex. Only
 *  emitted when the bloom had to be shifted sideways to avoid overlap. */
export interface AssociateTrail {
  anchorId: string;
  source: { x: number; y: number };
  target: { x: number; y: number };
}

// ── Spine computation ───────────────────────────────────────────────

export function computeSpineIds(people: Person[]): Set<string> {
  const byId = new Map(people.map((p) => [p.id, p]));
  const spine = new Set<string>();
  let current: Person | undefined = byId.get('jesus');
  while (current) {
    spine.add(current.id);
    current = current.father ? byId.get(current.father) : undefined;
  }
  return spine;
}

// ── Hierarchy construction ──────────────────────────────────────────

interface HierNode {
  data: TreePerson;
  children: HierNode[];
}

export function buildHierarchy(people: Person[], spineIds: Set<string>): HierNode | null {
  const byId = new Map<string, HierNode>();
  const spouseIds = new Set<string>();

  // Mark spouses (they're positioned separately, not as tree children)
  for (const p of people) {
    if (p.spouse_of) spouseIds.add(p.id);
  }

  // Create nodes
  for (const p of people) {
    byId.set(p.id, {
      data: { ...p, nodeType: spineIds.has(p.id) ? 'spine' : 'satellite' },
      children: [],
    });
  }

  // Track who has been attached as a child
  const attached = new Set<string>();

  // Attach children to fathers (or mothers if no father)
  for (const p of people) {
    if (spouseIds.has(p.id)) continue; // spouses handled separately
    const parentId = p.father ?? p.mother;
    if (!parentId) continue;
    const parent = byId.get(parentId);
    const child = byId.get(p.id);
    if (parent && child) {
      parent.children.push(child);
      attached.add(p.id);
    }
  }

  return byId.get('adam') ?? null;
}

/**
 * Find people who are NOT in Adam's tree and NOT spouses.
 * These are disconnected figures (prophets, judges, NT figures, etc.)
 */
export function findDisconnectedPeople(
  people: Person[],
  treeNodeIds: Set<string>,
): Person[] {
  return people.filter(
    (p) => !treeNodeIds.has(p.id) && !p.spouse_of
  );
}

// ── d3 layout ───────────────────────────────────────────────────────

export function layoutTree(root: HierNode): LayoutNode[] {
  const d3Root = hierarchy(root, (d) => d.children);

  const treeLayout = tree<HierNode>()
    .nodeSize(TREE_CONSTANTS.nodeSize);

  const pointRoot = treeLayout(d3Root);

  // Flatten to array
  const nodes: LayoutNode[] = [];
  pointRoot.each((d: HierarchyPointNode<HierNode>) => {
    nodes.push({
      data: d.data.data,
      x: d.x,
      y: d.y,
      parent: d.parent ? { data: d.parent.data.data, x: d.parent.x, y: d.parent.y } as LayoutNode : null,
      children: d.children?.map((c) => ({ data: c.data.data, x: c.x, y: c.y }) as LayoutNode) ?? [],
      depth: d.depth,
      isSpouse: false,
      // Tier is assigned in a single pass at the end of computeFullLayout
      // once we know spine membership + structural position for every
      // node. Initialize to 4 so the type is satisfied if anyone
      // accidentally inspects a partially-built layout.
      tier: 4,
    });
  });

  return nodes;
}

// ── Spouse positioning ──────────────────────────────────────────────

export function positionSpouses(
  nodes: LayoutNode[],
  people: Person[],
  spineIds: Set<string>
): LayoutNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.data.id, n]));
  const spouseNodes: LayoutNode[] = [];

  // Group spouses by partner
  const spousesByPartner = new Map<string, Person[]>();
  for (const p of people) {
    if (!p.spouse_of) continue;
    const existing = spousesByPartner.get(p.spouse_of) ?? [];
    existing.push(p);
    spousesByPartner.set(p.spouse_of, existing);
  }

  for (const [partnerId, spouses] of spousesByPartner) {
    const partner = nodeMap.get(partnerId);
    if (!partner) continue;

    const count = spouses.length;
    spouses.forEach((sp, i) => {
      const offset = count === 1 ? 0 : (i - (count - 1) / 2) * TREE_CONSTANTS.spouseYSpread;
      const spouseNode: LayoutNode = {
        data: {
          ...sp,
          nodeType: spineIds.has(sp.id) ? 'spine' : 'satellite',
        },
        x: partner.x + TREE_CONSTANTS.spouseXOffset,
        y: partner.y + offset,
        parent: null,
        children: [],
        depth: partner.depth,
        isSpouse: true,
        tier: 4,
      };
      spouseNodes.push(spouseNode);
    });
  }

  return [...nodes, ...spouseNodes];
}

// ── Links ───────────────────────────────────────────────────────────

export function computeLinks(
  nodes: LayoutNode[],
  spineIds: Set<string>,
): TreeLink[] {
  const links: TreeLink[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.data.id, n]));

  for (const node of nodes) {
    if (node.isSpouse) continue; // spouses have marriage bars, not parent links
    const parentId = node.data.father ?? node.data.mother;
    if (!parentId) continue;
    const parent = nodeMap.get(parentId);
    if (!parent) continue;

    const isSpine = spineIds.has(node.data.id) && spineIds.has(parent.data.id);
    const messianic = checkMessianic(node.data.id) && checkMessianic(parent.data.id);

    links.push({
      sourceId: parent.data.id,
      targetId: node.data.id,
      sourceEra: parent.data.era ?? null,
      targetEra: node.data.era ?? null,
      source: { x: parent.x, y: parent.y },
      target: { x: node.x, y: node.y },
      isSpine,
      isMessianic: messianic,
    });
  }

  return links;
}

// ── Marriage bars ───────────────────────────────────────────────────

export function computeMarriageBars(
  nodes: LayoutNode[],
): MarriageBar[] {
  const bars: MarriageBar[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.data.id, n]));

  for (const node of nodes) {
    if (!node.isSpouse || !node.data.spouse_of) continue;
    const partner = nodeMap.get(node.data.spouse_of);
    if (!partner) continue;

    const partnerHalfW = partner.data.nodeType === 'spine'
      ? TREE_CONSTANTS.spineCardHalfW : TREE_CONSTANTS.satCardHalfW;
    const spouseHalfW = node.data.nodeType === 'spine'
      ? TREE_CONSTANTS.spineCardHalfW : TREE_CONSTANTS.satCardHalfW;
    const x1 = partner.x + partnerHalfW + 2;
    const x2 = node.x - spouseHalfW - 2;
    const y = (partner.y + node.y) / 2;
    const midX = (x1 + x2) / 2;

    bars.push({
      partnerId: partner.data.id,
      spouseId: node.data.id,
      x1, x2, y, midX,
    });
  }

  return bars;
}

// ── Spouse connectors ───────────────────────────────────────────────

export function computeSpouseConnectors(
  nodes: LayoutNode[],
): SpouseConnector[] {
  const connectors: SpouseConnector[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.data.id, n]));

  // Group spouse nodes by partner
  const spousesByPartner = new Map<string, LayoutNode[]>();
  for (const node of nodes) {
    if (!node.isSpouse || !node.data.spouse_of) continue;
    const existing = spousesByPartner.get(node.data.spouse_of) ?? [];
    existing.push(node);
    spousesByPartner.set(node.data.spouse_of, existing);
  }

  for (const [partnerId, spouses] of spousesByPartner) {
    if (spouses.length < 2) continue;
    const partner = nodeMap.get(partnerId);
    if (!partner) continue;

    const ys = spouses.map((s) => s.y).sort((a, b) => a - b);

    connectors.push({
      partnerId: partner.data.id,
      x: partner.x + TREE_CONSTANTS.spouseXOffset,
      yTop: ys[0],
      yBottom: ys[ys.length - 1],
    });
  }

  return connectors;
}

// ── Full layout pipeline ────────────────────────────────────────────

export interface TreeBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface TreeLayoutResult {
  nodes: LayoutNode[];
  links: TreeLink[];
  marriageBars: MarriageBar[];
  spouseConnectors: SpouseConnector[];
  /** Dotted connectors from anchors to associated_with satellites (#1288). */
  associationLinks: AssociationLink[];
  /** Type labels placed at each sub-bloom's apex ("disciples", "contemporaries"…). */
  associateBloomLabels: AssociateBloomLabel[];
  /** Thick trail from the anchor to an offset bloom's apex — only when
   *  the bloom had to be shifted to avoid overlapping other nodes. */
  associateTrails: AssociateTrail[];
  spineIds: Set<string>;
  bounds: TreeBounds;
}

// ── Organic layout post-processors (#1291) ────────────────────────────

/** Walk the genealogical subtree rooted at `rootId`, shifting every
 *  descendant by (dx, dy). Traversal is done via father links, which
 *  mirrors how `buildHierarchy` composed the tree. */
function shiftSubtree(nodes: LayoutNode[], rootId: string, dx: number, dy: number): void {
  if (dx === 0 && dy === 0) return;
  const byFather = new Map<string, LayoutNode[]>();
  for (const n of nodes) {
    const f = n.data.father;
    if (!f) continue;
    const list = byFather.get(f) ?? [];
    list.push(n);
    byFather.set(f, list);
  }
  const queue = [rootId];
  const visited = new Set<string>([rootId]);
  while (queue.length > 0) {
    const parentId = queue.shift()!;
    const children = byFather.get(parentId) ?? [];
    for (const child of children) {
      if (visited.has(child.data.id)) continue;
      visited.add(child.data.id);
      child.x += dx;
      child.y += dy;
      queue.push(child.data.id);
    }
  }
}

/** Fan Jacob's sons in a tribal bloom arc beneath Jacob. Each son's whole
 *  subtree is translated by the same delta so sub-lineages stay attached. */
function applyJacobBloom(nodes: LayoutNode[]): void {
  const jacobNode = nodes.find((n) => n.data.id === 'jacob' && !n.isSpouse);
  if (!jacobNode) return;
  const sons = nodes.filter((n) => n.data.father === 'jacob' && !n.isSpouse);
  if (sons.length < 3) return;
  const placed = applyTribalBloom(
    { x: jacobNode.x, y: jacobNode.y },
    sons.map((s) => ({ id: s.data.id, x: s.x, y: s.y })),
    { radius: 180, startAngleDegrees: -75, endAngleDegrees: 75 },
  );
  for (let i = 0; i < sons.length; i++) {
    const dx = placed[i].x - sons[i].x;
    const dy = placed[i].y - sons[i].y;
    sons[i].x += dx;
    sons[i].y += dy;
    shiftSubtree(nodes, sons[i].data.id, dx, dy);
  }
}

/** Amplify horizontal spread for the subtrees of biblically-central figures
 *  so the tree breathes around them rather than packing uniformly. */
function applyImportantFigureSpread(nodes: LayoutNode[]): void {
  const IMPORTANT = ['jacob', 'david', 'abraham'];
  const SPREAD = 1.18;
  const byFather = new Map<string, LayoutNode[]>();
  for (const n of nodes) {
    const f = n.data.father;
    if (!f) continue;
    const list = byFather.get(f) ?? [];
    list.push(n);
    byFather.set(f, list);
  }
  for (const id of IMPORTANT) {
    const root = nodes.find((n) => n.data.id === id && !n.isSpouse);
    if (!root) continue;
    const anchorX = root.x;
    const queue = [id];
    const visited = new Set<string>([id]);
    while (queue.length > 0) {
      const parentId = queue.shift()!;
      const children = byFather.get(parentId) ?? [];
      for (const child of children) {
        if (visited.has(child.data.id)) continue;
        visited.add(child.data.id);
        child.x = anchorX + (child.x - anchorX) * SPREAD;
        queue.push(child.data.id);
      }
    }
  }
}

// ── Associate clustering (#1290, type-sector redesign) ────────────────

/** One of the four biblical association categories, rendered in its
 *  own angular sector around the anchor. */
interface AssociateSectorSpec {
  /** Centre angle in degrees — 0 = straight down. */
  center: number;
  /** Max half-sweep in degrees; actual sweep may be narrower. */
  halfSweepMax: number;
  /** Label text placed at the sub-bloom's apex. */
  labelText: string;
}

const ASSOCIATE_TYPE_ORDER = ['disciple', 'servant', 'contemporary', 'adversary'] as const;

const ASSOCIATE_SECTORS: Record<string, AssociateSectorSpec> = {
  // Main group fans straight down in a wide arc.
  disciple:     { center:   0, halfSweepMax: 80, labelText: 'disciples' },
  // Servants share the disciple sector but sit inside, closer to the anchor.
  servant:      { center:   0, halfSweepMax: 35, labelText: 'servants' },
  // Neutral and opposition fan to the right and left respectively.
  contemporary: { center:  70, halfSweepMax: 25, labelText: 'contemporaries' },
  adversary:    { center: -70, halfSweepMax: 25, labelText: 'adversaries' },
};

const ASSOCIATE_BLOOM_GAP = 80;         // target centre-to-centre between circles
const ASSOCIATE_MIN_RADIUS = 120;
const ASSOCIATE_MAX_PER_RING = 12;      // above this, split into concentric rings
const ASSOCIATE_LABEL_GAP = 28;
const ASSOCIATE_COLLISION_PAD = 60;     // halo around other nodes to treat as occupied
const ASSOCIATE_SHIFT_STEP_X = 180;     // px to offset the bloom when a placement collides

/** Lay out one type group, returning member positions RELATIVE to the
 *  bloom centre (0,0) plus a label position and outermost radius. */
function layOutAssociateType(
  members: Person[],
  sector: AssociateSectorSpec,
  innerRadius: number,
): { placed: Array<{ id: string; x: number; y: number }>; labelX: number; labelY: number; outerRadius: number } {
  // Split very large groups into 2 concentric half-rings so the radius
  // doesn't have to blow past 800 px.
  const rings = members.length > ASSOCIATE_MAX_PER_RING
    ? [
        members.slice(0, Math.ceil(members.length / 2)),
        members.slice(Math.ceil(members.length / 2)),
      ]
    : [members];

  const all: Array<{ id: string; x: number; y: number }> = [];
  let outer = innerRadius;
  rings.forEach((ring, ringIdx) => {
    const desiredSweep = Math.min(sector.halfSweepMax * 2, 60 + ring.length * 10);
    const sweepRad = (desiredSweep * Math.PI) / 180;
    const radius = Math.max(
      innerRadius + ringIdx * 110,
      (ASSOCIATE_BLOOM_GAP * Math.max(ring.length - 1, 1)) / sweepRad,
    );
    outer = Math.max(outer, radius);
    const half = desiredSweep / 2;
    const placed = applyTribalBloom(
      { x: 0, y: 0 },
      ring.map((m) => ({ id: m.id, x: 0, y: 0 })),
      {
        radius,
        startAngleDegrees: sector.center - half,
        endAngleDegrees: sector.center + half,
      },
    );
    all.push(...placed);
  });

  // Label sits just beyond the outermost ring at the sector's centre angle.
  const labelRadius = outer + ASSOCIATE_LABEL_GAP;
  const labelAngle = (sector.center * Math.PI) / 180;
  return {
    placed: all,
    labelX: labelRadius * Math.sin(labelAngle),
    labelY: labelRadius * Math.cos(labelAngle),
    outerRadius: outer,
  };
}

export function computeFullLayout(
  people: Person[],
): TreeLayoutResult {
  const spineIds = computeSpineIds(people);
  const root = buildHierarchy(people, spineIds);

  if (!root) {
    return {
      nodes: [], links: [], marriageBars: [], spouseConnectors: [],
      associationLinks: [], associateBloomLabels: [], associateTrails: [],
      spineIds,
      bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100 },
    };
  }

  const treeNodes = layoutTree(root);
  const allTreeNodes = positionSpouses(treeNodes, people, spineIds);

  // Organic layout overrides (#1291):
  //   1. Fan Jacob's 12 sons in a tribal bloom arc beneath him
  //   2. Amplify subtree spread for key figures (Jacob / David / Abraham)
  applyJacobBloom(allTreeNodes);
  applyImportantFigureSpread(allTreeNodes);

  // Find the bounding box of the main tree
  const treeNodeIds = new Set(allTreeNodes.map((n) => n.data.id));
  let maxTreeY = 0;
  for (const n of allTreeNodes) {
    if (n.y > maxTreeY) maxTreeY = n.y;
  }

  // Position disconnected people below the main tree.
  // Partition into:
  //   - associated members: people with valid `associated_with` → cluster near anchor
  //   - unanchored: everyone else → era-grouped grid (legacy behavior)
  const disconnected = findDisconnectedPeople(people, treeNodeIds);
  const peopleById = new Map(people.map((p) => [p.id, p]));

  // associated_with is "valid" when the anchor exists in people.json. The anchor
  // itself can be on the main tree OR in the disconnected era-grid — either way,
  // it'll have a position by the time we lay out the cluster.
  const clusterByAnchor = new Map<string, Person[]>();
  const associatedMemberIds = new Set<string>();
  for (const p of disconnected) {
    if (p.associated_with && peopleById.has(p.associated_with)) {
      const list = clusterByAnchor.get(p.associated_with) ?? [];
      list.push(p);
      clusterByAnchor.set(p.associated_with, list);
      associatedMemberIds.add(p.id);
    }
  }
  const unanchored = disconnected.filter((p) => !associatedMemberIds.has(p.id));

  // Group unanchored by era, maintain a consistent era order
  const ERA_ORDER = [
    'primeval', 'patriarch', 'exodus', 'judges',
    'kingdom', 'prophets', 'exile',
    'intertestamental', 'nt',
  ];
  const byEra = new Map<string, Person[]>();
  for (const p of unanchored) {
    const era = p.era ?? 'unknown';
    const existing = byEra.get(era) ?? [];
    existing.push(p);
    byEra.set(era, existing);
  }

  const disconnectedNodes: LayoutNode[] = [];
  const CLUSTER_GAP_Y = 180;   // space between main tree and clusters
  const NODE_SPACING_X = 120;   // horizontal spacing within a row
  const ROW_SPACING_Y = 60;     // vertical spacing between rows
  const COLS_PER_ROW = 8;       // people per row before wrapping
  let clusterY = maxTreeY + CLUSTER_GAP_Y;

  for (const era of ERA_ORDER) {
    const group = byEra.get(era);
    if (!group || group.length === 0) continue;

    // Position this era's people in rows
    group.forEach((person, i) => {
      const col = i % COLS_PER_ROW;
      const row = Math.floor(i / COLS_PER_ROW);
      const x = col * NODE_SPACING_X;
      const y = clusterY + row * ROW_SPACING_Y;

      disconnectedNodes.push({
        data: { ...person, nodeType: 'satellite' },
        x,
        y,
        parent: null,
        children: [],
        depth: 0,
        isSpouse: false,
        tier: 4,
      });
    });

    // Also position spouses of disconnected people
    for (const p of people) {
      if (p.spouse_of && group.some((g) => g.id === p.spouse_of)) {
        const partner = disconnectedNodes.find((n) => n.data.id === p.spouse_of);
        if (partner && !treeNodeIds.has(p.id) && !associatedMemberIds.has(p.id)) {
          disconnectedNodes.push({
            data: { ...p, nodeType: 'satellite' },
            x: partner.x + TREE_CONSTANTS.spouseXOffset,
            y: partner.y,
            parent: null,
            children: [],
            depth: 0,
            isSpouse: true,
            tier: 4,
          });
        }
      }
    }

    const rows = Math.ceil(group.length / COLS_PER_ROW);
    clusterY += rows * ROW_SPACING_Y + 80; // gap before next era group
  }

  // Lay out association clusters by type with collision avoidance (#1290).
  // Members are grouped by association_type; each type gets its own angular
  // sector around the anchor. Very large groups split into concentric rings.
  // If the resulting bloom would overlap existing nodes, the whole bloom
  // shifts sideways and a thick trail connects the anchor to its apex.
  const positionById = new Map<string, { x: number; y: number }>();
  for (const n of allTreeNodes) positionById.set(n.data.id, { x: n.x, y: n.y });
  for (const n of disconnectedNodes) positionById.set(n.data.id, { x: n.x, y: n.y });

  const associationLinks: AssociationLink[] = [];
  const associateBloomLabels: AssociateBloomLabel[] = [];
  const associateTrails: AssociateTrail[] = [];

  logger.info('Assoc', `${clusterByAnchor.size} anchors to lay out`);
  for (const [anchorId, members] of clusterByAnchor) {
    const anchorPos = positionById.get(anchorId);
    if (!anchorPos) {
      logger.info('Assoc', `anchor=${anchorId} SKIPPED — no position`);
      continue; // anchor wasn't placed — drop silently
    }

    // Group this anchor's members by association_type (null → 'disciple')
    const byType = new Map<string, Person[]>();
    for (const m of members) {
      const t = (m.association_type ?? 'disciple') as string;
      const list = byType.get(t) ?? [];
      list.push(m);
      byType.set(t, list);
    }

    // Servants (if present) sit inside the disciple sector, closer to the
    // anchor. Disciples then start at a larger inner radius.
    const servantCount = byType.get('servant')?.length ?? 0;
    const discipleStart = servantCount > 0 ? 230 : ASSOCIATE_MIN_RADIUS;

    // Lay out each type (positions relative to 0,0)
    const sub: Record<string, ReturnType<typeof layOutAssociateType> | null> = {
      disciple: null, servant: null, contemporary: null, adversary: null,
    };
    for (const type of ASSOCIATE_TYPE_ORDER) {
      const list = byType.get(type);
      if (!list || list.length === 0) continue;
      const sector = ASSOCIATE_SECTORS[type];
      const start = type === 'disciple' ? discipleStart : ASSOCIATE_MIN_RADIUS;
      sub[type] = layOutAssociateType(list, sector, start);
    }

    // Aggregate bbox across all sub-blooms (relative to bloom centre 0,0)
    let bbMinX = 0, bbMaxX = 0, bbMinY = 0, bbMaxY = 0;
    for (const type of ASSOCIATE_TYPE_ORDER) {
      const s = sub[type];
      if (!s) continue;
      for (const p of s.placed) {
        if (p.x < bbMinX) bbMinX = p.x;
        if (p.x > bbMaxX) bbMaxX = p.x;
        if (p.y < bbMinY) bbMinY = p.y;
        if (p.y > bbMaxY) bbMaxY = p.y;
      }
    }

    // Collision check: does placing the bloom at anchor + (offsetX, 0)
    // overlap any non-member existing node?
    const memberIdSet = new Set(members.map((m) => m.id));
    const checkCollision = (offsetX: number): boolean => {
      const minX = anchorPos.x + offsetX + bbMinX - ASSOCIATE_COLLISION_PAD;
      const maxX = anchorPos.x + offsetX + bbMaxX + ASSOCIATE_COLLISION_PAD;
      const minY = anchorPos.y + bbMinY - ASSOCIATE_COLLISION_PAD;
      const maxY = anchorPos.y + bbMaxY + ASSOCIATE_COLLISION_PAD;
      for (const [id, pos] of positionById) {
        if (id === anchorId || memberIdSet.has(id)) continue;
        if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
          return true;
        }
      }
      return false;
    };

    let offsetX = 0;
    if (checkCollision(0)) {
      let found = false;
      for (let step = 1; step <= 8 && !found; step++) {
        for (const sign of [1, -1]) {
          const dx = sign * step * ASSOCIATE_SHIFT_STEP_X;
          if (!checkCollision(dx)) {
            offsetX = dx;
            found = true;
            break;
          }
        }
      }
      if (!found) offsetX = 9 * ASSOCIATE_SHIFT_STEP_X; // forced far-right
    }

    // Emit member nodes + anchor→member links + type labels
    for (const type of ASSOCIATE_TYPE_ORDER) {
      const s = sub[type];
      if (!s) continue;
      const memberIndex = new Map(members.map((m) => [m.id, m]));
      for (const placed of s.placed) {
        const person = memberIndex.get(placed.id);
        if (!person) continue;
        const absX = anchorPos.x + offsetX + placed.x;
        const absY = anchorPos.y + placed.y;
        disconnectedNodes.push({
          data: { ...person, nodeType: 'satellite', isAssociate: true },
          x: absX,
          y: absY,
          parent: null,
          children: [],
          depth: 0,
          isSpouse: false,
          tier: 4,
        });
        positionById.set(person.id, { x: absX, y: absY });
        associationLinks.push({
          anchorId,
          memberId: person.id,
          source: { x: anchorPos.x, y: anchorPos.y },
          target: { x: absX, y: absY },
          type: person.association_type,
        });
      }
      associateBloomLabels.push({
        anchorId,
        type: type as AssociationType,
        text: ASSOCIATE_SECTORS[type].labelText,
        x: anchorPos.x + offsetX + s.labelX,
        y: anchorPos.y + s.labelY,
      });
    }

    // If we had to shift, draw a thick trail from the anchor to the
    // bloom's apex (top of its bbox).
    if (offsetX !== 0) {
      associateTrails.push({
        anchorId,
        source: { x: anchorPos.x, y: anchorPos.y },
        target: { x: anchorPos.x + offsetX, y: anchorPos.y + bbMinY },
      });
    }

    const typeBreakdown = Array.from(byType.entries())
      .map(([t, list]) => `${t}=${list.length}`).join(',');
    logger.info(
      'Assoc',
      `anchor=${anchorId} N=${members.length} types=${typeBreakdown} `
      + `bbox=${Math.round(bbMaxX - bbMinX)}x${Math.round(bbMaxY - bbMinY)} `
      + `offsetX=${offsetX} trail=${offsetX !== 0}`,
    );
  }

  const allNodes = [...allTreeNodes, ...disconnectedNodes];

  // Assign structural tiers (single pass, now that every node has its
  // final position and membership information). treeNodeIds is the set
  // of IDs attached to the main biological tree (d3 hierarchy) — anyone
  // outside that set who isn't a spine member falls through to tier 3/4.
  for (const node of allNodes) {
    node.tier = assignTier(
      node.data.id,
      spineIds,
      treeNodeIds,
      node.data.spouse_of,
      node.data.isAssociate === true,
      !!node.data.bio,
    );
  }

  const links = computeLinks(allNodes, spineIds);
  const marriageBars = computeMarriageBars(allNodes);
  const spouseConnectors = computeSpouseConnectors(allNodes);

  // Compute bounding box with padding for labels
  const PAD = 100;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of allNodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }
  // Add padding for labels and spouse offsets
  minX -= PAD;
  maxX += PAD + TREE_CONSTANTS.spouseXOffset;
  minY -= PAD;
  maxY += PAD;

  const bounds: TreeBounds = {
    minX, maxX, minY, maxY,
    width: maxX - minX,
    height: maxY - minY,
  };

  logger.info(
    'Layout',
    `nodes=${allNodes.length} links=${links.length} mb=${marriageBars.length} `
    + `sc=${spouseConnectors.length} al=${associationLinks.length} `
    + `labels=${associateBloomLabels.length} trails=${associateTrails.length} `
    + `bounds=${Math.round(bounds.width)}x${Math.round(bounds.height)} `
    + `minX=${Math.round(bounds.minX)} minY=${Math.round(bounds.minY)}`,
  );

  return {
    nodes: allNodes, links, marriageBars, spouseConnectors,
    associationLinks, associateBloomLabels, associateTrails,
    spineIds, bounds,
  };
}
