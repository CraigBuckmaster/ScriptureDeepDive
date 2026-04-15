/**
 * TreeCanvas — SVG container rendering all pre-filtered tree elements.
 *
 * The parent screen runs viewport culling + semantic-zoom filtering
 * before this component ever sees data, so every node / link / bar /
 * label this renders is something we actually want on screen right now.
 * There is no staggered reveal, no BISECT flag, no reveal batching — the
 * whole point of the viewBox + culling architecture is that iOS never
 * sees the giant-canvas render that used to force those workarounds.
 */

import React, { memo, useMemo } from 'react';
import {
  Defs, RadialGradient, Stop, G, Circle, Text as SvgText, Path,
} from 'react-native-svg';
import { useTheme } from '../../theme';
import { TIER_THRESHOLDS } from '../../utils/treeTiers';
import type {
  TreeLink as TreeLinkType, MarriageBar, SpouseConnector, TreePerson,
  AssociationLink, AssociateBloomLabel, AssociateTrail,
} from '../../utils/treeBuilder';
import type { VisibleLayoutNode } from '../../hooks/useVisibleNodes';
import { TreeLink } from './TreeLink';
import { MarriageBarSvg } from './MarriageBarSvg';
import { SpouseConnectorSvg } from './SpouseConnectorSvg';
import { TreeNode } from './TreeNode';

interface Props {
  nodes: VisibleLayoutNode[];
  links: TreeLinkType[];
  marriageBars: MarriageBar[];
  spouseConnectors: SpouseConnector[];
  associationLinks?: AssociationLink[];
  associateBloomLabels?: AssociateBloomLabel[];
  associateTrails?: AssociateTrail[];
  filterEra: string | null;
  spineIds: Set<string>;
  selectedPersonId: string | null;
  onNodePress: (person: TreePerson) => void;
  /** Current committed zoom scale. Controls bloom-cluster collapse. */
  zoom?: number;
}

export const TreeCanvas = memo(function TreeCanvas({
  nodes, links, marriageBars, spouseConnectors,
  associationLinks = [],
  associateBloomLabels = [],
  associateTrails = [],
  filterEra, spineIds, selectedPersonId, onNodePress,
  zoom = 1,
}: Props) {
  const { base } = useTheme();

  // Associate clusters collapse to "+N" badges below the tier-3 zoom
  // threshold. Above it the full association paths, trails, and labels
  // render. Using the structural tier threshold keeps the two systems
  // (visibility and visual density) in lockstep.
  const clustersCollapsed = zoom < TIER_THRESHOLDS[3];
  const labelsVisible = !clustersCollapsed;

  // Pre-compute an id→era lookup so link / marriage-bar / spouse-connector
  // dimming can be derived at render time without scanning the full node
  // list for every entry.
  const nodeMeta = useMemo(() => {
    const map = new Map<string, { era: string | null; onSpine: boolean }>();
    for (const n of nodes) {
      map.set(n.data.id, {
        era: n.data.era ?? null,
        onSpine: spineIds.has(n.data.id),
      });
    }
    return map;
  }, [nodes, spineIds]);

  // All associate connectors consolidated into ONE straight-line Path.
  // Keeps the native layer count down regardless of how many blooms are
  // on screen at once.
  const associationPathD = useMemo(
    () => associationLinks
      .map((al) => `M ${al.source.x} ${al.source.y} L ${al.target.x} ${al.target.y}`)
      .join(' '),
    [associationLinks],
  );

  const trailsPathD = useMemo(
    () => associateTrails
      .map((t) => `M ${t.source.x} ${t.source.y} L ${t.target.x} ${t.target.y}`)
      .join(' '),
    [associateTrails],
  );

  // Collapsed-cluster "+N" badges, one per anchor that has visible members.
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

  const isDimmed = (id: string, era: string | null | undefined): boolean => {
    if (filterEra === null) return false;
    if (spineIds.has(id)) return false;
    return era !== filterEra;
  };

  return (
    <>
      <Defs>
        {/* Warm radial glow used to fill messianic-line nodes. */}
        <RadialGradient id="messianic-node-fill" cx="30%" cy="30%" r="70%">
          <Stop offset="0%" stopColor={base.gold} stopOpacity={0.25} />
          <Stop offset="100%" stopColor={base.gold} stopOpacity={0.08} />
        </RadialGradient>
      </Defs>

      <G>
        {/* 1. Genealogical links (back). Dimming is computed from the
               link's source/target era vs. the current filter. A link
               dims only when BOTH endpoints would dim. */}
        {links.map((link, i) => {
          const dimmed = filterEra !== null
            && !spineIds.has(link.sourceId)
            && !spineIds.has(link.targetId)
            && link.sourceEra !== filterEra
            && link.targetEra !== filterEra;
          return (
            <TreeLink
              key={`l-${link.sourceId}-${link.targetId}-${i}`}
              source={link.source}
              target={link.target}
              isSpine={link.isSpine}
              isMessianic={link.isMessianic}
              dimmed={dimmed}
            />
          );
        })}

        {/* 1b. Association connectors consolidated into a single Path. */}
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

        {/* 1c. Associate-bloom trails consolidated into a single Path. */}
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

        {/* 1d. Collapsed-cluster "+N" badges. */}
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

        {/* 2. Marriage bars. Dimmed only when neither partner is spine
               AND the bar's era doesn't match the filter. */}
        {marriageBars.map((bar) => {
          const partner = nodeMeta.get(bar.partnerId);
          const spouse = nodeMeta.get(bar.spouseId);
          const dimmed = filterEra !== null
            && !(partner?.onSpine || spouse?.onSpine)
            && (partner?.era !== filterEra)
            && (spouse?.era !== filterEra);
          return (
            <MarriageBarSvg
              key={`mb-${bar.spouseId}`}
              bar={bar}
              dimmed={dimmed}
            />
          );
        })}

        {/* 3. Spouse connectors. */}
        {spouseConnectors.map((conn, i) => {
          const partner = nodeMeta.get(conn.partnerId);
          const dimmed = isDimmed(conn.partnerId, partner?.era);
          return (
            <SpouseConnectorSvg
              key={`sc-${i}`}
              connector={conn}
              dimmed={dimmed}
            />
          );
        })}

        {/* 4. Nodes (front). */}
        {nodes.map((node) => {
          const dimmed = isDimmed(node.data.id, node.data.era);
          return (
            <TreeNode
              key={node.data.id}
              node={node}
              dimmed={dimmed}
              selected={node.data.id === selectedPersonId}
              isEntering={node.isEntering}
              onPress={onNodePress}
            />
          );
        })}

        {/* 5. Bloom-apex labels ("disciples", "contemporaries"…). */}
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
