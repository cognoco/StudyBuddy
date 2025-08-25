const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    fontSize: 18,
    color: '#4A90E2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  sessionLog: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  setting: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  switchSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recordButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: '#C0392B',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 10,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## study-buddy/src/screens/ModeSelectionScreen.js
```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { getStorageItem } from '../utils/storage';
import { AGE_CONFIGS } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function ModeSelectionScreen({ navigation }) {
  const [ageGroup, setAgeGroup] = useState('elementary');
  const [studyingCount, setStudyingCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    loadUserData();
    // Simulate live activity
    const interval = setInterval(() => {
      setStudyingCount(Math.floor(Math.random() * 500) + 800);
      setStreakCount(Math.floor(Math.random() * 100) + 100);
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    const age = await getStorageItem('selectedAge');
    if (age) setAgeGroup(age);
    
    // Set initial "live" counts
    setStudyingCount(Math.floor(Math.random() * 500) + 800);
    setStreakCount(Math.floor(Math.random() * 100) + 100);
  };

  const config = AGE_CONFIGS[ageGroup];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Live Activity Display */}
        <View style={styles.liveActivity}>
          <Text style={styles.liveText}>🌍 {studyingCount} kids studying now!</Text>
          <Text style={styles.liveText}>🔥 {streakCount} on streaks!</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>How are you feeling?</Text>

        {/* Mode Selection */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeCard, styles.studyMode]}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.modeEmoji}>📚</Text>
            <Text style={styles.modeTitle}>Ready to Work!</Text>
            <Text style={styles.modeDescription}>
              {ageGroup === 'young' ? 'Time to learn!' : 
               ageGroup === 'teen' ? 'Focus mode' : 'Study time'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, styles.calmMode]}
            onPress={() => navigation.navigate('CalmMode')}
          >
            <Text style={styles.modeEmoji}>🧘</Text>
            <Text style={styles.modeTitle}>Need to Calm Down</Text>
            <Text style={styles.modeDescription}>
              {ageGroup === 'young' ? 'Feel better' : 
               ageGroup === 'teen' ? 'Reset' : 'Take a breath'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsPreview}>
          <Text style={styles.statsText}>
            You're not alone! Join thousands of kids succeeding every day.
          </Text>
        </View>
      </View>
      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjectModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What subject are you working on?</Text>
            <View style={styles.subjectGrid}>
              {(ageGroup === 'young' || ageGroup === 'elementary' 
                ? SUBJECTS_ELEMENTARY 
                : SUBJECTS_ADVANCED
              ).map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={styles.subjectButton}
                  onPress={() => selectSubjectAndStart(subject)}
                >
                  <Text style={styles.subjectEmoji}>{subject.emoji}</Text>
                  <Text style={styles.subjectLabel}>{subject.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Surprise Event Display */}
      {currentSurprise && (
        <View style={styles.surpriseBanner}>
          <Text style={styles.surpriseText}>
            {currentSurprise.emoji} {currentSurprise.message}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  liveActivity: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
  },
  liveText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 40,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  modeCard: {
    width: '45%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  studyMode: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  calmMode: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  modeEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  statsPreview: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statsText: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
```

## study-buddy/src/screens/CalmModeScreen.js
```javascript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { getStorageItem, setStorageItem } from '../utils/storage';
import BuddyCharacter from '../components/BuddyCharacter';
import BigButton from '../components/BigButton';
import { AGE_CONFIGS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

export default function CalmModeScreen({ navigation }) {
  const [buddy, setBuddy] = useState(null);
  const [ageGroup, setAgeGroup] = useState('elementary');
  const [isCalming, setIsCalming] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [calmStreak, setCalmStreak] = useState(0);
  
  const breathingAnim = useRef(new Animated.Value(1)).current;
  const timerInterval = useRef(null);
  const breathingInterval = useRef(null);

  useEffect(() => {
    loadUserData();
    loadCalmData();
    
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (breathingInterval.current) clearInterval(breathingInterval.current);
    };
  }, []);

  const loadUserData = async () => {
    const buddyData = await getStorageItem('selectedBuddy');
    const age = await getStorageItem('selectedAge');
    if (buddyData) setBuddy(JSON.parse(buddyData));
    if (age) setAgeGroup(age);
  };

  const loadCalmData = async () => {
    const streak = await getStorageItem('calmStreak');
    if (streak) setCalmStreak(parseInt(streak));
  };

  const startCalming = () => {
    setIsCalming(true);
    setSessionTime(0);
    setBreathCount(0);
    
    const config = AGE_CONFIGS[ageGroup];
    
    // Start timer (5-10 minutes for calm mode)
    timerInterval.current = setInterval(() => {
      setSessionTime(prev => {
        if (prev >= 300) { // 5 minutes minimum
          offerToFinish();
        }
        return prev + 1;
      });
    }, 1000);
    
    // Start breathing animation
    startBreathingExercise();
    
    // Initial calming message
    const calmMessages = {
      young: "Let's take some big breaths together. You're safe.",
      elementary: "Time to calm down. Breathe with me.",
      tween: "Let's reset. Deep breaths.",
      teen: "Breathing exercise. Follow the circle."
    };
    
    Speech.speak(calmMessages[ageGroup], {
      language: 'en',
      pitch: 0.9, // Lower pitch for calming
      rate: 0.7   // Slower rate for calming
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const startBreathingExercise = () => {
    breathingInterval.current = setInterval(() => {
      // Breathe in
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.5,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start();
      
      setBreathCount(prev => prev + 1);
      
      // Voice guidance every 3 breaths
      if (breathCount % 3 === 0) {
        const prompts = [
          "In... and out...",
          "You're doing great",
          "Nice and slow",
          "Feel calmer"
        ];
        Speech.speak(prompts[breathCount % prompts.length], {
          pitch: 0.9,
          rate: 0.6
        });
      }
    }, 8000); // 8 seconds per breath cycle
  };

  const offerToFinish = () => {
    Alert.alert(
      "Feeling Better?",
      "You've been calming for 5 minutes. Ready to stop?",
      [
        { text: "Keep Going", style: "cancel" },
        { text: "I'm Ready", onPress: finishCalming }
      ]
    );
  };

  const finishCalming = () => {
    setIsCalming(false);
    clearInterval(timerInterval.current);
    clearInterval(breathingInterval.current);
    
    saveCalmData();
    
    Alert.alert(
      "Great Job! 🌟",
      "You did amazing at calming down. Want to tell someone you're ready?",
      [
        { text: "Not Yet", onPress: () => navigation.navigate('ModeSelection') },
        { 
          text: "Tell Parent", 
          onPress: () => {
            // In real app, would send notification
            Alert.alert("Message Sent!", "Someone will check on you soon.");
            navigation.navigate('ModeSelection');
          }
        }
      ]
    );
  };

  const saveCalmData = async () => {
    const newStreak = calmStreak + 1;
    await setStorageItem('calmStreak', newStreak.toString());
    await setStorageItem('lastCalmSession', new Date().toISOString());
    
    // Track what worked
    const calmLog = {
      duration: sessionTime,
      breathCount: breathCount,
      timestamp: new Date().toISOString()
    };
    await setStorageItem('lastCalmLog', JSON.stringify(calmLog));
  };

  const config = AGE_CONFIGS[ageGroup];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#E8F4F8' }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>🧘 {calmStreak} calm sessions</Text>
          </View>
        </View>

        {/* Breathing Circle */}
        {isCalming && (
          <Animated.View 
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: breathingAnim }]
              }
            ]}
          >
            <Text style={styles.breathText}>
              {breathingAnim._value > 1.25 ? 'Breathe In' : 'Breathe Out'}
            </Text>
          </Animated.View>
        )}

        {/* Buddy (smaller and calmer) */}
        {!isCalming && buddy && (
          <View style={styles.buddyContainer}>
            <BuddyCharacter 
              buddy={buddy} 
              isStudying={false}
              isFaded={false}
              ageGroup={ageGroup}
              style={{ transform: [{ scale: 0.7 }] }}
            />
          </View>
        )}

        {/* Timer */}
        {isCalming && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={styles.breathCountText}>
              {breathCount} breaths
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {!isCalming ? (
            <BigButton 
              title="Start Calming 🌊"
              onPress={startCalming}
              color="#2196F3"
            />
          ) : (
            <BigButton 
              title="I'm Ready to Talk"
              onPress={finishCalming}
              color="#4CAF50"
            />
          )}
        </View>

        {/* Calm Tips */}
        {!isCalming && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipText}>
              {ageGroup === 'young' ? '💙 It\'s okay to feel big feelings' :
               ageGroup === 'teen' ? '💙 Take a moment to reset' :
               '💙 Everyone needs to calm down sometimes'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  backButton: {
    padding: 10,
  },
  backText: {
    fontSize: 24,
    color: '#2196F3',
  },
  streakContainer: {
    backgroundColor: '#BBDEFB',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#64B5F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  breathText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  buddyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  breathCountText: {
    fontSize: 18,
    color: '#7F8C8D',
    marginTop: 5,
  },
  buttonContainer: {
    paddingVertical: 30,
  },
  tipsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tipText: {
    fontSize: 16,
    color: '#5E92B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
```

