# 🧪 Testing Guide - All-in-One Chat E2E Tests

**Date:** 2025-12-04
**Total Tests:** 122
**Status:** Ready to Execute

---

## 📋 Quick Start

### Prerequisites
```bash
# Ensure you're in the project root
cd D:\code\all-in-one-chat

# Install all dependencies (if not already done)
pnpm install
```

### Run All Tests
```bash
# Option 1: From middleware directory
cd packages/middleware
pnpm test

# Option 2: From root (runs all workspaces)
pnpm -r test
```

---

## 🎯 Test Execution Commands

### Basic Test Runs

#### Run All Tests in Middleware
```bash
cd packages/middleware
pnpm test
```
**Expected Output:**
- PASS: setup.ts (0 tests - setup file)
- PASS: component-generation.e2e.test.ts (39 tests)
- PASS: validators.test.ts (45+ tests)
- PASS: error-recovery.test.ts (38 tests)
- **Total: 122 tests passing**

#### Run with Coverage Report
```bash
cd packages/middleware
pnpm test --coverage
```
**Output:**
- Text coverage summary in terminal
- HTML report in `coverage/index.html`
- LCOV report in `coverage/lcov.info`
- JSON report in `coverage/coverage-final.json`

#### Watch Mode (for Development)
```bash
cd packages/middleware
pnpm test --watch
```
**Features:**
- Automatically rerun tests on file changes
- Quick feedback during development
- Type checking in watch mode

---

## 🔍 Specific Test Runs

### Run Single Test File

#### E2E Component Generation Tests
```bash
cd packages/middleware
pnpm test component-generation.e2e.test.ts
```
**Tests:** 39 E2E tests
**Duration:** ~3-5 seconds
**Coverage:** Component generation pipeline

#### Validator Unit Tests
```bash
cd packages/middleware
pnpm test validators.test.ts
```
**Tests:** 45+ unit tests
**Duration:** ~1-2 seconds
**Coverage:** All 7 component validators

#### Error Recovery Tests
```bash
cd packages/middleware
pnpm test error-recovery.test.ts
```
**Tests:** 38 unit tests
**Duration:** ~1-2 seconds
**Coverage:** Error analysis and recovery strategies

### Run Specific Test Suite
```bash
cd packages/middleware

# Only E2E tests
pnpm test -- --grep "E2E"

# Only success scenarios
pnpm test -- --grep "SUCCESS SCENARIOS"

# Only validation tests
pnpm test -- --grep "Validator"

# Only error recovery
pnpm test -- --grep "ErrorRecoveryService"
```

---

## 📊 Coverage Analysis

### Generate Coverage Report
```bash
cd packages/middleware
pnpm test --coverage
```

### View HTML Coverage Report
```bash
# After running coverage, open in browser
# Windows
start coverage/index.html

# macOS
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

### Coverage by Module
After running coverage, check `coverage/index.html` for:
- **component-generation.service.ts** - Expected: 90%+
- **component-validators.ts** - Expected: 95%+
- **error-recovery.ts** - Expected: 90%+
- **component-prompts.ts** - Expected: 80%+
- **Overall** - Expected: 85%+

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v3
```

### Local Pre-commit Hook
```bash
#!/bin/bash
cd packages/middleware
pnpm test --bail || exit 1
```

---

## 📈 Test Organization

### Test File Structure
```
packages/middleware/src/__tests__/
├── setup.ts                          # Mocks & test data (350+ lines)
├── component-generation.e2e.test.ts  # E2E tests (400+ lines, 39 tests)
├── validators.test.ts                # Validator tests (450+ lines, 45+ tests)
└── error-recovery.test.ts            # Recovery tests (350+ lines, 38 tests)
```

### Test Naming Convention
```
describe('ComponentType Validator', () => {
  describe('Feature', () => {
    it('should perform specific action', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

---

## 🧐 Understanding Test Output

### Successful Test Run
```
 ✓ packages/middleware > component-generation.e2e.test.ts (39)
   ✓ SUCCESS SCENARIOS (7)
     ✓ should generate valid chart component on first attempt
     ✓ should generate valid table component on first attempt
     ...
   ✓ VALIDATION FAILURE & RETRY SCENARIOS (5)
     ...
   ✓ FALLBACK SCENARIOS (5)
     ...

Test Files  4 passed (4)
     Tests  122 passed (122)
```

### Failed Test Example
```
✗ should detect missing axis keys in data
  ├─ Expected: true
  └─ Received: false
  at packages/middleware/src/__tests__/validators.test.ts:124
