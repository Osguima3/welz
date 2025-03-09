import { Context, Effect, Layer, Match } from 'effect';
import { Query } from '../schema/Query.ts';
import { GetAccountTransactions } from './transaction/GetAccountTransactions.ts';

export class QueryRouter extends Context.Tag('QueryRouter')<
  QueryRouter,
  (query: Query) => Effect.Effect<unknown, Error>
>() {
  static Live = Layer.effect(
    QueryRouter,
    Effect.gen(function* () {
      const getAccountTransactions = yield* GetAccountTransactions;

      return (request) =>
        Match.value(request).pipe(
          Match.when({ type: 'GetAccountTransactions' }, getAccountTransactions),
          Match.exhaustive,
        );
    }),
  );
}
