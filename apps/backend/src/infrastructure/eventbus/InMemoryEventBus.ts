import { Effect, Layer } from 'effect';
import { EventType, WelzEvent } from '../../application/schema/Event.ts';
import { EventBus, EventListener } from '../../shared/events/EventBus.ts';

export const InMemoryEventBus = Layer.effect(
  EventBus,
  Effect.sync(() => {
    const handlers = new Map<EventType, Set<EventListener>>();
    return {
      subscribe(type: EventType, handler: EventListener): Effect.Effect<void, Error> {
        if (!handlers.has(type)) {
          handlers.set(type, new Set());
        }
        handlers.get(type)!.add(handler);
        return Effect.succeed(undefined);
      },

      unsubscribe(type: EventType, handler: EventListener): Effect.Effect<void, Error> {
        const eventHandlers = handlers.get(type);
        if (eventHandlers) {
          eventHandlers.delete(handler);
        }
        return Effect.succeed(undefined);
      },

      publish(event: WelzEvent): Effect.Effect<void, Error> {
        const eventHandlers = handlers.get(event.type);
        if (!eventHandlers) {
          return Effect.succeed(undefined);
        }

        return Effect.all(
          Array.from(eventHandlers).map((handler) =>
            handler(event).pipe(
              Effect.catchAll((error) =>
                Effect.logError('Error handling event', {
                  eventType: event.type,
                  errorMessage: error.message,
                })
              ),
            )
          ),
        );
      },
    };
  }),
);
