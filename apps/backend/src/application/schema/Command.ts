import { Schema } from 'effect';
import { CategorizeTransactionCommand, CreateTransactionCommand } from '../../domain/transaction/commands.ts';
import { Transaction } from '@shared/schema/Transaction.ts';

export type Command = typeof Command.Type;
export const Command = Schema.Union(
  CreateTransactionCommand,
  CategorizeTransactionCommand,
);

export type CommandResponse = typeof CommandResponse.Type;
export const CommandResponse = Schema.Union(
  Transaction,
);
