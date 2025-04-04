import { Effect, Layer } from 'effect';
import { Account, AccountType } from '../../../../shared/schema/Account.ts';
import { AccountHistoryEntry } from '../../../../shared/schema/AccountHistory.ts';
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
            balance: Money.create(row.balance, row.currency),
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
              balance: Money.create(row.balance, row.currency),
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
          let startDate = options.dateRange?.start;
          const endDate = options.dateRange?.end || new Date();

          if (!startDate) {
            startDate = new Date(endDate);
            startDate.setMonth(endDate.getMonth() - 6);
          }

          let query = `
            WITH month_series AS (
              SELECT generate_series(
                DATE_TRUNC('month', $1::timestamp),
                DATE_TRUNC('month', $2::timestamp),
                '1 month'::interval
              )::date as month
            ),
            relevant_accounts AS (
              SELECT id, name, type, currency, updated_at, balance as current_balance
              FROM accounts
              WHERE 1=1`;

          const params: unknown[] = [startDate, endDate];

          if (options.accountId) {
            query += ` AND id = $${params.length + 1}`;
            params.push(options.accountId);
          }

          query += `
            ),
            account_months AS (
              SELECT 
                a.id as account_id,
                ms.month,
                a.name,
                a.type,
                a.currency,
                a.updated_at,
                a.current_balance,
                h.last_updated,
                h.balance,
                h.month_balance,
                h.month_income,
                h.month_expenses
              FROM month_series ms
              CROSS JOIN relevant_accounts a
              LEFT JOIN account_history_view h ON 
                h.account_id = a.id AND 
                h.month = ms.month
            ),
            account_months_with_balance AS (
              SELECT 
                account_id,
                month,
                name,
                type,
                currency,
                updated_at,
                current_balance,
                last_updated,
                balance,
                COALESCE(
                  balance,
                  FIRST_VALUE(balance) OVER (
                    PARTITION BY account_id 
                    ORDER BY month DESC
                    ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING
                  )
                ) as filled_balance,
                month_balance,
                month_income,
                month_expenses
              FROM account_months
            )
            SELECT 
              account_id as "accountId",
              month,
              name,
              type,
              COALESCE(last_updated, updated_at) as "lastUpdated",
              currency,
              COALESCE(filled_balance, current_balance, '0') as balance,
              COALESCE(month_balance, '0') as "monthBalance",
              COALESCE(month_income, '0') as "monthIncome",
              COALESCE(month_expenses, '0') as "monthExpenses"
            FROM account_months_with_balance
            ORDER BY month DESC, balance DESC
          `;

          const result = yield* client.runQuery<AccountHistoryRow>(query, params);

          return result.rows.map((row) =>
            AccountHistoryEntry.make({
              ...row,
              balance: Money.create(row.balance, row.currency),
              monthBalance: Money.create(row.monthBalance, row.currency),
              monthIncome: Money.create(row.monthIncome, row.currency),
              monthExpenses: Money.create(row.monthExpenses, row.currency),
            })
          );
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
            balance: Money.create(row.balance, row.currency),
          });
        }).pipe(
          catchAllDie('Failed to save account'),
        ),
    };
  }),
);
