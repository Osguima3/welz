import { Currency } from '@shared/schema/Currency.ts';
import { Money } from '@shared/schema/Money.ts';
import { Transaction } from '@shared/schema/Transaction.ts';
import { UUID } from '@shared/schema/UUID.ts';
import { catchAllDie } from '@shared/utils.ts';
import { Effect, Layer } from 'effect';
import { FindTransactionsOptions, TransactionRepository } from '../../domain/transaction/TransactionRepository.ts';
import { PostgresClient } from './PostgresClient.ts';
import Page from '@shared/schema/Page.ts';

interface TransactionRow {
  id: UUID;
  accountId: string;
  amount: number;
  currency: Currency;
  date: Date;
  description: string;
  categoryId?: UUID;
  createdAt: Date;
  updatedAt: Date;
  total: number;
}

export const PostgresTransactionRepository = Layer.effect(
  TransactionRepository,
  Effect.gen(function* () {
    const client = yield* PostgresClient;

    return {
      findById: (id: UUID) =>
        Effect.gen(function* () {
          const result = yield* client.runQuery<TransactionRow>(
            `SELECT
              t.id,
              t.account_id as "accountId",
              t.amount,
              t.currency,
              t.date,
              t.description,
              t.category_id as "categoryId",
              t.created_at as "createdAt",
              t.updated_at as "updatedAt"
            FROM transactions t
            WHERE t.id = $1
            LIMIT 1`,
            [id],
          );

          if (result.rows.length === 0) {
            return yield* Effect.fail(new Error(`Transaction not found: ${id}`));
          }

          const row = result.rows[0];
          return Transaction.make({
            ...row,
            amount: Money.create(row.amount, row.currency),
            categoryId: row.categoryId || undefined,
          });
        }).pipe(
          catchAllDie('Failed to find transaction'),
        ),

      findTransactions: (options: FindTransactionsOptions) =>
        Effect.gen(function* () {
          const page = options.page || 1;
          const pageSize = options.pageSize || 10;
          const offset = (page - 1) * pageSize;

          let query = `
            SELECT 
              t.id,
              t.account_id as "accountId",
              t.amount,
              t.currency,
              t.date,
              t.description,
              t.category_id as "categoryId",
              t.created_at as "createdAt",
              t.updated_at as "updatedAt",
              COUNT(*) OVER()::INTEGER as total
            FROM transactions t
            WHERE 1=1
          `;

          const params: unknown[] = [];
          let paramIndex = 1;

          if (options.accountId) {
            query += ` AND t.account_id = $${paramIndex++}`;
            params.push(options.accountId);
          }

          if (options.categoryId) {
            query += ` AND t.category_id = $${paramIndex++}`;
            params.push(options.categoryId);
          }

          if (options.dateRange?.start) {
            query += ` AND t.date >= $${paramIndex++}`;
            params.push(options.dateRange.start);
          }

          if (options.dateRange?.end) {
            query += ` AND t.date <= $${paramIndex++}`;
            params.push(options.dateRange.end);
          }

          query += ` ORDER BY t.date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
          params.push(pageSize, offset);

          const result = yield* client.runQuery<TransactionRow>(query, params);

          if (result.rows.length === 0) {
            return Page.empty(Transaction, options);
          }

          const items = result.rows.map((row) =>
            Transaction.make({
              ...row,
              amount: Money.create(row.amount, row.currency),
              categoryId: row.categoryId || undefined,
            })
          );

          return {
            items,
            total: Number(result.rows[0].total),
            page,
            pageSize,
          };
        }).pipe(
          catchAllDie('Failed to find transactions'),
          Effect.catchAll(() => Effect.succeed(Page.empty(Transaction, options))),
        ),

      save: (transaction: Transaction) =>
        Effect.gen(function* () {
          const result = yield* client.runQuery<TransactionRow>(
            `INSERT INTO transactions (
              id,
              account_id,
              amount,
              currency,
              date,
              description,
              category_id,
              created_at,
              updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9
            )
            ON CONFLICT (id) DO UPDATE SET
              amount = EXCLUDED.amount,
              currency = EXCLUDED.currency,
              date = EXCLUDED.date,
              description = EXCLUDED.description,
              category_id = EXCLUDED.category_id,
              updated_at = EXCLUDED.updated_at
            RETURNING 
              *,
              account_id as "accountId",
              category_id as "categoryId",
              created_at as "createdAt",
              updated_at as "updatedAt"
            `,
            [
              transaction.id,
              transaction.accountId,
              transaction.amount.amount,
              transaction.amount.currency,
              transaction.date,
              transaction.description,
              transaction.categoryId ?? null,
              transaction.createdAt,
              transaction.updatedAt,
            ],
          );

          const row = result.rows[0];
          yield* Effect.log(`Transaction saved: ${JSON.stringify(row)}`);
          return Transaction.make({
            ...row,
            amount: Money.create(row.amount, row.currency),
            categoryId: row.categoryId || undefined,
          });
        }).pipe(
          catchAllDie('Failed to save transaction'),
        ),
    };
  }),
);
