import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 44100;

function createWavBuffer(samples, sampleRate = SAMPLE_RATE) {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    // Clamp to -1.0 .. 1.0
    const s = Math.max(-1, Math.min(1, samples[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.floor(int16), offset);
    offset += 2;
  }

  return buffer;
}

// -------------------------------------------------------------
// Sound Synthesis Generators (Physical & Subtractive Modeling)
// -------------------------------------------------------------

// 1. 剑招：剑气破空轻啸 (Sword Swing / Whoosh)
function genSwordSwing() {
  const duration = 0.22;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(numSamples);

  let noiseState = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / numSamples; // 0 to 1
    // Gaussian-like envelope peaking at 40%
    const env = Math.exp(-Math.pow((t - 0.4) / 0.18, 2));

    // Frequency sweep: 2200Hz down to 400Hz
    const freq = 400 + 1800 * Math.pow(1 - t, 1.8);
    // Blade whistle sine
    const whistle = Math.sin(2 * Math.PI * freq * (i / SAMPLE_RATE)) * 0.35;

    // Filtered noise for air cut
    const white = Math.random() * 2 - 1;
    noiseState = noiseState * 0.82 + white * 0.18;

    out[i] = (noiseState * 0.65 + whistle) * env;
  }
  return out;
}

// 2. 剑招：双剑格挡清脆金铁鸣响 (Sword Clash / Metallic Ring)
function genSwordClash() {
  const duration = 1.1;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(numSamples);

  // Inharmonic steel blade modes
  const modes = [
    { f: 1250, d: 0.8, a: 0.35 },
    { f: 2340, d: 0.6, a: 0.3 },
    { f: 3820, d: 0.45, a: 0.25 },
    { f: 5410, d: 0.3, a: 0.18 },
    { f: 7890, d: 0.15, a: 0.12 }
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Initial impact transient (first 10ms)
    let impact = 0;
    if (t < 0.012) {
      const impEnv = 1 - t / 0.012;
      impact = (Math.random() * 2 - 1) * impEnv * 0.7;
    }

    let ring = 0;
    for (const m of modes) {
      // Subtle beating / modulation
      const mod = 1 + 0.02 * Math.sin(2 * Math.PI * 5.2 * t);
      ring += Math.sin(2 * Math.PI * m.f * t) * Math.exp(-t / m.d) * m.a * mod;
    }

    out[i] = impact + ring;
  }
  return out;
}

// 3. 剑招：剑尖破甲点刺 (Sword Pierce / Stab)
function genSwordPierce() {
  const duration = 0.28;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Fast whoosh
    let whoosh = 0;
    if (t < 0.08) {
      whoosh = (Math.random() * 2 - 1) * (1 - t / 0.08) * 0.4;
    }
    // Sharp puncture click at 0.06s
    let pierce = 0;
    if (t >= 0.05 && t < 0.25) {
      const dt = t - 0.05;
      const env = Math.exp(-dt / 0.04);
      const click = Math.sin(2 * Math.PI * 3200 * dt) * 0.5;
      const thud = Math.sin(2 * Math.PI * 95 * dt) * 0.6;
      pierce = (click + thud) * env;
    }
    out[i] = whoosh + pierce;
  }
  return out;
}

// 4. 刀劈：沉重单刀破风挥砍 (Saber Heavy Swing)
function genSaberSlash() {
  const duration = 0.32;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(numSamples);

  let noiseState = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / numSamples;
    const env = Math.exp(-Math.pow((t - 0.45) / 0.22, 2));

    // Lower pitch sweep: 900Hz down to 110Hz
    const freq = 110 + 790 * Math.pow(1 - t, 1.4);
    const bladeBody = Math.sin(2 * Math.PI * freq * (i / SAMPLE_RATE)) * 0.45;

    const white = Math.random() * 2 - 1;
    noiseState = noiseState * 0.88 + white * 0.12;

    out[i] = (noiseState * 0.7 + bladeBody) * env;
  }
  return out;
}

