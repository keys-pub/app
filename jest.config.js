module.exports = {
  runner: '@jest-runner/electron',
  testEnvironment: '@jest-runner/electron/environment',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
