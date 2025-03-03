import { Context, Effect, Layer, Match, Schema } from 'effect';
import { CommandSchema } from '../schema/Command.ts';
import { CreateUser } from './user/CreateUser.ts';
import { CreateTransaction } from './transaction/CreateTransaction.ts';

export class CommandRouter extends Context.Tag('CommandRouter')<
  CommandRouter,
  (request: Schema.Schema.Type<typeof CommandSchema>) => Effect.Effect<unknown, Error>
>() {
  static Live = Layer.effect(
    CommandRouter,
    Effect.gen(function* () {
      const createUser = yield* CreateUser;
      const createTransaction = yield* CreateTransaction;
      return (request) =>
        Match.value(request).pipe(
          Match.when({ type: 'CreateUser' }, createUser),
          Match.when({ type: 'CreateTransaction' }, createTransaction),
          Match.exhaustive,
        );
    }),
  );
}
