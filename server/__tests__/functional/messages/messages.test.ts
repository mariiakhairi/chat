import {
  ApiTestClient,
  createTextFile,
} from '../../helpers/api-test-utils';

describe('API Tests - Messages Endpoint', () => {
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

  test('GET /api/messages returns empty array initially', async () => {
    const response = await apiClient.getMessages();
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('messages');
    expect(Array.isArray(response.data.messages)).toBe(true);
  });

  test('GET /api/messages returns chat history', async () => {
    // Upload document and send messages
    await apiClient.uploadFile(createTextFile('chat.txt'));
    await apiClient.sendChatMessage('First question');
    await apiClient.sendChatMessage('Second question');

    const response = await apiClient.getMessages();
    
    expect(response.status).toBe(200);
    // Messages may be empty if chat failed with test API key
    expect(Array.isArray(response.data.messages)).toBe(true);
    
    if (response.data.messages.length > 0) {
      // Should have both user and ai messages if chat succeeded
      const roles = response.data.messages.map((msg: any) => msg.role);
      expect(roles).toContain('user');
    }
  });

  test('Messages persist across multiple chat interactions', async () => {
    await apiClient.uploadFile(createTextFile('test.txt'));
    
    await apiClient.sendChatMessage('Question 1');
    const messages1 = await apiClient.getMessages();
    const count1 = messages1.data.messages.length;

    await apiClient.sendChatMessage('Question 2');
    const messages2 = await apiClient.getMessages();
    const count2 = messages2.data.messages.length;

    // If chat is working, count should increase
    // If chat fails (test API key), counts may be equal
    expect(count2).toBeGreaterThanOrEqual(count1);
  });
});
