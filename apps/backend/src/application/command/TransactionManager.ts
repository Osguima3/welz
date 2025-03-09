import { Context, Effect } from 'effect';
import { PostgresClient } from '../../infrastructure/repository/PostgresClient.ts';

export class TransactionManager extends Context.Tag('TransactionManager')<
  TransactionManager,
  {
    <T>(operation: () => Effect.Effect<T, Error, PostgresClient>): Effect.Effect<T, Error>;
  }
>() {}
