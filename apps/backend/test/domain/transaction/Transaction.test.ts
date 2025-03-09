import { assertEquals, assertExists, assertStringIncludes } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { TransactionAggregate } from '../../../src/domain/transaction/Transaction.ts';
import * as Test from '../../helper/TestCommands.ts';

Deno.test('TransactionAggregate', async (t) => {
  const request = Test.createTransaction();

  await t.step('create should create a valid transaction', async () => {
    const result = await Effect.runPromise(TransactionAggregate.create(request));

    assertExists(result.id);
    assertEquals(result.accountId, request.accountId);
    assertEquals(result.amount.amount, 1000);
    assertEquals(result.amount.currency, 'EUR');
    assertEquals(result.description, request.description);
    assertEquals(result.date, request.date);
    assertExists(result.createdAt);
    assertExists(result.updatedAt);
  });

  await t.step('create should reject transaction with whitespace in description', async () => {
    const paramsWithWhitespace = {
      ...request,
      description: ' has whitespace ',
    };

    const error = await Effect.runPromise(
      Effect.flip(TransactionAggregate.create(paramsWithWhitespace)),
    );

    assertStringIncludes(error.toString(), 'Description cannot contain leading or trailing whitespace');
  });

  await t.step('create should reject transaction with empty description', async () => {
    const paramsWithEmptyDesc = {
      ...request,
      description: '',
    };

    const error = await Effect.runPromise(
      Effect.flip(TransactionAggregate.create(paramsWithEmptyDesc)),
    );

    assertStringIncludes(error.toString(), 'Expected a string at least 1 character(s) long, actual ""');
  });

  await t.step('updateCategory should update the category ID', async () => {
    const transaction = await Effect.runPromise(
      TransactionAggregate.create(request),
    );

    const newCategoryId = randomUUID();
    const updated = await Effect.runPromise(
      transaction.updateCategory(newCategoryId),
    );

    assertEquals(updated.categoryId, newCategoryId);
    assertExists(updated.updatedAt);
    assertEquals(updated.amount.amount.toString(), transaction.amount.amount.toString());
    assertEquals(updated.amount.currency, transaction.amount.currency);
  });
});
