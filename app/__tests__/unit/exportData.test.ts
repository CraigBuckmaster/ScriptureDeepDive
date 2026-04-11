import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ExportError, exportStudyData } from '@/utils/exportData';
import { getUserDb } from '@/db/userDatabase';

jest.mock('@/db/userDatabase', () => ({
  getUserDb: jest.fn(),
}));

const mockGetAllAsync = jest.fn();
const mockDb = { getAllAsync: mockGetAllAsync };
(getUserDb as jest.Mock).mockReturnValue(mockDb);

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

describe('exportStudyData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserDb as jest.Mock).mockReturnValue(mockDb);
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (FileSystem as any).cacheDirectory = '/fake/cache/';
  });

  it('queries 4 tables, writes JSON, and shares the file', async () => {
    mockGetAllAsync
      .mockResolvedValueOnce([{ id: 1, verse_ref: 'Gen 1:1', note_text: 'note', tags_json: null, collection_id: null, created_at: null, updated_at: null }]) // notes
      .mockResolvedValueOnce([{ id: 1, verse_ref: 'Gen 1:1', label: null, created_at: null }]) // bookmarks
      .mockResolvedValueOnce([{ id: 1, verse_ref: 'Gen 1:1', color: '#ff0', created_at: null }]) // highlights
      .mockResolvedValueOnce([]); // collections

    const result = await exportStudyData();

    expect(result).toBe(true);
    expect(mockGetAllAsync).toHaveBeenCalledTimes(4);
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);
    expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
  });

  it('throws ExportError with "Nothing to export" when no notes, bookmarks, or highlights', async () => {
    mockGetAllAsync.mockResolvedValue([]);

    await expect(exportStudyData()).rejects.toThrow(/Nothing to export/);
  });

  it('throws ExportError with "Sharing is not available" when sharing unavailable', async () => {
    mockGetAllAsync
      .mockResolvedValueOnce([{ id: 1, verse_ref: 'Gen 1:1', note_text: 'n', tags_json: null, collection_id: null, created_at: null, updated_at: null }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

    await expect(exportStudyData()).rejects.toThrow(/Sharing is not available/);
  });

  it('file name contains date stamp in YYYY-MM-DD format', async () => {
    mockGetAllAsync
      .mockResolvedValueOnce([{ id: 1, verse_ref: 'Gen 1:1', note_text: 'n', tags_json: null, collection_id: null, created_at: null, updated_at: null }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await exportStudyData();

    const writeCall = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
    const filePath: string = writeCall[0];
    // Should match companion-study-export-YYYY-MM-DD.json
    expect(filePath).toMatch(/companion-study-export-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
