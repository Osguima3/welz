import { assertEquals, assertExists, assertStringIncludes } from '$std/assert/mod.ts';
import { Transaction } from '@shared/schema/Transaction.ts';
import { Effect, ParseResult } from 'effect';
import { randomUUID } from 'node:crypto';
import { CreateTransactionCommand } from '../../../src/domain/transaction/commands.ts';
import TestCommands from '../../helper/TestCommands.ts';

Deno.test('TransactionAggregate', async (t) => {
  const request = TestCommands.createTransaction();

  function createTransaction(request: CreateTransactionCommand) {
    const id = randomUUID();
    const createdAt = new Date();
    return Effect.try({
      try: () => Transaction.make({ ...request, id, createdAt, updatedAt: createdAt }),
      catch: (error) => error as ParseResult.ParseError,
    });
  }

  await t.step('create should create a valid transaction', async () => {
    const result = await createTransaction(request).pipe(Effect.runPromise);

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
    const paramsWithWhitespace = { ...request, description: ' has whitespace ' };

    const error = await createTransaction(paramsWithWhitespace).pipe(Effect.flip, Effect.runPromise);

    assertStringIncludes(error.toString(), 'Description cannot contain leading or trailing whitespace');
  });

  await t.step('create should reject transaction with empty description', async () => {
    const paramsWithEmptyDesc = { ...request, description: '' };

    const error = await createTransaction(paramsWithEmptyDesc).pipe(Effect.flip, Effect.runPromise);

    assertStringIncludes(error.toString(), 'Expected a string at least 1 character(s) long, actual ""');
  });

  await t.step('updateCategory should update the category ID', async () => {
    const transaction = await createTransaction(request).pipe(Effect.runPromise);

    const newCategoryId = randomUUID();
    const updated = await transaction.updateCategory(newCategoryId).pipe(Effect.runPromise);

    assertEquals(updated.categoryId, newCategoryId);
    assertExists(updated.updatedAt);
    assertEquals(updated.amount.amount.toString(), transaction.amount.amount.toString());
    assertEquals(updated.amount.currency, transaction.amount.currency);
  });
});
