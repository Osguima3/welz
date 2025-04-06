import { useSignal } from '@preact/signals';
import { Category } from '@shared/schema/Category.ts';
import type { Transaction, TransactionPage } from '@shared/schema/Transaction.ts';
import type { UUID } from '@shared/schema/UUID.ts';
import { Search } from 'lucide';
import { useEffect, useRef } from 'preact/hooks';
import { TransactionListItem } from '../components/TransactionListItem.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import Button from '../components/ui/button.tsx';
import { BackendClient } from '../services/BackendClient.ts';

interface CategoryTransactionsProps {
  categoryId: UUID;
  category?: Category;
  initialTransactions: TransactionPage;
  backendUrl: string;
}

export default function CategoryTransactions({
  categoryId,
  category,
  initialTransactions,
  backendUrl,
}: CategoryTransactionsProps) {
  const transactions = useSignal<readonly Transaction[]>(initialTransactions.items);
  const currentPage = useSignal(1);
  const totalPages = useSignal(Math.ceil(initialTransactions.total / initialTransactions.pageSize));
  const isLoading = useSignal(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    if (isLoading.value || currentPage.value >= totalPages.value) return;

    try {
      isLoading.value = true;
      const nextPage = currentPage.value + 1;
      const client = new BackendClient(backendUrl);
      const data = await client.getTransactions({ categoryId, page: nextPage });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle class='text-lg font-medium flex items-center'>
          <Search class='h-5 w-5 mr-2 text-primary' />
          Transactions
        </CardTitle>
      </CardHeader>
      <CardContent class='p-0'>
        {transactions.value.length > 0
          ? (
            <div>
              {transactions.value.map((transaction) => (
                <TransactionListItem
                  key={transaction.id}
                  transaction={transaction}
                  category={category}
                  flipExpenses
                />
              ))}

              {/* Loading indicator and intersection observer target */}
              <div ref={observerTarget}>
                {currentPage.value < totalPages.value
                  ? (
                    <div class='p-4 text-center'>
                      {isLoading.value
                        ? <p class='text-sm text-muted-foreground'>Loading more transactions...</p>
                        : <p class='text-sm text-muted-foreground'>Scroll down to load more</p>}
                    </div>
                  )
                  : transactions.value.length < initialTransactions.total && (
                    <div class='p-4 text-center'>
                      <a href={`/accounts/${transactions.value[0]?.accountId}/transactions?categoryId=${category?.id}`}>
                        <Button variant='outline' size='sm'>
                          View all transactions
                        </Button>
                      </a>
                    </div>
                  )}
              </div>
            </div>
          )
          : (
            <div class='p-8 text-center'>
              <p class='text-muted-foreground'>No transactions found for this category.</p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
