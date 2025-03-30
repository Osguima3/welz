import { Handlers, PageProps } from '$fresh/server.ts';
import { Home, Wallet } from 'lucide';
import Button from '../components/ui/button.tsx';
import WelzLogo from '../components/WelzLogo.tsx';
import DashboardSummary from '../islands/DashboardSummary.tsx';
import { BackendClient } from '../utils/BackendClient.ts';
import type { NetWorth } from '@shared/schema/NetWorth.ts';

interface DashboardData {
  netWorth: NetWorth;
}

export const handler: Handlers<DashboardData> = {
  async GET(_req, ctx) {
    try {
      const client = new BackendClient();
      const netWorth = await client.getNetWorth({});
      return ctx.render({ netWorth });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

export default function Dashboard({ data }: PageProps<DashboardData>) {
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
            <a href='/accounts/b26b6d1c-5c28-49f3-8672-a366a623670c/transactions'>
              <Button class='gap-2'>
                <Wallet class='h-4 w-4' />
                Transactions
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div class='max-w-7xl mx-auto py-8 px-6'>
        <DashboardSummary netWorth={data.netWorth} />
      </div>
    </div>
  );
}
