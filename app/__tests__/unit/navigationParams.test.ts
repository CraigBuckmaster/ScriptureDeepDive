/**
 * Tests for navigation parameter correctness.
 *
 * Bug: "Explore the Covenant" passed { id: 'covenant' } but
 * ConceptDetailScreen expects { conceptId }. Word study link
 * passed { id: wsId } but WordStudyDetailScreen expects { wordId }.
 * Fix: Corrected param key names.
 */

jest.mock('@/db/user', () => ({
  getRecentChapters: jest.fn().mockResolvedValue([]),
  getBookmarkedChapters: jest.fn().mockResolvedValue([]),
  getAllNotes: jest.fn().mockResolvedValue([]),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/content', () => ({
  getBooks: jest.fn().mockResolvedValue([]),
  getLiveBooks: jest.fn().mockResolvedValue([]),
  getBookIntro: jest.fn().mockResolvedValue(null),
}));

describe('navigation parameter names', () => {
  it('useRecommendations uses conceptId (not id) for ConceptDetail', () => {
    // Read the source file and verify the param name
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/hooks/useRecommendations.ts'),
      'utf-8'
    );

    // Should contain conceptId, not bare id
    expect(source).toContain("params: { conceptId: 'covenant' }");
    expect(source).not.toContain("params: { id: 'covenant' }");
  });

  it('ChapterScreen uses wordId (not id) for WordStudyDetail', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/screens/ChapterScreen.tsx'),
      'utf-8'
    );

    // Should use wordId param
    expect(source).toContain('params: { wordId: wsId }');
    expect(source).not.toContain("screen: 'WordStudyDetail', params: { id:");
  });
});
