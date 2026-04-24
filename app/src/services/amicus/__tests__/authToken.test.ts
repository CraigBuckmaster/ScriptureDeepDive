jest.mock('@/services/purchases', () => ({
  getPurchasesAppUserID: jest.fn(),
}));

import { getPurchasesAppUserID } from '@/services/purchases';
import { getAmicusAuthToken } from '@/services/amicus/authToken';

const mockGetPurchasesAppUserID = jest.mocked(getPurchasesAppUserID);

describe('getAmicusAuthToken', () => {
  const previousDevToken = process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN;
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN = previousDevToken;
  });

  it('prefers the RevenueCat app user id when available', async () => {
    mockGetPurchasesAppUserID.mockResolvedValue('rc_app_user_123456789');
    process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN = 'dev_token_123456789';

    await expect(getAmicusAuthToken()).resolves.toBe('rc_app_user_123456789');
  });

  it('falls back to the dev token when no RevenueCat id is available', async () => {
    mockGetPurchasesAppUserID.mockResolvedValue(null);
    process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN = 'dev_token_123456789';

    await expect(getAmicusAuthToken()).resolves.toBe('dev_token_123456789');
  });

  it('returns null when neither token source is available', async () => {
    mockGetPurchasesAppUserID.mockResolvedValue(null);

    await expect(getAmicusAuthToken()).resolves.toBeNull();
  });

  it('can disable the dev fallback explicitly', async () => {
    mockGetPurchasesAppUserID.mockResolvedValue(null);
    process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN = 'dev_token_123456789';

    await expect(getAmicusAuthToken({ allowDevFallback: false })).resolves.toBeNull();
  });
});
