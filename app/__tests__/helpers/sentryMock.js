module.exports = {
  init: jest.fn(),
  wrap: (component) => component,
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
};
