import { Context, Effect, Layer } from 'effect';
import { TransactionContext, TransactionProvider } from './TransactionProvider.ts';

export class TransactionBoundary extends Context.Tag('TransactionBoundary')<TransactionBoundary, {
  (operation: () => Effect.Effect<unknown, Error>): Effect.Effect<unknown, Error>;
}>() {
  static Live = Layer.effect(
    TransactionBoundary,
    Effect.gen(function* () {
      const transactionProvider = yield* TransactionProvider;
      return (operation) =>
        Effect.gen(function* () {
          const context = yield* transactionProvider.begin();
          const handleError = (error: Error, context: TransactionContext) => {
            return Effect.gen(function* () {
              yield* Effect.logError(error);
              yield* transactionProvider.rollback(context);
              return yield* Effect.fail(error);
            });
          };

          return yield* operation().pipe(
            Effect.annotateLogs('transactionId', context.id),
            Effect.flatMap((result) => transactionProvider.commit(context).pipe(Effect.map(() => result))),
            Effect.catchAll((error) => handleError(error, context)),
          );
        });
    }),
  );
}
