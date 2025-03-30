import { Layer } from 'effect';
import { PostgresAccountRepository } from '../repository/PostgresAccountRepository.ts';
import { PostgresCategoryRepository } from '../repository/PostgresCategoryRepository.ts';
import { PostgresClient } from '../repository/PostgresClient.ts';
import { PostgresReadModelRepository } from '../repository/PostgresReadModelRepository.ts';
import { PostgresTransactionManager } from '../repository/PostgresTransactionManager.ts';
import { PostgresTransactionRepository } from '../repository/PostgresTransactionRepository.ts';

export const RepositoryLayer = Layer.mergeAll(
  PostgresTransactionManager,
  PostgresTransactionRepository,
  PostgresAccountRepository,
  PostgresCategoryRepository,
  PostgresReadModelRepository,
).pipe(
  Layer.provideMerge(PostgresClient.Live),
);
