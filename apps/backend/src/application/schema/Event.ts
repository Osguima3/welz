import { Schema } from 'effect';
import { AccountBalanceUpdatedEvent, AccountCreatedEvent } from '../../domain/account/events.ts';
import { CategoryCreatedEvent, CategoryUpdatedEvent } from '../../domain/category/events.ts';
import { TransactionCategorizedEvent, TransactionCreatedEvent } from '../../domain/transaction/events.ts';

export type EventType = (typeof EventType)[keyof typeof EventType];
export const EventType = {
  TRANSACTION_CREATED: 'TransactionCreated',
  TRANSACTION_CATEGORIZED: 'TransactionCategorized',
  ACCOUNT_CREATED: 'AccountCreated',
  ACCOUNT_BALANCE_UPDATED: 'AccountBalanceUpdated',
  CATEGORY_CREATED: 'CategoryCreated',
  CATEGORY_UPDATED: 'CategoryUpdated',
} as const;

export type WelzEvent = typeof WelzEvent.Type;
export const WelzEvent = Schema.Union(
  TransactionCreatedEvent,
  TransactionCategorizedEvent,
  AccountCreatedEvent,
  AccountBalanceUpdatedEvent,
  CategoryCreatedEvent,
  CategoryUpdatedEvent,
);
