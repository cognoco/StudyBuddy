import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@StudyBuddy:';

export const setStorageItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + key, value);
    return true;
  } catch (error) {
    console.error('Error saving to storage:', error);
    return false;
  }
};

export const getStorageItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_PREFIX + key);
    return value;
  } catch (error) {
    console.error('Error reading from storage:', error);
    return null;
  }
};

export const removeStorageItem = async (key) => {
  try {
    await AsyncStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (error) {
    console.error('Error removing from storage:', error);
    return false;
  }
};

export const clearAllStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const studyBuddyKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
    await AsyncStorage.multiRemove(studyBuddyKeys);
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};
