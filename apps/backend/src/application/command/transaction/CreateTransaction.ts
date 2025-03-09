import { Context, Effect, Layer } from 'effect';
import { CreateTransactionCommand } from '../../../domain/transaction/commands.ts';
import { TransactionAggregate } from '../../../domain/transaction/Transaction.ts';
import { TransactionRepository } from '../../../domain/transaction/TransactionRepository.ts';
import { EventType } from '../../schema/Event.ts';
import { EventPublisher } from '../EventPublisher.ts';
import { TransactionManager } from '../TransactionManager.ts';

export class CreateTransaction extends Context.Tag('CreateTransaction')<
  CreateTransaction,
  (request: CreateTransactionCommand) => Effect.Effect<TransactionAggregate, Error>
>() {
  static Live = Layer.effect(
    CreateTransaction,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;
      const repository = yield* TransactionRepository;
      const eventPublisher = yield* EventPublisher;

      return (request) =>
        transactionManager(() =>
          Effect.gen(function* () {
            const transaction = yield* TransactionAggregate.create(request);
            const saved = yield* repository.save(transaction);

            yield* eventPublisher.publish({
              type: EventType.TRANSACTION_CREATED,
              payload: saved,
            });

            return saved;
          })
        );
    }),
  );
}
