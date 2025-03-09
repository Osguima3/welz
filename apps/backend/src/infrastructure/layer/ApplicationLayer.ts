import { Layer } from 'effect';
import { CommandRouter } from '../../application/command/CommandRouter.ts';
import { EventPublisher } from '../../application/command/EventPublisher.ts';
import { CreateTransaction } from '../../application/command/transaction/CreateTransaction.ts';
import { QueryRouter } from '../../application/query/QueryRouter.ts';
import { GetAccountTransactions } from '../../application/query/transaction/GetAccountTransactions.ts';

export const CommandLayer = CommandRouter.Live.pipe(
  Layer.provideMerge(CreateTransaction.Live),
  Layer.provideMerge(EventPublisher.Live),
);

export const QueryLayer = QueryRouter.Live.pipe(
  Layer.provideMerge(GetAccountTransactions.Live),
);

export const ApplicationLayer = Layer.mergeAll(
  CommandLayer,
  QueryLayer,
);
