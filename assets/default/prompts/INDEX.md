# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）

> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。
> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。

提示词 **1160** 份：已入库 1005、已通过（作者） 132、待出图 23。**待出图队列 23 行**（`python3 tools/agents/build_image_index.py --queue`）。

## 出图 agent 怎么用

1. 先读本节与「出图位置约定」，再读目标组的 `GUIDE.md`（`items/GUIDE.md`、`maps/GUIDE.md`、`rig/GUIDE.md`），最后读每张图自己的提示词文件（frontmatter = 输出路径 / 规格 / 参考图；正文 = 要点、完整提示词、排除项、质检要点）。
2. 列出能做的行：`python3 tools/agents/build_image_index.py --queue --group maps`（`--json` 给脚本用）。队列 = 图片文件尚不存在的行 + `items/REDO.md` 里作者点名重出的 ID。
3. 每行：加载 frontmatter `references` 里的参考图 → 按「提示词」生成 2 张候选选 1 张（有明确缺陷再补，单轮 ≤ 4 张）→ 按 `output` 存 PNG（文件名 = asset_id 或指定名）→ 在 `manifest` 追加一条（字段见 `assets/README.md`：id、file、category、style、subject、prompt、negative、references、tool、model、created、source_path、size、sha256、`status: candidate`）→ 跑该组 GUIDE 里的检查命令。
4. 不要改提示词文件和本索引；每出完一张就重新运行本脚本，已入库的行会从本索引删掉（作者 10-01：做完一个就删掉对应条目）。已出的图与审批状态看各目录 `manifest.yaml` 和素材总览页；作者的审批在审批页做，`candidate` 不等于通过。

## 出图位置约定

| 类别 | 输出 PNG | 登记清单 | 规格 |
|---|---|---|---|
| 物品 | `assets/default/item/<类>/<物品ID>.png` | `assets/default/item/<类>/manifest.yaml` | 1536×1536（≥1024），不透明浅暖灰底 RGB(230,225,216)，单一物品、四边留白 ≥10% |
| 区域地图 | `assets/default/map/regions/<rg_id>.png` | `assets/default/map/regions/manifest.yaml` | 1536×1024，北上，不透明暖纸白，无文字（标签由代码叠加） |
| 全国水墨衬纸（可选） | `assets/default/map/jianghu_world/ink_base.png` | `assets/default/map/jianghu_world/manifest.yaml` | 4096×3072，与 `docs/design/map/jianghu-base.svg` 对位 |
| 角色部件 | `assets/default/rig/<set>/ref_<view>.png`、`assets/default/rig/<set>/<view>/<part>.png` | `assets/default/rig/<set>/manifest.yaml`（`tianshu-rig.v1`，由 `tools/rig/make_parts.py` 写） | 透明 RGBA，256 px/m，画布见各文件 |
| 建筑 / 贴片（已出齐） | `assets/default/building-map/<kit>/`、`assets/default/tile/<kit>/` | 各目录 `manifest.yaml` | 45° 俯视 2:1，透明 RGBA |

运行时怎么找到这些图：根 `CLAUDE.md`「素材接入」与 `apps/game/CLAUDE.md`「素材」一节——构建时从 `assets/default/<类别>/` 按 manifest 复制到 `apps/game/public/assets/default/`，运行时只认 manifest 里 `status` 不为 `rejected` 的条目。

## 待出图队列

