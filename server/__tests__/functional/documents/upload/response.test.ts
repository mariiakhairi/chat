import {
  ApiTestClient,
  createTextFile,
} from '../../../helpers/api-test-utils';

describe('API Tests - File Upload - Response Validation', () => {
  let apiClient: ApiTestClient;

  beforeAll(async () => {
    apiClient = new ApiTestClient();
    await apiClient.startServer();
  });

  afterAll(async () => {
    await apiClient.stopServer();
  });

  afterEach(async () => {
    // Clean up documents after each test
    await apiClient.clearAllDocuments();
  });

  test('TC46: Verify successful upload response structure', async () => {
    const file = createTextFile('response-test.txt');
    const response = await apiClient.uploadFile(file);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.data).toHaveProperty('success');
    expect(response.data).toHaveProperty('document');
    expect(response.data.document).toHaveProperty('id');
    expect(response.data.document).toHaveProperty('name');
    expect(response.data.document).toHaveProperty('size');
    expect(response.data.document).toHaveProperty('type');
    expect(response.data.success).toBe(true);
  });

  test('TC47: Verify error response structure', async () => {
    // Test with missing file instead to get JSON error
    const response = await apiClient.client.post('/api/upload', {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.data).toHaveProperty('error');
    expect(typeof response.data.error).toBe('string');
    expect(response.data.error.length).toBeGreaterThan(0);
  });

  test('TC48: Verify GET /api/documents response after upload', async () => {
    await apiClient.uploadFile(createTextFile('doc1.txt'));
    await apiClient.uploadFile(createTextFile('doc2.txt'));

    const response = await apiClient.getDocuments();

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('documents');
    expect(Array.isArray(response.data.documents)).toBe(true);
    expect(response.data.documents).toHaveLength(2);
    
    response.data.documents.forEach((doc: any) => {
      expect(doc).toHaveProperty('id');
      expect(doc).toHaveProperty('name');
      expect(doc).toHaveProperty('size');
      expect(doc).toHaveProperty('type');
      // Content should not be included in the list
      expect(doc).not.toHaveProperty('content');
    });
  });

  test('TC49: Verify document ID format', async () => {
    const file = createTextFile('id-test.txt');
    const response = await apiClient.uploadFile(file);

    expect(response.status).toBe(200);
    expect(response.data.document.id).toBeDefined();
    expect(typeof response.data.document.id).toBe('string');
    expect(response.data.document.id.length).toBeGreaterThan(0);
  });

  test('TC50: Verify file size calculation accuracy', async () => {
    const exactSize = 500000;
    const file = createTextFile('size-test.txt', exactSize);
    const response = await apiClient.uploadFile(file);

    expect(response.status).toBe(200);
    expect(response.data.document.size).toBe(exactSize);

    // Verify in documents list
    const documentsResponse = await apiClient.getDocuments();
    const uploadedDoc = documentsResponse.data.documents.find(
      (doc: any) => doc.name === 'size-test.txt'
    );
    expect(uploadedDoc.size).toBe(exactSize);
  });
});
