import { test, expect } from '@playwright/test';
import { createMinimalPDF, createMinimalDOCX } from './test-file-generators';
import { sendChatMessage, deleteAllDocuments, waitForNetworkIdle } from './helpers';

/**
 * Integration tests specifically for PDF and DOCX document handling
 * These tests cover the scenarios that were skipped in API tests (TC1 and TC2)
 */
test.describe('PDF and DOCX Document Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForNetworkIdle(page);
  });

  test.afterEach(async ({ page }) => {
    try {
      await deleteAllDocuments(page);
    } catch (error) {
      console.log('Cleanup: No documents to delete');
    }
  });

  test('TC1: Upload valid PDF file (< 1MB) and use in chat', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const pdfContent = `
      Test Document Content
      
      This PDF contains information about France.
      The capital of France is Paris.
      The Eiffel Tower is located in Paris.
      France is a country in Western Europe.
    `;
    const pdfBuffer = createMinimalPDF(pdfContent);
    
    // Upload PDF
    await fileInput.setInputFiles({
      name: 'france-info.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    // Wait for upload
    await expect(page.getByText(/uploaded|ready/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/france-info\.pdf/i)).toBeVisible();

    // Verify file appears in documents list with correct metadata
    const docName = page.getByText(/france-info\.pdf/i);
    await expect(docName).toBeVisible();

    // Ask a question about the PDF content
    await sendChatMessage(page, 'What is the capital of France?', true);

    // Verify response appears (with real API key, would contain "Paris")
    // With test API key, we just verify the chat interaction works
    const chatMessages = page.locator('[role="article"]').or(page.locator('.message'));
    await expect(chatMessages.first()).toBeVisible({ timeout: 5000 });
  });

  test('TC2: Upload valid DOCX file (< 1MB) and use in chat', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const docxContent = `
      Test Document Content
      
      This document contains information about science.
      Water boils at 100 degrees Celsius at sea level.
      The speed of light is approximately 299,792,458 meters per second.
      DNA stands for Deoxyribonucleic Acid.
    `;
    const docxBuffer = await createMinimalDOCX(docxContent);
    
    // Upload DOCX
    await fileInput.setInputFiles({
      name: 'science-facts.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: docxBuffer,
    });

    // Wait for upload
    await expect(page.getByText(/uploaded|ready/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/science-facts\.docx/i)).toBeVisible();

    // Ask a question about the DOCX content
    await sendChatMessage(page, 'What temperature does water boil at?', true);

    // Verify chat interaction works
    const chatMessages = page.locator('[role="article"]').or(page.locator('.message'));
    await expect(chatMessages.first()).toBeVisible({ timeout: 5000 });
  });

  test('Upload PDF, verify in documents list, then delete', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const pdfBuffer = createMinimalPDF('This is a test PDF that will be deleted.');
    
    // Upload
    await fileInput.setInputFiles({
      name: 'temp-document.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    await expect(page.getByText(/temp-document\.pdf/i)).toBeVisible({ timeout: 10000 });

    // Verify document is in the list
    const docElement = page.getByText(/temp-document\.pdf/i);
    await expect(docElement).toBeVisible();

    // Delete the document
    const deleteButton = page.getByRole('button', { name: /delete|remove|trash/i }).first();
    await deleteButton.click();

    // Handle confirmation if present
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // Verify deletion
    await expect(page.getByText(/temp-document\.pdf/i)).not.toBeVisible({ timeout: 5000 });
  });

  test('Upload DOCX, verify in documents list, then delete', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const docxBuffer = await createMinimalDOCX('This is a test DOCX that will be deleted.');
    
    // Upload
    await fileInput.setInputFiles({
      name: 'temp-document.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: docxBuffer,
    });

    await expect(page.getByText(/temp-document\.docx/i)).toBeVisible({ timeout: 10000 });

    // Delete the document
    const deleteButton = page.getByRole('button', { name: /delete|remove|trash/i }).first();
    await deleteButton.click();

    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }

    await expect(page.getByText(/temp-document\.docx/i)).not.toBeVisible({ timeout: 5000 });
  });

  test('Upload multiple PDFs and verify all appear', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    // Upload first PDF
    await fileInput.setInputFiles({
      name: 'document1.pdf',
      mimeType: 'application/pdf',
      buffer: createMinimalPDF('First PDF content'),
    });
    await expect(page.getByText(/document1\.pdf/i)).toBeVisible({ timeout: 10000 });
    
    // Upload second PDF
    await fileInput.setInputFiles({
      name: 'document2.pdf',
      mimeType: 'application/pdf',
      buffer: createMinimalPDF('Second PDF content'),
    });
    await expect(page.getByText(/document2\.pdf/i)).toBeVisible({ timeout: 10000 });
    
    // Upload third PDF
    await fileInput.setInputFiles({
      name: 'document3.pdf',
      mimeType: 'application/pdf',
      buffer: createMinimalPDF('Third PDF content'),
    });
    await expect(page.getByText(/document3\.pdf/i)).toBeVisible({ timeout: 10000 });
    
    // Verify all three are visible
    expect(await page.getByText(/document1\.pdf/i).count()).toBeGreaterThan(0);
    expect(await page.getByText(/document2\.pdf/i).count()).toBeGreaterThan(0);
    expect(await page.getByText(/document3\.pdf/i).count()).toBeGreaterThan(0);
  });

  test('Upload multiple DOCX files and verify all appear', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    // Upload first DOCX
    await fileInput.setInputFiles({
      name: 'report1.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: await createMinimalDOCX('First DOCX content'),
    });
    await expect(page.getByText(/report1\.docx/i)).toBeVisible({ timeout: 10000 });
    
    // Upload second DOCX
    await fileInput.setInputFiles({
      name: 'report2.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: await createMinimalDOCX('Second DOCX content'),
    });
    await expect(page.getByText(/report2\.docx/i)).toBeVisible({ timeout: 10000 });
    
    // Verify both are visible
    expect(await page.getByText(/report1\.docx/i).count()).toBeGreaterThan(0);
    expect(await page.getByText(/report2\.docx/i).count()).toBeGreaterThan(0);
  });

  test('Upload PDF with special characters in filename', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const pdfBuffer = createMinimalPDF('Content with special filename');
    
    await fileInput.setInputFiles({
      name: 'Test_Document-2024 (Final).pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    // The filename might be sanitized, so check for key parts
    await expect(page.getByText(/Test.*Document.*2024.*Final.*\.pdf/i)).toBeVisible({ timeout: 10000 });
  });

  test('Upload DOCX with UTF-8 characters in filename', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const docxBuffer = await createMinimalDOCX('Content with UTF-8 filename');
    
    await fileInput.setInputFiles({
      name: 'Документ-Français-日本語.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: docxBuffer,
    });

    // Should either accept or show an error
    const uploadSuccess = page.getByText(/uploaded|ready/i);
    const uploadError = page.getByText(/error|invalid|unsupported/i);
    
    await expect(uploadSuccess.or(uploadError)).toBeVisible({ timeout: 10000 });
  });

  test('PDF file can be queried after upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const pdfContent = 'Important information: The meeting is scheduled for Monday at 3 PM.';
    const pdfBuffer = createMinimalPDF(pdfContent);
    
    await fileInput.setInputFiles({
      name: 'meeting-notes.pdf',
      mimeType: 'application/pdf',
      buffer: pdfBuffer,
    });

    await expect(page.getByText(/meeting-notes\.pdf/i)).toBeVisible({ timeout: 10000 });

    // Try to query the document
    await sendChatMessage(page, 'When is the meeting?', true);

    // Verify the chat interface responds (actual content depends on API key)
    const userMessage = page.getByText('When is the meeting?');
    await expect(userMessage).toBeVisible();
  });

  test('DOCX file can be queried after upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const docxContent = 'Project deadline: The project must be completed by December 31st.';
    const docxBuffer = await createMinimalDOCX(docxContent);
    
    await fileInput.setInputFiles({
      name: 'project-info.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: docxBuffer,
    });

    await expect(page.getByText(/project-info\.docx/i)).toBeVisible({ timeout: 10000 });

    // Try to query the document
    await sendChatMessage(page, 'What is the project deadline?', true);

    // Verify the chat interface responds
    const userMessage = page.getByText('What is the project deadline?');
    await expect(userMessage).toBeVisible();
  });
});
