import { Effect, ParseResult, Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { Money } from '../common/Money.ts';
import { UUID } from '../common/Schema.ts';

export class TransactionAggregate extends Schema.Class<TransactionAggregate>('Transaction')({
  id: Schema.UUID,
  accountId: Schema.UUID,
  amount: Money,
  date: Schema.Date,
  description: Schema.String.pipe(
    Schema.minLength(1),
    Schema.filter((desc: string): desc is string => desc.trim() === desc, {
      message: () => 'Description cannot contain leading or trailing whitespace',
    }),
  ),
  categoryId: Schema.optional(Schema.UUID),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
}) {
  static create(
    params: {
      accountId: UUID;
      amount: Money;
      date: Date;
      description: string;
      categoryId?: UUID;
    },
  ): Effect.Effect<TransactionAggregate, ParseResult.ParseError> {
    const id = randomUUID();
    const createdAt = new Date();
    return Effect.try({
      try: () => TransactionAggregate.make({ ...params, id, createdAt, updatedAt: createdAt }),
      catch: (error) => error as ParseResult.ParseError,
    });
  }

  updateCategory(categoryId: UUID): Effect.Effect<TransactionAggregate, ParseResult.ParseError> {
    return Effect.try({
      try: () => TransactionAggregate.make({ ...this, categoryId, updatedAt: new Date() }),
      catch: (error) => error as ParseResult.ParseError,
    });
  }
}
