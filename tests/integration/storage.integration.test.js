import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../../src/utils/storage';

describe('Storage Integration Tests', () => {
  beforeEach(async () => {
    // Clear all storage before each test
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    // Cleanup after each test
    await AsyncStorage.clear();
  });

  describe('User Preferences Storage', () => {
    it('should persist and retrieve user preferences correctly', async () => {
      const preferences = {
        studyDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        notifications: true,
        soundEnabled: false,
        theme: 'light',
        language: 'en',
      };

      await storage.saveUserPreferences(preferences);
      const retrieved = await storage.getUserPreferences();

      expect(retrieved).toEqual(preferences);
    });

    it('should return default preferences when none exist', async () => {
      const defaultPreferences = await storage.getUserPreferences();

      expect(defaultPreferences).toEqual({
        studyDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        notifications: true,
        soundEnabled: true,
        theme: 'system',
        language: 'en',
      });
    });

    it('should merge partial preferences with defaults', async () => {
      const partialPreferences = {
        studyDuration: 30,
        notifications: false,
      };

      await storage.saveUserPreferences(partialPreferences);
      const retrieved = await storage.getUserPreferences();

      expect(retrieved).toEqual({
        studyDuration: 30,
        breakDuration: 5,
        longBreakDuration: 15,
        notifications: false,
        soundEnabled: true,
        theme: 'system',
        language: 'en',
      });
    });
  });

  describe('Study Session Storage', () => {
    it('should save and retrieve study session data', async () => {
      const sessionData = {
        id: 'session-123',
        startTime: Date.now(),
        duration: 1500000, // 25 minutes
        completed: true,
        mode: 'focus',
        breaks: 2,
      };

      await storage.saveStudySession(sessionData);
      const retrieved = await storage.getStudySession(sessionData.id);

      expect(retrieved).toEqual(sessionData);
    });

    it('should retrieve all study sessions', async () => {
      const sessions = [
        {
          id: 'session-1',
          startTime: Date.now() - 86400000, // Yesterday
          duration: 1500000,
          completed: true,
          mode: 'focus',
        },
        {
          id: 'session-2',
          startTime: Date.now(),
          duration: 300000, // 5 minutes
          completed: false,
          mode: 'break',
        },
      ];

      for (const session of sessions) {
        await storage.saveStudySession(session);
      }

      const allSessions = await storage.getAllStudySessions();
      expect(allSessions).toHaveLength(2);
      expect(allSessions).toEqual(expect.arrayContaining(sessions));
    });

    it('should filter sessions by date range', async () => {
      const now = Date.now();
      const yesterday = now - 86400000;
      const twoDaysAgo = now - 172800000;

      const sessions = [
        { id: '1', startTime: twoDaysAgo, completed: true },
        { id: '2', startTime: yesterday, completed: true },
        { id: '3', startTime: now, completed: true },
      ];

      for (const session of sessions) {
        await storage.saveStudySession(session);
      }

      const recentSessions = await storage.getStudySessionsByDateRange(
        yesterday,
        now
      );

      expect(recentSessions).toHaveLength(2);
      expect(recentSessions.map(s => s.id)).toEqual(['2', '3']);
    });
  });

  describe('Statistics Storage', () => {
    it('should calculate and store daily statistics', async () => {
      const today = new Date().toISOString().split('T')[0];
      const sessions = [
        {
          id: 'session-1',
          startTime: Date.now(),
          duration: 1500000, // 25 minutes
          completed: true,
        },
        {
          id: 'session-2',
          startTime: Date.now(),
          duration: 1500000, // 25 minutes
          completed: true,
        },
      ];

      for (const session of sessions) {
        await storage.saveStudySession(session);
      }

      await storage.updateDailyStatistics(today);
      const stats = await storage.getDailyStatistics(today);

      expect(stats).toEqual({
        date: today,
        totalStudyTime: 3000000, // 50 minutes
        completedSessions: 2,
        totalSessions: 2,
        averageSessionLength: 1500000,
      });
    });

    it('should retrieve weekly statistics', async () => {
      const dates = [];
      const now = new Date();
      
      // Generate last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // Create statistics for each day
      for (let i = 0; i < dates.length; i++) {
        await storage.saveDailyStatistics(dates[i], {
          date: dates[i],
          totalStudyTime: (i + 1) * 1500000, // Increasing study time
          completedSessions: i + 1,
          totalSessions: i + 1,
        });
      }

      const weeklyStats = await storage.getWeeklyStatistics();

      expect(weeklyStats).toHaveLength(7);
      expect(weeklyStats[0].totalStudyTime).toBeGreaterThan(
        weeklyStats[6].totalStudyTime
      );
    });
  });

  describe('Data Migration', () => {
    it('should migrate data from older version', async () => {
      // Simulate old data format
      const oldData = {
        studyTime: 25,
        breakTime: 5,
        enableNotifications: true,
      };

      await AsyncStorage.setItem('OLD_USER_PREFS', JSON.stringify(oldData));

      const migrated = await storage.migrateFromOldVersion();

      expect(migrated).toBe(true);

      const newPreferences = await storage.getUserPreferences();
      expect(newPreferences.studyDuration).toBe(25);
      expect(newPreferences.breakDuration).toBe(5);
      expect(newPreferences.notifications).toBe(true);
    });

    it('should handle corrupt data gracefully', async () => {
      // Set corrupt JSON data
      await AsyncStorage.setItem('USER_PREFERENCES', 'invalid-json');

      const preferences = await storage.getUserPreferences();

      // Should return defaults when data is corrupt
      expect(preferences).toEqual({
        studyDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        notifications: true,
        soundEnabled: true,
        theme: 'system',
        language: 'en',
      });
    });
  });

  describe('Storage Performance', () => {
    it('should handle large amounts of session data efficiently', async () => {
      const sessions = [];
      const sessionCount = 1000;

      // Generate large dataset
      for (let i = 0; i < sessionCount; i++) {
        sessions.push({
          id: `session-${i}`,
          startTime: Date.now() - (i * 3600000), // Spread over hours
          duration: 1500000,
          completed: Math.random() > 0.1, // 90% completion rate
        });
      }

      const startTime = performance.now();

      // Save all sessions
      for (const session of sessions) {
        await storage.saveStudySession(session);
      }

      const saveTime = performance.now() - startTime;
      expect(saveTime).toBeLessThan(5000); // Should complete in < 5 seconds

      const retrieveStart = performance.now();
      const allSessions = await storage.getAllStudySessions();
      const retrieveTime = performance.now() - retrieveStart;

      expect(allSessions).toHaveLength(sessionCount);
      expect(retrieveTime).toBeLessThan(1000); // Should retrieve in < 1 second
    });

    it('should efficiently clean up old data', async () => {
      const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      // Add old and new sessions
      const oldSessions = [
        { id: 'old-1', startTime: cutoffDate - 86400000, completed: true },
        { id: 'old-2', startTime: cutoffDate - 172800000, completed: true },
      ];
      
      const newSessions = [
        { id: 'new-1', startTime: Date.now(), completed: true },
        { id: 'new-2', startTime: Date.now() - 86400000, completed: true },
      ];

      for (const session of [...oldSessions, ...newSessions]) {
        await storage.saveStudySession(session);
      }

      await storage.cleanupOldData(cutoffDate);
      const remainingSessions = await storage.getAllStudySessions();

      expect(remainingSessions).toHaveLength(2);
      expect(remainingSessions.every(s => s.startTime >= cutoffDate)).toBe(true);
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent reads and writes safely', async () => {
      const promises = [];
      const sessionCount = 10;

      // Create concurrent save operations
      for (let i = 0; i < sessionCount; i++) {
        promises.push(
          storage.saveStudySession({
            id: `concurrent-${i}`,
            startTime: Date.now(),
            duration: 1500000,
            completed: true,
          })
        );
      }

      // Add concurrent read operations
      for (let i = 0; i < sessionCount; i++) {
        promises.push(storage.getAllStudySessions());
      }

      // All operations should complete without errors
      const results = await Promise.allSettled(promises);
      const failures = results.filter(r => r.status === 'rejected');
      
      expect(failures).toHaveLength(0);

      // Verify all sessions were saved
      const finalSessions = await storage.getAllStudySessions();
      expect(finalSessions.length).toBeGreaterThanOrEqual(sessionCount);
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage quota exceeded gracefully', async () => {
      // Mock AsyncStorage to throw quota exceeded error
      const originalSetItem = AsyncStorage.setItem;
      AsyncStorage.setItem = jest.fn().mockRejectedValue(
        new Error('QuotaExceededError')
      );

      const result = await storage.saveStudySession({
        id: 'test-session',
        startTime: Date.now(),
        duration: 1500000,
        completed: true,
      });

      expect(result).toBe(false); // Should return false on failure

      // Restore original method
      AsyncStorage.setItem = originalSetItem;
    });

    it('should retry failed operations', async () => {
      let callCount = 0;
      const originalGetItem = AsyncStorage.getItem;
      
      AsyncStorage.getItem = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return originalGetItem('USER_PREFERENCES');
      });

      const preferences = await storage.getUserPreferences();
      
      expect(callCount).toBe(3); // Should have retried twice
      expect(preferences).toBeDefined();

      // Restore original method
      AsyncStorage.getItem = originalGetItem;
    });
  });
});