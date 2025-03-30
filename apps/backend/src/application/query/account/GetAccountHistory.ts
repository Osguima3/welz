import { Context, Effect, Layer } from 'effect';
import { AccountHistory } from '../../../../../shared/schema/AccountHistory.ts';
import { AccountRepository } from '../../../domain/account/AccountRepository.ts';
import { GetAccountHistoryQuery } from '../../../domain/account/queries.ts';
import { TransactionManager } from '../../command/TransactionManager.ts';

export class GetAccountHistory extends Context.Tag('GetAccountHistory')<
  GetAccountHistory,
  (query: GetAccountHistoryQuery) => Effect.Effect<AccountHistory, Error>
>() {
  static Live = Layer.effect(
    GetAccountHistory,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;
      const repository = yield* AccountRepository;

      return (query) =>
        transactionManager(
          true,
          () => repository.findAccountHistory({ ...query, dateRange: { start: query.start, end: query.end } }),
        );
    }),
  );
}
