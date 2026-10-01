---
asset_id: map_jianghu_world__ink_base
kind: map
map_kind: world_ink_base
name: 江湖万里图 · 水墨衬纸（全国底图）
output: assets/default/map/jianghu_world/ink_base.png
manifest: assets/default/map/jianghu_world/manifest.yaml
size: 4096x3072
orientation: 北上；与 docs/design/map/jianghu-base.svg 的 Albers 投影逐像素对位
background: 不透明暖纸白
status: optional
references:
- path: assets/default/baseline/map/ref_map_jianghu__ch01_base01.png
  use: 画风参考（作者已审）：水墨层次、纸本质感、留白与地图符号语言
- path: docs/design/map/jianghu-base.svg
  use: 构图锁定：海岸线、岛屿、河流、山脉位置以它的 base-geography / rivers / mountains 层为准，先用 tools/map/render_map.py --render 栅格化成图作为图片输入
data_sources:
- docs/design/19-world-map.md §2、§8.1
- docs/tech/06 D19（map/jianghu_world/base）
note: 可选项：design/19 的全国导航图是代码生成的 SVG，已可用；本任务只是给它换一张手绘水墨衬纸。是否需要由作者定。
---

# 江湖万里图 · 水墨衬纸（全国底图，可选）

## 要点

- 全国导航图本身是 `tools/map/render_map.py` 从 design/19 数据生成的 SVG（14 个时代图层），已能用；本任务只提供一张与其对位的水墨衬纸，替换 SVG 里程序化的 paper / fibers + base-geography 外观。
- 先 `python3 tools/map/render_map.py --render --out /tmp/map` 得到 `jianghu-base.svg`，栅格化为 4096×3072 PNG 作为图片输入（构图锁定）。
- 不画任何文字、城市、路线；陆地只用海岸轮廓。

## 提示词

```text
为《金庸群侠传·天书录》默认风格包制作全国江湖导航图的水墨衬纸：73°E–135°E、18°N–54°N 的中国及周边，Albers 等积圆锥投影，4:3，目标 4096×3072。
以附带的 SVG 栅格化图为唯一构图锁定：海岸线、岛屿、主要河流与山脉的位置、走向、画幅占位必须与它逐像素对位，不得挪动、简化或镜像；只把它的几何轮廓重新演绎为水墨质感。
参考图：assets/default/baseline/map/ref_map_jianghu__ch01_base01.png，只继承水墨层次、纸本质感与留白语言。
山脉用浓淡墨和干笔皴擦，河流与湖海以留白和淡墨线表现；温暖纸白、细微宣纸纤维、柔和均匀纸面光、疏朗云雾；不画城市、门派、道路、题签与任何文字（这些由代码按时代图层叠加）。
陆地只用海岸轮廓，不画现代国界、省界、经纬网。整体明度偏亮、对比克制，保证上层叠加的朱印、城池符号与文字可读。
排除项：不要文字、汉字、字母、数字、伪字、书法、题跋、印文、签名或装饰水印；不要现代城市天际线、公路、铁路、汽车、电线、现代桥梁、景区设施、卫星底图、经纬网、现代国界省界；不要跨时代城楼宫殿、日式鸟居、欧美城堡或奇幻铠甲；不要摄影写实、3D 塑料材质、赛博朋克、霓虹、动漫大眼人物；不要人物、商旅、演员面孔；不要把地图翻转或颠倒东西南北。
```

## 排除项

不要文字、汉字、字母、数字、伪字、书法、题跋、印文、签名或装饰水印；不要现代城市天际线、公路、铁路、汽车、电线、现代桥梁、景区设施、卫星底图、经纬网、现代国界省界；不要跨时代城楼宫殿、日式鸟居、欧美城堡或奇幻铠甲；不要摄影写实、3D 塑料材质、赛博朋克、霓虹、动漫大眼人物；不要人物、商旅、演员面孔；不要把地图翻转或颠倒东西南北。

## 质检要点

- 与 SVG 栅格图叠加对比：海岸线与主要河流偏差 ≤ 8 px（4096 宽）。
- 无文字、无城市符号、无现代边界。
- 明度与对比克制，叠加文字后可读。
