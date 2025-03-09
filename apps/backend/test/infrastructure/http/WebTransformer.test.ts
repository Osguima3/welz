import { assertEquals } from '$std/assert/mod.ts';
import { Cause, Effect, FiberId, Option, ParseResult, SchemaAST } from 'effect';
import { Money } from '../../../src/domain/common/Money.ts';
import { WebTransformer } from '../../../src/infrastructure/http/WebTransformer.ts';

Deno.test('WebTransformer', async (t) => {
  const ast = new SchemaAST.Literal('T');
  const actual = 'actual';

  const transformer = WebTransformer.pipe(Effect.provide(WebTransformer.Live), Effect.runSync);

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

  await t.step('should transform missing parse errors as 400 Bad Request', () => {
    const issue = new ParseResult.Missing(new SchemaAST.Type(ast));
    const error = new ParseResult.ParseError({ issue });
    const response = Effect.runSync(transformer.transformError(Cause.fail(error)));

    assertEquals(response.status, 400);
    assertEquals(
      response.body,
      '{"code":200,"detail":"Parse Error: expected \\"T\\" but was missing","error":"Invalid Request","issue":{"_id":"ParseError","message":"is missing"}}',
    );
  });

  await t.step('should transform other parse errors as 400 Bad Request', () => {
    const issue = new ParseResult.Refinement(
      new SchemaAST.Refinement(ast, Option.none),
      actual,
      'From',
      new ParseResult.Unexpected(actual, 'Invalid input'),
    );
    const error = new ParseResult.ParseError({ issue });
    const response = Effect.runSync(transformer.transformError(Cause.fail(error)));

    assertEquals(response.status, 400);
    assertEquals(
      response.body,
      '{"code":201,"detail":"Parse Error: expected { \\"T\\" | filter } but was \\"actual\\"","error":"Invalid Request","issue":{"_id":"ParseError","message":"{ \\"T\\" | filter }\\n└─ From side refinement failure\\n   └─ Invalid input"}}',
    );
  });

  await t.step('should transform parse errors with message as 400 Bad Request', () => {
    const issue = new ParseResult.Unexpected('actual', 'Invalid input');
    const error = new ParseResult.ParseError({ issue });
    const response = Effect.runSync(transformer.transformError(Cause.fail(error)));

    assertEquals(response.status, 400);
    assertEquals(
      response.body,
      '{"code":202,"detail":"Parse Error: Unexpected: Invalid input, was \\"actual\\"","error":"Invalid Request","issue":{"_id":"ParseError","message":"Invalid input"}}',
    );
  });

  await t.step('should transform composite parse errors as 400 Bad Request', () => {
    const issue = new ParseResult.Composite(
      ast,
      actual,
      new ParseResult.Missing(new SchemaAST.Type(ast)),
    );
    const error = new ParseResult.ParseError({ issue });
    const response = Effect.runSync(transformer.transformError(Cause.fail(error)));

    assertEquals(response.status, 400);
    assertEquals(
      response.body,
      '{"code":200,"detail":"Parse Error: expected \\"T\\" but was missing","error":"Invalid Request","issue":{"_id":"ParseError","message":"\\"T\\"\\n└─ is missing"}}',
    );
  });

  await t.step('should transform composite parse errors as 400 Bad Request', () => {
    const issue = new ParseResult.Composite(
      ast,
      actual,
      [
        new ParseResult.Missing(new SchemaAST.Type(ast)),
        new ParseResult.Unexpected('actual', 'Invalid input'),
      ],
    );
    const error = new ParseResult.ParseError({ issue });
    const response = Effect.runSync(transformer.transformError(Cause.fail(error)));

    assertEquals(response.status, 400);
    assertEquals(
      response.body,
      '{"code":200,"detail":"Parse Error: expected \\"T\\" but was missing","error":"Invalid Request","issue":{"_id":"ParseError","message":"\\"T\\"\\n├─ is missing\\n└─ Invalid input"}}',
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
