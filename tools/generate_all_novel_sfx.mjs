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
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);  // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.floor(int16), offset);
    offset += 2;
  }

  return buffer;
}

// Lowpass / Bandpass recursive filter helpers
function biquadBandpass(samples, centerFreq, q) {
  const w0 = 2 * Math.PI * centerFreq / SAMPLE_RATE;
  const alpha = Math.sin(w0) / (2 * q);
  const b0 = alpha;
  const b1 = 0;
  const b2 = -alpha;
  const a0 = 1 + alpha;
  const a1 = -2 * Math.cos(w0);
  const a2 = 1 - alpha;

  const out = new Float32Array(samples.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x0 = samples[i];
    const y0 = (b0 / a0) * x0 + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
    out[i] = y0;
    x2 = x1; x1 = x0;
    y2 = y1; y1 = y0;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 00: 越女剑 (ch00)
// -------------------------------------------------------------
// 翠竹棒破空轻点 (bamboo stick whoosh + whip-snap)
function genCh00YuenvBamboo() {
  const duration = 0.28;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.exp(-Math.pow((t - 0.35) / 0.14, 2));
    const freq = 650 + 2400 * Math.pow(1 - t, 2.2);
    const bambooSine = Math.sin(2 * Math.PI * freq * (i / SAMPLE_RATE)) * 0.45;
    const rush = (Math.random() * 2 - 1) * 0.35;
    let snap = 0;
    if (t > 0.45 && t < 0.52) {
      const st = (t - 0.45) / 0.07;
      snap = Math.sin(2 * Math.PI * 4800 * (i / SAMPLE_RATE)) * (1 - st) * 0.6;
    }
    out[i] = (bambooSine + rush + snap) * env;
  }
  return out;
}

// 白猿灵捷纵跃清啸
function genCh00BaiyuanJump() {
  const duration = 0.45;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Chirp whistle rising and falling (ape shriek)
    const fApe = 900 + 1600 * Math.sin(Math.PI * t);
    const ape = Math.sin(2 * Math.PI * fApe * (i / SAMPLE_RATE) + Math.sin(2 * Math.PI * 45 * t) * 1.5) * 0.4;
    const whoosh = (Math.random() * 2 - 1) * 0.3 * Math.exp(-Math.pow((t - 0.4) / 0.2, 2));
    out[i] = (ape + whoosh) * env;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 01: 天龙八部 (ch01)
// -------------------------------------------------------------
// 六脉神剑：无形气剑破空激射 (Laser-like piercing pure qi beam)
function genCh01LiumaiLaser() {
  const duration = 0.38;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.pow(1 - t, 1.2) * Math.min(1, t * 25);
    // High piercing sweep from 4500Hz down to 900Hz with FM harmonics
    const fBase = 900 + 3600 * Math.exp(-t * 8);
    const mod = Math.sin(2 * Math.PI * 180 * t) * 2.5;
    const qiBeam = Math.sin(2 * Math.PI * fBase * (i / SAMPLE_RATE) + mod) * 0.6;
    const overtone = Math.sin(2 * Math.PI * (fBase * 2.5) * (i / SAMPLE_RATE)) * 0.25;
    const hiss = (Math.random() * 2 - 1) * 0.2 * Math.exp(-t * 12);
    out[i] = (qiBeam + overtone + hiss) * env;
  }
  return out;
}

// 北冥神功：真气漩涡倒吸
function genCh01BeimingAbsorb() {
  const duration = 0.75;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t) * 0.8;
    // Deep sub vortex swirling up from 60Hz to 280Hz with amplitude pulsation
    const fVortex = 60 + 220 * Math.pow(t, 1.5);
    const sub = Math.sin(2 * Math.PI * fVortex * (i / SAMPLE_RATE)) * 0.55;
    const swirlMod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 8 * t);
    const rush = (Math.random() * 2 - 1) * 0.4 * swirlMod;
    out[i] = (sub + rush) * env;
  }
  return out;
}

// 凌波微步：飘渺踏虚步法
function genCh01LingboSteps() {
  const duration = 0.55;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    // Two swift graceful ethereal light steps
    for (const stepT of [0.06, 0.28]) {
      if (t >= stepT && t < stepT + 0.18) {
        const dt = t - stepT;
        const env = Math.sin(Math.PI * dt / 0.18);
        const glassChime = (Math.sin(2 * Math.PI * 1840 * dt) + Math.sin(2 * Math.PI * 2760 * dt) * 0.5) * 0.35;
        const airyBreeze = (Math.random() * 2 - 1) * 0.25 * Math.exp(-dt / 0.05);
        s += (glassChime + airyBreeze) * env;
      }
    }
    out[i] = s;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 02: 射雕英雄传 (ch02)
// -------------------------------------------------------------
// 降龙十八掌：龙吟大震与重击轰鸣
function genCh02XianglongDragon() {
  const duration = 0.95;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    // Sub-bass impact shockwave (50Hz - 20Hz)
    const shockEnv = Math.exp(-t * 4.5);
    const sub = Math.sin(2 * Math.PI * (75 - 45 * t) * (i / SAMPLE_RATE)) * shockEnv * 0.65;

    // Dragon roar growl: heavy FM synthesis in low-mids (120Hz modulated by 35Hz)
    const roarEnv = Math.sin(Math.PI * Math.min(1, t * 1.6)) * Math.exp(-t * 2.2);
    const mod = Math.sin(2 * Math.PI * 38 * t) * 6;
    const roar = Math.sin(2 * Math.PI * (160 + 60 * Math.sin(2 * Math.PI * 3 * t)) * (i / SAMPLE_RATE) + mod) * roarEnv * 0.55;

    // Thunderous crack at onset
    const crack = (Math.random() * 2 - 1) * Math.exp(-t * 28) * 0.5;

    out[i] = (sub + roar + crack);
  }
  return out;
}

