import { ClientPostgreSQL, NessieConfig } from '$nessie/mod.ts';

const client = new ClientPostgreSQL({
  database: 'welz_db',
  hostname: 'localhost',
  port: 5432,
  user: 'user',
  password: 'password',
});

const config: NessieConfig = {
  client,
  migrationFolders: ['./db/migrations'],
  seedFolders: ['./db/seeds'],
};

export default config;
