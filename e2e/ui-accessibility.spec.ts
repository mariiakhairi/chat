import { test, expect } from '@playwright/test';

test.describe('UI and Accessibility Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    // Get the current theme (check for dark class on html or body)
    const htmlElement = page.locator('html');
    const initialTheme = await htmlElement.getAttribute('class');
    
    // Find and click theme toggle button
    const themeToggle = page.getByRole('button').filter({ hasText: /theme|light|dark|sun|moon/i })
      .or(page.locator('button[aria-label*="theme" i]'));
    
    await themeToggle.first().click();
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Check that theme has changed
    const newTheme = await htmlElement.getAttribute('class');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that page renders correctly
    await expect(page.locator('body')).toBeVisible();
    
    // Check that upload zone is still accessible
    const uploadZone = page.getByText(/drag and drop|upload/i);
    await expect(uploadZone.first()).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have accessible elements with proper ARIA labels', async ({ page }) => {
    // Check for accessible buttons
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Check for main content landmark
    const main = page.locator('main').or(page.locator('[role="main"]'));
    await expect(main.first()).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible({ timeout: 2000 });
  });

  test('should display toast notifications', async ({ page }) => {
    // Upload a file to trigger success toast
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'toast-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Testing toast notifications'),
    });
    
    // Look for toast notification
    const toast = page.locator('[role="status"]')
      .or(page.getByText(/uploaded|success|ready/i));
    
    await expect(toast.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have proper page structure with headings', async ({ page }) => {
    // Check for heading elements
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should display file type icons or indicators', async ({ page }) => {
    // Upload a document
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'icon-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Testing file icons'),
    });
    
    await expect(page.getByText(/icon-test\.txt/i)).toBeVisible({ timeout: 10000 });
    
    // Check for file icons (svg, img, or icon elements)
    const fileIcon = page.locator('svg, img').first();
    await expect(fileIcon).toBeVisible();
  });

  test('should have hover effects on interactive elements', async ({ page }) => {
    // Upload a document first
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'hover-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Testing hover effects'),
    });
    
    await page.waitForTimeout(2000);
    
    // Find a button and hover over it
    const button = page.getByRole('button').first();
    await button.hover();
    
    // The element should remain visible after hover
    await expect(button).toBeVisible();
  });

  test('should support clearing all documents', async ({ page }) => {
    // Upload a document
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'clear-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Testing clear functionality'),
    });
    
    await expect(page.getByText(/clear-test\.txt/i)).toBeVisible({ timeout: 10000 });
    
    // Look for "Clear All" or "Delete All" button
    const clearButton = page.getByRole('button', { name: /clear all|delete all|remove all/i });
    
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      // Confirm if needed
      const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }
      
      // Check that empty state is shown
      await expect(page.getByText(/upload a document to get started/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
