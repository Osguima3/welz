/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import '$std/dotenv/load.ts';
import { Effect } from 'effect';
import { ApiController } from './infrastructure/http/ApiController.ts';
import { LocalEnvLayer } from './infrastructure/layer/EnvLayer.ts';

const api = await ApiController.pipe(
  Effect.provide(LocalEnvLayer),
  Effect.runPromise,
);

Deno.serve({ port: 8000 }, api);
