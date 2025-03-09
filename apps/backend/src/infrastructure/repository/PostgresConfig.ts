import { Context, Layer } from 'effect';

export class PostgresConfig extends Context.Tag('PostgresConfig')<
  PostgresConfig,
  {
    database: string;
    user: string;
    password: string;
    hostname: string;
    port: number;
    poolSize: number;
  }
>() {
  static Local = Layer.succeed(PostgresConfig, {
    database: 'welz_db',
    user: 'user',
    password: 'password',
    hostname: 'localhost',
    port: 5432,
    poolSize: 10,
  });
}
