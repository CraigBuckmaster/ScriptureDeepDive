/**
 * services/amicus/profile/templates.ts — Prose assembly from signals.
 *
 * Each section is optional and is added only when its signal is meaningful.
 * For thin profiles (new users) the output is deliberately minimal so that
 * Amicus does not over-personalize based on scant data.
 */
import { SCHOLAR_ENGAGEMENT_FLOOR } from './signals';
import type { RawSignals } from './types';

const TRADITION_THRESHOLD = 0.3;
const MAX_PROSE_CHARS = 800; // hard upper bound; ~200 tokens at 4 chars/token

interface AssembledPieces {
  prose: string;
  preferred_scholars: string[];
  preferred_traditions: string[];
}

export function assembleProfile(signals: RawSignals): AssembledPieces {
  const sentences: string[] = [];
  const preferredScholars: string[] = [];
  const preferredTraditions: string[] = [];

  // Thin profile path
  if (signals.total_chapters_read === 0) {
    sentences.push(
      'New to Companion Study; no established study patterns yet.',
    );
    if (signals.recent_chapters.length > 0) {
      const r = signals.recent_chapters[0]!;
      sentences.push(`Currently reading ${capitalize(r.book_id)} ${r.chapter_num}.`);
    }
    return {
      prose: truncate(sentences.join(' ')),
      preferred_scholars: [],
      preferred_traditions: [],
    };
  }

  // 1. Baseline
  sentences.push(`Studied ${signals.total_chapters_read} chapters total.`);

  // 2. Recent focus
  if (signals.current_focus) {
    sentences.push(
      `Recently focused on ${capitalize(signals.current_focus.book_id)}` +
        ` (${signals.current_focus.chapters_in_range} chapters in the last` +
        ` ${signals.current_focus.days_in_range} days).`,
    );
  }

  // 3. Scholar affinity
  const meaningfulScholars = signals.top_scholars_opened.filter(
    (s) => s.open_count >= SCHOLAR_ENGAGEMENT_FLOOR,
  );
  if (meaningfulScholars.length > 0) {
    const top2 = meaningfulScholars.slice(0, 2).map((s) => s.scholar_id);
    sentences.push(
      `Engages deeply with ${top2.map(capitalize).join(' and ')}.`,
    );
    preferredScholars.push(...meaningfulScholars.map((s) => s.scholar_id));
  }

  // 4. Tradition lean
  const topTradition = pickTopTradition(signals.tradition_distribution);
  if (topTradition) {
    sentences.push(
      `Shows interest in ${topTradition.name} perspectives.`,
    );
    preferredTraditions.push(topTradition.name);
  }

  // 5. Journey state
  if (signals.completed_journeys.length > 0 || signals.active_journey) {
    const parts: string[] = [];
    if (signals.completed_journeys.length > 0) {
      const names = signals.completed_journeys.slice(-2).map(capitalize).join(' and ');
      parts.push(`Completed ${names}`);
    }
    if (signals.active_journey) {
      parts.push(`currently on ${capitalize(signals.active_journey)}`);
    }
    sentences.push(parts.join(', ') + '.');
  }

  // 6. Current position (only if within last 24h)
  const newest = signals.recent_chapters[0];
  if (newest && isWithin24h(newest.last_visit)) {
    sentences.push(
      `Currently reading ${capitalize(newest.book_id)} ${newest.chapter_num}.`,
    );
  }

  return {
    prose: truncate(sentences.join(' ')),
    preferred_scholars: preferredScholars,
    preferred_traditions: preferredTraditions,
  };
}

function pickTopTradition(
  distribution: Record<string, number>,
): { name: string; share: number } | null {
  let best: { name: string; share: number } | null = null;
  for (const [name, share] of Object.entries(distribution)) {
    if (share < TRADITION_THRESHOLD) continue;
    if (!best || share > best.share) {
      best = { name, share };
    }
  }
  return best;
}

function capitalize(s: string): string {
  return s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function isWithin24h(iso: string): boolean {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t < 24 * 60 * 60 * 1000;
}

function truncate(s: string): string {
  if (s.length <= MAX_PROSE_CHARS) return s;
  return s.slice(0, MAX_PROSE_CHARS - 1).replace(/\s\S*$/, '') + '…';
}

export { MAX_PROSE_CHARS };
