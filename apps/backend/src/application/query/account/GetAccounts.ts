import { Context, Effect, Layer } from 'effect';
import { AccountPage } from '../../../../../shared/schema/Account.ts';
import { AccountRepository } from '../../../domain/account/AccountRepository.ts';
import { GetAccountsQuery } from '../../../domain/account/queries.ts';
import { TransactionManager } from '../../command/TransactionManager.ts';

export class GetAccounts extends Context.Tag('GetAccounts')<
  GetAccounts,
  (query: GetAccountsQuery) => Effect.Effect<AccountPage, Error>
>() {
  static Live = Layer.effect(
    GetAccounts,
    Effect.gen(function* () {
      const transactionManager = yield* TransactionManager;
      const repository = yield* AccountRepository;

      return (query) => transactionManager(true, () => repository.findAccounts(query));
    }),
  );
}
