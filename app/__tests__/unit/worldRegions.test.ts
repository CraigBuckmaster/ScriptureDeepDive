import {
  WORLD_REGIONS,
  WORLD_REGION_KEYS,
  resolveRegion,
} from '@/utils/worldRegions';

describe('resolveRegion', () => {
  it('returns the egypt def for "egypt"', () => {
    const def = resolveRegion('egypt');
    expect(def).not.toBeNull();
    expect(def?.key).toBe('egypt');
    expect(def?.label).toBe('Egypt');
    expect(def?.color).toBe('#c8a04f');
    expect(def?.icon).toBeDefined();
  });

  it('is case-sensitive — "Egypt" returns null', () => {
    expect(resolveRegion('Egypt')).toBeNull();
  });

  it('returns null for null', () => {
    expect(resolveRegion(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(resolveRegion(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(resolveRegion('')).toBeNull();
  });

  it('returns null for unknown keys', () => {
    expect(resolveRegion('atlantis')).toBeNull();
  });

  it('resolves every WORLD_REGION_KEYS entry', () => {
    for (const key of WORLD_REGION_KEYS) {
      const def = resolveRegion(key);
      expect(def).not.toBeNull();
      expect(def?.key).toBe(key);
    }
  });
});

describe('WORLD_REGIONS taxonomy', () => {
  it('contains the initial six regions from #1809', () => {
    expect(Object.keys(WORLD_REGIONS).sort()).toEqual([
      'egypt',
      'greece',
      'levant',
      'mesopotamia',
      'persia',
      'rome',
    ]);
  });

  it('every region has a label, color, key, and icon', () => {
    for (const def of Object.values(WORLD_REGIONS)) {
      expect(typeof def.key).toBe('string');
      expect(typeof def.label).toBe('string');
      expect(def.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(def.icon).toBeDefined();
    }
  });
});
