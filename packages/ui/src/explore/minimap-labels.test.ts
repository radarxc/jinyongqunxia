import { describe, expect, it } from 'vitest';
import { placeMinimapLabels } from './minimap-labels';
import type { MinimapMarker } from './minimap-painter';
import daliMetadata from '../../../../assets/default/town-minimap/city_dali__ch01.json';

const names = ['苍山药肆', '南门杂货', '洱风客舍', '太和铁作', '白布衣肆', '苍洱马市',
  '南市食案', '千寻塔', '北小塔', '南小塔', '天龙寺护经殿', '祠庙', '衙署', '祠庙',
  '南门', '北门'] as const;

function marker(index: number): MinimapMarker {
  return { id: `dali-${index}`, kind: index < 7 ? index === 2 ? 'inn' : 'shop'
    : index < 10 ? 'pagoda' : index < 14 ? index === 12 ? 'office' : 'temple' : 'gate',
  x: 0, z: 0, icon: '地', label: names[index]!,
  target: { kind: 'point', x: 0, z: 0 } };
}

function overlaps(left: { left: number; top: number; width: number; height: number },
  right: { left: number; top: number; width: number; height: number }): boolean {
  return left.left < right.left + right.width && left.left + left.width > right.left
    && left.top < right.top + right.height && left.top + left.height > right.top;
}

describe('minimap greedy label placement', () => {
  it('keeps every displayed Dali label pair disjoint and retains squeezed names in source data', () => {
    const markers = daliMetadata.markers.map((row, index): MinimapMarker => ({ ...marker(index),
      id: row.id, kind: row.kind as MinimapMarker['kind'], icon: row.glyph, label: row.name }));
    const width = 936; const height = 640; const padding = 12;
    const scale = Math.min((width - padding * 2) / daliMetadata.image.width,
      (height - padding * 2) / daliMetadata.image.height);
    const offsetX = (width - daliMetadata.image.width * scale) / 2;
    const offsetY = (height - daliMetadata.image.height * scale) / 2;
    const xy = new Float32Array(markers.length * 2);
    daliMetadata.markers.forEach((row, index) => {
      xy[index * 2] = offsetX + row.px[0]! * scale;
      xy[index * 2 + 1] = offsetY + row.px[1]! * scale;
    });
    const placements = placeMinimapLabels(markers, xy, new Set(markers.map(row => row.id)),
      width, height);
    for (let left = 0; left < placements.length; left += 1)
      for (let right = left + 1; right < placements.length; right += 1)
        expect(overlaps(placements[left]!, placements[right]!)).toBe(false);
    expect(placements).toHaveLength(15);
    expect(markers.filter(row => !placements.some(value => value.marker.id === row.id))
      .map(row => row.label)).toEqual(['苍洱马市']);
    expect(markers.map(row => row.label)).toContain('苍洱马市');
  });

  it('places destination before highlighted, shops, civic and sacred markers', () => {
    const markers = [marker(7), marker(14), marker(0), marker(2)];
    const xy = new Float32Array(markers.flatMap(() => [100, 100]));
    const placements = placeMinimapLabels(markers, xy, new Set(markers.map(row => row.id)),
      200, 200, markers[2]!.id, new Set([markers[1]!.id]));
    expect(placements[0]!.marker.id).toBe(markers[2]!.id);
  });
});
