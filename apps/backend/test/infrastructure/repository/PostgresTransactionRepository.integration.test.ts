import { assertEquals } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { TransactionManager } from '../../../src/application/command/TransactionManager.ts';
import { TransactionAggregate } from '../../../src/domain/transaction/Transaction.ts';
import { TransactionRepository } from '../../../src/domain/transaction/TransactionRepository.ts';
import * as TestAggregates from '../../helper/TestAggregates.ts';
import { TestDataHelper } from '../../helper/TestDataHelper.ts';
import { IntegrationTestLayer } from '../../helper/TestLayers.ts';

Deno.test('PostgresTransactionRepository Integration', async (t) => {
  const testAccountId = randomUUID();
  const testCategoryId = randomUUID();
  const alternateAccountId = randomUUID();
  const testTransactionId = randomUUID();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  let testDataHelper: Effect.Effect.Success<typeof TestDataHelper>;
  let repository: Effect.Effect.Success<typeof TransactionRepository>;
  let transactionManager: Effect.Effect.Success<typeof TransactionManager>;

  function runTransaction<T>(operation: Effect.Effect<T, Error>): Promise<T> {
    return Effect.runPromise(transactionManager(() => operation));
  }

  await t.step('setup', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        testDataHelper = yield* TestDataHelper;
        repository = yield* TransactionRepository;
        transactionManager = yield* TransactionManager;
      }).pipe(
        Effect.provide(IntegrationTestLayer),
      ),
    );

    await testDataHelper.createAccount(testAccountId);
    await testDataHelper.createAccount(alternateAccountId);
    await testDataHelper.createCategory(testCategoryId);
    await testDataHelper.createTransaction(testTransactionId, testAccountId, testCategoryId);

    for (const accountId of [testAccountId, alternateAccountId]) {
      for (let i = 0; i < 3; i++) {
        await testDataHelper.createTransaction(randomUUID(), accountId, i % 2 == 0 ? testCategoryId : undefined);
      }
    }
  });

  await t.step('should find all transactions for an account', async () => {
    const result = await runTransaction(repository.findTransactions({ accountId: testAccountId }));

    assertEquals(result.total, 4);
    assertEquals(result.transactions.length, 4);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);

    // Verify all transactions belong to test account
    result.transactions.forEach((transaction) => {
      assertEquals(transaction.accountId, testAccountId);
    });
  });

  await t.step('should paginate transactions', async () => {
    const { firstPage, secondPage } = await runTransaction(
      Effect.gen(function* () {
        const firstPage = yield* repository.findTransactions({ accountId: testAccountId, page: 1, pageSize: 3 });
        const secondPage = yield* repository.findTransactions({ accountId: testAccountId, page: 2, pageSize: 3 });
        return { firstPage, secondPage };
      }),
    );

    assertEquals(firstPage.total, 4);
    assertEquals(firstPage.transactions.length, 3);
    assertEquals(firstPage.page, 1);
    assertEquals(firstPage.pageSize, 3);

    assertEquals(secondPage.total, 4);
    assertEquals(secondPage.transactions.length, 1);
    assertEquals(secondPage.page, 2);
    assertEquals(secondPage.pageSize, 3);
  });

  await t.step('should filter transactions with start date', async () => {
    const result = await runTransaction(repository.findTransactions({
      accountId: testAccountId,
      startDate: yesterday,
    }));

    assertEquals(result.total, 4);
    assertEquals(result.transactions.length, 4);
  });

  await t.step('should include all transactions up to end date', async () => {
    const result = await runTransaction(repository.findTransactions({
      accountId: testAccountId,
      endDate: tomorrow,
    }));

    assertEquals(result.total, 4);
    assertEquals(result.transactions.length, 4);
  });

  await t.step('should return empty result for past end date', async () => {
    const result = await runTransaction(repository.findTransactions({
      accountId: testAccountId,
      endDate: yesterday,
    }));

    assertEquals(result.total, 0);
    assertEquals(result.transactions.length, 0);
  });

  await t.step('should return empty result for future start date', async () => {
    const result = await runTransaction(repository.findTransactions({
      accountId: testAccountId,
      startDate: tomorrow,
    }));

    assertEquals(result.total, 0);
    assertEquals(result.transactions.length, 0);
  });

  await t.step('should filter transactions within date range', async () => {
    const result = await runTransaction(repository.findTransactions({
      accountId: testAccountId,
      startDate: yesterday,
      endDate: tomorrow,
    }));

    assertEquals(result.total, 4);
    assertEquals(result.transactions.length, 4);
  });

  await t.step('should filter transactions by category', async () => {
    const result = await runTransaction(
      repository.findTransactions({ accountId: testAccountId, categoryId: testCategoryId }),
    );

    assertEquals(result.total, 3);
    assertEquals(result.transactions.length, 3);

    result.transactions.forEach((transaction) => {
      assertEquals(transaction.categoryId, testCategoryId);
    });
  });

  await t.step('should return empty array when no transactions match', async () => {
    const result = await runTransaction(
      repository.findTransactions({ accountId: testAccountId, categoryId: randomUUID() }),
    );

    assertEquals(result.total, 0);
    assertEquals(result.transactions.length, 0);
  });

  await t.step('should sort transactions by date in descending order', async () => {
    const result = await runTransaction(repository.findTransactions({ accountId: testAccountId }));

    const dates = result.transactions.map((t) => t.date.getTime());
    const sortedDates = [...dates].sort((a, b) => b - a);
    assertEquals(dates, sortedDates);
  });

  await t.step('should find transaction by id', async () => {
    const result = await runTransaction(repository.findById(testTransactionId));

    assertEquals(result.accountId, testAccountId);
  });

  await t.step('should fail to find non-existent transaction', async () => {
    const transactionId = randomUUID();
    const error = await Effect.runPromise(
      transactionManager(() => repository.findById(transactionId)).pipe(Effect.flip),
    );

    assertEquals(error.message, `Transaction not found: ${transactionId}`);
  });

  await t.step('should save new transaction', async () => {
    const transaction = TestAggregates.transaction({ accountId: testAccountId });

    const result = await runTransaction(repository.save(transaction));

    assertEquals(result.id, transaction.id);
    assertEquals(result.accountId, testAccountId);
    assertEquals(result.amount.amount, 1000);
    assertEquals(result.amount.currency, 'EUR');
    assertEquals(result.description, 'Test transaction');

    const saved = await runTransaction(repository.findById(transaction.id));

    assertEquals(saved.id, transaction.id);
  });

  await t.step('should update existing transaction', async () => {
    const transaction = await runTransaction(repository.findById(testTransactionId));

    const updatedDescription = 'Updated Description';
    const now = new Date();
    const updatedTransaction = TransactionAggregate.make({
      ...transaction,
      description: updatedDescription,
      updatedAt: now,
    });

    const result = await runTransaction(repository.save(updatedTransaction));

    assertEquals(result.id, transaction.id);
    assertEquals(result.description, updatedDescription);
    assertEquals(result.accountId, transaction.accountId);
    assertEquals(result.amount.amount, transaction.amount.amount);
    assertEquals(result.amount.currency, transaction.amount.currency);
  });

  await t.step('cleanup', () => testDataHelper.cleanup([testAccountId, alternateAccountId], [testCategoryId]));
});
