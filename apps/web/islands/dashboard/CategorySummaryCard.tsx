import { getColorHexValues } from '@shared/schema/Color.ts';
import { Money } from '@shared/schema/Money.ts';
import type { TopCategoryEntry } from '@shared/schema/NetWorth.ts';
import { Coins, Receipt } from 'lucide';
import CategoryBadge from '../../components/CategoryBadge.tsx';
import { ContentCard } from '../../components/layout/ContentCard.tsx';
import { PieChart } from '../../components/ui/PieChart.tsx';
import { Format } from '../../utils/format.ts';

interface CategorySummaryCardProps {
  total: Money;
  categories: readonly TopCategoryEntry[];
  locale: string;
}

export function CategorySummaryCard({
  categories,
  total,
  locale,
}: CategorySummaryCardProps) {
  const isExpense = categories.length > 0 && categories[0].type === 'EXPENSE';
  const otherColor = isExpense ? 'gray' : 'teal';

  const chartValues = categories.map((category) => ({
    name: category.name,
    value: isExpense ? Money.minus(category.total) : category.total,
    color: getColorHexValues(category.color),
  }));

  const zero = Money.zero('EUR');
  const totalSum = categories
    .filter((category) => isExpense ? category.total.amount < 0 : category.total.amount > 0)
    .reduce(Money.reduceAdd('total'), zero);

  if (
    (isExpense && totalSum.amount > total.amount) ||
    (!isExpense && totalSum.amount < total.amount)
  ) {
    chartValues.push({
      name: 'Other',
      value: isExpense ? Money.subtract(totalSum, total) : Money.subtract(total, totalSum),
      color: getColorHexValues(otherColor),
    });
  }

  return (
    <ContentCard
      title={`Top ${isExpense ? 'Expense' : 'Income'} Categories`}
      icon={isExpense ? Receipt : Coins}
      color='muted'
      iconColor={isExpense ? 'destructive' : 'success'}
    >
      {categories.length
        ? (
          <div class='space-y-6'>
            <div class='h-[180px] m-6'>
              <PieChart values={chartValues} locale={locale} />
            </div>
            <div class='space-y-3'>
              {categories.slice(0, 3).map((category: TopCategoryEntry) => (
                <a key={category.categoryId} href={`/categories/${category.categoryId}`} class='block'>
                  <div class='flex justify-between items-center'>
                    <CategoryBadge category={category.name} color={category.color} />
                    <span class='font-medium'>
                      {isExpense ? Format.money(Money.minus(category.total)) : Format.money(category.total)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )
        : <p class='text-muted-foreground text-sm text-center pt-6'>No data available</p>}
    </ContentCard>
  );
}
