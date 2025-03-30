import { Schema } from 'effect';
import { Money } from '../../../../shared/schema/Money.ts';

export type CreateTransactionCommand = typeof CreateTransactionCommand.Type;
export const CreateTransactionCommand = Schema.Struct({
  type: Schema.Literal('CreateTransaction'),
  accountId: Schema.UUID,
  amount: Money,
  date: Schema.Date,
  description: Schema.String,
  categoryId: Schema.optional(Schema.UUID),
});

export type CategorizeTransactionCommand = typeof CategorizeTransactionCommand.Type;
export const CategorizeTransactionCommand = Schema.Struct({
  type: Schema.Literal('CategorizeTransaction'),
  transactionId: Schema.UUID,
  categoryId: Schema.UUID,
});
