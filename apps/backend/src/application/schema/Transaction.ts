import { Schema } from 'effect';

export const CreateTransactionCommand = Schema.Struct({
  type: Schema.Literal('CreateTransaction'),
  accountId: Schema.UUID,
  amount: Schema.Struct({
    amount: Schema.BigInt,
    currency: Schema.String,
  }),
  date: Schema.Date,
  description: Schema.optional(Schema.String),
  category: Schema.optional(Schema.String),
  metadata: Schema.optional(Schema.Struct({
    description: Schema.String,
    merchantName: Schema.optional(Schema.String),
    reference: Schema.optional(Schema.String),
  })),
});

export const GetTransactionQuery = Schema.Struct({
  type: Schema.Literal('GetTransaction'),
  transactionId: Schema.UUID,
});
