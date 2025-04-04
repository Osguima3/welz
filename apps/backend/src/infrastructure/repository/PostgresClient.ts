import { Context, Effect, Layer, Match } from 'effect';
import { Pool, PostgresError } from 'postgres/mod.ts';
import { QueryArguments } from 'postgres/query/query.ts';
import { PostgresConfig } from './PostgresConfig.ts';

export class PostgresClient extends Context.Tag('PostgresClient')<
  PostgresClient,
  {
    connect(): Effect.Effect<void, Error>;
    runQuery<T>(query: string, args?: QueryArguments): Effect.Effect<{ rows: T[] }, Error>;
    end(): Effect.Effect<void>;
  }
>() {
  static Live = Layer.scoped(
    PostgresClient,
    Effect.gen(function* () {
      const config = yield* PostgresConfig;
      const pool = new Pool(config, config.poolSize);

      function connect() {
        return Effect.tryPromise({
          try: async () => await pool.connect(),
          catch: (error) => new Error(`Failed to connect to the database: ${error}`),
        });
      }

      return {
        connect,

        runQuery: <T>(query: string, args?: QueryArguments) =>
          Effect.gen(function* () {
            const connection = yield* connect();

            try {
              yield* Effect.logDebug('Executing query');
              return yield* Effect.promise(() => connection.queryObject<T>(query, args));
            } finally {
              connection.release();
            }
          }).pipe(
            Effect.tapErrorCause((cause) =>
              Match.value(cause).pipe(
                Match.when(
                  { defect: Match.instanceOf(PostgresError) },
                  (e) => Effect.fail(new Error(`Failed to run query: ${e.defect.message}`, { cause: e.defect })),
                ),
                Match.orElse((e) => Effect.fail(new Error(`Failed to run query`, { cause: e }))),
              )
            ),
            Effect.annotateLogs({ query, query_args: args }),
          ),

        end: () => Effect.promise(() => pool.end()),
      };
    }),
  );
}
