import { Effect, Layer } from 'effect';
import { catchAllDie } from '../../../../shared/utils.ts';
import { ReadModelRepository } from '../../domain/readmodel/ReadModelRepository.ts';
import { PostgresClient } from './PostgresClient.ts';

export const PostgresReadModelRepository = Layer.effect(
  ReadModelRepository,
  Effect.gen(function* () {
    const client = yield* PostgresClient;

    return {
      refreshMaterializedViews: () =>
        client.runQuery('SELECT refresh_all_materialized_views();').pipe(
          catchAllDie('Failed to refresh materialized views'),
        ),
    };
  }),
);
