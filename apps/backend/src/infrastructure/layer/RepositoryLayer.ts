import { Layer } from 'effect';
import { PostgresTransactionRepository } from '../repository/PostgresTransactionRepository.ts';
import { PostgresClient } from '../repository/PostgresClient.ts';
import { PostgresTransactionManager } from '../repository/PostgresTransactionManager.ts';

export const RepositoryLayer = Layer.mergeAll(
  PostgresTransactionManager,
  PostgresTransactionRepository,
).pipe(
  Layer.provideMerge(PostgresClient.Live),
);
