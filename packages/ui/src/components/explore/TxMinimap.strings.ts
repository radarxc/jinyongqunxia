export const TX_MINIMAP_STRINGS = {
  label: '城镇小地图',
  compass: '指北针',
  zoomIn: '放大小地图',
  zoomOut: '缩小小地图',
  expand: '展开全城图（M）',
  collapse: '收起全城图（M）',
  expandShort: 'M',
  collapseShort: '收',
  northUp: '切换为上北下南',
  cameraUp: '切换为跟随镜头',
  northShort: '北',
  legend: '图例',
  legendItems: ['● 设施', '◆ 出口', '人 同行与居民', '！要事', '坐 打坐处'],
  facilities: '设施',
  emptyFacilities: '暂无可前往的设施',
  markerList: '小地图地点',
  goTo: '前往',
} as const;

export function minimapDistanceText(label: string, metres: number): string {
  return `${label}，相距 ${Math.round(metres)} 米`;
}
