/**
 * GenealogyTreeScreen — Zoomable family tree of 211 biblical people.
 *
 * d3-hierarchy layout + react-native-svg rendering + gesture-handler
 * pinch/pan. Era filtering, person search, bio bottom sheet.
 * Deep-link: initialPersonId param → auto-centre + open bio.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';

import { usePeople } from '../hooks/usePeople';
import { useTreeLayout } from '../hooks/useTreeLayout';
import { useTreeGestures } from '../hooks/useTreeGestures';
import { useLandscapeUnlock } from '../hooks/useLandscapeUnlock';

import { TreeCanvas } from '../components/tree/TreeCanvas';
import { EraFilterBar } from '../components/tree/EraFilterBar';
import { PersonSearchBar } from '../components/tree/PersonSearchBar';
import { PersonSidebar } from '../components/PersonSidebar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

import { base, spacing } from '../theme';
import type { Person } from '../types';
import type { TreePerson } from '../utils/treeBuilder';

export default function GenealogyTreeScreen({ route, navigation }: any) {
  useLandscapeUnlock();
  const initialPersonId = route?.params?.personId;
  const { people, isLoading } = usePeople();
  const insets = useSafeAreaInsets();
  const [filterEra, setFilterEra] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const { nodes, links, marriageBars, spouseConnectors, spineIds, bounds } =
    useTreeLayout(people, filterEra);

  const { gesture, animatedStyle, centreOnNode, centreOnNodeAbovePanel } = useTreeGestures();

  /** Filter by era and jump the tree to the first matching node. */
  const handleEraChange = useCallback(
    (era: string) => {
      setFilterEra(era);
      if (era === 'all' || nodes.length === 0) return;
      const firstMatch = nodes.find((n) => n.data.era === era);
      if (firstMatch) {
        setTimeout(() => centreOnNode(firstMatch.x, firstMatch.y), 150);
      }
    },
    [nodes, centreOnNode],
  );

  // Deep-link: centre on initial person (sidebar will open)
  useEffect(() => {
    if (initialPersonId && nodes.length > 0) {
      const node = nodes.find((n) => n.data.id === initialPersonId);
      if (node) {
        const person = people.find((p) => p.id === initialPersonId);
        if (person) setSelectedPerson(person);
        setTimeout(() => centreOnNodeAbovePanel(node.x, node.y), 200);
      }
    }
  }, [initialPersonId, nodes.length]);

  // Auto-centre on Adam when tree first loads (no deep-link)
  const hasCentred = useRef(false);
  useEffect(() => {
    if (!initialPersonId && !hasCentred.current && nodes.length > 0) {
      hasCentred.current = true;
      const adam = nodes.find((n) => n.data.id === 'adam');
      if (adam) {
        setTimeout(() => centreOnNode(adam.x, adam.y), 200);
      }
    }
  }, [nodes.length]);

  const handleNodePress = useCallback(
    (treePerson: TreePerson) => {
      const person = people.find((p) => p.id === treePerson.id);
      if (person) {
        setSelectedPerson(person);
        const node = nodes.find((n) => n.data.id === person.id);
        if (node) centreOnNodeAbovePanel(node.x, node.y);
      }
    },
    [people, nodes, centreOnNodeAbovePanel]
  );

  const handleFamilyNavigate = useCallback(
    (personId: string) => {
      const person = people.find((p) => p.id === personId);
      if (person) {
        setSelectedPerson(person);
        const node = nodes.find((n) => n.data.id === personId);
        if (node) centreOnNodeAbovePanel(node.x, node.y);
      }
    },
    [people, nodes, centreOnNodeAbovePanel]
  );

  const handleSearchSelect = useCallback(
    (personId: string) => {
      handleFamilyNavigate(personId);
    },
    [handleFamilyNavigate]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.loadingPad, { paddingTop: insets.top + spacing.lg }]}>
          <LoadingSkeleton lines={6} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top controls — search + era filter with safe area inset */}
      <View style={{ paddingTop: insets.top }}>
        <PersonSearchBar people={people} onSelect={handleSearchSelect} />
        <EraFilterBar activeEra={filterEra} onSelect={handleEraChange} />
      </View>

      {/* Tree viewport */}
      <View style={styles.viewport} accessible accessibilityLabel="Family tree" accessibilityHint="Pinch to zoom, drag to pan">
        <GestureDetector gesture={gesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <Svg
              width={bounds.width}
              height={bounds.height}
              viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
            >
              <TreeCanvas
                nodes={nodes}
                links={links}
                marriageBars={marriageBars}
                spouseConnectors={spouseConnectors}
                filterEra={filterEra === 'all' ? null : filterEra}
                spineIds={spineIds}
                onNodePress={handleNodePress}
              />
            </Svg>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Bio panel */}
      <PersonSidebar
        visible={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        person={selectedPerson}
        onNavigate={handleFamilyNavigate}
        onChapterPress={(link) => {
          const match = link.match(/(\w+)_(\d+)\.html/);
          if (match) {
            navigation.navigate('ReadTab', {
              screen: 'Chapter',
              params: { bookId: match[1].toLowerCase(), chapterNum: parseInt(match[2], 10) },
            });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  loadingPad: {
    padding: spacing.lg,
  },
  viewport: {
    flex: 1,
  },
});
