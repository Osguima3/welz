import '$std/dotenv/load.ts';
import { Config, Context, Effect, Layer, Redacted } from 'effect';

export class AppConfig extends Context.Tag('BackendConfig')<
  AppConfig,
  {
    backend: {
      port: number;
      corsOrigin: string;
    };
    database: {
      host: string;
      port: number;
      name: string;
      user: string;
      password: Redacted.Redacted<string>;
      poolSize: number;
    };
  }
>() {
  static FromEnv = Layer.effect(
    AppConfig,
    Effect.gen(function* () {
      return {
        backend: {
          port: yield* Config.number('BACKEND_PORT'),
          corsOrigin: yield* Config.string('CORS_ORIGIN'),
        },
        database: {
          host: yield* Config.string('DATABASE_HOST'),
          port: yield* Config.number('DATABASE_PORT'),
          name: yield* Config.string('DATABASE_NAME'),
          user: yield* Config.string('DATABASE_USER'),
          password: yield* Config.redacted('DATABASE_PASSWORD'),
          poolSize: yield* Config.number('DATABASE_POOL_SIZE'),
        },
      };
    }),
  );
}
