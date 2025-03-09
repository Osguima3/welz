import { Schema } from 'effect';
import { CategoryType } from './Category.ts';

export type CreateCategoryCommand = typeof CreateCategoryCommand.Type;
export const CreateCategoryCommand = Schema.Struct({
  name: Schema.String,
  type: CategoryType,
});

export type UpdateCategoryCommand = typeof UpdateCategoryCommand.Type;
export const UpdateCategoryCommand = Schema.Struct({
  categoryId: Schema.UUID,
  name: Schema.String,
});
