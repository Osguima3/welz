import { assertEquals } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { Money } from '../../../../../shared/schema/Money.ts';
import { GetNetWorth } from '../../../../src/application/query/networth/GetNetWorth.ts';
import { AccountRepository } from '../../../../src/domain/account/AccountRepository.ts';
import { CategoryRepository } from '../../../../src/domain/category/CategoryRepository.ts';
import TestAggregates from '../../../helper/TestAggregates.ts';
import { UnitTestLayer } from '../../../helper/TestLayers.ts';
import TestQueries from '../../../helper/TestQueries.ts';

const currentDate = new Date(2025, 3, 19);

const mockAccountHistory = [
  TestAggregates.accountHistory({
    month: currentDate,
    balance: Money.create(1000, 'EUR'),
    monthIncome: Money.create(500, 'EUR'),
    monthExpenses: Money.create(-300, 'EUR'),
  }),
  TestAggregates.accountHistory({
    month: currentDate,
    balance: Money.create(500, 'EUR'),
    monthIncome: Money.create(200, 'EUR'),
    monthExpenses: Money.create(-100, 'EUR'),
  }),
];

const mockCategoryHistory = [
  TestAggregates.categoryHistory({
    month: currentDate,
    type: 'INCOME',
    amount: Money.create(500, 'EUR'),
  }),
  TestAggregates.categoryHistory({
    month: currentDate,
    type: 'INCOME',
    amount: Money.create(200, 'EUR'),
  }),
  TestAggregates.categoryHistory({
    month: currentDate,
    type: 'EXPENSE',
    amount: Money.create(-300, 'EUR'),
  }),
  TestAggregates.categoryHistory({
    month: currentDate,
    type: 'EXPENSE',
    amount: Money.create(-100, 'EUR'),
  }),
];

function createTestEnvironment(accountHistory = mockAccountHistory, categoryHistory = mockCategoryHistory) {
  return Layer.merge(
    Layer.succeed(
      AccountRepository,
      {
        findById: () => Effect.fail(new Error('Not implemented')),
        findAccounts: () => Effect.fail(new Error('Not implemented')),
        findAccountHistory: () => Effect.succeed(accountHistory),
        save: () => Effect.fail(new Error('Not implemented')),
      },
    ),
    Layer.succeed(
      CategoryRepository,
      {
        findById: () => Effect.fail(new Error('Not implemented')),
        findCategories: () => Effect.fail(new Error('Not implemented')),
        findCategoryHistory: () => Effect.succeed(categoryHistory),
      },
    ),
  );
}

Deno.test('GetNetWorth', async (t) => {
  await t.step('should return net worth with account and category data', async () => {
    const getNetWorth = await GetNetWorth.pipe(
      Effect.provide(GetNetWorth.Live),
      Effect.provide(UnitTestLayer),
      Effect.provide(createTestEnvironment()),
      Effect.runPromise,
    );

    const result = await Effect.runPromise(getNetWorth(TestQueries.getNetWorth()));

    assertEquals(result.netWorth, Money.create(1500, 'EUR'));
    assertEquals(result.monthIncome, Money.create(700, 'EUR'));
    assertEquals(result.monthExpenses, Money.create(-400, 'EUR'));
    assertEquals(result.accounts.length, 2);
    assertEquals(result.expenses.length, 2);
    assertEquals(result.incomes.length, 2);

    const account = result.accounts[0];
    assertEquals(account.balance, Money.create(1000, 'EUR'));
    assertEquals(account.monthIncome, Money.create(500, 'EUR'));
    assertEquals(account.monthExpenses, Money.create(-300, 'EUR'));

    const expense = result.expenses[0];
    assertEquals(expense.total, Money.create(-300, 'EUR'));
    assertEquals(expense.type, 'EXPENSE');

    const income = result.incomes[0];
    assertEquals(income.total, Money.create(500, 'EUR'));
    assertEquals(income.type, 'INCOME');
  });

  await t.step('should handle empty history', async () => {
    const getNetWorth = await GetNetWorth.pipe(
      Effect.provide(GetNetWorth.Live),
      Effect.provide(UnitTestLayer),
      Effect.provide(createTestEnvironment([], [])),
      Effect.runPromise,
    );

    const result = await Effect.runPromise(getNetWorth(TestQueries.getNetWorth()));

    assertEquals(result.netWorth, Money.zero('EUR'));
    assertEquals(result.monthIncome, Money.zero('EUR'));
    assertEquals(result.monthExpenses, Money.zero('EUR'));
    assertEquals(result.accounts.length, 0);
    assertEquals(result.expenses.length, 0);
    assertEquals(result.incomes.length, 0);
  });

  await t.step('should handle repository errors', async () => {
    const errorTestEnv = Layer.merge(
      Layer.succeed(
        AccountRepository,
        {
          findById: () => Effect.fail(new Error('Not implemented')),
          findAccounts: () => Effect.fail(new Error('Not implemented')),
          findAccountHistory: () => Effect.fail(new Error('Failed to fetch account history')),
          save: () => Effect.fail(new Error('Not implemented')),
        },
      ),
      Layer.succeed(
        CategoryRepository,
        {
          findById: () => Effect.fail(new Error('Not implemented')),
          findCategories: () => Effect.fail(new Error('Not implemented')),
          findCategoryHistory: () => Effect.fail(new Error('Failed to fetch category history')),
        },
      ),
    );

    const getNetWorth = await GetNetWorth.pipe(
      Effect.provide(GetNetWorth.Live),
      Effect.provide(UnitTestLayer),
      Effect.provide(errorTestEnv),
      Effect.runPromise,
    );

    try {
      await Effect.runPromise(getNetWorth(TestQueries.getNetWorth()));
      throw new Error('Expected error was not thrown');
    } catch (error) {
      if (error instanceof Error) {
        assertEquals(error.message.includes('Failed to fetch'), true);
      } else {
        throw new Error('Unexpected error type');
      }
    }
  });

  await t.step('should aggregate multiple accounts', async () => {
    const multipleAccountsHistory = [
      TestAggregates.accountHistory({
        month: currentDate,
        balance: Money.create(1000, 'EUR'),
        monthIncome: Money.create(500, 'EUR'),
        monthExpenses: Money.create(300, 'EUR'),
      }),
      TestAggregates.accountHistory({
        month: currentDate, // Same month
        balance: Money.create(500, 'EUR'),
        monthIncome: Money.create(200, 'EUR'),
        monthExpenses: Money.create(100, 'EUR'),
      }),
    ];

    const getNetWorth = await GetNetWorth.pipe(
      Effect.provide(GetNetWorth.Live),
      Effect.provide(UnitTestLayer),
      Effect.provide(createTestEnvironment(multipleAccountsHistory, [])),
      Effect.runPromise,
    );

    const result = await Effect.runPromise(getNetWorth(TestQueries.getNetWorth()));

    assertEquals(result.monthIncome, Money.create(700, 'EUR'));
    assertEquals(result.monthExpenses, Money.create(400, 'EUR'));
    assertEquals(result.netWorth, Money.create(1500, 'EUR'));
  });
});
