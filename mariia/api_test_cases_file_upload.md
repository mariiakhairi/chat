# API Test Cases - File Upload

## Endpoint: POST /api/upload
**Content-Type:** multipart/form-data  
**Base URL:** http://localhost:3000

---

## Positive Test Cases

1. **Upload valid PDF file (< 1MB)**
   - Send POST request with valid PDF file (800 KB)
   - Verify: 200/201 status code, success response with document ID
   - Verify: GET /api/documents returns uploaded file

2. **Upload valid DOCX file (< 1MB)**
   - Send POST request with valid DOCX file (600 KB)
   - Verify: 200/201 status code, success response with document ID
   - Verify: GET /api/documents returns uploaded file

3. **Upload valid TXT file (< 1MB)**
   - Send POST request with valid TXT file (100 KB)
   - Verify: 200/201 status code, success response with document ID
   - Verify: GET /api/documents returns uploaded file

4. **Upload file at exact size limit (1MB = 1048576 bytes)**
   - Send POST request with file exactly 1MB
   - Verify: 200/201 status code, successful upload
   - Verify: File appears in GET /api/documents

5. **Upload file with special characters in filename**
   - Send POST request with filename: `test_doc@2024 (v1).pdf`
   - Verify: 200/201 status code, filename preserved correctly
   - Verify: GET /api/documents shows correct filename

6. **Upload multiple files sequentially**
   - Send 3 separate POST requests with different files
   - Verify: Each returns 200/201 status code
   - Verify: GET /api/documents returns all 3 files

7. **Upload files with duplicate filenames**
   - Upload file named `document.pdf` twice (different content)
   - Verify: Both uploads succeed with unique IDs
   - Verify: GET /api/documents shows both files with unique identifiers

8. **Upload file with UTF-8 characters in filename**
   - Upload file: `документ_тест.pdf` or `文档.pdf`
   - Verify: 200/201 status code, filename handled correctly
   - Verify: File accessible in documents list

9. **Verify uploaded file metadata**
   - Upload valid file
   - Verify response contains: file ID, filename, file size, file type, upload timestamp

10. **Upload and retrieve document list**
    - Upload 3 different files (PDF, DOCX, TXT)
    - Call GET /api/documents
    - Verify: All 3 files returned with correct metadata

---

## Negative Test Cases

11. **Upload file exceeding size limit (> 1MB)**
    - Send POST request with 2MB PDF file
    - Verify: 400 or 413 status code
    - Verify: Error message indicates file size exceeded
    - Verify: File NOT in GET /api/documents

12. **Upload file 1 byte over limit (1048577 bytes)**
    - Send POST request with file of 1048577 bytes
    - Verify: 400 or 413 status code
    - Verify: Error response with size limit message
    - Verify: File NOT uploaded

13. **Upload unsupported file type (JPG)**
    - Send POST request with JPG image file
    - Verify: 400 or 415 status code
    - Verify: Error message indicates unsupported file type
    - Verify: File NOT in GET /api/documents

14. **Upload unsupported file type (XLSX)**
    - Send POST request with Excel file
    - Verify: 400 or 415 status code
    - Verify: Error indicates only PDF, DOCX, TXT supported

15. **Upload unsupported file type (MP4)**
    - Send POST request with video file
    - Verify: 400 or 415 status code
    - Verify: Appropriate error message

16. **Upload empty file (0 bytes)**
    - Send POST request with 0-byte file
    - Verify: 400 status code
    - Verify: Error message about empty file
    - Verify: File NOT uploaded

17. **Upload without file attachment**
    - Send POST request with empty multipart form
    - Verify: 400 status code
    - Verify: Error message: "No file provided" or similar

18. **Upload with missing multipart boundary**
    - Send malformed multipart request
    - Verify: 400 status code
    - Verify: Error response for malformed request

19. **Upload corrupted PDF file**
    - Send POST request with corrupted PDF data
    - Verify: 400 or 422 status code (or 200 if validation is minimal)
    - Verify: Error indicates corrupted/invalid file

20. **Upload with incorrect Content-Type header**
    - Send file as application/json instead of multipart/form-data
    - Verify: 400 or 415 status code
    - Verify: Error about incorrect content type

21. **Upload with missing file field name**
    - Send multipart request with incorrect field name
    - Verify: 400 status code
    - Verify: Error about missing required field

22. **Upload with SQL injection in filename**
    - Upload file named: `'; DROP TABLE documents; --.pdf`
    - Verify: File uploads safely without executing SQL
    - Verify: Filename sanitized or rejected

23. **Upload with path traversal in filename**
    - Upload file named: `../../etc/passwd.pdf`
    - Verify: Filename sanitized, path traversal prevented
    - Verify: File stored safely without directory traversal

24. **Upload with extremely long filename (> 255 characters)**
    - Upload file with 300+ character filename
    - Verify: Either 400 error OR filename truncated
    - Verify: System handles gracefully

25. **Upload with null bytes in filename**
    - Upload file with null bytes: `test\0file.pdf`
    - Verify: Filename sanitized or rejected
    - Verify: No security vulnerabilities

