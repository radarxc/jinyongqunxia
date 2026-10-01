# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）

> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。
> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。

提示词 **285** 份：已入库 126、待出图 115、工作区候选 32、待重出（候选是代码画的假图） 12。**待出图队列 127 行**（`python3 tools/agents/build_image_index.py --queue`）。

## 出图 agent 怎么用

1. 先读本节与「出图位置约定」，再读目标组的 `GUIDE.md`（`items/GUIDE.md`、`maps/GUIDE.md`、`rig/GUIDE.md`），最后读每张图自己的提示词文件（frontmatter = 输出路径 / 规格 / 参考图；正文 = 要点、完整提示词、排除项、质检要点）。
2. 列出能做的行：`python3 tools/agents/build_image_index.py --queue --group maps`（`--json` 给脚本用）。队列 = 图片文件尚不存在的行 + `items/REDO.md` 里作者点名重出的 ID。
3. 每行：加载 frontmatter `references` 里的参考图 → 按「提示词」生成 2 张候选选 1 张（有明确缺陷再补，单轮 ≤ 4 张）→ 按 `output` 存 PNG（文件名 = asset_id 或指定名）→ 在 `manifest` 追加一条（字段见 `assets/README.md`：id、file、category、style、subject、prompt、negative、references、tool、model、created、source_path、size、sha256、`status: candidate`）→ 跑该组 GUIDE 里的检查命令。
4. 不要改提示词文件和本索引；生成完一组，重新运行本脚本，状态会从「待出图」变成「已入库」。作者的审批在审批页做，`candidate` 不等于通过。

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
| items | `eq_baoyulihuading` | 暴雨梨花钉 | `assets/default/item/hidden-weapons/eq_baoyulihuading.png` | 待重出（候选是代码画的假图） | [eq_baoyulihuading.md](items/hidden-weapons/eq_baoyulihuading.md) |
| items | `eq_bingpoyinzhen` | 冰魄银针 | `assets/default/item/hidden-weapons/eq_bingpoyinzhen.png` | 待重出（候选是代码画的假图） | [eq_bingpoyinzhen.md](items/hidden-weapons/eq_bingpoyinzhen.md) |
| items | `eq_hanshasheying` | 含沙射影 | `assets/default/item/hidden-weapons/eq_hanshasheying.png` | 待重出（候选是代码画的假图） | [eq_hanshasheying.md](items/hidden-weapons/eq_hanshasheying.md) |
| items | `eq_heixueshenzhen` | 黑血神针 | `assets/default/item/hidden-weapons/eq_heixueshenzhen.png` | 待重出（候选是代码画的假图） | [eq_heixueshenzhen.md](items/hidden-weapons/eq_heixueshenzhen.md) |
| items | `eq_kongqueling` | 孔雀翎 | `assets/default/item/hidden-weapons/eq_kongqueling.png` | 待重出（候选是代码画的假图） | [eq_kongqueling.md](items/hidden-weapons/eq_kongqueling.md) |
| items | `eq_luochaduanchong` | 罗刹短铳 | `assets/default/item/hidden-weapons/eq_luochaduanchong.png` | 待重出（候选是代码画的假图） | [eq_luochaduanchong.md](items/hidden-weapons/eq_luochaduanchong.md) |
| items | `eq_wenxuzhen` | 蚊须针 | `assets/default/item/hidden-weapons/eq_wenxuzhen.png` | 待重出（候选是代码画的假图） | [eq_wenxuzhen.md](items/hidden-weapons/eq_wenxuzhen.md) |
| items | `eq_xiaolifeidao` | 小李飞刀 | `assets/default/item/hidden-weapons/eq_xiaolifeidao.png` | 待重出（候选是代码画的假图） | [eq_xiaolifeidao.md](items/hidden-weapons/eq_xiaolifeidao.md) |
| items | `it_feihuangshi` | 飞蝗石 | `assets/default/item/hidden-weapons/it_feihuangshi.png` | 待重出（候选是代码画的假图） | [it_feihuangshi.md](items/hidden-weapons/it_feihuangshi.md) |
| items | `it_jinqianbiao` | 金钱镖 | `assets/default/item/hidden-weapons/it_jinqianbiao.png` | 待重出（候选是代码画的假图） | [it_jinqianbiao.md](items/hidden-weapons/it_jinqianbiao.md) |
| items | `it_meihuazhen` | 梅花针 | `assets/default/item/hidden-weapons/it_meihuazhen.png` | 待重出（候选是代码画的假图） | [it_meihuazhen.md](items/hidden-weapons/it_meihuazhen.md) |
| items | `it_xiujian` | 袖箭 | `assets/default/item/hidden-weapons/it_xiujian.png` | 待重出（候选是代码画的假图） | [it_xiujian.md](items/hidden-weapons/it_xiujian.md) |
| maps | `map_jianghu_world__ink_base` | 江湖万里图 · 水墨衬纸（全国底图） | `assets/default/map/jianghu_world/ink_base.png` | 待出图 | [jianghu_world_ink_base.md](maps/jianghu_world_ink_base.md) |
| maps | `map_region_bashu__base` | 巴蜀区域局部图 | `assets/default/map/regions/rg_bashu.png` | 待出图 | [rg_bashu.md](maps/region/rg_bashu.md) |
| maps | `map_region_dali_cangshan__base` | 大理苍山区域局部图 | `assets/default/map/regions/rg_dali_cangshan.png` | 待出图 | [rg_dali_cangshan.md](maps/region/rg_dali_cangshan.md) |
| maps | `map_region_dongbei__base` | 东北边地区域局部图 | `assets/default/map/regions/rg_dongbei.png` | 待出图 | [rg_dongbei.md](maps/region/rg_dongbei.md) |
| maps | `map_region_donghai_islands__base` | 东海诸岛区域局部图 | `assets/default/map/regions/rg_donghai_islands.png` | 待出图 | [rg_donghai_islands.md](maps/region/rg_donghai_islands.md) |
| maps | `map_region_fujian__base` | 闽地区域局部图 | `assets/default/map/regions/rg_fujian.png` | 待出图 | [rg_fujian.md](maps/region/rg_fujian.md) |
| maps | `map_region_guangxi__base` | 桂西桂北区域局部图 | `assets/default/map/regions/rg_guangxi.png` | 待出图 | [rg_guangxi.md](maps/region/rg_guangxi.md) |
| maps | `map_region_guanzhong__base` | 关中陕北区域局部图 | `assets/default/map/regions/rg_guanzhong.png` | 待出图 | [rg_guanzhong.md](maps/region/rg_guanzhong.md) |
| maps | `map_region_hedong_jinzhong__base` | 河东与晋中区域局部图 | `assets/default/map/regions/rg_hedong_jinzhong.png` | 待出图 | [rg_hedong_jinzhong.md](maps/region/rg_hedong_jinzhong.md) |
| maps | `map_region_hexilongyou__base` | 河西与陇右区域局部图 | `assets/default/map/regions/rg_hexilongyou.png` | 待出图 | [rg_hexilongyou.md](maps/region/rg_hexilongyou.md) |
| maps | `map_region_huxiang__base` | 湖湘区域局部图 | `assets/default/map/regions/rg_huxiang.png` | 待出图 | [rg_huxiang.md](maps/region/rg_huxiang.md) |
| maps | `map_region_jianghuai__base` | 江淮区域局部图 | `assets/default/map/regions/rg_jianghuai.png` | 待出图 | [rg_jianghuai.md](maps/region/rg_jianghuai.md) |
| maps | `map_region_jiangnan_taihu__base` | 太湖江南区域局部图 | `assets/default/map/regions/rg_jiangnan_taihu.png` | 待出图 | [rg_jiangnan_taihu.md](maps/region/rg_jiangnan_taihu.md) |
| maps | `map_region_jiangxi__base` | 江西区域局部图 | `assets/default/map/regions/rg_jiangxi.png` | 待出图 | [rg_jiangxi.md](maps/region/rg_jiangxi.md) |
| maps | `map_region_jingxiang__base` | 荆襄区域局部图 | `assets/default/map/regions/rg_jingxiang.png` | 待出图 | [rg_jingxiang.md](maps/region/rg_jingxiang.md) |
| maps | `map_region_liaodong__base` | 辽东区域局部图 | `assets/default/map/regions/rg_liaodong.png` | 待出图 | [rg_liaodong.md](maps/region/rg_liaodong.md) |
| maps | `map_region_liaoxi__base` | 辽西走廊区域局部图 | `assets/default/map/regions/rg_liaoxi.png` | 待出图 | [rg_liaoxi.md](maps/region/rg_liaoxi.md) |
| maps | `map_region_lingnan__base` | 岭南南海岸区域局部图 | `assets/default/map/regions/rg_lingnan.png` | 待出图 | [rg_lingnan.md](maps/region/rg_lingnan.md) |
| maps | `map_region_mobei__base` | 漠北区域局部图 | `assets/default/map/regions/rg_mobei.png` | 待出图 | [rg_mobei.md](maps/region/rg_mobei.md) |
| maps | `map_region_monan__base` | 漠南区域局部图 | `assets/default/map/regions/rg_monan.png` | 待出图 | [rg_monan.md](maps/region/rg_monan.md) |
| maps | `map_region_nanhai_islands__base` | 南海诸岛区域局部图 | `assets/default/map/regions/rg_nanhai_islands.png` | 待出图 | [rg_nanhai_islands.md](maps/region/rg_nanhai_islands.md) |
| maps | `map_region_qilu__base` | 齐鲁区域局部图 | `assets/default/map/regions/rg_qilu.png` | 待出图 | [rg_qilu.md](maps/region/rg_qilu.md) |
| maps | `map_region_qinba__base` | 秦巴汉水区域局部图 | `assets/default/map/regions/rg_qinba.png` | 待出图 | [rg_qinba.md](maps/region/rg_qinba.md) |
| maps | `map_region_qingzang__base` | 青藏区域局部图 | `assets/default/map/regions/rg_qingzang.png` | 待出图 | [rg_qingzang.md](maps/region/rg_qingzang.md) |
| maps | `map_region_xixia_helan__base` | 西夏贺兰区域局部图 | `assets/default/map/regions/rg_xixia_helan.png` | 待出图 | [rg_xixia_helan.md](maps/region/rg_xixia_helan.md) |
| maps | `map_region_xiyu_beijiang__base` | 西域北疆区域局部图 | `assets/default/map/regions/rg_xiyu_beijiang.png` | 待出图 | [rg_xiyu_beijiang.md](maps/region/rg_xiyu_beijiang.md) |
| maps | `map_region_xiyu_nanjiang__base` | 西域南疆区域局部图 | `assets/default/map/regions/rg_xiyu_nanjiang.png` | 待出图 | [rg_xiyu_nanjiang.md](maps/region/rg_xiyu_nanjiang.md) |
| maps | `map_region_yanjing_zhili__base` | 燕京与直隶区域局部图 | `assets/default/map/regions/rg_yanjing_zhili.png` | 待出图 | [rg_yanjing_zhili.md](maps/region/rg_yanjing_zhili.md) |
| maps | `map_region_yundian_qianzhong__base` | 云滇黔中区域局部图 | `assets/default/map/regions/rg_yundian_qianzhong.png` | 待出图 | [rg_yundian_qianzhong.md](maps/region/rg_yundian_qianzhong.md) |
| maps | `map_region_zhedong__base` | 浙东沿海区域局部图 | `assets/default/map/regions/rg_zhedong.png` | 待出图 | [rg_zhedong.md](maps/region/rg_zhedong.md) |
| maps | `map_region_zhongyuan__base` | 中原区域局部图 | `assets/default/map/regions/rg_zhongyuan.png` | 待出图 | [rg_zhongyuan.md](maps/region/rg_zhongyuan.md) |
| rig | `rig_female_std__back34__foot_shared` | 女性标准体 · back34 · 脚 / 鞋（左右共享源） | `assets/default/rig/female_std/back34/foot_shared.png` | 待出图 | [foot_shared.md](rig/female_std/back34/foot_shared.md) |
| rig | `rig_female_std__back34__forearm_L` | 女性标准体 · back34 · 左前臂 | `assets/default/rig/female_std/back34/forearm_L.png` | 待出图 | [forearm_L.md](rig/female_std/back34/forearm_L.md) |
| rig | `rig_female_std__back34__forearm_R` | 女性标准体 · back34 · 右前臂 | `assets/default/rig/female_std/back34/forearm_R.png` | 待出图 | [forearm_R.md](rig/female_std/back34/forearm_R.md) |
| rig | `rig_female_std__back34__hair_or_headgear` | 女性标准体 · back34 · 发式 / 头饰层 | `assets/default/rig/female_std/back34/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/female_std/back34/hair_or_headgear.md) |
| rig | `rig_female_std__back34__hand_L` | 女性标准体 · back34 · 左手 | `assets/default/rig/female_std/back34/hand_L.png` | 待出图 | [hand_L.md](rig/female_std/back34/hand_L.md) |
| rig | `rig_female_std__back34__hand_R` | 女性标准体 · back34 · 右手 | `assets/default/rig/female_std/back34/hand_R.png` | 待出图 | [hand_R.md](rig/female_std/back34/hand_R.md) |
| rig | `rig_female_std__back34__head` | 女性标准体 · back34 · 头（颈至头顶） | `assets/default/rig/female_std/back34/head.png` | 待出图 | [head.md](rig/female_std/back34/head.md) |
| rig | `rig_female_std__back34__pelvis_skirt` | 女性标准体 · back34 · 骨盆 / 下裳 | `assets/default/rig/female_std/back34/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/female_std/back34/pelvis_skirt.md) |
| rig | `rig_female_std__back34__shin_shared` | 女性标准体 · back34 · 小腿（左右共享源） | `assets/default/rig/female_std/back34/shin_shared.png` | 待出图 | [shin_shared.md](rig/female_std/back34/shin_shared.md) |
| rig | `rig_female_std__back34__thigh_shared` | 女性标准体 · back34 · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/female_std/back34/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/female_std/back34/thigh_shared.md) |
| rig | `rig_female_std__back34__torso` | 女性标准体 · back34 · 躯干（骨盆点至颈点） | `assets/default/rig/female_std/back34/torso.png` | 待出图 | [torso.md](rig/female_std/back34/torso.md) |
| rig | `rig_female_std__back34__upper_arm_L` | 女性标准体 · back34 · 左上臂 | `assets/default/rig/female_std/back34/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/female_std/back34/upper_arm_L.md) |
| rig | `rig_female_std__back34__upper_arm_R` | 女性标准体 · back34 · 右上臂 | `assets/default/rig/female_std/back34/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/female_std/back34/upper_arm_R.md) |
| rig | `rig_female_std__front34__foot_shared` | 女性标准体 · front34 · 脚 / 鞋（左右共享源） | `assets/default/rig/female_std/front34/foot_shared.png` | 待出图 | [foot_shared.md](rig/female_std/front34/foot_shared.md) |
| rig | `rig_female_std__front34__forearm_L` | 女性标准体 · front34 · 左前臂 | `assets/default/rig/female_std/front34/forearm_L.png` | 待出图 | [forearm_L.md](rig/female_std/front34/forearm_L.md) |
| rig | `rig_female_std__front34__forearm_R` | 女性标准体 · front34 · 右前臂 | `assets/default/rig/female_std/front34/forearm_R.png` | 待出图 | [forearm_R.md](rig/female_std/front34/forearm_R.md) |
| rig | `rig_female_std__front34__hair_or_headgear` | 女性标准体 · front34 · 发式 / 头饰层 | `assets/default/rig/female_std/front34/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/female_std/front34/hair_or_headgear.md) |
| rig | `rig_female_std__front34__hand_L` | 女性标准体 · front34 · 左手 | `assets/default/rig/female_std/front34/hand_L.png` | 待出图 | [hand_L.md](rig/female_std/front34/hand_L.md) |
| rig | `rig_female_std__front34__hand_R` | 女性标准体 · front34 · 右手 | `assets/default/rig/female_std/front34/hand_R.png` | 待出图 | [hand_R.md](rig/female_std/front34/hand_R.md) |
| rig | `rig_female_std__front34__head` | 女性标准体 · front34 · 头（颈至头顶） | `assets/default/rig/female_std/front34/head.png` | 待出图 | [head.md](rig/female_std/front34/head.md) |
| rig | `rig_female_std__front34__pelvis_skirt` | 女性标准体 · front34 · 骨盆 / 下裳 | `assets/default/rig/female_std/front34/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/female_std/front34/pelvis_skirt.md) |
| rig | `rig_female_std__front34__shin_shared` | 女性标准体 · front34 · 小腿（左右共享源） | `assets/default/rig/female_std/front34/shin_shared.png` | 待出图 | [shin_shared.md](rig/female_std/front34/shin_shared.md) |
| rig | `rig_female_std__front34__thigh_shared` | 女性标准体 · front34 · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/female_std/front34/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/female_std/front34/thigh_shared.md) |
| rig | `rig_female_std__front34__torso` | 女性标准体 · front34 · 躯干（骨盆点至颈点） | `assets/default/rig/female_std/front34/torso.png` | 待出图 | [torso.md](rig/female_std/front34/torso.md) |
| rig | `rig_female_std__front34__upper_arm_L` | 女性标准体 · front34 · 左上臂 | `assets/default/rig/female_std/front34/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/female_std/front34/upper_arm_L.md) |
| rig | `rig_female_std__front34__upper_arm_R` | 女性标准体 · front34 · 右上臂 | `assets/default/rig/female_std/front34/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/female_std/front34/upper_arm_R.md) |
| rig | `rig_female_std__ref_back34` | 女性标准体 · back34 全身参考图 | `assets/default/rig/female_std/ref_back34.png` | 待出图 | [ref_back34.md](rig/female_std/ref_back34.md) |
| rig | `rig_female_std__ref_front34` | 女性标准体 · front34 全身参考图 | `assets/default/rig/female_std/ref_front34.png` | 待出图 | [ref_front34.md](rig/female_std/ref_front34.md) |
| rig | `rig_female_std__ref_side` | 女性标准体 · side 全身参考图 | `assets/default/rig/female_std/ref_side.png` | 待出图 | [ref_side.md](rig/female_std/ref_side.md) |
| rig | `rig_female_std__side__foot_shared` | 女性标准体 · side · 脚 / 鞋（左右共享源） | `assets/default/rig/female_std/side/foot_shared.png` | 待出图 | [foot_shared.md](rig/female_std/side/foot_shared.md) |
| rig | `rig_female_std__side__forearm_L` | 女性标准体 · side · 左前臂 | `assets/default/rig/female_std/side/forearm_L.png` | 待出图 | [forearm_L.md](rig/female_std/side/forearm_L.md) |
| rig | `rig_female_std__side__forearm_R` | 女性标准体 · side · 右前臂 | `assets/default/rig/female_std/side/forearm_R.png` | 待出图 | [forearm_R.md](rig/female_std/side/forearm_R.md) |
| rig | `rig_female_std__side__hair_or_headgear` | 女性标准体 · side · 发式 / 头饰层 | `assets/default/rig/female_std/side/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/female_std/side/hair_or_headgear.md) |
| rig | `rig_female_std__side__hand_L` | 女性标准体 · side · 左手 | `assets/default/rig/female_std/side/hand_L.png` | 待出图 | [hand_L.md](rig/female_std/side/hand_L.md) |
| rig | `rig_female_std__side__hand_R` | 女性标准体 · side · 右手 | `assets/default/rig/female_std/side/hand_R.png` | 待出图 | [hand_R.md](rig/female_std/side/hand_R.md) |
| rig | `rig_female_std__side__head` | 女性标准体 · side · 头（颈至头顶） | `assets/default/rig/female_std/side/head.png` | 待出图 | [head.md](rig/female_std/side/head.md) |
| rig | `rig_female_std__side__pelvis_skirt` | 女性标准体 · side · 骨盆 / 下裳 | `assets/default/rig/female_std/side/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/female_std/side/pelvis_skirt.md) |
| rig | `rig_female_std__side__shin_shared` | 女性标准体 · side · 小腿（左右共享源） | `assets/default/rig/female_std/side/shin_shared.png` | 待出图 | [shin_shared.md](rig/female_std/side/shin_shared.md) |
| rig | `rig_female_std__side__thigh_shared` | 女性标准体 · side · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/female_std/side/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/female_std/side/thigh_shared.md) |
| rig | `rig_female_std__side__torso` | 女性标准体 · side · 躯干（骨盆点至颈点） | `assets/default/rig/female_std/side/torso.png` | 待出图 | [torso.md](rig/female_std/side/torso.md) |
| rig | `rig_female_std__side__upper_arm_L` | 女性标准体 · side · 左上臂 | `assets/default/rig/female_std/side/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/female_std/side/upper_arm_L.md) |
| rig | `rig_female_std__side__upper_arm_R` | 女性标准体 · side · 右上臂 | `assets/default/rig/female_std/side/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/female_std/side/upper_arm_R.md) |
| rig | `rig_male_std__back34__foot_shared` | 男性标准体 · back34 · 脚 / 鞋（左右共享源） | `assets/default/rig/male_std/back34/foot_shared.png` | 待出图 | [foot_shared.md](rig/male_std/back34/foot_shared.md) |
| rig | `rig_male_std__back34__forearm_L` | 男性标准体 · back34 · 左前臂 | `assets/default/rig/male_std/back34/forearm_L.png` | 待出图 | [forearm_L.md](rig/male_std/back34/forearm_L.md) |
| rig | `rig_male_std__back34__forearm_R` | 男性标准体 · back34 · 右前臂 | `assets/default/rig/male_std/back34/forearm_R.png` | 待出图 | [forearm_R.md](rig/male_std/back34/forearm_R.md) |
| rig | `rig_male_std__back34__hair_or_headgear` | 男性标准体 · back34 · 发式 / 头饰层 | `assets/default/rig/male_std/back34/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/male_std/back34/hair_or_headgear.md) |
| rig | `rig_male_std__back34__hand_L` | 男性标准体 · back34 · 左手 | `assets/default/rig/male_std/back34/hand_L.png` | 待出图 | [hand_L.md](rig/male_std/back34/hand_L.md) |
| rig | `rig_male_std__back34__hand_R` | 男性标准体 · back34 · 右手 | `assets/default/rig/male_std/back34/hand_R.png` | 待出图 | [hand_R.md](rig/male_std/back34/hand_R.md) |
| rig | `rig_male_std__back34__head` | 男性标准体 · back34 · 头（颈至头顶） | `assets/default/rig/male_std/back34/head.png` | 待出图 | [head.md](rig/male_std/back34/head.md) |
| rig | `rig_male_std__back34__pelvis_skirt` | 男性标准体 · back34 · 骨盆 / 下裳 | `assets/default/rig/male_std/back34/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/male_std/back34/pelvis_skirt.md) |
| rig | `rig_male_std__back34__shin_shared` | 男性标准体 · back34 · 小腿（左右共享源） | `assets/default/rig/male_std/back34/shin_shared.png` | 待出图 | [shin_shared.md](rig/male_std/back34/shin_shared.md) |
| rig | `rig_male_std__back34__thigh_shared` | 男性标准体 · back34 · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/male_std/back34/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/male_std/back34/thigh_shared.md) |
| rig | `rig_male_std__back34__torso` | 男性标准体 · back34 · 躯干（骨盆点至颈点） | `assets/default/rig/male_std/back34/torso.png` | 待出图 | [torso.md](rig/male_std/back34/torso.md) |
| rig | `rig_male_std__back34__upper_arm_L` | 男性标准体 · back34 · 左上臂 | `assets/default/rig/male_std/back34/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/male_std/back34/upper_arm_L.md) |
| rig | `rig_male_std__back34__upper_arm_R` | 男性标准体 · back34 · 右上臂 | `assets/default/rig/male_std/back34/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/male_std/back34/upper_arm_R.md) |
| rig | `rig_male_std__front34__foot_shared` | 男性标准体 · front34 · 脚 / 鞋（左右共享源） | `assets/default/rig/male_std/front34/foot_shared.png` | 待出图 | [foot_shared.md](rig/male_std/front34/foot_shared.md) |
| rig | `rig_male_std__front34__forearm_L` | 男性标准体 · front34 · 左前臂 | `assets/default/rig/male_std/front34/forearm_L.png` | 待出图 | [forearm_L.md](rig/male_std/front34/forearm_L.md) |
| rig | `rig_male_std__front34__forearm_R` | 男性标准体 · front34 · 右前臂 | `assets/default/rig/male_std/front34/forearm_R.png` | 待出图 | [forearm_R.md](rig/male_std/front34/forearm_R.md) |
| rig | `rig_male_std__front34__hair_or_headgear` | 男性标准体 · front34 · 发式 / 头饰层 | `assets/default/rig/male_std/front34/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/male_std/front34/hair_or_headgear.md) |
| rig | `rig_male_std__front34__hand_L` | 男性标准体 · front34 · 左手 | `assets/default/rig/male_std/front34/hand_L.png` | 待出图 | [hand_L.md](rig/male_std/front34/hand_L.md) |
| rig | `rig_male_std__front34__hand_R` | 男性标准体 · front34 · 右手 | `assets/default/rig/male_std/front34/hand_R.png` | 待出图 | [hand_R.md](rig/male_std/front34/hand_R.md) |
| rig | `rig_male_std__front34__head` | 男性标准体 · front34 · 头（颈至头顶） | `assets/default/rig/male_std/front34/head.png` | 待出图 | [head.md](rig/male_std/front34/head.md) |
| rig | `rig_male_std__front34__pelvis_skirt` | 男性标准体 · front34 · 骨盆 / 下裳 | `assets/default/rig/male_std/front34/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/male_std/front34/pelvis_skirt.md) |
| rig | `rig_male_std__front34__shin_shared` | 男性标准体 · front34 · 小腿（左右共享源） | `assets/default/rig/male_std/front34/shin_shared.png` | 待出图 | [shin_shared.md](rig/male_std/front34/shin_shared.md) |
| rig | `rig_male_std__front34__thigh_shared` | 男性标准体 · front34 · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/male_std/front34/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/male_std/front34/thigh_shared.md) |
| rig | `rig_male_std__front34__torso` | 男性标准体 · front34 · 躯干（骨盆点至颈点） | `assets/default/rig/male_std/front34/torso.png` | 待出图 | [torso.md](rig/male_std/front34/torso.md) |
| rig | `rig_male_std__front34__upper_arm_L` | 男性标准体 · front34 · 左上臂 | `assets/default/rig/male_std/front34/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/male_std/front34/upper_arm_L.md) |
| rig | `rig_male_std__front34__upper_arm_R` | 男性标准体 · front34 · 右上臂 | `assets/default/rig/male_std/front34/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/male_std/front34/upper_arm_R.md) |
| rig | `rig_male_std__ref_back34` | 男性标准体 · back34 全身参考图 | `assets/default/rig/male_std/ref_back34.png` | 待出图 | [ref_back34.md](rig/male_std/ref_back34.md) |
| rig | `rig_male_std__ref_front34` | 男性标准体 · front34 全身参考图 | `assets/default/rig/male_std/ref_front34.png` | 待出图 | [ref_front34.md](rig/male_std/ref_front34.md) |
| rig | `rig_male_std__ref_side` | 男性标准体 · side 全身参考图 | `assets/default/rig/male_std/ref_side.png` | 待出图 | [ref_side.md](rig/male_std/ref_side.md) |
| rig | `rig_male_std__side__foot_shared` | 男性标准体 · side · 脚 / 鞋（左右共享源） | `assets/default/rig/male_std/side/foot_shared.png` | 待出图 | [foot_shared.md](rig/male_std/side/foot_shared.md) |
| rig | `rig_male_std__side__forearm_L` | 男性标准体 · side · 左前臂 | `assets/default/rig/male_std/side/forearm_L.png` | 待出图 | [forearm_L.md](rig/male_std/side/forearm_L.md) |
| rig | `rig_male_std__side__forearm_R` | 男性标准体 · side · 右前臂 | `assets/default/rig/male_std/side/forearm_R.png` | 待出图 | [forearm_R.md](rig/male_std/side/forearm_R.md) |
| rig | `rig_male_std__side__hair_or_headgear` | 男性标准体 · side · 发式 / 头饰层 | `assets/default/rig/male_std/side/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/male_std/side/hair_or_headgear.md) |
| rig | `rig_male_std__side__hand_L` | 男性标准体 · side · 左手 | `assets/default/rig/male_std/side/hand_L.png` | 待出图 | [hand_L.md](rig/male_std/side/hand_L.md) |
| rig | `rig_male_std__side__hand_R` | 男性标准体 · side · 右手 | `assets/default/rig/male_std/side/hand_R.png` | 待出图 | [hand_R.md](rig/male_std/side/hand_R.md) |
| rig | `rig_male_std__side__head` | 男性标准体 · side · 头（颈至头顶） | `assets/default/rig/male_std/side/head.png` | 待出图 | [head.md](rig/male_std/side/head.md) |
| rig | `rig_male_std__side__pelvis_skirt` | 男性标准体 · side · 骨盆 / 下裳 | `assets/default/rig/male_std/side/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/male_std/side/pelvis_skirt.md) |
| rig | `rig_male_std__side__shin_shared` | 男性标准体 · side · 小腿（左右共享源） | `assets/default/rig/male_std/side/shin_shared.png` | 待出图 | [shin_shared.md](rig/male_std/side/shin_shared.md) |
| rig | `rig_male_std__side__thigh_shared` | 男性标准体 · side · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/male_std/side/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/male_std/side/thigh_shared.md) |
| rig | `rig_male_std__side__torso` | 男性标准体 · side · 躯干（骨盆点至颈点） | `assets/default/rig/male_std/side/torso.png` | 待出图 | [torso.md](rig/male_std/side/torso.md) |
| rig | `rig_male_std__side__upper_arm_L` | 男性标准体 · side · 左上臂 | `assets/default/rig/male_std/side/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/male_std/side/upper_arm_L.md) |
| rig | `rig_male_std__side__upper_arm_R` | 男性标准体 · side · 右上臂 | `assets/default/rig/male_std/side/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/male_std/side/upper_arm_R.md) |

