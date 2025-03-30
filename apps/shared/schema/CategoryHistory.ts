import { Schema } from 'effect';
import { CategoryType } from './Category.ts';
import { Money } from './Money.ts';

export type CategoryHistoryEntry = typeof CategoryHistoryEntry.Type;
export const CategoryHistoryEntry = Schema.Struct({
  categoryId: Schema.UUID,
  month: Schema.Date,
  name: Schema.String,
  type: CategoryType,
  total: Money,
  average: Money,
  typeTotal: Money,
  typePercentage: Schema.Number,
});

export type CategoryHistory = typeof CategoryHistory.Type;
export const CategoryHistory = Schema.Array(CategoryHistoryEntry);
