import {
  ApiTestClient,
  createTextFile,
} from '../../helpers/api-test-utils';

describe('API Tests - Error Handling', () => {
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

  test('Invalid endpoint returns 404', async () => {
    const response = await apiClient.client.get('/api/invalid-endpoint');
    
    expect(response.status).toBe(404);
  });

  test('POST to GET-only endpoint returns error', async () => {
    const response = await apiClient.client.post('/api/documents', {});
    
    // Should return method not allowed or 404
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('Server handles concurrent document operations', async () => {
    // Upload files concurrently
    const uploadPromises = [
      apiClient.uploadFile(createTextFile('concurrent1.txt')),
      apiClient.uploadFile(createTextFile('concurrent2.txt')),
      apiClient.uploadFile(createTextFile('concurrent3.txt')),
    ];

    const uploadResponses = await Promise.all(uploadPromises);
    
    uploadResponses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // Get documents and delete concurrently
    const documentsResponse = await apiClient.getDocuments();
    expect(documentsResponse.data.documents).toHaveLength(3);

    const deletePromises = documentsResponse.data.documents.map((doc: any) =>
      apiClient.deleteDocument(doc.id)
    );

    const deleteResponses = await Promise.all(deletePromises);
    
    deleteResponses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // Verify all deleted
    const finalDocuments = await apiClient.getDocuments();
    expect(finalDocuments.data.documents).toHaveLength(0);
  });
});
