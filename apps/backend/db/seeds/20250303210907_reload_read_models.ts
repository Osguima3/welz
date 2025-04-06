import { AbstractSeed, ClientPostgreSQL, Info } from '$nessie/mod.ts';

export default class extends AbstractSeed<ClientPostgreSQL> {
  async run(_info: Info): Promise<void> {
    await this.client.queryObject`
      SELECT refresh_all_materialized_views();
    `;
  }
}
