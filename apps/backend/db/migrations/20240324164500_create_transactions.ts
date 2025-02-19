import { AbstractMigration, Info } from 'https://deno.land/x/nessie@2.0.10/mod.ts';

export default class extends AbstractMigration {
  /** Runs on migrate */
  async up(_info: Info): Promise<void> {
    await this.client.queryArray(`
      CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount DECIMAL(19,4) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /** Runs on rollback */
  async down(_info: Info): Promise<void> {
    await this.client.queryArray(`DROP TABLE transactions;`);
  }
}
