import { CategoryHistory, CategoryHistoryEntry } from '@shared/schema/CategoryHistory.ts';
import { getColorHexValues, hexToRgba } from '@shared/schema/Color.ts';
import { Money } from '@shared/schema/Money.ts';
import { BarChart3 } from 'lucide';
import { ContentCard } from '../components/layout/ContentCard.tsx';
import { BarChart } from '../components/ui/BarChart.tsx';

interface CategoryHistoryCardProps {
  categoryHistory: CategoryHistory;
  locale: string;
}

export default function CategoryHistoryCard({ categoryHistory, locale }: CategoryHistoryCardProps) {
  const isExpense = categoryHistory.length > 0 && categoryHistory[0].type === 'EXPENSE';
  const categoryColor = categoryHistory.length > 0 ? categoryHistory[0].color : 'blue';
  const colorHex = getColorHexValues(categoryColor);

  const normalizedHistory = normalizeCategoryHistory(categoryHistory);

  const labels = normalizedHistory.map((entry) =>
    new Date(entry.month).toLocaleString(locale, { month: 'short', year: 'numeric' })
  );

  const processedData = normalizedHistory.map((entry) => {
    const total = isExpense ? Money.minus(entry.total) : entry.total;
    const forecast = entry.forecast ? (isExpense ? Money.minus(entry.forecast) : entry.forecast) : total;

    const baseAmount = Money.min(total, forecast);

    let underBudget = Money.zero(entry.total.currency);
    let overBudget = Money.zero(entry.total.currency);

    if (entry.forecast) {
      if (total.amount < forecast.amount) {
        underBudget = Money.subtract(forecast, total);
      } else {
        overBudget = Money.subtract(total, forecast);
      }
    }

    return {
      baseAmount,
      underBudget,
      overBudget,
    };
  });

  const series = [
    {
      label: 'Amount',
      data: processedData.map((data) => data.baseAmount),
      color: colorHex,
      stack: 'stack0',
    },
    {
      label: 'Until Forecast',
      data: processedData.map((data) => data.underBudget),
      color: hexToRgba(colorHex, 0.5),
      stack: 'stack0',
    },
    {
      label: 'Over Budget',
      data: processedData.map((data) => data.overBudget),
      color: 'rgba(239, 68, 68, 0.7)',
      stack: 'stack0',
    },
  ];

  return (
    <ContentCard icon={BarChart3} title='History'>
      {categoryHistory.length > 0
        ? (
          <div class='w-full h-64'>
            <BarChart
              labels={labels}
              series={series}
              locale={locale}
              stacked
              hideLegend
              hideTooltipForEmpty={['Until Forecast', 'Over Budget']}
            />
          </div>
        )
        : (
          <div class='w-full h-32 flex items-center justify-center'>
            <p class='text-muted-foreground'>No historical data available</p>
          </div>
        )}
    </ContentCard>
  );
}

function normalizeCategoryHistory(history: CategoryHistory): CategoryHistoryEntry[] {
  if (history.length === 0) {
    return [];
  }

  const targetMonthCount = 6;

  if (history.length >= targetMonthCount) {
    return [...history];
  }

  const missingMonthCount = targetMonthCount - history.length;

  const firstEntry = history[0];

  const firstMonth = new Date(firstEntry.month);

  const newEntries: CategoryHistoryEntry[] = [];

  for (let i = missingMonthCount; i > 0; i--) {
    const monthDate = new Date(firstMonth);
    monthDate.setMonth(monthDate.getMonth() - i);

    newEntries.push({
      categoryId: firstEntry.categoryId,
      month: monthDate,
      name: firstEntry.name,
      type: firstEntry.type,
      color: firstEntry.color,
      total: Money.zero(firstEntry.total.currency),
      typeTotal: firstEntry.typeTotal,
      typePercentage: 0,
      forecast: undefined,
    });
  }

  return [...newEntries, ...history];
}
