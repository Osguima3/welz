import { Effect, Layer } from 'effect';
import { Category, CategoryType } from '../../../../shared/schema/Category.ts';
import { Currency } from '../../../../shared/schema/Currency.ts';
import { UUID } from '../../../../shared/schema/UUID.ts';
import { catchAllDie } from '../../../../shared/utils.ts';
import { CategoryRepository, FindCategoriesOptions } from '../../domain/category/CategoryRepository.ts';
import { PostgresClient } from './PostgresClient.ts';

interface CategoryRow {
  id: UUID;
  name: string;
  type: CategoryType;
  createdAt: Date;
  total: string;
}

interface CategoryHistoryRow {
  categoryId: UUID;
  month: Date;
  currency: Currency;
  name: string;
  type: CategoryType;
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
              created_at as "createdAt",
              COUNT(*) OVER()::INTEGER as total
            FROM categories
            WHERE 1=1
          `;

          const params: unknown[] = [];

          if (options.categoryType) {
            query += ` AND type = $${params.length + 1}`;
            params.push(options.categoryType);
          }

          query += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
          params.push(pageSize, offset);

          const result = yield* client.runQuery<CategoryRow>(query, params);

          if (result.rows.length === 0) {
            return {
              items: [],
              total: 0,
              page,
              pageSize,
            };
          }

          return {
            items: result.rows,
            total: Number(result.rows[0].total),
            page,
            pageSize,
          };
        }).pipe(
          catchAllDie('Failed to find categories'),
        ),

      save: (category: Category) =>
        Effect.gen(function* () {
          const result = yield* client.runQuery<CategoryRow>(
            `INSERT INTO categories (
              id,
              name,
              type,
              created_at
            ) VALUES (
              $1, $2, $3, $4
            )
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              type = EXCLUDED.type
            RETURNING 
              *,
              created_at as "createdAt"
            `,
            [
              category.id,
              category.name,
              category.type,
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
