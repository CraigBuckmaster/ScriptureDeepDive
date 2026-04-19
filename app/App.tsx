import { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
  createNavigationContainerRef,
} from '@react-navigation/native';

import { FONT_MAP, ThemeProvider, useTheme } from './src/theme';
import { initDatabase } from './src/db/database';
import { initUserDatabase } from './src/db/userDatabase';
import { useSettingsStore, useAuthStore, usePremiumStore } from './src/stores';
import { pruneEvents } from './src/services/analytics';
import { checkAndScheduleReengagement } from './src/services/reengagement';
import { rescheduleIfStale } from './src/services/notifications';
import { syncPremiumStatus } from './src/services/purchases';
import { flushQueue } from './src/services/syncQueue';
import { RootNavigator } from './src/navigation';
import type { TabParamList } from './src/navigation/types';
import { useNotificationRouter } from './src/hooks/useNotificationRouter';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { closeAllTranslationDbs } from './src/db/translationManager';
import { ContentUpdateProvider } from './src/providers/ContentUpdateProvider';
import { AmicusConsentProvider } from './src/services/amicus/consent';
import { AmicusFabProvider } from './src/contexts/AmicusFabContext';
import AmicusFab from './src/components/amicus/AmicusFab';
import { DbDownloadScreen } from './src/screens/DbDownloadScreen';
import { Sentry, DSN, setSentryUser } from './src/lib/sentry';
import { getAnonymousId } from './src/utils/anonymousId';

/**
 * Root navigation ref — shared with non-component code (notification tap
 * handler) so taps can navigate without drilling props through the tree.
 */
const navigationRef = createNavigationContainerRef<TabParamList>();

// Keep splash visible while we load
SplashScreen.preventAutoHideAsync();

/** Deep linking configuration for scripture:// URLs.
 *
 * Supported links:
 *   scripture://chapter/genesis/1        → ChapterScreen
 *   scripture://chapter/john/3/16        → ChapterScreen (verse-level)
 *   scripture://scholar/spurgeon         → ScholarBio
 *   scripture://topic/covenant           → TopicDetail
 *   scripture://debate/predestination    → DebateDetail
 *   scripture://prophecy/messianic-line  → ProphecyDetail
 *   scripture://concept/atonement        → JourneyDetail (redirected)
 *   scripture://journey/garden-to-city   → JourneyDetail
 *   scripture://word-study/agape         → WordStudyDetail
 *   scripture://people/abraham           → GenealogyTree (person)
 *   scripture://map                      → Map
 *   scripture://timeline                 → Timeline
 *   scripture://amicus/new?q=…&ch=book/n → Amicus NewThread (seeded) — #1467
 */
const linking: any = {
  prefixes: ['scripture://'],
  config: {
    screens: {
      HomeTab: {
        screens: {
          Chapter: {
            path: 'chapter/:bookId/:chapterNum/:verseNum?',
            parse: {
              chapterNum: Number,
              verseNum: (v: string) => (v ? Number(v) : undefined),
            },
          },
        },
      },
      ReadTab: {
        screens: {
          BookList: 'books',
          ChapterList: 'book/:bookId',
        },
      },
      ExploreTab: {
        screens: {
          ScholarBio: 'scholar/:scholarId',
          TopicDetail: 'topic/:topicId',
          DebateDetail: 'debate/:topicId',
          ProphecyDetail: 'prophecy/:chainId',
          JourneyDetail: {
            path: 'journey/:journeyId',
            parse: { journeyId: String },
          },
          WordStudyDetail: 'word-study/:wordId',
          GenealogyTree: 'people/:personId',
          Map: 'map',
          Timeline: 'timeline',
        },
      },
      AmicusTab: {
        screens: {
          NewThread: {
            path: 'amicus/new',
            parse: {
              seedQuery: (v: string) => v,
              seedChapterRef: (v: string) => v,
            },
          },
        },
      },
    },
  },
};

