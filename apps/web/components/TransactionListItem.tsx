import { ArrowDownLeft, ArrowUpRight } from 'lucide';
import { Category } from '@shared/schema/Category.ts';
import { Transaction } from '@shared/schema/Transaction.ts';
import CategoryBadge from './CategoryBadge.tsx';
import { Format } from '../utils/format.ts';

interface TransactionListItemProps {
  transaction: Transaction;
  category?: Category;
  locale?: string;
}

export function TransactionListItem({ transaction, category, locale = 'es-ES' }: TransactionListItemProps) {
  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div class='flex items-center justify-between p-4 border-b border-gray-200 hover:bg-muted/30 transition-colors'>
      <div class='flex items-center gap-3'>
        <div class={`p-2 rounded-full ${transaction.amount.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
          {transaction.amount.amount > 0
            ? <ArrowUpRight class='h-5 w-5 text-green-600' />
            : <ArrowDownLeft class='h-5 w-5 text-red-600' />}
        </div>
        <div class='flex flex-col'>
          <span class='font-medium text-secondary'>{transaction.description}</span>
          <span class='text-sm text-muted-foreground'>{formatDate(transaction.date)}</span>
        </div>
      </div>
      <div class='flex flex-col items-end gap-1'>
        <span class={`font-medium ${transaction.amount.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {Format.money(transaction.amount)}
        </span>
        {transaction.categoryId && (
          <CategoryBadge category={category?.name ?? 'Other'} />
        )}
      </div>
    </div>
  );
}