---# Study Buddy - Complete App Structure

## Project Structure Overview
```
study-buddy/
├── app.json
├── package.json
├── babel.config.js
├── App.js
├── src/
│   ├── screens/
│   │   ├── OnboardingScreen.js
│   │   ├── MainScreen.js
│   │   ├── ParentSettingsScreen.js
│   │   └── CelebrationScreen.js
│   ├── components/
│   │   ├── BuddyCharacter.js
│   │   ├── StudyTimer.js
│   │   ├── CheckInMessage.js
│   │   └── BigButton.js
│   ├── utils/
│   │   ├── storage.js
│   │   ├── audio.js
│   │   └── constants.js
│   └── assets/
│       └── animations/
│           └── buddy-animations.js
└── README.md
```

---

## study-buddy/package.json
```json
{
  "name": "study-buddy",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~49.0.0",
    "expo-status-bar": "~1.6.0",
    "expo-av": "~13.4.1",
    "expo-speech": "~11.3.0",
    "expo-haptics": "~12.4.0",
    "expo-keep-awake": "~12.3.0",
    "expo-camera": "~13.4.0",
    "react": "18.2.0",
    "react-native": "0.72.6",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/stack": "^6.3.17",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screens": "~3.22.0",
    "react-native-gesture-handler": "~2.12.0",
    "@react-native-async-storage/async-storage": "1.18.2",
    "lottie-react-native": "5.1.6",
    "react-native-svg": "13.9.0",
    "expo-notifications": "~0.20.1",
    "react-native-reanimated": "~3.3.0",
    "react-native-purchases": "^7.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  },
  "private": true
}
```

---

## study-buddy/app.json
```json
{
  "expo": {
    "name": "Study Buddy",
    "slug": "study-buddy",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4A90E2"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.focusflow.studybuddy",
      "buildNumber": "1",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Study Buddy needs microphone access to record encouraging messages."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4A90E2"
      },
      "package": "com.focusflow.studybuddy",
      "versionCode": 1,
      "permissions": ["RECORD_AUDIO", "VIBRATE"]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

## study-buddy/babel.config.js
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin']
  };
};
```

---

