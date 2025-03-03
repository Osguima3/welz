import { Context, Effect } from 'effect';
import { User } from './User.ts';

export class UserRepository extends Context.Tag('UserRepository')<
  UserRepository,
  {
    save: (user: User) => Effect.Effect<void>;
    findById: (id: string) => Effect.Effect<User, Error>;
  }
>() {}
