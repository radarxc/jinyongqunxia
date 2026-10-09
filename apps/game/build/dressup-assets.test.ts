import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCharacterViewerLoader } from '../../../packages/render/src/character-viewer/scene';
import { createDressupActor } from '../../../packages/render/src/dressup/actor';
import { publishDressupAssets, type DressupAssetIndex } from './dressup-assets';

const roots: string[] = [];
async function root(): Promise<string> {
  const value = await mkdtemp(join(tmpdir(), 'tianshu-dressup-assets-'));
  roots.push(value);
  return value;
}
function python(source: string, ...args: string[]): string {
  const result = spawnSync('python3', ['-c', source, ...args], {
    cwd: process.cwd(), encoding: 'utf8', timeout: 300_000,
    env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
  });
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
  return result.stdout.trim();
}
interface TestGlbDocument { accessors: Record<string, number>[]; bufferViews: Record<string, number>[];
  buffers: unknown[]; meshes: { primitives: { attributes: Record<string, number> }[] }[];
  skins: { inverseBindMatrices: number }[]; images?: { bufferView: number; mimeType: string }[];
  textures?: { source: number }[]; materials?: Record<string, unknown>[]; extensionsUsed?: string[]; }
function glb(bytes: Buffer): { document: TestGlbDocument; binary: Buffer } {
  let offset = 12; let document: TestGlbDocument | undefined; let binary = Buffer.alloc(0);
  while (offset < bytes.length) {
    const length = bytes.readUInt32LE(offset); const type = bytes.readUInt32LE(offset + 4);
    offset += 8; const payload = bytes.subarray(offset, offset + length); offset += length;
    if (type === 0x4e4f534a) document = JSON.parse(payload.toString().trim());
    if (type === 0x004e4942) binary = payload;
  }
  if (!document) throw new Error('GLB_JSON_MISSING');
  return { document, binary };
}
function accessorBytes(value: ReturnType<typeof glb>, index: number): Buffer {
  const accessor = value.document.accessors[index];
  const view = value.document.bufferViews[accessor.bufferView];
  const component = ({ 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 } as
    Record<number, number>)[accessor.componentType]!;
  const width = ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 } as
    Record<string, number>)[accessor.type]!;
  const size = component * width; const stride = view.byteStride ?? size;
  const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  return Buffer.concat(Array.from({ length: accessor.count }, (_, row) =>
    value.binary.subarray(start + row * stride, start + row * stride + size)));
}
function run(command: string, args: string[], expected = 0): ReturnType<typeof spawnSync> {
  const result = spawnSync(command, args, { cwd: process.cwd(), encoding: 'utf8', timeout: 300_000,
    env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' } });
  expect(result.status, result.stderr).toBe(expected); return result;
}
async function sha256(path: string): Promise<string> {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}
async function validatedProp(id: string, level: 'approved' | 'draft',
  templateId = 'tpl_f_medium'): Promise<string> {
  const directory = await root();
  python(`
import hashlib,json,shutil,sys,numpy as np
from pathlib import Path
sys.path.insert(0,'tools/model3d/dressup')
from glb_io import GLBBuilder,Mesh
d=Path(sys.argv[1]);asset_id=sys.argv[2];template_id=sys.argv[3]
canonical=Path('assets/default/model3d/dressup/templates/tpl_f_medium');template=d/'templates'/template_id
template.mkdir(parents=True);shutil.copy2(canonical/'body.glb',template/'body.glb')
skeleton=json.loads((canonical/'skeleton.json').read_text());body={'file':str(template/'body.glb'),'sha256':hashlib.sha256((template/'body.glb').read_bytes()).hexdigest()}
skeleton['source']={**skeleton['source'],**body}
v=np.array([[x,y,z] for x in [-.05,.05] for y in [-.07,.93] for z in [-.04,.04]],np.float32)
f=np.array([0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3],np.uint16)
b=GLBBuilder();m=b.add_material(unlit=True);mi=b.add_mesh(Mesh(v,f,uvs=np.zeros((8,2),np.float32),material_indices=np.array([0])),material_map=[m]);n=b.add_node(mesh=mi);b.add_scene([n])
source=d/'source.glb';asset=d/(asset_id+'.glb');b.write(source);b.write(asset)
fit={'schema':'tianshu-dressup-fit.v1','id':asset_id,'kind':'prop','class':'weapon',
 'source':{'file':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()},
 'body':body,'template':template_id,'mPerMu':skeleton['mPerMu'],
 'diagnostics':{'anchorPositionMu':[0,0,0]},'up':'+Y','realSizeM':skeleton['mPerMu'],
 'measuredLengthMu':1,'scaleApplied':1}
(d/'fit.json').write_text(json.dumps(fit));(d/'skeleton.json').write_text(json.dumps(skeleton))
`, directory, id, templateId);
  run('python3', ['tools/model3d/dressup/validate.py', '--body',
    join(directory, 'templates', templateId, 'body.glb'), '--skeleton',
    join(directory, 'skeleton.json'), '--asset', join(directory, id + '.glb'), '--fit',
    join(directory, 'fit.json'), '--out', join(directory, 'report.json'), '--level', level]);
  return directory;
}
async function leaf(base: string, name: string, status: string): Promise<void> {
  const directory = join(base, 'assets/default/model3d/dressup/garments', name);
  await mkdir(directory, { recursive: true });
  await Promise.all([
    writeFile(join(directory, name + '.glb'), 'glb:' + name),
    writeFile(join(directory, 'fit.json'), '{}'),
    writeFile(join(directory, 'report.json'), '{}'),
    writeFile(join(directory, 'private.png'), 'not runtime'),
  ]);
  await writeFile(join(directory, 'manifest.yaml'), '- id: dressup__garment__' + name + '\n' +
    '  file: ' + name + '.glb\n  category: model3d\n  kind: dressup-garment\n' +
    '  template: tpl_f_medium\n  slot: body\n  fit: fit.json\n' +
    '  report: report.json\n  status: ' + status + '\n  source:\n' +
    '    file: must-not-be-scanned.glb\n');
}
async function variants(base: string): Promise<void> {
  const directory = join(base, 'assets/default/model3d/dressup/garments/eq_variants');
  await mkdir(directory, { recursive: true });
  await Promise.all(['base.glb', 'fit.json', 'base-report.json', 'small.glb', 'small-fit.json',
    'small-report.json', 'tall.glb', 'tall-fit.json', 'tall-report.json', 'rejected.glb',
    'rejected-fit.json', 'rejected-report.json']
    .map(name => writeFile(join(directory, name), name.endsWith('.json') ? "{}" : name)));
  await writeFile(join(directory, 'manifest.yaml'), `- id: dressup__garment__eq_variants
  file: base.glb
  kind: dressup-garment
  template: tpl_f_medium
  slot: body
  fit: fit.json
  report: base-report.json
  status: candidate
  fits:
    tpl_f_medium: { file: base.glb, fit: fit.json, report: base-report.json, status: candidate }
    tpl_f_small:
      file: small.glb
      fit: small-fit.json
      report: small-report.json
      status: draft
    tpl_f_tall: { file: rejected.glb, fit: rejected-fit.json, report: rejected-report.json, status: rejected }
  source:
    file: tall.glb
    report: tall-report.json
`);
}
async function layer(base: string): Promise<void> {
  const directory = join(base, 'assets/default/model3d/dressup/garments/eq_jinzhuang_tex');
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'eq_jinzhuang.layer.png'), 'rgba-layer');
  await writeFile(join(directory, 'layer.json'), JSON.stringify({
    schema: 'tianshu-dressup-layer.v1', kind: 'layer', slot: 'body', id: 'eq_jinzhuang',
  }));
  await writeFile(join(directory, 'manifest.yaml'),
    '- id: dressup__layer__eq_jinzhuang\n  file: eq_jinzhuang.layer.png\n' +
    '  kind: dressup-layer\n  template: tpl_f_medium\n  slot: body\n' +
    '  fit: layer.json\n  status: draft\n');
}
afterEach(async () => {
  vi.unstubAllGlobals();
  await Promise.all(roots.splice(0).map(path => rm(path, { recursive: true })));
});