| 组 | asset_id | 名称 | 输出 | 状态 | 提示词 |
|---|---|---|---|---|---|
| items | `it_nansongduanwenqin` | 南宋断纹琴 | `assets/default/item/collectibles/it_nansongduanwenqin.png` | 待出图 | [it_nansongduanwenqin.md](items/collectibles/it_nansongduanwenqin.md) |
| items | `it_qingjiaoyeqin` | 清式蕉叶琴 | `assets/default/item/collectibles/it_qingjiaoyeqin.png` | 待出图 | [it_qingjiaoyeqin.md](items/collectibles/it_qingjiaoyeqin.md) |
| items | `it_songqingshiyuwenyan` | 青石鱼纹砚 | `assets/default/item/collectibles/it_songqingshiyuwenyan.png` | 待出图 | [it_songqingshiyuwenyan.md](items/collectibles/it_songqingshiyuwenyan.md) |
| items | `it_suijinxiangyubei` | 隋式镶金玉杯 | `assets/default/item/collectibles/it_suijinxiangyubei.png` | 待出图 | [it_suijinxiangyubei.md](items/collectibles/it_suijinxiangyubei.md) |
| items | `it_wenzhengmingchibifu` | 文徵明《赤壁赋》页 | `assets/default/item/collectibles/it_wenzhengmingchibifu.png` | 待出图 | [it_wenzhengmingchibifu.md](items/collectibles/it_wenzhengmingchibifu.md) |
| items | `it_wuzhouzhuseqin` | 武周朱漆琴 | `assets/default/item/collectibles/it_wuzhouzhuseqin.png` | 待出图 | [it_wuzhouzhuseqin.md](items/collectibles/it_wuzhouzhuseqin.md) |
| items | `it_yuanqinshufang` | 元代书房琴 | `assets/default/item/collectibles/it_yuanqinshufang.png` | 待出图 | [it_yuanqinshufang.md](items/collectibles/it_yuanqinshufang.md) |
| items | `it_yuanzhushan` | 元式素竹扇 | `assets/default/item/collectibles/it_yuanzhushan.png` | 待出图 | [it_yuanzhushan.md](items/collectibles/it_yuanzhushan.md) |
| items | `it_yuejinyubi` | 越地缀金礼璧 | `assets/default/item/collectibles/it_yuejinyubi.png` | 待出图 | [it_yuejinyubi.md](items/collectibles/it_yuejinyubi.md) |
| items | `it_yuemubaitie` | 越地木牍拜简 | `assets/default/item/collectibles/it_yuemubaitie.png` | 待出图 | [it_yuemubaitie.md](items/collectibles/it_yuemubaitie.md) |
| items | `it_yuetongjian` | 越地素面铜鉴 | `assets/default/item/collectibles/it_yuetongjian.png` | 待出图 | [it_yuetongjian.md](items/collectibles/it_yuetongjian.md) |
| items | `it_yuewuseqin` | 越地乌漆礼琴 | `assets/default/item/collectibles/it_yuewuseqin.png` | 待出图 | [it_yuewuseqin.md](items/collectibles/it_yuewuseqin.md) |
| items | `it_yueyushiwen` | 越地玉石盟辞摹片 | `assets/default/item/collectibles/it_yueyushiwen.png` | 待出图 | [it_yueyushiwen.md](items/collectibles/it_yueyushiwen.md) |
| items | `it_zhenlongqiju` | 珍珑棋局图 | `assets/default/item/collectibles/it_zhenlongqiju.png` | 待出图 | [it_zhenlongqiju.md](items/collectibles/it_zhenlongqiju.md) |
| items | `it_zuqianqiujiubei` | 祖千秋酒杯组 | `assets/default/item/collectibles/it_zuqianqiujiubei.png` | 待出图 | [it_zuqianqiujiubei.md](items/collectibles/it_zuqianqiujiubei.md) |
| maps | `map_jianghu_world__ink_base` | 江湖万里图 · 水墨衬纸（全国底图） | `assets/default/map/jianghu_world/ink_base.png` | 待出图 | [jianghu_world_ink_base.md](maps/jianghu_world_ink_base.md) |
| maps | `map_region_donghai_islands__base` | 东海诸岛区域局部图 | `assets/default/map/regions/rg_donghai_islands.png` | 待出图 | [rg_donghai_islands.md](maps/region/rg_donghai_islands.md) |
| maps | `map_region_huxiang__base` | 湖湘区域局部图 | `assets/default/map/regions/rg_huxiang.png` | 待出图 | [rg_huxiang.md](maps/region/rg_huxiang.md) |
| maps | `map_region_jianghuai__base` | 江淮区域局部图 | `assets/default/map/regions/rg_jianghuai.png` | 待出图 | [rg_jianghuai.md](maps/region/rg_jianghuai.md) |
| maps | `map_region_jiangxi__base` | 江西区域局部图 | `assets/default/map/regions/rg_jiangxi.png` | 待出图 | [rg_jiangxi.md](maps/region/rg_jiangxi.md) |
| maps | `map_region_qilu__base` | 齐鲁区域局部图 | `assets/default/map/regions/rg_qilu.png` | 待出图 | [rg_qilu.md](maps/region/rg_qilu.md) |
| maps | `map_region_qingzang__base` | 青藏区域局部图 | `assets/default/map/regions/rg_qingzang.png` | 待出图 | [rg_qingzang.md](maps/region/rg_qingzang.md) |
| maps | `map_region_yundian_qianzhong__base` | 云滇黔中区域局部图 | `assets/default/map/regions/rg_yundian_qianzhong.png` | 待出图 | [rg_yundian_qianzhong.md](maps/region/rg_yundian_qianzhong.md) |

