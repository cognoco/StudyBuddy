import React from 'react';
import { render } from '@testing-library/react-native';
import StudyTimer from '../../src/components/StudyTimer';
import BuddyCharacter from '../../src/components/BuddyCharacter';
import BigButton from '../../src/components/BigButton';
import MainScreen from '../../src/screens/MainScreen';
import { renderWithProviders } from '../utils/test-helpers';

// Mock Lottie animations for consistent snapshots
jest.mock('lottie-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return React.forwardRef((props, ref) => (
    <View {...props} ref={ref} testID={props.testID || 'lottie-animation'} />
  ));
});

describe('Visual Regression Tests', () => {
  describe('StudyTimer Visual Tests', () => {
    it('should match snapshot in initial state', () => {
      const tree = render(
        <StudyTimer
          duration={1500000}
          isRunning={false}
          isPaused={false}
          testID="study-timer"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('study-timer-initial');
    });

    it('should match snapshot when running', () => {
      const tree = render(
        <StudyTimer
          duration={1200000}
          isRunning={true}
          isPaused={false}
          testID="study-timer"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('study-timer-running');
    });

    it('should match snapshot when paused', () => {
      const tree = render(
        <StudyTimer
          duration={900000}
          isRunning={false}
          isPaused={true}
          testID="study-timer"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('study-timer-paused');
    });

    it('should match snapshot with low time warning', () => {
      const tree = render(
        <StudyTimer
          duration={60000} // 1 minute
          isRunning={true}
          isPaused={false}
          isLowTime={true}
          testID="study-timer"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('study-timer-low-time');
    });
  });

  describe('BuddyCharacter Visual Tests', () => {
    const moods = ['happy', 'excited', 'focused', 'tired', 'celebrating'];
    const activities = ['idle', 'studying', 'celebrating', 'resting', 'thinking'];

    moods.forEach(mood => {
      it(`should match snapshot for ${mood} mood`, () => {
        const tree = render(
          <BuddyCharacter
            mood={mood}
            activity="idle"
            testID="buddy-character"
          />
        ).toJSON();
        
        expect(tree).toMatchSnapshot(`buddy-character-${mood}`);
      });
    });

    activities.forEach(activity => {
      it(`should match snapshot for ${activity} activity`, () => {
        const tree = render(
          <BuddyCharacter
            mood="happy"
            activity={activity}
            testID="buddy-character"
          />
        ).toJSON();
        
        expect(tree).toMatchSnapshot(`buddy-character-${activity}`);
      });
    });

    it('should match snapshot with customization options', () => {
      const tree = render(
        <BuddyCharacter
          mood="happy"
          activity="idle"
          style="robot"
          color="blue"
          accessories={['hat', 'glasses']}
          testID="buddy-character"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('buddy-character-customized');
    });
  });

  describe('Button Visual Tests', () => {
    it('should match snapshot for primary button', () => {
      const tree = render(
        <BigButton
          title="Start Study Session"
          variant="primary"
          testID="primary-button"
          onPress={jest.fn()}
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('button-primary');
    });

    it('should match snapshot for secondary button', () => {
      const tree = render(
        <BigButton
          title="Take a Break"
          variant="secondary"
          testID="secondary-button"
          onPress={jest.fn()}
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('button-secondary');
    });

    it('should match snapshot for disabled button', () => {
      const tree = render(
        <BigButton
          title="Disabled Button"
          variant="primary"
          disabled={true}
          testID="disabled-button"
          onPress={jest.fn()}
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('button-disabled');
    });

    it('should match snapshot for loading button', () => {
      const tree = render(
        <BigButton
          title="Loading..."
          variant="primary"
          loading={true}
          testID="loading-button"
          onPress={jest.fn()}
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('button-loading');
    });
  });

  describe('Screen Layout Tests', () => {
    it('should match snapshot for main screen', () => {
      const tree = renderWithProviders(<MainScreen />).toJSON();
      expect(tree).toMatchSnapshot('main-screen');
    });

    it('should match snapshot for main screen with completed sessions', () => {
      const tree = renderWithProviders(
        <MainScreen sessionsCompleted={3} totalStudyTime={4500000} />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('main-screen-with-progress');
    });
  });

  describe('Responsive Design Tests', () => {
    const screenSizes = [
      { name: 'small', width: 320, height: 568 },   // iPhone 5
      { name: 'medium', width: 375, height: 812 },  // iPhone X
      { name: 'large', width: 414, height: 896 },   // iPhone 11 Pro Max
      { name: 'tablet', width: 768, height: 1024 }, // iPad
    ];

    screenSizes.forEach(({ name, width, height }) => {
      it(`should match snapshot for ${name} screen size`, () => {
        // Mock Dimensions for screen size
        jest.doMock('react-native', () => {
          const RN = jest.requireActual('react-native');
          return {
            ...RN,
            Dimensions: {
              get: () => ({ width, height }),
              addEventListener: jest.fn(),
              removeEventListener: jest.fn(),
            },
          };
        });

        const tree = renderWithProviders(<MainScreen />).toJSON();
        expect(tree).toMatchSnapshot(`main-screen-${name}`);
      });
    });
  });

  describe('Theme Variations', () => {
    const themes = ['light', 'dark', 'auto'];

    themes.forEach(theme => {
      it(`should match snapshot for ${theme} theme`, () => {
        const tree = render(
          <StudyTimer
            duration={1500000}
            theme={theme}
            testID="study-timer"
          />
        ).toJSON();
        
        expect(tree).toMatchSnapshot(`study-timer-${theme}-theme`);
      });
    });
  });

  describe('Animation States', () => {
    it('should match snapshot for celebration animation', () => {
      const tree = render(
        <BuddyCharacter
          mood="celebrating"
          activity="celebrating"
          showConfetti={true}
          testID="buddy-character"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('buddy-celebration-animation');
    });

    it('should match snapshot without animations (reduced motion)', () => {
      const tree = render(
        <BuddyCharacter
          mood="celebrating"
          activity="celebrating"
          reduceMotion={true}
          testID="buddy-character"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('buddy-celebration-no-animation');
    });
  });

  describe('Error States', () => {
    it('should match snapshot for timer error state', () => {
      const tree = render(
        <StudyTimer
          duration={1500000}
          hasError={true}
          errorMessage="Timer synchronization failed"
          testID="study-timer"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('study-timer-error');
    });

    it('should match snapshot for buddy character error state', () => {
      const tree = render(
        <BuddyCharacter
          mood="confused"
          activity="error"
          showError={true}
          errorMessage="Unable to load character"
          testID="buddy-character"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('buddy-character-error');
    });
  });

  describe('Loading States', () => {
    it('should match snapshot for main screen loading state', () => {
      const tree = renderWithProviders(
        <MainScreen isLoading={true} />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('main-screen-loading');
    });

    it('should match snapshot for buddy character loading state', () => {
      const tree = render(
        <BuddyCharacter
          mood="idle"
          activity="loading"
          isLoading={true}
          testID="buddy-character"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('buddy-character-loading');
    });
  });

  describe('Accessibility Visual Tests', () => {
    it('should match snapshot with high contrast mode', () => {
      const tree = render(
        <StudyTimer
          duration={1500000}
          highContrast={true}
          testID="study-timer"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('study-timer-high-contrast');
    });

    it('should match snapshot with large text', () => {
      const tree = render(
        <StudyTimer
          duration={1500000}
          fontSize="large"
          testID="study-timer"
        />
      ).toJSON();
      
      expect(tree).toMatchSnapshot('study-timer-large-text');
    });
  });
});