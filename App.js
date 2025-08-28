import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as KeepAwake from 'expo-keep-awake';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

import OnboardingScreen from './src/screens/OnboardingScreen';
import ModeSelectionScreen from './src/screens/ModeSelectionScreen';
import MainScreen from './src/screens/MainScreen';
import CalmModeScreen from './src/screens/CalmModeScreen';
import ParentSettingsScreen from './src/screens/ParentSettingsScreen';
import CelebrationScreen from './src/screens/CelebrationScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import { getStorageItem, setStorageItem } from './src/utils/storage';
import { initializeLanguage } from './src/utils/i18n';
import { cleanOldPhotos } from './src/utils/photoManager';

const Stack = createStackNavigator();

// Subscription Context
export const SubscriptionContext = React.createContext({
  isPremium: false,
  checkPremiumStatus: () => {},
});

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
    KeepAwake.activateKeepAwakeAsync();
    setupNotifications();
    initializeLanguage();
    cleanOldPhotos(); // Clean up old photos on app start
    initializeRevenueCat();
    
    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      try {
        await setStorageItem('lastNotifAction', response.actionIdentifier || '');
      } catch (e) {
        // Silent fail for notification action storage
      }
    });
    return () => sub.remove();
  }, []);

  const initializeRevenueCat = async () => {
    // Skip RevenueCat initialization on web
    if (Platform.OS === 'web') {
      console.log('RevenueCat not supported on web platform');
      return;
    }
    
    try {
      // Replace with your actual RevenueCat API keys
      const apiKey = Platform.select({
        ios: 'appl_YOUR_IOS_API_KEY',
        android: 'goog_YOUR_ANDROID_API_KEY',
      });
      
      if (apiKey) {
        await Purchases.configure({ apiKey });
        checkPremiumStatus();
      }
    } catch (e) {
      console.log('Error initializing RevenueCat:', e);
    }
  };

  const checkPremiumStatus = async () => {
    // Skip premium check on web platform
    if (Platform.OS === 'web') {
      setIsPremium(false);
      return;
    }
    
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
    } catch (e) {
      console.log('Error checking premium status:', e);
    }
  };
  const setupNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        // Permission denied; continue without notifications
        return;
      }
      // Android channel
      await Notifications.setNotificationChannelAsync('checkins', {
        name: 'Check-ins',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      // Action category for check-in notifications
      await Notifications.setNotificationCategoryAsync('checkin-actions', [
        { identifier: 'RESUME', buttonTitle: 'Resume' },
        { identifier: 'BREAK', buttonTitle: '+5 min break' },
        { identifier: 'DONE', buttonTitle: "I'm done" },
      ]);
    } catch (e) {
      // no-op
    }
  };

  const checkFirstLaunch = async () => {
    const hasLaunched = await getStorageItem('hasLaunched');
    setIsFirstLaunch(!hasLaunched);
    setIsLoading(false);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <SubscriptionContext.Provider value={{ isPremium, checkPremiumStatus }}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            gestureEnabled: false 
          }}
        >
          {isFirstLaunch ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : null}
          <Stack.Screen name="ModeSelection" component={ModeSelectionScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="CalmMode" component={CalmModeScreen} />
          <Stack.Screen name="ParentSettings" component={ParentSettingsScreen} />
          <Stack.Screen name="Celebration" component={CelebrationScreen} />
          <Stack.Screen 
            name="Paywall" 
            component={PaywallScreen}
            options={{ presentation: 'modal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SubscriptionContext.Provider>
  );
}
