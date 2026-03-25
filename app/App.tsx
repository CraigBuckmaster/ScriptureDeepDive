import { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

import { FONT_MAP, base } from './src/theme';
import { initDatabase } from './src/db/database';
import { useSettingsStore } from './src/stores';
import { RootNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Keep splash visible while we load
SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: base.bg,
    card: base.bg,
    text: base.text,
    border: base.border,
    primary: base.gold,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts(FONT_MAP);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        await useSettingsStore.getState().hydrate();
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setDbReady(true);
      }
    }
    init();
  }, []);

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
      <NavigationContainer theme={navTheme}>
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      </NavigationContainer>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
