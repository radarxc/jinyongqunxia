export type TimeOfDayLut = 'night' | 'dawn' | 'day' | 'dusk';
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}
export interface TimeOfDayFrame {
  hours: number;
  elevationDeg: number;
  lightIntensity: number;
  hemiIntensity: number;
  lampIntensity: number;
  dayPhase: number;
  sunAzimuthOffsetDeg: number;
  lutFrom: TimeOfDayLut;
  lutTo: TimeOfDayLut;
  lutMix: number;
  readonly lightColor: RgbColor;
  readonly skyColor: RgbColor;
  readonly groundColor: RgbColor;
  readonly fogColor: RgbColor;
}
interface Keyframe {
  readonly hour: number;
  readonly elevationDeg: number;
  readonly lightColor: number;
  readonly lightIntensity: number;
  readonly skyColor: number;
  readonly groundColor: number;
  readonly hemiIntensity: number;
  readonly fogColor: number;
  readonly lut: TimeOfDayLut;
  readonly lampIntensity: number;
}

export const TIME_OF_DAY_KEYFRAMES = [
  {
    hour: 0,
    elevationDeg: 40,
    lightColor: 0x8fa3c8,
    lightIntensity: 0.25,
    skyColor: 0x2e3a55,
    groundColor: 0x1c2230,
    hemiIntensity: 0.35,
    fogColor: 0x2a3140,
    lut: 'night',
    lampIntensity: 1,
  },
  {
    hour: 4.5,
    elevationDeg: 15,
    lightColor: 0xa7b4cf,
    lightIntensity: 0.2,
    skyColor: 0x3a4560,
    groundColor: 0x22283a,
    hemiIntensity: 0.35,
    fogColor: 0x39415a,
    lut: 'night',
    lampIntensity: 1,
  },
  {
    hour: 6,
    elevationDeg: 6,
    lightColor: 0xf2b38a,
    lightIntensity: 0.55,
    skyColor: 0xc9c2d8,
    groundColor: 0x6f6a66,
    hemiIntensity: 0.45,
    fogColor: 0xe8d9cc,
    lut: 'dawn',
    lampIntensity: 0.5,
  },
  {
    hour: 8,
    elevationDeg: 30,
    lightColor: 0xffe9c8,
    lightIntensity: 0.9,
    skyColor: 0xdde6ec,
    groundColor: 0x8c857b,
    hemiIntensity: 0.55,
    fogColor: 0xefe6d2,
    lut: 'day',
    lampIntensity: 0,
  },
  {
    hour: 12,
    elevationDeg: 60,
    lightColor: 0xfff6e6,
    lightIntensity: 1,
    skyColor: 0xe6eef2,
    groundColor: 0x958d80,
    hemiIntensity: 0.6,
    fogColor: 0xefe6d2,
    lut: 'day',
    lampIntensity: 0,
  },
  {
    hour: 16,
    elevationDeg: 30,
    lightColor: 0xffe2b8,
    lightIntensity: 0.9,
    skyColor: 0xe3e3e0,
    groundColor: 0x8f8676,
    hemiIntensity: 0.55,
    fogColor: 0xefe3cc,
    lut: 'day',
    lampIntensity: 0,
  },
  {
    hour: 18,
    elevationDeg: 8,
    lightColor: 0xf09a62,
    lightIntensity: 0.6,
    skyColor: 0xd8b9a8,
    groundColor: 0x6a5a50,
    hemiIntensity: 0.45,
    fogColor: 0xe6c9a8,
    lut: 'dusk',
    lampIntensity: 0.5,
  },
  {
    hour: 20,
    elevationDeg: 25,
    lightColor: 0x9fb0d0,
    lightIntensity: 0.3,
    skyColor: 0x384460,
    groundColor: 0x20263a,
    hemiIntensity: 0.38,
    fogColor: 0x323a50,
    lut: 'night',
    lampIntensity: 1,
  },
] as const satisfies readonly Keyframe[];

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const srgbToLinear = (value: number): number => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};
const linearToSrgb = (value: number): number => {
  const channel = clamp01(value);
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
};
const mixScalar = (left: number, right: number, amount: number): number =>
  left + (right - left) * amount;