## 物品（11 类，名录 170 项）

每张图的提示词在各文件「提示词」节。「已入库」= 图在 `assets/default/item/` 下（作者尚未审批，manifest `status: candidate`）；「工作区候选」= 图在任务工作区还没合入；作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可进队列。

### 药物 / 补品 / 药材（32）· 已入库 32

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 九转还魂丹 | `it_jiuzhuanhuanhundan` | 天 | 药物·复活 | 已入库 | [it_jiuzhuanhuanhundan.md](items/medicine/it_jiuzhuanhuanhundan.md) | manifest |
| 2 | 千年灵芝 | `it_qiannianlingzhi` | 天 | 药材·灵芝 | 已入库 | [it_qiannianlingzhi.md](items/medicine/it_qiannianlingzhi.md) | manifest |
| 3 | 千年人参 | `it_qiannianrenshen` | 天 | 药材·人参 | 已入库 | [it_qiannianrenshen.md](items/medicine/it_qiannianrenshen.md) | manifest |
| 4 | 千年雪莲 | `it_qiannianxuelian` | 天 | 药材·雪莲 | 已入库 | [it_qiannianxuelian.md](items/medicine/it_qiannianxuelian.md) | manifest |
| 5 | 千年雪参 | `it_qiannianxueshen` | 天 | 药材·雪参 | 已入库 | [it_qiannianxueshen.md](items/medicine/it_qiannianxueshen.md) | manifest |
| 6 | 生生造化丹 | `it_shengshengzaohuadan` | 天 | 补品·永久属性 | 已入库 | [it_shengshengzaohuadan.md](items/medicine/it_shengshengzaohuadan.md) | manifest |
| 7 | 天髓续命露 | `it_tiansuixuminglu` | 天 | 补品·经脉疗伤 | 已入库 | [it_tiansuixuminglu.md](items/medicine/it_tiansuixuminglu.md) | manifest |
| 8 | 雪参玉蟾丸 | `it_xueshenyuchanwan` | 天 | 补品·内力经脉 | 已入库 | [it_xueshenyuchanwan.md](items/medicine/it_xueshenyuchanwan.md) | manifest |
| 9 | 玉龙苏合散 | `it_yulongsuheisan` | 天 | 药物·救急 | 已入库 | [it_yulongsuheisan.md](items/medicine/it_yulongsuheisan.md) | manifest |
| 10 | 百年人参 | `it_bainianrenshen` | 地 | 药材·人参 | 已入库 | [it_bainianrenshen.md](items/medicine/it_bainianrenshen.md) | manifest |
| 11 | 百年雪参 | `it_bainianxueshen` | 地 | 药材·雪参 | 已入库 | [it_bainianxueshen.md](items/medicine/it_bainianxueshen.md) | manifest |
| 12 | 豹胎易筋丸 | `it_baotaiyijinwan` | 地 | 药物·控制 | 已入库 | [it_baotaiyijinwan.md](items/medicine/it_baotaiyijinwan.md) | manifest |
| 13 | 碧灵丹 | `it_bilingdan` | 地 | 药物·疗伤解毒 | 已入库 | [it_bilingdan.md](items/medicine/it_bilingdan.md) | manifest |
| 14 | 断肠草 | `it_duanchangcao` | 地 | 药材·毒草 | 已入库 | [it_duanchangcao.md](items/medicine/it_duanchangcao.md) | manifest |
| 15 | 黑玉断续膏 | `it_heiyuduanxugao` | 地 | 药物·接骨外敷 | 已入库 | [it_heiyuduanxugao.md](items/medicine/it_heiyuduanxugao.md) | manifest |
| 16 | 九花玉露丸 | `it_jiuhuayulu` | 地 | 药物·补血疗伤 | 已入库 | [it_jiuhuayulu.md](items/medicine/it_jiuhuayulu.md) | manifest |
| 17 | 天山雪莲 | `it_tianshanxuelian` | 地 | 药材·雪莲 | 已入库 | [it_tianshanxuelian.md](items/medicine/it_tianshanxuelian.md) | manifest |
| 18 | 天香断续胶 | `it_tianxiangduanxujiao` | 地 | 药物·接骨外敷 | 已入库 | [it_tianxiangduanxujiao.md](items/medicine/it_tianxiangduanxujiao.md) | manifest |
| 19 | 天一神水 | `it_tianyishenshui` | 地 | 药物·奇毒 | 已入库 | [it_tianyishenshui.md](items/medicine/it_tianyishenshui.md) | manifest |
| 20 | 通犀地龙丸 | `it_tongxidilongwan` | 地 | 补品·抗毒 | 已入库 | [it_tongxidilongwan.md](items/medicine/it_tongxidilongwan.md) | manifest |
| 21 | 茯苓首乌丸 | `it_fulingshouwuwan` | 玄 | 药物·补气疗伤 | 已入库 | [it_fulingshouwuwan.md](items/medicine/it_fulingshouwuwan.md) | manifest |
| 22 | 十年人参 | `it_shinianrenshen` | 玄 | 药材·人参 | 已入库 | [it_shinianrenshen.md](items/medicine/it_shinianrenshen.md) | manifest |
| 23 | 十年雪参 | `it_shinianxueshen` | 玄 | 药材·雪参 | 已入库 | [it_shinianxueshen.md](items/medicine/it_shinianxueshen.md) | manifest |
| 24 | 无常丹 | `it_wuchangdan` | 玄 | 药物·疗伤 | 已入库 | [it_wuchangdan.md](items/medicine/it_wuchangdan.md) | manifest |
| 25 | 小还丹 | `it_xiaohuandan` | 玄 | 补品·疗伤 | 已入库 | [it_xiaohuandan.md](items/medicine/it_xiaohuandan.md) | manifest |
| 26 | 紫霞养气丹 | `it_zixiaoyangqidan` | 玄 | 补品·补气修炼 | 已入库 | [it_zixiaoyangqidan.md](items/medicine/it_zixiaoyangqidan.md) | manifest |
| 27 | 百露草膏 | `it_bailucao` | 黄 | 补品·补气 | 已入库 | [it_bailucao.md](items/medicine/it_bailucao.md) | manifest |
| 28 | 活血丸 | `it_huoxuewan` | 黄 | 药物·补血 | 已入库 | [it_huoxuewan.md](items/medicine/it_huoxuewan.md) | manifest |
| 29 | 金创药 | `it_jinchuangyao` | 黄 | 药物·外伤 | 已入库 | [it_jinchuangyao.md](items/medicine/it_jinchuangyao.md) | manifest |
| 30 | 普通人参 | `it_renshen` | 黄 | 药材·人参 | 已入库 | [it_renshen.md](items/medicine/it_renshen.md) | manifest |
| 31 | 普通雪参 | `it_xueshen` | 黄 | 药材·雪参 | 已入库 | [it_xueshen.md](items/medicine/it_xueshen.md) | manifest |
| 32 | 养精丸 | `it_yangjingwan` | 黄 | 补品·临时属性 | 已入库 | [it_yangjingwan.md](items/medicine/it_yangjingwan.md) | manifest |

