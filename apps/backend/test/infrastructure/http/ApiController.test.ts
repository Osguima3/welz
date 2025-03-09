import { assertEquals } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { randomUUID } from 'node:crypto';
import { CommandRouter } from '../../../src/application/command/CommandRouter.ts';
import { QueryRouter } from '../../../src/application/query/QueryRouter.ts';
import { ApiController } from '../../../src/infrastructure/http/ApiController.ts';
import { WebTransformer } from '../../../src/infrastructure/http/WebTransformer.ts';
import * as TestCommands from '../../helper/TestCommands.ts';
import * as TestQueries from '../../helper/TestQueries.ts';

const transactionId = randomUUID();
const accountId = randomUUID();

const mockCommand = TestCommands.createTransaction(accountId);
const mockQuery = TestQueries.getAccountTransactions({ accountId });
const mockTransaction = {
  id: transactionId,
  accountId,
  amount: { amount: 1000, currency: 'EUR' },
  date: new Date().toISOString(),
  description: 'Test transaction',
  metadata: {
    merchantName: 'Test Merchant',
  },
};

const TestCommandRouter = Layer.succeed(
  CommandRouter,
  () => Effect.succeed(mockTransaction),
);

const TestQueryRouter = Layer.succeed(
  QueryRouter,
  () => Effect.succeed(mockTransaction),
);

Deno.test('ApiController', async (t) => {
  const controller = await ApiController.pipe(
    Effect.provide(ApiController.Live),
    Effect.provide(WebTransformer.Live),
    Effect.provide(TestCommandRouter),
    Effect.provide(TestQueryRouter),
    Effect.runPromise,
  );

  await t.step('should handle POST commands successfully', async () => {
    const response = await controller(createPostRequest(mockCommand));
    const responseData = await response.json();

    assertEquals(responseData, mockTransaction);
    assertEquals(response.status, 201);
  });

  await t.step('should handle POST commands successfully despasito', async () => {
    const response = await controller(createPostRequest(mockCommand));
    const responseData = await response.json();

    assertEquals(responseData, mockTransaction);
    assertEquals(response.status, 201);
  });

  await t.step('should handle GET queries successfully', async () => {
    const response = await controller(createGetRequest(mockQuery));
    const responseData = await response.json();

    assertEquals(responseData, mockTransaction);
    assertEquals(response.status, 200);
  });

  await t.step('should handle invalid command schemas', async () => {
    const response = await controller(createPostRequest({ type: 'InvalidCommand' }));
    const responseData = await response.json();

    assertEquals(responseData.error, 'Invalid Request');
    assertEquals(
      responseData.detail,
      `Parse Error: type: expected "CreateTransaction" but was "InvalidCommand"`,
    );
    assertEquals(response.status, 400);
  });

  await t.step('should handle invalid query schemas', async () => {
    const response = await controller(createGetRequest({ type: 'GetAccountTransactions' }));
    const responseData = await response.json();

    assertEquals(responseData.error, 'Invalid Request');
    assertEquals(responseData.detail, 'Parse Error: accountId: expected but was missing');
    assertEquals(response.status, 400);
  });

  await t.step('should handle internal errors', async () => {
    const errorController = ApiController.pipe(
      Effect.provide(ApiController.Live),
      Effect.provide(Layer.succeed(CommandRouter, () => Effect.fail(new Error('Internal error')))),
      Effect.provide(TestQueryRouter),
      Effect.provide(WebTransformer.Live),
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
