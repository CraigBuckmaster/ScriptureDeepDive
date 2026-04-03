/**
 * TopicProposal — Form for proposing a new community topic.
 *
 * Title input, category picker, reason textarea, submit button.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../../theme';

const CATEGORIES = [
  'Faith & Doctrine',
  'Relationships',
  'Life Challenges',
  'Character & Virtue',
  'Worship & Prayer',
  'Other',
];

interface Props {
  onSubmit: (proposal: { title: string; category: string; reason: string }) => void;
  onCancel: () => void;
}

function TopicProposal({ onSubmit, onCancel }: Props) {
  const { base } = useTheme();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [reason, setReason] = useState('');

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a topic title.');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Required', 'Please explain why this topic should be added.');
      return;
    }
    onSubmit({ title: title.trim(), category, reason: reason.trim() });
  }, [title, category, reason, onSubmit]);

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: base.text }]}>Propose a New Topic</Text>

      {/* Title */}
      <Text style={[styles.label, { color: base.textDim }]}>Topic Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Dealing with Grief"
        placeholderTextColor={base.textMuted}
        style={[styles.input, { color: base.text, borderColor: base.border + '60', backgroundColor: base.bgElevated }]}
      />

      {/* Category picker */}
      <Text style={[styles.label, { color: base.textDim }]}>Category</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? base.gold + '20' : base.bgElevated,
                  borderColor: isSelected ? base.gold : base.border + '40',
                },
              ]}
            >
              <Text style={[styles.categoryText, { color: isSelected ? base.gold : base.textDim }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Reason */}
      <Text style={[styles.label, { color: base.textDim }]}>Why should this topic be added?</Text>
      <TextInput
        value={reason}
        onChangeText={setReason}
        placeholder="Explain why this topic would help the community..."
        placeholderTextColor={base.textMuted}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={[
          styles.textarea,
          { color: base.text, borderColor: base.border + '60', backgroundColor: base.bgElevated },
        ]}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: base.textDim }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.submitButton, { backgroundColor: base.gold }]}
        >
          <Text style={[styles.submitText, { color: base.bg }]}>Submit Proposal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  heading: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    letterSpacing: 0.3,
    marginTop: spacing.xs,
  },
  input: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  textarea: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 100,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  submitButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  submitText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
});

export default React.memo(TopicProposal);
