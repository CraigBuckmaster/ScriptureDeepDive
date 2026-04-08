/**
 * FlagReasonPicker — Modal with reason options for flagging content.
 *
 * Reasons: Spam, Inappropriate content, Off-topic, Harmful/dangerous advice, Other.
 * "Other" shows a text input for details. Stores flag locally via flagContent().
 */

import React, { memo, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme, spacing, fontFamily, MIN_TOUCH_TARGET } from '../../theme';
import { submitFlag } from '../../services/engagementApi';

const REASONS = [
  'Spam',
  'Inappropriate content',
  'Off-topic',
  'Harmful/dangerous advice',
  'Other',
] as const;

type Reason = (typeof REASONS)[number];

interface Props {
  visible: boolean;
  contentId: string;
  contentType: string;
  onClose: () => void;
}

export const FlagReasonPicker = memo(function FlagReasonPicker({
  visible,
  contentId,
  contentType,
  onClose,
}: Props) {
  const { base } = useTheme();
  const [selected, setSelected] = useState<Reason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setSelected(null);
    setDetails('');
    setSubmitting(false);
  }, []);

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const result = await submitFlag(
        contentId,
        contentType,
        selected,
        selected === 'Other' ? details : undefined,
      );
      if (result.rateLimited) {
        // Stay open so user sees feedback — briefly flash message then close
        setSubmitting(false);
        // Alert is simple and cross-platform
        const { Alert } = require('react-native');
        Alert.alert(
          'Rate Limit Reached',
          'You can submit up to 5 reports per hour. Please try again later.',
        );
        return;
      }
    } finally {
      reset();
      onClose();
    }
  }, [selected, contentId, contentType, details, reset, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.sheet, { backgroundColor: base.bgElevated }]}>
          <Text style={[styles.title, { color: base.text }]}>Report Content</Text>
          <Text style={[styles.subtitle, { color: base.textMuted }]}>
            Why are you reporting this?
          </Text>

          {REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.option,
                { borderColor: base.border + '40' },
                selected === reason && { borderColor: base.gold, backgroundColor: base.gold + '10' },
              ]}
              onPress={() => setSelected(reason)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === reason }}
            >
              <Text style={[styles.optionText, { color: base.text }]}>{reason}</Text>
            </TouchableOpacity>
          ))}

          {selected === 'Other' && (
            <TextInput
              style={[styles.input, { color: base.text, borderColor: base.border + '40' }]}
              placeholder="Please describe the issue..."
              placeholderTextColor={base.textMuted}
              value={details}
              onChangeText={setDetails}
              multiline
              maxLength={500}
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.actionBtn, { borderColor: base.border + '40' }]}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={[styles.actionText, { color: base.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.actionBtn,
                styles.submitBtn,
                { backgroundColor: selected ? base.gold : base.border },
              ]}
              disabled={!selected || submitting}
              accessibilityRole="button"
              accessibilityLabel="Submit report"
            >
              <Text style={[styles.actionText, { color: '#fff' }]}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  option: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  optionText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    fontFamily: fontFamily.body,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  submitBtn: {
    borderWidth: 0,
  },
  actionText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
});
