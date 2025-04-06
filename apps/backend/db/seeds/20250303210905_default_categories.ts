import { AbstractSeed, ClientPostgreSQL, Info } from '$nessie/mod.ts';

interface CategorySeed {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
}

const defaultCategories: CategorySeed[] = [
  // Income categories
  { name: 'Salary', type: 'INCOME', color: 'green' },
  { name: 'Investments', type: 'INCOME', color: 'purple' },
  { name: 'Other Income', type: 'INCOME', color: 'teal' },

  // Expense categories
  { name: 'Food & Dining', type: 'EXPENSE', color: 'orange' },
  { name: 'Transportation', type: 'EXPENSE', color: 'blue' },
  { name: 'Housing', type: 'EXPENSE', color: 'teal' },
  { name: 'Utilities', type: 'EXPENSE', color: 'red' },
  { name: 'Healthcare', type: 'EXPENSE', color: 'cyan' },
  { name: 'Entertainment', type: 'EXPENSE', color: 'pink' },
  { name: 'Shopping', type: 'EXPENSE', color: 'purple' },
  { name: 'Travel', type: 'EXPENSE', color: 'amber' },
  { name: 'Education', type: 'EXPENSE', color: 'indigo' },
  { name: 'Personal Care', type: 'EXPENSE', color: 'rose' },
  { name: 'Other Expenses', type: 'EXPENSE', color: 'gray' },
];

export default class extends AbstractSeed<ClientPostgreSQL> {
  async run(_info: Info): Promise<void> {
    for (const category of defaultCategories) {
      await this.client.queryObject`
        INSERT INTO categories (name, type, color)
        VALUES (${category.name}, ${category.type}, ${category.color})
        ON CONFLICT (name) DO UPDATE SET 
          type = ${category.type},
          color = ${category.color}
      `;
    }
  }
}
