import { UUID } from '@shared/schema/UUID.ts';
import { Schema } from 'effect';
import { AccountPage } from '../../shared/schema/Account.ts';
import { AccountHistory } from '../../shared/schema/AccountHistory.ts';
import { CategoryPage } from '../../shared/schema/Category.ts';
import { NetWorth } from '../../shared/schema/NetWorth.ts';
import { TransactionPage } from '../../shared/schema/Transaction.ts';

interface GetTransactionsParams {
  accountId?: UUID;
  categoryId?: UUID;
  page?: number;
  pageSize?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class BackendClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000/api') {
    this.baseUrl = baseUrl;
  }

  async getAccounts(page = 1, pageSize = 10) {
    const url = new URL(this.baseUrl);
    url.searchParams.append('type', 'GetAccounts');
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const cause = await response.json();
      throw new Error('Failed to fetch accounts', { cause });
    }

    return Schema.decodeSync(AccountPage)(await response.json());
  }

  async getAccountHistory(accountId: UUID, months = 6) {
    const endDate = new Date();
    endDate.setDate(1);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - months + 1);

    const url = new URL(this.baseUrl);
    url.searchParams.append('type', 'GetAccountHistory');
    url.searchParams.append('accountId', accountId);
    url.searchParams.append('start', startDate.toISOString());
    url.searchParams.append('end', endDate.toISOString());

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const cause = await response.json();
      throw new Error('Failed to fetch account history', { cause });
    }

    return Schema.decodeSync(AccountHistory)(await response.json());
  }

  async getCategories(page = 1, pageSize = 50) {
    const url = new URL(this.baseUrl);
    url.searchParams.append('type', 'GetCategories');
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const cause = await response.json();
      throw new Error('Failed to fetch categories', { cause });
    }

    return Schema.decodeSync(CategoryPage)(await response.json());
  }

  async getTransactions({ accountId, categoryId, page = 1, pageSize = 10, dateRange }: GetTransactionsParams) {
    const url = new URL(this.baseUrl);
    url.searchParams.append('type', 'GetTransactions');
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());

    if (accountId) {
      url.searchParams.append('accountId', accountId);
    }

    if (categoryId) {
      url.searchParams.append('categoryId', categoryId);
    }

    if (dateRange) {
      url.searchParams.append('start', dateRange.start.toISOString());
      url.searchParams.append('end', dateRange.end.toISOString());
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const cause = await response.json();
      throw new Error('Failed to fetch transactions', { cause });
    }

    return Schema.decodeSync(TransactionPage)(await response.json());
  }

  async getNetWorth({
    topCategoriesLimit = 3,
    monthsOfHistory = 6,
  }: {
    topCategoriesLimit?: number;
    monthsOfHistory?: number;
  }): Promise<NetWorth> {
    const url = new URL(this.baseUrl);
    url.searchParams.append('type', 'GetNetWorth');
    url.searchParams.append('maxCategories', topCategoriesLimit.toString());
    url.searchParams.append('monthsOfHistory', monthsOfHistory.toString());

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const cause = await response.json();
      throw new Error('Failed to fetch net worth', { cause });
    }

    return Schema.decodeSync(NetWorth)(await response.json());
  }
}
