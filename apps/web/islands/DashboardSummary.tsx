import { Money } from '@shared/schema/Money.ts';
import type { NetWorth, TopCategoryEntry } from '@shared/schema/NetWorth.ts';
import { ArrowDown, ArrowUp, ArrowUpDown, BarChart3, CreditCard, Wallet } from 'lucide';
import CategoryBadge from '../components/CategoryBadge.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Format } from '../utils/format.ts';
import Carousel from './Carousel.tsx';

interface DashboardSummaryProps {
  netWorth: NetWorth;
}

export default function DashboardSummary({ netWorth }: DashboardSummaryProps) {
  return (
    <div class='space-y-8'>
      <div class='mb-8'>
        <h2 class='text-3xl font-bold text-secondary mb-3'>Financial Dashboard</h2>
        <p class='text-muted-foreground'>
          Track your finances at a glance. View your balances, top expense categories, and recent activity.
        </p>
      </div>

      <div class='grid grid-cols-1 gap-4 mb-8 md:grid-cols-3'>
        <div class='bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-lg border border-gray-200 shadow-sm'>
          <div class='flex items-center gap-2 mb-3'>
            <Wallet class='h-5 w-5 text-primary' />
            <h3 class='font-medium text-lg'>Total Balance</h3>
          </div>
          <p class='text-3xl font-bold'>
            {Format.money(netWorth.netWorth)}
          </p>
        </div>

        <div class='bg-gradient-to-br from-destructive/5 to-destructive/10 p-6 rounded-lg border border-gray-200 shadow-sm'>
          <div class='flex items-center gap-2 mb-3'>
            <BarChart3 class='h-5 w-5 text-destructive' />
            <h3 class='font-medium text-lg'>Monthly Expenses</h3>
          </div>
          <p class='text-3xl font-bold text-destructive'>
            {Format.money(netWorth.monthlyTrends[0]?.expenses ?? Money.zero('EUR'))}
          </p>
        </div>

        <div class='bg-gradient-to-br from-green-500/5 to-green-500/10 p-6 rounded-lg border border-gray-200 shadow-sm'>
          <div class='flex items-center gap-2 mb-3'>
            <ArrowUpDown class='h-5 w-5 text-green-600' />
            <h3 class='font-medium text-lg'>Monthly Income</h3>
          </div>
          <p class='text-3xl font-bold text-green-600'>
            {Format.money(netWorth.monthlyTrends[0]?.income ?? Money.zero('EUR'))}
          </p>
        </div>
      </div>

      <div class='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card class='col-span-full lg:col-span-1 shadow-sm border-primary/10 overflow-hidden'>
          <CardHeader class='bg-muted/30 pb-4'>
            <CardTitle class='text-xl font-medium flex items-center'>
              <CreditCard class='h-5 w-5 mr-2 text-primary' />
              Account Balances
            </CardTitle>
          </CardHeader>
          <CardContent class='pt-6'>
            {netWorth.accounts.length
              ? (
                <Carousel>
                  {netWorth.accounts.map((account) => (
                    <a
                      href={`/accounts/${account.accountId}/transactions`}
                      key={account.accountId}
                      class='block h-full'
                    >
                      <div class='p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg border border-gray-200 h-full hover:bg-secondary/10 transition-colors'>
                        <h3 class='font-medium text-secondary mb-1 text-center hover:text-primary transition-colors'>
                          {account.name}
                        </h3>
                        <p class='text-2xl font-bold text-center'>
                          {Format.money(account.balance)}
                        </p>
                      </div>
                    </a>
                  ))}
                </Carousel>
              )
              : <p class='text-muted-foreground text-sm text-center'>No account data available</p>}
          </CardContent>
        </Card>

        <Card class='shadow-sm border-primary/10 overflow-hidden'>
          <CardHeader class='bg-muted/30 pb-4'>
            <CardTitle class='text-xl font-medium flex items-center'>
              <ArrowDown class='h-5 w-5 mr-2 text-destructive' />
              Top Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent class='pt-6'>
            <div class='space-y-3'>
              {netWorth.expenses.length
                ? (
                  netWorth.expenses.map((expense: TopCategoryEntry) => (
                    <div key={expense.categoryId} class='flex justify-between items-center'>
                      <CategoryBadge category={expense.name} />
                      <span class='font-medium'>
                        {Format.money(expense.total)}
                      </span>
                    </div>
                  ))
                )
                : <p class='text-muted-foreground text-sm text-center'>No expense data available</p>}
            </div>
          </CardContent>
        </Card>

        <Card class='shadow-sm border-primary/10 overflow-hidden'>
          <CardHeader class='bg-muted/30 pb-4'>
            <CardTitle class='text-xl font-medium flex items-center'>
              <ArrowUp class='h-5 w-5 mr-2 text-green-600' />
              Top Income Categories
            </CardTitle>
          </CardHeader>
          <CardContent class='pt-6'>
            <div class='space-y-3'>
              {netWorth.incomes.length
                ? (
                  netWorth.incomes.map((income: TopCategoryEntry) => (
                    <div key={income.categoryId} class='flex justify-between items-center'>
                      <CategoryBadge category={income.name} />
                      <span class='font-medium text-green-600'>
                        {Format.money(income.total)}
                      </span>
                    </div>
                  ))
                )
                : <p class='text-muted-foreground text-sm text-center'>No income data available</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
