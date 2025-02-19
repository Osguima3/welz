import { afterEach, beforeEach, describe, it } from '@std/testing/bdd.ts';
import { assertEquals, assertExists } from '@std/assert/mod.ts';
import { Client } from 'postgres';
import { Money } from '../../../src/domain/shared/Money.ts';

interface Transaction {
  amount: string;
  currency: string;
  description: string;
}

describe('Transaction Integration', () => {
  let client: Client;

  beforeEach(async () => {
    // Setup test database connection with correct credentials
    client = new Client({
      database: 'welz_db',
      hostname: 'localhost',
      port: 5432,
      user: 'user',
      password: 'password',
    });
    await client.connect();

    // Clean test data
    await client.queryArray`TRUNCATE TABLE transactions CASCADE`;
  });

  afterEach(async () => {
    await client.end();
  });

  it('should create a transaction and persist it in the database', async () => {
    const amount = Money.of(100n, 'EUR');
    const description = 'Test transaction';

    // Create transaction through command
    const result = await client.queryObject<Transaction>`
      INSERT INTO transactions (amount, currency, description)
      VALUES (${amount.amount}, ${amount.currency}, ${description})
      RETURNING *
    `;

    const transaction = result.rows[0];
    assertExists(transaction, 'Transaction should be created');
    assertEquals(parseFloat(transaction.amount), 100.0, 'Amount should match');
    assertEquals(transaction.currency, 'EUR');
    assertEquals(transaction.description, description);
  });
});
