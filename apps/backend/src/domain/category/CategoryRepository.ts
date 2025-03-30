import { Context, Effect } from 'effect';
import { Category, CategoryPage, CategoryType } from '../../../../shared/schema/Category.ts';

export interface FindCategoriesOptions {
  categoryType?: CategoryType;
  page?: number;
  pageSize?: number;
}

export class CategoryRepository extends Context.Tag('CategoryRepository')<
  CategoryRepository,
  {
    findById(id: string): Effect.Effect<Category, Error>;
    findCategories(options?: FindCategoriesOptions): Effect.Effect<CategoryPage, Error>;
  }
>() {}
