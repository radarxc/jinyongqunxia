import { describe, expect, it } from 'vitest';
import { fixupContentRefs } from '../content-remap';
import { applyPathRemaps, validateIdRemaps, validatePathRemaps } from './remaps';

const hash = 'a'.repeat(64);
const row = (from: string, to: string) => ({ from, to, since: hash, reason: 'test' });
const doc = (...remaps: ReturnType<typeof row>[]) => ({ schemaVersion: 'id-remaps.v1', remaps });
const ids = new Set(['it_new', 'it_final', 'sk_new']);

describe('ID remap validation', () => {
  it('flattens chains and fixes structured references without touching substrings', () => {
    const remaps = validateIdRemaps(doc(row('it_old', 'it_mid'), row('it_mid', 'it_final')), ids);
    expect(remaps.map(({ from, to }) => ({ from, to }))).toEqual([
      { from: 'it_old', to: 'it_final' }, { from: 'it_mid', to: 'it_final' },
    ]);
    expect(fixupContentRefs({ itemId: 'it_old', note: 'owns it_old today' }, remaps)).toEqual(
      { itemId: 'it_final', note: 'owns it_old today' });
  });

  it.each([
    ['unique from', doc(row('it_old', 'it_new'), row('it_old', 'it_final')), 'REMAP_FROM_DUPLICATE'],
    ['acyclic graph', doc(row('it_old', 'it_mid'), row('it_mid', 'it_old')), 'REMAP_CYCLE'],
    ['target exists', doc(row('it_old', 'it_missing')), 'REMAP_TARGET_MISSING'],
    ['from is absent', doc(row('it_new', 'it_final')), 'REMAP_FROM_DEFINED'],
    ['same namespace', doc(row('it_old', 'sk_new')), 'REMAP_NAMESPACE'],
    ['one-to-many is unsupported', doc({ ...row('it_old', 'it_new'), to: ['it_new', 'it_final'] } as never), 'REMAP_ONE_TO_MANY'],
    ['strict row shape', { ...doc(row('it_old', 'it_new')), remaps: [{ ...row('it_old', 'it_new'), toAlso: 'it_final' }] }, 'REMAP_ENTRY'],
  ])('rejects %s violations', (_name, value, code) => {
    expect(() => validateIdRemaps(value, ids)).toThrow(code);
  });
});

describe('path remap validation', () => {
  const valid = { from: 'content/ch01_tianlong/old.yaml',
    to: 'content/chapters/ch01_tianlong/new.yaml', since: hash, reason: 'move' };

  it('accepts strict repository-relative moves', () => {
    const remaps = validatePathRemaps({ schemaVersion: 'path-remaps.v1', remaps: [valid] });
    expect(remaps).toEqual([valid]);
    expect(applyPathRemaps([{ path: valid.from, value: 1 }], remaps)).toEqual({
      sources: [{ path: valid.to, value: 1 }], applied: [valid],
    });
  });

  it.each([
    [{ ...valid, since: 'today' }, 'PATH_REMAP_ENTRY'],
    [{ ...valid, to: '../outside.yaml' }, 'PATH_REMAP_ENTRY'],
    [{ ...valid, extra: true }, 'PATH_REMAP_ENTRY'],
  ])('rejects malformed rows', (rowValue, code) => {
    expect(() => validatePathRemaps({ schemaVersion: 'path-remaps.v1', remaps: [rowValue] }))
      .toThrow(code);
  });

  it('rejects a migrated path colliding with a canonical source', () => {
    expect(() => applyPathRemaps([{ path: valid.from }, { path: valid.to }], [valid]))
      .toThrow('PATH_REMAP_COLLISION');
  });
});
