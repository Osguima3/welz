import { Layer } from 'effect';
import { CommandRouter } from '../../application/command/CommandRouter.ts';
import { EventPublisher } from '../../application/command/EventPublisher.ts';
import { CreateTransaction } from '../../application/command/transaction/CreateTransaction.ts';
import { CreateUser } from '../../application/command/user/CreateUser.ts';
import { GetUser } from '../../application/query/GetUser.ts';
import { QueryRouter } from '../../application/query/QueryRouter.ts';

export const CommandLayer = CommandRouter.Live.pipe(
  Layer.provide(CreateUser.Live),
  Layer.provide(CreateTransaction.Live),
  Layer.provide(EventPublisher.Live),
);

export const QueryLayer = QueryRouter.Live.pipe(
  Layer.provide(GetUser.Live),
);

export const ApplicationLayer = Layer.mergeAll(
  CommandLayer,
  QueryLayer,
);
