/**
 * GenealogyTreeScreen — Zoomable family tree of 237 biblical people.
 *
 * Two-layer transform (Reduce Motion compatible, no blur):
 *   Outer Animated.View → gesture translate deltas + scale (Reanimated)
 *   Inner View → base translate (React state, always re-renders)
 *   Scale is ONLY on the outer layer — single rasterization pass.
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

  useEffect(() => {
    if (!isLoading) {
      console.log(`[Tree] people=${people.length}, nodes=${nodes.length}, bounds=${JSON.stringify({ w: Math.round(bounds.width), h: Math.round(bounds.height), minX: Math.round(bounds.minX), minY: Math.round(bounds.minY) })}`);
    }
  }, [isLoading, people.length, nodes.length]);

  const { gesture, baseStyle, gestureStyle, centreOnNode, centreOnNodeTop, centreOnNodeAbovePanel } = useTreeGestures();

  const offX = -bounds.minX;
  const offY = -bounds.minY;

  const centreNode = useCallback(
    (nodeX: number, nodeY: number) => centreOnNode(nodeX + offX, nodeY + offY),
    [centreOnNode, offX, offY],
  );
  const centreNodeTop = useCallback(
    (nodeX: number, nodeY: number) => centreOnNodeTop(nodeX + offX, nodeY + offY),
    [centreOnNodeTop, offX, offY],
  );
  const centreNodeAbove = useCallback(
    (nodeX: number, nodeY: number) => centreOnNodeAbovePanel(nodeX + offX, nodeY + offY),
    [centreOnNodeAbovePanel, offX, offY],
  );

  const handleEraChange = useCallback(
    (era: string) => setFilterEra(era),
    [],
  );

  // ── Centering logic ────────────────────────────────────────────────

  const hasCentred = useRef(false);
  const prevEra = useRef<string>(filterEra);

  useEffect(() => {
    if (initialPersonId || hasCentred.current || nodes.length === 0) return;
    hasCentred.current = true;
    const adam = nodes.find((n) => n.data.id === 'adam');
    if (adam) {
      console.log('[Tree] Initial position on Adam');
      centreNodeTop(adam.x, adam.y);
    }
  }, [nodes.length, centreNodeTop, initialPersonId, offX, offY]);

  useEffect(() => {
    if (!initialPersonId || nodes.length === 0) return;
    const node = nodes.find((n) => n.data.id === initialPersonId);
    if (node) {
      const person = people.find((p) => p.id === initialPersonId);
      if (person) setSelectedPerson(person);
      centreNodeAbove(node.x, node.y);
    }
  }, [initialPersonId, nodes.length, people, centreNodeAbove]);

  useEffect(() => {
    if (!hasCentred.current || nodes.length === 0) return;
    if (filterEra === prevEra.current) return;
    prevEra.current = filterEra;

    if (filterEra === 'all' || filterEra === 'primeval') {
      const adam = nodes.find((n) => n.data.id === 'adam');
      if (adam) {
        console.log(`[Tree] Era→${filterEra}: top-centering on Adam`);
        centreNodeTop(adam.x, adam.y);
      }
    } else {
      const firstMatch = nodes.find((n) => n.data.era === filterEra);
      if (firstMatch) {
        console.log(`[Tree] Era→${filterEra}: centering on ${firstMatch.data.name}`);
        centreNode(firstMatch.x, firstMatch.y);
      }
    }
  }, [filterEra, nodes, centreNode, centreNodeTop]);

  const handleNodePress = useCallback(
    (treePerson: TreePerson) => {
      const person = people.find((p) => p.id === treePerson.id);
      if (person) {
        setSelectedPerson(person);
        const node = nodes.find((n) => n.data.id === person.id);
        if (node) centreNodeAbove(node.x, node.y);
      }
    },
    [people, nodes, centreNodeAbove]
  );

  const handleFamilyNavigate = useCallback(
    (personId: string) => {
      const person = people.find((p) => p.id === personId);
      if (person) {
        setSelectedPerson(person);
        const node = nodes.find((n) => n.data.id === personId);
        if (node) centreNodeAbove(node.x, node.y);
      }
    },
    [people, nodes, centreNodeAbove]
  );

  const handleSearchSelect = useCallback(
    (personId: string) => handleFamilyNavigate(personId),
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
      <View style={{ paddingTop: insets.top, zIndex: 10 }}>
        <PersonSearchBar people={people} onSelect={handleSearchSelect} />
        <EraFilterBar activeEra={filterEra} onSelect={handleEraChange} />
      </View>

      <View style={styles.viewport} accessible accessibilityLabel="Family tree" accessibilityHint="Pinch to zoom, drag to pan">
        <GestureDetector gesture={gesture}>
          <Animated.View style={[gestureStyle, styles.layer]}>
            <View style={[baseStyle, styles.layer]}>
              <Svg
                width={Math.max(bounds.width, 2000)}
                height={Math.max(bounds.height, 2000)}
              >
                <TreeCanvas
                  nodes={nodes}
                  links={links}
                  marriageBars={marriageBars}
                  spouseConnectors={spouseConnectors}
                  filterEra={filterEra === 'all' ? null : filterEra}
                  spineIds={spineIds}
                  onNodePress={handleNodePress}
                  offsetX={-bounds.minX}
                  offsetY={-bounds.minY}
                />
              </Svg>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>

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
    overflow: 'hidden',
  },
  layer: {
    overflow: 'visible' as const,
  },
});
