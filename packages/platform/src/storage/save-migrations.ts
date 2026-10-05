import { StorageError, StorageErrorCode } from './errors';

export type SaveJson = null | boolean | number | string | SaveJson[] | { [key: string]: SaveJson };
export interface SaveMigrationContext {
  readonly fromSchema: number;
  readonly toSchema: number;
  readonly fromContentHash: string;
  readonly targetContentHash: string;
}
export type SaveMigration = (state: SaveJson, context: SaveMigrationContext) => SaveJson;
export type ContentFixup = (state: SaveJson, context: SaveMigrationContext) => SaveJson;

export const identitySaveMigration: SaveMigration = (state) => structuredClone(state);
export const identityContentFixup: ContentFixup = (state) => structuredClone(state);

/** Keys are source schemas; migration n upgrades schema n to n + 1. */
export const SAVE_MIGRATIONS: ReadonlyMap<number, SaveMigration> = new Map([
  [1, identitySaveMigration],
]);

export interface MigrateSaveOptions {
  readonly fromSchema: number;
  readonly targetSchema: number;
  readonly fromContentHash: string;
  readonly targetContentHash?: string;
  readonly migrations?: ReadonlyMap<number, SaveMigration>;
  readonly fixup?: ContentFixup;
}

export interface MigratedSave {
  readonly state: SaveJson;
  readonly applied: readonly number[];
  readonly fixedContent: boolean;
}

export function migrateSaveJson(state: SaveJson, options: MigrateSaveOptions): MigratedSave {
  const { fromSchema, targetSchema } = options;
  if (
    !Number.isSafeInteger(fromSchema) ||
    fromSchema < 1 ||
    !Number.isSafeInteger(targetSchema) ||
    targetSchema < 1
  ) {
    throw new StorageError(
      StorageErrorCode.MigrationFailed,
      'Save schema must be positive integers',
    );
  }
  if (fromSchema > targetSchema) {
    throw new StorageError(
      StorageErrorCode.SaveTooNew,
      `Save schema ${fromSchema} is newer than ${targetSchema}`,
    );
  }
  const context: SaveMigrationContext = {
    fromSchema,
    toSchema: targetSchema,
    fromContentHash: options.fromContentHash,
    targetContentHash: options.targetContentHash ?? options.fromContentHash,
  };
  const migrations = options.migrations ?? SAVE_MIGRATIONS;
  let current = structuredClone(state);
  const applied: number[] = [];
  try {
    for (let source = fromSchema; source < targetSchema; source += 1) {
      const migration = migrations.get(source);
      if (!migration) {
        throw new StorageError(
          StorageErrorCode.MissingMigration,
          `Missing save migration from schema ${source}`,
        );
      }
      current = migration(current, context);
      applied.push(source);
    }
    const fixedContent = context.fromContentHash !== context.targetContentHash;
    if (fixedContent) current = (options.fixup ?? identityContentFixup)(current, context);
    return { state: current, applied, fixedContent };
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError(StorageErrorCode.MigrationFailed, 'Save migration failed', error);
  }
}
