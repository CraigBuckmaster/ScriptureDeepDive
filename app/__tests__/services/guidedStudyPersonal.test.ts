import {
  buildGuidedStudyNextAction,
  formatChapterRef,
  getGuidedStudyStepLabel,
} from '@/services/guidedStudy';

describe('guided study personal services', () => {
  it('formats chapter refs from chapter ids', () => {
    expect(formatChapterRef('genesis_1')).toBe('Genesis 1');
    expect(formatChapterRef('1_corinthians_13')).toBe('1 Corinthians 13');
  });

  it('returns human step labels', () => {
    expect(getGuidedStudyStepLabel('observe')).toBe('Observe');
    expect(getGuidedStudyStepLabel('review')).toBe('Review');
  });

  it('prefers continuing an active session over other actions', () => {
    const action = buildGuidedStudyNextAction({
      activeSessions: [
        {
          id: 1,
          chapter_id: 'genesis_1',
          status: 'active',
          current_step: 'observe',
          started_at: '2026-04-23T00:00:00Z',
          completed_at: null,
          updated_at: '2026-04-23T00:00:00Z',
        },
      ],
      dueItems: [
        {
          id: 3,
          source_session_id: 1,
          chapter_id: 'genesis_1',
          title: 'Genesis 1',
          prompt: 'Prompt',
          answer: 'Answer',
          due_date: '2026-04-23',
          interval_days: 1,
          review_count: 0,
          status: 'due',
          created_at: '2026-04-23T00:00:00Z',
          updated_at: '2026-04-23T00:00:00Z',
        },
      ],
      openQuestions: [],
      recentTakeaways: [],
    });

    expect(action?.kind).toBe('continue');
    expect(action?.initialStep).toBe('observe');
  });
});
