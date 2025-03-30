import { assertEquals } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { GetAccounts } from '../../../../src/application/query/account/GetAccounts.ts';
import { AccountRepository } from '../../../../src/domain/account/AccountRepository.ts';
import TestAggregates from '../../../helper/TestAggregates.ts';
import { UnitTestLayer } from '../../../helper/TestLayers.ts';
import TestQueries from '../../../helper/TestQueries.ts';

const mockAccounts = [
  TestAggregates.account({ name: 'Cash Wallet', type: 'CASH' }),
  TestAggregates.account({ name: 'Bank Account', type: 'BANK' }),
];

const TestAccountRepository = Layer.succeed(
  AccountRepository,
  {
    findById: () => Effect.fail(new Error('Not implemented')),
    findAccounts: () => Effect.succeed({ items: mockAccounts, total: 2, page: 1, pageSize: 10 }),
    save: () => Effect.fail(new Error('Not implemented')),
  },
);

Deno.test('GetAccounts', async (t) => {
  const getAccounts = await GetAccounts.pipe(
    Effect.provide(GetAccounts.Live),
    Effect.provide(UnitTestLayer),
    Effect.provide(TestAccountRepository),
    Effect.runPromise,
  );

  await t.step('should return all accounts', async () => {
    const result = await Effect.runPromise(getAccounts(TestQueries.getAccounts()));

    assertEquals(result.items.length, 2);
    assertEquals(result.total, 2);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);

    const cashAccount = result.items[0];
    assertEquals(cashAccount.name, 'Cash Wallet');
    assertEquals(cashAccount.type, 'CASH');

    const bankAccount = result.items[1];
    assertEquals(bankAccount.name, 'Bank Account');
    assertEquals(bankAccount.type, 'BANK');
  });
});
