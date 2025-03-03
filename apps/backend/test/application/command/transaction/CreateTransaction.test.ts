import { assertEquals, assertExists, assertStringIncludes } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { randomUUID, UUID } from 'node:crypto';
import { EventPublisher } from '../../../../src/application/command/EventPublisher.ts';
import { CreateTransaction } from '../../../../src/application/command/transaction/CreateTransaction.ts';
import { TransactionBoundary } from '../../../../src/application/command/TransactionBoundary.ts';
import { EventType } from '../../../../src/application/schema/Event.ts';

// Mock services and track their calls
let eventPublisherCalls = 0;
let publishedEvent: unknown;

const accountId = randomUUID();
const publisherFailedAccountId = randomUUID();

const TestEventPublisher = Layer.succeed(
  EventPublisher,
  {
    publish: (event) => {
      if (event.payload.accountId === publisherFailedAccountId) {
        return Effect.fail(new Error('Failed to publish event'));
      } else {
        eventPublisherCalls++;
        publishedEvent = event;
        return Effect.succeed(undefined);
      }
    },
    publishAll: () => Effect.succeed(undefined),
  },
);

const TestTransactionBoundary = Layer.succeed(
  TransactionBoundary,
  (operation) => operation(),
);

const TestLayer = CreateTransaction.Live.pipe(
  Layer.provide(TestEventPublisher),
  Layer.provide(TestTransactionBoundary),
);

Deno.test('CreateTransaction', async (t) => {
  await t.step('should successfully create a transaction with valid input', async () => {
    // Reset tracking
    eventPublisherCalls = 0;
    publishedEvent = null;

    const transaction = testCreateTransactionCommand(accountId);

    await Effect.runPromise(
      Effect.gen(function* () {
        const createTransaction = yield* CreateTransaction;
        const result = yield* createTransaction(transaction);

        // Assert transaction was created
        assertExists(result);
        assertEquals(accountId, transaction.accountId);

        // Verify service calls
        assertEquals(eventPublisherCalls, 1, 'Event publisher should be called once');

        // Verify published event
        const event = publishedEvent as { type: EventType };
        assertEquals(event.type, EventType.TRANSACTION_CREATED);
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should fail when event publisher fails', async () => {
    const transaction = testCreateTransactionCommand(publisherFailedAccountId);

    const error = await Effect.runPromise(
      Effect.gen(function* () {
        const createTransaction = yield* CreateTransaction;
        return yield* createTransaction(transaction);
      }).pipe(
        Effect.flip,
        Effect.provide(TestLayer),
      ),
    );

    assertStringIncludes(error.message, 'Failed to publish event');
  });
});

function testCreateTransactionCommand(accountId: UUID) {
  return {
    type: 'CreateTransaction' as const,
    accountId: accountId,
    amount: {
      amount: BigInt(1000),
      currency: 'EUR',
    },
    date: new Date(),
    description: 'Test transaction',
  };
}
