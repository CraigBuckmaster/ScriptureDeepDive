import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ActivityIndicator, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';

import { FONT_MAP, base, ThemeProvider, useTheme } from './src/theme';
import { initDatabase } from './src/db/database';
import { initUserDatabase } from './src/db/userDatabase';
import { useSettingsStore, useAuthStore } from './src/stores';
import { pruneEvents } from './src/services/analytics';
import { checkAndScheduleReengagement } from './src/services/reengagement';
import { RootNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Keep splash visible while we load
SplashScreen.preventAutoHideAsync();

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
      <NavigationContainer theme={navTheme}>
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      </NavigationContainer>
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
        pruneEvents(90); // Clean up old analytics (fire-and-forget)
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setDbReady(true);
      }
    }
    init();
  }, []);

  // Re-engagement: check on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && dbReady) checkAndScheduleReengagement();
    });
    return () => sub.remove();
  }, [dbReady]);

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded && dbReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={{ flex: 1, backgroundColor: base.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={base.gold} size="large" />
        <Text style={{ color: base.textDim, marginTop: 12, fontSize: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutReady}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
