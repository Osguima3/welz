import { assertEquals } from '$std/assert/mod.ts';
import { Transaction, TransactionPage } from '@shared/schema/Transaction.ts';
import { Effect, Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { CommandRouter } from '../../../src/application/command/CommandRouter.ts';
import { QueryRouter } from '../../../src/application/query/QueryRouter.ts';
import { AppConfig } from '../../../src/infrastructure/config/AppConfig.ts';
import { ApiController } from '../../../src/infrastructure/http/ApiController.ts';
import { WebTransformer } from '../../../src/infrastructure/http/WebTransformer.ts';
import TestAggregates from '../../helper/TestAggregates.ts';
import TestCommands from '../../helper/TestCommands.ts';
import TestQueries from '../../helper/TestQueries.ts';

const accountId = randomUUID();

const mockCommand = TestCommands.createTransaction(accountId);
const mockQuery = TestQueries.getTransactions({ accountId });
const mockTransaction = TestAggregates.transaction({ categoryId: randomUUID() });
const mockPage = TestAggregates.page(Transaction, mockTransaction);

Deno.test('ApiController', async (t) => {
  const controller = await ApiController.pipe(
    Effect.provide(ApiController.Live),
    Effect.provide(AppConfig.FromEnv),
    Effect.provide(WebTransformer.Live),
    Effect.provideService(CommandRouter, () => Effect.succeed(mockTransaction)),
    Effect.provideService(QueryRouter, () => Effect.succeed(mockPage)),
    Effect.runPromise,
  );

  await t.step('should handle POST commands successfully', async () => {
    const response = await controller(createPostRequest(mockCommand));
    const responseData = await response.json();

    assertEquals(responseData, Schema.encodeSync(Transaction)(mockTransaction));
    assertEquals(response.status, 201);
  });

  await t.step('should handle GET queries successfully', async () => {
    const response = await controller(createGetRequest(mockQuery));
    const responseData = await response.json();

    assertEquals(responseData, Schema.encodeSync(TransactionPage)(mockPage));
    assertEquals(response.status, 200);
  });

  await t.step('should handle invalid command schemas', async () => {
    const response = await controller(createPostRequest({ type: 'InvalidCommand' }));
    const responseData = await response.json();

    assertEquals(responseData.error, 'Invalid Request');
    assertEquals(
      responseData.detail,
      `Parse Error: type: expected "CreateTransaction" | "CategorizeTransaction" but was "InvalidCommand"`,
    );
    assertEquals(response.status, 400);
  });

  await t.step('should handle invalid query schemas', async () => {
    const response = await controller(createGetRequest({ type: 'GetTransactions', accountId: 'invalid' }));
    const responseData = await response.json();

    assertEquals(responseData.error, 'Invalid Request');
    assertEquals(responseData.detail, 'Parse Error: accountId: expected UUID but was "invalid"');
    assertEquals(response.status, 400);
  });

  await t.step('should handle internal errors', async () => {
    const errorController = ApiController.pipe(
      Effect.provide(ApiController.Live),
      Effect.provide(AppConfig.FromEnv),
      Effect.provide(WebTransformer.Live),
      Effect.provideService(CommandRouter, () => Effect.fail(new Error('Internal error'))),
      Effect.provideService(QueryRouter, () => Effect.fail(new Error('Internal error'))),
      Effect.runSync,
    );

    const response = await errorController(createPostRequest(mockCommand));
    const responseData = await response.json();

    assertEquals(responseData.error, 'Server Error');
    assertEquals(responseData.detail, 'Error: Internal error');
    assertEquals(response.status, 500);
  });
});

function createPostRequest(body: unknown): Request {
  return new Request('http://test.local/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createGetRequest(params: Record<string, unknown>): Request {
  const url = new URL('http://test.local/api');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return new Request(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}
