/**
 * GenealogyTreeScreen — Zoomable family tree of 237 biblical people.
 *
 * d3-hierarchy layout + react-native-svg rendering + gesture-handler
 * pinch/pan. Era filtering, person search, bio bottom sheet.
 * Deep-link: initialPersonId param → auto-centre + open bio.
 *
 * ── Transform architecture (iOS Reduce Motion workaround) ───────────
 *
 * View hierarchy:
 *   <GestureDetector>
 *     <Animated.View style={gestureStyle}>     ← gesture deltas (Reanimated)
 *       <View style={baseStyle}>                ← base position (React state)
 *         <Svg>...</Svg>                        ← tree content
 *
 * See useTreeGestures.ts for the full story of why this architecture
 * exists. TL;DR: iOS Reduce Motion breaks Reanimated's ability to
 * update Animated.View transforms programmatically. React state on
 * the inner View is the only reliable way to move the viewport from
 * filter taps / search / deep links. Gestures work on the outer
 * Animated.View because gesture worklets use a different pipeline.
 *
 * Both layers use transformOrigin '0% 0%' (set via styles.transformLayer).
 * Centering functions only modify the inner View (setBase in the hook).
 * Pan/pinch only modify the outer Animated.View (shared values).
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

import { useTheme, spacing } from '../theme';
import type { Person } from '../types';
import type { TreePerson } from '../utils/treeBuilder';
import { logger } from '../utils/logger';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';

export default function GenealogyTreeScreen({ route, navigation }: {
  route: ScreenRouteProp<'Explore', 'GenealogyTree'>;
  navigation: ScreenNavProp<'Explore', 'GenealogyTree'>;
}) {
  const { base } = useTheme();
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
      logger.info('Tree', `people=${people.length}, nodes=${nodes.length}, bounds=${JSON.stringify({ w: Math.round(bounds.width), h: Math.round(bounds.height), minX: Math.round(bounds.minX), minY: Math.round(bounds.minY) })}`);
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
  // All centering uses useEffect (not setTimeout). The original code used
  // setTimeout(() => centreNode(...), 150) inside handleEraChange, but
  // setFilterEra triggers a React re-render that creates new nodes/bounds
  // refs — the setTimeout closure captured stale values. useEffect fires
  // AFTER re-render with fresh deps, so the centering math is always current.
  //
  // prevEra ref prevents spurious re-centering when the component
  // re-renders for unrelated reasons (sidebar open, etc.).

  const hasCentred = useRef(false);
  const prevEra = useRef<string>(filterEra);

  useEffect(() => {
    if (initialPersonId || hasCentred.current || nodes.length === 0) return;
    hasCentred.current = true;
    const adam = nodes.find((n) => n.data.id === 'adam');
    if (adam) {
      logger.info('Tree', 'Initial position on Adam');
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

  // 3. Era filter change — jump to first node of the selected era.
  //    All/Primeval both target Adam (tree root). centreNodeTop places him
  //    near the top of the viewport since there's nothing above him.
  //    Other eras use centreNode (viewport center) for context in all directions.
  useEffect(() => {
    if (!hasCentred.current || nodes.length === 0) return;
    if (filterEra === prevEra.current) return;
    prevEra.current = filterEra;

    if (filterEra === 'all' || filterEra === 'primeval') {
      const adam = nodes.find((n) => n.data.id === 'adam');
      if (adam) {
        logger.info('Tree', `Era→${filterEra}: top-centering on Adam`);
        centreNodeTop(adam.x, adam.y);
      }
    } else {
      const firstMatch = nodes.find((n) => n.data.era === filterEra);
      if (firstMatch) {
        logger.info('Tree', `Era→${filterEra}: centering on ${firstMatch.data.name}`);
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

      <View style={[styles.viewport, { backgroundColor: base.bg }]} accessible accessibilityLabel="Family tree" accessibilityHint="Pinch to zoom, drag to pan">
        {/* Top edge fade overlay */}
        <View style={[styles.edgeFadeTop, { backgroundColor: base.bg }]} pointerEvents="none" />
        <GestureDetector gesture={gesture}>
          {/* Two-layer transform — see useTreeGestures.ts header for why.
              DO NOT collapse into a single Animated.View. Reduce Motion breaks it.
              DO NOT put scale on both layers. Causes blurry SVG text. */}
          <Animated.View style={[gestureStyle, styles.transformLayer]}>
            <View style={[baseStyle, styles.transformLayer]}>
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
                  selectedPersonId={selectedPerson?.id ?? null}
                  onNodePress={handleNodePress}
                  offsetX={-bounds.minX}
                  offsetY={-bounds.minY}
                  canvasWidth={Math.max(bounds.width, 2000)}
                  canvasHeight={Math.max(bounds.height, 2000)}
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
  },
  loadingPad: {
    padding: spacing.lg,
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  edgeFadeTop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    opacity: 0.6,
    zIndex: 5,
  },
  transformLayer: {
    overflow: 'visible' as const,
    transformOrigin: '0% 0%',
  },
});
