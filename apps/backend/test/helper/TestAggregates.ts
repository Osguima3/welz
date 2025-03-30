import { Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { Account, AccountType } from '../../../shared/schema/Account.ts';
import { Category, CategoryType } from '../../../shared/schema/Category.ts';
import { Money } from '../../../shared/schema/Money.ts';
import Page from '../../../shared/schema/Page.ts';
import { Transaction } from '../../../shared/schema/Transaction.ts';

interface BuildAccountOptions {
  id?: string;
  name?: string;
  type?: AccountType;
  balance?: Money;
  createdAt?: Date;
}

function account(options: BuildAccountOptions = {}): Account {
  const now = new Date();
  return Account.make({
    id: options.id ?? randomUUID(),
    name: options.name ?? 'Test Account',
    type: options.type ?? 'BANK',
    balance: options.balance ?? Money.create(1000, 'EUR'),
    createdAt: options.createdAt ?? now,
    updatedAt: options.createdAt ?? now,
  });
}

interface BuildCategoryOptions {
  id?: string;
  name?: string;
  type?: CategoryType;
  createdAt?: Date;
}

function category(options: BuildCategoryOptions = {}): Category {
  const id = options.id ?? randomUUID();
  return Category.make({
    id,
    name: options.name ?? `Test Category ${id.slice(0, 8)}`,
    type: options.type ?? 'EXPENSE',
    createdAt: options.createdAt ?? new Date(),
  });
}

interface BuildTransactionOptions {
  id?: string;
  accountId?: string;
  categoryId?: string | undefined;
  amount?: number;
  date?: Date;
  createdAt?: Date;
}

function transaction(options: BuildTransactionOptions = {}): Transaction {
  const now = new Date();
  return Transaction.make({
    id: options.id ?? randomUUID(),
    accountId: options.accountId ?? randomUUID(),
    amount: Money.create(options.amount ?? 1000, 'EUR'),
    date: options.date ?? now,
    description: 'Test transaction',
    categoryId: options.categoryId ?? undefined,
    createdAt: options.createdAt ?? now,
    updatedAt: options.createdAt ?? now,
  });
}

function page<A, I, R>(itemSchema: Schema.Schema<A, I, R>, ...items: ReadonlyArray<A>) {
  return Page.of(itemSchema).make({ items, total: 0, page: 1, pageSize: 10 });
}

export default {
  account,
  category,
  transaction,
  page,
};
