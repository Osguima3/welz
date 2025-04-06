import { assertEquals, assertRejects } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { PostgresClient } from '../../../src/infrastructure/repository/PostgresClient.ts';
import { IntegrationTestRepositoryLayer } from '../../helper/TestRepositoryLayers.ts';

Deno.test('PostgresClient Integration', {
  sanitizeResources: false,
}, async (t) => {
  const client = await PostgresClient.pipe(Effect.provide(IntegrationTestRepositoryLayer), Effect.runPromise);
  const testTableName = 'test_table_' + randomUUID().replace(/-/g, '_');

  await t.step('setup', async () => {
    await Effect.runPromise(
      client.runQuery(`
          CREATE TABLE ${testTableName} (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            amount DECIMAL(10,2),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `),
    );
  });

  await t.step('should connect to the database', async () => {
    const result = await Effect.runPromise(
      client.runQuery<{ value: number }>('SELECT 1 as value'),
    );
    assertEquals(result.rows.length, 1);
    assertEquals(result.rows[0].value, 1);
  });

  await t.step('should execute INSERT with queryObject and return inserted row', async () => {
    const id = randomUUID();
    const name = 'Test Record';

    const result = await Effect.runPromise(
      client.runQuery<{ id: string; name: string }>(
        `INSERT INTO ${testTableName} (id, name) VALUES ($1, $2) RETURNING *`,
        [id, name],
      ),
    );

    assertEquals(result.rows.length, 1);
    assertEquals(result.rows[0].id, id);
    assertEquals(result.rows[0].name, name);
  });

  await t.step('should handle multiple inserts and updates in sequence', async () => {
    const records = [
      { id: randomUUID(), name: 'Record 1', amount: 100.50 },
      { id: randomUUID(), name: 'Record 2', amount: 200.75 },
    ];

    // Insert multiple records
    for (const record of records) {
      await Effect.runPromise(
        client.runQuery(
          `INSERT INTO ${testTableName} (id, name, amount) VALUES ($1, $2, $3)`,
          [record.id, record.name, record.amount],
        ),
      );
    }

    // Update a record
    await Effect.runPromise(
      client.runQuery(
        `UPDATE ${testTableName} SET amount = amount * 2 WHERE name = $1`,
        ['Record 1'],
      ),
    );

    // Verify update
    const result = await Effect.runPromise(
      client.runQuery<{ amount: string }>(
        `SELECT amount FROM ${testTableName} WHERE name = $1`,
        ['Record 1'],
      ),
    );

    assertEquals(result.rows.length, 1);
    assertEquals(result.rows[0].amount, '201.00');
  });

  await t.step('should handle query errors gracefully', async () => {
    // Test syntax error
    await assertRejects(
      () => Effect.runPromise(client.runQuery('SELECT * FROM')),
      Error,
      'syntax error',
    );

    // Test constraint violation
    await assertRejects(
      () =>
        Effect.runPromise(
          client.runQuery(
            `INSERT INTO ${testTableName} (id, name) VALUES ($1, $2)`,
            [randomUUID(), null],
          ),
        ),
      Error,
      'null value in column "name" of relation',
    );

    // Test duplicate key violation
    const id = randomUUID();
    await Effect.runPromise(
      client.runQuery(
        `INSERT INTO ${testTableName} (id, name) VALUES ($1, $2)`,
        [id, 'Test Duplicate'],
      ),
    );

    await assertRejects(
      () =>
        Effect.runPromise(
          client.runQuery(
            `INSERT INTO ${testTableName} (id, name) VALUES ($1, $2)`,
            [id, 'Test Duplicate 2'],
          ),
        ),
      Error,
      'duplicate key value violates unique constraint',
    );
  });

  await t.step('should handle large result sets efficiently', async () => {
    // Insert 100 records
    const values = Array.from({ length: 100 }, (_, i) => `('${randomUUID()}', 'Bulk Record ${i}', ${i * 10.5})`).join(
      ',',
    );

    await Effect.runPromise(
      client.runQuery(`INSERT INTO ${testTableName} (id, name, amount) VALUES ${values}`),
    );

    // Query with pagination
    const pageSize = 20;
    const page = 2;
    const offset = (page - 1) * pageSize;

    const result = await Effect.runPromise(
      client.runQuery<{ count: number }>(`SELECT COUNT(*) as count FROM ${testTableName}`),
    );

    const pagedResult = await Effect.runPromise(
      client.runQuery<{ name: string }>(
        `SELECT name FROM ${testTableName} ORDER BY name LIMIT $1 OFFSET $2`,
        [pageSize, offset],
      ),
    );

    assertEquals(result.rows[0].count >= 100, true);
    assertEquals(pagedResult.rows.length, pageSize);
  });

  await t.step('cleanup', async () => {
    await Effect.runPromise(client.runQuery(`DROP TABLE IF EXISTS ${testTableName}`));
    await Effect.runPromise(client.end());
  });
});
