#!/bin/bash

# StudyBuddy Branch Protection Setup Script
# This script configures branch protection rules for the repository

set -e

REPO_OWNER="cognoco"
REPO_NAME="StudyBuddy"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable is required"
    echo "Please set your GitHub Personal Access Token:"
    echo "export GITHUB_TOKEN=ghp_your_token_here"
    exit 1
fi

echo "🔧 Setting up branch protection rules for $REPO_OWNER/$REPO_NAME..."

# Function to create branch protection rule
create_branch_protection() {
    local branch=$1
    local config=$2
    
    echo "📝 Configuring protection for branch: $branch"
    
    curl -s -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/$branch/protection" \
        -d "$config" | jq -r '.message // "✅ Success"'
}

# Main branch protection (strictest)
main_config='{
  "required_status_checks": {
    "strict": true,
    "checks": [
      {"context": "Quick Validation"},
      {"context": "Comprehensive Testing / unit"},
      {"context": "Comprehensive Testing / integration"},
      {"context": "Build Verification / android"},
      {"context": "Build Verification / web"},
      {"context": "Security Scan"},
      {"context": "Quality Assurance / lint"},
      {"context": "Quality Assurance / test"},
      {"context": "Quality Assurance / audit"},
      {"context": "Security Analysis"}
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}'

# Develop branch protection (moderate)
develop_config='{
  "required_status_checks": {
    "strict": true,
    "checks": [
      {"context": "Quick Validation"},
      {"context": "Build Verification / web"},
      {"context": "Quality Assurance / lint"},
      {"context": "Quality Assurance / test"},
      {"context": "Security Analysis"}
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}'

# QA infrastructure branch protection (minimal)
qa_config='{
  "required_status_checks": {
    "strict": false,
    "checks": [
      {"context": "Quick Validation"},
      {"context": "Quality Assurance / lint"},
      {"context": "Quality Assurance / test"}
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}'

# Apply branch protection rules
echo "🛡️  Applying branch protection rules..."

create_branch_protection "main" "$main_config"
create_branch_protection "develop" "$develop_config"
create_branch_protection "qa_infrastructure_*" "$qa_config"

echo ""
echo "✅ Branch protection setup completed!"
echo ""
echo "📋 Summary:"
echo "• main branch: Requires 2 reviews, all status checks, code owner approval"
echo "• develop branch: Requires 1 review, core status checks, code owner approval"
echo "• qa_infrastructure_* branches: Requires 1 review, basic status checks"
echo ""
echo "🔍 View protection rules at:"
echo "https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches"