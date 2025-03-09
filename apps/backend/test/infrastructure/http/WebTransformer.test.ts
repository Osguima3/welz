import { assertEquals } from '$std/assert/mod.ts';
import { Cause, Effect, FiberId, ParseResult, SchemaAST } from 'effect';
import { Money } from '../../../src/domain/common/Money.ts';
import { WebTransformer } from '../../../src/infrastructure/http/WebTransformer.ts';

const TestLayer = WebTransformer.Live;

Deno.test('WebTransformer', async (t) => {
  const transformer = WebTransformer.pipe(Effect.provide(TestLayer), Effect.runSync);

  await t.step('should transform successful command responses', () => {
    const data = { id: '123', name: 'Test' };
    const response = Effect.runSync(transformer.transformCommand(data));

    assertEquals(response.status, 201);
    assertEquals(response.body, '{"id":"123","name":"Test"}');
  });

  await t.step('should transform successful query responses', () => {
    const data = { id: '123', name: 'Test' };
    const response = Effect.runSync(transformer.transformQuery(data));

    assertEquals(response.status, 200);
    assertEquals(response.body, '{"id":"123","name":"Test"}');
  });

  await t.step('should transform BigDecimal values to string', () => {
    const input = { amount: Money.create(10.50, 'EUR') };
    const response = Effect.runSync(transformer.transformQuery(input));

    assertEquals(response.status, 200);
    assertEquals(response.body, '{"amount":{"amount":10.5,"currency":"EUR"}}');
  });

  await t.step('should transform parse errors as 400 Bad Request', () => {
    const issue = new ParseResult.Missing(new SchemaAST.Type(new SchemaAST.Literal('Type')));
    const error = new ParseResult.ParseError({ issue });
    const response = Effect.runSync(transformer.transformError(Cause.fail(error)));

    assertEquals(response.status, 400);
    assertEquals(
      response.body,
      '{"code":201,"detail":"Parse Error: expected but was missing","error":"Invalid Request","issue":{"_id":"ParseError","message":"is missing"}}',
    );
  });

  await t.step('should transform other parse errors as 400 Bad Request', () => {
    const issue = new ParseResult.Unexpected('', 'Invalid input');
    const error = new ParseResult.ParseError({ issue });
    const response = Effect.runSync(transformer.transformError(Cause.fail(error)));

    assertEquals(response.status, 400);
    assertEquals(
      response.body,
      '{"code":299,"detail":"Parse Error: Unexpected: Invalid input","error":"Invalid Request","issue":{"_id":"ParseError","message":"Invalid input"}}',
    );
  });

  await t.step('should transform other controlled errors as 500 Internal Server Error', () => {
    const issue = new Error('Database connection failed');
    const response = Effect.runSync(transformer.transformError(Cause.fail(issue)));

    assertEquals(response.status, 500);
    assertEquals(
      response.body,
      '{"error":"Server Error","code":300,"detail":"Error: Database connection failed","issue":{}}',
    );
  });

  await t.step('should transform unexpected errors as 500 Internal Server Error', () => {
    const issue = new Error('Database connection failed');
    const response = Effect.runSync(transformer.transformError(Cause.die(issue)));

    assertEquals(response.status, 500);
    assertEquals(
      response.body,
      '{"error":"Server Error","code":400,"detail":"Error: Database connection failed","issue":{"_id":"Cause","_tag":"Die","defect":{}}}',
    );
  });

  await t.step('should transform other errors as 500 Internal Server Error', () => {
    const issue = Cause.interrupt(FiberId.none);
    const response = Effect.runSync(transformer.transformError(issue));

    assertEquals(response.status, 500);
    assertEquals(
      response.body,
      '{"error":"Server Error","code":999,"detail":"Interrupt: All fibers interrupted without errors.","issue":{"_id":"Cause","_tag":"Interrupt","fiberId":{"_id":"FiberId","_tag":"None"}}}',
    );
  });

  await t.step('should handle null responses', () => {
    const response = Effect.runSync(transformer.transformQuery(null));

    assertEquals(response.status, 200);
    assertEquals(response.body, '{}');
  });

  await t.step('should handle undefined responses', () => {
    const response = Effect.runSync(transformer.transformQuery(undefined));

    assertEquals(response.status, 200);
    assertEquals(response.body, '{}');
  });
});
