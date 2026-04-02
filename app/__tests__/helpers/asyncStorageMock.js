module.exports = {
  default: {
    setItem: jest.fn(),
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn().mockResolvedValue([]),
  },
};
