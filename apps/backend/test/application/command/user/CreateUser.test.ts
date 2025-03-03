import { assertEquals, assertInstanceOf, assertStringIncludes } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { randomUUID } from 'node:crypto';
import { CreateUser } from '../../../../src/application/command/user/CreateUser.ts';
import { UserRepository } from '../../../../src/domain/user/UserRepository.ts';
import { User } from '../../../../src/domain/user/User.ts';

// Track if save was called
let saveWasCalled = false;

const user = User.make({
  id: randomUUID(),
  name: 'John Doe',
  email: 'john.doe@example.com',
  createdAt: new Date(),
});

const TestUserRepository = Layer.succeed(
  UserRepository,
  {
    findById: (_id: string) => Effect.succeed(user),
    save: (_user: User) => {
      saveWasCalled = true;
      return Effect.succeed(undefined);
    },
  },
);

const TestLayer = CreateUser.Live.pipe(
  Layer.provide(TestUserRepository),
);

Deno.test('CreateUser', async (t) => {
  await t.step('should successfully create a user', async () => {
    saveWasCalled = false;

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const createUser = yield* CreateUser;
        return yield* createUser({
          type: 'CreateUser',
          name: 'John Doe',
          email: 'john.doe@example.com',
        });
      }).pipe(
        Effect.provide(TestLayer),
      ),
    );

    assertEquals(result.name, user.name);
    assertEquals(result.email, user.email);
    assertEquals(saveWasCalled, true, 'User repository save should be called');
  });

  await t.step('should handle invalid name', async () => {
    saveWasCalled = false;

    const error = await Effect.runPromise(
      Effect.gen(function* () {
        const createUser = yield* CreateUser;
        return yield* createUser({
          type: 'CreateUser',
          name: ' ',
          email: 'test@email.com',
        });
      }).pipe(
        Effect.flip,
        Effect.provide(TestLayer),
      ),
    );

    assertStringIncludes(error.message, 'Expected a string at least 2 character(s) long, actual " "');
    assertEquals(saveWasCalled, false, 'User repository save should not be called on error');
  });

  await t.step('should handle InvalidEmailError', async () => {
    saveWasCalled = false;

    const error = await Effect.runPromise(
      Effect.gen(function* () {
        const createUser = yield* CreateUser;
        return yield* createUser({
          type: 'CreateUser',
          name: 'John Doe',
          email: 'invalid-email',
        });
      }).pipe(
        Effect.flip,
        Effect.provide(TestLayer),
      ),
    );

    assertInstanceOf(error, Error);
    assertStringIncludes(error.message, 'Invalid email format');
    assertEquals(saveWasCalled, false, 'User repository save should not be called on error');
  });
});
