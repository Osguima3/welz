import { assert, assertEquals, assertExists, assertStringIncludes } from '$std/assert/mod.ts';
import { Effect, Layer, Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { CreateTransaction } from '../../../../src/application/command/transaction/CreateTransaction.ts';
import { TransactionCreatedEvent } from '../../../../src/domain/transaction/events.ts';
import { TransactionRepository } from '../../../../src/domain/transaction/TransactionRepository.ts';
import TestCommands from '../../../helper/TestCommands.ts';
import { TestEventPublisher } from '../../../helper/TestEventPublisherLayers.ts';
import { UnitTestLayer } from '../../../helper/TestLayers.ts';

const accountId = randomUUID();
const publisherFailedAccountId = randomUUID();

const transaction = TestCommands.createTransaction(accountId);
const failedTransaction = TestCommands.createTransaction(publisherFailedAccountId);

const TestTransactionRepository = Layer.succeed(
  TransactionRepository,
  {
    findTransactions: () => Effect.fail(new Error('Not implemented')),
    findById: () => Effect.fail(new Error('Not implemented')),
    save: (transaction) => Effect.succeed(transaction),
  },
);

Deno.test('CreateTransaction', async (t) => {
  const createTransaction = await CreateTransaction.pipe(
    Effect.provide(CreateTransaction.Live),
    Effect.provide(UnitTestLayer),
    Effect.provide(TestTransactionRepository),
    Effect.runPromise,
  );

  await t.step('should successfully create a transaction with valid input', async () => {
    TestEventPublisher.reset();

    const result = await Effect.runPromise(createTransaction(transaction));

    assertExists(result);
    assertEquals(accountId, transaction.accountId);

    assertEquals(TestEventPublisher.count(), 1, 'Event publisher should be called once');

    const event = TestEventPublisher.popEvent();
    assert(Schema.is(TransactionCreatedEvent)(event));
  });

  await t.step('should fail when event publisher fails', async () => {
    TestEventPublisher.setFail(true);

    const error = await Effect.runPromise(createTransaction(failedTransaction).pipe(Effect.flip));

    assertStringIncludes(error.message, 'Failed to publish event');
  });

  await t.step('teardown', () => {
    TestEventPublisher.reset();
  });
});
