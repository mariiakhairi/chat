import {
  ApiTestClient,
  createTextFile,
} from '../../../helpers/api-test-utils';

describe('API Tests - File Upload - Boundary Cases', () => {
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

  test('TC26: Upload file at 1 byte below limit (1048575 bytes)', async () => {
    const file = createTextFile('below-limit.txt', 1048575);
    const response = await apiClient.uploadFile(file);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.document.size).toBe(1048575);

    // Verify file uploaded
    const documentsResponse = await apiClient.getDocuments();
    expect(documentsResponse.data.documents).toHaveLength(1);
  });

  test('TC27: Upload file at exactly 0.5 MB', async () => {
    const file = createTextFile('half-mb.txt', 524288);
    const response = await apiClient.uploadFile(file);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.document.size).toBe(524288);
  });

  test('TC28: Upload file at exactly 1 KB', async () => {
    const file = createTextFile('one-kb.txt', 1024);
    const response = await apiClient.uploadFile(file);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.document.size).toBe(1024);
  });
});
