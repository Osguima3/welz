import { Context, Effect, Layer, Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { EventType } from '../../schema/Event.ts';
import { CreateTransactionCommand } from '../../schema/Transaction.ts';
import { EventPublisher } from '../EventPublisher.ts';
import { TransactionBoundary } from '../TransactionBoundary.ts';

export class CreateTransaction extends Context.Tag('CreateTransaction')<
  CreateTransaction,
  (request: Schema.Schema.Type<typeof CreateTransactionCommand>) => Effect.Effect<unknown, Error>
>() {
  static Live = Layer.effect(
    CreateTransaction,
    Effect.gen(function* () {
      const transactionBoundary = yield* TransactionBoundary;
      const eventPublisher = yield* EventPublisher;

      return (request) =>
        Effect.gen(function* () {
          return yield* transactionBoundary(() =>
            Effect.gen(function* () {
              const transaction = {
                id: randomUUID(),
                ...request,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              yield* eventPublisher.publish({
                type: EventType.TRANSACTION_CREATED,
                payload: {
                  transactionId: transaction.id,
                  accountId: transaction.accountId,
                  amount: transaction.amount,
                  date: transaction.date,
                  description: transaction.description,
                  category: transaction.category,
                },
                metadata: {
                  timestamp: new Date().toISOString(),
                },
              });

              return transaction;
            })
          );
        });
    }),
  );
}
