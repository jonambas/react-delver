/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: {
    '@delver/logger(.*)': '<rootDir>/packages/logger/src',
    chalk: 'chalk/source/index.js',
    '#ansi-styles': 'chalk/source/vendor/ansi-styles/index.js',
    '#supports-color': 'chalk/source/vendor/supports-color/index.js'
    // "@sparkpost/matchbox(.*)": "<rootDir>/packages/matchbox/src",
    // "@sparkpost/design-tokens(.*)": "<rootDir>/packages/design-tokens",
    // chalk: '<rootDir>/node_modules/chalk'
    // "^test-utils$": "<rootDir>/config/test-utils.js"
  },
  testPathIgnorePatterns: ['<rootDir>[/\\\\](build|docs|node_modules|scripts)[/\\\\]'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
