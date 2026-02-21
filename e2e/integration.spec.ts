import { test, expect } from '@playwright/test';
import { 
  uploadTestFile, 
  sendChatMessage, 
  deleteAllDocuments,
  TestContent,
  waitForNetworkIdle
} from './helpers';

/**
 * Example tests using helper functions
 * This demonstrates how to use the helper utilities for cleaner test code
 */

test.describe('Integration Tests with Helpers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForNetworkIdle(page);
  });

  test.afterEach(async ({ page }) => {
    // Clean up: delete all documents after each test
    try {
      await deleteAllDocuments(page);
    } catch (error) {
      console.log('Cleanup: No documents to delete or cleanup failed');
    }
  });

  test('should complete full workflow: upload, chat, and delete', async ({ page }) => {
    // Step 1: Upload a document
    await uploadTestFile(page, 'geography.txt', TestContent.geography);
    
    // Step 2: Send a chat message
    await sendChatMessage(page, 'What is the capital of France?', true);
    
    // Step 3: Verify response contains expected information
    await expect(page.getByText(/Paris/i)).toBeVisible({ timeout: 30000 });
    
    // Step 4: Send another question
    await sendChatMessage(page, 'When was the Eiffel Tower completed?', true);
    
    // Step 5: Verify second response
    await expect(page.getByText(/1889/i)).toBeVisible({ timeout: 30000 });
    
    // Step 6: Delete the document
    await deleteAllDocuments(page);
    
    // Step 7: Verify empty state is shown
    await expect(page.getByText(/upload a document to get started/i)).toBeVisible();
  });

  test('should handle multiple document uploads and queries', async ({ page }) => {
    // Upload multiple documents
    await uploadTestFile(page, 'geography.txt', TestContent.geography);
    await uploadTestFile(page, 'science.txt', TestContent.science);
    
    // Query from first document
    await sendChatMessage(page, 'Tell me about France', true);
    await expect(page.getByText(/France|Paris/i)).toBeVisible({ timeout: 30000 });
    
    // Query from second document
    await sendChatMessage(page, 'What temperature does water boil at?', true);
    await expect(page.getByText(/100.*Celsius|boil/i)).toBeVisible({ timeout: 30000 });
  });

  test('should maintain chat history across multiple interactions', async ({ page }) => {
    await uploadTestFile(page, 'history.txt', TestContent.history);
    
    // Send multiple questions
    const questions = [
      'When did World War II end?',
      'When was the Declaration of Independence signed?',
      'When did the Berlin Wall fall?'
    ];
    
    for (const question of questions) {
      await sendChatMessage(page, question, true);
      await page.waitForTimeout(2000);
    }
    
    // Verify all questions are visible in chat history
    for (const question of questions) {
      await expect(page.getByText(question)).toBeVisible();
    }
    
    // Verify expected answers are present
    await expect(page.getByText(/1945/i)).toBeVisible();
    await expect(page.getByText(/1776/i)).toBeVisible();
    await expect(page.getByText(/1989/i)).toBeVisible();
  });

  test('should handle document replacement', async ({ page }) => {
    // Upload first document
    await uploadTestFile(page, 'doc1.txt', TestContent.geography);
    await sendChatMessage(page, 'What is the capital of France?', true);
    await expect(page.getByText(/Paris/i)).toBeVisible({ timeout: 30000 });
    
    // Delete and upload new document
    await deleteAllDocuments(page);
    await uploadTestFile(page, 'doc2.txt', TestContent.science);
    
    // Query from new document
    await sendChatMessage(page, 'What is DNA?', true);
    await expect(page.getByText(/Deoxyribonucleic/i)).toBeVisible({ timeout: 30000 });
  });

  test('should handle rapid consecutive uploads', async ({ page }) => {
    const files = [
      { name: 'file1.txt', content: 'Content of file 1' },
      { name: 'file2.txt', content: 'Content of file 2' },
      { name: 'file3.txt', content: 'Content of file 3' },
    ];
    
    // Upload files rapidly
    for (const file of files) {
      await uploadTestFile(page, file.name, file.content);
    }
    
    // Verify all files are uploaded
    for (const file of files) {
      await expect(page.getByText(new RegExp(file.name, 'i'))).toBeVisible();
    }
  });
});
