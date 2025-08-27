import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { getAgeConfig, getScaledSize } from '../utils/constants';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Here we would send to Sentry in production
    // Sentry.captureException(error, { extra: errorInfo });
  }

  resetError() {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      // Get age-appropriate styling
      const ageGroup = this.props.ageGroup || 'elementary';
      const config = getAgeConfig(ageGroup);

      return (
        <SafeAreaView style={[styles.container, { backgroundColor: config.secondaryColor }]}>
          <View style={styles.content}>
            
            {/* Friendly Buddy Icon */}
            <Text style={[
              styles.buddyEmoji,
              { fontSize: getScaledSize(80, ageGroup, 'iconSize') }
            ]}>
              😅
            </Text>
            
            {/* Age-appropriate title */}
            <Text style={[
              styles.title,
              { 
                fontSize: getScaledSize(24, ageGroup, 'fontSize'),
                color: config.primaryColor 
              }
            ]}>
              {this.getErrorTitle(ageGroup)}
            </Text>
            
            {/* Age-appropriate message */}
            <Text style={[
              styles.message,
              { 
                fontSize: getScaledSize(16, ageGroup, 'fontSize'),
                color: config.primaryColor 
              }
            ]}>
              {this.getErrorMessage(ageGroup)}
            </Text>

            {/* Try Again Button */}
            <TouchableOpacity 
              style={[
                styles.button,
                { 
                  backgroundColor: config.accentColor,
                  paddingVertical: getScaledSize(15, ageGroup, 'spacing'),
                  paddingHorizontal: getScaledSize(30, ageGroup, 'spacing'),
                  borderRadius: getScaledSize(20, ageGroup, 'spacing')
                }
              ]} 
              onPress={this.resetError}
            >
              <Text style={[
                styles.buttonText,
                { fontSize: getScaledSize(18, ageGroup, 'fontSize') }
              ]}>
                {this.getButtonText(ageGroup)}
              </Text>
            </TouchableOpacity>

            {/* Reload App Button */}
            <TouchableOpacity 
              style={[
                styles.secondaryButton,
                { 
                  borderColor: config.accentColor,
                  paddingVertical: getScaledSize(12, ageGroup, 'spacing'),
                  paddingHorizontal: getScaledSize(25, ageGroup, 'spacing'),
                  borderRadius: getScaledSize(20, ageGroup, 'spacing')
                }
              ]} 
              onPress={() => {
                // Reload the entire app
                if (typeof window !== 'undefined' && window.location) {
                  window.location.reload();
                } else {
                  // For native, we'd use a different approach
                  this.resetError();
                }
              }}
            >
              <Text style={[
                styles.secondaryButtonText,
                { 
                  fontSize: getScaledSize(16, ageGroup, 'fontSize'),
                  color: config.accentColor 
                }
              ]}>
                Start Fresh
              </Text>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }

  getErrorTitle(ageGroup) {
    const titles = {
      young: "Oopsie! 🤗",
      elementary: "Oops! Something happened",
      tween: "Technical difficulty",
      teen: "Something went wrong"
    };
    return titles[ageGroup] || titles.elementary;
  }

  getErrorMessage(ageGroup) {
    const messages = {
      young: "Your buddy took a little nap! Let's wake them up and try again!",
      elementary: "Don't worry! Your study buddy just needs a quick restart. Everything is safe!",
      tween: "No worries - just a small technical hiccup. Your progress is saved!",
      teen: "Technical issue detected. Your data is safe. Try restarting the app."
    };
    return messages[ageGroup] || messages.elementary;
  }

  getButtonText(ageGroup) {
    const buttons = {
      young: "Wake Up Buddy! 🌟",
      elementary: "Try Again! 🚀",
      tween: "Restart 💪",
      teen: "Retry"
    };
    return buttons[ageGroup] || buttons.elementary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  buddyEmoji: {
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  secondaryButton: {
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
});

export default ErrorBoundary;
