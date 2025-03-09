import { Context, Effect, Layer } from 'effect';
import { TransactionManager } from '../../src/application/command/TransactionManager.ts';
import { UUID } from '../../src/domain/common/Schema.ts';
import { PostgresClient } from '../../src/infrastructure/repository/PostgresClient.ts';

export class TestDataHelper extends Context.Tag('TestDataHelper')<
  TestDataHelper,
  {
    createAccount(id: UUID, name?: string): Promise<void>;
    createCategory(id: UUID, name?: string, type?: 'INCOME' | 'EXPENSE'): Promise<void>;
    createTransaction(id?: UUID, accountId?: UUID, categoryId?: UUID): Promise<void>;
    cleanup(accountIds?: UUID[], categoryIds?: UUID[]): Promise<void>;
  }
>() {
  static Live = Layer.effect(
    TestDataHelper,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;

      return {
        createAccount: (id: UUID) =>
          transactionManager(() =>
            Effect.gen(function* () {
              const now = new Date();
              const client = yield* PostgresClient;
              yield* client.queryObject(
                `INSERT INTO accounts (id, name, type, currency, created_at, updated_at, balance)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [id, 'Test Account', 'CASH', 'EUR', now, now, 0],
              );
            })
          ).pipe(Effect.runPromise),

        createCategory: (id: UUID) =>
          transactionManager(() =>
            Effect.gen(function* () {
              const now = new Date();
              const client = yield* PostgresClient;
              yield* client.queryObject(
                `INSERT INTO categories (id, name, type, created_at)
                 VALUES ($1, $2, $3, $4)`,
                [id, 'Test Category', 'EXPENSE', now],
              );
            })
          ).pipe(Effect.runPromise),

        createTransaction: (id: UUID, accountId: UUID, categoryId?: UUID) =>
          transactionManager(() =>
            Effect.gen(function* () {
              const now = new Date();
              const client = yield* PostgresClient;

              yield* client.queryObject(
                `INSERT INTO transactions (
                  id, account_id, amount, currency, date, description, category_id, created_at, updated_at
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9
                )`,
                [id, accountId, 123.45, 'EUR', now, 'Test Transaction', categoryId, now, now],
              );
            })
          ).pipe(Effect.runPromise),

        cleanup: (accountIds: UUID[] = [], categoryIds: UUID[] = []) =>
          transactionManager(() =>
            Effect.gen(function* () {
              const client = yield* PostgresClient;

              // Clean up transactions first due to foreign key constraints
              if (accountIds.length > 0) {
                const accountPlaceholders = accountIds.map((_, i) => `$${i + 1}`).join(', ');
                yield* client.queryObject(
                  `DELETE FROM transactions WHERE account_id IN (${accountPlaceholders})`,
                  accountIds,
                );

                // Then clean up accounts
                yield* client.queryObject(
                  `DELETE FROM accounts WHERE id IN (${accountPlaceholders})`,
                  accountIds,
                );
              }

              // Clean up categories
              if (categoryIds.length > 0) {
                const categoryPlaceholders = categoryIds.map((_, i) => `$${i + 1}`).join(', ');
                yield* client.queryObject(
                  `DELETE FROM categories WHERE id IN (${categoryPlaceholders})`,
                  categoryIds,
                );
              }
            })
          ).pipe(Effect.runPromise),
      };
    }),
  );
}
