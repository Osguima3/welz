import { Schema } from 'effect';

export default class Page {
  static of = <A, I, R>(itemSchema: Schema.Schema<A, I, R>) =>
    Schema.Struct({
      items: Schema.Array(itemSchema),
      total: Schema.Number,
      page: Schema.Number,
      pageSize: Schema.Number,
    });

  static empty = <A, I, R>(itemSchema: Schema.Schema<A, I, R>, { page = 1, pageSize = 10 } = {}) =>
    Page.of(itemSchema).make({ items: [], total: 0, page, pageSize });
}
