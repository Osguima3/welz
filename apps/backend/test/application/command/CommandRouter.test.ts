import { assertInstanceOf, assertStringIncludes } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { randomUUID } from 'node:crypto';
import { CommandRouter } from '../../../src/application/command/CommandRouter.ts';
import { CategorizeTransaction } from '../../../src/application/command/transaction/CategorizeTransaction.ts';
import { CreateTransaction } from '../../../src/application/command/transaction/CreateTransaction.ts';
import { Command } from '../../../src/application/schema/Command.ts';
import TestAggregates from '../../helper/TestAggregates.ts';
import TestCommands from '../../helper/TestCommands.ts';

const invalidAccountId = randomUUID();
const createCommand = TestCommands.createTransaction();
const categorizeCommand = TestCommands.categorizeTransaction();
const invalidCommand = TestCommands.createTransaction(invalidAccountId);

const mockTransaction = TestAggregates.transaction();

const TestCreateTransaction = Layer.succeed(
  CreateTransaction,
  (command) =>
    command.accountId === invalidAccountId
      ? Effect.fail(new Error('Failed to create transaction'))
      : Effect.succeed(mockTransaction),
);

const validCommands: Command[] = [
  createCommand,
  categorizeCommand,
];

Deno.test('CommandRouter', async (t) => {
  const router = await CommandRouter.pipe(
    Effect.provide(CommandRouter.Live),
    Effect.provide(TestCreateTransaction),
    Effect.provideService(CategorizeTransaction, () => Effect.succeed(mockTransaction)),
    Effect.runPromise,
  );

  for (const command of validCommands) {
    await t.step(`should route ${command.type} command to its handler`, async () => {
      const result = await Effect.runPromise(router(command));

      assertInstanceOf(result, Object);
    });
  }

  await t.step('should fail when command fails', async () => {
    const error = await Effect.runPromise(router(invalidCommand).pipe(Effect.flip));

    assertInstanceOf(error, Error);
    assertStringIncludes(error.message, 'Failed to create transaction');
  });
});
