import { describe, expect, it } from 'vitest';
import { GRID_SIZE, LABEL_FONT, centerOnGrid, sectViewNodes, shortNodeName, clampView, cleanNodeName, coverScale, drawableRoads,
  gridToImage, gridToScreen, imageToGrid, imageToScreen, landmarkForNode, layoutLabels, markerSize,
  nearestOpenNode, panView, pointAlongPath, resizeView, roadDegrees, roadPaths, screenToGrid, screenToImage,
  zoomAt } from './painted-view';
import type { LabelPriority, Point, Size, ViewNode, ViewRoad, ViewState } from './painted-view';

const image: Size = { width: 4800, height: 3600 };
const viewport: Size = { width: 1200, height: 800 };
function node(id: string, point: Point = [256, 192], kind: ViewNode['kind'] = 'town', open = true): ViewNode {
  return { id, name: id, point, kind, open };
}
function road(key: string, start: string, end: string, eras = ['ch01'], kind = 'post_road'): ViewRoad {
  return { key, start, end, eras, kind, points: [[0, 0], [128, 192], [512, 384]] };
}
function expectCovered(view: ViewState, size = viewport): void {
  const cover = coverScale(image, size);
  expect(view.s).toBeGreaterThanOrEqual(cover); expect(view.s).toBeLessThanOrEqual(4 * cover);
  expect(view.tx).toBeLessThanOrEqual(0); expect(view.ty).toBeLessThanOrEqual(0);
  expect(view.tx + image.width * view.s).toBeGreaterThanOrEqual(size.width - 1e-9);
  expect(view.ty + image.height * view.s).toBeGreaterThanOrEqual(size.height - 1e-9);
}

