# 样稿素材来源 · 第三版

## 1. 沿用的场景、立绘与物品

以下沿用第一版 WebP（quality=78/method=6），未重绘；仅删除未使用的倚天剑缩图。素材落库不等于作者最终批准。本样稿为方向评审，不据立绘服饰推断装备。

| 文件 | 源文件 | 原尺寸 | 输出尺寸 | 字节 |
|---|---|---|---|---:|
| img/map.webp | `assets/default/baseline/map/ref_map_jianghu__ch01_base01.png` | 1536×1024 | 1536×1024 | 267804 |
| img/town.webp | `assets/default/town/city_zhangye__ch10/preview.png` | 4096×2048 | 1600×800 | 76092 |
| img/hero.webp | `assets/default/character/male/ch10/por_npc_zhujue__ch10_m_base.png` | 1024×1536 | 567×850 | 41180 |
| img/li.webp | `assets/default/character/female/ch10/por_npc_liwenxiu__ch10_youth_astuo_base.png` | 1024×1536 | 567×850 | 24784 |
| img/scene.webp | `assets/default/scene/ch10/cg_ch10_white_horse_return.png` | 1536×1024 | 1400×933 | 227282 |
| img/sword.webp | `assets/default/item/weapons/eq_qinggangjian.png` | 1254×1254 | 280×280 | 1434 |
| img/pill.webp | `assets/default/item/medicine/it_jiuhuayulu.png` | 1254×1254 | 280×280 | 3386 |
| img/medicine.webp | `assets/default/item/medicine/it_jinchuangyao.png` | 1254×1254 | 280×280 | 4448 |
| img/manual.webp | `assets/default/item/manuals/it_miji_jianghutuna.png` | 1536×1536 | 280×280 | 3232 |

## 2. AR-48 Codex 成品图标

统一来源目录：`assets/default/ui/icons/`；完整生成记录见该目录 `manifest.yaml`，tool 为 `codex exec · image_gen`。本次 16 件均为 `candidate`，未修改母版或 manifest。只选择 HTML/CSS 实际引用的图标；不复制其余六个状态。

转换：512×512 RGBA → 预乘 alpha → Lanczos 等比缩为 128×128 → RGBA WebP，quality=86/method=6。保持透明，不重新抠图、绘制或添加板底；16 张均 ≤40,000 B。源 SHA-256 与 manifest 一致性在本任务检查过。

| 来源 ID | 样稿文件 | 母版文件 | 输出字节 |
|---|---|---|---:|
| `ui_tool_bag` | `img/ui_tool_bag.webp` | `ui_tool_bag.png` | 5294 |
| `ui_tool_martial` | `img/ui_tool_martial.webp` | `ui_tool_martial.png` | 4276 |
| `ui_tool_character` | `img/ui_tool_character.webp` | `ui_tool_character.png` | 3780 |
| `ui_tool_codex` | `img/ui_tool_codex.webp` | `ui_tool_codex.png` | 4294 |
| `ui_tool_journal` | `img/ui_tool_journal.webp` | `ui_tool_journal.png` | 4412 |
| `ui_tool_system` | `img/ui_tool_system.webp` | `ui_tool_system.png` | 4984 |
| `ui_tool_map` | `img/ui_tool_map.webp` | `ui_tool_map.png` | 4322 |
| `ui_tool_save` | `img/ui_tool_save.webp` | `ui_tool_save.png` | 4780 |
| `ui_tool_town` | `img/ui_tool_town.webp` | `ui_tool_town.png` | 5060 |
| `ui_tool_battle` | `img/ui_tool_battle.webp` | `ui_tool_battle.png` | 4606 |
| `ui_res_silver` | `img/ui_res_silver.webp` | `ui_res_silver.png` | 4560 |
| `ui_map_city` | `img/ui_map_city.webp` | `ui_map_city.png` | 5330 |
| `ui_status_hp` | `img/ui_status_hp.webp` | `ui_status_hp.png` | 3650 |
| `ui_status_mp` | `img/ui_status_mp.webp` | `ui_status_mp.png` | 4984 |
| `ui_status_sta` | `img/ui_status_sta.webp` | `ui_status_sta.png` | 4926 |
| `ui_status_rage` | `img/ui_status_rage.webp` | `ui_status_rage.png` | 4172 |

桌面工具图像框 64 px，手机 56 px；状态图像框 22–24 px。小状态图配全称或可访问名称与数字；人物无五官效果保留供作者审图，替代建议见 design/26 §14.5。

## 3. 字体与截图库

沿用第一版 Ma Shan Zheng 的 Google Fonts `text=` 字符子集请求，补齐本轮短标题所需字符，正文用原宋体 / 楷体回退栈；没有新增本地字体。生产的自托管、授权随包与增量子集管线见 design/26 §6。