// 打狗棒法：绿竹杖连环击打挑绊
function genCh02DagouStick() {
  const duration = 0.5;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    // Three rapid rhythmic taps (t = 0.04, 0.18, 0.32)
    for (const [idx, tapT] of [0.04, 0.18, 0.32].entries()) {
      if (t >= tapT && t < tapT + 0.12) {
        const dt = t - tapT;
        const env = Math.exp(-dt / 0.025);
        // Woodblock resonance modes
        const f0 = 980 + idx * 240;
        const wood = (Math.sin(2 * Math.PI * f0 * dt) * 0.5 + Math.sin(2 * Math.PI * (f0 * 2.1) * dt) * 0.25) * env;
        const click = (Math.random() * 2 - 1) * Math.exp(-dt / 0.002) * 0.4;
        s += (wood + click);
      }
    }
    out[i] = s;
  }
  return out;
}

// 弹指神通：飞石破空破甲
function genCh02TanzhiStone() {
  const duration = 0.35;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    // Finger flick pop + high pitch whizz
    let flick = 0;
    if (t < 0.08) {
      flick = Math.sin(2 * Math.PI * 650 * (i / SAMPLE_RATE)) * (1 - t / 0.08) * 0.6;
    }
    const whizzEnv = Math.exp(-Math.pow((t - 0.3) / 0.15, 2));
    const whizz = Math.sin(2 * Math.PI * (3400 - 1800 * t) * (i / SAMPLE_RATE)) * whizzEnv * 0.45;
    out[i] = flick + whizz;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 03: 神雕侠侣 (ch03)
// -------------------------------------------------------------
// 玄铁重剑：千钧破浪狂潮重斩
function genCh03XuantieHeavy() {
  const duration = 0.85;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    // Slow crushing windup whoosh + deep dark metallic cleavage
    const env = Math.exp(-Math.pow((t - 0.35) / 0.22, 2));
    const sweep = Math.sin(2 * Math.PI * (320 - 180 * t) * (i / SAMPLE_RATE)) * 0.5;
    const roar = (Math.random() * 2 - 1) * 0.45;
    let impact = 0;
    if (t > 0.32) {
      const it = (t - 0.32) / 0.53;
      const ironRing = Math.sin(2 * Math.PI * 480 * (i / SAMPLE_RATE)) * Math.exp(-it * 5) * 0.5;
      const bassSlam = Math.sin(2 * Math.PI * 65 * (i / SAMPLE_RATE)) * Math.exp(-it * 4) * 0.6;
      impact = ironRing + bassSlam;
    }
    out[i] = (sweep + roar) * env + impact;
  }
  return out;
}

// 黯然销魂掌：心神悲鸣内劲重震
function genCh03AnranPalm() {
  const duration = 0.9;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Melancholic harmonic resonance in minor third (220Hz & 261Hz) pulsing
    const pulse = 0.5 + 0.5 * Math.sin(2 * Math.PI * 5 * t);
    const qiTone = (Math.sin(2 * Math.PI * 196 * (i / SAMPLE_RATE)) * 0.4 +
                    Math.sin(2 * Math.PI * 233 * (i / SAMPLE_RATE)) * 0.35) * pulse;
    const rumble = Math.sin(2 * Math.PI * 55 * (i / SAMPLE_RATE)) * Math.exp(-t * 2.5) * 0.6;
    out[i] = (qiTone * env) + rumble;
  }
  return out;
}

// 玉蜂金针：细雨如丝极速破空
function genCh03YufengNeedle() {
  const duration = 0.32;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let needles = 0;
    // Multiphonic rapid needle darts
    for (const dt of [0.02, 0.05, 0.09, 0.14, 0.18]) {
      if (t >= dt && t < dt + 0.06) {
        const tau = t - dt;
        const nEnv = Math.exp(-tau / 0.015);
        const pitch = 5400 + Math.random() * 800;
        needles += Math.sin(2 * Math.PI * pitch * tau) * nEnv * 0.25;
      }
    }
    out[i] = needles;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 04: 倚天屠龙记 (ch04)
// -------------------------------------------------------------
// 倚天剑：寒芒出鞘龙吟
function genCh04YitianDraw() {
  const duration = 1.0;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // Friction scabbard scrape (first 0.15s)
    let scrape = 0;
    if (t < 0.18) {
      const sEnv = Math.sin(Math.PI * t / 0.18);
      scrape = (Math.random() * 2 - 1) * sEnv * 0.45;
    }
    // High pure metallic crystalline ring (F#6 1480Hz, 2960Hz, 4440Hz)
    const ringEnv = Math.exp(-t * 2.8);
    const ring = (Math.sin(2 * Math.PI * 1480 * t) * 0.4 +
                  Math.sin(2 * Math.PI * 2960 * t) * 0.3 +
                  Math.sin(2 * Math.PI * 5920 * t) * 0.15) * ringEnv;
    out[i] = scrape + ring;
  }
  return out;
}

// 屠龙宝刀：地动山摇开山破浪
function genCh04TulongQuake() {
  const duration = 0.85;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const impactEnv = Math.exp(-t * 3.5);
    const lowSlam = Math.sin(2 * Math.PI * (80 - 45 * t) * (i / SAMPLE_RATE)) * impactEnv * 0.7;
    const bronzeGong = Math.sin(2 * Math.PI * 340 * (i / SAMPLE_RATE)) * Math.exp(-t * 4.2) * 0.4;
    const dustNoise = (Math.random() * 2 - 1) * Math.exp(-t * 5) * 0.35;
    out[i] = lowSlam + bronzeGong + dustNoise;
  }
  return out;
}

