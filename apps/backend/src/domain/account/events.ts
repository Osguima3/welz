import { Schema } from 'effect';
import { Money } from '../../../../shared/schema/Money.ts';
import { EventMetadata } from '../common/EventMetadata.ts';

export const AccountBalanceUpdatedEvent = Schema.Struct({
  type: Schema.Literal('AccountBalanceUpdated'),
  metadata: Schema.optional(EventMetadata),
  payload: Schema.Struct({
    accountId: Schema.UUID,
    oldBalance: Money,
    newBalance: Money,
    asOf: Schema.Date,
  }),
});
