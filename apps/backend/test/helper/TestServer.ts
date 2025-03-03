import { Effect, Layer } from 'effect';
import { ApiController } from '../../src/infrastructure/http/ApiController.ts';

export interface ServerConfig {
  port?: number;
}

export interface ServerInfo {
  server: ReturnType<typeof Deno.serve>;
  baseUrl: string;
}

export async function createTestServer(
  layer: Layer.Layer<ApiController>,
  config: ServerConfig = {},
): Promise<ServerInfo> {
  const port = config.port ?? 9000;
  const baseUrl = `http://localhost:${port}`;

  const api = await Effect.runPromise(
    Effect.gen(function* () {
      return yield* ApiController;
    }).pipe(Effect.provide(layer)),
  );

  const server = Deno.serve({ port }, api);

  return { server, baseUrl };
}