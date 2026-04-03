/**
 * TopicCrossLinks — Banner showing related Concepts, Threads, and Prophecy Chains.
 *
 * Only renders if at least one cross-link exists.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props {
  concepts: { id: string; title: string }[];
  threads: { id: string; theme: string }[];
  prophecyChains: { id: string; title: string }[];
  onConceptPress: (id: string) => void;
  onThreadPress: (id: string) => void;
  onProphecyPress: (id: string) => void;
}

export function TopicCrossLinks({
  concepts, threads, prophecyChains,
  onConceptPress, onThreadPress, onProphecyPress,
}: Props) {
  const { base } = useTheme();
  const hasLinks = concepts.length > 0 || threads.length > 0 || prophecyChains.length > 0;
  if (!hasLinks) return null;

  return (
    <View style={[styles.container, { borderColor: base.gold + '20', backgroundColor: base.gold + '06' }]}>
      <Text style={[styles.header, { color: base.textMuted }]}>Related in Companion Study</Text>

      {concepts.map((c) => (
        <TouchableOpacity key={c.id} style={styles.row} onPress={() => onConceptPress(c.id)} activeOpacity={0.7}>
          <Text style={[styles.label, { color: base.gold }]}>{'✦ Concept: '}{c.title}</Text>
          <ChevronRight size={14} color={base.gold} />
        </TouchableOpacity>
      ))}

      {threads.map((t) => (
        <TouchableOpacity key={t.id} style={styles.row} onPress={() => onThreadPress(t.id)} activeOpacity={0.7}>
          <Text style={[styles.label, { color: base.gold }]}>{'✦ Thread: '}{t.theme}</Text>
          <ChevronRight size={14} color={base.gold} />
        </TouchableOpacity>
      ))}

      {prophecyChains.map((p) => (
        <TouchableOpacity key={p.id} style={styles.row} onPress={() => onProphecyPress(p.id)} activeOpacity={0.7}>
          <Text style={[styles.label, { color: base.gold }]}>{'✦ Prophecy: '}{p.title}</Text>
          <ChevronRight size={14} color={base.gold} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginVertical: spacing.sm,
  },
  header: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    flex: 1,
  },
});
