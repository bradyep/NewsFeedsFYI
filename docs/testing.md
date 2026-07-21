# Testing Setup Guide

This project includes a comprehensive testing setup with Jest for unit tests and Playwright for end-to-end tests.

## Overview

### Jest Configuration
- **Client Tests**: React components, stores, utilities (jsdom environment)
- **Server Tests**: API routes, models, business logic (node environment)  
- **Common Tests**: Shared models and utilities (node environment)
- **General Tests**: Integration and other tests (excludes E2E directory)

### Playwright Configuration
- **E2E Tests**: Full browser testing across Chrome, Firefox, and Safari
- **Visual Testing**: Screenshots and videos on failure
- **Test Reports**: HTML reports with detailed information
- **Separation**: E2E tests are completely separate from Jest and run independently

## Directory Structure

```
src/
├── test/
│   ├── setup/           # Jest setup files
│   │   ├── client.ts    # Client-side test setup
│   │   ├── server.ts    # Server-side test setup
│   │   └── common.ts    # Common test setup
│   ├── fixtures/        # Mock data and test fixtures
│   │   └── mockData.ts  # Sample mock objects
│   ├── utils/           # Test utilities
│   │   ├── test-utils.tsx  # React testing utilities
│   │   └── server-utils.ts # Server testing utilities
│   ├── e2e/             # Playwright E2E tests
│   └── example.test.ts  # Example Jest test
```

## Running Tests

### Jest (Unit Tests)
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test suites
npm run test:client    # Client-side tests only
npm run test:server    # Server-side tests only
npm run test:common    # Common/shared tests only
```

### Playwright (E2E Tests)
```bash
# Run E2E tests (requires client to be running on localhost:3030)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# List available E2E tests
npx playwright test --list
```

**Note**: E2E tests are completely separate from Jest. They require your client application to be running on `localhost:3030`. Start your client with `npm run startclient` before running E2E tests.

#### One-command smoke test
```bash
npm run test:e2e:smoke
```
Runs `scripts/e2e-smoke.ps1`, which builds the app, starts the backend, runs the Playwright suite (Playwright's own `webServer` config starts/stops the client dev server), then stops the backend and prints the result and HTML report path. Useful as a quick end-to-end smoke check without manually juggling servers.

### Run All Tests
```bash
npm run test:all  # Runs both Jest and Playwright
```

## VS Code Integration

The following VS Code tasks are available:

**Test Tasks:**
- `Run All Tests` - Runs Jest tests
- `Run Tests with Coverage` - Runs Jest with coverage report
- `Run Client Tests` - Client-side tests only
- `Run Server Tests` - Server-side tests only
- `Run Common Tests` - Common/shared tests only
- `Run E2E Tests` - Playwright E2E tests
- `Run E2E Tests (UI Mode)` - Playwright with UI
- `Run Tests in Watch Mode` - Jest in watch mode

Access these via: `Ctrl+Shift+P` → `Tasks: Run Task`

## Writing Tests

### Client Tests (React Components)
```typescript
import { render, screen } from '../test/utils/test-utils';
import { MyComponent } from './MyComponent';

test('should render component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Server Tests (API Routes)
```typescript
import { request, createTestApp } from '../test/utils/server-utils';
import userRoutes from './users';

test('should create user', async () => {
  const app = createTestApp();
  app.use('/users', userRoutes);
  
  const response = await request(app)
    .post('/users')
    .send({ username: 'test', password: 'pass' })
    .expect(200);
    
  expect(response.body.username).toBe('test');
});
```

### E2E Tests (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="signup-button"]');
  await page.fill('[data-testid="username"]', 'testuser');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="submit"]');
  
  await expect(page.locator('[data-testid="welcome"]')).toBeVisible();
});
```

## Test Utilities

### Mock Data
Use the pre-defined mock objects from `src/test/fixtures/mockData.ts`:
```typescript
import { mockUser, mockPage, createMockUserFeeds } from '../test/fixtures/mockData';
```

### React Testing Utilities
The `test-utils.tsx` provides a custom render function that includes MobX stores:
```typescript
import { render } from '../test/utils/test-utils';
// Automatically provides UserStore, PageStore, LinkStore
```

## Configuration Files

- `jest.config.js` - Jest configuration with multiple projects
- `playwright.config.ts` - Playwright configuration
- `src/test/setup/` - Test environment setup files

## Coverage

Coverage reports are generated in the `coverage/` directory and include:
- Line coverage
- Branch coverage  
- Function coverage
- Statement coverage

## CI/CD Integration

The test setup is ready for CI/CD pipelines:
- Jest runs in CI mode automatically
- Playwright includes retry logic for flaky tests
- Coverage reports can be uploaded to services like Codecov

## Tips

1. **Naming Convention**: Use `.test.ts` or `.spec.ts` for test files
2. **Test Location**: Place tests near the code they're testing or in the appropriate test directory
3. **Mock External Dependencies**: Use Jest mocks for external APIs and services
4. **Use Data Test IDs**: Add `data-testid` attributes for stable E2E test selectors
5. **Async Testing**: Always use `await` with async operations in tests
