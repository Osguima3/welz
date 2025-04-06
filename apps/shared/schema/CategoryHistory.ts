import { Schema } from 'effect';
import { CategoryType } from './Category.ts';
import { Color } from './Color.ts';
import { Money } from './Money.ts';

export type CategoryHistoryEntry = typeof CategoryHistoryEntry.Type;
export const CategoryHistoryEntry = Schema.Struct({
  categoryId: Schema.UUID,
  month: Schema.Date,
  name: Schema.String,
  type: CategoryType,
  color: Color,
  total: Money,
  typeTotal: Money,
  typePercentage: Schema.Number,
  forecast: Schema.optional(Money),
});

export type CategoryHistory = typeof CategoryHistory.Type;
export const CategoryHistory = Schema.Array(CategoryHistoryEntry);
