/**
 * ContinueExploringFooter — Horizontal scroll of Explore feature cards
 * at the bottom of a chapter, linking to related Explore screens.
 *
 * Data comes from useContinueExploring hook (no DB queries).
 * Hidden when focusMode is active or no linkable data exists.
 *
 * Part of Epic #1048 (#1053).
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight } from 'lucide-react-native';
import type { ExploreCard } from '../hooks/useContinueExploring';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props {
  cards: ExploreCard[];
}

export function ContinueExploringFooter({ cards }: Props) {
  const { base } = useTheme();
  const navigation = useNavigation();

  if (cards.length === 0) return null;

  const handlePress = (card: ExploreCard) => {
    (navigation as any).navigate('ExploreTab', {
      screen: card.screen,
      params: card.params,
    });
  };

  return (
    <View style={styles.container}>
      <Text
        style={[styles.sectionLabel, { color: base.textMuted }]}
        accessibilityRole="header"
      >
        CONTINUE EXPLORING
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + spacing.sm}
      >
        {cards.map((card, i) => (
          <TouchableOpacity
            key={`${card.type}-${i}`}
            onPress={() => handlePress(card)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${card.title}: ${card.subtitle}`}
            style={[styles.card, {
              backgroundColor: base.bgElevated,
              borderColor: card.color + '25',
            }]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text
                style={[styles.cardTitle, { color: card.color }]}
                numberOfLines={1}
              >
                {card.title}
              </Text>
            </View>
            <Text
              style={[styles.cardSubtitle, { color: base.textMuted }]}
              numberOfLines={2}
            >
              {card.subtitle}
            </Text>
            <View style={styles.cardAction}>
              <Text style={[styles.cardActionText, { color: card.color }]}>Explore</Text>
              <ArrowRight size={10} color={card.color} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = 160;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm + 2,
    justifyContent: 'space-between',
    minHeight: 90,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  cardIcon: {
    fontSize: 12,
  },
  cardTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    flex: 1,
  },
  cardSubtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: spacing.xs,
  },
  cardActionText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
  },
});
