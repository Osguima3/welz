import { Effect, ParseResult, Schema } from 'effect';
import { randomUUID } from 'node:crypto';

export const CategoryType = Schema.Literal('INCOME', 'EXPENSE');
export type CategoryType = typeof CategoryType.Type;

export class CategoryAggregate extends Schema.Class<CategoryAggregate>('Category')({
  id: Schema.UUID,
  name: Schema.String.pipe(
    Schema.minLength(2),
    Schema.filter((name: string): name is string => name.trim() === name, {
      message: () => 'Name cannot contain leading or trailing whitespace',
    }),
  ),
  type: CategoryType,
  createdAt: Schema.Date,
}) {
  static create(
    params: { name: string; type: CategoryType },
  ): Effect.Effect<CategoryAggregate, ParseResult.ParseError, never> {
    const id = randomUUID();
    const createdAt = new Date();
    return Effect.try({
      try: () => CategoryAggregate.make({ ...params, id, createdAt }),
      catch: (error) => error as ParseResult.ParseError,
    });
  }
}
