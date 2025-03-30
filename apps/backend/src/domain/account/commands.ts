import { Schema } from 'effect';
import { Money } from '../../../../shared/schema/Money.ts';

export const UpdateBalanceCommand = Schema.Struct({
  accountId: Schema.UUID,
  newBalance: Money,
  asOf: Schema.Date,
});
