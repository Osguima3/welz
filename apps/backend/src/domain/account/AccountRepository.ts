import { Context, Effect } from 'effect';
import { Account, AccountPage } from '../../../../shared/schema/Account.ts';
import { AccountHistory } from '../../../../shared/schema/AccountHistory.ts';
import { UUID } from '../../../../shared/schema/UUID.ts';
import { DateRange } from '../common/DateRange.ts';

export interface FindAccountsOptions {
  page?: number;
  pageSize?: number;
}

export interface FindAccountHistoryOptions {
  accountId?: UUID;
  dateRange?: DateRange;
}

export class AccountRepository extends Context.Tag('AccountRepository')<
  AccountRepository,
  {
    findById(id: string): Effect.Effect<Account, Error>;
    findAccounts(options?: FindAccountsOptions): Effect.Effect<AccountPage, Error>;
    findAccountHistory(options?: FindAccountHistoryOptions): Effect.Effect<AccountHistory, Error>;
    save(account: Account): Effect.Effect<Account, Error>;
  }
>() {}
