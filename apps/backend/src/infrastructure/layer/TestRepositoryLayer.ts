import { Effect, Layer } from 'effect';
import { TransactionBoundary } from '../../application/command/TransactionBoundary.ts';
import { TransactionProvider } from '../../application/command/TransactionProvider.ts';
import { User } from '../../domain/user/User.ts';
import { UserRepository } from '../../domain/user/UserRepository.ts';

const TestUserRepository = Layer.succeed(UserRepository, {
  save: (_user) => Effect.succeed(undefined),
  findById: (id) => {
    if (id === '00000000-0000-0000-0000-000000000000') {
      return Effect.fail(new Error(`User not found with ID: ${id}`));
    } else {
      return User.create({ name: 'Test User', email: 'test@email.com' });
    }
  },
});

export const TestTransactionProvider = Layer.succeed(TransactionProvider, {
  begin: () => Effect.succeed({ id: 'transaction-id', startTime: new Date() }),
  commit: (_context) => Effect.succeed(undefined),
  rollback: (_context) => Effect.succeed(undefined),
});

export const TestRepositoryLayer = Layer.merge(
  TransactionBoundary.Live,
  TestUserRepository,
).pipe(
  Layer.provide(TestTransactionProvider),
);
