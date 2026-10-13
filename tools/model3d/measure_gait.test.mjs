import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

const root = join(import.meta.dirname, '../..');
let fixture; let workspace;

before(() => {
  workspace = mkdtempSync(join(tmpdir(), 'tianshu-measure-gait-'));
  fixture = join(workspace, 'fixture.glb');
  const script = [
    'import sys',
    `sys.path.insert(0, ${JSON.stringify(join(root, 'tools/model3d'))})`,
    'from tests_town_lod import make_fixture',
    `make_fixture(${JSON.stringify(fixture)})`,
  ].join(';');
  const result = spawnSync('python3', ['-c', script], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
after(() => rmSync(workspace, { recursive: true, force: true }));

function measured() {
  const result = spawnSync('node', [join(root, 'tools/model3d/measure_gait.mjs'), fixture],
    { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout);
}

test('measures HeadTop_End world height instead of mesh bounds', () => {
  assert.equal(measured().statureMu, 2);
});

test('uses the full cycle when low-foot contact occupies only a short window', () => {
  const value = measured();
  assert.ok(Math.abs(value.nativeHps.walk - 0.5) <= 0.01, JSON.stringify(value));
  assert.ok(Math.abs(value.slipM.walk - 0.0135) <= 0.001, JSON.stringify(value));
});

test('uses nonzero root motion below one percent of stature', () => {
  const value = measured();
  assert.ok(Math.abs(value.nativeHps.run - 0.005) <= 0.0001, JSON.stringify(value));
  assert.ok(value.slipM.run <= 1e-6, JSON.stringify(value));
});
