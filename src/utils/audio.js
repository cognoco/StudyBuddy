import { Audio } from 'expo-audio';
import * as Speech from 'expo-speech';

export const playSound = async (soundFile) => {
  try {
    const player = await Audio.AudioPlayer.createAsync(soundFile);
    await player.play();
    
    // Listen for playback finish and release resources
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        player.release();
      }
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

export const speak = (text, options = {}) => {
  const defaultOptions = {
    language: 'en',
    pitch: 1.1,
    rate: 0.9,
    ...options
  };
  
  Speech.speak(text, defaultOptions);
};

export const stopSpeaking = () => {
  Speech.stop();
};

export const configureSpeech = async () => {
  // Check if speech is available
  const available = await Speech.getAvailableVoicesAsync();
  return available;
};
