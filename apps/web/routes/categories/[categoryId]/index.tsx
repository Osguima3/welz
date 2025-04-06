import { Handlers, PageProps } from '$fresh/server.ts';
import { Category } from '@shared/schema/Category.ts';
import { CategoryHistory } from '@shared/schema/CategoryHistory.ts';
import { TransactionPage } from '@shared/schema/Transaction.ts';
import { UUID } from '@shared/schema/UUID.ts';
import { ArrowLeft, Receipt } from 'lucide';
import { CategoryBalanceCard } from '../../../components/CategoryBalanceCard.tsx';
import { CategoryPercentageCard } from '../../../components/CategoryPercentageCard.tsx';
import { ContentCard } from '../../../components/layout/ContentCard.tsx';
import { Header } from '../../../components/layout/Header.tsx';
import Button from '../../../components/ui/button.tsx';
import CategoryHistoryCard from '../../../islands/CategoryHistoryCard.tsx';
import TransactionsContent from '../../../islands/TransactionsContent.tsx';
import { BACKEND_URL } from '../../../utils/env.ts';
import { BackendClient } from '../../../services/BackendClient.ts';

interface CategoryDetailsPageData {
  categoryId: UUID;
  categories: readonly Category[];
  categoryHistory: CategoryHistory;
  transactions: TransactionPage;
  locale: string;
}

export const handler: Handlers<CategoryDetailsPageData> = {
  async GET(_req, ctx) {
    try {
      const categoryId = ctx.params.categoryId;
      const client = new BackendClient(BACKEND_URL);

      const [categories, categoryHistory, transactions] = await Promise.all([
        client.getCategories().then((res) => res.items),
        client.getCategoryHistory({ categoryId }),
        client.getTransactions({ categoryId, pageSize: 20 }),
      ]);

      const locale = 'es-ES';

      return ctx.render({
        categoryId,
        categories,
        categoryHistory,
        transactions,
        locale,
      });
    } catch (error) {
      console.error('Error fetching category details:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

export default function CategoryDetailsPage({ data }: PageProps<CategoryDetailsPageData>) {
  const { categoryId, categories, categoryHistory, transactions, locale } = data;

  const category = categories.find((c) => c.id === categoryId);

  return (
    <div class='min-h-screen bg-background'>
      {/* Header */}
      <Header />

      {/* Page Content */}
      <div class='container mx-auto py-6 px-4 max-w-4xl'>
        <div class='flex items-center justify-between mb-6'>
          <div class='flex items-center gap-4'>
            <a href='/dashboard'>
              <Button variant='ghost' size='sm' class='gap-1 hover:bg-primary/10'>
                <ArrowLeft class='h-4 w-4 text-primary' />
                <span class='text-primary'>Back</span>
              </Button>
            </a>
          </div>
          <div class='flex items-center gap-2'>
            <span class='text-xs font-medium px-2 py-1 rounded-full bg-muted/50'>
              {category?.type}
            </span>
            {category && <h2 class='text-xl font-semibold text-secondary pr-4'>{category.name}</h2>}
          </div>
        </div>

        <div class='grid gap-6 grid-cols-1 md:grid-cols-2 mb-6'>
          <CategoryBalanceCard category={category} categoryHistory={categoryHistory} />
          <CategoryPercentageCard category={category} categoryHistory={categoryHistory} />
        </div>

        <div class='space-y-6'>
          <CategoryHistoryCard categoryHistory={categoryHistory.toReversed()} locale={locale} />

          <ContentCard
            icon={Receipt}
            title='Transactions'
            contentClassName='p-0'
          >
            <TransactionsContent
              categoryId={categoryId}
              categories={categories}
              initialTransactions={transactions}
              backendUrl={BACKEND_URL}
              locale={locale}
              flipExpenses
            />
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
