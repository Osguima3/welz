import { Transaction } from '@shared/schema/Transaction.ts';
import { Context, Effect, Layer, ParseResult } from 'effect';
import { randomUUID } from 'node:crypto';
import { CreateTransactionCommand } from '../../../domain/transaction/commands.ts';
import { TransactionRepository } from '../../../domain/transaction/TransactionRepository.ts';
import { EventPublisher } from '../EventPublisher.ts';
import { TransactionManager } from '../TransactionManager.ts';

export class CreateTransaction extends Context.Tag('CreateTransaction')<
  CreateTransaction,
  (request: CreateTransactionCommand) => Effect.Effect<Transaction, Error>
>() {
  static Live = Layer.effect(
    CreateTransaction,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;
      const repository = yield* TransactionRepository;
      const eventPublisher = yield* EventPublisher;

      return (request) =>
        transactionManager(false, () =>
          Effect.gen(function* () {
            const id = randomUUID();
            const createdAt = new Date();
            const transaction = yield* Effect.try({
              try: () => Transaction.make({ ...request, id, createdAt, updatedAt: createdAt }),
              catch: (error) => error as ParseResult.ParseError,
            });

            const saved = yield* repository.save(transaction);

            yield* eventPublisher.publish({ type: 'TransactionCreated', payload: saved });

            return saved;
          }));
    }),
  );
}
