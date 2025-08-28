import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom render function that wraps components with necessary providers
 */
export const renderWithProviders = (component, options = {}) => {
  const {
    navigationProps = {},
    initialEntries = ['/'],
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => {
    if (options.withNavigation !== false) {
      return (
        <NavigationContainer {...navigationProps}>
          {children}
        </NavigationContainer>
      );
    }
    return children;
  };

  return render(component, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Mock timer utilities
 */
export const mockTimers = () => {
  beforeEach(() => {
    jest.useFakeTimers('legacy');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
};

/**
 * Storage test utilities
 */
export const storageHelpers = {
  clear: async () => {
    await AsyncStorage.clear();
  },
  
  setItem: async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  
  getItem: async (key) => {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  
  setup: async (initialData = {}) => {
    await AsyncStorage.clear();
    for (const [key, value] of Object.entries(initialData)) {
      await storageHelpers.setItem(key, value);
    }
  }
};

/**
 * Component test factories
 */
export const createMockProps = (overrides = {}) => {
  const defaultProps = {
    onPress: jest.fn(),
    onComplete: jest.fn(),
    onStart: jest.fn(),
    onPause: jest.fn(),
    onResume: jest.fn(),
    onStop: jest.fn(),
    navigation: {
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    },
    route: {
      params: {},
    },
  };

  return { ...defaultProps, ...overrides };
};

/**
 * Test data factories
 */
export const createTestSession = (overrides = {}) => {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    startTime: Date.now(),
    duration: 1500000, // 25 minutes
    completed: false,
    mode: 'focus',
    breaks: 0,
    ...overrides,
  };
};

export const createTestUser = (overrides = {}) => {
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test User',
    email: 'test@example.com',
    preferences: {
      studyDuration: 25,
      breakDuration: 5,
      notifications: true,
      soundEnabled: true,
    },
    stats: {
      totalSessions: 0,
      totalStudyTime: 0,
      streak: 0,
    },
    ...overrides,
  };
};

/**
 * Performance testing utilities
 */
export const performanceHelpers = {
  measureRenderTime: async (renderFn) => {
    const start = performance.now();
    const result = await renderFn();
    const end = performance.now();
    
    return {
      result,
      renderTime: end - start,
    };
  },
  
  measureMemoryUsage: () => {
    if (global.gc) {
      global.gc();
    }
    return process.memoryUsage();
  },
  
  waitForNextFrame: () => {
    return new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
  },
};

/**
 * Accessibility testing helpers
 */
export const accessibilityHelpers = {
  checkAccessibility: (component) => {
    const { getByTestId, queryByA11yLabel, queryByA11yRole } = component;
    
    return {
      hasAccessibilityLabel: (testId) => {
        const element = getByTestId(testId);
        return element.props.accessibilityLabel !== undefined;
      },
      
      hasAccessibilityRole: (testId) => {
        const element = getByTestId(testId);
        return element.props.accessibilityRole !== undefined;
      },
      
      isAccessible: (testId) => {
        const element = getByTestId(testId);
        return (
          element.props.accessible !== false &&
          element.props.accessibilityLabel !== undefined
        );
      },
    };
  },
};

/**
 * Animation testing utilities
 */
export const animationHelpers = {
  mockAnimations: () => {
    jest.mock('react-native-reanimated', () => {
      return {
        Value: jest.fn(() => ({
          setValue: jest.fn(),
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
        timing: jest.fn(() => ({
          start: jest.fn((callback) => callback && callback()),
        })),
        spring: jest.fn(() => ({
          start: jest.fn((callback) => callback && callback()),
        })),
        parallel: jest.fn(() => ({
          start: jest.fn((callback) => callback && callback()),
        })),
        sequence: jest.fn(() => ({
          start: jest.fn((callback) => callback && callback()),
        })),
      };
    });
  },
  
  fastForwardAnimations: () => {
    jest.runAllTimers();
  },
};

/**
 * Network testing utilities
 */
export const networkHelpers = {
  mockNetworkResponse: (response, delay = 0) => {
    return jest.fn(() => 
      new Promise(resolve => {
        setTimeout(() => resolve(response), delay);
      })
    );
  },
  
  mockNetworkError: (error = new Error('Network error')) => {
    return jest.fn(() => Promise.reject(error));
  },
  
  mockSlowNetwork: (response, delay = 3000) => {
    return networkHelpers.mockNetworkResponse(response, delay);
  },
};

/**
 * Custom matchers
 */
export const customMatchers = {
  toBeWithinRange: (received, floor, ceiling) => {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toHaveValidTimestamp: (received) => {
    const timestamp = new Date(received).getTime();
    const now = Date.now();
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    
    const pass = timestamp > oneYearAgo && timestamp <= now;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid timestamp`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid timestamp`,
        pass: false,
      };
    }
  },
};

/**
 * Setup function for common test patterns
 */
export const setupTest = (options = {}) => {
  const {
    mockTimers: useMockTimers = false,
    clearStorage = true,
    mockAnimations = false,
    setupStorage = {},
  } = options;

  beforeEach(async () => {
    if (useMockTimers) {
      jest.useFakeTimers('legacy');
    }
    
    if (clearStorage) {
      await storageHelpers.clear();
    }
    
    if (Object.keys(setupStorage).length > 0) {
      await storageHelpers.setup(setupStorage);
    }
    
    if (mockAnimations) {
      animationHelpers.mockAnimations();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    
    if (useMockTimers) {
      jest.useRealTimers();
    }
  });
};

/**
 * Test environment setup
 */
export const setupTestEnvironment = () => {
  // Extend Jest matchers
  expect.extend(customMatchers);
  
  // Global test utilities
  global.testHelpers = {
    renderWithProviders,
    createMockProps,
    createTestSession,
    createTestUser,
    storageHelpers,
    performanceHelpers,
    accessibilityHelpers,
    animationHelpers,
    networkHelpers,
    setupTest,
  };
  
  // Console suppression for tests
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      !args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      originalError(...args);
    }
  };
  
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      !args[0].includes('componentWillReceiveProps is deprecated')
    ) {
      originalWarn(...args);
    }
  };
};

// Initialize test environment
setupTestEnvironment();