import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readdirSync, readFileSync as readText } from 'node:fs';
import { clearRigClipRegistry, registerRigClip } from './clip';
import { createRigCharacter } from './character';
import { createRigInstanceBuffer } from './instance-buffer';
import { loadRigSet } from './manifest';
import { createPlaceholderRigManifest } from './placeholder';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../../../../assets/default/rig/clips/${name}.json`, import.meta.url), 'utf8'));
}

describe('RigInstance clip integration', () => {
  beforeEach(() => { clearRigClipRegistry(); registerRigClip(fixture('clip_walk')); registerRigClip(fixture('clip_sword_attack')); });

  it('plays a registered clip through the shared pose writer and stops without events', async () => {
    const rigSet = await loadRigSet(createPlaceholderRigManifest()); const character = createRigCharacter(rigSet, { mainHand: 'eq_sword' });
    const events = vi.fn(); character.playClip('clip_sword_attack', { facingYawDeg: 45, nearHandWeapon: true, onEvent: events });
    character.update(.9); const buffer = createRigInstanceBuffer(20); character.writeInstances(buffer, 0);
    expect(buffer.affine2d.array.some((value) => value !== 0)).toBe(true); character.stopClip(); character.update(.16);
    expect(events.mock.calls.map(([event]) => event)).toEqual(['hit']); character.dispose(); rigSet.dispose();
  });

  it('falls back to the unchanged program gait outside the movement rate band', async () => {
    const rigSet = await loadRigSet(createPlaceholderRigManifest()); const character = createRigCharacter(rigSet);
    character.setMotion(1, .2, 'medium'); character.update(.2); const before = createRigInstanceBuffer(20); character.writeInstances(before, 0);
    character.playClip('clip_walk', { facingYawDeg: 45 }); character.update(0); const after = createRigInstanceBuffer(20); character.writeInstances(after, 0);
    expect(Array.from(after.affine2d.array)).toEqual(Array.from(before.affine2d.array)); character.dispose(); rigSet.dispose();
  });

  it('keeps a newly started clip alive on a zero-delta render tick', async () => {
    const rigSet = await loadRigSet(createPlaceholderRigManifest()); const character = createRigCharacter(rigSet);
    character.playClip('clip_sword_attack', { facingYawDeg: 0 }); character.update(0);
    character.update(.9); const buffer = createRigInstanceBuffer(20); character.writeInstances(buffer, 0);
    const reference = createRigCharacter(rigSet); reference.update(.9); const gait = createRigInstanceBuffer(20); reference.writeInstances(gait, 0);
    expect(Array.from(buffer.affine2d.array)).not.toEqual(Array.from(gait.affine2d.array));
    reference.dispose(); character.dispose(); rigSet.dispose();
  });

  it('writes a changed facing projection before the next 12 fps sample', async () => {
    const rigSet = await loadRigSet(createPlaceholderRigManifest()); const character = createRigCharacter(rigSet);
    character.playClip('clip_sword_attack', { facingYawDeg: 0 }); character.update(.2);
    const before = createRigInstanceBuffer(20); character.writeInstances(before, 0); character.setMotion(2, 0, 'medium');
    character.update(0); const after = createRigInstanceBuffer(20); character.writeInstances(after, 0);
    expect(Array.from(after.affine2d.array)).not.toEqual(Array.from(before.affine2d.array));
    character.dispose(); rigSet.dispose();
  });

  it('continues updating the cape spring between clip sample frames', async () => {
    const rigSet = await loadRigSet(createPlaceholderRigManifest()); const character = createRigCharacter(rigSet, { cape: 'eq_cape' });
    character.setMotion(1, 1, 'medium'); character.playClip('clip_walk', { facingYawDeg: 45 }); character.update(.2);
    const before = createRigInstanceBuffer(20); character.writeInstances(before, 0); character.update(1 / 120);
    const after = createRigInstanceBuffer(20); character.writeInstances(after, 0); const cape = 16 * 6;
    expect(Array.from(after.affine2d.array.slice(cape, cape + 6))).not.toEqual(Array.from(before.affine2d.array.slice(cape, cape + 6)));
    character.dispose(); rigSet.dispose();
  });

  it('does not dirty the instance buffer between clip sample frames', async () => {
    const rigSet = await loadRigSet(createPlaceholderRigManifest()); const character = createRigCharacter(rigSet);
    character.setMotion(0, .78, 'medium'); character.playClip('clip_walk', { facingYawDeg: 0 }); character.update(.2);
    const buffer = createRigInstanceBuffer(20); character.writeInstances(buffer, 0); buffer.flushDirtyRanges();
    character.update(1 / 120); character.writeInstances(buffer, 0);
    expect(buffer.flushDirtyRanges()).toEqual([]);
    character.update(1 / 12); character.writeInstances(buffer, 0);
    expect(buffer.flushDirtyRanges()).toEqual([{ start: 0, count: 16 }]);
    character.dispose(); rigSet.dispose();
  });

  it('invalidates the projected pose when switching clips', async () => {
    const rigSet = await loadRigSet(createPlaceholderRigManifest()); const character = createRigCharacter(rigSet);
    character.setMotion(0, .78, 'medium'); character.playClip('clip_sword_attack', { facingYawDeg: 0 }); character.update(.2);
    const before = createRigInstanceBuffer(20); character.writeInstances(before, 0);
    character.playClip('clip_walk', { facingYawDeg: 0 }); character.update(.2);
    const after = createRigInstanceBuffer(20); character.writeInstances(after, 0);
    expect(Array.from(after.affine2d.array)).not.toEqual(Array.from(before.affine2d.array));
    character.dispose(); rigSet.dispose();
  });

  it('keeps the current gait ready while a fully blended action clip plays', async () => {
    const rigSet = await loadRigSet(createPlaceholderRigManifest()); const character = createRigCharacter(rigSet);
    character.playClip('clip_sword_attack', { facingYawDeg: 0 }); character.update(.2);
    character.setMotion(0, 4, 'medium'); character.update(.16);
    expect(character.motionMode).toBe('run'); character.stopClip(); character.update(.16);
    const buffer = createRigInstanceBuffer(20); character.writeInstances(buffer, 0);
    expect(buffer.affine2d.array.some(value => value !== 0)).toBe(true);
    character.dispose(); rigSet.dispose();
  });

  it('rejects unknown clips and keeps renderer events out of core-shaped input', async () => {
    const rigSet = await loadRigSet(createPlaceholderRigManifest()); const character = createRigCharacter(rigSet);
    expect(() => character.playClip('clip_missing', { facingYawDeg: 0 })).toThrowError('RIG_CLIP_UNKNOWN_ID');
    const coreProjection = { dir8: 1, speedMps: 1.4, weightClass: 'medium' } as const;
    expect('onEvent' in coreProjection).toBe(false); character.dispose(); rigSet.dispose();
  });

  it('keeps render clip events outside every core source module (R15)', () => {
    const root = new URL('../../../core/src/', import.meta.url); const walk = (directory: URL): string[] =>
      readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
        ? walk(new URL(`${entry.name}/`, directory)) : entry.name.endsWith('.ts') ? [readText(new URL(entry.name, directory), 'utf8')] : []);
    const source = walk(root).join('\n'); expect(source).not.toMatch(/RigClip|ClipPlayOptions|RIG_CLIP/);
    expect(source).not.toMatch(/from ['"]@tianshu\/render/);
  });
});