## study-buddy/App.js
```javascript
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as KeepAwake from 'expo-keep-awake';

import OnboardingScreen from './src/screens/OnboardingScreen';
import ModeSelectionScreen from './src/screens/ModeSelectionScreen';
import MainScreen from './src/screens/MainScreen';
import CalmModeScreen from './src/screens/CalmModeScreen';
import ParentSettingsScreen from './src/screens/ParentSettingsScreen';
import CelebrationScreen from './src/screens/CelebrationScreen';
import { getStorageItem } from './src/utils/storage';

const Stack = createStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
    KeepAwake.activateKeepAwakeAsync();
  }, []);

  const checkFirstLaunch = async () => {
    const hasLaunched = await getStorageItem('hasLaunched');
    setIsFirstLaunch(!hasLaunched);
    setIsLoading(false);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## study-buddy/src/screens/OnboardingScreen.js
```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import LottieView from 'lottie-react-native';
import { setStorageItem } from '../utils/storage';
import { BUDDIES_BY_AGE } from '../assets/animations/buddy-animations';
import { AGE_CONFIGS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [childName, setChildName] = useState('');
  const [recording, setRecording] = useState(null);
  const [step, setStep] = useState('chooseAge'); // chooseAge, chooseBuddy, recordName, ready

  const selectAge = (ageGroup) => {
    setSelectedAge(ageGroup);
    setStep('chooseBuddy');
  };

  const selectBuddy = (buddy) => {
    setSelectedBuddy(buddy);
    const ageConfig = AGE_CONFIGS[selectedAge];
    Speech.speak(`Great choice! I'm ${buddy.name} and I'm excited to study with you!`, {
      language: 'en',
      pitch: ageConfig.voicePitch,
      rate: ageConfig.voiceRate
    });
    setTimeout(() => setStep('recordName'), 2000);
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      Alert.alert('Oops!', 'Could not start recording. You can set this up later!');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    // Save the recording URI
    await setStorageItem('childNameRecording', uri);
    setStep('ready');
    
    const ageConfig = AGE_CONFIGS[selectedAge];
    Speech.speak(ageConfig.completionMessage, {
      language: 'en',
      pitch: ageConfig.voicePitch,
      rate: ageConfig.voiceRate
    });
  };

  const completeOnboarding = async () => {
    await setStorageItem('hasLaunched', 'true');
    await setStorageItem('selectedAge', selectedAge);
    await setStorageItem('selectedBuddy', JSON.stringify(selectedBuddy));
    await setStorageItem('childName', childName || 'Buddy');
    navigation.replace('ModeSelection');
  };

  const renderChooseAge = () => (
    <View style={styles.container}>
      <Text style={styles.title}>How old is your study superstar?</Text>
      <Text style={styles.subtitle}>We'll customize everything for their age!</Text>
      
      <View style={styles.ageContainer}>
        <TouchableOpacity
          style={[styles.ageCard, styles.ageCardYoung]}
          onPress={() => selectAge('young')}
        >
          <Text style={styles.ageEmoji}>🧸</Text>
          <Text style={styles.ageTitle}>Little Learner</Text>
          <Text style={styles.ageRange}>Ages 5-7</Text>
          <Text style={styles.ageDescription}>Big celebrations, short sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ageCard, styles.ageCardElementary]}
          onPress={() => selectAge('elementary')}
        >
          <Text style={styles.ageEmoji}>📚</Text>
          <Text style={styles.ageTitle}>Elementary</Text>
          <Text style={styles.ageRange}>Ages 8-10</Text>
          <Text style={styles.ageDescription}>Balanced support & fun</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ageCard, styles.ageCardTween]}
          onPress={() => selectAge('tween')}
        >
          <Text style={styles.ageEmoji}>🎮</Text>
          <Text style={styles.ageTitle}>Tween</Text>
          <Text style={styles.ageRange}>Ages 11-13</Text>
          <Text style={styles.ageDescription}>Cool & independent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ageCard, styles.ageCardTeen]}
          onPress={() => selectAge('teen')}
        >
          <Text style={styles.ageEmoji}>💪</Text>
          <Text style={styles.ageTitle}>Teen</Text>
          <Text style={styles.ageRange}>Ages 14+</Text>
          <Text style={styles.ageDescription}>Minimal & focused</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChooseBuddy = () => {
    const buddies = BUDDIES_BY_AGE[selectedAge];
    const ageConfig = AGE_CONFIGS[selectedAge];
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{ageConfig.buddySelectionTitle}</Text>
        <Text style={styles.subtitle}>{ageConfig.buddySelectionSubtitle}</Text>
        
        <View style={styles.buddyContainer}>
          {buddies.map((buddy) => (
            <TouchableOpacity
              key={buddy.id}
              style={[styles.buddyCard, selectedBuddy?.id === buddy.id && styles.selectedBuddy]}
              onPress={() => selectBuddy(buddy)}
            >
              <View style={[styles.buddyAvatar, { backgroundColor: buddy.color }]}>
                <Text style={styles.buddyEmoji}>{buddy.emoji}</Text>
              </View>
              <Text style={styles.buddyName}>{buddy.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRecordName = () => {
    const ageConfig = AGE_CONFIGS[selectedAge];
    
    return (
      <View style={styles.container}>
        <View style={[styles.bigBuddyAvatar, { backgroundColor: selectedBuddy?.color }]}>
          <Text style={styles.bigBuddyEmoji}>{selectedBuddy?.emoji}</Text>
        </View>
        
        <Text style={styles.title}>What's Your Name?</Text>
        <Text style={styles.subtitle}>{ageConfig.namePrompt}</Text>
        
        <TouchableOpacity
          style={[styles.recordButton, recording && styles.recordingActive]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Text style={styles.recordButtonText}>
            {recording ? '🎙️ Recording...' : '🎤 Hold to Record'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => setStep('ready')}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReady = () => {
    const ageConfig = AGE_CONFIGS[selectedAge];
    
    return (
      <View style={styles.container}>
        <View style={[styles.bigBuddyAvatar, { backgroundColor: selectedBuddy?.color }]}>
          <Text style={styles.bigBuddyEmoji}>{selectedBuddy?.emoji}</Text>
        </View>
        
        <Text style={styles.title}>We're Ready!</Text>
        <Text style={styles.subtitle}>
          {selectedBuddy?.name} is {ageConfig.readyMessage}
        </Text>
        
        <TouchableOpacity
          style={styles.startButton}
          onPress={completeOnboarding}
        >
          <Text style={styles.startButtonText}>{ageConfig.startButtonText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {step === 'chooseAge' && renderChooseAge()}
      {step === 'chooseBuddy' && renderChooseBuddy()}
      {step === 'recordName' && renderRecordName()}
      {step === 'ready' && renderReady()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    marginBottom: 40,
    textAlign: 'center',
  },
  ageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  ageCard: {
    width: '45%',
    margin: '2.5%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  ageCardYoung: {
    borderColor: '#FFB6C1',
    borderWidth: 2,
  },
  ageCardElementary: {
    borderColor: '#87CEEB',
    borderWidth: 2,
  },
  ageCardTween: {
    borderColor: '#98FB98',
    borderWidth: 2,
  },
  ageCardTeen: {
    borderColor: '#DDA0DD',
    borderWidth: 2,
  },
  ageEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  ageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  ageRange: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  ageDescription: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
  },
  buddyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  buddyCard: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedBuddy: {
    transform: [{ scale: 1.1 }],
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  buddyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buddyEmoji: {
    fontSize: 40,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  bigBuddyAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  bigBuddyEmoji: {
    fontSize: 70,
  },
  recordButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 20,
  },
  recordingActive: {
    backgroundColor: '#C0392B',
    transform: [{ scale: 1.05 }],
  },
  recordButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    color: '#7F8C8D',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 40,
  },
  startButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

---

## study-buddy/src/screens/MainScreen.js
```javascript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  AppState,
  Modal
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Camera } from 'expo-camera';
import { getStorageItem, setStorageItem } from '../utils/storage';
import BuddyCharacter from '../components/BuddyCharacter';
import StudyTimer from '../components/StudyTimer';
import CheckInMessage from '../components/CheckInMessage';
import BigButton from '../components/BigButton';
import { 
  AGE_CONFIGS, 
  SUBJECTS_ELEMENTARY, 
  SUBJECTS_ADVANCED, 
  SUBJECT_CHECK_INS,
  SURPRISE_EVENTS,
  MYSTERY_MONDAY_CHANGES,
  SEASONAL_THEMES 
} from '../utils/constants';

const { width, height } = Dimensions.get('window');

export default function MainScreen({ navigation }) {
  const [buddy, setBuddy] = useState(null);
  const [ageGroup, setAgeGroup] = useState('elementary');
  const [isStudying, setIsStudying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [checkInMessage, setCheckInMessage] = useState('');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [buddyFaded, setBuddyFaded] = useState(false);
  const [workPhoto, setWorkPhoto] = useState(null);
  const [showProofMode, setShowProofMode] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sessionLog, setSessionLog] = useState([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentSurprise, setCurrentSurprise] = useState(null);
  
  const timerInterval = useRef(null);
  const checkInInterval = useRef(null);
  const interactionInterval = useRef(null);
  const fadeTimeout = useRef(null);
  const appState = useRef(AppState.currentState);
  const cameraRef = useRef(null);

  useEffect(() => {
    loadUserData();
    loadSessionData();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (checkInInterval.current) clearInterval(checkInInterval.current);
      if (interactionInterval.current) clearInterval(interactionInterval.current);
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
      subscription?.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (isStudying) {
        showEncouragement();
      }
    }
    appState.current = nextAppState;
  };

  const loadUserData = async () => {
    const buddyData = await getStorageItem('selectedBuddy');
    const age = await getStorageItem('selectedAge');
    if (buddyData) setBuddy(JSON.parse(buddyData));
    if (age) setAgeGroup(age);
  };

  const loadSessionData = async () => {
    const streak = await getStorageItem('currentStreak');
    const totalTime = await getStorageItem('totalFocusTime');
    if (streak) setCurrentStreak(parseInt(streak));
    if (totalTime) setTotalFocusTime(parseInt(totalTime));
  };

  const startStudying = () => {
    // First show subject selection
    setShowSubjectModal(true);
  };

  const selectSubjectAndStart = (subject) => {
    setCurrentSubject(subject);
    setShowSubjectModal(false);
    
    setIsStudying(true);
    setSessionTime(0);
    setBuddyFaded(false);
    setSessionLog([]);
    
    const config = AGE_CONFIGS[ageGroup];
    
    // Check for Mystery Monday
    checkMysteryMonday();
    
    // Check for seasonal theme
    applySeasonalTheme();
    
    // Start timer
    timerInterval.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    
    // Voice check-ins every 5-7 minutes
    const checkInTime = config.checkInFrequency * 60 * 1000;
    checkInInterval.current = setInterval(() => {
      // 5% chance of surprise event
      if (Math.random() < 0.05) {
        showSurpriseEvent();
      } else {
        showCheckInMessage();
      }
    }, checkInTime);
    
    // Two-way interaction every 20-30 minutes
    const interactionTime = (20 + Math.random() * 10) * 60 * 1000;
    interactionInterval.current = setInterval(() => {
      showInteractionPrompt();
    }, interactionTime);
    
    // Fade buddy after 60 seconds
    fadeTimeout.current = setTimeout(() => {
      setBuddyFaded(true);
    }, 60000);
    
    // Initial encouragement
    Speech.speak(`Let's work on ${subject.label}! ${config.startMessage}`, {
      language: 'en',
      pitch: config.voicePitch,
      rate: config.voiceRate
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const checkMysteryMonday = () => {
    const today = new Date();
    if (today.getDay() === 1) { // Monday
      const weekNumber = Math.floor(today.getDate() / 7);
      const change = MYSTERY_MONDAY_CHANGES[weekNumber % MYSTERY_MONDAY_CHANGES.length];
      
      Alert.alert('Mystery Monday! 🎭', change);
      setCurrentSurprise(change);
    }
  };

  const applySeasonalTheme = () => {
    const month = new Date().getMonth();
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    const theme = SEASONAL_THEMES[monthNames[month]];
    
    if (theme) {
      // Could update colors or show seasonal emoji
      // For now, just log it
      console.log(`Seasonal theme: ${theme.name} ${theme.emoji}`);
    }
  };

  const showSurpriseEvent = () => {
    const surprise = SURPRISE_EVENTS[Math.floor(Math.random() * SURPRISE_EVENTS.length)];
    setCurrentSurprise(surprise);
    
    Alert.alert(
      `${surprise.emoji} Surprise!`,
      surprise.message,
      [{ text: 'Awesome!', style: 'default' }]
    );
    
    Speech.speak(surprise.message, {
      language: 'en',
      pitch: 1.2,
      rate: 0.9
    });
    
    // Apply surprise effect
    if (surprise.id === 'power_hour') {
      // Could double points, for now just visual
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const showCheckInMessage = () => {
    const config = AGE_CONFIGS[ageGroup];
    
    // Use subject-specific messages if available
    let messages;
    if (currentSubject && SUBJECT_CHECK_INS[currentSubject.id]) {
      messages = SUBJECT_CHECK_INS[currentSubject.id];
    } else {
      messages = config.checkInMessages;
    }
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCheckInMessage(randomMessage);
    setShowCheckIn(true);
    
    setBuddyFaded(false);
    setTimeout(() => setBuddyFaded(true), 5000);
    
    Speech.speak(randomMessage.replace(/[^\w\s]/gi, ''), {
      language: 'en',
      pitch: config.voicePitch,
      rate: config.voiceRate
    });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setTimeout(() => setShowCheckIn(false), 5000);
  };

  const showInteractionPrompt = () => {
    const questions = [
      {
        id: 'subject',
        text: 'What are you working on?',
        options: [
          { label: 'Math 🔢', value: 'math' },
          { label: 'Reading 📚', value: 'reading' },
          { label: 'Writing ✏️', value: 'writing' },
          { label: 'Other 📝', value: 'other' }
        ]
      },
      {
        id: 'progress',
        text: 'How much have you finished?',
        options: [
          { label: 'All done! ✅', value: 'complete' },
          { label: 'Most 🔵', value: 'most' },
          { label: 'Half 🟡', value: 'half' },
          { label: 'Just started 🔴', value: 'started' }
        ]
      },
      {
        id: 'difficulty',
        text: "How's it going?",
        options: [
          { label: 'Easy! 😊', value: 'easy' },
          { label: 'OK 😐', value: 'ok' },
          { label: 'Hard 😟', value: 'hard' },
          { label: 'Need help 🆘', value: 'help' }
        ]
      }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setShowInteractionModal(true);
    
    // Pause timer if no response in 30 seconds
    setTimeout(() => {
      if (showInteractionModal) {
        pauseSession();
        Alert.alert('Timer Paused', 'Tap to continue when ready!');
      }
    }, 30000);
    
    Speech.speak(randomQuestion.text, {
      language: 'en',
      pitch: AGE_CONFIGS[ageGroup].voicePitch,
      rate: AGE_CONFIGS[ageGroup].voiceRate
    });
  };

  const handleInteractionResponse = (response) => {
    const logEntry = {
      time: sessionTime,
      question: currentQuestion.id,
      response: response.value,
      timestamp: new Date().toISOString()
    };
    
    setSessionLog([...sessionLog, logEntry]);
    setShowInteractionModal(false);
    
    // Handle special responses
    if (response.value === 'help') {
      Alert.alert(
        'Need Help?',
        'Should I let your parent know?',
        [
          { text: 'No, I\'ll keep trying', style: 'cancel' },
          { text: 'Yes please', onPress: () => {
            // In real app, would send notification to parent
            Alert.alert('Help is on the way!', 'Keep trying, someone will check on you soon.');
          }}
        ]
      );
    } else {
      // Encouraging response
      const encouragements = {
        easy: "Great! Keep crushing it!",
        ok: "Nice steady progress!",
        hard: "You're doing great even though it's tough!",
        complete: "Amazing! You finished!",
        most: "Almost there, fantastic!",
        half: "Halfway is great progress!",
        started: "Good start, keep going!"
      };
      
      if (encouragements[response.value]) {
        Speech.speak(encouragements[response.value], {
          language: 'en',
          pitch: AGE_CONFIGS[ageGroup].voicePitch,
          rate: AGE_CONFIGS[ageGroup].voiceRate
        });
      }
    }
  };

  const pauseSession = () => {
    clearInterval(timerInterval.current);
    clearInterval(checkInInterval.current);
    clearInterval(interactionInterval.current);
    setIsStudying(false);
  };

  const takeBreak = () => {
    const config = AGE_CONFIGS[ageGroup];
    Alert.alert(
      config.breakTitle,
      config.breakMessage,
      [
        {
          text: "Start Break",
          onPress: () => {
            pauseSession();
            saveSessionData();
            
            setTimeout(() => {
              Alert.alert(
                "Break's Over!",
                "Ready to get back to work?",
                [
                  { text: "5 More Minutes", style: "cancel" },
                  { text: config.resumeButtonText, onPress: startStudying }
                ]
              );
            }, config.breakDuration * 60 * 1000);
          }
        },
        {
          text: "Keep Working",
          style: "cancel"
        }
      ]
    );
  };

  const takeWorkPhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setShowProofMode(true);
    } else {
      Alert.alert('Camera Permission', 'We need camera access for one photo of your work (optional)');
    }
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setWorkPhoto(photo.uri);
      setShowProofMode(false);
      await setStorageItem('lastWorkPhoto', photo.uri);
      Alert.alert('Great Work!', 'Your completed homework has been saved!');
    }
  };

  const endSession = () => {
    const config = AGE_CONFIGS[ageGroup];
    
    if (ageGroup === 'tween' || ageGroup === 'teen') {
      Alert.alert(
        'Show Your Work!',
        'Take a photo of your completed homework?',
        [
          { text: 'Skip', onPress: () => completeSession() },
          { text: 'Take Photo', onPress: () => {
            takeWorkPhoto();
            completeSession();
          }}
        ]
      );
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    pauseSession();
    clearTimeout(fadeTimeout.current);
    
    saveSessionData();
    
    navigation.navigate('Celebration', {
      sessionTime: sessionTime,
      totalTime: totalFocusTime + sessionTime,
      streak: currentStreak + 1,
      ageGroup: ageGroup,
      workPhoto: workPhoto,
      sessionLog: sessionLog
    });
  };

  const saveSessionData = async () => {
    const newTotalTime = totalFocusTime + sessionTime;
    const newStreak = currentStreak + 1;
    
    await setStorageItem('totalFocusTime', newTotalTime.toString());
    await setStorageItem('currentStreak', newStreak.toString());
    await setStorageItem('lastSessionDate', new Date().toISOString());
    await setStorageItem('lastSessionLog', JSON.stringify(sessionLog));
    
    setTotalFocusTime(newTotalTime);
    setCurrentStreak(newStreak);
  };

  const showEncouragement = () => {
    const config = AGE_CONFIGS[ageGroup];
    Speech.speak(config.welcomeBackMessage, {
      language: 'en',
      pitch: config.voicePitch,
      rate: config.voiceRate
    });
  };

  const openParentSettings = () => {
    const config = AGE_CONFIGS[ageGroup];
    Alert.alert(
      "Parent Access",
      config.parentGateQuestion,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: config.parentGateAnswer,
          onPress: () => navigation.navigate('ParentSettings', { sessionLog })
        }
      ]
    );
  };

  if (showProofMode) {
    return (
      <Camera style={styles.camera} ref={cameraRef}>
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraText}>Show your completed work!</Text>
          <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
            <Text style={styles.captureButtonText}>📸</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    );
  }

  const config = AGE_CONFIGS[ageGroup];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openParentSettings} style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>🔥 {currentStreak} {config.streakLabel}</Text>
          </View>
        </View>

        <BuddyCharacter 
          buddy={buddy} 
          isStudying={isStudying}
          isFaded={buddyFaded}
          ageGroup={ageGroup}
          style={styles.buddyContainer}
        />

        {showCheckIn && (
          <CheckInMessage message={checkInMessage} ageGroup={ageGroup} />
        )}

        {isStudying && (
          <StudyTimer seconds={sessionTime} ageGroup={ageGroup} />
        )}

        <View style={styles.buttonContainer}>
          {!isStudying ? (
            <BigButton 
              title={config.startButtonText}
              onPress={startStudying}
              color={config.primaryColor}
            />
          ) : (
            <>
              <BigButton 
                title={config.breakButtonText}
                onPress={takeBreak}
                color="#F39C12"
              />
              <BigButton 
                title={config.endButtonText}
                onPress={endSession}
                color="#E74C3C"
                style={{ marginTop: 20 }}
              />
            </>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {config.statsLabel}: {Math.floor(totalFocusTime / 60)} minutes
          </Text>
        </View>
      </View>

      {/* Two-Way Interaction Modal */}
      <Modal
        visible={showInteractionModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentQuestion?.text}</Text>
            <View style={styles.optionsContainer}>
              {currentQuestion?.options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.optionButton}
                  onPress={() => handleInteractionResponse(option)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  settingsButton: {
    padding: 10,
  },
  settingsIcon: {
    fontSize: 24,
  },
  streakContainer: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
  },
  buddyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    paddingVertical: 30,
  },
  statsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statsText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  cameraText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    fontSize: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#F0F8FF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  subjectButton: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    margin: 8,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  subjectEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  subjectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  surpriseBanner: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  surpriseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});
```

---

## study-buddy/src/screens/ParentSettingsScreen.js
```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Slider,
  Alert
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { getStorageItem, setStorageItem } from '../utils/storage';

export default function ParentSettingsScreen({ navigation, route }) {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [checkInFrequency, setCheckInFrequency] = useState(5);
  const [interactionFrequency, setInteractionFrequency] = useState(20);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [twoWayInteraction, setTwoWayInteraction] = useState(true);
  const [encouragementMessages, setEncouragementMessages] = useState([]);
  const [recording, setRecording] = useState(null);
  const [lastSessionLog, setLastSessionLog] = useState([]);

  useEffect(() => {
    loadSettings();
    loadSessionLog();
  }, []);

  const loadSettings = async () => {
    const work = await getStorageItem('workDuration');
    const breakTime = await getStorageItem('breakDuration');
    const checkIn = await getStorageItem('checkInFrequency');
    const interaction = await getStorageItem('interactionFrequency');
    const sound = await getStorageItem('soundEnabled');
    const vibration = await getStorageItem('vibrationEnabled');
    const twoWay = await getStorageItem('twoWayInteraction');
    
    if (work) setWorkDuration(parseInt(work));
    if (breakTime) setBreakDuration(parseInt(breakTime));
    if (checkIn) setCheckInFrequency(parseInt(checkIn));
    if (interaction) setInteractionFrequency(parseInt(interaction));
    if (sound !== null) setSoundEnabled(sound === 'true');
    if (vibration !== null) setVibrationEnabled(vibration === 'true');
    if (twoWay !== null) setTwoWayInteraction(twoWay === 'true');
  };

  const loadSessionLog = async () => {
    const log = await getStorageItem('lastSessionLog');
    if (log) {
      setLastSessionLog(JSON.parse(log));
    }
    // Also get from route params if available
    if (route.params?.sessionLog) {
      setLastSessionLog(route.params.sessionLog);
    }
  };

  const saveSettings = async () => {
    await setStorageItem('workDuration', workDuration.toString());
    await setStorageItem('breakDuration', breakDuration.toString());
    await setStorageItem('checkInFrequency', checkInFrequency.toString());
    await setStorageItem('interactionFrequency', interactionFrequency.toString());
    await setStorageItem('soundEnabled', soundEnabled.toString());
    await setStorageItem('vibrationEnabled', vibrationEnabled.toString());
    await setStorageItem('twoWayInteraction', twoWayInteraction.toString());
    
    Alert.alert('Success!', 'Settings saved successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const startRecordingMessage = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      
      Alert.alert('Recording', 'Say your encouraging message now!');
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecordingMessage = async () => {
    if (!recording) return;
    
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    const messages = [...encouragementMessages, uri];
    setEncouragementMessages(messages);
    await setStorageItem('encouragementMessages', JSON.stringify(messages));
    
    Alert.alert('Success!', 'Your message has been saved!');
  };

  const resetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'This will reset all progress and streaks. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await setStorageItem('currentStreak', '0');
            await setStorageItem('totalFocusTime', '0');
            Alert.alert('Reset Complete', 'All progress has been reset.');
          }
        }
      ]
    );
  };

  const formatSessionLog = () => {
    if (!lastSessionLog || lastSessionLog.length === 0) {
      return 'No interaction data from last session';
    }

    return lastSessionLog.map((entry, index) => {
      const time = Math.floor(entry.time / 60);
      const responses = {
        math: '📊 Math',
        reading: '📚 Reading',
        writing: '✏️ Writing',
        other: '📝 Other',
        easy: '😊 Easy',
        ok: '😐 OK',
        hard: '😟 Hard',
        help: '🆘 Need help',
        complete: '✅ Complete',
        most: '🔵 Most done',
        half: '🟡 Half done',
        started: '🔴 Just started'
      };
      
      return `${time} min: ${responses[entry.response] || entry.response}`;
    }).join('\n');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Parent Settings</Text>
        </View>

        {/* Session Report */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Session Report</Text>
          <Text style={styles.sessionLog}>{formatSessionLog()}</Text>
        </View>

        {/* Timer Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timer Settings</Text>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Work Duration: {workDuration} minutes</Text>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={45}
              step={5}
              value={workDuration}
              onValueChange={setWorkDuration}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="#D0D0D0"
            />
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Break Duration: {breakDuration} minutes</Text>
            <Slider
              style={styles.slider}
              minimumValue={3}
              maximumValue={15}
              step={1}
              value={breakDuration}
              onValueChange={setBreakDuration}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="#D0D0D0"
            />
          </View>
        </View>

        {/* Interaction Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-In Settings</Text>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Voice Check-in Every: {checkInFrequency} minutes</Text>
            <Slider
              style={styles.slider}
              minimumValue={3}
              maximumValue={10}
              step={1}
              value={checkInFrequency}
              onValueChange={setCheckInFrequency}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="#D0D0D0"
            />
          </View>

          <View style={styles.switchSetting}>
            <Text style={styles.settingLabel}>Two-Way Interaction</Text>
            <Switch
              value={twoWayInteraction}
              onValueChange={setTwoWayInteraction}
              trackColor={{ false: '#D0D0D0', true: '#4A90E2' }}
            />
          </View>

          {twoWayInteraction && (
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>Ask Questions Every: {interactionFrequency} minutes</Text>
              <Slider
                style={styles.slider}
                minimumValue={15}
                maximumValue={30}
                step={5}
                value={interactionFrequency}
                onValueChange={setInteractionFrequency}
                minimumTrackTintColor="#4A90E2"
                maximumTrackTintColor="#D0D0D0"
              />
            </View>
          )}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.switchSetting}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#D0D0D0', true: '#4A90E2' }}
            />
          </View>

          <View style={styles.switchSetting}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: '#D0D0D0', true: '#4A90E2' }}
            />
          </View>
        </View>

        {/* Custom Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Encouragement</Text>
          
          <TouchableOpacity
            style={[styles.recordButton, recording && styles.recordingActive]}
            onPress={recording ? stopRecordingMessage : startRecordingMessage}
          >
            <Text style={styles.recordButtonText}>
              {recording ? '⏹️ Stop Recording' : '🎤 Record Message'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.hint}>
            Record encouraging messages in your voice for check-ins!
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetProgress}>
            <Text style={styles.resetButtonText}>Reset All Progress</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    fontSize: 18,
    color: '#4A90E2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  setting: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  switchSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recordButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: '#C0392B',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 10,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## study-buddy/src/screens/CelebrationScreen.js
```javascript
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Share,
  Modal
} from 'react-native';
import LottieView from 'lottie-react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { setStorageItem, getStorageItem } from '../utils/storage';

const { width, height } = Dimensions.get('window');

export default function CelebrationScreen({ navigation, route }) {
  const { sessionTime, totalTime, streak, ageGroup, workPhoto, sessionLog } = route.params;
  const animationRef = useRef(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [whatWorked, setWhatWorked] = useState([]);

  useEffect(() => {
    celebrate();
    // Show feedback modal after 3 seconds
    setTimeout(() => setShowFeedback(true), 3000);
  }, []);

  const celebrate = () => {
    // Play celebration sound
    Speech.speak("Amazing job! You did it! I'm so proud of you!", {
      language: 'en',
      pitch: 1.2,
      rate: 0.9
    });

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Play animation
    if (animationRef.current) {
      animationRef.current.play();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareSuccess = async () => {
    try {
      await Share.share({
        message: `🎉 My child just completed ${Math.floor(sessionTime / 60)} minutes of focused study time with Study Buddy! ${streak} day streak! 🔥`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getAchievementBadge = () => {
    if (sessionTime >= 1800) return '🏆'; // 30+ minutes
    if (sessionTime >= 1200) return '🥇'; // 20+ minutes
    if (sessionTime >= 600) return '🥈'; // 10+ minutes
    return '🥉'; // Under 10 minutes
  };

  const getEncouragementMessage = () => {
    if (sessionTime >= 1800) return "Incredible focus! You're a study champion!";
    if (sessionTime >= 1200) return "Amazing work! You stayed focused so well!";
    if (sessionTime >= 600) return "Great job! You're building strong study habits!";
    return "Good start! Every minute counts!";
  };

  const handleWhatWorked = async (item) => {
    const newWhatWorked = whatWorked.includes(item) 
      ? whatWorked.filter(i => i !== item)
      : [...whatWorked, item];
    
    setWhatWorked(newWhatWorked);
  };

  const saveFeedback = async () => {
    // Save what worked for analytics
    const feedbackData = {
      whatWorked: whatWorked,
      sessionTime: sessionTime,
      timestamp: new Date().toISOString()
    };
    
    const existingFeedback = await getStorageItem('feedbackHistory');
    const history = existingFeedback ? JSON.parse(existingFeedback) : [];
    history.push(feedbackData);
    
    // Keep only last 30 sessions
    if (history.length > 30) {
      history.shift();
    }
    
    await setStorageItem('feedbackHistory', JSON.stringify(history));
    setShowFeedback(false);
    
    // Navigate to mode selection
    navigation.navigate('ModeSelection');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Celebration Animation */}
        <View style={styles.animationContainer}>
          <Text style={styles.trophy}>{getAchievementBadge()}</Text>
          <LottieView
            ref={animationRef}
            source={require('../assets/animations/confetti.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.title}>Amazing Job! 🎉</Text>
          <Text style={styles.message}>{getEncouragementMessage()}</Text>
          
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Today's Focus Time</Text>
            <Text style={styles.statValue}>{formatTime(sessionTime)}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Current Streak</Text>
            <Text style={styles.statValue}>🔥 {streak} days</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Focus Time</Text>
            <Text style={styles.statValue}>{Math.floor(totalTime / 60)} minutes</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={shareSuccess}>
            <Text style={styles.shareButtonText}>Share Success! 📤</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={() => setShowFeedback(true)}
          >
            <Text style={styles.doneButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* What Worked Feedback Modal */}
      <Modal
        visible={showFeedback}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What helped you today?</Text>
            <Text style={styles.modalSubtitle}>Pick all that helped!</Text>
            
            <View style={styles.feedbackContainer}>
              <TouchableOpacity
                style={[styles.feedbackButton, whatWorked.includes('buddy') && styles.feedbackSelected]}
                onPress={() => handleWhatWorked('buddy')}
              >
                <Text style={styles.feedbackEmoji}>🤖</Text>
                <Text style={styles.feedbackText}>Buddy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.feedbackButton, whatWorked.includes('timer') && styles.feedbackSelected]}
                onPress={() => handleWhatWorked('timer')}
              >
                <Text style={styles.feedbackEmoji}>⏰</Text>
                <Text style={styles.feedbackText}>Timer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.feedbackButton, whatWorked.includes('checkins') && styles.feedbackSelected]}
                onPress={() => handleWhatWorked('checkins')}
              >
                <Text style={styles.feedbackEmoji}>💬</Text>
                <Text style={styles.feedbackText}>Check-ins</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.feedbackButton, whatWorked.includes('breaks') && styles.feedbackSelected]}
                onPress={() => handleWhatWorked('breaks')}
              >
                <Text style={styles.feedbackEmoji}>🌟</Text>
                <Text style={styles.feedbackText}>Breaks</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>How do you feel?</Text>
            
            <View style={styles.feelingContainer}>
              <TouchableOpacity
                style={styles.feelingButton}
                onPress={saveFeedback}
              >
                <Text style={styles.feelingEmoji}>😊</Text>
                <Text style={styles.feelingText}>Great!</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.feelingButton}
                onPress={saveFeedback}
              >
                <Text style={styles.feelingEmoji}>🙂</Text>
                <Text style={styles.feelingText}>Good</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.feelingButton}
                onPress={saveFeedback}
              >
                <Text style={styles.feelingEmoji}>😐</Text>
                <Text style={styles.feelingText}>OK</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.feelingButton}
                onPress={saveFeedback}
              >
                <Text style={styles.feelingEmoji}>😴</Text>
                <Text style={styles.feelingText}>Tired</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                setShowFeedback(false);
                navigation.navigate('ModeSelection');
              }}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  trophy: {
    fontSize: 100,
    position: 'absolute',
    zIndex: 1,
  },
  lottie: {
    width: width,
    height: 200,
    position: 'absolute',
  },
  statsContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 15,
    minWidth: width * 0.7,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  shareButton: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    marginTop: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  feedbackContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  feedbackButton: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 15,
    margin: 5,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  feedbackSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  feedbackEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 12,
    color: '#2C3E50',
  },
  feelingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  feelingButton: {
    alignItems: 'center',
    padding: 10,
  },
  feelingEmoji: {
    fontSize: 35,
    marginBottom: 5,
  },
  feelingText: {
    fontSize: 12,
    color: '#2C3E50',
  },
  skipButton: {
    marginTop: 10,
    padding: 10,
  },
  skipText: {
    color: '#7F8C8D',
    fontSize: 14,
  },
});
```

---

## study-buddy/src/components/BuddyCharacter.js
```javascript
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { AGE_CONFIGS } from '../utils/constants';

