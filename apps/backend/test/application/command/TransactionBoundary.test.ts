import { assertEquals, assertInstanceOf } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { TransactionBoundary } from '../../../src/application/command/TransactionBoundary.ts';
import { TransactionContext, TransactionProvider } from '../../../src/application/command/TransactionProvider.ts';

const mockContext: TransactionContext = {
  id: 'test-transaction',
  startTime: new Date(),
};

// Track provider method calls
let commitCalled = false;
let rollbackCalled = false;

// Mock Transaction Provider for testing
const TestTransactionProvider = Layer.succeed(
  TransactionProvider,
  {
    begin: () => Effect.succeed(mockContext),
    commit: () => Effect.sync(() => {
      commitCalled = true;
      return void 0;
    }),
    rollback: () => Effect.sync(() => {
      rollbackCalled = true;
      return void 0;
    }),
  },
);

const TestLayer = TransactionBoundary.Live.pipe(
  Layer.provide(TestTransactionProvider),
);

Deno.test('TransactionBoundary', async (t) => {
  await t.step('should handle successful operations', async () => {
    commitCalled = false;
    rollbackCalled = false;
    const expectedResult = { success: true };
    
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const boundary = yield* TransactionBoundary;
        return yield* boundary(() => Effect.succeed(expectedResult));
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );

    assertEquals(result, expectedResult);
    assertEquals(commitCalled, true);
    assertEquals(rollbackCalled, false);
  });

  await t.step('should handle failed operations', async () => {
    commitCalled = false;
    rollbackCalled = false;
    const expectedError = 'Test error';
    
    const error = await Effect.runPromise(
      Effect.gen(function* () {
        const boundary = yield* TransactionBoundary;
        return yield* boundary(() => Effect.fail(new Error(expectedError)));
      }).pipe(
        Effect.flip,
        Effect.provide(TestLayer),
      ),
    );

    assertInstanceOf(error, Error);
    assertEquals(error.message, expectedError);
    assertEquals(commitCalled, false);
    assertEquals(rollbackCalled, true);
  });
});