/**
 * AmicusProfileInspectorScreen — shows the exact prose sent to Amicus
 * plus the raw signals the prose was built from (#1459).
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react-native';
import { fontFamily, spacing, useTheme } from '../theme';
import {
  generateProfile,
  getProfileForInspection,
} from '../services/amicus/profile/generator';
import type { ProfileForInspection } from '../services/amicus/profile/types';
import type { ScreenNavProp } from '../navigation/types';
import { logger } from '../utils/logger';

function relativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const delta = Date.now() - t;
  const mins = Math.floor(delta / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function AmicusProfileInspectorScreen(): React.ReactElement {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'AmicusProfileInspector'>>();
  const [inspection, setInspection] = useState<ProfileForInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignals, setShowSignals] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      const data = await getProfileForInspection();
      setInspection(data);
    } catch (err) {
      logger.error('AmicusInspector', 'load failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const regenerate = useCallback(async (): Promise<void> => {
    setRegenerating(true);
    try {
      await generateProfile(true);
      await load();
    } finally {
      setRegenerating(false);
    }
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
        <View style={styles.center}>
          <ActivityIndicator color={base.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={[styles.header, { borderBottomColor: base.border }]}>
        <Pressable
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={base.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: base.text, fontFamily: fontFamily.display }]}>
          Your Amicus Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: base.textMuted, fontFamily: fontFamily.bodyItalic }]}>
          This is the summary sent to our AI provider when you ask a question.
          Nothing else about your reading is shared.
        </Text>

        <View style={[styles.card, { borderColor: base.border, backgroundColor: base.bgSurface }]}>
          <Text style={[styles.cardLabel, { color: base.textMuted }]}>
            Summary sent with each query
          </Text>
          <Text style={[styles.prose, { color: base.text, fontFamily: fontFamily.body }]}>
            {inspection?.prose ?? '(none yet)'}
          </Text>
          {inspection && (
            <Text style={[styles.timestamp, { color: base.textMuted }]}>
              Regenerated {relativeTime(inspection.generated_at)}
            </Text>
          )}
          <Pressable
            accessibilityLabel="Regenerate now"
            onPress={() => void regenerate()}
            disabled={regenerating}
            style={[
              styles.regenerateButton,
              { backgroundColor: base.gold, opacity: regenerating ? 0.5 : 1 },
            ]}
          >
            <RefreshCcw size={14} color={base.bg} />
            <Text style={[styles.regenerateText, { color: base.bg }]}>
              {regenerating ? 'Regenerating…' : 'Regenerate now'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityLabel={showSignals ? 'Hide underlying data' : 'Show underlying data'}
          onPress={() => setShowSignals((x) => !x)}
          style={styles.collapseToggle}
        >
          {showSignals ? (
            <ChevronDown size={16} color={base.text} />
          ) : (
            <ChevronRight size={16} color={base.text} />
          )}
          <Text style={[styles.collapseLabel, { color: base.text, fontFamily: fontFamily.body }]}>
            Underlying data (stays on your device)
          </Text>
        </Pressable>

        {showSignals && inspection && (
          <View style={[styles.signalsBlock, { borderColor: base.border }]}>
            {Object.entries(inspection.raw_signals).map(([k, v]) => (
              <View key={k} style={styles.signalRow}>
                <Text style={[styles.signalKey, { color: base.textMuted }]}>{k}</Text>
                <Text
                  style={[styles.signalValue, { color: base.text, fontFamily: fontFamily.body }]}
                >
                  {typeof v === 'string' ? v : JSON.stringify(v, null, 0)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { fontSize: 18, marginLeft: spacing.sm },
  content: { padding: spacing.md, gap: spacing.md },
  subtitle: { fontSize: 14, lineHeight: 20 },
  card: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 12,
    gap: spacing.sm,
  },
  cardLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  prose: { fontSize: 15, lineHeight: 22 },
  timestamp: { fontSize: 11 },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: spacing.sm,
  },
  regenerateText: { fontSize: 13, fontWeight: '600' },
  collapseToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  collapseLabel: { fontSize: 13 },
  signalsBlock: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    gap: 4,
  },
  signalRow: { marginBottom: 6 },
  signalKey: { fontSize: 11, letterSpacing: 0.5, marginBottom: 2 },
  signalValue: { fontSize: 12 },
});