describe('painted map coordinates and view limits', () => {
  it('maps the entire 512 x 384 grid to actual image pixels and back', () => {
    expect(gridToImage([512, 384], image)).toEqual([4800, 3600]);
    expect(imageToGrid([1200, 1800], image)).toEqual([128, 192]);
    for (const size of [image, { width: 2048, height: 1536 }]) {
      const view = centerOnGrid({ s: 0.8, tx: 0, ty: 0 }, [256, 192], size, viewport);
      for (const point of [[0, 0], [253.5, 181.25], [512, 384]] as const) {
        const screen = gridToScreen(point, view, size); const roundtrip = screenToGrid(screen, view, size);
        expect(roundtrip[0]).toBeCloseTo(point[0]); expect(roundtrip[1]).toBeCloseTo(point[1]);
        expect(imageToScreen(gridToImage(point, size), view)).toEqual(screen);
        expect(screenToImage(screen, view)).toEqual(gridToImage(roundtrip, size));
      }
    }
  });

  it('keeps every viewport corner inside after arbitrary pans and pointer zooms', () => {
    for (const size of [viewport, { width: 1920, height: 935 }, { width: 390, height: 844 }]) {
      let view = clampView({ s: -100, tx: 1e6, ty: -1e6 }, image, size);
      for (let i = 0; i < 180; i++) {
        const delta: Point = [Math.sin(i * 17) * 1e5, Math.cos(i * 23) * 1e5];
        view = panView(view, delta, image, size); expectCovered(view, size);
        view = zoomAt(view, (i % 11 - 2) * coverScale(image, size),
          [i * 73 % size.width, i * 137 % size.height], image, size);
        expectCovered(view, size);
        for (const corner of [[0, 0], [size.width, size.height]] as const) {
          const point = screenToGrid(corner, view, image);
          expect(point[0]).toBeGreaterThanOrEqual(-1e-9); expect(point[0]).toBeLessThanOrEqual(512 + 1e-9);
          expect(point[1]).toBeGreaterThanOrEqual(-1e-9); expect(point[1]).toBeLessThanOrEqual(384 + 1e-9);
        }
      }
    }
  });

  it('keeps the pointer map point fixed whenever edge clamping is unnecessary', () => {
    const view = centerOnGrid({ s: 0.5, tx: 0, ty: 0 }, [256, 192], image, viewport);
    const pointer: Point = [350, 240]; const before = screenToGrid(pointer, view, image);
    const zoomed = zoomAt(view, 0.75, pointer, image, viewport);
    expect(screenToGrid(pointer, zoomed, image)[0]).toBeCloseTo(before[0]);
    expect(screenToGrid(pointer, zoomed, image)[1]).toBeCloseTo(before[1]);
    expect(zoomAt(zoomed, view.s, pointer, image, viewport)).toEqual(view);
    const maximum = zoomAt(view, 100, pointer, image, viewport);
    expect(zoomAt(maximum, 100, pointer, image, viewport)).toEqual(maximum);
  });

  it('combines moving pinch midpoints and scale before edge clamping', () => {
    const view = { s: 0.5, tx: -100, ty: -200 };
    const from: Point = [400, 300]; const to: Point = [200, 300];
    const anchor = screenToGrid(from, view, image);
    const pinched = zoomAt(view, 0.3, from, image, viewport, to);
    const result = gridToScreen(anchor, pinched, image);
    expect(result[0]).toBeCloseTo(to[0]); expect(result[1]).toBeCloseTo(to[1]);
    expect(pinched.tx).toBe(-100); expectCovered(pinched);
  });

  it.each([{ width: 1920, height: 935 }, { width: 390, height: 844 }])(
    'covers the viewport exactly on one axis at minimum zoom ($width x $height)', size => {
      const view = clampView({ s: 0, tx: 0, ty: 0 }, image, size);
      expectCovered(view, size);
      expect(Math.min(image.width * view.s - size.width, image.height * view.s - size.height))
        .toBeCloseTo(0);
    });

  it('centres a grid point, with edge clamping at map corners', () => {
    const centred = centerOnGrid({ s: 0.6, tx: 0, ty: 0 }, [256, 192], image, viewport);
    expect(gridToScreen([256, 192], centred, image)).toEqual([600, 400]);
    const corner = centerOnGrid(centred, [0, 0], image, viewport);
    expect(corner.tx).toBe(0); expect(corner.ty).toBe(0); expectCovered(corner);
  });

  it('preserves the centre map point across resize and reclamps scale and translation', () => {
    const view = centerOnGrid({ s: 0.5, tx: 0, ty: 0 }, [256, 192], image, viewport);
    const portrait = { width: 390, height: 844 };
    const resized = resizeView(view, image, viewport, portrait);
    expect(screenToGrid([195, 422], resized, image)).toEqual([256, 192]);
    expect(resized.s).toBe(view.s); expectCovered(resized, portrait);
    const large = { width: 4000, height: 2400 };
    expectCovered(resizeView(resized, image, portrait, large), large);
    expectCovered(resizeView({ s: 99, tx: -1e8, ty: 1e8 }, image, viewport, portrait), portrait);
  });
});

