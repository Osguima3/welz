/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { Effect } from 'effect';
import { AppConfig } from './infrastructure/config/AppConfig.ts';
import { ApiController } from './infrastructure/http/ApiController.ts';
import { LocalEnvLayer } from './infrastructure/layer/EnvLayer.ts';

await Effect.gen(function* () {
  const config = yield* AppConfig;
  const api = yield* ApiController;
  Deno.serve({ port: config.backend.port }, api);
}).pipe(
  Effect.provide(LocalEnvLayer),
  Effect.runPromise,
);
