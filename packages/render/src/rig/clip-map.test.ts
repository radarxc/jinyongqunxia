import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadRigClipMap, resolveRigClipKey } from './clip-map';

const source = readFileSync(new URL('../../../../content/anim/clip-map.yaml', import.meta.url), 'utf8');
const document: unknown = JSON.parse(source);

describe('rig clip map', () => {
  it('loads all MoveDef.anim.clip keys from the data document', () => {
    const map = loadRigClipMap(document);
    expect(Object.keys(map).sort()).toEqual([
      'dodge', 'fall', 'hit', 'idle', 'meditate', 'punch', 'run', 'sword_attack', 'sword_regular', 'walk',
    ]);
    expect(resolveRigClipKey(map, 'sword_regular')).toMatchObject({ clipId: 'clip_sword_attack', nearHandWeapon: true });
  });

  it('rejects unknown keys and malformed entries', () => {
    const map = loadRigClipMap(document);
    expect(() => resolveRigClipKey(map, 'unknown')).toThrowError('RIG_CLIP_MAP_UNKNOWN_KEY:unknown');
    expect(() => resolveRigClipKey(map, 'toString')).toThrowError('RIG_CLIP_MAP_UNKNOWN_KEY:toString');
    expect(() => resolveRigClipKey(map, 'constructor')).toThrowError('RIG_CLIP_MAP_UNKNOWN_KEY:constructor');
    expect(() => loadRigClipMap({ schema: 'tianshu-clip-map.v1', clips: { bad: { clipId: 'oops' } } }))
      .toThrowError('RIG_CLIP_MAP_INVALID');
  });
});
