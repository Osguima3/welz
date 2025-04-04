import { getColorHexValues } from '@shared/schema/Color.ts';
import { AccountEntry } from '@shared/schema/NetWorth.ts';
import { Landmark } from 'lucide';
import { ContentCard } from '../../components/layout/ContentCard.tsx';
import { PieChart } from '../../components/ui/PieChart.tsx';
import { Format } from '../../utils/format.ts';
import Carousel from '../ui/Carousel.tsx';

interface AccountBalanceCardProps {
  accounts: readonly AccountEntry[];
  locale: string;
}

export function AccountBalanceCard({ accounts, locale }: AccountBalanceCardProps) {
  const accountValues = accounts.map((account, index) => {
    const colors = ['blue', 'indigo', 'violet', 'purple', 'pink', 'rose', 'orange', 'amber', 'yellow', 'lime'] as const;
    const colorIndex = index % colors.length;

    return {
      name: account.name,
      value: account.balance,
      color: getColorHexValues(colors[colorIndex]),
    };
  });

  return (
    <ContentCard
      icon={Landmark}
      title='Account Balances'
      color='muted'
      className='col-span-full lg:col-span-1'
    >
      {accounts.length
        ? (
          <>
            <div class='h-[180px] m-6'>
              <PieChart variant='ring' values={accountValues} locale={locale} />
            </div>
            <Carousel>
              {accounts.map((account) => (
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
          </>
        )
        : <p class='text-muted-foreground text-sm text-center'>No account data available</p>}
    </ContentCard>
  );
}
