import { Schema } from 'effect';
import { AccountType } from './Account.ts';
import { CategoryType } from './Category.ts';
import { Color } from './Color.ts';
import { Money } from './Money.ts';

export type AccountEntry = typeof AccountEntry.Type;
export const AccountEntry = Schema.Struct({
  accountId: Schema.String,
  name: Schema.String,
  type: AccountType,
  balance: Money,
  monthIncome: Schema.optional(Money),
  monthExpenses: Schema.optional(Money),
  lastUpdated: Schema.Date,
});

export type TopCategoryEntry = typeof TopCategoryEntry.Type;
export const TopCategoryEntry = Schema.Struct({
  categoryId: Schema.String,
  name: Schema.String,
  type: CategoryType,
  color: Color,
  total: Money,
  typePercentage: Schema.Number,
  average: Schema.optional(Money),
});

export type NetWorth = typeof NetWorth.Type;
export const NetWorth = Schema.Struct({
  netWorth: Money,
  monthExpenses: Money,
  monthIncome: Money,
  accounts: Schema.Array(AccountEntry),
  expenses: Schema.Array(TopCategoryEntry),
  incomes: Schema.Array(TopCategoryEntry),
});

export const GetNetWorthQuery = Schema.Struct({
  type: Schema.Literal('GetNetWorth'),
  topCategoriesLimit: Schema.optional(Schema.NumberFromString),
});
