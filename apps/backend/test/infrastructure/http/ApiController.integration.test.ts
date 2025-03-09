import { assertEquals } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { UUID } from '../../../src/domain/common/Schema.ts';
import { ApiController } from '../../../src/infrastructure/http/ApiController.ts';
import { LocalEnvLayer } from '../../../src/infrastructure/layer/EnvLayer.ts';
import * as TestCommands from '../../helper/TestCommands.ts';
import { TestDataHelper } from '../../helper/TestDataHelper.ts';
import * as TestQueries from '../../helper/TestQueries.ts';
import { createTestServer, TestServer } from '../../helper/TestServer.ts';

Deno.test('ApiController integration', async (t) => {
  let transactionId: UUID;
  const accountId = randomUUID();
  const categoryId = randomUUID();

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
    await testDataHelper.createCategory(categoryId);
  });

  await t.step('should create transaction successfully', async () => {
    const transaction = TestCommands.createTransactionRequest(accountId);

    const response = await server.fetchResponse('POST', transaction);
    const result = await response.json();

    const ignoredFields = {
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      type: undefined,
      date: undefined,
    };
    assertEquals({ ...result, ...ignoredFields }, { ...transaction, ...ignoredFields });
    assertEquals(response.status, 201);

    transactionId = result.id;
  });

  await t.step('should get transactions successfully', async () => {
    const query = TestQueries.getAccountTransactionsRequest({ accountId });

    const response = await server.fetchResponse('GET', query);
    const result = await response.json();

    assertEquals(response.status, 200);
    assertEquals(result.total, 1);
    assertEquals(result.transactions.length, 1);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);
    assertEquals(result.transactions[0].id, transactionId);
  });

  await t.step('should handle invalid transaction data', async () => {
    const invalidTransaction = { type: 'CreateTransaction' };

    const response = await server.fetchResponse('POST', invalidTransaction);

    const error = await response.json();
    assertEquals(error.error, 'Invalid Request');
    assertEquals(error.detail, 'Parse Error: accountId: expected readonly accountId: UUID but was missing');
    assertEquals(response.status, 400);
  });

  await t.step('should handle invalid query parameters', async () => {
    const invalidQuery = { type: 'GetAccountTransactions' };
    const response = await server.fetchResponse('GET', invalidQuery);
    const error = await response.json();

    assertEquals(response.status, 400);
    assertEquals(error.error, 'Invalid Request');
    assertEquals(error.detail, 'Parse Error: accountId: expected readonly accountId: UUID but was missing');
  });

  await t.step('cleanup', async () => {
    await testDataHelper.cleanup([accountId], [categoryId]);
    await server.shutdown();
  });
});
