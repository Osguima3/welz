import { Schema } from 'effect';

export type Email = typeof Email.Type;
export const Email = Schema.String.pipe(
  Schema.filter((email: string): email is string => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
    message: () => 'Invalid email format',
  }),
);
