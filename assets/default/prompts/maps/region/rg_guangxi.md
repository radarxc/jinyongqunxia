---
asset_id: map_region_guangxi__base
kind: map
map_kind: region
name: 桂西桂北区域局部图
region_id: rg_guangxi
bounds_wgs84:
- 108.07
- 22.57
- 110.55
- 25.53
center:
- 109.34
- 24.14
neighbors:
- rg_lingnan
- rg_huxiang
- rg_dali_cangshan
- rg_yundian_qianzhong
output: assets/default/map/regions/rg_guangxi.png
manifest: assets/default/map/regions/manifest.yaml
overlay: docs/design/map/jianghu-base.svg（城市 / 门派 / 路线标签由代码叠加，图上不画字）
size: 1536x1024
orientation: 北上南下、西左东右
background: 不透明暖纸白
references:
- path: assets/default/baseline/map/ref_map_jianghu__ch01_base01.png
  use: 画风参考（作者已审）：水墨层次、纸本质感、留白与地图符号语言
- path: assets/default/baseline/map/ref_map_dali__ch01_base01.png
  use: 局部图构图参考（作者已审）：近俯视山水、地标适度夸张、北上、横向 3:2
data_sources:
- docs/design/map/regions.yaml
- docs/design/map/cities.yaml
- docs/design/map/sects.yaml
- docs/design/map/routes.yaml
- docs/design/19-world-map.md
status: ready
---

# 桂西桂北 · 区域局部图（`rg_guangxi`）

## 区域要点

| 项 | 内容 |
|---|---|
| 范围（WGS84） | 经 108.07–110.55E，纬 22.57–25.53N；中心 [109.34, 24.14] |
| 城市（3） | 桂林（大城；历代名：桂州静江府（待考） / 静江府 / 静江路；约 110.3E 25.28N）；柳州（大城；历代名：柳州 / 柳州路 / 柳州府；约 109.41E 24.32N）；南宁（大城；历代名：邕州 / 南宁路 / 南宁府；约 108.32E 22.82N） |
| 门派 / 据点（0） | 无 |
| 山系（regions.yaml 落在范围内） | — |
| 水系 | 珠江 |
| 路线（2） | 西江—桂林驿路（post_road）；黔桂滇驿路（post_road） |
| 相邻区域 | 岭南南海岸、湖湘、大理苍山、云滇黔中 |
| 相对位置 | 桂林在东北；柳州在中部；南宁在西南 |

## 提示词

```text
为《金庸群侠传·天书录》默认风格包制作一幅古风水墨地图。
题材：桂西桂北区域局部图（rg_guangxi），覆盖经度 108.07–110.55E、纬度 22.57–25.53N。书界：跨书界共用的地理底图，不写任何一代的城名。年代：山川地貌为主，建筑只用克制的城垣、缓坡瓦顶、木构屋舍、素朴佛塔等识别轮廓，不复刻明清城楼或现代景区。
参考图：assets/default/baseline/map/ref_map_jianghu__ch01_base01.png（画风）、assets/default/baseline/map/ref_map_dali__ch01_base01.png（局部图构图）；只继承已审定参考的水墨层次、纸本质感、留白和地图符号语言，不沿用其地名与方位。
地理依据：docs/design/map/regions.yaml（rg_guangxi）、cities.yaml、sects.yaml、routes.yaml。必须保持的相对位置与方向：桂林在东北；柳州在中部；南宁在西南。
主要地标：珠江。相邻区域（画面边缘延伸方向）：岭南南海岸、湖湘、大理苍山、云滇黔中。
构图：北上南下、西左东右，近俯视山水地图，横向 3:2，目标 1536×1024；主要城市用细小墨笔的城垣 / 屋舍符号标位，门派驻地用素朴殿宇或山门符号，重点地标清楚而不铺满画面。
山脉用浓淡墨和干笔皴擦，河流与湖面以留白和淡墨线表现，道路用细虚墨线。温暖纸白、细微宣纸纤维，柔和均匀纸面光，疏朗云雾；纸纹不盖住河道、城墙或佛塔。
在水面、云雾、平缓地带保留疏朗空隙供运行时叠加标签，纸白合计目标至少 35%。地图默认无人物，不生成任何文字、题字、印文或方位字。
此图为山水地图美术示意，不作精确历史疆域图或建筑复原图；山峰和地标可为识别适度夸张，但不水平翻转、不为了构图倒置东西关系。
排除项：不要文字、汉字、字母、数字、伪字、书法、题跋、印文、签名或装饰水印；不要现代城市天际线、公路、铁路、汽车、电线、现代桥梁、景区设施、卫星底图、经纬网、现代国界省界；不要跨时代城楼宫殿、日式鸟居、欧美城堡或奇幻铠甲；不要摄影写实、3D 塑料材质、赛博朋克、霓虹、动漫大眼人物；不要人物、商旅、演员面孔；不要把地图翻转或颠倒东西南北。
```

## 排除项

不要文字、汉字、字母、数字、伪字、书法、题跋、印文、签名或装饰水印；不要现代城市天际线、公路、铁路、汽车、电线、现代桥梁、景区设施、卫星底图、经纬网、现代国界省界；不要跨时代城楼宫殿、日式鸟居、欧美城堡或奇幻铠甲；不要摄影写实、3D 塑料材质、赛博朋克、霓虹、动漫大眼人物；不要人物、商旅、演员面孔；不要把地图翻转或颠倒东西南北。

## 质检要点

- 方位：北上南下、西左东右；城市与门派的相对位置与上表一致，不得镜像或为构图挪位。
- 画面无任何文字、方位字、印文；标签由代码按 design/19 叠加。
- 留白：水面 / 云雾 / 平地纸白合计 ≥ 35%，地标不铺满画面。
- 风格对基线：浓淡墨皴擦山脉、留白水面、暖纸白纤维、疏朗云雾；非摄影、非 3D、非卫星图。
- 建筑符号为克制的古代轮廓，不出现现代设施与跨时代城楼。
