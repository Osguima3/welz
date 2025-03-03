import { assertEquals } from '$std/assert/mod.ts';
import { Effect, ParseResult } from 'effect';
import { WebTransformer } from '../../../src/infrastructure/http/WebTransformer.ts';

const TestLayer = WebTransformer.Live;

Deno.test('WebTransformer', async (t) => {
  await t.step('should transform successful command responses', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const transformer = yield* WebTransformer;
        const data = { id: '123', name: 'Test' };
        const response = yield* transformer.transformCommand(data);
        const responseData = yield* Effect.promise(() => response.json());

        assertEquals(response.status, 201);
        assertEquals(response.headers.get('Content-Type'), 'application/json');
        assertEquals(responseData, data);
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should transform successful query responses', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const transformer = yield* WebTransformer;
        const data = { id: '123', name: 'Test' };
        const response = yield* transformer.transformQuery(data);
        const responseData = yield* Effect.promise(() => response.json());

        assertEquals(response.status, 200);
        assertEquals(response.headers.get('Content-Type'), 'application/json');
        assertEquals(responseData, data);
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle parse errors as 400 Bad Request', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const transformer = yield* WebTransformer;
        const error = new ParseResult.ParseError({ issue: new ParseResult.Unexpected('Invalid input') });
        const response = yield* transformer.transformError(error);
        const responseData = (yield* Effect.promise(() => response.json())) as { error: string; details: string };

        assertEquals(response.status, 400);
        assertEquals(responseData.error, 'Invalid Request');
        assertEquals(typeof responseData.details, 'string');
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle unexpected errors as 500 Internal Server Error', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const transformer = yield* WebTransformer;
        const error = new Error('Database connection failed');
        const response = yield* transformer.transformError(error);
        const responseData = (yield* Effect.promise(() => response.json())) as {
          error: { type: string; message: string };
        };

        assertEquals(response.status, 500);
        assertEquals(responseData.error.type, 'ServerError');
        assertEquals(responseData.error.message, 'Database connection failed');
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle null/undefined responses', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const transformer = yield* WebTransformer;
        const nullResponse = yield* transformer.transformQuery(null);
        const undefinedResponse = yield* transformer.transformQuery(undefined);

        const nullData = yield* Effect.promise(() => nullResponse.json());
        const undefinedData = yield* Effect.promise(() => undefinedResponse.json());

        assertEquals(nullResponse.status, 200);
        assertEquals(undefinedResponse.status, 200);
        assertEquals(nullData, {});
        assertEquals(undefinedData, {});

        assertEquals(nullResponse.headers.get('Content-Type'), 'application/json');
        assertEquals(undefinedResponse.headers.get('Content-Type'), 'application/json');
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });
});
