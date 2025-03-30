import { Handlers, PageProps } from '$fresh/server.ts';
import { AccountHistory } from '@shared/schema/AccountHistory.ts';
import { Category } from '@shared/schema/Category.ts';
import { TransactionPage } from '@shared/schema/Transaction.ts';
import { UUID } from '@shared/schema/UUID.ts';
import { ArrowLeft, Home, Wallet } from 'lucide';
import Button from '../../../components/ui/button.tsx';
import TransactionList from '../../../islands/TransactionList.tsx';
import WelzLogo from '../../../components/WelzLogo.tsx';
import { BackendClient } from '../../../utils/BackendClient.ts';

interface AccountTransactionsPageData {
  accountId?: UUID;
  accountName?: string;
  accountType?: 'CASH' | 'BANK';
  transactions: TransactionPage;
  accountHistory: AccountHistory;
  categories: readonly Category[];
}

export const handler: Handlers<AccountTransactionsPageData> = {
  async GET(_req, ctx) {
    try {
      const accountId = ctx.params.accountId;
      const client = new BackendClient();

      const [accounts, transactions, accountHistory, categories] = await Promise.all([
        client.getAccounts(),
        client.getTransactions({ accountId }),
        client.getAccountHistory(accountId, 6),
        client.getCategories().then((res) => res.items),
      ]);

      const account = accounts.items.find((a) => a.id === accountId);
      const accountName = account?.name;
      const accountType = account?.type;

      return ctx.render({ accountId, accountName, accountType, transactions, accountHistory, categories });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

export default function AccountTransactionsPage({ data }: PageProps<AccountTransactionsPageData>) {
  const { accountId, accountName, accountType, transactions, accountHistory, categories } = data;

  return (
    <div class='min-h-screen bg-background'>
      {/* Header */}
      <div class='p-6 border-b border-gray-200 bg-muted/30'>
        <div class='max-w-7xl mx-auto flex justify-between items-center'>
          <div class='flex items-center gap-2'>
            <WelzLogo size='sm' showText={false} />
            <h1 class='text-2xl font-bold text-secondary'>Welz</h1>
          </div>
          <div class='flex items-center gap-4'>
            <a href='/'>
              <Button variant='ghost' class='gap-2'>
                <Home class='h-4 w-4' />
                Home
              </Button>
            </a>
            <a href='/dashboard'>
              <Button class='gap-2'>
                <Wallet class='h-4 w-4' />
                Dashboard
              </Button>
            </a>
          </div>
        </div>
      </div>

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

        <TransactionList
          accountId={accountId}
          initialTransactions={transactions}
          initialAccountHistory={accountHistory}
          categories={categories}
        />
      </div>
    </div>
  );
}
