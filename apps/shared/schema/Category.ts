import { Schema } from 'effect';
import { Color } from './Color.ts';
import Page from './Page.ts';

export const CategoryType = Schema.Literal('INCOME', 'EXPENSE');
export type CategoryType = typeof CategoryType.Type;

export class Category extends Schema.Class<Category>('Category')({
  id: Schema.UUID,
  name: Schema.String.pipe(
    Schema.minLength(2),
    Schema.filter((name: string): name is string => name.trim() === name, {
      message: () => 'Name cannot contain leading or trailing whitespace',
    }),
  ),
  type: CategoryType,
  color: Color,
  createdAt: Schema.Date,
}) {}

export const CategoryPage = Page.of(Category);
export type CategoryPage = typeof CategoryPage.Type;
