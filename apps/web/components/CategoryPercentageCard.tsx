import { Category } from '@shared/schema/Category.ts';
import { CategoryHistory } from '@shared/schema/CategoryHistory.ts';
import { PieChart } from 'lucide';
import { ContentCard } from './layout/ContentCard.tsx';

interface CategoryPercentageCardProps {
  category?: Category;
  categoryHistory: CategoryHistory;
}

export function CategoryPercentageCard({ category, categoryHistory }: CategoryPercentageCardProps) {
  const isExpense = category?.type === 'EXPENSE';

  return (
    <ContentCard icon={PieChart} title={`Percentage of ${isExpense ? 'Expenses' : 'Income'}`}>
      {categoryHistory.length > 0
        ? (
          <div>
            <p class='text-2xl font-bold text-secondary'>
              {categoryHistory[0].typePercentage.toFixed(1)}%
            </p>
            <p class='text-sm text-muted-foreground mt-2'>
              of total {isExpense ? 'expenses' : 'income'} this month
            </p>
          </div>
        )
        : <p class='text-muted-foreground'>No data available</p>}
    </ContentCard>
  );
}
