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
import type { Person } from '../types';
import { isMessianic as checkMessianic } from './messianicLine';

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
  spineIds: Set<string>;
  bounds: TreeBounds;
}

export function computeFullLayout(
  people: Person[],
  filterEra: string | null
): TreeLayoutResult {
  const spineIds = computeSpineIds(people);
  const root = buildHierarchy(people, spineIds);

  if (!root) {
    return {
      nodes: [], links: [], marriageBars: [], spouseConnectors: [], spineIds,
      bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100 },
    };
  }

  const treeNodes = layoutTree(root);
  const allTreeNodes = positionSpouses(treeNodes, people, spineIds);

  // Find the bounding box of the main tree
  const treeNodeIds = new Set(allTreeNodes.map((n) => n.data.id));
  let maxTreeY = 0;
  for (const n of allTreeNodes) {
    if (n.y > maxTreeY) maxTreeY = n.y;
  }

  // Position disconnected people below the main tree in era-grouped rows
  const disconnected = findDisconnectedPeople(people, treeNodeIds);

  // Group by era, maintain a consistent era order
  const ERA_ORDER = [
    'primeval', 'patriarch', 'exodus', 'judges',
    'kingdom', 'prophets', 'exile',
    'intertestamental', 'nt',
  ];
  const byEra = new Map<string, Person[]>();
  for (const p of disconnected) {
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
        if (partner && !treeNodeIds.has(p.id)) {
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

  return { nodes: allNodes, links, marriageBars, spouseConnectors, spineIds, bounds };
}
