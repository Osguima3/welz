import { assertEquals } from '$std/assert/mod.ts';
import { Cause, Effect, FiberId, Option, ParseResult, SchemaAST } from 'effect';
import { randomUUID } from 'node:crypto';
import { Account } from '../../../../shared/schema/Account.ts';
import { Category } from '../../../../shared/schema/Category.ts';
import { Transaction } from '../../../../shared/schema/Transaction.ts';
import { WebTransformer } from '../../../src/infrastructure/http/WebTransformer.ts';
import TestAggregates from '../../helper/TestAggregates.ts';

Deno.test('WebTransformer', async (t) => {
  const id = randomUUID();
  const idSlice = id.slice(0, 8);
  const createdAt = new Date();
  const createdString = createdAt.toISOString();

  const ast = new SchemaAST.Literal('T');
  const actual = 'actual';

  const transformer = WebTransformer.pipe(Effect.provide(WebTransformer.Live), Effect.runSync);

  await t.step('should transform errors', async (t) => {
    await t.step('ParseIssue: Missing -> 400 Bad Request', () => {
      const issue = new ParseResult.Missing(new SchemaAST.Type(ast));
      const error = new ParseResult.ParseError({ issue });
      const response = Effect.runSync(transformer.transformError(Cause.fail(error)));

      assertEquals(response.status, 400);
      assertEquals(
        response.body,
        '{"code":200,"detail":"Parse Error: expected \\"T\\" but was missing","error":"Invalid Request","issue":{"_id":"ParseError","message":"is missing"}}',
      );
    });

    await t.step('ParseIssue: Ast -> 400 Bad Request', () => {
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

    await t.step('ParseIssue: Message -> 400 Bad Request', () => {
      const issue = new ParseResult.Unexpected('actual', 'Invalid input');
      const error = new ParseResult.ParseError({ issue });
      const response = Effect.runSync(transformer.transformError(Cause.fail(error)));

      assertEquals(response.status, 400);
      assertEquals(
        response.body,
        '{"code":202,"detail":"Parse Error: Unexpected: Invalid input, was \\"actual\\"","error":"Invalid Request","issue":{"_id":"ParseError","message":"Invalid input"}}',
      );
    });

    await t.step('ParseIssue: Composite (single) -> 400 Bad Request', () => {
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

    await t.step('ParseIssue: Composite (multiple) -> 400 Bad Request', () => {
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

    await t.step('Fail -> 500 Internal Server Error', () => {
      const issue = new Error('Database connection failed');
      const response = Effect.runSync(transformer.transformError(Cause.fail(issue)));

      assertEquals(response.status, 500);
      assertEquals(
        response.body,
        '{"error":"Server Error","code":300,"detail":"Error: Database connection failed","issue":{}}',
      );
    });

    await t.step('Die -> 500 Internal Server Error', () => {
      const issue = new Error('Database connection failed');
      const response = Effect.runSync(transformer.transformError(Cause.die(issue)));

      assertEquals(response.status, 500);
      assertEquals(
        response.body,
        '{"error":"Server Error","code":400,"detail":"Error: Database connection failed","issue":{"_id":"Cause","_tag":"Die","defect":{}}}',
      );
    });

    await t.step('Other -> 500 Internal Server Error', () => {
      const issue = Cause.interrupt(FiberId.none);
      const response = Effect.runSync(transformer.transformError(issue));

      assertEquals(response.status, 500);
      assertEquals(
        response.body,
        '{"error":"Server Error","code":999,"detail":"Interrupt: All fibers interrupted without errors.","issue":{"_id":"Cause","_tag":"Interrupt","fiberId":{"_id":"FiberId","_tag":"None"}}}',
      );
    });
  });

  await t.step('CommandResponse', async (t) => {
    await t.step('Transaction', () => {
      const transaction = TestAggregates.transaction({ id, accountId: id, createdAt, date: createdAt });
      const response = Effect.runSync(transformer.transformCommand(transaction));
      assertEquals(response.status, 201);
      assertEquals(
        response.body,
        `{"id":"${id}","accountId":"${id}","description":"Test transaction","amount":{"amount":1000,"currency":"EUR"},"date":"${createdString}","createdAt":"${createdString}","updatedAt":"${createdString}"}`,
      );
    });
  });

  await t.step('Query Response', async (t) => {
    await t.step('AccountPage', () => {
      const accountPage = TestAggregates.page(Account, TestAggregates.account({ id, createdAt }));
      const response = Effect.runSync(transformer.transformQuery(accountPage));
      assertEquals(response.status, 200);
      assertEquals(
        response.body,
        `{"items":[{"id":"${id}","name":"Test Account","type":"BANK","balance":{"amount":1000,"currency":"EUR"},"createdAt":"${createdString}","updatedAt":"${createdString}"}],"total":0,"page":1,"pageSize":10}`,
      );
    });

    await t.step('CategoryPage', () => {
      const categoryPage = TestAggregates.page(Category, TestAggregates.category({ id, createdAt }));
      const response = Effect.runSync(transformer.transformQuery(categoryPage));
      assertEquals(response.status, 200);
      assertEquals(
        response.body,
        `{"items":[{"id":"${id}","name":"Test Category ${idSlice}","type":"EXPENSE","color":"green","createdAt":"${createdString}"}],"total":0,"page":1,"pageSize":10}`,
      );
    });

    await t.step('TransactionPage', () => {
      const transactionPage = TestAggregates.page(
        Transaction,
        TestAggregates.transaction({ id, accountId: id, createdAt, date: createdAt }),
      );
      const response = Effect.runSync(transformer.transformQuery(transactionPage));
      assertEquals(response.status, 200);
      assertEquals(
        response.body,
        `{"items":[{"id":"${id}","accountId":"${id}","description":"Test transaction","amount":{"amount":1000,"currency":"EUR"},"date":"${createdString}","createdAt":"${createdString}","updatedAt":"${createdString}"}],"total":0,"page":1,"pageSize":10}`,
      );
    });

    await t.step('Empty Page', () => {
      const page = TestAggregates.page(Account);
      const response = Effect.runSync(transformer.transformQuery(page));
      assertEquals(response.status, 200);
      assertEquals(response.body, '{"items":[],"total":0,"page":1,"pageSize":10}');
    });
  });
});
