import { Effect, ParseResult, Schema } from 'effect';
import { Money } from './Money.ts';
import Page from './Page.ts';
import { UUID } from './UUID.ts';

export class Transaction extends Schema.Class<Transaction>('Transaction')({
  id: Schema.UUID,
  accountId: Schema.UUID,
  categoryId: Schema.optional(Schema.UUID),
  description: Schema.String.pipe(
    Schema.minLength(1),
    Schema.filter((desc: string): desc is string => desc.trim() === desc, {
      message: () => 'Description cannot contain leading or trailing whitespace',
    }),
  ),
  amount: Money,
  date: Schema.Date,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
}) {
  updateCategory(categoryId: UUID): Effect.Effect<Transaction, ParseResult.ParseError> {
    return Effect.try({
      try: () => Transaction.make({ ...this, categoryId, updatedAt: new Date() }),
      catch: (error) => error as ParseResult.ParseError,
    });
  }
}

export const TransactionPage = Page.of(Transaction);
export type TransactionPage = typeof TransactionPage.Type;
