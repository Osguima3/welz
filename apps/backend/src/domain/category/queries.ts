import { Schema } from 'effect';
import { CategoryType } from '../../../../shared/schema/Category.ts';

export type GetCategoriesQuery = typeof GetCategoriesQuery.Type;
export const GetCategoriesQuery = Schema.Struct({
  type: Schema.Literal('GetCategories'),
  categoryType: Schema.optional(CategoryType),
  page: Schema.optional(Schema.NumberFromString),
  pageSize: Schema.optional(Schema.NumberFromString),
});
