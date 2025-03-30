import { AccountType } from '../../../../shared/schema/Account.ts';
import { CategoryType } from '../../../../shared/schema/Category.ts';
import { Money } from '../../../../shared/schema/Money.ts';

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

export interface NetWorthReadModel {
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
