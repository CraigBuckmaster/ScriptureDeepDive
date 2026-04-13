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
  maxZoom: 3,
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
}

export interface MarriageBar {
  partnerId: string;
  spouseId: string;
  x1: number;
  x2: number;
  y: number;
  midX: number;
  dimmed: boolean;
}

export interface SpouseConnector {
  x: number;
  yTop: number;
  yBottom: number;
  dimmed: boolean;
}

export interface TreeLink {
  source: { x: number; y: number };
  target: { x: number; y: number };
  isSpine: boolean;
  /** Both source and target are on the messianic line (Matthew 1 lineage). */
  isMessianic: boolean;
  dimmed: boolean;
}

/** Dotted connector from an anchor to one of its associated_with satellites (#1288). */
export interface AssociationLink {
  anchorId: string;
  memberId: string;
  source: { x: number; y: number };
  target: { x: number; y: number };
  type: AssociationType | null;
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
  filterEra: string | null
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
    // A link is dimmed only when BOTH endpoints are dimmed
    const dimmed = filterEra !== null
      && isDimmed(node.data, filterEra, spineIds)
      && isDimmed(parent.data, filterEra, spineIds);

    links.push({
      source: { x: parent.x, y: parent.y },
      target: { x: node.x, y: node.y },
      isSpine,
      isMessianic: messianic,
      dimmed: !!dimmed,
    });
  }

  return links;
}

// ── Marriage bars ───────────────────────────────────────────────────

export function computeMarriageBars(
  nodes: LayoutNode[],
  spineIds: Set<string>,
  filterEra: string | null
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
    const dimmed = filterEra !== null
      && isDimmed(node.data, filterEra, spineIds)
      && isDimmed(partner.data, filterEra, spineIds);

    bars.push({
      partnerId: partner.data.id,
      spouseId: node.data.id,
      x1, x2, y, midX,
      dimmed,
    });
  }

  return bars;
}

// ── Spouse connectors ───────────────────────────────────────────────

export function computeSpouseConnectors(
  nodes: LayoutNode[],
  spineIds: Set<string>,
  filterEra: string | null
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
    const dimmed = filterEra !== null
      && isDimmed(partner.data, filterEra, spineIds);

    connectors.push({
      x: partner.x + TREE_CONSTANTS.spouseXOffset,
      yTop: ys[0],
      yBottom: ys[ys.length - 1],
      dimmed,
    });
  }

  return connectors;
}

// ── Dimming logic ───────────────────────────────────────────────────

function isDimmed(person: TreePerson | Person, filterEra: string, spineIds: Set<string>): boolean {
  if (spineIds.has(person.id)) return false; // spine never dimmed
  return person.era !== filterEra;
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
  // Gap-driven radius: solve for the radius that gives each son at least
  // JACOB_GAP px of breathing room on the arc. Spine circles are 48 px
  // wide and patriarch names run 60–110 px, so 130 px gap keeps them legible.
  const JACOB_GAP = 130;
  const MIN_RADIUS_JACOB = 220;
  const sweepDeg = Math.min(170, 80 + sons.length * 8);
  const sweepRad = (sweepDeg * Math.PI) / 180;
  const radius = Math.max(
    MIN_RADIUS_JACOB,
    (JACOB_GAP * Math.max(sons.length - 1, 1)) / sweepRad,
  );
  const placed = applyTribalBloom(
    { x: jacobNode.x, y: jacobNode.y },
    sons.map((s) => ({ id: s.data.id, x: s.x, y: s.y })),
    { radius, startAngleDegrees: -sweepDeg / 2, endAngleDegrees: sweepDeg / 2 },
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

export function computeFullLayout(
  people: Person[],
  filterEra: string | null
): TreeLayoutResult {
  const spineIds = computeSpineIds(people);
  const root = buildHierarchy(people, spineIds);

  if (!root) {
    return {
      nodes: [], links: [], marriageBars: [], spouseConnectors: [],
      associationLinks: [], spineIds,
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
          });
        }
      }
    }

    const rows = Math.ceil(group.length / COLS_PER_ROW);
    clusterY += rows * ROW_SPACING_Y + 80; // gap before next era group
  }

  // Layout association clusters radially around their anchor via tribal
  // bloom (#1290). Sweep widens with cluster size so large groups fan more.
  const positionById = new Map<string, { x: number; y: number }>();
  for (const n of allTreeNodes) positionById.set(n.data.id, { x: n.x, y: n.y });
  for (const n of disconnectedNodes) positionById.set(n.data.id, { x: n.x, y: n.y });

  const associationLinks: AssociationLink[] = [];
  for (const [anchorId, members] of clusterByAnchor) {
    const anchorPos = positionById.get(anchorId);
    if (!anchorPos) continue; // anchor wasn't placed (orphaned anchor) — drop silently

    // Gap-driven radius: ensure ≥ BLOOM_GAP px centre-to-centre even for
    // large clusters (e.g. Jesus's 16 disciples). Satellite circles are
    // 30 px wide so 80 px keeps a comfortable name zone between them.
    const BLOOM_GAP = 80;
    const MIN_RADIUS_ASSOCIATE = 120;
    const sweepDeg = Math.min(180, 80 + members.length * 10);
    const sweepRad = (sweepDeg * Math.PI) / 180;
    const radius = Math.max(
      MIN_RADIUS_ASSOCIATE,
      (BLOOM_GAP * Math.max(members.length - 1, 1)) / sweepRad,
    );
    const placed = applyTribalBloom(
      { x: anchorPos.x, y: anchorPos.y },
      members.map((m) => ({ id: m.id, x: 0, y: 0 })),
      {
        radius,
        startAngleDegrees: -sweepDeg / 2, // fan below the anchor, centred straight down
        endAngleDegrees: sweepDeg / 2,
      },
    );

    members.forEach((p, i) => {
      const { x, y } = placed[i];
      disconnectedNodes.push({
        data: { ...p, nodeType: 'satellite', isAssociate: true },
        x,
        y,
        parent: null,
        children: [],
        depth: 0,
        isSpouse: false,
      });
      associationLinks.push({
        anchorId,
        memberId: p.id,
        source: { x: anchorPos.x, y: anchorPos.y },
        target: { x, y },
        type: p.association_type,
      });
    });
  }

  const allNodes = [...allTreeNodes, ...disconnectedNodes];
  const links = computeLinks(allNodes, spineIds, filterEra);
  const marriageBars = computeMarriageBars(allNodes, spineIds, filterEra);
  const spouseConnectors = computeSpouseConnectors(allNodes, spineIds, filterEra);

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

  return {
    nodes: allNodes, links, marriageBars, spouseConnectors,
    associationLinks, spineIds, bounds,
  };
}
