import { Context, Effect, Layer, Match, Schema } from 'effect';
import { QuerySchema } from '../schema/Query.ts';
import { GetUser } from './GetUser.ts';

export class QueryRouter extends Context.Tag('QueryRouter')<
  QueryRouter,
  (request: Schema.Schema.Type<typeof QuerySchema>) => Effect.Effect<unknown, Error>
>() {
  static Live = Layer.effect(
    QueryRouter,
    Effect.gen(function* () {
      const getUser = yield* GetUser;
      return (request) =>
        Match.value(request).pipe(
          Match.when({ type: 'GetUser' }, getUser),
          Match.orElse((_) => Effect.fail(new Error('Invalid Query'))),
        );
    }),
  );
}
