# CI/CD Setup and Configuration Guide

## 🚀 Initial Setup

### Prerequisites

Before setting up the CI/CD pipeline, ensure you have:

- GitHub repository with appropriate permissions
- Expo account and organization setup
- Google Play Console access (for Android)
- Apple Developer account (for iOS)
- Required API keys and certificates

### Repository Configuration

#### 1. Branch Protection Setup

```bash
# Run the automated setup script
chmod +x scripts/setup/branch-protection-setup.sh
./scripts/setup/branch-protection-setup.sh
```

Or manually configure in GitHub:
- Navigate to Settings → Branches
- Add rules for `main` and `develop` branches
- Enable required status checks
- Require pull request reviews (2 for main, 1 for develop)
- Enable dismiss stale reviews
- Enable restrict pushes that create files

#### 2. Required Secrets Configuration

Add the following secrets in GitHub repository settings:

**Required Secrets:**
```bash
# Expo Configuration
EXPO_TOKEN="your-expo-token"
EXPO_PUBLIC_PROJECT_ID="your-project-id"

# Google Play Store (Android)
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON="base64-encoded-json"
GOOGLE_PLAY_TRACK="production"

# Apple App Store (iOS)
APPLE_ID="your-apple-id@example.com"
APPLE_ASC_APP_ID="1234567890"
APPLE_TEAM_ID="ABCD123456"
APPLE_KEY_ID="DEFG789012"
APPLE_ISSUER_ID="your-issuer-id"
APPLE_PRIVATE_KEY="base64-encoded-p8-key"

# Security Scanning
SNYK_TOKEN="your-snyk-token"
SONAR_TOKEN="your-sonarqube-token"
CODECOV_TOKEN="your-codecov-token"

# Notifications
SLACK_WEBHOOK_URL="your-slack-webhook"
DISCORD_WEBHOOK_URL="your-discord-webhook"

# Performance Monitoring
LIGHTHOUSE_TOKEN="your-lighthouse-token"
DATADOG_API_KEY="your-datadog-api-key"
```

#### 3. Environment-Specific Secrets

For each environment (development, staging, production):

```bash
# Development Environment
EXPO_PUBLIC_API_URL_DEV="https://dev-api.studybuddy.app"
DATABASE_URL_DEV="postgresql://dev-db-connection"

# Staging Environment  
EXPO_PUBLIC_API_URL_STAGING="https://staging-api.studybuddy.app"
DATABASE_URL_STAGING="postgresql://staging-db-connection"

# Production Environment
EXPO_PUBLIC_API_URL_PROD="https://api.studybuddy.app"
DATABASE_URL_PROD="postgresql://prod-db-connection"
```

### Workflow Files Setup

#### 1. Copy Workflow Templates

```bash
# Create .github/workflows directory if it doesn't exist
mkdir -p .github/workflows

# Copy workflow templates
cp templates/workflows/* .github/workflows/
```

#### 2. Customize Workflow Configuration

Edit each workflow file to match your project specifications:

**Enhanced CI/CD Pipeline** (`enhanced-ci-cd.yml`):
- Update branch names and triggers
- Modify build targets and platforms
- Adjust performance thresholds
- Configure notification channels

**PR Validation Pipeline** (`pr-validation.yml`):
- Set complexity calculation parameters
- Configure reviewer assignment rules
- Adjust test suite selection logic

**Release Automation** (`release-automation.yml`):
- Configure release branch strategy
- Set up version bump automation
- Define deployment approval gates

### Configuration Files Setup

#### 1. Audit CI Configuration

```json
// config/ci/audit-ci.config.json
{
  "moderate": false,
  "high": true,
  "critical": true,
  "allowlist": [
    "GHSA-xxxx-xxxx-xxxx"
  ],
  "skip-dev": false,
  "report-type": "summary",
  "output-format": "json"
}
```

