import { assertEquals } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { GetUser } from '../../../src/application/query/GetUser.ts';
import { User } from '../../../src/domain/user/User.ts';
import { UserRepository } from '../../../src/domain/user/UserRepository.ts';

// Create test layer
const TestUserRepository = Layer.succeed(
  UserRepository,
  {
    findById: (id: string) => Effect.fail(new Error(`User not found with ID: ${id}`)),
    save: (_user: User) => Effect.succeed(undefined),
  },
);

Deno.test('GetUser', async (t) => {
  await t.step('should fail for missing user', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const getUser = yield* GetUser;
        const result = yield* Effect.flip(getUser({ type: 'GetUser', userId: 'invalid-id' }));
        assertEquals(result instanceof Error, true);
        assertEquals(result.message, 'User not found with ID: invalid-id');
      }).pipe(
        Effect.provide(GetUser.Live),
        Effect.provide(TestUserRepository),
      ),
    );
  });
});
