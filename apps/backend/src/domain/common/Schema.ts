import { Schema } from 'effect';

export const Email = Schema.String.pipe(
  Schema.filter((email: string): email is string => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
    message: () => 'Invalid email format',
  }),
);
