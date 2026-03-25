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

import { hierarchy, tree } from 'd3-hierarchy';
import type { Person } from '../types';

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
  dimmed: boolean;
}

// ── Spine computation ───────────────────────────────────────────────

export function computeSpineIds(people: Person[]): Set<string> {
  const byId = new Map(people.map((p) => [p.id, p]));
  const spine = new Set<string>();
  let current = byId.get('jesus');
  while (current) {
    spine.add(current.id);
    current = current.father ? byId.get(current.father) ?? null : null;
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

  // Find all root nodes: people who are NOT spouses and NOT attached as children
  const roots: HierNode[] = [];
  for (const p of people) {
    if (spouseIds.has(p.id)) continue;
    if (attached.has(p.id)) continue;
    const node = byId.get(p.id);
    if (node) roots.push(node);
  }

  if (roots.length === 0) return null;
  if (roots.length === 1) return roots[0];

  // Multiple root trees — create a virtual root to hold them all.
  // Put Adam first (the main spine), then remaining roots sorted by era.
  const adamIdx = roots.findIndex((r) => r.data.id === 'adam');
  if (adamIdx > 0) {
    const [adam] = roots.splice(adamIdx, 1);
    roots.unshift(adam);
  }

  const virtualRoot: HierNode = {
    data: {
      id: '__root__',
      name: '',
      gender: null,
      era: null,
      role: '',
      type: null,
      bio: null,
      dates: null,
      father: null,
      mother: null,
      spouse_of: null,
      scripture_role: null,
      chapter_link: null,
      refs_json: null,
      nodeType: 'satellite',
    } as TreePerson,
    children: roots,
  };

  return virtualRoot;
}

// ── d3 layout ───────────────────────────────────────────────────────

export function layoutTree(root: HierNode): LayoutNode[] {
  const d3Root = hierarchy(root, (d) => d.children);

  const treeLayout = tree<HierNode>()
    .nodeSize(TREE_CONSTANTS.nodeSize);

  treeLayout(d3Root);

  // Flatten to array
  const nodes: LayoutNode[] = [];
  d3Root.each((d: any) => {
    nodes.push({
      data: d.data.data,
      x: d.x,
      y: d.y,
      parent: d.parent ? { ...d.parent, data: d.parent.data.data } as any : null,
      children: d.children?.map((c: any) => c) ?? [],
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
    const dimmed = filterEra !== null
      && !isDimmed(node.data, filterEra, spineIds)
      ? false
      : filterEra !== null && isDimmed(node.data, filterEra, spineIds) && isDimmed(parent.data, filterEra, spineIds);

    links.push({
      source: { x: parent.x, y: parent.y },
      target: { x: node.x, y: node.y },
      isSpine,
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

    const x1 = partner.x + TREE_CONSTANTS.spineRadius + 2;
    const x2 = node.x - TREE_CONSTANTS.satelliteRadius - 2;
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

export interface TreeLayoutResult {
  nodes: LayoutNode[];
  links: TreeLink[];
  marriageBars: MarriageBar[];
  spouseConnectors: SpouseConnector[];
  spineIds: Set<string>;
}

export function computeFullLayout(
  people: Person[],
  filterEra: string | null
): TreeLayoutResult {
  const spineIds = computeSpineIds(people);
  const root = buildHierarchy(people, spineIds);

  if (!root) {
    return { nodes: [], links: [], marriageBars: [], spouseConnectors: [], spineIds };
  }

  const treeNodes = layoutTree(root);
  const allNodes = positionSpouses(treeNodes, people, spineIds);
  const links = computeLinks(allNodes, spineIds, filterEra);
  const marriageBars = computeMarriageBars(allNodes, spineIds, filterEra);
  const spouseConnectors = computeSpouseConnectors(allNodes, spineIds, filterEra);

  return { nodes: allNodes, links, marriageBars, spouseConnectors, spineIds };
}
