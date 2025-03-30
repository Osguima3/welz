import { Schema } from 'effect';
import { AccountBalanceUpdatedEvent } from '../../domain/account/events.ts';
import { TransactionCategorizedEvent, TransactionCreatedEvent } from '../../domain/transaction/events.ts';

export type EventType = typeof EventType.Type;
export const EventType = Schema.Literal(
  'TransactionCreated',
  'TransactionCategorized',
  'AccountBalanceUpdated',
);

export type WelzEvent = typeof WelzEvent.Type;
export const WelzEvent = Schema.Union(
  TransactionCreatedEvent,
  TransactionCategorizedEvent,
  AccountBalanceUpdatedEvent,
);
