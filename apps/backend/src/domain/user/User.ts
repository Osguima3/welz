import { Effect, ParseResult, Schema } from 'effect';
import { randomUUID } from 'node:crypto';
import { Email } from '../common/Schema.ts';

export class User extends Schema.Class<User>('User')({
  id: Schema.UUID,
  name: Schema.String.pipe(
    Schema.minLength(2),
    Schema.filter((name: string): name is string => name.trim() === name, {
      message: () => 'Name cannot contain leading or trailing whitespace',
    }),
  ),
  email: Email,
  createdAt: Schema.ValidDateFromSelf,
}) {
  static create(
    params: { name: string; email: string },
  ): Effect.Effect<User, ParseResult.ParseError> {
    const id = randomUUID();
    const createdAt = new Date();
    return Schema.decode(User)({ ...params, id, createdAt });
  }
}
