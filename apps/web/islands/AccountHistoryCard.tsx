import type { AccountHistory } from '@shared/schema/AccountHistory.ts';
import { Money } from '@shared/schema/Money.ts';
import { BarChart3 } from 'lucide';
import { ContentCard } from '../components/layout/ContentCard.tsx';
import { BarChart } from '../components/ui/BarChart.tsx';
import { Skeleton } from '../components/ui/skeleton.tsx';

interface AccountHistoryCardProps {
  accountHistory: AccountHistory;
  locale: string;
}

export function AccountHistoryCard({ accountHistory, locale }: AccountHistoryCardProps) {
  const labels = accountHistory.map((entry) =>
    new Date(entry.month).toLocaleString(locale, { month: 'short', year: 'numeric' })
  );

  const series = [
    {
      label: 'Income',
      data: accountHistory.map((entry) => entry.monthIncome),
      color: '#22c55e',
    },
    {
      label: 'Expenses',
      data: accountHistory.map((entry) => Money.minus(entry.monthExpenses)),
      color: '#ef4444',
    },
  ];

  return (
    <ContentCard icon={BarChart3} title='Monthly Income & Expenses'>
      {!accountHistory || accountHistory.length === 0
        ? (
          <div class='w-full h-64 flex items-center justify-center p-6'>
            <Skeleton class='h-52 w-full' />
          </div>
        )
        : accountHistory.length > 0
        ? (
          <div class='w-full h-64'>
            <BarChart labels={labels} series={series} locale={locale} />
          </div>
        )
        : (
          <div class='w-full h-32 flex items-center justify-center'>
            <p class='text-muted-foreground'>No transaction data available</p>
          </div>
        )}
    </ContentCard>
  );
}
