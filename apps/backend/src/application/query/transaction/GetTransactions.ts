import { Context, Effect, Layer } from 'effect';
import { TransactionPage } from '../../../../../shared/schema/Transaction.ts';
import { GetTransactionsQuery } from '../../../domain/transaction/queries.ts';
import { TransactionRepository } from '../../../domain/transaction/TransactionRepository.ts';
import { TransactionManager } from '../../command/TransactionManager.ts';

export class GetTransactions extends Context.Tag('GetTransactions')<
  GetTransactions,
  (query: GetTransactionsQuery) => Effect.Effect<TransactionPage, Error>
>() {
  static Live = Layer.effect(
    GetTransactions,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;
      const repository = yield* TransactionRepository;

      return (query) =>
        transactionManager(
          true,
          () => repository.findTransactions({ ...query, dateRange: { start: query.start, end: query.end } }),
        );
    }),
  );
}
