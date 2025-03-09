import { Effect, ParseResult, Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { Money } from '../common/Money.ts';

export type AccountType = typeof AccountType.Type;
export const AccountType = Schema.Literal('CASH', 'BANK');

export class AccountAggregate extends Schema.Class<AccountAggregate>('Account')({
  id: Schema.UUID,
  name: Schema.String.pipe(
    Schema.minLength(2),
    Schema.filter((name: string): name is string => name.trim() === name, {
      message: () => 'Name cannot contain leading or trailing whitespace',
    }),
  ),
  type: AccountType,
  balance: Money,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
}) {
  static create(
    params: { name: string; type: AccountType; balance: Money },
  ): Effect.Effect<AccountAggregate, ParseResult.ParseError> {
    const id = randomUUID();
    const createdAt = new Date();
    return Effect.try({
      try: () => AccountAggregate.make({ ...params, id, createdAt, updatedAt: createdAt }),
      catch: (error) => error as ParseResult.ParseError,
    });
  }

  updateBalance(balance: Money): Effect.Effect<AccountAggregate, ParseResult.ParseError | Error> {
    if (balance.currency !== this.balance.currency) {
      return Effect.fail(new Error('Cannot update balance with different currency'));
    }
    return Effect.try({
      try: () => AccountAggregate.make({ ...this, balance, updatedAt: new Date() }),
      catch: (error) => error as ParseResult.ParseError,
    });
  }
}
