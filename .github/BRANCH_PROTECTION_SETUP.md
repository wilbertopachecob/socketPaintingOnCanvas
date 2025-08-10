# Branch Protection Setup

This document explains how to configure GitHub branch protection rules to prevent PRs from merging if CI fails.

## Automatic Protection via GitHub Actions

The workflows in this repository are designed to automatically prevent merging when CI fails:

1. **CI Workflow** (`ci.yml`) - Runs tests, linting, and builds
2. **Branch Protection Workflow** (`branch-protection.yml`) - Additional quality checks
3. **Merge Guard Workflow** (`merge-guard.yml`) - Final verification before merge

## Manual Branch Protection Rules (Recommended)

To set up branch protection rules in GitHub:

### 1. Navigate to Repository Settings
- Go to your repository on GitHub
- Click on "Settings" tab
- Click on "Branches" in the left sidebar

### 2. Add Branch Protection Rule
- Click "Add rule"
- Enter branch name pattern: `main` (or `master`)

### 3. Configure Protection Settings
Enable the following options:

#### Required Status Checks
- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- Select these status checks:
  - `test (16.x)` - Node.js 16 tests
  - `test (18.x)` - Node.js 18 tests  
  - `test (20.x)` - Node.js 20 tests
  - `build-and-test` - Combined build and test verification
  - `merge-guard/all-checks` - Final merge verification

#### Additional Protections
- ✅ **Require pull request reviews before merging**
  - Required approving reviews: `1`
  - ✅ **Dismiss stale reviews when new commits are pushed**
- ✅ **Require review from code owners**
- ✅ **Restrict pushes that create files that change workflows**
- ✅ **Require linear history** (optional - prevents merge commits)
- ✅ **Do not allow bypassing the above settings**

#### Admin Enforcement
- ✅ **Include administrators** (recommended for production)

### 4. Save Protection Rule
Click "Create" to save the branch protection rule.

## How It Works

1. **Developer creates PR** → CI workflows trigger automatically
2. **All tests must pass** → Tests, linting, type checking, builds
3. **Merge guards activate** → Additional quality checks
4. **Status checks report** → GitHub shows pass/fail status
5. **Merge blocked if any fail** → Cannot merge until all checks pass
6. **Admin override available** → Only if configured

## Status Check Details

### CI Workflow (`ci.yml`)
- Tests across Node.js versions 16.x, 18.x, 20.x
- ESLint code quality checks
- TypeScript compilation
- Jest test coverage
- Build verification

### Branch Protection (`branch-protection.yml`)
- PR title quality check
- Sensitive file detection
- Additional quality gates

### Merge Guard (`merge-guard.yml`)
- Final verification before merge
- Merge conflict detection
- CI status validation
- Commit status updates

## Troubleshooting

### Common Issues

1. **Status checks not appearing**
   - Ensure workflows have run at least once
   - Check workflow file syntax
   - Verify branch names match

2. **Cannot merge despite passing tests**
   - Check all required status checks are selected
   - Ensure branch is up to date
   - Verify no merge conflicts exist

3. **Workflows not triggering**
   - Check trigger conditions in workflow files
   - Ensure push/PR targets correct branches
   - Verify repository permissions

### Emergency Bypass

If you need to merge urgently (not recommended):
1. Temporarily disable branch protection
2. Merge the PR
3. Re-enable branch protection
4. Fix the underlying issue

## Best Practices

1. **Never bypass CI** - Always fix the underlying issue
2. **Keep branches updated** - Regularly merge/rebase from main
3. **Small PRs** - Easier to review and less likely to conflict
4. **Meaningful commits** - Clear commit messages help debugging
5. **Test locally** - Run `npm test` and `npm run lint` before pushing

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/troubleshooting-required-status-checks)
