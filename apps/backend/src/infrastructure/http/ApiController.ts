import { Context, Effect, Layer, Schema } from 'effect';
import { CommandRouter } from '../../application/command/CommandRouter.ts';
import { QueryRouter } from '../../application/query/QueryRouter.ts';
import { CommandSchema } from '../../application/schema/Command.ts';
import { QuerySchema } from '../../application/schema/Query.ts';
import { WebTransformer } from './WebTransformer.ts';

export class ApiController extends Context.Tag('ApiController')<
  ApiController,
  (req: Request) => Promise<Response>
>() {
  static Live = Layer.effect(
    ApiController,
    Effect.gen(function* (_) {
      const routeCommand = yield* CommandRouter;
      const routeQuery = yield* QueryRouter;
      const webTransformer = yield* WebTransformer;

      function handleCommand(input: unknown): Effect.Effect<Response, Error> {
        return Effect.gen(function* () {
          const command = yield* Schema.decodeUnknown(CommandSchema)(input);
          const result = yield* routeCommand(command);
          return yield* webTransformer.transformCommand(result);
        });
      };

      function handleQuery(input: Record<string, string>): Effect.Effect<Response, Error> {
        return Effect.gen(function* () {
          const query = yield* Schema.decodeUnknown(QuerySchema)(input);
          const result = yield* routeQuery(query);
          return yield* webTransformer.transformQuery(result);
        });
      };

      return (req) => Effect.runPromise(Effect.gen(function* () {
        if (req.method === 'POST') {
          const input = yield* Effect.promise(() => req.json());
          return yield* handleCommand(input);
        } else if (req.method === 'GET') {
          const params: Record<string, string> = {};
          new URL(req.url).searchParams.forEach((value, key) => params[key] = value);
          return yield* handleQuery(params);
        }
        return new Response('Method Not Allowed', { status: 405 });
      }).pipe(
        Effect.catchAll(error => webTransformer.transformError(error))
      ));
    })
  );
}