describe('painted map roads and labels', () => {
  const a = node('city_a'); const b = node('city_b'); const c = node('city_c', [260, 192], 'town', false);
  const roads = [road('open', a.id, b.id), road('other-era', a.id, b.id, ['ch02']),
    road('closed', a.id, c.id), road('missing', a.id, 'city_missing')];

  it('only draws current-era roads with both endpoints open and counts those connections', () => {
    const visible = drawableRoads(roads, [a, b, c], 'ch01');
    expect(visible.map(row => row.key)).toEqual(['open']);
    expect([...roadDegrees(visible)]).toEqual([['city_a', 1], ['city_b', 1]]);
    expect(drawableRoads(roads, [a, b, c], 'ch03')).toEqual([]);
  });

  it('builds unsmoothed image-pixel polylines with the prescribed style classes', () => {
    const kinds = ['imperial_road', 'post_road', 'silk_road', 'caravan_road', 'mountain_road', 'approach'];
    const paths = roadPaths(kinds.map(kind => road(kind, a.id, b.id, ['ch01'], kind)), image);
    expect(paths.map(path => path.className)).toEqual(
      ['road-solid', 'road-solid', 'road-dashed', 'road-dashed', 'road-dotted', 'road-approach']);
    expect(paths.every(path => path.d === 'M 0 0 L 1200 1800 L 4800 3600')).toBe(true);
    expect(roadPaths(drawableRoads(roads, [a, b, c], 'ch01'), GRID_SIZE)[0]?.d)
      .toBe('M 0 0 L 128 192 L 512 384');
  });

  it('cleans both historical suffixes and estimates fixed screen text boxes', () => {
    expect(cleanNodeName('  西州（待考）地区所指治所  ')).toBe('西州');
    expect(cleanNodeName('江陵(待考)所指治所')).toBe('江陵');
    const labels = layoutLabels([{ ...a, name: '西州（待考）地区所指治所' },
      { ...b, point: [400, 192], name: '一二三四五六' }],
    { s: 1, tx: 0, ty: 0 }, GRID_SIZE, GRID_SIZE);
    expect(labels.map(label => [label.name, label.width, label.height])).toEqual([['西州', 44, 22], ['一二三四五六', 84, 22]]);
  });

  it('deterministically prefers degree, then towns, then lexicographic id without mutating nodes', () => {
    const ruin = node('rs_a', [256, 192], 'ruin');
    const nodes = [ruin, b, a]; const view = { s: 1, tx: 0, ty: 0 };
    const draw = (rows: ViewNode[], degrees = new Map<string, number>()) =>
      layoutLabels(rows, view, GRID_SIZE, GRID_SIZE, {}, degrees);
    expect(draw(nodes)).toEqual(draw([...nodes].reverse()));
    expect(draw(nodes).filter(label => label.visible).map(label => label.id)).toEqual([a.id]);
    expect(draw(nodes, new Map([[ruin.id, 2]])).filter(label => label.visible).map(label => label.id)).toEqual([ruin.id]);
    expect(nodes.map(row => row.id)).toEqual([ruin.id, b.id, a.id]);
  });

  it.each(['selectedId', 'currentNodeId', 'destinationId'] as const)('%s takes priority over road degree', key => {
    const priority: LabelPriority = { [key]: b.id };
    const labels = layoutLabels([a, b, c], { s: 1, tx: 0, ty: 0 }, GRID_SIZE, GRID_SIZE,
      priority, new Map([[a.id, 99]]));
    expect(labels.filter(label => label.visible).map(label => label.id)).toEqual([b.id]);
    expect(labels).toHaveLength(2);
  });

  it('allows disjoint labels and ignores offscreen nodes during collision allocation', () => {
    const labels = layoutLabels([node('city_a', [-1, 192]), node('city_b', [20, 192]),
      node('city_c', [120, 192]), node('city_d', [120, 217])],
    { s: 1, tx: 0, ty: 0 }, GRID_SIZE, GRID_SIZE);
    expect(labels.map(label => label.visible)).toEqual([false, true, true, true]);
  });
});

describe('nearest open node', () => {
  it('uses an inclusive 28 screen-pixel radius at every zoom and skips closed nodes', () => {
    for (const s of [0.3, 0.6, 1]) {
      const a = node('city_a'); const screen = gridToScreen(a.point, { s, tx: -100, ty: -80 }, image);
      const view = { s, tx: -100, ty: -80 };
      expect(nearestOpenNode([a], [screen[0] + 28, screen[1]], view, image)).toBe(a);
      expect(nearestOpenNode([a], [screen[0] + 28.01, screen[1]], view, image)).toBeNull();
      expect(nearestOpenNode([{ ...a, open: false }], screen, view, image)).toBeNull();
    }
  });

  it('chooses nearest distance before id and breaks exact ties deterministically', () => {
    const view = { s: 1, tx: 0, ty: 0 }; const a = node('city_a', [100, 100]); const b = node('city_b', [120, 100]);
    expect(nearestOpenNode([a, b], [115, 100], view, GRID_SIZE)).toBe(b);
    expect(nearestOpenNode([b, a], [110, 100], view, GRID_SIZE)).toBe(a);
  });
});

