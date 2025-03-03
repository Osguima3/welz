import { Schema } from 'effect';
import { Email } from '../../domain/common/Schema.ts';

export const CreateUserCommand = Schema.Struct({
  type: Schema.Literal('CreateUser'),
  name: Schema.String.pipe(Schema.minLength(2)),
  email: Email,
});

export const GetUserQuery = Schema.Struct({
  type: Schema.Literal('GetUser'),
  userId: Schema.UUID,
});

export const UserSchema = Schema.Union(
  CreateUserCommand,
  GetUserQuery,
);
