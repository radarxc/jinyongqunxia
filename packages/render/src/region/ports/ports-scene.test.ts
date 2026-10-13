// @vitest-environment happy-dom
import { Group, type Camera, type Raycaster } from 'three';
import { describe, expect, it, vi } from 'vitest';
import type * as Three from 'three';
import type { ActorPort, BuildingLayer, BuildingLayerPort } from './types';
import type { DressupEquipSpec } from '../../dressup/types';
const seen = vi.hoisted(() => ({ scene: undefined as Three.Scene | undefined }));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof Three>();
  class HeadlessRenderer {
    readonly info = { render: { calls: 0, triangles: 0 }, reset() {} };
    setClearColor() {} setPixelRatio() {} setSize() {}
    render(scene: Three.Scene) { seen.scene = scene; } dispose() {} forceContextLoss() {}
    getContext() { return { isContextLost: () => false }; }
  }
  return { ...actual, WebGLRenderer: HeadlessRenderer };
});

import { createRegionScene } from '../scene';
import { regionDynamicFixture, regionStaticFixture } from '../test-fixture';

describe('replaceable region ports', () => {
  it('calls custom building and actor ports without creating placeholder instances', async () => {
    const calls: string[] = []; const object = new Group(); const building: BuildingLayer = {
      object, stats: { drawCalls: 0, triangles: 0, cells: 0, visibleCells: 0, units: 0, interiors: 0,
        pendingCells: 0, geometryBytes: 0, textureBytes: 0, lastCellMs: 0 },
      setCutaway: (index,mode) => calls.push(`cut:${index}:${mode}`),
      setCameraYaw: yaw => calls.push(`yaw:${yaw}`), setFocusOcclusion() {},
      update: () => calls.push('building:update'), pick: () => { calls.push('building:pick'); return 0; },
      restore: () => calls.push('building:restore'),
      dispose: () => calls.push('building:dispose'), ready: async () => {}, occludes: () => false,
      measure: () => ({ bounds: [0,0,0,1,1,1], widthM: 1, depthM: 1, heightM: 1 }),
    };
    const buildingPort: BuildingLayerPort = { create: vi.fn(async () => building) };
    const actor: ActorPort = { stats: { actors: 0, drawCalls: 0, triangles: 0, templates: 0, failures: 0 },
      spawn: id => calls.push(`spawn:${id}`), despawn() {}, setPose: id => calls.push(`pose:${id}`),
      setEquipment: (id,eq) => calls.push(`equipment:${id}:${eq.specs.length}`),
      update: (_dt: number, _camera: Camera) => calls.push('actor:update'),
      pick: (_ray: Raycaster) => { calls.push('actor:pick'); return 'custom'; },
      restore: () => calls.push('actor:restore'),
      dispose: () => calls.push('actor:dispose') };
    const spec = { kind: 'prop', id: 'sword', url: '/sword.glb', fit: {} } as DressupEquipSpec;
    const npc = { id:'guard',class:'NpcSpawn',npcId:'npc_guard',q:1,r:0,h:2,
      cells:[{q:1,r:0,h:2}],facing:0 } as const;
    const region = await createRegionScene(document.createElement('canvas'), regionStaticFixture(2,1,[npc]),
      { projection: regionDynamicFixture(), buildingPort, actorPort: actor,
        playerEquipment: { specs: [spec] }, npcEquipment: { npc_guard: { specs: [spec] } },
        npcLooks: { npc_guard: { template:'tpl_f_medium',heightM:1.66,outfit:'guard',seed:1,role:'npc' } } });
    expect(buildingPort.create).toHaveBeenCalledOnce(); expect(calls).toContain('spawn:player');
    region.pickActor(0,0,{ left:0,top:0,width:1,height:1 } as DOMRect);
    region.pickBuilding(0,0,{ left:0,top:0,width:1,height:1 } as DOMRect);
    region.setInsideBuilding(0); await region.camera.rotate(1, true); region.render(16);
    region.setInsideBuilding(null); region.dispose();
    expect(calls).toEqual(expect.arrayContaining(['cut:0:2','cut:0:0','building:update','actor:update',
      'equipment:player:1','equipment:npc_guard:1','yaw:135','actor:pick','building:pick',
      'building:dispose','actor:dispose']));
    expect(object.name).not.toContain('placeholder');
  });

  it('builds a non-empty legal default building layer from region Building objects', async () => {
    const building = { id:'inn', class:'Building', q:0, r:0, h:0, cells:[{q:0,r:0,h:0}],
      footprint:{q:0,r:0,width:2,height:2}, interiorRect:{q:0,r:0,width:1,height:1},
      roofGroup:'inn', cutawayWalls:[] } as const;
    const region = await createRegionScene(document.createElement('canvas'),
      regionStaticFixture(3,3,[building]), { projection: regionDynamicFixture() });
    region.resize(1280,720); region.render(0,true);
    const root = seen.scene!.getObjectByName('placeholder-building-layer')!;
    const debug = root.userData['placeholder'] as { states:Array<{mode:number;wall:number}>;
      vignette:{visible:boolean} };
    const center = { x:0,y:0,visible:false }; region.project({q:0,r:0},1,center);
    expect(region.pickBuilding(center.x,center.y,{left:0,top:0,width:1280,height:720} as DOMRect)).toBe('inn');
    region.setInsideBuilding(0); region.render(16,true);
    expect(root.children.filter(child => child.name.startsWith('placeholder-building-'))).toHaveLength(2);
    expect(debug.states[0]).toMatchObject({ mode:2, wall:1 }); expect(debug.vignette.visible).toBe(true);
    region.setInsideBuilding(null); region.render(16,true);
    expect(debug.states[0]).toMatchObject({ mode:0, wall:0 }); expect(debug.vignette.visible).toBe(false);
    region.dispose();
  });
});
