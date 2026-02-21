import '@testing-library/jest-dom';

// Set up test environment variables for Gemini API
// Use real API key if available, otherwise use test-key (matches npm scripts)
if (!process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = 'test-key';
}
