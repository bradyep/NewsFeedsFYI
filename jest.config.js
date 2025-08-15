/** @type {import('jest').Config} */
module.exports = {
  // Use multiple projects to separate client and server tests
  projects: [
    {
      displayName: 'client',
      testMatch: ['<rootDir>/src/test/client/**/*.{test,spec}.{js,ts,tsx}'],
      testEnvironment: 'jsdom',
      preset: 'ts-jest',
      moduleNameMapper: {
        '^client/(.*)$': '<rootDir>/src/client/$1',
        '^common/(.*)$': '<rootDir>/src/common/$1',
        '^server/(.*)$': '<rootDir>/src/server/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
      },
      setupFilesAfterEnv: ['<rootDir>/src/test/setup/client.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: 'tsconfig.test.json'
        }]
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      collectCoverageFrom: [
        'src/client/**/*.{ts,tsx}',
        '!src/client/**/*.d.ts',
        '!src/client/index.tsx'
      ]
    },
    {
      displayName: 'server',
      testMatch: ['<rootDir>/src/test/server/**/*.{test,spec}.{js,ts}'],
      testEnvironment: 'node',
      preset: 'ts-jest',
      moduleNameMapper: {
        '^client/(.*)$': '<rootDir>/src/client/$1',
        '^common/(.*)$': '<rootDir>/src/common/$1',
        '^server/(.*)$': '<rootDir>/src/server/$1'
      },
      setupFilesAfterEnv: ['<rootDir>/src/test/setup/server.ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: 'tsconfig.test.json'
        }]
      },
      moduleFileExtensions: ['ts', 'js', 'json'],
      collectCoverageFrom: [
        'src/server/**/*.ts',
        '!src/server/**/*.d.ts'
      ]
    },
    {
      displayName: 'common',
      testMatch: ['<rootDir>/src/test/common/**/*.{test,spec}.{js,ts}'],
      testEnvironment: 'node',
      preset: 'ts-jest',
      moduleNameMapper: {
        '^common/(.*)$': '<rootDir>/src/common/$1'
      },
      setupFilesAfterEnv: ['<rootDir>/src/test/setup/common.ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: 'tsconfig.test.json'
        }]
      },
      moduleFileExtensions: ['ts', 'js', 'json'],
      collectCoverageFrom: [
        'src/common/**/*.ts',
        '!src/common/**/*.d.ts'
      ]
    }
  ],
  // Global settings
  testPathIgnorePatterns: ['/node_modules/', '/src/test/e2e/'],
  collectCoverage: false, // Enable with --coverage flag
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  verbose: true,
  errorOnDeprecated: true
};
