/**
 * TreeCanvas — SVG container rendering all tree elements.
 *
 * Render order (back to front):
 *   background defs → bg rect → links → marriage bars → spouse connectors → nodes.
 */

import React, { memo, useMemo } from 'react';
import {
  Defs, RadialGradient, Stop, Pattern,
  Rect, Line, G, Circle, Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../theme';
import { TreeLink } from './TreeLink';
import { MarriageBarSvg } from './MarriageBarSvg';
import { SpouseConnectorSvg } from './SpouseConnectorSvg';
import { TreeNode } from './TreeNode';
import { AssociationLinkSvg } from './AssociationLinkSvg';
import { TIER_2_ZOOM } from '../../utils/genealogyOrganic';
import type { LayoutNode, TreeLink as TreeLinkType, MarriageBar, SpouseConnector, TreePerson, AssociationLink } from '../../utils/treeBuilder';

interface Props {
  nodes: LayoutNode[];
  links: TreeLinkType[];
  marriageBars: MarriageBar[];
  spouseConnectors: SpouseConnector[];
  /** Dotted connectors from anchors to associated_with satellites (#1288). */
  associationLinks?: AssociationLink[];
  filterEra: string | null;
  spineIds: Set<string>;
  selectedPersonId: string | null;
  onNodePress: (person: TreePerson) => void;
  offsetX?: number;
  offsetY?: number;
  /** Full SVG width — needed for background sizing. */
  canvasWidth?: number;
  /** Full SVG height — needed for background sizing. */
  canvasHeight?: number;
  /** Current committed zoom scale (#1291). Controls per-tier visibility
   *  and associate-cluster collapse-to-badge below {@link TIER_2_ZOOM}. */
  zoom?: number;
}

export const TreeCanvas = memo(function TreeCanvas({
  nodes, links, marriageBars, spouseConnectors,
  associationLinks = [],
  filterEra, spineIds, selectedPersonId, onNodePress,
  offsetX = 0, offsetY = 0,
  canvasWidth = 4000, canvasHeight = 4000,
  zoom = 1,
}: Props) {
  const { base } = useTheme();

  // Below TIER_2_ZOOM, collapse each associate cluster into a single "+N"
  // badge at the anchor and hide the individual associate nodes + links.
  const clustersCollapsed = zoom < TIER_2_ZOOM;
  const associateIds = useMemo(
    () => new Set(associationLinks.map((al) => al.memberId)),
    [associationLinks],
  );
  const anchorBadges = useMemo(() => {
    if (!clustersCollapsed) return [];
    const byAnchor = new Map<string, { x: number; y: number; count: number }>();
    for (const al of associationLinks) {
      const existing = byAnchor.get(al.anchorId);
      if (existing) {
        existing.count += 1;
      } else {
        byAnchor.set(al.anchorId, { x: al.source.x, y: al.source.y, count: 1 });
      }
    }
    return Array.from(byAnchor, ([anchorId, v]) => ({ anchorId, ...v }));
  }, [clustersCollapsed, associationLinks]);

  return (
    <>
      {/* ── Background definitions ─────────────────── */}
      <Defs>
        {/* Radial vignette — warm center fading to dark edges */}
        <RadialGradient id="tree-bg-vignette" cx="50%" cy="40%" r="60%">
          <Stop offset="0%" stopColor={base.bgSurface} stopOpacity={1} />
          <Stop offset="100%" stopColor={base.bg} stopOpacity={1} />
        </RadialGradient>

        {/* Subtle grid pattern */}
        <Pattern id="tree-grid" width={80} height={80} patternUnits="userSpaceOnUse">
          <Line x1={80} y1={0} x2={80} y2={80}
            stroke={base.border} strokeWidth={0.3} opacity={0.3} />
          <Line x1={0} y1={80} x2={80} y2={80}
            stroke={base.border} strokeWidth={0.3} opacity={0.3} />
        </Pattern>

        {/* Warm radial glow used to fill messianic-line nodes (Card #1281).
            gradientUnits defaults to objectBoundingBox so the same def
            scales to every messianic circle. */}
        <RadialGradient
          id="messianic-node-fill"
          cx="30%"
          cy="30%"
          r="70%"
        >
          <Stop offset="0%" stopColor={base.gold} stopOpacity={0.25} />
          <Stop offset="100%" stopColor={base.gold} stopOpacity={0.08} />
        </RadialGradient>
      </Defs>

      {/* ── Background layers ──────────────────────── */}
      <Rect x={0} y={0} width={canvasWidth} height={canvasHeight}
        fill="url(#tree-bg-vignette)" />
      <Rect x={0} y={0} width={canvasWidth} height={canvasHeight}
        fill="url(#tree-grid)" />

      {/* ── Tree content ───────────────────────────── */}
      <G transform={`translate(${offsetX}, ${offsetY})`}>
        {/* 1. Links (back) */}
        {links.map((link, i) => (
          <TreeLink
            key={`l-${i}`}
            source={link.source}
            target={link.target}
            isSpine={link.isSpine}
            isMessianic={link.isMessianic}
            dimmed={link.dimmed}
          />
        ))}

        {/* 1b. Association links — dashed bezier to associate satellites
               (#1288, #1290). Hidden when clusters collapse to a badge. */}
        {!clustersCollapsed && associationLinks.map((al) => {
          const dimmed = filterEra !== null && !spineIds.has(al.anchorId);
          return (
            <AssociationLinkSvg
              key={`al-${al.anchorId}-${al.memberId}`}
              source={al.source}
              target={al.target}
              type={al.type}
              dimmed={dimmed}
            />
          );
        })}

        {/* 1c. Collapsed-cluster badge — at low zoom (#1291), each anchor
               with associates shows a "+N" chip instead of individual nodes. */}
        {clustersCollapsed && anchorBadges.map((b) => (
          <G key={`ab-${b.anchorId}`}>
            <Circle cx={b.x + 30} cy={b.y + 30} r={14}
              fill={base.bgSurface} stroke={base.gold} strokeWidth={1} opacity={0.85} />
            <SvgText x={b.x + 30} y={b.y + 33}
              fill={base.gold} fontSize={11} textAnchor="middle" fontWeight="600">
              +{b.count}
            </SvgText>
          </G>
        ))}

        {/* 2. Marriage bars */}
        {marriageBars.map((bar) => (
          <MarriageBarSvg key={`mb-${bar.spouseId}`} bar={bar} />
        ))}

        {/* 3. Spouse connectors */}
        {spouseConnectors.map((conn, i) => (
          <SpouseConnectorSvg key={`sc-${i}`} connector={conn} />
        ))}

        {/* 4. Nodes (front) */}
        {nodes.map((node) => {
          // Skip individual associate nodes when clusters are collapsed
          if (clustersCollapsed && associateIds.has(node.data.id)) return null;
          const dimmed = filterEra !== null
            && node.data.era !== filterEra
            && !spineIds.has(node.data.id);
          return (
            <TreeNode
              key={node.data.id}
              node={node}
              dimmed={dimmed}
              selected={node.data.id === selectedPersonId}
              filterEra={filterEra}
              zoom={zoom}
              onPress={onNodePress}
            />
          );
        })}
      </G>
    </>
  );
});
