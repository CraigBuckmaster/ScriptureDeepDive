/**
 * Test helper — mock user database utilities.
 *
 * Usage in tests:
 *   jest.mock('@/db/userDatabase', () => require('../helpers/mockUserDb').mockUserDatabaseModule());
 */

export function createMockUserDb() {
  return {
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
    execAsync: jest.fn().mockResolvedValue(undefined),
    closeAsync: jest.fn().mockResolvedValue(undefined),
    withTransactionAsync: jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb()),
  };
}

const sharedMockUserDb = createMockUserDb();

/** Returns a module-shaped mock for jest.mock('@/db/userDatabase', ...) */
export function mockUserDatabaseModule() {
  return {
    getUserDb: () => sharedMockUserDb,
    initUserDatabase: jest.fn().mockResolvedValue(sharedMockUserDb),
  };
}

/** Get the shared mock user db for setting up return values in tests */
export function getMockUserDb() {
  return sharedMockUserDb;
}

/** Reset all mock user db functions */
export function resetMockUserDb() {
  sharedMockUserDb.getAllAsync.mockReset().mockResolvedValue([]);
  sharedMockUserDb.getFirstAsync.mockReset().mockResolvedValue(null);
  sharedMockUserDb.runAsync.mockReset().mockResolvedValue({ changes: 0 });
  sharedMockUserDb.execAsync.mockReset().mockResolvedValue(undefined);
  sharedMockUserDb.closeAsync.mockReset().mockResolvedValue(undefined);
  sharedMockUserDb.withTransactionAsync
    .mockReset()
    .mockImplementation(async (cb: () => Promise<void>) => cb());
}
