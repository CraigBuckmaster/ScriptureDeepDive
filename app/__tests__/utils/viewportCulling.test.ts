import {
  getViewportBounds,
  isPointInViewport,
  isLinkInViewport,
} from '@/utils/viewportCulling';

describe('getViewportBounds', () => {
  it('returns a screen-sized rectangle in world space at zoom 1', () => {
    const bounds = getViewportBounds(0, 0, 400, 800, 1, 0);
    expect(bounds).toEqual({ left: 0, right: 400, top: 0, bottom: 800 });
  });

  it('scales the viewport down with higher zoom', () => {
    const bounds = getViewportBounds(0, 0, 400, 800, 2, 0);
    expect(bounds.right).toBe(200);
    expect(bounds.bottom).toBe(400);
  });

  it('scales the viewport up with lower zoom', () => {
    const bounds = getViewportBounds(0, 0, 400, 800, 0.5, 0);
    expect(bounds.right).toBe(800);
    expect(bounds.bottom).toBe(1600);
  });

  it('applies the margin on all four sides', () => {
    const bounds = getViewportBounds(100, 200, 400, 800, 1, 50);
    expect(bounds).toEqual({ left: 50, right: 550, top: 150, bottom: 1050 });
  });

  it('handles a zero/negative zoom by treating it as 1', () => {
    const bounds = getViewportBounds(0, 0, 400, 800, 0, 0);
    expect(bounds.right).toBe(400);
    expect(bounds.bottom).toBe(800);
  });
});

describe('isPointInViewport', () => {
  const bounds = { left: 0, right: 100, top: 0, bottom: 200 };

  it('returns true for points inside the box', () => {
    expect(isPointInViewport(50, 50, bounds)).toBe(true);
  });

  it('includes the edges of the box', () => {
    expect(isPointInViewport(0, 0, bounds)).toBe(true);
    expect(isPointInViewport(100, 200, bounds)).toBe(true);
  });

  it('rejects points outside the box', () => {
    expect(isPointInViewport(-1, 50, bounds)).toBe(false);
    expect(isPointInViewport(101, 50, bounds)).toBe(false);
    expect(isPointInViewport(50, -1, bounds)).toBe(false);
    expect(isPointInViewport(50, 201, bounds)).toBe(false);
  });
});

describe('isLinkInViewport', () => {
  const bounds = { left: 0, right: 100, top: 0, bottom: 200 };

  it('returns true when either endpoint is inside', () => {
    expect(isLinkInViewport({ x: 50, y: 50 }, { x: 500, y: 500 }, bounds)).toBe(true);
    expect(isLinkInViewport({ x: 500, y: 500 }, { x: 50, y: 50 }, bounds)).toBe(true);
  });

  it('returns false when both endpoints are outside', () => {
    expect(isLinkInViewport({ x: 500, y: 500 }, { x: 600, y: 600 }, bounds)).toBe(false);
  });
});
