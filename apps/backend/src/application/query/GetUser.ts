import { Context, Effect, Layer, Schema } from 'effect';
import { User } from '../../domain/user/User.ts';
import { UserRepository } from '../../domain/user/UserRepository.ts';
import { GetUserQuery } from '../schema/User.ts';

export class GetUser extends Context.Tag('GetUser')<
  GetUser,
  (params: Schema.Schema.Type<typeof GetUserQuery>) => Effect.Effect<User, Error>
>() {
  static Live = Layer.effect(
    GetUser,
    Effect.gen(function* () {
      const repo = yield* UserRepository;

      return (request) =>
        repo.findById(request.userId).pipe(
          Effect.orElseFail(() => new Error(`User not found with ID: ${request.userId}`)),
        );
    }),
  );
}