### 食材 / 食品（28）· 已入库 28

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 百花灵露 | `it_baihualinglu` | 天 | 食材·珍材 | 已入库 | [it_baihualinglu.md](items/food/it_baihualinglu.md) | manifest |
| 2 | 天山灵蜜 | `it_tianshanlingmi` | 天 | 食材·珍材 | 已入库 | [it_tianshanlingmi.md](items/food/it_tianshanlingmi.md) | manifest |
| 3 | 天香玉露羹 | `it_tianxiangyulu` | 天 | 食品·汤羹 | 已入库 | [it_tianxiangyulu.md](items/food/it_tianxiangyulu.md) | manifest |
| 4 | 天香御宴 | `it_tianxiangyuyan` | 天 | 食品·名菜 | 已入库 | [it_tianxiangyuyan.md](items/food/it_tianxiangyuyan.md) | manifest |
| 5 | 雪域冷膳 | `it_xueyulengchan` | 天 | 食品·腌藏 | 已入库 | [it_xueyulengchan.md](items/food/it_xueyulengchan.md) | manifest |
| 6 | 百花糕 | `it_baihuagao` | 地 | 食品·点心 | 已入库 | [it_baihuagao.md](items/food/it_baihuagao.md) | manifest |
| 7 | 冰湖雪藕 | `it_binghuxueou` | 地 | 食材·菜蔬 | 已入库 | [it_binghuxueou.md](items/food/it_binghuxueou.md) | manifest |
| 8 | 二十四桥明月夜 | `it_ershisiqiaomingyueye` | 地 | 食品·名菜 | 已入库 | [it_ershisiqiaomingyueye.md](items/food/it_ershisiqiaomingyueye.md) | manifest |
| 9 | 好逑汤 | `it_haoqiutang` | 地 | 食品·汤羹 | 已入库 | [it_haoqiutang.md](items/food/it_haoqiutang.md) | manifest |
| 10 | 腊八粥 | `it_labazhou` | 地 | 食品·汤羹 | 已入库 | [it_labazhou.md](items/food/it_labazhou.md) | manifest |
| 11 | 龙肝凤髓料 | `it_longganfengsui` | 地 | 食材·珍材 | 已入库 | [it_longganfengsui.md](items/food/it_longganfengsui.md) | manifest |
| 12 | 雪山鹿脯 | `it_xueshanlufu` | 地 | 食材·肉 | 已入库 | [it_xueshanlufu.md](items/food/it_xueshanlufu.md) | manifest |
| 13 | 玉笛谁家听落梅 | `it_yudishuijiatingluomei` | 地 | 食品·名菜 | 已入库 | [it_yudishuijiatingluomei.md](items/food/it_yudishuijiatingluomei.md) | manifest |
| 14 | 玉露丸子 | `it_yuluwan` | 地 | 食品·点心 | 已入库 | [it_yuluwan.md](items/food/it_yuluwan.md) | manifest |
| 15 | 御膳 | `it_yushan` | 地 | 食品·名菜 | 已入库 | [it_yushan.md](items/food/it_yushan.md) | manifest |
| 16 | 芙蓉糕 | `it_furonggao` | 玄 | 食品·点心 | 已入库 | [it_furonggao.md](items/food/it_furonggao.md) | manifest |
| 17 | 叫化鸡 | `it_jiaohuaji` | 玄 | 食品·菜肴 | 已入库 | [it_jiaohuaji.md](items/food/it_jiaohuaji.md) | manifest |
| 18 | 酱香牛肉干 | `it_niurougan` | 玄 | 食品·腌藏 | 已入库 | [it_niurougan.md](items/food/it_niurougan.md) | manifest |
| 19 | 山林香菇 | `it_xianggu` | 玄 | 食材·菜蔬 | 已入库 | [it_xianggu.md](items/food/it_xianggu.md) | manifest |
| 20 | 雪莲子 | `it_xuelianzi` | 玄 | 食材·珍材 | 已入库 | [it_xuelianzi.md](items/food/it_xuelianzi.md) | manifest |
| 21 | 玉雪果 | `it_yuxueguo` | 玄 | 食材·果 | 已入库 | [it_yuxueguo.md](items/food/it_yuxueguo.md) | manifest |
| 22 | 粗面 | `it_cumian` | 黄 | 食材·谷物 | 已入库 | [it_cumian.md](items/food/it_cumian.md) | manifest |
| 23 | 行旅干粮 | `it_ganliang` | 黄 | 食品·干粮 | 已入库 | [it_ganliang.md](items/food/it_ganliang.md) | manifest |
| 24 | 桂酥糕 | `it_guisugao` | 黄 | 食品·点心 | 已入库 | [it_guisugao.md](items/food/it_guisugao.md) | manifest |
| 25 | 火腿尖 | `it_huotuijian` | 黄 | 食材·肉 | 已入库 | [it_huotuijian.md](items/food/it_huotuijian.md) | manifest |
| 26 | 酱牛肉 | `it_jiangniurou` | 黄 | 食品·菜肴 | 已入库 | [it_jiangniurou.md](items/food/it_jiangniurou.md) | manifest |
| 27 | 精米 | `it_jingmi` | 黄 | 食材·谷物 | 已入库 | [it_jingmi.md](items/food/it_jingmi.md) | manifest |
| 28 | 鲜鱼 | `it_xianyu` | 黄 | 食材·水产 | 已入库 | [it_xianyu.md](items/food/it_xianyu.md) | manifest |

