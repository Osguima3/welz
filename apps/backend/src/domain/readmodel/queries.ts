import { Schema } from 'effect';
import { Currency } from '../common/Currency.ts';

export type DateRange = typeof DateRange.Type;
export const DateRange = Schema.Struct({
  start: Schema.Date,
  end: Schema.Date,
});

export type GetNetWorthHistoryQuery = typeof GetNetWorthHistoryQuery.Type;
export const GetNetWorthHistoryQuery = Schema.Struct({
  type: Schema.Literal('GetNetWorthHistory'),
  currency: Schema.optional(Currency),
  dateRange: Schema.optional(DateRange),
});

export type GetCategorySpendingQuery = typeof GetCategorySpendingQuery.Type;
export const GetCategorySpendingQuery = Schema.Struct({
  type: Schema.Literal('GetCategorySpending'),
  currency: Schema.optional(Currency),
  dateRange: Schema.optional(DateRange),
  categoryId: Schema.optional(Schema.UUID),
  aggregation: Schema.Union(
    Schema.Literal('daily'),
    Schema.Literal('weekly'),
    Schema.Literal('monthly'),
    Schema.Literal('yearly'),
  ),
});
