import { assertEquals, assertExists, assertGreater } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { Account } from '../../../../shared/schema/Account.ts';
import { Money } from '../../../../shared/schema/Money.ts';
import { TransactionManager } from '../../../src/application/command/TransactionManager.ts';
import { AccountRepository } from '../../../src/domain/account/AccountRepository.ts';
import { ReadModelRepository } from '../../../src/domain/readmodel/ReadModelRepository.ts';
import { IntegrationTestLayer } from '../../helper/TestLayers.ts';

const CASH_WALLET_ID = 'b26b6d1c-5c28-49f3-8672-a366a623670c';

Deno.test('PostgresAccountRepository Integration', async (t) => {
  let repository: Effect.Effect.Success<typeof AccountRepository>;
  let readModelRepository: Effect.Effect.Success<typeof ReadModelRepository>;
  let transactionManager: Effect.Effect.Success<typeof TransactionManager>;

  function runTransaction<T>(operation: Effect.Effect<T, Error>): Promise<T> {
    return Effect.runPromise(transactionManager(true, () => operation));
  }

  await t.step('setup', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        repository = yield* AccountRepository;
        readModelRepository = yield* ReadModelRepository;
        transactionManager = yield* TransactionManager;
      }).pipe(
        Effect.provide(IntegrationTestLayer),
      ),
    );
  });

  await t.step('should find all accounts', async () => {
    const result = await runTransaction(repository.findAccounts());

    assertEquals(result.total, 4);
    assertEquals(result.items.length, 4);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);

    const accountIds = result.items.map((a) => a.id);
    assertEquals(accountIds.includes(CASH_WALLET_ID), true);
  });

  await t.step('should paginate accounts', async () => {
    const { firstPage, secondPage } = await runTransaction(
      Effect.gen(function* () {
        const firstPage = yield* repository.findAccounts({ page: 1, pageSize: 3 });
        const secondPage = yield* repository.findAccounts({ page: 2, pageSize: 3 });
        return { firstPage, secondPage };
      }),
    );

    assertEquals(firstPage.total, 4);
    assertEquals(firstPage.items.length, 3);
    assertEquals(firstPage.page, 1);
    assertEquals(firstPage.pageSize, 3);

    assertEquals(secondPage.total, 4);
    assertEquals(secondPage.items.length, 1);
    assertEquals(secondPage.page, 2);
    assertEquals(secondPage.pageSize, 3);
  });

  await t.step('should find account by id', async () => {
    const result = await runTransaction(repository.findById(CASH_WALLET_ID));
    assertEquals(result.id, CASH_WALLET_ID);
    assertEquals(result.name, 'Cash Wallet');
    assertEquals(result.type, 'CASH');
  });

  await t.step('should update existing account', async () => {
    const account = await runTransaction(repository.findById(CASH_WALLET_ID));

    const updatedBalance = Money.create(2000, 'EUR');
    const now = new Date();
    const updatedAccount = Account.make({
      ...account,
      balance: updatedBalance,
      updatedAt: now,
    });

    const result = await runTransaction(repository.save(updatedAccount));

    assertEquals(result.id, account.id);
    assertEquals(result.balance.amount, updatedBalance.amount);
    assertEquals(result.balance.currency, updatedBalance.currency);

    await runTransaction(repository.save(account));
  });

  await t.step('should get account history data', async () => {
    await runTransaction(readModelRepository.refreshMaterializedViews());

    const months = 6;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const result = await runTransaction(repository.findAccountHistory({
      dateRange: { start: startDate, end: now },
    }));

    assertExists(result);
    assertGreater(result.length, 0);

    const firstAccount = result[0];
    assertEquals('month' in firstAccount, true);
    assertEquals('accountId' in firstAccount, true);
    assertEquals('name' in firstAccount, true);
    assertEquals('type' in firstAccount, true);
    assertEquals('lastUpdated' in firstAccount, true);
    assertEquals('balance' in firstAccount, true);
    assertEquals('monthBalance' in firstAccount, true);
    assertEquals('monthIncome' in firstAccount, true);
    assertEquals('monthExpenses' in firstAccount, true);

    const monthAccounts = result.filter((a) => a.month.toISOString() === result[0].month.toISOString());
    monthAccounts.forEach((account) => {
      const monthChange = account.monthIncome.amount + account.monthExpenses.amount;
      assertEquals(account.monthBalance.amount, monthChange);
      assertEquals(typeof account.monthBalance.amount === 'number', true);
    });

    const oldestMonth = result[result.length - 1].month;
    const threshold = new Date(now.getFullYear(), now.getMonth() - months, 1);
    assertEquals(oldestMonth >= threshold, true);
  });
});
