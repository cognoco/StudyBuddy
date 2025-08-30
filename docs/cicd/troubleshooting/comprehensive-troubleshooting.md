# Comprehensive CI/CD Troubleshooting Guide

## 🚨 Critical Issues

### Production Deployment Failures

#### Symptom: EAS Build Fails in Production
```
Error: Build failed with exit code 1
```

**Diagnosis Steps:**
```bash
# Check build logs
eas build:list --platform all --status error

# Examine specific build
eas build:view [BUILD_ID]

# Check local build
eas build --platform ios --profile production --local
```

**Common Causes & Solutions:**
1. **Certificate Issues:**
   ```bash
   # Regenerate certificates
   eas credentials
   # Select iOS → Production → Distribution Certificate → Regenerate
   ```

2. **Bundle Size Too Large:**
   ```bash
   # Analyze bundle
   npx react-native-bundle-visualizer
   
   # Optimize images
   npm install --save-dev imagemin-cli
   imagemin assets/images/* --out-dir=assets/images/optimized
   ```

3. **Native Dependencies Issues:**
   ```bash
   # Clear cache
   npx expo prebuild --clear
   
   # Reinstall pods (iOS)
   cd ios && pod install --repo-update
   ```

#### Symptom: App Store Submission Rejected
```
Error: Invalid Bundle - Missing required icon sizes
```

**Solutions:**
```bash
# Generate all required icons
npx expo install @expo/vector-icons
npx expo install expo-asset

# Update app.json with proper icon configuration
{
  "expo": {
    "icon": "./assets/icon.png",
    "ios": {
      "icon": "./assets/icon-ios.png"
    },
    "android": {
      "icon": "./assets/icon-android.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

### Security Scan Failures

#### Symptom: High/Critical Vulnerabilities Block Deployment
```
Error: Found 3 critical vulnerabilities
```

**Immediate Response:**
```bash
# Audit dependencies
npm audit --audit-level high

# Fix automatically fixable issues
npm audit fix

# Check specific vulnerabilities
npm audit --json | jq '.vulnerabilities'

# Override false positives (temporary)
echo "GHSA-xxxx-xxxx-xxxx" >> .audit-ci-allowlist
```

**Long-term Solutions:**
```bash
# Update dependencies
npm update
npx npm-check-updates -u

# Replace vulnerable packages
npm uninstall vulnerable-package
npm install secure-alternative

# Use dependency overrides (package.json)
{
  "overrides": {
    "vulnerable-package": "^safe-version"
  }
}
```

## ⚡ Build System Issues

### GitHub Actions Runner Problems

#### Symptom: Runners Running Out of Space
```
Error: No space left on device
```

**Solutions:**
```yaml
# Add cleanup step to workflow
- name: Free disk space
  run: |
    sudo rm -rf /usr/share/dotnet
    sudo rm -rf /opt/ghc
    sudo rm -rf /usr/local/share/boost
    sudo apt-get clean
    docker system prune -af
    
    # Show available space
    df -h
```

#### Symptom: Network Timeouts
```
Error: connect ETIMEDOUT
```

**Solutions:**
```yaml
# Add retry logic
- name: Install dependencies with retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: npm ci

# Use different registry
- name: Setup npm registry
  run: |
    npm config set registry https://registry.npmjs.org/
    npm config set timeout 600000
```

### Node.js and NPM Issues

#### Symptom: Package Installation Failures
```
Error: ERESOLVE unable to resolve dependency tree
```

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# Use legacy peer deps
npm install --legacy-peer-deps

# Force resolution
npm install --force
```

#### Symptom: Version Mismatch Errors
```
Error: Node.js version mismatch
```

**Solutions:**
```yaml
# Pin Node.js version in workflow
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18.17.0'  # Specific version
    cache: 'npm'

# Use .nvmrc for local development
echo "18.17.0" > .nvmrc
```

### Expo and EAS Issues

#### Symptom: EAS CLI Authentication Failures
```
Error: Authentication failed
```

**Solutions:**
```bash
# Re-authenticate
eas logout
eas login

# Check token validity
eas whoami

# Use robot token for CI
eas login --username robot --password $EXPO_TOKEN
```

#### Symptom: Build Queue Delays
```
Warning: Build is queued, estimated wait time: 45 minutes
```

**Solutions:**
```bash
# Use priority builds (paid feature)
eas build --platform all --priority high

# Build locally for testing
eas build --platform all --local

# Schedule builds during off-peak hours
# Add to workflow with cron schedule
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC
```

## 🧪 Test-Related Issues

### Jest Test Failures

#### Symptom: Tests Timeout
```
Error: Timeout - Async callback was not invoked within the timeout
```

