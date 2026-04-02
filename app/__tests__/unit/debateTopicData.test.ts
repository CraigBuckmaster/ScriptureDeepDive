import * as fs from 'fs';
import * as path from 'path';

const VALID_CATEGORIES = ['theological', 'ethical', 'historical', 'textual', 'interpretive'];
const VALID_FAMILIES = ['evangelical', 'critical', 'reformed', 'catholic', 'jewish', 'patristic'];

describe('debate-topics.json integrity', () => {
  let topics: any[];

  beforeAll(() => {
    const filePath = path.resolve(__dirname, '../../../content/meta/debate-topics.json');
    if (!fs.existsSync(filePath)) {
      topics = [];
      return;
    }
    topics = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  });

  it('has debate topics', () => {
    expect(topics.length).toBeGreaterThanOrEqual(10);
  });

  it('every topic has required fields', () => {
    for (const t of topics) {
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(t.book_id).toBeTruthy();
      expect(t.question).toBeTruthy();
      expect(t.positions).toBeInstanceOf(Array);
      expect(t.positions.length).toBeGreaterThan(0);
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

  it('every position has id, label, and argument', () => {
    for (const t of topics) {
      for (const p of t.positions) {
        expect(p.id).toBeTruthy();
        expect(p.label).toBeTruthy();
        expect(p.argument).toBeDefined();
      }
    }
  });

  it('every position has a valid tradition_family', () => {
    for (const t of topics) {
      for (const p of t.positions) {
        expect(VALID_FAMILIES).toContain(p.tradition_family);
      }
    }
  });
});
