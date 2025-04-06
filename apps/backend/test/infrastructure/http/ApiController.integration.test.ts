import { assertEquals } from '$std/assert/mod.ts';
import { UUID } from '@shared/schema/UUID.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { ApiController } from '../../../src/infrastructure/http/ApiController.ts';
import { LocalEnvLayer } from '../../../src/infrastructure/layer/EnvLayer.ts';
import TestCommands from '../../helper/TestCommands.ts';
import { TestDataHelper } from '../../helper/TestDataHelper.ts';
import TestQueries from '../../helper/TestQueries.ts';
import { createTestServer, TestServer } from '../../helper/TestServer.ts';

Deno.test('ApiController integration', {
  sanitizeResources: false,
}, async (t) => {
  let transactionId: UUID;
  const accountId = randomUUID();

  let testDataHelper: Effect.Effect.Success<typeof TestDataHelper>;
  let server: TestServer;
  let app: (req: Request) => Promise<Response>;

  await t.step('setup', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        testDataHelper = yield* TestDataHelper;
        app = yield* ApiController;
      }).pipe(
        Effect.provide(LocalEnvLayer),
      ),
    );

    server = await createTestServer(app);
    await testDataHelper.createAccount(accountId);
    for (let i = 0; i < 10; i++) {
      await testDataHelper.createTransaction(randomUUID(), accountId);
    }
  });

  await t.step('should execute commands successfully', async () => {
    const transaction = TestCommands.createTransactionRequest(accountId);

    const response = await server.fetchResponse('POST', transaction);
    const result = await response.json();

    const ignoredFields = {
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      type: undefined,
      date: undefined,
      categoryId: undefined,
    };
    assertEquals({ ...result, ...ignoredFields }, { ...transaction, ...ignoredFields });
    assertEquals(response.status, 201);

    transactionId = result.id;
  });

  await t.step('should execute queries successfully', async () => {
    const query = TestQueries.getTransactionsRequest({ accountId, page: '3', pageSize: '5' });

    const response = await server.fetchResponse('GET', query);
    const result = await response.json();

    assertEquals(response.status, 200);
    assertEquals(result.items.length, 1);
    assertEquals(result.page, 3);
    assertEquals(result.pageSize, 5);
    assertEquals(result.total, 11);
    assertEquals(result.items[0].id, transactionId);
  });

  await t.step('should handle invalid command body', async () => {
    const response = await server.fetchResponse('POST', { type: 'CreateTransaction' });

    const error = await response.json();
    assertEquals(response.status, 400);
    assertEquals(error.error, 'Invalid Request');
    assertEquals(error.detail, 'Parse Error: accountId: expected readonly accountId: UUID but was missing');
  });

  await t.step('should handle invalid query parameters', async () => {
    const response = await server.fetchResponse('GET', { type: 'GetTransactions', accountId: 'invalid' });

    const error = await response.json();
    assertEquals(response.status, 400);
    assertEquals(error.error, 'Invalid Request');
    assertEquals(error.detail, 'Parse Error: accountId: expected UUID but was "invalid"');
  });

  await t.step('should handle invalid page parameter', async () => {
    const response = await server.fetchResponse('GET', { type: 'GetAccounts', page: 'invalid' });

    const error = await response.json();
    assertEquals(response.status, 400);
    assertEquals(error.error, 'Invalid Request');
    assertEquals(error.detail, 'Parse Error: page: expected NumberFromString but was "invalid"');
  });

  await t.step('cleanup', async () => {
    await testDataHelper.cleanup([accountId]);
    await server.shutdown();
  });
});