describe('dressup asset publishing', () => {
  it('publishes head fits and template-specific PNG masks with their declared dimensions', async () => {
    const base = await root(); await variants(base);
    const directory = join(base, 'assets/default/model3d/dressup/garments/eq_variants');
    const head = join(base, 'assets/default/model3d/dressup/heads/npc_fixture');
    await mkdir(head, { recursive: true });
    await writeFile(join(head, 'head.glb'), 'head');
    await writeFile(join(head, 'fit.json'), JSON.stringify({ kind: 'head', hideRegions: ['head'],
      skinTint: [.6, .7, .8], neverHide: ['neck'] }));
    await writeFile(join(head, 'manifest.yaml'), '- id: npc_fixture\n  kind: dressup-head\n' +
      '  file: head.glb\n  fit: fit.json\n  template: tpl_f_medium\n  status: candidate\n');
    for (const [fit, file, size] of [['fit.json', 'hidemask.png', 1024],
      ['small-fit.json', 'hidemask-small.png', 512]] as const) {
      await writeFile(join(directory, fit), JSON.stringify({ hideMask: { file, size } }));
      python('from PIL import Image; import sys; Image.new("L",(int(sys.argv[2]),)*2,255).save(sys.argv[1])',
        join(directory, file), String(size));
    }
    const copied = new Set<string>(); const references = new Map<string, Set<string>>();
    await publishDressupAssets(base, true, copied, references);
    const index = JSON.parse(await readFile(join(base,
      'apps/game/public/assets/default/model3d/dressup/index.json'), 'utf8')) as DressupAssetIndex;
    expect(index.groups.head).toEqual([expect.objectContaining({ id: 'npc_fixture', kind: 'head',
      file: '/assets/default/model3d/dressup/heads/npc_fixture/head.glb',
      fit: '/assets/default/model3d/dressup/heads/npc_fixture/fit.json' })]);
    expect(index.groups.garment.map(entry => entry.hideMask)).toEqual([
      '/assets/default/model3d/dressup/garments/eq_variants/hidemask.png',
      '/assets/default/model3d/dressup/garments/eq_variants/hidemask-small.png',
    ]);
    for (const entry of Object.values(index.groups).flat()) {
      if (!entry.fit) continue;
      const fit = JSON.parse(await readFile(join(base, 'apps/game/public', entry.fit), 'utf8'));
      if (!fit.hideMask) continue;
      expect(entry.hideMask).toBeDefined();
      const png = await readFile(join(base, 'apps/game/public', entry.hideMask!));
      expect(png.subarray(1, 4).toString()).toBe('PNG');
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([fit.hideMask.size, fit.hideMask.size]);
      expect(copied.has(entry.hideMask!.slice(1))).toBe(true);
      expect(references.get('assets/default/model3d/dressup/garments/eq_variants/manifest.yaml'))
        .toContain(entry.hideMask);
    }
    await writeFile(join(directory, 'fit.json'), 'invalid JSON');
    await expect(publishDressupAssets(base, false)).rejects.toThrow(SyntaxError);
  }, 300_000);

  it('textures removes PBR image BIN blocks, reindexes, resizes, and adds unlit', async () => {
    const base = await root(); const input = join(base, 'textures.glb'); const output = join(base, 'clean.glb');
    const evidence = JSON.parse(python(`
import io,json,sys,numpy as np
from PIL import Image
sys.path.insert(0,'tools/model3d/dressup');from glb_io import GLBBuilder,ImageData,Mesh
b=GLBBuilder(); ids=[]
for color in ('red','green','blue'):
 x=io.BytesIO();Image.new('RGB',(32,16),color).save(x,'PNG');ids.append(b.add_texture(b.add_image(ImageData(x.getvalue(),'image/png'))))
m=b.add_material(base_color_texture=ids[1],unlit=False);b.document['materials'][m]['normalTexture']={'index':ids[0]};b.document['materials'][m]['pbrMetallicRoughness']['metallicRoughnessTexture']={'index':ids[2]}
mesh=Mesh(np.array([[0,0,0],[1,0,0],[0,1,0]],np.float32),np.array([0,1,2],np.uint16),uvs=np.array([[0,0],[1,0],[0,1]],np.float32),material_indices=np.array([0]));mi=b.add_mesh(mesh,material_map=[m]);n=b.add_node(mesh=mi);b.add_scene([n]);b.write(sys.argv[1]);print(json.dumps({'bytes':len(b.binary),'views':len(b.document['bufferViews'])}))
`, input));
    run('python3', ['tools/model3d/dressup/textures.py', input, output, '--max', '8']);
    const cleaned = glb(await readFile(output)); const material = cleaned.document.materials![0] as {
      normalTexture?: unknown; pbrMetallicRoughness: { baseColorTexture: { index: number }; metallicRoughnessTexture?: unknown }; extensions: Record<string, unknown> };
    expect(cleaned.document.images).toHaveLength(1); expect(cleaned.document.textures).toHaveLength(1);
    expect(cleaned.document.images![0]).toMatchObject({ mimeType: 'image/jpeg' });
    expect(material.normalTexture).toBeUndefined(); expect(material.pbrMetallicRoughness.metallicRoughnessTexture).toBeUndefined();
    expect(material.pbrMetallicRoughness.baseColorTexture.index).toBe(0);
    expect(material.extensions).toHaveProperty('KHR_materials_unlit');
    const dimensions = JSON.parse(python(`
import io,json,sys
from PIL import Image
sys.path.insert(0,'tools/model3d/dressup');from glb_io import load_glb
g=load_glb(sys.argv[1]);im=Image.open(io.BytesIO(g.image(0).data));print(json.dumps(im.size))
`, output));
    expect(dimensions).toEqual([8, 4]);
    expect(cleaned.document.bufferViews.length).toBeLessThan(evidence.views);
    const image = cleaned.document.images![0]; expect(cleaned.document.bufferViews[image.bufferView].byteLength).toBeGreaterThan(0);
  }, 300_000);

  it('ingest accepts only complete validator-bound approved or draft reports', async () => {
    const ingestBase = await root();
    const assetRoot = join(ingestBase, 'assets/default/model3d/dressup');
    const approvedId = 'gate_approved_' + process.pid;
    const approved = await validatedProp(approvedId, 'approved');
    const approvedDest = join(assetRoot, 'props', approvedId);
    const result = run('python3', ['tools/model3d/dressup/ingest.py', 'prop', approvedId,
      '--src', approved, '--slot', 'accessory', '--item', 'eq_test', '--asset-root', assetRoot]);
    expect(JSON.parse(result.stdout)).toMatchObject({ status: 'candidate' });
    const manifest = await readFile(join(approvedDest, 'manifest.yaml'), 'utf8');
    expect(manifest).toContain('status: candidate'); expect(manifest).toContain('triangles: 12');
    expect(manifest).toContain('fit: fit.json'); expect(manifest).toContain('slot: accessory');

    const draftId = 'gate_draft_' + process.pid; const draft = await validatedProp(draftId, 'draft');
    const draftDest = join(assetRoot, 'props', draftId);
    const draftResult = run('python3', ['tools/model3d/dressup/ingest.py', 'prop', draftId,
      '--src', draft, '--asset-root', assetRoot]);
    expect(JSON.parse(draftResult.stdout)).toMatchObject({ status: 'draft' });
    expect(await readFile(join(draftDest, 'manifest.yaml'), 'utf8')).toContain('status: draft');
    expect((await publishDressupAssets(ingestBase, false)).filter(path => path.includes('/gate_')))
      .toHaveLength(6);
  }, 300_000);

  it('ingest merges three template fits and publisher skips a rejected variant', async () => {
    const ingestBase = await root();
    const assetRoot = join(ingestBase, 'assets/default/model3d/dressup');
    const id = 'gate_variants_' + process.pid;
    const destination = join(assetRoot, 'props', id);
    const medium = await validatedProp(id, 'approved', 'tpl_f_medium');
    const small = await validatedProp(id, 'draft', 'tpl_f_small');
    const tall = await validatedProp(id, 'approved', 'tpl_f_tall');
    run('python3', ['tools/model3d/dressup/ingest.py', 'prop', id, '--src', medium,
      '--template', 'tpl_f_small', '--asset-root', assetRoot], 2);
    run('python3', ['tools/model3d/dressup/ingest.py', 'prop', id, '--src', medium,
      '--template', 'tpl_f_medium', '--slot', 'accessory', '--item', 'eq_variants',
      '--asset-root', assetRoot]);
    run('python3', ['tools/model3d/dressup/ingest.py', 'prop', id, '--src', small,
      '--template', 'tpl_f_small', '--asset-root', assetRoot]);
    run('python3', ['tools/model3d/dressup/ingest.py', 'prop', id, '--src', tall,
      '--template', 'tpl_f_tall', '--asset-root', assetRoot]);
    let manifest = await readFile(join(destination, 'manifest.yaml'), 'utf8');
    expect(manifest).toContain('status: candidate'); expect(manifest).toContain('item: eq_variants');
    expect(manifest).toContain('directory: external-workdir');
    expect(manifest).toContain(id + '.tpl_f_small.glb');
    expect(manifest).toContain('fit.tpl_f_small.json');
    expect(manifest).toContain('report.tpl_f_tall.json');
    expect(manifest).toMatch(/tpl_f_small:\n {6}file: .*tpl_f_small\.glb\n {6}fit: fit\.tpl_f_small\.json\n {6}report: report\.tpl_f_small\.json\n {6}status: draft/u);
    expect(await sha256(join(destination, 'fit.tpl_f_small.json'))).toBe(await sha256(join(small, 'fit.json')));
    expect(await sha256(join(destination, 'fit.tpl_f_tall.json'))).toBe(await sha256(join(tall, 'fit.json')));
    manifest = manifest.replace(/(tpl_f_tall:[\s\S]*?status:) candidate/u, '$1 rejected');
    await writeFile(join(destination, 'manifest.yaml'), manifest);
    const own = (await publishDressupAssets(ingestBase, false))
      .filter(path => path.includes('/' + id + '/'));
    expect(own.some(path => path.includes('tpl_f_small'))).toBe(true);
    expect(own.some(path => path.includes('tpl_f_tall'))).toBe(false);
    expect(own).toContain('assets/default/model3d/dressup/props/' + id + '/fit.tpl_f_small.json');
    expect(own).toContain('assets/default/model3d/dressup/props/' + id + '/' + id + '.glb');
  }, 300_000);

  it('ingest rejects forged checks, failed checks, and stale asset or fit digests', async () => {
    const assetRoot = join(await root(), 'assets/default/model3d/dressup');
    const id = 'gate_reject_' + process.pid; const source = await validatedProp(id, 'approved');
    const reportPath = join(source, 'report.json');
    const original = JSON.parse(await readFile(reportPath, 'utf8')) as { checks: Record<string, unknown>[] };
    const attempt = () => run('python3', ['tools/model3d/dressup/ingest.py', 'prop', id,
      '--src', source, '--asset-root', assetRoot], 2);
    await writeFile(reportPath, JSON.stringify({ ...original, template: undefined }));
    attempt();
    await writeFile(reportPath, JSON.stringify({ ...original, checks: [{ name: 'budget.triangles' }] }));
    attempt();
    await writeFile(reportPath, JSON.stringify({ ...original, checks: original.checks.map((check, index) =>
      index === 0 ? { ...check, pass: false } : check) }));
    attempt();
    await writeFile(reportPath, JSON.stringify({ ...original,
      subject: { kind: 'prop', id: id + '_other' } }));
    attempt();
    await writeFile(reportPath, JSON.stringify(original));
    await writeFile(join(source, id + '.glb'), Buffer.concat([await readFile(join(source, id + '.glb')), Buffer.from('x')]));
    attempt();

    const fitId = 'gate_fit_' + process.pid; const fitSource = await validatedProp(fitId, 'approved');
    await writeFile(join(fitSource, 'fit.json'), '{}');
    run('python3', ['tools/model3d/dressup/ingest.py', 'prop', fitId, '--src', fitSource,
      '--asset-root', assetRoot], 2);
    for (const bad of ['', '..', '../escape', '/absolute', 'nested/id']) {
      const escaped = spawnSync('python3', ['tools/model3d/dressup/ingest.py', 'prop', bad,
        '--src', fitSource, '--asset-root', assetRoot], { cwd: process.cwd(), encoding: 'utf8' });
      expect(escaped.status).toBe(2);
    }
    const conflict = run('python3', ['tools/model3d/dressup/ingest.py', 'prop', fitId,
      '--src', fitSource, '--asset-root', assetRoot, '--commit'], 2);
    expect(conflict.stderr).toContain('--commit 与 --asset-root');
  }, 300_000);

  it('leaves the real dressup props root free of gate fixtures', async () => {
    const entries = await readdir(join(process.cwd(), 'assets/default/model3d/dressup/props'));
    expect(entries.filter(name => name.startsWith('gate_'))).toEqual([]);
  });

  it('fails validation for stale body identities, wrong units, and missing bindings', async () => {
    const id = 'gate_binding_' + process.pid; const source = await validatedProp(id, 'approved');
    const body = 'assets/default/model3d/dressup/templates/tpl_f_medium/body.glb';
    const fitPath = join(source, 'fit.json'); const skeletonPath = join(source, 'skeleton.json');
    const originalFit = JSON.parse(await readFile(fitPath, 'utf8')) as Record<string, unknown>;
    const originalSkeleton = JSON.parse(await readFile(skeletonPath, 'utf8')) as Record<string, unknown>;
    const execute = async (expectedCheck: string): Promise<void> => {
      const reportPath = join(source, 'binding-report.json');
      run('python3', ['tools/model3d/dressup/validate.py', '--body', body, '--skeleton',
        skeletonPath, '--asset', join(source, id + '.glb'), '--fit', fitPath, '--out', reportPath], 3);
      const report = JSON.parse(await readFile(reportPath, 'utf8')) as {
        level: string; checks: { name: string; pass: boolean }[] };
      expect(report.level).toBe('fail');
      expect(report.checks.find(check => check.name === expectedCheck)?.pass).toBe(false);
    };
    interface BindingFit { body: { file?: string; sha256: string }; mPerMu: number }
    interface BindingSkeleton { source: { sha256: string } }
    const mutateFit = async (mutate: (fit: BindingFit) => void, check: string) => {
      const fit = structuredClone(originalFit) as unknown as BindingFit;
      mutate(fit); await writeFile(fitPath, JSON.stringify(fit));
      await writeFile(skeletonPath, JSON.stringify(originalSkeleton)); await execute(check);
    };
    await mutateFit(fit => { fit.body.sha256 = '647c674f2e3139d407714ead2fef5ddfa2abb05643d5cfdee2f730cdafb31748'; },
      'binding.fitBodySha');
    await writeFile(fitPath, JSON.stringify(originalFit));
    const wrongSkeleton = structuredClone(originalSkeleton) as unknown as BindingSkeleton;
    wrongSkeleton.source.sha256 = '1'.repeat(64);
    await writeFile(skeletonPath, JSON.stringify(wrongSkeleton)); await execute('binding.skeletonBodySha');
    const wrongUnits = structuredClone(originalSkeleton) as unknown as BindingSkeleton & { mPerMu: number };
    wrongUnits.mPerMu += 0.01;
    await writeFile(skeletonPath, JSON.stringify(wrongUnits)); await execute('binding.skeletonUnits');
    await mutateFit(fit => { fit.mPerMu += 0.01; }, 'binding.fitMPerMu');
    await mutateFit(fit => { delete fit.body.file; }, 'binding.fitRequired');
  }, 300_000);

  it('validates real A3 fit format and class-specific semantic axes', () => {
    const evidence = JSON.parse(python(`
import json,sys,tempfile,numpy as np
from pathlib import Path
sys.path.insert(0,'tools/model3d/dressup')
from validate import (_axis_check_waiver,_prop_axis_and_anchor,_prop_main_axis_check,
 _prop_semantic_direction,_similarity_quality,validate)
from normalize_prop import _weapon_handle_detection
local=Path('assets/default/model3d/dressup/props')
root=local if (local/'item_qingfeng_sword').is_dir() else Path('../../..').resolve()/'assets/default/model3d/dressup/props'
from glb_io import load_glb
out={}
for name in ('eq_longquanjian','item_qingfeng_sword','item_bamboo_hat','luxury_jade_pendant'):
 d=root/name;fit=json.loads((d/'fit.json').read_text());m=load_glb(d/(name+'.glb')).mesh();axis_details={}
 axis,anchor,size=_prop_axis_and_anchor(m.positions,fit,m.indices,axis_details)
 reversed=m.positions.copy();reversed[:,1]*=-1;_,reversed_anchor,_=_prop_axis_and_anchor(reversed,fit,m.indices)
 if fit.get('handleDetection',{}).get('method')=='guard-peak':
  detection=fit['handleDetection'];end,_,proof=_weapon_handle_detection(m.positions,1);mirror_end,_,mirror_proof=_weapon_handle_detection(reversed,1)
  chosen=proof['chosen'];mirror_chosen=mirror_proof['chosen'];peak=float(detection['peakAxialMu']);lo=float(m.positions[:,1].min());hi=float(m.positions[:,1].max())
  direction=(end=='low' and detection['handleEnd']=='min' and lo<=0<=peak and peak-lo<hi-peak)
  mirrored=(mirror_end!='high' or abs(chosen['distanceFromEndFraction']-mirror_chosen['distanceFromEndFraction'])>1e-6)
 else:
  direction=_prop_semantic_direction(m.positions,fit['class'],anchor)[0];mirrored=_prop_semantic_direction(reversed,fit['class'],reversed_anchor)[0]
 out[name]=[fit.get('pushOut'),axis,float(np.linalg.norm(anchor)),size,direction,mirrored,axis_details]
vertices=[];faces=[]
def subdivide(a,b,c,parts):
 ids={}
 for i in range(parts+1):
  for j in range(parts+1-i):
   ids[i,j]=len(vertices);vertices.append((i*a+j*b+(parts-i-j)*c)/parts)
 for i in range(parts):
  for j in range(parts-i):
   faces.append([ids[i,j],ids[i+1,j],ids[i,j+1]])
   if j<parts-i-1:faces.append([ids[i+1,j],ids[i+1,j+1],ids[i,j+1]])
segments=32;height=2.5
ring=[np.array([np.cos(2*np.pi*i/segments),0.,np.sin(2*np.pi*i/segments)]) for i in range(segments)]
for i in range(segments):
 a=ring[i];b=ring[(i+1)%segments];dense=(a[0]+b[0]>0 and a[2]+b[2]>0)
 subdivide(np.array([0.,height,0.]),a,b,20 if dense else 1)
 subdivide(np.zeros(3),b,a,20 if dense else 1)
uneven=np.asarray(vertices)-np.array([0.,height,0.]);uneven_faces=np.asarray(faces)
vertex_axis=max(__import__('common').pca(uneven)[2],key=lambda value:abs(float(value[1])))
surface_axis=_prop_axis_and_anchor(uneven,{'class':'pendant'},uneven_faces)[0]
angle=np.deg2rad(4);rotation=np.array([[np.cos(angle),-np.sin(angle),0.],[np.sin(angle),np.cos(angle),0.],[0.,0.,1.]])
tilted=_prop_axis_and_anchor(uneven@rotation.T,{'class':'pendant'},uneven_faces)[0]
shifted=uneven+np.array([.01,0.,0.]);shifted_anchor=_prop_axis_and_anchor(shifted,{'class':'pendant'},uneven_faces)[1]
def prism(y0,y1,cx,hx,hz,segments,vertices,faces):
 rings=[]
 for y in np.linspace(y0,y1,segments+1):
  ring=[]
  for x,z in ((cx-hx,-hz),(cx+hx,-hz),(cx+hx,hz),(cx-hx,hz)):
   ring.append(len(vertices));vertices.append((x,y,z))
  rings.append(ring)
 for segment in range(segments):
  for side in range(4):
   a=rings[segment][side];b=rings[segment][(side+1)%4]
   c=rings[segment+1][(side+1)%4];d=rings[segment+1][side]
   faces.extend(((a,b,c),(a,c,d)))
 faces.extend(((rings[0][0],rings[0][2],rings[0][1]),(rings[0][0],rings[0][3],rings[0][2]),
  (rings[-1][0],rings[-1][1],rings[-1][2]),(rings[-1][0],rings[-1][2],rings[-1][3])))
weapon_fit={'class':'weapon','handleDetection':{'peakAxialMu':.1,'handleEnd':'min'}}
weapon_vertices=[];weapon_faces=[]
prism(.2,10,0,.05,.02,100,weapon_vertices,weapon_faces)
# 护手附近同侧挂穗：扰动完整刃段 PCA，但不进入端部 2% 截片。
prism(.5,5,1.5,.03,.05,10,weapon_vertices,weapon_faces)
prism(.5,5,1.502,.03,.05,10,weapon_vertices,weapon_faces)
weapon_details={}
weapon_axis=_prop_axis_and_anchor(np.asarray(weapon_vertices),weapon_fit,
 np.asarray(weapon_faces),weapon_details)[0]
straight_vertices=[];straight_faces=[]
prism(.2,10,0,.05,.02,100,straight_vertices,straight_faces)
straight_vertices=np.asarray(straight_vertices)@rotation.T
tilted_weapon=_prop_axis_and_anchor(straight_vertices,weapon_fit,np.asarray(straight_faces))[0]
semantic_negative={}
for name in ('item_bamboo_hat','luxury_jade_pendant'):
 d=root/name;fit=json.loads((d/'fit.json').read_text());m=load_glb(d/(name+'.glb')).mesh()
 moved=m.positions+np.array([.01,0.,0.]);moved_anchor=_prop_axis_and_anchor(moved,fit,m.indices)[1]
 cutoff=np.quantile(m.positions[:,1],.99);keep=m.positions[:,1]<cutoff
 kept_faces=np.asarray(m.indices).reshape(-1,3);kept_faces=kept_faces[np.all(keep[kept_faces],axis=1)]
 used=np.unique(kept_faces);remap=np.full(len(m.positions),-1,dtype=np.int64);remap[used]=np.arange(len(used))
 missing_anchor=_prop_axis_and_anchor(m.positions[used],fit,remap[kept_faces])[1]
 semantic_negative[name]=[float(np.linalg.norm(moved_anchor)),float(np.linalg.norm(missing_anchor))]
qingfeng_fit=json.loads((root/'item_qingfeng_sword'/'fit.json').read_text())
qingfeng_waiver=_axis_check_waiver(qingfeng_fit);qingfeng_details=out['item_qingfeng_sword'][6]
waived_axis=_prop_main_axis_check(qingfeng_fit,out['item_qingfeng_sword'][1],
 qingfeng_details,qingfeng_waiver)
plain_fit=dict(qingfeng_fit);plain_fit.pop('axisCheckWaiver')
plain_axis=_prop_main_axis_check(plain_fit,out['item_qingfeng_sword'][1],qingfeng_details,None)
template=root.parent/'templates'/'tpl_f_medium';qingfeng_dir=root/'item_qingfeng_sword'
with tempfile.TemporaryDirectory() as temporary:
 plain_path=Path(temporary)/'fit.json';plain_path.write_text(json.dumps(plain_fit))
 waived_report=validate(template/'body.glb',template/'skeleton.json',
  qingfeng_dir/'item_qingfeng_sword.glb',qingfeng_dir/'fit.json','approved')
 plain_report=validate(template/'body.glb',template/'skeleton.json',
  qingfeng_dir/'item_qingfeng_sword.glb',plain_path,'approved')
invalid_waivers=[]
for missing in ('reason','approvedBy'):
 invalid_fit=dict(qingfeng_fit);invalid_fit['axisCheckWaiver']=dict(qingfeng_fit['axisCheckWaiver']);invalid_fit['axisCheckWaiver'].pop(missing)
 try:_axis_check_waiver(invalid_fit);invalid_waivers.append(None)
 except ValueError as error:invalid_waivers.append(str(error))
faces=np.array([[0,1,2],[0,2,3]]);source=np.array([[0.,0,0],[1,0,0],[1,1,0],[0,1,0]]);final=source.copy();final[2]=[0,-1,0]
flipped=_similarity_quality(source,final,faces)[0]
print(json.dumps({'props':out,'flipped':flipped,'density':[abs(float(vertex_axis[1])),surface_axis],
 'weapon':{'endToEnd':weapon_axis,'details':weapon_details,'tilted':tilted_weapon},
 'waiver':{'waived':waived_axis,'plain':plain_axis,'invalid':invalid_waivers,
  'waivedReport':{'level':waived_report['level'],'waivers':waived_report.get('waivers'),
   'axis':next(c for c in waived_report['checks'] if c['name']=='prop.mainAxisY')},
  'plainReport':{'level':plain_report['level'],'hasWaivers':'waivers' in plain_report,
   'axis':next(c for c in plain_report['checks'] if c['name']=='prop.mainAxisY')}},
 'negative':{'tilted':tilted,'tiltedPass':tilted>=.999,'shiftedAnchor':float(np.linalg.norm(shifted_anchor)),
 'shiftedPass':float(np.linalg.norm(shifted_anchor))<1e-4,'semantic':semantic_negative}}))
`));
    expect(evidence.flipped).toBe(1);
    expect(evidence.density[0]).toBeLessThan(0.99);
    expect(evidence.density[1]).toBeGreaterThan(0.999);
    expect(evidence.negative.tilted).toBeCloseTo(Math.cos(4 * Math.PI / 180), 5);
    expect(evidence.negative.tiltedPass).toBe(false);
    expect(evidence.negative.shiftedAnchor).toBeGreaterThan(0.009);
    expect(evidence.negative.shiftedPass).toBe(false);
    expect(evidence.weapon.endToEnd).toBeGreaterThan(0.999);
    expect(evidence.weapon.details.fullBladeAlignment).toBeLessThan(0.99);
    expect(evidence.weapon.details.method).toBe('end-to-end-area-weighted-blade-axis');
    expect(evidence.weapon.details.endSliceFraction).toBe(0.02);
    expect(evidence.weapon.tilted).toBeCloseTo(Math.cos(4 * Math.PI / 180), 5);
    expect(evidence.weapon.tilted).toBeLessThan(0.999);
    expect(evidence.waiver.waived.pass).toBe(true);
    expect(evidence.waiver.waived.waived).toBe(true);
    expect(evidence.waiver.waived.value.alignment).toBeCloseTo(0.9610794901, 9);
    expect(evidence.waiver.waived.value.fullBladeAlignment).toBeCloseTo(0.9748788130, 9);
    expect(evidence.waiver.plain.pass).toBe(false);
    expect(evidence.waiver.plain).not.toHaveProperty('waived');
    expect(evidence.waiver.waivedReport.level).toBe('approved');
    expect(evidence.waiver.waivedReport.waivers).toEqual(['prop.mainAxisY']);
    expect(evidence.waiver.waivedReport.axis.waived).toBe(true);
    expect(evidence.waiver.waivedReport.axis.value.alignment).toBeCloseTo(0.9610794901, 9);
    expect(evidence.waiver.plainReport.level).toBe('fail');
    expect(evidence.waiver.plainReport.hasWaivers).toBe(false);
    expect(evidence.waiver.plainReport.axis.pass).toBe(false);
    expect(evidence.waiver.invalid).toEqual([
      'axisCheckWaiver 缺少必填字段：reason',
      'axisCheckWaiver 缺少必填字段：approvedBy',
    ]);
    for (const [name, [moved, missing]] of Object.entries(evidence.negative.semantic) as
      [string, [number, number]][]) {
      expect(moved, `${name} moved current surface`).toBeGreaterThan(0.009);
      expect(missing, `${name} missing current top`).toBeGreaterThan(1e-4);
    }
    expect(evidence.props.item_qingfeng_sword[1]).toBeCloseTo(0.9610794901, 9);
    expect(evidence.props.item_qingfeng_sword[6].fullBladeAlignment).toBeCloseTo(0.9748788130, 9);
    expect(evidence.props.eq_longquanjian[1]).toBeCloseTo(0.9999505999, 9);
    expect(evidence.props.eq_longquanjian[6].fullBladeAlignment).toBeCloseTo(0.9999705215, 9);
    for (const [name, [push, axis, anchor, , direction, reversed]] of Object.entries(evidence.props) as
      [string, [unknown, number, number, number, boolean, boolean]][]) {
      expect(push, name).toBeNull();
      if (name !== 'item_qingfeng_sword') expect(axis, name).toBeGreaterThan(0.999);
      expect(anchor, name).toBeLessThan(1e-4);
      expect(direction, name).toBe(true); expect(reversed, name).toBe(false);
    }
  }, 300_000);

  it('uses strict nearest triangles for signed distance and the minus 1 mm gate', () => {
    const evidence = JSON.parse(python(`
import json,sys,numpy as np
sys.path.insert(0,'tools/model3d/dressup')
from validate import _signed_distances
vertices=[];faces=[];normals=[]
def triangle(a,b,c):
 faces.append([len(vertices),len(vertices)+1,len(vertices)+2]);vertices.extend([a,b,c]);normals.extend([(0,0,1)]*3)
triangle((0,-1,0),(0,1,0),(100,0,0))
for j in range(16):
 x=(j-7.5)*1e-4;triangle((x,-.01,-.1),(x+.01,.01,-.1),(x-.01,.01,-.1))
point=np.array([[0.,0.,-.002]]);distance=_signed_distances(
 point,np.array(vertices,float),np.array(faces),np.array(normals,float),k=16)
print(json.dumps({'distanceMu':distance.tolist(),'penetrating':int(np.count_nonzero(distance < -.001))}))
`));
    expect(evidence.distanceMu[0]).toBeCloseTo(-0.002, 12);
    expect(evidence.penetrating).toBe(1);
  }, 300_000);

  it('reconstructs A4 landmark hair and same-skeleton joint sources', () => {
    const evidence = JSON.parse(python(`
import json,sys,numpy as np
from pathlib import Path
sys.path.insert(0,'tools/model3d/dressup')
from glb_io import load_glb
from validate import _joint_source,_landmark_source,_world_mesh
base=Path('assets/default/model3d/dressup/templates/tpl_f_medium')
skeleton=json.loads((base/'skeleton.json').read_text());body=load_glb(base/'body.glb')
source=np.array([[x,y,z] for y in np.linspace(0,1,25) for x in (-.1,.1) for z in (-.04,.04)])
socket=skeleton['sockets']['headCenter'];world=np.asarray(skeleton['bindWorld'][socket['bone']]).reshape(4,4).T
target=(world@np.r_[socket['pos'],1])[:3];fit={'kind':'hair','align':{
 'method':'landmarks','scale':.5,'yawDeg':0,'headCenter':{'bone':socket['bone'],'pos':socket['pos'],'worldMu':target.tolist()},
 'skullFit':{'rows':9,'profileWidthMu':.1,'sourceInnerWidthMu':.2}}}
aligned=_landmark_source(source,fit,skeleton);cap=aligned[aligned[:,1]>=np.quantile(aligned[:,1],.92)]
bad=json.loads(json.dumps(fit));bad['align']['scale']=.4
try:_landmark_source(source,bad,skeleton);rejected=False
except ValueError:rejected=True
mesh=_world_mesh(body);joint_aligned=_joint_source(body,mesh,skeleton)
print(json.dumps({'hairAnchorError':float(np.linalg.norm(cap.mean(0)-target)),
 'hairScaleRejected':rejected,'jointMaxError':float(np.max(np.abs(joint_aligned-mesh.positions)))}))
`));
    expect(evidence.hairAnchorError).toBeLessThan(1e-12);
    expect(evidence.hairScaleRejected).toBe(true);
    expect(evidence.jointMaxError).toBeLessThan(1e-5);
  }, 300_000);

  it('runs all 72 dynamic frames for synthetic garment and hair gates', async () => {
    const base = await root();
    const evidence = JSON.parse(python(`
import hashlib,json,struct,sys,numpy as np
from pathlib import Path
sys.path.insert(0,'tools/model3d/dressup')
from glb_io import GLBBuilder,Mesh,load_glb,write_skinned_glb
from validate import _penetration_rates,_skinning_checks,validate
out=Path(sys.argv[1]);template=Path('assets/default/model3d/dressup/templates/tpl_f_medium')
body=load_glb(template/'body.glb');body_mesh=body.mesh();skeleton=json.loads((template/'skeleton.json').read_text())
head=skeleton['joints'].index('mixamorig:Head');socket=skeleton['sockets']['headCenter']
world=np.asarray(skeleton['bindWorld'][socket['bone']]).reshape(4,4).T
center=(world@np.r_[socket['pos'],1])[:3];angles=np.array([0,2*np.pi/3,4*np.pi/3])
positions=center+np.c_[.06*np.cos(angles),np.zeros(3),.06*np.sin(angles)]
joints=np.zeros((3,4),np.uint16);joints[:,0]=head;weights=np.zeros((3,4),np.float32);weights[:,0]=1
mesh=Mesh(positions,np.array([0,1,2],np.uint16),uvs=np.array([[0,0],[1,0],[.5,1]],np.float32),
 joints=joints,weights=weights,regions=np.zeros(3,np.uint8),material_indices=np.array([0]))
allowed=['mixamorig:Head'];never=['handL','handR','footL','footR']
reports={};assets={}
for kind in ('garment','hair'):
 asset=out/(kind+'.glb');write_skinned_glb(asset,mesh,body.skin(),{'unlit':True,'double_sided':True})
 if kind=='garment':source=asset;align={'method':'joints','scale':1,'yawDeg':0,'mirrored':False}
 else:
  raw=GLBBuilder();material=raw.add_material(unlit=True,double_sided=True)
  mi=raw.add_mesh(Mesh(positions,np.array([0,1,2],np.uint16),uvs=mesh.uvs,material_indices=np.array([0])),material_map=[material])
  raw.add_scene([raw.add_node(mesh=mi)]);source=out/'hair-source.glb';raw.write(source)
  align={'method':'landmarks','scale':1,'yawDeg':0,'mirrored':False,
   'headCenter':{'bone':socket['bone'],'pos':socket['pos'],'worldMu':center.tolist()},
   'skullFit':{'rows':9,'profileWidthMu':.1,'sourceInnerWidthMu':.1}}
 fit={'schema':'tianshu-dressup-fit.v1','id':'synthetic_'+kind,'kind':kind,'slot':'head' if kind=='hair' else 'body',
  'body':skeleton['source'],'template':'tpl_f_medium','mPerMu':skeleton['mPerMu'],
  'source':{'file':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()},'align':align,
  'weights':{'method':'nearest-triangle-barycentric','highConfidence':1,'maxBones':4,'jointsAllowed':allowed},
  'pushOut':{'mm':3,'iters':1,'rounds':[],'flippedTriangles':0,'stretchOutliers':0},
  'hideRegions':[],'neverHide':never,'spring':None,'stats':{'vertices':3},'fitVersion':1}
 fit_path=out/(kind+'.json');fit_path.write_text(json.dumps(fit));report=validate(
  template/'body.glb',template/'skeleton.json',asset,fit_path,'approved')
 reports[kind]={'level':report['level'],'checks':{x['name']:x['value'] for x in report['checks']}};assets[kind]=(asset,fit)
def mutate_glb(source,target,change):
 data=source.read_bytes();json_len=struct.unpack_from('<I',data,12)[0]
 document=json.loads(data[20:20+json_len]);change(document)
 payload=json.dumps(document,separators=(',',':')).encode();payload+=b' '*((-len(payload))%4)
 tail=data[20+json_len:];target.write_bytes(struct.pack('<III',0x46546c67,2,20+len(payload)+len(tail))+struct.pack('<II',len(payload),0x4e4f534a)+payload+tail)
missing_asset=out/'garment-missing-region.glb'
mutate_glb(assets['garment'][0],missing_asset,lambda document: document['meshes'][0]['primitives'][0]['attributes'].pop('_REGION'))
extra_asset=out/'garment-extra-joints.glb'
mutate_glb(assets['garment'][0],extra_asset,lambda document: document['meshes'][0]['primitives'][0]['attributes'].__setitem__('JOINTS_1',document['meshes'][0]['primitives'][0]['attributes']['JOINTS_0']))
negative_levels={
 'missingRegion':validate(template/'body.glb',template/'skeleton.json',missing_asset,out/'garment.json','approved')['level'],
 'extraJoints':validate(template/'body.glb',template/'skeleton.json',extra_asset,out/'garment.json','approved')['level']}
bad=Mesh(center+np.c_[.035*np.cos(angles),np.zeros(3),.035*np.sin(angles)],mesh.indices,
 joints=joints,weights=weights,regions=mesh.regions)
bind,dynamic=_penetration_rates(body,load_glb(assets['hair'][0]),body_mesh,bad,skeleton['mPerMu'])
bad_joints=mesh.joints.copy();bad_joints[0,0]=len(skeleton['joints'])
bad_mesh=Mesh(mesh.positions,mesh.indices,joints=bad_joints,weights=mesh.weights,regions=mesh.regions)
bad_joint_asset=out/'garment-bad-joint.glb'
write_skinned_glb(bad_joint_asset,bad_mesh,body.skin(),{'unlit':True,'double_sided':True})
bad_ibm_asset=out/'garment-bad-ibm.glb'
def shorten_ibm(document):
 accessor=document['skins'][0]['inverseBindMatrices'];document['accessors'][accessor]['count']-=1
mutate_glb(assets['garment'][0],bad_ibm_asset,shorten_ibm)
joint_checks={x['name']:x['pass'] for x in _skinning_checks(
 body,load_glb(assets['garment'][0]),bad_mesh,skeleton,assets['garment'][1])}
missing=json.loads(json.dumps(assets['hair'][1]));missing['align'].pop('headCenter')
missing_path=out/'missing.json';missing_path.write_text(json.dumps(missing))
try:validate(template/'body.glb',template/'skeleton.json',assets['hair'][0],missing_path,'approved');missing_rejected=False
except ValueError:missing_rejected=True
print(json.dumps({'reports':reports,'negative':{'bind':bind,'dynamic':dynamic,
 'jointIndices':joint_checks['weights.jointIndices'],'missingRejected':missing_rejected,**negative_levels}}))
`, base));
    for (const [asset, check] of [['garment-bad-joint.glb', 'weights.jointIndices'],
      ['garment-bad-ibm.glb', 'skeleton.ibmMaxAbs']] as const) {
      const reportPath = join(base, asset + '.report.json');
      run('python3', ['tools/model3d/dressup/validate.py', '--body',
        'assets/default/model3d/dressup/templates/tpl_f_medium/body.glb', '--skeleton',
        'assets/default/model3d/dressup/templates/tpl_f_medium/skeleton.json', '--asset',
        join(base, asset), '--fit', join(base, 'garment.json'), '--out', reportPath], 3);
      const report = JSON.parse(await readFile(reportPath, 'utf8')) as {
        level: string; checks: { name: string; pass: boolean }[] };
      expect(report.level).toBe('fail');
      expect(report.checks.find(item => item.name === check)?.pass).toBe(false);
      expect(report.checks.some(item => item.name.startsWith('penetration.'))).toBe(false);
    }
    for (const kind of ['garment', 'hair'] as const) {
      expect(evidence.reports[kind].level).toBe('approved');
      expect(evidence.reports[kind].checks['penetration.bindVertices']).toBe(0);
      for (const clip of ['idle', 'walk', 'run'])
        expect(evidence.reports[kind].checks['penetration.' + clip]).toBeLessThanOrEqual(0.005);
    }
    expect(evidence.negative.bind).toBeGreaterThan(0);
    expect(Object.values(evidence.negative.dynamic).some(value => (value as number) > 0.005)).toBe(true);
    expect(evidence.negative.jointIndices).toBe(false);
    expect(evidence.negative.missingRejected).toBe(true);
    expect(evidence.negative.missingRegion).toBe('fail');
    expect(evidence.negative.extraJoints).toBe('fail');
  }, 300_000);

  it('copies only top-level file/fit/report from non-rejected rows and records references', async () => {
    const base = await root();
    await leaf(base, 'eq_kept', 'candidate'); await leaf(base, 'eq_rejected', 'rejected');
    const copied = new Set<string>(); const references = new Map<string, Set<string>>();
    const result = await publishDressupAssets(base, true, copied, references);
    expect(result).toEqual([
      'assets/default/model3d/dressup/garments/eq_kept/eq_kept.glb',
      'assets/default/model3d/dressup/garments/eq_kept/fit.json',
      'assets/default/model3d/dressup/garments/eq_kept/report.json',
    ]);
    expect(copied).toEqual(new Set(result));
    expect(await readFile(join(base, 'apps/game/public', result[0]!), 'utf8')).toBe('glb:eq_kept');
    await expect(access(join(base, 'apps/game/public/assets/default/model3d/dressup/garments',
      'eq_rejected/eq_rejected.glb'))).rejects.toThrow();
    await expect(access(join(base, 'apps/game/public/assets/default/model3d/dressup/garments',
      'eq_kept/private.png'))).rejects.toThrow();
    expect(references.get('assets/default/model3d/dressup/garments/eq_kept/manifest.yaml'))
      .toEqual(new Set(result.map(path => '/' + path)));
    const index = JSON.parse(await readFile(join(base,
      'apps/game/public/assets/default/model3d/dressup/index.json'), 'utf8')) as {
      schema: string; groups: Record<string, Record<string, unknown>[]> };
    expect(index.schema).toBe('tianshu-dressup-index.v1');
    expect(index.groups.garment).toEqual([{
      kind: 'garment', id: 'dressup__garment__eq_kept', template: 'tpl_f_medium',
      file: '/assets/default/model3d/dressup/garments/eq_kept/eq_kept.glb',
      fit: '/assets/default/model3d/dressup/garments/eq_kept/fit.json',
      report: '/assets/default/model3d/dressup/garments/eq_kept/report.json',
      status: 'candidate', slot: 'body',
    }]);
    expect(index.groups.template).toEqual([]);
    expect(index.groups.head).toEqual([]);
    expect(index.groups.hair).toEqual([]);
    expect(index.groups.prop).toEqual([]);
    expect(index.groups.layer).toEqual([]);
  }, 300_000);

  it('publishes a report-free texture layer into the layer index group', async () => {
    const base = await root(); await layer(base);
    const result = await publishDressupAssets(base, true);
    expect(result).toEqual([
      'assets/default/model3d/dressup/garments/eq_jinzhuang_tex/eq_jinzhuang.layer.png',
      'assets/default/model3d/dressup/garments/eq_jinzhuang_tex/layer.json',
    ]);
    const index = JSON.parse(await readFile(join(base,
      'apps/game/public/assets/default/model3d/dressup/index.json'), 'utf8')) as {
      groups: { layer: Record<string, unknown>[] } };
    expect(index.groups.layer).toEqual([{
      kind: 'layer', id: 'dressup__layer__eq_jinzhuang', template: 'tpl_f_medium',
      file: '/assets/default/model3d/dressup/garments/eq_jinzhuang_tex/eq_jinzhuang.layer.png',
      fit: '/assets/default/model3d/dressup/garments/eq_jinzhuang_tex/layer.json',
      report: null, status: 'draft', slot: 'body',
    }]);
  });

  it('validates selected files even in no-copy mode', async () => {
    const base = await root(); await leaf(base, 'eq_missing', 'draft');
    await rm(join(base, 'assets/default/model3d/dressup/garments/eq_missing/report.json'));
    await expect(publishDressupAssets(base, false)).rejects.toThrow();
  }, 300_000);

  it('publishes candidate/draft fits and ignores rejected fits and source fields', async () => {
    const base = await root(); await variants(base);
    const result = await publishDressupAssets(base, true);
    expect(result).toEqual([
      'assets/default/model3d/dressup/garments/eq_variants/base-report.json',
      'assets/default/model3d/dressup/garments/eq_variants/base.glb',
      'assets/default/model3d/dressup/garments/eq_variants/fit.json',
      'assets/default/model3d/dressup/garments/eq_variants/small-fit.json',
      'assets/default/model3d/dressup/garments/eq_variants/small-report.json',
      'assets/default/model3d/dressup/garments/eq_variants/small.glb',
    ]);
    expect(result.some(path => path.includes('rejected'))).toBe(false);
    expect(result.some(path => path.includes('tall'))).toBe(false);
    const index = JSON.parse(await readFile(join(base,
      'apps/game/public/assets/default/model3d/dressup/index.json'), 'utf8')) as {
      groups: { garment: { template: string; status: string; file: string }[] } };
    expect(index.groups.garment).toHaveLength(2);
    expect(index.groups.garment.map(entry => [entry.template, entry.status, entry.file])).toEqual([
      ['tpl_f_medium', 'candidate',
        '/assets/default/model3d/dressup/garments/eq_variants/base.glb'],
      ['tpl_f_small', 'draft',
        '/assets/default/model3d/dressup/garments/eq_variants/small.glb'],
    ]);
  }, 300_000);

  it('indexes template metadata and prop sockets, then loads all real packed props', async () => {
    const base = await root();
    await mkdir(join(base, 'assets/default/model3d'), { recursive: true });
    await symlink(join(process.cwd(), 'assets/default/model3d/dressup'),
      join(base, 'assets/default/model3d/dressup'));
    await publishDressupAssets(base, true);
    const index = JSON.parse(await readFile(
      join(base, 'apps/game/public/assets/default/model3d/dressup/index.json'), 'utf8')) as DressupAssetIndex;
    for (const entry of Object.values(index.groups).flat()) {
      if (!entry.fit) continue;
      const fit = JSON.parse(await readFile(join(base, entry.fit), 'utf8'));
      if (!fit.hideMask) continue;
      expect(entry.hideMask).toBeDefined();
      const png = await readFile(join(base, entry.hideMask!));
      expect(png.subarray(1, 4).toString()).toBe('PNG');
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([fit.hideMask.size, fit.hideMask.size]);
    }
    const medium = index.groups.template.find(entry => entry.template === 'tpl_f_medium')!;
    const templateManifest = await readFile(
      medium.file.replace(/^\//u, '').replace(/[^/]+$/u, 'manifest.yaml'), 'utf8');
    const heightMatch = templateManifest.match(/^ {2}heightM:\s*([0-9.]+)\s*$/mu);
    const skeletonMatch = templateManifest.match(/^ {2}skeleton:\s*(\S+)\s*$/mu);
    expect(heightMatch).not.toBeNull(); expect(skeletonMatch).not.toBeNull();
    expect(medium).toMatchObject({
      skeleton: medium.file.replace(/[^/]+$/u, skeletonMatch![1]),
      heightM: Number(heightMatch![1]),
    });
    const realProps = await Promise.all(index.groups.prop.map(async prop => ({ prop,
      fit: JSON.parse(await readFile(prop.fit!.replace(/^\//u, ''), 'utf8')) as {
        schema: 'tianshu-dressup-fit.v1'; kind: 'prop'; id: string; socket: string;
      },
    })));
    expect(index.groups.prop.map(entry => entry.socket).sort())
      .toEqual(realProps.map(({ fit }) => fit.socket).sort());
    const packedDocuments = await Promise.all([medium.file, ...realProps.map(({ prop }) => prop.file)]
      .map(async path => glb(await readFile(path.replace(/^\//u, ''))).document));
    const expectedStats = packedDocuments.reduce((total, document) => {
      for (const mesh of document.meshes) for (const value of mesh.primitives) {
        const primitive = value as typeof value & { indices?: number };
        const accessor = document.accessors[primitive.indices ?? primitive.attributes.POSITION]!;
        total.drawCalls += 1; total.triangles += accessor.count / 3;
      }
      return total;
    }, { drawCalls: 0, triangles: 0 });

    const nativeFetch = globalThis.fetch;
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url;
      if (url.startsWith('blob:')) return nativeFetch(input);
      const path = new URL(url, 'http://localhost').pathname.replace(/^\//u, '');
      const file = join(base, 'apps/game/public', path);
      if (file.endsWith('.json')) return new Response(await readFile(file));
      return new Response(await readFile(file));
    }));
    vi.stubGlobal('ProgressEvent', class {
      constructor(readonly type: string, readonly init?: unknown) {}
    });
    vi.stubGlobal('self', globalThis);
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ close() {} })));
    const actor = await createDressupActor({
      bodyUrl: new URL(medium.file, 'http://localhost').href,
      frameUrl: new URL(medium.skeleton!, 'http://localhost').href, heightM: medium.heightM!,
      loader: createCharacterViewerLoader(),
    });
    for (const { prop, fit } of realProps) {
      await actor.equip({ kind: 'prop', id: prop.id,
        url: new URL(prop.file, 'http://localhost').href, fit });
    }
    actor.update(1 / 60);
    expect(actor.stats()).toEqual({ ...expectedStats, boneTextureUploads: 1,
      bodyLayers: [], hideMaps: [], layerTextureBytes: 0 });
    const fingerName = 'mixamorig:RightHandIndex1';
    const finger = actor.skeleton.bones.find(bone => bone.name.endsWith('RightHandIndex1'))!;
    expect(finger).toBeDefined();
    const rightHandHeld = realProps.some(({ fit }) => fit.socket === 'gripR');
    const fingerExpectation = expect(finger.quaternion.toArray());
    if (rightHandHeld) fingerExpectation.toEqual(actor.frame.fingerPose.fist[fingerName]);
    else fingerExpectation.not.toEqual(actor.frame.fingerPose.fist[fingerName]);
    actor.dispose();
  }, 300_000);

  it('packs rigid props without changing referenced vertex bytes', async () => {
    const base = await root(); const input = join(base, 'rigid.glb'); const output = join(base, 'packed.glb');
    python(`
import sys,numpy as np
sys.path.insert(0,'tools/model3d/dressup')
from glb_io import Mesh,load_glb,write_skinned_glb
body=load_glb('assets/default/model3d/dressup/templates/tpl_f_medium/body.glb')
v=np.arange(1004*3,dtype=np.float32).reshape(1004,3)/100
v[:4]=np.array([[0,0,0],[1,0,0],[1,1,0],[0,1,0]],np.float32)
n=np.arange(1004*3,dtype=np.float32).reshape(1004,3)/200
uv=np.arange(1004*2,dtype=np.float32).reshape(1004,2)/300
j=np.arange(1004*4,dtype=np.uint16).reshape(1004,4)%65
w=np.arange(1,1004*4+1,dtype=np.float32).reshape(1004,4)/5000
r=np.arange(1004,dtype=np.uint8)%7
mesh=Mesh(v,np.array([0,1,2,0,2,3],np.uint16),normals=n,uvs=uv,joints=j,weights=w,regions=r)
write_skinned_glb(sys.argv[1],mesh,body.skin(),{'unlit':True})
`, input);
    const before = glb(await readFile(input));
    const packed = run(process.execPath, ['tools/model3d/dressup/pack_glb.mjs', input, output,
      '--simplify', '0.4', '--no-meshopt']);
    const stats = JSON.parse(packed.stdout);
    expect(stats.verticesBefore).toBe(1004);
    const after = glb(await readFile(output));
    const beforePrimitive = before.document.meshes[0].primitives[0];
    const afterPrimitive = after.document.meshes[0].primitives[0];
    const readIndices = (value: ReturnType<typeof glb>, primitive: typeof beforePrimitive): number[] => {
      const accessorIndex = (primitive as unknown as { indices: number }).indices;
      const accessor = value.document.accessors[accessorIndex]; const bytes = accessorBytes(value, accessorIndex);
      return Array.from({ length: accessor.count }, (_, index) => accessor.componentType === 5123
        ? bytes.readUInt16LE(index * 2) : bytes.readUInt32LE(index * 4));
    };
    const indices = readIndices(after, afterPrimitive);
    const sourceAccessor = (afterPrimitive as unknown as {
      extras: { tianshuSourceVertexAccessor: number };
    }).extras.tianshuSourceVertexAccessor;
    const sourceBytes = accessorBytes(after, sourceAccessor);
    const sourceRows = Array.from({ length: after.document.accessors[sourceAccessor].count },
      (_, index) => sourceBytes.readUInt32LE(index * 4));
    expect(stats.verticesAfter).toBe(new Set(indices).size);
    expect(stats.verticesAfter).toBeLessThanOrEqual(4);
    expect(sourceRows).toHaveLength(stats.verticesAfter);
    expect(new Set(sourceRows).size).toBe(stats.verticesAfter);
    for (const name of ['POSITION', 'NORMAL', 'TEXCOORD_0', 'JOINTS_0', 'WEIGHTS_0', '_REGION']) {
      const original = before.document.accessors[beforePrimitive.attributes[name]];
      const compacted = after.document.accessors[afterPrimitive.attributes[name]];
      const originalBytes = accessorBytes(before, beforePrimitive.attributes[name]);
      const compactedBytes = accessorBytes(after, afterPrimitive.attributes[name]);
      const rowSize = originalBytes.length / original.count;
      expect(compacted.count).toBe(new Set(indices).size);
      for (let corner = 0; corner < indices.length; corner++)
        expect(compactedBytes.subarray(indices[corner] * rowSize, (indices[corner] + 1) * rowSize))
          .toEqual(originalBytes.subarray(sourceRows[indices[corner]] * rowSize,
            (sourceRows[indices[corner]] + 1) * rowSize));
    }
  }, 300_000);

  it('packs one legal GLB buffer and preserves skin vertex attributes', async () => {
    const base = await root(); const input = join(base, 'input.glb');
    const packedPath = join(base, 'packed.glb'); const decoded = join(base, 'decoded.glb');
    const setup = python(`
import json,sys, numpy as np
from pathlib import Path
sys.path.insert(0, 'tools/model3d/dressup')
from glb_io import GLBBuilder,Mesh, load_glb, write_skinned_glb
from validate import _close_fit_checks,_mask_checks,_material_checks,_region_check,_skinning_checks,_world_matrices,validate
body_path=Path('assets/default/model3d/dressup/templates/tpl_f_medium/body.glb');body=load_glb(body_path)
v=np.array([[x,y,z] for x in [-1,1] for y in [-1,1] for z in [-1,1]],np.float32)
f=np.array([0,1,3,0,3,2,4,6,7,4,7,5,0,4,5,0,5,1,2,3,7,2,7,6,0,2,6,0,6,4,1,5,7,1,7,3],np.uint16)
uv=np.arange(16,dtype=np.float32).reshape(8,2)/16; j=np.zeros((8,4),np.uint16)
w=np.zeros((8,4),np.float32); w[:,0]=1; r=np.array([0,0,0,0,1,1,1,1],np.uint8)
write_skinned_glb(sys.argv[1],Mesh(v,f,uvs=uv,joints=j,weights=w,regions=r),body.skin(),{'unlit':True})
asset_check=load_glb(sys.argv[1]);names=[body.json['nodes'][x]['name'] for x in body.skin().joints];missing_allowed=[c['pass'] for c in _skinning_checks(body,asset_check,asset_check.mesh(),{'joints':names},{}) if c['name'] in ('weights.jointsAllowedPresent','weights.jointsAllowed')]
allowed={'weights':{'jointsAllowed':names}};ibm_good=next(c['pass'] for c in _skinning_checks(body,asset_check,asset_check.mesh(),{'joints':names},allowed) if c['name']=='skeleton.ibmMaxAbs');ibm_accessor=asset_check.json['skins'][0].pop('inverseBindMatrices');ibm_bad=next(c['pass'] for c in _skinning_checks(body,asset_check,asset_check.mesh(),{'joints':names},allowed) if c['name']=='skeleton.ibmMaxAbs');asset_check.json['skins'][0]['inverseBindMatrices']=ibm_accessor
skin_good=next(c['pass'] for c in _skinning_checks(body,asset_check,asset_check.mesh(),{'joints':names},allowed) if c['name']=='skeleton.skinCount');skins=asset_check.json.pop('skins');skin_bad=next(c['pass'] for c in _skinning_checks(body,asset_check,asset_check.mesh(),{'joints':names},allowed) if c['name']=='skeleton.skinCount');asset_check.json['skins']=skins
material_good=[c['pass'] for c in _material_checks(asset_check,'template')];extensions=asset_check.json['materials'][0].pop('extensions');material_bad=[c['pass'] for c in _material_checks(asset_check,'template')];asset_check.json['materials'][0]['extensions']=extensions
bind=np.stack([body.world_matrix(i) for i in range(len(body.json['nodes']))]);real_animation={}
for clip in body.json['animations']:
 duration=max(float(np.asarray(body.accessor(s['input'])).max(initial=0)) for s in clip['samplers']);real_animation[clip['name']]=float(np.max(np.abs(_world_matrices(body,clip,duration*.37)-bind)))
anim=sys.argv[2]; b=GLBBuilder(); n=b.add_node(name='n',translation=[1,0,0]);b.add_scene([n]);b.add_animation('a',[{'node':n,'path':'translation','timesSec':[0,1],'values':[[1,0,0],[3,0,0]],'interpolation':'LINEAR'},{'node':n,'path':'scale','timesSec':[0,1],'values':[[1,1,1],[2,2,2]],'interpolation':'STEP'}]);b.write(anim);g=load_glb(anim);m=_world_matrices(g,g.json['animations'][0],.5)[0];g.json['animations'][0]['samplers'][0]['interpolation']='CUBICSPLINE'
try:_world_matrices(g,g.json['animations'][0],.5);rejected=False
except ValueError:rejected=True
refit=[[c['pass'] for c in _close_fit_checks(x)] for x in [{},{'refit':{'distanceP90Mm':3}},{'refit':{'distanceP90Mm':3,'sourceDistanceP90Mm':1}}]];mask=[c['pass'] for c in _mask_checks({'hideRegions':['neck'],'neverHide':['neck']},{'regions':{'ids':{'neck':1}}})];asset_mesh=asset_check.mesh();primitive=asset_check.json['meshes'][0]['primitives'][0];region=_region_check(asset_check,asset_mesh,True)['pass'];region_index=primitive['attributes']['_REGION'];spec=asset_check.json['accessors'][region_index];spec['componentType']=5123;bad_region=_region_check(asset_check,asset_mesh,True)['pass'];spec['componentType']=5121;primitive['attributes'].pop('_REGION');missing_region=_region_check(asset_check,asset_mesh,True)['pass'];primitive['attributes']['_REGION']=region_index;primitive['attributes']['JOINTS_1']=primitive['attributes']['JOINTS_0'];extra_skin=next(c['pass'] for c in _skinning_checks(body,asset_check,asset_mesh,{'joints':names},allowed) if c['name']=='weights.onlySet0');primitive['attributes'].pop('JOINTS_1')
base=Path(sys.argv[3]);pverts=np.array([[-.05,y,z] for y in [-.07,.93] for z in [-.04,.04]]+[[.05,y,z] for y in [-.07,.93] for z in [-.04,.04]],np.float32);p=GLBBuilder();mat=p.add_material(unlit=True);mi=p.add_mesh(Mesh(pverts,f,uvs=uv,material_indices=np.array([0])),material_map=[mat]);node=p.add_node(mesh=mi);p.add_scene([node]);source=base/'source.glb';p.write(source);asset=base/'prop.glb';p.write(asset);skin=body.skin();skeleton=json.loads((body_path.parent/'skeleton.json').read_text());(base/'skeleton.json').write_text(json.dumps(skeleton));import hashlib;fit={'schema':'tianshu-dressup-fit.v1','id':'synthetic_prop','kind':'prop','class':'weapon','source':{'file':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()},'body':skeleton['source'],'template':'tpl_f_medium','mPerMu':skeleton['mPerMu'],'diagnostics':{'anchorPositionMu':[0,0,0]},'up':'+Y','realSizeM':skeleton['mPerMu'],'measuredLengthMu':1,'scaleApplied':1};(base/'fit.json').write_text(json.dumps(fit));ok=validate(body_path,base/'skeleton.json',asset,base/'fit.json','approved')['level'];p.document['nodes'][0]['translation']=[0,0,0];p.write(asset);bad=validate(body_path,base/'skeleton.json',asset,base/'fit.json','approved')['level']
print(json.dumps({'animation':[m[0,3],m[0,0],rejected],'realAnimation':real_animation,'missingAllowed':missing_allowed,'skin':[skin_good,skin_bad],'ibm':[ibm_good,ibm_bad],'material':[material_good,material_bad],'refit':refit,'mask':mask,'region':[region,bad_region,missing_region],'extraSkin':extra_skin,'prop':[ok,bad]}))
`, input, join(base, 'animation.glb'), base);
    const evidence = JSON.parse(setup);
    expect(evidence.animation).toEqual([2, 1, true]);
    expect(Object.values(evidence.realAnimation).every(value => (value as number) > 0.1)).toBe(true);
    expect(evidence.missingAllowed).toEqual([false, false]);
    expect(evidence.skin).toEqual([true, false]); expect(evidence.ibm).toEqual([true, false]);
    expect(evidence.material).toEqual([[true, true], [false, true]]);
    expect(evidence.refit).toEqual([[false, false], [false, false], [true, true]]);
    expect(evidence.mask).toEqual([true, false, false]); expect(evidence.region).toEqual([true, false, false]);
    expect(evidence.extraSkin).toBe(false);
    expect(evidence.prop).toEqual(['approved', 'fail']);
    const pack = spawnSync(process.execPath, ['tools/model3d/dressup/pack_glb.mjs', input,
      packedPath, '--simplify', '0.4'], { cwd: process.cwd(), encoding: 'utf8' });
    expect(pack.stderr).toBe(''); expect(pack.status).toBe(0);
    const packed = glb(await readFile(packedPath));
    expect(packed.document.buffers).toHaveLength(1);
    expect(packed.document.bufferViews.every((view: { buffer?: number }) => (view.buffer ?? 0) === 0)).toBe(true);
    const loaded = await createCharacterViewerLoader().parseAsync(
      bytesToArrayBuffer(await readFile(packedPath)), '');
    let meshCount = 0; loaded.scene.traverse(object => { if (object.type === 'SkinnedMesh') meshCount += 1; });
    expect(meshCount).toBe(1);
    const decode = spawnSync(process.execPath, ['tools/model3d/dressup/meshopt_decode.mjs',
      packedPath, decoded], { cwd: process.cwd(), encoding: 'utf8' });
    expect(decode.stderr).toBe(''); expect(decode.status).toBe(0);
    const before = glb(await readFile(input)); const after = glb(await readFile(decoded));
    const beforePrimitive = before.document.meshes[0].primitives[0];
    const afterPrimitive = after.document.meshes[0].primitives[0];
    for (const name of ['POSITION', 'TEXCOORD_0', 'JOINTS_0', 'WEIGHTS_0', '_REGION']) {
      const original = accessorBytes(before, beforePrimitive.attributes[name]);
      expect(after.document.accessors[afterPrimitive.attributes[name]].count)
        .toBe(before.document.accessors[beforePrimitive.attributes[name]].count);
      expect(accessorBytes(after, afterPrimitive.attributes[name])).toEqual(original);
    }
    expect(accessorBytes(after, after.document.skins[0].inverseBindMatrices))
      .toEqual(accessorBytes(before, before.document.skins[0].inverseBindMatrices));
  }, 300_000);
});

function bytesToArrayBuffer(bytes: Buffer): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
