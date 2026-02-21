import { test, expect } from '@playwright/test';

test.describe('Document Chat Application - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page successfully', async ({ page }) => {
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Document Chat/i);
    
    // Verify the page has loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display empty state when no documents uploaded', async ({ page }) => {
    // Check for file upload zone with instructions
    const uploadInstructions = page.getByText(/Drop your document here or click to browse/i);
    await expect(uploadInstructions).toBeVisible();
  });

  test('should display file upload zone', async ({ page }) => {
    // Check if file upload zone is present
    const uploadZone = page.getByText(/Drop your document here/i);
    await expect(uploadZone).toBeVisible();
  });

  test('should have theme toggle button', async ({ page }) => {
    // Check for theme toggle using data-testid
    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toBeVisible();
  });

  test('should display supported file formats', async ({ page }) => {
    // Check if supported formats are mentioned
    const formatText = page.getByText(/PDF|DOCX|TXT/i);
    await expect(formatText.first()).toBeVisible();
  });
});
