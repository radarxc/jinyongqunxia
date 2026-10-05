export const ISO_CAMERA_SPEC = {
  version: 1,
  projection: 'orthographic',
  pitchDeg: 30,
  yawDeg: 45,
  yawPresetsDeg: [45, 135, 225, 315],
  allowRotation: true,
  rotationMs: 350,
  eyeDistanceM: 250,
  nearM: 1,
  farM: 500,
  grid: {
    topology: 'hex',
    orientation: 'pointy',
    coordinates: 'axial-qr',
    outerRadiusM: 0.6666666667,
    rowStepM: 1,
    neighborStepM: 1.1547005384,
    chunkSlots: [32, 32],
  },
  heightStepM: 1,
  axes: { x: 'world east', y: 'up', z: 'world south' },
  zoom: {
    unit: 'cssPxPerMeterDiamondWidth',
    presets: [48, 64, 80, 96],
    min: 40,
    max: 112,
    exploreDefault: 80,
    battleDefault: 64,
    cinematicMax: 128,
  },
  dirIndex: ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'],
  dirFormula:
    'relative = ((facingYawDeg-cameraYawDeg)%360+360)%360; d = floor(relative/45+0.5)%8; d=0 faces the camera',
  mirrorPairs: [
    [1, 7],
    [2, 6],
    [3, 5],
  ],
  battleFacingCount: 6,
  battleFacingStepDeg: 60,
  rigViewPolicy: 'front34-back34-side-plus-mirror',
  sunAzimuthRelDeg: 80,
  sunAzimuthSwingDeg: 30,
} as const;

export type YawStep = -1 | 1;
export interface CameraBackVector {
  x: number;
  y: number;
  z: number;
}

const DEG = Math.PI / 180;

export function normalizeYaw(yawDeg: number): number {
  return ((yawDeg % 360) + 360) % 360;
}

export function cameraBack(
  yawDeg: number,
  out: CameraBackVector = { x: 0, y: 0, z: 0 },
): CameraBackVector {
  const pitch = ISO_CAMERA_SPEC.pitchDeg * DEG;
  const yaw = yawDeg * DEG;
  const horizontal = Math.cos(pitch);
  out.x = horizontal * Math.cos(yaw);
  out.y = Math.sin(pitch);
  out.z = horizontal * Math.sin(yaw);
  return out;
}

export function easeInOutCubic(value: number): number {
  return value < 0.5 ? 4 * value * value * value : 1 - (-2 * value + 2) ** 3 / 2;
}

/** Frame time is injected by the caller; update() mutates only scalar fields. */
export class IsoCameraRotation {
  private yaw: number = ISO_CAMERA_SPEC.yawDeg;
  private fromYaw: number = this.yaw;
  private targetYaw: number = this.yaw;
  private startMs = 0;
  private started = false;
  private active = false;
  private completion: Promise<void> = Promise.resolve();
  private resolveCompletion: (() => void) | undefined;

  get yawDeg(): number {
    return this.yaw;
  }
  get rotating(): boolean {
    return this.active;
  }
  rotate(step: YawStep, reducedMotion = false): Promise<void> {
    if (this.active) return this.completion;
    this.fromYaw = this.yaw;
    this.targetYaw = this.yaw + step * 90;
    if (reducedMotion) {
      this.yaw = normalizeYaw(this.targetYaw);
      return Promise.resolve();
    }
    this.active = true;
    this.started = false;
    this.completion = new Promise<void>((resolve) => {
      this.resolveCompletion = resolve;
    });
    return this.completion;
  }

  update(timeMs: number): boolean {
    if (!this.active) return false;
    if (!this.started) {
      this.startMs = timeMs;
      this.started = true;
    }
    const elapsed = Math.max(0, timeMs - this.startMs);
    const progress = Math.min(1, elapsed / ISO_CAMERA_SPEC.rotationMs);
    this.yaw = this.fromYaw + (this.targetYaw - this.fromYaw) * easeInOutCubic(progress);
    if (progress === 1) {
      this.yaw = normalizeYaw(this.targetYaw);
      this.active = false;
      const resolve = this.resolveCompletion;
      this.resolveCompletion = undefined;
      resolve?.();
    }
    return true;
  }
}
