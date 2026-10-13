import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '6A2015EF79A6EE388CE11599467948F5';
const PID = '3060de6b-e82c-4f32-962a-b182e5e1e456';
const GEN_OP = '71b42066-eb38-4b32-acdf-662abf995726';
const OUT_DIR = '/Users/bytedance/Projects/jinyongqunxia/.agents/coord/ART-3d-tripo-web/user_selected';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
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

async function main() {
  console.log(`\n======================================================`);
  console.log(`Tracking Unlit T-Pose Tripo Model: PID=${PID}, OP=${GEN_OP}`);
  console.log(`======================================================`);

  // 1. Wait for model generation
  while (true) {
    const prog = await browserEval(`window.__t.progress("${GEN_OP}")`, tid);
    const p = (prog && prog[0]) || {};
    console.log(`[Gen] Status: ${p.status}, Progress: ${p.progress}%, Est Left: ${p.left_time}s`);
    if (p.status === 'success') {
      console.log(`✔ Generation completed successfully!`);
      break;
    }
    if (p.status && !['queued', 'waiting', 'pending', 'running', 'processing', 'in_progress'].includes(p.status)) {
      throw new Error(`Generation failed with status: ${p.status}`);
    }
    await sleep(6000);
  }

  // 2. Fetch project details
  const detail = await browserEval(`window.__t.proj("${PID}")`, tid);
  console.log('Project info:', detail);

  // 3. Auto Rigging (Mixamo 65 joints)
  console.log(`\n[Rig] Submitting Auto-Rigging...`);
  const rigRes = await browserEval(`window.__t.rig("${PID}", { go: true })`, tid);
  console.log('Rig Response:', rigRes);
  if (!rigRes.ok) {
    throw new Error('Rig request failed: ' + JSON.stringify(rigRes));
  }
  const rigOp = rigRes.op;

  while (true) {
    const prog = await browserEval(`window.__t.progress("${rigOp}")`, tid);
    const p = (prog && prog[0]) || {};
    console.log(`[Rig] Status: ${p.status}, Progress: ${p.progress}%, Est Left: ${p.left_time}s`);
    if (p.status === 'success') {
      console.log(`✔ Rigging completed successfully!`);
      break;
    }
    if (p.status && !['queued', 'waiting', 'pending', 'running', 'processing', 'in_progress'].includes(p.status)) {
      throw new Error(`Rigging failed with status: ${p.status}`);
    }
    await sleep(4000);
  }

  // Check skeleton joints
  const jointsCheck = await browserEval(`window.__t.joints("${PID}")`, tid);
  console.log('Joints Check:', jointsCheck.ok ? 'PASSED' : JSON.stringify(jointsCheck));

  // 4. Retarget animations [idle, walk, run]
  console.log(`\n[Retarget] Generating animations [idle, walk, run]...`);
  const anims = ['idle', 'walk', 'run'];
  for (const anim of anims) {
    console.log(`  -> Retargeting ${anim}...`);
    const rtRes = await browserEval(`window.__t.retarget("${PID}", ["${anim}"], { go: true })`, tid);
    console.log(`  Retarget ${anim} response:`, rtRes);
    const rtOp = rtRes && rtRes.op;
    if (rtOp) {
      while (true) {
        const prog = await browserEval(`window.__t.progress("${rtOp}")`, tid);
        const p = (prog && prog[0]) || {};
        console.log(`  [Retarget ${anim}] Status: ${p.status}, Progress: ${p.progress}%`);
        if (p.status === 'success') break;
        if (p.status && !['queued', 'waiting', 'pending', 'running', 'processing', 'in_progress'].includes(p.status)) {
          console.warn(`  Retarget ${anim} status: ${p.status}`);
          break;
        }
        await sleep(3000);
      }
    }
    await sleep(2000);
  }

  // 5. Backend Export
  console.log(`\n[Export] Triggering backend export with animations...`);
  const projDetail = await browserEval(`window.__t.detail("${PID}")`, tid);
  const o = projDetail.operator || {};
  const rt = (o.retarget || []).filter(r => r.status === 'success');
  console.log('Available animation operators:', rt.map(r => `${r.name}: ${r.operator_id}`));

  const want = ['preset:biped:idle', 'preset:biped:walk', 'preset:biped:run'];
  const animOps = rt.filter(r => want.includes(r.name)).map(r => r.operator_id);
  const exportName = `tpose_unlit_fullbody_ultra_anim`;

  const exportParams = {
    animate_in_place: true,
    animations: animOps,
    bake_animation_frame: 0,
    enable_bake_animation: false,
    export_orientation: '-y',
    export_vertex_colors: false,
    fbx_preset: 'blender',
    format: 'gltf',
    model_version: 'default',
    name: exportName,
    pack_uv: false,
    project_id: PID,
    texture_packaging: 'zip',
    texture_size: 2048,
    with_animation: true
  };

  const exportRes = await browserEval(`
    window.__t.req('/v2/studio/operation/export', {
      method: 'POST',
      body: ${JSON.stringify(exportParams)}
    })
  `, tid);

  console.log('Export response:', exportRes);
  const expOpId = exportRes.operator_id;
  if (!expOpId) throw new Error('No operator_id in export response');

  while (true) {
    const prog = await browserEval(`window.__t.progress("${expOpId}")`, tid);
    const p = (prog && prog[0]) || {};
    console.log(`[Export] Status: ${p.status}, Progress: ${p.progress}%`);
    if (p.status === 'success') break;
    if (p.status && !['queued', 'waiting', 'pending', 'running', 'processing', 'in_progress'].includes(p.status)) {
      throw new Error(`Export failed with status: ${p.status}`);
    }
    await sleep(3000);
  }

  // 6. Download model
  console.log('Getting download URL...');
  const dlRes = await browserEval(`
    window.__t.req('/v2/studio/operation/download_with_name', {
      method: 'POST',
      body: { file_name: "${exportName}", operator_id: "${expOpId}" }
    })
  `, tid);

  const rawPath = path.join(OUT_DIR, `tpose_unlit_fullbody_ultra_anim_raw.glb`);
  await download(dlRes.model_url, rawPath);

  // 7. Post-processing:
  // a) fix_anim_offset.py
  console.log('\n[Post-Processing] Fixing animation offset...');
  const fixedOffsetPath = path.join(OUT_DIR, `tpose_unlit_fullbody_ultra_anim_fixed.glb`);
  execSync(`python3 tools/model3d/fix_anim_offset.py "${rawPath}" "${fixedOffsetPath}"`, { stdio: 'inherit' });

  // b) make_unlit_glb.py
  console.log('\n[Post-Processing] Converting to KHR_materials_unlit...');
  const unlitPath = path.join(OUT_DIR, `tpose_unlit_fullbody_ultra_anim_final.glb`);
  execSync(`python3 tools/model3d/make_unlit_glb.py "${fixedOffsetPath}" "${unlitPath}"`, { stdio: 'inherit' });

  // c) Copy to public directory for viewer
  const publicDest = '/Users/bytedance/Projects/jinyongqunxia/apps/game/public/temp_fresh_fullbody.glb';
  fs.copyFileSync(unlitPath, publicDest);
  console.log(`✔ Copied unlit model to ${publicDest}`);

  // d) Measure 3D proportions
  console.log('\n[Measure] Measuring 3D head-to-body ratio...');
  execSync(`python3 tools/model3d/measure_heads.py "${unlitPath}"`, { stdio: 'inherit' });

  console.log(`\n🎉 Pipeline completed successfully!`);
}

main().catch(console.error);
