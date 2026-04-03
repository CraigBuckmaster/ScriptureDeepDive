/**
 * PersonSidebar — Bio panel for genealogy tree.
 * On phone: bottom sheet. Shows era badge, name, dates, role,
 * family links (tappable → chaining), bio, scriptureRole, refs, chapter link.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeChip } from './BadgeChip';
import { getPersonChildren, getSpousesOf, getPerson } from '../db/content';
import { useTheme, spacing, radii, eras, eraNames, fontFamily } from '../theme';
import type { Person } from '../types';
import { logger } from '../utils/logger';

interface Props {
  visible: boolean;
  onClose: () => void;
  person: Person | null;
  onNavigate: (personId: string) => void;
  onChapterPress?: (chapterLink: string) => void;
}

export function PersonSidebar({ visible, onClose, person, onNavigate, onChapterPress }: Props) {
  const { base } = useTheme();
  const [children, setChildren] = useState<Person[]>([]);
  const [spouses, setSpouses] = useState<Person[]>([]);
  const [father, setFather] = useState<Person | null>(null);
  const [mother, setMother] = useState<Person | null>(null);

  useEffect(() => {
    if (!person || !visible) return;
    getPersonChildren(person.id).then(setChildren);
    getSpousesOf(person.id).then(setSpouses);
    if (person.father) getPerson(person.father).then(setFather); else setFather(null);
    if (person.mother) getPerson(person.mother).then(setMother); else setMother(null);
  }, [person, visible]);

  if (!person) return null;

  const eraColor = person.era ? (eras[person.era] ?? base.gold) : base.gold;
  const eraLabel = person.era ? (eraNames[person.era] ?? person.era) : '';
  let refs: string[] = [];
  try { refs = person.refs_json ? JSON.parse(person.refs_json) : []; } catch (err) { logger.warn('PersonSidebar', 'Operation failed', err); }

  const FamilyLink = ({ p }: { p: Person }) => {
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
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={[styles.sheet, {
        backgroundColor: base.bgElevated, borderColor: base.border,
      }]}>
        {/* Sticky header — stays fixed above the scroll */}
        <View style={styles.headerPad}>
          {/* Grab handle + close button */}
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

          {/* Era badge */}
          {eraLabel ? <BadgeChip label={eraLabel} color={eraColor} /> : null}

          {/* Name */}
          <Text style={[styles.name, { color: base.text }]}>
            {person.name}
          </Text>

          {/* Dates */}
          {person.dates ? (
            <Text style={[styles.dates, { color: base.textDim }]}>
              {person.dates}
            </Text>
          ) : null}

          <View style={[styles.divider, { backgroundColor: base.border }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Role */}
          <Text style={[styles.role, { color: base.gold }]}>
            {person.role}
          </Text>

          {/* Family block */}
          <View style={styles.familyBlock}>
            {(father || mother) && (
              <View style={styles.familyRow}>
                <Text style={[styles.familyLabel, { color: base.textMuted }]}>
                  {father && mother ? 'Parents' : 'Father'}
                </Text>
                {father && <FamilyLink p={father} />}
                {mother && <FamilyLink p={mother} />}
              </View>
            )}
            {spouses.length > 0 && (
              <View style={styles.familyRow}>
                <Text style={[styles.familyLabel, { color: base.textMuted }]}>
                  {spouses.length > 1 ? 'Spouses' : 'Spouse'}
                </Text>
                {spouses.map((s) => <FamilyLink key={s.id} p={s} />)}
              </View>
            )}
            {children.length > 0 && (
              <View style={styles.familyRow}>
                <Text style={[styles.familyLabel, { color: base.textMuted }]}>
                  {children.length > 1 ? 'Children' : 'Child'}
                </Text>
                {children.slice(0, 12).map((c) => <FamilyLink key={c.id} p={c} />)}
                {children.length > 12 && <Text style={[styles.moreText, { color: base.textMuted }]}>+{children.length - 12} more</Text>}
              </View>
            )}
          </View>

          {/* Bio */}
          {person.bio ? (
            <Text style={[styles.bio, { color: base.textDim }]}>
              {person.bio}
            </Text>
          ) : null}

          {/* Scripture Role */}
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

          {/* Key References */}
          {refs.length > 0 && (
            <View style={styles.refsRow}>
              {refs.map((r, i) => <BadgeChip key={i} label={r} color={base.textMuted} />)}
            </View>
          )}

          {/* Chapter link */}
          {person.chapter_link && onChapterPress && (
            <TouchableOpacity onPress={() => onChapterPress(person.chapter_link!)} style={styles.chapterLink}>
              <Text style={[styles.chapterLinkText, { color: base.gold }]}>
                Read in Companion Study →
              </Text>
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
  chapterLink: {
    marginTop: spacing.md,
  },
  chapterLinkText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
});
