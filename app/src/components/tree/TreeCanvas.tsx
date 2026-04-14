/**
 * TreeCanvas — SVG container rendering all tree elements.
 *
 * Associate rendering is fully enabled as of #1329 (staggered TreeNode
 * reveal) + this PR. The BISECT constants at the top of the file stay
 * in place as emergency hide-switches: flip one to `true` to disable
 * that specific component if it regresses on a future iOS version.
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
import { TIER_2_ZOOM, TIER_3_ZOOM, getVisibleTier, getPersonTier, bezierPath } from '../../utils/genealogyOrganic';
import { isMessianic } from '../../utils/messianicLine';
import { logger } from '../../utils/logger';
import type { LayoutNode, TreeLink as TreeLinkType, MarriageBar, SpouseConnector, TreePerson, AssociationLink, AssociateBloomLabel, AssociateTrail } from '../../utils/treeBuilder';

// BISECT flags now that #1329 proved the staggered TreeNode reveal works
// across the full zoom range. All four remaining flags flip to `false`
// so the full associate rendering (paths, trails, labels, badges) comes
// back online. Kept in place as a pair of emergency switches in case a
// specific component regresses — flipping one back to `true` hides just
// that component without touching the others.
const BISECT = {
  hideAssociationPath: false,
  hideTrails: false,
  hideLabels: false,
  hideBadges: false,
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

  // All dashed-bezier associate connectors consolidated into ONE Path
  // string. 89 individual `<AssociationLinkSvg>` components → 1 native
  // CAShapeLayer. Tier-3 zoom transitions flip one opacity value instead
  // of mounting 89 layers (see #1308, #1329).
  const associationPathD = useMemo(
    () => associationLinks.map((al) => bezierPath(al.source, al.target)).join(' '),
    [associationLinks],
  );

  // Same consolidation for trail lines.
  const trailsPathD = useMemo(
    () => associateTrails
      .map((t) => `M ${t.source.x} ${t.source.y} L ${t.target.x} ${t.target.y}`)
      .join(' '),
    [associateTrails],
  );

  // Badge positions derived from association links (stable for a given
  // tree layout). Always rendered, opacity-gated by clustersCollapsed.
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

        {/* 1b. Association links — ALL dashed bezier connectors consolidated
               into a single Path. Opacity toggles with cluster collapse state;
               no native views mount or unmount across zoom transitions. */}
        {!BISECT.hideAssociationPath && associationPathD.length > 0 && (
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
        {!BISECT.hideTrails && trailsPathD.length > 0 && (
          <Path
            d={trailsPathD}
            stroke={base.gold}
            strokeWidth={1.5}
            fill="none"
            opacity={clustersCollapsed ? 0 : 0.35}
            strokeLinecap="round"
          />
        )}

        {/* 1d. Collapsed-cluster "+N" badges. Always rendered; opacity gated. */}
        {!BISECT.hideBadges && anchorBadges.map((b) => (
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

        {/* 5. Bloom-apex labels ("disciples", "contemporaries"…). Always
               rendered; opacity gated by TIER_3_ZOOM. */}
        {!BISECT.hideLabels && associateBloomLabels.map((lbl) => (
          <SvgText
            key={`abl-${lbl.anchorId}-${lbl.type}`}
            x={lbl.x}
            y={lbl.y}
            fill={base.gold}
            fontSize={11}
            fontFamily="Cinzel_600SemiBold"
            textAnchor="middle"
            opacity={zoom >= TIER_3_ZOOM ? 0.65 : 0}
          >
            {lbl.text}
          </SvgText>
        ))}
      </G>
    </>
  );
});
