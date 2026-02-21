import { Page, expect } from '@playwright/test';

/**
 * Helper utilities for E2E tests
 */

/**
 * Upload a test file to the application
 */
export async function uploadTestFile(
  page: Page,
  fileName: string = 'test-document.txt',
  content: string = 'This is a test document.'
) {
  const fileInput = page.locator('input[type="file"]');
  
  await fileInput.setInputFiles({
    name: fileName,
    mimeType: getMimeType(fileName),
    buffer: Buffer.from(content),
  });

  // Wait for upload to complete
  await expect(page.getByText(new RegExp(fileName, 'i'))).toBeVisible({ timeout: 10000 });
}

/**
 * Send a chat message and wait for response
 */
export async function sendChatMessage(
  page: Page,
  message: string,
  waitForResponse: boolean = true
) {
  const chatInput = page.locator('textarea').first();
  await chatInput.fill(message);
  
  const sendButton = page.getByRole('button', { name: /send|submit/i })
    .or(page.locator('button[type="submit"]'));
  await sendButton.click();

  // Verify message appears in chat
  await expect(page.getByText(message)).toBeVisible({ timeout: 5000 });

  if (waitForResponse) {
    // Wait for AI response (look for loading to disappear)
    await page.waitForTimeout(2000);
  }
}

/**
 * Delete all uploaded documents
 */
export async function deleteAllDocuments(page: Page) {
  const deleteButtons = page.getByRole('button', { name: /delete|remove|trash/i });
  const count = await deleteButtons.count();
  
  for (let i = 0; i < count; i++) {
    await deleteButtons.first().click();
    
    // Handle confirmation dialog if present
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    
    await page.waitForTimeout(500);
  }
}

/**
 * Wait for loading to complete
 */
export async function waitForLoadingComplete(page: Page) {
  const loadingIndicator = page.locator('[role="status"]')
    .or(page.getByText(/loading|typing|thinking/i))
    .or(page.locator('svg[class*="animate" i]'));
  
  // Wait for loading to appear
  await loadingIndicator.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  
  // Wait for loading to disappear
  await loadingIndicator.first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
}

/**
 * Get MIME type based on file extension
 */
function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'txt': 'text/plain',
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword',
  };
  
  return mimeTypes[extension || 'txt'] || 'text/plain';
}

/**
 * Create test file content for different scenarios
 */
export const TestContent = {
  simple: 'This is a simple test document.',
  
  geography: `
    The capital of France is Paris.
    The Eiffel Tower was completed in 1889.
    France is located in Western Europe.
    The population of France is approximately 67 million people.
  `,
  
  science: `
    Water boils at 100 degrees Celsius at sea level.
    The speed of light is approximately 299,792,458 meters per second.
    DNA stands for Deoxyribonucleic Acid.
  `,
  
  history: `
    World War II ended in 1945.
    The Declaration of Independence was signed in 1776.
    The Berlin Wall fell in 1989.
  `,
};

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
}

/**
 * Check if element exists without throwing error
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).count() > 0;
}

/**
 * Toggle theme (if available)
 */
export async function toggleTheme(page: Page) {
  const themeToggle = page.getByRole('button').filter({ hasText: /theme|light|dark|sun|moon/i })
    .or(page.locator('button[aria-label*="theme" i]'));
  
  if (await themeToggle.count() > 0) {
    await themeToggle.first().click();
    await page.waitForTimeout(500);
  }
}
