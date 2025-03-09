import { Effect, Layer } from 'effect';
import { TransactionManager } from '../../src/application/command/TransactionManager.ts';
import { RepositoryLayer } from '../../src/infrastructure/layer/RepositoryLayer.ts';
import { PostgresClient } from '../../src/infrastructure/repository/PostgresClient.ts';
import { PostgresConfig } from '../../src/infrastructure/repository/PostgresConfig.ts';
import { TestDataHelper } from './TestDataHelper.ts';

export const UnitTestRepositoryLayer = Layer.succeed(
  TransactionManager,
  <T>(operation: () => Effect.Effect<T, Error, PostgresClient>) =>
    operation().pipe(
      Effect.provideService(PostgresClient, {
        connect: () => Effect.succeed(undefined),
        end: () => Effect.succeed(undefined),
        queryArray: () => Effect.succeed({ rows: [] }),
        queryObject: () => Effect.succeed({ rows: [] }),
      }),
    ),
);

export const IntegrationTestRepositoryLayer = TestDataHelper.Live.pipe(
  Layer.provideMerge(RepositoryLayer),
  Layer.provide(PostgresConfig.Local),
);
