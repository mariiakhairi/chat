# SDET Challenge Tasks Summary

## Core Requirements

### Task 1: Application Setup
- [ ] Follow README.md instructions to set up the application
- [ ] Verify frontend is accessible at http://localhost:3000
- [ ] Ensure backend API is running properly

### Task 2: File Upload Automation
- [ ] Automate single file upload
- [ ] Automate multiple file uploads
- [ ] Test via API approach
- [ ] Test via UI approach
- [ ] Verify all file types: PDF, DOCX, TXT

### Task 3: Upload Verification
- [ ] Confirm file upload processing completes
- [ ] Verify uploaded documents in GET /api/documents
- [ ] Validate document metadata

### Task 4: Chat Interface Testing
- [ ] Verify chat interface loads correctly
- [ ] Confirm chat is ready to receive input
- [ ] Test sending different message types

### Task 5: Document-Based Q&A Testing
- [ ] Upload document with known content
- [ ] Ask at least 5 questions related to document
- [ ] Test general content questions
- [ ] Test specific detail queries
- [ ] Test concept-based questions

### Task 6: AI Response Validation
- [ ] Validate responses are relevant to document content
- [ ] Verify accuracy and contextual appropriateness
- [ ] Test handling of questions about non-existent content
- [ ] Verify graceful error handling

### Task 7: Test Pipeline & Reporting
- [ ] Create consistent test pipeline
- [ ] Integrate visualization tool (Allure/Playwright Report)
- [ ] Generate clear, readable test reports
- [ ] Ensure tests can run consistently

### Task 8: Documentation
- [ ] Create README.md for test project
- [ ] Document how to run tests locally
- [ ] Explain test framework and tools used
- [ ] List advantages/disadvantages of approach
- [ ] Document any bugs found with reproduction steps

## Bonus Tasks

- [ ] Run test pipeline inside Docker
- [ ] Implement parallel test execution
- [ ] Add performance/load testing for upload endpoint
- [ ] Add performance/load testing for chat endpoint
- [ ] Integrate with CI/CD pipeline (GitHub Actions, etc.)

## API Endpoints to Test

- POST /api/upload - Upload document
- POST /api/chat - Send question and get AI response
- GET /api/messages - Retrieve chat history
- GET /api/documents - Get uploaded documents list
- DELETE /api/documents/:id - Remove specific document
- DELETE /api/documents - Clear all documents

## Deliverables

- Test automation code in public Git repository
- README with setup and execution instructions
- Test reports with visualization
- Bug documentation (if any found)

## Timeline

**Duration:** 2 days
