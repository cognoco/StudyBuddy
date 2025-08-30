import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../../src/utils/storage';
import { sanitizeInput, validateInput, encryptData, decryptData } from '../../src/utils/security';

describe('Security Tests', () => {
  describe('Input Validation and Sanitization', () => {
    describe('XSS Prevention', () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
        '<svg onload=alert("XSS")>',
        '{{constructor.constructor("alert(\"XSS\")")()}}',
        '<iframe src="javascript:alert(\"XSS\")"></iframe>',
      ];

      xssPayloads.forEach(payload => {
        it(`should sanitize XSS payload: ${payload.substring(0, 20)}...`, () => {
          const sanitized = sanitizeInput(payload);
          
          expect(sanitized).not.toContain('<script>');
          expect(sanitized).not.toContain('javascript:');
          expect(sanitized).not.toContain('onerror=');
          expect(sanitized).not.toContain('onload=');
          expect(sanitized).not.toMatch(/<[^>]*>/); // No HTML tags
        });
      });

      it('should preserve safe content while sanitizing', () => {
        const safeInput = 'My study session lasted 25 minutes & 30 seconds!';
        const sanitized = sanitizeInput(safeInput);
        
        expect(sanitized).toContain('25 minutes');
        expect(sanitized).toContain('30 seconds');
        // Ampersand should be escaped
        expect(sanitized).toContain('&amp;');
      });
    });

    describe('SQL Injection Prevention', () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1' --",
        "'; DELETE FROM sessions; --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "' OR 1=1#",
      ];

      sqlPayloads.forEach(payload => {
        it(`should prevent SQL injection with payload: ${payload}`, async () => {
          // Test storage operations with malicious input
          const sessionData = {
            id: payload,
            name: payload,
            description: payload,
            startTime: Date.now(),
            duration: 1500000,
          };

          // Should not throw errors or execute malicious SQL
          await expect(async () => {
            await storage.saveStudySession(sessionData);
            const retrieved = await storage.getStudySession(payload);
            return retrieved;
          }).not.toThrow();
        });
      });
    });

    describe('Input Validation', () => {
      it('should validate email addresses correctly', () => {
        const validEmails = [
          'user@example.com',
          'test.email+tag@domain.co.uk',
          'user.name@domain-name.com',
        ];

        const invalidEmails = [
          'invalid-email',
          '@domain.com',
          'user@',
          'user..name@domain.com',
          'user@domain',
        ];

        validEmails.forEach(email => {
          expect(validateInput.email(email)).toBe(true);
        });

        invalidEmails.forEach(email => {
          expect(validateInput.email(email)).toBe(false);
        });
      });

      it('should validate session durations', () => {
        const validDurations = [1, 5, 25, 45, 60, 90, 120];
        const invalidDurations = [-1, 0, 0.5, 181, 1000, 'abc', null, undefined];

        validDurations.forEach(duration => {
          expect(validateInput.duration(duration)).toBe(true);
        });

        invalidDurations.forEach(duration => {
          expect(validateInput.duration(duration)).toBe(false);
        });
      });

      it('should validate user names', () => {
        const validNames = [
          'John Doe',
          'Alice Smith-Jones',
          'José María',
          '李小明',
        ];

        const invalidNames = [
          '', // Empty
          'A', // Too short
          'A'.repeat(101), // Too long
          '<script>alert("XSS")</script>',
          'user@domain.com', // Email-like
        ];

        validNames.forEach(name => {
          expect(validateInput.name(name)).toBe(true);
        });

        invalidNames.forEach(name => {
          expect(validateInput.name(name)).toBe(false);
        });
      });
    });
  });

  describe('Data Encryption and Storage Security', () => {
    describe('Sensitive Data Encryption', () => {
      it('should encrypt and decrypt user data correctly', () => {
        const sensitiveData = {
          email: 'user@example.com',
          preferences: {
            notifications: true,
            studyReminders: ['9:00', '14:00', '20:00'],
          },
        };

        const encrypted = encryptData(JSON.stringify(sensitiveData));
        expect(encrypted).not.toContain('user@example.com');
        expect(encrypted).not.toEqual(JSON.stringify(sensitiveData));

        const decrypted = JSON.parse(decryptData(encrypted));
        expect(decrypted).toEqual(sensitiveData);
      });

      it('should handle encryption of empty or null data', () => {
        expect(() => encryptData('')).not.toThrow();
        expect(() => encryptData(null)).not.toThrow();
        expect(() => encryptData(undefined)).not.toThrow();
        
        const encryptedEmpty = encryptData('');
        expect(decryptData(encryptedEmpty)).toBe('');
      });

      it('should use different encryption keys for different data types', () => {
        const userData = 'user-sensitive-data';
        const sessionData = 'session-sensitive-data';

        const encryptedUser = encryptData(userData, 'user');
        const encryptedSession = encryptData(sessionData, 'session');

        // Should produce different encrypted values even with same content
        expect(encryptedUser).not.toEqual(encryptedSession);

        // Should decrypt correctly with proper keys
        expect(decryptData(encryptedUser, 'user')).toBe(userData);
        expect(decryptData(encryptedSession, 'session')).toBe(sessionData);
      });
    });

    describe('Storage Security', () => {
      beforeEach(async () => {
        await AsyncStorage.clear();
      });

      it('should not store sensitive data in plain text', async () => {
        const sensitivePreferences = {
          email: 'user@example.com',
          parentEmail: 'parent@example.com',
          deviceId: 'unique-device-identifier',
        };

        await storage.saveUserPreferences(sensitivePreferences);

        // Check raw storage - sensitive data should be encrypted
        const rawStoredData = await AsyncStorage.getItem('USER_PREFERENCES');
        expect(rawStoredData).not.toContain('user@example.com');
        expect(rawStoredData).not.toContain('parent@example.com');
        expect(rawStoredData).not.toContain('unique-device-identifier');
      });

      it('should validate data integrity on retrieval', async () => {
        const originalData = {
          studyDuration: 25,
          breakDuration: 5,
          notifications: true,
        };

        await storage.saveUserPreferences(originalData);

        // Manually corrupt the stored data
        const corruptedData = 'corrupted-data-that-should-fail-validation';
        await AsyncStorage.setItem('USER_PREFERENCES', corruptedData);

        // Should handle corrupted data gracefully
        const retrievedData = await storage.getUserPreferences();
        expect(retrievedData).not.toEqual(originalData);
        // Should return defaults or empty object, not crash
        expect(retrievedData).toBeDefined();
      });
    });
  });

  describe('Authentication and Authorization', () => {
    describe('Session Management', () => {
      it('should handle session expiration correctly', async () => {
        const sessionData = {
          userId: 'user-123',
          token: 'session-token',
          expiresAt: Date.now() - 1000, // Expired 1 second ago
        };

        await storage.saveSession(sessionData);
        const isValid = await storage.isSessionValid();

        expect(isValid).toBe(false);
      });

      it('should invalidate sessions on security events', async () => {
        const sessionData = {
          userId: 'user-123',
          token: 'session-token',
          expiresAt: Date.now() + 3600000, // Valid for 1 hour
        };

        await storage.saveSession(sessionData);
        expect(await storage.isSessionValid()).toBe(true);

        // Simulate security event (multiple failed attempts, etc.)
        await storage.invalidateSessionsForSecurityEvent();
        expect(await storage.isSessionValid()).toBe(false);
      });
    });

    describe('Permission Validation', () => {
      it('should validate user permissions for sensitive operations', () => {
        const userWithPermissions = {
          id: 'user-123',
          permissions: ['read_stats', 'modify_settings', 'export_data'],
        };

        const userWithoutPermissions = {
          id: 'user-456',
          permissions: ['read_stats'],
        };

        expect(validateInput.hasPermission(userWithPermissions, 'modify_settings')).toBe(true);
        expect(validateInput.hasPermission(userWithoutPermissions, 'modify_settings')).toBe(false);
        expect(validateInput.hasPermission(userWithoutPermissions, 'read_stats')).toBe(true);
      });
    });
  });

  describe('Network Security', () => {
    describe('API Request Validation', () => {
      it('should validate API request parameters', () => {
        const validRequest = {
          userId: 'user-123',
          sessionId: 'session-456',
          action: 'save_session',
          data: { duration: 25, completed: true },
        };

        const invalidRequests = [
          { ...validRequest, userId: null },
          { ...validRequest, action: '<script>alert("XSS")</script>' },
          { ...validRequest, data: null },
          { userId: 'user-123' }, // Missing required fields
        ];

        expect(validateInput.apiRequest(validRequest)).toBe(true);
        
        invalidRequests.forEach(request => {
          expect(validateInput.apiRequest(request)).toBe(false);
        });
      });

      it('should sanitize API response data', () => {
        const unsafeResponse = {
          message: '<script>alert("XSS")</script>',
          userMessage: 'Great job on your study session!',
          stats: {
            totalTime: '<img src=x onerror=alert("XSS")>',
            sessionsCompleted: 5,
          },
        };

        const sanitizedResponse = sanitizeInput.apiResponse(unsafeResponse);

        expect(sanitizedResponse.message).not.toContain('<script>');
        expect(sanitizedResponse.userMessage).toBe('Great job on your study session!');
        expect(sanitizedResponse.stats.totalTime).not.toContain('<img');
        expect(sanitizedResponse.stats.sessionsCompleted).toBe(5);
      });
    });
  });

  describe('File System Security', () => {
    it('should validate file paths to prevent directory traversal', () => {
      const safePaths = [
        'user-data.json',
        'sessions/2023-10-15.json',
        'exports/study-stats.csv',
      ];

      const unsafePaths = [
        '../../../etc/passwd',
        '..\\windows\\system32\\config',
        '/etc/shadow',
        '../../node_modules/malicious-package',
        'sessions/../../config.json',
      ];

      safePaths.forEach(path => {
        expect(validateInput.filePath(path)).toBe(true);
      });

      unsafePaths.forEach(path => {
        expect(validateInput.filePath(path)).toBe(false);
      });
    });

    it('should validate file extensions', () => {
      const allowedExtensions = ['.json', '.csv', '.txt'];
      
      const safeFiles = [
        'data.json',
        'export.csv',
        'notes.txt',
      ];

      const unsafeFiles = [
        'malicious.exe',
        'script.js',
        'config.sh',
        'data.json.exe', // Double extension attack
      ];

      safeFiles.forEach(file => {
        expect(validateInput.fileExtension(file, allowedExtensions)).toBe(true);
      });

      unsafeFiles.forEach(file => {
        expect(validateInput.fileExtension(file, allowedExtensions)).toBe(false);
      });
    });
  });

  describe('Rate Limiting and Abuse Prevention', () => {
    it('should implement rate limiting for API calls', async () => {
      const rateLimiter = {
        attempts: 0,
        lastAttempt: Date.now(),
        maxAttempts: 5,
        windowMs: 60000, // 1 minute
      };

      // Simulate multiple rapid requests
      for (let i = 0; i < 10; i++) {
        const isAllowed = validateInput.checkRateLimit(rateLimiter);
        
        if (i < 5) {
          expect(isAllowed).toBe(true);
        } else {
          expect(isAllowed).toBe(false); // Should be rate limited
        }
        
        rateLimiter.attempts++;
      }
    });

    it('should detect suspicious activity patterns', () => {
      const suspiciousPatterns = [
        {
          type: 'rapid_session_creation',
          count: 50,
          timeWindow: 60000, // 50 sessions in 1 minute
          isSuspicious: true,
        },
        {
          type: 'normal_usage',
          count: 5,
          timeWindow: 3600000, // 5 sessions in 1 hour
          isSuspicious: false,
        },
        {
          type: 'data_export_abuse',
          count: 20,
          timeWindow: 300000, // 20 exports in 5 minutes
          isSuspicious: true,
        },
      ];

      suspiciousPatterns.forEach(pattern => {
        const isSuspicious = validateInput.detectSuspiciousActivity(
          pattern.type,
          pattern.count,
          pattern.timeWindow
        );
        
        expect(isSuspicious).toBe(pattern.isSuspicious);
      });
    });
  });

  describe('Data Privacy and Compliance', () => {
    it('should handle data anonymization correctly', () => {
      const userData = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe',
        deviceInfo: {
          model: 'iPhone 12',
          os: 'iOS 15.0',
          uniqueId: 'ABC123-DEF456-GHI789',
        },
        sessions: [
          {
            id: 'session-1',
            startTime: Date.now(),
            duration: 1500000,
            location: { lat: 37.7749, lng: -122.4194 },
          },
        ],
      };

      const anonymizedData = sanitizeInput.anonymizeData(userData);

      expect(anonymizedData.email).toBeUndefined();
      expect(anonymizedData.name).toBeUndefined();
      expect(anonymizedData.deviceInfo.uniqueId).toBeUndefined();
      expect(anonymizedData.sessions[0].location).toBeUndefined();
      
      // Non-sensitive data should be preserved
      expect(anonymizedData.sessions[0].duration).toBe(1500000);
      expect(anonymizedData.deviceInfo.model).toBe('iPhone 12');
    });

    it('should support data retention policies', async () => {
      const oldSession = {
        id: 'old-session',
        startTime: Date.now() - (365 * 24 * 60 * 60 * 1000), // 1 year ago
        duration: 1500000,
        completed: true,
      };

      const recentSession = {
        id: 'recent-session',
        startTime: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        duration: 1500000,
        completed: true,
      };

      await storage.saveStudySession(oldSession);
      await storage.saveStudySession(recentSession);

      // Apply retention policy (e.g., delete data older than 6 months)
      await storage.applyRetentionPolicy(180); // 180 days

      const sessions = await storage.getAllStudySessions();
      const sessionIds = sessions.map(s => s.id);
      
      expect(sessionIds).not.toContain('old-session');
      expect(sessionIds).toContain('recent-session');
    });
  });
});