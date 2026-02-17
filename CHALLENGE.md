# SDET Challenge - Document Chat Application

## Overview

Your task is to create a comprehensive test automation pipeline for a Document Chat Application. This application allows users to upload documents (PDF, DOCX, TXT) and ask questions about their content using Google's Gemini AI.

## Application Details

- **Frontend**: React application served at `http://localhost:3000`
- **Backend**: Express.js REST API
- **AI Model**: Google Gemini 2.5 Flash
- **Supported Files**: PDF, DOCX, TXT (max 1MB per file)
- **Storage**: In-memory (data clears on server restart)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload a document (multipart/form-data) |
| POST | `/api/chat` | Send a question and get AI response |
| GET | `/api/messages` | Retrieve chat history |
| GET | `/api/documents` | Get list of uploaded documents |
| DELETE | `/api/documents/:id` | Remove a specific document |
| DELETE | `/api/documents` | Clear all documents |

## Requirements

### 1. Run the Application
- Follow the instructions in the `README.md` to set up and run the application
- Ensure the frontend is accessible at `http://localhost:3000`

### 2. Automate File Upload
- Automate the process of uploading files to the application
- Implement automation scripts for:
  - Single file upload
  - Multiple file uploads
- Test using both API and UI approaches
- Verify all supported file types (PDF, DOCX, TXT)

### 3. Verify File Upload Completion
- Confirm the application processes and completes the file upload
- Verify uploaded documents appear in the documents list (`GET /api/documents`)

### 4. Test Chat Functionality
- Open the chat interface and verify it loads correctly
- Verify the chat is ready to receive input
- Send different types of messages to the chatbot

### 5. Ask Questions Based on Uploaded Documents
- Upload a document with known content
- Ask at least 5 questions related to the document content
- Examples:
  - General content questions
  - Specific detail queries
  - Questions about concepts mentioned in the document

### 6. Verify AI Responses
- Validate that the chatbot provides relevant answers based on document content
- Ensure responses are accurate and contextually appropriate
- Verify the chatbot handles questions about non-existent content gracefully

### 7. Test Pipeline with Visualization
- Create a test pipeline that can run consistently
- Integrate a test result visualization tool (e.g., Allure, Playwright Report, or similar)
- Provide clear, readable reports of test results

### 8. Documentation
Include a `README.md` in your test project that explains:
- How to run the tests locally
- Test framework and tools used
- Advantages and disadvantages of your chosen approach
- Description of any bugs found during testing (with reproduction steps)

## Bonus

- Run the test pipeline inside Docker
- Implement parallel test execution
- Add performance/load testing for the upload and chat endpoints
- Integrate with a CI/CD pipeline (GitHub Actions, etc.)

## Evaluation Criteria

- Test pipeline structure and organization
- Test coverage (API, UI, edge cases)
- Code maintainability, extensibility, and clarity
- Error handling and reporting quality
- Documentation completeness

## Duration

2 days

## Submission

Send a link to a public Git repository containing your test automation code.
