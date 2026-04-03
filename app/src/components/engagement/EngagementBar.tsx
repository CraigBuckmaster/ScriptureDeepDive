/**
 * EngagementBar — Horizontal row combining UpvoteButton, StarRating,
 * ShareButton, and BookmarkButton.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UpvoteButton } from './UpvoteButton';
import { StarRating } from './StarRating';
import { ShareButton } from './ShareButton';
import { BookmarkButton } from '../BookmarkButton';
import { spacing } from '../../theme';

interface Props {
  /** Upvote state */
  upvoteCount: number;
  isUpvoted: boolean;
  onUpvoteToggle: () => void;

  /** Star rating state */
  rating: number;
  onRate: (rating: number) => void;

  /** Share content */
  shareTitle: string;
  shareBody: string;
  shareUrl?: string;

  /** Bookmark state */
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  verseNum: number;
}

function EngagementBar({
  upvoteCount,
  isUpvoted,
  onUpvoteToggle,
  rating,
  onRate,
  shareTitle,
  shareBody,
  shareUrl,
  isBookmarked,
  onBookmarkToggle,
  verseNum,
}: Props) {
  return (
    <View style={styles.container}>
      <UpvoteButton count={upvoteCount} isUpvoted={isUpvoted} onToggle={onUpvoteToggle} />
      <StarRating rating={rating} onRate={onRate} />
      <View style={styles.spacer} />
      <ShareButton title={shareTitle} body={shareBody} url={shareUrl} />
      <BookmarkButton isBookmarked={isBookmarked} onToggle={onBookmarkToggle} verseNum={verseNum} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  spacer: {
    flex: 1,
  },
});

const MemoizedEngagementBar = React.memo(EngagementBar);
export { MemoizedEngagementBar as EngagementBar };
export default MemoizedEngagementBar;
