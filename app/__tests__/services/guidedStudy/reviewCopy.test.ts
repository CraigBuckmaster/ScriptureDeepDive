/**
 * #1836 — completion payoff copy derives its wording from
 * REVIEW_INTERVAL_DAYS instead of hardcoding "tomorrow".
 */
import { REVIEW_INTERVAL_DAYS } from '@/services/guidedStudy/review';
import { completionPayoffCopy, reviewReturnPhrase } from '@/services/guidedStudy/reviewCopy';

describe('reviewReturnPhrase (#1836)', () => {
  it("says 'tomorrow' only for a 1-day interval", () => {
    expect(reviewReturnPhrase(1)).toBe('tomorrow');
    expect(reviewReturnPhrase(3)).toBe('in 3 days');
    expect(reviewReturnPhrase(7)).toBe('in 7 days');
  });

  it('defaults to the first rung of the actual review ladder', () => {
    expect(reviewReturnPhrase()).toBe(reviewReturnPhrase(REVIEW_INTERVAL_DAYS[0]));
  });
});

describe('completionPayoffCopy (#1836)', () => {
  it('builds the confirmation from the ladder value', () => {
    expect(completionPayoffCopy(1)).toBe("Saved. You'll see this takeaway again tomorrow.");
    expect(completionPayoffCopy(3)).toBe("Saved. You'll see this takeaway again in 3 days.");
    // Default follows the ladder — with today's ladder ([1, ...]) that reads "tomorrow".
    expect(completionPayoffCopy()).toBe(completionPayoffCopy(REVIEW_INTERVAL_DAYS[0]));
  });
});