## 物品（11 类，名录 1045 项）

每张图的提示词在各文件「提示词」节。下表只列还要出的行（待出图 / 待重出），已入库的不再列出，标题里的计数含已出部分。作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可回到队列。

### 药物 / 补品 / 药材（96）· 已入库 64、已通过（作者） 32

（已全部入库。）

### 食材 / 食品（174）· 已入库 146、已通过（作者） 28

（已全部入库。）

### 武学秘籍（180）· 已入库 180

（已全部入库。）

### 兵器（247）· 已入库 223、已通过（作者） 24

（已全部入库。）

### 衣物（30）· 已入库 18、已通过（作者） 12

（已全部入库。）

### 制式盔甲（8）· 已入库 8

（已全部入库。）

### 内甲（8）· 已通过（作者） 8

（已全部入库。）

### 护肩 / 披风 / 头饰（48）· 已入库 36、已通过（作者） 12

（已全部入库。）

### 鞋（26）· 已入库 18、已通过（作者） 8

（已全部入库。）

### 腰带（26）· 已入库 18、已通过（作者） 8

（已全部入库。）

### 暗器（51）· 已入库 51

（已全部入库。）

## 地图（31）· 已入库 23、待出图 8

全国导航图是 `tools/map/render_map.py` 从 design/19 数据生成的 SVG（14 个时代图层），**不是出图任务**。要画的是 30 个区域的水墨局部图（类比作者已审的大理苍洱局部图）；全国水墨衬纸为可选项。下表只列还要出的。

| # | 名称 | asset_id | 输出 | 图 | 提示词 |
|---:|---|---|---|---|---|
| 1 | 东海诸岛区域局部图 | `map_region_donghai_islands__base` | `assets/default/map/regions/rg_donghai_islands.png` | 待出图 | [rg_donghai_islands.md](maps/region/rg_donghai_islands.md) |
| 2 | 湖湘区域局部图 | `map_region_huxiang__base` | `assets/default/map/regions/rg_huxiang.png` | 待出图 | [rg_huxiang.md](maps/region/rg_huxiang.md) |
| 3 | 江淮区域局部图 | `map_region_jianghuai__base` | `assets/default/map/regions/rg_jianghuai.png` | 待出图 | [rg_jianghuai.md](maps/region/rg_jianghuai.md) |
| 4 | 江西区域局部图 | `map_region_jiangxi__base` | `assets/default/map/regions/rg_jiangxi.png` | 待出图 | [rg_jiangxi.md](maps/region/rg_jiangxi.md) |
| 5 | 齐鲁区域局部图 | `map_region_qilu__base` | `assets/default/map/regions/rg_qilu.png` | 待出图 | [rg_qilu.md](maps/region/rg_qilu.md) |
| 6 | 青藏区域局部图 | `map_region_qingzang__base` | `assets/default/map/regions/rg_qingzang.png` | 待出图 | [rg_qingzang.md](maps/region/rg_qingzang.md) |
| 7 | 云滇黔中区域局部图 | `map_region_yundian_qianzhong__base` | `assets/default/map/regions/rg_yundian_qianzhong.png` | 待出图 | [rg_yundian_qianzhong.md](maps/region/rg_yundian_qianzhong.md) |
| 8 | 江湖万里图 · 水墨衬纸（全国底图） | `map_jianghu_world__ink_base` | `assets/default/map/jianghu_world/ink_base.png` | 待出图（可选） | [jianghu_world_ink_base.md](maps/jianghu_world_ink_base.md) |

