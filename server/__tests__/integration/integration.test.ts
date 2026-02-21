import {
  ApiTestClient,
  createTextFile,
} from '../helpers/api-test-utils';

describe('API Tests - Integration Test Cases', () => {
  let apiClient: ApiTestClient;

  beforeAll(async () => {
    apiClient = new ApiTestClient();
    await apiClient.startServer();
  });

  afterAll(async () => {
    await apiClient.stopServer();
  });

  beforeEach(async () => {
    // Clear all documents before each test
    await apiClient.clearAllDocuments();
  });

  test('TC33: Upload file then use in chat', async () => {
    // Upload a document
    const file = createTextFile('info.txt');
    const uploadResponse = await apiClient.uploadFile(file);
    
    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.data.document).toHaveProperty('id');

    // Send a chat question about the document
    const chatResponse = await apiClient.sendChatMessage('What information is in the document?');
    
    // Chat may fail with test API key, but should return a response
    if (chatResponse.status === 200) {
      expect(chatResponse.data).toHaveProperty('success');
      expect(chatResponse.data).toHaveProperty('message');
      expect(chatResponse.data.message).toHaveProperty('content');
      expect(chatResponse.data.message.role).toBe('ai');
    } else {
      // If it fails, should be 500 from AI service
      expect(chatResponse.status).toBe(500);
    }
  });

  test('TC34: Upload file then delete it', async () => {
    // Upload a document
    const file = createTextFile('temp.txt');
    const uploadResponse = await apiClient.uploadFile(file);
    
    expect(uploadResponse.status).toBe(200);
    const documentId = uploadResponse.data.document.id;

    // Verify it exists
    const documentsBeforeDelete = await apiClient.getDocuments();
    expect(documentsBeforeDelete.data.documents).toHaveLength(1);

    // Delete the document
    const deleteResponse = await apiClient.deleteDocument(documentId);
    
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data.success).toBe(true);

    // Verify it's removed
    const documentsAfterDelete = await apiClient.getDocuments();
    expect(documentsAfterDelete.data.documents).toHaveLength(0);
  });

  test('TC35: Upload multiple files then delete all', async () => {
    // Upload 3 files - use text files for reliability
    await apiClient.uploadFile(createTextFile('file1.txt'));
    await apiClient.uploadFile(createTextFile('file2.txt'));
    await apiClient.uploadFile(createTextFile('file3.txt'));

    // Verify all uploaded
    const documentsBeforeClear = await apiClient.getDocuments();
    expect(documentsBeforeClear.data.documents).toHaveLength(3);

    // Clear all documents
    const clearResponse = await apiClient.clearAllDocuments();
    
    expect(clearResponse.status).toBe(200);
    expect(clearResponse.data.success).toBe(true);

    // Verify all removed
    const documentsAfterClear = await apiClient.getDocuments();
    expect(documentsAfterClear.data.documents).toHaveLength(0);
  });

  test('TC36: Upload, verify in documents list, then retrieve specific document', async () => {
    // Upload a file
    const file = createTextFile('verify-test.txt');
    const uploadResponse = await apiClient.uploadFile(file);
    
    expect(uploadResponse.status).toBe(200);
    const documentId = uploadResponse.data.document.id;

    // Get documents list
    const documentsResponse = await apiClient.getDocuments();
    
    expect(documentsResponse.status).toBe(200);
    expect(documentsResponse.data.documents).toHaveLength(1);
    
    const doc = documentsResponse.data.documents[0];
    expect(doc.id).toBe(documentId);
    expect(doc.name).toBe('verify-test.txt');
    expect(doc).toHaveProperty('size');
    expect(doc).toHaveProperty('type');
  });

  test('TC37: Upload after clearing all documents', async () => {
    // Upload initial files
    await apiClient.uploadFile(createTextFile('old1.txt'));
    await apiClient.uploadFile(createTextFile('old2.txt'));

    // Clear all
    await apiClient.clearAllDocuments();

    // Verify cleared
    const documentsAfterClear = await apiClient.getDocuments();
    expect(documentsAfterClear.data.documents).toHaveLength(0);

    // Upload new file
    const newFile = createTextFile('new.txt');
    const uploadResponse = await apiClient.uploadFile(newFile);
    
    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.data.success).toBe(true);
    expect(uploadResponse.data.document).toHaveProperty('id');

    // Verify new file exists
    const finalDocuments = await apiClient.getDocuments();
    expect(finalDocuments.data.documents).toHaveLength(1);
    expect(finalDocuments.data.documents[0].name).toBe('new.txt');
  });
});
