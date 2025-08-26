import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  getScaledSize,
  TIMING_CONFIG
} from '../utils/constants';

export default function BigButton({ 
  title, 
  onPress, 
  color = '#4A90E2', 
  style,
  ageGroup = 'elementary'
}) {
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
        style={[
          styles.button, 
          { 
            backgroundColor: color,
            paddingHorizontal: getScaledSize(40, ageGroup, 'spacing'),
            paddingVertical: getScaledSize(20, ageGroup, 'spacing'),
            borderRadius: getScaledSize(30, ageGroup, 'spacing')
          }
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.buttonText,
          { fontSize: getScaledSize(24, ageGroup, 'fontSize') }
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
  },
});
