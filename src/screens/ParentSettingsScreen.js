import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-audio';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { 
  getAgeConfig, 
  getScaledSize,
  UI_SCALING_CONFIG
} from '../utils/constants';
import { t, getCurrentLanguage, setLanguage, getAvailableLanguages } from '../utils/i18n';
import { SubscriptionContext } from '../../App';

export default function ParentSettingsScreen({ navigation, route }) {
  const [ageGroup, setAgeGroup] = useState('elementary');
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
  const [appLanguage, setAppLanguage] = useState(getCurrentLanguage());
  const [speechSettings, setSpeechSettings] = useState({
    mainScreenEnabled: true,
    calmModeEnabled: true,
    celebrationEnabled: true,
    rate: 1.0,
    pitch: 1.0,
  });
  const [photoSettings, setPhotoSettings] = useState({
    autoDeleteDays: 7,
    privacyOverlay: false,
  });
  const { isPremium } = useContext(SubscriptionContext);

  useEffect(() => {
    loadUserAge();
    loadSettings();
    loadSessionLog();
  }, []);

  const loadUserAge = async () => {
    const age = await getStorageItem('selectedAge');
    if (age) setAgeGroup(age);
  };

  const loadSettings = async () => {
    // Load settings with age-appropriate defaults
    const config = getAgeConfig(ageGroup);
    
    const settingsMap = [
      ['workDuration', setWorkDuration, config.session?.defaultDuration || 25],
      ['breakDuration', setBreakDuration, config.session?.breakDuration / 60 || 5],
      ['checkInFrequency', setCheckInFrequency, config.checkInFrequency || 5],
      ['interactionFrequency', setInteractionFrequency, config.interactionFrequency || 20],
      ['soundEnabled', setSoundEnabled, true, 'boolean'],
      ['vibrationEnabled', setVibrationEnabled, true, 'boolean'],
      ['twoWayInteraction', setTwoWayInteraction, true, 'boolean']
    ];

    for (const [key, setter, defaultValue, type = 'number'] of settingsMap) {
      const value = await getStorageItem(key);
      if (value !== null) {
        if (type === 'boolean') {
          setter(value === 'true');
        } else {
          setter(parseInt(value));
        }
      } else {
        setter(defaultValue);
      }
    }
    
    // Load speech settings
    const speech = await getStorageItem('speechSettings');
    if (speech) {
      setSpeechSettings(JSON.parse(speech));
    }
    
    // Load photo settings
    const photo = await getStorageItem('photoSettings');
    if (photo) {
      setPhotoSettings(JSON.parse(photo));
    }
  };

  const loadSessionLog = async () => {
    const log = await getStorageItem('lastSessionLog');
    if (log) {
      setLastSessionLog(JSON.parse(log));
    }
    if (route.params?.sessionLog) {
      setLastSessionLog(route.params.sessionLog);
    }
  };

  const saveSettings = async () => {
    const settings = {
      workDuration: workDuration.toString(),
      breakDuration: breakDuration.toString(),
      checkInFrequency: checkInFrequency.toString(),
      interactionFrequency: interactionFrequency.toString(),
      soundEnabled: soundEnabled.toString(),
      vibrationEnabled: vibrationEnabled.toString(),
      twoWayInteraction: twoWayInteraction.toString()
    };
    
    const savePromises = Object.entries(settings).map(([key, value]) => 
      setStorageItem(key, value)
    );
    
    // Save speech settings separately as JSON
    savePromises.push(setStorageItem('speechSettings', JSON.stringify(speechSettings)));
    
    // Save photo settings
    savePromises.push(setStorageItem('photoSettings', JSON.stringify(photoSettings)));
    
    await Promise.all(savePromises);
    
    Alert.alert('Success!', 'Settings saved successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const startRecordingMessage = async () => {
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
      
      Alert.alert('Recording', 'Say your encouraging message now!');
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecordingMessage = async () => {
    if (!recording) return;
    
    setRecording(null);
    await recording.stopAsync();
    const uri = recording.uri;
    
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
            await Promise.all([
              setStorageItem('currentStreak', '0'),
              setStorageItem('totalFocusTime', '0'),
              setStorageItem('calmStreak', '0')
            ]);
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

    const responses = {
      math: '📊 Math', reading: '📚 Reading', writing: '✏️ Writing', other: '📝 Other',
      easy: '😊 Easy', ok: '😐 OK', hard: '😟 Hard', help: '🆘 Need help',
      complete: '✅ Complete', most: '🔵 Most done', half: '🟡 Half done', started: '🔴 Just started'
    };

    return lastSessionLog.map((entry, index) => {
      const time = Math.floor(entry.time / 60);
      return `${time} min: ${responses[entry.response] || entry.response}`;
    }).join('\n');
  };

  const config = getAgeConfig(ageGroup);
  
  // Get age-appropriate slider ranges
  const getSliderConfig = (setting) => {
    const ranges = {
      workDuration: {
        young: { min: 5, max: 20, step: 5 },
        elementary: { min: 10, max: 30, step: 5 },
        tween: { min: 15, max: 45, step: 5 },
        teen: { min: 20, max: 60, step: 5 }
      },
      breakDuration: { min: 3, max: 15, step: 1 },
      checkInFrequency: { min: 2, max: 15, step: 1 },
      interactionFrequency: { min: 10, max: 45, step: 5 }
    };
    
    return ranges[setting][ageGroup] || ranges[setting] || { min: 1, max: 10, step: 1 };
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: config.secondaryColor }]}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[
              styles.backButton,
              { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
            ]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[
            styles.title,
            { fontSize: getScaledSize(24, ageGroup, 'fontSize') }
          ]}>
            Parent Settings
          </Text>
        </View>

        {/* Session Report */}
        <View style={[
          styles.section,
          { padding: getScaledSize(20, ageGroup, 'spacing') }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            Last Session Report
          </Text>
          <Text style={[
            styles.sessionLog,
            { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
          ]}>
            {formatSessionLog()}
          </Text>
        </View>

        {/* Timer Settings */}
        <View style={[
          styles.section,
          { padding: getScaledSize(20, ageGroup, 'spacing') }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            Timer Settings
          </Text>
          
          {[
            { key: 'workDuration', label: 'Work Duration', value: workDuration, setter: setWorkDuration, unit: 'minutes' },
            { key: 'breakDuration', label: 'Break Duration', value: breakDuration, setter: setBreakDuration, unit: 'minutes' },
            { key: 'checkInFrequency', label: 'Voice Check-in Every', value: checkInFrequency, setter: setCheckInFrequency, unit: 'minutes' }
          ].map(({ key, label, value, setter, unit }) => {
            const sliderConfig = getSliderConfig(key);
            return (
              <View key={key} style={styles.setting}>
                <Text style={[
                  styles.settingLabel,
                  { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
                ]}>
                  {label}: {value} {unit}
                </Text>
                <Slider
                  style={[
                    styles.slider,
                    { height: getScaledSize(40, ageGroup, 'spacing') }
                  ]}
                  minimumValue={sliderConfig.min}
                  maximumValue={sliderConfig.max}
                  step={sliderConfig.step}
                  value={value}
                  onValueChange={setter}
                  minimumTrackTintColor={config.accentColor}
                  maximumTrackTintColor="#D0D0D0"
                />
              </View>
            );
          })}
        </View>

        {/* Interaction Settings */}
        <View style={[
          styles.section,
          { padding: getScaledSize(20, ageGroup, 'spacing') }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            Check-In Settings
          </Text>
          
          <View style={styles.switchSetting}>
            <Text style={[
              styles.settingLabel,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
            ]}>
              Two-Way Interaction
            </Text>
            <Switch
              value={twoWayInteraction}
              onValueChange={setTwoWayInteraction}
              trackColor={{ false: '#D0D0D0', true: config.accentColor }}
            />
          </View>

          {twoWayInteraction && (
            <View style={styles.setting}>
              <Text style={[
                styles.settingLabel,
                { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
              ]}>
                Ask Questions Every: {interactionFrequency} minutes
              </Text>
              <Slider
                style={[
                  styles.slider,
                  { height: getScaledSize(40, ageGroup, 'spacing') }
                ]}
                minimumValue={getSliderConfig('interactionFrequency').min}
                maximumValue={getSliderConfig('interactionFrequency').max}
                step={getSliderConfig('interactionFrequency').step}
                value={interactionFrequency}
                onValueChange={setInteractionFrequency}
                minimumTrackTintColor={config.accentColor}
                maximumTrackTintColor="#D0D0D0"
              />
            </View>
          )}
        </View>

        {/* Notification Settings */}
        <View style={[
          styles.section,
          { padding: getScaledSize(20, ageGroup, 'spacing') }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            Notifications
          </Text>
          
          {[
            { key: 'soundEnabled', label: 'Sound Effects', value: soundEnabled, setter: setSoundEnabled },
            { key: 'vibrationEnabled', label: 'Vibration', value: vibrationEnabled, setter: setVibrationEnabled }
          ].map(({ key, label, value, setter }) => (
            <View key={key} style={styles.switchSetting}>
              <Text style={[
                styles.settingLabel,
                { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
              ]}>
                {label}
              </Text>
              <Switch
                value={value}
                onValueChange={setter}
                trackColor={{ false: '#D0D0D0', true: config.accentColor }}
              />
            </View>
          ))}
        </View>

        {/* Language Settings */}
        <View style={[
          styles.section,
          { padding: getScaledSize(20, ageGroup, 'spacing') }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            Language / Idioma / Sprache
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
            {getAvailableLanguages().map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  appLanguage === lang.code && styles.languageButtonActive,
                  { padding: getScaledSize(15, ageGroup, 'spacing') }
                ]}
                onPress={async () => {
                  await setLanguage(lang.code);
                  setAppLanguage(lang.code);
                  Alert.alert('✓', t('saveSettings'));
                }}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  appLanguage === lang.code && styles.languageNameActive
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Speech Settings */}
        <View style={[
          styles.section,
          { padding: getScaledSize(20, ageGroup, 'spacing') }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            Speech Settings
          </Text>

          {/* Per-Mode Speech Toggles */}
          {[
            { key: 'mainScreenEnabled', label: 'Speech during studying' },
            { key: 'calmModeEnabled', label: 'Speech in calm mode' },
            { key: 'celebrationEnabled', label: 'Speech for celebrations' }
          ].map(({ key, label }) => (
            <View key={key} style={styles.switchSetting}>
              <Text style={[
                styles.settingLabel,
                { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
              ]}>
                {label}
              </Text>
              <Switch
                value={speechSettings[key]}
                onValueChange={(value) => setSpeechSettings({...speechSettings, [key]: value})}
                trackColor={{ false: '#D0D0D0', true: config.accentColor }}
              />
            </View>
          ))}

          {/* Speech Rate */}
          <View style={styles.sliderSetting}>
            <Text style={[
              styles.settingLabel,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
            ]}>
              Speech Speed: {speechSettings.rate.toFixed(1)}x
            </Text>
            <Slider
              style={{ height: 40, marginTop: 10 }}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.1}
              value={speechSettings.rate}
              onValueChange={(value) => setSpeechSettings({...speechSettings, rate: value})}
              minimumTrackTintColor={config.primaryColor}
              maximumTrackTintColor="#D0D0D0"
            />
          </View>

          {/* Speech Pitch */}
          <View style={styles.sliderSetting}>
            <Text style={[
              styles.settingLabel,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
            ]}>
              Voice Pitch: {speechSettings.pitch.toFixed(1)}
            </Text>
            <Slider
              style={{ height: 40, marginTop: 10 }}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.1}
              value={speechSettings.pitch}
              onValueChange={(value) => setSpeechSettings({...speechSettings, pitch: value})}
              minimumTrackTintColor={config.primaryColor}
              maximumTrackTintColor="#D0D0D0"
            />
          </View>
        </View>

        {/* Photo Privacy Settings */}
        <View style={[
          styles.section,
          { padding: getScaledSize(20, ageGroup, 'spacing') }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            Photo Privacy
          </Text>

          {/* Auto-Delete Setting */}
          <View style={styles.sliderSetting}>
            <Text style={[
              styles.settingLabel,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
            ]}>
              Auto-delete photos after: {photoSettings.autoDeleteDays} days
            </Text>
            <Slider
              style={{ height: 40, marginTop: 10 }}
              minimumValue={1}
              maximumValue={30}
              step={1}
              value={photoSettings.autoDeleteDays}
              onValueChange={(value) => setPhotoSettings({...photoSettings, autoDeleteDays: value})}
              minimumTrackTintColor={config.primaryColor}
              maximumTrackTintColor="#D0D0D0"
            />
            <Text style={{ fontSize: 12, color: '#7F8C8D', marginTop: 5 }}>
              Photos are stored locally only and never synced to cloud
            </Text>
          </View>

          {/* Privacy Overlay Toggle */}
          <View style={styles.switchSetting}>
            <Text style={[
              styles.settingLabel,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
            ]}>
              Privacy blur overlay
            </Text>
            <Switch
              value={photoSettings.privacyOverlay}
              onValueChange={(value) => setPhotoSettings({...photoSettings, privacyOverlay: value})}
              trackColor={{ false: '#D0D0D0', true: config.accentColor }}
            />
          </View>
        </View>

        {/* Custom Messages */}
        <View style={[
          styles.section,
          { padding: getScaledSize(20, ageGroup, 'spacing') }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
          ]}>
            Custom Encouragement
          </Text>
          
          <TouchableOpacity
            style={[
              styles.recordButton,
              recording && styles.recordingActive,
              { 
                padding: getScaledSize(15, ageGroup, 'spacing'),
                backgroundColor: recording ? '#C0392B' : '#E74C3C'
              }
            ]}
            onPress={recording ? stopRecordingMessage : startRecordingMessage}
          >
            <Text style={[
              styles.recordButtonText,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
            ]}>
              {recording ? '⏹️ Stop Recording' : '🎤 Record Message'}
            </Text>
          </TouchableOpacity>
          
          <Text style={[
            styles.hint,
            { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
          ]}>
            Record encouraging messages in your voice for check-ins!
          </Text>
        </View>

        {/* Actions */}
        <View style={[
          styles.section,
          { padding: getScaledSize(20, ageGroup, 'spacing') }
        ]}>
          {!isPremium && (
            <TouchableOpacity 
              style={[
                styles.upgradeButton,
                { 
                  backgroundColor: '#FFD700',
                  padding: getScaledSize(15, ageGroup, 'spacing'),
                  marginBottom: 10,
                  borderRadius: 10,
                  alignItems: 'center'
                }
              ]} 
              onPress={() => navigation.navigate('Paywall', { ageGroup })}
            >
              <Text style={[
                styles.upgradeButtonText,
                { fontSize: getScaledSize(18, ageGroup, 'fontSize'), fontWeight: 'bold' }
              ]}>
                🌟 Upgrade to Premium
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.saveButton,
              { 
                padding: getScaledSize(15, ageGroup, 'spacing'),
                backgroundColor: config.primaryColor 
              }
            ]} 
            onPress={saveSettings}
          >
            <Text style={[
              styles.saveButtonText,
              { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
            ]}>
              Save Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.resetButton,
              { padding: getScaledSize(15, ageGroup, 'spacing') }
            ]} 
            onPress={resetProgress}
          >
            <Text style={[
              styles.resetButtonText,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize') }
            ]}>
              Reset All Progress
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingVertical: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    color: '#4A90E2',
  },
  title: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  sessionLog: {
    color: '#2C3E50',
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  setting: {
    marginBottom: 20,
  },
  settingLabel: {
    color: '#2C3E50',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
  },
  switchSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recordButton: {
    borderRadius: 10,
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: '#C0392B',
  },
  recordButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hint: {
    color: '#7F8C8D',
    marginTop: 10,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  languageButton: {
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#E8F4FF',
  },
  languageFlag: {
    fontSize: 32,
    marginBottom: 5,
  },
  languageName: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  languageNameActive: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  upgradeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    color: '#2C3E50',
  },
});