// 太极拳剑：阴阳圆转化劲
function genCh04TaijiCircle() {
  const duration = 0.7;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Smooth harmonic rotation (sine glissando in circle)
    const rot = Math.sin(2 * Math.PI * 2 * t);
    const fCenter = 440 + 120 * rot;
    const s = Math.sin(2 * Math.PI * fCenter * (i / SAMPLE_RATE)) * 0.45;
    const air = (Math.random() * 2 - 1) * 0.2;
    out[i] = (s + air) * env;
  }
  return out;
}

// 乾坤大挪移：气劲牵引转挪
function genCh04QiankunShift() {
  const duration = 0.65;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Pitch bending up then snapping down
    const f = 250 + 750 * Math.sin(Math.PI * t);
    const tone = Math.sin(2 * Math.PI * f * (i / SAMPLE_RATE) + Math.sin(2 * Math.PI * 35 * t) * 2) * 0.5;
    out[i] = tone * env;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 05: 笑傲江湖 (ch05)
// -------------------------------------------------------------
// 独孤九剑：破万法连环格挡
function genCh05DuguParry() {
  const duration = 0.6;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    // Rapid twin metallic parries
    for (const [idx, pt] of [0.03, 0.22].entries()) {
      if (t >= pt && t < pt + 0.3) {
        const dt = t - pt;
        const env = Math.exp(-dt * 12);
        const fBlade = idx === 0 ? 2150 : 2650;
        const clink = (Math.sin(2 * Math.PI * fBlade * dt) * 0.5 + Math.sin(2 * Math.PI * (fBlade * 1.62) * dt) * 0.25) * env;
        s += clink;
      }
    }
    out[i] = s;
  }
  return out;
}

// 辟邪剑法：诡谲极速突刺
function genCh05BixieFast() {
  const duration = 0.35;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.exp(-Math.pow((t - 0.3) / 0.12, 2));
    // High ultra-fast piercing blade
    const f = 1800 + 3200 * (1 - t);
    const blade = Math.sin(2 * Math.PI * f * (i / SAMPLE_RATE)) * 0.55;
    const hiss = (Math.random() * 2 - 1) * 0.35;
    out[i] = (blade + hiss) * env;
  }
  return out;
}

// 吸星大法：丹田气海强力吸旋
function genCh05XixingWhirl() {
  const duration = 0.7;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Dark ominous hollow suction
    const swirl = Math.sin(2 * Math.PI * (110 + 90 * Math.sin(2 * Math.PI * 6 * t)) * (i / SAMPLE_RATE)) * 0.5;
    const noise = (Math.random() * 2 - 1) * 0.3;
    out[i] = (swirl + noise) * env;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 06: 侠客行 (ch06)
// -------------------------------------------------------------
// 白首太玄经：混沌神芒爆裂
function genCh06TaixuanBurst() {
  const duration = 0.85;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    // Divine energy surge + blast
    const blastEnv = Math.exp(-t * 3.8);
    const blast = Math.sin(2 * Math.PI * (120 - 70 * t) * (i / SAMPLE_RATE)) * blastEnv * 0.65;
    const holyShimmer = Math.sin(2 * Math.PI * 1150 * (i / SAMPLE_RATE)) * Math.sin(2 * Math.PI * 15 * t) * 0.35 * Math.exp(-t * 2);
    out[i] = blast + holyShimmer;
  }
  return out;
}

// 赏善罚恶令：铁木令掷地铜音
function genCh06TokenDrop() {
  const duration = 0.65;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 6);
    // Heavy bronze medal ringing (820Hz, 1340Hz)
    const bronze = (Math.sin(2 * Math.PI * 820 * t) * 0.5 + Math.sin(2 * Math.PI * 1340 * t) * 0.3) * env;
    const click = (Math.random() * 2 - 1) * Math.exp(-t / 0.005) * 0.45;
    out[i] = bronze + click;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 07: 碧血剑 (ch07)
// -------------------------------------------------------------
// 金蛇剑：蛇形蜿蜒剑气破空
function genCh07JinsheCurved() {
  const duration = 0.42;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Sinuous undulating pitch frequency
    const fSnake = 1100 + 600 * Math.sin(2 * Math.PI * 12 * t);
    const blade = Math.sin(2 * Math.PI * fSnake * (i / SAMPLE_RATE)) * 0.55;
    const hiss = (Math.random() * 2 - 1) * 0.3;
    out[i] = (blade + hiss) * env;
  }
  return out;
}

// 金蛇锥：连环攒射破甲
function genCh07JinsheCone() {
  const duration = 0.38;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    // Three micro cone darts
    for (const dt of [0.03, 0.11, 0.20]) {
      if (t >= dt && t < dt + 0.1) {
        const tau = t - dt;
        const env = Math.exp(-tau * 25);
        s += Math.sin(2 * Math.PI * 3600 * tau) * env * 0.35;
      }
    }
    out[i] = s;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 08: 鹿鼎记 (ch08)
// -------------------------------------------------------------
// 燧发火枪：火药轰鸣
function genCh08MusketFire() {
  const duration = 0.75;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    // Initial spark click
    let flint = 0;
    if (t < 0.02) flint = (Math.random() * 2 - 1) * (1 - t / 0.02) * 0.7;
    // Gunpowder explosion
    const blastEnv = Math.exp(-t * 4);
    const sub = Math.sin(2 * Math.PI * 55 * (i / SAMPLE_RATE)) * blastEnv * 0.6;
    const white = (Math.random() * 2 - 1) * blastEnv * 0.55;
    out[i] = flint + sub + white;
  }
  return out;
}