// 5. 刀劈：重刀劈斩中靶/入肉打击 (Saber Cleave / Flesh Impact)
function genSaberCleave() {
  const duration = 0.45;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Low frequency punch (80Hz dropping to 40Hz)
    const punchEnv = Math.exp(-t / 0.08);
    const punch = Math.sin(2 * Math.PI * (80 - 40 * t) * t) * punchEnv * 0.7;

    // Slicing crunch transient (filtered noise burst in first 70ms)
    let slice = 0;
    if (t < 0.07) {
      const sliceEnv = Math.exp(-t / 0.025);
      slice = (Math.random() * 2 - 1) * sliceEnv * 0.6;
    }

    out[i] = punch + slice;
  }
  return out;
}

// 6. 暗器：金钱镖/飞蝗石脱手破空尖啸 (Concealed Dart Throw)
function genDartThrow() {
  const duration = 0.25;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / numSamples;
    const env = Math.exp(-Math.pow((t - 0.35) / 0.2, 2));

    // Fast high whistling pitch sweep 4200Hz down to 1400Hz
    const freq = 1400 + 2800 * Math.pow(1 - t, 2.5);
    const whistle = Math.sin(2 * Math.PI * freq * (i / SAMPLE_RATE)) * 0.6;
    const hiss = (Math.random() * 2 - 1) * 0.25;

    out[i] = (whistle + hiss) * env;
  }
  return out;
}

// 7. 暗器：暗器钉入木质/石壁 (Dart Hit Impact)
function genDartHit() {
  const duration = 0.35;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Sharp click
    const clickEnv = Math.exp(-t / 0.005);
    const click = (Math.random() * 2 - 1) * clickEnv * 0.7;

    // Wood/target body thud (180Hz)
    const thudEnv = Math.exp(-t / 0.04);
    const thud = Math.sin(2 * Math.PI * 180 * t) * thudEnv * 0.5;

    // Steel dart quivering twang (high vibrating ping at 2100Hz with tremolo)
    const twangEnv = Math.exp(-t / 0.18);
    const trem = 1 + 0.4 * Math.sin(2 * Math.PI * 35 * t);
    const twang = Math.sin(2 * Math.PI * 2100 * t) * twangEnv * 0.35 * trem;

    out[i] = click + thud + twang;
  }
  return out;
}

// 8. 喝药：拔塞声与咕咚饮下灵药 (Drink Medicine / Healing Gulp)
function genDrinkPotion() {
  const duration = 0.95;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // 1) Cork pop at t = 0.05
    let cork = 0;
    if (t >= 0.04 && t < 0.12) {
      const dt = t - 0.04;
      const popFreq = 220 + 750 * Math.pow(dt / 0.08, 0.5);
      const popEnv = Math.exp(-dt / 0.025);
      cork = Math.sin(2 * Math.PI * popFreq * dt) * popEnv * 0.65;
    }

    // 2) Gulp 1 at t = 0.28
    let gulp1 = 0;
    if (t >= 0.25 && t < 0.45) {
      const dt = t - 0.25;
      const gFreq = 340 - 160 * Math.sin(Math.PI * dt / 0.2);
      const gEnv = Math.sin(Math.PI * dt / 0.2);
      gulp1 = Math.sin(2 * Math.PI * gFreq * dt) * gEnv * 0.55;
    }

    // 3) Gulp 2 at t = 0.52
    let gulp2 = 0;
    if (t >= 0.48 && t < 0.70) {
      const dt = t - 0.48;
      const gFreq = 380 - 180 * Math.sin(Math.PI * dt / 0.22);
      const gEnv = Math.sin(Math.PI * dt / 0.22);
      gulp2 = Math.sin(2 * Math.PI * gFreq * dt) * gEnv * 0.55;
    }

    // 4) Spiritual recovery chime at t = 0.70
    let chime = 0;
    if (t >= 0.65) {
      const dt = t - 0.65;
      const chimeEnv = Math.exp(-dt / 0.18);
      chime = (
        Math.sin(2 * Math.PI * 1046.5 * dt) * 0.2 + // C6
        Math.sin(2 * Math.PI * 1318.5 * dt) * 0.15 + // E6
        Math.sin(2 * Math.PI * 1567.98 * dt) * 0.15   // G6
      ) * chimeEnv;
    }

    out[i] = cork + gulp1 + gulp2 + chime;
  }
  return out;
}