### 武学秘籍（18）· 已入库 18

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 打狗棒法残谱 | `it_miji_dagou_can` | 天 | 秘籍·残本 | 已入库 | [it_miji_dagou_can.md](items/manuals/it_miji_dagou_can.md) | manifest |
| 2 | 斗转星移藏本 | `it_miji_douzhuan` | 天 | 秘籍·残本 | 已入库 | [it_miji_douzhuan.md](items/manuals/it_miji_douzhuan.md) | manifest |
| 3 | 九阴真经上卷 | `it_miji_jiuyin_shang` | 天 | 秘籍·原本 | 已入库 | [it_miji_jiuyin_shang.md](items/manuals/it_miji_jiuyin_shang.md) | manifest |
| 4 | 九阴真经下卷 | `it_miji_jiuyin_xia` | 天 | 秘籍·原本 | 已入库 | [it_miji_jiuyin_xia.md](items/manuals/it_miji_jiuyin_xia.md) | manifest |
| 5 | 降龙十八掌残本 | `it_miji_xianglong18_can` | 天 | 秘籍·残本 | 已入库 | [it_miji_xianglong18_can.md](items/manuals/it_miji_xianglong18_can.md) | manifest |
| 6 | 白虹掌力藏本 | `it_miji_baihongzhang` | 地 | 秘籍·残本 | 已入库 | [it_miji_baihongzhang.md](items/manuals/it_miji_baihongzhang.md) | manifest |
| 7 | 参合指藏本 | `it_miji_canhezhi` | 地 | 秘籍·残本 | 已入库 | [it_miji_canhezhi.md](items/manuals/it_miji_canhezhi.md) | manifest |
| 8 | 大金刚掌秘籍 | `it_miji_dajingangzhang` | 地 | 秘籍·全本 | 已入库 | [it_miji_dajingangzhang.md](items/manuals/it_miji_dajingangzhang.md) | manifest |
| 9 | 龙爪手秘本 | `it_miji_longzhaoshou` | 地 | 秘籍·全本 | 已入库 | [it_miji_longzhaoshou.md](items/manuals/it_miji_longzhaoshou.md) | manifest |
| 10 | 铁布衫秘籍 | `it_miji_tiebushan` | 地 | 秘籍·全本 | 已入库 | [it_miji_tiebushan.md](items/manuals/it_miji_tiebushan.md) | manifest |
| 11 | 洗髓经藏本 | `it_miji_xisuijing` | 地 | 秘籍·残本 | 已入库 | [it_miji_xisuijing.md](items/manuals/it_miji_xisuijing.md) | manifest |
| 12 | 白驼毒经残本 | `it_miji_baituodujing` | 玄 | 秘籍·残本 | 已入库 | [it_miji_baituodujing.md](items/manuals/it_miji_baituodujing.md) | manifest |
| 13 | 两仪心法谱 | `it_miji_liangyixinfa` | 玄 | 秘籍·全本 | 已入库 | [it_miji_liangyixinfa.md](items/manuals/it_miji_liangyixinfa.md) | manifest |
| 14 | 全真心法抄本 | `it_miji_quanzhenxinfa` | 玄 | 秘籍·抄本 | 已入库 | [it_miji_quanzhenxinfa.md](items/manuals/it_miji_quanzhenxinfa.md) | manifest |
| 15 | 锁喉擒拿手遗谱 | `it_miji_suohouqinnashou` | 玄 | 秘籍·全本 | 已入库 | [it_miji_suohouqinnashou.md](items/manuals/it_miji_suohouqinnashou.md) | manifest |
| 16 | 杨家枪法遗谱 | `it_miji_yangjiaqiangfa` | 玄 | 秘籍·全本 | 已入库 | [it_miji_yangjiaqiangfa.md](items/manuals/it_miji_yangjiaqiangfa.md) | manifest |
| 17 | 罗汉拳谱 | `it_miji_luohanquan` | 黄 | 秘籍·全本 | 已入库 | [it_miji_luohanquan.md](items/manuals/it_miji_luohanquan.md) | manifest |
| 18 | 太祖长拳谱 | `it_miji_taizuchangquan` | 黄 | 秘籍·全本 | 已入库 | [it_miji_taizuchangquan.md](items/manuals/it_miji_taizuchangquan.md) | manifest |

