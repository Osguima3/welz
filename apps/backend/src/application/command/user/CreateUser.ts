import { Context, Effect, Layer, ParseResult, Schema } from 'effect';
import { User } from '../../../domain/user/User.ts';
import { UserRepository } from '../../../domain/user/UserRepository.ts';
import { CreateUserCommand } from '../../schema/User.ts';

export class CreateUser extends Context.Tag('CreateUser')<
  CreateUser,
  (params: Schema.Schema.Type<typeof CreateUserCommand>) => Effect.Effect<User, Error | ParseResult.ParseError>
>() {
  static Live = Layer.effect(
    CreateUser,
    Effect.gen(function* () {
      const userRepository = yield* UserRepository;
      return (createUser: Schema.Schema.Type<typeof CreateUserCommand>) =>
        Effect.gen(function* () {
          const user = yield* User.create({ ...createUser });
          yield* userRepository.save(user);
          return user;
        });
    }),
  );
}