describe('terrain road paths, tiers and landmarks (tech/13 §5)', () => {
  it('draws a smoothed path through pinned ends and keeps two-point paths straight', () => {
    const size: Size = { width: 512, height: 384 };
    const curved = roadPaths([{ ...road('r', 'a', 'b'), path: [[0, 0], [10, 5], [20, 0]] }], size)[0]!.d;
    expect(curved.startsWith('M 0 0 C ')).toBe(true);
    expect(curved.endsWith(' 20 0')).toBe(true);
    expect(curved.match(/ C /g)).toHaveLength(2);
    expect(roadPaths([{ ...road('r', 'a', 'b'), path: [[0, 0], [20, 0]] }], size)[0]!.d).toBe('M 0 0 L 20 0');
    expect(roadPaths([road('r', 'a', 'b')], size)[0]!.d).toBe('M 0 0 L 128 192 L 512 384');
  });

  it('walks a path by arc length in either direction and clamps the fraction', () => {
    const path: Point[] = [[0, 0], [30, 0], [30, 10]];
    expect(pointAlongPath(path, 0)).toEqual([0, 0]);
    expect(pointAlongPath(path, 0.5)).toEqual([20, 0]);
    expect(pointAlongPath(path, 1)).toEqual([30, 10]);
    expect(pointAlongPath(path, 0.25, true)).toEqual([30, 0]);
    expect(pointAlongPath(path, -2)).toEqual([0, 0]);
    expect(pointAlongPath(path, 9)).toEqual([30, 10]);
    expect(pointAlongPath([[5, 5], [5, 5]], 0.5)).toEqual([5, 5]);
  });

  it('interpolates marker size between the z = 1 and z = 4 bounds per tier', () => {
    expect(markerSize('capital', 1)).toBe(44);
    expect(markerSize('capital', 4)).toBe(96);
    expect(markerSize('major', 2.5)).toBe(38);
    expect(markerSize(undefined, 0.2)).toBe(18);
    expect(markerSize('site', 9)).toBe(26);
  });

  it('ranks labels by tier after the important set and sizes text by tier', () => {
    const tiered = [{ ...node('city_a', [100, 100]), tier: 'minor' as const },
      { ...node('city_b', [101, 100]), tier: 'capital' as const }];
    const view: ViewState = { s: 1, tx: 0, ty: 0 };
    const labels = layoutLabels(tiered, view, { width: 512, height: 384 }, { width: 512, height: 384 });
    expect(labels.map(label => [label.id, label.visible, label.font])).toEqual([
      ['city_b', true, LABEL_FONT.capital], ['city_a', false, LABEL_FONT.minor]]);
    const selected = layoutLabels(tiered, view, { width: 512, height: 384 }, { width: 512, height: 384 },
      { selectedId: 'city_a' });
    expect(selected[0]!.id).toBe('city_a');
  });

  it('places the label below a taller icon and picks the chapter landmark by id', () => {
    const view: ViewState = { s: 1, tx: 0, ty: 0 };
    const [label] = layoutLabels([node('city_a', [100, 100])], view, { width: 512, height: 384 },
      { width: 512, height: 384 }, {}, new Map(), () => 30);
    expect(label!.labelY).toBe(132);
    const entry = (id: string, chapters: string[]) => ({ id, node: 'city_a', chapters, url: `/${id}.webp`,
      anchor: [10, 20] as Point, footprintGrid: 8, width: 100, height: 80 });
    const index = [entry('z_late', ['ch05']), entry('b_tang', ['ch10']), entry('a_tang', ['ch10'])];
    expect(landmarkForNode(index, 'city_a', 'ch10')?.id).toBe('a_tang');
    expect(landmarkForNode(index, 'city_a', 'ch01')).toBeNull();
    expect(landmarkForNode(index, 'city_b', 'ch10')).toBeNull();
  });
});

