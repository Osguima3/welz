import { Schema } from 'effect';

export enum EventType {
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_UPDATED = 'TRANSACTION_UPDATED',
}

const EventMetadata = Schema.Struct({
  timestamp: Schema.String,
  correlationId: Schema.optional(Schema.String),
});

export const TransactionCreatedEvent = Schema.Struct({
  type: Schema.Literal(EventType.TRANSACTION_CREATED),
  payload: Schema.Struct({
    transactionId: Schema.String,
    accountId: Schema.String,
    amount: Schema.Struct({
      amount: Schema.BigIntFromSelf,
      currency: Schema.String,
    }),
    date: Schema.DateFromSelf,
    description: Schema.optional(Schema.String),
    category: Schema.optional(Schema.String),
  }),
  metadata: EventMetadata,
});

export const WelzEvent = Schema.Union(
  TransactionCreatedEvent,
);

export type WelzEvent = Schema.Schema.Type<typeof WelzEvent>;
