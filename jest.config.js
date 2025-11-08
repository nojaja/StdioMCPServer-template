module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json'
      }
    ]
  },
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.js'],
  coverageThreshold: {
    global: {//変更禁止
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    }
  },
};
