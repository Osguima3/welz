import { assertEquals } from '$std/assert/mod.ts';
import { Money } from '@shared/schema/Money.ts';
import { Effect, Layer } from 'effect';
import { GetCategoryHistory } from '../../../../src/application/query/category/GetCategoryHistory.ts';
import { CategoryRepository } from '../../../../src/domain/category/CategoryRepository.ts';
import TestAggregates from '../../../helper/TestAggregates.ts';
import { UnitTestLayer } from '../../../helper/TestLayers.ts';

const mockHistory = [
  TestAggregates.categoryHistory({
    month: new Date(2025, 3, 1),
    type: 'EXPENSE',
    amount: Money.create(300, 'EUR'),
  }),
  TestAggregates.categoryHistory({
    month: new Date(2025, 2, 1),
    type: 'EXPENSE',
    amount: Money.create(200, 'EUR'),
  }),
  TestAggregates.categoryHistory({
    month: new Date(2025, 1, 1),
    type: 'EXPENSE',
    amount: Money.create(250, 'EUR'),
    forecast: Money.create(350, 'EUR'),
  }),
];

const TestCategoryRepository = Layer.succeed(
  CategoryRepository,
  {
    findById: () => Effect.fail(new Error('Not implemented')),
    findCategories: () => Effect.fail(new Error('Not implemented')),
    findCategoryHistory: () => Effect.succeed(mockHistory),
  },
);

Deno.test('GetCategoryHistory', async (t) => {
  const getCategoryHistory = await GetCategoryHistory.pipe(
    Effect.provide(GetCategoryHistory.Live),
    Effect.provide(UnitTestLayer),
    Effect.provide(TestCategoryRepository),
    Effect.runPromise,
  );

  await t.step('should return category history', async () => {
    const result = await Effect.runPromise(
      getCategoryHistory({
        type: 'GetCategoryHistory',
        categoryId: '123',
        start: new Date(2025, 0, 1),
        end: new Date(2025, 2, 31),
      }),
    );

    assertEquals(result.length, 3);

    const latestMonth = result[0];
    assertEquals(latestMonth.month.getFullYear(), 2025);
    assertEquals(latestMonth.month.getMonth(), 3);
    assertEquals(latestMonth.total, Money.create(300, 'EUR'));
    assertEquals(latestMonth.forecast, undefined);
    assertEquals(latestMonth.type, 'EXPENSE');

    const earliestMonth = result[2];
    assertEquals(earliestMonth.month.getFullYear(), 2025);
    assertEquals(earliestMonth.month.getMonth(), 1);
    assertEquals(earliestMonth.total, Money.create(250, 'EUR'));
    assertEquals(earliestMonth.forecast, Money.create(350, 'EUR'));
  });
});
