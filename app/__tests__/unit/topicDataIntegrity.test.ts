import * as fs from 'fs';
import * as path from 'path';

const VALID_CATEGORIES = [
  'theology', 'character', 'sin', 'relationships',
  'worship', 'living', 'church', 'eschatology', 'creation', 'identity',
];

describe('topics.json integrity', () => {
  let topics: any[];

  beforeAll(() => {
    const filePath = path.resolve(__dirname, '../../../content/meta/topics.json');
    if (!fs.existsSync(filePath)) {
      topics = [];
      return;
    }
    topics = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  });

  it('has at least 5 topics (guard against empty)', () => {
    expect(topics.length).toBeGreaterThanOrEqual(5);
  });

  it('every topic has required fields', () => {
    for (const t of topics) {
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.tags).toBeInstanceOf(Array);
      expect(t.subtopics).toBeInstanceOf(Array);
    }
  });

  it('every topic has a valid category', () => {
    for (const t of topics) {
      expect(VALID_CATEGORIES).toContain(t.category);
    }
  });

  it('no duplicate IDs', () => {
    const ids = topics.map((t: any) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every subtopic has a label and verses array', () => {
    for (const t of topics) {
      for (const st of t.subtopics) {
        expect(st.label).toBeTruthy();
        expect(st.verses).toBeInstanceOf(Array);
        expect(st.verses.length).toBeGreaterThan(0);
      }
    }
  });

  it('every verse has ref and text fields', () => {
    for (const t of topics) {
      for (const st of t.subtopics) {
        for (const v of st.verses) {
          expect(v.ref).toBeTruthy();
          expect(v.text).toBeTruthy();
        }
      }
    }
  });
});
