import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { ArrowLeft, Check, Clock, MessageSquare } from 'lucide-react-native';
import { isFlagEnabled } from '../config/featureFlags';
import { usePremium, useReviewQueue } from '../hooks';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { formatChapterRef, getGuidedStudyStepLabel } from '../services/guidedStudy';
import { launchAmicusStudyThread } from '../services/amicus';
import { fontFamily, overlay, radii, spacing, useTheme } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import type { GuidedStudyQuestion, GuidedStudySession, GuidedStudyTakeawaySummary } from '../types';

function chapterRouteParams(chapterId: string, initialStep?: string) {
  return {
    bookId: chapterId.replace(/_\d+$/, ''),
    chapterNum: Number(chapterId.match(/_(\d+)$/)?.[1] ?? 1),
    ...(initialStep ? { initialStep } : {}),
  };
}

function MyStudyScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  // #1836: with the study_hub flag on, MyStudy becomes a thin redirect
  // to the Study tab hub. Pop this screen off its own stack FIRST so
  // returning to the More tab lands on the previous screen instead of
  // bouncing back here (no navigation loop). Flag off: unchanged.
  const redirectToHub = isFlagEnabled('study_hub');
  useEffect(() => {
    if (!redirectToHub) return;
    if (navigation.canGoBack()) navigation.goBack();
    navigation.getParent()?.navigate('ExploreTab', { screen: 'StudyHub' });
  }, [navigation, redirectToHub]);
  const {
    dueItems,
    allItems,
    concepts,
    activeSessions,
    openQuestions,
    recentTakeaways,
    nextAction,
    completeItem,
    resolveQuestion,
  } = useReviewQueue();
  const { isPremium, upgradeRequest, showUpgrade, dismissUpgrade } = usePremium();

  const locked = !isPremium;
  const nextSession = activeSessions[0] ?? null;
  const nextSessionQuestion = nextSession
    ? (openQuestions.find((question) => question.session_id === nextSession.id) ?? null)
    : null;
  const nextSessionTakeaway = nextSession
    ? (recentTakeaways.find((takeaway) => takeaway.session_id === nextSession.id) ?? null)
    : null;

  async function openQuestionWithAmicus(question: GuidedStudyQuestion) {
    if (locked) {
      showUpgrade('feature', 'Companion Study Partner');
      return;
    }
    await launchAmicusStudyThread(navigation, {
      entryPoint: 'my_study',
      chapterId: question.chapter_id,
      sessionId: question.session_id,
      guidedStudyStep: 'synthesize',
      openQuestionId: question.id,
      openQuestionText: question.question_text,
      seedQuery: `Help me investigate this study question in ${formatChapterRef(question.chapter_id)}: ${question.question_text}`,
    });
  }

  async function refineTakeawayWithAmicus(takeaway: GuidedStudyTakeawaySummary) {
    if (locked) {
      showUpgrade('feature', 'Companion Study Partner');
      return;
    }
    await launchAmicusStudyThread(navigation, {
      entryPoint: 'my_study',
      chapterId: takeaway.chapter_id,
      sessionId: takeaway.session_id,
      guidedStudyStep: 'synthesize',
      takeaway: takeaway.takeaway,
      seedQuery: `Help me refine this takeaway from ${formatChapterRef(takeaway.chapter_id)} so it stays faithful to the chapter: ${takeaway.takeaway}`,
    });
  }

  async function discussActiveSessionWithAmicus(
    session: GuidedStudySession,
    question?: GuidedStudyQuestion | null,
    takeaway?: GuidedStudyTakeawaySummary | null,
  ) {
    if (locked) {
      showUpgrade('feature', 'Companion Study Partner');
      return;
    }
    await launchAmicusStudyThread(navigation, {
      entryPoint: 'my_study',
      chapterId: session.chapter_id,
      sessionId: session.id,
      guidedStudyStep: session.current_step,
      openQuestionId: question?.id ?? null,
      openQuestionText: question?.question_text ?? null,
      takeaway: takeaway?.takeaway ?? null,
      seedQuery: question?.question_text
        ? `Help me continue investigating this study question in ${formatChapterRef(session.chapter_id)}: ${question.question_text}`
        : takeaway?.takeaway
          ? `Help me keep refining this takeaway from ${formatChapterRef(session.chapter_id)}: ${takeaway.takeaway}`
          : `Help me continue my guided study of ${formatChapterRef(session.chapter_id)}. I am currently at ${getGuidedStudyStepLabel(session.current_step)}.`,
    });
  }

  // Render nothing while the flag-on redirect (#1836) is in flight.
  if (redirectToHub) return null;

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
              Spaced review prompts, open questions, and concept vocabulary are included with
              Companion+.
            </Text>
            <TouchableOpacity
              onPress={() => showUpgrade('feature', 'Companion Study Partner')}
              style={[styles.primaryButton, { backgroundColor: base.gold }]}
            >
              <Text style={styles.primaryText}>Unlock My Study</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {nextAction ? (
              <>
                <SectionTitle label="NEXT STEP" />
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: base.text }]}>{nextAction.title}</Text>
                  <Text style={[styles.body, { color: base.textDim }]}>{nextAction.subtitle}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => {
                        if (nextAction.kind === 'question' && openQuestions[0]) {
                          void openQuestionWithAmicus(openQuestions[0]);
                          return;
                        }
                        if (nextAction.kind === 'takeaway' && recentTakeaways[0]) {
                          void refineTakeawayWithAmicus(recentTakeaways[0]);
                          return;
                        }
                        if (!nextAction.chapterId) return;
                        navigation.navigate(
                          'StudySession',
                          chapterRouteParams(nextAction.chapterId, nextAction.initialStep),
                        );
                      }}
                      style={[
                        styles.primaryButton,
                        { backgroundColor: base.gold, marginTop: 0, flex: 1 },
                      ]}
                    >
                      <Text style={styles.primaryText}>{nextAction.ctaLabel}</Text>
                    </TouchableOpacity>
                    {nextAction.kind === 'continue' && nextSession && (
                      <TouchableOpacity
                        onPress={() =>
                          void discussActiveSessionWithAmicus(
                            nextSession,
                            nextSessionQuestion,
                            nextSessionTakeaway,
                          )
                        }
                        accessibilityLabel="Discuss this next step with Amicus"
                        style={[
                          styles.textButton,
                          styles.cardSecondaryButton,
                          { borderColor: `${base.gold}40` },
                        ]}
                      >
                        <MessageSquare size={14} color={base.gold} />
                        <Text style={[styles.textButtonLabel, { color: base.gold }]}>Discuss</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            ) : null}

            <SectionTitle label="CONTINUE STUDYING" />
            {activeSessions.length === 0 ? (
              <Text style={[styles.body, { color: base.textMuted }]}>
                In-progress guided sessions will appear here.
              </Text>
            ) : (
              <View
                style={[
                  styles.list,
                  { backgroundColor: base.bgElevated, borderColor: base.border },
                ]}
              >
                {activeSessions.map((session) => (
                  <View
                    key={session.id}
                    style={[styles.reviewRow, { borderBottomColor: `${base.border}55` }]}
                  >
                    <Clock size={16} color={base.gold} />
                    <View style={styles.reviewText}>
                      <Text style={[styles.reviewTitle, { color: base.text }]}>
                        {formatChapterRef(session.chapter_id)}
                      </Text>
                      <Text style={[styles.reviewPrompt, { color: base.textDim }]}>
                        Resume at {getGuidedStudyStepLabel(session.current_step)}
                      </Text>
                    </View>
                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate(
                            'StudySession',
                            chapterRouteParams(session.chapter_id, session.current_step),
                          )
                        }
                        accessibilityLabel="Continue guided study"
                        style={[styles.textButton, { borderColor: `${base.gold}40` }]}
                      >
                        <Text style={[styles.textButtonLabel, { color: base.gold }]}>Continue</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          void discussActiveSessionWithAmicus(
                            session,
                            openQuestions.find((question) => question.session_id === session.id) ??
                              null,
                            recentTakeaways.find(
                              (takeaway) => takeaway.session_id === session.id,
                            ) ?? null,
                          )
                        }
                        accessibilityLabel="Discuss this study with Amicus"
                        style={[styles.textButton, { borderColor: `${base.gold}40` }]}
                      >
                        <MessageSquare size={14} color={base.gold} />
                        <Text style={[styles.textButtonLabel, { color: base.gold }]}>Discuss</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <SectionTitle label="DUE TODAY" />
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
                      <Text style={[styles.reviewTitle, { color: base.text }]}>
                        {formatChapterRef(item.chapter_id)}
                      </Text>
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

            <SectionTitle label="OPEN QUESTIONS" />
            {openQuestions.length === 0 ? (
              <Text style={[styles.body, { color: base.textMuted }]}>
                Questions you want to return to will collect here.
              </Text>
            ) : (
              <View
                style={[
                  styles.list,
                  { backgroundColor: base.bgElevated, borderColor: base.border },
                ]}
              >
                {openQuestions.map((question) => (
                  <View
                    key={question.id}
                    style={[styles.reviewRow, { borderBottomColor: `${base.border}55` }]}
                  >
                    <View style={styles.reviewText}>
                      <Text style={[styles.reviewTitle, { color: base.text }]}>
                        {formatChapterRef(question.chapter_id)}
                      </Text>
                      <Text style={[styles.reviewPrompt, { color: base.textDim }]}>
                        {question.question_text}
                      </Text>
                    </View>
                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        onPress={() => void openQuestionWithAmicus(question)}
                        accessibilityLabel="Discuss with Amicus"
                        style={[styles.textButton, { borderColor: `${base.gold}40` }]}
                      >
                        <MessageSquare size={14} color={base.gold} />
                        <Text style={[styles.textButtonLabel, { color: base.gold }]}>Discuss</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => resolveQuestion(question.id)}
                        accessibilityLabel="Mark question resolved"
                        style={[styles.checkButton, { borderColor: `${base.gold}40` }]}
                      >
                        <Check size={15} color={base.gold} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <SectionTitle label="CONCEPTS GROWING" />
            {concepts.length === 0 ? (
              <Text style={[styles.body, { color: base.textMuted }]}>
                Concepts you save from guided sessions will collect here.
              </Text>
            ) : (
              <View style={styles.chipRow}>
                {concepts.map((concept) => (
                  <View
                    key={`${concept.concept_id}:${concept.chapter_id}`}
                    style={[
                      styles.conceptCard,
                      {
                        backgroundColor: base.bgElevated,
                        borderColor: `${base.gold}35`,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: base.gold }]}>
                      {concept.concept_label}
                    </Text>
                    <Text style={[styles.conceptMeta, { color: base.textMuted }]}>
                      Seen {concept.encounter_count} time{concept.encounter_count === 1 ? '' : 's'}
                    </Text>
                    <Text style={[styles.conceptMeta, { color: base.textDim }]}>
                      Last seen in {formatChapterRef(concept.chapter_id)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <SectionTitle label="RECENT TAKEAWAYS" />
            {recentTakeaways.length === 0 ? (
              <Text style={[styles.body, { color: base.textMuted }]}>
                Save a guided study synthesis to create your first takeaway trail.
              </Text>
            ) : (
              <View
                style={[
                  styles.list,
                  { backgroundColor: base.bgElevated, borderColor: base.border },
                ]}
              >
                {recentTakeaways.slice(0, 4).map((takeaway) => (
                  <View
                    key={`${takeaway.session_id}:${takeaway.updated_at}`}
                    style={[styles.reviewRow, { borderBottomColor: `${base.border}55` }]}
                  >
                    <View style={styles.reviewText}>
                      <Text style={[styles.reviewTitle, { color: base.text }]}>
                        {formatChapterRef(takeaway.chapter_id)}
                      </Text>
                      <Text style={[styles.reviewPrompt, { color: base.textDim }]}>
                        {takeaway.takeaway}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => void refineTakeawayWithAmicus(takeaway)}
                      accessibilityLabel="Refine with Amicus"
                      style={[styles.textButton, { borderColor: `${base.gold}40` }]}
                    >
                      <MessageSquare size={14} color={base.gold} />
                      <Text style={[styles.textButtonLabel, { color: base.gold }]}>Refine</Text>
                    </TouchableOpacity>
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
    color: overlay.onGold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  cardSecondaryButton: {
    paddingHorizontal: spacing.md,
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
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  textButtonLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  conceptCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minWidth: '47%',
  },
  chipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
  conceptMeta: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 3,
  },
});

export default withErrorBoundary(MyStudyScreen);
