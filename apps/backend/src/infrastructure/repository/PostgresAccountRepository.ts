import { Effect, Layer } from 'effect';
import { Account, AccountType } from '../../../../shared/schema/Account.ts';
import { Money } from '../../../../shared/schema/Money.ts';
import { UUID } from '../../../../shared/schema/UUID.ts';
import { catchAllDie } from '../../../../shared/utils.ts';
import {
  AccountRepository,
  FindAccountHistoryOptions,
  FindAccountsOptions,
} from '../../domain/account/AccountRepository.ts';
import { PostgresClient } from './PostgresClient.ts';

interface AccountRow {
  id: UUID;
  name: string;
  type: AccountType;
  balance: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  total: string;
}

interface AccountHistoryRow {
  accountId: UUID;
  month: Date;
  name: string;
  type: AccountType;
  lastUpdated: Date;
  currency: string;
  balance: string;
  monthBalance: string;
  monthIncome: string;
  monthExpenses: string;
}

export const PostgresAccountRepository = Layer.effect(
  AccountRepository,
  Effect.gen(function* () {
    const client = yield* PostgresClient;

    return {
      findById: (id: UUID) =>
        Effect.gen(function* () {
          const result = yield* client.runQuery<AccountRow>(
            `SELECT
              id,
              name,
              type,
              balance,
              currency,
              created_at as "createdAt",
              updated_at as "updatedAt"
            FROM accounts
            WHERE id = $1
            LIMIT 1`,
            [id],
          );

          if (result.rows.length === 0) {
            return yield* Effect.fail(new Error(`Account not found: ${id}`));
          }

          const row = result.rows[0];
          return Account.make({
            ...row,
            balance: Money.create(Number(row.balance), row.currency),
          });
        }).pipe(
          catchAllDie('Failed to find account'),
        ),

      findAccounts: (options: FindAccountsOptions = {}) =>
        Effect.gen(function* () {
          const page = options.page || 1;
          const pageSize = options.pageSize || 10;
          const offset = (page - 1) * pageSize;

          let query = `
            SELECT 
              id,
              name,
              type,
              balance,
              currency,
              created_at as "createdAt",
              updated_at as "updatedAt",
              COUNT(*) OVER()::INTEGER as total
            FROM accounts
          `;

          const params: unknown[] = [];

          query += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
          params.push(pageSize, offset);

          const result = yield* client.runQuery<AccountRow>(query, params);

          if (result.rows.length === 0) {
            return {
              items: [],
              total: 0,
              page,
              pageSize,
            };
          }

          const items = result.rows.map((row) =>
            Account.make({
              ...row,
              balance: Money.create(Number(row.balance), row.currency),
            })
          );

          return {
            items,
            total: Number(result.rows[0].total),
            page,
            pageSize,
          };
        }).pipe(
          catchAllDie('Failed to find accounts'),
        ),

      findAccountHistory: (options: FindAccountHistoryOptions = {}) =>
        Effect.gen(function* () {
          let query = `
            SELECT 
              account_id as "accountId",
              month,
              name,
              type,
              last_updated as "lastUpdated",
              currency,
              balance,
              month_balance as "monthBalance",
              month_income as "monthIncome",
              month_expenses as "monthExpenses"
            FROM account_history_view
            WHERE 1=1
          `;

          const params: unknown[] = [];

          if (options.accountId) {
            query += ` AND account_id = $${params.length + 1}`;
            params.push(options.accountId);
          }

          if (options.dateRange?.start) {
            query += ` AND month >= DATE_TRUNC('month', $${params.length + 1}::timestamp)`;
            params.push(options.dateRange.start);
          }

          if (options.dateRange?.end) {
            query += ` AND month <= DATE_TRUNC('month', $${params.length + 1}::timestamp)`;
            params.push(options.dateRange.end);
          }

          query += ` ORDER BY month DESC, balance DESC`;

          const result = yield* client.runQuery<AccountHistoryRow>(query, params);

          return result.rows.map((row) => ({
            ...row,
            balance: Money.create(Number(row.balance), row.currency),
            monthBalance: Money.create(Number(row.monthBalance), row.currency),
            monthIncome: Money.create(Number(row.monthIncome), row.currency),
            monthExpenses: Money.create(Number(row.monthExpenses), row.currency),
          }));
        }).pipe(
          catchAllDie('Failed to find account history'),
        ),

      save: (account: Account) =>
        Effect.gen(function* () {
          const result = yield* client.runQuery<AccountRow>(
            `INSERT INTO accounts (
              id,
              name,
              type,
              balance,
              currency,
              created_at,
              updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7
            )
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              type = EXCLUDED.type,
              balance = EXCLUDED.balance,
              currency = EXCLUDED.currency,
              updated_at = EXCLUDED.updated_at
            RETURNING 
              *,
              created_at as "createdAt",
              updated_at as "updatedAt"
            `,
            [
              account.id,
              account.name,
              account.type,
              account.balance.amount,
              account.balance.currency,
              account.createdAt,
              account.updatedAt,
            ],
          );

          const row = result.rows[0];
          yield* Effect.log(`Account saved: ${JSON.stringify(row)}`);
          return Account.make({
            ...row,
            balance: Money.create(Number(row.balance), row.currency),
          });
        }).pipe(
          catchAllDie('Failed to save account'),
        ),
    };
  }),
);
