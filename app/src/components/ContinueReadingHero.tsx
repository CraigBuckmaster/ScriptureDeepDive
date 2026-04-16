/**
 * ContinueReadingHero — Full-width hero card with cycling book image.
 *
 * Image header (160px), caption overlay, dot indicators, gradient fade,
 * text area with book/chapter + "Continue" CTA button.
 *
 * Fallback chain: book images → key person images → category images → accent strip.
 * New user state: "Begin your journey" with Genesis CTA.
 *
 * Part of Epic #1089 (#1090).
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { useContentImages } from '../hooks/useContentImages';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ContentImage } from '../types';
import type { RecentChapter } from '../types';

const IMAGE_HEIGHT = 160;
const CYCLE_INTERVAL = 8000;
const R2 = 'https://contentcompanionstudy.com/art';

// Key person for each book (used as fallback when book has no images)
const BOOK_FALLBACK_PERSON: Record<string, string> = {
  genesis: 'abraham', exodus: 'moses', leviticus: 'moses', numbers: 'moses',
  deuteronomy: 'moses', joshua: 'joshua', judges: 'samson', ruth: 'ruth',
  '1_samuel': 'david', '2_samuel': 'david', '1_kings': 'solomon', '2_kings': 'elijah',
  '1_chronicles': 'david', '2_chronicles': 'solomon', ezra: 'ezra', nehemiah: 'nehemiah',
  esther: 'esther', job: 'job', psalms: 'david', proverbs: 'solomon',
  isaiah: 'isaiah', jeremiah: 'jeremiah', ezekiel: 'ezekiel', daniel: 'daniel',
  hosea: 'hosea', jonah: 'jonah', matthew: 'jesus', mark: 'jesus',
  luke: 'jesus', john: 'jesus', acts: 'paul', romans: 'paul',
  revelation: 'john',
};

// ── Category fallback images (Doré + historical maps on R2) ─────────
// Used when neither the book nor its key person has content_images.

type BookCategory = 'torah' | 'history' | 'wisdom' | 'major_prophets' | 'minor_prophets' | 'gospels' | 'acts' | 'epistles' | 'revelation';

const BOOK_CATEGORY: Record<string, BookCategory> = {
  genesis: 'torah', exodus: 'torah', leviticus: 'torah', numbers: 'torah', deuteronomy: 'torah',
  joshua: 'history', judges: 'history', ruth: 'history',
  '1_samuel': 'history', '2_samuel': 'history', '1_kings': 'history', '2_kings': 'history',
  '1_chronicles': 'history', '2_chronicles': 'history', ezra: 'history', nehemiah: 'history', esther: 'history',
  job: 'wisdom', psalms: 'wisdom', proverbs: 'wisdom', ecclesiastes: 'wisdom', song_of_solomon: 'wisdom',
  isaiah: 'major_prophets', jeremiah: 'major_prophets', lamentations: 'major_prophets',
  ezekiel: 'major_prophets', daniel: 'major_prophets',
  hosea: 'minor_prophets', joel: 'minor_prophets', amos: 'minor_prophets', obadiah: 'minor_prophets',
  jonah: 'minor_prophets', micah: 'minor_prophets', nahum: 'minor_prophets', habakkuk: 'minor_prophets',
  zephaniah: 'minor_prophets', haggai: 'minor_prophets', zechariah: 'minor_prophets', malachi: 'minor_prophets',
  matthew: 'gospels', mark: 'gospels', luke: 'gospels', john: 'gospels',
  acts: 'acts',
  romans: 'epistles', '1_corinthians': 'epistles', '2_corinthians': 'epistles', galatians: 'epistles',
  ephesians: 'epistles', philippians: 'epistles', colossians: 'epistles',
  '1_thessalonians': 'epistles', '2_thessalonians': 'epistles',
  '1_timothy': 'epistles', '2_timothy': 'epistles', titus: 'epistles', philemon: 'epistles',
  hebrews: 'epistles', james: 'epistles', '1_peter': 'epistles', '2_peter': 'epistles',
  '1_john': 'epistles', '2_john': 'epistles', '3_john': 'epistles', jude: 'epistles',
  revelation: 'revelation',
};

interface FallbackImage { url: string; caption: string; credit: string }

const CATEGORY_IMAGES: Record<BookCategory, FallbackImage[]> = {
  torah: [
    { url: `${R2}/dore-creation-light.jpg`,   caption: 'Creation of Light',        credit: 'Gustave Doré' },
    { url: `${R2}/dore-adam-eve.jpg`,          caption: 'Adam and Eve in Eden',     credit: 'Gustave Doré' },
    { url: `${R2}/dore-flood.jpg`,             caption: 'The Great Flood',          credit: 'Gustave Doré' },
    { url: `${R2}/dore-abraham-angels.jpg`,    caption: 'Abraham and the Angels',   credit: 'Gustave Doré' },
    { url: `${R2}/dore-red-sea.jpg`,           caption: 'Crossing the Red Sea',     credit: 'Gustave Doré' },
    { url: `${R2}/dore-sinai.jpg`,             caption: 'Moses on Mount Sinai',     credit: 'Gustave Doré' },
  ],
  history: [
    { url: `${R2}/dore-jericho.jpg`,           caption: 'The Fall of Jericho',      credit: 'Gustave Doré' },
    { url: `${R2}/dore-deborah.jpg`,           caption: 'Deborah',                  credit: 'Gustave Doré' },
    { url: `${R2}/dore-samson.jpg`,            caption: 'Samson',                   credit: 'Gustave Doré' },
    { url: `${R2}/dore-ruth-boaz.jpg`,         caption: 'Ruth and Boaz',            credit: 'Gustave Doré' },
    { url: `${R2}/dore-david-goliath.jpg`,     caption: 'David and Goliath',        credit: 'Gustave Doré' },
    { url: `${R2}/dore-solomon-judgment.jpg`,  caption: 'Judgment of Solomon',      credit: 'Gustave Doré' },
    { url: `${R2}/dore-elijah-carmel.jpg`,     caption: 'Elijah on Mount Carmel',   credit: 'Gustave Doré' },
    { url: `${R2}/dore-esther.jpg`,            caption: 'Esther Before the King',   credit: 'Gustave Doré' },
  ],
  wisdom: [
    { url: `${R2}/dore-solomon-judgment.jpg`,  caption: 'The Wisdom of Solomon',    credit: 'Gustave Doré' },
    { url: `${R2}/dore-creation-light.jpg`,    caption: 'The Majesty of Creation',  credit: 'Gustave Doré' },
    { url: `${R2}/dore-jacob-blessing.jpg`,    caption: 'Jacob\'s Blessing',        credit: 'Gustave Doré' },
    { url: `${R2}/dore-david-goliath.jpg`,     caption: 'David — Psalmist and King', credit: 'Gustave Doré' },
  ],
  major_prophets: [
    { url: `${R2}/dore-isaiah.jpg`,            caption: 'The Vision of Isaiah',     credit: 'Gustave Doré' },
    { url: `${R2}/dore-jeremiah.jpg`,          caption: 'Jeremiah',                 credit: 'Gustave Doré' },
    { url: `${R2}/dore-ezekiel.jpg`,           caption: 'Ezekiel\'s Vision',        credit: 'Gustave Doré' },
    { url: `${R2}/dore-daniel.jpg`,            caption: 'Daniel in the Lions\' Den', credit: 'Gustave Doré' },
    { url: `${R2}/dore-assyrian-exile.jpg`,    caption: 'The Exile',                credit: 'Gustave Doré' },
  ],
  minor_prophets: [
    { url: `${R2}/dore-jonah.jpg`,             caption: 'Jonah',                    credit: 'Gustave Doré' },
    { url: `${R2}/dore-assyrian-exile.jpg`,    caption: 'The Exile',                credit: 'Gustave Doré' },
    { url: `${R2}/dore-elijah-chariot.jpg`,    caption: 'Elijah\'s Chariot of Fire', credit: 'Gustave Doré' },
    { url: `${R2}/dore-isaiah.jpg`,            caption: 'The Prophetic Word',       credit: 'Gustave Doré' },
  ],
  gospels: [
    { url: `${R2}/dore-nativity.jpg`,          caption: 'The Nativity',             credit: 'Gustave Doré' },
    { url: `${R2}/dore-prodigal-son.jpg`,      caption: 'The Prodigal Son',         credit: 'Gustave Doré' },
    { url: `${R2}/dore-crucifixion-darkness.jpg`, caption: 'The Crucifixion',        credit: 'Gustave Doré' },
    { url: `${R2}/dore-resurrection.jpg`,      caption: 'The Resurrection',         credit: 'Gustave Doré' },
  ],
  acts: [
    { url: `${R2}/dore-pentecost.jpg`,         caption: 'The Day of Pentecost',     credit: 'Gustave Doré' },
    { url: `${R2}/dore-paul.jpg`,              caption: 'The Apostle Paul',         credit: 'Gustave Doré' },
    { url: `${R2}/map-paul-journeys.jpg`,      caption: 'Paul\'s Missionary Journeys', credit: 'Historical map' },
  ],
  epistles: [
    { url: `${R2}/dore-paul.jpg`,              caption: 'Paul — Apostle to the Nations', credit: 'Gustave Doré' },
    { url: `${R2}/dore-pentecost.jpg`,         caption: 'The Early Church',         credit: 'Gustave Doré' },
    { url: `${R2}/map-paul-journeys.jpg`,      caption: 'Paul\'s Journeys',         credit: 'Historical map' },
    { url: `${R2}/map-palestine-christ.jpg`,   caption: 'The Ancient World',        credit: 'Historical map' },
  ],
  revelation: [
    { url: `${R2}/dore-crucifixion-darkness.jpg`, caption: 'Darkness Over the Land', credit: 'Gustave Doré' },
    { url: `${R2}/dore-creation-light.jpg`,    caption: 'And God Said, Let There Be Light', credit: 'Gustave Doré' },
    { url: `${R2}/dore-resurrection.jpg`,      caption: 'The Risen Christ',         credit: 'Gustave Doré' },
    { url: `${R2}/dore-daniel.jpg`,            caption: 'Daniel\'s Vision',         credit: 'Gustave Doré' },
  ],
};

interface Props {
  mostRecent: RecentChapter | null;
  onPress: () => void;
}

export function ContinueReadingHero({ mostRecent, onPress }: Props) {
  const { base } = useTheme();

  const bookId = mostRecent?.book_id ?? 'genesis';
  const fallbackPerson = BOOK_FALLBACK_PERSON[bookId];
  const category = BOOK_CATEGORY[bookId] ?? 'torah';

  // Fallback chain: book images → person images → category images
  const { images: bookImages } = useContentImages('book', bookId);
  const { images: personImages } = useContentImages('people', fallbackPerson);

  // Category fallback: Doré illustrations + historical maps by book category.
  // Shaped as ContentImage[] so the cycling/error logic downstream is unchanged.
  const categoryImages = useMemo<ContentImage[]>(() =>
    (CATEGORY_IMAGES[category] ?? []).map((img, i) => ({
      id: -(i + 1), // Negative IDs to avoid collision with real content_images
      content_type: 'fallback',
      content_id: category,
      url: img.url,
      caption: img.caption,
      credit: img.credit,
      display_order: i,
    })),
    [category],
  );

  // Use book images first, then person, then category
  const images: ContentImage[] = bookImages.length > 0
    ? bookImages
    : personImages.length > 0
      ? personImages
      : categoryImages;

  const hasImages = images.length > 0;

  // ── Image cycling (8s interval) ──────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasImages || images.length <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, CYCLE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasImages, images.length]);

  // Filter to images that haven't failed
  const validImages = hasImages
    ? images.filter((img) => !failedUrls.has(img.url))
    : [];
  const safeIndex = validImages.length > 0 ? activeIndex % validImages.length : 0;
  const currentImage = validImages.length > 0 ? validImages[safeIndex] : null;
  const showImages = currentImage !== null;

  // ── Display text ──────────────────────────────────────────
  const titleText = mostRecent
    ? `${mostRecent.book_name} · Chapter ${mostRecent.chapter_num}`
    : 'Begin Your Journey';
  const subtitleText = mostRecent
    ? mostRecent.title ?? 'Continue reading'
    : 'Start reading through Scripture';
  const ctaText = mostRecent ? 'Continue' : 'Genesis 1';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '14' }]}
      accessibilityRole="button"
      accessibilityLabel={`${titleText}: ${subtitleText}. Tap to ${ctaText.toLowerCase()}`}
    >
      {/* ── Image header ─── */}
      {showImages ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentImage.url }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="disk"
            transition={500}
            onError={() => setFailedUrls((prev) => new Set(prev).add(currentImage.url))}
            recyclingKey={currentImage.url}
          />
          {/* Gradient fade */}
          <View style={styles.gradient} />
          {/* Caption */}
          {currentImage.caption ? (
            <Text style={styles.caption} numberOfLines={1}>
              {currentImage.caption}
            </Text>
          ) : null}
          {/* Dot indicators */}
          {validImages.length > 1 && (
            <View style={styles.dots}>
              {validImages.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, {
                    backgroundColor: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.4)', // overlay-color: intentional
                  }]}
                />
              ))}
            </View>
          )}
        </View>
      ) : (
        /* Fallback: accent gradient strip */
        <View style={[styles.fallbackStrip, { backgroundColor: base.gold + '15' }]} />
      )}

      {/* ── Text area ─── */}
      <View style={styles.textArea}>
        <View style={styles.textLeft}>
          <Text style={[styles.title, { color: base.text }]} numberOfLines={1}>
            {titleText}
          </Text>
          <Text style={[styles.subtitle, { color: base.textDim }]} numberOfLines={1}>
            {subtitleText}
          </Text>
        </View>
        <View style={[styles.ctaButton, { backgroundColor: base.gold + '20', borderColor: base.gold + '40' }]}>
          <Text style={[styles.ctaText, { color: base.gold }]}>{ctaText}</Text>
          <ArrowRight size={13} color={base.gold} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  // Image section
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    // Card #1361: stronger gradient — taller (bottom 50% of the image) and
    // deeper shadow for a more dramatic fade-to-black into the text area.
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Math.round(IMAGE_HEIGHT * 0.5),
    backgroundColor: 'transparent',
    shadowColor: '#000', // overlay-color: intentional (RN shadow must be #000 on iOS)
    shadowOffset: { width: 0, height: -16 },
    shadowOpacity: 0.65,
    shadowRadius: 16,
  },
  caption: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    right: 30,
    color: '#fff', // overlay-color: intentional (caption on image)
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textShadowColor: 'rgba(0,0,0,0.8)', // overlay-color: intentional
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dots: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  // Fallback
  fallbackStrip: {
    width: '100%',
    height: 8,
  },
  // Text area
  textArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  textLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
  },
  subtitle: {
    // Card #1361: EB Garamond italic for the book/chapter subtitle
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  ctaText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
