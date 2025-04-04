import { useSignal } from '@preact/signals';
import type { Category } from '@shared/schema/Category.ts';
import type { Transaction, TransactionPage } from '@shared/schema/Transaction.ts';
import type { UUID } from '@shared/schema/UUID.ts';
import { Filter, Search } from 'lucide';
import { useEffect, useRef } from 'preact/hooks';
import { TransactionListItem } from '../components/TransactionListItem.tsx';
import { BackendClient } from '../utils/BackendClient.ts';

interface TransactionsContentProps {
  accountId?: UUID;
  categoryId?: UUID;
  categories: readonly Category[];
  initialTransactions: TransactionPage;
  locale: string;
  flipExpenses?: boolean;
}

export default function TransactionsContent({
  accountId,
  categoryId,
  categories,
  initialTransactions,
  locale,
  flipExpenses = false,
}: TransactionsContentProps) {
  const transactions = useSignal<readonly Transaction[]>(initialTransactions.items);
  const currentPage = useSignal(1);
  const totalPages = useSignal(Math.ceil(initialTransactions.total / initialTransactions.pageSize));
  const isLoading = useSignal(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const searchTerm = useSignal('');
  const categoryFilter = useSignal<string>(categoryId || 'All');

  const filteredTransactions = transactions.value.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase());

    const matchesCategory = categoryFilter.value === 'All' || transaction.categoryId === categoryFilter.value;

    return matchesSearch && matchesCategory;
  });

  async function loadMore() {
    if (isLoading.value || currentPage.value >= totalPages.value) return;

    try {
      isLoading.value = true;
      const nextPage = currentPage.value + 1;
      const client = new BackendClient();
      const data = await client.getTransactions({ accountId, categoryId, page: nextPage });

      transactions.value = [...transactions.value, ...data.items];
      currentPage.value = nextPage;
      totalPages.value = Math.ceil(data.total / data.pageSize);
    } catch (error) {
      console.error('Error loading more transactions:', error);
    } finally {
      isLoading.value = false;
    }
  }

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

  const showCategoryFilter = !categoryId;

  return (
    <>
      <div class='flex flex-col sm:flex-row gap-4 pl-6 pr-6 mb-4'>
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
        {showCategoryFilter && (
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
        )}
      </div>

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
              flipExpenses={flipExpenses}
            />
          ))
        )
        : (
          <div class='p-8 text-center'>
            <p class='text-muted-foreground'>No transactions found matching your filters.</p>
          </div>
        )}

      {/* Loading indicator and intersection observer target */}
      <div ref={observerTarget}>
        {currentPage.value < totalPages.value && (
          <div class='flex flex-col items-center gap-4 py-4'>
            {isLoading.value ? 'Loading...' : 'Scroll down to load more'}
          </div>
        )}
      </div>
    </>
  );
}
