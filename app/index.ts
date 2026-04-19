// ⚠ DIAGNOSTIC IMPORT ORDER — DO NOT REORDER.
// The startupProbe import MUST be the very first thing evaluated so
// its rotate() call runs before any other module is loaded. Any
// module loaded before rotate() could crash during initialisation
// and its probe entries would land in the wrong file.
import {
  record as probeRecord,
  rotate as probeRotate,
} from './src/utils/startupProbe';

probeRotate();
probeRecord('boot:index.ts-loaded');

import { registerRootComponent } from 'expo';

probeRecord('boot:expo-imported');

import App from './App';

probeRecord('boot:App-imported');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

probeRecord('boot:registerRootComponent-returned');
