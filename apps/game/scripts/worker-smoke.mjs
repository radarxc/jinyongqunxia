/* global clearTimeout, setTimeout */
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';

// Executes the emitted module in a real isolated thread; this is not a browser test.
const directory = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const filename = (await readdir(directory)).find((name) => /^core-worker-.*\.js$/.test(name));
if (!filename) throw new Error('Build apps/game before running the Worker smoke check.');
const worker = new Worker(`
  import { parentPort, workerData } from 'node:worker_threads';
  globalThis.addEventListener = (type, fn) => {
    if (type === 'message') parentPort.on('message', data => fn({ data, origin: '' }));
  };
  globalThis.postMessage = (...args) => parentPort.postMessage(...args);
  import(workerData).catch(error => { throw error; });
`, { eval: true, execArgv: ['--input-type=module'], workerData: pathToFileURL(resolve(directory, filename)).href });
const pending = new Map();
let ordinal = 0;
worker.on('message', (data) => {
  const task = pending.get(data.id);
  if (!task) return;
  pending.delete(data.id); clearTimeout(task.timer);
  if (data.type === 'RAW') task.resolve(data.value);
  else task.reject(new Error(JSON.stringify(data)));
});
worker.on('error', (error) => {
  for (const task of pending.values()) { clearTimeout(task.timer); task.reject(error); }
  pending.clear();
});
function rpc(path, args = []) {
  return new Promise((resolve, reject) => {
    const id = String(++ordinal);
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('RPC_TIMEOUT')); }, 5000);
    pending.set(id, { resolve, reject, timer });
    worker.postMessage({ id, type: 'APPLY', path: [path], argumentList: args.map(value => ({ type: 'RAW', value })) });
  });
}
try {
  const view = await rpc('query');
  assert.equal(view.hud.preview, true);
  const meridians = view.characters.find(row => row.relation === 'self').detail.meridians;
  assert.equal(meridians.length, 20);
  assert.equal(meridians.reduce((count, row) => count + row.points.length, 0), 180);
  assert.equal(JSON.stringify(view.characters).includes('npc_xiaofeng'), false);
  assert.equal(view.characters.find(row => row.key === 'npc_duanyu').faction, '大理段氏');
  const initial = await rpc('snapshot');
  const result = await rpc('dispatch', [{ t: 'inventory/equip', itemId: 'eq_qinggangjian', slot: 'mainHand' }]);
  assert.equal(result.accepted, true);
  assert.equal(result.changes.equipment[0].item.id, 'eq_qinggangjian');
  assert.equal(result.changes.characters, undefined);
  await rpc('restore', [initial]);
  assert.deepEqual(await rpc('snapshot'), initial);
  console.log(`Worker smoke PASS: ${view.inventory.length} items, ${view.characters.length} cards, 20 meridians / 180 acupoints; query, dispatch and restore.`);
} finally {
  for (const task of pending.values()) clearTimeout(task.timer);
  await worker.terminate();
}
