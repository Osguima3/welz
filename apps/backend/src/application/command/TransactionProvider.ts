import { Context, Effect } from 'effect';

export interface TransactionContext {
  id: string;
  startTime: Date;
}

export class TransactionProvider extends Context.Tag('TransactionProvider')<
  TransactionProvider,
  {
    begin(): Effect.Effect<TransactionContext, Error>;
    commit(context: TransactionContext): Effect.Effect<void, Error>;
    rollback(context: TransactionContext): Effect.Effect<void, Error>;
  }
>() {}