// 石灰粉：迎面撒出沙沙破风
function genCh08LimePowder() {
  const duration = 0.45;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.exp(-Math.pow((t - 0.3) / 0.18, 2));
    const powderNoise = (Math.random() * 2 - 1) * 0.55;
    out[i] = powderNoise * env;
  }
  return out;
}

// 骨骰在瓷碗中清脆滚动
function genCh08DiceRoll() {
  const duration = 0.6;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    // Series of ceramic clicks
    for (const dt of [0.03, 0.12, 0.22, 0.31, 0.39, 0.46]) {
      if (t >= dt && t < dt + 0.08) {
        const tau = t - dt;
        const env = Math.exp(-tau * 45);
        const ring = Math.sin(2 * Math.PI * 4200 * tau) * 0.4;
        const clack = (Math.random() * 2 - 1) * 0.3;
        s += (ring + clack) * env;
      }
    }
    out[i] = s;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 09: 书剑恩仇录 (ch09)
// -------------------------------------------------------------
// 百花错拳：错落连环刚柔拳风
function genCh09BaihuaPunch() {
  const duration = 0.55;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    // Three multi-angle punches
    for (const [idx, dt] of [0.04, 0.18, 0.34].entries()) {
      if (t >= dt && t < dt + 0.14) {
        const tau = t - dt;
        const env = Math.exp(-tau * 20);
        const fPunch = 180 - idx * 25;
        const punch = Math.sin(2 * Math.PI * fPunch * tau) * env * 0.5;
        const air = (Math.random() * 2 - 1) * env * 0.3;
        s += (punch + air);
      }
    }
    out[i] = s;
  }
  return out;
}

// 柔云剑术：连绵流云剑势
function genCh09RouyunSword() {
  const duration = 0.6;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Flowing smooth whistling steel
    const f = 850 + 400 * Math.sin(2 * Math.PI * 3 * t);
    const blade = Math.sin(2 * Math.PI * f * (i / SAMPLE_RATE)) * 0.45;
    const wind = (Math.random() * 2 - 1) * 0.25;
    out[i] = (blade + wind) * env;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 10: 连城诀 (ch10)
// -------------------------------------------------------------
// 血刀经：凶狠撩斩血光破空
function genCh10XuedaoSlash() {
  const duration = 0.45;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.exp(-Math.pow((t - 0.25) / 0.16, 2));
    // Upward pitch rip
    const f = 350 + 1400 * Math.pow(t, 2);
    const rip = Math.sin(2 * Math.PI * f * (i / SAMPLE_RATE)) * 0.55;
    const rustle = (Math.random() * 2 - 1) * 0.35;
    out[i] = (rip + rustle) * env;
  }
  return out;
}

// 神照经：起死回生真气回溯
function genCh10ShenzhaoRevive() {
  const duration = 0.9;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Warm pure harmonic bloom
    const h1 = Math.sin(2 * Math.PI * 261.6 * (i / SAMPLE_RATE)) * 0.4;
    const h2 = Math.sin(2 * Math.PI * 329.6 * (i / SAMPLE_RATE)) * 0.3;
    const h3 = Math.sin(2 * Math.PI * 392.0 * (i / SAMPLE_RATE)) * 0.25;
    out[i] = (h1 + h2 + h3) * env;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 11: 雪山飞狐 (ch11)
// -------------------------------------------------------------
// 胡家刀法：缠头裹脑凌厉刀花
function genCh11HujiaSaber() {
  const duration = 0.48;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Double circular saber swing
    const mod = Math.sin(2 * Math.PI * 8 * t);
    const fSaber = 450 + 350 * mod;
    const saber = Math.sin(2 * Math.PI * fSaber * (i / SAMPLE_RATE)) * 0.5;
    const air = (Math.random() * 2 - 1) * 0.3;
    out[i] = (saber + air) * env;
  }
  return out;
}

// 塞外暴风雪裹挟踏雪
function genCh11SnowWind() {
  const duration = 0.85;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Cold gusting wind noise + crunch
    const wind = (Math.random() * 2 - 1) * (0.3 + 0.2 * Math.sin(2 * Math.PI * 2 * t));
    let crunch = 0;
    if (t > 0.3 && t < 0.5) {
      crunch = (Math.random() * 2 - 1) * 0.4;
    }
    out[i] = (wind + crunch) * env;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 12: 飞狐外传 (ch12)
// -------------------------------------------------------------
// 苗家剑法：洗练严谨黄龙转身
function genCh12MiaojiaSword() {
  const duration = 0.4;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.exp(-Math.pow((t - 0.32) / 0.15, 2));
    const f = 1600 - 800 * t;
    const blade = Math.sin(2 * Math.PI * f * (i / SAMPLE_RATE)) * 0.55;
    const air = (Math.random() * 2 - 1) * 0.3;
    out[i] = (blade + air) * env;
  }
  return out;
}

// 霹雳雷火弹：剧烈炸裂
function genCh12ThunderBomb() {
  const duration = 0.9;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.exp(-t * 3.5);
    const sub = Math.sin(2 * Math.PI * 45 * (i / SAMPLE_RATE)) * env * 0.65;
    const blast = (Math.random() * 2 - 1) * env * 0.55;
    out[i] = sub + blast;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 13: 白马啸西风 (ch13)
// -------------------------------------------------------------
// 西域大漠黄沙狂风
function genCh13DesertWind() {
  const duration = 0.85;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // Sandstorm whistling gust
    const fWind = 380 + 120 * Math.sin(2 * Math.PI * 1.5 * t);
    const gust = Math.sin(2 * Math.PI * fWind * (i / SAMPLE_RATE)) * 0.35;
    const sandNoise = (Math.random() * 2 - 1) * 0.4;
    out[i] = (gust + sandNoise) * env;
  }
  return out;
}

