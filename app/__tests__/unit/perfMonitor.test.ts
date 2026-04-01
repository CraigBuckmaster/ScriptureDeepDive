import { markStart, markEnd, printTargets } from '@/utils/perfMonitor';

describe('perfMonitor', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('markEnd returns elapsed ms after markStart', () => {
    markStart('test-op');
    const elapsed = markEnd('test-op');
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });

  it('markEnd returns -1 for unknown label', () => {
    const elapsed = markEnd('never-started');
    expect(elapsed).toBe(-1);
  });

  it('printTargets does not throw', () => {
    expect(() => printTargets()).not.toThrow();
  });
});
