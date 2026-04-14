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
import { TIER_2_ZOOM, TIER_3_ZOOM, getVisibleTier, getPersonTier } from '../../utils/genealogyOrganic';
import { isMessianic } from '../../utils/messianicLine';
import { logger } from '../../utils/logger';
import type { LayoutNode, TreeLink as TreeLinkType, MarriageBar, SpouseConnector, TreePerson, AssociationLink, AssociateBloomLabel, AssociateTrail } from '../../utils/treeBuilder';

// *** BISECT FLAGS — paths/labels/badges still hidden so this PR isolates
// the staggered-mount fix to associate TreeNodes only. Once that proves
// stable, follow-up PRs re-enable the rest with similar staggering if
// needed.
const BISECT = {
  hideAssociationPath: true,
  hideTrails: true,
  hideLabels: true,
  hideBadges: true,
  hideAssociateNodes: false,
} as const;

/** How many hidden-tier TreeNodes to mount per animation frame. Smaller =
 *  smoother fade-in but slower full reveal; larger = faster reveal but
 *  bigger per-frame native-view allocation cost. 5/frame ≈ ~18 frames
 *  ≈ 0.3 s for 89 associates, ~16 frames for 80 tier-2 bio-holders. */
const REVEAL_BATCH_PER_FRAME = 5;

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

  // Universal staggered-reveal index for every tier-2 and tier-3 node
  // (including associates). Tier 1 is always visible and never counted.
  // Sort order: tier 2 first, then tier 3, then stable id order within
  // each tier — so progressive reveal fades bio-holders in before minor
  // figures. Tier transitions at the zoom threshold become a gradual
  // mount over ~16 frames instead of a single commit that adds ~240
  // opacity-property changes (which crashes iOS's compositor).
  const { revealIndex, tier2Count, totalExtraCount } = useMemo(() => {
    type Item = { id: string; tier: 1 | 2 | 3 };
    const items: Item[] = nodes.map((n) => ({
      id: n.data.id,
      tier: getPersonTier(n.data, isMessianic(n.data.id)),
    }));
    const extras = items
      .filter((it) => it.tier > 1)
      .sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id));
    const index = new Map<string, number>();
    extras.forEach((it, i) => index.set(it.id, i));
    const t2 = extras.filter((it) => it.tier === 2).length;
    return {
      revealIndex: index,
      tier2Count: t2,
      totalExtraCount: extras.length,
    };
  }, [nodes]);

  // Target reveal count based on current zoom's tier visibility.
  const targetRevealed = useMemo(() => {
    if (zoom < TIER_2_ZOOM) return 0;
    if (zoom < TIER_3_ZOOM) return tier2Count;
    return totalExtraCount;
  }, [zoom, tier2Count, totalExtraCount]);

  // Initial state matches the target for the FIRST render's zoom — so
  // initial mount instantly shows everything the user should see. iOS
  // handles a single all-at-once mount fine; it's transitions that
  // crash. Only zoom CHANGES (after first render) animate via the
  // staggered reveal below.
  const [revealedExtra, setRevealedExtra] = React.useState(() => targetRevealed);
  const lastTargetRef = React.useRef(targetRevealed);
  React.useEffect(() => {
    // Skip the no-op case where target hasn't actually changed.
    if (lastTargetRef.current === targetRevealed) return;
    lastTargetRef.current = targetRevealed;
    let current = revealedExtra;
    if (current === targetRevealed) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const direction = targetRevealed > current ? 1 : -1;
      current += direction * REVEAL_BATCH_PER_FRAME;
      if ((direction > 0 && current >= targetRevealed)
          || (direction < 0 && current <= targetRevealed)) {
        current = targetRevealed;
      }
      setRevealedExtra(current);
      if (current !== targetRevealed) requestAnimationFrame(tick);
    };
    const handle = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRevealed]);

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
          // Universal staggered reveal: every non-tier-1 node has an index
          // in revealIndex. A node only mounts once revealedExtra reaches
          // its index. Tier-1 nodes (no revealIndex entry) always render.
          // This turns a tier-2 or tier-3 zoom transition from a single
          // commit that flips opacity on ~240 layers into a sequence of
          // per-frame mounts of REVEAL_BATCH_PER_FRAME nodes each — which
          // iOS's compositor handles without crashing.
          const idx = revealIndex.get(node.data.id);
          if (idx !== undefined && idx >= revealedExtra) return null;
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
