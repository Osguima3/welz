import { Context, Effect, Layer } from 'effect';
import { Money } from '../../../../../shared/schema/Money.ts';
import { NetWorth } from '../../../../../shared/schema/NetWorth.ts';
import { AccountRepository } from '../../../domain/account/AccountRepository.ts';
import { CategoryRepository } from '../../../domain/category/CategoryRepository.ts';
import { GetNetWorthQuery } from '../../../domain/networth/queries.ts';
import { TransactionManager } from '../../command/TransactionManager.ts';

export class GetNetWorth extends Context.Tag('GetNetWorth')<
  GetNetWorth,
  (query: GetNetWorthQuery) => Effect.Effect<NetWorth, Error>
>() {
  static Live = Layer.effect(
    GetNetWorth,
    Effect.gen(function* (_) {
      const transactionManager = yield* TransactionManager;
      const accountRepository = yield* AccountRepository;
      const categoryRepository = yield* CategoryRepository;

      return ({ maxCategories = 3 }) =>
        transactionManager(true, () =>
          Effect.gen(function* () {
            const zero = Money.zero('EUR');
            const end = new Date();
            const start = new Date(end.getFullYear(), end.getMonth(), 1);

            const [accountHistory, categoryHistory] = yield* Effect.all([
              accountRepository.findAccountHistory({ dateRange: { start, end } }),
              categoryRepository.findCategoryHistory({ dateRange: { start, end }, maxCategories }),
            ]);

            return {
              netWorth: accountHistory.reduce(Money.reduceAdd('balance'), zero),
              monthIncome: accountHistory.reduce(Money.reduceAdd('monthIncome'), zero),
              monthExpenses: accountHistory.reduce(Money.reduceAdd('monthExpenses'), zero),
              accounts: accountHistory,
              expenses: categoryHistory.filter((c) => c.type === 'EXPENSE' && c.typePercentage > 0),
              incomes: categoryHistory.filter((c) => c.type === 'INCOME' && c.typePercentage > 0),
            };
          }));
    }),
  );
}
