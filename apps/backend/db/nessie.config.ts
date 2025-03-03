import { ClientPostgreSQL, NessieConfig } from 'https://deno.land/x/nessie@2.0.11/mod.ts';

const client = new ClientPostgreSQL({
  database: 'welz_db',
  hostname: 'localhost',
  port: 5432,
  user: 'user',
  password: 'password',
});

const config: NessieConfig = {
  client,
  migrationFolders: ['./migrations'],
  seedFolders: ['./seeds'],
};

export default config;