#### 2. ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "expo",
    "eslint:recommended",
    "@react-native-community",
    "plugin:react-hooks/recommended"
  ],
  "plugins": ["react", "react-native", "detox"],
  "rules": {
    "react-native/no-unused-styles": "error",
    "react-native/split-platform-components": "error",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",
    "react-native/no-raw-text": "warn"
  },
  "env": {
    "react-native/react-native": true,
    "detox/detox": true
  }
}
```

#### 3. Jest Configuration

```json
// jest.config.js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/tests/setup/jest-setup.js"
  ],
  testEnvironment: "jsdom",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.{js,jsx,ts,tsx}",
    "!src/**/*.stories.{js,jsx,ts,tsx}"
  ],
  coverageThreshold: {
    "global": {
      "branches": 75,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
};
```

## 🔧 Advanced Configuration

### Custom GitHub Actions

#### 1. Complexity Calculator Action

```yaml
# .github/actions/calculate-complexity/action.yml
name: 'Calculate PR Complexity'
description: 'Calculates the complexity of a pull request'
inputs:
  github-token:
    description: 'GitHub token'
    required: true
outputs:
  complexity:
    description: 'PR complexity score (1-5)'
    value: ${{ steps.calculate.outputs.complexity }}
runs:
  using: 'node16'
  main: 'index.js'
```

#### 2. Performance Monitor Action

```yaml
# .github/actions/performance-monitor/action.yml
name: 'Performance Monitor'
description: 'Monitors build performance and bundle size'
inputs:
  bundle-path:
    description: 'Path to bundle file'
    required: true
  threshold:
    description: 'Size threshold in MB'
    required: false
    default: '1'
outputs:
  size:
    description: 'Bundle size in MB'
    value: ${{ steps.analyze.outputs.size }}
  passed:
    description: 'Whether threshold check passed'
    value: ${{ steps.analyze.outputs.passed }}
runs:
  using: 'node16'
  main: 'index.js'
```

### EAS Configuration

#### 1. Advanced EAS Build Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "development"
      },
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk"
      },
      "ios": {
        "buildConfiguration": "Debug",
        "simulator": true
      }
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "staging"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildConfiguration": "Release",
        "simulator": false
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      },
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    },
    "production-simulator": {
      "extends": "production",
      "ios": {
        "simulator": true
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "../secrets/google-play-service-account.json",
        "track": "production",
        "releaseStatus": "completed",
        "changesNotSentForReview": false
      },
      "ios": {
        "appleId": "$APPLE_ID",
        "ascAppId": "$APPLE_ASC_APP_ID",
        "appleTeamId": "$APPLE_TEAM_ID"
      }
    },
    "staging": {
      "android": {
        "serviceAccountKeyPath": "../secrets/google-play-service-account.json",
        "track": "internal",
        "releaseStatus": "completed"
      },
      "ios": {
        "appleId": "$APPLE_ID",
        "ascAppId": "$APPLE_ASC_APP_ID",
        "appleTeamId": "$APPLE_TEAM_ID"
      }
    }
  }
}
```

### Performance Configuration

#### 1. Lighthouse Configuration

```javascript
// config/ci/lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm run web',
      startServerReadyPattern: 'webpack compiled',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.8}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.8}],
        'first-contentful-paint': ['warn', {maxNumericValue: 2000}],
        'speed-index': ['warn', {maxNumericValue: 3000}],
        'interactive': ['error', {maxNumericValue: 5000}]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

#### 2. Bundle Analyzer Configuration

```javascript
// config/ci/bundle-analyzer.config.js
module.exports = {
  analyzerMode: 'json',
  reportFilename: 'bundle-report.json',
  generateStatsFile: true,
  statsFilename: 'bundle-stats.json',
  openAnalyzer: false,
  logLevel: 'info'
};
```

### Security Configuration

#### 1. SonarQube Configuration

```properties
# config/ci/sonarqube.properties
sonar.projectKey=studybuddy-mobile
sonar.organization=cognoco
sonar.host.url=https://sonarcloud.io
sonar.sources=src
sonar.tests=tests
sonar.test.inclusions=**/*.test.js,**/*.test.jsx,**/*.test.ts,**/*.test.tsx
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=test-reports/sonar-report.xml
sonar.coverage.exclusions=**/*.test.js,**/*.test.jsx,**/*.test.ts,**/*.test.tsx,**/node_modules/**
```

#### 2. Security Policy Configuration

```json
// config/security/security-config.json
{
  "vulnerabilityThresholds": {
    "critical": 0,
    "high": 0,
    "moderate": 5,
    "low": 10
  },
  "excludePackages": [
    "package-name@version"
  ],
  "allowedLicenses": [
    "MIT",
    "Apache-2.0",
    "BSD-3-Clause",
    "ISC"
  ],
  "scanSchedule": "0 2 * * *",
  "notificationChannels": {
    "critical": ["slack", "email"],
    "high": ["slack"],
    "moderate": ["email"]
  }
}
```

## 🎯 Environment-Specific Setup

### Development Environment

```bash
# Install development dependencies
npm install --dev

# Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npm run pre-commit"
npx husky add .husky/pre-push "npm run pre-push"

# Initialize development build
npm run build:detox:ios
npm run build:detox:android
```

### Staging Environment

```bash
# Build for staging
eas build --platform all --profile staging

# Submit to internal track
eas submit --platform android --profile staging
eas submit --platform ios --profile staging
```

### Production Environment

```bash
# Production build
eas build --platform all --profile production

# Submit to stores
eas submit --platform android --profile production
eas submit --platform ios --profile production
```

## 🔍 Validation and Testing

### Configuration Validation

```bash
# Validate workflow syntax
act -l

# Test workflows locally
act push

# Validate EAS configuration
eas config

# Test build configuration
eas build --platform ios --profile development --local
```

### Integration Testing

```bash
# Test complete CI/CD pipeline
npm run test:all
npm run build
npm run lint

# Test security scanning
npm audit
npx safety check

# Test performance monitoring
npm run test:performance
```

## 📊 Monitoring Setup

### GitHub Actions Monitoring

1. **Workflow Status Monitoring:**
   - Set up repository insights
   - Configure notification preferences
   - Enable workflow run retention

2. **Performance Tracking:**
   - Monitor build times
   - Track artifact sizes
   - Monitor test execution times

3. **Cost Optimization:**
   - Review Actions usage
   - Optimize runner selection
   - Implement caching strategies

### External Monitoring

1. **Datadog Integration:**
```yaml
- name: Send metrics to Datadog
  uses: DataDog/datadog-ci-action@v1
  with:
    api-key: ${{ secrets.DATADOG_API_KEY }}
    metrics: |
      - name: ci.build.duration
        value: ${{ steps.build.outputs.duration }}
        tags: ['env:production', 'platform:mobile']
```

2. **Slack Notifications:**
```yaml
- name: Slack notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 🚀 Deployment Configuration

### Blue-Green Deployment Setup

```yaml
# Deploy to staging slot
- name: Deploy to staging
  run: |
    eas build --platform all --profile staging
    eas submit --platform all --profile staging

# Health check
- name: Health check
  run: |
    curl -f https://staging.studybuddy.app/health

# Swap to production
- name: Swap to production
  run: |
    # Custom deployment script
    ./scripts/swap-deployment.sh staging production
```

### Rollback Configuration

```yaml
# Automatic rollback on failure
- name: Rollback on failure
  if: failure()
  run: |
    # Get previous successful deployment
    PREV_DEPLOYMENT=$(git describe --tags --abbrev=0 HEAD~1)
    
    # Rollback to previous version
    eas build --platform all --profile production --build-version $PREV_DEPLOYMENT
    eas submit --platform all --profile production
```

## 🔗 Integration Points

### Third-Party Service Integration

1. **Code Quality Services:**
   - SonarCloud for code analysis
   - Codecov for coverage reporting
   - Snyk for security scanning

2. **Performance Services:**
   - Lighthouse CI for performance audits
   - Bundle Analyzer for size tracking
   - WebPageTest for real-world metrics

3. **Monitoring Services:**
   - Sentry for error tracking
   - LogRocket for session replay
   - New Relic for APM

### Custom Webhooks

```yaml
# Custom webhook notification
- name: Custom webhook
  uses: distributhor/workflow-webhook@v1
  env:
    webhook_url: ${{ secrets.CUSTOM_WEBHOOK_URL }}
    webhook_secret: ${{ secrets.WEBHOOK_SECRET }}
```

---

**Next Steps:**
1. Follow the setup checklist in order
2. Test each component individually
3. Run full integration tests
4. Monitor initial deployments closely
5. Fine-tune configuration based on results

**Support Resources:**
- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Testing Documentation](https://jestjs.io/docs/getting-started)