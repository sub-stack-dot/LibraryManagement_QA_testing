module.exports = {
  testEnvironment: 'node',
  testTimeout: 20000,
  // Only run unit tests under tests/unit to avoid picking up non-jest selenium scripts
  testMatch: ["**/tests/unit/**/*.test.js"]
};
