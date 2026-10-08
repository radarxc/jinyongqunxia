import { PropertyBinding } from 'three';
import { DressupError, type DressupQuat, type DressupSkeletonFrame,
  type DressupSocketFrame } from './types';

export interface DressupSkeletonFrameAccess {
  readonly frame: DressupSkeletonFrame;
  getSocket(name: string): DressupSocketFrame;
  getRegionBit(name: string): number;
  getRegionName(bit: number): string | undefined;
  getRegionMask(names: readonly string[]): number;
  getFingerPose(boneName: string): DressupQuat | undefined;
}

const frameCache = new Map<string, Promise<DressupSkeletonFrame>>();

export function loadDressupSkeletonFrame(
  url: string,
  fetcher: typeof fetch = fetch,
): Promise<DressupSkeletonFrame> {
  let pending = frameCache.get(url);
  if (!pending) {
    pending = fetcher(url).then(async response => {
      if (!response.ok) throw new Error(`DRESSUP_FRAME_HTTP_${response.status}`);
      return await response.json() as DressupSkeletonFrame;
    });
    frameCache.set(url, pending);
    void pending.catch(() => { if (frameCache.get(url) === pending) frameCache.delete(url); });
  }
  return pending;
}

/** Test and hot-reload hook; production actors otherwise retain the immutable JSON promise. */
export function clearDressupSkeletonFrameCache(): void {
  frameCache.clear();
}

export function createDressupSkeletonFrameAccess(
  frame: DressupSkeletonFrame,
): DressupSkeletonFrameAccess {
  const names: (string | undefined)[] = [];
  for (const [name, bit] of Object.entries(frame.regions.ids)) {
    if (!Number.isInteger(bit) || bit < 0 || bit >= 32) throw new Error(DressupError.RegionLimit);
    names[bit] = name;
  }
  const fist = new Map<string, DressupQuat>();
  for (const [name, pose] of Object.entries(frame.fingerPose.fist)) {
    fist.set(PropertyBinding.sanitizeNodeName(name), pose);
  }
  const getRegionBit = (name: string): number => {
    const bit = frame.regions.ids[name];
    if (bit === undefined) throw new Error(`${DressupError.RegionUnknown}:${name}`);
    return bit;
  };
  return {
    frame,
    getSocket(name) {
      const socket = frame.sockets[name];
      if (!socket) throw new Error(`${DressupError.SocketUnknown}:${name}`);
      return socket;
    },
    getRegionBit,
    getRegionName: bit => names[bit],
    getRegionMask(regionNames) {
      let mask = 0;
      for (const name of regionNames) mask = (mask | (1 << getRegionBit(name))) >>> 0;
      return mask;
    },
    getFingerPose: boneName => fist.get(PropertyBinding.sanitizeNodeName(boneName)),
  };
}
