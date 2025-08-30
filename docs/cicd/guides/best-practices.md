# CI/CD Best Practices Guide

## 🎯 Core Principles

### 1. Shift-Left Testing
Catch issues early in the development cycle to reduce costs and improve quality.

```yaml
# Example: Progressive testing strategy
stages:
  - lint_and_format     # < 30 seconds
  - unit_tests         # < 2 minutes  
  - integration_tests  # < 5 minutes
  - e2e_tests         # < 15 minutes
  - security_scans    # < 10 minutes
  - performance_tests # < 10 minutes
```

### 2. Build Once, Deploy Many
Create artifacts once and promote them through environments.

```yaml
# Build artifact with environment-agnostic configuration
- name: Build universal artifact
  run: |
    npm run build
    # Package with environment configuration injection
    tar -czf app-${{ github.sha }}.tar.gz dist/
    
- name: Upload artifact
  uses: actions/upload-artifact@v3
  with:
    name: app-build-${{ github.sha }}
    path: app-${{ github.sha }}.tar.gz
```

### 3. Everything as Code
Version control all configuration, infrastructure, and processes.

```yaml
# Infrastructure as Code
├── .github/
│   ├── workflows/           # CI/CD pipelines
│   ├── CODEOWNERS          # Review assignments
│   └── branch_protection.yml # Branch rules
├── config/
│   ├── ci/                 # CI configuration
│   ├── security/           # Security policies
│   └── monitoring/         # Monitoring setup
└── scripts/
    ├── deploy/            # Deployment scripts
    └── maintenance/       # Maintenance tasks
```

## 🚀 Pipeline Design Best Practices

### Fast Feedback Loops

#### Optimize for Speed
```yaml
# Parallel job execution
jobs:
  quick-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Lint (30s)
      - name: Type check (45s)  
      - name: Unit tests (90s)
        
  comprehensive-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Integration tests (5m)
      - name: E2E tests (10m)
      
  security-scan:
    runs-on: ubuntu-latest  
    steps:
      - name: Security audit (3m)
      - name: Vulnerability scan (5m)
```

#### Smart Test Selection
```yaml
# Run different test suites based on changes
- name: Determine test strategy
  id: test-strategy
  run: |
    if git diff --name-only HEAD~1 | grep -q "src/components/"; then
      echo "::set-output name=strategy::comprehensive"
    elif git diff --name-only HEAD~1 | grep -q "package.json"; then
      echo "::set-output name=strategy::full"
    else
      echo "::set-output name=strategy::minimal"
    fi

- name: Run tests
  run: |
    case "${{ steps.test-strategy.outputs.strategy }}" in
      "full")     npm run test:all ;;
      "comprehensive") npm run test:unit && npm run test:integration ;;
      "minimal")  npm run test:quick ;;
    esac
```

### Fail-Fast Strategy

#### Early Quality Gates
```yaml
# Stop pipeline early on critical issues
- name: Code quality gate
  run: |
    # Fail if critical security vulnerabilities
    if npm audit --audit-level critical | grep -q "found"; then
      echo "::error::Critical vulnerabilities found"
      exit 1
    fi
    
    # Fail if test coverage below threshold
    COVERAGE=$(npm run test:coverage | grep "Lines" | awk '{print $4}' | tr -d '%')
    if [ "$COVERAGE" -lt 80 ]; then
      echo "::error::Test coverage $COVERAGE% below 80% threshold"
      exit 1
    fi
```

#### Resource Optimization
```yaml
# Cancel redundant builds
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# Use appropriate runner sizes
jobs:
  quick-tasks:
    runs-on: ubuntu-latest  # 2 cores, 7GB RAM
    
  intensive-tasks:
    runs-on: ubuntu-latest-4-cores  # 4 cores, 16GB RAM
    
  build-ios:
    runs-on: macos-latest  # Required for iOS builds
```

## 🔒 Security Best Practices

### Secrets Management

#### Never Hardcode Secrets
```yaml
# ❌ BAD - Hardcoded secret
env:
  API_KEY: "sk-1234567890abcdef"

# ✅ GOOD - Use GitHub secrets
env:
  API_KEY: ${{ secrets.API_KEY }}
```

#### Least Privilege Access
```yaml
# Use environment-specific secrets
- name: Deploy to staging
  env:
    DEPLOY_KEY: ${{ secrets.STAGING_DEPLOY_KEY }}
  if: github.ref == 'refs/heads/develop'
  
- name: Deploy to production  
  env:
    DEPLOY_KEY: ${{ secrets.PROD_DEPLOY_KEY }}
  if: github.ref == 'refs/heads/main'
```