/** Inner app shell — consumes theme context for nav theme + status bar. */
function AppShell() {
  const { base: themeBase, mode, statusBarStyle } = useTheme();

  // Install notification tap router (handles both cold-start and warm taps).
  useNotificationRouter(navigationRef);

  const navTheme = useMemo(() => {
    const baseTheme = mode === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: themeBase.bg,
        card: themeBase.bg,
        text: themeBase.text,
        border: themeBase.border,
        primary: themeBase.gold,
      },
    };
  }, [themeBase, mode]);

  return (
    <>
      <NavigationContainer ref={navigationRef} theme={navTheme} linking={linking}>
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      </NavigationContainer>
      <StatusBar style={statusBarStyle === 'light-content' ? 'light' : 'dark'} />
    </>
  );
}

function App() {
  const [fontsLoaded] = useFonts(FONT_MAP);
  const [dbStatus, setDbStatus] = useState<'loading' | 'needs_download' | 'ready'>('loading');

  useEffect(() => {
    async function hydrateAppState() {
      await initUserDatabase(); // User DB (user.db) — never replaced, migrated
      // Bind an anonymous identifier to Sentry so crashes from a single
      // install roll up under one user. Best-effort — if it fails we
      // just don't get per-user grouping this session.
      try {
        const anonId = await getAnonymousId();
        setSentryUser(anonId);
      } catch {
        /* non-fatal */
      }
      await useSettingsStore.getState().hydrate();
      await useAuthStore.getState().hydrate();
      await usePremiumStore.getState().hydrate();
      pruneEvents(90); // Clean up old analytics (fire-and-forget)
    }

    async function init() {
      try {
        // Lock to portrait by default — specific screens unlock for landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        const status = await initDatabase();   // Content DB (scripture.db) — may be missing on first launch
        if (status === 'needs_download') {
          setDbStatus('needs_download');
          return;
        }

        await hydrateAppState();
        setDbStatus(status);
      } catch (e) {
        console.error('Init error:', e);
        // Fail-safe: surface the download screen so the user can recover
        setDbStatus('needs_download');
      }
    }
    init();
  }, []);

  const dbReady = dbStatus === 'ready';

  // Re-engagement + premium sync + VOTD reschedule: check on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && dbReady) {
        checkAndScheduleReengagement();
        syncPremiumStatus();
        flushQueue(); // Sync any queued offline mutations
        rescheduleIfStale(); // Extend VOTD rolling window if a day has passed
      }
    });
    return () => sub.remove();
  }, [dbReady]);

  // Close supplemental translation DB connections when app goes to background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') closeAllTranslationDbs();
    });
    return () => sub.remove();
  }, []);

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded && dbStatus !== 'loading') {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbStatus]);

  if (!fontsLoaded || dbStatus === 'loading') {
    return (
      <View style={appStyles.splashContainer}>
        <ActivityIndicator color="#bfa050" size="large" />
        <Text style={appStyles.splashText}>Loading...</Text>
      </View>
    );
  }

  if (dbStatus === 'needs_download') {
    return (
      <GestureHandlerRootView style={appStyles.rootView} onLayout={onLayoutReady}>
        <SafeAreaProvider>
          <ThemeProvider>
            <DbDownloadScreen
              onComplete={async () => {
                // Open the freshly-downloaded DB before entering the app tree
                try {
                  const status = await initDatabase();
                  if (status !== 'ready') {
                    throw new Error('Downloaded DB did not initialize as ready');
                  }
                  await initUserDatabase();
                  try {
                    const anonId = await getAnonymousId();
                    setSentryUser(anonId);
                  } catch {
                    /* non-fatal */
                  }
                  await useSettingsStore.getState().hydrate();
                  await useAuthStore.getState().hydrate();
                  await usePremiumStore.getState().hydrate();
                  pruneEvents(90);
                  setDbStatus('ready');
                } catch (e) {
                  console.error('Post-download init error:', e);
                  // Keep user on download screen (with retry) if init failed.
                  throw e;
                }
              }}
            />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={appStyles.rootView} onLayout={onLayoutReady}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ContentUpdateProvider>
            <AmicusConsentProvider>
              <AmicusFabProvider>
                <AppShell />
                <AmicusFab />
              </AmicusFabProvider>
            </AmicusConsentProvider>
          </ContentUpdateProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default DSN && Sentry ? Sentry.wrap(App) : App;

const appStyles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0c0a07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    color: '#b8a888',
    marginTop: 12,
    fontSize: 12,
  },
  rootView: {
    flex: 1,
  },
});
