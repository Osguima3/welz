import { Context, Effect, Layer, Match } from 'effect';
import { Query, QueryResponse } from '../schema/Query.ts';
import { GetAccounts } from './account/GetAccounts.ts';
import { GetCategories } from './category/GetCategories.ts';
import { GetCategoryHistory } from './category/GetCategoryHistory.ts';
import { GetNetWorth } from './networth/GetNetWorth.ts';
import { GetTransactions } from './transaction/GetTransactions.ts';
import { GetAccountHistory } from './account/GetAccountHistory.ts';

export class QueryRouter extends Context.Tag('QueryRouter')<
  QueryRouter,
  (query: Query) => Effect.Effect<QueryResponse, Error>
>() {
  static Live = Layer.effect(
    QueryRouter,
    Effect.gen(function* () {
      const getAccounts = yield* GetAccounts;
      const getAccountHistory = yield* GetAccountHistory;
      const getCategories = yield* GetCategories;
      const getCategoryHistory = yield* GetCategoryHistory;
      const getTransactions = yield* GetTransactions;
      const getNetWorth = yield* GetNetWorth;

      return (request) =>
        Match.value(request).pipe(
          Match.withReturnType<Effect.Effect<QueryResponse, Error>>(),
          Match.when({ type: 'GetAccounts' }, getAccounts),
          Match.when({ type: 'GetAccountHistory' }, getAccountHistory),
          Match.when({ type: 'GetCategories' }, getCategories),
          Match.when({ type: 'GetCategoryHistory' }, getCategoryHistory),
          Match.when({ type: 'GetTransactions' }, getTransactions),
          Match.when({ type: 'GetNetWorth' }, getNetWorth),
          Match.exhaustive,
        );
    }),
  );
}
