import {
  ApiTestClient,
  createTextFile,
} from '../../helpers/api-test-utils';

describe('API Tests - Document Deletion', () => {
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

  test('DELETE /api/documents/:id removes specific document', async () => {
    // Upload multiple documents
    const response1 = await apiClient.uploadFile(createTextFile('keep1.txt'));
    const response2 = await apiClient.uploadFile(createTextFile('delete.txt'));
    const response3 = await apiClient.uploadFile(createTextFile('keep2.txt'));

    const idToDelete = response2.data.document.id;

    // Delete the middle document
    const deleteResponse = await apiClient.deleteDocument(idToDelete);
    
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.data.success).toBe(true);

    // Verify only 2 documents remain
    const documentsResponse = await apiClient.getDocuments();
    expect(documentsResponse.data.documents).toHaveLength(2);
    
    const remainingIds = documentsResponse.data.documents.map((doc: any) => doc.id);
    expect(remainingIds).not.toContain(idToDelete);
    expect(remainingIds).toContain(response1.data.document.id);
    expect(remainingIds).toContain(response3.data.document.id);
  });

  test('DELETE /api/documents/:id with non-existent id', async () => {
    const deleteResponse = await apiClient.deleteDocument('non-existent-id');
    
    // Should succeed (idempotent) or return 404
    expect([200, 404]).toContain(deleteResponse.status);
  });

  test('DELETE /api/documents clears all documents', async () => {
    // Upload multiple documents
    await apiClient.uploadFile(createTextFile('file1.txt'));
    await apiClient.uploadFile(createTextFile('file2.txt'));
    await apiClient.uploadFile(createTextFile('file3.txt'));

    const beforeClear = await apiClient.getDocuments();
    expect(beforeClear.data.documents).toHaveLength(3);

    // Clear all
    const clearResponse = await apiClient.clearAllDocuments();
    
    expect(clearResponse.status).toBe(200);
    expect(clearResponse.data.success).toBe(true);

    // Verify all cleared
    const afterClear = await apiClient.getDocuments();
    expect(afterClear.data.documents).toHaveLength(0);
  });

  test('DELETE /api/documents when no documents exist', async () => {
    const clearResponse = await apiClient.clearAllDocuments();
    
    expect(clearResponse.status).toBe(200);
    expect(clearResponse.data.success).toBe(true);

    // Verify still empty
    const documentsResponse = await apiClient.getDocuments();
    expect(documentsResponse.data.documents).toHaveLength(0);
  });
});
