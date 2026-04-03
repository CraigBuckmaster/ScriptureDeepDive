/**
 * FlagButton — Small flag icon that opens the FlagReasonPicker modal.
 *
 * Used on life topics, debates, and other user-facing content to let
 * users report problematic submissions.
 */

import React, { memo, useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Flag } from 'lucide-react-native';
import { useTheme, MIN_TOUCH_TARGET } from '../../theme';
import { FlagReasonPicker } from './FlagReasonPicker';

interface Props {
  contentId: string;
  contentType: string;
}

export const FlagButton = memo(function FlagButton({ contentId, contentType }: Props) {
  const { base } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Report content"
      >
        <Flag size={16} color={base.textMuted} />
      </TouchableOpacity>
      <FlagReasonPicker
        visible={visible}
        contentId={contentId}
        contentType={contentType}
        onClose={() => setVisible(false)}
      />
    </>
  );
});

const styles = StyleSheet.create({
  button: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
