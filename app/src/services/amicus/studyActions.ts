import type { AmicusContextEnvelope } from './context';
import { prettyBookId } from './context';

export type AmicusStudyActionKey =
  | 'explain_context'
  | 'investigate_question'
  | 'interpretive_tensions'
  | 'refine_takeaway'
  | 'trace_connections';

export interface AmicusStudyActionSeed {
  key: AmicusStudyActionKey;
  label: string;
  seedQuery: string;
}

function buildChapterStudyActions(
  chapterRef: NonNullable<AmicusContextEnvelope['chapterRef']>,
): AmicusStudyActionSeed[] {
  const refLabel = `${prettyBookId(chapterRef.book_id)} ${chapterRef.chapter_num}`;
  return [
    {
      key: 'explain_context',
      label: 'Explain this chapter',
      seedQuery: `Give me a guided overview of ${refLabel}. What should I notice before I interpret it?`,
    },
    {
      key: 'interpretive_tensions',
      label: 'Show interpretive tensions',
      seedQuery: `Show me the main interpretive tensions in ${refLabel}. Distinguish broad consensus from debated readings.`,
    },
    {
      key: 'trace_connections',
      label: 'Trace key connections',
      seedQuery: `Trace the most important canonical connections for ${refLabel}. Keep the connections grounded in the text.`,
    },
  ];
}

export function buildStudyActionSeeds(context: AmicusContextEnvelope): AmicusStudyActionSeed[] {
  const guidedActions: AmicusStudyActionSeed[] = [];
  if (context.openQuestionText) {
    guidedActions.push({
      key: 'investigate_question',
      label: 'Investigate my question',
      seedQuery: `Help me investigate this study question: ${context.openQuestionText}`,
    });
  }
  if (context.takeaway) {
    guidedActions.push({
      key: 'refine_takeaway',
      label: 'Refine takeaway',
      seedQuery: `Help me refine this takeaway so it stays faithful to the text: ${context.takeaway}`,
    });
  }
  if (guidedActions.length > 0) {
    return [
      ...guidedActions,
      ...(context.chapterRef ? buildChapterStudyActions(context.chapterRef) : []),
    ];
  }

  if (context.chapterRef) {
    return buildChapterStudyActions(context.chapterRef);
  }

  switch (context.routeContext.kind) {
    case 'debate_topic':
      return [
        {
          key: 'interpretive_tensions',
          label: 'Summarize this debate',
          seedQuery:
            'Summarize the main positions in this debate and explain where the strongest tensions are.',
        },
      ];
    case 'person':
      return [
        {
          key: 'trace_connections',
          label: 'Trace this person',
          seedQuery:
            'Trace why this person matters in the wider biblical story and point me to the strongest connections.',
        },
      ];
    default:
      return [];
  }
}
