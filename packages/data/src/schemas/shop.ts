import { z } from 'zod';
import { ItemKindSchema } from './item';
import { ItemIdSchema, JsonValueSchema, LocalKeySchema } from './primitives';

const TextKeySchema = z.string().regex(/^[a-z][A-Za-z0-9]*(?:[.-][A-Za-z0-9_]+|_[A-Za-z0-9_]+)+$/u);
const PriceByGradeSchema = z.array(z.number().int().safe().nonnegative()).length(12);
const withRegistryId = <T extends object>(value: T, id: string): T => {
  Object.defineProperty(value, 'id', { value: id, enumerable: false });
  return value;
};

export const ShopSupplyRowSchema = z.strictObject({
  itemId: ItemIdSchema,
  maxGrade: z.number().int().min(1).max(12),
  baseStock: z.number().int().nonnegative(),
  restockEveryDays: z.number().int().positive(),
  restockAmount: z.number().int().nonnegative(),
  priceBp: z.number().int().positive(),
  condition: z.record(z.string(), JsonValueSchema).optional(),
});

export const ShopTemplateSchema = z.strictObject({
  schemaVersion: z.literal('shop-template.v1'),
  key: LocalKeySchema,
  nameKey: TextKeySchema,
  facilitySub: LocalKeySchema,
  supply: z.array(ShopSupplyRowSchema),
}).transform((value) => withRegistryId(value, value.key));

export const PriceTableCategorySchema = z.strictObject({
  id: LocalKeySchema,
  byGrade: PriceByGradeSchema,
});

export const PriceTableSchema = z.strictObject({
  schemaVersion: z.literal('price-table.v1'),
  categories: z.array(PriceTableCategorySchema).min(1),
  itemKindToCategory: z.record(ItemKindSchema, LocalKeySchema),
}).superRefine((value, context) => {
  const categoryIds = new Set<string>();
  for (const [index, category] of value.categories.entries()) {
    if (categoryIds.has(category.id)) context.addIssue({
      code: 'custom', path: ['categories', index, 'id'],
      message: 'price category IDs must be unique',
    });
    categoryIds.add(category.id);
  }
  for (const [kind, categoryId] of Object.entries(value.itemKindToCategory))
    if (!categoryIds.has(categoryId)) context.addIssue({
      code: 'custom', path: ['itemKindToCategory', kind],
      message: `unknown price category ${categoryId}`,
    });
}).transform((value) => withRegistryId(value, 'price_table'));

export type ShopSupplyRow = z.output<typeof ShopSupplyRowSchema>;
export type ShopTemplateDef = z.output<typeof ShopTemplateSchema>;
export type PriceTableCategory = z.output<typeof PriceTableCategorySchema>;
export type PriceTableDef = z.output<typeof PriceTableSchema>;
