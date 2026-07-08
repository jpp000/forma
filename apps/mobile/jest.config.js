/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          esModuleInterop: true,
          strict: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^expo-secure-store$':
      '<rootDir>/src/session/__mocks__/expo-secure-store.ts',
  },
};
