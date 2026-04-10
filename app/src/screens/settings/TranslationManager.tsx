import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Download, Trash2 } from 'lucide-react-native';
import type { BaseColors } from '../../theme/palettes';
import { spacing, fontFamily } from '../../theme';
import { DOWNLOADABLE_TRANSLATIONS } from '../../db/translationRegistry';
import { isTranslationInstalled, downloadTranslation, deleteTranslation, getInstalledSize } from '../../db/translationManager';
import { SectionLabel } from './SectionLabel';
import { sharedStyles } from './styles';

export function TranslationManager({ base }: { base: BaseColors }) {
  const [statuses, setStatuses] = useState<Record<string, { installed: boolean; size: number }>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = async () => {
    const result: Record<string, { installed: boolean; size: number }> = {};
    for (const t of DOWNLOADABLE_TRANSLATIONS) {
      const installed = await isTranslationInstalled(t.id);
      const size = installed ? await getInstalledSize(t.id) : t.sizeBytes;
      result[t.id] = { installed, size };
    }
    setStatuses(result);
  };

  useEffect(() => { refresh(); }, [busy]);

  const handleDownload = async (id: string) => {
    setBusy(id);
    try {
      await downloadTranslation(id);
    } catch {
      Alert.alert('Download Failed', 'Please try again.');
    }
    setBusy(null);
  };

  const handleDelete = (id: string, label: string) => {
    Alert.alert(
      `Remove ${label}?`,
      'You can re-download it anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            setBusy(id);
            await deleteTranslation(id);
            setBusy(null);
          },
        },
      ],
    );
  };

  if (DOWNLOADABLE_TRANSLATIONS.length === 0) return null;

  return (
    <View style={sharedStyles.section}>
      <SectionLabel text="TRANSLATIONS" base={base} />
      <Text style={[sharedStyles.translationHint, { color: base.textMuted }]}>
        NIV and KJV are built in. Others can be downloaded on demand.
      </Text>
      {DOWNLOADABLE_TRANSLATIONS.map((t) => {
        const status = statuses[t.id];
        const isInstalled = status?.installed ?? false;
        const isBusy = busy === t.id;
        const sizeMB = ((status?.size ?? t.sizeBytes) / 1024 / 1024).toFixed(1);

        return (
          <View key={t.id} style={[localStyles.translationRow, { borderBottomColor: base.border + '40' }]}>
            <View style={localStyles.translationInfo}>
              <Text style={[sharedStyles.rowLabel, { color: base.text }]}>{t.label}</Text>
              <Text style={[localStyles.translationDetail, { color: base.textMuted }]}>
                {t.fullName}{isInstalled ? ` \u00B7 ${sizeMB} MB` : ''}
              </Text>
            </View>
            {isBusy ? (
              <ActivityIndicator size="small" color={base.gold} />
            ) : isInstalled ? (
              <TouchableOpacity onPress={() => handleDelete(t.id, t.label)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Trash2 size={16} color={base.textMuted} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => handleDownload(t.id)} style={localStyles.downloadButton}>
                <Download size={14} color={base.gold} />
                <Text style={[localStyles.downloadLabel, { color: base.gold }]}>
                  {Number(sizeMB) > 0 ? `${sizeMB} MB` : 'Install'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

const localStyles = StyleSheet.create({
  translationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  translationInfo: {
    flex: 1,
  },
  translationDetail: {
    fontSize: 11,
    fontFamily: fontFamily.ui,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadLabel: {
    fontSize: 12,
    fontFamily: fontFamily.uiSemiBold,
    marginLeft: 4,
  },
});
