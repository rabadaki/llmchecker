# CI/CD Setup Documentation

## Overview

This document outlines the CI/CD pipeline configuration for the LLM Checker project, including test coverage reporting and quality gates.

## GitHub Actions Workflows

### 1. Main CI Workflow (`.github/workflows/ci.yml`)

Runs on every push to main/develop and on all pull requests.

**Features:**
- Multi-version Node.js testing (18.x, 20.x)
- Linting and code quality checks
- Test execution with coverage
- Coverage threshold enforcement (70%)
- Build verification
- Coverage artifact upload

**Quality Gates:**
- ✅ All tests must pass
- ✅ Coverage must be ≥70%
- ✅ Build must succeed
- ✅ No linting errors

### 2. PR Coverage Report (`.github/workflows/coverage-report.yml`)

Automatic coverage reporting on pull requests.

**Features:**
- Detailed coverage comment on PRs
- Per-service coverage breakdown
- Visual pass/fail indicators
- Coverage change tracking
- GitHub check status

**Report includes:**
- Lines, statements, functions, branches coverage
- Service-specific coverage (AnalysisService, etc.)
- Pass/fail status for 70% threshold

## Codecov Integration

### Setup Steps:

1. **Create Codecov Account**
   - Go to [codecov.io](https://codecov.io)
   - Sign in with GitHub
   - Add the `llm-checker` repository

2. **Get Upload Token**
   - In Codecov dashboard, find your repository
   - Copy the upload token
   - Add as GitHub secret: `CODECOV_TOKEN`

3. **Configure Repository**
   - The `codecov.yml` file is already configured
   - Coverage will upload automatically on CI runs

### Coverage Configuration:

```yaml
coverage:
  target: 70%      # Minimum coverage
  threshold: 5%    # Allowed coverage drop
```

## GitHub Repository Setup

### Required Secrets:

1. **CODECOV_TOKEN**
   - Get from Codecov dashboard
   - Add in: Settings → Secrets → Actions

### Branch Protection Rules:

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass:
     - `test (18.x)`
     - `test (20.x)`
     - `build`
     - `Code Coverage`
   - ✅ Require branches to be up to date
   - ✅ Include administrators

## Local Testing

Run coverage locally to preview CI results:

```bash
# Run tests with coverage
npm run test:coverage

# Generate detailed report
npm run test:coverage:report

# View HTML report
open coverage/lcov-report/index.html
```

## Coverage Goals

| Service | Target | Priority |
|---------|--------|----------|
| AnalysisService | 85%+ | Critical |
| RecommendationService | 80%+ | High |
| HttpService | 70%+ | Medium |
| ContextAwareScoringService | 70%+ | Medium |
| Overall | 70%+ | Required |

## Monitoring Coverage

### PR Comments
Every PR automatically receives a coverage comment showing:
- Current coverage percentages
- Pass/fail status
- Per-service breakdown

### Codecov Dashboard
- Historical coverage trends
- File-by-file coverage
- PR impact analysis
- Coverage sunburst chart

### GitHub Checks
- Automatic pass/fail status on PRs
- Blocks merge if coverage drops below 70%

## Troubleshooting

### Coverage Upload Fails
1. Check `CODECOV_TOKEN` is set correctly
2. Verify workflow has proper permissions
3. Check Codecov service status

### Coverage Below Threshold
1. Add tests for uncovered code
2. Focus on critical paths first
3. Use `npm run test:coverage` locally to verify

### False Coverage Reports
1. Clear Jest cache: `jest --clearCache`
2. Delete coverage folder and regenerate
3. Check for async test issues

## Best Practices

1. **Write Tests First**: Follow TDD when possible
2. **Focus on Business Logic**: Prioritize service layer tests
3. **Mock External Dependencies**: Keep tests fast and isolated
4. **Review Coverage Reports**: Check reports before pushing
5. **Maintain Thresholds**: Don't lower thresholds without discussion

## Future Enhancements

- [ ] Add mutation testing
- [ ] Performance benchmarks in CI
- [ ] Visual regression testing
- [ ] Dependency security scanning
- [ ] Automated changelog generation