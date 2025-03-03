import { Schema } from 'effect';
import { GetUserQuery } from './User.ts';
import { GetTransactionQuery } from './Transaction.ts';

export const QuerySchema = Schema.Union(
  GetUserQuery,
  GetTransactionQuery,
);