**Solutions:**
```javascript
// Increase timeout for specific tests
describe('Slow tests', () => {
  jest.setTimeout(30000); // 30 seconds
  
  test('slow operation', async () => {
    // test implementation
  });
});

// Global timeout in jest.config.js
module.exports = {
  testTimeout: 10000,
  // other config
};
```

#### Symptom: Memory Leaks in Tests
```
Error: JavaScript heap out of memory
```

**Solutions:**
```javascript
// Add cleanup in tests
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  cleanup(); // from @testing-library/react-native
});

// Increase memory limit
// package.json
{
  "scripts": {
    "test": "node --max_old_space_size=4096 node_modules/.bin/jest"
  }
}
```

### End-to-End Test Issues

#### Symptom: Detox Tests Failing
```
Error: Unable to launch app
```

**Solutions:**
```bash
# Rebuild Detox binaries
detox clean-framework-cache
detox build-framework-cache

# Reset simulator
xcrun simctl erase all

# Check simulator availability
xcrun simctl list devices available

# Android emulator issues
$ANDROID_HOME/emulator/emulator -list-avds
$ANDROID_HOME/emulator/emulator -avd Pixel_4_API_30 -wipe-data
```

## 📱 Platform-Specific Issues

### iOS Build Problems

#### Symptom: Code Signing Issues
```
Error: Code signing "StudyBuddy" failed
```

**Solutions:**
```bash
# Check certificates
security find-identity -v -p codesigning

# Clean Xcode build folder
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Reset certificates in EAS
eas credentials --platform ios
# Select: Remove all credentials → Add new credentials
```

#### Symptom: Provisioning Profile Issues
```
Error: No profiles for 'com.studybuddy.app' were found
```

**Solutions:**
```bash
# Regenerate profiles
eas credentials --platform ios
# Select: Provisioning Profile → Regenerate

# Check app.json bundle identifier
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.studybuddy.app"
    }
  }
}
```

### Android Build Problems

#### Symptom: Gradle Build Failures
```
Error: Execution failed for task ':app:processReleaseResources'
```

**Solutions:**
```bash
# Clean Android build
cd android
./gradlew clean
rm -rf app/build

# Check Android SDK
sdkmanager --list
sdkmanager --update

# Fix resource conflicts
# Check for duplicate resource names in android/app/src/main/res/
```

#### Symptom: APK Size Too Large
```
Error: APK size exceeds store limit
```

**Solutions:**
```json
// Enable ProGuard/R8 in android/app/build.gradle
android {
  buildTypes {
    release {
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
  }
}
```

```bash
# Enable bundle splitting
eas build --platform android --profile production --split-bundle
```

## 🔐 Security and Secrets Issues

### Secrets Management Problems

#### Symptom: Missing Environment Variables
```
Error: Environment variable EXPO_TOKEN is not defined
```

**Solutions:**
```bash
# Check secret exists
gh secret list --repo owner/repo

# Add missing secret
gh secret set EXPO_TOKEN --body "your-token-value" --repo owner/repo

# Test locally with env file
echo "EXPO_TOKEN=your-token" > .env.local
# Add .env.local to .gitignore
```

#### Symptom: Secret Access Denied
```
Error: Secret EXPO_TOKEN cannot be accessed from pull request
```

**Solutions:**
```yaml
# Use pull_request_target for trusted PRs only
on:
  pull_request_target:
    types: [opened, synchronize]

# Or use environment protection
environment: production
```

### Certificate and Key Issues

#### Symptom: Expired Certificates
```
Error: Certificate has expired
```

**Solutions:**
```bash
# Check certificate validity
openssl x509 -in certificate.pem -text -noout

# Renew Apple certificates
eas credentials --platform ios
# Select: Distribution Certificate → Regenerate

# Update keystore (Android)
eas credentials --platform android
# Select: Keystore → Generate new keystore
```

## 📊 Performance and Resource Issues

### Build Performance Problems

#### Symptom: Slow Build Times
```
Warning: Build took 45 minutes to complete
```

**Solutions:**
```yaml
# Use build caching
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# Use matrix builds for parallel execution
strategy:
  matrix:
    platform: [ios, android, web]
```

```javascript
// Optimize Metro bundler
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      keep_classnames: true,
      keep_fnames: true,
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },
  },
};
```

### Memory and Resource Issues

#### Symptom: Out of Memory During Build
```
Error: JavaScript heap out of memory
```

**Solutions:**
```yaml
# Increase memory for Node.js
- name: Build with more memory
  run: NODE_OPTIONS="--max_old_space_size=4096" npm run build

# Use larger GitHub runners
runs-on: ubuntu-latest-4-cores
```

## 🔍 Debugging and Monitoring

### Advanced Debugging Techniques

