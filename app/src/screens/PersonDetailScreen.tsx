/**
 * PersonDetailScreen — Full-page person bio. Navigable from PeoplePanel,
 * search results, explore menu. Has "See on Family Tree" button.
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { usePersonDetail } from '../hooks/usePersonDetail';
import { BadgeChip } from '../components/BadgeChip';
import { ScreenHeader } from '../components/ScreenHeader';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ArrowRight } from 'lucide-react-native';
import { useTheme, spacing, fontFamily, eraNames } from '../theme';
import { logger } from '../utils/logger';

export default function PersonDetailScreen() {
  const { base, eras } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'PersonDetail'>>();
  const route = useRoute<ScreenRouteProp<'Explore', 'PersonDetail'>>();
  const { personId } = route.params ?? {};
  const { person, parents, children, spouses, isLoading } = usePersonDetail(personId);

  if (isLoading || !person) {
    return (
      <View style={[styles.loading, { backgroundColor: base.bg }]}>
        <LoadingSkeleton lines={8} height={16} />
      </View>
    );
  }

  const eraColor = person.era ? (eras[person.era] ?? base.gold) : base.gold;
  const eraLabel = person.era ? (eraNames[person.era] ?? person.era) : '';
  let refs: string[] = [];
  try { refs = person.refs_json ? JSON.parse(person.refs_json) : []; } catch (err) { logger.warn('PersonDetailScreen', 'Operation failed', err); }

  const PersonLink = ({ id, name }: { id: string; name: string }) => (
    <TouchableOpacity onPress={() => navigation.push('PersonDetail', { personId: id })} style={styles.personLink}>
      <Text style={[styles.personLinkText, { color: eraColor }]}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title={person.name}
          subtitle={person.dates ?? undefined}
          titleColor={eraColor}
          onBack={() => navigation.goBack()}
        />

        {eraLabel ? <BadgeChip label={eraLabel} color={eraColor} /> : null}

        <View style={[styles.divider, { backgroundColor: base.border }]} />

        <Text style={[styles.role, { color: base.gold }]}>{person.role}</Text>

        {/* Family */}
        <View style={styles.familyBlock}>
          {(parents.father || parents.mother) && (
            <View style={styles.familyRow}>
              <Text style={[styles.familyLabel, { color: base.textMuted }]}>Parents</Text>
              {parents.father && <PersonLink id={parents.father.id} name={parents.father.name} />}
              {parents.mother && <PersonLink id={parents.mother.id} name={parents.mother.name} />}
            </View>
          )}
          {spouses.length > 0 && (
            <View style={styles.familyRow}>
              <Text style={[styles.familyLabel, { color: base.textMuted }]}>{spouses.length > 1 ? 'Spouses' : 'Spouse'}</Text>
              {spouses.map((s) => <PersonLink key={s.id} id={s.id} name={s.name} />)}
            </View>
          )}
          {children.length > 0 && (
            <View style={styles.familyRow}>
              <Text style={[styles.familyLabel, { color: base.textMuted }]}>Children</Text>
              {children.slice(0, 15).map((c) => <PersonLink key={c.id} id={c.id} name={c.name} />)}
              {children.length > 15 && <Text style={[styles.moreText, { color: base.textMuted }]}>+{children.length - 15} more</Text>}
            </View>
          )}
        </View>

        {/* Bio */}
        {person.bio && <Text style={[styles.bio, { color: base.textDim }]}>{person.bio}</Text>}

        {person.scripture_role && (
          <View style={styles.scriptureSection}>
            <Text style={[styles.sectionLabel, { color: base.gold }]}>ROLE IN SCRIPTURE</Text>
            <Text style={[styles.scriptureBody, { color: base.textDim }]}>{person.scripture_role}</Text>
          </View>
        )}

        {refs.length > 0 && (
          <View style={styles.refsRow}>
            {refs.map((r, i) => <BadgeChip key={i} label={r} color={base.textMuted} />)}
          </View>
        )}

        {/* See on Family Tree */}
        <TouchableOpacity
          onPress={() => navigation.navigate('GenealogyTree', { personId: person.id })}
          style={styles.treeLink}
          accessibilityLabel="See on family tree"
          accessibilityRole="link"
        >
          <Text style={[styles.treeLinkText, { color: base.gold }]}>See on Family Tree</Text>
          <ArrowRight size={14} color={base.gold} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    padding: spacing.lg,
  },
  content: {
    padding: spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  role: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 16,
  },
  familyBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  familyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  familyLabel: {
    fontSize: 11,
    fontFamily: fontFamily.uiSemiBold,
    minWidth: 60,
  },
  personLink: {
    marginRight: 8,
  },
  personLinkText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  moreText: {
    fontSize: 11,
  },
  bio: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
    marginTop: spacing.lg,
  },
  scriptureSection: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fontFamily.display,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  scriptureBody: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  refsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.lg,
  },
  treeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  treeLinkText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
});
