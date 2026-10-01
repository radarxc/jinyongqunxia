import { describe, expect, it } from 'vitest';
import { Scene } from 'three';
import { RigBatch } from './batch';
import { createRigCharacter } from './character';
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
});
