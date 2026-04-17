/**
 * components/amicus/InputBar.tsx — sticky bottom input with send / stop
 * button. Multi-line up to 4 visible lines. Disabled during streaming
 * (becomes a Stop button that aborts the current stream).
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ArrowUp, Square } from 'lucide-react-native';
import { spacing, useTheme } from '../../theme';

export interface InputBarProps {
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
  onSend: (text: string) => void;
  onAbort: () => void;
}

const MAX_CHARS = 2000;

export default function InputBar(props: InputBarProps): React.ReactElement {
  const { base } = useTheme();
  const [text, setText] = useState('');
  const canSend = !props.disabled && !props.isStreaming && text.trim().length > 0;

  const send = (): void => {
    const t = text.trim();
    if (!t) return;
    setText('');
    props.onSend(t);
  };

  return (
    <View style={[styles.bar, { borderTopColor: base.border, backgroundColor: base.bg }]}>
      <TextInput
        value={text}
        onChangeText={(v) => setText(v.slice(0, MAX_CHARS))}
        placeholder={props.placeholder ?? 'Message Amicus…'}
        placeholderTextColor={base.textMuted}
        style={[
          styles.input,
          {
            color: base.text,
            backgroundColor: base.bgSurface,
            borderColor: base.border,
          },
        ]}
        multiline
        maxLength={MAX_CHARS}
        editable={!props.disabled}
        returnKeyType="default"
        accessibilityLabel="Message Amicus"
      />
      <Pressable
        accessibilityLabel={props.isStreaming ? 'Stop streaming' : 'Send'}
        disabled={!props.isStreaming && !canSend}
        onPress={() => (props.isStreaming ? props.onAbort() : send())}
        style={({ pressed }) => [
          styles.sendButton,
          {
            backgroundColor: canSend || props.isStreaming ? base.gold : base.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        {props.isStreaming ? (
          <Square size={14} color={base.bg} fill={base.bg} />
        ) : (
          <ArrowUp size={18} color={base.bg} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
