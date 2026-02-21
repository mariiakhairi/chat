# Manual Test Cases - File Upload Functionality

## Test Suite: Document Chat Application - File Upload

**Test Date:** _____________  
**Tester Name:** _____________  
**Application URL:** http://localhost:3000  
**Version:** _____________

---

## 1. Single File Upload - Positive Scenarios

### TC-001: Upload Valid PDF File (Within Size Limit)
**Priority:** High  
**Preconditions:** Application is running, no documents uploaded  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone or drag-and-drop area | File picker opens | | |
| 3 | Select a valid PDF file (size < 1MB) | File is selected | | |
| 4 | Confirm the upload | Upload progress indicator appears | | |
| 5 | Wait for upload completion | Success message displayed | | |
| 6 | Verify via GET /api/documents | Uploaded PDF appears in documents list | | |
| 7 | Check file details | File name, type, and size are correct | | |

**Test Data:** `test_document.pdf` (800 KB)

---

### TC-002: Upload Valid DOCX File (Within Size Limit)
**Priority:** High  
**Preconditions:** Application is running, no documents uploaded  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select a valid DOCX file (size < 1MB) | File is selected | | |
| 4 | Confirm the upload | Upload progress indicator appears | | |
| 5 | Wait for upload completion | Success message displayed | | |
| 6 | Verify via GET /api/documents | Uploaded DOCX appears in documents list | | |
| 7 | Check file details | File name, type, and size are correct | | |

**Test Data:** `test_document.docx` (600 KB)

---

### TC-003: Upload Valid TXT File (Within Size Limit)
**Priority:** High  
**Preconditions:** Application is running, no documents uploaded  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select a valid TXT file (size < 1MB) | File is selected | | |
| 4 | Confirm the upload | Upload progress indicator appears | | |
| 5 | Wait for upload completion | Success message displayed | | |
| 6 | Verify via GET /api/documents | Uploaded TXT appears in documents list | | |
| 7 | Check file details | File name, type, and size are correct | | |

**Test Data:** `test_document.txt` (100 KB)

---

### TC-004: Upload File at Maximum Size Limit (1MB)
**Priority:** High  
**Preconditions:** Application is running, no documents uploaded  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select a PDF file exactly 1MB (1048576 bytes) | File is selected | | |
| 4 | Confirm the upload | Upload progress indicator appears | | |
| 5 | Wait for upload completion | Success message displayed | | |
| 6 | Verify via GET /api/documents | File appears in documents list | | |
| 7 | Check file can be used in chat | File content is accessible for queries | | |

**Test Data:** `max_size_document.pdf` (1048576 bytes)

---

### TC-005: Upload File with Special Characters in Filename
**Priority:** Medium  
**Preconditions:** Application is running, no documents uploaded  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select a file with special characters: `test_doc@2024 (v1).pdf` | File is selected | | |
| 4 | Confirm the upload | Upload completes successfully | | |
| 5 | Verify via GET /api/documents | File appears with correct name | | |

**Test Data:** `test_doc@2024 (v1).pdf` (500 KB)

---

## 2. Single File Upload - Negative Scenarios

### TC-006: Upload File Exceeding Size Limit (> 1MB)
**Priority:** High  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select a PDF file > 1MB (e.g., 2MB) | File is selected | | |
| 4 | Confirm the upload | Error message: "File size exceeds 1MB limit" | | |
| 5 | Verify file is not uploaded | File does NOT appear in documents list | | |
| 6 | Check API response | Appropriate error code returned (400/413) | | |

**Test Data:** `large_document.pdf` (2 MB)

---

### TC-007: Upload Unsupported File Type (JPG)
**Priority:** High  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select a JPG file | File is selected | | |
| 4 | Confirm the upload | Error message: "Unsupported file type. Only PDF, DOCX, TXT allowed" | | |
| 5 | Verify file is not uploaded | File does NOT appear in documents list | | |

**Test Data:** `image.jpg` (500 KB)

---

### TC-008: Upload Unsupported File Type (XLSX)
**Priority:** Medium  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select an XLSX file | File is selected | | |
| 4 | Confirm the upload | Error message: "Unsupported file type" | | |
| 5 | Verify file is not uploaded | File does NOT appear in documents list | | |

**Test Data:** `spreadsheet.xlsx` (300 KB)

---

### TC-009: Upload Empty File (0 KB)
**Priority:** Medium  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select an empty PDF file (0 bytes) | File is selected | | |
| 4 | Confirm the upload | Error message: "Cannot upload empty file" | | |
| 5 | Verify file is not uploaded | File does NOT appear in documents list | | |

