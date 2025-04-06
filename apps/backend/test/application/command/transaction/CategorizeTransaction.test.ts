import { assertEquals, assertExists } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { randomUUID } from 'node:crypto';
import { CategorizeTransaction } from '../../../../src/application/command/transaction/CategorizeTransaction.ts';
import { TransactionRepository } from '../../../../src/domain/transaction/TransactionRepository.ts';
import { TransactionCategorizedEvent } from '../../../../src/domain/transaction/events.ts';
import TestAggregates from '../../../helper/TestAggregates.ts';
import TestCommands from '../../../helper/TestCommands.ts';
import { TestEventPublisher } from '../../../helper/TestEventPublisherLayers.ts';
import { UnitTestLayer } from '../../../helper/TestLayers.ts';

const transactionId = randomUUID();
const categoryId = randomUUID();

const mockTransaction = TestAggregates.transaction({ id: transactionId });

const TestTransactionRepository = Layer.succeed(
  TransactionRepository,
  {
    findTransactions: () => Effect.fail(new Error('Not implemented')),
    findById: () => Effect.succeed(mockTransaction),
    save: (transaction) => Effect.succeed(transaction),
  },
);

Deno.test('CategorizeTransaction', async (t) => {
  const categorizeTransaction = await CategorizeTransaction.pipe(
    Effect.provide(CategorizeTransaction.Live),
    Effect.provide(UnitTestLayer),
    Effect.provide(TestTransactionRepository),
    Effect.runPromise,
  );

  await t.step('should successfully categorize a transaction', async () => {
    TestEventPublisher.reset();

    const command = TestCommands.categorizeTransaction(transactionId, categoryId);

    const result = await Effect.runPromise(categorizeTransaction(command));

    assertExists(result);
    assertEquals(result.categoryId, categoryId);

    assertEquals(TestEventPublisher.count(), 1, 'Event publisher should be called once');

    const event = TestEventPublisher.popEvent() as TransactionCategorizedEvent;
    assertEquals(event.type, 'TransactionCategorized');
    assertEquals(event.payload.categoryId, categoryId);
  });

  await t.step('teardown', () => {
    TestEventPublisher.reset();
  });
});