#### Secret Scanning
```yaml
# Automated secret detection
- name: Secret scan
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: main
    head: HEAD
```

### Dependency Security

#### Automated Vulnerability Scanning
```yaml
# Multi-layered security scanning
- name: Dependency audit
  run: |
    # NPM audit
    npm audit --audit-level moderate
    
    # Snyk scan
    npx snyk test --severity-threshold=high
    
    # OWASP dependency check
    dependency-check --project StudyBuddy --scan . --format JSON
```

#### Dependency Updates
```yaml
# Dependabot configuration - .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    reviewers:
      - "security-team"
    assignees:
      - "lead-developer"
```

### Code Scanning

#### Static Analysis Security Testing (SAST)
```yaml
- name: CodeQL Analysis
  uses: github/codeql-action/analyze@v2
  with:
    languages: javascript
    queries: security-and-quality

- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

#### License Compliance
```yaml
- name: License check
  run: |
    npx license-checker --onlyAllow "MIT;Apache-2.0;BSD-3-Clause;ISC" --summary
    
    # Generate license report
    npx license-checker --json > licenses.json
    
    # Check for GPL licenses (restrictive)
    if grep -i "gpl" licenses.json; then
      echo "::warning::GPL licensed dependencies found"
    fi
```

## 📊 Testing Best Practices

### Test Pyramid Strategy

#### Unit Tests (70%)
```javascript
// Fast, isolated tests
describe('StudyTimer utility', () => {
  it('should format time correctly', () => {
    expect(formatTime(3661)).toBe('01:01:01');
  });
  
  it('should handle edge cases', () => {
    expect(formatTime(0)).toBe('00:00:00');
    expect(formatTime(-1)).toBe('00:00:00');
  });
});
```

#### Integration Tests (20%)
```javascript
// Component integration tests
describe('StudyTimer integration', () => {
  it('should update display when time changes', () => {
    const { getByTestId } = render(<StudyTimer initialTime={60} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(getByTestId('timer-display')).toHaveTextContent('00:00:59');
  });
});
```

#### End-to-End Tests (10%)
```javascript
// Full user journey tests
describe('Study session flow', () => {
  it('should complete a full study session', async () => {
    await device.launchApp();
    
    await element(by.id('start-session-btn')).tap();
    await element(by.id('timer-input')).typeText('5');
    await element(by.id('confirm-btn')).tap();
    
    await waitFor(element(by.text('Session Complete!')))
      .toBeVisible()
      .withTimeout(6000);
  });
});
```

### Test Quality Standards

#### Coverage Requirements
```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "branches": 75,
      "functions": 80, 
      "lines": 80,
      "statements": 80
    },
    "src/utils/": {
      "branches": 85,
      "functions": 90,
      "lines": 85,
      "statements": 85
    }
  }
}
```

#### Test Naming Conventions
```javascript
// Good test naming
describe('Authentication Service', () => {
  describe('when user provides valid credentials', () => {
    it('should return authentication token', () => {
      // Test implementation
    });
    
    it('should store user session', () => {
      // Test implementation  
    });
  });
  
  describe('when user provides invalid credentials', () => {
    it('should return error message', () => {
      // Test implementation
    });
    
    it('should not create user session', () => {
      // Test implementation
    });
  });
});
```

#### Test Data Management
```javascript
// Use factories for test data
const userFactory = {
  build: (overrides = {}) => ({
    id: faker.datatype.uuid(),
    email: faker.internet.email(),
    name: faker.name.fullName(),
    createdAt: faker.date.recent(),
    ...overrides
  })
};

// Clean test data
afterEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  
  // Clean up test data
  cleanup();
  
  // Reset timers
  jest.clearAllTimers();
});
```

## 🚀 Deployment Best Practices

### Environment Strategy

#### Environment Parity
```yaml
# Maintain consistent environments
environments:
  development:
    database: "postgres://dev-db"
    cache: "redis://dev-cache"
    monitoring: "dev-monitoring"
    
  staging:
    database: "postgres://staging-db"  # Same version as prod
    cache: "redis://staging-cache"     # Same version as prod  
    monitoring: "staging-monitoring"
    
  production:
    database: "postgres://prod-db"
    cache: "redis://prod-cache"
    monitoring: "prod-monitoring"
