/**
 * PersonSidebar — Canonical person bio panel used everywhere.
 *
 * On genealogy tree: bottom sheet modal.
 * On PersonDetail route: auto-opened modal (wraps this component).
 *
 * Shows: era badge, name, dates, role, images, family links,
 * bio, scriptureRole, refs, chapter link, "See on Family Tree" link.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { getPersonChildren, getSpousesOf, getPerson } from '../db/content';
import { useContentImages } from '../hooks/useContentImages';
import { useTheme, spacing, radii, eras, eraNames, fontFamily } from '../theme';
import type { Person } from '../types';
import { safeParse } from '../utils/logger';
import { ContentImageGallery } from './ContentImageGallery';
import { BadgeChip } from './BadgeChip';

function FamilyLink({ p, onNavigate, base }: {
  p: Person;
  onNavigate: (personId: string) => void;
  base: ReturnType<typeof useTheme>['base'];
}) {
  const linkColor = p.era ? (eras[p.era] ?? base.gold) : base.gold;
  return (
    <TouchableOpacity onPress={() => onNavigate(p.id)} style={styles.familyLink}>
      <Text style={[styles.familyLinkText, {
        color: linkColor, borderBottomColor: linkColor + '40',
      }]}>
        {p.name}
      </Text>
    </TouchableOpacity>
  );
}

interface Props {
  visible: boolean;
  onClose: () => void;
  person: Person | null;
  onNavigate: (personId: string) => void;
  onChapterPress?: (chapterLink: string) => void;
  onTreePress?: (personId: string) => void;
  onJourneyPress?: (personId: string) => void;
  onMapPress?: (personId: string) => void;
  hasJourney?: boolean;
  /** Whether the person has a populated `geography` array (#1324). */
  hasGeography?: boolean;
}

