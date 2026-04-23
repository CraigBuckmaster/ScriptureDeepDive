export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 30] as const;

export function buildReviewItemsFromSynthesis(synthesis: {
  takeaway: string;
  open_question: string;
  key_connection: string;
}): Array<{ prompt: string; answer: string; intervalDays: number }> {
  const baseItems = [
    {
      prompt: 'What was your main takeaway from this study session?',
      answer: synthesis.takeaway,
    },
    {
      prompt: 'What question should you revisit from this passage?',
      answer: synthesis.open_question,
    },
    {
      prompt: 'What key connection did this chapter reveal?',
      answer: synthesis.key_connection,
    },
  ].filter((item) => item.answer.trim().length > 0);

  return baseItems.flatMap((item) =>
    REVIEW_INTERVAL_DAYS.map((intervalDays) => ({ ...item, intervalDays })),
  );
}
