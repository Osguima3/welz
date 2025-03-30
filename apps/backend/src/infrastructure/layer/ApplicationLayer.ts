import { Layer } from 'effect';
import { CommandRouter } from '../../application/command/CommandRouter.ts';
import { EventPublisher } from '../../application/command/EventPublisher.ts';
import { CategorizeTransaction } from '../../application/command/transaction/CategorizeTransaction.ts';
import { CreateTransaction } from '../../application/command/transaction/CreateTransaction.ts';
import { QueryRouter } from '../../application/query/QueryRouter.ts';
import { GetAccounts } from '../../application/query/account/GetAccounts.ts';
import { GetCategories } from '../../application/query/category/GetCategories.ts';
import { GetTransactions } from '../../application/query/transaction/GetTransactions.ts';

export const CommandLayer = CommandRouter.Live.pipe(
  Layer.provideMerge(CreateTransaction.Live),
  Layer.provideMerge(CategorizeTransaction.Live),
  Layer.provideMerge(EventPublisher.Live),
);

export const QueryLayer = QueryRouter.Live.pipe(
  Layer.provideMerge(GetAccounts.Live),
  Layer.provideMerge(GetTransactions.Live),
  Layer.provideMerge(GetCategories.Live),
);

export const ApplicationLayer = Layer.mergeAll(
  CommandLayer,
  QueryLayer,
);
