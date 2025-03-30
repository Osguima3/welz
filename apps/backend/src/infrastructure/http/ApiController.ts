import { Context, Effect, Layer, Schema } from 'effect';
import { randomUUID } from 'node:crypto';
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

      const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:8001',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      function createResponse(response: WebResponse): Effect.Effect<Response> {
        return Effect.succeed(new Response(response.body, { status: response.status, headers: corsHeaders }));
      }

      return (req) => {
        const url = new URL(req.url);
        return Effect.gen(function* () {
          if (req.method === 'OPTIONS') {
            return { body: null, status: 204 };
          } else if (url.pathname !== '/api') {
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
          Effect.catchAllCause(webTransformer.transformError),
          Effect.flatMap(createResponse),
          Effect.tap((response) =>
            Effect.logInfo().pipe(
              Effect.annotateLogs({
                request: `${req.method} ${url.pathname}${url.search}`,
                status: response.status,
              }),
            )
          ),
          Effect.annotateLogs('spanId', randomUUID()),
          Effect.runPromise,
        );
      };
    }),
  );
}
