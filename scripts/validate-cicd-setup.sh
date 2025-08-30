#!/bin/bash

# StudyBuddy CI/CD Setup Validation Script
# This script validates that all CI/CD components are properly configured

set -e

echo "🔍 Validating StudyBuddy CI/CD Setup..."
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation counters
PASSED=0
FAILED=0
WARNINGS=0

validate_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "✅ ${GREEN}$description${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "❌ ${RED}$description (missing: $file)${NC}"
        FAILED=$((FAILED + 1))
    fi
}

validate_directory() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -e "✅ ${GREEN}$description${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "❌ ${RED}$description (missing: $dir)${NC}"
        FAILED=$((FAILED + 1))
    fi
}

warn_if_missing() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "✅ ${GREEN}$description${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "⚠️  ${YELLOW}$description (missing: $file)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
}

echo ""
echo "🏗️  Validating Directory Structure..."
echo "-----------------------------------"

validate_directory ".github" "GitHub configuration directory"
validate_directory ".github/workflows" "GitHub Actions workflows directory"
validate_directory ".github/ISSUE_TEMPLATE" "Issue templates directory"
validate_directory "config" "Configuration directory"
validate_directory "config/ci" "CI configuration directory"
validate_directory "docs" "Documentation directory"

echo ""
echo "📋 Validating Workflow Files..."
echo "------------------------------"

validate_file ".github/workflows/enhanced-ci-cd.yml" "Enhanced CI/CD Pipeline"
validate_file ".github/workflows/pr-validation.yml" "PR Validation Pipeline"
validate_file ".github/workflows/release-automation.yml" "Release Automation Pipeline"
validate_file ".github/workflows/performance-monitoring.yml" "Performance Monitoring Pipeline"
validate_file ".github/workflows/security-audit.yml" "Security Audit Pipeline"
validate_file ".github/workflows/feature-ci.yml" "Feature Branch CI (existing)"
validate_file ".github/workflows/ci.yml" "Basic CI Pipeline (existing)"
validate_file ".github/workflows/ci-cd.yml" "CI/CD Pipeline (existing)"
validate_file ".github/workflows/claude.yml" "Claude Code Integration (existing)"

echo ""
echo "⚙️  Validating Configuration Files..."
echo "------------------------------------"

validate_file "config/ci/audit-ci.config.json" "Security audit configuration"
validate_file "config/ci/eas.json" "Expo Application Services config"
validate_file "config/ci/sonarqube.properties" "SonarQube configuration"
validate_file "config/ci/lighthouse.config.js" "Lighthouse performance config"
validate_file ".github/codeql/codeql-config.yml" "CodeQL security analysis config"

echo ""
echo "📄 Validating GitHub Configuration..."
echo "------------------------------------"

validate_file ".github/CODEOWNERS" "Code owners configuration"
validate_file ".github/ISSUE_TEMPLATE/ci-cd-issue.yml" "CI/CD issue template"
validate_file ".github/branch-protection-setup.sh" "Branch protection setup script"

echo ""
echo "📚 Validating Documentation..."
echo "-----------------------------"

validate_file "docs/ci-cd-architecture.md" "CI/CD architecture documentation"
validate_file "docs/cicd-runbook.md" "CI/CD operations runbook"
validate_file "README.md" "Project README (existing)"

echo ""
echo "🔧 Validating Scripts and Tools..."
echo "---------------------------------"

validate_file "scripts/validate-cicd-setup.sh" "CI/CD validation script"
validate_file "package.json" "Package configuration (existing)"

# Check if script is executable
if [ -x ".github/branch-protection-setup.sh" ]; then
    echo -e "✅ ${GREEN}Branch protection script is executable${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "⚠️  ${YELLOW}Branch protection script may not be executable${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "🔍 Validating Package.json Scripts..."
echo "------------------------------------"

# Check for required npm scripts
check_npm_script() {
    local script=$1
    local description=$2
    
    if npm run | grep -q "^  $script$"; then
        echo -e "✅ ${GREEN}$description${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "⚠️  ${YELLOW}$description (script: $script)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
}

check_npm_script "test" "Test script"
check_npm_script "lint" "Linting script"
check_npm_script "test:coverage" "Test coverage script"
check_npm_script "start" "Start script"

echo ""
echo "🌐 Validating Expo Configuration..."
echo "----------------------------------"

if [ -f "app.json" ]; then
    echo -e "✅ ${GREEN}Expo app configuration exists${NC}"
    PASSED=$((PASSED + 1))
    
    # Check if app.json has required fields
    if command -v jq >/dev/null 2>&1; then
        if jq -e '.expo.name' app.json >/dev/null 2>&1; then
            echo -e "✅ ${GREEN}App name configured${NC}"
            PASSED=$((PASSED + 1))
        else
            echo -e "⚠️  ${YELLOW}App name not configured in app.json${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        if jq -e '.expo.version' app.json >/dev/null 2>&1; then
            echo -e "✅ ${GREEN}App version configured${NC}"
            PASSED=$((PASSED + 1))
        else
            echo -e "⚠️  ${YELLOW}App version not configured in app.json${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "⚠️  ${YELLOW}jq not available for app.json validation${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "❌ ${RED}Expo app configuration missing (app.json)${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "🔐 Validating Security Configuration..."
echo "--------------------------------------"

# Check for common security files
warn_if_missing ".gitignore" "Git ignore file"
warn_if_missing ".env.example" "Environment variables example"

# Check if secrets are properly configured (can't check actual secrets)
echo -e "ℹ️  Remember to configure these GitHub repository secrets:"
echo "   - EXPO_TOKEN"
echo "   - SNYK_TOKEN (optional)"
echo "   - CODECOV_TOKEN (optional)"
echo "   - GOOGLE_PLAY_SERVICE_ACCOUNT_JSON (for production)"
echo "   - APP_STORE_CONNECT_API_KEY (for production)"

echo ""
echo "📊 Validation Summary"
echo "===================="
echo -e "✅ ${GREEN}Passed: $PASSED${NC}"
echo -e "❌ ${RED}Failed: $FAILED${NC}"
echo -e "⚠️  ${YELLOW}Warnings: $WARNINGS${NC}"

TOTAL=$((PASSED + FAILED + WARNINGS))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo -e "📈 Success Rate: ${SUCCESS_RATE}%"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "🎉 ${GREEN}CI/CD setup validation completed successfully!${NC}"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Review any warnings above"
    echo "2. Configure required GitHub repository secrets"
    echo "3. Run branch protection setup: .github/branch-protection-setup.sh"
    echo "4. Test the pipeline with a small PR"
    echo "5. Monitor the first few workflow runs"
    exit 0
else
    echo -e "❌ ${RED}CI/CD setup validation failed with $FAILED errors${NC}"
    echo ""
    echo "🔧 Required Actions:"
    echo "1. Fix all failed validations above"
    echo "2. Re-run this validation script"
    echo "3. Check the CI/CD architecture documentation in docs/"
    exit 1
fi