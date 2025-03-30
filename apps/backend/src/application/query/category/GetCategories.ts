import { Context, Effect, Layer } from 'effect';
import { CategoryPage } from '../../../../../shared/schema/Category.ts';
import { CategoryRepository } from '../../../domain/category/CategoryRepository.ts';
import { GetCategoriesQuery } from '../../../domain/category/queries.ts';
import { TransactionManager } from '../../command/TransactionManager.ts';

export class GetCategories extends Context.Tag('GetCategories')<
  GetCategories,
  (query: GetCategoriesQuery) => Effect.Effect<CategoryPage, Error>
>() {
  static Live = Layer.effect(
    GetCategories,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;
      const repository = yield* CategoryRepository;

      return (query) => transactionManager(true, () => repository.findCategories(query));
    }),
  );
}