function interpolateOklab(left: number, right: number, amount: number, out: RgbColor): void {
  if (amount === 0) {
    out.r = ((left >> 16) & 255) / 255;
    out.g = ((left >> 8) & 255) / 255;
    out.b = (left & 255) / 255;
    return;
  }
  const lr = srgbToLinear((left >> 16) & 255),
    lg = srgbToLinear((left >> 8) & 255),
    lb = srgbToLinear(left & 255);
  const rr = srgbToLinear((right >> 16) & 255),
    rg = srgbToLinear((right >> 8) & 255),
    rb = srgbToLinear(right & 255);
  const ll = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const lm = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const ls = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const rl = Math.cbrt(0.4122214708 * rr + 0.5363325363 * rg + 0.0514459929 * rb);
  const rm = Math.cbrt(0.2119034982 * rr + 0.6806995451 * rg + 0.1073969566 * rb);
  const rs = Math.cbrt(0.0883024619 * rr + 0.2817188376 * rg + 0.6299787005 * rb);
  const l =
    (0.2104542553 * ll + 0.793617785 * lm - 0.0040720468 * ls) * (1 - amount) +
    (0.2104542553 * rl + 0.793617785 * rm - 0.0040720468 * rs) * amount;
  const a =
    (1.9779984951 * ll - 2.428592205 * lm + 0.4505937099 * ls) * (1 - amount) +
    (1.9779984951 * rl - 2.428592205 * rm + 0.4505937099 * rs) * amount;
  const b =
    (0.0259040371 * ll + 0.7827717662 * lm - 0.808675766 * ls) * (1 - amount) +
    (0.0259040371 * rl + 0.7827717662 * rm - 0.808675766 * rs) * amount;
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  out.r = linearToSrgb(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3);
  out.g = linearToSrgb(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3);
  out.b = linearToSrgb(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3);
}

export function createTimeOfDayFrame(): TimeOfDayFrame {
  return {
    hours: 0,
    elevationDeg: 0,
    lightIntensity: 0,
    hemiIntensity: 0,
    lampIntensity: 0,
    dayPhase: 0,
    sunAzimuthOffsetDeg: 110,
    lutFrom: 'night',
    lutTo: 'night',
    lutMix: 0,
    lightColor: { r: 0, g: 0, b: 0 },
    skyColor: { r: 0, g: 0, b: 0 },
    groundColor: { r: 0, g: 0, b: 0 },
    fogColor: { r: 0, g: 0, b: 0 },
  };
}

export function sunAzimuthOffsetDeg(dayPhase: number): number {
  return 80 + 30 * Math.cos(Math.PI * clamp01(dayPhase));
}

export function sunAzimuthDeg(cameraYawDeg: number, dayPhase: number): number {
  return (((cameraYawDeg + sunAzimuthOffsetDeg(dayPhase)) % 360) + 360) % 360;
}

/** Evaluates into caller-owned storage so a render loop can remain allocation-free. */
export function evaluateTimeOfDay(hours: number, out: TimeOfDayFrame): TimeOfDayFrame {
  if (!Number.isFinite(hours)) throw new RangeError('TIME_OF_DAY');
  const normalized = ((hours % 24) + 24) % 24;
  let index = TIME_OF_DAY_KEYFRAMES.length - 1;
  for (let candidate = 0; candidate < TIME_OF_DAY_KEYFRAMES.length; candidate += 1) {
    if (TIME_OF_DAY_KEYFRAMES[candidate]!.hour <= normalized) index = candidate;
    else break;
  }
  const left = TIME_OF_DAY_KEYFRAMES[index]!;
  const right = TIME_OF_DAY_KEYFRAMES[(index + 1) % TIME_OF_DAY_KEYFRAMES.length]!;
  const rightHour = index === TIME_OF_DAY_KEYFRAMES.length - 1 ? right.hour + 24 : right.hour;
  const sampleHour = normalized < left.hour ? normalized + 24 : normalized;
  const amount = (sampleHour - left.hour) / (rightHour - left.hour);
  out.hours = normalized;
  out.elevationDeg = mixScalar(left.elevationDeg, right.elevationDeg, amount);
  out.lightIntensity = mixScalar(left.lightIntensity, right.lightIntensity, amount);
  out.hemiIntensity = mixScalar(left.hemiIntensity, right.hemiIntensity, amount);
  out.lampIntensity = mixScalar(left.lampIntensity, right.lampIntensity, amount);
  out.dayPhase = normalized <= 6 ? 0 : normalized >= 18 ? 1 : (normalized - 6) / 12;
  out.sunAzimuthOffsetDeg = sunAzimuthOffsetDeg(out.dayPhase);
  out.lutFrom = left.lut;
  out.lutTo = right.lut;
  out.lutMix = amount;
  interpolateOklab(left.lightColor, right.lightColor, amount, out.lightColor);
  interpolateOklab(left.skyColor, right.skyColor, amount, out.skyColor);
  interpolateOklab(left.groundColor, right.groundColor, amount, out.groundColor);
  interpolateOklab(left.fogColor, right.fogColor, amount, out.fogColor);
  return out;
}
