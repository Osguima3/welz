import { Schema } from 'effect';
import { Money } from '../common/Money.ts';
import { AccountType } from './Account.ts';

export const CreateAccountCommand = Schema.Struct({
  name: Schema.String,
  type: AccountType,
  initialBalance: Money,
});

export const UpdateBalanceCommand = Schema.Struct({
  accountId: Schema.UUID,
  newBalance: Money,
  asOf: Schema.Date,
});