export default function BuddyCharacter({ buddy, isStudying, isFaded, ageGroup = 'elementary', style }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade effect to prevent staring
    if (isStudying && isFaded) {
      Animated.timing(fadeAnim, {
        toValue: 0.3, // Fade to 30% opacity
        duration: 2000,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isFaded, isStudying]);

  useEffect(() => {
    if (isStudying) {
      // Gentle breathing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Idle animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isStudying]);

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  if (!buddy) return null;

  // Get age-appropriate sizing
  const config = AGE_CONFIGS[ageGroup] || AGE_CONFIGS.elementary;
  const buddySize = ageGroup === 'teen' ? 120 : ageGroup === 'tween' ? 150 : 180;

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { rotate: isStudying ? '0deg' : spin }
          ]
        }
      ]}
    >
      <View style={[
        styles.buddyCircle, 
        { 
          backgroundColor: buddy.color,
          width: buddySize,
          height: buddySize,
          borderRadius: buddySize / 2,
        }
      ]}>
        <Text style={[styles.buddyEmoji, { fontSize: buddySize * 0.44 }]}>
          {buddy.emoji}
        </Text>
      </View>
      {isStudying && !isFaded && (
        <View style={styles.studyingIndicator}>
          <Text style={styles.studyingText}>
            {ageGroup === 'teen' ? '📱' : ageGroup === 'tween' ? '💻' : '📚'} 
            {ageGroup === 'teen' ? 'Focus' : ageGroup === 'tween' ? 'Working' : 'Studying'}...
          </Text>
        </View>
      )}
      {isFaded && (
        <Text style={styles.fadedMessage}>👀 Eyes on your work!</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  buddyCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  buddyEmoji: {
    // Size set dynamically
  },
  studyingIndicator: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studyingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  fadedMessage: {
    position: 'absolute',
    bottom: -30,
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});
```

---

## study-buddy/src/components/StudyTimer.js
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StudyTimer({ seconds }) {
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (seconds < 300) return '#27AE60'; // Green for first 5 minutes
    if (seconds < 900) return '#F39C12'; // Orange for 5-15 minutes
    if (seconds < 1800) return '#3498DB'; // Blue for 15-30 minutes
    return '#9B59B6'; // Purple for 30+ minutes
  };

  return (
    <View style={[styles.container, { backgroundColor: getTimerColor() }]}>
      <Text style={styles.label}>Focus Time</Text>
      <Text style={styles.time}>{formatTime(seconds)}</Text>
      {seconds > 0 && seconds % 300 === 0 && (
        <Text style={styles.milestone}>🎉 {Math.floor(seconds / 60)} minutes!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 5,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  milestone: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
});
```

---

## study-buddy/src/components/CheckInMessage.js
```javascript
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function CheckInMessage({ message }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // Fade in and slide down
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade out after 4 seconds
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 4000);
  }, [message]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 1000,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});
```

---

## study-buddy/src/components/BigButton.js
```javascript
import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function BigButton({ title, onPress, color = '#4A90E2', style }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: color }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
```

---

## study-buddy/src/utils/storage.js
```javascript
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
```

---

## study-buddy/src/utils/audio.js
```javascript
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export const playSound = async (soundFile) => {
  try {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
    
    // Unload sound after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
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
```

---

## study-buddy/src/utils/constants.js
```javascript
export const AGE_CONFIGS = {
  young: {
    ageRange: '5-7',
    sessionLength: 10,
    checkInFrequency: 2, // minutes
    breakDuration: 3,
    voicePitch: 1.3,
    voiceRate: 0.8,
    primaryColor: '#FFB6C1',
    buddySelectionTitle: 'Pick Your Friend!',
    buddySelectionSubtitle: 'Who will help you today?',
    namePrompt: 'Tell me your name, superstar!',
    readyMessage: 'so excited to be your friend!',
    startButtonText: 'Let\'s Learn! 🌈',
    breakButtonText: 'Break Time! 🎈',
    endButtonText: 'All Done! 🌟',
    breakTitle: 'Wiggle Break! 🎉',
    breakMessage: 'Time to jump, dance, or get a snack!',
    resumeButtonText: 'More Learning!',
    streakLabel: 'day streak',
    statsLabel: 'Learning time',
    startMessage: 'Yay! Let\'s learn together! You\'re amazing!',
    welcomeBackMessage: 'Welcome back superstar!',
    completionMessage: 'Amazing job! You\'re a superstar!',
    checkInMessages: [
      'You\'re doing AMAZING! 🌟',
      'Wow! Look at you go! 🚀',
      'Super duper job! 🌈',
      'You\'re the best! 💖',
      'Keep being awesome! ⭐'
    ],
    parentGateQuestion: 'What\'s 7 + 8?',
    parentGateAnswer: '15'
  },
  elementary: {
    ageRange: '8-10',
    sessionLength: 15,
    checkInFrequency: 5,
    breakDuration: 5,
    voicePitch: 1.1,
    voiceRate: 0.9,
    primaryColor: '#87CEEB',
    buddySelectionTitle: 'Choose Your Buddy!',
    buddySelectionSubtitle: 'Pick your study partner!',
    namePrompt: 'What should I call you?',
    readyMessage: 'ready to help you focus!',
    startButtonText: 'Start Studying! 📚',
    breakButtonText: 'Break Time! 🌟',
    endButtonText: 'Finished! 🎉',
    breakTitle: 'Break Time!',
    breakMessage: 'Great work! Take 5 minutes to stretch or grab water.',
    resumeButtonText: 'Back to Work!',
    streakLabel: 'day streak',
    statsLabel: 'Study time',
    startMessage: 'Let\'s do this! I\'m right here with you.',
    welcomeBackMessage: 'Welcome back! Ready to continue?',
    completionMessage: 'Excellent work! You did it!',
    checkInMessages: [
      'Great focus! Keep it up! 🌟',
      'You\'re doing awesome! 💪',
      'Nice work! Stay strong! 🚀',
      'Fantastic job! 🎯',
      'Keep going, you\'ve got this! ⭐'
    ],
    parentGateQuestion: 'What\'s 23 + 19?',
    parentGateAnswer: '42'
  },
  tween: {
    ageRange: '11-13',
    sessionLength: 20,
    checkInFrequency: 7,
    breakDuration: 5,
    voicePitch: 1.0,
    voiceRate: 0.95,
    primaryColor: '#98FB98',
    buddySelectionTitle: 'Pick Your Focus Friend',
    buddySelectionSubtitle: 'Choose your style',
    namePrompt: 'What\'s your name?',
    readyMessage: 'here to help you crush it!',
    startButtonText: 'Let\'s Go 💪',
    breakButtonText: 'Quick Break',
    endButtonText: 'Done ✓',
    breakTitle: 'Break Time',
    breakMessage: 'Good session. Take 5.',
    resumeButtonText: 'Continue',
    streakLabel: 'days',
    statsLabel: 'Focus time',
    startMessage: 'Let\'s get this done.',
    welcomeBackMessage: 'Back at it. Nice.',
    completionMessage: 'Solid work today.',
    checkInMessages: [
      'Keep pushing 💪',
      'Nice focus 🎯',
      'Doing great 👍',
      'Almost there ⚡',
      'Stay strong 🔥'
    ],
    parentGateQuestion: 'What\'s 47 + 38?',
    parentGateAnswer: '85'
  },
  teen: {
    ageRange: '14+',
    sessionLength: 25,
    checkInFrequency: 10,
    breakDuration: 5,
    voicePitch: 0.95,
    voiceRate: 1.0,
    primaryColor: '#DDA0DD',
    buddySelectionTitle: 'Focus Mode',
    buddySelectionSubtitle: 'Select your vibe',
    namePrompt: 'Name (optional)',
    readyMessage: 'ready.',
    startButtonText: 'Start',
    breakButtonText: 'Break',
    endButtonText: 'End',
    breakTitle: 'Break',
    breakMessage: '5 minute break.',
    resumeButtonText: 'Resume',
    streakLabel: 'days',
    statsLabel: 'Total',
    startMessage: 'Focus mode activated.',
    welcomeBackMessage: 'Resuming.',
    completionMessage: 'Session complete.',
    checkInMessages: [
      'In the zone 🎯',
      'Solid 💯',
      'Keep going 📈',
      'Progress ✓',
      'On track 🎪'
    ],
    parentGateQuestion: 'What\'s 127 + 89?',
    parentGateAnswer: '216'
  }
};

// Subject configurations
export const SUBJECTS_ELEMENTARY = [
  { id: 'math', label: 'Math', emoji: '🔢' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'writing', label: 'Writing', emoji: '✏️' },
  { id: 'other', label: 'Other', emoji: '📝' }
];

export const SUBJECTS_ADVANCED = [
  { id: 'math', label: 'Math', emoji: '🔢' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'writing', label: 'Writing', emoji: '✏️' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'chemistry', label: 'Chemistry', emoji: '⚗️' },
  { id: 'biology', label: 'Biology', emoji: '🧬' },
  { id: 'history', label: 'History', emoji: '🏛️' },
  { id: 'geography', label: 'Geography', emoji: '🌍' }
];

export const SUBJECT_CHECK_INS = {
  math: [
    'Check your calculations!',
    'Show your work!',
    'One problem at a time',
    'Double-check that answer',
    'Remember your formulas'
  ],
  reading: [
    'What\'s happening now?',
    'Who\'s the main character?',
    'What do you think happens next?',
    'Picture the scene',
    'Keep going, great reading!'
  ],
  writing: [
    'Check your spelling!',
    'Add more details',
    'How many sentences so far?',
    'Remember punctuation',
    'Great writing flow!'
  ],
  science: [
    'Test your hypothesis',
    'Check your method',
    'What\'s the evidence?',
    'Think like a scientist',
    'Record your observations'
  ],
  chemistry: [
    'Balance those equations!',
    'Check your formulas',
    'Remember units!',
    'Think about reactions',
    'Safety first!'
  ],
  biology: [
    'Think about the process',
    'Draw it out if it helps',
    'Check your terms',
    'Remember the system',
    'Life is amazing!'
  ],
  history: [
    'Dates and names matter',
    'What caused this?',
    'Think about the timeline',
    'Connect the events',
    'History repeats!'
  ],
  geography: [
    'Picture the map',
    'Remember locations',
    'Think about connections',
    'Climate matters',
    'Explore the world!'
  ],
  other: [
    'Keep it up!',
    'You\'re doing great!',
    'Stay focused!',
    'Almost there!',
    'Excellent work!'
  ]
};

// Surprise mechanics
export const SURPRISE_EVENTS = [
  { id: 'power_hour', message: 'Power Hour! Everything counts double!', emoji: '⚡' },
  { id: 'buddy_birthday', message: 'It\'s Buddy\'s Birthday!', emoji: '🎂' },
  { id: 'opposite_day', message: 'Opposite Day! Breaks are longer!', emoji: '🔄' },
  { id: 'challenge_mode', message: 'Challenge Mode! Beat yesterday!', emoji: '🏆' },
  { id: 'guest_buddy', message: 'Guest Buddy visiting!', emoji: '👋' },
  { id: 'speed_round', message: 'Speed Round! Quick focus!', emoji: '💨' },
  { id: 'quiet_mode', message: 'Shh... Library Mode!', emoji: '🤫' },
  { id: 'party_mode', message: 'Party Mode! Extra celebrations!', emoji: '🎉' }
];

export const MYSTERY_MONDAY_CHANGES = [
  'Buddy has a hat today!',
  'Timer counts UP instead of down!',
  'Everything is backwards!',
  'Night mode activated!',
  'Speed mode - shorter sessions!',
  'Buddy is feeling quiet today',
  'Double points day!',
  'Surprise colors everywhere!'
];

export const SEASONAL_THEMES = {
  january: { name: 'New Year', emoji: '🎊', color: '#FFD700' },
  february: { name: 'Hearts', emoji: '💝', color: '#FF69B4' },
  march: { name: 'Spring', emoji: '🌸', color: '#98FB98' },
  april: { name: 'Rain', emoji: '🌧️', color: '#87CEEB' },
  may: { name: 'Flowers', emoji: '🌺', color: '#FF6347' },
  june: { name: 'Summer', emoji: '☀️', color: '#FFD700' },
  july: { name: 'Beach', emoji: '🏖️', color: '#20B2AA' },
  august: { name: 'Back to School', emoji: '🎒', color: '#FF8C00' },
  september: { name: 'Fall', emoji: '🍂', color: '#D2691E' },
  october: { name: 'Halloween', emoji: '🎃', color: '#FF8C00' },
  november: { name: 'Thankful', emoji: '🦃', color: '#8B4513' },
  december: { name: 'Winter', emoji: '❄️', color: '#00CED1' }
};

export const WORK_DURATIONS = [10, 15, 20, 25, 30, 35, 40, 45];
export const BREAK_DURATIONS = [3, 5, 7, 10, 15];
export const CHECK_IN_FREQUENCIES = [2, 3, 5, 7, 10];

export const COLORS = {
  primary: '#4A90E2',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  purple: '#9B59B6',
  dark: '#2C3E50',
  gray: '#7F8C8D',
  lightGray: '#ECF0F1',
  background: '#F0F8FF',
};
```
```

---

## study-buddy/src/assets/animations/buddy-animations.js
```javascript
// Age-specific buddy designs
export const BUDDIES_BY_AGE = {
  young: [
    {
      id: 'bunny',
      name: 'Bouncy',
      emoji: '🐰',
      color: '#FFB6C1',
      personality: 'super excited and encouraging',
      sounds: ['boing', 'yay'],
    },
    {
      id: 'unicorn',
      name: 'Sparkles',
      emoji: '🦄',
      color: '#E6E6FA',
      personality: 'magical and supportive',
      sounds: ['sparkle', 'magic'],
    },
    {
      id: 'dino',
      name: 'Rex',
      emoji: '🦕',
      color: '#98FB98',
      personality: 'friendly and brave',
      sounds: ['roar', 'stomp'],
    },
  ],
  elementary: [
    {
      id: 'cat',
      name: 'Whiskers',
      emoji: '🐱',
      color: '#FFD93D',
      personality: 'playful and encouraging',
      sounds: ['purr', 'meow'],
    },
    {
      id: 'dog',
      name: 'Buddy',
      emoji: '🐶',
      color: '#8B4513',
      personality: 'loyal and supportive',
      sounds: ['woof', 'bark'],
    },
    {
      id: 'robot',
      name: 'Beep',
      emoji: '🤖',
      color: '#C0C0C0',
      personality: 'smart and helpful',
      sounds: ['beep', 'boop'],
    },
  ],
  tween: [
    {
      id: 'dragon',
      name: 'Blaze',
      emoji: '🐉',
      color: '#FF6B6B',
      personality: 'cool and powerful',
      sounds: ['roar', 'fire'],
    },
    {
      id: 'wolf',
      name: 'Shadow',
      emoji: '🐺',
      color: '#4A5568',
      personality: 'focused and strong',
      sounds: ['howl', 'growl'],
    },
    {
      id: 'alien',
      name: 'Cosmic',
      emoji: '👽',
      color: '#00D9FF',
      personality: 'chill and mysterious',
      sounds: ['beep', 'whoosh'],
    },
  ],
  teen: [
    {
      id: 'geometric',
      name: 'Hex',
      emoji: '⬡',
      color: '#7C3AED',
      personality: 'minimal and focused',
      sounds: ['pulse', 'hum'],
    },
    {
      id: 'plant',
      name: 'Zen',
      emoji: '🌱',
      color: '#10B981',
      personality: 'calm and growing',
      sounds: ['rustle', 'grow'],
    },
    {
      id: 'orb',
      name: 'Focus',
      emoji: '🔮',
      color: '#EC4899',
      personality: 'mystical and serene',
      sounds: ['chime', 'glow'],
    },
  ],
};

// Fallback for old code
export const BUDDIES = BUDDIES_BY_AGE.elementary;

// Placeholder for actual Lottie animations
// In production, you would have actual .json animation files
export const ANIMATIONS = {
  studying: 'studying.json',
  celebrating: 'celebrating.json',
  idle: 'idle.json',
  encouraging: 'encouraging.json',
};

// For the confetti animation in CelebrationScreen
// You would need to add an actual confetti.json Lottie file
// You can get free ones from https://lottiefiles.com/
```

---

## study-buddy/README.md
```markdown
# Study Buddy - ADHD Focus Friend

A simple, focused app that provides a virtual "body double" for children with ADHD to help them stay on task during homework and study time.

## 🎯 Core Concept

Study Buddy is a virtual companion that sits with your child while they work, providing gentle encouragement and accountability without the need for constant parent supervision.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (Windows/Mac/Linux)
- Expo Go app on your phone for testing

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/study-buddy.git
cd study-buddy
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
expo start
```

4. Run on your device
- Scan QR code with Expo Go (Android)
- Scan QR code with Camera (iOS)

### Building for Production

#### iOS
```bash
expo build:ios
```

#### Android
```bash
expo build:android
```

## 📱 Features

### MVP Features (Current)
- 🐱 Choose from 3 study buddy characters
- 🎤 Record child's name for personalization
- ⏰ Visual study timer with breaks
- 💬 Encouraging check-in messages every 5 minutes
- 🎉 Celebration screen after sessions
- 📊 Basic progress tracking (streak, total time)
- ⚙️ Parent settings (protected by math question)
- 🔇 Customizable sounds and vibrations
- 📤 Share achievements with family

### No Login Required!
- Everything saves locally
- No accounts needed
- Start using in 30 seconds
- Optional cloud backup later

## 🏗️ Architecture

### Tech Stack
- **Framework:** React Native with Expo
- **Navigation:** React Navigation
- **Storage:** AsyncStorage (local only)
- **Audio:** Expo AV & Speech
- **Animations:** Lottie React Native
- **Haptics:** Expo Haptics

### Project Structure
```
src/
├── screens/          # Main app screens
├── components/       # Reusable components
├── utils/           # Helper functions
└── assets/          # Animations and images
```

## 🎨 Design Principles

1. **ADHD-First Design**
   - Large touch targets (44pt minimum)
   - High contrast colors
   - Minimal distractions
   - Clear visual hierarchy

2. **Child-Friendly**
   - Fun characters and animations
   - Positive reinforcement only
   - Simple, encouraging language
   - No failure states

3. **Parent-Respectful**
   - No login friction
   - Quick setup (30 seconds)
   - Hidden settings (math gate)
   - Works offline

## 💰 Monetization

### Free Trial
- 14 days fully featured
- No credit card required
- Gentle reminder after trial

### Premium ($4.99/month)
- Unlimited study sessions
- Multiple buddy characters
- Parent voice recordings
- Progress reports
- Priority support

## 🚀 Deployment

### App Store Checklist
- [ ] App icon (1024x1024)
- [ ] Screenshots (iPhone & iPad)
- [ ] App description
- [ ] Privacy policy
- [ ] Terms of service
- [ ] COPPA compliance statement

### Google Play Checklist
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone & tablet)
- [ ] Short description (80 chars)
- [ ] Full description
- [ ] Privacy policy URL

## 📊 Success Metrics

### Target Metrics (Month 1)
- 200 downloads
- 60% trial-to-paid conversion
- 80% day-7 retention
- 4.5+ star rating

### Key Events to Track
- Onboarding completion
- First study session
- Session duration
- Streak maintenance
- Trial conversion

## 🤝 Support

### For Parents
- In-app help guide
- Email: support@studybuddy.app
- FAQ website
- ADHD parent community forum

### For Developers
- GitHub issues
- Contributing guidelines
- Code of conduct
- Development Discord

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- ADHD parent community for feedback
- Lottie for animations
- Expo team for amazing tools
- All the ADHD kids who inspired this

---

## Next Steps for Enhancement

### Phase 2 Features (Months 2-3)
- [ ] Multiple child profiles
- [ ] Custom buddy creation
- [ ] School schedule integration
- [ ] Weekly parent reports
- [ ] Cloud backup with email

### Phase 3 Features (Months 4-6)
- [ ] Study groups (virtual co-working)
- [ ] Teacher collaboration portal
- [ ] Reward shop with real rewards
- [ ] AI-powered break suggestions
- [ ] Apple Watch companion app

### Potential Pivots
- Adult ADHD version
- Classroom edition for teachers
- Therapy tool integration
- White-label for clinics

## Testing Instructions

### Manual Testing Checklist
- [ ] Onboarding flow completes
- [ ] Buddy animates properly
- [ ] Timer runs in background
- [ ] Check-ins appear on schedule
- [ ] Celebration shows correct stats
- [ ] Parent settings save
- [ ] App works offline
- [ ] Sounds/vibrations work

### Device Testing
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 Pro (standard)
- [ ] iPad (tablet)
- [ ] Android phone (various)
- [ ] Android tablet

## Revenue Projections

### Conservative Estimate
- Month 1: 200 users × 60% conversion × $4.99 = $599
- Month 2: 400 users × 60% conversion × $4.99 = $1,197
- Month 3: 600 users × 60% conversion × $4.99 = $1,796

### Growth Strategy
1. Launch in ADHD Facebook groups
2. Partner with ADHD influencers
3. School counselor outreach
4. Pediatrician recommendations
5. App Store optimization

## Contact

**Creator:** [Your Name]
**Email:** developer@studybuddy.app
**Website:** https://studybuddy.app
**Twitter:** @studybuddyapp

---

*Built with ❤️ for ADHD families*