### 兵器（24）· 工作区候选 24

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 霸王枪 | `eq_bawangqiang` | 天 | 兵器·枪 | 工作区候选 | [eq_bawangqiang.md](items/weapons/eq_bawangqiang.md) | manifest |
| 2 | 打狗棒 | `eq_dagoubang` | 天 | 兵器·棍 | 工作区候选 | [eq_dagoubang.md](items/weapons/eq_dagoubang.md) | manifest |
| 3 | 金蛇剑 | `eq_jinshejian` | 天 | 兵器·剑 | 工作区候选 | [eq_jinshejian.md](items/weapons/eq_jinshejian.md) | manifest |
| 4 | 屠龙刀 | `eq_tulongdao` | 天 | 兵器·重刀 | 工作区候选 | [eq_tulongdao.md](items/weapons/eq_tulongdao.md) | manifest |
| 5 | 玄铁重剑 | `eq_xuantiejian` | 天 | 兵器·重剑 | 工作区候选 | [eq_xuantiejian.md](items/weapons/eq_xuantiejian.md) | manifest |
| 6 | 倚天剑 | `eq_yitianjian` | 天 | 兵器·剑 | 工作区候选 | [eq_yitianjian.md](items/weapons/eq_yitianjian.md) | manifest |
| 7 | 碧玉刀 | `eq_biyudao` | 地 | 兵器·刀 | 工作区候选 | [eq_biyudao.md](items/weapons/eq_biyudao.md) | manifest |
| 8 | 君子剑 | `eq_junzijian` | 地 | 兵器·剑 | 工作区候选 | [eq_junzijian.md](items/weapons/eq_junzijian.md) | manifest |
| 9 | 离别钩 | `eq_libiegou` | 地 | 兵器·奇门钩 | 工作区候选 | [eq_libiegou.md](items/weapons/eq_libiegou.md) | manifest |
| 10 | 烈火旗 | `eq_liehuoqi` | 地 | 兵器·奇门旗 | 工作区候选 | [eq_liehuoqi.md](items/weapons/eq_liehuoqi.md) | manifest |
| 11 | 淑女剑 | `eq_shunvjian` | 地 | 兵器·剑 | 工作区候选 | [eq_shunvjian.md](items/weapons/eq_shunvjian.md) | manifest |
| 12 | 血刀 | `eq_xuedao` | 地 | 兵器·刀 | 工作区候选 | [eq_xuedao.md](items/weapons/eq_xuedao.md) | manifest |
| 13 | 禅杖 | `eq_chanzhang` | 玄 | 兵器·棍杖 | 工作区候选 | [eq_chanzhang.md](items/weapons/eq_chanzhang.md) | manifest |
| 14 | 金笛 | `eq_jindi` | 玄 | 兵器·奇门笛 | 工作区候选 | [eq_jindi.md](items/weapons/eq_jindi.md) | manifest |
| 15 | 龙泉剑 | `eq_longquanjian` | 玄 | 兵器·剑 | 工作区候选 | [eq_longquanjian.md](items/weapons/eq_longquanjian.md) | manifest |
| 16 | 三节棍 | `eq_sanjiegun` | 玄 | 兵器·鞭索 | 工作区候选 | [eq_sanjiegun.md](items/weapons/eq_sanjiegun.md) | manifest |
| 17 | 铁胆 | `eq_tiedan` | 玄 | 兵器·奇门 | 工作区候选 | [eq_tiedan.md](items/weapons/eq_tiedan.md) | manifest |
| 18 | 雁翎刀 | `eq_yanlingdao` | 玄 | 兵器·刀 | 工作区候选 | [eq_yanlingdao.md](items/weapons/eq_yanlingdao.md) | manifest |
| 19 | 单刀 | `eq_dandao` | 黄 | 兵器·刀 | 工作区候选 | [eq_dandao.md](items/weapons/eq_dandao.md) | manifest |
| 20 | 短匕 | `eq_duanbi` | 黄 | 兵器·奇门匕 | 工作区候选 | [eq_duanbi.md](items/weapons/eq_duanbi.md) | manifest |
| 21 | 花枪 | `eq_huaqiang` | 黄 | 兵器·枪 | 工作区候选 | [eq_huaqiang.md](items/weapons/eq_huaqiang.md) | manifest |
| 22 | 齐眉棍 | `eq_qimeigun` | 黄 | 兵器·棍 | 工作区候选 | [eq_qimeigun.md](items/weapons/eq_qimeigun.md) | manifest |
| 23 | 青钢剑 | `eq_qinggangjian` | 黄 | 兵器·剑 | 工作区候选 | [eq_qinggangjian.md](items/weapons/eq_qinggangjian.md) | manifest |
| 24 | 软鞭 | `eq_ruanbian` | 黄 | 兵器·鞭索 | 工作区候选 | [eq_ruanbian.md](items/weapons/eq_ruanbian.md) | manifest |

