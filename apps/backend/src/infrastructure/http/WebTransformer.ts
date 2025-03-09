/// <reference lib="dom" />
import { Cause, Context, Effect, Layer, Match, ParseResult } from 'effect';

export interface WebResponse {
  body: string;
  status: number;
}

interface ErrorBody {
  body: ErrorData;
  status: number;
}

interface ErrorData {
  code: number;
  detail: string;
  error?: string;
  issue?: unknown | undefined;
}

export class WebTransformer extends Context.Tag('WebTransformer')<
  WebTransformer,
  {
    transformCommand: (result: unknown) => Effect.Effect<WebResponse>;
    transformQuery: (result: unknown) => Effect.Effect<WebResponse>;
    transformError: (error: Cause.Cause<Error | ParseResult.ParseError>) => Effect.Effect<WebResponse>;
  }
>() {
  static Live = Layer.succeed(
    WebTransformer,
    {
      transformCommand: (body) => Effect.succeed({ body: JSON.stringify(body || {}), status: 201 }),
      transformQuery: (body) => Effect.succeed({ body: JSON.stringify(body || {}), status: 200 }),
      transformError: (error) =>
        Effect.succeed(handleError(error)).pipe(
          Effect.map(({ body, status }) => ({ body: JSON.stringify(body), status })),
        ),
    },
  );
}

function handleError(error: Cause.Cause<Error | ParseResult.ParseError>): ErrorBody {
  return Match.value(error).pipe(
    Match.withReturnType<ErrorBody>(),
    Match.tag('Fail', handleFail),
    Match.tag('Die', handleDie),
    Match.orElse((error) => ({
      body: { error: 'Server Error', code: 999, detail: `${error._tag}: ${error}`, issue: error },
      status: 500,
    })),
  );
}

function handleFail(error: Cause.Fail<Error | ParseResult.ParseError>): ErrorBody {
  return Match.value(error.error).pipe(
    Match.withReturnType<ErrorBody>(),
    Match.tag('ParseError', (error) => ({ body: handleParseError(error), status: 400 })),
    Match.orElse((error) => ({
      body: { error: 'Server Error', code: 300, detail: error.toString(), issue: error },
      status: 500,
    })),
  );
}

function handleParseError(error: ParseResult.ParseError): ErrorData {
  const issue = handleParseIssue(error.issue);
  return {
    ...issue,
    error: 'Invalid Request',
    detail: 'Parse Error: ' + issue.detail,
    issue: error,
  };
}

function handleParseIssue(issue: ParseResult.ParseIssue, prefix: string = ''): ErrorData {
  return Match.value(issue).pipe(
    Match.tag('Pointer', (pointer) => handleParseIssue(pointer.issue, `${prefix}${pointer.path.toString()}: `)),
    Match.tag('Composite', (compositeIssue) => handleCompositeError(compositeIssue, prefix)),
    Match.tag('Type', (type) => ({ code: 200, detail: `${prefix}expected ${type.ast} but was "${type.actual}"` })),
    Match.tag('Missing', () => ({ code: 201, detail: `${prefix}expected but was missing` })),
    Match.orElse((issue) => ({ code: 299, detail: `${prefix}${issue._tag}: ${issue.message}` })),
  );
}

function handleCompositeError(issue: ParseResult.Composite, prefix: string = ''): ErrorData {
  const issues = issue.issues as ParseResult.SingleOrNonEmpty<ParseResult.ParseIssue>;
  return Match.value(issues).pipe(
    Match.when(Array.isArray, (arr) => handleParseIssue(arr[0], prefix)),
    Match.orElse((single) => handleParseIssue(single, prefix)),
  );
}

function handleDie(error: Cause.Die): ErrorBody {
  return {
    body: { error: 'Server Error', code: 400, detail: tryParseMessage(error.defect), issue: error },
    status: 500,
  };
}

function tryParseMessage(error: unknown): string {
  return Match.value(error).pipe(
    Match.withReturnType<string>(),
    Match.when(Match.string, (error) => error.split('\n')[0]),
    Match.orElse(String),
  );
}