---

## Boundary Test Cases

26. **Upload file at 1 byte below limit (1048575 bytes)**
    - Send POST request with 1048575 byte file
    - Verify: 200/201 status code, successful upload
    - Verify: File in documents list

27. **Upload file at exactly 0.5 MB**
    - Send POST request with 524288 byte file
    - Verify: 200/201 status code, successful upload

28. **Upload file at exactly 1 KB**
    - Send POST request with 1024 byte file
    - Verify: 200/201 status code, successful upload

---

## Concurrent/Performance Test Cases

29. **Upload 5 files in parallel**
    - Send 5 POST requests simultaneously
    - Verify: All return 200/201 status code
    - Verify: All files appear in GET /api/documents
    - Verify: No race conditions or data corruption

30. **Upload same file twice simultaneously**
    - Send 2 identical POST requests at same time
    - Verify: Both succeed with unique IDs OR proper conflict handling
    - Verify: Both files in documents list with unique identifiers

31. **Rapid sequential uploads (stress test)**
    - Upload 10 files in rapid succession (< 1 second apart)
    - Verify: All uploads succeed
    - Verify: All files retrievable via GET /api/documents

32. **Upload during server high load**
    - Generate load on server
    - Attempt file upload
    - Verify: Either succeeds OR returns appropriate 503 status

---

## Integration Test Cases

33. **Upload file then use in chat**
    - POST /api/upload with document
    - POST /api/chat with question about document
    - Verify: Chat response references uploaded document

34. **Upload file then delete it**
    - POST /api/upload with document
    - GET document ID from response
    - DELETE /api/documents/:id
    - Verify: 200 status code
    - Verify: File removed from GET /api/documents

35. **Upload multiple files then delete all**
    - Upload 3 files via POST /api/upload
    - DELETE /api/documents (clear all)
    - Verify: GET /api/documents returns empty array

36. **Upload, verify in documents list, then retrieve specific document**
    - POST /api/upload with file
    - GET /api/documents and verify file present
    - Attempt to GET specific document details (if endpoint exists)

37. **Upload after clearing all documents**
    - DELETE /api/documents (clear all)
    - POST /api/upload with new file
    - Verify: Upload succeeds, file has ID 1 or unique ID

---

## Authentication/Authorization Test Cases (if applicable)

38. **Upload without authentication header (if auth required)**
    - Send POST request without auth token
    - Verify: 401 Unauthorized status code

39. **Upload with invalid authentication token**
    - Send POST request with invalid/expired token
    - Verify: 401 or 403 status code

40. **Upload with valid authentication**
    - Send POST request with valid auth token
    - Verify: 200/201 status code, successful upload

---

## Error Handling Test Cases

41. **Upload when server storage is full (if applicable)**
    - Fill server storage
    - Attempt upload
    - Verify: 507 Insufficient Storage or appropriate error

42. **Upload with timeout simulation**
    - Simulate network timeout during upload
    - Verify: Appropriate timeout error
    - Verify: Partial upload not saved

43. **Upload with connection interruption**
    - Start upload, interrupt connection mid-transfer
    - Verify: Upload fails gracefully
    - Verify: No corrupted files saved

44. **Verify error response format**
    - Trigger any error scenario
    - Verify: Error response has consistent structure (message, code, etc.)
    - Verify: Error messages are informative, not exposing sensitive info

45. **Upload same file twice with different multipart field names**
    - Upload with field name "file"
    - Upload with field name "document"
    - Verify: Consistent behavior (both work OR both fail with clear message)

---

## Response Validation Test Cases

46. **Verify successful upload response structure**
    - Upload valid file
    - Verify response JSON contains: success flag, document ID, filename, size, type
    - Verify response headers include correct Content-Type

47. **Verify error response structure**
    - Upload invalid file
    - Verify error response contains: error flag, error message, error code
    - Verify HTTP status code matches error type

48. **Verify GET /api/documents response after upload**
    - Upload 2 files
    - GET /api/documents
    - Verify: Array of documents, each with ID, filename, size, type, timestamp

49. **Verify document ID format**
    - Upload file
    - Check document ID in response
    - Verify: ID is unique, follows expected format (UUID, integer, etc.)

50. **Verify file size calculation accuracy**
    - Upload file of known size (e.g., 500,000 bytes)
    - Verify: Response shows exact file size
    - Verify: GET /api/documents shows same size

---

## Test Execution Notes

**Total Test Cases:** 50
- Positive: 10
- Negative: 16
- Boundary: 3
- Concurrent/Performance: 4
- Integration: 5
- Authentication: 3 (if applicable)
- Error Handling: 5
- Response Validation: 5

**Test Tools:**
- Postman / Insomnia
- cURL commands
- REST API automation frameworks (REST Assured, Axios, etc.)
- API testing tools (Newman, Pytest, etc.)

**Prerequisites:**
- Server running at http://localhost:3000
- Test files prepared (various sizes, types)
- API documentation available
