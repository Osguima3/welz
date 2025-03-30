import { Schema } from 'effect';
import { AccountType } from './Account.ts';
import { CategoryType } from './Category.ts';
import { Money } from './Money.ts';

export type NetWorthTrendEntry = typeof NetWorthTrendEntry.Type;
export const NetWorthTrendEntry = Schema.Struct({
  month: Schema.Date,
  income: Money,
  expenses: Money,
});

export type TopCategoryEntry = typeof TopCategoryEntry.Type;
export const TopCategoryEntry = Schema.Struct({
  categoryId: Schema.String,
  name: Schema.String,
  type: CategoryType,
  total: Money,
  typePercentage: Schema.Number,
  average: Schema.optional(Money),
});

export type AccountEntry = typeof AccountEntry.Type;
export const AccountEntry = Schema.Struct({
  accountId: Schema.String,
  name: Schema.String,
  type: AccountType,
  balance: Money,
  totalIncome: Schema.optional(Money),
  totalExpenses: Schema.optional(Money),
  lastUpdated: Schema.Date,
});

export type NetWorth = typeof NetWorth.Type;
export const NetWorth = Schema.Struct({
  netWorth: Money,
  accounts: Schema.Array(AccountEntry),
  expenses: Schema.Array(TopCategoryEntry),
  incomes: Schema.Array(TopCategoryEntry),
  monthlyTrends: Schema.Array(NetWorthTrendEntry),
});

export const GetNetWorthQuery = Schema.Struct({
  type: Schema.Literal('GetNetWorth'),
  topCategoriesLimit: Schema.optional(Schema.NumberFromString),
  monthsOfHistory: Schema.optional(Schema.NumberFromString),
});
