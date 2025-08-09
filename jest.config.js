module.exports = {
  projects: [
    // Client tests configuration
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/client/__tests__/setup.ts'],
      setupFiles: ['<rootDir>/client/__tests__/polyfills.js'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/client/$1',
      },
      collectCoverageFrom: [
        'client/**/*.{ts,tsx}',
        '!client/**/*.d.ts',
        '!client/__tests__/**',
      ],
      testMatch: [
        '<rootDir>/client/__tests__/**/*.(test|spec).{js,jsx,ts,tsx}'
      ],
      moduleFileExtensions: [
        'js',
        'jsx',
        'ts',
        'tsx',
        'json',
        'node'
      ],
      transform: {
        '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            ['@babel/preset-react', { runtime: 'automatic' }],
            ['@babel/preset-typescript', { allowDeclareFields: true }]
          ]
        }]
      }
    },
    // Server tests configuration
    {
      displayName: 'server',
      testEnvironment: 'node',
      collectCoverageFrom: [
        'server/**/*.js',
        '!server/server.js',
        '!server/__tests__/**',
      ],
      testMatch: [
        '<rootDir>/server/__tests__/**/*.(test|spec).js'
      ],
      moduleFileExtensions: [
        'js',
        'json',
        'node'
      ],
      transform: {
        '^.+\\.js$': 'babel-jest'
      }
    }
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};