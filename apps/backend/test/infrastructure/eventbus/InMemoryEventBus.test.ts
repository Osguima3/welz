import { assertEquals } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { EventType, type WelzEvent } from '../../../src/application/schema/Event.ts';
import { InMemoryEventBus } from '../../../src/infrastructure/eventbus/InMemoryEventBus.ts';
import { EventBus } from '../../../src/shared/events/EventBus.ts';

const mockEvent: WelzEvent = {
  type: EventType.TRANSACTION_CREATED,
  payload: {
    transactionId: '123',
    accountId: '456',
    amount: {
      amount: BigInt(1000),
      currency: 'EUR',
    },
    date: new Date(),
    description: 'Test transaction',
  },
  metadata: {
    timestamp: new Date().toISOString(),
  },
};

const TestLayer = InMemoryEventBus;

Deno.test('InMemoryEventBus', async (t) => {
  await t.step('should successfully publish and consume events', async () => {
    let handlerCalled = false;
    let receivedEvent: WelzEvent | null = null;

    await Effect.runPromise(
      Effect.gen(function* () {
        const bus = yield* EventBus;

        yield* bus.subscribe(EventType.TRANSACTION_CREATED, (event) => {
          handlerCalled = true;
          receivedEvent = event;
          return Effect.succeed(undefined);
        });

        yield* bus.publish(mockEvent);

        assertEquals(handlerCalled, true, 'Event handler should be called');
        assertEquals(receivedEvent, mockEvent);
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should allow unsubscribing handlers', async () => {
    let handlerCallCount = 0;

    await Effect.runPromise(
      Effect.gen(function* () {
        const bus = yield* EventBus;

        const handler = () => {
          handlerCallCount++;
          return Effect.succeed(undefined);
        };

        yield* bus.subscribe(EventType.TRANSACTION_CREATED, handler);
        yield* bus.publish(mockEvent);
        assertEquals(handlerCallCount, 1, 'Handler should be called once');

        yield* bus.unsubscribe(EventType.TRANSACTION_CREATED, handler);
        yield* bus.publish(mockEvent);
        assertEquals(handlerCallCount, 1, 'Handler should not be called after unsubscribing');
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle multiple subscribers for same event type', async () => {
    const handlersCalled: string[] = [];

    await Effect.runPromise(
      Effect.gen(function* () {
        const bus = yield* EventBus;

        for (const id of ['1', '2', '3']) {
          yield* bus.subscribe(
            EventType.TRANSACTION_CREATED,
            () => {
              handlersCalled.push(id);
              return Effect.succeed(undefined);
            },
          );
        }

        yield* bus.publish(mockEvent);

        assertEquals(handlersCalled.length, 3, 'All handlers should be called');
        assertEquals(handlersCalled, ['1', '2', '3']);
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle errors in event handlers gracefully', async () => {
    let successHandlerCalled = false;

    await Effect.runPromise(
      Effect.gen(function* () {
        const bus = yield* EventBus;

        // Subscribe error-throwing handler
        yield* bus.subscribe(
          EventType.TRANSACTION_CREATED,
          () => Effect.fail(new Error('Handler error')),
        );

        // Subscribe success handler
        yield* bus.subscribe(
          EventType.TRANSACTION_CREATED,
          () => {
            successHandlerCalled = true;
            return Effect.succeed(undefined);
          },
        );

        // Publish event - should not throw
        yield* bus.publish(mockEvent);

        // Verify success handler was still called
        assertEquals(successHandlerCalled, true, 'Success handler should be called despite error in other handler');
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });
});
