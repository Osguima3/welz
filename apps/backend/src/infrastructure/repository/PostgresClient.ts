import { Context, Effect, Layer } from 'effect';
import { Client } from 'postgres/mod.ts';
import { QueryArguments } from 'postgres/query/query.ts';
import { PostgresConfig } from './PostgresConfig.ts';

export class PostgresClient extends Context.Tag('PostgresClient')<
  PostgresClient,
  {
    connect(): Effect.Effect<void, Error>;
    queryObject<T>(query: string, args?: QueryArguments): Effect.Effect<{ rows: T[] }, Error>;
    queryArray(query: string, args?: QueryArguments): Effect.Effect<{ rows: unknown[] }, Error>;
    end(): Effect.Effect<void>;
  }
>() {
  static Live = Layer.scoped(
    PostgresClient,
    Effect.gen(function* () {
      const config = yield* PostgresConfig;
      const client = new Client(config);

      return {
        connect: () =>
          Effect.tryPromise({
            try: () => client.connect(),
            catch: (error) => new Error(`Failed to connect to the database: ${error}`),
          }),

        queryObject: <T>(query: string, args?: QueryArguments) =>
          Effect.promise(() => client.queryObject<T>(query, args)),

        queryArray: (query: string, args?: QueryArguments) => Effect.promise(() => client.queryArray(query, args)),

        end: () => Effect.promise(() => client.end()),
      };
    }),
  );
}
