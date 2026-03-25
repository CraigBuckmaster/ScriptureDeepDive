/**
 * TreeCanvas — SVG container rendering all tree elements.
 *
 * Render order (back to front): links → marriage bars → spouse connectors → nodes.
 */

import React, { memo } from 'react';
import { G } from 'react-native-svg';
import { TreeLink } from './TreeLink';
import { MarriageBarSvg } from './MarriageBarSvg';
import { SpouseConnectorSvg } from './SpouseConnectorSvg';
import { TreeNode } from './TreeNode';
import type { LayoutNode, TreeLink as TreeLinkType, MarriageBar, SpouseConnector, TreePerson } from '../../utils/treeBuilder';

interface Props {
  nodes: LayoutNode[];
  links: TreeLinkType[];
  marriageBars: MarriageBar[];
  spouseConnectors: SpouseConnector[];
  filterEra: string | null;
  spineIds: Set<string>;
  onNodePress: (person: TreePerson) => void;
}

export const TreeCanvas = memo(function TreeCanvas({
  nodes, links, marriageBars, spouseConnectors,
  filterEra, spineIds, onNodePress,
}: Props) {
  return (
    <G>
      {/* 1. Links (back) */}
      {links.map((link, i) => (
        <TreeLink
          key={`l-${i}`}
          source={link.source}
          target={link.target}
          isSpine={link.isSpine}
          dimmed={link.dimmed}
        />
      ))}

      {/* 2. Marriage bars */}
      {marriageBars.map((bar, i) => (
        <MarriageBarSvg key={`mb-${bar.spouseId}`} bar={bar} />
      ))}

      {/* 3. Spouse connectors */}
      {spouseConnectors.map((conn, i) => (
        <SpouseConnectorSvg key={`sc-${i}`} connector={conn} />
      ))}

      {/* 4. Nodes (front) — skip virtual root */}
      {nodes.map((node) => {
        if (node.data.id === '__root__') return null;
        const dimmed = filterEra !== null
          && node.data.era !== filterEra
          && !spineIds.has(node.data.id);
        return (
          <TreeNode
            key={node.data.id}
            node={node}
            dimmed={dimmed}
            filterEra={filterEra}
            onPress={onNodePress}
          />
        );
      })}
    </G>
  );
});
