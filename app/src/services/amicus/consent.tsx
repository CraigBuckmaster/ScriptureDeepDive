/**
 * services/amicus/consent.ts — First-use consent storage + a tiny React
 * context provider that exposes `requestAmicusConsent()` as a promise.
 *
 * The provider mounts AmicusFirstUseModal once anywhere in the tree; any
 * screen inside the provider can await consent before calling the proxy.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import AmicusFirstUseModal from '../../components/amicus/AmicusFirstUseModal';
import { getPreference } from '../../db/userQueries';
import { setPreference } from '../../db/userMutations';
import { logger } from '../../utils/logger';

export const AMICUS_OPT_IN_KEY = 'amicus_opt_in_accepted_at';

export async function hasAcceptedAmicusOptIn(): Promise<boolean> {
  const value = await getPreference(AMICUS_OPT_IN_KEY);
  return typeof value === 'string' && value.length > 0;
}

export async function acceptAmicusOptIn(): Promise<void> {
  await setPreference(AMICUS_OPT_IN_KEY, new Date().toISOString());
  logger.info('Amicus', 'opt-in accepted');
}

export async function resetAmicusOptIn(): Promise<void> {
  await setPreference(AMICUS_OPT_IN_KEY, '');
  logger.info('Amicus', 'opt-in reset');
}

// ── React context ────────────────────────────────────────────────────

interface ConsentContextValue {
  /** Returns `true` if consent was just accepted (or was already on file). */
  requestAmicusConsent: () => Promise<boolean>;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

interface PendingRequest {
  resolve: (accepted: boolean) => void;
}

export function AmicusConsentProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [visible, setVisible] = useState(false);
  const pendingRef = useRef<PendingRequest | null>(null);

  const handleAccept = useCallback(async () => {
    setVisible(false);
    try {
      await acceptAmicusOptIn();
    } catch (err) {
      logger.error('Amicus', 'opt-in write failed', err);
    }
    pendingRef.current?.resolve(true);
    pendingRef.current = null;
  }, []);

  const handleDecline = useCallback(() => {
    setVisible(false);
    pendingRef.current?.resolve(false);
    pendingRef.current = null;
  }, []);

  const requestAmicusConsent = useCallback(async (): Promise<boolean> => {
    if (await hasAcceptedAmicusOptIn()) return true;
    return new Promise((resolve) => {
      pendingRef.current?.resolve(false);
      pendingRef.current = { resolve };
      setVisible(true);
    });
  }, []);

  const ctx = useMemo<ConsentContextValue>(
    () => ({ requestAmicusConsent }),
    [requestAmicusConsent],
  );

  return (
    <ConsentContext.Provider value={ctx}>
      {children}
      <AmicusFirstUseModal
        visible={visible}
        onAccept={() => void handleAccept()}
        onDecline={handleDecline}
      />
    </ConsentContext.Provider>
  );
}

export function useAmicusConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    // A safe fallback means an over-cautious consent flow rather than a
    // crash when the provider isn't mounted (e.g. in test harnesses).
    return {
      requestAmicusConsent: async () => hasAcceptedAmicusOptIn(),
    };
  }
  return ctx;
}
