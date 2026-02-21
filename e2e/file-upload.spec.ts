import { test, expect } from '@playwright/test';
import { createMinimalPDF, createMinimalDOCX } from './test-file-generators';

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

  test('should upload a PDF file successfully', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const pdfBuffer = createMinimalPDF('Test PDF Content');
    
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    // Wait for upload to complete
    await expect(page.getByText(/uploaded|ready/i)).toBeVisible({ timeout: 10000 });
    
    // Verify the PDF appears in documents list
    await expect(page.getByText(/test-document\.pdf/i)).toBeVisible();
  });

  test('should upload a DOCX file successfully', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const docxBuffer = await createMinimalDOCX('Test DOCX Content');
    
    await fileInput.setInputFiles({
      name: 'test-document.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: docxBuffer,
    });

    // Wait for upload to complete
    await expect(page.getByText(/uploaded|ready/i)).toBeVisible({ timeout: 10000 });
    
    // Verify the DOCX appears in documents list
    await expect(page.getByText(/test-document\.docx/i)).toBeVisible();
  });

  test('should handle PDF file at size limit (1MB)', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    // Create a PDF that's close to 1MB
    const largeContent = 'A'.repeat(1024 * 900); // ~900KB of content
    const pdfBuffer = createMinimalPDF(largeContent);
    
    await fileInput.setInputFiles({
      name: 'large-document.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    // Should either succeed or show size error
    const uploadSuccess = page.getByText(/uploaded|ready/i);
    const sizeError = page.getByText(/size|limit|large/i);
    
    await expect(uploadSuccess.or(sizeError)).toBeVisible({ timeout: 10000 });
  });

  test('should reject PDF file exceeding size limit', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    // Create a PDF larger than 1MB
    const largeContent = 'B'.repeat(1024 * 1100); // ~1.1MB
    const pdfBuffer = createMinimalPDF(largeContent);
    
    await fileInput.setInputFiles({
      name: 'too-large.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    // Should show size limit error
    await expect(page.getByText(/size|limit|exceed|large/i)).toBeVisible({ timeout: 10000 });
  });

  test('should delete uploaded PDF file', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const pdfBuffer = createMinimalPDF('PDF to delete');
    
    await fileInput.setInputFiles({
      name: 'delete-me.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    await expect(page.getByText(/delete-me\.pdf/i)).toBeVisible({ timeout: 10000 });
    
    // Delete the document
    const deleteButton = page.getByRole('button', { name: /delete|remove|trash/i }).first();
    await deleteButton.click();
    
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    
    await expect(page.getByText(/delete-me\.pdf/i)).not.toBeVisible({ timeout: 5000 });
  });

  test('should delete uploaded DOCX file', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const docxBuffer = await createMinimalDOCX('DOCX to delete');
    
    await fileInput.setInputFiles({
      name: 'delete-me.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: docxBuffer,
    });

    await expect(page.getByText(/delete-me\.docx/i)).toBeVisible({ timeout: 10000 });
    
    // Delete the document
    const deleteButton = page.getByRole('button', { name: /delete|remove|trash/i }).first();
    await deleteButton.click();
    
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    
    await expect(page.getByText(/delete-me\.docx/i)).not.toBeVisible({ timeout: 5000 });
  });

  test('should upload mixed file types (TXT, PDF, DOCX)', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    // Upload TXT
    await fileInput.setInputFiles({
      name: 'document1.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Text content'),
    });
    await expect(page.getByText(/document1\.txt/i)).toBeVisible({ timeout: 10000 });
    
    // Upload PDF
    await fileInput.setInputFiles({
      name: 'document2.pdf',
      mimeType: 'application/pdf',
      buffer: createMinimalPDF('PDF content'),
    });
    await expect(page.getByText(/document2\.pdf/i)).toBeVisible({ timeout: 10000 });
    
    // Upload DOCX
    await fileInput.setInputFiles({
      name: 'document3.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: await createMinimalDOCX('DOCX content'),
    });
    await expect(page.getByText(/document3\.docx/i)).toBeVisible({ timeout: 10000 });
    
    // Verify all three are visible
    expect(await page.getByText(/document1\.txt/i).count()).toBeGreaterThan(0);
    expect(await page.getByText(/document2\.pdf/i).count()).toBeGreaterThan(0);
    expect(await page.getByText(/document3\.docx/i).count()).toBeGreaterThan(0);
  });

  test('should display correct file type icon or indicator for PDF', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const pdfBuffer = createMinimalPDF('PDF content');
    
    await fileInput.setInputFiles({
      name: 'icon-test.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    await expect(page.getByText(/icon-test\.pdf/i)).toBeVisible({ timeout: 10000 });
    
    // Check for PDF indicator (could be icon, badge, or text)
    const pdfIndicator = page.locator('text=/PDF/i').or(page.locator('[title*="PDF" i]'));
    await expect(pdfIndicator.first()).toBeVisible();
  });

  test('should display correct file type icon or indicator for DOCX', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const docxBuffer = await createMinimalDOCX('DOCX content');
    
    await fileInput.setInputFiles({
      name: 'icon-test.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: docxBuffer,
    });

    await expect(page.getByText(/icon-test\.docx/i)).toBeVisible({ timeout: 10000 });
    
    // Check for DOCX indicator
    const docxIndicator = page.locator('text=/DOCX/i').or(page.locator('[title*="DOCX" i]'));
    await expect(docxIndicator.first()).toBeVisible();
  });
});
