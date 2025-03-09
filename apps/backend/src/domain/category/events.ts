import { Schema } from 'effect';
import { EventMetadata } from '../common/EventMetadata.ts';
import { CategoryType } from './Category.ts';

export const CategoryCreatedEvent = Schema.Struct({
  type: Schema.Literal('CategoryCreated'),
  metadata: Schema.optional(EventMetadata),
  payload: Schema.Struct({
    categoryId: Schema.UUID,
    name: Schema.String,
    categoryType: CategoryType,
  }),
});

export const CategoryUpdatedEvent = Schema.Struct({
  type: Schema.Literal('CategoryUpdated'),
  metadata: Schema.optional(EventMetadata),
  payload: Schema.Struct({
    categoryId: Schema.UUID,
    oldName: Schema.String,
    newName: Schema.String,
  }),
});
