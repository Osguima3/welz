import { Schema } from 'effect';
import { CreateUserCommand } from './User.ts';
import { CreateTransactionCommand } from './Transaction.ts';

export const CommandSchema = Schema.Union(
  CreateUserCommand,
  CreateTransactionCommand,
);
