import {
  ApiTestClient,
  createTextFile,
  createTestFile,
} from '../../../helpers/api-test-utils';

describe('API Tests - File Upload - Concurrent Cases', () => {
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

  test('TC29: Upload 5 files in parallel', async () => {
    const files = [
      createTextFile('file1.txt'),
      createTextFile('file2.txt'),
      createTextFile('file3.txt'),
      createTextFile('file4.txt'),
      createTextFile('file5.txt'),
    ];

    const uploadPromises = files.map(file => apiClient.uploadFile(file));
    const responses = await Promise.all(uploadPromises);

    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    // Verify all files uploaded
    const documentsResponse = await apiClient.getDocuments();
    expect(documentsResponse.data.documents).toHaveLength(5);

    // Verify unique IDs
    const ids = documentsResponse.data.documents.map((doc: any) => doc.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);
  });

  test('TC30: Upload same file twice simultaneously', async () => {
    const file1 = createTestFile('duplicate.txt', 'content', 'text/plain');
    const file2 = createTestFile('duplicate.txt', 'content', 'text/plain');

    const [response1, response2] = await Promise.all([
      apiClient.uploadFile(file1),
      apiClient.uploadFile(file2),
    ]);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response1.data.document.id).not.toBe(response2.data.document.id);

    // Verify both files exist
    const documentsResponse = await apiClient.getDocuments();
    expect(documentsResponse.data.documents).toHaveLength(2);
  });

  test('TC31: Rapid sequential uploads (stress test)', async () => {
    const files = Array.from({ length: 10 }, (_, i) => createTextFile(`file${i}.txt`));
    
    const responses = [];
    for (const file of files) {
      const response = await apiClient.uploadFile(file);
      responses.push(response);
    }

    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    // Verify all files uploaded
    const documentsResponse = await apiClient.getDocuments();
    expect(documentsResponse.data.documents).toHaveLength(10);
  });
});
