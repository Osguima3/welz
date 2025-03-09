import { Context, Effect, Layer, Match } from 'effect';
import { Command } from '../schema/Command.ts';
import { CreateTransaction } from './transaction/CreateTransaction.ts';

export class CommandRouter extends Context.Tag('CommandRouter')<
  CommandRouter,
  (command: Command) => Effect.Effect<unknown, Error>
>() {
  static Live = Layer.effect(
    CommandRouter,
    Effect.gen(function* () {
      const createTransaction = yield* CreateTransaction;

      return (request) =>
        Match.value(request).pipe(
          Match.when({ type: 'CreateTransaction' }, createTransaction),
          Match.exhaustive,
        );
    }),
  );
}
