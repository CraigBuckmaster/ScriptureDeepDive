/**
 * Feature flags for in-flight work that needs to ship behind a switch.
 *
 * These are compile-time constants on purpose — no remote config in this
 * codebase yet. Flipping a flag is a single-line PR + EAS Update.
 *
 * Add a comment per flag explaining what to verify before flipping.
 */
export const FEATURE_FLAGS = {
  /**
   * Enables Amicus-drafted synthesis at the end of guided study sessions.
   * Before flipping true, verify:
   *   - Epic #1446 (Amicus AI Study Partner) is past Phase 3 (chat working
   *     against the production worker).
   *   - The mode-specific system prompts in app/src/services/amicus/prompts/
   *     guidedStudy.ts have been reviewed.
   *   - Anthropic prompt caching is hitting on the system prompt (>80% cache
   *     rate observed in dev for at least 100 calls).
   * When false, premium users get the structured-form synthesis path.
   */
  GUIDED_STUDY_AMICUS_SYNTHESIS: false,
} as const;

/** Compile-time feature flag key (distinct from the env-driven EnvFeatureFlag). */
export type CompileFeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFlagEnabled(flag: CompileFeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
