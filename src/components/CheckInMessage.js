import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { 
  getAgeConfig, 
  getScaledSize,
  TIMING_CONFIG
} from '../utils/constants';

export default function CheckInMessage({ message, ageGroup = 'elementary' }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  const config = getAgeConfig(ageGroup);

  useEffect(() => {
    // Fade in and slide down using configured timing
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: TIMING_CONFIG.animations.fadeIn,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade out after configured display time
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: TIMING_CONFIG.animations.fadeIn,
        useNativeDriver: true,
      }).start();
    }, TIMING_CONFIG.session.checkInDisplay);
  }, [message]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: config.accentColor || '#4A90E2',
          paddingHorizontal: getScaledSize(20, ageGroup, 'spacing'),
          paddingVertical: getScaledSize(15, ageGroup, 'spacing'),
          borderRadius: getScaledSize(15, ageGroup, 'spacing'),
          top: getScaledSize(100, ageGroup, 'spacing')
        },
      ]}
    >
      <Text style={[
        styles.message,
        { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
      ]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 1000,
  },
  message: {
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});
