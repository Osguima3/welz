import { Layer } from 'effect';
import { CommandRouter } from '../../application/command/CommandRouter.ts';
import { EventPublisher } from '../../application/command/EventPublisher.ts';
import { CategorizeTransaction } from '../../application/command/transaction/CategorizeTransaction.ts';
import { CreateTransaction } from '../../application/command/transaction/CreateTransaction.ts';
import { QueryRouter } from '../../application/query/QueryRouter.ts';
import { GetAccountHistory } from '../../application/query/account/GetAccountHistory.ts';
import { GetAccounts } from '../../application/query/account/GetAccounts.ts';
import { GetCategories } from '../../application/query/category/GetCategories.ts';
import { GetCategoryHistory } from '../../application/query/category/GetCategoryHistory.ts';
import { GetNetWorth } from '../../application/query/networth/GetNetWorth.ts';
import { GetTransactions } from '../../application/query/transaction/GetTransactions.ts';

export const CommandLayer = CommandRouter.Live.pipe(
  Layer.provideMerge(CreateTransaction.Live),
  Layer.provideMerge(CategorizeTransaction.Live),
  Layer.provideMerge(EventPublisher.Live),
);

export const QueryLayer = QueryRouter.Live.pipe(
  Layer.provideMerge(GetAccounts.Live),
  Layer.provideMerge(GetAccountHistory.Live),
  Layer.provideMerge(GetCategories.Live),
  Layer.provideMerge(GetCategoryHistory.Live),
  Layer.provideMerge(GetTransactions.Live),
  Layer.provideMerge(GetNetWorth.Live),
);

export const ApplicationLayer = Layer.mergeAll(
  CommandLayer,
  QueryLayer,
);
