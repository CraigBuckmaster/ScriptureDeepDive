import {
  COVENANT_WAYPOINTS,
  getCovenantWaypoint,
} from '@/utils/covenantWaypoints';

describe('COVENANT_WAYPOINTS', () => {
  it('starts with Adam (protoevangelium) and ends with Jesus (fulfilled)', () => {
    expect(COVENANT_WAYPOINTS[0].personId).toBe('adam');
    expect(COVENANT_WAYPOINTS[COVENANT_WAYPOINTS.length - 1].personId).toBe('jesus');
  });

  it('includes the 7 expected covenant figures', () => {
    const ids = COVENANT_WAYPOINTS.map((w) => w.personId);
    ['adam', 'noah', 'abraham', 'judah', 'david', 'zerubbabel', 'jesus'].forEach((id) =>
      expect(ids).toContain(id),
    );
  });

  it('has unique person ids', () => {
    const ids = COVENANT_WAYPOINTS.map((w) => w.personId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getCovenantWaypoint', () => {
  it('returns the waypoint for a known id', () => {
    const w = getCovenantWaypoint('abraham');
    expect(w?.ref).toBe('Gen 12:3');
  });

  it('returns null for unknown ids', () => {
    expect(getCovenantWaypoint('cain')).toBeNull();
  });

  it('returns null for null/undefined/empty', () => {
    expect(getCovenantWaypoint(null)).toBeNull();
    expect(getCovenantWaypoint(undefined)).toBeNull();
    expect(getCovenantWaypoint('')).toBeNull();
  });
});
