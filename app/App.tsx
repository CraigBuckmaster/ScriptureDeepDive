import { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';

import { FONT_MAP, ThemeProvider, useTheme } from './src/theme';
import { initDatabase } from './src/db/database';
import { initUserDatabase } from './src/db/userDatabase';
import { useSettingsStore, useAuthStore, usePremiumStore } from './src/stores';
import { pruneEvents } from './src/services/analytics';
import { checkAndScheduleReengagement } from './src/services/reengagement';
import { syncPremiumStatus } from './src/services/purchases';
import { startMonitoring } from './src/services/connectivity';
import { flushQueue } from './src/services/syncQueue';
import ConnectivityBanner from './src/components/ConnectivityBanner';
import { RootNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { closeAllTranslationDbs } from './src/db/translationManager';
import { ContentUpdateProvider } from './src/providers/ContentUpdateProvider';

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
 *   scripture://concept/atonement        → ConceptDetail
 *   scripture://word-study/agape         → WordStudyDetail
 *   scripture://people/abraham           → GenealogyTree (person)
 *   scripture://map                      → Map
 *   scripture://timeline                 → Timeline
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
          ConceptDetail: 'concept/:conceptId',
          WordStudyDetail: 'word-study/:wordId',
          GenealogyTree: 'people/:personId',
          Map: 'map',
          Timeline: 'timeline',
        },
      },
    },
  },
};

/** Inner app shell — consumes theme context for nav theme + status bar. */
function AppShell() {
  const { base: themeBase, mode, statusBarStyle } = useTheme();

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
      <NavigationContainer theme={navTheme} linking={linking}>
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      </NavigationContainer>
      <ConnectivityBanner />
      <StatusBar style={statusBarStyle === 'light-content' ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts(FONT_MAP);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // Lock to portrait by default — specific screens unlock for landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        await initDatabase();        // Content DB (scripture.db) — replaced on updates
        await initUserDatabase();    // User DB (user.db) — never replaced, migrated
        await useSettingsStore.getState().hydrate();
        await useAuthStore.getState().hydrate();
        await usePremiumStore.getState().hydrate();
        pruneEvents(90); // Clean up old analytics (fire-and-forget)
        startMonitoring(); // Begin network connectivity monitoring
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setDbReady(true);
      }
    }
    init();
  }, []);

  // Re-engagement + premium sync: check on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && dbReady) {
        checkAndScheduleReengagement();
        syncPremiumStatus();
        flushQueue(); // Sync any queued offline mutations
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
    if (fontsLoaded && dbReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={appStyles.splashContainer}>
        <ActivityIndicator color="#bfa050" size="large" />
        <Text style={appStyles.splashText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={appStyles.rootView} onLayout={onLayoutReady}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ContentUpdateProvider>
            <AppShell />
          </ContentUpdateProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

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
