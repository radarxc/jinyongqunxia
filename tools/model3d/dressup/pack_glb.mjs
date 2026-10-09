#!/usr/bin/env node
/** 换装 GLB 减面、无损清除未引用顶点并编码 EXT_meshopt_compression。 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import { TextDecoder, TextEncoder } from 'node:util';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
const MAGIC = 0x46546c67; const JSON_CHUNK = 0x4e4f534a; const BIN_CHUNK = 0x004e4942;
const COMPONENT = { 5120: [Int8Array, 1], 5121: [Uint8Array, 1], 5122: [Int16Array, 2],
  5123: [Uint16Array, 2], 5125: [Uint32Array, 4], 5126: [Float32Array, 4] };
const WIDTH = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
const pad4 = value => (value + 3) & ~3;

function fail(message) { process.stderr.write('错误：' + message + '\n'); return 2; }
function parse(bytes, source) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 20 || view.getUint32(0, true) !== MAGIC || view.getUint32(4, true) !== 2 ||
      view.getUint32(8, true) !== bytes.length) throw new Error(source + ' 不是有效 GLB 2.0');
  let offset = 12; let document; let binary = new Uint8Array();
  while (offset < bytes.length) {
    const length = view.getUint32(offset, true); const type = view.getUint32(offset + 4, true); offset += 8;
    const payload = bytes.subarray(offset, offset + length); offset += length;
    if (type === JSON_CHUNK) document = JSON.parse(new TextDecoder().decode(payload).replace(/[ \0]+$/u, ''));
    else if (type === BIN_CHUNK) binary = payload;
  }
  if (!document) throw new Error('GLB 缺 JSON chunk');
  return { document, binary };
}
function encode(document, binary) {
  const raw = new TextEncoder().encode(JSON.stringify(document));
  const json = new Uint8Array(pad4(raw.length)); json.fill(0x20); json.set(raw);
  const bin = new Uint8Array(pad4(binary.length)); bin.set(binary);
  const total = 12 + 8 + json.length + (bin.length ? 8 + bin.length : 0);
  const output = new Uint8Array(total); const view = new DataView(output.buffer);
  view.setUint32(0, MAGIC, true); view.setUint32(4, 2, true); view.setUint32(8, total, true);
  let offset = 12; view.setUint32(offset, json.length, true); view.setUint32(offset + 4, JSON_CHUNK, true);
  output.set(json, offset + 8); offset += 8 + json.length;
  if (bin.length) { view.setUint32(offset, bin.length, true); view.setUint32(offset + 4, BIN_CHUNK, true); output.set(bin, offset + 8); }
  return output;
}
function append(binary, payload) {
  const offset = pad4(binary.length); const result = new Uint8Array(offset + payload.length);
  result.set(binary); result.set(payload, offset); return [result, offset];
}
async function decodeCompression(document, input) {
  if (!(document.extensionsUsed ?? []).includes('EXT_meshopt_compression'))
    return { binary: input, decoded: false };
  await MeshoptDecoder.ready;
  let binary = new Uint8Array();
  for (const view of document.bufferViews ?? []) {
    const extension = view.extensions?.EXT_meshopt_compression;
    let payload;
    if (extension) {
      if (extension.buffer !== 0) throw new Error('只支持 GLB 内嵌 buffer 0 的 meshopt 数据');
      const source = input.subarray(extension.byteOffset ?? 0,
        (extension.byteOffset ?? 0) + extension.byteLength);
      payload = await MeshoptDecoder.decodeGltfBufferAsync(extension.count,
        extension.byteStride, source, extension.mode, extension.filter ?? 'NONE');
      const remaining = { ...(view.extensions ?? {}) };
      delete remaining.EXT_meshopt_compression;
      if (Object.keys(remaining).length) view.extensions = remaining;
      else delete view.extensions;
      view.byteLength = payload.length;
    } else {
      if ((view.buffer ?? 0) !== 0) throw new Error('bufferView 指向外部 buffer');
      payload = input.slice(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    }
    let offset; [binary, offset] = append(binary, payload);
    view.buffer = 0; view.byteOffset = offset;
  }
  document.extensionsUsed = (document.extensionsUsed ?? [])
    .filter(name => name !== 'EXT_meshopt_compression');
  document.extensionsRequired = (document.extensionsRequired ?? [])
    .filter(name => name !== 'EXT_meshopt_compression');
  if (!document.extensionsUsed.length) delete document.extensionsUsed;
  if (!document.extensionsRequired.length) delete document.extensionsRequired;
  document.buffers = [{ byteLength: binary.length }];
  return { binary, decoded: true };
}
function accessorData(document, binary, index) {
  const accessor = document.accessors[index]; const view = document.bufferViews[accessor.bufferView];
  if ((view.buffer ?? 0) !== 0 || accessor.sparse) throw new Error('accessor 不支持外部 buffer/sparse: ' + index);
  const [Type, bytes] = COMPONENT[accessor.componentType] ?? []; const width = WIDTH[accessor.type];
  if (!Type || !width) throw new Error('accessor component/type 不支持: ' + index);
  const item = bytes * width; const stride = view.byteStride ?? item;
  const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const packed = new Uint8Array(accessor.count * item);
  for (let row = 0; row < accessor.count; row++)
    packed.set(binary.subarray(start + row * stride, start + row * stride + item), row * item);
  return { array: new Type(packed.buffer), packed, accessor, width, bytes };
}
function appendAccessor(document, binary, source, rows, target) {
  const data = accessorData(document, binary, source);
  const item = data.width * data.bytes; const payload = new Uint8Array(rows.length * item);
  for (let row = 0; row < rows.length; row++)
    payload.set(data.packed.subarray(rows[row] * item, (rows[row] + 1) * item), row * item);
  let offset; [binary, offset] = append(binary, payload);
  const viewIndex = document.bufferViews.length;
  document.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: payload.length, target });
  const accessor = { ...data.accessor, bufferView: viewIndex, byteOffset: 0, count: rows.length };
  delete accessor.sparse;
  if (accessor.min || accessor.max) {
    const selected = rows.map(row => data.array.subarray(row * data.width, (row + 1) * data.width));
    accessor.min = Array.from({ length: data.width }, (_, column) =>
      selected.reduce((value, itemValue) => Math.min(value, itemValue[column]), Infinity));
    accessor.max = Array.from({ length: data.width }, (_, column) =>
      selected.reduce((value, itemValue) => Math.max(value, itemValue[column]), -Infinity));
  }
  document.accessors.push(accessor);
  return { binary, index: document.accessors.length - 1 };
}
function appendIndices(document, binary, values) {
  const max = values.reduce((value, item) => Math.max(value, item), 0);
  const Type = max <= 65535 ? Uint16Array : Uint32Array;
  const array = Type.from(values); const payload = new Uint8Array(array.buffer);
  let offset; [binary, offset] = append(binary, payload);
  const viewIndex = document.bufferViews.length;
  document.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: payload.length, target: 34963 });
  document.accessors.push({ bufferView: viewIndex, byteOffset: 0,
    componentType: Type === Uint16Array ? 5123 : 5125, count: array.length, type: 'SCALAR',
    min: [array.reduce((a, b) => Math.min(a, b), Infinity)],
    max: [max] });
  return { binary, index: document.accessors.length - 1 };
}
function appendVertexMap(document, binary, values) {
  const array = Uint32Array.from(values); const payload = new Uint8Array(array.buffer);
  let offset; [binary, offset] = append(binary, payload);
  const viewIndex = document.bufferViews.length;
  document.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: payload.length });
  document.accessors.push({ bufferView: viewIndex, byteOffset: 0, componentType: 5125,
    count: array.length, type: 'SCALAR', min: [array.reduce((a, b) => Math.min(a, b), Infinity)],
    max: [array.reduce((a, b) => Math.max(a, b), 0)] });
  return { binary, index: document.accessors.length - 1 };
}
function accessorReferences(document) {
  const refs = [];
  for (const mesh of document.meshes ?? []) for (const primitive of mesh.primitives ?? []) {
    if (primitive.indices !== undefined) refs.push([primitive, 'indices']);
    const sourceMap = primitive.extras?.tianshuSourceVertexAccessor;
    if (sourceMap !== undefined) refs.push([primitive.extras, 'tianshuSourceVertexAccessor']);
    for (const attributes of [primitive.attributes, ...(primitive.targets ?? [])])
      for (const name of Object.keys(attributes ?? {})) refs.push([attributes, name]);
  }
  for (const skin of document.skins ?? [])
    if (skin.inverseBindMatrices !== undefined) refs.push([skin, 'inverseBindMatrices']);
  for (const animation of document.animations ?? []) for (const sampler of animation.samplers ?? [])
    refs.push([sampler, 'input'], [sampler, 'output']);
  for (const node of document.nodes ?? []) {
    const attributes = node.extensions?.EXT_mesh_gpu_instancing?.attributes;
    for (const name of Object.keys(attributes ?? {})) refs.push([attributes, name]);
  }
  return refs;
}
function prune(document, binary) {
  const refs = accessorReferences(document); const usedAccessors = [...new Set(refs.map(([owner, key]) => owner[key]))];
  const accessorMap = new Map(usedAccessors.map((old, index) => [old, index]));
  document.accessors = usedAccessors.map(index => document.accessors[index]);
  for (const [owner, key] of refs) owner[key] = accessorMap.get(owner[key]);
  const usedViews = [...new Set([...document.accessors.map(value => value.bufferView),
    ...(document.images ?? []).map(value => value.bufferView)].filter(value => value !== undefined))];
  const viewMap = new Map(usedViews.map((old, index) => [old, index])); let packed = new Uint8Array();
  document.bufferViews = usedViews.map(index => {
    const view = document.bufferViews[index]; const source = binary.slice(view.byteOffset ?? 0,
      (view.byteOffset ?? 0) + view.byteLength); let offset; [packed, offset] = append(packed, source);
    return { ...view, buffer: 0, byteOffset: offset };
  });
  for (const accessor of document.accessors) accessor.bufferView = viewMap.get(accessor.bufferView);
  for (const image of document.images ?? [])
    if (image.bufferView !== undefined) image.bufferView = viewMap.get(image.bufferView);
  document.buffers = [{ byteLength: packed.length }]; return packed;
}
function floats(data) {
  if (data.array instanceof Float32Array) return new Float32Array(data.array);
  const output = new Float32Array(data.array.length); const bits = data.bytes * 8;
  const signed = data.array instanceof Int8Array || data.array instanceof Int16Array;
  const divisor = data.accessor.normalized ? (signed ? 2 ** (bits - 1) - 1 : 2 ** bits - 1) : 1;
  for (let index = 0; index < output.length; index++)
    output[index] = data.accessor.normalized && signed ? Math.max(data.array[index] / divisor, -1) : data.array[index] / divisor;
  return output;
}
function lockedVertices(document, binary, primitive, positions, meshIndex) {
  const count = positions.accessor.count; const lock = new Uint8Array(count);
  const indices = primitive.indices === undefined ? Uint32Array.from({ length: count }, (_, i) => i) :
    new Uint32Array(accessorData(document, binary, primitive.indices).array);
  const edges = new Map();
  for (let i = 0; i < indices.length; i += 3) for (const [a, b] of
    [[indices[i], indices[i + 1]], [indices[i + 1], indices[i + 2]], [indices[i + 2], indices[i]]]) {
    const key = a < b ? a + ':' + b : b + ':' + a; edges.set(key, (edges.get(key) ?? 0) + 1);
  }
  const regionIndex = primitive.attributes._REGION;
  if (regionIndex !== undefined) {
    const regions = accessorData(document, binary, regionIndex).array;
    for (let index = 0; index < regions.length; index++) if (regions[index] === 1) lock[index] = 1;
    for (const key of edges.keys()) {
      const [left, right] = key.split(':').map(Number);
      if (regions[left] !== regions[right]) { lock[left] = 1; lock[right] = 1; }
    }
  }
  const meshNode = document.nodes?.find(node => node.mesh === meshIndex && node.skin !== undefined);
  const skin = meshNode === undefined ? undefined : document.skins?.[meshNode.skin];
  const neckJoint = skin?.joints?.findIndex(nodeIndex =>
    document.nodes?.[nodeIndex]?.name === 'mixamorig:Neck');
  if (neckJoint !== undefined && neckJoint >= 0 && primitive.attributes.JOINTS_0 !== undefined &&
      primitive.attributes.WEIGHTS_0 !== undefined) {
    const joints = accessorData(document, binary, primitive.attributes.JOINTS_0);
    const weights = floats(accessorData(document, binary, primitive.attributes.WEIGHTS_0));
    for (let vertex = 0; vertex < count; vertex++) for (let column = 0; column < joints.width; column++)
      if (joints.array[vertex * joints.width + column] === neckJoint &&
          weights[vertex * joints.width + column] > 0.5) lock[vertex] = 1;
  }
  return { lock, indices };
}
async function simplify(document, binary, ratio) {
  await MeshoptSimplifier.ready;
  let before = 0; let after = 0; let locked = 0;
  for (let meshIndex = 0; meshIndex < (document.meshes ?? []).length; meshIndex++)
  for (const primitive of document.meshes[meshIndex].primitives ?? []) {
    if ((primitive.mode ?? 4) !== 4 || primitive.indices === undefined) continue;
    if (primitive.attributes.TEXCOORD_0 === undefined)
      throw new Error('减面要求 primitive 含 TEXCOORD_0，避免属性丢失');
    const hasJoints = primitive.attributes.JOINTS_0 !== undefined;
    const hasWeights = primitive.attributes.WEIGHTS_0 !== undefined;
    if (hasJoints !== hasWeights) throw new Error('JOINTS_0/WEIGHTS_0 必须同时存在');
    const positionData = accessorData(document, binary, primitive.attributes.POSITION);
    const positions = floats(positionData);
    const { lock, indices } = lockedVertices(document, binary, primitive, positionData, meshIndex);
    locked += lock.reduce((sum, value) => sum + value, 0); before += indices.length / 3;
    const attributes = []; const weights = [];
    // UV 与连续 WEIGHTS 是误差通道；JOINTS / _REGION 只用于锁离散边界。
    if (primitive.attributes.TEXCOORD_0 !== undefined) {
      const uv = accessorData(document, binary, primitive.attributes.TEXCOORD_0);
      attributes.push(floats(uv)); weights.push(1, 1);
    }
    if (hasWeights) { const skinWeights = accessorData(document, binary, primitive.attributes.WEIGHTS_0);
      attributes.push(floats(skinWeights)); weights.push(...Array(skinWeights.width).fill(1)); }
    const attributeStride = weights.length; const vertexAttributes = new Float32Array(positionData.accessor.count * attributeStride);
    for (let vertex = 0; vertex < positionData.accessor.count; vertex++) { let column = 0;
      for (const values of attributes) { const width = values.length / positionData.accessor.count;
        vertexAttributes.set(values.subarray(vertex * width, (vertex + 1) * width), vertex * attributeStride + column); column += width; } }
    const target = Math.max(3, Math.floor(indices.length * ratio / 3) * 3);
    const [simplified] = MeshoptSimplifier.simplifyWithAttributes(indices, positions, 3,
      vertexAttributes, attributeStride, weights, lock, target, 1e-2, ['LockBorder']);
    after += simplified.length / 3;
    const bytes = new Uint8Array(simplified.buffer, simplified.byteOffset, simplified.byteLength);
    let offset; [binary, offset] = append(binary, bytes);
    const viewIndex = document.bufferViews.length;
    document.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, target: 34963 });
    document.accessors.push({ bufferView: viewIndex, componentType: 5125, count: simplified.length,
      type: 'SCALAR', min: [Number(simplified.reduce((a, b) => Math.min(a, b), Infinity))],
      max: [Number(simplified.reduce((a, b) => Math.max(a, b), 0))] });
    primitive.indices = document.accessors.length - 1;
  }
  document.buffers[0].byteLength = binary.length;
  return { binary, before, after, locked };
}
function compactVertices(document, binary) {
  let before = 0; let after = 0;
  for (const mesh of document.meshes ?? []) for (const primitive of mesh.primitives ?? []) {
    if (primitive.indices === undefined || primitive.attributes?.POSITION === undefined) continue;
    const position = accessorData(document, binary, primitive.attributes.POSITION);
    const sourceIndices = accessorData(document, binary, primitive.indices).array;
    const rows = [...new Set(Array.from(sourceIndices, Number))].sort((left, right) => left - right);
    const previousMap = primitive.extras?.tianshuSourceVertexAccessor;
    const previousRows = previousMap === undefined ? undefined :
      accessorData(document, binary, previousMap).array;
    const sourceRows = previousRows === undefined ? rows : rows.map(row => Number(previousRows[row]));
    const remap = new Int32Array(position.accessor.count); remap.fill(-1);
    for (let index = 0; index < rows.length; index++) {
      if (rows[index] < 0 || rows[index] >= remap.length) throw new Error('primitive 索引越过 POSITION');
      remap[rows[index]] = index;
    }
    const indices = Uint32Array.from(sourceIndices, value => remap[Number(value)]);
    if (!rows.length) throw new Error('不支持空索引 primitive');
    before += position.accessor.count; after += rows.length;
    for (const attributes of [primitive.attributes, ...(primitive.targets ?? [])])
      for (const name of Object.keys(attributes ?? {})) {
        const source = attributes[name]; const accessor = document.accessors[source];
        if (accessor.count !== position.accessor.count)
          throw new Error(`${name} 顶点数与 POSITION 不同`);
        const result = appendAccessor(document, binary, source, rows, 34962);
        binary = result.binary; attributes[name] = result.index;
      }
    const result = appendIndices(document, binary, indices);
    binary = result.binary; primitive.indices = result.index;
    const mapping = appendVertexMap(document, binary, sourceRows);
    binary = mapping.binary; primitive.extras = { ...(primitive.extras ?? {}),
      tianshuSourceVertexAccessor: mapping.index };
  }
  document.buffers[0].byteLength = binary.length;
  return { binary: prune(document, binary), before, after };
}

async function compress(document, original) {
  // EXT 的 fallback 与压缩 payload 同属 GLB 唯一 BIN；即使 required，
  // 核心 bufferView 也必须落在真实存在的 buffer 内。
  await MeshoptEncoder.ready; let binary = new Uint8Array(); let fallbackLength = 0;
  for (let viewIndex = 0; viewIndex < (document.bufferViews ?? []).length; viewIndex++) {
    const view = document.bufferViews[viewIndex];
    if ((view.buffer ?? 0) !== 0) continue;
    let stride = view.byteStride;
    const mode = view.target === 34963 ? 'TRIANGLES' : 'ATTRIBUTES';
    const accessors = document.accessors.filter(value => value.bufferView === viewIndex);
    if (stride === undefined && accessors.length === 1) {
      const accessor = accessors[0]; const component = COMPONENT[accessor.componentType]?.[1];
      stride = component === undefined ? undefined : component * WIDTH[accessor.type];
    }
    const source = original.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    const canEncode = stride !== undefined && source.length % stride === 0 &&
      (mode === 'TRIANGLES' ? [2, 4].includes(stride) : stride % 4 === 0);
    if (!canEncode) {
      let offset; [binary, offset] = append(binary, source);
      view.buffer = 0; view.byteOffset = offset; continue;
    }
    const encoded = MeshoptEncoder.encodeGltfBuffer(source, source.length / stride, stride, mode);
    let offset; [binary, offset] = append(binary, encoded);
    // required-mode 不供无扩展客户端读取；仍给核心 bufferView 一个真实
    // BIN 内的合法范围，所有压缩 view 可共享这段 fallback 占位。
    view.buffer = 0; view.byteOffset = 0; fallbackLength = Math.max(fallbackLength, view.byteLength);
    view.extensions = { ...(view.extensions ?? {}), EXT_meshopt_compression: {
      buffer: 0, byteOffset: offset, byteLength: encoded.length,
      byteStride: stride, count: source.length / stride, mode, filter: 'NONE',
    } };
  }
  document.extensionsUsed = [...new Set([...(document.extensionsUsed ?? []), 'EXT_meshopt_compression'])];
  document.extensionsRequired = [...new Set([...(document.extensionsRequired ?? []), 'EXT_meshopt_compression'])];
  if (binary.length < fallbackLength) {
    const padded = new Uint8Array(fallbackLength); padded.set(binary); binary = padded;
  }
  document.buffers = [{ byteLength: binary.length }];
  return binary;
}

function triangles(document) {
  let total = 0;
  for (const mesh of document.meshes ?? []) for (const primitive of mesh.primitives ?? [])
    if ((primitive.mode ?? 4) === 4 && primitive.indices !== undefined)
      total += document.accessors[primitive.indices].count / 3;
  return total;
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('-h') || argv.includes('--help')) {
    process.stdout.write('用法：node pack_glb.mjs <输入.glb> <输出.glb> [--simplify <ratio>] [--no-meshopt]\n');
    process.stdout.write('减面后按索引无损压缩全部顶点属性；LockBorder + vertex_lock 锁拓扑与 _REGION 边界。\n');
    return 0;
  }
  const positional = []; let ratio; let meshopt = true;
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === '--simplify') ratio = Number(argv[++index]);
    else if (argv[index] === '--no-meshopt') meshopt = false;
    else if (argv[index].startsWith('-')) return fail('未知参数：' + argv[index]);
    else positional.push(argv[index]);
  }
  if (positional.length !== 2) return fail('需要输入和输出两个路径；用 --help 查看说明');
  if (ratio !== undefined && !(ratio > 0 && ratio <= 1)) return fail('--simplify 必须在 (0, 1]');
  try {
    const input = new Uint8Array(await readFile(positional[0]));
    let { document, binary } = parse(input, positional[0]);
    const decoded = await decodeCompression(document, binary); binary = decoded.binary;
    const before = triangles(document);
    let stats = { before, after: before, locked: 0 };
    if (ratio !== undefined && ratio < 1) {
      const result = await simplify(document, binary, ratio); binary = result.binary; stats = result;
    }
    const vertices = compactVertices(document, binary); binary = vertices.binary;
    if (meshopt) binary = await compress(document, binary);
    const output = encode(document, binary); await mkdir(dirname(positional[1]), { recursive: true });
    await writeFile(positional[1], output);
    process.stdout.write(JSON.stringify({ trianglesBefore: before, trianglesAfter: triangles(document),
      verticesBefore: vertices.before, verticesAfter: vertices.after, lockedVertices: stats.locked,
      inputBytes: input.length, outputBytes: output.length, decodedMeshopt: decoded.decoded, meshopt }) + '\n');
    return 0;
  } catch (error) { return fail(error instanceof Error ? error.message : String(error)); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = await main();