### 衣物（12）· 已入库 12

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 天蚕宝衣 | `eq_tianchanbaoyi` | 天 | 衣物·宝衣 | 已入库 | [eq_tianchanbaoyi.md](items/clothing/eq_tianchanbaoyi.md) | manifest |
| 2 | 乌蚕衣 | `eq_wucanyi` | 天 | 衣物·宝衣 | 已入库 | [eq_wucanyi.md](items/clothing/eq_wucanyi.md) | manifest |
| 3 | 紫霞轻衣 | `eq_zixiaqingyi` | 天 | 衣物·宝衣 | 已入库 | [eq_zixiaqingyi.md](items/clothing/eq_zixiaqingyi.md) | manifest |
| 4 | 桃花锦袍 | `eq_taohuajinpao` | 地 | 衣物·礼服 | 已入库 | [eq_taohuajinpao.md](items/clothing/eq_taohuajinpao.md) | manifest |
| 5 | 西域胡服 | `eq_xiyuhufu` | 地 | 衣物·骑装 | 已入库 | [eq_xiyuhufu.md](items/clothing/eq_xiyuhufu.md) | manifest |
| 6 | 云锦鹤氅 | `eq_yunjinhechang` | 地 | 衣物·氅服 | 已入库 | [eq_yunjinhechang.md](items/clothing/eq_yunjinhechang.md) | manifest |
| 7 | 青布道袍 | `eq_daopao` | 玄 | 衣物·袍服 | 已入库 | [eq_daopao.md](items/clothing/eq_daopao.md) | manifest |
| 8 | 黄马褂 | `eq_huangmagua` | 玄 | 衣物·礼服 | 已入库 | [eq_huangmagua.md](items/clothing/eq_huangmagua.md) | manifest |
| 9 | 夜行衣 | `eq_yexingyi` | 玄 | 衣物·潜行服 | 已入库 | [eq_yexingyi.md](items/clothing/eq_yexingyi.md) | manifest |
| 10 | 粗布短褐 | `eq_buyi` | 黄 | 衣物·便服 | 已入库 | [eq_buyi.md](items/clothing/eq_buyi.md) | manifest |
| 11 | 江湖劲装 | `eq_jinzhuang` | 黄 | 衣物·劲装 | 已入库 | [eq_jinzhuang.md](items/clothing/eq_jinzhuang.md) | manifest |
| 12 | 素色僧衣 | `eq_sengyi` | 黄 | 衣物·袍服 | 已入库 | [eq_sengyi.md](items/clothing/eq_sengyi.md) | manifest |

### 制式盔甲（8）· 工作区候选 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 清制御前侍卫甲 | `eq_qingyulinjia` | 天 | 制式盔甲·清 | 工作区候选 | [eq_qingyulinjia.md](items/armor/eq_qingyulinjia.md) | manifest |
| 2 | 元宿卫怯薛甲 | `eq_yuansuweiqiejia` | 天 | 制式盔甲·元 | 工作区候选 | [eq_yuansuweiqiejia.md](items/armor/eq_yuansuweiqiejia.md) | manifest |
| 3 | 明制锦衣卫甲 | `eq_mingjinyiweijia` | 地 | 制式盔甲·明 | 工作区候选 | [eq_mingjinyiweijia.md](items/armor/eq_mingjinyiweijia.md) | manifest |
| 4 | 宋制禁军步人甲 | `eq_songjinjunburenjia` | 地 | 制式盔甲·宋 | 工作区候选 | [eq_songjinjunburenjia.md](items/armor/eq_songjinjunburenjia.md) | manifest |
| 5 | 明制卫所甲 | `eq_mingweisuojia` | 玄 | 制式盔甲·明 | 工作区候选 | [eq_mingweisuojia.md](items/armor/eq_mingweisuojia.md) | manifest |
| 6 | 元制骑兵札甲 | `eq_yuanqibingjia` | 玄 | 制式盔甲·元 | 工作区候选 | [eq_yuanqibingjia.md](items/armor/eq_yuanqibingjia.md) | manifest |
| 7 | 清制皂隶衣甲 | `eq_qingzaolijia` | 黄 | 制式盔甲·清 | 工作区候选 | [eq_qingzaolijia.md](items/armor/eq_qingzaolijia.md) | manifest |
| 8 | 宋制巡役甲 | `eq_songxunyijia` | 黄 | 制式盔甲·宋 | 工作区候选 | [eq_songxunyijia.md](items/armor/eq_songxunyijia.md) | manifest |

### 内甲（8）· 已入库 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 软猬甲 | `eq_ruanweijia` | 天 | 内甲·猬刺宝甲 | 已入库 | [eq_ruanweijia.md](items/innerarmor/eq_ruanweijia.md) | manifest |
| 2 | 天蚕丝软甲 | `eq_tianchansiruanjia` | 天 | 内甲·蚕丝软甲 | 已入库 | [eq_tianchansiruanjia.md](items/innerarmor/eq_tianchansiruanjia.md) | manifest |
| 3 | 金丝背心 | `eq_jinsibeixin` | 地 | 内甲·金丝背心 | 已入库 | [eq_jinsibeixin.md](items/innerarmor/eq_jinsibeixin.md) | manifest |
| 4 | 玄锁软甲 | `eq_xuansuoruanjia` | 地 | 内甲·锁甲 | 已入库 | [eq_xuansuoruanjia.md](items/innerarmor/eq_xuansuoruanjia.md) | manifest |
| 5 | 金丝甲 | `eq_jinsijia` | 玄 | 内甲·金丝 | 已入库 | [eq_jinsijia.md](items/innerarmor/eq_jinsijia.md) | manifest |
| 6 | 软丝甲 | `eq_ruansijia` | 玄 | 内甲·丝甲 | 已入库 | [eq_ruansijia.md](items/innerarmor/eq_ruansijia.md) | manifest |
| 7 | 皮绒贴甲 | `eq_pirutiejia` | 黄 | 内甲·皮甲 | 已入库 | [eq_pirutiejia.md](items/innerarmor/eq_pirutiejia.md) | manifest |
| 8 | 竹丝贴甲 | `eq_zhusutiejia` | 黄 | 内甲·编织 | 已入库 | [eq_zhusutiejia.md](items/innerarmor/eq_zhusutiejia.md) | manifest |

### 护肩 / 披风 / 头饰（12）· 已入库 12

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 龙鳞护肩 | `eq_longlinpijian` | 天 | 护肩·宝肩 | 已入库 | [eq_longlinpijian.md](items/accessories/eq_longlinpijian.md) | manifest |
| 2 | 七星宝冠 | `eq_qixingbaoguan` | 天 | 头饰·宝冠 | 已入库 | [eq_qixingbaoguan.md](items/accessories/eq_qixingbaoguan.md) | manifest |
| 3 | 天风披风 | `eq_tianfengpifeng` | 天 | 披风·宝披 | 已入库 | [eq_tianfengpifeng.md](items/accessories/eq_tianfengpifeng.md) | manifest |
| 4 | 鹤羽大氅 | `eq_heyudachang` | 地 | 披风·大氅 | 已入库 | [eq_heyudachang.md](items/accessories/eq_heyudachang.md) | manifest |
| 5 | 玄铁披肩 | `eq_xuantiepijian` | 地 | 护肩·金属 | 已入库 | [eq_xuantiepijian.md](items/accessories/eq_xuantiepijian.md) | manifest |
| 6 | 紫金发冠 | `eq_zijinfaguan` | 地 | 头饰·冠 | 已入库 | [eq_zijinfaguan.md](items/accessories/eq_zijinfaguan.md) | manifest |
| 7 | 白玉冠 | `eq_baiyuguan` | 玄 | 头饰·冠 | 已入库 | [eq_baiyuguan.md](items/accessories/eq_baiyuguan.md) | manifest |
| 8 | 鳞片护肩 | `eq_linpijian` | 玄 | 护肩·鳞甲 | 已入库 | [eq_linpijian.md](items/accessories/eq_linpijian.md) | manifest |
| 9 | 乌夜披风 | `eq_wuyepifeng` | 玄 | 披风·潜行 | 已入库 | [eq_wuyepifeng.md](items/accessories/eq_wuyepifeng.md) | manifest |
| 10 | 布面披风 | `eq_bumianpifeng` | 黄 | 披风·布 | 已入库 | [eq_bumianpifeng.md](items/accessories/eq_bumianpifeng.md) | manifest |
| 11 | 皮护肩 | `eq_pijian` | 黄 | 护肩·皮革 | 已入库 | [eq_pijian.md](items/accessories/eq_pijian.md) | manifest |
| 12 | 青布头巾 | `eq_qingjin` | 黄 | 头饰·巾 | 已入库 | [eq_qingjin.md](items/accessories/eq_qingjin.md) | manifest |