describe('map label names', () => {
  it('drops bracketed seat notes for the label but never empties a name', () => {
    expect(shortNodeName('长安（京城·雍州）')).toBe('长安');
    expect(shortNodeName('洱海河蛮城邑（羁縻曾州，待考）')).toBe('洱海河蛮城邑');
    expect(shortNodeName('大理（待考）地区所指治所')).toBe('大理');
    expect(shortNodeName('厦门厅 / 同安县海口')).toBe('厦门厅 / 同安县海口');
    expect(shortNodeName('（待考）')).toBe('');
    expect(shortNodeName('(Kashgar)')).toBe('(Kashgar)');
  });
});

describe('sect seats on the map (tech/13 §5.4)', () => {
  const sect = (id: string, status: 'O' | 'H' | 'P' | 'M', point: Point = [100, 100]) =>
    ({ id, name: id, siteName: '', point, status, marker: 'sect', cityId: null });
  it('draws open and hidden seats only, hidden ones quietly', () => {
    const nodes = sectViewNodes([sect('sect_o', 'O'), sect('sect_h', 'H'), sect('sect_p', 'P'), sect('sect_m', 'M')]);
    // Sorted by id so fan-out slots are deterministic.
    expect(nodes.map(node => [node.id, node.tier, Boolean(node.quiet)])).toEqual([
      ['sect_h', 'sect', true], ['sect_o', 'sect', false]]);
  });
  it('ranks sects between major and minor, and quiet seats never reserve label space', () => {
    const view: ViewState = { s: 1, tx: 0, ty: 0 }; const size: Size = { width: 512, height: 384 };
    const nodes: ViewNode[] = [{ ...node('city_minor', [100, 100]), tier: 'minor' },
      ...sectViewNodes([sect('sect_o', 'O', [101, 100]), sect('sect_h', 'H', [100, 100])]),
      { ...node('city_major', [102, 100]), tier: 'major' }];
    const labels = layoutLabels(nodes, view, size, size);
    // Tier first (sect above minor); quiet only breaks ties within a tier and never blocks others.
    // Sect icons always stay; a colliding sect only loses its name.
    expect(labels.map(label => [label.id, label.visible, label.quiet, label.labelHidden])).toEqual([
      ['city_major', true, false, false], ['sect_o', true, false, true], ['sect_h', true, true, true],
      ['city_minor', false, false, false]]);
  });
});

describe('sect seats sharing a town spot', () => {
  const sect = (id: string, point: Point) => ({ id, name: id, siteName: '', point, status: 'O' as const,
    marker: 'sect', cityId: null });
  it('fans co-located seats around the town in id order and leaves lone seats in place', () => {
    const town: ViewNode = { ...node('city_a', [100, 100]), tier: 'major' };
    const nodes = sectViewNodes([sect('sect_b', [100, 100]), sect('sect_a', [100.5, 100]), sect('sect_far', [120, 90])], [town]);
    expect(nodes.map(n => [n.id, n.screenOffset ?? null])).toEqual([
      ['sect_a', [17, -17]], ['sect_b', [17, 17]], ['sect_far', null]]);
    const view: ViewState = { s: 1, tx: 0, ty: 0 }; const size: Size = { width: 512, height: 384 };
    const labels = layoutLabels([town, ...nodes], view, size, size);
    const byId = new Map(labels.map(label => [label.id, label]));
    expect([byId.get('sect_a')!.x, byId.get('sect_a')!.y]).toEqual([100.5 + 17, 100 - 17]);
    expect([byId.get('sect_far')!.x, byId.get('sect_far')!.y]).toEqual([120, 90]);
  });
});
