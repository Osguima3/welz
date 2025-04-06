import { Context, Effect, Layer, Match, Redacted } from 'effect';
import { Pool, PostgresError } from 'postgres/mod.ts';
import { QueryArguments } from 'postgres/query/query.ts';
import { AppConfig } from '../config/AppConfig.ts';

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
      const config = yield* AppConfig;

      const sslEnabled = Deno.env.get('DATABASE_SSL') === 'true';
      let caCertificates: string[] = [];
      if (sslEnabled) {
        const caCert = Deno.env.get('DATABASE_CERTIFICATE');
        if (!caCert) {
          throw new Error('Missing database certificate');
        }

        caCertificates = [caCert];
      }

      const pool = new Pool(
        {
          hostname: config.database.host,
          port: config.database.port,
          database: config.database.name,
          user: config.database.user,
          password: Redacted.value(config.database.password),
          tls: { enabled: sslEnabled, caCertificates },
        },
        config.database.poolSize,
        true,
      );

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