### 鞋（8）· 已入库 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 天马履 | `eq_tianmalv` | 天 | 鞋·宝履 | 已入库 | [eq_tianmalv.md](items/shoes/eq_tianmalv.md) | manifest |
| 2 | 无影履 | `eq_wuyinglv` | 天 | 鞋·宝履 | 已入库 | [eq_wuyinglv.md](items/shoes/eq_wuyinglv.md) | manifest |
| 3 | 踏云履 | `eq_tayunlv` | 地 | 鞋·名履 | 已入库 | [eq_tayunlv.md](items/shoes/eq_tayunlv.md) | manifest |
| 4 | 雪行靴 | `eq_xuexingxue` | 地 | 鞋·裘靴 | 已入库 | [eq_xuexingxue.md](items/shoes/eq_xuexingxue.md) | manifest |
| 5 | 飞羽靴 | `eq_feiyuxue` | 玄 | 鞋·轻靴 | 已入库 | [eq_feiyuxue.md](items/shoes/eq_feiyuxue.md) | manifest |
| 6 | 青云履 | `eq_qingyunlv` | 玄 | 鞋·布履 | 已入库 | [eq_qingyunlv.md](items/shoes/eq_qingyunlv.md) | manifest |
| 7 | 捕快快靴 | `eq_bukuaixue` | 黄 | 鞋·布靴 | 已入库 | [eq_bukuaixue.md](items/shoes/eq_bukuaixue.md) | manifest |
| 8 | 麻编草鞋 | `eq_caoxie` | 黄 | 鞋·草鞋 | 已入库 | [eq_caoxie.md](items/shoes/eq_caoxie.md) | manifest |

### 腰带（8）· 已入库 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 乾坤宝带 | `eq_qiankundaidai` | 天 | 腰带·宝带 | 已入库 | [eq_qiankundaidai.md](items/belts/eq_qiankundaidai.md) | manifest |
| 2 | 天蚕腰带 | `eq_tianchanyaodai` | 天 | 腰带·丝带 | 已入库 | [eq_tianchanyaodai.md](items/belts/eq_tianchanyaodai.md) | manifest |
| 3 | 玄铁护腰 | `eq_xuantiedai` | 地 | 腰带·金属 | 已入库 | [eq_xuantiedai.md](items/belts/eq_xuantiedai.md) | manifest |
| 4 | 云龙玉带 | `eq_yunlongyudai` | 地 | 腰带·玉带 | 已入库 | [eq_yunlongyudai.md](items/belts/eq_yunlongyudai.md) | manifest |
| 5 | 百纳腰封 | `eq_baonadai` | 玄 | 腰带·布带 | 已入库 | [eq_baonadai.md](items/belts/eq_baonadai.md) | manifest |
| 6 | 青玉束带 | `eq_qingyudai` | 玄 | 腰带·玉带 | 已入库 | [eq_qingyudai.md](items/belts/eq_qingyudai.md) | manifest |
| 7 | 麻绳腰带 | `eq_mayaodai` | 黄 | 腰带·布绳 | 已入库 | [eq_mayaodai.md](items/belts/eq_mayaodai.md) | manifest |
| 8 | 皮护腰 | `eq_pihudai` | 黄 | 腰带·皮革 | 已入库 | [eq_pihudai.md](items/belts/eq_pihudai.md) | manifest |

### 暗器（12）· 待重出（候选是代码画的假图） 12

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 暴雨梨花钉 | `eq_baoyulihuading` | 天 | 暗器·机括钉匣 | 待重出（候选是代码画的假图） | [eq_baoyulihuading.md](items/hidden-weapons/eq_baoyulihuading.md) | manifest |
| 2 | 小李飞刀 | `eq_xiaolifeidao` | 天 | 暗器·飞刀 | 待重出（候选是代码画的假图） | [eq_xiaolifeidao.md](items/hidden-weapons/eq_xiaolifeidao.md) | manifest |
| 3 | 冰魄银针 | `eq_bingpoyinzhen` | 地 | 暗器·名针 | 待重出（候选是代码画的假图） | [eq_bingpoyinzhen.md](items/hidden-weapons/eq_bingpoyinzhen.md) | manifest |
| 4 | 黑血神针 | `eq_heixueshenzhen` | 地 | 暗器·毒针 | 待重出（候选是代码画的假图） | [eq_heixueshenzhen.md](items/hidden-weapons/eq_heixueshenzhen.md) | manifest |
| 5 | 孔雀翎 | `eq_kongqueling` | 地 | 暗器·机括 | 待重出（候选是代码画的假图） | [eq_kongqueling.md](items/hidden-weapons/eq_kongqueling.md) | manifest |
| 6 | 罗刹短铳 | `eq_luochaduanchong` | 地 | 暗器·火器 | 待重出（候选是代码画的假图） | [eq_luochaduanchong.md](items/hidden-weapons/eq_luochaduanchong.md) | manifest |
| 7 | 蚊须针 | `eq_wenxuzhen` | 地 | 暗器·名针 | 待重出（候选是代码画的假图） | [eq_wenxuzhen.md](items/hidden-weapons/eq_wenxuzhen.md) | manifest |
| 8 | 含沙射影 | `eq_hanshasheying` | 玄 | 暗器·机括 | 待重出（候选是代码画的假图） | [eq_hanshasheying.md](items/hidden-weapons/eq_hanshasheying.md) | manifest |
| 9 | 梅花针 | `it_meihuazhen` | 玄 | 暗器·针 | 待重出（候选是代码画的假图） | [it_meihuazhen.md](items/hidden-weapons/it_meihuazhen.md) | manifest |
| 10 | 飞蝗石 | `it_feihuangshi` | 黄 | 暗器·弹丸 | 待重出（候选是代码画的假图） | [it_feihuangshi.md](items/hidden-weapons/it_feihuangshi.md) | manifest |
| 11 | 金钱镖 | `it_jinqianbiao` | 黄 | 暗器·飞镖 | 待重出（候选是代码画的假图） | [it_jinqianbiao.md](items/hidden-weapons/it_jinqianbiao.md) | manifest |
| 12 | 袖箭 | `it_xiujian` | 黄 | 暗器·弩箭 | 待重出（候选是代码画的假图） | [it_xiujian.md](items/hidden-weapons/it_xiujian.md) | manifest |

## 地图

全国导航图是 `tools/map/render_map.py` 从 design/19 数据生成的 SVG（14 个时代图层），**不是出图任务**。要画的是 30 个区域的水墨局部图（类比作者已审的大理苍洱局部图）；全国水墨衬纸为可选项。

