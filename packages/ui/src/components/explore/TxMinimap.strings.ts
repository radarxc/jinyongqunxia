export const TX_MINIMAP_STRINGS = {
  label: '城镇小地图',
  compass: '司南：勺柄指南',
  zoomIn: '放大主画面',
  zoomOut: '缩小主画面',
  zoomSlider: '主画面缩放',
  expand: '展开全城图（M）',
  collapse: '收起全城图（M）',
  expandShort: '图',
  collapseShort: '收',
  northUp: '切换为上北下南',
  cameraUp: '切换为跟随镜头',
  northShort: '司',
  mapShort: '图',
  legend: '图例',
  legendItems: ['赭 店铺', '青 客栈', '朱 寺塔', '墨 城门与衙署', '· 任务相关人物'],
  facilities: '设施',
  emptyFacilities: '暂无可前往的设施',
  markerList: '小地图地点',
  goTo: '前往',
} as const;

export function minimapDistanceText(label: string, metres: number): string {
  return `${label}，相距 ${Math.round(metres)} 米`;
}
