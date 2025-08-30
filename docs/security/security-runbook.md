# Security Scanning Runbook

## Overview

This runbook provides comprehensive guidance for security scanning, vulnerability management, and incident response for the StudyBuddy application.

## Table of Contents

1. [Security Scanning Tools](#security-scanning-tools)
2. [Daily Security Operations](#daily-security-operations)
3. [Vulnerability Management](#vulnerability-management)
4. [Incident Response](#incident-response)
5. [Compliance and Reporting](#compliance-and-reporting)

## Security Scanning Tools

### Automated CI/CD Pipeline

Our security scanning is integrated into GitHub Actions and runs automatically on:
- All pull requests
- Pushes to main branch
- Daily scheduled scans at 2 AM UTC
- Manual triggers

**Workflow File:** `.github/workflows/security-scanning.yml`

### Tool Inventory

| Tool | Purpose | Frequency | Configuration |
|------|---------|-----------|---------------|
| **NPM Audit** | Dependency vulnerabilities | Every build | Built-in |
| **Snyk** | Advanced vulnerability detection | Every build | `.snyk` policy file |
| **CodeQL** | Static code analysis | Every PR | `.github/codeql/` |
| **GitLeaks** | Secret detection | Every commit | `.gitleaks.toml` |
| **TruffleHog** | Secret scanning | Every PR | GitHub Action |
| **detect-secrets** | Baseline secret detection | Daily | `.secrets.baseline` |
| **License Checker** | License compliance | Every build | `.license-checker-rc.json` |
| **OWASP Dependency Check** | Known vulnerability database | Daily | Auto-configured |
| **Hadolint** | Docker security linting | On container changes | `.hadolint.yaml` |

## Daily Security Operations

### Morning Security Check (Automated)

1. **Review overnight scan results**
   ```bash
   # Check latest security reports
   ls -la security-reports/
   
   # View security dashboard
   open https://github.com/your-org/studybuddy/security
   ```

2. **Priority vulnerability triage**
   - Critical: Address within 4 hours
   - High: Address within 24 hours
   - Medium: Address within 1 week
   - Low: Address within 1 month

### Weekly Security Review

Every Monday morning:

1. **Generate comprehensive security report**
   ```bash
   python3 scripts/security/generate-security-report.py \
     --input-dir security-artifacts \
     --output-dir weekly-security-report \
     --format html,json,markdown
   ```

2. **Review security metrics trends**
   - Vulnerability count by severity
   - Time to remediation (MTTR)
   - Security score trends
   - License compliance status

3. **Update security policies if needed**
   - Review `.github/security/security-policy.yml`
   - Adjust thresholds based on risk tolerance
   - Update exemptions for known acceptable risks

## Vulnerability Management

### Vulnerability Severity Classification

| Severity | CVSS Score | Response Time | Action Required |
|----------|------------|---------------|-----------------|
| **Critical** | 9.0 - 10.0 | 4 hours | Immediate patch/hotfix |
| **High** | 7.0 - 8.9 | 24 hours | Priority fix in next sprint |
| **Medium** | 4.0 - 6.9 | 1 week | Include in regular updates |
| **Low** | 0.1 - 3.9 | 1 month | Track and batch fix |

### Remediation Workflow

1. **Vulnerability Detection**
   ```bash
   # Manual scan if needed
   ./scripts/security/run-security-scan.sh
   ```

2. **Assessment and Triage**
   ```bash
   # Evaluate against policies
   python3 scripts/security/evaluate-security-policies.py \
     --reports-dir security-reports \
     --policy-file .github/security/security-policy.yml \
     --output security-gate-results.json
   ```

3. **Fix Development**
   ```bash
   # Check for available fixes
   npm audit fix
   snyk fix
   
   # Update dependencies
   npm update
   
   # Verify fix doesn't break functionality
   npm test
   npm run test:security
   ```

4. **Verification**
   ```bash
   # Re-scan after fix
   npm run security:full
   
   # Verify in CI/CD pipeline
   git push origin fix/security-vulnerability-CVE-XXXX
   ```

### Dependency Management

1. **Regular Updates**
   ```bash
   # Check outdated packages
   npm outdated
   
   # Update with security patches
   npm update
   
   # Check for breaking changes
   npm audit
   ```

2. **Version Pinning Strategy**
   - Pin exact versions for security-critical dependencies
   - Use tilde (`~`) for patch updates
   - Use caret (`^`) for minor updates only after testing
   - Regular review of pinned versions

## Incident Response

### Security Incident Classification

| Level | Description | Response Time | Team Involved |
|-------|-------------|---------------|---------------|
| **P0** | Active exploit, data breach | Immediate | Full security team + leadership |
| **P1** | Critical vulnerability in production | 1 hour | Security team + on-call engineer |
| **P2** | High-risk vulnerability discovered | 4 hours | Security team |
| **P3** | Medium-risk security issue | 24 hours | Assigned security engineer |

### Incident Response Playbook

#### P0/P1 Critical Security Incident

1. **Immediate Response (0-15 minutes)**
   ```bash
   # Document incident
   gh issue create --template security-issue.md --title "[P0] Critical Security Incident"
   
   # Notify team
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"🚨 P0 Security Incident - All hands"}' \
     $SLACK_SECURITY_WEBHOOK
   ```

2. **Assessment (15-60 minutes)**
   - Determine scope of vulnerability
   - Assess potential data exposure
   - Document timeline and impact

3. **Containment (1-4 hours)**
   - Deploy emergency patches if available
   - Implement temporary mitigations
   - Consider service shutdown if necessary

4. **Recovery (4-24 hours)**
   - Apply permanent fixes
   - Restore normal operations
   - Verify fix effectiveness

5. **Post-Incident (1-7 days)**
   - Conduct post-mortem
   - Update security policies
   - Improve detection capabilities

### Secret Exposure Response

If secrets are detected in code:

1. **Immediate Actions**
   ```bash
   # Revoke exposed credentials immediately
   # This varies by service - examples:
   
   # AWS - revoke keys via CLI or console
   aws iam delete-access-key --access-key-id AKIA...
   
   # GitHub - revoke token via API
   curl -X DELETE -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/applications/$CLIENT_ID/token
   ```

2. **Code Remediation**
   ```bash
   # Remove secret from code
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch path/to/file/with/secret' \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push to rewrite history
   git push origin --force --all
   ```

3. **Prevention**
   ```bash
   # Update baseline to prevent similar issues
   detect-secrets scan --update .secrets.baseline
   
   # Add to pre-commit hooks
   echo "detect-secrets-hook --baseline .secrets.baseline" >> .pre-commit-config.yaml
   ```

## Compliance and Reporting

### Security Reporting

1. **Executive Dashboard**
   - Security score trends
   - Vulnerability metrics
   - Compliance status
   - Incident summary

2. **Technical Reports**
   ```bash
   # Generate monthly report
   python3 scripts/security/generate-security-report.py \
     --input-dir monthly-scans \
     --output-dir monthly-report \
     --format html,pdf
   ```

3. **Compliance Reports**
   - SOC 2 security controls
   - GDPR privacy impact assessments
   - Industry-specific requirements

### Metrics and KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Security Score** | > 90/100 | Weekly |
| **Critical Vulnerabilities** | 0 | Real-time |
| **High Vulnerabilities** | < 5 | Daily |
| **MTTR (Critical)** | < 4 hours | Per incident |
| **MTTR (High)** | < 24 hours | Per incident |
| **License Compliance** | 100% | Weekly |
| **Secret Detection** | 0 exposed | Real-time |

### Audit Trail

All security activities are logged and auditable:

1. **Scan Results** - Stored in `security-reports/` with timestamps
2. **Policy Changes** - Git history of `.github/security/`
3. **Incident Response** - GitHub issues with security label
4. **Fix Deployments** - Git commits with security tags
5. **Access Logs** - GitHub audit log for repository access

## Troubleshooting

### Common Issues

1. **False Positives**
   ```bash
   # Add to exemptions in security policy
   vim .github/security/security-policy.yml
   
   # Update baseline for secrets
   detect-secrets audit .secrets.baseline
   ```

2. **CI/CD Pipeline Failures**
   ```bash
   # Check workflow logs
   gh run list --workflow=security-scanning.yml
   gh run view $RUN_ID --log
   
   # Manual run for debugging
   ./scripts/security/run-security-scan.sh
   ```

3. **Performance Issues**
   ```bash
   # Optimize scan scope
   # Add exclusions to .github/codeql/codeql-config.yml
   
   # Parallel execution
   # Update GitHub Actions matrix strategy
   ```

### Emergency Contacts

- **Security Team Lead**: security-lead@studybuddy.com
- **DevOps On-Call**: +1-XXX-XXX-XXXX
- **Legal/Compliance**: legal@studybuddy.com
- **Executive Sponsor**: cto@studybuddy.com

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [GitHub Security Advisories](https://github.com/advisories)
- [NPM Security Best Practices](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)
- [Snyk Vulnerability Database](https://security.snyk.io/)

---

*Last Updated: 2025-08-27*
*Document Owner: Security Team*
*Review Frequency: Monthly*