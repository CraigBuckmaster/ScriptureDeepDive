import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Download } from 'lucide-react-native';
import type { BaseColors } from '../../theme/palettes';
import { spacing, fontFamily } from '../../theme';
import { getUserDb } from '../../db/userDatabase';
import { resetToNewUser } from '../../db/userMutations';
import { exportStudyData, ExportError } from '../../utils/exportData';
import { logger } from '../../utils/logger';
import { SectionLabel } from './SectionLabel';
import { sharedStyles } from './styles';

/**
 * Shared confirmation -> delete pattern for all destructive actions.
 * Accepts a single SQL string or an array of SQL strings to run in sequence.
 */
function confirmClear(
  title: string,
  message: string,
  sql: string | string[],
  successMessage: string,
) {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          const db = getUserDb();
          const statements = Array.isArray(sql) ? sql : [sql];
          for (const stmt of statements) {
            await db.runAsync(stmt);
          }
          Alert.alert('Done', successMessage);
        } catch (err) {
          logger.error('SettingsScreen', `Failed: ${title}`, err);
          Alert.alert('Error', 'Something went wrong. Please try again.');
        }
      },
    },
  ]);
}

export function DataSection({ base }: { base: BaseColors }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportStudyData();
    } catch (err) {
      const message =
        err instanceof ExportError
          ? err.message
          : 'Something went wrong while exporting. Please try again.';
      Alert.alert('Export', message);
    } finally {
      setExporting(false);
    }
  };

  const handleClearHistory = () => {
    confirmClear(
      'Clear Reading History',
      'This will clear all reading history, streak data, and reading plan progress. This cannot be undone.',
      [
        'DELETE FROM reading_progress',
        'DELETE FROM plan_progress',
        "INSERT OR REPLACE INTO user_preferences (key, value) VALUES ('active_plan', '')",
      ],
      'Reading history cleared.',
    );
  };

  const handleClearNotes = () => {
    confirmClear(
      'Clear All Notes',
      'This will permanently delete all your notes and note links. Collections will be kept. This cannot be undone.',
      ['DELETE FROM note_links', 'DELETE FROM notes_fts', 'DELETE FROM user_notes'],
      'All notes have been deleted.',
    );
  };

  const handleClearBookmarks = () => {
    confirmClear(
      'Clear All Bookmarks',
      'This will permanently delete all your bookmarks. This cannot be undone.',
      'DELETE FROM bookmarks',
      'All bookmarks have been deleted.',
    );
  };

  return (
    <View style={sharedStyles.section}>
      <SectionLabel text="DATA" base={base} />

      {/* Export */}
      <TouchableOpacity
        onPress={handleExport}
        disabled={exporting}
        style={localStyles.exportRow}
        activeOpacity={0.6}
      >
        {exporting ? (
          <ActivityIndicator size="small" color={base.gold} />
        ) : (
          <Download size={16} color={base.gold} />
        )}
        <Text style={[localStyles.exportText, { color: base.gold }]}>
          {exporting ? 'Preparing export\u2026' : 'Export Study Data'}
        </Text>
      </TouchableOpacity>
      <Text style={[localStyles.exportHint, { color: base.textMuted }]}>
        Notes, bookmarks, and highlights as JSON
      </Text>

      {/* Destructive actions */}
      <View style={[localStyles.dangerZone, { borderTopColor: base.border + '40' }]}>
        <TouchableOpacity onPress={handleClearHistory} style={localStyles.dangerRow}>
          <Text style={[localStyles.dangerText, { color: base.danger }]}>Clear Reading History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClearNotes} style={localStyles.dangerRow}>
          <Text style={[localStyles.dangerText, { color: base.danger }]}>Clear All Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClearBookmarks} style={localStyles.dangerRow}>
          <Text style={[localStyles.dangerText, { color: base.danger }]}>Clear All Bookmarks</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          Alert.alert(
            'Reset to New User?',
            'Clears reading history, onboarding, streaks, and plan progress. Notes, bookmarks, and highlights are kept. Force-close the app after reset.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: async () => {
                try {
                  await resetToNewUser();
                  Alert.alert('Reset Complete', 'Force-close and reopen the app to see the new-user experience.');
                } catch (err) {
                  logger.error('SettingsScreen', 'Failed to reset new user state', err);
                  Alert.alert('Error', 'Reset failed. Please try again.');
                }
              }},
            ],
          );
        }} style={localStyles.dangerRow}>
          <Text style={[localStyles.dangerText, { color: base.danger }]}>Reset to New User (Dev)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  exportText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  exportHint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  dangerZone: {
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  dangerRow: {
    paddingVertical: spacing.sm + 2,
  },
  dangerText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
});
