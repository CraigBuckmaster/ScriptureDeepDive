import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { ArrowLeft, Check, Clock } from 'lucide-react-native';
import { usePremium, useReviewQueue } from '../hooks';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { fontFamily, radii, spacing, useTheme } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function MyStudyScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { dueItems, allItems, concepts, completeItem } = useReviewQueue();
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const locked = !isPremium;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={[styles.nav, { borderBottomColor: base.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <ArrowLeft size={20} color={base.gold} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: base.gold }]}>My Study</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {locked ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: base.bgElevated, borderColor: base.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: base.text }]}>
              Review your study over time
            </Text>
            <Text style={[styles.body, { color: base.textDim }]}>
              Spaced review prompts and concept vocabulary are included with Companion+.
            </Text>
            <TouchableOpacity
              onPress={() => showUpgrade('feature', 'Guided Study Review')}
              style={[styles.primaryButton, { backgroundColor: base.gold }]}
            >
              <Text style={styles.primaryText}>Unlock review</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <SectionTitle label="DUE FOR REVIEW" />
            {dueItems.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: base.bgElevated, borderColor: base.border },
                ]}
              >
                <Text style={[styles.body, { color: base.textDim }]}>
                  No review prompts are due right now. Saved study sessions will appear here when it
                  is time to revisit them.
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.list,
                  { backgroundColor: base.bgElevated, borderColor: base.border },
                ]}
              >
                {dueItems.map((item) => (
                  <View
                    key={item.id}
                    style={[styles.reviewRow, { borderBottomColor: `${base.border}55` }]}
                  >
                    <Clock size={16} color={base.gold} />
                    <View style={styles.reviewText}>
                      <Text style={[styles.reviewTitle, { color: base.text }]}>{item.title}</Text>
                      <Text style={[styles.reviewPrompt, { color: base.textDim }]}>
                        {item.prompt}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => completeItem(item.id)}
                      accessibilityLabel="Mark review complete"
                      style={[styles.checkButton, { borderColor: `${base.gold}40` }]}
                    >
                      <Check size={15} color={base.gold} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <SectionTitle label="CONCEPT VOCABULARY" />
            {concepts.length === 0 ? (
              <Text style={[styles.body, { color: base.textMuted }]}>
                Concepts you save from guided sessions will collect here.
              </Text>
            ) : (
              <View style={styles.chipRow}>
                {concepts.map((concept) => (
                  <View
                    key={`${concept.concept_id}:${concept.chapter_id}`}
                    style={[styles.chip, { borderColor: `${base.gold}35` }]}
                  >
                    <Text style={[styles.chipText, { color: base.gold }]}>
                      {concept.concept_label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <SectionTitle label="SAVED PROMPTS" />
            <Text style={[styles.body, { color: base.textMuted }]}>
              {allItems.length === 0
                ? 'Save a guided study synthesis to create your first review schedule.'
                : `${allItems.length} review prompts saved across your study sessions.`}
            </Text>
          </>
        )}
      </ScrollView>

      {upgradeRequest && (
        <UpgradePrompt
          visible
          onClose={dismissUpgrade}
          variant={upgradeRequest.variant}
          featureName={upgradeRequest.featureName}
        />
      )}
    </SafeAreaView>
  );

  function SectionTitle({ label }: { label: string }) {
    return <Text style={[styles.sectionLabel, { color: base.gold }]}>{label}</Text>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nav: {
    minHeight: 48,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  cardTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 21,
  },
  primaryButton: {
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryText: {
    color: '#111111',
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  list: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    padding: spacing.md,
  },
  reviewText: {
    flex: 1,
  },
  reviewTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  reviewPrompt: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  checkButton: {
    borderWidth: 1,
    borderRadius: radii.pill,
    padding: 7,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  chipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});

export default withErrorBoundary(MyStudyScreen);
