import { Layer } from 'effect';
import { InMemoryEventBus } from '../eventbus/InMemoryEventBus.ts';

export const InMemoryLayer = Layer.mergeAll(
  InMemoryEventBus,
);
