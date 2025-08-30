module.exports = {
  rootDir: '.',
  testMatch: ['<rootDir>/**/*.e2e.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-reports/e2e',
      filename: 'e2e-report.html',
      openReport: false,
    }]
  ],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.e2e.js'],
};