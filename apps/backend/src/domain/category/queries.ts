import { CategoryType } from '@shared/schema/Category.ts';
import { Schema } from 'effect';

export type GetCategoriesQuery = typeof GetCategoriesQuery.Type;
export const GetCategoriesQuery = Schema.Struct({
  type: Schema.Literal('GetCategories'),
  categoryId: Schema.optional(Schema.UUID),
  categoryType: Schema.optional(CategoryType),
  page: Schema.optional(Schema.NumberFromString),
  pageSize: Schema.optional(Schema.NumberFromString),
});

export type GetCategoryHistoryQuery = typeof GetCategoryHistoryQuery.Type;
export const GetCategoryHistoryQuery = Schema.Struct({
  type: Schema.Literal('GetCategoryHistory'),
  categoryId: Schema.UUID,
  start: Schema.optional(Schema.Date),
  end: Schema.optional(Schema.Date),
});
