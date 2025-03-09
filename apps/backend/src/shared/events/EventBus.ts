import { Context, Effect } from 'effect';
import { EventType, WelzEvent } from '../../application/schema/Event.ts';

export type EventListener = (event: WelzEvent) => Effect.Effect<void, Error>;

export class EventBus extends Context.Tag('EventBus')<
  EventBus,
  {
    publish(event: WelzEvent): Effect.Effect<void, Error>;
    subscribe(type: EventType, handler: EventListener): Effect.Effect<void, Error>;
    unsubscribe(type: EventType, handler: EventListener): Effect.Effect<void, Error>;
  }
>() {}
