jest.unmock('@/utils/logger');
import { logger, safeParse } from '@/utils/logger';

describe('logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('info logs in dev mode', () => {
    logger.info('TEST', 'hello');
    // In test environment __DEV__ is true
    expect(console.log).toHaveBeenCalled();
  });

  it('warn always logs', () => {
    logger.warn('TEST', 'warning');
    expect(console.warn).toHaveBeenCalled();
  });

  it('error always logs', () => {
    logger.error('TEST', 'bad things', new Error('fail'));
    expect(console.error).toHaveBeenCalled();
  });
});

describe('safeParse', () => {
  it('parses valid JSON', () => {
    expect(safeParse('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns fallback for null input', () => {
    expect(safeParse(null, [])).toEqual([]);
  });

  it('returns fallback for undefined input', () => {
    expect(safeParse(undefined, 'default')).toBe('default');
  });

  it('returns fallback for invalid JSON', () => {
    jest.spyOn(console, 'warn').mockImplementation();
    expect(safeParse('{bad', 42)).toBe(42);
  });

  it('parses a JSON array', () => {
    expect(safeParse('[1,2,3]', [])).toEqual([1, 2, 3]);
  });
});
