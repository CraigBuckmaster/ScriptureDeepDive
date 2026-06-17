import { getPurchasesAppUserID } from '@/services/purchases';
import { logger } from '@/utils/logger';

const MIN_TOKEN_LENGTH = 16;

export interface GetAmicusAuthTokenOptions {
  allowDevFallback?: boolean;
}

function normalizeToken(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length >= MIN_TOKEN_LENGTH ? trimmed : null;
}

export async function getAmicusAuthToken(
  opts: GetAmicusAuthTokenOptions = {},
): Promise<string | null> {
  const appUserID = normalizeToken(await getPurchasesAppUserID());
  if (appUserID) return appUserID;

  if (opts.allowDevFallback === false) return null;

  // The dev-token fallback is honored ONLY in development. EXPO_PUBLIC_* vars
  // are inlined into the shipped JS bundle, so honoring it in a production build
  // would embed a shared proxy token in every install.
  if (__DEV__) {
    const devToken = normalizeToken(process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN);
    if (devToken) {
      logger.info('AmicusAuth', 'using dev auth token fallback');
      return devToken;
    }
  }

  return null;
}