#### Enable Debug Logging
```yaml
# In workflow file
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
  EAS_DEBUG: true
  DEBUG: expo:*
```

#### Build Artifacts Analysis
```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v3
  with:
    name: debug-logs
    path: |
      logs/
      *.log
      build-output/
```

#### Performance Profiling
```yaml
- name: Profile build performance
  run: |
    time npm run build
    
    # Measure bundle size
    ls -lah dist/
    
    # Generate bundle analysis
    npm run analyze-bundle
```

### Monitoring and Alerting

#### Set Up Build Monitoring
```yaml
- name: Report build metrics
  run: |
    echo "BUILD_DURATION=${{ steps.build.outputs.duration }}" >> $GITHUB_ENV
    echo "BUNDLE_SIZE=$(stat -f%z dist/bundle.js)" >> $GITHUB_ENV
    
    # Send to monitoring service
    curl -X POST "https://api.datadog.com/api/v1/series" \
      -H "Content-Type: application/json" \
      -H "DD-API-KEY: ${{ secrets.DATADOG_API_KEY }}" \
      -d '{
        "series": [{
          "metric": "ci.build.duration",
          "points": [['$(date +%s)', "$BUILD_DURATION"]],
          "tags": ["repo:studybuddy", "branch:${{ github.ref_name }}"]
        }]
      }'
```

## 🛠️ Recovery Procedures

### Disaster Recovery

#### Complete Pipeline Failure
1. **Assess Impact:**
   ```bash
   # Check all recent builds
   eas build:list --platform all --limit 10
   
   # Check production health
   curl -f https://studybuddy.app/health
   ```

2. **Emergency Deployment:**
   ```bash
   # Deploy from last known good commit
   git checkout $(git describe --tags --abbrev=0)
   eas build --platform all --profile production
   ```

3. **Rollback Strategy:**
   ```bash
   # Find last successful deployment
   LAST_GOOD=$(gh run list --status success --limit 1 --json headSha -q '.[0].headSha')
   
   # Create rollback branch
   git checkout -b emergency-rollback-$(date +%Y%m%d)
   git reset --hard $LAST_GOOD
   git push origin emergency-rollback-$(date +%Y%m%d)
   ```

### Data Recovery

#### Lost Build Artifacts
```bash
# Re-download from EAS
eas build:list --platform all --json > builds.json
cat builds.json | jq -r '.[] | select(.status=="finished") | .artifacts.buildUrl' | head -1 | xargs wget

# Rebuild if necessary
eas build --platform all --profile production --no-wait
```

#### Configuration Recovery
```bash
# Restore from backup
git checkout HEAD~1 -- .github/workflows/
git checkout HEAD~1 -- eas.json
git checkout HEAD~1 -- package.json

# Verify configuration
eas config
npm run lint
```

## 📋 Prevention Strategies

### Proactive Monitoring

#### Automated Health Checks
```yaml
# Add to workflow
- name: Health check
  run: |
    # Check build system health
    npm doctor
    
    # Check EAS status
    curl -f https://status.expo.dev/api/v2/status.json
    
    # Verify secrets are accessible
    if [ -z "$EXPO_TOKEN" ]; then
      echo "::error::EXPO_TOKEN not found"
      exit 1
    fi
```

#### Regular Maintenance
```bash
#!/bin/bash
# maintenance.sh - Run weekly

# Update dependencies
npm audit fix
npm update

# Clean caches
npm cache clean --force
eas cache:clear

# Update workflows
gh workflow list --json | jq -r '.[].path' | xargs -I {} gh workflow view {} --ref main

# Check certificate expiry
eas credentials --platform ios --non-interactive | grep -i expire
```

### Quality Gates

#### Pre-deployment Validation
```yaml
- name: Pre-deployment validation
  run: |
    # Verify all tests pass
    npm run test:all
    
    # Check bundle size
    BUNDLE_SIZE=$(stat -f%z dist/bundle.js)
    MAX_SIZE=1048576  # 1MB
    if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
      echo "::error::Bundle size $BUNDLE_SIZE exceeds limit $MAX_SIZE"
      exit 1
    fi
    
    # Verify no high vulnerabilities
    npm audit --audit-level high
```

---

**Emergency Contacts:**
- 🚨 **Critical Issues:** Slack #emergency-ci-cd
- 📧 **Build Issues:** build-support@studybuddy.app
- 🔐 **Security Issues:** security@studybuddy.app

**Documentation Updates:**
This guide should be updated whenever new issues are discovered and resolved. Use the following process:
1. Document the issue in this guide
2. Create a test case to prevent regression
3. Update monitoring to catch similar issues early
4. Share learnings with the team

**Last Updated:** $(date +"%Y-%m-%d")