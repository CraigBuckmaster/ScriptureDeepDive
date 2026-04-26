import { artifactToReviewRows, buildArtifact } from '../artifacts';
import type { CapturedInputs } from '../../capturedInputs';
import type { ReviewArtifact } from '../../synthesis/strategy';

const ctx = { chapterTitle: 'Romans 8' };

describe('buildArtifact — quick (memory_verse)', () => {
  it('packs takeaway + verse_to_carry', () => {
    const captured: CapturedInputs = {
      synthesize: { takeaway: 'No condemnation.', key_connection: 'Rom 8:1', open_question: '' },
    };
    expect(buildArtifact('quick', captured, ctx)).toEqual({
      type: 'memory_verse',
      verseRef: 'Romans 8',
      verseText: 'Rom 8:1',
      takeaway: 'No condemnation.',
    });
  });

  it('returns empty strings for missing captured fields', () => {
    expect(buildArtifact('quick', {}, ctx)).toEqual({
      type: 'memory_verse',
      verseRef: 'Romans 8',
      verseText: '',
      takeaway: '',
    });
  });
});

describe('buildArtifact — deep (analytical_claim)', () => {
  it('packs claim + evidence; tension is null when empty', () => {
    const captured: CapturedInputs = {
      synthesize: { takeaway: 'A.', key_connection: 'B.', open_question: '   ' },
    };
    expect(buildArtifact('deep', captured, ctx)).toEqual({
      type: 'analytical_claim',
      claim: 'A.',
      evidence: 'B.',
      tension: null,
    });
  });

  it('preserves tension when populated', () => {
    const captured: CapturedInputs = {
      synthesize: { takeaway: 'A.', key_connection: 'B.', open_question: 'Why?' },
    };
    const artifact = buildArtifact('deep', captured, ctx) as Extract<
      ReviewArtifact,
      { type: 'analytical_claim' }
    >;
    expect(artifact.tension).toBe('Why?');
  });
});

describe('buildArtifact — teaching (teaching_outline)', () => {
  it('packs scene/audience, observe/main_point, synthesize/outline', () => {
    const captured: CapturedInputs = {
      scene: { audience: 'College small group' },
      observe: { main_point: 'Order from chaos.' },
      synthesize: { takeaway: 'Hook → moves → application.', open_question: 'What now?', key_connection: '' },
    };
    expect(buildArtifact('teaching', captured, ctx)).toEqual({
      type: 'teaching_outline',
      audience: 'College small group',
      mainPoint: 'Order from chaos.',
      moves: ['Hook → moves → application.'],
      application: '',
      discussionQuestion: 'What now?',
    });
  });

  it('moves stays empty when no outline text was captured', () => {
    const captured: CapturedInputs = {
      observe: { main_point: 'OK' },
    };
    const artifact = buildArtifact('teaching', captured, ctx) as Extract<
      ReviewArtifact,
      { type: 'teaching_outline' }
    >;
    expect(artifact.moves).toEqual([]);
  });
});

describe('buildArtifact — devotional (returning_prayer)', () => {
  it('packs arrival + word/phrase + prayer + carry-forward', () => {
    const captured: CapturedInputs = {
      scene: { arrival: 'Anxious' },
      observe: { primary: 'shepherd' },
      synthesize: { takeaway: 'Lord, you walk with me.', key_connection: 'Bring this into the day.', open_question: '' },
    };
    expect(buildArtifact('devotional', captured, ctx)).toEqual({
      type: 'returning_prayer',
      arrival: 'Anxious',
      wordOrPhrase: 'shepherd',
      prayer: 'Lord, you walk with me.',
      carryForward: 'Bring this into the day.',
    });
  });
});

describe('artifactToReviewRows', () => {
  it('memory_verse → 2 rows when both verseText + takeaway populated', () => {
    const rows = artifactToReviewRows(
      {
        type: 'memory_verse',
        verseRef: 'Romans 8',
        verseText: 'Rom 8:1',
        takeaway: 'No condemnation.',
      },
      ctx,
    );
    expect(rows).toHaveLength(2);
  });

  it('analytical_claim with null tension → 2 rows (skips tension)', () => {
    const rows = artifactToReviewRows(
      { type: 'analytical_claim', claim: 'A', evidence: 'B', tension: null },
      ctx,
    );
    expect(rows.map((r) => r.prompt)).toEqual([
      'Your claim from Romans 8:',
      'What evidence supported your claim?',
    ]);
  });

  it('teaching_outline → main point + N moves + discussion question, skipping empties', () => {
    const rows = artifactToReviewRows(
      {
        type: 'teaching_outline',
        audience: 'small group',
        mainPoint: 'mp',
        moves: ['m1', 'm2'],
        application: '',
        discussionQuestion: 'q',
      },
      ctx,
    );
    expect(rows).toHaveLength(4);
  });

  it('returning_prayer drops empty answers', () => {
    const rows = artifactToReviewRows(
      {
        type: 'returning_prayer',
        arrival: 'anxious',
        wordOrPhrase: '',
        prayer: 'Lord.',
        carryForward: '',
      },
      ctx,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].answer).toBe('Lord.');
  });
});
