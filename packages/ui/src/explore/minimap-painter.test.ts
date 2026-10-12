/// <reference types="node" />
import { Session } from 'node:inspector/promises';
import { describe, expect, it } from 'vitest';
import { drawMinimapBase, drawMinimapOverlay, projectMinimapMarkers } from './minimap-painter';
import type { MinimapOverlay, MinimapPaintContext, MinimapPalette } from './minimap-painter';
import type { MinimapView } from './minimap-math';

class RecordingContext implements MinimapPaintContext {
  fillStyle = ''; lineWidth = 1; globalAlpha = 1; font = '';
  private currentStrokeStyle = ''; readonly strokeStyles: string[] = [];
  set strokeStyle(value: string) { this.currentStrokeStyle = value; this.strokeStyles.push(value); }
  get strokeStyle(): string { return this.currentStrokeStyle; }
  textAlign: CanvasTextAlign = 'start'; textBaseline: CanvasTextBaseline = 'alphabetic';
  readonly moves: number[] = []; readonly lines: number[] = []; readonly texts: string[] = [];
  readonly transforms: number[] = []; fills = 0; strokes = 0; arcs = 0; images = 0;
  beginPath(): void {}
  moveTo(x: number, y: number): void { this.moves.push(x, y); }
  lineTo(x: number, y: number): void { this.lines.push(x, y); }
  arc(): void { this.arcs += 1; }
  fill(): void { this.fills += 1; }
  stroke(): void { this.strokes += 1; }
  drawImage(): void { this.images += 1; }
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.transforms.push(a, b, c, d, e, f);
  }
  save(): void {} restore(): void {}
  fillText(text: string): void { this.texts.push(text); }
}

class NoopContext implements MinimapPaintContext {
  fillStyle = ''; strokeStyle = ''; lineWidth = 1; globalAlpha = 1; font = '';
  textAlign: CanvasTextAlign = 'start'; textBaseline: CanvasTextBaseline = 'alphabetic';
  beginPath(): void {} moveTo(): void {} lineTo(): void {} arc(): void {} fill(): void {} stroke(): void {}
  drawImage(): void {} setTransform(): void {} save(): void {} restore(): void {}
  fillText(): void {}
}

const view: MinimapView = { centerX: 0, centerZ: 0, metresPerPx: 0.5, sizePx: 200,
  northUp: true, basis: null };
const palette: MinimapPalette = { paper: '#eee', paperSilk: '#ddd', ink: '#111',
  inkMedium: '#444', vermilion: '#b32', blue: '#268', green: '#386',
  markerShop: '#951', markerInn: '#159', markerSacred: '#c21', markerCivic: '#123' };
const overlay: MinimapOverlay = {
  player: { x: 0, z: 0, headingRad: 0 },
  viewQuad: new Float32Array([-10, -10, 10, -10, 10, 10, -10, 10]),
  markers: [{ id: 'inn', kind: 'facility', x: 2, z: -3, icon: '客', label: '客栈',
    target: { kind: 'building', buildingId: 'bi_inn' } }],
  path: new Float32Array([0, 0, 3, -2, 6, -4]), destination: { x: 6, z: -4 },
};