// 9. 吃饭：竹筷轻碰瓷碗与进食爽脆声 (Eating / Dining)
function genEatingFood() {
  const duration = 0.85;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // 1) Chopstick taps bowl (t = 0.05, t = 0.18)
    let taps = 0;
    for (const tapT of [0.04, 0.16]) {
      if (t >= tapT && t < tapT + 0.08) {
        const dt = t - tapT;
        const env = Math.exp(-dt / 0.018);
        const ring = Math.sin(2 * Math.PI * 3420 * dt) * 0.35 + Math.sin(2 * Math.PI * 5140 * dt) * 0.2;
        const click = (Math.random() * 2 - 1) * Math.exp(-dt / 0.003) * 0.3;
        taps += (ring + click) * env;
      }
    }

    // 2) Chewing crunches (t = 0.35, t = 0.55, t = 0.70)
    let crunches = 0;
    for (const crunchT of [0.32, 0.48, 0.65]) {
      if (t >= crunchT && t < crunchT + 0.12) {
        const dt = t - crunchT;
        const cEnv = Math.sin(Math.PI * dt / 0.12);
        // Granular filtered noise burst
        const grain = (Math.random() * 2 - 1) * (Math.sin(2 * Math.PI * 1200 * dt) * 0.5 + 0.5);
        crunches += grain * cEnv * 0.45;
      }
    }

    out[i] = taps + crunches;
  }
  return out;
}

// -------------------------------------------------------------
// Generator Suite & Exporter
// -------------------------------------------------------------

const SFX_DEFINITIONS = [
  { name: 'sfx_sword_swing_01.wav', fn: genSwordSwing, desc: '剑招破空轻啸' },
  { name: 'sfx_sword_clash_01.wav', fn: genSwordClash, desc: '双剑格挡清脆金铁相交' },
  { name: 'sfx_sword_pierce_01.wav', fn: genSwordPierce, desc: '剑尖突刺破甲' },
  { name: 'sfx_saber_slash_01.wav', fn: genSaberSlash, desc: '厚重单刀劈空' },
  { name: 'sfx_saber_cleave_01.wav', fn: genSaberCleave, desc: '沉重力劈肉体打击' },
  { name: 'sfx_dart_throw_01.wav', fn: genDartThrow, desc: '暗器脱手破空尖啸' },
  { name: 'sfx_dart_hit_01.wav', fn: genDartHit, desc: '暗器钉入木质石壁' },
  { name: 'sfx_drink_potion_01.wav', fn: genDrinkPotion, desc: '拔开药塞咕咚饮药回甘' },
  { name: 'sfx_eating_food_01.wav', fn: genEatingFood, desc: '筷击瓷碗咀嚼进食' }
];

export function generateAllSfx(targetDirs) {
  for (const dir of targetDirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const results = [];
  for (const sfx of SFX_DEFINITIONS) {
    const samples = sfx.fn();
    const wavBuffer = createWavBuffer(samples);

    for (const dir of targetDirs) {
      const filePath = path.join(dir, sfx.name);
      fs.writeFileSync(filePath, wavBuffer);
    }

    results.push({
      file: sfx.name,
      desc: sfx.desc,
      size: wavBuffer.length,
      duration: (samples.length / SAMPLE_RATE).toFixed(2) + 's'
    });
  }

  return results;
}

async function main() {
  const dirs = [
    path.resolve('assets/sfx'),
    path.resolve('apps/game/public/assets/sfx')
  ];

  console.log('Generating procedural martial arts & life sound effects...');
  const res = generateAllSfx(dirs);
  console.log(`Generated ${res.length} SFX files:`);
  for (const r of res) {
    console.log(`  - ${r.file} (${r.duration}, ${r.size} bytes): ${r.desc}`);
  }
}

main().catch(console.error);
