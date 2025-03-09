import { Schema } from 'effect';
import { CreateTransactionCommand } from '../../domain/transaction/commands.ts';

export type Command = typeof Command.Type;
export const Command = Schema.Union(
  CreateTransactionCommand,
);