**Test Data:** `empty_file.pdf` (0 KB)

---

### TC-010: Upload Corrupted File
**Priority:** Medium  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select a corrupted PDF file | File is selected | | |
| 4 | Confirm the upload | Error message: "File is corrupted or invalid" | | |
| 5 | Verify file is not uploaded | File does NOT appear in documents list | | |

**Test Data:** `corrupted.pdf` (500 KB, corrupted data)

---

### TC-011: Upload File with Wrong Extension
**Priority:** Medium  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select a file renamed from .txt to .pdf (actual content is TXT) | File is selected | | |
| 4 | Confirm the upload | Either uploads successfully (validates content) OR shows error | | |
| 5 | If uploaded, verify content is readable | Application handles file correctly | | |

**Test Data:** `fake_pdf.pdf` (actually a TXT file, 200 KB)

---

### TC-012: Attempt Upload Without Selecting File
**Priority:** Low  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Cancel the file picker without selecting | Upload zone returns to initial state | | |
| 4 | Verify no upload occurred | No file in documents list | | |

---

## 3. Multiple File Upload - Positive Scenarios

### TC-013: Upload Multiple Files of Different Types
**Priority:** High  
**Preconditions:** Application is running, no documents uploaded  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click on the file upload zone | File picker opens | | |
| 3 | Select 3 files: 1 PDF, 1 DOCX, 1 TXT (all < 1MB) | All 3 files are selected | | |
| 4 | Confirm the upload | Upload progress indicator for all files | | |
| 5 | Wait for upload completion | Success message for all files | | |
| 6 | Verify via GET /api/documents | All 3 files appear in documents list | | |
| 7 | Check each file details | All file names, types, sizes are correct | | |

**Test Data:**  
- `document1.pdf` (500 KB)
- `document2.docx` (400 KB)
- `document3.txt` (100 KB)

---

### TC-014: Upload Multiple Files of Same Type
**Priority:** High  
**Preconditions:** Application is running, no documents uploaded  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Upload first PDF file | File uploads successfully | | |
| 3 | Upload second PDF file | File uploads successfully | | |
| 4 | Upload third PDF file | File uploads successfully | | |
| 5 | Verify via GET /api/documents | All 3 PDF files appear in documents list | | |
| 6 | Verify all files are distinct | Each file has unique ID and can be accessed | | |

**Test Data:**  
- `report1.pdf` (600 KB)
- `report2.pdf` (700 KB)
- `report3.pdf` (800 KB)

---

### TC-015: Sequential Upload of Multiple Files
**Priority:** Medium  
**Preconditions:** Application is running, no documents uploaded  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Upload file 1, wait for completion | File 1 uploads successfully | | |
| 3 | Upload file 2, wait for completion | File 2 uploads successfully | | |
| 4 | Upload file 3, wait for completion | File 3 uploads successfully | | |
| 5 | Verify via GET /api/documents | All 3 files appear in documents list | | |
| 6 | Ask question referencing all files | Chatbot can access all uploaded documents | | |

**Test Data:** 3 different files (PDF, DOCX, TXT)

---

### TC-016: Upload Files with Duplicate Names
**Priority:** Medium  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Upload a file named `document.pdf` | File uploads successfully | | |
| 3 | Upload another file with same name `document.pdf` (different content) | File uploads successfully | | |
| 4 | Verify via GET /api/documents | Both files appear with unique IDs | | |
| 5 | Check if files are distinguishable | Files can be differentiated (ID, timestamp, or renamed) | | |

**Test Data:**  
- `document.pdf` (500 KB, content A)
- `document.pdf` (400 KB, content B)

---

## 4. Multiple File Upload - Negative Scenarios

### TC-017: Upload Multiple Files Where One Exceeds Size Limit
**Priority:** High  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Select 3 files: 2 valid (<1MB), 1 invalid (>1MB) | All files are selected | | |
| 3 | Confirm the upload | Error message for oversized file | | |
| 4 | Check which files uploaded | Only valid files upload OR all uploads fail | | |
| 5 | Verify via GET /api/documents | Only valid files (if partial upload allowed) | | |

**Test Data:**  
- `valid1.pdf` (500 KB)
- `valid2.docx` (600 KB)
- `invalid.pdf` (2 MB)

---

### TC-018: Upload Multiple Files Where One is Unsupported Type
**Priority:** High  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Select 3 files: 2 valid types, 1 invalid type (JPG) | All files are selected | | |
| 3 | Confirm the upload | Error message for unsupported file | | |
| 4 | Check which files uploaded | Only valid files upload OR all uploads fail | | |
| 5 | Verify via GET /api/documents | Only supported file types in list | | |

