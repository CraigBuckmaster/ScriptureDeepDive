/**
 * AmicusPaywallScreen — shown to non-premium users who tap the Amicus tab.
 *
 * #1454 scaffolds the shell; #1460 wires the real entitlement gate +
 * upgrade + restore flow.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MessageSquare } from 'lucide-react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import type { ScreenNavProp } from '../navigation/types';

const BULLETS = [
  'Ask any question about the Bible',
  '72 scholars at your fingertips',
  'Honest answers grounded in your corpus',
  'Conversations remembered across sessions',
];

export default function AmicusPaywallScreen(): React.ReactElement {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Amicus', 'Paywall'>>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.content}>
        <MessageSquare size={48} color={base.gold} />
        <Text style={[styles.title, { color: base.text, fontFamily: fontFamily.display }]}>
          Amicus
        </Text>
        <Text style={[styles.subtitle, { color: base.textMuted, fontFamily: fontFamily.bodyItalic }]}>
          Your scholarly study companion
        </Text>

        <View style={styles.bullets}>
          {BULLETS.map((b) => (
            <Text key={b} style={[styles.bullet, { color: base.text, fontFamily: fontFamily.body }]}>
              •  {b}
            </Text>
          ))}
        </View>

        <Pressable
          accessibilityLabel="Unlock with Companion+"
          onPress={() =>
            navigation.getParent()?.navigate('MoreTab', {
              screen: 'Subscription',
            })
          }
          style={[styles.cta, { backgroundColor: base.gold }]}
        >
          <Text style={[styles.ctaText, { color: base.bg }]}>Unlock with Companion+</Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Restore purchases"
          onPress={() =>
            navigation.getParent()?.navigate('MoreTab', {
              screen: 'Subscription',
            })
          }
        >
          <Text style={[styles.restore, { color: base.textMuted }]}>
            Already a subscriber? Restore purchases
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  title: { fontSize: 28, marginTop: spacing.md },
  subtitle: { fontSize: 16, marginBottom: spacing.lg },
  bullets: { alignSelf: 'stretch', gap: 8, marginVertical: spacing.lg },
  bullet: { fontSize: 15 },
  cta: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 999, marginTop: spacing.md },
  ctaText: { fontSize: 16, fontWeight: '600' },
  restore: { fontSize: 12, marginTop: spacing.md, textDecorationLine: 'underline' },
});
