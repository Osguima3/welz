import { assertEquals, assertInstanceOf, assertStringIncludes } from '$std/assert/mod.ts';
import { randomUUID } from 'node:crypto';
import { Effect, Layer } from 'effect';
import { CommandRouter } from '../../../src/application/command/CommandRouter.ts';
import { CreateTransaction } from '../../../src/application/command/transaction/CreateTransaction.ts';
import { CreateUser } from '../../../src/application/command/user/CreateUser.ts';
import { User } from '../../../src/domain/user/User.ts';

const validTransaction = {
  type: 'CreateTransaction' as const,
  accountId: 'valid-account',
  amount: {
    amount: BigInt(1000),
    currency: 'EUR',
  },
  date: new Date(),
  description: 'Test transaction',
};

const TestCreateTransaction = Layer.succeed(
  CreateTransaction,
  () => Effect.succeed({}),
);

const TestCreateUser = Layer.succeed(
  CreateUser,
  (request) => {
    if (request.name === 'invalid-name') {
      return Effect.fail(new Error('User (Constructor)'));
    }
    return Effect.succeed(User.make({
      id: randomUUID(),
      name: request.name,
      createdAt: new Date(),
      email: request.email,
    }));
  },
);

const TestCommandLayer = CommandRouter.Live.pipe(
  Layer.provide(TestCreateUser),
  Layer.provide(TestCreateTransaction),
);

Deno.test('CommandRouter', async (t) => {
  await t.step('should route CreateUser command to its handler', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const router = yield* CommandRouter;
        const result = yield* router({
          type: 'CreateUser',
          name: 'John Doe',
          email: 'john.doe@example.com',
        });

        // Assert result is a User
        assertInstanceOf(result, User);
        assertEquals((result as User).name, 'John Doe');
        assertEquals((result as User).email, 'john.doe@example.com');
      }).pipe(
        Effect.provide(TestCommandLayer),
      ),
    );
  });

  await t.step('should fail when command handler fails', async () => {
    const error = await Effect.runPromise(
      Effect.gen(function* () {
        const router = yield* CommandRouter;
        return yield* router({
          type: 'CreateUser',
          name: 'invalid-name',
          email: 'test@example.com',
        });
      }).pipe(
        Effect.flip,
        Effect.provide(TestCommandLayer),
      ),
    );

    assertInstanceOf(error, Error);
    assertStringIncludes(error.message, 'User (Constructor)');
  });

  await t.step('should route CreateTransaction command to its handler', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const router = yield* CommandRouter;
        const result = yield* router(validTransaction);

        assertInstanceOf(result, Object);
      }).pipe(
        Effect.provide(TestCommandLayer),
      ),
    );
  });
});
