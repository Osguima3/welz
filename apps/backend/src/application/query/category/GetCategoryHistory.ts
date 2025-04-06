import { CategoryHistory } from '@shared/schema/CategoryHistory.ts';
import { Context, Effect, Layer } from 'effect';
import { CategoryRepository } from '../../../domain/category/CategoryRepository.ts';
import { GetCategoryHistoryQuery } from '../../../domain/category/queries.ts';
import { TransactionManager } from '../../command/TransactionManager.ts';

export class GetCategoryHistory extends Context.Tag('GetCategoryHistory')<
  GetCategoryHistory,
  (query: GetCategoryHistoryQuery) => Effect.Effect<CategoryHistory, Error>
>() {
  static Live = Layer.effect(
    GetCategoryHistory,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;
      const repository = yield* CategoryRepository;

      return (query) =>
        transactionManager(true, () =>
          repository.findCategoryHistory({
            ...query,
            dateRange: { start: query.start, end: query.end },
          }));
    }),
  );
}
