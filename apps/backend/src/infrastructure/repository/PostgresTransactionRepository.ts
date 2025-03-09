import { Effect, Layer } from 'effect';
import { Money } from '../../domain/common/Money.ts';
import { TransactionAggregate } from '../../domain/transaction/Transaction.ts';
import { FindTransactionsOptions, TransactionRepository } from '../../domain/transaction/TransactionRepository.ts';
import { PostgresClient } from './PostgresClient.ts';

interface TransactionRow {
  id: string;
  accountId: string;
  amount: string;
  currency: string;
  date: Date;
  description: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
  total: string;
}

export const PostgresTransactionRepository = Layer.effect(
  TransactionRepository,
  Effect.gen(function* () {
    const client = yield* PostgresClient;

    return {
      findById: (id: string) =>
        Effect.gen(function* () {
          const result = yield* client.queryObject<TransactionRow>(
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
          return TransactionAggregate.make({
            ...row,
            amount: Money.create(Number(row.amount), row.currency),
            categoryId: row.categoryId || undefined,
          });
        }),

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
              COUNT(*) OVER() as total
            FROM transactions t
            WHERE t.account_id = $1
          `;

          const params: unknown[] = [options.accountId];
          let paramIndex = 2;

          if (options.startDate) {
            query += ` AND t.date >= $${paramIndex++}`;
            params.push(options.startDate);
          }

          if (options.endDate) {
            query += ` AND t.date <= $${paramIndex++}`;
            params.push(options.endDate);
          }

          if (options.categoryId) {
            query += ` AND t.category_id = $${paramIndex++}`;
            params.push(options.categoryId);
          }

          query += ` ORDER BY t.date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
          params.push(pageSize, offset);

          const result = yield* client.queryObject<TransactionRow>(query, params);

          if (result.rows.length === 0) {
            return {
              transactions: [],
              total: 0,
              page,
              pageSize,
            };
          }

          const transactions = result.rows.map((row) =>
            TransactionAggregate.make({
              ...row,
              amount: Money.create(Number(row.amount), row.currency),
              categoryId: row.categoryId || undefined,
            })
          );

          return {
            transactions,
            total: Number(result.rows[0].total),
            page,
            pageSize,
          };
        }),

      save: (transaction: TransactionAggregate) =>
        Effect.gen(function* () {
          const result = yield* client.queryObject<TransactionRow>(
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
          return TransactionAggregate.make({
            ...row,
            amount: Money.create(Number(row.amount), row.currency),
            categoryId: row.categoryId || undefined,
          });
        }),
    };
  }),
);