// 白马长嘶高亢马鸣踏蹄
function genCh13HorseNeigh() {
  const duration = 0.95;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    // High vibrato horse whinny (FM modulated sine)
    const fNeigh = 1200 + 400 * Math.sin(2 * Math.PI * 18 * t) + 200 * Math.exp(-t * 2);
    const neigh = Math.sin(2 * Math.PI * fNeigh * (i / SAMPLE_RATE)) * 0.5;
    const air = (Math.random() * 2 - 1) * 0.25;
    out[i] = (neigh + air) * env;
  }
  return out;
}

// -------------------------------------------------------------
// Novel 14: 鸳鸯刀 (ch14)
// -------------------------------------------------------------
// 鸳鸯双刀：夫妻合璧清脆双斩
function genCh14DualSaber() {
  const duration = 0.45;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    for (const [idx, dt] of [0.03, 0.16].entries()) {
      if (t >= dt && t < dt + 0.15) {
        const tau = t - dt;
        const env = Math.exp(-tau * 18);
        const fBlade = idx === 0 ? 1420 : 1880;
        s += Math.sin(2 * Math.PI * fBlade * tau) * env * 0.45;
      }
    }
    out[i] = s;
  }
  return out;
}

// 仁者无敌：祥和真气震荡
function genCh14RenzheAura() {
  const duration = 0.85;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    const sub = Math.sin(2 * Math.PI * 98 * (i / SAMPLE_RATE)) * 0.5;
    const bell = Math.sin(2 * Math.PI * 587.3 * (i / SAMPLE_RATE)) * 0.35 * Math.exp(-t * 2);
    out[i] = (sub + bell) * env;
  }
  return out;
}

// -------------------------------------------------------------
// 通用战斗与生活系统音效 (Common Combat / Life / UI)
// -------------------------------------------------------------
// 拳掌击打
function genFistPunch() {
  const duration = 0.25;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.exp(-t * 12);
    const sub = Math.sin(2 * Math.PI * (140 - 80 * t) * (i / SAMPLE_RATE)) * env * 0.65;
    const meat = (Math.random() * 2 - 1) * env * 0.4;
    out[i] = sub + meat;
  }
  return out;
}

// 身法闪避
function genDodgeWhoosh() {
  const duration = 0.3;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.exp(-Math.pow((t - 0.4) / 0.16, 2));
    const whoosh = (Math.random() * 2 - 1) * 0.55;
    out[i] = whoosh * env;
  }
  return out;
}

// 会心一击破绽
function genCritStrike() {
  const duration = 0.45;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.exp(-t * 6);
    const ping = Math.sin(2 * Math.PI * 2800 * (i / SAMPLE_RATE)) * env * 0.5;
    const crack = (Math.random() * 2 - 1) * Math.exp(-t * 25) * 0.6;
    out[i] = ping + crack;
  }
  return out;
}

// 翻动秘籍书页
function genBookFlip() {
  const duration = 0.35;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = Math.sin(Math.PI * t);
    const rustle = (Math.random() * 2 - 1) * 0.45 * (Math.sin(2 * Math.PI * 40 * t) * 0.5 + 0.5);
    out[i] = rustle * env;
  }
  return out;
}

// 界面竹木清脆点击
function genUiClick() {
  const duration = 0.08;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 50);
    const wood = Math.sin(2 * Math.PI * 1650 * t) * env * 0.5;
    const click = (Math.random() * 2 - 1) * Math.exp(-t / 0.001) * 0.5;
    out[i] = wood + click;
  }
  return out;
}

// 基础原有 9 个 SFX
function genSwordSwing() {
  const duration = 0.22; const n = Math.floor(SAMPLE_RATE * duration); const out = new Float32Array(n);
  let noiseState = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n; const env = Math.exp(-Math.pow((t - 0.4) / 0.18, 2));
    const freq = 400 + 1800 * Math.pow(1 - t, 1.8);
    const whistle = Math.sin(2 * Math.PI * freq * (i / SAMPLE_RATE)) * 0.35;
    const white = Math.random() * 2 - 1; noiseState = noiseState * 0.82 + white * 0.18;
    out[i] = (noiseState * 0.65 + whistle) * env;
  }
  return out;
}

function genSwordClash() {
  const duration = 1.1; const n = Math.floor(SAMPLE_RATE * duration); const out = new Float32Array(n);
  const modes = [{ f: 1250, d: 0.8, a: 0.35 }, { f: 2340, d: 0.6, a: 0.3 }, { f: 3820, d: 0.45, a: 0.25 }, { f: 5410, d: 0.3, a: 0.18 }, { f: 7890, d: 0.15, a: 0.12 }];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let impact = 0;
    if (t < 0.012) { impact = (Math.random() * 2 - 1) * (1 - t / 0.012) * 0.7; }
    let ring = 0;
    for (const m of modes) ring += Math.sin(2 * Math.PI * m.f * t) * Math.exp(-t / m.d) * m.a;
    out[i] = impact + ring;
  }
  return out;
}

