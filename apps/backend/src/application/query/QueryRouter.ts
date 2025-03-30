import { Context, Effect, Layer, Match } from 'effect';
import { Query, QueryResponse } from '../schema/Query.ts';
import { GetAccounts } from './account/GetAccounts.ts';
import { GetCategories } from './category/GetCategories.ts';
import { GetTransactions } from './transaction/GetTransactions.ts';

export class QueryRouter extends Context.Tag('QueryRouter')<
  QueryRouter,
  (query: Query) => Effect.Effect<QueryResponse, Error>
>() {
  static Live = Layer.effect(
    QueryRouter,
    Effect.gen(function* () {
      const getAccounts = yield* GetAccounts;
      const getCategories = yield* GetCategories;
      const getTransactions = yield* GetTransactions;

      return (request) =>
        Match.value(request).pipe(
          Match.withReturnType<Effect.Effect<QueryResponse, Error>>(),
          Match.when({ type: 'GetAccounts' }, getAccounts),
          Match.when({ type: 'GetCategories' }, getCategories),
          Match.when({ type: 'GetTransactions' }, getTransactions),
          Match.exhaustive,
        );
    }),
  );
}
