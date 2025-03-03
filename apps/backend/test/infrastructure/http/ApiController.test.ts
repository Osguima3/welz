import { assertEquals } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { ApiController } from '../../../src/infrastructure/http/ApiController.ts';
import { CommandRouter } from '../../../src/application/command/CommandRouter.ts';
import { QueryRouter } from '../../../src/application/query/QueryRouter.ts';
import { WebTransformer } from '../../../src/infrastructure/http/WebTransformer.ts';
import { randomUUID } from 'node:crypto';

const mockCommand = {
  type: 'CreateUser' as const,
  name: 'John Doe',
  email: 'john@example.com',
};

const validUserId = randomUUID();

const mockQuery = {
  type: 'GetUser' as const,
  userId: validUserId,
};

const mockUser = {
  id: validUserId,
  name: 'John Doe',
  email: 'john@example.com',
};

// Test layers
const TestCommandRouter = Layer.succeed(
  CommandRouter,
  (command) => Effect.succeed(command.type === 'CreateUser' ? mockUser : null),
);

const TestQueryRouter = Layer.succeed(
  QueryRouter,
  (query) => Effect.succeed(query.type === 'GetUser' ? mockUser : null),
);

const TestLayer = ApiController.Live.pipe(
  Layer.provide(TestCommandRouter),
  Layer.provide(TestQueryRouter),
  Layer.provide(WebTransformer.Live),
);

Deno.test('ApiController', async (t) => {
  await t.step('should handle POST commands successfully', async () => {
    await Effect.runPromise(
      Effect.gen(function* (_) {
        const controller = yield* ApiController;
        const response = yield* Effect.promise(() => controller(createPostRequest(mockCommand)));
        const responseData = yield* Effect.promise(() => response.json());
        assertEquals(response.status, 201);
        assertEquals(responseData, mockUser);
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle GET queries successfully', async () => {
    await Effect.runPromise(
      Effect.gen(function* (_) {
        const controller = yield* ApiController;
        const response = yield* Effect.promise(() => controller(createGetRequest(mockQuery)));
        const responseData = yield* Effect.promise(() => response.json());
        assertEquals(response.status, 200);
        assertEquals(responseData, mockUser);
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle invalid command schemas', async () => {
    await Effect.runPromise(
      Effect.gen(function* (_) {
        const controller = yield* ApiController;
        const response = yield* Effect.promise(() => controller(createPostRequest({
          type: 'CreateUser',
          name: '', // Invalid - empty name
          email: 'invalid', // Invalid email
        })));
        const responseData = yield* Effect.promise(() => response.json());
        assertEquals(response.status, 400);
        assertEquals(responseData.error, 'Invalid Request');
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle invalid query schemas', async () => {
    await Effect.runPromise(
      Effect.gen(function* (_) {
        const controller = yield* ApiController;
        const response = yield* Effect.promise(() => controller(createGetRequest({
          type: 'GetUser',
          userId: 123, // Invalid - should be string
        })));
        const responseData = yield* Effect.promise(() => response.json());
        assertEquals(response.status, 400);
        assertEquals(responseData.error, 'Invalid Request');
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle unknown command types', async () => {
    await Effect.runPromise(
      Effect.gen(function* (_) {
        const controller = yield* ApiController;
        const response = yield* Effect.promise(() => controller(createPostRequest({
          type: 'UnknownCommand',
        })));
        const responseData = yield* Effect.promise(() => response.json());
        assertEquals(response.status, 400);
        assertEquals(responseData.error, 'Invalid Request');
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle internal errors', async () => {
    const ErrorLayer = ApiController.Live.pipe(
      Layer.provide(Layer.succeed(
        CommandRouter,
        () => Effect.fail(new Error('Internal error')),
      )),
      Layer.provide(TestQueryRouter),
      Layer.provide(WebTransformer.Live),
    );

    await Effect.runPromise(
      Effect.gen(function* (_) {
        const controller = yield* ApiController;
        const response = yield* Effect.promise(() => controller(createPostRequest(mockCommand)));
        const responseData = yield* Effect.promise(() => response.json());
        assertEquals(response.status, 500);
        assertEquals(responseData.error.type, 'ServerError');
        assertEquals(responseData.error.message, 'Internal error');
      }).pipe(
        Effect.provide(ErrorLayer),
      ),
    );
  });
});

const createPostRequest = (body: unknown): Request => {
  return new Request('http://test.local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
};

const createGetRequest = (params: Record<string, unknown>): Request => {
  const url = new URL('http://test.local');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  
  return new Request(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
};
