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

  const devToken = normalizeToken(process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN);
  if (devToken) {
    // Only log the dev fallback in development. If EXPO_PUBLIC_AMICUS_DEV_TOKEN
    // is accidentally set on a production build (EXPO_PUBLIC_* vars are
    // inlined into the shipped bundle) we still honor the token silently
    // rather than revealing the fallback in production logs.
    if (__DEV__) {
      logger.info('AmicusAuth', 'using dev auth token fallback');
    }
    return devToken;
  }

  return null;
}
