import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
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
import * as Notifications from 'expo-notifications';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { smartSpeak, stopSpeech } from '../utils/speech';
import BuddyCharacter from '../components/BuddyCharacter';
import StudyTimer from '../components/StudyTimer';
import CheckInMessage from '../components/CheckInMessage';
import BigButton from '../components/BigButton';
import { 
  getAgeConfig,
  getSubjectsForAge,
  getSubjectCheckIns,
  shouldTriggerSurprise,
  getRandomSurpriseEvent,
  getMysteryMondayChange,
  getCurrentSeasonalTheme,
  getScaledSize,
  TIMING_CONFIG,
  generateParentGate
} from '../utils/constants';

const { width, height } = Dimensions.get('window');

export default function MainScreen({ navigation, route }) {
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
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentSurprise, setCurrentSurprise] = useState(null);
  const [showParentGate, setShowParentGate] = useState(false);
  const [parentAnswerInput, setParentAnswerInput] = useState('');
  const [parentGateQA, setParentGateQA] = useState({ question: '', answer: '' });
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [gateLockedUntil, setGateLockedUntil] = useState(0);
  const [longPressReady, setLongPressReady] = useState(false);
  const quickStart = route.params?.quickStart || null;
  
  const timerInterval = useRef(null);
  const checkInInterval = useRef(null);
  const interactionInterval = useRef(null);
  const fadeTimeout = useRef(null);
  const startTimeRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const cameraRef = useRef(null);
  const scheduledNotifications = useRef([]);

  useEffect(() => {
    loadUserData();
    loadSessionData();
    
    // Get selected subject from navigation if available
    if (route.params?.selectedSubject) {
      setCurrentSubject(route.params.selectedSubject);
      startStudyingWithSubject(route.params.selectedSubject);
    }
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      clearAllIntervals();
      subscription?.remove();
    };
  }, []);

  const clearAllIntervals = () => {
    [timerInterval, checkInInterval, interactionInterval, fadeTimeout].forEach(ref => {
      if (ref.current) {
        clearInterval(ref.current);
        clearTimeout(ref.current);
      }
    });
  };

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      if (isStudying) {
        showEncouragement();
        cancelScheduledCheckIns();
      }
      checkNotificationAction();
    }
    if (nextAppState.match(/inactive|background/) && isStudying) {
      scheduleBackgroundCheckIns();
    }
    appState.current = nextAppState;
  };

  const checkNotificationAction = async () => {
    const action = await getStorageItem('lastNotifAction');
    if (!action) return;
    await setStorageItem('lastNotifAction', '');
    if (action === 'RESUME') {
      if (!isStudying) {
        const fallbackSubject = currentSubject || getSubjectsForAge(ageGroup)[0] || { id: 'other', label: 'Other' };
        startStudyingWithSubject(fallbackSubject);
      }
    } else if (action === 'BREAK') {
      takeBreak();
    } else if (action === 'DONE') {
      endSession();
    }
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

  const startStudyingWithSubject = (subject) => {
    setCurrentSubject(subject);
    setIsStudying(true);
    setSessionTime(0);
    setBuddyFaded(false);
    setSessionLog([]);
    startTimeRef.current = Date.now();
    
    const config = getAgeConfig(ageGroup);
    // Apply quick start overrides if present
    if (quickStart) {
      if (quickStart.workMinutes) {
        config.sessionLength = quickStart.workMinutes * 60;
      }
      if (quickStart.breakMinutes) {
        config.breakDuration = quickStart.breakMinutes * 60;
      }
    }
    
    // Check for special events
    checkForSpecialEvents();
    
    // Setup all timers using configured values
    setupSessionTimers(config);
    
    // Initial encouragement
    smartSpeak(`Let's work on ${subject.label}! ${config.startMessage}`, {
      screenType: 'main',
      language: 'en'
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const setupSessionTimers = (config) => {
    // Main timer - compute elapsed to reduce drift
    timerInterval.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setSessionTime(elapsed);
      }
    }, 1000);
    
    // Voice check-ins using config frequency
    const checkInTime = config.checkInFrequency * 60 * 1000;
    checkInInterval.current = setInterval(() => {
      if (shouldTriggerSurprise()) {
        showSurpriseEvent();
      } else {
        showCheckInMessage();
      }
    }, checkInTime);
    
    // Two-way interaction using config frequency
    const interactionTime = config.interactionFrequency * 60 * 1000;
    interactionInterval.current = setInterval(() => {
      showInteractionPrompt();
    }, interactionTime);
    
    // Buddy fade using configured delay
    fadeTimeout.current = setTimeout(() => {
      setBuddyFaded(true);
    }, TIMING_CONFIG.session.buddyFadeDelay);
  };

  const scheduleBackgroundCheckIns = async () => {
    try {
      const config = getAgeConfig(ageGroup);
      const intervalMs = config.checkInFrequency * 60 * 1000;
      const messages = currentSubject ? getSubjectCheckIns(currentSubject.id) : getAgeConfig(ageGroup).checkInMessages;
      // Schedule next 3 check-ins
      const toSchedule = [1, 2, 3].map(i => ({
        content: {
          title: 'Study Buddy',
          body: messages[Math.floor(Math.random() * messages.length)].replace(/[^\w\s]/g, ''),
          categoryIdentifier: 'checkin-actions',
        },
        trigger: { seconds: Math.max(5, Math.floor((intervalMs * i) / 1000)) },
      }));
      const ids = [];
      for (const n of toSchedule) {
        const id = await Notifications.scheduleNotificationAsync({ content: n.content, trigger: n.trigger });
        ids.push(id);
      }
      scheduledNotifications.current = ids;
    } catch (e) {
      // no-op
    }
  };

  const cancelScheduledCheckIns = async () => {
    try {
      for (const id of scheduledNotifications.current) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      scheduledNotifications.current = [];
    } catch (e) {
      // no-op
    }
  };

  const checkForSpecialEvents = () => {
    // Mystery Monday check
    const mysteryChange = getMysteryMondayChange();
    if (mysteryChange) {
      Alert.alert('Mystery Monday! 🎭', mysteryChange);
      setCurrentSurprise({ emoji: '🎭', message: mysteryChange });
    }
    
    // Seasonal theme check
    const seasonalTheme = getCurrentSeasonalTheme();
    if (seasonalTheme) {
      console.log(`Seasonal theme: ${seasonalTheme.name} ${seasonalTheme.emoji}`);
    }
  };

  const showSurpriseEvent = () => {
    const surprise = getRandomSurpriseEvent();
    setCurrentSurprise(surprise);
    
    Alert.alert(
      `${surprise.emoji} Surprise!`,
      surprise.message,
      [{ text: 'Awesome!', style: 'default' }]
    );
    
    const config = getAgeConfig(ageGroup);
    Speech.stop();
    Speech.speak(surprise.message, {
      language: 'en',
      pitch: config.voicePitch + 0.1, // Slightly higher for excitement
      rate: config.voiceRate
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const showCheckInMessage = () => {
    const config = getAgeConfig(ageGroup);
    
    // Use subject-specific messages if available, otherwise age-appropriate messages
    let messages;
    if (currentSubject) {
      messages = getSubjectCheckIns(currentSubject.id);
    } else {
      messages = config.checkInMessages;
    }
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCheckInMessage(randomMessage);
    setShowCheckIn(true);
    
    // Temporarily show buddy, then fade again
    setBuddyFaded(false);
    setTimeout(() => setBuddyFaded(true), TIMING_CONFIG.session.checkInDisplay);
    
    Speech.stop();
    Speech.speak(randomMessage.replace(/[^\w\s]/gi, ''), {
      language: 'en',
      pitch: config.voicePitch,
      rate: config.voiceRate
    });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setTimeout(() => setShowCheckIn(false), TIMING_CONFIG.session.checkInDisplay);
  };

  const showInteractionPrompt = () => {
    const questions = getInteractionQuestions();
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(randomQuestion);
    setShowInteractionModal(true);
    
    // Auto-pause if no response using configured timeout
    setTimeout(() => {
      if (showInteractionModal) {
        pauseSession();
        Alert.alert('Timer Paused', 'Tap to continue when ready!');
      }
    }, TIMING_CONFIG.session.modalTimeout);
    
    const config = getAgeConfig(ageGroup);
    Speech.stop();
    Speech.speak(randomQuestion.text, {
      language: 'en',
      pitch: config.voicePitch,
      rate: config.voiceRate
    });
  };

  const getInteractionQuestions = () => {
    // Dynamic questions based on current subject
    const baseQuestions = [
      {
        id: 'subject',
        text: 'What are you working on?',
        options: getSubjectsForAge(ageGroup).slice(0, 4).map(subject => ({
          label: `${subject.emoji} ${subject.label}`,
          value: subject.id
        }))
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
    
    return baseQuestions;
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
      handleHelpRequest();
    } else {
      provideFeedback(response.value);
    }
  };

  const handleHelpRequest = () => {
    Alert.alert(
      'Need Help?',
      'Should I let your parent know?',
      [
        { text: 'No, I\'ll keep trying', style: 'cancel' },
        { text: 'Yes please', onPress: () => {
          Alert.alert('Help is on the way!', 'Keep trying, someone will check on you soon.');
        }}
      ]
    );
  };

  const provideFeedback = (responseValue) => {
    const encouragements = {
      easy: "Great! Keep crushing it!",
      ok: "Nice steady progress!",
      hard: "You're doing great even though it's tough!",
      complete: "Amazing! You finished!",
      most: "Almost there, fantastic!",
      half: "Halfway is great progress!",
      started: "Good start, keep going!"
    };
    
    if (encouragements[responseValue]) {
      const config = getAgeConfig(ageGroup);
      Speech.stop();
      Speech.speak(encouragements[responseValue], {
        language: 'en',
        pitch: config.voicePitch,
        rate: config.voiceRate
      });
    }
  };

  const pauseSession = () => {
    clearAllIntervals();
    setIsStudying(false);
  };

  const takeBreak = () => {
    const config = getAgeConfig(ageGroup);
    
    Alert.alert(
      config.breakTitle,
      config.breakMessage,
      [
        {
          text: "Start Break",
          onPress: () => {
            pauseSession();
            saveSessionData();
            
            // Resume after configured break duration
            setTimeout(() => {
              Alert.alert(
                "Break's Over!",
                "Ready to get back to work?",
                [
                  { text: "5 More Minutes", style: "cancel" },
                  { text: config.resumeButtonText, onPress: () => startStudyingWithSubject(currentSubject) }
                ]
              );
            }, config.breakDuration * 1000); // Already in seconds from config
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
    const config = getAgeConfig(ageGroup);
    
    // Offer photo for older kids
    if (['tween', 'teen'].includes(ageGroup)) {
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
    
    // Save all session data
    const savePromises = [
      setStorageItem('totalFocusTime', newTotalTime.toString()),
      setStorageItem('currentStreak', newStreak.toString()),
      setStorageItem('lastSessionDate', new Date().toISOString()),
      setStorageItem('lastSessionLog', JSON.stringify(sessionLog))
    ];
    
    await Promise.all(savePromises);
    
    setTotalFocusTime(newTotalTime);
    setCurrentStreak(newStreak);
  };

  const showEncouragement = () => {
    const config = getAgeConfig(ageGroup);
    Speech.stop();
    Speech.speak(config.welcomeBackMessage, {
      language: 'en',
      pitch: config.voicePitch,
      rate: config.voiceRate
    });
  };

  const openParentSettings = () => {
    // Check if gate is locked
    const now = Date.now();
    if (now < gateLockedUntil) {
      const remainingSeconds = Math.ceil((gateLockedUntil - now) / 1000);
      Alert.alert('Please Wait', `Parent gate is locked for ${remainingSeconds} more seconds`);
      return;
    }
    
    // Generate new gate question
    const newGate = generateParentGate(getAgeConfig(ageGroup));
    setParentGateQA(newGate);
    setParentAnswerInput('');
    setLongPressReady(false);
    setShowParentGate(true);
  };

  // Camera mode render
  if (showProofMode) {
    return (
      <Camera style={styles.camera} ref={cameraRef}>
        <View style={styles.cameraContainer}>
          <Text style={[
            styles.cameraText,
            { fontSize: getScaledSize(24, ageGroup, 'fontSize') }
          ]}>
            Show your completed work!
          </Text>
          <TouchableOpacity 
            style={[
              styles.captureButton,
              { 
                width: getScaledSize(70, ageGroup, 'buttonScale'),
                height: getScaledSize(70, ageGroup, 'buttonScale'),
                borderRadius: getScaledSize(35, ageGroup, 'buttonScale')
              }
            ]} 
            onPress={capturePhoto}
          >
            <Text style={[
              styles.captureButtonText,
              { fontSize: getScaledSize(40, ageGroup, 'iconSize') }
            ]}>
              📸
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    );
  }

  const config = getAgeConfig(ageGroup);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: config.secondaryColor || '#F0F8FF' }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openParentSettings} style={styles.settingsButton}>
            <Text style={[
              styles.settingsIcon,
              { fontSize: getScaledSize(24, ageGroup, 'iconSize') }
            ]}>
              ⚙️
            </Text>
          </TouchableOpacity>
          <View style={[
            styles.streakContainer,
            { backgroundColor: config.theme?.accent || '#FFF3CD' }
          ]}>
            <Text style={[
              styles.streakText,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
            ]}>
              🔥 {currentStreak} {config.streakLabel}
            </Text>
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

        <View style={[
          styles.buttonContainer,
          { paddingVertical: getScaledSize(30, ageGroup, 'spacing') }
        ]}>
          {!isStudying ? (
            <BigButton 
              title={config.startButtonText}
              onPress={() => navigation.navigate('ModeSelection')}
              color={config.primaryColor}
              ageGroup={ageGroup}
            />
          ) : (
            <>
              <BigButton 
                title={config.breakButtonText}
                onPress={takeBreak}
                color="#F39C12"
                ageGroup={ageGroup}
              />
              <BigButton 
                title={config.endButtonText}
                onPress={endSession}
                color="#E74C3C"
                ageGroup={ageGroup}
                style={{ marginTop: getScaledSize(20, ageGroup, 'spacing') }}
              />
            </>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={[
            styles.statsText,
            { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
          ]}>
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
          <View style={[
            styles.modalContent,
            { padding: getScaledSize(30, ageGroup, 'spacing') }
          ]}>
            <Text style={[
              styles.modalTitle,
              { fontSize: getScaledSize(24, ageGroup, 'fontSize') }
            ]}>
              {currentQuestion?.text}
            </Text>
            <View style={styles.optionsContainer}>
              {currentQuestion?.options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    { 
                      paddingVertical: getScaledSize(15, ageGroup, 'spacing'),
                      paddingHorizontal: getScaledSize(25, ageGroup, 'spacing'),
                      borderColor: config.accentColor 
                    }
                  ]}
                  onPress={() => handleInteractionResponse(option)}
                >
                  <Text style={[
                    styles.optionText,
                    { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Surprise Event Display */}
      {currentSurprise && (
        <View style={[
          styles.surpriseBanner,
          { 
            padding: getScaledSize(15, ageGroup, 'spacing'),
            top: getScaledSize(100, ageGroup, 'spacing') 
          }
        ]}>
          <Text style={[
            styles.surpriseText,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            {currentSurprise.emoji} {currentSurprise.message}
          </Text>
        </View>
      )}

      {/* Parent Gate Modal */}
      <Modal
        visible={showParentGate}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { padding: getScaledSize(30, ageGroup, 'spacing') }]}>
            <Text style={[styles.modalTitle, { fontSize: getScaledSize(20, ageGroup, 'fontSize') }]}>Parent Access</Text>
            
            {/* Long Press Instruction */}
            {!longPressReady && (
              <TouchableOpacity
                onLongPress={() => {
                  setLongPressReady(true);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
                delayLongPress={1500}
                style={{
                  backgroundColor: '#E8F4FF',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 15
                }}
              >
                <Text style={{ textAlign: 'center', color: '#4A90E2' }}>
                  Hold this box for 2 seconds to continue
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Question and Input */}
            {longPressReady && (
              <>
                <Text style={{ marginBottom: 10 }}>{parentGateQA.question}</Text>
                <TextInput
                  keyboardType="number-pad"
                  value={parentAnswerInput}
                  onChangeText={setParentAnswerInput}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 10,
                    width: '80%',
                    alignSelf: 'center',
                    textAlign: 'center'
                  }}
                />
                <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'center' }}>
                  <TouchableOpacity
                    style={[styles.optionButton, { paddingHorizontal: 20, paddingVertical: 10, marginRight: 10 }]}
                    onPress={() => {
                      setShowParentGate(false);
                      setWrongAttempts(0);
                    }}
                  >
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, { paddingHorizontal: 20, paddingVertical: 10 }]}
                    onPress={() => {
                      if (parentAnswerInput.trim() === parentGateQA.answer) {
                        setShowParentGate(false);
                        setWrongAttempts(0);
                        navigation.navigate('ParentSettings', { sessionLog });
                      } else {
                        const attempts = wrongAttempts + 1;
                        setWrongAttempts(attempts);
                        
                        if (attempts >= 3) {
                          // Lock gate for 30 seconds after 3 wrong attempts
                          setGateLockedUntil(Date.now() + 30000);
                          setShowParentGate(false);
                          setWrongAttempts(0);
                          Alert.alert('Gate Locked', 'Too many wrong attempts. Please wait 30 seconds.');
                        } else {
                          Alert.alert('Try again', `Incorrect answer. ${3 - attempts} attempts remaining.`);
                          setParentAnswerInput('');
                        }
                      }
                    }}
                  >
                    <Text>Submit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  settingsButton: {
    padding: 10,
  },
  settingsIcon: {},
  streakContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontWeight: 'bold',
    color: '#856404',
  },
  buddyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {},
  statsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statsText: {
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
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  captureButton: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
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
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
  },
  optionText: {
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  surpriseBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  surpriseText: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});
