import { useSignal } from '@preact/signals';
import type { AccountHistory } from '@shared/schema/AccountHistory.ts';
import { Category } from '@shared/schema/Category.ts';
import type { Transaction, TransactionPage } from '@shared/schema/Transaction.ts';
import type { UUID } from '@shared/schema/UUID.ts';
import { BarChart3, Filter, Search, Wallet } from 'lucide';
import { useEffect, useRef } from 'preact/hooks';
import { TransactionListItem } from '../components/TransactionListItem.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Chart } from '../components/ui/chart.tsx';
import { Skeleton } from '../components/ui/skeleton.tsx';
import { BackendClient } from '../utils/BackendClient.ts';
import { Format } from '../utils/format.ts';
import { Money } from '@shared/schema/Money.ts';

interface TransactionListProps {
  accountId?: UUID;
  initialTransactions: TransactionPage;
  initialAccountHistory: AccountHistory;
  categories?: readonly Category[];
  locale?: string;
}

export default function TransactionList(
  { accountId, initialTransactions, initialAccountHistory, categories = [], locale = 'es-ES' }: TransactionListProps,
) {
  const transactions = useSignal<readonly Transaction[]>(initialTransactions.items);
  const accountHistory = useSignal<AccountHistory>(initialAccountHistory);
  const currentPage = useSignal(1);
  const totalPages = useSignal(Math.ceil(initialTransactions.total / initialTransactions.pageSize));
  const isLoading = useSignal(false);
  const searchTerm = useSignal('');
  const categoryFilter = useSignal<string>('All');
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    if (isLoading.value || currentPage.value >= totalPages.value) return;

    try {
      isLoading.value = true;
      const nextPage = currentPage.value + 1;
      const client = new BackendClient();
      const data = await client.getTransactions({ accountId, page: nextPage });

      transactions.value = [...transactions.value, ...data.items];
      currentPage.value = nextPage;
      totalPages.value = Math.ceil(data.total / data.pageSize);
    } catch (error) {
      console.error('Error loading more transactions:', error);
    } finally {
      isLoading.value = false;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading.value) {
          loadMore();
        }
      },
      { threshold: 0.5 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []);

  const filteredTransactions = transactions.value.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase());

    const matchesCategory = categoryFilter.value === 'All' || transaction.categoryId === categoryFilter.value;

    return matchesSearch && matchesCategory;
  });

  const monthlyData = !accountHistory.value || accountHistory.value.length === 0 ? [] : accountHistory.value
    .map((entry) => ({
      month: new Date(entry.month).toLocaleString(locale, { month: 'short', year: 'numeric' }),
      income: entry.monthIncome,
      expenses: Money.abs(entry.monthExpenses),
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  const currentBalance = accountHistory.value.length === 0 
    ? Money.zero('EUR')
    : accountHistory.value[0].balance;

  return (
    <div class='space-y-6'>
      <Card class='overflow-hidden'>
        <CardHeader class="pb-2">
          <CardTitle class='text-lg font-medium flex items-center'>
            <Wallet class='h-5 w-5 mr-2 text-primary' />
            Account Balance
          </CardTitle>
        </CardHeader>
        <CardContent class='p-6'>
          {!accountHistory.value || accountHistory.value.length === 0
            ? <Skeleton class='h-8 w-24' />
            : (
              <p class='text-2xl font-bold text-secondary'>
                {Format.money(currentBalance)}
              </p>
            )}
        </CardContent>
      </Card>

      <Card class='overflow-hidden'>
        <CardHeader>
          <CardTitle class='text-lg font-medium flex items-center'>
            <BarChart3 class='h-5 w-5 mr-2 text-primary' />
            Monthly Income & Expenses
          </CardTitle>
        </CardHeader>
        <CardContent class='p-0 sm:p-6'>
          {!accountHistory.value || accountHistory.value.length === 0
            ? (
              <div class='w-full h-64 flex items-center justify-center p-6'>
                <Skeleton class='h-52 w-full' />
              </div>
            )
            : monthlyData.length > 0
            ? (
              <div class='w-full h-64'>
                <Chart data={monthlyData} height={256} locale={locale} />
              </div>
            )
            : (
              <div class='w-full h-32 flex items-center justify-center'>
                <p class='text-muted-foreground'>No transaction data available</p>
              </div>
            )}
        </CardContent>
      </Card>

      <Card class='mb-6'>
        <CardHeader>
          <CardTitle class='text-lg font-medium flex items-center'>
            <Search class='h-5 w-5 mr-2 text-primary' />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent class='pb-0'>
          <div class='flex flex-col sm:flex-row gap-4 mb-4'>
            <div class='relative flex-grow'>
              <Search class='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <input
                type='search'
                placeholder='Search transactions...'
                value={searchTerm.value}
                onInput={(e) => searchTerm.value = (e.target as HTMLInputElement).value}
                class='pl-10 pr-4 py-2 w-full text-sm rounded-md border-gray-200 border bg-background'
              />
            </div>
            <div class='flex items-center gap-2'>
              <Filter class='h-4 w-4 text-muted-foreground' />
              <select
                value={categoryFilter.value}
                onChange={(e) => categoryFilter.value = (e.target as HTMLSelectElement).value}
                class='flex h-10 w-[180px] rounded-md border-gray-200 border bg-background px-3 py-2 text-sm ring-offset-background'
              >
                <option value='All'>All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
        
        {isLoading.value && transactions.value.length === 0
          ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} class='flex items-center justify-between p-4 border-b border-gray-200'>
                <div class='flex items-center gap-3'>
                  <div class='h-10 w-10 rounded-full bg-muted animate-pulse' />
                  <div>
                    <div class='h-4 w-40 mb-2 bg-muted animate-pulse rounded' />
                    <div class='h-3 w-24 bg-muted animate-pulse rounded' />
                  </div>
                </div>
                <div class='flex flex-col items-end gap-1'>
                  <div class='h-4 w-20 mb-2 bg-muted animate-pulse rounded' />
                  <div class='h-6 w-16 bg-muted animate-pulse rounded-full' />
                </div>
              </div>
            ))
          )
          : filteredTransactions.length > 0
          ? (
            filteredTransactions.map((transaction) => (
              <TransactionListItem
                key={transaction.id}
                transaction={transaction}
                category={categories.find((c) => c.id === transaction.categoryId)}
                locale={locale}
              />
            ))
          )
          : (
            <div class='p-8 text-center'>
              <p class='text-muted-foreground'>No transactions found matching your filters.</p>
            </div>
          )}
      </Card>

      {/* Loading indicator and intersection observer target */}
      <div ref={observerTarget}>
        {currentPage.value < totalPages.value && (
          <div class='flex flex-col items-center gap-4 py-4'>
            {isLoading.value ? 'Loading...' : 'Scroll down to load more'}
          </div>
        )}
      </div>
    </div>
  );
}
