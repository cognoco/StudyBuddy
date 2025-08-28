import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import StudyTimer from '../../../src/components/StudyTimer';

// Mock the constants
jest.mock('../../../src/utils/constants', () => ({
  TIMER_STATES: {
    STOPPED: 'stopped',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
  },
  DEFAULT_STUDY_DURATION: 25 * 60 * 1000, // 25 minutes
}));

describe('StudyTimer Component', () => {
  const defaultProps = {
    duration: 1500000, // 25 minutes in milliseconds
    onComplete: jest.fn(),
    onStart: jest.fn(),
    onPause: jest.fn(),
    onResume: jest.fn(),
    onStop: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers('legacy');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Timer Display', () => {
    it('should display initial time correctly', () => {
      const { getByTestId } = render(<StudyTimer {...defaultProps} />);
      const timerDisplay = getByTestId('timer-display');
      
      expect(timerDisplay).toHaveTextContent('25:00');
    });

    it('should format time correctly for different durations', () => {
      const testCases = [
        { duration: 60000, expected: '01:00' }, // 1 minute
        { duration: 3600000, expected: '60:00' }, // 60 minutes
        { duration: 30000, expected: '00:30' }, // 30 seconds
      ];

      testCases.forEach(({ duration, expected }) => {
        const { getByTestId, unmount } = render(
          <StudyTimer {...defaultProps} duration={duration} />
        );
        const timerDisplay = getByTestId('timer-display');
        
        expect(timerDisplay).toHaveTextContent(expected);
        unmount();
      });
    });
  });

  describe('Timer Controls', () => {
    it('should start timer when play button is pressed', () => {
      const { getByTestId } = render(<StudyTimer {...defaultProps} />);
      const playButton = getByTestId('play-button');
      
      fireEvent.press(playButton);
      
      expect(defaultProps.onStart).toHaveBeenCalled();
      expect(getByTestId('timer-status')).toHaveTextContent('running');
    });

    it('should pause timer when pause button is pressed', () => {
      const { getByTestId } = render(<StudyTimer {...defaultProps} />);
      const playButton = getByTestId('play-button');
      const pauseButton = getByTestId('pause-button');
      
      // Start timer first
      fireEvent.press(playButton);
      
      // Then pause it
      fireEvent.press(pauseButton);
      
      expect(defaultProps.onPause).toHaveBeenCalled();
      expect(getByTestId('timer-status')).toHaveTextContent('paused');
    });

    it('should resume timer when resume button is pressed', () => {
      const { getByTestId } = render(<StudyTimer {...defaultProps} />);
      const playButton = getByTestId('play-button');
      const pauseButton = getByTestId('pause-button');
      const resumeButton = getByTestId('resume-button');
      
      // Start, pause, then resume
      fireEvent.press(playButton);
      fireEvent.press(pauseButton);
      fireEvent.press(resumeButton);
      
      expect(defaultProps.onResume).toHaveBeenCalled();
      expect(getByTestId('timer-status')).toHaveTextContent('running');
    });

    it('should stop timer when stop button is pressed', () => {
      const { getByTestId } = render(<StudyTimer {...defaultProps} />);
      const playButton = getByTestId('play-button');
      const stopButton = getByTestId('stop-button');
      
      fireEvent.press(playButton);
      fireEvent.press(stopButton);
      
      expect(defaultProps.onStop).toHaveBeenCalled();
      expect(getByTestId('timer-status')).toHaveTextContent('stopped');
    });
  });

  describe('Timer Functionality', () => {
    it('should countdown correctly', async () => {
      const shortDuration = 3000; // 3 seconds
      const { getByTestId } = render(
        <StudyTimer {...defaultProps} duration={shortDuration} />
      );
      
      const playButton = getByTestId('play-button');
      const timerDisplay = getByTestId('timer-display');
      
      fireEvent.press(playButton);
      
      // Check initial state
      expect(timerDisplay).toHaveTextContent('00:03');
      
      // Advance timer by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(timerDisplay).toHaveTextContent('00:02');
      });
    });

    it('should call onComplete when timer reaches zero', async () => {
      const shortDuration = 1000; // 1 second
      const { getByTestId } = render(
        <StudyTimer {...defaultProps} duration={shortDuration} />
      );
      
      const playButton = getByTestId('play-button');
      fireEvent.press(playButton);
      
      // Fast-forward to completion
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(defaultProps.onComplete).toHaveBeenCalledWith({
          duration: shortDuration,
          completed: true,
        });
      });
    });

    it('should not countdown when paused', async () => {
      const { getByTestId } = render(<StudyTimer {...defaultProps} />);
      const playButton = getByTestId('play-button');
      const pauseButton = getByTestId('pause-button');
      const timerDisplay = getByTestId('timer-display');
      
      fireEvent.press(playButton);
      fireEvent.press(pauseButton);
      
      const timeBeforePause = timerDisplay.props.children;
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Timer should not have changed
      expect(timerDisplay.props.children).toBe(timeBeforePause);
    });

    it('should reset to original duration when stopped', () => {
      const { getByTestId } = render(<StudyTimer {...defaultProps} />);
      const playButton = getByTestId('play-button');
      const stopButton = getByTestId('stop-button');
      const timerDisplay = getByTestId('timer-display');
      
      fireEvent.press(playButton);
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      fireEvent.press(stopButton);
      
      expect(timerDisplay).toHaveTextContent('25:00');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration gracefully', () => {
      const { getByTestId } = render(
        <StudyTimer {...defaultProps} duration={0} />
      );
      const timerDisplay = getByTestId('timer-display');
      
      expect(timerDisplay).toHaveTextContent('00:00');
    });

    it('should handle negative duration gracefully', () => {
      const { getByTestId } = render(
        <StudyTimer {...defaultProps} duration={-1000} />
      );
      const timerDisplay = getByTestId('timer-display');
      
      expect(timerDisplay).toHaveTextContent('00:00');
    });

    it('should handle missing onComplete callback', () => {
      const propsWithoutCallback = { ...defaultProps, onComplete: undefined };
      const { getByTestId } = render(
        <StudyTimer {...propsWithoutCallback} duration={1000} />
      );
      
      const playButton = getByTestId('play-button');
      fireEvent.press(playButton);
      
      expect(() => {
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByTestId } = render(<StudyTimer {...defaultProps} />);
      
      expect(getByTestId('play-button')).toHaveAccessibilityRole('button');
      expect(getByTestId('play-button')).toHaveAccessibilityLabel('Start timer');
      
      expect(getByTestId('pause-button')).toHaveAccessibilityRole('button');
      expect(getByTestId('pause-button')).toHaveAccessibilityLabel('Pause timer');
      
      expect(getByTestId('timer-display')).toHaveAccessibilityRole('text');
      expect(getByTestId('timer-display')).toHaveAccessibilityLabel('Timer: 25 minutes remaining');
    });

    it('should update accessibility labels when timer state changes', () => {
      const { getByTestId } = render(<StudyTimer {...defaultProps} />);
      const playButton = getByTestId('play-button');
      const timerDisplay = getByTestId('timer-display');
      
      fireEvent.press(playButton);
      
      expect(timerDisplay).toHaveAccessibilityLabel('Timer: 25 minutes remaining, running');
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks during long sessions', () => {
      const { unmount } = render(<StudyTimer {...defaultProps} />);
      
      // Simulate component lifecycle
      for (let i = 0; i < 100; i++) {
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }
      
      // Should unmount without issues
      expect(() => unmount()).not.toThrow();
    });

    it('should efficiently handle rapid state changes', () => {
      const { getByTestId } = render(<StudyTimer {...defaultProps} />);
      const playButton = getByTestId('play-button');
      const pauseButton = getByTestId('pause-button');
      
      const startTime = performance.now();
      
      // Rapid play/pause cycles
      for (let i = 0; i < 50; i++) {
        fireEvent.press(playButton);
        fireEvent.press(pauseButton);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (< 100ms)
      expect(executionTime).toBeLessThan(100);
    });
  });
});