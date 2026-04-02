/**
 * LexiconDefinition — Renders a hierarchical definition tree from lexicon data.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import type { DefinitionNode } from '../types/lexicon';

interface Props {
  shortDef: string;
  fullDef: DefinitionNode[];
}

function DefNode({ node, depth = 0 }: { node: DefinitionNode; depth?: number }) {
  const { base } = useTheme();
  const prefix = node.num ? `${node.num}. ` : node.letter ? `${node.letter}. ` : '';
  const ml = depth * 20;

  return (
    <View style={{ marginLeft: ml }}>
      <Text style={[styles.defText, { color: base.textDim }]}>
        {prefix ? (
          <Text style={[styles.defPrefix, { color: base.gold }]}>{prefix}</Text>
        ) : null}
        {node.text}
      </Text>
      {node.subs?.map((sub, i) => (
        <DefNode key={i} node={sub} depth={depth + 1} />
      ))}
    </View>
  );
}

export function LexiconDefinition({ shortDef, fullDef }: Props) {
  const { base } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.shortDef, { color: base.text }]}>{shortDef}</Text>
      {fullDef.length > 0 && (
        <View style={styles.fullDef}>
          {fullDef.map((node, i) => (
            <DefNode key={i} node={node} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  shortDef: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  fullDef: {
    gap: 4,
  },
  defText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 2,
  },
  defPrefix: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
  },
});
