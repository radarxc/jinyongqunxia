import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearDressupSkeletonFrameCache, createDressupSkeletonFrameAccess,
  loadDressupSkeletonFrame } from './skeleton-frame';
import type { DressupSkeletonFrame } from './types';

function frame(): DressupSkeletonFrame {
  return {
    schema: 'tianshu-dressup-skeleton.v1', source: { file: 'body.glb', sha256: 'abc' },
    unit: 'mu', heightMu: 1, defaultHeightM: 1.65, mPerMu: 1.65,
    joints: ['mixamorig:Hips'], parents: [-1], bindWorld: { 'mixamorig:Hips': [] },
    restPose: { armAngleDeg: 25, forearmAngleDeg: 25 },
    measures: { headWidthMu: .1, headDepthMu: .1, headCircumferenceMu: .3,
      headTopMu: [0, 1, 0], shoulderSkinWidthMu: .2, chestWidthMu: .2,
      waistWidthMu: .15, hipWidthMu: .18, handLengthMu: { L: .1, R: .1 },
      handThicknessMu: { L: .02, R: .02 }, footLengthMu: .12 },
    neckRing: { localYMu: .01, centerMu: [0, .8, 0], radiusMu: { x: .03, z: .03 },
      samples: 0, profile: [], lipOffsetMu: .004, sha256: 'ring' },
    skullProfile: { file: 'skull.json', stepMu: .005, sha256: 'skull' },
    sockets: { gripR: { bone: 'mixamorig:Hips', pos: [0, 0, 0], quat: [0, 0, 0, 1] } },
    regions: { ids: { head: 0, torso: 2, foot: 31 }, jointToRegion: {}, file: 'r.npy' },
    fingerPose: { fist: { 'mixamorig:RightHandIndex1': [0, .5, 0, .866] } },
  };
}

afterEach(() => clearDressupSkeletonFrameCache());

describe('dressup skeleton frame', () => {
  it('caches one JSON request and retries a rejected request', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(frame())));
    const first = loadDressupSkeletonFrame('/frame.json', fetcher);
    expect(loadDressupSkeletonFrame('/frame.json', fetcher)).toBe(first);
    await expect(first).resolves.toMatchObject({ heightMu: 1 });
    expect(fetcher).toHaveBeenCalledOnce();

    const rejected = vi.fn(async () => new Response('', { status: 503 }));
    await expect(loadDressupSkeletonFrame('/bad.json', rejected)).rejects.toThrow('DRESSUP_FRAME_HTTP_503');
    await expect(loadDressupSkeletonFrame('/bad.json', rejected)).rejects.toThrow();
    expect(rejected).toHaveBeenCalledTimes(2);
  });

  it('resolves sockets, unsigned region masks, and sanitized finger names', () => {
    const access = createDressupSkeletonFrameAccess(frame());
    expect(access.getSocket('gripR').bone).toBe('mixamorig:Hips');
    expect(access.getRegionMask(['head', 'torso', 'foot'])).toBe(0x80000005);
    expect(access.getRegionName(2)).toBe('torso');
    expect(access.getFingerPose('mixamorig:RightHandIndex1')).toEqual([0, .5, 0, .866]);
    expect(() => access.getSocket('missing')).toThrow('DRESSUP_SOCKET_UNKNOWN');
    expect(() => access.getRegionMask(['missing'])).toThrow('DRESSUP_REGION_UNKNOWN');
  });

  it('rejects region ids outside the uint32 shader mask', () => {
    const invalid = frame();
    expect(() => createDressupSkeletonFrameAccess({ ...invalid,
      regions: { ...invalid.regions, ids: { overflow: 32 } } })).toThrow('DRESSUP_REGION_LIMIT');
  });
});
