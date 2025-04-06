import { ClientPostgreSQL, NessieConfig } from '$nessie/mod.ts';

export default {
  client: new ClientPostgreSQL({
    hostname: Deno.env.get('DATABASE_HOST'),
    port: Number(Deno.env.get('DATABASE_PORT')),
    database: Deno.env.get('DATABASE_NAME'),
    user: Deno.env.get('DATABASE_USER'),
    password: Deno.env.get('DATABASE_PASSWORD'),
  }),
  migrationFolders: ['./db/migrations'],
  seedFolders: ['./db/seeds'],
} as NessieConfig;
