/**
 * GenealogyTreeScreen — Zoomable family tree of biblical people.
 *
 * Architecture: screen-sized <Svg> with a dynamic `viewBox` acting as a
 * camera into world-space. Pan / pinch gestures update the camera; the
 * camera update re-derives the viewBox string. A separate hook does
 * viewport culling + semantic-zoom filtering so only the elements on
 * screen ever mount as native SVG layers.
 *
 * There are no Animated.Views, no two-layer transforms, and no iOS
 * Reduce Motion workarounds. Centering is a plain setCamera call.
 *
 * Deep-link: initialPersonId param → auto-centre + open bio.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import { GestureDetector } from 'react-native-gesture-handler';

import { usePeople } from '../hooks/usePeople';
import { useTreeLayout } from '../hooks/useTreeLayout';
import { useTreeCamera } from '../hooks/useTreeCamera';
import { useVisibleNodes } from '../hooks/useVisibleNodes';
import { useLandscapeUnlock } from '../hooks/useLandscapeUnlock';

import { TreeCanvas } from '../components/tree/TreeCanvas';
import { EraFilterBar } from '../components/tree/EraFilterBar';
import { PersonSearchBar } from '../components/tree/PersonSearchBar';
import { MessianicLegend } from '../components/tree/MessianicLegend';
import { PersonSidebar } from '../components/PersonSidebar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

import { useTheme, spacing } from '../theme';
import type { Person } from '../types';
import type { TreePerson } from '../utils/treeBuilder';
import { logger } from '../utils/logger';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function GenealogyTreeScreen({ route, navigation }: {
  route: ScreenRouteProp<'Explore', 'GenealogyTree'>;
  navigation: ScreenNavProp<'Explore', 'GenealogyTree'>;
}) {
  const { base } = useTheme();
  useLandscapeUnlock();
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  const initialPersonId = route?.params?.personId;
  const { people, isLoading } = usePeople();
  const insets = useSafeAreaInsets();
  const [filterEra, setFilterEra] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // 1. Layout: runs once when people data loads. Era filter no longer
  //    invalidates the memo — dimming is a render-time concern.
  const {
    nodes, links, marriageBars, spouseConnectors,
    associationLinks, associateBloomLabels, associateTrails,
    spineIds, bounds,
  } = useTreeLayout(people);

  useEffect(() => {
    if (!isLoading) {
      logger.info('Tree', `people=${people.length}, nodes=${nodes.length}, bounds=${JSON.stringify({ w: Math.round(bounds.width), h: Math.round(bounds.height), minX: Math.round(bounds.minX), minY: Math.round(bounds.minY) })}`);
    }
  }, [isLoading, people.length, nodes.length, bounds]);

  // 2. Camera: viewBox state, pan/zoom gestures, centering.
  const {
    gesture, camera, viewBox,
    centreOnNode, centreOnNodeTop, centreOnNodeAbovePanel,
  } = useTreeCamera();

  // 3. Visibility: semantic zoom + viewport culling + entrance tracking.
  const visible = useVisibleNodes(
    nodes, links, marriageBars, spouseConnectors,
    associationLinks, associateBloomLabels, associateTrails,
    camera, SCREEN_W, SCREEN_H, spineIds,
  );

  const handleEraChange = useCallback(
    (era: string) => setFilterEra(era),
    [],
  );

  // ── Centering logic ────────────────────────────────────────────────
  const hasCentred = useRef(false);
  const prevEra = useRef<string>(filterEra);

  // Initial position on Adam (only when there's no deep link).
  useEffect(() => {
    if (initialPersonId || hasCentred.current || nodes.length === 0) return;
    hasCentred.current = true;
    const adam = nodes.find((n) => n.data.id === 'adam');
    if (adam) {
      logger.info('Tree', 'Initial position on Adam');
      centreOnNodeTop(adam.x, adam.y);
    }
  }, [nodes, centreOnNodeTop, initialPersonId]);

  // Deep link: centre on the target person and open the sidebar.
  useEffect(() => {
    if (!initialPersonId || nodes.length === 0) return;
    const node = nodes.find((n) => n.data.id === initialPersonId);
    if (node) {
      const person = people.find((p) => p.id === initialPersonId);
      if (person) setSelectedPerson(person);
      centreOnNodeAbovePanel(node.x, node.y);
    }
  }, [initialPersonId, nodes, people, centreOnNodeAbovePanel]);

  // Era filter change: jump to the first matching person.
  useEffect(() => {
    if (!hasCentred.current || nodes.length === 0) return;
    if (filterEra === prevEra.current) return;
    prevEra.current = filterEra;

    if (filterEra === 'all' || filterEra === 'primeval') {
      const adam = nodes.find((n) => n.data.id === 'adam');
      if (adam) {
        logger.info('Tree', `Era→${filterEra}: top-centering on Adam`);
        centreOnNodeTop(adam.x, adam.y);
      }
    } else {
      const firstMatch = nodes.find((n) => n.data.era === filterEra);
      if (firstMatch) {
        logger.info('Tree', `Era→${filterEra}: centering on ${firstMatch.data.name}`);
        centreOnNode(firstMatch.x, firstMatch.y);
      }
    }
  }, [filterEra, nodes, centreOnNode, centreOnNodeTop]);

  const handleNodePress = useCallback(
    (treePerson: TreePerson) => {
      const person = people.find((p) => p.id === treePerson.id);
      if (person) {
        setSelectedPerson(person);
        const node = nodes.find((n) => n.data.id === person.id);
        if (node) centreOnNodeAbovePanel(node.x, node.y);
      }
    },
    [people, nodes, centreOnNodeAbovePanel],
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
    [people, nodes, centreOnNodeAbovePanel],
  );

  const handleSearchSelect = useCallback(
    (personId: string) => handleFamilyNavigate(personId),
    [handleFamilyNavigate],
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
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <PersonSearchBar people={people} onSelect={handleSearchSelect} />
        <EraFilterBar activeEra={filterEra} onSelect={handleEraChange} />
        <View style={styles.legendWrap}>
          <MessianicLegend />
        </View>
      </View>

      <View
        style={[styles.viewport, { backgroundColor: base.bg }]}
        accessible
        accessibilityLabel="Family tree"
        accessibilityHint="Pinch to zoom, drag to pan"
      >
        {/* Top edge fade overlay */}
        <View style={[styles.edgeFadeTop, { backgroundColor: base.bg }]} pointerEvents="none" />
        <GestureDetector gesture={gesture}>
          <View style={styles.gestureTarget}>
            <Svg
              width={SCREEN_W}
              height={SCREEN_H}
              viewBox={viewBox}
            >
              <TreeCanvas
                nodes={visible.nodes}
                links={visible.links}
                marriageBars={visible.marriageBars}
                spouseConnectors={visible.spouseConnectors}
                associationLinks={visible.associationLinks}
                associateBloomLabels={visible.associateBloomLabels}
                associateTrails={visible.associateTrails}
                filterEra={filterEra === 'all' ? null : filterEra}
                spineIds={spineIds}
                selectedPersonId={selectedPerson?.id ?? null}
                onNodePress={handleNodePress}
                zoom={camera.zoom}
              />
            </Svg>
          </View>
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
            (navigation as any).navigate('ReadTab', {
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
  topBar: {
    zIndex: 10,
  },
  legendWrap: {
    paddingHorizontal: spacing.sm,
    paddingBottom: 4,
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
  gestureTarget: {
    flex: 1,
  },
});

export default withErrorBoundary(GenealogyTreeScreen);
