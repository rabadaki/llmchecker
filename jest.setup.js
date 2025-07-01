// Configure testing framework and cleanup
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Global test setup and cleanup
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.useRealTimers();
});

afterAll(async () => {
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  // Clear any remaining timers/intervals
  jest.clearAllTimers();
  jest.useRealTimers();
  
  // Small delay to let async operations finish
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Silence console methods during tests to reduce noise
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock Next.js modules that might not be available in test environment
jest.mock('next/head', () => {
  return function Head({ children }) {
    return children
  }
})

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))