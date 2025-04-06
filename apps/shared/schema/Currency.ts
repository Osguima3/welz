import { Schema } from 'effect';

export type Currency = typeof Currency.Type;
export const Currency = Schema.Literal('EUR', 'USD');
