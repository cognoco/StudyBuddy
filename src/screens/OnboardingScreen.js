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
import { Audio } from 'expo-audio';
import * as Speech from 'expo-speech';
import { setStorageItem } from '../utils/storage';
import { BUDDIES_BY_AGE } from '../assets/animations/buddy-animations';
import { 
  AGE_CONFIGS, 
  getAgeConfig, 
  getResponsiveValue, 
  getScaledSize,
  UI_SCALING_CONFIG,
  TIMING_CONFIG
} from '../utils/constants';

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
    const config = getAgeConfig(selectedAge);
    
    Speech.stop();
    Speech.speak(`Great choice! I'm ${buddy.name} and I'm excited to study with you!`, {
      language: 'en',
      pitch: config.voicePitch,
      rate: config.voiceRate
    });
    
    setTimeout(() => setStep('recordName'), TIMING_CONFIG.animations.fadeIn * 4);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.usePermissions();
      if (!permission.granted) {
        await Audio.requestPermissionsAsync();
      }

      const recording = await Audio.RecordingManager.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        },
      });
      setRecording(recording);
    } catch (err) {
      Alert.alert('Oops!', 'Could not start recording. You can set this up later!');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    setRecording(null);
    await recording.stopAsync();
    const uri = recording.uri;
    
    await setStorageItem('childNameRecording', uri);
    setStep('ready');
    
    const config = getAgeConfig(selectedAge);
    Speech.stop();
    Speech.speak(config.completionMessage, {
      language: 'en',
      pitch: config.voicePitch,
      rate: config.voiceRate
    });
  };

  const completeOnboarding = async () => {
    await setStorageItem('hasLaunched', 'true');
    await setStorageItem('selectedAge', selectedAge);
    await setStorageItem('selectedBuddy', JSON.stringify(selectedBuddy));
    await setStorageItem('childName', childName || 'Buddy');
    navigation.replace('ModeSelection');
  };

  const renderChooseAge = () => {
    const ageGroups = Object.entries(AGE_CONFIGS);
    
    return (
      <View style={styles.container}>
        <Text style={[styles.title, getResponsiveStyles('title')]}>
          How old is your study superstar?
        </Text>
        <Text style={[styles.subtitle, getResponsiveStyles('subtitle')]}>
          We'll customize everything for their age!
        </Text>
        
        <View style={styles.ageContainer}>
          {ageGroups.map(([ageKey, config]) => (
            <TouchableOpacity
              key={ageKey}
              style={[styles.ageCard, getAgeCardStyle(ageKey)]}
              onPress={() => selectAge(ageKey)}
            >
              <Text style={[styles.ageEmoji, getResponsiveStyles('ageEmoji')]}>
                {getAgeEmoji(ageKey)}
              </Text>
              <Text style={[styles.ageTitle, getResponsiveStyles('ageTitle')]}>
                {getAgeTitle(ageKey)}
              </Text>
              <Text style={[styles.ageRange, getResponsiveStyles('ageRange')]}>
                Ages {config.displayRange || config.ageRange}
              </Text>
              <Text style={[styles.ageDescription, getResponsiveStyles('ageDescription')]}>
                {getAgeDescription(ageKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderChooseBuddy = () => {
    const buddies = BUDDIES_BY_AGE[selectedAge];
    const config = getAgeConfig(selectedAge);
    
    return (
      <View style={styles.container}>
        <Text style={[styles.title, getResponsiveStyles('title')]}>
          {config.buddySelectionTitle}
        </Text>
        <Text style={[styles.subtitle, getResponsiveStyles('subtitle')]}>
          {config.buddySelectionSubtitle}
        </Text>
        
        <View style={styles.buddyContainer}>
          {buddies.map((buddy) => (
            <TouchableOpacity
              key={buddy.id}
              style={[
                styles.buddyCard, 
                selectedBuddy?.id === buddy.id && styles.selectedBuddy,
                getResponsiveStyles('buddyCard')
              ]}
              onPress={() => selectBuddy(buddy)}
            >
              <View style={[
                styles.buddyAvatar, 
                { backgroundColor: buddy.color },
                getResponsiveStyles('buddyAvatar')
              ]}>
                <Text style={[styles.buddyEmoji, getResponsiveStyles('buddyEmoji')]}>
                  {buddy.emoji}
                </Text>
              </View>
              <Text style={[styles.buddyName, getResponsiveStyles('buddyName')]}>
                {buddy.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRecordName = () => {
    const config = getAgeConfig(selectedAge);
    
    return (
      <View style={styles.container}>
        <View style={[
          styles.bigBuddyAvatar, 
          { backgroundColor: selectedBuddy?.color },
          getResponsiveStyles('bigBuddyAvatar')
        ]}>
          <Text style={[styles.bigBuddyEmoji, getResponsiveStyles('bigBuddyEmoji')]}>
            {selectedBuddy?.emoji}
          </Text>
        </View>
        
        <Text style={[styles.title, getResponsiveStyles('title')]}>What's Your Name?</Text>
        <Text style={[styles.subtitle, getResponsiveStyles('subtitle')]}>{config.namePrompt}</Text>
        
        <TouchableOpacity
          style={[
            styles.recordButton, 
            recording && styles.recordingActive,
            getResponsiveStyles('recordButton')
          ]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Text style={[styles.recordButtonText, getResponsiveStyles('recordButtonText')]}>
            {recording ? '🎙️ Recording...' : '🎤 Hold to Record'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={() => setStep('ready')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReady = () => {
    const config = getAgeConfig(selectedAge);
    
    return (
      <View style={styles.container}>
        <View style={[
          styles.bigBuddyAvatar, 
          { backgroundColor: selectedBuddy?.color },
          getResponsiveStyles('bigBuddyAvatar')
        ]}>
          <Text style={[styles.bigBuddyEmoji, getResponsiveStyles('bigBuddyEmoji')]}>
            {selectedBuddy?.emoji}
          </Text>
        </View>
        
        <Text style={[styles.title, getResponsiveStyles('title')]}>We're Ready!</Text>
        <Text style={[styles.subtitle, getResponsiveStyles('subtitle')]}>
          {selectedBuddy?.name} is {config.readyMessage}
        </Text>
        
        <TouchableOpacity
          style={[styles.startButton, getResponsiveStyles('startButton')]}
          onPress={completeOnboarding}
        >
          <Text style={[styles.startButtonText, getResponsiveStyles('startButtonText')]}>
            {config.startButtonText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Helper functions for age-specific content
  const getAgeEmoji = (ageKey) => {
    const emojis = { young: '🧸', elementary: '📚', tween: '🎮', teen: '💪' };
    return emojis[ageKey] || '📚';
  };

  const getAgeTitle = (ageKey) => {
    const titles = { young: 'Little Learner', elementary: 'Elementary', tween: 'Tween', teen: 'Teen' };
    return titles[ageKey] || 'Elementary';
  };

  const getAgeDescription = (ageKey) => {
    const descriptions = { 
      young: 'Big celebrations, short sessions', 
      elementary: 'Balanced support & fun',
      tween: 'Cool & independent',
      teen: 'Minimal & focused'
    };
    return descriptions[ageKey] || 'Balanced support & fun';
  };

  const getAgeCardStyle = (ageKey) => {
    const config = getAgeConfig(ageKey);
    return { borderColor: config.primaryColor, borderWidth: 2 };
  };

  const getResponsiveStyles = (component) => {
    const scaling = selectedAge ? UI_SCALING_CONFIG.ageScaling[selectedAge] : UI_SCALING_CONFIG.ageScaling.elementary;
    
    return getResponsiveValue({
      small: getComponentStyle(component, scaling, 0.9),
      medium: getComponentStyle(component, scaling, 1.0),
      large: getComponentStyle(component, scaling, 1.1),
      xlarge: getComponentStyle(component, scaling, 1.2)
    });
  };

  const getComponentStyle = (component, scaling, screenScale) => {
    const baseStyles = {
      title: { fontSize: 32 * scaling.fontSize * screenScale },
      subtitle: { fontSize: 18 * scaling.fontSize * screenScale },
      ageEmoji: { fontSize: 40 * scaling.iconSize * screenScale },
      ageTitle: { fontSize: 18 * scaling.fontSize * screenScale },
      ageRange: { fontSize: 14 * scaling.fontSize * screenScale },
      ageDescription: { fontSize: 12 * scaling.fontSize * screenScale },
      buddyCard: { padding: 15 * scaling.spacing * screenScale },
      buddyAvatar: { 
        width: 80 * scaling.buddySize * screenScale, 
        height: 80 * scaling.buddySize * screenScale,
        borderRadius: 40 * scaling.buddySize * screenScale 
      },
      buddyEmoji: { fontSize: 40 * scaling.iconSize * screenScale },
      buddyName: { fontSize: 16 * scaling.fontSize * screenScale },
      bigBuddyAvatar: { 
        width: 150 * scaling.buddySize * screenScale, 
        height: 150 * scaling.buddySize * screenScale,
        borderRadius: 75 * scaling.buddySize * screenScale 
      },
      bigBuddyEmoji: { fontSize: 70 * scaling.iconSize * screenScale },
      recordButton: { 
        paddingHorizontal: 40 * scaling.spacing * screenScale,
        paddingVertical: 20 * scaling.spacing * screenScale 
      },
      recordButtonText: { fontSize: 20 * scaling.fontSize * screenScale },
      startButton: { 
        paddingHorizontal: 60 * scaling.spacing * screenScale,
        paddingVertical: 20 * scaling.spacing * screenScale 
      },
      startButtonText: { fontSize: 24 * scaling.fontSize * screenScale }
    };
    
    return baseStyles[component] || {};
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
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
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
  ageEmoji: {
    marginBottom: 10,
  },
  ageTitle: {
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  ageRange: {
    color: '#7F8C8D',
    marginBottom: 5,
  },
  ageDescription: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buddyEmoji: {},
  buddyName: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  bigBuddyAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  bigBuddyEmoji: {},
  recordButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 30,
    marginTop: 20,
  },
  recordingActive: {
    backgroundColor: '#C0392B',
    transform: [{ scale: 1.05 }],
  },
  recordButtonText: {
    color: 'white',
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
    borderRadius: 30,
    marginTop: 40,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
