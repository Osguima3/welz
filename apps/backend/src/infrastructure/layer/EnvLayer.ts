import { Layer } from 'effect';
import { ApplicationLayer } from './ApplicationLayer.ts';
import { ControllerLayer } from './ControllerLayer.ts';
// import { DomainLayer } from './DomainLayer.ts';
import { AppConfig } from '../config/AppConfig.ts';
import { TestDataHelper } from '../../../test/helper/TestDataHelper.ts';
import { InMemoryEventBus } from '../eventbus/InMemoryEventBus.ts';
import { RepositoryLayer } from './RepositoryLayer.ts';

export const LocalEnvLayer = ControllerLayer.pipe(
  Layer.provide(ApplicationLayer),
  // Layer.provide(DomainLayer),
  Layer.provideMerge(TestDataHelper.Live),
  Layer.provide(RepositoryLayer),
  Layer.provide(InMemoryEventBus),
  Layer.provideMerge(AppConfig.FromEnv),
);
