import { Effect, Layer } from 'effect';
import { TransactionManager } from '../../src/application/command/TransactionManager.ts';
import { RepositoryLayer } from '../../src/infrastructure/layer/RepositoryLayer.ts';
import { PostgresClient } from '../../src/infrastructure/repository/PostgresClient.ts';
import { PostgresConfig } from '../../src/infrastructure/repository/PostgresConfig.ts';
import { TestDataHelper } from './TestDataHelper.ts';

export const UnitTestRepositoryLayer = Layer.succeed(
  TransactionManager,
  (_, operation) =>
    operation().pipe(
      Effect.provideService(PostgresClient, {
        connect: () => Effect.succeed(undefined),
        end: () => Effect.succeed(undefined),
        runQuery: () => Effect.succeed({ rows: [] }),
      }),
    ),
);

export const IntegrationTestRepositoryLayer = TestDataHelper.Live.pipe(
  Layer.provideMerge(RepositoryLayer),
  Layer.provide(PostgresConfig.Local),
);
