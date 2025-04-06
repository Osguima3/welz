import { assertEquals } from '$std/assert/mod.ts';
import { Money } from '@shared/schema/Money.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { WelzEvent } from '../../../src/application/schema/Event.ts';
import { EventBus } from '../../../src/domain/events/EventBus.ts';
import { TransactionCreatedEvent } from '../../../src/domain/transaction/events.ts';
import { InMemoryEventBus } from '../../../src/infrastructure/eventbus/InMemoryEventBus.ts';

const mockEvent = TransactionCreatedEvent.make({
  type: 'TransactionCreated',
  metadata: {
    timestamp: new Date(),
    correlationId: randomUUID(),
  },
  payload: {
    id: randomUUID(),
    accountId: randomUUID(),
    amount: Money.create(1000, 'EUR'),
    date: new Date(),
    description: 'Test transaction',
  },
});

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
        yield* eventBus.subscribe('TransactionCreated', (event) => {
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

        yield* eventBus.subscribe('TransactionCreated', handler);
        yield* eventBus.publish(mockEvent);
        assertEquals(handlerCallCount, 1, 'Handler should be called once');

        yield* eventBus.unsubscribe('TransactionCreated', handler);
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
            'TransactionCreated',
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

  await t.step('should fail if any handler fails', async () => {
    let successHandlerCalled = false;

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* eventBus.subscribe(
          'TransactionCreated',
          () => Effect.fail(new Error('Handler error')),
        );

        yield* eventBus.subscribe(
          'TransactionCreated',
          () => {
            successHandlerCalled = true;
            return Effect.succeed(undefined);
          },
        );

        const error = yield* eventBus.publish(mockEvent).pipe(Effect.flip);

        assertEquals(error.message, 'Handler error');
        assertEquals(successHandlerCalled, true, 'Success handler should be called despite error in other handler');
      }),
    );
  });
});
