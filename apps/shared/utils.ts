import { Effect, Match } from 'effect';

export function catchAllDie(
  message: string,
): <T>(effect: Effect.Effect<T, Error, never>) => Effect.Effect<T, Error, never> {
  return Effect.catchAllCause((cause) =>
    Match.value(cause).pipe(
      Match.tag('Fail', (fail) => Effect.fail(fail.error)),
      Match.orElse(() => Effect.fail(new Error(`${message}: ${cause}`, { cause }))),
    )
  );
}
