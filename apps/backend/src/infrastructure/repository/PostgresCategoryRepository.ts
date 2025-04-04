import { Effect, Layer } from 'effect';
import { Category, CategoryType } from '../../../../shared/schema/Category.ts';
import { CategoryHistoryEntry } from '../../../../shared/schema/CategoryHistory.ts';
import { Color } from '../../../../shared/schema/Color.ts';
import { Currency } from '../../../../shared/schema/Currency.ts';
import { Money } from '../../../../shared/schema/Money.ts';
import { UUID } from '../../../../shared/schema/UUID.ts';
import { catchAllDie } from '../../../../shared/utils.ts';
import {
  CategoryRepository,
  FindCategoriesOptions,
  FindCategoryHistoryOptions,
} from '../../domain/category/CategoryRepository.ts';
import { PostgresClient } from './PostgresClient.ts';

interface CategoryRow {
  id: UUID;
  name: string;
  type: CategoryType;
  color: Color;
  createdAt: Date;
  total: string;
}

interface CategoryHistoryRow {
  categoryId: UUID;
  month: Date;
  currency: Currency;
  name: string;
  type: CategoryType;
  color: Color;
  categoryTotal: string;
  categoryAverage: string;
  typeTotal: string;
  typePercentage: string;
}

export const PostgresCategoryRepository = Layer.effect(
  CategoryRepository,
  Effect.gen(function* () {
    const client = yield* PostgresClient;

    return {
      findById: (id: UUID) =>
        Effect.gen(function* () {
          const result = yield* client.runQuery<CategoryRow>(
            `SELECT
              id,
              name,
              type,
              color,
              created_at as "createdAt"
            FROM categories
            WHERE id = $1
            LIMIT 1`,
            [id],
          );

          if (result.rows.length === 0) {
            return yield* Effect.fail(new Error(`Category not found: ${id}`));
          }

          const row = result.rows[0];
          return Category.make(row);
        }).pipe(
          catchAllDie('Failed to find category'),
        ),

      findCategories: (options: FindCategoriesOptions = {}) =>
        Effect.gen(function* () {
          const page = options.page || 1;
          const pageSize = options.pageSize || 50;
          const offset = (page - 1) * pageSize;

          let query = `
            SELECT 
              id,
              name,
              type,
              color,
              created_at as "createdAt",
              COUNT(*) OVER()::INTEGER as total
            FROM categories
            WHERE 1=1
          `;

          const params: unknown[] = [];

          if (options.categoryId) {
            query += ` AND id = $${params.length + 1}`;
            params.push(options.categoryId);
          }

          if (options.categoryType) {
            query += ` AND type = $${params.length + 1}`;
            params.push(options.categoryType);
          }

          query += ` ORDER BY name`;
          query += ` LIMIT ${pageSize} OFFSET ${offset}`;

          const result = yield* client.runQuery<CategoryRow & { total: number }>(query, params);

          const total = result.rows.length ? result.rows[0].total : 0;

          return {
            items: result.rows.map((row) => Category.make(row)),
            page,
            pageSize,
            total,
          };
        }).pipe(
          catchAllDie('Failed to find categories'),
        ),

      findCategoryHistory: (options: FindCategoryHistoryOptions = {}) =>
        Effect.gen(function* () {
          const today = new Date();
          const defaultStartDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
          const startDate = options.dateRange?.start || defaultStartDate;
          const endDate = options.dateRange?.end || today;

          const params: unknown[] = [startDate, endDate];

          let query = `
            SELECT
              category_id as "categoryId",
              month,
              currency,
              name,
              chv.type,
              c.color,
              category_total as "categoryTotal",
              category_average as "categoryAverage",
              type_total as "typeTotal",
              type_percentage as "typePercentage"
            FROM category_history_view chv
            JOIN categories c ON chv.category_id = c.id
            WHERE month BETWEEN DATE_TRUNC('month', $1::timestamp) AND DATE_TRUNC('month', $2::timestamp)
          `;

          if (options.categoryId) {
            query += ` AND category_id = $${params.length + 1}`;
            params.push(options.categoryId);
          }

          if (options.maxCategories) {
            query += ` AND type_rank <= $${params.length + 1}`;
            params.push(options.maxCategories);
          }

          query += ` ORDER BY month DESC, type, type_rank`;

          const result = yield* client.runQuery<CategoryHistoryRow>(query, params);

          return result.rows.map((row, index) =>
            CategoryHistoryEntry.make({
              ...row,
              total: Money.create(row.categoryTotal, row.currency),
              typeTotal: Money.create(row.typeTotal, row.currency),
              typePercentage: Number(row.typePercentage),
              forecast: index === 0 ? Money.create(row.categoryAverage, row.currency) : undefined,
            })
          );
        }).pipe(
          catchAllDie('Failed to find category history'),
        ),

      save: (category: Category) =>
        Effect.gen(function* () {
          const result = yield* client.runQuery<CategoryRow>(
            `INSERT INTO categories (
              id,
              name,
              type,
              color,
              created_at
            ) VALUES (
              $1, $2, $3, $4, $5
            )
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              type = EXCLUDED.type,
              color = EXCLUDED.color
            RETURNING 
              *,
              created_at as "createdAt"
            `,
            [
              category.id,
              category.name,
              category.type,
              category.color,
              category.createdAt,
            ],
          );

          const row = result.rows[0];
          yield* Effect.log(`Category saved: ${JSON.stringify(row)}`);
          return Category.make(row);
        }).pipe(
          catchAllDie('Failed to save category'),
        ),
    };
  }),
);
