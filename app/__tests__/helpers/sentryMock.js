/**
 * Jest mock for @sentry/react-native. Wired via jest.config.js
 * moduleNameMapper. Must mirror the surface area that src/lib/sentry.ts
 * interacts with at runtime.
 */
module.exports = {
  init: jest.fn(),
  wrap: (component) => component,
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
};
