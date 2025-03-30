import { assertEquals, assertExists } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { randomUUID } from 'node:crypto';
import { Money } from '../../../../shared/schema/Money.ts';
import { EventPublisher } from '../../../src/application/command/EventPublisher.ts';
import type { WelzEvent } from '../../../src/application/schema/Event.ts';
import { TransactionCreatedEvent } from '../../../src/domain/transaction/events.ts';
import { EventBus } from '../../../src/shared/events/EventBus.ts';

let publishedEvents: WelzEvent[] = [];

const event = TransactionCreatedEvent.make({
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

Deno.test('EventPublisher', async (t) => {
  const publisher = await EventPublisher.pipe(
    Effect.provide(EventPublisher.Live),
    Effect.provide(TestEventBus),
    Effect.runPromise,
  );

  await t.step('should preserve existing metadata timestamp and correlationId when provided', async () => {
    publishedEvents = [];
    const existingMetadata = {
      timestamp: new Date(2024, 0, 1),
      correlationId: randomUUID(),
    };

    const eventWithMetadata = {
      ...event,
      metadata: existingMetadata,
    };

    await Effect.runPromise(publisher.publish(eventWithMetadata));

    assertEquals(publishedEvents.length, 1);

    const publishedEvent = publishedEvents[0];
    assertEquals(publishedEvent.metadata?.timestamp, existingMetadata.timestamp);
    assertEquals(publishedEvent.metadata?.correlationId, existingMetadata.correlationId);
  });

  await t.step('should add default metadata when partial metadata provided', async () => {
    publishedEvents = [];
    const eventWithPartialMetadata = {
      ...event,
      metadata: {
        timestamp: new Date(),
      },
    };

    await Effect.runPromise(publisher.publish(eventWithPartialMetadata));

    assertEquals(publishedEvents.length, 1);
    const publishedEvent = publishedEvents[0];

    assertExists(publishedEvent.metadata?.correlationId);
    assertEquals(publishedEvent.metadata?.timestamp, eventWithPartialMetadata.metadata.timestamp);
  });

  await t.step('should use same correlationId and timestamp for all events in batch', async () => {
    publishedEvents = [];
    const timestamp = new Date();
    const events = [
      { ...event, metadata: { timestamp } },
      { ...event, metadata: { timestamp } },
    ];

    await Effect.runPromise(publisher.publishAll(events));

    assertEquals(publishedEvents.length, 2);

    const correlationId = publishedEvents[0].metadata?.correlationId;
    assertExists(correlationId);

    for (const event of publishedEvents) {
      assertEquals(event.metadata?.correlationId, correlationId);
      assertEquals(event.metadata?.timestamp, timestamp);
    }
  });

  await t.step('should preserve existing correlationId when present in first event of batch', async () => {
    publishedEvents = [];
    const existingCorrelationId = randomUUID();
    const timestamp = new Date();
    const events = [
      { ...event, metadata: { timestamp, correlationId: existingCorrelationId } },
      { ...event, metadata: { timestamp } },
    ];

    await Effect.runPromise(publisher.publishAll(events));

    assertEquals(publishedEvents.length, 2);

    for (const event of publishedEvents) {
      assertEquals(event.metadata?.correlationId, existingCorrelationId);
    }
  });
});