export function PersonSidebar({
  visible, onClose, person, onNavigate, onChapterPress,
  onTreePress, onJourneyPress, onMapPress, hasJourney, hasGeography,
}: Props) {
  const { base } = useTheme();
  const [children, setChildren] = useState<Person[]>([]);
  const [spouses, setSpouses] = useState<Person[]>([]);
  const [father, setFather] = useState<Person | null>(null);
  const [mother, setMother] = useState<Person | null>(null);
  const { images: contentImages } = useContentImages('people', person?.id);

  useEffect(() => {
    if (!person || !visible) return;
    getPersonChildren(person.id).then(setChildren);
    getSpousesOf(person.id).then(setSpouses);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (person.father) getPerson(person.father).then(setFather); else setFather(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (person.mother) getPerson(person.mother).then(setMother); else setMother(null);
  }, [person, visible]);

  if (!person) return null;

  const eraColor = person.era ? (eras[person.era] ?? base.gold) : base.gold;
  const eraLabel = person.era ? (eraNames[person.era] ?? person.era) : '';
  const refs = safeParse<string[]>(person.refs_json, []);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={[styles.sheet, {
        backgroundColor: base.bgElevated, borderColor: base.border,
      }]}>
        {/* Sticky header */}
        <View style={styles.headerPad}>
          <View style={styles.grabRow}>
            <View style={styles.grabSpacer} />
            <View style={[styles.grabHandle, { backgroundColor: base.textMuted }]} />
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Close bio panel"
              accessibilityRole="button"
              style={styles.closeBtn}
            >
              <Text style={[styles.closeIcon, { color: base.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {eraLabel ? <BadgeChip label={eraLabel} color={eraColor} /> : null}

          <Text style={[styles.name, { color: base.text }]}>
            {person.name}
          </Text>

          {person.dates ? (
            <Text style={[styles.dates, { color: base.textDim }]}>
              {person.dates}
            </Text>
          ) : null}

          <View style={[styles.divider, { backgroundColor: base.border }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.role, { color: base.gold }]}>
            {person.role}
          </Text>

          {contentImages.length > 0 && <ContentImageGallery images={contentImages} />}

          {/* Family block */}
          <View style={styles.familyBlock}>
            {(father || mother) && (
              <View style={styles.familyRow}>
                <Text style={[styles.familyLabel, { color: base.textMuted }]}>
                  {father && mother ? 'Parents' : 'Father'}
                </Text>
                {father && <FamilyLink p={father} onNavigate={onNavigate} base={base} />}
                {mother && <FamilyLink p={mother} onNavigate={onNavigate} base={base} />}
              </View>
            )}
            {spouses.length > 0 && (
              <View style={styles.familyRow}>
                <Text style={[styles.familyLabel, { color: base.textMuted }]}>
                  {spouses.length > 1 ? 'Spouses' : 'Spouse'}
                </Text>
                {spouses.map((s) => <FamilyLink key={s.id} p={s} onNavigate={onNavigate} base={base} />)}
              </View>
            )}
            {children.length > 0 && (
              <View style={styles.familyRow}>
                <Text style={[styles.familyLabel, { color: base.textMuted }]}>
                  {children.length > 1 ? 'Children' : 'Child'}
                </Text>
                {children.slice(0, 15).map((c) => <FamilyLink key={c.id} p={c} onNavigate={onNavigate} base={base} />)}
                {children.length > 15 && <Text style={[styles.moreText, { color: base.textMuted }]}>+{children.length - 15} more</Text>}
              </View>
            )}
          </View>

          {person.bio ? (
            <Text style={[styles.bio, { color: base.textDim }]}>
              {person.bio}
            </Text>
          ) : null}

          {person.scripture_role ? (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, { color: base.gold }]}>
                ROLE IN SCRIPTURE
              </Text>
              <Text style={[styles.sectionBody, { color: base.textDim }]}>
                {person.scripture_role}
              </Text>
            </View>
          ) : null}

          {refs.length > 0 && (
            <View style={styles.refsRow}>
              {refs.map((r, i) => <BadgeChip key={i} label={r} color={base.textMuted} />)}
            </View>
          )}

          {person.chapter_link && onChapterPress && (
            <TouchableOpacity onPress={() => onChapterPress(person.chapter_link!)} style={styles.actionLink}>
              <Text style={[styles.actionLinkText, { color: base.gold }]}>
                Read in Companion Study →
              </Text>
            </TouchableOpacity>
          )}

          {hasJourney && onJourneyPress && (
            <TouchableOpacity onPress={() => onJourneyPress(person.id)} style={styles.actionLink}>
              <Text style={[styles.actionLinkText, { color: base.gold }]}>
                Follow their journey →
              </Text>
            </TouchableOpacity>
          )}

          {hasGeography && onMapPress && (
            <TouchableOpacity
              onPress={() => onMapPress(person.id)}
              style={styles.actionLink}
              accessibilityLabel="View this person's geographic arc on the map"
              accessibilityRole="link"
            >
              <Text style={[styles.actionLinkText, { color: base.gold }]}>View on Map</Text>
              <ArrowRight size={14} color={base.gold} />
            </TouchableOpacity>
          )}

          {onTreePress && (
            <TouchableOpacity
              onPress={() => onTreePress(person.id)}
              style={styles.actionLink}
              accessibilityLabel="See on family tree"
              accessibilityRole="link"
            >
              <Text style={[styles.actionLinkText, { color: base.gold }]}>See on Family Tree</Text>
              <ArrowRight size={14} color={base.gold} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderTopWidth: 1,
    maxHeight: '85%',
  },
  headerPad: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  grabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  grabSpacer: {
    flex: 1,
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  closeBtn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  closeIcon: {
    fontSize: 18,
  },
  name: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 20,
    marginTop: spacing.sm,
  },
  dates: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  role: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 15,
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
  familyLink: {
    marginRight: 8,
    marginBottom: 4,
  },
  familyLinkText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    borderBottomWidth: 1,
  },
  moreText: {
    fontSize: 11,
  },
  bio: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  sectionBlock: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    fontFamily: fontFamily.display,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  sectionBody: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    marginTop: 4,
  },
  refsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  actionLinkText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
});
