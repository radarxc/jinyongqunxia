import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CLIP_BONES, CLIP_JOINTS, RigClipError, RigClipErrorCode, clearRigClipRegistry,
  getRigClip, loadRigClip, registerRigClip, requireRigClip,
} from './clip';

const fixture = JSON.parse(readFileSync(
  new URL('../../../../assets/default/rig/clips/clip_walk.json', import.meta.url), 'utf8',
)) as Record<string, unknown>;
const copy = (): Record<string, unknown> => structuredClone(fixture);

function codeOf(run: () => unknown): RigClipErrorCode | undefined {
  try { run(); } catch (error) { return error instanceof RigClipError ? error.code : undefined; }
  return undefined;
}

describe('tianshu-clip.v1 loader', () => {
  it('strictly validates and decodes all tracks into typed buffers', () => {
    const clip = loadRigClip(copy());
    expect(clip).toMatchObject({
      id: 'clip_walk', skeleton: 'tianshu_humanoid.v1', fps: 30, frameCount: 51,
      loop: true, nativeSpeedMmps: 780, mainHand: 'R',
    });
    expect(clip.restJointMm).toBeInstanceOf(Int32Array);
    expect(clip.restJointMm).toHaveLength(CLIP_JOINTS.length * 3);
    expect(clip.directionI16).toHaveLength(clip.frameCount * CLIP_BONES.length * 3);
    expect(clip.lengthRatioU16).toHaveLength(clip.frameCount * CLIP_BONES.length);
    expect(clip.rootMmI16).toHaveLength(clip.frameCount * 3);
    expect(clip.facingYawCdegI16).toHaveLength(clip.frameCount * 3);
    expect(clip.weaponTipDirectionI16).toHaveLength(clip.frameCount * 3);
    expect(Array.from(clip.rootMmI16.slice(0, 3))).toEqual([-19, -46, 0]);
  });

  it.each([
    ['schema', RigClipErrorCode.Schema, (value: Record<string, unknown>) => { value['schema'] = 'other'; }],
    ['skeleton', RigClipErrorCode.Skeleton, (value: Record<string, unknown>) => { value['skeleton'] = 'other'; }],
    ['license', RigClipErrorCode.License, (value: Record<string, unknown>) => { (value['source'] as Record<string, unknown>)['license'] = ''; }],
    ['unknown field', RigClipErrorCode.Field, (value: Record<string, unknown>) => { value['extra'] = true; }],
    ['bad base64', RigClipErrorCode.Base64, (value: Record<string, unknown>) => { (value['tracks'] as Record<string, unknown>)['rootMmI16'] = '!'; }],
    ['track length', RigClipErrorCode.TrackLength, (value: Record<string, unknown>) => { (value['tracks'] as Record<string, unknown>)['rootMmI16'] = ''; }],
    ['event frame', RigClipErrorCode.Field, (value: Record<string, unknown>) => { ((value['events'] as unknown[])[0] as Record<string, unknown>)['frame'] = 51; }],
    ['missing end', RigClipErrorCode.Event, (value: Record<string, unknown>) => { ((value['events'] as unknown[])[0] as Record<string, unknown>)['type'] = 'hit'; }],
  ] as const)('rejects invalid %s with an enum error', (_label, expected, mutate) => {
    const value = copy(); mutate(value); expect(codeOf(() => loadRigClip(value))).toBe(expected);
  });

  it('registers validated clips and rejects unknown or conflicting IDs', () => {
    clearRigClipRegistry(); const clip = registerRigClip(copy());
    expect(getRigClip('clip_walk')).toBe(clip); expect(requireRigClip('clip_walk')).toBe(clip);
    expect(codeOf(() => requireRigClip('clip_missing'))).toBe(RigClipErrorCode.UnknownId);
    expect(codeOf(() => registerRigClip(copy()))).toBe(RigClipErrorCode.DuplicateId);
    clearRigClipRegistry();
  });

  it('does not trust a forged decoded object at the registry boundary', () => {
    clearRigClipRegistry();
    const forged = { ...loadRigClip(copy()), id: 'clip_forged' };
    expect(codeOf(() => registerRigClip(forged))).toBe(RigClipErrorCode.Field);
    expect(getRigClip('clip_forged')).toBeUndefined();
  });
});