describe('minimap painter', () => {
  it('positions and rotates the generated base bitmap with the current view', () => {
    const context = new RecordingContext();
    const bitmap = {} as HTMLCanvasElement;
    drawMinimapBase(context, view, { bitmap, minX: -10, minZ: -20, metresPerPx: 0.25 });
    expect(context.images).toBe(1);
    const transform = context.transforms.slice(-6);
    expect(transform[0]).toBeCloseTo(0.5); expect(transform[1]).toBeCloseTo(0);
    expect(transform[2]).toBeCloseTo(0); expect(transform[3]).toBeCloseTo(0.5);
    expect(transform.slice(4)).toEqual([80, 60]);
    drawMinimapBase(context, view, null); expect(context.images).toBe(1);
  });

  it('draws a painted affine with the player centred and changes matrix for north-up', () => {
    const base = { bitmap: {} as HTMLCanvasElement, minX: 0, minZ: 0, metresPerPx: 1,
      worldToImage: [8, 4, -8, 4, 768, 130.75] as const };
    const playerView: MinimapView = { centerX: 12, centerZ: 9, metresPerPx: 0.2,
      sizePx: 200, northUp: true, basis: new Float32Array([0, 1, 1, 0]) };
    const north = new RecordingContext(); drawMinimapBase(north, playerView, base);
    expect(north.transforms.slice(-6)).toEqual([0.3125, -0.3125, 0.625, 0.625,
      expect.closeTo(-281.71875, 6), expect.closeTo(213.28125, 6)]);
    const markerOut = new Float32Array(2);
    projectMinimapMarkers([{ ...overlay.markers[0]!, x: 12, z: 9 }], playerView, markerOut);
    expect(Array.from(markerOut)).toEqual([100, 100]);
    const camera = new RecordingContext(); drawMinimapBase(camera,
      { ...playerView, northUp: false }, base);
    expect(camera.transforms.slice(-6)).not.toEqual(north.transforms.slice(-6));
  });

  it('projects markers into a caller-owned buffer', () => {
    const output = new Float32Array(2); projectMinimapMarkers(overlay.markers, view, output);
    expect(Array.from(output)).toEqual([104, 94]);
  });

  it('draws the player arrow, path, destination, view quadrilateral and markers', () => {
    const context = new RecordingContext();
    drawMinimapOverlay(context, view, overlay, new Float32Array(2), palette);
    expect(context.strokes).toBeGreaterThanOrEqual(4);
    expect(context.fills).toBeGreaterThanOrEqual(3);
    expect(context.lines.length).toBeGreaterThanOrEqual(24);
    expect(context.moves.length).toBeGreaterThanOrEqual(8);
    expect(context.arcs).toBe(1);
    expect(context.texts).toEqual(['客']);
  });

  it('takes every marker category ring colour from the resolved theme palette', () => {
    const markers = [
      { ...overlay.markers[0]!, id: 'shop', kind: 'shop' as const },
      { ...overlay.markers[0]!, id: 'inn', kind: 'inn' as const },
      { ...overlay.markers[0]!, id: 'temple', kind: 'temple' as const },
      { ...overlay.markers[0]!, id: 'gate', kind: 'gate' as const },
    ];
    const context = new RecordingContext();
    drawMinimapOverlay(context, view, { ...overlay, player: null, viewQuad: null, path: null,
      destination: null, markers }, new Float32Array(markers.length * 2), palette);
    expect(context.strokeStyles).toEqual([
      palette.markerShop, palette.markerInn, palette.markerSacred, palette.markerCivic,
    ]);
  });

  it('samples zero steady redraw allocation after warm-up', async () => {
    const context = new NoopContext(); const markerBuffer = new Float32Array(2);
    for (let index = 0; index < 2_000; index += 1) {
      drawMinimapOverlay(context, view, overlay, markerBuffer, palette);
    }
    const session = new Session(); session.connect();
    await session.post('HeapProfiler.enable');
    await session.post('HeapProfiler.startSampling', { samplingInterval: 1,
      includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
    await session.post('HeapProfiler.collectGarbage');
    const windows: number[] = []; const cleanWindows: number[] = [];
    let previous = await session.post('HeapProfiler.getSamplingProfile');
    for (let window = 1; window <= 10 && cleanWindows.length < 3; window += 1) {
      for (let index = 0; index < 600; index += 1) {
        drawMinimapOverlay(context, view, overlay, markerBuffer, palette);
      }
      const current = await session.post('HeapProfiler.getSamplingProfile');
      const bytes = painterBytes(current.profile.head) - painterBytes(previous.profile.head);
      windows.push(bytes);
      if (bytes === 0) cleanWindows.push(window);
      else cleanWindows.length = 0;
      previous = current;
    }
    await session.post('HeapProfiler.stopSampling'); session.disconnect();
    process.stdout.write(`minimap painter sampled bytes per window: ${windows.join(',')}\n`);
    expect(cleanWindows, 'no 3 consecutive clean windows within 10: ' + windows.join(','))
      .toHaveLength(3);
  }, 20_000);
});

interface HeapSampleNode {
  readonly selfSize: number;
  readonly callFrame: { readonly functionName: string; readonly url: string };
  readonly children: readonly HeapSampleNode[];
}
function painterBytes(node: HeapSampleNode, inside = false): number {
  const entering = inside || (node.callFrame.functionName === 'drawMinimapOverlay'
    && node.callFrame.url.includes('/explore/minimap-painter.ts'));
  let total = entering ? node.selfSize : 0;
  for (const child of node.children) total += painterBytes(child, entering);
  return total;
}
