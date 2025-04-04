import { type Money } from '@shared/schema/Money.ts';

interface FormatMoneyOptions {
  /** The locale to use for formatting. Defaults to 'es-ES' */
  locale?: string;

  /** How to display the currency sign. Defaults to 'auto' */
  signDisplay?: 'auto' | 'always' | 'never';

  /** Additional options to pass to Intl.NumberFormat */
  formatOptions?: Intl.NumberFormatOptions;
}

export class Format {
  static money(money: Money, options: FormatMoneyOptions = {}): string {
    const {
      locale = 'es-ES',
      signDisplay = money.amount === 0 ? 'never' : 'auto',
      formatOptions = {},
    } = options;

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: money.currency,
      signDisplay,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...formatOptions,
    });

    return formatter.format(money.amount);
  }
}
