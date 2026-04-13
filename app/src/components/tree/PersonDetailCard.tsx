/**
 * PersonDetailCard — Inline detail card shown below the genealogy tree.
 *
 * Header: avatar + name + scripture role + role badge pills.
 * Stats row: 3 columns (reign, children, references).
 * Tabs: Bio | Family | Journey | Verses.
 *
 * Part of Card #1265 (Genealogy redesign Phase 1).
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { Person } from '../../types';
import { RoleBadge } from './RoleBadge';
import { isMessianic } from '../../utils/messianicLine';

export type PersonDetailTab = 'bio' | 'family' | 'journey' | 'verses';

export interface PersonDetailCardProps {
  person: Person;
  /** Children count for the stats row — caller derives from the tree data. */
  childrenCount?: number;
  /** Current active tab. Managed externally so parent can persist between mounts. */
  activeTab?: PersonDetailTab;
  onTabChange?: (tab: PersonDetailTab) => void;
  /** Navigate to a related person's tree node. */
  onPersonPress?: (personId: string) => void;
  /** Navigate to the Chapter screen for a verse reference. */
  onVersePress?: (verseRef: string) => void;
  /** Navigate to the PersonJourney screen. */
  onJourneyPress?: () => void;
  /** Whether a journey exists for this person. */
  hasJourney?: boolean;
  /** Related people — resolved by the caller so we don't re-query here. */
  relatedPeople?: {
    parents: { id: string; name: string }[];
    spouses: { id: string; name: string }[];
    children: { id: string; name: string }[];
  };
}

/** Parse a refs_json column into an array of verse reference strings. */
export function parseRefsJson(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

const TABS: { id: PersonDetailTab; label: string }[] = [
  { id: 'bio', label: 'Bio' },
  { id: 'family', label: 'Family' },
  { id: 'journey', label: 'Journey' },
  { id: 'verses', label: 'Verses' },
];

export function PersonDetailCard({
  person,
  childrenCount,
  activeTab: activeTabProp,
  onTabChange,
  onPersonPress,
  onVersePress,
  onJourneyPress,
  hasJourney,
  relatedPeople,
}: PersonDetailCardProps) {
  const { base } = useTheme();
  const [localTab, setLocalTab] = useState<PersonDetailTab>('bio');
  const activeTab = activeTabProp ?? localTab;
  const setTab = (t: PersonDetailTab) => {
    setLocalTab(t);
    onTabChange?.(t);
  };

  const refs = parseRefsJson(person.refs_json);
  const messianic = isMessianic(person.id);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: base.bgSurface,
          borderColor: base.border,
        },
      ]}
      accessibilityLabel={`Detail for ${person.name}`}
    >
      {/* ── Header ─── */}
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: base.gold + '18',
              borderColor: base.gold + '40',
            },
          ]}
        >
          <Text style={[styles.avatarInitial, { color: base.gold }]}>
            {person.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: base.text }]} numberOfLines={1}>
            {person.name}
          </Text>
          {person.scripture_role ? (
            <Text style={[styles.scriptureRole, { color: base.textMuted }]} numberOfLines={2}>
              {person.scripture_role}
            </Text>
          ) : null}
          <View style={styles.badgeRow}>
            <RoleBadge role={person.role} />
            {messianic ? (
              <View
                style={[styles.msBadge, { backgroundColor: base.gold + '14', borderColor: base.gold }]}
                accessibilityLabel="On the messianic line"
              >
                <Text style={[styles.msLabel, { color: base.gold }]}>Messianic Line</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* ── Stats ─── */}
      <View style={styles.statsRow}>
        {person.dates ? (
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: base.text }]}>{person.dates}</Text>
            <Text style={[styles.statLabel, { color: base.textMuted }]}>Dates</Text>
          </View>
        ) : null}
        {childrenCount != null ? (
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: base.text }]}>{childrenCount}</Text>
            <Text style={[styles.statLabel, { color: base.textMuted }]}>Children</Text>
          </View>
        ) : null}
        <View style={styles.statCell}>
          <Text style={[styles.statValue, { color: base.text }]}>{refs.length}</Text>
          <Text style={[styles.statLabel, { color: base.textMuted }]}>References</Text>
        </View>
      </View>

      {/* ── Tab bar ─── */}
      <View style={[styles.tabBar, { borderBottomColor: base.border }]}>
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setTab(tab.id)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tab`}
              style={[
                styles.tab,
                isActive ? { borderBottomColor: base.gold } : null,
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? base.gold : base.textMuted },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Tab content ─── */}
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
        {activeTab === 'bio' ? (
          <Text style={[styles.bio, { color: base.textDim }]}>
            {person.bio ?? 'No biography yet.'}
          </Text>
        ) : null}
        {activeTab === 'family' ? (
          <View style={styles.familyCol}>
            {(['parents', 'spouses', 'children'] as const).map((group) => {
              const people = relatedPeople?.[group] ?? [];
              if (people.length === 0) return null;
              return (
                <View key={group} style={styles.familyGroup}>
                  <Text style={[styles.familyLabel, { color: base.textMuted }]}>
                    {group.toUpperCase()}
                  </Text>
                  <View style={styles.familyRow}>
                    {people.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => onPersonPress?.(p.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${p.name}`}
                        style={[styles.familyPill, { borderColor: base.gold + '40' }]}
                      >
                        <Text style={[styles.familyPillLabel, { color: base.text }]}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
            {!relatedPeople ||
            (relatedPeople.parents.length === 0 &&
              relatedPeople.spouses.length === 0 &&
              relatedPeople.children.length === 0) ? (
              <Text style={[styles.empty, { color: base.textMuted }]}>
                No related people.
              </Text>
            ) : null}
          </View>
        ) : null}
        {activeTab === 'journey' ? (
          hasJourney ? (
            <TouchableOpacity
              onPress={onJourneyPress}
              style={[styles.journeyButton, { borderColor: base.gold + '55', backgroundColor: base.gold + '18' }]}
              accessibilityRole="button"
              accessibilityLabel={`View journey of ${person.name}`}
            >
              <Text style={[styles.journeyLabel, { color: base.gold }]}>
                View full journey →
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.empty, { color: base.textMuted }]}>
              No journey recorded.
            </Text>
          )
        ) : null}
        {activeTab === 'verses' ? (
          refs.length > 0 ? (
            <View style={styles.verseList}>
              {refs.map((ref) => (
                <TouchableOpacity
                  key={ref}
                  onPress={() => onVersePress?.(ref)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${ref}`}
                  style={[styles.versePill, { borderColor: base.gold + '40' }]}
                >
                  <Text style={[styles.verseLabel, { color: base.gold }]}>{ref}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={[styles.empty, { color: base.textMuted }]}>
              No key references.
            </Text>
          )
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 17,
  },
  scriptureRole: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  msBadge: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  msLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  statLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },

  tabContent: {
    maxHeight: 260,
  },
  tabContentInner: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  bio: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
  },

  familyCol: {
    gap: spacing.sm,
  },
  familyGroup: {
    gap: 4,
  },
  familyLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  familyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  familyPill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  familyPillLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },

  journeyButton: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  journeyLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },

  verseList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  versePill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verseLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
  },

  empty: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
