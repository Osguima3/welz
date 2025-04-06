import { Currency } from '@shared/schema/Currency.ts';
import { Schema } from 'effect';
import { DateRange } from '../common/DateRange.ts';

export type GetNetWorthHistoryQuery = typeof GetNetWorthHistoryQuery.Type;
export const GetNetWorthHistoryQuery = Schema.Struct({
  type: Schema.Literal('GetNetWorthHistory'),
  currency: Schema.optional(Currency),
  dateRange: Schema.optional(DateRange),
  aggregation: Schema.Literal('DAILY', 'WEEKLY', 'MONTHLY'),
});
