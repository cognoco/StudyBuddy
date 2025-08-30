// ESLint Security Configuration
module.exports = {
  extends: [
    'plugin:security/recommended',
    'plugin:security-node/recommended'
  ],
  plugins: [
    'security',
    'security-node'
  ],
  rules: {
    // Security plugin rules
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'warn',
    'security/detect-object-injection': 'error',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',
    
    // Security-node plugin rules
    'security-node/detect-absence-of-name-option-in-expreess-session': 'error',
    'security-node/detect-buffer-constructor': 'error',
    'security-node/detect-child-process-exec': 'warn',
    'security-node/detect-crlf': 'error',
    'security-node/detect-dangerous-redirects': 'error',
    'security-node/detect-eval-with-expression': 'error',
    'security-node/detect-insecure-randomness': 'error',
    'security-node/detect-non-literal-require-calls': 'warn',
    'security-node/detect-option-multiparthandler': 'error',
    'security-node/detect-option-unsafe-inline': 'error',
    'security-node/detect-possible-timing-attacks': 'warn',
    'security-node/detect-runinthiscontext-method': 'error',
    'security-node/detect-security-md5': 'error',
    'security-node/detect-security-sha1': 'warn',
    'security-node/detect-sql-injection': 'error',
    'security-node/detect-unescaped-output': 'error',
    'security-node/detect-unsafe-regex': 'error',
    'security-node/non-literal-reg-expr': 'error'
  },
  
  overrides: [
    {
      // React Native specific security rules
      files: ['src/**/*.js', 'src/**/*.jsx'],
      rules: {
        // Custom rules for React Native security
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-script-url': 'error',
        'no-alert': 'warn',
        'no-console': 'warn'
      }
    },
    {
      // Test files - relaxed security rules
      files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*'],
      rules: {
        'security/detect-non-literal-fs-filename': 'off',
        'security/detect-child-process': 'off',
        'security-node/detect-child-process-exec': 'off'
      }
    }
  ],
  
  settings: {
    'security-node': {
      // Skip security checks in development dependencies
      skipDevDependencies: true
    }
  }
};