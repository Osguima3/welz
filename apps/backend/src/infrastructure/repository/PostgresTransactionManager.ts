import { Effect, Layer, Scope } from 'effect';
import { randomUUID } from 'node:crypto';
import { TransactionManager } from '../../application/command/TransactionManager.ts';
import { PostgresClient } from './PostgresClient.ts';

export interface TransactionContext {
  id: string;
  startTime: Date;
}

export const PostgresTransactionManager = Layer.effect(
  TransactionManager,
  Effect.gen(function* () {
    const client = yield* PostgresClient;

    return <T>(operation: () => Effect.Effect<T, Error, PostgresClient>) =>
      Effect.scoped(
        Effect.gen(function* () {
          const context = yield* begin(client);

          return yield* operation().pipe(
            Effect.annotateLogs('transactionId', context.id),
            Effect.provideService(PostgresClient, client),
            Effect.flatMap((result) => commit(client, context).pipe(Effect.map(() => result))),
            Effect.catchAll((error) => {
              return Effect.gen(function* () {
                yield* Effect.logError(error);
                yield* rollback(client, context);
                return yield* Effect.fail(error);
              });
            }),
          );
        }),
      );
  }),
);

type PostgresClientType = Effect.Effect.Success<typeof PostgresClient>;

function begin(client: PostgresClientType): Effect.Effect<TransactionContext, Error, Scope.Scope> {
  return Effect.gen(function* () {
    yield* client.connect();
    yield* Effect.addFinalizer(client.end);

    const result = yield* client.queryArray('BEGIN');
    if (!result.rows) {
      return yield* Effect.fail(new Error('Failed to begin transaction'));
    }

    const context: TransactionContext = {
      id: randomUUID(),
      startTime: new Date(),
    };

    yield* Effect.logDebug({
      message: 'Transaction started',
      transactionId: context.id,
    });

    return context;
  });
}

function commit(client: PostgresClientType, context: TransactionContext): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    const result = yield* client.queryArray('COMMIT');
    if (!result.rows) {
      return yield* Effect.fail(new Error('Failed to commit transaction'));
    }

    const executionTimeMs = getExecutionTime(context.startTime);

    yield* Effect.logInfo({
      message: 'Transaction committed',
      transactionId: context.id,
      executionTimeMs,
    });
  });
}

function rollback(client: PostgresClientType, context: TransactionContext): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    const result = yield* client.queryArray('ROLLBACK');
    if (!result.rows) {
      return yield* Effect.fail(new Error('Failed to rollback transaction'));
    }

    const executionTimeMs = getExecutionTime(context.startTime);

    yield* Effect.logWarning({
      message: 'Transaction rolled back',
      transactionId: context.id,
      executionTimeMs,
    });
  });
}

function getExecutionTime(startTime: Date): number {
  return new Date().getTime() - startTime.getTime();
}
