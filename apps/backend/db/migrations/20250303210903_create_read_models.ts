import { AbstractMigration, ClientPostgreSQL, Info } from '$nessie/mod.ts';

export default class extends AbstractMigration<ClientPostgreSQL> {
  async up(_info: Info): Promise<void> {
    // Monthly spending by category materialized view
    await this.client.queryArray(`
      CREATE MATERIALIZED VIEW monthly_spending_by_category_view AS
      SELECT 
        DATE_TRUNC('month', t.date) as month,
        t.category_id,
        c.name as category_name,
        c.type as category_type,
        COUNT(*) as transaction_count,
        SUM(t.amount) as total_amount,
        MIN(t.amount) as min_amount,
        MAX(t.amount) as max_amount,
        AVG(t.amount) as avg_amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      GROUP BY DATE_TRUNC('month', t.date), t.category_id, c.name, c.type;

      CREATE UNIQUE INDEX idx_monthly_spending_category 
      ON monthly_spending_by_category_view(month, category_id);
    `);

    // Account balances view
    await this.client.queryArray(`
      CREATE MATERIALIZED VIEW account_balances_view AS
      SELECT 
        a.id as account_id,
        a.name as account_name,
        a.type as account_type,
        a.currency,
        a.balance as current_balance,
        COUNT(t.id) as transaction_count,
        SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as total_expenses
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.account_id
      GROUP BY a.id, a.name, a.type, a.currency, a.balance;

      CREATE UNIQUE INDEX idx_account_balances 
      ON account_balances_view(account_id);
    `);

    // Net worth history view
    await this.client.queryArray(`
      CREATE MATERIALIZED VIEW net_worth_history_view AS
      WITH RECURSIVE dates AS (
        SELECT MIN(date)::date as date
        FROM transactions
        UNION ALL
        SELECT (date + interval '1 day')::date
        FROM dates
        WHERE date < CURRENT_DATE
      ),
      daily_balances AS (
        SELECT 
          d.date,
          SUM(a.balance) as net_worth
        FROM dates d
        CROSS JOIN accounts a
        GROUP BY d.date
      )
      SELECT * FROM daily_balances;

      CREATE UNIQUE INDEX idx_net_worth_history 
      ON net_worth_history_view(date);
    `);

    // Transaction categories view
    await this.client.queryArray(`
      CREATE MATERIALIZED VIEW transaction_categories_view AS
      SELECT 
        t.id as transaction_id,
        t.account_id,
        t.amount,
        t.currency,
        t.date,
        t.description,
        t.category_id,
        c.name as category_name,
        c.type as category_type
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id;

      CREATE UNIQUE INDEX idx_transaction_categories 
      ON transaction_categories_view(transaction_id);
    `);

    // Create refresh function for all materialized views
    await this.client.queryArray(`
      CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_spending_by_category_view;
        REFRESH MATERIALIZED VIEW CONCURRENTLY account_balances_view;
        REFRESH MATERIALIZED VIEW CONCURRENTLY net_worth_history_view;
        REFRESH MATERIALIZED VIEW CONCURRENTLY transaction_categories_view;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  /** Runs on rollback */
  async down(_info: Info): Promise<void> {
    await this.client.queryArray(`
      DROP MATERIALIZED VIEW IF EXISTS monthly_spending_by_category_view;
      DROP MATERIALIZED VIEW IF EXISTS account_balances_view;
      DROP MATERIALIZED VIEW IF EXISTS net_worth_history_view;
      DROP MATERIALIZED VIEW IF EXISTS transaction_categories_view;
      DROP FUNCTION IF EXISTS refresh_all_materialized_views();
    `);
  }
}