```

#### Feature Flags
```javascript
// Use feature flags for controlled rollouts
const FeatureFlags = {
  NEW_TIMER_UI: {
    development: true,
    staging: true,
    production: 0.1  // 10% rollout
  },
  PREMIUM_FEATURES: {
    development: true,
    staging: true,
    production: true
  }
};

// In component
const showNewTimer = useFeatureFlag('NEW_TIMER_UI');
```

### Deployment Strategies

#### Blue-Green Deployment
```yaml
- name: Blue-Green Deployment
  run: |
    # Deploy to staging (green)
    ./scripts/deploy.sh staging
    
    # Health check
    ./scripts/health-check.sh staging
    
    # Switch traffic
    ./scripts/switch-traffic.sh staging production
    
    # Final verification
    ./scripts/health-check.sh production
```

#### Canary Deployment
```yaml
- name: Canary Deployment
  run: |
    # Deploy to 5% of users
    ./scripts/canary-deploy.sh --percentage 5
    
    # Monitor metrics for 10 minutes
    sleep 600
    ./scripts/check-metrics.sh
    
    # If healthy, increase to 25%
    ./scripts/canary-deploy.sh --percentage 25
```

#### Rollback Strategy
```yaml
- name: Automatic rollback
  if: failure()
  run: |
    # Get previous successful deployment
    PREV_VERSION=$(gh release list --limit 2 | tail -1 | cut -f3)
    
    # Rollback
    ./scripts/rollback.sh $PREV_VERSION
    
    # Verify rollback
    ./scripts/health-check.sh production
    
    # Notify team
    ./scripts/notify-rollback.sh $PREV_VERSION
```

## 📈 Monitoring and Observability

### Application Performance Monitoring

#### Key Metrics
```yaml
# Performance monitoring
- name: Collect performance metrics
  run: |
    # Bundle size
    BUNDLE_SIZE=$(stat -f%z dist/bundle.js)
    echo "bundle_size_bytes:$BUNDLE_SIZE" >> metrics.txt
    
    # Load time
    LOAD_TIME=$(curl -w "%{time_total}" -o /dev/null -s https://app.studybuddy.com)
    echo "page_load_time_seconds:$LOAD_TIME" >> metrics.txt
    
    # Memory usage
    MEMORY_USAGE=$(node -e "console.log(process.memoryUsage().heapUsed)")
    echo "memory_usage_bytes:$MEMORY_USAGE" >> metrics.txt
```

#### Error Tracking
```javascript
// Sentry integration for error tracking
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Custom error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          errorInfo
        }
      }
    });
  }
}
```

### CI/CD Metrics

#### Build Metrics
```yaml
- name: Track build metrics
  run: |
    # Build duration
    BUILD_START=$(date +%s)
    npm run build
    BUILD_END=$(date +%s)
    BUILD_DURATION=$((BUILD_END - BUILD_START))
    
    # Test execution time
    TEST_START=$(date +%s)
    npm run test
    TEST_END=$(date +%s)
    TEST_DURATION=$((TEST_END - TEST_START))
    
    # Send metrics to monitoring system
    curl -X POST "https://api.monitoring.com/metrics" \
      -H "Authorization: Bearer ${{ secrets.MONITORING_TOKEN }}" \
      -d "{
        \"build_duration\": $BUILD_DURATION,
        \"test_duration\": $TEST_DURATION,
        \"timestamp\": $(date +%s)
      }"
