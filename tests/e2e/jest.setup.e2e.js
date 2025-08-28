const { device, expect, element, by, waitFor } = require('detox');
const adapter = require('detox/runners/jest/adapter');
const specReporter = require('detox/runners/jest/specReporter');

// Set timeout for all tests
jest.setTimeout(300000);

// Configure Detox adapter
jest.retryTimes(2, { logErrorsBeforeRetry: true });

// Setup and teardown
beforeAll(async () => {
  await adapter.beforeAll();
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
});

// Add custom matchers
expect.extend({
  toBeVisibleWithTimeout: async (received, timeout = 5000) => {
    try {
      await waitFor(received).toBeVisible().withTimeout(timeout);
      return {
        message: () => 'Element is visible',
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Element not visible within ${timeout}ms: ${error.message}`,
        pass: false,
      };
    }
  },
  
  toHaveTextWithTimeout: async (received, text, timeout = 5000) => {
    try {
      await waitFor(received).toHaveText(text).withTimeout(timeout);
      return {
        message: () => `Element has text: ${text}`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Element does not have text '${text}' within ${timeout}ms: ${error.message}`,
        pass: false,
      };
    }
  },
});

// Global test helpers
global.detoxDevice = device;
global.detoxExpect = expect;
global.detoxElement = element;
global.detoxBy = by;
global.detoxWaitFor = waitFor;

// Common test utilities
global.testHelpers = {
  // Reset app state
  resetApp: async () => {
    await device.terminateApp();
    await device.launchApp({ newInstance: true });
  },
  
  // Skip onboarding if present
  skipOnboarding: async () => {
    try {
      await waitFor(element(by.id('onboarding-screen')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('skip-onboarding-button')).tap();
    } catch (e) {
      // Onboarding not present, continue
    }
  },
  
  // Complete a study session quickly (for testing)
  completeSessionQuickly: async () => {
    try {
      await element(by.id('test-complete-session')).tap();
    } catch (e) {
      // Fallback: use actual timer skip if test helper not available
      await element(by.id('skip-session-button')).tap();
      await element(by.text('Yes, Complete')).tap();
    }
  },
  
  // Wait for animations to complete
  waitForAnimations: async (duration = 1000) => {
    await new Promise(resolve => setTimeout(resolve, duration));
  },
  
  // Take screenshot with timestamp
  takeScreenshot: async (name) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await device.takeScreenshot(`${timestamp}-${name}`);
  },
  
  // Setup mock data for testing
  setupMockData: async () => {
    // This would communicate with the app to set up test data
    // Implementation depends on app's test hooks
  },
  
  // Clear app data
  clearAppData: async () => {
    if (device.getPlatform() === 'android') {
      await device.terminateApp();
      await device.launchApp({ newInstance: true, delete: true });
    } else {
      // iOS: Reset app through menu
      await device.terminateApp();
      await device.launchApp({ newInstance: true });
      // Additional iOS-specific reset logic if needed
    }
  },
};

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Platform-specific helpers
if (device.getPlatform() === 'ios') {
  global.testHelpers.pressHome = async () => {
    await device.pressButton('home');
  };
  
  global.testHelpers.openAppSwitcher = async () => {
    await device.pressButton('home');
    await device.pressButton('home'); // Double tap
  };
} else {
  global.testHelpers.pressHome = async () => {
    await device.pressButton('back');
  };
  
  global.testHelpers.openRecentApps = async () => {
    await device.pressButton('menu');
  };
}

// Network simulation helpers
global.testHelpers.network = {
  disconnect: async () => {
    await device.setNetworkConnection({
      type: 'none',
    });
  },
  
  connect: async () => {
    await device.setNetworkConnection({
      type: 'wifi',
      state: 'connected',
    });
  },
  
  slowNetwork: async () => {
    await device.setNetworkConnection({
      type: 'cellular',
      state: 'connected',
      quality: 'poor',
    });
  },
};

// Accessibility testing helpers
global.testHelpers.accessibility = {
  enableVoiceOver: async () => {
    if (device.getPlatform() === 'ios') {
      await device.setAccessibilitySettings({
        VoiceOver: 'ON',
      });
    }
  },
  
  disableVoiceOver: async () => {
    if (device.getPlatform() === 'ios') {
      await device.setAccessibilitySettings({
        VoiceOver: 'OFF',
      });
    }
  },
  
  enableTalkBack: async () => {
    if (device.getPlatform() === 'android') {
      await device.setAccessibilitySettings({
        TalkBack: 'ON',
      });
    }
  },
  
  disableTalkBack: async () => {
    if (device.getPlatform() === 'android') {
      await device.setAccessibilitySettings({
        TalkBack: 'OFF',
      });
    }
  },
};

// Console reporter for better debugging
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out common React Native warnings in tests
  const message = args[0];
  if (typeof message === 'string' && (
    message.includes('Warning: componentWillReceiveProps') ||
    message.includes('Warning: ReactDOM.render is deprecated')
  )) {
    return;
  }
  originalConsoleError(...args);
};

// Add spec reporter for better test output
const SpecReporter = specReporter.SpecReporter;
const reporter = new SpecReporter({ displaySuccessfulSpec: false });
jasmine.getEnv().addReporter(reporter);