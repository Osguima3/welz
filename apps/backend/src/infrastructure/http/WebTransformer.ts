/// <reference lib="dom" />
import { Context, Effect, Layer, Match, ParseResult } from 'effect';

const replacer = (_key: string, value: unknown) => {
  return typeof value === 'bigint' ? value.toString() : value;
};

export class WebTransformer extends Context.Tag('WebTransformer')<
  WebTransformer,
  {
    transformCommand: (result: unknown) => Effect.Effect<Response>;
    transformQuery: (result: unknown) => Effect.Effect<Response>;
    transformError: (error: Error | ParseResult.ParseError) => Effect.Effect<Response>;
  }
>() {
  static Live = Layer.succeed(
    WebTransformer,
    {
      transformCommand: (result) =>
        Effect.succeed(
          new Response(
            JSON.stringify(result ?? {}, replacer),
            {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        ),

      transformQuery: (result) =>
        Effect.succeed(
          new Response(
            JSON.stringify(result ?? {}, replacer),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        ),

      transformError: (error) =>
        Effect.succeed(
          Match.value(error).pipe(
            Match.tag('ParseError', (error) =>
              Response.json(
                { error: 'Invalid Request', details: error.toString() },
                { status: 400 },
              )),
            Match.orElse((error) => {
              if (error.message.includes('not found')) {
                return Response.json(
                  { error: error.message },
                  { status: 404 },
                );
              }
              return Response.json(
                { error: { type: 'ServerError', message: error.message } },
                { status: 500 },
              );
            }),
          ),
        ),
    },
  );
}
