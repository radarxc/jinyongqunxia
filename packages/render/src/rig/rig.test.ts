import { describe, expect, it } from 'vitest';
import { Scene } from 'three';
import { RigBatch } from './batch';
import { createRigCharacter, zOrderForPart } from './character';
import { createRigInstanceBuffer } from './instance-buffer';
import { loadRigSet, validateRigManifest } from './manifest';
import { createPlaceholderRigManifest } from './placeholder';

const FULL_EQUIPMENT = {
  mainHand: { id: 'eq_demo_blades', hands: 'pair' as const }, body: 'eq_demo_armor',
  head: 'eq_demo_head', hands: 'eq_demo_gloves', shoulder: 'eq_demo_shoulders',
  cape: 'eq_demo_cape', waist: 'eq_demo_belt', feet: 'eq_demo_boots',
};

describe('rig headless smoke', () => {
  it('loads placeholders, creates a full character and shares two batch passes', async () => {
    const rigSet = await loadRigSet(createPlaceholderRigManifest());
    const character = createRigCharacter(rigSet, FULL_EQUIPMENT, 7);
    character.setMotion(6, 4, 'heavy'); character.setStepFps(0); character.update(1 / 60);
    const batch = new RigBatch(rigSet, 20); batch.add(character); batch.sync();
    const scene = new Scene(); batch.addTo(scene);
    expect(rigSet.placeholderCount).toBe(39); expect(rigSet.cells.size).toBe(44);
    expect(character.activeInstanceCount).toBe(20);
    expect(batch.stats).toMatchObject({ characters: 1, activeInstances: 20, submittedInstances: 20, drawCalls: 2 });
    expect(batch.coreMesh).toBe(batch.softMesh); expect(scene.children).toEqual([batch.coreMesh]);
    expect(batch.coreMesh.material).toHaveLength(2);
    await character.setEquipment({ cape: 'eq_demo_cape' }); batch.sync();
    expect(character.activeInstanceCount).toBe(17);
    batch.remove(character); expect(batch.stats.submittedInstances).toBe(0);
    batch.dispose(); character.dispose(); rigSet.dispose();
  });

  it('snaps cape safely after a background-sized delta and validates manifests', async () => {
    const manifest = createPlaceholderRigManifest(); validateRigManifest(manifest);
    const rigSet = await loadRigSet(manifest); const character = createRigCharacter(rigSet, { cape: 'eq_cape' }, 2);
    character.setMotion(1, 1.4, 'light'); character.update(.2); character.update(1);
    expect(Number.isFinite(character.capeAngle)).toBe(true); expect(Math.abs(character.capeAngle)).toBeLessThanOrEqual(28);
    expect(() => character.setMotion(8 as 0, 1, 'medium')).toThrowError('RIG_DIR8');
    expect(() => validateRigManifest({ ...manifest, parts: manifest.parts.slice(1) })).toThrowError(/part-count/);
    character.dispose(); rigSet.dispose();
  });

  it('keeps anatomical left limbs in front in every source view and swaps on mirror', () => {
    const manifest = createPlaceholderRigManifest();
    expect(manifest.nearSide).toBe('L');
    for (const view of manifest.views) {
      for (const segment of ['upper_arm', 'forearm', 'hand', 'thigh', 'shin', 'foot'] as const) {
        expect(zOrderForPart(view, `${segment}_L`, false)).toBeGreaterThan(zOrderForPart(view, `${segment}_R`, false));
        expect(zOrderForPart(view, `${segment}_R`, true)).toBeGreaterThan(zOrderForPart(view, `${segment}_L`, true));
      }
    }
    expect(() => validateRigManifest({ ...manifest, nearSide: 'R' as 'L' })).toThrowError(/near-side/);
  });

  it('accepts formal fallback joints and rejects unsafe joint provenance', () => {
    const manifest = createPlaceholderRigManifest();
    for (const [view, sign] of [['front34', 1], ['back34', -1], ['side', 0]] as const) {
      const torso = manifest.parts.find((part) => part.view === view && part.id === 'torso');
      const pelvis = manifest.parts.find((part) => part.view === view && part.id === 'pelvis_skirt');
      const shoulderDelta = (torso?.childJoint['shoulder_L']?.[0] ?? NaN) - (torso?.childJoint['shoulder_R']?.[0] ?? NaN);
      const hipDelta = (pelvis?.childJoint['hip_L']?.[0] ?? NaN) - (pelvis?.childJoint['hip_R']?.[0] ?? NaN);
      expect(Math.sign(shoulderDelta)).toBe(sign); expect(Math.sign(hipDelta)).toBe(sign);
    }
    const unsafeParts = manifest.parts.map((part, index) => index === 0 ? { ...part, jointSource: '../escape.yaml' } : part);
    expect(() => validateRigManifest({ ...manifest, parts: unsafeParts })).toThrowError(/joint-source/);
    expect(() => validateRigManifest({ ...manifest, placeholder: false })).not.toThrow();
  });

  it('places runtime hips from manifest keypoints instead of a fixed width', async () => {
    const base = createPlaceholderRigManifest();
    const parts = base.parts.map((part) => part.id === 'pelvis_skirt'
      ? {
          ...part,
          childJoint: {
            ...part.childJoint,
            hip_L: [part.pivot[0] + 8, part.pivot[1]] as const,
            hip_R: [part.pivot[0] - 8, part.pivot[1]] as const,
          },
        }
      : part);
    const rigSet = await loadRigSet({ ...base, parts });
    const character = createRigCharacter(rigSet);
    const buffer = createRigInstanceBuffer(20); character.writeInstances(buffer, 0);
    const affine = buffer.affine2d.array as Float32Array;
    const leftX = affine[10 * 6 + 2]; const rightX = affine[11 * 6 + 2];
    expect(leftX).toBeCloseTo(8 / 256, 5);
    expect(rightX).toBeCloseTo(-8 / 256, 5);
    character.dispose(); rigSet.dispose();
  });

  it('mirrors asymmetric joints and pose values as one anatomical chain', async () => {
    const base = createPlaceholderRigManifest();
    const parts = base.parts.map((part) => part.view === 'side' && part.id === 'torso' ? {
      ...part, childJoint: { ...part.childJoint, shoulder_L: [111, 24] as const, shoulder_R: [31, 41] as const },
    } : part.view === 'side' && part.id === 'pelvis_skirt' ? {
      ...part, childJoint: { ...part.childJoint, hip_L: [109, 13] as const, hip_R: [49, 3] as const },
    } : part);
    const rigSet = await loadRigSet({ ...base, parts });
    const equipment = { mainHand: { id: 'eq_asymmetric_pair', hands: 'pair' as const } };
    const pose = { hipL: -17, hipR: 29, kneeL: 37, kneeR: 53, ankleL: -7, ankleR: 13,
      shoulderL: 11, shoulderR: -23, elbowL: 31, elbowR: 47, bodyY: 0, torsoRoll: 0, torsoLean: 0 };
    const capture = (mirrored: boolean) => {
      const character = createRigCharacter(rigSet, equipment);
      character.setMotion(mirrored ? 6 : 2, 0, 'medium'); character.update(.2);
      Object.assign((character as unknown as { pose: typeof pose }).pose, pose); character.setPosition(0, 0, 0);
      const buffer = createRigInstanceBuffer(20); character.writeInstances(buffer, 0); character.dispose();
      return { affine: (buffer.affine2d.array as Float32Array).slice(), sort: (buffer.sortTint.array as Uint16Array).slice() };
    };
    const normal = capture(false); const mirrored = capture(true);
    for (const [normalIndex, mirrorIndex] of [[4, 5], [5, 4], [6, 7], [7, 6], [8, 9], [9, 8],
      [10, 11], [11, 10], [12, 13], [13, 12], [14, 15], [15, 14], [16, 17], [17, 16]] as const) {
      const signs = [1, -1, -1, -1, 1, 1];
      for (let field = 0; field < 6; field += 1) expect(mirrored.affine[mirrorIndex * 6 + field])
        .toBeCloseTo((normal.affine[normalIndex * 6 + field] ?? 0) * (signs[field] ?? 1), 5);
    }
    expect(mirrored.sort[5 * 4 + 1]).toBeGreaterThan(mirrored.sort[4 * 4 + 1] ?? Infinity);
    rigSet.dispose();
  });
});
