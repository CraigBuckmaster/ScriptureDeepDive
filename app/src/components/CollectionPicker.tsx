/**
 * CollectionPicker — Bottom sheet for selecting or creating a study collection.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Plus, Check, Folder } from 'lucide-react-native';
import { getCollections, createCollection } from '../db/user';
import { base, useTheme, spacing, radii, fontFamily } from '../theme';
import type { StudyCollection } from '../types';

const PRESET_COLORS = [
  '#bfa050', // gold
  '#70b8e8', // blue
  '#70d098', // green
  '#e890b8', // pink
  '#c090e0', // purple
  '#e8a070', // orange
];

interface Props {
  visible: boolean;
  onClose: () => void;
  currentCollectionId: number | null;
  onSelect: (collectionId: number | null) => void;
}

export function CollectionPicker({ visible, onClose, currentCollectionId, onSelect }: Props) {
  const { base } = useTheme();
  const [collections, setCollections] = useState<StudyCollection[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (visible) {
      getCollections().then(setCollections);
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const id = await createCollection(newName.trim(), '', newColor);
    onSelect(id);
    setNewName('');
    setShowCreate(false);
    onClose();
  };

  const handleSelect = (id: number | null) => {
    onSelect(id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: base.bgElevated }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: base.border }]}>
            <Text style={[styles.headerTitle, { color: base.text }]}>Select Collection</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={base.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Create new form */}
          {showCreate ? (
            <View style={styles.createForm}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Collection name"
                placeholderTextColor={base.textMuted}
                style={[styles.createInput, { backgroundColor: base.bg, color: base.text, borderColor: base.border }]}
                autoFocus
              />
              <View style={styles.colorRow}>
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setNewColor(color)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      newColor === color && [styles.colorSwatchSelected, { borderColor: base.text }],
                    ]}
                  />
                ))}
              </View>
              <View style={styles.createActions}>
                <TouchableOpacity onPress={() => setShowCreate(false)}>
                  <Text style={[styles.cancelText, { color: base.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreate} style={[styles.createButton, { backgroundColor: base.gold }]}>
                  <Text style={[styles.createButtonText, { color: base.bg }]}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Add new button */}
              <TouchableOpacity style={[styles.addRow, { borderBottomColor: base.border }]} onPress={() => setShowCreate(true)}>
                <Plus size={16} color={base.gold} />
                <Text style={[styles.addText, { color: base.gold }]}>New Collection</Text>
              </TouchableOpacity>

              {/* None option */}
              <TouchableOpacity
                style={[styles.collectionRow, { borderBottomColor: base.border }]}
                onPress={() => handleSelect(null)}
              >
                <View style={styles.collectionInfo}>
                  <Text style={[styles.collectionName, { color: base.text }]}>None</Text>
                  <Text style={[styles.collectionDesc, { color: base.textMuted }]}>Remove from collection</Text>
                </View>
                {currentCollectionId === null && (
                  <Check size={18} color={base.gold} />
                )}
              </TouchableOpacity>

              {/* Collection list */}
              <FlatList
                data={collections}
                keyExtractor={(c) => String(c.id)}
                style={styles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.collectionRow, { borderBottomColor: base.border }]}
                    onPress={() => handleSelect(item.id)}
                  >
                    <View style={[styles.colorBar, { backgroundColor: item.color }]} />
                    <View style={styles.collectionInfo}>
                      <Text style={[styles.collectionName, { color: base.text }]}>{item.name}</Text>
                      {item.description ? (
                        <Text style={[styles.collectionDesc, { color: base.textMuted }]} numberOfLines={1}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                    {currentCollectionId === item.id && (
                      <Check size={18} color={base.gold} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyWrap}>
                    <Folder size={24} color={base.textMuted} />
                    <Text style={[styles.emptyText, { color: base.textMuted }]}>No collections yet</Text>
                  </View>
                }
              />
            </>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '70%',
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  addText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  list: {
    flexGrow: 0,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colorBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  collectionDesc: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: 2,
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
  createForm: {
    padding: spacing.md,
    gap: spacing.md,
  },
  createInput: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    height: 40,
    borderWidth: 1,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorSwatchSelected: {
    borderWidth: 2,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
  createButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  createButtonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
});
