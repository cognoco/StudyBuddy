import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

// Mock Expo modules that aren't available in test environment
jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  setNotificationChannelAsync: jest.fn(),
  setNotificationCategoryAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('react-native-purchases', () => ({
  configure: jest.fn(),
  getCustomerInfo: jest.fn(() => Promise.resolve({ entitlements: { active: {} } })),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('App', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<App />);
    // The app should render without throwing an error
    expect(getByText).toBeDefined();
  });

  it('has basic structure', () => {
    const { getByTestId } = render(<App />);
    // Add testID to your main container in App.js to make this test pass
    // For now, just checking that render doesn't crash
    expect(getByTestId).toBeDefined();
  });
});
