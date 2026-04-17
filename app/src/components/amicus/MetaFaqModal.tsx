/**
 * components/amicus/MetaFaqModal.tsx — lightweight modal showing a meta-FAQ
 * article body when a meta_faq citation is tapped.
 */
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import type { MetaFaqArticle } from '../../services/amicus/citationNav';
import { fontFamily, spacing, useTheme } from '../../theme';

export interface MetaFaqModalProps {
  article: MetaFaqArticle | null;
  onClose: () => void;
}

export default function MetaFaqModal(props: MetaFaqModalProps): React.ReactElement {
  const { base } = useTheme();
  return (
    <Modal
      animationType="fade"
      transparent
      visible={props.article != null}
      onRequestClose={props.onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView
          style={[styles.card, { backgroundColor: base.bg }]}
          accessibilityViewIsModal
        >
          <View style={[styles.header, { borderBottomColor: base.border }]}>
            <Text
              numberOfLines={2}
              style={[styles.title, { color: base.text, fontFamily: fontFamily.display }]}
            >
              {props.article?.title ?? ''}
            </Text>
            <Pressable
              accessibilityLabel="Close"
              onPress={props.onClose}
              style={styles.closeButton}
            >
              <X size={22} color={base.text} />
            </Pressable>
          </View>
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <Text
              style={[styles.bodyText, { color: base.text, fontFamily: fontFamily.body }]}
            >
              {props.article?.body ?? ''}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    maxHeight: '85%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { flex: 1, fontSize: 18 },
  closeButton: { padding: spacing.xs },
  body: { flex: 1 },
  bodyContent: { padding: spacing.md, paddingBottom: spacing.xl },
  bodyText: { fontSize: 15, lineHeight: 22 },
});
