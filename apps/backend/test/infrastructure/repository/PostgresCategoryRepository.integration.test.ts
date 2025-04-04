import { assertEquals, assertGreater, assertLessOrEqual } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { TransactionManager } from '../../../src/application/command/TransactionManager.ts';
import { CategoryRepository } from '../../../src/domain/category/CategoryRepository.ts';
import { IntegrationTestLayer } from '../../helper/TestLayers.ts';
import { ReadModelRepository } from '../../../src/domain/readmodel/ReadModelRepository.ts';

Deno.test('PostgresCategoryRepository Integration', async (t) => {
  let repository: Effect.Effect.Success<typeof CategoryRepository>;
  let readModelRepository: Effect.Effect.Success<typeof ReadModelRepository>;
  let transactionManager: Effect.Effect.Success<typeof TransactionManager>;

  function runTransaction<T>(operation: Effect.Effect<T, Error>): Promise<T> {
    return Effect.runPromise(transactionManager(true, () => operation));
  }

  await t.step('setup', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        repository = yield* CategoryRepository;
        readModelRepository = yield* ReadModelRepository;
        transactionManager = yield* TransactionManager;
      }).pipe(
        Effect.provide(IntegrationTestLayer),
      ),
    );
  });

  await t.step('should find all categories', async () => {
    const result = await runTransaction(repository.findCategories());

    assertEquals(result.total, 14);
    assertEquals(result.items.length, 14);
    assertEquals(result.page, 1);
    assertEquals(result.pageSize, 50);

    const categoryByName = new Map(result.items.map((c) => [c.name, c]));

    const salary = categoryByName.get('Salary');
    assertEquals(salary?.type, 'INCOME');

    const groceries = categoryByName.get('Food & Dining');
    assertEquals(groceries?.type, 'EXPENSE');
  });

  await t.step('should filter categories by type', async () => {
    const result = await runTransaction(repository.findCategories({ categoryType: 'INCOME' }));

    assertEquals(result.total, 3);
    assertEquals(result.items.length, 3);
    result.items.forEach((category) => assertEquals(category.type, 'INCOME'));

    // Verify known income categories
    const names = new Set(result.items.map((c) => c.name));
    assertEquals(names.has('Salary'), true);
    assertEquals(names.has('Investments'), true);
    assertEquals(names.has('Other Income'), true);
  });

  await t.step('should paginate categories', async () => {
    const { firstPage, secondPage } = await runTransaction(
      Effect.gen(function* () {
        const firstPage = yield* repository.findCategories({ page: 1, pageSize: 10 });
        const secondPage = yield* repository.findCategories({ page: 2, pageSize: 10 });
        return { firstPage, secondPage };
      }),
    );

    assertEquals(firstPage.total, 14);
    assertEquals(firstPage.items.length, 10);
    assertEquals(firstPage.page, 1);
    assertEquals(firstPage.pageSize, 10);

    assertEquals(secondPage.total, 14);
    assertEquals(secondPage.items.length, 4);
    assertEquals(secondPage.page, 2);
    assertEquals(secondPage.pageSize, 10);
  });

  await t.step('should find category by id', async () => {
    const categories = await runTransaction(repository.findCategories());
    const category = categories.items.find((c) => c.name === 'Salary');
    if (!category) throw new Error('Test category not found');

    const result = await runTransaction(repository.findById(category.id));
    assertEquals(result.id, category.id);
    assertEquals(result.name, 'Salary');
    assertEquals(result.type, 'INCOME');
  });

  await t.step('should get category history data', async () => {
    await runTransaction(readModelRepository.refreshMaterializedViews());

    const months = 6;
    const maxCategories = 3;
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - months + 1, 1);

    const result = await runTransaction(repository.findCategoryHistory({ dateRange: { start, end }, maxCategories }));

    // Verify we get data and respect limits
    assertGreater(result.length, 0);

    // Check category data structure
    const firstCategory = result[0];
    assertEquals('month' in firstCategory, true);
    assertEquals('categoryId' in firstCategory, true);
    assertEquals('name' in firstCategory, true);
    assertEquals('type' in firstCategory, true);
    assertEquals('color' in firstCategory, true);
    assertEquals('total' in firstCategory, true);
    assertEquals('typeTotal' in firstCategory, true);
    assertEquals('typePercentage' in firstCategory, true);

    // Verify percentages add up correctly
    const monthCategories = result.filter((c) => c.month.toISOString() === result[0].month.toISOString());
    const expensePercentages = monthCategories
      .filter((c) => c.type === 'EXPENSE')
      .reduce((sum, c) => sum + c.typePercentage, 0);
    const incomePercentages = monthCategories
      .filter((c) => c.type === 'INCOME')
      .reduce((sum, c) => sum + c.typePercentage, 0);

    assertLessOrEqual(expensePercentages, 100);
    assertLessOrEqual(incomePercentages, 100);

    // Verify time range
    const oldestMonth = result[result.length - 1].month;
    const threshold = new Date(end.getFullYear(), end.getMonth() - months, 1);
    assertEquals(oldestMonth >= threshold, true);
  });
});