截图仅为浏览器渲染的审阅证据，不属于生产美术；记录见 README。

| 截图文件 | 原生视口 | 字节 / WebP quality | 来源 |
|---|---|---|---|
| `img/review-map-1280x720.webp` | 1280×720 | 39592 / 20 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-town-1280x720.webp` | 1280×720 | 38714 / 79 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-battle-1280x720.webp` | 1280×720 | 39128 / 77 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-bag-1280x720.webp` | 1280×720 | 38876 / 77 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-martial-1280x720.webp` | 1280×720 | 38376 / 81 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-character-1280x720.webp` | 1280×720 | 39872 / 75 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-codex-1280x720.webp` | 1280×720 | 39662 / 80 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-journal-1280x720.webp` | 1280×720 | 39536 / 70 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-system-1280x720.webp` | 1280×720 | 39906 / 83 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-map-390x844.webp` | 390×844 | 39752 / 76 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-town-390x844.webp` | 390×844 | 38962 / 88 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-battle-390x844.webp` | 390×844 | 35708 / 88 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-bag-390x844.webp` | 390×844 | 32784 / 88 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-martial-390x844.webp` | 390×844 | 30140 / 88 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-character-390x844.webp` | 390×844 | 30506 / 88 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-codex-390x844.webp` | 390×844 | 33356 / 88 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-journal-390x844.webp` | 390×844 | 39296 / 84 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |
| `img/review-system-390x844.webp` | 390×844 | 28736 / 88 | 系统 WebKit · 同份 HTML/CSS · 字体回退 |

以上 18 张只作审阅截图，不被场景 HTML/CSS 加载；PNG 转同尺寸 WebP，按 ≤40,000 B 搜索最高整数质量（上限 88）。`verification.json` 记录源 / 截图 hash、引擎版本及检查边界；地图横屏压缩至 quality=20，细纹请直接打开 HTML 审阅。

## 4. AR-50 地形与植物（8 件库内素材）

本工作副本没有 `assets/default/building-map/`、`assets/default/tile/`，本轮逐件从集成副本 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/` 只读取以下源图和所在 manifest；源 SHA-256 均与清单一致。只输出本目录 WebP，没有复制整套 assets 或写入源目录。复现时按下表仓库相对路径取同 hash 文件；完整源 hash、原 / 输出尺寸与状态见 [terrain-sources.json](terrain-sources.json)。

转换：预乘 alpha、Lanczos 等比缩至长边至多 192 px（小图不放大）、WebP quality=86 / method=6，保持透明。下列 ID 均为既有素材 ID；approved / candidate 仅转录源清单，不扩大作者批准范围。美术拼景不作为白马地区植物分布的事实依据。

| 样稿文件 | 库内来源 ID（也是 PNG 文件名） | 来源目录（assets/default/ 下） | 输出 px / 字节 | 源状态 |
|---|---|---|---|---|
| `img/terrain-bamboo.webp` | `tex_town_ming_south_tree_cluster__bamboo_v01` | `tile/ming_south/` | 136×171 / 13418 | approved |
| `img/terrain-willow.webp` | `tex_town_song_north_tree_cluster__willow_v01` | `tile/song_north/` | 192×139 / 11262 | approved |
| `img/terrain-grass.webp` | `tex_town_mongol_grass_tuft__steppe_v01` | `tile/mongol/` | 84×57 / 2222 | approved |
| `img/terrain-rubble.webp` | `deco_ruins_collapse_v01` | `tile/ruins/` | 144×107 / 4712 | candidate |
| `img/terrain-wall.webp` | `deco_ruins_adobe_wall_brick_v01` | `tile/ruins/` | 120×103 / 3350 | candidate |
| `img/terrain-flowers.webp` | `tex_town_song_dali_shrub__camellia_v01` | `baseline/tile/` | 147×103 / 7434 | candidate |
| `img/terrain-reed.webp` | `tex_town_song_southern_reed__canal_v01` | `baseline/tile/` | 88×68 / 2578 | candidate |
| `img/terrain-water.webp` | `tex_town_song_southern_water__v01` | `baseline/tile/` | 64×32 / 572 | candidate |

台地顶面 / 侧壁、坡阶线、六角与落点轮廓均为场景原生 SVG 几何；溪水复用源水纹的中心矩形区域作连续填充（仅 SVG 取样，不改源图），格域与 `tr_qianshui` 完全重合。树、竹、碎石、断墙与花草使用上述透明缩图，不是手绘替代品。本轮 **样稿临时生成位图为零**；ART 正式补图建议为六角坡阶 / 台地侧壁、连续浅溪岸线、可站 / 不可站石块和独立动作 / 返回图标，见 design/26 §14.5。
