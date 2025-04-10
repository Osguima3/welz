import { AbstractMigration, ClientPostgreSQL, Info } from '$nessie/mod.ts';

export default class extends AbstractMigration<ClientPostgreSQL> {
  async up(_info: Info): Promise<void> {
    await this.client.queryArray(`
      CREATE MATERIALIZED VIEW category_history_view AS
      WITH 
        category_transactions AS (
          SELECT 
            DATE_TRUNC('month', t.date) as month,
            category_id,
            currency,
            SUM(amount) as category_total
          FROM transactions t
          WHERE currency = 'EUR'
          GROUP BY month, category_id, currency
        ),
        first_transaction_dates AS (
          SELECT
            category_id,
            MIN(DATE_TRUNC('month', date)) as first_month
          FROM transactions
          WHERE currency = 'EUR'
          GROUP BY category_id
        ),
        category_months AS (
          SELECT 
            c.id as category_id,
            c.type,
            ms.month
          FROM categories c
          CROSS JOIN LATERAL (
            SELECT generate_series(
              (SELECT first_month FROM first_transaction_dates WHERE category_id = c.id),
              CURRENT_DATE::date,
              '1 month'::interval
            )::date AS month
          ) ms
        ),
        category_history AS (
          SELECT 
            cm.month,
            cm.category_id,
            cm.type,
            COALESCE(ct.currency, 'EUR') as currency,
            COALESCE(ct.category_total, 0) as category_total
          FROM category_months cm
          LEFT JOIN category_transactions ct ON ct.month = cm.month AND ct.category_id = cm.category_id
        )
      SELECT 
        month,
        category_id,
        currency,
        type,
        category_total,
        ROUND(AVG(category_total) OVER (
          PARTITION BY category_id, currency
          ORDER BY month
          ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
        ), 2) as category_average,
        SUM(CASE WHEN category_total != 0 THEN category_total ELSE NULL END) OVER (PARTITION BY month, type) as type_total,
        CASE 
          WHEN SIGN(category_total) = SIGN(SUM(CASE WHEN category_total != 0 THEN category_total ELSE NULL END) OVER (PARTITION BY month, type)) AND category_total != 0
          THEN ROUND((100 * ABS(category_total) / SUM(ABS(CASE WHEN category_total != 0 THEN category_total ELSE NULL END)) OVER (PARTITION BY month, type)), 2)
          ELSE 0
        END as type_percentage,
        ROW_NUMBER() OVER (PARTITION BY month, type ORDER BY ABS(category_total) DESC) as type_rank
      FROM category_history;
      
      CREATE UNIQUE INDEX idx_category_history_primary 
      ON category_history_view(month, category_id);
      
      CREATE INDEX idx_category_history_type 
      ON category_history_view(type, type_rank);
      
      CREATE INDEX idx_category_history_month 
      ON category_history_view(month DESC);
    `);

    await this.client.queryArray(`
      CREATE MATERIALIZED VIEW account_history_view AS
      WITH monthly_totals AS (
        SELECT
          DATE_TRUNC('month', t.date) as month,
          account_id,
          a.name,
          a.type,
          balance,
          a.currency,
          SUM(CASE WHEN c.type = 'INCOME' THEN t.amount ELSE 0 END) as month_income,
          SUM(CASE WHEN c.type = 'EXPENSE' THEN t.amount ELSE 0 END) as month_expenses,
          SUM(t.amount) as month_balance, 
          a.updated_at as last_updated
        FROM accounts a
        LEFT JOIN transactions t ON a.id = t.account_id
        LEFT JOIN categories c ON t.category_id = c.id
        GROUP BY month, account_id, a.name, a.type, a.currency, balance, last_updated
      )
      SELECT
        month,
        account_id,
        name,
        type,
        last_updated,
        currency,
        balance - SUM(month_balance) OVER (PARTITION BY account_id ORDER BY month DESC) + month_balance as balance,
        month_balance,
        month_income,
        month_expenses
      FROM monthly_totals;

      CREATE UNIQUE INDEX idx_account_history_primary 
      ON account_history_view(month, account_id);
    `);

    await this.client.queryArray(`
      CREATE MATERIALIZED VIEW transaction_view AS
      SELECT 
        t.id as transaction_id,
        t.account_id,
        t.amount as transaction_amount,
        t.currency,
        t.date,
        t.description,
        t.category_id,
        c.name as category_name,
        c.type as category_type
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id;

      CREATE UNIQUE INDEX idx_transaction_primary
      ON transaction_view(transaction_id);
    `);

    await this.client.queryArray(`
      CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY category_history_view;
        REFRESH MATERIALIZED VIEW CONCURRENTLY account_history_view;
        REFRESH MATERIALIZED VIEW CONCURRENTLY transaction_view;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  async down(_info: Info): Promise<void> {
    await this.client.queryArray(`
      DROP MATERIALIZED VIEW IF EXISTS category_history_view;
      DROP MATERIALIZED VIEW IF EXISTS account_history_view;
      DROP MATERIALIZED VIEW IF EXISTS transaction_view;

      DROP FUNCTION IF EXISTS refresh_all_materialized_views();
      
      DROP INDEX IF EXISTS idx_category_history_primary;
      DROP INDEX IF EXISTS idx_category_history_type;
      DROP INDEX IF EXISTS idx_category_history_month;
      DROP INDEX IF EXISTS idx_account_history_primary;
      DROP INDEX IF EXISTS idx_transaction_primary;
    `);
  }
}
