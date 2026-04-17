/**
 * components/amicus/UserMessageBubble.tsx — right-aligned gold pill.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontFamily, useTheme } from '../../theme';

export default function UserMessageBubble({ content }: { content: string }): React.ReactElement {
  const { base } = useTheme();
  return (
    <View style={[styles.bubble, { backgroundColor: base.gold }]}>
      <Text style={[styles.text, { color: base.bg, fontFamily: fontFamily.body }]}>
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  text: { fontSize: 15, lineHeight: 21 },
});
