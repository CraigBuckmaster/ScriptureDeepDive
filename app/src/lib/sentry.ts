import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    enableAutoSessionTracking: true,
    tracesSampleRate: 0.2,
  });
}

export { Sentry, DSN };
