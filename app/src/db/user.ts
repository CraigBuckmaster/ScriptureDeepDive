/**
 * db/user.ts — Barrel re-export for backward compatibility.
 *
 * Implementation split into:
 *   - userQueries.ts  (read-only query functions)
 *   - userMutations.ts (write/mutation functions)
 */

export * from './userQueries';
export * from './userMutations';
