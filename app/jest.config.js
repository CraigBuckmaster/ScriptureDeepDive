module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|d3-.*|lucide-react-native|zustand|nativewind|react-native-url-polyfill|@supabase)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__tests__/helpers/asyncStorageMock.js',
    '^@supabase/supabase-js$': '<rootDir>/__tests__/helpers/supabaseMock.js',
    '^react-native-url-polyfill/auto$': '<rootDir>/__tests__/helpers/noop.js',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/navigation/**',
  ],
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 33,
      functions: 38,
      lines: 40,
    },
    './src/utils/': {
      statements: 35,
      branches: 30,
      functions: 35,
      lines: 35,
    },
  },
};
