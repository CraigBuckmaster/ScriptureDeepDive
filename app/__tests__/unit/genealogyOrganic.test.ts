import {
  bezierPath,
  getLinkWeight,
  applyTribalBloom,
} from '@/utils/genealogyOrganic';
import type { Person } from '@/types';

function person(overrides: Partial<Person> = {}): Person {
  return {
    id: 'p',
    name: 'P',
    gender: null,
    father: null,
    mother: null,
    spouse_of: null,
    era: null,
    dates: null,
    role: null,
    type: null,
    bio: null,
    scripture_role: null,
    refs_json: null,
    chapter_link: null,
    associated_with: null,
    association_type: null,
    ...overrides,
  };
}

describe('bezierPath', () => {
  it('produces a valid SVG cubic Bezier path', () => {
    const path = bezierPath({ x: 0, y: 0 }, { x: 100, y: 200 });
    expect(path).toBe('M 0 0 C 0 100, 100 100, 100 200');
  });

  it('computes the midpoint symmetrically', () => {
    const path = bezierPath({ x: 10, y: 10 }, { x: 30, y: 50 });
    expect(path).toMatch(/C 10 30, 30 30, 30 50/);
  });
});

describe('getLinkWeight', () => {
  const parent = person({ id: 'parent' });
  const child = person({ id: 'child' });

  it('messianic links get the thickest gold stroke with glow', () => {
    const style = getLinkWeight(parent, child, true);
    expect(style).toEqual({ width: 2.5, color: 'gold', opacity: 0.35, glow: true });
  });

  it('privileged-role parents get medium weight', () => {
    const style = getLinkWeight(person({ role: 'king' }), child, false);
    expect(style.width).toBe(1.5);
    expect(style.glow).toBe(false);
  });

  it('children with bios get light weight', () => {
    const style = getLinkWeight(parent, person({ bio: 'Notable.' }), false);
    expect(style.width).toBe(1.2);
  });

  it('default links are the thinnest', () => {
    const style = getLinkWeight(parent, child, false);
    expect(style.width).toBe(0.8);
    expect(style.opacity).toBe(0.12);
  });
});

describe('applyTribalBloom', () => {
  it('returns an empty array when there are no children', () => {
    expect(applyTribalBloom({ x: 0, y: 0 }, [])).toEqual([]);
  });

  it('places a single child directly below the centre', () => {
    const [out] = applyTribalBloom({ x: 0, y: 0 }, [{ id: 'a', x: 0, y: 0 }], {
      radius: 100,
    });
    expect(out.x).toBe(0);
    expect(out.y).toBe(100);
  });

  it('fans children across the configured angle range', () => {
    const out = applyTribalBloom(
      { x: 0, y: 0 },
      [1, 2, 3].map((i) => ({ id: String(i), x: 0, y: 0 })),
      { radius: 100, startAngleDegrees: -60, endAngleDegrees: 60 },
    );
    // First child pushes left of centre, last pushes right.
    expect(out[0].x).toBeLessThan(0);
    expect(out[2].x).toBeGreaterThan(0);
    // Middle child sits on the axis.
    expect(Math.abs(out[1].x)).toBeLessThan(1e-6);
  });

  it('does not mutate the input array', () => {
    const input = [{ id: 'a', x: 0, y: 0 }];
    const snapshot = JSON.parse(JSON.stringify(input));
    applyTribalBloom({ x: 10, y: 10 }, input);
    expect(input).toEqual(snapshot);
  });
});
