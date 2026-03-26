/**
 * PersonSidebar — Bio panel for genealogy tree.
 * On phone: bottom sheet. Shows era badge, name, dates, role,
 * family links (tappable → chaining), bio, scriptureRole, refs, chapter link.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import { BadgeChip } from './BadgeChip';
import { getPersonChildren, getSpousesOf, getPerson } from '../db/content';
import { base, spacing, radii, eras, eraNames, fontFamily } from '../theme';
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

  const FamilyLink = ({ p }: { p: Person }) => (
    <TouchableOpacity onPress={() => onNavigate(p.id)} style={{ marginRight: 8, marginBottom: 4 }}>
      <Text style={{ color: p.era ? (eras[p.era] ?? base.gold) : base.gold,
        fontFamily: fontFamily.uiMedium, fontSize: 13,
        borderBottomWidth: 1, borderBottomColor: (p.era ? (eras[p.era] ?? base.gold) : base.gold) + '40',
      }}>
        {p.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={{
        backgroundColor: base.bgElevated, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg,
        borderTopWidth: 1, borderColor: base.border, maxHeight: '85%',
      }}>
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          {/* Grab handle + close button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
            <View style={{ flex: 1 }} />
            <View style={{ width: 40, height: 4, backgroundColor: base.textMuted, borderRadius: 2 }} />
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Close bio panel"
              accessibilityRole="button"
              style={{ flex: 1, alignItems: 'flex-end' }}
            >
              <Text style={{ color: base.textMuted, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Era badge */}
          {eraLabel ? <BadgeChip label={eraLabel} color={eraColor} /> : null}

          {/* Name */}
          <Text style={{ color: base.text, fontFamily: fontFamily.displaySemiBold, fontSize: 20, marginTop: spacing.sm }}>
            {person.name}
          </Text>

          {/* Dates */}
          {person.dates ? (
            <Text style={{ color: base.textDim, fontFamily: fontFamily.ui, fontSize: 13, marginTop: 2 }}>
              {person.dates}
            </Text>
          ) : null}

          <View style={{ height: 1, backgroundColor: base.border, marginVertical: spacing.md }} />

          {/* Role */}
          <Text style={{ color: base.gold, fontFamily: fontFamily.bodyMedium, fontSize: 15 }}>
            {person.role}
          </Text>

          {/* Family block */}
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {(father || mother) && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <Text style={{ color: base.textMuted, fontSize: 11, fontFamily: fontFamily.uiSemiBold, minWidth: 60 }}>
                  {father && mother ? 'Parents' : 'Father'}
                </Text>
                {father && <FamilyLink p={father} />}
                {mother && <FamilyLink p={mother} />}
              </View>
            )}
            {spouses.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <Text style={{ color: base.textMuted, fontSize: 11, fontFamily: fontFamily.uiSemiBold, minWidth: 60 }}>
                  {spouses.length > 1 ? 'Spouses' : 'Spouse'}
                </Text>
                {spouses.map((s) => <FamilyLink key={s.id} p={s} />)}
              </View>
            )}
            {children.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <Text style={{ color: base.textMuted, fontSize: 11, fontFamily: fontFamily.uiSemiBold, minWidth: 60 }}>
                  {children.length > 1 ? 'Children' : 'Child'}
                </Text>
                {children.slice(0, 12).map((c) => <FamilyLink key={c.id} p={c} />)}
                {children.length > 12 && <Text style={{ color: base.textMuted, fontSize: 11 }}>+{children.length - 12} more</Text>}
              </View>
            )}
          </View>

          {/* Bio */}
          {person.bio ? (
            <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 22, marginTop: spacing.md }}>
              {person.bio}
            </Text>
          ) : null}

          {/* Scripture Role */}
          {person.scripture_role ? (
            <View style={{ marginTop: spacing.md }}>
              <Text style={{ color: base.gold, fontFamily: fontFamily.display, fontSize: 11, letterSpacing: 0.4 }}>
                ROLE IN SCRIPTURE
              </Text>
              <Text style={{ color: base.textDim, fontFamily: fontFamily.body, fontSize: 14, marginTop: 4 }}>
                {person.scripture_role}
              </Text>
            </View>
          ) : null}

          {/* Key References */}
          {refs.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md }}>
              {refs.map((r, i) => <BadgeChip key={i} label={r} color={base.textMuted} />)}
            </View>
          )}

          {/* Chapter link */}
          {person.chapter_link && onChapterPress && (
            <TouchableOpacity onPress={() => onChapterPress(person.chapter_link!)} style={{ marginTop: spacing.md }}>
              <Text style={{ color: base.gold, fontFamily: fontFamily.uiSemiBold, fontSize: 13 }}>
                Read in Companion Study →
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
