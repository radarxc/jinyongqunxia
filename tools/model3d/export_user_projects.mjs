import fs from 'fs';
import path from 'path';
import https from 'https';
import { browserEval } from '../agents/browser_eval.mjs';

const tid = '2CF26FC1E640DA2979B33E8B2ED0EEDF';
const OUT_DIR = '/Users/bytedance/Projects/jinyongqunxia/.agents/coord/ART-3d-tripo-web/user_selected';

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

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ensureTripoDriver() {
  const hasT = await browserEval('typeof window.__t !== "undefined" && typeof window.__t.exportGlb === "function"', tid);
  if (!hasT) {
    const code = fs.readFileSync('./tools/model3d/tripo_web.js', 'utf-8');
    await browserEval(code, tid);
    console.log('Injected window.__t into Tripo page');
  }
}

async function exportAndDownload(pid, label) {
  await ensureTripoDriver();
  console.log(`\n=== Exporting ${label} (${pid}) with animations [idle, walk, run] ===`);
  
  // 1. Get project detail
  const detail = await browserEval(`window.__t.detail("${pid}")`, tid);
  const o = detail.operator || {};
  const rt = (o.retarget || []).filter(r => r.status === 'success');
  console.log('Available animations in project:', rt.map(r => r.name));

  const want = ['preset:biped:idle', 'preset:biped:walk', 'preset:biped:run'];
  const animOps = rt.filter(r => want.includes(r.name)).map(r => r.operator_id);
  const exportName = `user_${label}_anim_idle_walk_run`;

  // 2. Trigger export
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
    project_id: pid,
    texture_packaging: 'zip',
    texture_size: 2048,
    with_animation: true
  };

  console.log('Posting export request...');
  const exportRes = await browserEval(`
    window.__t.req('/v2/studio/operation/export', {
      method: 'POST',
      body: ${JSON.stringify(exportParams)}
    })
  `, tid);

  console.log('Export response:', exportRes);
  const opId = exportRes.operator_id;
  if (!opId) {
    throw new Error('No operator_id in export response: ' + JSON.stringify(exportRes));
  }

  // 3. Poll progress until done
  console.log(`Waiting for export operator ${opId}...`);
  while (true) {
    const prog = await browserEval(`window.__t.progress("${opId}")`, tid);
    const p = (prog && prog[0]) || {};
    console.log(`Export status: ${p.status}, progress: ${p.progress}%`);
    if (p.status === 'success') break;
    if (p.status && !['queued', 'waiting', 'pending', 'running', 'processing', 'in_progress'].includes(p.status)) {
      throw new Error(`Export failed with status: ${p.status}`);
    }
    await sleep(3000);
  }

  // 4. Get download URL
  console.log('Getting download URL...');
  const dlRes = await browserEval(`
    window.__t.req('/v2/studio/operation/download_with_name', {
      method: 'POST',
      body: { file_name: "${exportName}", operator_id: "${opId}" }
    })
  `, tid);
  console.log('Download URL received:', dlRes.model_url?.slice(0, 100) + '...');

  // 5. Download GLB
  const destPath = path.join(OUT_DIR, `${label}_anim_idle_walk_run.glb`);
  await download(dlRes.model_url, destPath);
  return destPath;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Priority: 6359f3b3-462b-411f-9d03-a8d0f081f8f5 first, then 0e8cd219-a69e-48cd-83dc-0199e5037404
  const p2Path = await exportAndDownload('6359f3b3-462b-411f-9d03-a8d0f081f8f5', 'p2_figure');
  console.log('P2 exported successfully:', p2Path);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
