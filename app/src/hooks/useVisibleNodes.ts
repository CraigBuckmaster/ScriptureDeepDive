/**
 * useVisibleNodes.ts — Filter tree layout data to visible elements.
 *
 * Two filters are applied in sequence to every category of tree element:
 *   1. Semantic zoom (cheap integer compare): is this node important
 *      enough to show at the current zoom level?
 *   2. Viewport culling (cheap bounding-box test): is this node on
 *      screen?
 *
 * The hook also tracks which nodes are entering the visible set for the
 * first time so TreeNode can do a subtle fade-in when a node first
 * appears (scrolled in, or revealed by crossing a tier threshold).
 *
 * Continuity rules:
 *   - Messianic spine nodes are ALWAYS included in the visible set, no
 *     matter where the camera is pointed. The golden thread is ≤60
 *     nodes and visual continuity is non-negotiable.
 *   - If any bloom associate is visible, the anchor of that bloom and
 *     all association links from it are also included. Without this,
 *     associate satellites appear as floating orphans with no parent.
 */

import { useMemo, useRef } from 'react';
import type {
  LayoutNode, TreeLink, MarriageBar, SpouseConnector,
  AssociationLink, AssociateBloomLabel, AssociateTrail,
} from '../utils/treeBuilder';
import { isTierVisible } from '../utils/treeTiers';
import {
  getViewportBounds, isPointInViewport, isLinkInViewport,
} from '../utils/viewportCulling';
import type { CameraState } from './useTreeCamera';

/** World-space margin applied to the viewport before culling. Prevents
 *  pop-in at the edges during fast pans. */
const CULL_MARGIN = 200;

export interface VisibleLayoutNode extends LayoutNode {
  /** True on the first frame this node becomes visible. */
  isEntering: boolean;
}

export interface VisibleData {
  nodes: VisibleLayoutNode[];
  links: TreeLink[];
  marriageBars: MarriageBar[];
  spouseConnectors: SpouseConnector[];
  associationLinks: AssociationLink[];
  associateBloomLabels: AssociateBloomLabel[];
  associateTrails: AssociateTrail[];
}

export function useVisibleNodes(
  allNodes: LayoutNode[],
  allLinks: TreeLink[],
  allMarriageBars: MarriageBar[],
  allSpouseConnectors: SpouseConnector[],
  allAssociationLinks: AssociationLink[],
  allAssociateBloomLabels: AssociateBloomLabel[],
  allAssociateTrails: AssociateTrail[],
  camera: CameraState,
  screenWidth: number,
  screenHeight: number,
  spineIds: Set<string>,
): VisibleData {
  // Keep the last-frame visible ID set so we can flag newly-visible nodes
  // for the entrance fade. useRef avoids re-rendering just because of
  // this bookkeeping.
  const prevVisibleIdsRef = useRef<Set<string>>(new Set());

  return useMemo(() => {
    const bounds = getViewportBounds(
      camera.x, camera.y, screenWidth, screenHeight, camera.zoom, CULL_MARGIN,
    );

    // ── Pass 1: Which nodes are visible? ────────────────────────────
    const visibleIds = new Set<string>();
    const visibleNodesByTier: LayoutNode[] = [];
    for (const node of allNodes) {
      // Spine nodes are ALWAYS visible — golden-thread continuity.
      if (spineIds.has(node.data.id)) {
        visibleIds.add(node.data.id);
        visibleNodesByTier.push(node);
        continue;
      }
      if (!isTierVisible(node.tier, camera.zoom)) continue;
      if (!isPointInViewport(node.x, node.y, bounds)) continue;
      visibleIds.add(node.data.id);
      visibleNodesByTier.push(node);
    }

    // ── Bloom-anchor rule ───────────────────────────────────────────
    // If any associate member is visible, also include the anchor and
    // all association links emanating from that anchor.
    const visibleAnchorIds = new Set<string>();
    for (const al of allAssociationLinks) {
      if (visibleIds.has(al.memberId)) {
        visibleAnchorIds.add(al.anchorId);
      }
    }
    if (visibleAnchorIds.size > 0) {
      const anchorNodesToAdd: LayoutNode[] = [];
      for (const node of allNodes) {
        if (visibleAnchorIds.has(node.data.id) && !visibleIds.has(node.data.id)) {
          visibleIds.add(node.data.id);
          anchorNodesToAdd.push(node);
        }
      }
      visibleNodesByTier.push(...anchorNodesToAdd);
    }

    // ── Entrance tracking ───────────────────────────────────────────
    const prevIds = prevVisibleIdsRef.current;
    const visibleNodes: VisibleLayoutNode[] = visibleNodesByTier.map((n) => ({
      ...n,
      isEntering: !prevIds.has(n.data.id),
    }));
    prevVisibleIdsRef.current = visibleIds;

    // ── Links (always include spine-to-spine links) ─────────────────
    const visibleLinks: TreeLink[] = allLinks.filter((link) => {
      const spineLink = spineIds.has(link.sourceId) && spineIds.has(link.targetId);
      if (spineLink) return true;
      // Either endpoint visible AND the link intersects the viewport.
      const endpointVisible = visibleIds.has(link.sourceId) || visibleIds.has(link.targetId);
      if (!endpointVisible) return false;
      return isLinkInViewport(link.source, link.target, bounds);
    });

    // ── Marriage bars ───────────────────────────────────────────────
    // Spouses sit immediately beside their partner, so if the partner
    // is visible the spouse is within CULL_MARGIN too.
    const visibleMarriageBars: MarriageBar[] = allMarriageBars.filter(
      (bar) => visibleIds.has(bar.partnerId) || visibleIds.has(bar.spouseId),
    );

    // ── Spouse connectors ───────────────────────────────────────────
    const visibleSpouseConnectors: SpouseConnector[] = allSpouseConnectors.filter(
      (conn) => visibleIds.has(conn.partnerId),
    );

    // ── Association links (already filtered by the anchor/bloom rule) ─
    const visibleAssociationLinks: AssociationLink[] = allAssociationLinks.filter(
      (al) => visibleIds.has(al.anchorId) && visibleIds.has(al.memberId),
    );

    // ── Bloom labels / trails: keep if the anchor is visible. ───────
    const visibleBloomLabels: AssociateBloomLabel[] = allAssociateBloomLabels.filter(
      (lbl) => visibleIds.has(lbl.anchorId),
    );
    const visibleAssociateTrails: AssociateTrail[] = allAssociateTrails.filter(
      (t) => visibleIds.has(t.anchorId),
    );

    return {
      nodes: visibleNodes,
      links: visibleLinks,
      marriageBars: visibleMarriageBars,
      spouseConnectors: visibleSpouseConnectors,
      associationLinks: visibleAssociationLinks,
      associateBloomLabels: visibleBloomLabels,
      associateTrails: visibleAssociateTrails,
    };
  }, [
    allNodes, allLinks, allMarriageBars, allSpouseConnectors,
    allAssociationLinks, allAssociateBloomLabels, allAssociateTrails,
    camera.x, camera.y, camera.zoom,
    screenWidth, screenHeight, spineIds,
  ]);
}
