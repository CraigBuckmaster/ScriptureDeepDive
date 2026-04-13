/**
 * TreeCanvas — SVG container rendering all tree elements.
 *
 * Constant render structure: every zoom level mounts the same set of
 * native views. Visibility transitions are driven by opacity changes
 * (and a single combined path `d` attribute for association links /
 * trails). iOS's compositor crashes on batch mid-session mounts of
 * many native subviews on a tall (~10 000 px) Svg canvas; keeping
 * the structure constant eliminates that failure mode.
 *
 * Render order (back to front):
 *   background defs → bg rect → links → marriage bars →
 *   spouse connectors → association links (consolidated) →
 *   associate trails (consolidated) → collapse badges → nodes →
 *   bloom apex labels.
 */

import React, { memo, useMemo } from 'react';
import {
  Defs, RadialGradient, Stop, Pattern,
  Rect, Line, G, Circle, Text as SvgText, Path,
} from 'react-native-svg';
import { useTheme } from '../../theme';
import { TreeLink } from './TreeLink';
import { MarriageBarSvg } from './MarriageBarSvg';
import { SpouseConnectorSvg } from './SpouseConnectorSvg';
import { TreeNode } from './TreeNode';
import { TIER_3_ZOOM, getVisibleTier } from '../../utils/genealogyOrganic';
import { bezierPath } from '../../utils/genealogyOrganic';
import { logger } from '../../utils/logger';
import type { LayoutNode, TreeLink as TreeLinkType, MarriageBar, SpouseConnector, TreePerson, AssociationLink, AssociateBloomLabel, AssociateTrail } from '../../utils/treeBuilder';

interface Props {
  nodes: LayoutNode[];
  links: TreeLinkType[];
  marriageBars: MarriageBar[];
  spouseConnectors: SpouseConnector[];
  /** Dotted connectors from anchors to associated_with satellites (#1288). */
  associationLinks?: AssociationLink[];
  /** Type-sector labels ("disciples", "contemporaries"…) emitted by
   *  the associate bloom layout. Shown at mid-zoom+. */
  associateBloomLabels?: AssociateBloomLabel[];
  /** Thick trail connectors from anchors to offset associate blooms. */
  associateTrails?: AssociateTrail[];
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
   *  and associate-cluster collapse-to-badge below {@link TIER_3_ZOOM}. */
  zoom?: number;
}

export const TreeCanvas = memo(function TreeCanvas({
  nodes, links, marriageBars, spouseConnectors,
  associationLinks = [],
  associateBloomLabels = [],
  associateTrails = [],
  filterEra, spineIds, selectedPersonId, onNodePress,
  offsetX = 0, offsetY = 0,
  canvasWidth = 4000, canvasHeight = 4000,
  zoom = 1,
}: Props) {
  const { base } = useTheme();

  const clustersCollapsed = zoom < TIER_3_ZOOM;
  const labelsVisible = zoom >= TIER_3_ZOOM;

  // Render-entry diagnostic.
  const visibleTier = getVisibleTier(zoom);
  logger.info(
    'Canvas',
    `render z=${zoom.toFixed(2)} visibleTier=${visibleTier} `
    + `collapsed=${clustersCollapsed} `
    + `nodes=${nodes.length} links=${links.length} al=${associationLinks.length} `
    + `labels=${associateBloomLabels.length} trails=${associateTrails.length} `
    + `canvas=${canvasWidth}x${canvasHeight}`,
  );
  React.useEffect(() => {
    logger.info('Canvas', `render COMMITTED z=${zoom.toFixed(2)}`);
  });

  // Consolidate all dashed-bezier association connectors into ONE Path
  // string so a cluster-uncollapse transition changes one `d` attribute
  // instead of mounting 89 new CAShapeLayers. Styling is uniform across
  // connectors so single-path rendering is safe.
  const associationPathD = useMemo(
    () => associationLinks.map((al) => bezierPath(al.source, al.target)).join(' '),
    [associationLinks],
  );

  // Same consolidation for trail lines. Straight segments concatenated
  // as `M x1 y1 L x2 y2` with a space between each pair.
  const trailsPathD = useMemo(
    () => associateTrails
      .map((t) => `M ${t.source.x} ${t.source.y} L ${t.target.x} ${t.target.y}`)
      .join(' '),
    [associateTrails],
  );

  // Badge positions are derived from association links by anchor — constant
  // for a given tree layout, so compute them once.
  const anchorBadges = useMemo(() => {
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
  }, [associationLinks]);

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

        {/* Warm radial glow used to fill messianic-line nodes (Card #1281). */}
        <RadialGradient id="messianic-node-fill" cx="30%" cy="30%" r="70%">
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
        {/* 1. Genealogical links (back) */}
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

        {/* 1b. Association links — ALL dashed bezier connectors consolidated
               into a single Path. Opacity toggles with cluster collapse state;
               no native views mount or unmount across zoom transitions. */}
        {associationPathD.length > 0 && (
          <Path
            d={associationPathD}
            stroke={base.border}
            strokeWidth={0.9}
            strokeDasharray="4,4"
            fill="none"
            opacity={clustersCollapsed ? 0 : 0.55}
            strokeLinecap="round"
          />
        )}

        {/* 1c. Associate-bloom trails — all consolidated into one Path. */}
        {trailsPathD.length > 0 && (
          <Path
            d={trailsPathD}
            stroke={base.gold}
            strokeWidth={1.5}
            fill="none"
            opacity={clustersCollapsed ? 0 : 0.35}
            strokeLinecap="round"
          />
        )}

        {/* 1d. Collapsed-cluster "+N" badges. Always rendered; opacity gated
               so a cluster-expand transition just flips a number, never
               mounts or unmounts a view. */}
        {anchorBadges.map((b) => (
          <G key={`ab-${b.anchorId}`} opacity={clustersCollapsed ? 0.85 : 0}>
            <Circle cx={b.x + 30} cy={b.y + 30} r={14}
              fill={base.bgSurface} stroke={base.gold} strokeWidth={1} />
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

        {/* 4. Nodes (front). Every node — including associates — is always
               rendered. TreeNode itself handles visibility via opacity so
               there's no mount / unmount churn at tier transitions. */}
        {nodes.map((node) => {
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
              clustersCollapsed={clustersCollapsed}
              onPress={onNodePress}
            />
          );
        })}

        {/* 5. Bloom-apex labels ("disciples", "contemporaries"…). Always
               rendered; opacity gated. */}
        {associateBloomLabels.map((lbl) => (
          <SvgText
            key={`abl-${lbl.anchorId}-${lbl.type}`}
            x={lbl.x}
            y={lbl.y}
            fill={base.gold}
            fontSize={11}
            fontFamily="Cinzel_600SemiBold"
            textAnchor="middle"
            opacity={labelsVisible ? 0.65 : 0}
          >
            {lbl.text}
          </SvgText>
        ))}
      </G>
    </>
  );
});
