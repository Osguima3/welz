import { assertEquals } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { Transaction } from '../../../../shared/schema/Transaction.ts';
import { TransactionManager } from '../../../src/application/command/TransactionManager.ts';
import { CategoryRepository } from '../../../src/domain/category/CategoryRepository.ts';
import { TransactionRepository } from '../../../src/domain/transaction/TransactionRepository.ts';
import TestAggregates from '../../helper/TestAggregates.ts';
import { TestDataHelper } from '../../helper/TestDataHelper.ts';
import { IntegrationTestLayer } from '../../helper/TestLayers.ts';

Deno.test('PostgresTransactionRepository Integration', async (t) => {
  const testAccountId = randomUUID();
  const alternateAccountId = randomUUID();
  const testTransactionId = randomUUID();
  let categoryId: string;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  let testDataHelper: Effect.Effect.Success<typeof TestDataHelper>;
  let repository: Effect.Effect.Success<typeof TransactionRepository>;
  let transactionManager: Effect.Effect.Success<typeof TransactionManager>;
  let categoryRepository: Effect.Effect.Success<typeof CategoryRepository>;

  function runTransaction<T>(operation: Effect.Effect<T, Error>): Promise<T> {
    return Effect.runPromise(transactionManager(true, () => operation));
  }

  await t.step('setup', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        testDataHelper = yield* TestDataHelper;
        repository = yield* TransactionRepository;
        transactionManager = yield* TransactionManager;
        categoryRepository = yield* CategoryRepository;
      }).pipe(
        Effect.provide(IntegrationTestLayer),
      ),
    );

    const categories = await runTransaction(categoryRepository.findCategories());
    if (categories.items.length === 0) throw new Error('No categories found');
    categoryId = categories.items[0].id;

    await testDataHelper.createAccount(testAccountId);
    await testDataHelper.createAccount(alternateAccountId);
    await testDataHelper.createTransaction(testTransactionId, testAccountId, categoryId);

    for (const accountId of [testAccountId, alternateAccountId]) {
      for (let i = 0; i < 3; i++) {
        await testDataHelper.createTransaction(randomUUID(), accountId, i % 2 == 0 ? categoryId : undefined);
      }
    }
  });

  await t.step('should find all transactions for an account', async () => {
    const result = await runTransaction(repository.findTransactions({ accountId: testAccountId }));

    assertEquals(result.total, 4);
    assertEquals(result.items.length, 4);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);

    result.items.forEach((item) => assertEquals(item.accountId, testAccountId));
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
    assertEquals(firstPage.items.length, 3);
    assertEquals(firstPage.page, 1);
    assertEquals(firstPage.pageSize, 3);

    assertEquals(secondPage.total, 4);
    assertEquals(secondPage.items.length, 1);
    assertEquals(secondPage.page, 2);
    assertEquals(secondPage.pageSize, 3);
  });

  await t.step('should filter transactions with start date', async () => {
    const result = await runTransaction(repository.findTransactions({
      accountId: testAccountId,
      dateRange: { start: yesterday },
    }));

    assertEquals(result.total, 4);
    assertEquals(result.items.length, 4);
  });

  await t.step('should include all transactions up to end date', async () => {
    const result = await runTransaction(repository.findTransactions({
      accountId: testAccountId,
      dateRange: { end: tomorrow },
    }));

    assertEquals(result.total, 4);
    assertEquals(result.items.length, 4);
  });

  await t.step('should return empty result for past end date', async () => {
    const result = await runTransaction(repository.findTransactions({
      accountId: testAccountId,
      dateRange: { end: yesterday },
    }));

    assertEquals(result.total, 0);
    assertEquals(result.items.length, 0);
  });

  await t.step('should return empty result for future start date', async () => {
    const result = await runTransaction(repository.findTransactions({
      accountId: testAccountId,
      dateRange: { start: tomorrow },
    }));

    assertEquals(result.total, 0);
    assertEquals(result.items.length, 0);
  });

  await t.step('should filter transactions within date range', async () => {
    const result = await runTransaction(repository.findTransactions({
      accountId: testAccountId,
      dateRange: { start: yesterday, end: tomorrow },
    }));

    assertEquals(result.total, 4);
    assertEquals(result.items.length, 4);
  });

  await t.step('should filter transactions by category', async () => {
    const result = await runTransaction(
      repository.findTransactions({ accountId: testAccountId, categoryId }),
    );

    assertEquals(result.total, 3);
    assertEquals(result.items.length, 3);

    result.items.forEach((item) => assertEquals(item.categoryId, categoryId));
  });

  await t.step('should return empty array when no transactions match', async () => {
    const result = await runTransaction(
      repository.findTransactions({ accountId: testAccountId, categoryId: randomUUID() }),
    );

    assertEquals(result.total, 0);
    assertEquals(result.items.length, 0);
  });

  await t.step('should sort transactions by date in descending order', async () => {
    const result = await runTransaction(repository.findTransactions({ accountId: testAccountId }));

    const dates = result.items.map((t) => t.date.getTime());
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
      transactionManager(false, () => repository.findById(transactionId)).pipe(Effect.flip),
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
    const updatedTransaction = Transaction.make({
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

  await t.step('cleanup', () => testDataHelper.cleanup([testAccountId, alternateAccountId]));
});
