import { Context, Effect, Layer, Match } from 'effect';
import { Command, CommandResponse } from '../schema/Command.ts';
import { CategorizeTransaction } from './transaction/CategorizeTransaction.ts';
import { CreateTransaction } from './transaction/CreateTransaction.ts';

export class CommandRouter extends Context.Tag('CommandRouter')<
  CommandRouter,
  (command: Command) => Effect.Effect<CommandResponse, Error>
>() {
  static Live = Layer.effect(
    CommandRouter,
    Effect.gen(function* () {
      const createTransaction = yield* CreateTransaction;
      const categorizeTransaction = yield* CategorizeTransaction;

      return (request) =>
        Match.value(request).pipe(
          Match.withReturnType<Effect.Effect<CommandResponse, Error>>(),
          Match.when({ type: 'CreateTransaction' }, createTransaction),
          Match.when({ type: 'CategorizeTransaction' }, categorizeTransaction),
          Match.exhaustive,
        );
    }),
  );
}
