import { AbstractSeed, ClientPostgreSQL, Info } from '$nessie/mod.ts';
import { Currency } from '../../src/domain/common/Currency.ts';
import { Money } from '../../src/domain/common/Money.ts';

interface MockTransaction {
  accountId: string;
  amount: number;
  currency: Currency;
  description: string;
  date: Date;
  categoryId?: string;
}

const mockMerchants = [
  'Walmart',
  'Amazon',
  'Target',
  'Starbucks',
  'Uber',
  'Shell Gas',
  'Netflix',
  'Spotify',
  'Apple',
  'Whole Foods',
  'CVS Pharmacy',
];

const mockDescriptionTemplates = [
  'Purchase at {merchant}',
  'Payment to {merchant}',
  'Online order - {merchant}',
  '{merchant} - Monthly subscription',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomMoney(min: number, max: number) {
  return Money.create(Math.random() * (max - min) + min, 'EUR');
}

function generateRandomDate(startDate: Date, endDate: Date): Date {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
}

export default class extends AbstractSeed<ClientPostgreSQL> {
  async run(_info: Info): Promise<void> {
    const accountResult = await this.client.queryObject<{ id: string }>`
      SELECT id FROM accounts
    `;
    const accountIds = accountResult.rows.map((row) => row.id);

    const categoryResult = await this.client.queryObject<{ id: string; type: 'INCOME' | 'EXPENSE' }>`
      SELECT id, type FROM categories
    `;
    const categories = categoryResult.rows;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    const transactions: MockTransaction[] = [];

    for (const accountId of accountIds) {
      for (let i = 0; i < 50; i++) {
        const merchant = getRandomElement(mockMerchants);
        const descTemplate = getRandomElement(mockDescriptionTemplates);
        const description = descTemplate.replace('{merchant}', merchant);

        const isExpense = Math.random() < 0.7;
        const amount = isExpense ? generateRandomMoney(-500, -10) : generateRandomMoney(1000, 5000);

        const matchingCategories = categories.filter((c) =>
          (isExpense && c.type === 'EXPENSE') || (!isExpense && c.type === 'INCOME')
        );

        transactions.push({
          accountId,
          amount: amount.amount,
          currency: amount.currency,
          description,
          date: generateRandomDate(startDate, endDate),
          categoryId: getRandomElement(matchingCategories)?.id,
        });
      }
    }

    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    for (const tx of transactions) {
      await this.client.queryObject`
        INSERT INTO transactions (
          account_id, amount, currency, description, date, category_id
        ) VALUES (${tx.accountId}, ${tx.amount}, ${tx.currency}, ${tx.description}, ${tx.date}, ${tx.categoryId})
      `;

      await this.client.queryObject`
        UPDATE accounts 
        SET balance = balance + ${tx.amount}
        WHERE id = ${tx.accountId}
      `;
    }
  }
}
