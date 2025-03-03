import { assertEquals, assertExists, assertGreater } from '$std/assert/mod.ts';
import { randomUUID } from 'node:crypto';
import { TestEnvLayer } from '../../../src/infrastructure/layer/EnvLayer.ts';
import { User } from '../../../src/domain/user/User.ts';
import { createTestServer } from '../../helper/TestServer.ts';

let baseUrl: string;
let server: ReturnType<typeof Deno.serve>;

function createGetUserUrl(userId = randomUUID()) {
  const url = new URL('/api', baseUrl);
  url.searchParams.set('type', 'GetUser');
  url.searchParams.set('userId', userId);
  return url.toString();
}

Deno.test('GetUser Integration', {
  sanitizeResources: false,
  sanitizeOps: false,
}, async (t) => {
  await t.step('setup', async () => {
    const result = await createTestServer(TestEnvLayer);
    baseUrl = result.baseUrl;
    server = result.server;
  });

  await t.step('should get user successfully', async () => {
    const userId = randomUUID();
    const user = User.make({
      id: userId,
      name: 'Test User',
      email: 'test@email.com',
      createdAt: new Date(),
    });

    const response = await fetch(createGetUserUrl(userId), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    assertEquals(response.status, 200);
    const result = await response.json();
    assertExists(result);
    // assertEquals(result.id, user.id);
    assertEquals(result.name, user.name);
    assertEquals(result.email, user.email);
    assertGreater(new Date(result.createdAt), user.createdAt);
  });

  await t.step('should handle non-existent user', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const response = await fetch(createGetUserUrl(nonExistentId), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    assertEquals(response.status, 404);
    const error = await response.json();
    assertEquals(error.error, `User not found with ID: ${nonExistentId}`);
  });

  await t.step('cleanup', async () => {
    await server.shutdown();
  });
});
