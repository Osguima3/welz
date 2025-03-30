import { Schema } from 'effect';
import { AccountType } from './Account.ts';
import { Money } from './Money.ts';

export type AccountHistoryEntry = typeof AccountHistoryEntry.Type;
export const AccountHistoryEntry = Schema.Struct({
  accountId: Schema.UUID,
  month: Schema.Date,
  name: Schema.String,
  type: AccountType,
  lastUpdated: Schema.Date,
  balance: Money,
  monthBalance: Money,
  monthIncome: Money,
  monthExpenses: Money,
});

export type AccountHistory = typeof AccountHistory.Type;
export const AccountHistory = Schema.Array(AccountHistoryEntry);
