import { Context, Effect, Layer } from 'effect';
import { randomUUID } from 'node:crypto';
import { EventBus } from '../../shared/events/EventBus.ts';
import { WelzEvent } from '../schema/Event.ts';

export class EventPublisher extends Context.Tag('EventPublisher')<
  EventPublisher,
  {
    publish: (event: WelzEvent) => Effect.Effect<void, Error>;
    publishAll: (events: WelzEvent[]) => Effect.Effect<void, Error>;
  }
>() {
  static Live = Layer.effect(
    EventPublisher,
    Effect.gen(function* () {
      const eventBus = yield* EventBus;
      const _publish = (event: WelzEvent, timestamp: Date, correlationId: string) =>
        Effect.gen(function* () {
          const enrichedEvent = {
            ...event,
            metadata: {
              timestamp: event.metadata?.timestamp || timestamp,
              correlationId: event.metadata?.correlationId || correlationId,
            },
          };

          yield* Effect.logInfo(
            'Publishing event, type ' + enrichedEvent.type + ', correlationId ' + correlationId +
              ', event ' + JSON.stringify(event),
          );

          yield* eventBus.publish(enrichedEvent);
        });

      return {
        publish(event) {
          return _publish(event, new Date(), randomUUID());
        },

        publishAll(events) {
          return Effect.gen(function* () {
            if (events.length === 0) {
              return;
            }

            const timestamp = new Date();
            const correlationId = events[0]?.metadata?.correlationId || randomUUID();
            yield* Effect.all(
              events.map((event) => _publish(event, timestamp, correlationId)),
            );
          });
        },
      };
    }),
  );
}