**Test Data:**  
- `valid1.pdf` (500 KB)
- `valid2.txt` (200 KB)
- `invalid.jpg` (300 KB)

---

### TC-019: Upload Multiple Files Exceeding Total Size Limit
**Priority:** Medium  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Upload 5 files, each 900 KB (4.5 MB total) | Files are selected | | |
| 3 | Confirm the upload | Each file validates individually against 1MB limit | | |
| 4 | Check upload result | Files upload sequentially OR in batch | | |
| 5 | Verify all files uploaded | All files appear in documents list (if no total limit) | | |

**Test Data:** 5 files × 900 KB each

**Note:** Test to determine if there's a total storage limit

---

### TC-020: Rapid Multiple Upload Requests
**Priority:** Medium  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Click upload and select file 1 | File 1 selected | | |
| 3 | Immediately start upload file 2 (don't wait for file 1) | File 2 selected | | |
| 4 | Immediately start upload file 3 | File 3 selected | | |
| 5 | Wait for all uploads to complete | All files upload successfully OR queue properly | | |
| 6 | Verify via GET /api/documents | All files present in documents list | | |
| 7 | Check for any UI/backend errors | No errors or race conditions | | |

**Test Data:** 3 different files (PDF, DOCX, TXT)

---

## 5. Edge Cases and Boundary Tests

### TC-021: Upload File with Size 1 Byte Below Limit
**Priority:** Low  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Upload file of size 1048575 bytes (1 byte below 1MB) | File uploads successfully | | |
| 3 | Verify via GET /api/documents | File appears in documents list | | |

**Test Data:** `boundary_test.pdf` (1048575 bytes)

---

### TC-022: Upload File with Size 1 Byte Above Limit
**Priority:** Low  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Upload file of size 1048577 bytes (1 byte above 1MB) | Error message: File size exceeds limit | | |
| 3 | Verify file is not uploaded | File does NOT appear in documents list | | |

**Test Data:** `boundary_test_over.pdf` (1048577 bytes)

---

### TC-023: Upload File with Very Long Filename
**Priority:** Low  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Upload file with 255 character filename | File handles correctly (uploaded or error shown) | | |
| 3 | Verify behavior | Either uploads with full name or truncated name | | |

**Test Data:** `very_long_filename_with_many_characters_to_test_the_maximum_length_supported_by_the_application_and_see_how_it_handles_extremely_long_names_that_might_cause_issues_with_storage_or_display_in_the_user_interface_continuing_to_make_this_even_longer.pdf` (255 chars, 500 KB)

---

### TC-024: Cancel Upload Mid-Process
**Priority:** Medium  
**Preconditions:** Application is running  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Navigate to http://localhost:3000 | Home page loads successfully | | |
| 2 | Start uploading a large file (close to 1MB) | Upload progress starts | | |
| 3 | Click cancel/stop during upload | Upload is cancelled | | |
| 4 | Verify via GET /api/documents | Cancelled file does NOT appear in list | | |
| 5 | Verify UI state | UI returns to ready state | | |

**Test Data:** `large_file.pdf` (950 KB)

---

### TC-025: Upload After Server Restart (Data Persistence)
**Priority:** Medium  
**Preconditions:** Application is running, files uploaded  

| Step | Action | Expected Result | Actual Result | Status |
|------|--------|-----------------|---------------|--------|
| 1 | Upload 2 files successfully | Files appear in documents list | | |
| 2 | Note the uploaded files | Files recorded | | |
| 3 | Restart the server | Server restarts successfully | | |
| 4 | Navigate to http://localhost:3000 | Application loads | | |
| 5 | Check GET /api/documents | Previously uploaded files are GONE (in-memory storage) | | |
| 6 | Verify chat history | Previous messages are also cleared | | |

**Test Data:** Any 2 valid files

**Expected:** Data loss (as per specs: in-memory storage)

---

## Test Summary Template

| Total Test Cases | Executed | Passed | Failed | Blocked | Not Executed |
|------------------|----------|--------|--------|---------|--------------|
| 25 | | | | | |

---

## Defect Log Template

| Defect ID | Test Case ID | Severity | Description | Steps to Reproduce | Expected vs Actual |
|-----------|--------------|----------|-------------|--------------------|--------------------|
| | | | | | |

---

## Notes Section

**Test Environment Details:**
- Browser: _____________
- OS: _____________
- Application Version: _____________
- API Base URL: http://localhost:3000/api

**Additional Observations:**
_____________________________________________________________________________
_____________________________________________________________________________

**Recommendations:**
_____________________________________________________________________________
_____________________________________________________________________________
