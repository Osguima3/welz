# Testing Strategy

## Testing Stack

### Unit Testing

- **Framework**: Deno Test
  - Native testing framework in Deno
  - Excellent TypeScript support
  - Built-in assertions
  - Compatible with Effect TS
  - Fast execution

### Integration Testing

- **Framework**: Deno Test
  - Native support for HTTP assertions using fetch
  - Enables testing of CQRS flows end-to-end with a configured server environment
  - No longer uses SuperDeno

## Testing Approach

### Unit Tests

```typescript
// Example of Effect TS unit test
import { Effect, pipe } from 'effect';
import { assertEquals } from 'std/testing/asserts.ts';

Deno.test('Example', async (t) => {
  await t.step('should assert success', async () => {
    const result = Effect.runPromise(Effect.success(1));

    assertEquals(result, 1);
  });

  await t.step('should assert failure', async () => {
    const result = Effect.runPromise(
      Effect.fail(new Error('error')).pipe(
        Effect.flip,
      ),
    );

    assertEquals(result.message, 'error');
  });
});
```

### Integration Tests

#### Controller tests

```typescript
Deno.test('Transaction Commands', async (t) => {
  let baseUrl: string;
  let server: Deno.HttpServer;

  await t.step('setup', async () => {
    const result = await createTestServer(TestEnvLayer);
    baseUrl = result.baseUrl;
    server = result.server;
  });

  await t.step('should create transaction successfully', async () => {
    const response = await fetch(`${baseUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockTransaction),
    });
    assertEquals(response.status, 201);
    const result = await response.json();
    // ...assertions on result...
  });

  await t.step('cleanup', async () => {
    await server.shutdown();
  });
});
```

#### Repositories, Commands and Queries

```typescript
import { assertEquals } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { randomUUID } from 'node:crypto';
import { TransactionRepository } from '../../../src/domain/transaction/TransactionRepository.ts';
import { TestApp } from '../../helper/TestApp.ts';
import { IntegrationTestRepositoryLayer } from '../../helper/TestRepositoryLayers.ts';

Deno.test('PostgresTransactionRepository Integration', async (t) => {
  const app = new TestApp();
  const testAccountId = randomUUID();

  const repository = await TransactionRepository.pipe(
    Effect.provide(IntegrationTestRepositoryLayer),
    Effect.runPromise,
  );

  await setupTestData(testAccountId);

  await t.step('should find all transactions for an account', async () => {
    const result = await Effect.runPromise(repository.findTransactions({ accountId: testAccountId }));

    assertEquals(result.total, 3);
    assertEquals(result.transactions.length, 3);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);

    result.transactions.forEach((transaction) => {
      assertEquals(transaction.accountId, testAccountId);
    });
  });
});
```

### E2E Tests

```typescript
// Example of E2E test with Playwright
import { expect, test } from '@playwright/test';

test('basic transaction flow', async ({ page }) => {
  await page.goto('/');

  // Create transaction
  await page.click('[data-test=add-transaction]');
  await page.fill('[data-test=amount]', '100');
  await page.fill('[data-test=description]', 'Test');
  await page.click('[data-test=submit]');

  // Verify transaction appears in list
  await expect(page.locator('[data-test=transaction-list]'))
    .toContainText('Test');
});
```

### Mocking Strategy

#### Example 1: Dependency Injection

Use test-specific layers to override production implementations.

```typescript
import { Effect, Layer } from 'effect';
import { EventPublisher } from '../../../src/application/command/EventPublisher.ts';

const publisher = await EventPublisher.pipe(
  Effect.provide(EventPublisher.Live),
  Effect.provide(TestEventBus),
  Effect.runPromise,
);
```

## Naming Conventions

- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- Test helpers: `*.helper.ts`

## Test Coverage

### Coverage Targets

- Unit Tests: > 80%
- Integration Tests: > 70%
- E2E Tests: Critical paths covered

### Coverage Collection

```typescript
// deno.json
{
  "test": {
    "include": ["tests/"],
    "coverage": {
      "include": ["src/"],
      "exclude": ["src/generated/"]
    }
  }
}
```

## Best Practices

### Test Data Management

- Use factories for test data generation
- Maintain fixtures in version control
- Clean up test data after each test
- Use realistic data shapes

### Mocking Strategy

- Mock external services in integration tests
- Prefer dependency injection for easier mocking
- Document mock behaviors and provide examples:

### Performance

- Run tests in parallel when possible
- Use test database for integration tests
- Implement test timeouts
- Monitor test execution times

### Documentation

- Document test setup requirements
- Maintain examples of common test patterns
- Document mocking approaches
- Keep test documentation up to date
