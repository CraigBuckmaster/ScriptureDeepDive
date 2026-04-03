/**
 * db/content/grammar.ts — Grammar article queries.
 */

import { getDb } from '../database';
import type { GrammarArticle } from '../../types';

export async function getGrammarArticle(id: string): Promise<GrammarArticle | null> {
  return getDb().getFirstAsync<GrammarArticle>(
    'SELECT * FROM grammar_articles WHERE id = ?',
    [id]
  );
}

export async function getGrammarArticles(
  language?: string,
  category?: string,
): Promise<GrammarArticle[]> {
  if (language && category) {
    return getDb().getAllAsync<GrammarArticle>(
      'SELECT * FROM grammar_articles WHERE language = ? AND category = ? ORDER BY display_order',
      [language, category]
    );
  }
  if (language) {
    return getDb().getAllAsync<GrammarArticle>(
      'SELECT * FROM grammar_articles WHERE language = ? ORDER BY display_order',
      [language]
    );
  }
  if (category) {
    return getDb().getAllAsync<GrammarArticle>(
      'SELECT * FROM grammar_articles WHERE category = ? ORDER BY display_order',
      [category]
    );
  }
  return getDb().getAllAsync<GrammarArticle>(
    'SELECT * FROM grammar_articles ORDER BY display_order'
  );
}

export async function searchGrammarArticles(query: string): Promise<GrammarArticle[]> {
  return getDb().getAllAsync<GrammarArticle>(
    `SELECT * FROM grammar_articles
     WHERE title LIKE ? OR summary LIKE ? OR body LIKE ?
     ORDER BY display_order
     LIMIT 30`,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );
}
