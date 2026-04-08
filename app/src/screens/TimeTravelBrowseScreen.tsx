/**
 * TimeTravelBrowseScreen — Browse church history eras and see featured
 * passages with historical interpretations.
 *
 * Shows era cards with filter pills. Tapping a verse-ref navigates
 * to TimeTravelDetail for the full cross-era timeline view.
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { BrowseScreenTemplate } from '../components/BrowseScreenTemplate';
import { EraCard } from '../components/interpretations/EraCard';
import { InterpretationCard } from '../components/interpretations/InterpretationCard';
import { EraTimeline } from '../components/interpretations/EraTimeline';
import { useInterpretationEras } from '../hooks/useInterpretations';
import { useAsyncData } from '../hooks/useAsyncData';
import { getInterpretationsByEra } from '../db/content/interpretations';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import type { InterpretationEra, HistoricalInterpretation } from '../types';

type DisplayItem =
  | { type: 'era'; data: InterpretationEra }
  | { type: 'interpretation'; data: HistoricalInterpretation };

function TimeTravelBrowseScreen() {
  const navigation = useNavigation<ScreenNavProp<'Explore', 'TimeTravelBrowse'>>();
  const [activeEra, setActiveEra] = useState('all');

  const { data: eras, loading: erasLoading } = useInterpretationEras();

  const { data: filteredInterpretations, loading: interpLoading } =
    useAsyncData<HistoricalInterpretation[]>(
      () =>
        activeEra === 'all'
          ? Promise.resolve([])
          : getInterpretationsByEra(activeEra),
      [activeEra],
      [],
    );

  const items: DisplayItem[] = useMemo(() => {
    if (activeEra === 'all') {
      return eras.map((era) => ({ type: 'era' as const, data: era }));
    }
    return filteredInterpretations.map((interp) => ({
      type: 'interpretation' as const,
      data: interp,
    }));
  }, [activeEra, eras, filteredInterpretations]);

  const loading = erasLoading || interpLoading;

  const handleEraPress = useCallback(
    (era: InterpretationEra) => {
      setActiveEra(era.id);
    },
    [],
  );

  const handleInterpretationPress = useCallback(
    (interp: HistoricalInterpretation) => {
      navigation.navigate('TimeTravelDetail', { verseRef: interp.verse_ref });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<DisplayItem> = useCallback(
    ({ item }) => {
      if (item.type === 'era') {
        return <EraCard era={item.data} onPress={() => handleEraPress(item.data)} />;
      }
      return (
        <InterpretationCard
          interpretation={item.data}
          onPress={() => handleInterpretationPress(item.data)}
        />
      );
    },
    [handleEraPress, handleInterpretationPress],
  );

  const keyExtractor = useCallback(
    (item: DisplayItem) =>
      item.type === 'era' ? `era-${item.data.id}` : `interp-${item.data.id}`,
    [],
  );

  return (
    <BrowseScreenTemplate<DisplayItem>
      title="Time-Travel Reader"
      subtitle="How passages were understood across church history"
      loading={loading}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      filterBar={<EraTimeline activeEra={activeEra} onSelect={setActiveEra} />}
      emptyMessage={
        activeEra === 'all'
          ? 'No eras available yet'
          : 'No interpretations found for this era'
      }
    />
  );
}

export default withErrorBoundary(TimeTravelBrowseScreen);
