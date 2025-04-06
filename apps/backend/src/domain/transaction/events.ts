import { Money } from '@shared/schema/Money.ts';
import { Schema } from 'effect';
import { EventMetadata } from '../common/EventMetadata.ts';

export type TransactionCreatedEvent = typeof TransactionCreatedEvent.Type;
export const TransactionCreatedEvent = Schema.Struct({
  type: Schema.Literal('TransactionCreated'),
  metadata: Schema.optional(EventMetadata),
  payload: Schema.Struct({
    id: Schema.UUID,
    accountId: Schema.UUID,
    amount: Money,
    date: Schema.Date,
    description: Schema.String,
    categoryId: Schema.optional(Schema.UUID),
  }),
});

export type TransactionCategorizedEvent = typeof TransactionCategorizedEvent.Type;
export const TransactionCategorizedEvent = Schema.Struct({
  type: Schema.Literal('TransactionCategorized'),
  metadata: Schema.optional(EventMetadata),
  payload: Schema.Struct({
    id: Schema.UUID,
    categoryId: Schema.UUID,
    previousCategoryId: Schema.optional(Schema.UUID),
  }),
});
