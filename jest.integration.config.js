/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@prisma-client$': '<rootDir>/generated/prisma',
    '^@prisma-client/(.*)$': '<rootDir>/generated/prisma/$1',
  },
  testMatch: ['**/*.integration.test.ts'],
  globalSetup: '<rootDir>/src/test/integration.globalSetup.ts',
  setupFiles: ['<rootDir>/src/test/integration.setup.ts'],
};
