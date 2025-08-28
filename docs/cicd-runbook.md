# StudyBuddy CI/CD Runbook

## 🚨 Emergency Procedures

### Production Deployment Failure

**Immediate Response:**
1. Stop the failed deployment pipeline
2. Check production health endpoints
3. Rollback to previous version if necessary
4. Alert the team via designated channels

**Commands:**
```bash
# Stop workflow
gh workflow run cancel -R cognoco/StudyBuddy <run-id>

# Check deployment status
curl -f https://studybuddy.app/health

# Manual rollback (if needed)
gh release view --repo cognoco/StudyBuddy
```

### Security Vulnerability Detected

**Immediate Response:**
1. Assess severity and impact
2. Block deployment pipeline if critical
3. Create hotfix branch
4. Apply security patches
5. Emergency deployment

**Commands:**
```bash
# Create emergency hotfix
git checkout main
git pull origin main
git checkout -b hotfix/security-$(date +%Y%m%d)

# After fixes
git commit -m "security: fix critical vulnerability CVE-XXXX"
git push origin hotfix/security-$(date +%Y%m%d)

# Create emergency PR
gh pr create --title "🚨 SECURITY: Critical vulnerability fix" --body "Emergency security fix" --base main
```

### Build System Failure

**Common Issues & Solutions:**

1. **Node.js/NPM Issues:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Expo Build Failures:**
   ```bash
   # Clear Expo cache
   npx expo install --fix
   npx expo doctor
   
   # Reset Expo configuration
   npx expo prebuild --clear
   ```

3. **GitHub Actions Runner Issues:**
   ```yaml
   # Add to workflow for debugging
   - name: Debug Environment
     run: |
       echo "Node version: $(node --version)"
       echo "NPM version: $(npm --version)"
       echo "Available disk space:"
       df -h
       echo "Memory usage:"
       free -h
   ```

## 🔧 Routine Maintenance

### Daily Checks (Automated)

- Security audit scans
- Dependency vulnerability checks
- Performance monitoring
- Build system health

### Weekly Maintenance

1. **Dependency Updates:**
   ```bash
   # Check outdated packages
   npm outdated
   
   # Update non-major versions
   npm update
   
   # Check for security updates
   npm audit fix
   ```

2. **Performance Review:**
   - Check bundle size trends
   - Review Lighthouse scores
   - Monitor build times

3. **Security Review:**
   - Review security audit reports
   - Check for new vulnerability disclosures
   - Update security dependencies

### Monthly Maintenance

1. **Infrastructure Review:**
   - Review GitHub Actions usage
   - Check artifact storage usage
   - Review secret expiration dates

2. **Documentation Updates:**
   - Update runbook procedures
   - Review and update architecture docs
   - Update team contacts and escalation paths

## 📊 Monitoring & Alerts

### Key Metrics to Monitor

1. **Build Success Rate:** >95%
2. **Deployment Frequency:** Daily to main
3. **Lead Time for Changes:** <2 hours
4. **Mean Time to Recovery:** <30 minutes
5. **Change Failure Rate:** <5%

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Build Failure Rate | >10% | >25% |
| Security Vulnerabilities | High severity | Critical severity |
| Bundle Size Increase | >10% | >25% |
| Performance Regression | >15% | >30% |

### Notification Channels

- **Critical Alerts:** Slack #alerts, Email
- **Warnings:** Slack #dev-team
- **Daily Reports:** Email digest

## 🔐 Security Procedures

### Secret Management

1. **Secret Rotation Schedule:**
   - API Keys: Every 90 days
   - Certificates: Based on expiration
   - Database credentials: Every 6 months

2. **Adding New Secrets:**
   ```bash
   # Add to GitHub repository secrets
   gh secret set SECRET_NAME -b "secret_value" -R cognoco/StudyBuddy
   
   # Add to environment secrets
   gh secret set SECRET_NAME -b "secret_value" -R cognoco/StudyBuddy -e production
   ```

3. **Secret Audit:**
   ```bash
   # List all secrets
   gh secret list -R cognoco/StudyBuddy
   
   # Check secret usage in workflows
   grep -r "secrets\." .github/workflows/
   ```

### Access Control

1. **Repository Access:**
   - Admin: Core maintainers
   - Write: Active contributors
   - Read: All team members

2. **Branch Protection:**
   - Run setup script: `.github/branch-protection-setup.sh`
   - Verify settings in repository settings

3. **Review Requirements:**
   - Main branch: 2 approvals required
   - Develop branch: 1 approval required
   - All changes: Code owner review required

## 🚀 Deployment Procedures

### Environment Promotion Flow

```
Feature Branch → Develop → Staging → Main → Production
     ↓             ↓         ↓        ↓        ↓
Quick Tests → PR Tests → Full CI → Release → Store Deploy
```

