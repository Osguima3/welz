import { AbstractMigration, ClientPostgreSQL, Info } from '$nessie/mod.ts';

export default class extends AbstractMigration<ClientPostgreSQL> {
  async up(_info: Info): Promise<void> {
    await this.client.queryArray(`
      CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id UUID NOT NULL REFERENCES accounts(id),
        amount DECIMAL(19,4) NOT NULL,
        currency CHAR(3) NOT NULL,
        date DATE NOT NULL,
        description TEXT NOT NULL,
        category_id UUID REFERENCES categories(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_transactions_account ON transactions(account_id);
      CREATE INDEX idx_transactions_category ON transactions(category_id);
      CREATE INDEX idx_transactions_date ON transactions(date);
      CREATE INDEX idx_transactions_currency ON transactions(currency);
    `);
  }

  async down(_info: Info): Promise<void> {
    await this.client.queryArray(`
      DROP TABLE IF EXISTS transactions;
    `);
  }
}