function genSwordPierce() {
  const duration = 0.28; const n = Math.floor(SAMPLE_RATE * duration); const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n; const env = Math.exp(-Math.pow((t - 0.2) / 0.14, 2));
    const scrape = (Math.random() * 2 - 1) * (1 - t) * 0.6;
    const tear = Math.sin(2 * Math.PI * (1600 - 1000 * t) * (i / SAMPLE_RATE)) * 0.45;
    out[i] = (scrape + tear) * env;
  }
  return out;
}

function genSaberSlash() {
  const duration = 0.32; const n = Math.floor(SAMPLE_RATE * duration); const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n; const env = Math.exp(-Math.pow((t - 0.35) / 0.2, 2));
    const lowWind = Math.sin(2 * Math.PI * (280 - 120 * t) * (i / SAMPLE_RATE)) * 0.55;
    const roar = (Math.random() * 2 - 1) * 0.45;
    out[i] = (lowWind + roar) * env;
  }
  return out;
}

function genSaberCleave() {
  const duration = 0.45; const n = Math.floor(SAMPLE_RATE * duration); const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n; const env = Math.exp(-t * 6);
    const thud = Math.sin(2 * Math.PI * 90 * (i / SAMPLE_RATE)) * env * 0.65;
    const rip = (Math.random() * 2 - 1) * env * 0.5;
    out[i] = thud + rip;
  }
  return out;
}

function genDartThrow() {
  const duration = 0.25; const n = Math.floor(SAMPLE_RATE * duration); const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n; const env = Math.exp(-Math.pow((t - 0.25) / 0.15, 2));
    const fWhistle = 2600 + 1800 * (1 - t);
    const whistle = Math.sin(2 * Math.PI * fWhistle * (i / SAMPLE_RATE)) * 0.6;
    out[i] = whistle * env;
  }
  return out;
}

function genDartHit() {
  const duration = 0.35; const n = Math.floor(SAMPLE_RATE * duration); const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE; const env = Math.exp(-t * 15);
    const ring = Math.sin(2 * Math.PI * 3200 * t) * env * 0.45;
    const woodThud = Math.sin(2 * Math.PI * 220 * t) * env * 0.55;
    const snap = (Math.random() * 2 - 1) * Math.exp(-t / 0.003) * 0.5;
    out[i] = ring + woodThud + snap;
  }
  return out;
}

function genDrinkPotion() {
  const duration = 0.95; const n = Math.floor(SAMPLE_RATE * duration); const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let cork = 0;
    if (t < 0.15) { const dt = t; cork = Math.sin(2 * Math.PI * (280 + 600 * dt) * dt) * Math.exp(-dt * 25) * 0.6; }
    let gulps = 0;
    for (const gulpT of [0.28, 0.58]) {
      if (t >= gulpT && t < gulpT + 0.18) {
        const dt = t - gulpT;
        const gEnv = Math.sin(Math.PI * dt / 0.18);
        const fGulp = 380 - 160 * (dt / 0.18);
        gulps += Math.sin(2 * Math.PI * fGulp * dt) * gEnv * 0.55;
      }
    }
    out[i] = cork + gulps;
  }
  return out;
}

function genEatingFood() {
  const duration = 0.85; const n = Math.floor(SAMPLE_RATE * duration); const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let taps = 0;
    for (const tapT of [0.03, 0.15]) {
      if (t >= tapT && t < tapT + 0.1) {
        const dt = t - tapT; const env = Math.exp(-dt * 30);
        taps += Math.sin(2 * Math.PI * 3420 * dt) * env * 0.4;
      }
    }
    let crunches = 0;
    for (const crunchT of [0.32, 0.48, 0.65]) {
      if (t >= crunchT && t < crunchT + 0.12) {
        const dt = t - crunchT; const cEnv = Math.sin(Math.PI * dt / 0.12);
        crunches += (Math.random() * 2 - 1) * cEnv * 0.45;
      }
    }
    out[i] = taps + crunches;
  }
  return out;
}

