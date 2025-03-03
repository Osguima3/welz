import { assertEquals, assertStringIncludes } from '$std/assert/mod.ts';
import { Effect } from 'effect';
import { User } from '../../../src/domain/user/User.ts';

Deno.test('User.create', async (t) => {
  await t.step('should create a valid user', () => {
    const params = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const user = Effect.runSync(User.create(params));

    assertEquals(user.name, params.name);
    assertEquals(user.email, params.email);
    assertEquals(typeof user.id, 'string');
    assertEquals(user.createdAt instanceof Date, true);
  });

  await t.step('should reject user with invalid name (whitespace)', () => {
    const params = {
      name: ' John Doe ',
      email: 'john@example.com',
    };

    const error = Effect.runSync(User.create(params).pipe(Effect.flip));

    assertStringIncludes(error.message, 'Name cannot contain leading or trailing whitespace');
  });

  await t.step('should reject user with invalid email', () => {
    const params = {
      name: 'John Doe',
      email: 'invalid-email',
    };

    const error = Effect.runSync(User.create(params).pipe(Effect.flip));

    assertStringIncludes(error.message, 'Invalid email format');
  });

  await t.step('should reject user with short name', () => {
    const params = {
      name: 'J',
      email: 'john@example.com',
    };

    const error = Effect.runSync(User.create(params).pipe(Effect.flip));

    assertStringIncludes(error.message, 'Expected a string at least 2 character(s) long, actual "J"');
  });
});
