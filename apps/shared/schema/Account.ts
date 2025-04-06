import { Effect, ParseResult, Schema } from 'effect';
import { Money } from './Money.ts';
import Page from './Page.ts';

export type AccountType = typeof AccountType.Type;
export const AccountType = Schema.Literal('CASH', 'BANK');

export class Account extends Schema.Class<Account>('Account')({
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
  updateBalance(balance: Money): Effect.Effect<Account, ParseResult.ParseError | Error> {
    if (balance.currency !== this.balance.currency) {
      return Effect.fail(new Error('Cannot update balance with different currency'));
    }
    return Effect.try({
      try: () => Account.make({ ...this, balance, updatedAt: new Date() }),
      catch: (error) => error as ParseResult.ParseError,
    });
  }
}

export const AccountPage = Page.of(Account);
export type AccountPage = typeof AccountPage.Type;
