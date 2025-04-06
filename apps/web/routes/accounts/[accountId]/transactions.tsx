import { Handlers, PageProps } from '$fresh/server.ts';
import { AccountHistory } from '@shared/schema/AccountHistory.ts';
import { Category } from '@shared/schema/Category.ts';
import { Money } from '@shared/schema/Money.ts';
import { TransactionPage } from '@shared/schema/Transaction.ts';
import { UUID } from '@shared/schema/UUID.ts';
import { ArrowLeft, Receipt, Wallet } from 'lucide';
import { ContentCard } from '../../../components/layout/ContentCard.tsx';
import { Header } from '../../../components/layout/Header.tsx';
import StatCard from '../../../components/layout/StatCard.tsx';
import Button from '../../../components/ui/button.tsx';
import { AccountHistoryCard } from '../../../islands/AccountHistoryCard.tsx';
import TransactionsContent from '../../../islands/TransactionsContent.tsx';
import { BackendClient } from '../../../services/BackendClient.ts';
import { Format } from '../../../utils/format.ts';
import { BACKEND_URL } from '../../../utils/env.ts';

interface AccountTransactionsPageData {
  accountId?: UUID;
  accountName?: string;
  accountType?: 'CASH' | 'BANK';
  transactions: TransactionPage;
  accountHistory: AccountHistory;
  categories: readonly Category[];
  locale: string;
}

export const handler: Handlers<AccountTransactionsPageData> = {
  async GET(_req, ctx) {
    try {
      const accountId = ctx.params.accountId;
      const client = new BackendClient(BACKEND_URL);

      const [accounts, accountHistory, categories, transactions] = await Promise.all([
        client.getAccounts().then((res) => res.items),
        client.getAccountHistory({ accountId }),
        client.getCategories().then((res) => res.items),
        client.getTransactions({ accountId }),
      ]);

      const account = accounts.find((a) => a.id === accountId);
      const accountName = account?.name;
      const accountType = account?.type;
      const locale = 'es-ES';

      return ctx.render({ accountId, accountName, accountType, transactions, accountHistory, categories, locale });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

export default function AccountTransactionsPage({ data }: PageProps<AccountTransactionsPageData>) {
  const { accountId, accountName, accountType, transactions, accountHistory, categories, locale } = data;
  const currentBalance = accountHistory.length === 0 ? Money.zero('EUR') : accountHistory[0].balance;

  return (
    <div class='min-h-screen bg-background'>
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
              {accountType}
            </span>
            {accountName && <h2 class='text-xl font-semibold text-secondary pr-4'>{accountName}</h2>}
          </div>
        </div>

        <div class='space-y-6'>
          <StatCard icon={Wallet} title='Account Balance' value={Format.money(currentBalance)} />

          <AccountHistoryCard accountHistory={accountHistory.toReversed()} locale={locale} />

          <ContentCard
            icon={Receipt}
            title='Transactions'
            contentClassName='p-0'
          >
            <TransactionsContent
              accountId={accountId}
              categories={categories}
              initialTransactions={transactions}
              backendUrl={BACKEND_URL}
              locale={locale}
            />
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
