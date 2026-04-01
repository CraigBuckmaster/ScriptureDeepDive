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

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
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
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
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

// ── React Native library mocks ────────────────────────────────────

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  GestureDetector: ({ children }) => children,
  Gesture: {
    Pinch: () => ({ onBegin: () => ({}), onUpdate: () => ({}), onEnd: () => ({}) }),
    Pan: () => ({ minDistance: () => ({}), onBegin: () => ({}), onUpdate: () => ({}), onEnd: () => ({}) }),
    Simultaneous: (...args) => ({}),
  },
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: 'MapView',
  Marker: 'Marker',
  Polygon: 'Polygon',
  Polyline: 'Polyline',
}));

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
