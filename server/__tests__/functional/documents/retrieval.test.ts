import {
  ApiTestClient,
  createTextFile,
} from '../../helpers/api-test-utils';

describe('API Tests - Document Retrieval', () => {
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

  test('GET /api/documents returns empty array when no documents', async () => {
    const response = await apiClient.getDocuments();
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('documents');
    expect(response.data.documents).toEqual([]);
  });

  test('GET /api/documents returns all uploaded documents', async () => {
    const files = [
      createTextFile('doc1.txt'),
      createTextFile('doc2.txt'),
      createTextFile('doc3.txt'),
    ];

    for (const file of files) {
      await apiClient.uploadFile(file);
    }

    const response = await apiClient.getDocuments();
    
    expect(response.status).toBe(200);
    expect(response.data.documents).toHaveLength(3);
    
    const names = response.data.documents.map((doc: any) => doc.name);
    expect(names).toContain('doc1.txt');
    expect(names).toContain('doc2.txt');
    expect(names).toContain('doc3.txt');
  });

  test('GET /api/documents does not include document content', async () => {
    const file = createTextFile('content-test.txt');
    await apiClient.uploadFile(file);

    const response = await apiClient.getDocuments();
    
    expect(response.status).toBe(200);
    expect(response.data.documents).toHaveLength(1);
    
    const doc = response.data.documents[0];
    expect(doc).not.toHaveProperty('content');
    expect(doc).toHaveProperty('id');
    expect(doc).toHaveProperty('name');
    expect(doc).toHaveProperty('size');
    expect(doc).toHaveProperty('type');
  });
});
