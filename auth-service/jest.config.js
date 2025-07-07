// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // roots removed, using testMatch for locating tests
  testMatch: ['**/tests/**/*.test.ts'],
  
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'tsx', 'jsx'],
  clearMocks: true,
  testTimeout: 10000,
  

};
