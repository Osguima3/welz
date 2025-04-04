import { Schema } from 'effect';
import { Currency } from './Currency.ts';

export class Money extends Schema.Class<Money>('Money')({
  amount: Schema.Number,
  currency: Currency,
}) {
  static create(amount: number | string, currency: string): Money {
    return Money.make({
      amount: Number(amount),
      currency: Schema.decodeUnknownSync(Currency)(currency),
    });
  }

  static zero(currency: Currency): Money {
    return Money.make({ amount: 0, currency });
  }

  static minus(money: Money): Money {
    return Money.make({ amount: -money.amount, currency: money.currency });
  }

  static add(money1: Money, money2: Money): Money {
    if (money1.currency !== money2.currency) {
      throw new Error('Currency mismatch');
    }

    return Money.make({ amount: money1.amount + money2.amount, currency: money1.currency });
  }

  static subtract(money1: Money, money2: Money): Money {
    if (money1.currency !== money2.currency) {
      throw new Error('Currency mismatch');
    }
    return Money.make({ amount: money1.amount - money2.amount, currency: money1.currency });
  }

  static min(money1: Money, money2: Money): Money {
    if (money1.currency !== money2.currency) {
      throw new Error('Currency mismatch');
    }

    return money1.amount <= money2.amount ? money1 : money2;
  }

  static max(money1: Money, money2: Money): Money {
    if (money1.currency !== money2.currency) {
      throw new Error('Currency mismatch');
    }

    return money1.amount >= money2.amount ? money1 : money2;
  }

  static reduceAdd = <T, K extends keyof T>(property: K) => (sum: Money, item: T) =>
    Money.add(sum, item[property] as Money);
}
