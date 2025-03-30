import { assertEquals } from '$std/assert/mod.ts';
import { Effect, Layer } from 'effect';
import { GetCategories } from '../../../../src/application/query/category/GetCategories.ts';
import { CategoryRepository } from '../../../../src/domain/category/CategoryRepository.ts';
import TestAggregates from '../../../helper/TestAggregates.ts';
import { UnitTestLayer } from '../../../helper/TestLayers.ts';
import TestQueries from '../../../helper/TestQueries.ts';

const mockCategories = [
  TestAggregates.category({ name: 'Salary', type: 'INCOME' }),
  TestAggregates.category({ name: 'Groceries', type: 'EXPENSE' }),
  TestAggregates.category({ name: 'Freelance', type: 'INCOME' }),
];

const TestCategoryRepository = Layer.succeed(
  CategoryRepository,
  {
    findById: () => Effect.fail(new Error('Not implemented')),
    findCategories: (options) => {
      const items = options?.categoryType
        ? mockCategories.filter((cat) => cat.type === options.categoryType)
        : mockCategories;

      return Effect.succeed({ items, total: items.length, page: 1, pageSize: 10 });
    },
  },
);

Deno.test('GetCategories', async (t) => {
  const getCategories = await GetCategories.pipe(
    Effect.provide(GetCategories.Live),
    Effect.provide(UnitTestLayer),
    Effect.provide(TestCategoryRepository),
    Effect.runPromise,
  );

  await t.step('should return all categories', async () => {
    const result = await Effect.runPromise(getCategories(TestQueries.getCategories()));

    assertEquals(result.items.length, 3);
    assertEquals(result.total, 3);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 10);

    const [salary, groceries, freelance] = result.items;

    assertEquals(salary.name, 'Salary');
    assertEquals(salary.type, 'INCOME');

    assertEquals(groceries.name, 'Groceries');
    assertEquals(groceries.type, 'EXPENSE');

    assertEquals(freelance.name, 'Freelance');
    assertEquals(freelance.type, 'INCOME');
  });

  await t.step('should filter categories by type', async () => {
    const result = await Effect.runPromise(
      getCategories(TestQueries.getCategories({ categoryType: 'INCOME' })),
    );

    assertEquals(result.items.length, 2);
    assertEquals(result.total, 2);
    result.items.forEach((category) => assertEquals(category.type, 'INCOME'));
  });
});
