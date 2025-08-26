import * as Speech from 'expo-speech';
import { getStorageItem } from './storage';

// Rate limiting
let lastSpeechTime = 0;
const MIN_SPEECH_INTERVAL = 1000; // Minimum 1 second between speeches

// Cached settings
let cachedSettings = {
  mainScreenEnabled: true,
  calmModeEnabled: true,
  celebrationEnabled: true,
  rate: 1.0,
  pitch: 1.0,
};

// Load speech settings from storage
export const loadSpeechSettings = async () => {
  try {
    const settings = await getStorageItem('speechSettings');
    if (settings) {
      cachedSettings = JSON.parse(settings);
    }
  } catch (e) {
    console.log('Error loading speech settings:', e);
  }
  return cachedSettings;
};

// Smart speak function with rate limiting and settings respect
export const smartSpeak = async (text, options = {}) => {
  const {
    screenType = 'main', // 'main', 'calm', 'celebration'
    forceSpeak = false,  // Override rate limiting for critical messages
    language = 'en',
    ...speechOptions
  } = options;

  // Load latest settings
  await loadSpeechSettings();

  // Check if speech is enabled for this screen
  const enabledKey = `${screenType}ScreenEnabled`;
  if (!cachedSettings[enabledKey] && !forceSpeak) {
    return;
  }

  // Rate limiting
  const now = Date.now();
  if (!forceSpeak && now - lastSpeechTime < MIN_SPEECH_INTERVAL) {
    return;
  }

  // Stop any ongoing speech
  await Speech.stop();

  // Update last speech time
  lastSpeechTime = now;

  // Speak with settings
  await Speech.speak(text, {
    language,
    rate: cachedSettings.rate,
    pitch: cachedSettings.pitch,
    ...speechOptions
  });
};

// Stop all speech
export const stopSpeech = async () => {
  await Speech.stop();
};

// Check if speaking
export const isSpeaking = async () => {
  return await Speech.isSpeakingAsync();
};
