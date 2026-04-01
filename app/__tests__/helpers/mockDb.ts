/**
 * Test helper — mock database utilities.
 *
 * Usage in tests:
 *   jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());
 */

export function createMockDb() {
  return {
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
    execAsync: jest.fn().mockResolvedValue(undefined),
    closeAsync: jest.fn().mockResolvedValue(undefined),
  };
}

const sharedMockDb = createMockDb();

/** Returns a module-shaped mock for jest.mock('@/db/database', ...) */
export function mockDatabaseModule() {
  return {
    getDb: () => sharedMockDb,
    initDatabase: jest.fn().mockResolvedValue(sharedMockDb),
  };
}

/** Get the shared mock db for setting up return values in tests */
export function getMockDb() {
  return sharedMockDb;
}

/** Reset all mock db functions */
export function resetMockDb() {
  Object.values(sharedMockDb).forEach((fn) => {
    if (typeof fn === 'function' && 'mockReset' in fn) {
      (fn as jest.Mock).mockReset();
      (fn as jest.Mock).mockResolvedValue(fn === sharedMockDb.getAllAsync ? [] : null);
    }
  });
  sharedMockDb.getAllAsync.mockResolvedValue([]);
  sharedMockDb.getFirstAsync.mockResolvedValue(null);
  sharedMockDb.runAsync.mockResolvedValue({ changes: 0 });
  sharedMockDb.execAsync.mockResolvedValue(undefined);
}
