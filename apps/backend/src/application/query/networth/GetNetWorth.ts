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

      return ({ monthsOfHistory = 6, maxCategories = 3 }) =>
        transactionManager(true, () =>
          Effect.gen(function* () {
            const zero = Money.zero('EUR');
            const end = new Date();
            const start = new Date(end.getFullYear(), end.getMonth() - monthsOfHistory + 1, 1);

            const [accountHistory, categoryHistory] = yield* Effect.all([
              accountRepository.findAccountHistory({ dateRange: { start, end } }),
              categoryRepository.findCategoryHistory({ dateRange: { start, end }, maxCategories }),
            ]);

            const latestMonth = accountHistory[0]?.month ?? end;
            const latestAccounts = accountHistory
              .filter((a) => a.month.getTime() === latestMonth.getTime())
              .map((a) => ({
                ...a,
                totalIncome: a.monthIncome,
                totalExpenses: a.monthExpenses,
              }));
            const latestCategories = categoryHistory
              .filter((c) => c.month.getTime() === latestMonth.getTime());

            const monthlyTrends = accountHistory.length > 0
              ? [...new Set(accountHistory.map((a) => a.month.getTime()))]
                .sort((a, b) => b - a)
                .map((timestamp) => {
                  const month = new Date(timestamp);
                  const accountMonths = accountHistory.filter((c) => c.month.getTime() === timestamp);
                  return {
                    month,
                    balance: accountMonths.reduce(Money.reduceAdd('balance'), zero),
                    income: accountMonths.reduce(Money.reduceAdd('monthIncome'), zero),
                    expenses: accountMonths.reduce(Money.reduceAdd('monthExpenses'), zero),
                  };
                })
              : [];

            return {
              netWorth: monthlyTrends[0]?.balance ?? zero,
              accounts: latestAccounts,
              expenses: latestCategories.filter((c) => c.type === 'EXPENSE'),
              incomes: latestCategories.filter((c) => c.type === 'INCOME'),
              monthlyTrends,
            };
          }));
    }),
  );
}
