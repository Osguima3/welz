import { Layer } from 'effect';
import { IntegrationTestEventPublisherLayer, UnitTestEventPublisherLayer } from './TestEventPublisherLayers.ts';
import { IntegrationTestRepositoryLayer, UnitTestRepositoryLayer } from './TestRepositoryLayers.ts';

export const UnitTestLayer = Layer.mergeAll(
  UnitTestEventPublisherLayer,
  UnitTestRepositoryLayer,
);

export const IntegrationTestLayer = Layer.mergeAll(
  IntegrationTestEventPublisherLayer,
  IntegrationTestRepositoryLayer,
);
