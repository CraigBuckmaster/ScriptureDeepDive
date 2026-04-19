// Install the global JS error handler BEFORE any other import. This
// module captures errors upstream of React Native's ExceptionsManager
// and writes them to disk, so the next launch can display what went
// wrong. See src/utils/crashHandler.ts for the full rationale.
//
// Order matters: Babel hoists import statements, but within the
// hoisted block modules resolve top-to-bottom. Putting this first
// means the handler is installed before App's transitive imports
// load — though in practice global.ErrorUtils is set by RN's JS
// bootstrap before ANY module runs, so even if the order slipped,
// errors during module resolution would still be captured.
import { installCrashHandler } from './src/utils/crashHandler';
installCrashHandler();

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
