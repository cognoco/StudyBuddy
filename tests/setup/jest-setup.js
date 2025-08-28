// Global Jest Setup for StudyBuddy
// This file is executed before each test file

import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
});

// Mock Expo modules
jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted', canAskAgain: true })
  ),
  requestPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted', canAskAgain: true })
  ),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  setNotificationCategoryAsync: jest.fn(() => Promise.resolve()),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelNotificationAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({
        sound: {
          playAsync: jest.fn(() => Promise.resolve()),
          stopAsync: jest.fn(() => Promise.resolve()),
          unloadAsync: jest.fn(() => Promise.resolve()),
          setStatusAsync: jest.fn(() => Promise.resolve()),
        },
        status: { isLoaded: true },
      })),
    },
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/document/',
  cacheDirectory: 'file:///mock/cache/',
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('mock file content')),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, isDirectory: false })),
}));

jest.mock('react-native-purchases', () => ({
  configure: jest.fn(),
  getCustomerInfo: jest.fn(() => 
    Promise.resolve({
      entitlements: {
        active: {},
      },
      originalPurchaseDate: null,
    })
  ),
  getOfferings: jest.fn(() => 
    Promise.resolve({
      current: {
        availablePackages: [],
      },
    })
  ),
  purchasePackage: jest.fn(() => 
    Promise.resolve({
      customerInfo: {
        entitlements: {
          active: { premium: {} },
        },
      },
    })
  ),
  restorePurchases: jest.fn(() => 
    Promise.resolve({
      entitlements: {
        active: {},
      },
    })
  ),
}));

// Mock Lottie animations
jest.mock('lottie-react-native', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

// Global test utilities
global.mockTimers = () => {
  jest.useFakeTimers('legacy');
};

global.restoreTimers = () => {
  jest.useRealTimers();
};

// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
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
});

// Console warning suppression for known issues
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is deprecated') ||
     message.includes('Warning: componentWillReceiveProps is deprecated'))
  ) {
    return;
  }
  originalWarn(...args);
};

// Test environment cleanup
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Global test timeout
jest.setTimeout(10000);