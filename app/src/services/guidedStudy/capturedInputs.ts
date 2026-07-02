import { logger } from '@/utils/logger';

export interface SynthesisDraft {
  takeaway: string;
  open_question: string;
  key_connection: string;
}

export interface PanelOpenedRecord {
  panel_type: string;
  section_num?: number;
  opened_at_ms: number;
}

export interface CapturedInputs {
  scene?: {
    genre_response?: string;
    /** Teaching mode: who you're teaching. */
    audience?: string;
    /** Teaching mode: sermon / small group / classroom / one-on-one. */
    setting?: string;
    /** Devotional mode: what the user brought into the chapter. */
    arrival?: string;
    concepts?: string[];
  };
  observe?: {
    /** Quick mode "one thing"; devotional mode "word/phrase/image". */
    primary?: string;
    /** Deep mode. */
    surprises?: string;
    /** Deep mode. */
    confusions?: string;
    /** Deep mode. */
    repetitions?: string;
    /** Teaching mode. */
    main_point?: string;
    /** Teaching mode. */
    clarification?: string;
    /** Any mode — free-form additional questions. */
    questions?: string[];
  };
  explore?: {
    panels_opened: PanelOpenedRecord[];
    most_helpful_panel_type?: string;
  };
  synthesize?: SynthesisDraft;
  review?: {
    artifact_generated?: boolean;
    next_chapter_accepted?: boolean;
  };
  /**
   * Observation-chip selections (#1839) — chip labels the user marked
   * on the Observe step. Additive: absent in pre-#1839 stored JSON,
   * which safeParseCapturedInputs tolerates by design.
   */
  observeSelections?: string[];
}

export function emptyCapturedInputs(): CapturedInputs {
  return {};
}

export function safeParseCapturedInputs(json: string | null | undefined): CapturedInputs {
  if (json == null || json === '') return emptyCapturedInputs();
  try {
    const parsed = JSON.parse(json) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as CapturedInputs;
    }
    logger.warn('GuidedStudy', 'CapturedInputs JSON is not an object', { json });
    return emptyCapturedInputs();
  } catch (err) {
    logger.warn('GuidedStudy', 'parse failed', err);
    return emptyCapturedInputs();
  }
}

export function serializeCapturedInputs(inputs: CapturedInputs): string {
  return JSON.stringify(inputs);
}

export type SynthesisStrategyKind = 'free' | 'premium_structured' | 'premium_amicus';