| # | 名称 | asset_id | 输出 | 图 | 提示词 |
|---:|---|---|---|---|---|
| 1 | 巴蜀区域局部图 | `map_region_bashu__base` | `assets/default/map/regions/rg_bashu.png` | 待出图 | [rg_bashu.md](maps/region/rg_bashu.md) |
| 2 | 大理苍山区域局部图 | `map_region_dali_cangshan__base` | `assets/default/map/regions/rg_dali_cangshan.png` | 待出图 | [rg_dali_cangshan.md](maps/region/rg_dali_cangshan.md) |
| 3 | 东北边地区域局部图 | `map_region_dongbei__base` | `assets/default/map/regions/rg_dongbei.png` | 待出图 | [rg_dongbei.md](maps/region/rg_dongbei.md) |
| 4 | 东海诸岛区域局部图 | `map_region_donghai_islands__base` | `assets/default/map/regions/rg_donghai_islands.png` | 待出图 | [rg_donghai_islands.md](maps/region/rg_donghai_islands.md) |
| 5 | 闽地区域局部图 | `map_region_fujian__base` | `assets/default/map/regions/rg_fujian.png` | 待出图 | [rg_fujian.md](maps/region/rg_fujian.md) |
| 6 | 桂西桂北区域局部图 | `map_region_guangxi__base` | `assets/default/map/regions/rg_guangxi.png` | 待出图 | [rg_guangxi.md](maps/region/rg_guangxi.md) |
| 7 | 关中陕北区域局部图 | `map_region_guanzhong__base` | `assets/default/map/regions/rg_guanzhong.png` | 待出图 | [rg_guanzhong.md](maps/region/rg_guanzhong.md) |
| 8 | 河东与晋中区域局部图 | `map_region_hedong_jinzhong__base` | `assets/default/map/regions/rg_hedong_jinzhong.png` | 待出图 | [rg_hedong_jinzhong.md](maps/region/rg_hedong_jinzhong.md) |
| 9 | 河西与陇右区域局部图 | `map_region_hexilongyou__base` | `assets/default/map/regions/rg_hexilongyou.png` | 待出图 | [rg_hexilongyou.md](maps/region/rg_hexilongyou.md) |
| 10 | 湖湘区域局部图 | `map_region_huxiang__base` | `assets/default/map/regions/rg_huxiang.png` | 待出图 | [rg_huxiang.md](maps/region/rg_huxiang.md) |
| 11 | 江淮区域局部图 | `map_region_jianghuai__base` | `assets/default/map/regions/rg_jianghuai.png` | 待出图 | [rg_jianghuai.md](maps/region/rg_jianghuai.md) |
| 12 | 太湖江南区域局部图 | `map_region_jiangnan_taihu__base` | `assets/default/map/regions/rg_jiangnan_taihu.png` | 待出图 | [rg_jiangnan_taihu.md](maps/region/rg_jiangnan_taihu.md) |
| 13 | 江西区域局部图 | `map_region_jiangxi__base` | `assets/default/map/regions/rg_jiangxi.png` | 待出图 | [rg_jiangxi.md](maps/region/rg_jiangxi.md) |
| 14 | 荆襄区域局部图 | `map_region_jingxiang__base` | `assets/default/map/regions/rg_jingxiang.png` | 待出图 | [rg_jingxiang.md](maps/region/rg_jingxiang.md) |
| 15 | 辽东区域局部图 | `map_region_liaodong__base` | `assets/default/map/regions/rg_liaodong.png` | 待出图 | [rg_liaodong.md](maps/region/rg_liaodong.md) |
| 16 | 辽西走廊区域局部图 | `map_region_liaoxi__base` | `assets/default/map/regions/rg_liaoxi.png` | 待出图 | [rg_liaoxi.md](maps/region/rg_liaoxi.md) |
| 17 | 岭南南海岸区域局部图 | `map_region_lingnan__base` | `assets/default/map/regions/rg_lingnan.png` | 待出图 | [rg_lingnan.md](maps/region/rg_lingnan.md) |
| 18 | 漠北区域局部图 | `map_region_mobei__base` | `assets/default/map/regions/rg_mobei.png` | 待出图 | [rg_mobei.md](maps/region/rg_mobei.md) |
| 19 | 漠南区域局部图 | `map_region_monan__base` | `assets/default/map/regions/rg_monan.png` | 待出图 | [rg_monan.md](maps/region/rg_monan.md) |
| 20 | 南海诸岛区域局部图 | `map_region_nanhai_islands__base` | `assets/default/map/regions/rg_nanhai_islands.png` | 待出图 | [rg_nanhai_islands.md](maps/region/rg_nanhai_islands.md) |
| 21 | 齐鲁区域局部图 | `map_region_qilu__base` | `assets/default/map/regions/rg_qilu.png` | 待出图 | [rg_qilu.md](maps/region/rg_qilu.md) |
| 22 | 秦巴汉水区域局部图 | `map_region_qinba__base` | `assets/default/map/regions/rg_qinba.png` | 待出图 | [rg_qinba.md](maps/region/rg_qinba.md) |
| 23 | 青藏区域局部图 | `map_region_qingzang__base` | `assets/default/map/regions/rg_qingzang.png` | 待出图 | [rg_qingzang.md](maps/region/rg_qingzang.md) |
| 24 | 西夏贺兰区域局部图 | `map_region_xixia_helan__base` | `assets/default/map/regions/rg_xixia_helan.png` | 待出图 | [rg_xixia_helan.md](maps/region/rg_xixia_helan.md) |
| 25 | 西域北疆区域局部图 | `map_region_xiyu_beijiang__base` | `assets/default/map/regions/rg_xiyu_beijiang.png` | 待出图 | [rg_xiyu_beijiang.md](maps/region/rg_xiyu_beijiang.md) |
| 26 | 西域南疆区域局部图 | `map_region_xiyu_nanjiang__base` | `assets/default/map/regions/rg_xiyu_nanjiang.png` | 待出图 | [rg_xiyu_nanjiang.md](maps/region/rg_xiyu_nanjiang.md) |
| 27 | 燕京与直隶区域局部图 | `map_region_yanjing_zhili__base` | `assets/default/map/regions/rg_yanjing_zhili.png` | 待出图 | [rg_yanjing_zhili.md](maps/region/rg_yanjing_zhili.md) |
| 28 | 云滇黔中区域局部图 | `map_region_yundian_qianzhong__base` | `assets/default/map/regions/rg_yundian_qianzhong.png` | 待出图 | [rg_yundian_qianzhong.md](maps/region/rg_yundian_qianzhong.md) |
| 29 | 浙东沿海区域局部图 | `map_region_zhedong__base` | `assets/default/map/regions/rg_zhedong.png` | 待出图 | [rg_zhedong.md](maps/region/rg_zhedong.md) |
| 30 | 中原区域局部图 | `map_region_zhongyuan__base` | `assets/default/map/regions/rg_zhongyuan.png` | 待出图 | [rg_zhongyuan.md](maps/region/rg_zhongyuan.md) |
| 31 | 江湖万里图 · 水墨衬纸（全国底图） | `map_jianghu_world__ink_base` | `assets/default/map/jianghu_world/ink_base.png` | 待出图（可选） | [jianghu_world_ink_base.md](maps/jianghu_world_ink_base.md) |

## 角色分层部件（AR-22，tech/09）

两套标准体型各 3 张全身参考图 + 13 部件 × 3 视图 = 42 份。**顺序**：先出该视图的全身参考图，再以它为唯一图片输入逐部件出图；全部出完跑 `python3 tools/rig/make_parts.py assets/default/rig/<set>` 裁边定枢轴写 manifest，`python3 tools/rig/preview.py assets/default/rig/<set> --out assets/default/rig/<set>/preview.png` 看姿势条带。是否现在就出由作者定。

| 体型集 | 视图 | 参考图 | 部件（13） | 图 |
|---|---|---|---|---|
| male_std | front34 | [ref_front34.md](rig/male_std/ref_front34.md)（待出图） | [foot_shared](rig/male_std/front34/foot_shared.md)、[forearm_L](rig/male_std/front34/forearm_L.md)、[forearm_R](rig/male_std/front34/forearm_R.md)、[hair_or_headgear](rig/male_std/front34/hair_or_headgear.md)、[hand_L](rig/male_std/front34/hand_L.md)、[hand_R](rig/male_std/front34/hand_R.md)、[head](rig/male_std/front34/head.md)、[pelvis_skirt](rig/male_std/front34/pelvis_skirt.md)、[shin_shared](rig/male_std/front34/shin_shared.md)、[thigh_shared](rig/male_std/front34/thigh_shared.md)、[torso](rig/male_std/front34/torso.md)、[upper_arm_L](rig/male_std/front34/upper_arm_L.md)、[upper_arm_R](rig/male_std/front34/upper_arm_R.md) | 待出图 13 |
| male_std | back34 | [ref_back34.md](rig/male_std/ref_back34.md)（待出图） | [foot_shared](rig/male_std/back34/foot_shared.md)、[forearm_L](rig/male_std/back34/forearm_L.md)、[forearm_R](rig/male_std/back34/forearm_R.md)、[hair_or_headgear](rig/male_std/back34/hair_or_headgear.md)、[hand_L](rig/male_std/back34/hand_L.md)、[hand_R](rig/male_std/back34/hand_R.md)、[head](rig/male_std/back34/head.md)、[pelvis_skirt](rig/male_std/back34/pelvis_skirt.md)、[shin_shared](rig/male_std/back34/shin_shared.md)、[thigh_shared](rig/male_std/back34/thigh_shared.md)、[torso](rig/male_std/back34/torso.md)、[upper_arm_L](rig/male_std/back34/upper_arm_L.md)、[upper_arm_R](rig/male_std/back34/upper_arm_R.md) | 待出图 13 |
| male_std | side | [ref_side.md](rig/male_std/ref_side.md)（待出图） | [foot_shared](rig/male_std/side/foot_shared.md)、[forearm_L](rig/male_std/side/forearm_L.md)、[forearm_R](rig/male_std/side/forearm_R.md)、[hair_or_headgear](rig/male_std/side/hair_or_headgear.md)、[hand_L](rig/male_std/side/hand_L.md)、[hand_R](rig/male_std/side/hand_R.md)、[head](rig/male_std/side/head.md)、[pelvis_skirt](rig/male_std/side/pelvis_skirt.md)、[shin_shared](rig/male_std/side/shin_shared.md)、[thigh_shared](rig/male_std/side/thigh_shared.md)、[torso](rig/male_std/side/torso.md)、[upper_arm_L](rig/male_std/side/upper_arm_L.md)、[upper_arm_R](rig/male_std/side/upper_arm_R.md) | 待出图 13 |
| female_std | front34 | [ref_front34.md](rig/female_std/ref_front34.md)（待出图） | [foot_shared](rig/female_std/front34/foot_shared.md)、[forearm_L](rig/female_std/front34/forearm_L.md)、[forearm_R](rig/female_std/front34/forearm_R.md)、[hair_or_headgear](rig/female_std/front34/hair_or_headgear.md)、[hand_L](rig/female_std/front34/hand_L.md)、[hand_R](rig/female_std/front34/hand_R.md)、[head](rig/female_std/front34/head.md)、[pelvis_skirt](rig/female_std/front34/pelvis_skirt.md)、[shin_shared](rig/female_std/front34/shin_shared.md)、[thigh_shared](rig/female_std/front34/thigh_shared.md)、[torso](rig/female_std/front34/torso.md)、[upper_arm_L](rig/female_std/front34/upper_arm_L.md)、[upper_arm_R](rig/female_std/front34/upper_arm_R.md) | 待出图 13 |
| female_std | back34 | [ref_back34.md](rig/female_std/ref_back34.md)（待出图） | [foot_shared](rig/female_std/back34/foot_shared.md)、[forearm_L](rig/female_std/back34/forearm_L.md)、[forearm_R](rig/female_std/back34/forearm_R.md)、[hair_or_headgear](rig/female_std/back34/hair_or_headgear.md)、[hand_L](rig/female_std/back34/hand_L.md)、[hand_R](rig/female_std/back34/hand_R.md)、[head](rig/female_std/back34/head.md)、[pelvis_skirt](rig/female_std/back34/pelvis_skirt.md)、[shin_shared](rig/female_std/back34/shin_shared.md)、[thigh_shared](rig/female_std/back34/thigh_shared.md)、[torso](rig/female_std/back34/torso.md)、[upper_arm_L](rig/female_std/back34/upper_arm_L.md)、[upper_arm_R](rig/female_std/back34/upper_arm_R.md) | 待出图 13 |
| female_std | side | [ref_side.md](rig/female_std/ref_side.md)（待出图） | [foot_shared](rig/female_std/side/foot_shared.md)、[forearm_L](rig/female_std/side/forearm_L.md)、[forearm_R](rig/female_std/side/forearm_R.md)、[hair_or_headgear](rig/female_std/side/hair_or_headgear.md)、[hand_L](rig/female_std/side/hand_L.md)、[hand_R](rig/female_std/side/hand_R.md)、[head](rig/female_std/side/head.md)、[pelvis_skirt](rig/female_std/side/pelvis_skirt.md)、[shin_shared](rig/female_std/side/shin_shared.md)、[thigh_shared](rig/female_std/side/thigh_shared.md)、[torso](rig/female_std/side/torso.md)、[upper_arm_L](rig/female_std/side/upper_arm_L.md)、[upper_arm_R](rig/female_std/side/upper_arm_R.md) | 待出图 13 |

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
