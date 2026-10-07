#!/usr/bin/env node
/**
 * 解开 GLB 的 EXT_meshopt_compression bufferView，保留 accessor 的量化与
 * normalized 声明（KHR_mesh_quantization 语义不变）。
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import { TextDecoder, TextEncoder } from 'node:util';

// three 是 packages/render 的正式依赖，不要求仓库根提升出 node_modules/three。
const renderRequire = createRequire(new URL('../../../packages/render/package.json', import.meta.url));
const decoderUrl = pathToFileURL(renderRequire.resolve('three/examples/jsm/libs/meshopt_decoder.module.js'));
const { MeshoptDecoder } = await import(decoderUrl.href);

const MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

function fail(message) {
  process.stderr.write(`错误：${message}\n`);
  return 2;
}

function parseGlb(bytes, source) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 20 || view.getUint32(0, true) !== MAGIC || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== bytes.length) {
    throw new Error(`${source} 不是有效 GLB 2.0`);
  }
  let offset = 12;
  let document;
  let binary = new Uint8Array();
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) throw new Error('GLB chunk 头截断');
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    offset += 8;
    if (length % 4 !== 0 || offset + length > bytes.length) throw new Error('GLB chunk 边界无效');
    const payload = bytes.subarray(offset, offset + length);
    if (type === JSON_CHUNK) {
      const text = new TextDecoder().decode(payload).replace(/[ \0]+$/u, '');
      document = JSON.parse(text);
    } else if (type === BIN_CHUNK) {
      binary = payload;
    }
    offset += length;
  }
  if (!document) throw new Error('GLB 缺 JSON chunk');
  return { document, binary };
}

function pad4(length) {
  return (length + 3) & ~3;
}

function encodeGlb(document, binary) {
  const encoder = new TextEncoder();
  const rawJson = encoder.encode(JSON.stringify(document));
  const json = new Uint8Array(pad4(rawJson.length));
  json.fill(0x20);
  json.set(rawJson);
  const bin = new Uint8Array(pad4(binary.length));
  bin.set(binary);
  const total = 12 + 8 + json.length + (bin.length ? 8 + bin.length : 0);
  const output = new Uint8Array(total);
  const view = new DataView(output.buffer);
  view.setUint32(0, MAGIC, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);
  let offset = 12;
  view.setUint32(offset, json.length, true);
  view.setUint32(offset + 4, JSON_CHUNK, true);
  output.set(json, offset + 8);
  offset += 8 + json.length;
  if (bin.length) {
    view.setUint32(offset, bin.length, true);
    view.setUint32(offset + 4, BIN_CHUNK, true);
    output.set(bin, offset + 8);
  }
  return output;
}

async function decodeDocument(document, inputBin) {
  await MeshoptDecoder.ready;
  const chunks = [];
  let byteLength = 0;
  let decodedViews = 0;
  const outputViews = [];
  for (const original of document.bufferViews ?? []) {
    const view = { ...original };
    const extension = view.extensions?.EXT_meshopt_compression;
    let payload;
    if (extension) {
      if (extension.buffer !== 0) throw new Error('只支持 GLB 内嵌 buffer 0 的 meshopt 源数据');
      const begin = extension.byteOffset ?? 0;
      const source = inputBin.subarray(begin, begin + extension.byteLength);
      payload = await MeshoptDecoder.decodeGltfBufferAsync(
        extension.count, extension.byteStride, source, extension.mode, extension.filter ?? 'NONE',
      );
      if (payload.length !== extension.count * extension.byteStride) throw new Error('meshopt 解压长度不符');
      const remaining = { ...(view.extensions ?? {}) };
      delete remaining.EXT_meshopt_compression;
      if (Object.keys(remaining).length) view.extensions = remaining;
      else delete view.extensions;
      view.byteLength = payload.length;
      decodedViews += 1;
    } else {
      if ((view.buffer ?? 0) !== 0) throw new Error('未压缩 bufferView 指向外部/虚拟 buffer');
      const begin = view.byteOffset ?? 0;
      payload = inputBin.slice(begin, begin + view.byteLength);
    }
    byteLength = pad4(byteLength);
    view.buffer = 0;
    view.byteOffset = byteLength;
    chunks.push({ offset: byteLength, payload });
    byteLength += payload.length;
    outputViews.push(view);
  }
  const binary = new Uint8Array(byteLength);
  for (const chunk of chunks) binary.set(chunk.payload, chunk.offset);
  document.bufferViews = outputViews;
  document.buffers = [{ byteLength: binary.length }];
  document.extensionsUsed = (document.extensionsUsed ?? []).filter((name) => name !== 'EXT_meshopt_compression');
  document.extensionsRequired = (document.extensionsRequired ?? []).filter((name) => name !== 'EXT_meshopt_compression');
  if (!document.extensionsUsed.length) delete document.extensionsUsed;
  if (!document.extensionsRequired.length) delete document.extensionsRequired;
  return { binary, decodedViews };
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('-h') || argv.includes('--help')) {
    process.stdout.write('用法：node meshopt_decode.mjs <输入.glb> <输出.glb>\n解开 EXT_meshopt_compression；保留 KHR_mesh_quantization / normalized 语义。\n');
    return 0;
  }
  if (argv.length !== 2) return fail('需要输入和输出两个路径；用 --help 查看说明');
  try {
    const input = new Uint8Array(await readFile(argv[0]));
    const { document, binary: compressed } = parseGlb(input, argv[0]);
    const { binary, decodedViews } = await decodeDocument(document, compressed);
    const output = encodeGlb(document, binary);
    await writeFile(argv[1], output);
    process.stdout.write(`${JSON.stringify({ bufferViews: document.bufferViews?.length ?? 0, decodedBufferViews: decodedViews, inputBytes: input.length, outputBytes: output.length })}\n`);
    return 0;
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main();
}
