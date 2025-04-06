import { Category } from '@shared/schema/Category.ts';
import { CategoryHistory } from '@shared/schema/CategoryHistory.ts';
import { Money } from '@shared/schema/Money.ts';
import { CalendarDays } from 'lucide';
import { Format } from '../utils/format.ts';
import { ContentCard } from './layout/ContentCard.tsx';

interface CurrentMonthStatsCardProps {
  category?: Category;
  categoryHistory: CategoryHistory;
}

export function CategoryBalanceCard({ category, categoryHistory }: CurrentMonthStatsCardProps) {
  const currentTotal = categoryHistory[0]?.total ?? Money.zero('EUR');
  const currentForecast = categoryHistory[0]?.forecast ?? Money.zero('EUR');

  return (
    <ContentCard icon={CalendarDays} title='Current Month'>
      {categoryHistory.length > 0
        ? (
          <div>
            <div class='flex items-center gap-2'>
              <p class='text-2xl font-bold text-secondary'>
                {Format.money(category?.type === 'EXPENSE' ? Money.minus(currentTotal) : currentTotal)}
              </p>
              <span class='text-sm text-muted-foreground'>current</span>
            </div>

            <div class='flex items-center gap-2 mt-2'>
              <p class='text-lg font-semibold text-primary'>
                {Format.money(category?.type === 'EXPENSE' ? Money.minus(currentForecast) : currentForecast)}
              </p>
              <span class='text-sm text-muted-foreground'>forecast</span>
            </div>
          </div>
        )
        : <p class='text-muted-foreground'>No data available</p>}
    </ContentCard>
  );
}
