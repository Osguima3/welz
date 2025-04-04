import { assertEquals } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { GetAccountHistory } from '../../../../src/application/query/account/GetAccountHistory.ts';
import { AccountRepository } from '../../../../src/domain/account/AccountRepository.ts';
import { Money } from '../../../../../shared/schema/Money.ts';
import TestAggregates from '../../../helper/TestAggregates.ts';
import { UnitTestLayer } from '../../../helper/TestLayers.ts';

const mockHistory = [
  TestAggregates.accountHistory({
    month: new Date(2025, 3, 1),
    balance: Money.create(1000, 'EUR'),
    monthIncome: Money.create(500, 'EUR'),
    monthExpenses: Money.create(300, 'EUR'),
  }),
  TestAggregates.accountHistory({
    month: new Date(2025, 2, 1),
    balance: Money.create(800, 'EUR'),
    monthIncome: Money.create(400, 'EUR'),
    monthExpenses: Money.create(200, 'EUR'),
  }),
];

const TestAccountRepository = Layer.succeed(
  AccountRepository,
  {
    findById: () => Effect.fail(new Error('Not implemented')),
    findAccounts: () => Effect.fail(new Error('Not implemented')),
    findAccountHistory: () => Effect.succeed(mockHistory),
    save: () => Effect.fail(new Error('Not implemented')),
  },
);

Deno.test('GetAccountHistory', async (t) => {
  const getAccountHistory = await GetAccountHistory.pipe(
    Effect.provide(GetAccountHistory.Live),
    Effect.provide(UnitTestLayer),
    Effect.provide(TestAccountRepository),
    Effect.runPromise,
  );

  await t.step('should return account history', async () => {
    const result = await Effect.runPromise(
      getAccountHistory({
        type: 'GetAccountHistory',
        accountId: '123',
        start: new Date(2025, 2, 1),
        end: new Date(2025, 3, 1),
      }),
    );

    assertEquals(result.length, 2);

    const latestMonth = result[0];
    assertEquals(latestMonth.month.getFullYear(), 2025);
    assertEquals(latestMonth.month.getMonth(), 3);
    assertEquals(latestMonth.balance, Money.create(1000, 'EUR'));
    assertEquals(latestMonth.monthIncome, Money.create(500, 'EUR'));
    assertEquals(latestMonth.monthExpenses, Money.create(300, 'EUR'));

    const previousMonth = result[1];
    assertEquals(previousMonth.month.getFullYear(), 2025);
    assertEquals(previousMonth.month.getMonth(), 2);
    assertEquals(previousMonth.balance, Money.create(800, 'EUR'));
    assertEquals(previousMonth.monthIncome, Money.create(400, 'EUR'));
    assertEquals(previousMonth.monthExpenses, Money.create(200, 'EUR'));
  });
});
