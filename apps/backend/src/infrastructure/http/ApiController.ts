import { Context, Effect, Layer, Schema } from 'effect';
import { CommandRouter } from '../../application/command/CommandRouter.ts';
import { QueryRouter } from '../../application/query/QueryRouter.ts';
import { Command } from '../../application/schema/Command.ts';
import { Query } from '../../application/schema/Query.ts';
import { WebResponse, WebTransformer } from './WebTransformer.ts';

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

      function createResponse(webResponse: WebResponse): Effect.Effect<Response> {
        return Effect.succeed(
          new Response(
            webResponse.body,
            {
              status: webResponse.status,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        );
      }

      function handleCommand(input: unknown): Effect.Effect<WebResponse, Error> {
        return Effect.gen(function* () {
          const command = yield* Schema.decodeUnknown(Command)(input);
          const result = yield* routeCommand(command);
          return yield* webTransformer.transformCommand(result);
        });
      }

      function handleQuery(input: Record<string, string>): Effect.Effect<WebResponse, Error> {
        return Effect.gen(function* () {
          const query = yield* Schema.decodeUnknown(Query)(input);
          const result = yield* routeQuery(query);
          return yield* webTransformer.transformQuery(result);
        });
      }

      return (req) =>
        Effect.gen(function* () {
          const url = new URL(req.url);
          if (url.pathname !== '/api') {
            return yield* Effect.fail(new Error('Not Found'));
          } else if (req.method === 'POST') {
            const input = yield* Effect.promise(() => req.json());
            return yield* handleCommand(input);
          } else if (req.method === 'GET') {
            const params: Record<string, string> = {};
            url.searchParams.forEach((value, key) => params[key] = value);
            return yield* handleQuery(params);
          } else {
            return yield* Effect.fail(new Error('Method Not Allowed'));
          }
        }).pipe(
          Effect.scoped,
          Effect.catchAllCause(webTransformer.transformError),
          Effect.flatMap(createResponse),
          Effect.runPromise,
        );
    }),
  );
}
