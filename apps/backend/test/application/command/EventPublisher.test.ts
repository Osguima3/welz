import { assertEquals, assertExists, assertMatch } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { EventPublisher } from '../../../src/application/command/EventPublisher.ts';
import { EventBus } from '../../../src/shared/events/EventBus.ts';
import { EventType } from '../../../src/application/schema/Event.ts';
import type { WelzEvent } from '../../../src/application/schema/Event.ts';
import { randomUUID } from 'node:crypto';

// Track published events
let publishedEvents: WelzEvent[] = [];

const event = {
  type: EventType.TRANSACTION_CREATED,
  payload: {
    transactionId: '123',
    accountId: randomUUID(),
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
} satisfies WelzEvent;

const TestEventBus = Layer.succeed(
  EventBus,
  {
    publish: (event: WelzEvent) => {
      publishedEvents.push(event);
      return Effect.succeed(undefined);
    },
    subscribe: () => Effect.succeed(undefined),
    unsubscribe: () => Effect.succeed(undefined),
  },
);

const TestLayer = EventPublisher.Live.pipe(
  Layer.provide(TestEventBus),
);

Deno.test('EventPublisher', async (t) => {
  await t.step('should enrich events with metadata', async () => {
    publishedEvents = [];

    await Effect.runPromise(
      Effect.gen(function* () {
        const publisher = yield* EventPublisher;
        yield* publisher.publish(event);

        assertEquals(publishedEvents.length, 1);
        const publishedEvent = publishedEvents[0];

        assertExists(publishedEvent.metadata.correlationId);
        assertMatch(publishedEvent.metadata.timestamp, /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        assertMatch(publishedEvent.metadata.correlationId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should preserve existing metadata values', async () => {
    publishedEvents = [];
    const existingMetadata = {
      timestamp: '2024-01-01T00:00:00Z',
      correlationId: 'existing-id',
    };

    await Effect.runPromise(
      Effect.gen(function* () {
        const publisher = yield* EventPublisher;
        yield* publisher.publish({
          ...event,
          metadata: existingMetadata,
        });

        assertEquals(publishedEvents.length, 1);
        const publishedEvent = publishedEvents[0];

        assertEquals(publishedEvent.metadata, existingMetadata);
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should maintain same correlation ID when publishing multiple events', async () => {
    publishedEvents = [];
    const events = [event, event, event];

    await Effect.runPromise(
      Effect.gen(function* () {
        const publisher = yield* EventPublisher;
        yield* publisher.publishAll(events);

        assertEquals(publishedEvents.length, 3);

        const correlationId = publishedEvents[0].metadata.correlationId;
        for (const event of publishedEvents) {
          assertEquals(event.metadata.correlationId, correlationId);
        }
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });

  await t.step('should handle empty event batch', async () => {
    publishedEvents = [];

    await Effect.runPromise(
      Effect.gen(function* () {
        const publisher = yield* EventPublisher;
        yield* publisher.publishAll([]);

        assertEquals(publishedEvents.length, 0);
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );
  });
});
