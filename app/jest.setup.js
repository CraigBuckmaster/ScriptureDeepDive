// ── Silence noisy test warnings ──────────────────────────────────

// Suppress React "not wrapped in act(...)" warnings from async state
// updates that fire after render (e.g., useEffect fetches).
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('not wrapped in act(')) return;
  originalConsoleError(...args);
};

// ── Expo module mocks ──────────────────────────────────────────────

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: () => [true],
  loadAsync: jest.fn(),
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// Mock useAvailableVoices (depends on expo-speech native)
jest.mock('@/hooks/useAvailableVoices', () => ({
  useAvailableVoices: jest.fn().mockReturnValue([]),
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[xxx]' }),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  cancelScheduledNotificationAsync: jest.fn(),
  getLastNotificationResponseAsync: jest.fn().mockResolvedValue(null),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3, HIGH: 4, LOW: 2 },
  SchedulableTriggerInputTypes: { DAILY: 'daily', TIME_INTERVAL: 'timeInterval', CALENDAR: 'calendar' },
}));

// Mock expo-sqlite — used by db/database.ts and db/userDatabase.ts
const mockDb = {
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  runAsync: jest.fn().mockResolvedValue({ changes: 0 }),
  execAsync: jest.fn().mockResolvedValue(undefined),
  closeAsync: jest.fn().mockResolvedValue(undefined),
};
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
  Asset: { fromModule: jest.fn().mockReturnValue({ downloadAsync: jest.fn(), localUri: '/fake' }) },
}));

// Mock expo-file-system
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/fake/docs/',
  cacheDirectory: '/fake/cache/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn().mockResolvedValue(''),
  downloadAsync: jest.fn().mockResolvedValue({ uri: '/fake/download' }),
}));

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
}));

// Mock expo-screen-orientation
jest.mock('expo-screen-orientation', () => ({
  lockAsync: jest.fn(),
  unlockAsync: jest.fn(),
  getOrientationAsync: jest.fn().mockResolvedValue(1),
  addOrientationChangeListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  OrientationLock: { DEFAULT: 0, PORTRAIT_UP: 1, LANDSCAPE: 5 },
  Orientation: { PORTRAIT_UP: 1, LANDSCAPE_LEFT: 3 },
}));

// Note: @react-native-async-storage/async-storage is mapped to a stub
// via moduleNameMapper in jest.config.js (package not installed in Expo Go)

// Mock Supabase client (lazy-initialized)
jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn().mockReturnValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn().mockResolvedValue({ error: null }),
      signInWithOAuth: jest.fn().mockResolvedValue({ data: { url: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
      exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
  isSupabaseAvailable: jest.fn().mockReturnValue(false),
}));

// Mock OAuth helpers
jest.mock('@/lib/oauthHelpers', () => ({
  signInWithProvider: jest.fn().mockResolvedValue({}),
}));

// Mock expo-store-review
jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  requestReview: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: { version: '1.0.0' },
}));

// Mock expo-auth-session
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn().mockReturnValue('scripture://auth/callback'),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: 'cancel' }),
}));

// ── React Native library mocks ────────────────────────────────────

// Mock react-native-reanimated — uses the library's own jest mock, which
// provides shared-value stubs and a no-op worklet runtime. Reanimated 4
// requires react-native-worklets; the worklets init path throws in jest
// without this mock, so every component that imports reanimated needs it.
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // Silence call() warnings from the mock.
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const gestureChain = () => new Proxy({}, {
    get: () => (...args) => gestureChain(),
  });
  return {
    GestureHandlerRootView: ({ children }) => children,
    GestureDetector: ({ children }) => children,
    Gesture: {
      Pinch: gestureChain,
      Pan: gestureChain,
      Tap: gestureChain,
      Simultaneous: gestureChain,
      Race: gestureChain,
    },
  };
});

