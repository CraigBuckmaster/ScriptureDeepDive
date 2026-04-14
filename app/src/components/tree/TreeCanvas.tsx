/**
 * TreeCanvas — SVG container rendering all tree elements.
 *
 * *** CRASH BISECT BUILD ***
 * All associate-related rendering (paths, trails, labels, badges,
 * associate nodes) is temporarily hidden to test whether the iOS
 * paint crash at z=0.93 is caused by the associate content. If the
 * tree loads and zooms freely without crashing, the associate
 * rendering is the culprit and we'll add it back as simpler
 * per-anchor straight-line paths. If it still crashes, the cause is
 * elsewhere (e.g., TreeLink messianic glow paths at high zoom).
 */

import React, { memo, useMemo } from 'react';
import {
  Defs, RadialGradient, Stop, Pattern,
  Rect, Line, G,
} from 'react-native-svg';
import { useTheme } from '../../theme';
import { TreeLink } from './TreeLink';
import { MarriageBarSvg } from './MarriageBarSvg';
import { SpouseConnectorSvg } from './SpouseConnectorSvg';
import { TreeNode } from './TreeNode';
import { TIER_3_ZOOM, getVisibleTier } from '../../utils/genealogyOrganic';
import { logger } from '../../utils/logger';
import type { LayoutNode, TreeLink as TreeLinkType, MarriageBar, SpouseConnector, TreePerson, AssociationLink, AssociateBloomLabel, AssociateTrail } from '../../utils/treeBuilder';

// *** BISECT FLAGS — finer-grained than the previous all-or-nothing flag.
// PR #1313 confirmed associate rendering is the crash trigger. This build
// adds the associate TreeNodes back (89 Circle+text instances) but keeps
// the consolidated dashed-bezier path, trails, labels, and badges hidden.
// If this build still loads and zooms freely, the crash is in the paths/
// labels/badges and not the nodes themselves. If it crashes, the 89 node
// transitions are the cause.
const BISECT = {
  hideAssociationPath: true,
  hideTrails: true,
  hideLabels: true,
  hideBadges: true,
  hideAssociateNodes: false,    // ← re-enabled this round
} as const;

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
    + `canvas=${canvasWidth}x${canvasHeight} `
    + `BISECT=path:${BISECT.hideAssociationPath ? 'hide' : 'show'},`
    + `trails:${BISECT.hideTrails ? 'hide' : 'show'},`
    + `labels:${BISECT.hideLabels ? 'hide' : 'show'},`
    + `badges:${BISECT.hideBadges ? 'hide' : 'show'},`
    + `nodes:${BISECT.hideAssociateNodes ? 'hide' : 'show'}`,
  );
  React.useEffect(() => {
    logger.info('Canvas', `render COMMITTED z=${zoom.toFixed(2)}`);
  });

  // Associate id set so the nodes.map can skip them when bisect flag is on.
  const associateIdSet = useMemo(
    () => new Set(associationLinks.map((al) => al.memberId)),
    [associationLinks],
  );

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

        {/* 1b–1d. Association paths / trails / badges — hidden by the
               BISECT flag. See top of file. */}

        {/* 2. Marriage bars */}
        {marriageBars.map((bar) => (
          <MarriageBarSvg key={`mb-${bar.spouseId}`} bar={bar} />
        ))}

        {/* 3. Spouse connectors */}
        {spouseConnectors.map((conn, i) => (
          <SpouseConnectorSvg key={`sc-${i}`} connector={conn} />
        ))}

        {/* 4. Nodes (front). Associate nodes filtered out by the BISECT
               flag. Everyone else always renders; TreeNode handles
               tier visibility via opacity so there's no mount / unmount
               churn at tier transitions. */}
        {nodes.map((node) => {
          if (BISECT.hideAssociateNodes && associateIdSet.has(node.data.id)) {
            return null;
          }
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

        {/* 5. Bloom-apex labels — hidden by the BISECT flag. */}
      </G>
    </>
  );
});
