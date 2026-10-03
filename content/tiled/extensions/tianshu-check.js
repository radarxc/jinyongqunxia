/* global tiled, TileMap */
// Fast authoring feedback only; the TypeScript compiler remains authoritative.
tiled.registerAction('TianshuCheckMap', function () {
  const map = tiled.activeAsset;
  if (!map || !map.isTileMap) { tiled.alert('请先打开一张天书录地图。'); return; }
  const required = ['terrain', 'height', 'deco', 'objects'];
  const names = [];
  for (let index = 0; index < map.layerCount; index += 1) names.push(map.layerAt(index).name);
  const missing = required.filter((name) => !names.includes(name));
  const duplicate = names.filter((name, index) => names.indexOf(name) !== index);
  const properties = ['regionId', 'sceneId', 'chapterScope', 'eraLayer', 'schemaVersion'];
  const absent = properties.filter((name) => map.property(name) === undefined);
  const errors = [];
  if (map.orientation !== TileMap.Orthogonal) errors.push('orientation 必须为 orthogonal');
  if (map.infinite) errors.push('地图必须为有限地图');
  if (missing.length) errors.push('缺图层: ' + missing.join(', '));
  if (duplicate.length) errors.push('重图层: ' + [...new Set(duplicate)].join(', '));
  if (absent.length) errors.push('缺地图属性: ' + absent.join(', '));
  tiled.alert(errors.length ? errors.join('\n') : '快速检查通过；请再运行 pnpm content:validate。');
});
tiled.extendMenu('Map', [{ action: 'TianshuCheckMap', before: 'MapProperties' }]);
