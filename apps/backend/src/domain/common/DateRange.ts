import { Schema } from 'effect';

export type DateRange = typeof DateRange.Type;
export const DateRange = Schema.Struct({
  start: Schema.optional(Schema.Date),
  end: Schema.optional(Schema.Date),
});
