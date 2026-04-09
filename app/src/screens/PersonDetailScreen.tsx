/**
 * PersonDetailScreen — Thin wrapper that renders PersonSidebar as
 * an auto-opened modal. All callers that navigate('PersonDetail')
 * get the same rich bio panel used on the genealogy tree.
 *
 * Dismissing the modal navigates back.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getPerson, hasPersonJourney } from '../db/content';
import { PersonSidebar } from '../components/PersonSidebar';
import { useTheme } from '../theme';
import type { Person } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function PersonDetailScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'PersonDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'PersonDetail'>>();
  const { personId } = route.params ?? {};
  const [person, setPerson] = useState<Person | null>(null);
  const [hasJourney, setHasJourney] = useState(false);

  useEffect(() => {
    if (personId) {
      getPerson(personId).then(setPerson);
      hasPersonJourney(personId).then(setHasJourney);
    }
  }, [personId]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNavigate = useCallback((nextPersonId: string) => {
    navigation.push('PersonDetail', { personId: nextPersonId });
  }, [navigation]);

  const handleChapterPress = useCallback((link: string) => {
    const match = link.match(/(\w+)_(\d+)\.html/);
    if (match) {
      (navigation as any).navigate('ReadTab', {
        screen: 'Chapter',
        params: { bookId: match[1].toLowerCase(), chapterNum: parseInt(match[2], 10) },
      });
    }
  }, [navigation]);

  const handleTreePress = useCallback((pid: string) => {
    navigation.navigate('GenealogyTree', { personId: pid });
  }, [navigation]);

  const handleJourneyPress = useCallback((pid: string) => {
    navigation.navigate('PersonJourney', { personId: pid });
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: base.bg }]}>
      <PersonSidebar
        visible={!!person}
        onClose={handleClose}
        person={person}
        onNavigate={handleNavigate}
        onChapterPress={handleChapterPress}
        onTreePress={handleTreePress}
        onJourneyPress={handleJourneyPress}
        hasJourney={hasJourney}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default withErrorBoundary(PersonDetailScreen);