// -------------------------------------------------------------
// Master SFX Catalog
// -------------------------------------------------------------
export const ALL_SFX_DEFINITIONS = [
  // 越女剑 (ch00)
  { name: 'sfx_ch00_yuenv_bamboo.wav', fn: genCh00YuenvBamboo, cue: 'ch00_yuenv_bamboo', book: '越女剑', novelId: 'ch00', desc: '越女竹棒破空轻点' },
  { name: 'sfx_ch00_baiyuan_jump.wav', fn: genCh00BaiyuanJump, cue: 'ch00_baiyuan_jump', book: '越女剑', novelId: 'ch00', desc: '白猿灵捷纵跃清啸' },

  // 天龙八部 (ch01)
  { name: 'sfx_ch01_liumai_laser.wav', fn: genCh01LiumaiLaser, cue: 'ch01_liumai_laser', book: '天龙八部', novelId: 'ch01', desc: '六脉神剑无形气剑激射' },
  { name: 'sfx_ch01_beiming_absorb.wav', fn: genCh01BeimingAbsorb, cue: 'ch01_beiming_absorb', book: '天龙八部', novelId: 'ch01', desc: '北冥神功真气漩涡倒吸' },
  { name: 'sfx_ch01_lingbo_steps.wav', fn: genCh01LingboSteps, cue: 'ch01_lingbo_steps', book: '天龙八部', novelId: 'ch01', desc: '凌波微步飘渺踏虚步法' },

  // 射雕英雄传 (ch02)
  { name: 'sfx_ch02_xianglong_dragon.wav', fn: genCh02XianglongDragon, cue: 'ch02_xianglong_dragon', book: '射雕英雄传', novelId: 'ch02', desc: '降龙十八掌龙啸震天' },
  { name: 'sfx_ch02_dagou_stick.wav', fn: genCh02DagouStick, cue: 'ch02_dagou_stick', book: '射雕英雄传', novelId: 'ch02', desc: '打狗棒法绿竹杖连击' },
  { name: 'sfx_ch02_tanzhi_stone.wav', fn: genCh02TanzhiStone, cue: 'ch02_tanzhi_stone', book: '射雕英雄传', novelId: 'ch02', desc: '弹指神通飞石破甲' },

  // 神雕侠侣 (ch03)
  { name: 'sfx_ch03_xuantie_heavy.wav', fn: genCh03XuantieHeavy, cue: 'ch03_xuantie_heavy', book: '神雕侠侣', novelId: 'ch03', desc: '玄铁重剑千钧狂潮斩' },
  { name: 'sfx_ch03_anran_palm.wav', fn: genCh03AnranPalm, cue: 'ch03_anran_palm', book: '神雕侠侣', novelId: 'ch03', desc: '黯然销魂掌心神悲鸣震' },
  { name: 'sfx_ch03_yufeng_needle.wav', fn: genCh03YufengNeedle, cue: 'ch03_yufeng_needle', book: '神雕侠侣', novelId: 'ch03', desc: '玉蜂金针细雨如丝破空' },

  // 倚天屠龙记 (ch04)
  { name: 'sfx_ch04_yitian_draw.wav', fn: genCh04YitianDraw, cue: 'ch04_yitian_draw', book: '倚天屠龙记', novelId: 'ch04', desc: '倚天宝剑龙吟出鞘' },
  { name: 'sfx_ch04_tulong_quake.wav', fn: genCh04TulongQuake, cue: 'ch04_tulong_quake', book: '倚天屠龙记', novelId: 'ch04', desc: '屠龙宝刀开山斩浪' },
  { name: 'sfx_ch04_taiji_circle.wav', fn: genCh04TaijiCircle, cue: 'ch04_taiji_circle', book: '倚天屠龙记', novelId: 'ch04', desc: '太极阴阳圆转化劲' },
  { name: 'sfx_ch04_qiankun_shift.wav', fn: genCh04QiankunShift, cue: 'ch04_qiankun_shift', book: '倚天屠龙记', novelId: 'ch04', desc: '乾坤大挪移气劲牵引' },

  // 笑傲江湖 (ch05)
  { name: 'sfx_ch05_dugu_parry.wav', fn: genCh05DuguParry, cue: 'ch05_dugu_parry', book: '笑傲江湖', novelId: 'ch05', desc: '独孤九剑料敌先机破招' },
  { name: 'sfx_ch05_bixie_fast.wav', fn: genCh05BixieFast, cue: 'ch05_bixie_fast', book: '笑傲江湖', novelId: 'ch05', desc: '辟邪剑法诡谲极速突刺' },
  { name: 'sfx_ch05_xixing_whirl.wav', fn: genCh05XixingWhirl, cue: 'ch05_xixing_whirl', book: '笑傲江湖', novelId: 'ch05', desc: '吸星大法丹田气海吸旋' },

  // 侠客行 (ch06)
  { name: 'sfx_ch06_taixuan_burst.wav', fn: genCh06TaixuanBurst, cue: 'ch06_taixuan_burst', book: '侠客行', novelId: 'ch06', desc: '白首太玄经混沌神芒爆裂' },
  { name: 'sfx_ch06_token_drop.wav', fn: genCh06TokenDrop, cue: 'ch06_token_drop', book: '侠客行', novelId: 'ch06', desc: '赏善罚恶令掷地铜音' },

  // 碧血剑 (ch07)
  { name: 'sfx_ch07_jinshe_curved.wav', fn: genCh07JinsheCurved, cue: 'ch07_jinshe_curved', book: '碧血剑', novelId: 'ch07', desc: '金蛇剑蛇形蜿蜒破空' },
  { name: 'sfx_ch07_jinshe_cone.wav', fn: genCh07JinsheCone, cue: 'ch07_jinshe_cone', book: '碧血剑', novelId: 'ch07', desc: '金蛇锥连环攒射破甲' },

  // 鹿鼎记 (ch08)
  { name: 'sfx_ch08_musket_fire.wav', fn: genCh08MusketFire, cue: 'ch08_musket_fire', book: '鹿鼎记', novelId: 'ch08', desc: '燧发火枪火药轰鸣' },
  { name: 'sfx_ch08_lime_powder.wav', fn: genCh08LimePowder, cue: 'ch08_lime_powder', book: '鹿鼎记', novelId: 'ch08', desc: '石灰粉迎面撒出沙沙破风' },
  { name: 'sfx_ch08_dice_roll.wav', fn: genCh08DiceRoll, cue: 'ch08_dice_roll', book: '鹿鼎记', novelId: 'ch08', desc: '骨骰在瓷碗中清脆滚动' },

  // 书剑恩仇录 (ch09)
  { name: 'sfx_ch09_baihua_punch.wav', fn: genCh09BaihuaPunch, cue: 'ch09_baihua_punch', book: '书剑恩仇录', novelId: 'ch09', desc: '百花错拳错落拳风' },
  { name: 'sfx_ch09_rouyun_sword.wav', fn: genCh09RouyunSword, cue: 'ch09_rouyun_sword', book: '书剑恩仇录', novelId: 'ch09', desc: '柔云剑术绵绵剑意' },

  // 连城诀 (ch10)
  { name: 'sfx_ch10_xuedao_slash.wav', fn: genCh10XuedaoSlash, cue: 'ch10_xuedao_slash', book: '连城诀', novelId: 'ch10', desc: '血刀经反手撩斩血光' },
  { name: 'sfx_ch10_shenzhao_revive.wav', fn: genCh10ShenzhaoRevive, cue: 'ch10_shenzhao_revive', book: '连城诀', novelId: 'ch10', desc: '神照经起死回生真气回溯' },

  // 雪山飞狐 (ch11)
  { name: 'sfx_ch11_hujia_saber.wav', fn: genCh11HujiaSaber, cue: 'ch11_hujia_saber', book: '雪山飞狐', novelId: 'ch11', desc: '胡家刀法缠头裹脑刀花' },
  { name: 'sfx_ch11_snow_wind.wav', fn: genCh11SnowWind, cue: 'ch11_snow_wind', book: '雪山飞狐', novelId: 'ch11', desc: '塞外暴风雪裹挟踏雪' },

  // 飞狐外传 (ch12)
  { name: 'sfx_ch12_miaojia_sword.wav', fn: genCh12MiaojiaSword, cue: 'ch12_miaojia_sword', book: '飞狐外传', novelId: 'ch12', desc: '苗家剑法黄龙转身' },
  { name: 'sfx_ch12_thunder_bomb.wav', fn: genCh12ThunderBomb, cue: 'ch12_thunder_bomb', book: '飞狐外传', novelId: 'ch12', desc: '霹雳雷火弹剧烈炸裂' },

  // 白马啸西风 (ch13)
  { name: 'sfx_ch13_desert_wind.wav', fn: genCh13DesertWind, cue: 'ch13_desert_wind', book: '白马啸西风', novelId: 'ch13', desc: '西域大漠黄沙狂风' },
  { name: 'sfx_ch13_horse_neigh.wav', fn: genCh13HorseNeigh, cue: 'ch13_horse_neigh', book: '白马啸西风', novelId: 'ch13', desc: '白马长嘶高亢踏蹄' },

  // 鸳鸯刀 (ch14)
  { name: 'sfx_ch14_dual_saber.wav', fn: genCh14DualSaber, cue: 'ch14_dual_saber', book: '鸳鸯刀', novelId: 'ch14', desc: '鸳鸯双刀夫妻合璧清鸣' },
  { name: 'sfx_ch14_renzhe_aura.wav', fn: genCh14RenzheAura, cue: 'ch14_renzhe_aura', book: '鸳鸯刀', novelId: 'ch14', desc: '仁者无敌真气震荡' },

  // 通用战斗与生活系统 (Common)
  { name: 'sfx_sword_swing_01.wav', fn: genSwordSwing, cue: 'sword_swing', category: 'combat', desc: '剑招破空轻啸' },
  { name: 'sfx_sword_clash_01.wav', fn: genSwordClash, cue: 'sword_clash', category: 'combat', desc: '双剑格挡金铁相交' },
  { name: 'sfx_sword_pierce_01.wav', fn: genSwordPierce, cue: 'sword_pierce', category: 'combat', desc: '剑尖突刺破甲' },
  { name: 'sfx_saber_slash_01.wav', fn: genSaberSlash, cue: 'saber_slash', category: 'combat', desc: '厚重单刀劈空' },
  { name: 'sfx_saber_cleave_01.wav', fn: genSaberCleave, cue: 'saber_cleave', category: 'combat', desc: '沉重力劈肉体打击' },
  { name: 'sfx_dart_throw_01.wav', fn: genDartThrow, cue: 'dart_throw', category: 'combat', desc: '暗器脱手破空尖啸' },
  { name: 'sfx_dart_hit_01.wav', fn: genDartHit, cue: 'dart_hit', category: 'combat', desc: '暗器钉中木石' },
  { name: 'sfx_fist_punch_01.wav', fn: genFistPunch, cue: 'fist_punch', category: 'combat', desc: '刚猛拳掌肉搏击打' },
  { name: 'sfx_dodge_whoosh_01.wav', fn: genDodgeWhoosh, cue: 'dodge_whoosh', category: 'combat', desc: '身法闪避破空' },
  { name: 'sfx_crit_strike_01.wav', fn: genCritStrike, cue: 'crit_strike', category: 'combat', desc: '会心一击破绽致命重创' },
  { name: 'sfx_drink_potion_01.wav', fn: genDrinkPotion, cue: 'drink_potion', category: 'item', desc: '拔开药塞咕咚饮药回甘' },
  { name: 'sfx_eating_food_01.wav', fn: genEatingFood, cue: 'eating_food', category: 'life', desc: '筷击瓷碗咀嚼进食' },
  { name: 'sfx_book_flip_01.wav', fn: genBookFlip, cue: 'book_flip', category: 'ui', desc: '秘籍研读翻动书页' },
  { name: 'sfx_ui_click_01.wav', fn: genUiClick, cue: 'ui_click', category: 'ui', desc: '界面竹木清脆点击' }
];

export function generateAllNovelSfx(targetDirs) {
  for (const dir of targetDirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const results = [];
  for (const sfx of ALL_SFX_DEFINITIONS) {
    const samples = sfx.fn();
    const wavBuffer = createWavBuffer(samples);

    for (const dir of targetDirs) {
      const filePath = path.join(dir, sfx.name);
      fs.writeFileSync(filePath, wavBuffer);
    }

    results.push({
      file: sfx.name,
      cue: sfx.cue,
      book: sfx.book || '通用',
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

  console.log('Generating complete set of Jin Yong novel martial arts & system sound effects...');
  const res = generateAllNovelSfx(dirs);
  console.log(`\nSuccessfully generated ${res.length} sound effect files into assets/sfx & apps/game/public/assets/sfx!`);
}

main().catch(console.error);
