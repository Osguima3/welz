import { Context, Effect, Layer } from 'effect';
import { GetAccountTransactionsQuery } from '../../../domain/transaction/queries.ts';
import { TransactionPage, TransactionRepository } from '../../../domain/transaction/TransactionRepository.ts';
import { TransactionManager } from '../../command/TransactionManager.ts';

export class GetAccountTransactions extends Context.Tag('GetAccountTransactions')<
  GetAccountTransactions,
  (query: GetAccountTransactionsQuery) => Effect.Effect<TransactionPage, Error>
>() {
  static Live = Layer.effect(
    GetAccountTransactions,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;
      const repository = yield* TransactionRepository;

      return (query) =>
        transactionManager(() =>
          Effect.gen(function* () {
            return yield* repository.findTransactions({
              accountId: query.accountId,
              startDate: query.dateRange?.start,
              endDate: query.dateRange?.end,
              categoryId: query.categoryId,
              page: query.page,
              pageSize: query.pageSize,
            });
          })
        );
    }),
  );
}
