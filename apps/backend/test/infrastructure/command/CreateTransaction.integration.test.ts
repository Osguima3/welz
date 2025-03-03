import { assertEquals, assertExists, assertStringIncludes } from '$std/assert/mod.ts';
import { TestEnvLayer } from '../../../src/infrastructure/layer/EnvLayer.ts';
import { createTestServer } from '../../helper/TestServer.ts';
import { createTestCreateTransactionCommand } from '../../helper/TestCommands.ts';

let baseUrl: string;
let server: ReturnType<typeof Deno.serve>;

async function fetchResponse(data: unknown) {
  return await fetch(`${baseUrl}/api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

Deno.test('CreateTransaction Integration', {
  sanitizeResources: false,
  sanitizeOps: false,
}, async (t) => {
  await t.step('setup', async () => {
    const result = await createTestServer(TestEnvLayer);
    baseUrl = result.baseUrl;
    server = result.server;
  });

  await t.step('should create transaction successfully', async () => {
    const transaction = createTestCreateTransactionCommand();

    const response = await fetchResponse(transaction);

    assertEquals(response.status, 201);

    const result = await response.json();
    assertExists(result.id);
    assertEquals(result.accountId, transaction.accountId);
    assertEquals(result.amount.currency, transaction.amount.currency);
    assertEquals(result.description, transaction.description);
  });

  await t.step('should handle invalid transaction data', async () => {
    const invalidTransaction = {
      type: 'CreateTransaction',
      // Missing required fields
    };

    const response = await fetchResponse(invalidTransaction);

    assertEquals(response.status, 400);

    const error = await response.json();
    assertEquals(error.error, 'Invalid Request');
    assertStringIncludes(error.details, 'accountId');
    assertStringIncludes(error.details, 'is missing');
  });

  await t.step('cleanup', async () => {
    await server?.shutdown();
  });
});