## 角色分层部件（AR-22，tech/09）

两套标准体型各 3 张全身参考图 + 13 部件 × 3 视图 = 42 份。**顺序**：先出该视图的全身参考图，再以它为唯一图片输入逐部件出图；全部出完跑 `python3 tools/rig/make_parts.py assets/default/rig/<set>` 裁边定枢轴写 manifest，`python3 tools/rig/preview.py assets/default/rig/<set> --out assets/default/rig/<set>/preview.png` 看姿势条带。是否现在就出由作者定。

| 体型集 | 视图 | 参考图 | 部件（13） | 图 |
|---|---|---|---|---|
| male_std | front34 | [ref_front34.md](rig/male_std/ref_front34.md)（已入库） | （已全部入库） | 已入库 13 |
| male_std | back34 | [ref_back34.md](rig/male_std/ref_back34.md)（已入库） | （已全部入库） | 已入库 13 |
| male_std | side | [ref_side.md](rig/male_std/ref_side.md)（已入库） | （已全部入库） | 已入库 13 |
| female_std | front34 | [ref_front34.md](rig/female_std/ref_front34.md)（已入库） | （已全部入库） | 已入库 13 |
| female_std | back34 | [ref_back34.md](rig/female_std/ref_back34.md)（已入库） | （已全部入库） | 已入库 13 |
| female_std | side | [ref_side.md](rig/female_std/ref_side.md)（已入库） | （已全部入库） | 已入库 13 |

## 建筑套件与贴片（已出齐，只列完成度）

| 套件 | 建筑 | 贴片 | 历史图片重出 | 目录 |
|---|---:|---:|---|---|
| liao_jin_north | 19 | 7 | ✓ 全部 | `assets/default/building-map/liao_jin_north/`、`assets/default/tile/liao_jin_north/` |
| ming_north | 19 | 7 | ✓ 全部 | `assets/default/building-map/ming_north/`、`assets/default/tile/ming_north/` |
| ming_south | 19 | 7 | ✓ 全部 | `assets/default/building-map/ming_south/`、`assets/default/tile/ming_south/` |
| mongol | 19 | 7 | ✓ 全部 | `assets/default/building-map/mongol/`、`assets/default/tile/mongol/` |
| qing_north | 19 | 7 | ✓ 全部 | `assets/default/building-map/qing_north/`、`assets/default/tile/qing_north/` |
| qing_south | 19 | 7 | ✓ 全部 | `assets/default/building-map/qing_south/`、`assets/default/tile/qing_south/` |
| song_north | 19 | 7 | ✓ 全部 | `assets/default/building-map/song_north/`、`assets/default/tile/song_north/` |
| tubo | 19 | 7 | ✓ 全部 | `assets/default/building-map/tubo/`、`assets/default/tile/tubo/` |
| xiyu | 19 | 7 | ✓ 全部 | `assets/default/building-map/xiyu/`、`assets/default/tile/xiyu/` |
| yuan_north | 19 | 7 | ✓ 全部 | `assets/default/building-map/yuan_north/`、`assets/default/tile/yuan_north/` |
| yuan_south | 19 | 7 | ✓ 全部 | `assets/default/building-map/yuan_south/`、`assets/default/tile/yuan_south/` |
| song_dali（基线，作者已审） | 17 | — | ✗ 未重出（待作者定） | `assets/default/baseline/building-map/` |
| song_southern（基线，作者已审） | 18 | — | ✗ 未重出（待作者定） | `assets/default/baseline/building-map/` |
| 通用贴片（基线 TOWN-tiles） | — | 64 | — | `assets/default/baseline/tile/` |

全部 11 套年代套件均已按历史图片重出并合入；城镇合成图由 `tools/town/` 代码用这些素材拼装，不是出图任务。基线两套宋套件是否也按历史图片重出，待作者定（要做就复制 `tools/agents/prompts/KIT.md` 的做法）。
