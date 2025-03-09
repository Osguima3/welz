import { Schema } from 'effect';
import { EventMetadata } from '../common/EventMetadata.ts';
import { Money } from '../common/Money.ts';
import { AccountType } from './Account.ts';

export const AccountCreatedEvent = Schema.Struct({
  type: Schema.Literal('AccountCreated'),
  metadata: Schema.optional(EventMetadata),
  payload: Schema.Struct({
    accountId: Schema.UUID,
    name: Schema.String,
    accountType: AccountType,
    initialBalance: Money,
  }),
});

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
