import { Schema } from 'effect';
import { Currency } from './Currency.ts';

export class Money extends Schema.Class<Money>('Money')({
  amount: Schema.Number,
  currency: Currency,
}) {
  static create(amount: number, currency: string): Money {
    return Money.make({
      amount: amount,
      currency: Schema.decodeUnknownSync(Currency)(currency),
    });
  }
}
