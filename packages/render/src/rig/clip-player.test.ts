import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { loadRigClip } from './clip';
import { CLIP_CROSSFADE_SECONDS, createClipPlayer } from './clip-player';
import { isClipMainHandFar } from './project';

function fixture(name: string) {
  return loadRigClip(JSON.parse(readFileSync(
    new URL(`../../../../assets/default/rig/clips/${name}.json`, import.meta.url), 'utf8',
  )));
}
const walk = fixture('clip_walk'); const sword = fixture('clip_sword_attack');

describe('clip player', () => {
  it('samples one-beat-two at 12 fps while projection storage stays stable', () => {
    const player = createClipPlayer(sword, { facingYawDeg: 0 }); const output = player.output;
    const poses = output.poses; const poseEntries = [...poses]; const poseAffines = poses.map(pose => pose.affine);
    const viewIndices = output.viewIndices; const mirrors = output.mirrors; const affines = output.affines;
    const depths = output.depths; const weaponAffine = output.weaponAffine; const positions = player.projection.positions;
    player.update(1 / 60); expect(player.frame).toBe(0); player.update(1 / 60); expect(player.frame).toBe(0);
    player.update(1 / 20); expect(player.frame).toBe(2);
    for (let index = 0; index < 20; index += 1) expect(player.update(1 / 60)).toBe(output);
    expect(player.output).toBe(output); expect(player.output.poses).toBe(poses); expect(player.output.affines).toBe(affines);
    expect(player.output.viewIndices).toBe(viewIndices); expect(player.output.mirrors).toBe(mirrors); expect(player.output.depths).toBe(depths);
    expect(player.output.weaponAffine).toBe(weaponAffine); expect(player.projection.positions).toBe(positions);
    poseEntries.forEach((pose, index) => { expect(player.output.poses[index]).toBe(pose); expect(pose.affine).toBe(poseAffines[index]); });
    expect(player.projectionAllocations).toBe(0);
  });

  it('fires hit/end only when crossed and never synthesizes events on stop', () => {
    const callback = vi.fn(); const player = createClipPlayer(sword, { facingYawDeg: 0, onEvent: callback });
    for (let index = 0; index < 140; index += 1) player.update(1 / 60);
    expect(callback.mock.calls.map(([event]) => event)).toEqual(['hit', 'end']);
    const cancelled = vi.fn(); const second = createClipPlayer(sword, { facingYawDeg: 0, onEvent: cancelled });
    second.update(.2); second.stop(); second.update(CLIP_CROSSFADE_SECONDS); expect(cancelled).not.toHaveBeenCalled();
    expect(second.phase).toBe('stopped');
  });

  it('does not jump upward when cancelled during the fade-in', () => {
    const player = createClipPlayer(sword, { facingYawDeg: 0 }); player.update(.04);
    const before = player.blend; player.stop(); expect(player.blend).toBeCloseTo(before, 8);
    player.update(.04); expect(player.blend).toBeLessThan(before);
  });

  it.each([.8, 1.4])('keeps the fade-in at 160 ms when playback rate is %s', rate => {
    const player = createClipPlayer(walk, { facingYawDeg: 0, speedMps: .78 * rate });
    player.update(CLIP_CROSSFADE_SECONDS / 2); expect(player.blend).toBeCloseTo(.5, 8);
    player.update(CLIP_CROSSFADE_SECONDS / 2); expect(player.blend).toBe(1);
  });

  it('fires looping end once at every crossed boundary', () => {
    const callback = vi.fn(); const player = createClipPlayer(walk, { facingYawDeg: 0, movement: false, onEvent: callback });
    player.update(3.5); expect(callback.mock.calls.map(([event]) => event)).toEqual(['end', 'end']);
  });

  it('uses the declared duration for every looping end boundary', () => {
    const callback = vi.fn();
    const player = createClipPlayer(walk, { facingYawDeg: 0, movement: false, onEvent: callback });
    player.update(walk.durationMs / 1_000);
    player.update(walk.durationMs / 1_000);
    expect(callback.mock.calls.map(([event]) => event)).toEqual(['end', 'end']);
  });

  it.each(['clip_run', 'clip_punch_jab'])('fires %s end at its declared duration boundary', name => {
    const clip = fixture(name); const callback = vi.fn();
    const player = createClipPlayer(clip, { facingYawDeg: 0, movement: false, onEvent: callback });
    player.update(clip.durationMs / 1_000);
    expect(callback.mock.calls.at(-1)?.[0]).toBe('end');
  });

  it('uses core/native movement rate only inside the fixed range', () => {
    expect(createClipPlayer(walk, { facingYawDeg: 0, speedMps: .78 }).rate).toBe(1);
    expect(createClipPlayer(walk, { facingYawDeg: 0, speedMps: .624 }).fallbackToGait).toBe(false);
    expect(createClipPlayer(walk, { facingYawDeg: 0, speedMps: 1.092 }).fallbackToGait).toBe(false);
    expect(createClipPlayer(walk, { facingYawDeg: 0, speedMps: .62 }).fallbackToGait).toBe(true);
    expect(createClipPlayer(walk, { facingYawDeg: 0, speedMps: 1.1 }).fallbackToGait).toBe(true);
    expect(createClipPlayer(walk, { facingYawDeg: 0, speedMps: .78, rate: 9 }).rate).toBe(1);
  });

  it('crossfades to gait when a moving clip leaves the supported rate band', () => {
    const player = createClipPlayer(walk, { facingYawDeg: 0, speedMps: .78 });
    player.update(.2); player.setSpeedMps(.2);
    expect(player.phase).toBe('fading-out'); expect(player.blend).toBe(1);
    player.update(CLIP_CROSSFADE_SECONDS); expect(player.phase).toBe('stopped');
  });

  it('clamps yaw assistance to both the clip hint and thirty degrees', () => {
    expect(createClipPlayer(sword, { facingYawDeg: 10, yawAssistMaxDeg: 90 }).facingYawDeg).toBe(40);
    expect(createClipPlayer(sword, { facingYawDeg: 10, yawAssistMaxDeg: -90 }).facingYawDeg).toBe(-20);
  });

  it('mirrors a near-hand clip when its main hand starts on the far side', () => {
    const normal = createClipPlayer(sword, { facingYawDeg: 0, nearHandWeapon: false });
    const corrected = createClipPlayer(sword, { facingYawDeg: 0, nearHandWeapon: true });
    expect(isClipMainHandFar(sword, normal.projection)).toBe(true); expect(corrected.mirrored).toBe(true);
    expect(isClipMainHandFar(sword, corrected.projection)).toBe(false);
    const generation = corrected.projectionGeneration; corrected.setFacingYawDeg(90); corrected.update(0);
    expect(corrected.mirrored).toBe(false); expect(corrected.projectionGeneration).toBe(generation + 1);
  });

  it('updates near-hand mirroring as the main hand crosses the torso plane', () => {
    const player = createClipPlayer(sword, { facingYawDeg: 0, nearHandWeapon: true });
    expect(player.mirrored).toBe(true); player.update(.6);
    expect(player.mirrored).toBe(false);
    expect(isClipMainHandFar(sword, player.projection)).toBe(false);
  });
});
