import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateContent } from './validate';

const fixture = (name: string): string =>
  resolve(import.meta.dirname, '__fixtures__/content-validation', name);

describe('content validation discovery', () => {
  it('validates a paired Ink story without registering its metadata as content', async () => {
    const result = await validateContent(fixture('valid'));

    expect(result).toMatchObject({
      fileCount: 3,
      objectCount: 1,
      inkStoryCount: 1,
      mapCount: 0,
      diagnostics: [],
    });
    expect(result.registry.require('item', 'it_validation_fixture')).toMatchObject({
      schemaVersion: 'item.v1',
    });
    expect(result.registry.entries.map((entry) => entry.path)).toEqual([
      'content/items/it_validation_fixture.yaml',
    ]);
  });

  it('rejects an Ink source without same-name metadata', async () => {
    await expect(validateContent(fixture('missing-meta'))).rejects.toThrow(
      'INK_META_MISSING:content/story/ch01/story_missing_meta.ink',
    );
  });

  it('rejects Ink metadata without a same-name source', async () => {
    await expect(validateContent(fixture('missing-ink'))).rejects.toThrow(
      'INK_SOURCE_MISSING:content/story/ch01/story_missing_ink.ink',
    );
  });

  it('reports invalid Ink metadata through parseInkMeta', async () => {
    await expect(validateContent(fixture('invalid-meta'))).rejects.toThrow(
      'INK_META:content/story/ch01/story_invalid_meta.inkmeta.yaml',
    );
  });

  it('keeps rejecting unknown schema versions in ordinary content YAML', async () => {
    await expect(validateContent(fixture('invalid-content'))).rejects.toThrow(
      'CONTENT_SCHEMA_VERSION:content/items/unknown.yaml:unknown.v1',
    );
  });

  it('rejects an unregistered EventDef action through content validation', async () => {
    await expect(validateContent(fixture('invalid-event'))).rejects.toThrow();
  });

  it('accepts ordinary content YAML without requiring an Ink story', async () => {
    const result = await validateContent(fixture('content-only'));

    expect(result.objectCount).toBe(1);
    expect(result.inkStoryCount).toBe(0);
    expect(result.registry.require('item', 'it_content_only_fixture')).toMatchObject({
      schemaVersion: 'item.v1',
    });
  });
});
