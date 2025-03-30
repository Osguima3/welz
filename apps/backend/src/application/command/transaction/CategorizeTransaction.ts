import { Context, Effect, Layer } from 'effect';
import { Transaction } from '../../../../../shared/schema/Transaction.ts';
import { CategorizeTransactionCommand } from '../../../domain/transaction/commands.ts';
import { TransactionRepository } from '../../../domain/transaction/TransactionRepository.ts';
import { EventPublisher } from '../EventPublisher.ts';
import { TransactionManager } from '../TransactionManager.ts';

export class CategorizeTransaction extends Context.Tag('CategorizeTransaction')<
  CategorizeTransaction,
  (request: CategorizeTransactionCommand) => Effect.Effect<Transaction, Error>
>() {
  static Live = Layer.effect(
    CategorizeTransaction,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;
      const repository = yield* TransactionRepository;
      const eventPublisher = yield* EventPublisher;

      return (request) =>
        transactionManager(false, () =>
          Effect.gen(function* () {
            const transaction = yield* repository.findById(request.transactionId);
            const previousCategoryId = transaction.categoryId;

            const updated = yield* transaction.updateCategory(request.categoryId);
            const saved = yield* repository.save(updated);

            yield* eventPublisher.publish({
              type: 'TransactionCategorized',
              payload: {
                id: saved.id,
                categoryId: request.categoryId,
                previousCategoryId,
              },
            });

            return saved;
          }));
    }),
  );
}