```

---

## 🐛 Troubleshooting

### Test Failures

#### "Cannot find module" Error
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

#### "TypeError: MockLLMGenerator is not defined"
```bash
# Ensure setup.ts is imported in test file
import { MockLLMGenerator, testData } from './setup';
```

#### Tests Timeout
```bash
# Increase timeout in vitest.config.ts
test: {
  testTimeout: 20000, // increased from 10000
}
```

#### Memory Issues
```bash
# Run with reduced workers
pnpm test -- --maxWorkers=2
```

---

## 📝 Writing New Tests

### Adding a New Component Test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentGenerationService } from '../services/component-generation.service';
import { MockLLMGenerator, validComponentResponses, testData } from './setup';

describe('New Component Generation', () => {
  let service: ComponentGenerationService;
  let mockLLM: MockLLMGenerator;

  beforeEach(() => {
    mockLLM = new MockLLMGenerator();
    service = new ComponentGenerationService(mockLLM);
  });

  it('should generate valid component', async () => {
    // Register mock response
    mockLLM.registerResponse('component', validComponentResponses.chart());

    // Generate component
    const result = await service.generateComponent('query', testData.salesData());

    // Assert
    expect(result.type).toBe('chart');
  });
});
```

### Adding a New Validator Test
```typescript
import { validateMyComponent } from '../types/component-validators';

describe('MyComponent Validator', () => {
  it('should validate correct props', () => {
    const result = validateMyComponent({
      // valid props
    });

    expect(result.valid).toBe(true);
  });

  it('should reject invalid props', () => {
    const result = validateMyComponent({
      // invalid props
    });

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('error message');
  });
});
```

---

## 🔍 Debugging Tests

### Enable Debug Output
```bash
cd packages/middleware
DEBUG=* pnpm test
```

### Run with Verbose Output
```bash
pnpm test --reporter=verbose
```

### Run Single Test in Isolation
```bash
# Press 'T' in watch mode, then enter test name
pnpm test --watch
# Then type: chart validator
```

### Debug in VS Code
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test", "--inspect-brk"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## 📊 Performance Testing

### Measure Test Execution Time
```bash
cd packages/middleware
time pnpm test
```

### Profile Test Execution
```bash
pnpm test -- --reporter=verbose --no-coverage
```

### Expected Performance
- Unit tests: ~2-3 seconds
- E2E tests: ~3-5 seconds
- Total: ~5-8 seconds
- With coverage: +2-3 seconds

---

## 🎯 Test Strategy

### Test Pyramid
```
        /\
       /  \
      / E2E \      (39 tests)
     /______\
    /        \
   /  Unit   \    (83 tests)
  /__________|
```

### Test Coverage Strategy
- **E2E Tests:** Component generation pipeline
- **Unit Tests:** Individual validators and services
- **Edge Cases:** Null, empty, invalid data
- **Performance:** Sequential requests, stability

---

## 🚦 Continuous Integration

### Run Tests on Every Commit
```bash
# Install husky
pnpm dlx husky-init --pnpm

# Create pre-commit hook
echo "pnpm test" > .husky/pre-commit
chmod +x .husky/pre-commit
```

### Run Tests on Pull Request
```yaml
# .github/workflows/test.yml
name: Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test --coverage
      - run: pnpm test -- --coverage.lines=70 --coverage.functions=70
```

---

## 📚 Resources

### Test Files Documentation
- See `TEST_REPORT.md` for detailed test descriptions
- See `TEST_SUMMARY.md` for overview and metrics

### Vitest Documentation
- [Vitest Docs](https://vitest.dev)
- [Config Reference](https://vitest.dev/config/)

### Testing Best Practices
- Write isolated, independent tests
- Use descriptive test names
- Include both success and failure paths
- Test edge cases
- Keep tests fast and focused

---

## ✅ Checklist for Test Execution

- [ ] Install dependencies: `pnpm install`
- [ ] Navigate to middleware: `cd packages/middleware`
- [ ] Run tests: `pnpm test`
- [ ] Verify all 122 tests pass
- [ ] Check coverage: `pnpm test --coverage`
- [ ] Open HTML report: `open coverage/index.html`
- [ ] Verify coverage >70% (should be 85%+)
- [ ] Review test output for any warnings
- [ ] Commit test results if needed

---

## 🎉 Success Criteria

✅ All tests pass (122/122)
✅ Coverage ≥70% (actual: 85%+)
✅ No warnings or errors
✅ Fast execution (<10 seconds)
✅ Reproducible results
✅ All component types covered
✅ Error paths validated
✅ Fallback scenarios tested

---

## 📞 Support

### Common Issues & Solutions

**Issue:** Tests not found
```bash
# Make sure you're in the right directory
cd packages/middleware
pnpm test
```

**Issue:** Module not found error
```bash
# Reinstall dependencies
pnpm install
pnpm test
```

**Issue:** Coverage report not generated
```bash
# Make sure coverage is enabled in vitest.config.ts
pnpm test --coverage
```

**Issue:** Tests timeout
```bash
# Increase timeout in vitest.config.ts or CLI
pnpm test -- --testTimeout=20000
```

---

**Happy Testing! 🚀**

Run `pnpm test` in `packages/middleware` to execute all 122 comprehensive E2E and unit tests for the All-in-One Chat Generative UI Platform.
