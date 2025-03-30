import { Context, Effect, Layer } from 'effect';
import { randomUUID } from 'node:crypto';
import { UUID } from '../../../shared/schema/UUID.ts';
import { TransactionManager } from '../../src/application/command/TransactionManager.ts';
import { PostgresClient } from '../../src/infrastructure/repository/PostgresClient.ts';

export class TestDataHelper extends Context.Tag('TestDataHelper')<
  TestDataHelper,
  {
    createAccount(id: UUID, name?: string): Promise<void>;
    createCategory(id: UUID, name?: string, type?: 'INCOME' | 'EXPENSE'): Promise<void>;
    createTransaction(
      id?: UUID,
      accountId?: UUID,
      categoryId?: UUID,
      description?: string,
      amount?: number,
      date?: Date,
    ): Promise<void>;
    cleanup(accountIds?: UUID[], categoryIds?: UUID[]): Promise<void>;
  }
>() {
  static Live = Layer.effect(
    TestDataHelper,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;

      return {
        createAccount: (id: UUID, name = 'Test Account') =>
          transactionManager(true, () =>
            Effect.gen(function* () {
              const now = new Date();
              const client = yield* PostgresClient;
              yield* client.runQuery(
                `INSERT INTO accounts (id, name, type, currency, created_at, updated_at, balance)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [id, name, 'CASH', 'EUR', now, now, 0],
              );
            })).pipe(Effect.runPromise),

        createCategory: (id: UUID, name = 'Test Category', type = 'EXPENSE') =>
          transactionManager(true, () =>
            Effect.gen(function* () {
              const now = new Date();
              const client = yield* PostgresClient;
              yield* client.runQuery(
                `INSERT INTO categories (id, name, type, created_at)
                 VALUES ($1, $2, $3, $4)`,
                [id, name, type, now],
              );
            })).pipe(Effect.runPromise),

        createTransaction: (
          id = randomUUID(),
          accountId = randomUUID(),
          categoryId?: UUID,
          description = 'Test Transaction',
          amount = 123.45,
          date = new Date(),
        ) =>
          transactionManager(true, () =>
            Effect.gen(function* () {
              const now = new Date();
              const client = yield* PostgresClient;

              yield* client.runQuery(
                `INSERT INTO transactions (
                  id, account_id, amount, currency, date, description, category_id, created_at, updated_at
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9
                )`,
                [id, accountId, amount, 'EUR', date, description, categoryId, now, now],
              );

              yield* client.runQuery(
                `UPDATE accounts SET balance = balance + $1 WHERE id = $2`,
                [amount, accountId],
              );
            })).pipe(Effect.runPromise),

        cleanup: (accountIds: UUID[] = [], categoryIds: UUID[] = []) =>
          transactionManager(true, () =>
            Effect.gen(function* () {
              const client = yield* PostgresClient;

              if (accountIds.length > 0) {
                const accountPlaceholders = accountIds.map((_, i) => `$${i + 1}`).join(', ');
                yield* client.runQuery(
                  `DELETE FROM transactions WHERE account_id IN (${accountPlaceholders})`,
                  accountIds,
                );

                yield* client.runQuery(
                  `DELETE FROM accounts WHERE id IN (${accountPlaceholders})`,
                  accountIds,
                );
              }

              if (categoryIds.length > 0) {
                const categoryPlaceholders = categoryIds.map((_, i) => `$${i + 1}`).join(', ');
                yield* client.runQuery(
                  `DELETE FROM transactions WHERE category_id IN (${categoryPlaceholders})`,
                  categoryIds,
                );

                yield* client.runQuery(
                  `DELETE FROM categories WHERE id IN (${categoryPlaceholders})`,
                  categoryIds,
                );
              }
            })).pipe(Effect.runPromise),
      };
    }),
  );
}
