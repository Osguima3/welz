import { Handlers, PageProps } from '$fresh/server.ts';
import { Money } from '@shared/schema/Money.ts';
import type { NetWorth } from '@shared/schema/NetWorth.ts';
import { Banknote, ShoppingBag, Wallet } from 'lucide';
import { Header } from '../components/layout/Header.tsx';
import StatCard from '../components/layout/StatCard.tsx';
import { AccountBalanceCard } from '../islands/dashboard/AccountBalanceCard.tsx';
import { CategorySummaryCard } from '../islands/dashboard/CategorySummaryCard.tsx';
import { BACKEND_URL } from '../utils/env.ts';
import { BackendClient } from '../services/BackendClient.ts';
import { Format } from '../utils/format.ts';

interface DashboardData {
  netWorth: NetWorth;
  locale: string;
}

export const handler: Handlers<DashboardData> = {
  async GET(_req, ctx) {
    try {
      const client = new BackendClient(BACKEND_URL);
      const netWorth = await client.getNetWorth();
      const locale = 'es-ES';
      return ctx.render({ netWorth, locale });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

export default function Dashboard({ data }: PageProps<DashboardData>) {
  const { netWorth, locale } = data;

  return (
    <div class='min-h-screen bg-background'>
      <Header />

      {/* Dashboard Content */}
      <div class='max-w-7xl mx-auto py-8 px-6'>
        <div class='space-y-6'>
          <div class='mb-8'>
            <h2 class='text-3xl font-bold text-secondary mb-3'>Financial Dashboard</h2>
            <p class='text-muted-foreground'>
              Track your finances at a glance. View your balances, top expense categories, and recent activity.
            </p>
          </div>

          <div class='grid gap-6 grid-cols-1 md:grid-cols-3'>
            <StatCard
              icon={Wallet}
              title='Total Balance'
              value={Format.money(netWorth.netWorth)}
              color='primary'
            />

            <StatCard
              icon={ShoppingBag}
              title='Monthly Expenses'
              value={Format.money(Money.minus(netWorth.monthExpenses))}
              color='destructive'
            />

            <StatCard
              icon={Banknote}
              title='Monthly Income'
              value={Format.money(netWorth.monthIncome)}
              color='success'
            />
          </div>

          <div class='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <AccountBalanceCard accounts={netWorth.accounts} locale={locale} />
            <CategorySummaryCard total={netWorth.monthExpenses} categories={netWorth.expenses} locale={locale} />
            <CategorySummaryCard total={netWorth.monthIncome} categories={netWorth.incomes} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
