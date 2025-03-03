/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import '$std/dotenv/load.ts';
import { Effect } from 'effect';
import { ApiController } from './infrastructure/http/ApiController.ts';
import { TestEnvLayer } from './infrastructure/layer/EnvLayer.ts';

// Create API controller instance with dependencies
const api = await Effect.runPromise(
  Effect.gen(function* () {
    return yield* ApiController;
  }).pipe(Effect.provide(TestEnvLayer)),
);

// Main request handler for Deno Deploy
Deno.serve(api);
