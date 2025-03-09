import { AccountType } from '../account/Account.ts';
import { CategoryType } from '../category/Category.ts';
import { Money } from '../common/Money.ts';

export interface AccountReadModel {
  accountId: string;
  name: string;
  type: typeof AccountType.Type;
  balance: typeof Money.Type;
  lastUpdated: Date;
}

export interface TransactionReadModel {
  transactionId: string;
  accountId: string;
  amount: typeof Money.Type;
  date: Date;
  description: string;
  category?: CategoryReadModel;
}

export interface CategoryReadModel {
  categoryId: string;
  name: string;
  type: typeof CategoryType.Type;
  totalTransactions: number;
  monthlyAverage?: typeof Money.Type;
}

export interface FinancialInsightsReadModel {
  netWorth: typeof Money.Type;
  topCategories: {
    category: CategoryReadModel;
    total: typeof Money.Type;
    percentage: number;
  }[];
  monthlyTrends: {
    month: string;
    income: typeof Money.Type;
    expenses: typeof Money.Type;
  }[];
}
