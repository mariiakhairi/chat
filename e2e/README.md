# E2E Testing with Playwright

This directory contains end-to-end tests for the Document Chat Application using [Playwright](https://playwright.dev/).

## Test Structure

```
e2e/
├── smoke.spec.ts              # Basic smoke tests for app loading
├── file-upload.spec.ts        # File upload functionality tests
├── chat.spec.ts               # Chat interaction tests
└── ui-accessibility.spec.ts   # UI and accessibility tests
```

## Prerequisites

Before running the tests, ensure you have:

1. **Environment Setup**:
   - Create a `.env` file with your `GEMINI_API_KEY`
   - Make sure the development server can start successfully

2. **Playwright Browsers**:
   ```bash
   npx playwright install
   ```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see the browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test smoke.spec.ts
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

The Playwright configuration is defined in `playwright.config.ts` at the project root:

- **Base URL**: `http://localhost:5000` (configurable via `BASE_URL` env var)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Reporters**: HTML report and list reporter
- **Web Server**: Automatically starts `npm run dev` before tests

## Writing New Tests

### Test File Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.getByRole('button', { name: /click me/i });
    
    // Act
    await element.click();
    
    // Assert
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});
```

### Best Practices

1. **Use User-Facing Selectors**:
   ```typescript
   // Good
   page.getByRole('button', { name: /submit/i })
   page.getByText(/welcome/i)
   page.getByLabel(/email/i)
   
   // Avoid
   page.locator('#button-id')
   page.locator('.some-class')
   ```

2. **Wait for Conditions**:
   ```typescript
   // Wait for element to be visible
   await expect(element).toBeVisible({ timeout: 10000 });
   
   // Wait for network response
   await page.waitForResponse(resp => resp.url().includes('/api/'));
   ```

3. **Clean Up After Tests**:
   - Use `test.afterEach()` to clean up uploaded files or reset state
   - Consider using `test.beforeEach()` for common setup

4. **Handle Async Operations**:
   - Always use `await` for Playwright actions
   - Set appropriate timeouts for API calls (e.g., AI responses may take 30s)

5. **Test Independence**:
   - Each test should be able to run independently
   - Don't rely on test execution order
   - Clean up test data after each test

## Common Selectors

### File Upload
```typescript
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('./test-file.txt');
```

### Chat Input
```typescript
const chatInput = page.locator('textarea').first();
await chatInput.fill('What is the capital of France?');
```

### Buttons
```typescript
const submitButton = page.getByRole('button', { name: /send|submit/i });
await submitButton.click();
```

## Debugging Tests

### Using Playwright Inspector
```bash
npm run test:e2e:debug
```

### Using Console Logs
```typescript
test('debug test', async ({ page }) => {
  page.on('console', msg => console.log('Browser log:', msg.text()));
  await page.goto('/');
});
```

### Taking Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

### Trace Viewer
Traces are automatically recorded on first retry. View them with:
```bash
npx playwright show-trace trace.zip
```

## Continuous Integration

The tests are configured to run in CI environments:
- Retries: 2 attempts on failure
- Workers: 1 (sequential execution to avoid conflicts)
- Web server: Will not reuse existing server (starts fresh)

### GitHub Actions Example
```yaml
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright browsers
  run: npx playwright install --with-deps
  
- name: Run E2E tests
  run: npm run test:e2e
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
    
- name: Upload test report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests timeout
- Increase timeout in test or config
- Check if dev server starts correctly
- Verify API key is set in `.env`

### Element not found
- Use `page.pause()` to inspect the page
- Check if element is in iframe: `page.frameLocator()`
- Verify element is visible: `await element.waitFor({ state: 'visible' })`

### Flaky tests
- Add explicit waits: `await expect(element).toBeVisible()`
- Use `waitForLoadState()`: `await page.waitForLoadState('networkidle')`
- Increase timeout for async operations (AI responses)

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Tests](https://playwright.dev/docs/debug)
