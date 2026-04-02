/**
 * GospelDots — Small colored indicators showing which Gospels cover an event.
 * For OT parallels, shows book abbreviations instead.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fontFamily } from '../theme';

export const GOSPEL_CONFIG: Record<string, { abbrev: string; color: string; name: string }> = {
  matthew: { abbrev: 'M', color: '#70b8e8', name: 'Matthew' },
  mark:    { abbrev: 'Mk', color: '#e86040', name: 'Mark' },
  luke:    { abbrev: 'L', color: '#81C784', name: 'Luke' },
  john:    { abbrev: 'J', color: '#b090d0', name: 'John' },
};

const GOSPEL_ORDER = ['matthew', 'mark', 'luke', 'john'];

/** Short abbreviations for OT books. */
const OT_ABBREV: Record<string, string> = {
  genesis: 'Gen', exodus: 'Ex', '1_samuel': '1Sa', '2_samuel': '2Sa',
  '1_kings': '1Ki', '2_kings': '2Ki', '1_chronicles': '1Ch', '2_chronicles': '2Ch',
  psalms: 'Ps', isaiah: 'Isa', jeremiah: 'Jer', ezekiel: 'Ezk', daniel: 'Dan',
};

interface Props {
  books: string[];
  isOT?: boolean;
}

export function GospelDots({ books, isOT }: Props) {
  const { base } = useTheme();
  const bookSet = new Set(books);

  if (isOT) {
    return (
      <View style={styles.row}>
        {books.map((b, idx) => (
          <View key={`${b}-${idx}`} style={[styles.dot, { backgroundColor: base.gold + '20' }]}>
            <Text style={[styles.dotText, { color: base.gold }]}>
              {OT_ABBREV[b] ?? b.slice(0, 3)}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {GOSPEL_ORDER.map((g) => {
        const cfg = GOSPEL_CONFIG[g];
        const present = bookSet.has(g);
        return (
          <View key={g} style={[styles.dot, { backgroundColor: present ? cfg.color + '25' : base.border + '40' }]}>
            <Text style={[styles.dotText, { color: present ? cfg.color : base.textMuted + '40' }]}>
              {cfg.abbrev}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  dotText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
