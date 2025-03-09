import { assertEquals } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { EventType, WelzEvent } from '../../../src/application/schema/Event.ts';
import { Money } from '../../../src/domain/common/Money.ts';
import { InMemoryEventBus } from '../../../src/infrastructure/eventbus/InMemoryEventBus.ts';
import { EventBus } from '../../../src/shared/events/EventBus.ts';

const mockEvent: WelzEvent = {
  type: EventType.TRANSACTION_CREATED,
  metadata: {
    timestamp: new Date(),
    correlationId: '123',
  },
  payload: {
    id: '123',
    accountId: '456',
    amount: Money.create(1000, 'EUR'),
    date: new Date(),
    description: 'Test transaction',
  },
};

Deno.test('InMemoryEventBus', async (t) => {
  const eventBus = await EventBus.pipe(
    Effect.provide(InMemoryEventBus),
    Effect.runPromise,
  );

  await t.step('should successfully publish and consume events', async () => {
    let handlerCalled = false;
    let receivedEvent: WelzEvent | null = null;

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* eventBus.subscribe(EventType.TRANSACTION_CREATED, (event) => {
          handlerCalled = true;
          receivedEvent = event;
          return Effect.succeed(undefined);
        });

        yield* eventBus.publish(mockEvent);

        assertEquals(handlerCalled, true, 'Event handler should be called');
        assertEquals(receivedEvent, mockEvent);
      }),
    );
  });

  await t.step('should allow unsubscribing handlers', async () => {
    let handlerCallCount = 0;

    await Effect.runPromise(
      Effect.gen(function* () {
        const handler = () => {
          handlerCallCount++;
          return Effect.succeed(undefined);
        };

        yield* eventBus.subscribe(EventType.TRANSACTION_CREATED, handler);
        yield* eventBus.publish(mockEvent);
        assertEquals(handlerCallCount, 1, 'Handler should be called once');

        yield* eventBus.unsubscribe(EventType.TRANSACTION_CREATED, handler);
        yield* eventBus.publish(mockEvent);
        assertEquals(handlerCallCount, 1, 'Handler should not be called after unsubscribing');
      }),
    );
  });

  await t.step('should handle multiple subscribers for same event type', async () => {
    const handlersCalled: string[] = [];

    await Effect.runPromise(
      Effect.gen(function* () {
        for (const id of ['1', '2', '3']) {
          yield* eventBus.subscribe(
            EventType.TRANSACTION_CREATED,
            () => {
              handlersCalled.push(id);
              return Effect.succeed(undefined);
            },
          );
        }

        yield* eventBus.publish(mockEvent);

        assertEquals(handlersCalled.length, 3, 'All handlers should be called');
        assertEquals(handlersCalled, ['1', '2', '3']);
      }),
    );
  });

  await t.step('should handle errors in event handlers gracefully', async () => {
    let successHandlerCalled = false;

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* eventBus.subscribe(
          EventType.TRANSACTION_CREATED,
          () => Effect.fail(new Error('Handler error')),
        );

        yield* eventBus.subscribe(
          EventType.TRANSACTION_CREATED,
          () => {
            successHandlerCalled = true;
            return Effect.succeed(undefined);
          },
        );

        yield* eventBus.publish(mockEvent);

        assertEquals(successHandlerCalled, true, 'Success handler should be called despite error in other handler');
      }),
    );
  });
});
