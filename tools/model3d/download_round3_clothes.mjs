import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '6A2015EF79A6EE388CE11599467948F5';
const PROPS_DIR = path.resolve('/Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('status ' + res.statusCode));
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`Saved ${dest} (${fs.statSync(dest).size} bytes)`);
          resolve();
        });
      });
    }).on('error', reject);
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // 1. Download kunlun
  const kunlunUrl = 'https://tripo-data.rg1.data.tripo3d.com/tripo-studio/20261007/f0aea32a-f2a9-47aa-aa6e-d28a111b60a0/tripo_pbr_model_f0aea32a-f2a9-47aa-aa6e-d28a111b60a0_meshopt.glb?Key-Pair-Id=K1676C64NMVM2J&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly90cmlwby1kYXRhLnJnMS5kYXRhLnRyaXBvM2QuY29tL3RyaXBvLXN0dWRpby8yMDI2MTAwNy9mMGFlYTMyYS1mMmE5LTQ3YWEtYWE2ZS1kMjhhMTExYjYwYTAvdHJpcG9fcGJyX21vZGVsX2YwYWVhMzJhLWYyYTktNDdhYS1hYTZlLWQyOGExMTFiNjBhMF9tZXNob3B0LmdsYiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5MTUwNDAwMH19fV19&Signature=EWOYIhrWOXoO-1TEQM12SnnrWeElDy~~tICNOJ0axlbJvWcLfZ348dtTAdKZ6uvLg6cLCiiaH8vu~rciE9HG9z3HpBcczMYPU8k3IcG7wpitg5BYtLikKq0f6bEyVhi21rN2VmnSp0E3P0OvdZsMRAMIZDXAvCZPhCEnt1qqCE1Sw7qieFIcPBa8z1k9USnt4XdSIW8DSaaBsH3LUE~veE9eDlyPY4hHjYApNpCH1SlwzJXMGyz1-dsM2u8kO~xWww60durt57gMnoRKVvCf4a2aqhIamOCNTbJOQlsaarLjOXnczuhIByn9XtmUWlllsvK1ZeENgNJtWqjLRDdj5w__';

  const kunlunRaw = path.join(PROPS_DIR, 'cloth_kunlun_taoist_raw.glb');
  const kunlunOut = path.join(PROPS_DIR, 'cloth_kunlun_taoist.glb');

  console.log('Downloading Kunlun Taoist raw model...');
  await download(kunlunUrl, kunlunRaw);
  console.log('Converting Kunlun Taoist to unlit...');
  execSync(`python3 tools/model3d/make_unlit_glb.py "${kunlunRaw}" "${kunlunOut}"`, { stdio: 'inherit' });
  console.log('✅ Kunlun Taoist finished!');

  // 2. Poll and get golden armor
  console.log('Fetching Golden Armor details...');
  let goldenUrl = null;
  for (let i = 0; i < 20; i++) {
    const detail = await browserEval('window.__t.detail("4086ce2a-8c69-42b7-8dbb-59211b0c99cc")', tid);
    goldenUrl = detail?.model_url || detail?.operator?.model_url;
    if (goldenUrl) break;
    console.log(`Waiting for Golden Armor model_url... (${i + 1})`);
    await sleep(3000);
  }

  if (goldenUrl) {
    const goldenRaw = path.join(PROPS_DIR, 'cloth_golden_armor_raw.glb');
    const goldenOut = path.join(PROPS_DIR, 'cloth_golden_armor.glb');
    console.log('Downloading Golden Armor raw model...');
    await download(goldenUrl, goldenRaw);
    console.log('Converting Golden Armor to unlit...');
    execSync(`python3 tools/model3d/make_unlit_glb.py "${goldenRaw}" "${goldenOut}"`, { stdio: 'inherit' });
    console.log('✅ Golden Armor finished!');
  } else {
    console.error('Failed to get Golden Armor url');
  }
}

main().catch(console.error);
