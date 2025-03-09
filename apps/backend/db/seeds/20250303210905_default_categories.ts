import { AbstractSeed, ClientPostgreSQL, Info } from '$nessie/mod.ts';

interface CategorySeed {
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

const defaultCategories: CategorySeed[] = [
  // Income categories
  { name: 'Salary', type: 'INCOME' },
  { name: 'Investments', type: 'INCOME' },
  { name: 'Other Income', type: 'INCOME' },

  // Expense categories
  { name: 'Food & Dining', type: 'EXPENSE' },
  { name: 'Transportation', type: 'EXPENSE' },
  { name: 'Housing', type: 'EXPENSE' },
  { name: 'Utilities', type: 'EXPENSE' },
  { name: 'Healthcare', type: 'EXPENSE' },
  { name: 'Entertainment', type: 'EXPENSE' },
  { name: 'Shopping', type: 'EXPENSE' },
  { name: 'Travel', type: 'EXPENSE' },
  { name: 'Education', type: 'EXPENSE' },
  { name: 'Personal Care', type: 'EXPENSE' },
  { name: 'Other Expenses', type: 'EXPENSE' },
];

export default class extends AbstractSeed<ClientPostgreSQL> {
  async run(_info: Info): Promise<void> {
    for (const category of defaultCategories) {
      await this.client.queryObject`
        INSERT INTO categories (name, type)
        VALUES (${category.name}, ${category.type})
        ON CONFLICT (name) DO NOTHING
      `;
    }
  }
}
