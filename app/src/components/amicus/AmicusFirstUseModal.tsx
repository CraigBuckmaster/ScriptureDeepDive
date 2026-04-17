/**
 * components/amicus/AmicusFirstUseModal.tsx — one-time privacy disclosure
 * shown the first time a user sends an Amicus query (#1458).
 */
import React from 'react';
import {
  BackHandler,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare } from 'lucide-react-native';
import { fontFamily, spacing, useTheme } from '../../theme';

export interface AmicusFirstUseModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  /** Overridable for tests. */
  privacyPolicyUrl?: string;
}

const DEFAULT_PRIVACY_URL = 'https://contentcompanionstudy.com/privacy';

export default function AmicusFirstUseModal(
  props: AmicusFirstUseModalProps,
): React.ReactElement {
  const { base } = useTheme();

  React.useEffect(() => {
    if (!props.visible) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      props.onDecline();
      return true;
    });
    return () => sub.remove();
  }, [props]);

  const openPrivacy = (): void => {
    void Linking.openURL(props.privacyPolicyUrl ?? DEFAULT_PRIVACY_URL);
  };

  return (
    <Modal
      visible={props.visible}
      animationType="fade"
      transparent
      onRequestClose={props.onDecline}
      accessibilityLabel="Amicus first-use privacy notice"
    >
      <View style={styles.backdrop}>
        <SafeAreaView
          accessibilityViewIsModal
          style={[styles.card, { backgroundColor: base.bg }]}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconRow}>
              <MessageSquare size={36} color={base.gold} />
            </View>
            <Text style={[styles.title, { color: base.text, fontFamily: fontFamily.display }]}>
              Meet Amicus
            </Text>
            <Text
              style={[styles.subtitle, { color: base.textMuted, fontFamily: fontFamily.bodyItalic }]}
            >
              Before we get started
            </Text>
            <Text style={[styles.body, { color: base.text, fontFamily: fontFamily.body }]}>
              Amicus is your scholarly study companion. It answers questions by drawing on
              the curated Companion Study corpus — our 72 scholars, word studies, debates,
              and cross-references. It never fabricates scholar positions.
            </Text>
            <Text style={[styles.heading, { color: base.text, fontFamily: fontFamily.displaySemiBold }]}>
              What stays on your device
            </Text>
            <Text style={[styles.bullet, { color: base.text, fontFamily: fontFamily.body }]}>
              • Your notes, highlights, and bookmarks{'\n'}
              • Your full reading history{'\n'}
              • Your Amicus conversations
            </Text>
            <Text style={[styles.heading, { color: base.text, fontFamily: fontFamily.displaySemiBold }]}>
              What gets sent to our AI provider when you ask a question
            </Text>
            <Text style={[styles.bullet, { color: base.text, fontFamily: fontFamily.body }]}>
              • Your question text{'\n'}
              • An abstract summary of your reading patterns{'\n'}
              • The retrieved scholarly content your question is answered from
            </Text>
            <Text style={[styles.body, { color: base.text, fontFamily: fontFamily.body }]}>
              You can inspect exactly what gets sent in Settings → Amicus → Show My
              Profile.
            </Text>
            <Text style={[styles.body, { color: base.text, fontFamily: fontFamily.body }]}>
              Our AI provider has a zero-retention commitment. Your data is never used to
              train models.
            </Text>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: base.border }]}>
            <Pressable
              accessibilityLabel="I understand, let's begin"
              onPress={props.onAccept}
              style={[styles.primary, { backgroundColor: base.gold }]}
            >
              <Text style={[styles.primaryText, { color: base.bg, fontFamily: fontFamily.displaySemiBold }]}>
                I understand, let&rsquo;s begin
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Not now"
              onPress={props.onDecline}
              style={styles.secondary}
            >
              <Text style={[styles.secondaryText, { color: base.textMuted }]}>Not now</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Read our full privacy commitment"
              onPress={openPrivacy}
              style={styles.link}
            >
              <Text style={[styles.linkText, { color: base.gold }]}>
                Read our full privacy commitment
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  card: {
    maxHeight: '90%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: { padding: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  iconRow: { alignItems: 'center', marginTop: spacing.sm },
  title: { fontSize: 22, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: spacing.md },
  heading: { fontSize: 14, marginTop: spacing.md },
  body: { fontSize: 15, lineHeight: 22 },
  bullet: { fontSize: 15, lineHeight: 22 },
  footer: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  primary: { paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
  primaryText: { fontSize: 15 },
  secondary: { alignItems: 'center', paddingVertical: 8 },
  secondaryText: { fontSize: 13 },
  link: { alignItems: 'center' },
  linkText: { fontSize: 12, textDecorationLine: 'underline' },
});
