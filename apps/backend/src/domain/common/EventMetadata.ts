import { Schema } from 'effect';

export const EventMetadata = Schema.Struct({
  timestamp: Schema.Date,
  correlationId: Schema.optional(Schema.UUID),
});
