import { ExportError } from '@/utils/exportData';

describe('ExportError', () => {
  it('is an instance of Error', () => {
    const err = new ExportError('nothing to export');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ExportError);
  });

  it('has the correct name and message', () => {
    const err = new ExportError('test message');
    expect(err.name).toBe('ExportError');
    expect(err.message).toBe('test message');
  });
});
