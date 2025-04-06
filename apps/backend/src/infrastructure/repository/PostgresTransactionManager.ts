import { Effect, Layer } from 'effect';
import { randomUUID } from 'node:crypto';
import { TransactionManager } from '../../application/command/TransactionManager.ts';
import { PostgresClient } from './PostgresClient.ts';

export const PostgresTransactionManager = Layer.effect(
  TransactionManager,
  Effect.gen(function* () {
    const client = yield* PostgresClient;

    return <T>(readonly: boolean, operation: () => Effect.Effect<T, Error, PostgresClient>) =>
      Effect.logDebug('Starting transaction').pipe(
        Effect.flatMap(() => (readonly ? executeReadOnly : executeTransaction)(operation)),
        Effect.provideService(PostgresClient, client),
        Effect.annotateLogs('transactionId', randomUUID()),
        Effect.withLogSpan('transactionTime'),
      );
  }),
);

function executeReadOnly<T>(
  operation: () => Effect.Effect<T, Error, PostgresClient>,
): Effect.Effect<T, Error, PostgresClient> {
  return operation();
}

function executeTransaction<T>(
  operation: () => Effect.Effect<T, Error, PostgresClient>,
): Effect.Effect<T, Error, PostgresClient> {
  return Effect.gen(function* () {
    const client = yield* PostgresClient;
    yield* client.runQuery('BEGIN');
    yield* Effect.logDebug('Transaction started');

    try {
      const result = yield* operation();
      yield* client.runQuery('COMMIT');
      yield* Effect.logInfo('Transaction committed');
      return yield* Effect.succeed(result);
    } catch (error) {
      yield* client.runQuery('ROLLBACK');
      yield* Effect.logWarning('Transaction rolled back');
      throw error;
    }
  });
}
