/**
 * Escape LIKE wildcards in a string for safe use in SQL LIKE patterns.
 * Use with `ESCAPE '\'` clause in the query.
 */
export function escapeLike(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}
