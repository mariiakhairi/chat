import { test, expect } from '@playwright/test';

test.describe('File Upload Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should upload a text file successfully', async ({ page }) => {
    // Create a test file
    const fileContent = 'This is a test document for E2E testing.';
    const buffer = Buffer.from(fileContent);
    
    // Find the file input (it might be hidden)
    const fileInput = page.locator('input[type="file"]');
    
    // Upload the file
    await fileInput.setInputFiles({
      name: 'test-document.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });

    // Wait for upload to complete and check for success message
    await expect(page.getByText(/uploaded|ready/i)).toBeVisible({ timeout: 10000 });
    
    // Verify that the document appears in the list
    await expect(page.getByText(/test-document\.txt/i)).toBeVisible();
  });

  test('should display error for unsupported file types', async ({ page }) => {
    // Try to upload an unsupported file type
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake image content'),
    });

    // Check for error message
    await expect(page.getByText(/unsupported|invalid|not allowed/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display uploaded document with delete option', async ({ page }) => {
    // Upload a file first
    const fileInput = page.locator('input[type="file"]');
    const fileContent = 'Test content for deletion test.';
    
    await fileInput.setInputFiles({
      name: 'test-delete.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(fileContent),
    });

    // Wait for the document to appear
    await expect(page.getByText(/test-delete\.txt/i)).toBeVisible({ timeout: 10000 });
    
    // Check if delete button is present
    const deleteButton = page.getByRole('button', { name: /delete|remove|trash/i });
    await expect(deleteButton.first()).toBeVisible();
  });

  test('should allow multiple file uploads', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    // Upload first file
    await fileInput.setInputFiles({
      name: 'document1.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('First document content'),
    });
    
    await expect(page.getByText(/document1\.txt/i)).toBeVisible({ timeout: 10000 });
    
    // Upload second file
    await fileInput.setInputFiles({
      name: 'document2.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Second document content'),
    });
    
    await expect(page.getByText(/document2\.txt/i)).toBeVisible({ timeout: 10000 });
    
    // Verify both documents are visible
    expect(await page.getByText(/document1\.txt/i).count()).toBeGreaterThan(0);
    expect(await page.getByText(/document2\.txt/i).count()).toBeGreaterThan(0);
  });

  test('should delete uploaded document', async ({ page }) => {
    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'to-be-deleted.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This file will be deleted'),
    });

    // Wait for document to be uploaded
    await expect(page.getByText(/to-be-deleted\.txt/i)).toBeVisible({ timeout: 10000 });
    
    // Click delete button
    const deleteButton = page.getByRole('button', { name: /delete|remove|trash/i }).first();
    await deleteButton.click();
    
    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    
    // Verify document is removed
    await expect(page.getByText(/to-be-deleted\.txt/i)).not.toBeVisible({ timeout: 5000 });
  });
});
