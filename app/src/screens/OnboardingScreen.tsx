/**
 * OnboardingScreen — 3-page carousel shown on first launch only.
 *
 * Page 1: App thesis
 * Page 2: Chapter reading experience (panel buttons demo)
 * Page 3: Explore tools overview
 *
 * After completing or skipping, marks onboarding done and navigates
 * to Genesis 1 to start the user's reading journey.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Layers, Map, Clock, Users, Search } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { OnboardingDemo } from '../components/OnboardingDemo';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  onComplete: () => void;
}

type ThemeBase = import('../theme/palettes').BaseColors;

interface PageData {
  key: string;
  title: string;
  subtitle: string;
  body: string;
  renderContent: (base: ThemeBase) => React.ReactNode;
}

function ToolIcon({ Icon, label, base }: { Icon: React.ElementType; label: string; base: ThemeBase }) {
  return (
    <View style={styles.toolItem}>
      <View style={[styles.toolIconBg, { backgroundColor: base.gold + '15', borderColor: base.gold + '30' }]}>
        <Icon size={22} color={base.gold} />
      </View>
      <Text style={[styles.toolLabel, { color: base.textDim }]}>{label}</Text>
    </View>
  );
}

const PAGES: PageData[] = [
  {
    key: 'thesis',
    title: 'Companion Study',
    subtitle: 'Learn to read it the way\nit was written.',
    body: 'See what a Jewish scholar, a reformed pastor, and a literary critic each notice in the same passage — side by side, one tap away.',
    renderContent: (base) => (
      <View style={styles.thesisContent}>
        <BookOpen size={48} color={base.gold} style={styles.thesisIcon} />
      </View>
    ),
  },
  {
    key: 'demo',
    title: 'Try It Now',
    subtitle: 'Tap a button below the text.',
    body: '',
    renderContent: (base) => (
      <OnboardingDemo base={base} />
    ),
  },
  {
    key: 'explore',
    title: 'Explore Tools',
    subtitle: 'Tools that connect the dots across Scripture.',
    body: 'Follow Abraham\u2019s journey on a map. Trace a Hebrew word through every book. See how an Old Testament promise finds its fulfillment. All offline, all free.',
    renderContent: (base) => (
      <View style={styles.toolGrid}>
        <ToolIcon Icon={Users} label="People" base={base} />
        <ToolIcon Icon={Map} label="Map" base={base} />
        <ToolIcon Icon={Clock} label="Timeline" base={base} />
        <ToolIcon Icon={Search} label="Word Study" base={base} />
        <ToolIcon Icon={Layers} label="Prophecy" base={base} />
        <ToolIcon Icon={BookOpen} label="Concepts" base={base} />
      </View>
    ),
  },
];

function OnboardingScreen({ onComplete }: Props) {
  const { base } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLastPage = currentPage === PAGES.length - 1;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentPage(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useMemo(() => ({ viewAreaCoveragePercentThreshold: 50 }), []);

  const handleNext = () => {
    if (isLastPage) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
    }
  };

  const renderPage = ({ item }: { item: PageData }) => (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      {item.renderContent(base)}
      <Text style={[styles.pageTitle, { color: base.gold }]}>{item.title}</Text>
      <Text style={[styles.pageSubtitle, { color: base.text }]}>{item.subtitle}</Text>
      <Text style={[styles.pageBody, { color: base.textDim }]}>{item.body}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      {/* Skip button */}
      <View style={styles.skipRow}>
        <TouchableOpacity
          onPress={onComplete}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
        >
          <Text style={[styles.skipText, { color: base.textMuted }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Dots + CTA */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentPage ? base.gold : base.textMuted + '40' },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.ctaButton, { backgroundColor: base.gold }]}
          accessibilityLabel={isLastPage ? 'Get Started' : 'Next'}
          accessibilityRole="button"
        >
          <Text style={[styles.ctaText, { color: base.bg }]}>
            {isLastPage ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  skipText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  // Card #1364: Cinzel heading, EB Garamond body for onboarding pages.
  pageTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 26,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  pageSubtitle: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 17,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 26,
  },
  pageBody: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  thesisContent: {
    alignItems: 'center',
  },
  thesisIcon: {
    marginBottom: spacing.lg,
  },
  panelDemo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  panelPill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
  },
  panelPillText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  toolItem: {
    alignItems: 'center',
    width: 72,
  },
  toolIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  toolLabel: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ctaButton: {
    width: '100%',
    height: 48,
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 16,
  },
});

export default withErrorBoundary(OnboardingScreen);