```

#### Quality Metrics
```yaml
- name: Quality gates
  run: |
    # Calculate quality score
    LINT_ERRORS=$(npm run lint 2>&1 | grep -c "error" || echo 0)
    TEST_COVERAGE=$(npm run test:coverage | grep "Lines" | awk '{print $4}' | tr -d '%')
    SECURITY_ISSUES=$(npm audit --json | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical')
    
    # Quality score calculation
    QUALITY_SCORE=$((100 - LINT_ERRORS - (100 - TEST_COVERAGE) - SECURITY_ISSUES * 10))
    
    # Fail if quality score too low
    if [ $QUALITY_SCORE -lt 80 ]; then
      echo "::error::Quality score $QUALITY_SCORE below threshold"
      exit 1
    fi
```

## 🔄 Continuous Improvement

### Pipeline Optimization

#### Performance Tuning
```yaml
# Use caching effectively
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cache/yarn
      node_modules
      ios/Pods
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json', '**/Podfile.lock') }}
    
# Optimize Docker builds
- name: Build with BuildKit
  run: |
    DOCKER_BUILDKIT=1 docker build \
      --cache-from ${{ env.REGISTRY }}/app:cache \
      --cache-to ${{ env.REGISTRY }}/app:cache \
      -t ${{ env.REGISTRY }}/app:${{ github.sha }} .
```

#### Resource Management
```yaml
# Clean up resources
- name: Cleanup
  if: always()
  run: |
    # Remove temporary files
    rm -rf temp/ logs/ *.tmp
    
    # Clean Docker resources
    docker system prune -f
    
    # Clear caches
    npm cache clean --force
```

### Feedback Loops

#### Automated Reporting
```yaml
- name: Generate pipeline report
  if: always()
  run: |
    # Generate summary
    cat > pipeline-report.md << EOF
    # Pipeline Report - $(date)
    
    ## Metrics
    - Build Duration: ${BUILD_DURATION}s
    - Test Coverage: ${TEST_COVERAGE}%
    - Security Issues: ${SECURITY_ISSUES}
    - Quality Score: ${QUALITY_SCORE}
    
    ## Status
    - Build: ${{ job.status }}
    - Tests: ${{ steps.test.outcome }}
    - Security: ${{ steps.security.outcome }}
    EOF
    
    # Comment on PR
    gh pr comment ${{ github.event.number }} --body-file pipeline-report.md
```

#### Team Notifications
```yaml
- name: Notify team
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -H 'Content-type: application/json' \
      -d '{
        "text": "🚨 Pipeline failed for ${{ github.ref_name }}",
        "blocks": [{
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Build failed: <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Details>"
          }
        }]
      }'
```

### Learning and Documentation

#### Post-Incident Reviews
```yaml
# Incident response template
- name: Create incident issue
  if: failure() && github.ref == 'refs/heads/main'
  run: |
    gh issue create \
      --title "🚨 Production Pipeline Failure - $(date)" \
      --body "$(cat << EOF
    ## Incident Details
    - **Time**: $(date)
    - **Pipeline**: ${{ github.workflow }}
    - **Commit**: ${{ github.sha }}
    - **Branch**: ${{ github.ref_name }}
    
    ## Failure Information
    - **Job**: ${{ github.job }}
    - **Step**: ${{ github.action }}
    - **Logs**: [View Logs](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})
    
    ## Action Items
    - [ ] Root cause analysis
    - [ ] Fix implementation
    - [ ] Prevention measures
    - [ ] Documentation update
    - [ ] Team notification
    EOF
    )" \
      --label "incident,ci-cd,high-priority"
```

#### Knowledge Sharing
```yaml
- name: Update runbook
  if: failure()
  run: |
    # Extract error patterns
    ERROR_MSG=$(tail -20 workflow.log | grep "Error:")
    
    # Add to troubleshooting guide
    echo "## New Issue: $(date)" >> docs/troubleshooting.md
    echo "**Error**: $ERROR_MSG" >> docs/troubleshooting.md
    echo "**Solution**: [To be documented]" >> docs/troubleshooting.md
    echo "" >> docs/troubleshooting.md
    
    # Create PR for documentation update
    git add docs/troubleshooting.md
    git commit -m "docs: add troubleshooting entry for $(date)"
    gh pr create --title "📚 Update troubleshooting guide" --body "Automated documentation update"
```

---

## 📚 Additional Resources

### Team Training
- **CI/CD Workshop**: Monthly team sessions on pipeline improvements
- **Security Training**: Quarterly security-focused training
- **Tool Updates**: Regular training on new tools and features

### External Resources
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/learn-github-actions/security-hardening-for-github-actions)
- [Expo EAS Best Practices](https://docs.expo.dev/eas/build/#best-practices)
- [React Native Testing Best Practices](https://reactnative.dev/docs/testing-overview)
- [Mobile App Security Guidelines](https://owasp.org/www-project-mobile-security-testing-guide/)

### Community
- **Internal Slack**: #ci-cd-discussion
- **External Communities**: React Native Community, Expo Discord
- **Conference Talks**: Share learnings at tech conferences

---

**Remember**: Best practices evolve. Review and update these guidelines quarterly based on:
- Team feedback and pain points
- Industry developments
- New tool capabilities
- Security landscape changes
- Performance improvements discovered

**Last Updated**: $(date +"%Y-%m-%d")
**Next Review**: $(date -d "+3 months" +"%Y-%m-%d")