### Manual Deployment

1. **Emergency Hotfix Deployment:**
   ```bash
   # Create and push hotfix
   git checkout -b hotfix/emergency-$(date +%Y%m%d)
   # ... make changes ...
   git commit -m "hotfix: emergency fix"
   git push origin hotfix/emergency-$(date +%Y%m%d)
   
   # Create PR and merge
   gh pr create --base main --title "🚨 Emergency Hotfix"
   
   # Tag and release
   git tag v1.2.3-hotfix
   git push origin v1.2.3-hotfix
   ```

2. **Manual Release Trigger:**
   ```bash
   # Trigger release workflow
   gh workflow run release-automation.yml -f release_type=patch
   ```

### Deployment Verification

1. **Health Checks:**
   ```bash
   # Production health check
   curl -f https://studybuddy.app/health
   
   # Staging health check  
   curl -f https://staging.studybuddy.app/health
   ```

2. **App Store Verification:**
   - Check Google Play Console for new build
   - Verify App Store Connect submission
   - Monitor for user reviews/crashes

## 🐛 Troubleshooting Guide

### Common Issues

1. **"npm ci" fails with permission errors:**
   ```bash
   # Solution: Clear npm cache
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Expo build timeout:**
   ```bash
   # Solution: Retry with increased timeout
   npx expo build:android --clear-cache --wait-timeout=20
   ```

3. **GitHub Actions runner out of disk space:**
   ```yaml
   # Add to workflow
   - name: Free disk space
     run: |
       sudo rm -rf /usr/share/dotnet
       sudo rm -rf /opt/ghc
       sudo rm -rf "/usr/local/share/boost"
   ```

4. **Security scan false positives:**
   ```bash
   # Add to allowlist in audit-ci.config.json
   {
     "allowlist": [
       "GHSA-xxxx-xxxx-xxxx"
     ]
   }
   ```

### Debugging Workflows

1. **Enable debug logging:**
   ```yaml
   env:
     ACTIONS_STEP_DEBUG: true
     ACTIONS_RUNNER_DEBUG: true
   ```

2. **Add debugging steps:**
   ```yaml
   - name: Debug Info
     run: |
       echo "Event: ${{ github.event_name }}"
       echo "Ref: ${{ github.ref }}"
       echo "SHA: ${{ github.sha }}"
       printenv | sort
   ```

### Log Analysis

1. **Common log locations:**
   - GitHub Actions: Repository → Actions → Workflow run
   - Build artifacts: Download from workflow run
   - Performance reports: Artifacts section

2. **Log search patterns:**
   - Errors: `grep -i "error\|failed\|exception"`
   - Performance: `grep -i "bundle\|size\|time"`
   - Security: `grep -i "vulnerability\|security\|cve"`

## 📞 Escalation Procedures

### Contact Matrix

| Issue Type | Primary Contact | Secondary Contact | Escalation |
|------------|----------------|-------------------|------------|
| Build Failures | DevOps Team | Tech Lead | Engineering Manager |
| Security Issues | Security Team | CISO | CTO |
| Production Outage | On-call Engineer | Tech Lead | VP Engineering |
| App Store Issues | Mobile Team Lead | Product Manager | Director |

### Escalation Thresholds

- **15 minutes:** Build system completely down
- **30 minutes:** Production deployment failing
- **1 hour:** Security vulnerability unaddressed
- **2 hours:** Multiple systems affected

### Emergency Contacts

```
🚨 EMERGENCY HOTLINE: +1-555-EMERGENCY
📱 On-call Slack: #emergency-response
📧 Emergency Email: emergency@cognoco.com
```

## 📋 Checklists

### Pre-Release Checklist

- [ ] All tests passing
- [ ] Security scans completed
- [ ] Performance regression checked
- [ ] Release notes prepared
- [ ] Stakeholders notified
- [ ] Rollback plan prepared

### Post-Release Checklist

- [ ] Deployment health checks passed
- [ ] User-facing features verified
- [ ] Error monitoring shows no spikes
- [ ] Performance metrics within normal range
- [ ] App store listings updated
- [ ] Team notified of successful deployment

### Incident Response Checklist

- [ ] Incident detected and acknowledged
- [ ] Severity assessment completed
- [ ] Team notified via appropriate channels
- [ ] Investigation started
- [ ] Immediate mitigation applied
- [ ] Root cause identified
- [ ] Permanent fix implemented
- [ ] Post-mortem scheduled
- [ ] Documentation updated

---

**Document Version:** 1.0  
**Last Updated:** $(date +"%Y-%m-%d")  
**Next Review:** $(date -d "+3 months" +"%Y-%m-%d")

*This runbook is a living document. Please update it as procedures change and new issues are discovered.*