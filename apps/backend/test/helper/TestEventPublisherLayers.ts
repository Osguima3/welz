import { Effect, Layer } from 'effect';
import { EventPublisher } from '../../src/application/command/EventPublisher.ts';
import { WelzEvent } from '../../src/application/schema/Event.ts';
import { InMemoryEventBus } from '../../src/infrastructure/eventbus/InMemoryEventBus.ts';

let publishedEvents: WelzEvent[] = [];
let failPublish = false;

export const TestEventPublisher = {
  reset() {
    publishedEvents = [];
    failPublish = false;
  },

  setFail(fail: boolean) {
    failPublish = fail;
  },

  count() {
    return publishedEvents.length;
  },

  popEvent() {
    return publishedEvents.pop();
  },
};

export const UnitTestEventPublisherLayer = Layer.succeed(
  EventPublisher,
  {
    publish: (event) => {
      if (failPublish) {
        return Effect.fail(new Error('Failed to publish event'));
      }

      publishedEvents.push(event);
      return Effect.succeed(undefined);
    },
    publishAll: (events) => {
      if (failPublish) {
        return Effect.fail(new Error('Failed to publish event'));
      }

      publishedEvents.push(...events);
      return Effect.succeed(undefined);
    },
  },
);

export const IntegrationTestEventPublisherLayer = EventPublisher.Live.pipe(
  Layer.provideMerge(InMemoryEventBus),
);
