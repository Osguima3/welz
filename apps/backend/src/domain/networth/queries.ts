import { Schema } from 'effect';

export type GetNetWorthQuery = typeof GetNetWorthQuery.Type;
export const GetNetWorthQuery = Schema.Struct({
  type: Schema.Literal('GetNetWorth'),
  maxCategories: Schema.optional(Schema.NumberFromString),
});
