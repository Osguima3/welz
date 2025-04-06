import { Money } from '@shared/schema/Money.ts';
import { Schema } from 'effect';

export const UpdateBalanceCommand = Schema.Struct({
  accountId: Schema.UUID,
  newBalance: Money,
  asOf: Schema.Date,
});
