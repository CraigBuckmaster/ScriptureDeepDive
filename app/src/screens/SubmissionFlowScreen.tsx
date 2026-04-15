/**
 * SubmissionFlowScreen — Multi-step community submission flow.
 *
 * Step 1: Select type (3 cards)
 * Step 2: Pick topic (search existing or propose new)
 * Step 3: Title + content (TextInput fields)
 * Step 4: Add verses (multi-select)
 * Step 5: Preview + submit
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import { TypeSelector, SubmissionPreview, TopicProposal } from '../components/submission';
import { screenSubmission } from '../services/contentModeration';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import type { SubmissionType } from '../types';

const STEP_TITLES = ['Select Type', 'Pick Topic', 'Write Content', 'Add Verses', 'Preview'];

function SubmissionFlowScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'SubmissionFlow'>>();

  const [step, setStep] = useState(0);
  const [type, setType] = useState<SubmissionType | null>(null);
  const [topicId, setTopicId] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [showProposal, setShowProposal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [verseInput, setVerseInput] = useState('');
  const [verses, setVerses] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canAdvance = useCallback((): boolean => {
    switch (step) {
      case 0: return type !== null;
      case 1: return topicId !== '' || topicName !== '';
      case 2: return title.trim().length > 0 && body.trim().length > 0;
      case 3: return true; // verses are optional
      case 4: return true;
      default: return false;
    }
  }, [step, type, topicId, topicName, title, body]);

  const handleNext = useCallback(() => {
    if (step < 4) setStep(step + 1);
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
    else navigation.goBack();
  }, [step, navigation]);

  const handleAddVerse = useCallback(() => {
    const ref = verseInput.trim();
    if (ref && !verses.includes(ref)) {
      setVerses((prev) => [...prev, ref]);
      setVerseInput('');
    }
  }, [verseInput, verses]);

  const handleRemoveVerse = useCallback((ref: string) => {
    setVerses((prev) => prev.filter((v) => v !== ref));
  }, []);

  const handleTopicProposal = useCallback(
    (proposal: { title: string; category: string; reason: string }) => {
      setTopicName(proposal.title);
      setTopicId('proposed');
      setShowProposal(false);
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (!type || !title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      const result = await screenSubmission({ title, body, verses });
      if (result.decision === 'reject') {
        Alert.alert(
          'Submission Not Accepted',
          result.reason ?? 'Your submission did not pass content screening.',
        );
      } else {
        Alert.alert(
          'Submitted',
          result.decision === 'approve'
            ? 'Your submission has been approved!'
            : 'Your submission is pending review.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [type, title, body, verses, navigation]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return <TypeSelector selected={type} onSelect={setType} />;

      case 1:
        if (showProposal) {
          return (
            <TopicProposal
              onSubmit={handleTopicProposal}
              onCancel={() => setShowProposal(false)}
            />
          );
        }
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.label, { color: base.textDim }]}>Search existing topics</Text>
            <TextInput
              value={topicSearch}
              onChangeText={setTopicSearch}
              placeholder="Search topics..."
              placeholderTextColor={base.textMuted}
              style={[styles.input, { color: base.text, borderColor: base.border + '60', backgroundColor: base.bgElevated }]}
            />
            <TouchableOpacity
              onPress={() => {
                if (topicSearch.trim()) {
                  setTopicId(topicSearch.trim());
                  setTopicName(topicSearch.trim());
                }
              }}
              style={[styles.selectButton, { borderColor: base.border + '60' }]}
            >
              <Text style={[styles.selectButtonText, { color: base.text }]}>
                Use &quot;{topicSearch || '...'}&quot;
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowProposal(true)}
              style={[styles.proposeButton, { backgroundColor: base.gold + '15' }]}
            >
              <Text style={[styles.proposeText, { color: base.gold }]}>
                Propose a new topic
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.label, { color: base.textDim }]}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Give your submission a title"
              placeholderTextColor={base.textMuted}
              style={[styles.input, { color: base.text, borderColor: base.border + '60', backgroundColor: base.bgElevated }]}
            />
            <Text style={[styles.label, { color: base.textDim }]}>Content</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Write your content..."
              placeholderTextColor={base.textMuted}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              style={[styles.textarea, { color: base.text, borderColor: base.border + '60', backgroundColor: base.bgElevated }]}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.label, { color: base.textDim }]}>Add verse references</Text>
            <View style={styles.verseInputRow}>
              <TextInput
                value={verseInput}
                onChangeText={setVerseInput}
                placeholder="e.g., John 3:16"
                placeholderTextColor={base.textMuted}
                onSubmitEditing={handleAddVerse}
                returnKeyType="done"
                style={[styles.verseInput, { color: base.text, borderColor: base.border + '60', backgroundColor: base.bgElevated }]}
              />
              <TouchableOpacity
                onPress={handleAddVerse}
                style={[styles.addButton, { backgroundColor: base.gold }]}
              >
                <Text style={[styles.addButtonText, { color: base.bg }]}>Add</Text>
              </TouchableOpacity>
            </View>
            {verses.length > 0 && (
              <View style={styles.verseChips}>
                {verses.map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => handleRemoveVerse(v)}
                    style={[styles.verseChip, { backgroundColor: base.gold + '20', borderColor: base.gold + '40' }]}
                  >
                    <Text style={[styles.verseChipText, { color: base.gold }]}>{v} x</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            {type && (
              <SubmissionPreview
                type={type}
                title={title}
                body={body}
                verses={verses}
                topicName={topicName}
              />
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title={STEP_TITLES[step]} onBack={handleBack} />
        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: base.border + '30' }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: base.gold, width: `${((step + 1) / 5) * 100}%` },
            ]}
          />
        </View>
        <Text style={[styles.stepLabel, { color: base.textMuted }]}>
          Step {step + 1} of 5
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={[styles.footer, { borderTopColor: base.border + '30' }]}>
        {step < 4 ? (
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canAdvance()}
            style={[
              styles.nextButton,
              { backgroundColor: canAdvance() ? base.gold : base.border + '40' },
            ]}
          >
            <Text
              style={[
                styles.nextButtonText,
                { color: canAdvance() ? base.bg : base.textMuted },
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.nextButton, { backgroundColor: submitting ? base.border + '40' : base.gold }]}
          >
            <Text style={[styles.nextButtonText, { color: submitting ? base.textMuted : base.bg }]}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  stepLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  stepContent: { gap: spacing.sm },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  input: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  textarea: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 160,
  },
  selectButton: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  selectButtonText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  proposeButton: {
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  proposeText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  verseInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  verseInput: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  addButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  addButtonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
  verseChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  verseChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  verseChipText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing.md,
  },
  nextButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.md,
  },
  nextButtonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 16,
  },
});

export default withErrorBoundary(SubmissionFlowScreen);
