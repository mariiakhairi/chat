import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Upload a test document first for chat tests
    const fileInput = page.locator('input[type="file"]');
    const testContent = `
      The capital of France is Paris.
      The Eiffel Tower was completed in 1889.
      France is located in Western Europe.
      The population of France is approximately 67 million people.
    `;
    
    await fileInput.setInputFiles({
      name: 'france-facts.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(testContent),
    });
    
    // Wait for upload to complete
    await expect(page.getByText(/france-facts\.txt/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display chat input after document upload', async ({ page }) => {
    // Check if chat input is visible
    const chatInput = page.locator('textarea, input[type="text"]').filter({ 
      hasText: /ask|question|message/i 
    }).or(page.locator('textarea[placeholder*="Ask" i], textarea[placeholder*="question" i]'));
    
    // Get all textareas and inputs
    const possibleInputs = page.locator('textarea, input[type="text"]');
    await expect(possibleInputs.first()).toBeVisible();
  });

  test('should send a question and receive a response', async ({ page }) => {
    // Find the chat input
    const chatInput = page.locator('textarea').first();
    await expect(chatInput).toBeVisible();
    
    // Type a question
    const question = 'What is the capital of France?';
    await chatInput.fill(question);
    
    // Submit the question (look for send button)
    const sendButton = page.getByRole('button', { name: /send|submit/i })
      .or(page.locator('button[type="submit"]'));
    await sendButton.click();
    
    // Verify the question appears in the chat
    await expect(page.getByText(question)).toBeVisible({ timeout: 5000 });
    
    // Wait for AI response (this might take a few seconds)
    // Look for a response that mentions Paris
    await expect(page.getByText(/Paris/i)).toBeVisible({ timeout: 30000 });
  });

  test('should display loading indicator while waiting for response', async ({ page }) => {
    const chatInput = page.locator('textarea').first();
    await chatInput.fill('Tell me about France');
    
    const sendButton = page.getByRole('button', { name: /send|submit/i })
      .or(page.locator('button[type="submit"]'));
    await sendButton.click();
    
    // Check for loading indicator (spinner, dots, or "typing" text)
    const loadingIndicator = page.locator('[role="status"]')
      .or(page.getByText(/loading|typing|thinking/i))
      .or(page.locator('svg[class*="animate" i]'));
    
    await expect(loadingIndicator.first()).toBeVisible({ timeout: 5000 });
  });

  test('should disable input while processing', async ({ page }) => {
    const chatInput = page.locator('textarea').first();
    await chatInput.fill('What is the population?');
    
    const sendButton = page.getByRole('button', { name: /send|submit/i })
      .or(page.locator('button[type="submit"]'));
    await sendButton.click();
    
    // Check if input is disabled during processing
    await expect(chatInput).toBeDisabled({ timeout: 2000 });
  });

  test('should show chat history', async ({ page }) => {
    // Send first question
    const chatInput = page.locator('textarea').first();
    await chatInput.fill('What is the capital?');
    
    const sendButton = page.getByRole('button', { name: /send|submit/i })
      .or(page.locator('button[type="submit"]'));
    await sendButton.click();
    
    // Wait for response
    await expect(page.getByText(/Paris/i)).toBeVisible({ timeout: 30000 });
    
    // Send second question
    await chatInput.fill('When was the Eiffel Tower completed?');
    await sendButton.click();
    
    // Wait for second response
    await expect(page.getByText(/1889/i)).toBeVisible({ timeout: 30000 });
    
    // Verify both questions are still visible in chat history
    await expect(page.getByText(/What is the capital/i)).toBeVisible();
    await expect(page.getByText(/When was the Eiffel Tower/i)).toBeVisible();
  });

  test('should not allow empty messages', async ({ page }) => {
    const chatInput = page.locator('textarea').first();
    const sendButton = page.getByRole('button', { name: /send|submit/i })
      .or(page.locator('button[type="submit"]'));
    
    // Try to send empty message
    await chatInput.fill('');
    
    // Send button should be disabled or clicking should have no effect
    const isDisabled = await sendButton.isDisabled().catch(() => false);
    
    if (!isDisabled) {
      const messageCountBefore = await page.locator('[role="article"], .message').count();
      await sendButton.click();
      const messageCountAfter = await page.locator('[role="article"], .message').count();
      
      // No new message should be added
      expect(messageCountAfter).toBe(messageCountBefore);
    } else {
      expect(isDisabled).toBe(true);
    }
  });

  test('should clear input after sending message', async ({ page }) => {
    const chatInput = page.locator('textarea').first();
    const question = 'What is France?';
    
    await chatInput.fill(question);
    
    const sendButton = page.getByRole('button', { name: /send|submit/i })
      .or(page.locator('button[type="submit"]'));
    await sendButton.click();
    
    // Wait a moment and check if input is cleared
    await page.waitForTimeout(1000);
    const inputValue = await chatInput.inputValue();
    expect(inputValue).toBe('');
  });
});
