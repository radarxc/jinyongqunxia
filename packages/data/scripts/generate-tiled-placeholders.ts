import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

const root = resolve(import.meta.dirname, '../../../.cache/content-build/tiled-placeholders');
const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value; for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ crc >>> 1 : crc >>> 1;
  return crc >>> 0;
});
const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff; for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255]! ^ crc >>> 8;
  return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type: string, bytes: Uint8Array): Buffer => {
  const name = Buffer.from(type); const result = Buffer.alloc(bytes.byteLength + 12);
  result.writeUInt32BE(bytes.byteLength, 0); name.copy(result, 4); Buffer.from(bytes).copy(result, 8);
  result.writeUInt32BE(crc32(Buffer.concat([name, bytes])), bytes.byteLength + 8); return result;
};
function png(width: number, height: number, color: readonly number[]): Buffer {
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4);
  header[8] = 8; header[9] = 6;
  const scanline = Buffer.alloc(width * 4 + 1);
  for (let x = 0; x < width; x += 1) for (let channel = 0; channel < 4; channel += 1)
    scanline[1 + x * 4 + channel] = color[channel]!;
  const raw = Buffer.concat(Array.from({ length: height }, () => scanline));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)), chunk('IEND', new Uint8Array())]);
}
async function main(): Promise<void> {
  await mkdir(root, { recursive: true });
  await writeFile(resolve(root, 'terrain.png'), png(48 * 8, 48 * 6, [82, 111, 70, 255]));
  await writeFile(resolve(root, 'height.png'), png(48 * 11, 48, [100, 108, 120, 255]));
  console.log(`tiled placeholders: wrote ${root} (generated cache; do not commit)`);
}
void main();
