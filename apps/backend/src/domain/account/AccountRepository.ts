import { Context, Effect } from 'effect';
import { Account, AccountPage } from '../../../../shared/schema/Account.ts';

export interface FindAccountsOptions {
  page?: number;
  pageSize?: number;
}

export class AccountRepository extends Context.Tag('AccountRepository')<
  AccountRepository,
  {
    findById(id: string): Effect.Effect<Account, Error>;
    findAccounts(options?: FindAccountsOptions): Effect.Effect<AccountPage, Error>;
    save(account: Account): Effect.Effect<Account, Error>;
  }
>() {}