// Mock @maplibre/maplibre-react-native — renders children inline as Views
// and exposes stub CameraRef methods so components under test can call
// fitBounds / flyTo without crashing.
//
// Matches the v11 API surface: `Map` (not MapView), `GeoJSONSource`
// (not ShapeSource), a single `Layer` component with a `type` prop
// instead of `CircleLayer`/`FillLayer`/etc, and the default export removed.
jest.mock('@maplibre/maplibre-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  const pass = (name) =>
    React.forwardRef((props, ref) =>
      React.createElement(View, { ...props, ref, testID: props.testID ?? name }, props.children),
    );

  const Map = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref }, props.children),
  );

  const Camera = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      jumpTo: jest.fn(),
      easeTo: jest.fn(),
      flyTo: jest.fn(),
      fitBounds: jest.fn(),
      zoomTo: jest.fn(),
      setStop: jest.fn().mockResolvedValue(undefined),
    }));
    return React.createElement(View, { testID: 'camera' });
  });

  const GeoJSONSource = ({ children, onPress }) =>
    React.createElement(View, { testID: 'geojson-source', onPress }, children);

  const OfflineManager = {
    createPack: jest.fn().mockResolvedValue(undefined),
    getPack: jest.fn().mockResolvedValue(null),
    getPacks: jest.fn().mockResolvedValue([]),
    deletePack: jest.fn().mockResolvedValue(undefined),
    setMaximumAmbientCacheSize: jest.fn().mockResolvedValue(undefined),
    clearAmbientCache: jest.fn().mockResolvedValue(undefined),
  };

  return {
    __esModule: true,
    Map,
    Camera,
    GeoJSONSource,
    Layer: pass('Layer'),
    LayerAnnotation: pass('LayerAnnotation'),
    Images: pass('Images'),
    RasterSource: pass('RasterSource'),
    VectorSource: pass('VectorSource'),
    ImageSource: pass('ImageSource'),
    UserLocation: pass('UserLocation'),
    NativeUserLocation: pass('NativeUserLocation'),
    Marker: pass('Marker'),
    ViewAnnotation: pass('ViewAnnotation'),
    Callout: pass('Callout'),
    Animated: {},
    LogManager: { setLogLevel: jest.fn() },
    NetworkManager: { setConnected: jest.fn() },
    LocationManager: {},
    OfflineManager,
    StaticMapImageManager: {},
    TransformRequestManager: {},
  };
});

// Under MapLibre v11 + React Native New Architecture, the map native
// module registers via TurboModuleRegistry, not the legacy bridge, so
// `NativeModules.MLRNModule` no longer exists at all. The probe in
// `isMapNativeAvailable` now just require()s the MapLibre package and
// checks for the `Map` named export — which the jest mock above
// provides — so no NativeModules patching is needed here.

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Circle: 'Circle',
  Rect: 'Rect',
  Line: 'Line',
  Path: 'Path',
  G: 'G',
  Text: 'SvgText',
  Polygon: 'Polygon',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  RadialGradient: 'RadialGradient',
  Stop: 'Stop',
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) => React.createElement('SafeAreaProvider', null, children),
    SafeAreaView: ({ children, ...props }) => React.createElement('SafeAreaView', props, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Make InteractionManager.runAfterInteractions execute its callback
// synchronously. In production, RN drains the interaction queue after
// gestures/animations finish; in jsdom there's no such loop, so any
// code deferred behind runAfterInteractions would silently never run.
// Returning a cancel handle preserves the API surface for code that
// stores it for cleanup.
//
// We mock the internal module path because RN's top-level
// `InteractionManager` export pulls `.default` from this file. Both
// the named import (`import { InteractionManager } from 'react-native'`)
// and the direct import resolve here.
jest.mock('react-native/Libraries/Interaction/InteractionManager', () => {
  const api = {
    runAfterInteractions: (cb) => {
      if (typeof cb === 'function') cb();
      return { cancel: () => undefined };
    },
    createInteractionHandle: () => 0,
    clearInteractionHandle: () => undefined,
    setDeadline: () => undefined,
  };
  return { __esModule: true, default: api, ...api };
});

// ── Navigation mocks ──────────────────────────────────────────────

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb) => cb(),
  };
});

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// ── Icon mocks ────────────────────────────────────────────────────

jest.mock('lucide-react-native', () => {
  const React = require('react');
  return new Proxy({}, {
    get: (_, name) => {
      if (typeof name !== 'string') return undefined;
      const component = (props) => React.createElement('svg', { ...props, testID: `icon-${name}` });
      component.displayName = name;
      return component;
    },
  });
});

// ── App utility mocks ─────────────────────────────────────────────

jest.mock('@/utils/haptics', () => ({
  lightImpact: jest.fn(),
  mediumImpact: jest.fn(),
}));

// Mock analytics service (fire-and-forget, should never break tests)
jest.mock('@/services/analytics', () => ({
  logEvent: jest.fn(),
  getEventCounts: jest.fn().mockResolvedValue([]),
  pruneEvents: jest.fn().mockResolvedValue(undefined),
}));

// Mock reengagement service
jest.mock('@/services/reengagement', () => ({
  updateLastActive: jest.fn().mockResolvedValue(undefined),
  checkAndScheduleReengagement: jest.fn().mockResolvedValue(undefined),
  cancelReengagement: jest.fn().mockResolvedValue(undefined),
}));

// Silence the app logger in tests (console.warn noise).
// The logger.test.ts file unmocks this to test the real implementation.
jest.mock('@/utils/logger', () => {
  const actual = jest.requireActual('@/utils/logger');
  return {
    ...actual,
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    },
  };
});

// ── Bottom Sheet mock ─────────────────────────────────────────────

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(({ children }, ref) => {
      React.useImperativeHandle(ref, () => ({
        snapToIndex: jest.fn(),
        close: jest.fn(),
        expand: jest.fn(),
      }));
      return React.createElement('BottomSheet', null, children);
    }),
    BottomSheetView: ({ children }) => React.createElement('BottomSheetView', null, children),
    BottomSheetScrollView: ({ children }) => React.createElement('BottomSheetScrollView', null, children),
    BottomSheetBackdrop: () => null,
  };
});
