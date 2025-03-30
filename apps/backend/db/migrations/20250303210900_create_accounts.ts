import { AbstractMigration, ClientPostgreSQL, Info } from '$nessie/mod.ts';

export default class extends AbstractMigration<ClientPostgreSQL> {
  async up(_info: Info): Promise<void> {
    await this.client.queryArray(`
      CREATE TABLE accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('CASH', 'BANK')),
        balance DECIMAL(19,2) NOT NULL DEFAULT 0,
        currency CHAR(3) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_accounts_type ON accounts(type);
      CREATE INDEX idx_accounts_currency ON accounts(currency);
    `);
  }

  async down(_info: Info): Promise<void> {
    await this.client.queryArray(`
      DROP TABLE IF EXISTS accounts CASCADE;
    `);
  }
}
