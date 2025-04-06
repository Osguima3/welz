import { Context, Effect } from 'effect';

export class ReadModelRepository extends Context.Tag('ReadModelRepository')<
  ReadModelRepository,
  {
    refreshMaterializedViews(): Effect.Effect<void, Error>;
  }
>() {}
