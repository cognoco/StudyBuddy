import { device, element, by, expect as detoxExpect } from 'detox';

describe('Complete Study Session Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES', microphone: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Skip onboarding if it appears
    try {
      await element(by.id('skip-onboarding-button')).tap();
    } catch (e) {
      // Onboarding may not be present
    }
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Timer Functionality', () => {
    it('should complete a full focus session', async () => {
      // Navigate to main study screen
      await detoxExpect(element(by.id('main-screen'))).toBeVisible();
      
      // Start a focus session
      await element(by.id('focus-mode-button')).tap();
      await detoxExpect(element(by.id('timer-screen'))).toBeVisible();
      
      // Verify timer is set to default duration
      await detoxExpect(element(by.id('timer-display'))).toHaveText('25:00');
      
      // Start the timer
      await element(by.id('start-timer-button')).tap();
      
      // Verify timer is running
      await detoxExpect(element(by.id('timer-status'))).toHaveText('running');
      await detoxExpect(element(by.id('pause-button'))).toBeVisible();
      
      // Wait for timer to count down (using test helper to fast-forward)
      await element(by.id('test-complete-session')).tap();
      
      // Verify completion screen appears
      await detoxExpect(element(by.id('celebration-screen'))).toBeVisible();
      await detoxExpect(element(by.text('Great job!'))).toBeVisible();
      await detoxExpect(element(by.id('session-complete-animation'))).toBeVisible();
    });

    it('should handle timer pause and resume correctly', async () => {
      await element(by.id('focus-mode-button')).tap();
      await element(by.id('start-timer-button')).tap();
      
      // Pause the timer
      await element(by.id('pause-button')).tap();
      await detoxExpect(element(by.id('timer-status'))).toHaveText('paused');
      await detoxExpect(element(by.id('resume-button'))).toBeVisible();
      
      // Resume the timer
      await element(by.id('resume-button')).tap();
      await detoxExpect(element(by.id('timer-status'))).toHaveText('running');
      await detoxExpect(element(by.id('pause-button'))).toBeVisible();
    });

    it('should allow timer cancellation', async () => {
      await element(by.id('focus-mode-button')).tap();
      await element(by.id('start-timer-button')).tap();
      
      // Cancel the session
      await element(by.id('cancel-session-button')).tap();
      
      // Confirm cancellation
      await detoxExpect(element(by.text('Cancel Session?'))).toBeVisible();
      await element(by.text('Yes, Cancel')).tap();
      
      // Should return to main screen
      await detoxExpect(element(by.id('main-screen'))).toBeVisible();
    });
  });

  describe('Break Sessions', () => {
    it('should transition to break after focus session', async () => {
      await element(by.id('focus-mode-button')).tap();
      await element(by.id('start-timer-button')).tap();
      await element(by.id('test-complete-session')).tap();
      
      // Should show break suggestion
      await detoxExpect(element(by.text('Time for a break!'))).toBeVisible();
      await detoxExpect(element(by.id('start-break-button'))).toBeVisible();
      await detoxExpect(element(by.id('skip-break-button'))).toBeVisible();
      
      // Start break
      await element(by.id('start-break-button')).tap();
      
      // Verify break timer
      await detoxExpect(element(by.id('timer-display'))).toHaveText('05:00');
      await detoxExpect(element(by.id('break-mode-indicator'))).toBeVisible();
    });

    it('should complete break session successfully', async () => {
      // Complete a focus session first
      await element(by.id('focus-mode-button')).tap();
      await element(by.id('start-timer-button')).tap();
      await element(by.id('test-complete-session')).tap();
      
      // Start and complete break
      await element(by.id('start-break-button')).tap();
      await element(by.id('start-timer-button')).tap();
      await element(by.id('test-complete-session')).tap();
      
      // Should show ready for next session
      await detoxExpect(element(by.text('Ready for another session?'))).toBeVisible();
      await detoxExpect(element(by.id('start-new-session-button'))).toBeVisible();
    });
  });

  describe('Settings and Customization', () => {
    it('should allow timer duration customization', async () => {
      // Navigate to settings
      await element(by.id('settings-button')).tap();
      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
      
      // Change focus duration
      await element(by.id('focus-duration-slider')).swipe('right', 'slow');
      
      // Verify new duration is saved
      await element(by.id('back-button')).tap();
      await element(by.id('focus-mode-button')).tap();
      
      // Timer should show new duration (example: 30 minutes)
      await detoxExpect(element(by.id('timer-display'))).toHaveText('30:00');
    });

    it('should toggle sound settings correctly', async () => {
      await element(by.id('settings-button')).tap();
      
      // Toggle sound off
      await element(by.id('sound-toggle')).tap();
      
      // Start a session and complete it
      await element(by.id('back-button')).tap();
      await element(by.id('focus-mode-button')).tap();
      await element(by.id('start-timer-button')).tap();
      await element(by.id('test-complete-session')).tap();
      
      // Should not play completion sound (verified through test helpers)
      await detoxExpect(element(by.id('sound-played-indicator'))).not.toExist();
    });
  });

  describe('Buddy Character Integration', () => {
    it('should show buddy character throughout session', async () => {
      await element(by.id('focus-mode-button')).tap();
      
      // Buddy should be visible in idle state
      await detoxExpect(element(by.id('buddy-character'))).toBeVisible();
      await detoxExpect(element(by.id('buddy-idle-animation'))).toBeVisible();
      
      // Start session
      await element(by.id('start-timer-button')).tap();
      
      // Buddy should show focused animation
      await detoxExpect(element(by.id('buddy-focused-animation'))).toBeVisible();
      
      // Complete session
      await element(by.id('test-complete-session')).tap();
      
      // Buddy should show celebration animation
      await detoxExpect(element(by.id('buddy-celebration-animation'))).toBeVisible();
    });

    it('should allow buddy customization', async () => {
      await element(by.id('buddy-character')).tap();
      
      // Should open customization options
      await detoxExpect(element(by.text('Customize Your Buddy'))).toBeVisible();
      
      // Try different buddy styles
      await element(by.id('buddy-style-robot')).tap();
      await element(by.id('confirm-buddy-change')).tap();
      
      // Verify buddy changed
      await detoxExpect(element(by.id('buddy-robot-style'))).toBeVisible();
    });
  });

  describe('Statistics Tracking', () => {
    it('should track and display session statistics', async () => {
      // Complete multiple sessions
      for (let i = 0; i < 3; i++) {
        await element(by.id('focus-mode-button')).tap();
        await element(by.id('start-timer-button')).tap();
        await element(by.id('test-complete-session')).tap();
        
        if (i < 2) {
          // Skip break for first two sessions
          await element(by.id('skip-break-button')).tap();
          await element(by.id('start-new-session-button')).tap();
        }
      }
      
      // Navigate to statistics
      await element(by.id('stats-button')).tap();
      await detoxExpect(element(by.id('statistics-screen'))).toBeVisible();
      
      // Verify session count
      await detoxExpect(element(by.text('3 sessions completed today'))).toBeVisible();
      
      // Verify total study time
      await detoxExpect(element(by.text('75 minutes of focused study'))).toBeVisible();
    });

    it('should show weekly progress', async () => {
      await element(by.id('stats-button')).tap();
      
      // Switch to weekly view
      await element(by.id('weekly-stats-tab')).tap();
      
      // Should show weekly chart
      await detoxExpect(element(by.id('weekly-progress-chart'))).toBeVisible();
      await detoxExpect(element(by.id('weekly-streak-counter'))).toBeVisible();
    });
  });

  describe('Notifications', () => {
    it('should request notification permissions on first launch', async () => {
      await device.launchApp({ newInstance: true });
      
      // Should show permission request
      await detoxExpect(element(by.text('Stay motivated with reminders!'))).toBeVisible();
      await element(by.text('Allow Notifications')).tap();
      
      // Should proceed to main app
      await detoxExpected(element(by.id('main-screen'))).toBeVisible();
    });
    
    it('should handle notification permission denial gracefully', async () => {
      await device.launchApp({ 
        newInstance: true, 
        permissions: { notifications: 'NO' } 
      });
      
      // App should still function without notifications
      await detoxExpect(element(by.id('main-screen'))).toBeVisible();
      
      // Settings should show notification status
      await element(by.id('settings-button')).tap();
      await detoxExpect(element(by.text('Notifications: Disabled'))).toBeVisible();
    });
  });

  describe('Offline Functionality', () => {
    it('should work without internet connection', async () => {
      await device.setNetworkConnection({
        type: 'none',
      });
      
      // App should still function
      await element(by.id('focus-mode-button')).tap();
      await element(by.id('start-timer-button')).tap();
      await element(by.id('test-complete-session')).tap();
      
      // Should complete successfully
      await detoxExpect(element(by.id('celebration-screen'))).toBeVisible();
      
      // Re-enable network
      await device.setNetworkConnection({
        type: 'wifi',
        state: 'connected',
      });
    });
    
    it('should sync data when connection is restored', async () => {
      // Complete session offline
      await device.setNetworkConnection({ type: 'none' });
      await element(by.id('focus-mode-button')).tap();
      await element(by.id('start-timer-button')).tap();
      await element(by.id('test-complete-session')).tap();
      
      // Restore connection
      await device.setNetworkConnection({
        type: 'wifi',
        state: 'connected',
      });
      
      // Check statistics to verify data was preserved
      await element(by.id('stats-button')).tap();
      await detoxExpect(element(by.text('1 session completed today'))).toBeVisible();
    });
  });

  describe('Performance and Stability', () => {
    it('should handle long study sessions without crashes', async () => {
      await element(by.id('settings-button')).tap();
      
      // Set very long session (for testing)
      await element(by.id('focus-duration-slider')).swipe('right', 'fast');
      await element(by.id('back-button')).tap();
      
      await element(by.id('focus-mode-button')).tap();
      await element(by.id('start-timer-button')).tap();
      
      // Simulate running for extended time
      await device.setOrientation('landscape');
      await device.setOrientation('portrait');
      
      // App should remain stable
      await detoxExpect(element(by.id('timer-screen'))).toBeVisible();
      await detoxExpect(element(by.id('timer-status'))).toHaveText('running');
    });
    
    it('should maintain state across app backgrounding', async () => {
      await element(by.id('focus-mode-button')).tap();
      await element(by.id('start-timer-button')).tap();
      
      const initialTime = await element(by.id('timer-display')).getAttributes();
      
      // Background and foreground app
      await device.sendToHome();
      await device.launchApp();
      
      // Timer should still be running
      await detoxExpect(element(by.id('timer-status'))).toHaveText('running');
      
      // Time should have continued counting
      const currentTime = await element(by.id('timer-display')).getAttributes();
      expect(currentTime.text).not.toBe(initialTime.text);
    });
  });
});