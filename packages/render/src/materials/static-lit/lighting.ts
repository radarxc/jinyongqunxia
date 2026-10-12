import { Color, SRGBColorSpace, Vector3, type IUniform } from 'three';
import { createTimeOfDayFrame, evaluateTimeOfDay } from '../../lighting/time-of-day';

export interface IsoLitUniforms {
  readonly uSunDirection: IUniform<Vector3>;
  readonly uSunColor: IUniform<Color>;
  readonly uSunIntensity: IUniform<number>;
  readonly uSkyColor: IUniform<Color>;
  readonly uGroundColor: IUniform<Color>;
  readonly uHemiIntensity: IUniform<number>;
  readonly uLampIntensity: IUniform<number>;
  readonly uTimeOfDay: IUniform<number>;
}

const DEG = Math.PI / 180;
/** tech/16 §7: the town hemisphere term is fixed; only sky colour follows the hour. */
export const STATIC_LIT_HEMI_INTENSITY = 0.5;
const frame = createTimeOfDayFrame();
export const ISO_LIT_UNIFORMS: IsoLitUniforms = {
  uSunDirection: { value: new Vector3(0.5, 0.7, 0.5).normalize() },
  uSunColor: { value: new Color(0xfff6e6) },
  uSunIntensity: { value: 1 },
  uSkyColor: { value: new Color(0xe6eef2) },
  uGroundColor: { value: new Color(0x6b5a45) },
  uHemiIntensity: { value: STATIC_LIT_HEMI_INTENSITY },
  uLampIntensity: { value: 0 },
  uTimeOfDay: { value: 12 },
};

/** Mutates the one shared uniform graph; every static-lit material sees the same values. */
export function setStaticLitTimeOfDay(hours: number, cameraYawDeg = 45): void {
  evaluateTimeOfDay(hours, frame);
  const azimuth = (cameraYawDeg + frame.sunAzimuthOffsetDeg) * DEG;
  const elevation = frame.elevationDeg * DEG;
  const horizontal = Math.cos(elevation);
  ISO_LIT_UNIFORMS.uSunDirection.value
    .set(horizontal * Math.cos(azimuth), Math.sin(elevation), horizontal * Math.sin(azimuth))
    .normalize();
  ISO_LIT_UNIFORMS.uSunColor.value.setRGB(
    frame.lightColor.r,
    frame.lightColor.g,
    frame.lightColor.b,
    SRGBColorSpace,
  );
  ISO_LIT_UNIFORMS.uSkyColor.value.setRGB(
    frame.skyColor.r,
    frame.skyColor.g,
    frame.skyColor.b,
    SRGBColorSpace,
  );
  ISO_LIT_UNIFORMS.uSunIntensity.value = frame.lightIntensity;
  ISO_LIT_UNIFORMS.uHemiIntensity.value = STATIC_LIT_HEMI_INTENSITY;
  ISO_LIT_UNIFORMS.uLampIntensity.value = frame.lampIntensity;
  ISO_LIT_UNIFORMS.uTimeOfDay.value = frame.hours;
}

/** Reorients the shared camera-relative sun without changing the current world time. */
export function setStaticLitCameraYaw(cameraYawDeg: number): void {
  setStaticLitTimeOfDay(ISO_LIT_UNIFORMS.uTimeOfDay.value, cameraYawDeg);
}
