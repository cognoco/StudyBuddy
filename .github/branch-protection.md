# Branch Protection Setup Guide

## Recommended Branch Protection Rules

### For `main` branch:
- ✅ **Require status checks to pass before merging**
  - `test` job must pass
  - `security` job must pass
- ✅ **Require branches to be up to date before merging**
- ✅ **Require pull request reviews before merging**
- ✅ **Restrict pushes that create files that are larger than 100 MB**

### For `develop` branch:
- ✅ **Require status checks to pass before merging**
  - `test` job must pass
- ✅ **Require branches to be up to date before merging**
- ✅ **Require pull request reviews before merging**

## How to Set This Up:

1. Go to your GitHub repository
2. Click **Settings** → **Branches**
3. Click **Add rule** for each branch
4. Configure as shown above

## Workflow:

1. **Developer creates feature branch** → `feature/new-feature`
2. **Makes changes** → commits and pushes
3. **Creates PR** → CI/CD automatically runs
4. **CI/CD passes** → PR can be merged
5. **Merge to develop** → CI/CD runs again
6. **Merge to main** → CI/CD + Build + Deploy runs

## Benefits:

- 🛡️ **No broken code reaches main**
- 🔄 **Automated testing on every change**
- 📊 **Clear status indicators on PRs**
- 🚀 **Confidence in deployments**
