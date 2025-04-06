import { AbstractMigration, ClientPostgreSQL, Info } from '$nessie/mod.ts';

export default class extends AbstractMigration<ClientPostgreSQL> {
  async up(_info: Info): Promise<void> {
    await this.client.queryArray(`
      CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID NOT NULL REFERENCES accounts(id),
        amount DECIMAL(19,2) NOT NULL,
        currency CHAR(3) NOT NULL,
        date DATE NOT NULL,
        description TEXT NOT NULL,
        category_id UUID REFERENCES categories(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Index for account balance calculations and filtering
      CREATE INDEX idx_transactions_account ON transactions(account_id);
      
      -- Index for date-based queries and currency filtering
      CREATE INDEX idx_transactions_date_currency ON transactions(date, currency);
      
      -- Index for category spending aggregations
      CREATE INDEX idx_transactions_category_currency_date ON transactions(category_id, currency, date);
    `);
  }

  async down(_info: Info): Promise<void> {
    await this.client.queryArray(`
      DROP TABLE IF EXISTS transactions;
    `);
  }
}
