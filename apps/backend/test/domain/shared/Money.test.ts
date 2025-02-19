import { Effect } from 'effect';
import { describe, it } from '@std/testing/bdd.ts';
import { assertEquals, assertThrows } from '@std/assert/mod.ts';
import { Money } from '../../../src/domain/shared/Money.ts';

describe('Money', () => {
  it('should create a valid money object', () => {
    const program = Effect.sync(() => {
      const money = Money.of(100n, 'EUR');
      return money;
    });

    const result = Effect.runSync(program);
    assertEquals(result.amount, 100n);
    assertEquals(result.currency, 'EUR');
  });

  it('should add two money values of the same currency', () => {
    const program = Effect.sync(() => {
      const money1 = Money.of(100n, 'EUR');
      const money2 = Money.of(200n, 'EUR');
      return money1.add(money2);
    });

    const result = Effect.runSync(program);
    assertEquals(result.amount, 300n);
    assertEquals(result.currency, 'EUR');
  });

  it('should throw error when adding different currencies', () => {
    const program = Effect.sync(() => {
      const money1 = Money.of(100n, 'EUR');
      const money2 = Money.of(200n, 'USD');
      return money1.add(money2);
    });

    assertThrows(() => Effect.runSync(program), Error, 'Cannot add money of different currencies');
  });

  it('should subtract two money values of the same currency', () => {
    const program = Effect.sync(() => {
      const money1 = Money.of(300n, 'EUR');
      const money2 = Money.of(100n, 'EUR');
      return money1.subtract(money2);
    });

    const result = Effect.runSync(program);
    assertEquals(result.amount, 200n);
    assertEquals(result.currency, 'EUR');
  });

  it('should throw error when subtracting different currencies', () => {
    const program = Effect.sync(() => {
      const money1 = Money.of(300n, 'EUR');
      const money2 = Money.of(100n, 'USD');
      return money1.subtract(money2);
    });

    assertThrows(() => Effect.runSync(program), Error, 'Cannot subtract money of different currencies');
  });

  it('should multiply money by a factor', () => {
    const program = Effect.sync(() => {
      const money = Money.of(100n, 'EUR');
      return money.multiply(2.5);
    });

    const result = Effect.runSync(program);
    assertEquals(result.amount, 250n);
    assertEquals(result.currency, 'EUR');
  });

  it('should handle multiplication with decimal numbers correctly', () => {
    const program = Effect.sync(() => {
      const money = Money.of(100n, 'EUR');
      return money.multiply(1.99);
    });

    const result = Effect.runSync(program);
    assertEquals(result.amount, 199n);
    assertEquals(result.currency, 'EUR');
  });

  it('should compare money values correctly', () => {
    const program = Effect.sync(() => {
      const money1 = Money.of(100n, 'EUR');
      const money2 = Money.of(100n, 'EUR');
      const money3 = Money.of(100n, 'USD');
      const money4 = Money.of(200n, 'EUR');

      return {
        sameAmountAndCurrency: money1.equals(money2),
        differentCurrency: money1.equals(money3),
        differentAmount: money1.equals(money4),
      };
    });

    const result = Effect.runSync(program);
    assertEquals(result.sameAmountAndCurrency, true);
    assertEquals(result.differentCurrency, false);
    assertEquals(result.differentAmount, false);
  });
});
