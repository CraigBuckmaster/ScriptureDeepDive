/**
 * Database layer tests for db/content/debates.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  getDebateTopics,
  getDebateTopic,
  getDebateTopicsForChapter,
  searchDebateTopics,
  getDebateTopicScholars,
} from '@/db/content/debates';

beforeEach(() => resetMockDb());

describe('getDebateTopics', () => {
  it('returns all topics with position_count', async () => {
    const topics = [
      { id: 'days', title: 'Days of Creation', position_count: 3 },
    ];
    getMockDb().getAllAsync.mockResolvedValue(topics);
    const result = await getDebateTopics();
    expect(result).toEqual(topics);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('debate_topics'),
    );
  });
});

describe('getDebateTopic', () => {
  it('returns a parsed topic with arrays', async () => {
    const row = {
      id: 'days',
      title: 'Days',
      category: 'theological',
      passage: 'Gen 1',
      context: 'Context',
      synthesis: 'Synthesis',
      chapters_json: '[1]',
      positions_json: '[{"name":"literal"}]',
      related_passages_json: '["Gen 2"]',
      tags_json: '["creation"]',
    };
    getMockDb().getFirstAsync.mockResolvedValue(row);
    const result = await getDebateTopic('days');
    expect(result).not.toBeNull();
    expect(result!.positions).toEqual([{ name: 'literal' }]);
    expect(result!.chapters).toEqual([1]);
    expect(result!.tags).toEqual(['creation']);
  });

  it('returns null when not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    expect(await getDebateTopic('missing')).toBeNull();
  });
});

describe('getDebateTopicsForChapter', () => {
  it('queries by book_id and chapter pattern', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await getDebateTopicsForChapter('genesis', 1);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('book_id = ?'),
      expect.arrayContaining(['genesis']),
    );
  });
});

describe('searchDebateTopics', () => {
  it('searches title, question, and tags', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await searchDebateTopics('creation');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('LIKE'),
      expect.any(Array),
    );
  });
});

describe('getDebateTopicScholars', () => {
  it('returns scholars linked to a topic', async () => {
    const scholars = [{ id: 'wright', name: 'N.T. Wright' }];
    getMockDb().getAllAsync.mockResolvedValue(scholars);
    const result = await getDebateTopicScholars('days');
    expect(result).toEqual(scholars);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('debate_topic_scholars'),
      ['days'],
    );
  });
});
