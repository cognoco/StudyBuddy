import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal
} from 'react-native';
import { getStorageItem } from '../utils/storage';
import { 
  getAgeConfig, 
  getSubjectsForAge,
  getResponsiveValue,
  getScaledSize,
  TIMING_CONFIG
} from '../utils/constants';

const { width } = Dimensions.get('window');

export default function ModeSelectionScreen({ navigation }) {
  const [ageGroup, setAgeGroup] = useState('elementary');
  const [studyingCount, setStudyingCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  useEffect(() => {
    loadUserData();
    setupLiveActivity();
  }, []);

  const loadUserData = async () => {
    const age = await getStorageItem('selectedAge');
    if (age) setAgeGroup(age);
    
    // Set initial "live" counts with realistic numbers
    setStudyingCount(Math.floor(Math.random() * 500) + 800);
    setStreakCount(Math.floor(Math.random() * 100) + 100);
  };

  const setupLiveActivity = () => {
    // Simulate live activity updates using configured timing
    const interval = setInterval(() => {
      setStudyingCount(Math.floor(Math.random() * 500) + 800);
      setStreakCount(Math.floor(Math.random() * 100) + 100);
    }, TIMING_CONFIG.intervals.liveActivityUpdate * 1000);
    
    return () => clearInterval(interval);
  };

  const selectSubjectAndStart = (subject) => {
    setShowSubjectModal(false);
    navigation.navigate('Main', { selectedSubject: subject });
  };

  const config = getAgeConfig(ageGroup);

  // Responsive sizing
  const getResponsiveStyles = () => ({
    title: getResponsiveValue({
      small: { fontSize: getScaledSize(24, ageGroup, 'fontSize') },
      medium: { fontSize: getScaledSize(28, ageGroup, 'fontSize') },
      large: { fontSize: getScaledSize(32, ageGroup, 'fontSize') }
    }),
    modeCard: getResponsiveValue({
      small: { width: '90%', padding: getScaledSize(15, ageGroup, 'spacing') },
      medium: { width: '45%', padding: getScaledSize(20, ageGroup, 'spacing') },
      large: { width: '40%', padding: getScaledSize(25, ageGroup, 'spacing') }
    }),
    modeEmoji: getResponsiveValue({
      small: { fontSize: getScaledSize(40, ageGroup, 'iconSize') },
      medium: { fontSize: getScaledSize(50, ageGroup, 'iconSize') },
      large: { fontSize: getScaledSize(60, ageGroup, 'iconSize') }
    })
  });

  const responsiveStyles = getResponsiveStyles();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: config.secondaryColor || '#F0F8FF' }]}>
      <View style={styles.container}>

        {/* Title */}
        <Text style={[styles.title, responsiveStyles.title, { color: config.primaryColor }]}>
          How are you feeling?
        </Text>

        {/* Mode Selection */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeCard, 
              responsiveStyles.modeCard,
              styles.studyMode,
              { borderColor: config.accentColor }
            ]}
            onPress={() => setShowSubjectModal(true)}
          >
            <Text style={[styles.modeEmoji, responsiveStyles.modeEmoji]}>📚</Text>
            <Text style={[
              styles.modeTitle, 
              { fontSize: getScaledSize(16, ageGroup, 'fontSize'), color: config.primaryColor }
            ]}>
              Ready to Work!
            </Text>
            <Text style={[
              styles.modeDescription,
              { fontSize: getScaledSize(12, ageGroup, 'fontSize') }
            ]}>
              {getModeDescription(ageGroup, 'study')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeCard,
              responsiveStyles.modeCard, 
              styles.calmMode,
              { borderColor: '#2196F3' }
            ]}
            onPress={() => navigation.navigate('CalmMode')}
          >
            <Text style={[styles.modeEmoji, responsiveStyles.modeEmoji]}>🧘</Text>
            <Text style={[
              styles.modeTitle,
              { fontSize: getScaledSize(16, ageGroup, 'fontSize'), color: '#2196F3' }
            ]}>
              Need to Calm Down
            </Text>
            <Text style={[
              styles.modeDescription,
              { fontSize: getScaledSize(12, ageGroup, 'fontSize') }
            ]}>
              {getModeDescription(ageGroup, 'calm')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsPreview}>
          <Text style={[
            styles.statsText,
            { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
          ]}>
            Start quickly or pick a mode below.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
            {getQuickStarts(ageGroup).map((qs) => (
              <TouchableOpacity
                key={qs.id}
                style={{
                  backgroundColor: 'white',
                  borderColor: config.accentColor,
                  borderWidth: 2,
                  borderRadius: 16,
                  paddingHorizontal: getScaledSize(14, ageGroup, 'spacing'),
                  paddingVertical: getScaledSize(8, ageGroup, 'spacing'),
                  margin: 6,
                }}
                onPress={() => {
                  const subject = getSubjectsForAge(ageGroup).find(s => s.id === qs.subjectId) || { id: 'other', label: 'Other' };
                  navigation.navigate('Main', { selectedSubject: subject, quickStart: { workMinutes: qs.work, breakMinutes: qs.break } });
                }}
              >
                <Text style={{ color: config.primaryColor, fontWeight: '600' }}>{qs.emoji} {qs.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjectModal}
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
              What subject are you working on?
            </Text>
            <View style={styles.subjectGrid}>
              {getSubjectsForAge(ageGroup).map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectButton,
                    { 
                      padding: getScaledSize(20, ageGroup, 'spacing'),
                      borderColor: config.accentColor 
                    }
                  ]}
                  onPress={() => selectSubjectAndStart(subject)}
                >
                  <Text style={[
                    styles.subjectEmoji,
                    { fontSize: getScaledSize(32, ageGroup, 'iconSize') }
                  ]}>
                    {subject.emoji}
                  </Text>
                  <Text style={[
                    styles.subjectLabel,
                    { fontSize: getScaledSize(14, ageGroup, 'fontSize') }
                  ]}>
                    {subject.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: config.primaryColor }]}
              onPress={() => setShowSubjectModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// Helper function for mode descriptions
function getModeDescription(ageGroup, mode) {
  const descriptions = {
    study: {
      young: 'Time to learn!',
      elementary: 'Study time',
      tween: 'Focus mode', 
      teen: 'Work mode'
    },
    calm: {
      young: 'Feel better',
      elementary: 'Take a breath',
      tween: 'Reset',
      teen: 'Mindfulness'
    }
  };
  
  return descriptions[mode][ageGroup] || descriptions[mode].elementary;
}

// Quick Start presets by age group
function getQuickStarts(ageGroup) {
  const presets = {
    young: [
      { id: 'qs-math-10-3', subjectId: 'math', work: 10, break: 3, emoji: '🔢', label: 'Math 10 + 3' },
      { id: 'qs-read-10-3', subjectId: 'reading', work: 10, break: 3, emoji: '📚', label: 'Read 10 + 3' }
    ],
    elementary: [
      { id: 'qs-math-15-5', subjectId: 'math', work: 15, break: 5, emoji: '🔢', label: 'Math 15 + 5' },
      { id: 'qs-read-15-5', subjectId: 'reading', work: 15, break: 5, emoji: '📚', label: 'Read 15 + 5' }
    ],
    tween: [
      { id: 'qs-sci-20-5', subjectId: 'science', work: 20, break: 5, emoji: '🔬', label: 'Science 20 + 5' },
      { id: 'qs-math-20-5', subjectId: 'math', work: 20, break: 5, emoji: '🔢', label: 'Math 20 + 5' }
    ],
    teen: [
      { id: 'qs-write-25-5', subjectId: 'writing', work: 25, break: 5, emoji: '✏️', label: 'Write 25 + 5' },
      { id: 'qs-chem-25-5', subjectId: 'chemistry', work: 25, break: 5, emoji: '⚗️', label: 'Chem 25 + 5' }
    ]
  };
  return presets[ageGroup] || presets.elementary;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    color: '#7F8C8D',
    marginBottom: 5,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  modeCard: {
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  studyMode: {
    borderWidth: 2,
  },
  calmMode: {
    borderWidth: 2,
  },
  modeEmoji: {
    marginBottom: 15,
  },
  modeTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modeDescription: {
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
    color: '#95A5A6',
    textAlign: 'center',
    fontStyle: 'italic',
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
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  subjectButton: {
    backgroundColor: '#F0F8FF',
    margin: 8,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
  },
  subjectEmoji: {
    marginBottom: 8,
  },
  subjectLabel: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  closeButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
