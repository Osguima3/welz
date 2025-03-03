import { Layer } from 'effect';
import { ApplicationLayer } from './ApplicationLayer.ts';
import { ControllerLayer } from './ControllerLayer.ts';
// import { DomainLayer } from './DomainLayer.ts';
import { InMemoryLayer } from './InfrastructureInMemoryLayer.ts';
import { TestRepositoryLayer } from './TestRepositoryLayer.ts';

export const TestEnvLayer = ControllerLayer.pipe(
  Layer.provide(ApplicationLayer),
  // Layer.provide(DomainLayer),
  Layer.provide(TestRepositoryLayer),
  Layer.provide(InMemoryLayer),
);
