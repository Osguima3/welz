import { ClientPostgreSQL, NessieConfig } from '$nessie/mod.ts';

const sslEnabled = Deno.env.get('DATABASE_SSL') === 'true';
let caCertificates: string[] = [];
if (sslEnabled) {
  const caCert = Deno.readTextFileSync(Deno.env.get('DATABASE_CERTIFICATE') || '');
  if (!caCert) {
    throw new Error('Missing database certificate');
  }
  caCertificates = [caCert];
}

export default {
  client: new ClientPostgreSQL({
    hostname: Deno.env.get('DATABASE_HOST'),
    port: Number(Deno.env.get('DATABASE_PORT')),
    database: Deno.env.get('DATABASE_NAME'),
    user: Deno.env.get('DATABASE_USER'),
    password: Deno.env.get('DATABASE_PASSWORD'),
    tls: { enabled: sslEnabled, caCertificates },
  }),
  migrationFolders: ['./db/migrations'],
  seedFolders: ['./db/seeds'],
} as NessieConfig;
