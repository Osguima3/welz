import { Context, Effect } from 'effect';
import { Category, CategoryPage, CategoryType } from '../../../../shared/schema/Category.ts';
import { CategoryHistory } from '../../../../shared/schema/CategoryHistory.ts';
import { DateRange } from '../common/DateRange.ts';

export interface FindCategoriesOptions {
  categoryType?: CategoryType;
  page?: number;
  pageSize?: number;
}

export interface FindCategoryHistoryOptions {
  categoryId?: string;
  dateRange?: DateRange;
  maxCategories?: number;
}

export class CategoryRepository extends Context.Tag('CategoryRepository')<
  CategoryRepository,
  {
    findById(id: string): Effect.Effect<Category, Error>;
    findCategories(options?: FindCategoriesOptions): Effect.Effect<CategoryPage, Error>;
    findCategoryHistory(options?: FindCategoryHistoryOptions): Effect.Effect<CategoryHistory, Error>;
  }
>() {}
