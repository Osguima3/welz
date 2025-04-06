import { AbstractSeed, ClientPostgreSQL, Info } from '$nessie/mod.ts';
import { randomUUID } from 'node:crypto';
import { AccountType } from '@shared/schema/Account.ts';
import { Money } from '@shared/schema/Money.ts';

interface AccountSeed {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: Money;
}

const initialAccounts: AccountSeed[] = [
  {
    id: 'b26b6d1c-5c28-49f3-8672-a366a623670c',
    name: 'Cash Wallet',
    type: 'CASH',
    initialBalance: Money.create(0, 'EUR'),
  },
  {
    id: randomUUID(),
    name: 'Main Bank Account',
    type: 'BANK',
    initialBalance: Money.create(0, 'EUR'),
  },
  {
    id: randomUUID(),
    name: 'Credit Card',
    type: 'BANK',
    initialBalance: Money.create(0, 'EUR'),
  },
  {
    id: randomUUID(),
    name: 'Savings Account',
    type: 'BANK',
    initialBalance: Money.create(0, 'EUR'),
  },
];

export default class extends AbstractSeed<ClientPostgreSQL> {
  async run(_info: Info): Promise<void> {
    for (const account of initialAccounts) {
      await this.client.queryObject`
        INSERT INTO accounts (id, name, type, balance, currency)
        VALUES (${account.id}, ${account.name}, ${account.type}, ${account.initialBalance.amount}, ${account.initialBalance.currency})
      `;
    }
  }
}
