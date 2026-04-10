import { Share } from 'react-native';
import { shareLifeTopic } from '@/utils/shareLifeTopic';
import { logEvent } from '@/services/analytics';

jest.mock('react-native', () => ({
  Share: { share: jest.fn().mockResolvedValue({}) },
}));

describe('shareLifeTopic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('includes title in the share message', async () => {
    await shareLifeTopic('Forgiveness', 'A short summary', 'topic-1');

    expect(Share.share).toHaveBeenCalledTimes(1);
    const call = (Share.share as jest.Mock).mock.calls[0][0];
    expect(call.message).toContain('Forgiveness');
    expect(call.title).toContain('Forgiveness');
  });

  it('truncates summary to 200 characters', async () => {
    const longSummary = 'A'.repeat(300);
    await shareLifeTopic('Grace', longSummary, 'topic-2');

    const call = (Share.share as jest.Mock).mock.calls[0][0];
    // The summary portion should be sliced to 200 chars followed by "..."
    expect(call.message).toContain('A'.repeat(200) + '...');
    // Should NOT contain the full 300-char summary
    expect(call.message).not.toContain('A'.repeat(201));
  });

  it('logs analytics event with topicId and title', async () => {
    await shareLifeTopic('Prayer', 'Summary about prayer', 'topic-3');

    expect(logEvent).toHaveBeenCalledWith('share_life_topic', {
      topicId: 'topic-3',
      title: 'Prayer',
    });
  });

  it('swallows share error without throwing', async () => {
    (Share.share as jest.Mock).mockRejectedValueOnce(new Error('Share cancelled'));

    // Should not throw
    await expect(shareLifeTopic('Hope', 'Summary', 'topic-4')).resolves.toBeUndefined();
  });
});
