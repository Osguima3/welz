export interface ServerConfig {
  port?: number;
}

export interface TestServer {
  fetchResponse(method: 'POST' | 'GET', data: unknown): Promise<Response>;
  shutdown(): void;
}

export function createTestServer(
  controller: (req: Request) => Promise<Response>,
  config: ServerConfig = {},
): Promise<TestServer> {
  const port = config.port ?? 9000;

  const server = Deno.serve({ port }, controller);

  return Promise.resolve({
    async fetchResponse(method: 'POST' | 'GET', data: unknown) {
      const url = new URL(`http://localhost:${server.addr.port}/api`);
      const requestInit: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (method === 'GET') {
        // For GET requests, convert data to URL search params
        Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      } else {
        // For POST requests, send data in body
        requestInit.body = JSON.stringify(data);
      }

      return await fetch(url, requestInit);
    },

    shutdown() {
      server.shutdown();
    },
  });
}
