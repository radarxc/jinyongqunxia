# VFX-sk_baihuacuo 报告 · 招式特效 · 天级 百花错拳（sk_baihuacuo，6 招）

## 1. 摘要（3–6 行）

- 完成 6 招：4 个普通招共用家族图，2 个绝招各有独立效果套；9 条清单记录均为 candidate。
- 内置 image_gen 共生成 4 张候选，3 张入选白底四帧图，经 `cut_frames.py` 导出 12 张 straight-alpha RGBA 帧。
- 每招已交付 Composition YAML / JSON、`peak.png`、Three.js `demo.html`；三项指定检查全部退出 0。
- 图鉴六招均未标 `projection:true`；按近身 / 绕背 / 横扫 / 周身局部表现，未新增玩法射程或命中格。

## 2. 产出（文件、行数、主要章节）

以下路径相对 `assets/default/vfx/sk_baihuacuo/`；资产目录共 56 文件，另有本报告。

| 文件 | 行数 / 数量 | 内容 |
|---|---:|---|
| `effect/{family,mv_baihuacuo_cuoluo,mv_baihuacuo_fanchang}/` | 3×10 文件；YAML 各 66 行 | 原图、4 RGBA 帧、EffectSet、quality、黑灰白三底预览 |
| `moves/<mv_id>/` | 6×4 文件 | YAML 各 34 行、JSON 各 188 行、HTML 各 497 行、1536×1024 峰值 |
| `manifest.yaml` | 416 行 / 9 主条目 | 3 原料 + 6 招；提示词、候选、哈希、代码和附件完整性 |
| `source_requests.json` | 27 行 | 三套 image_gen 请求、颜色依据与考据边界 |

## 3. 关键结论与数值

- 3 套母版均为 1254×1254、2×2，每帧 627×627；家族 / 错落 / 合道实测参考长度为 482 / 507 / 461 px，根宽 90 / 105 / 104 px。
- 全套采用 `harmony` 淡金水墨、`normal` 混合；该颜色和具体造型均为（原创扩展），不宣称为原著色彩。
- 六招演示长度均为 `L=1×256=256 px`；`cuoluo` 的 `range_hex=0` 仅表示周身自指，仍以正长度展示局部拳势。
- 普通 pulse=`0.10+0.15+0.25+0.10=0.60s`；绝招 wave=`0.15+0.20+0.40+0.15=0.90s`；峰值相位 0.5，循环另加 0.40s。
- 12 帧的 8px 边框 alpha 残留率及残白率均为 0；六招全帧几何安全边距最小 74.68px；HTML 1,544,750–2,196,557 bytes，均小于 3MB。

## 4. 开放问题（附默认值）

| 事项 | 默认值 / 当前事实 |
|---|---|
| 作者造型取舍 | 默认沿用本轮候选，仅标 candidate；`反常合道`淘汰带独立叶片的候选 1，采用无植物散件的候选 2 |
| 原图底色 | image_gen 原图视觉为白底，边界通道实测最低 253/255，非逐像素纯白；默认保留原件，`white_key=250` 后 12 帧边界与残白率均为 0 |
| 原著考据 | 百花错拳名称及袁士霄传陈家洛有据；具体回目与原著招名（待考）；六招招名、视觉轮廓和淡金色按原创扩展处理 |
| 浏览器 / 真机 / CDN | 未实跑浏览器与真机，Three.js r186 CDN 可达性和动态性能（待实测）；默认保留指定唯一外链与静态峰值门禁 |
| 周身 / 绕背接线 | 默认将本套视为单个近身视觉片段；目标选择、绕背位移、周身多目标及伤害段均由 Core 事件驱动 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增。本轮没有改变范围、投送、命中段、倍率、Buff 或武学事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/tech/02-rendering.md` / 运行时接入 | 动作挂点与表现队列 | 接入共享 fist emitter 与三套 EffectSet；绕背 / 横扫 / 周身目标由已有 Core 事件分发，不从四帧推导命中次数 |
| `tools/vfx/build_demo.py` / 工具任务 | 标题与 aria-label | 生成器仍把非外放招式写作“外放样例 / 外放招式预览”，建议改为中性“招式”；本轮按约束未改工具 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_baihuacuo_baijia` | 否 | 否 | family | 256 | pulse / 0.60s |
| `mv_baihuacuo_cangzhen` | 否 | 否 | family | 256 | pulse / 0.60s |
| `mv_baihuacuo_cuoluo` | 是 | 否 | mv_baihuacuo_cuoluo | 256 | wave / 0.90s |
| `mv_baihuacuo_fanchang` | 是 | 否 | mv_baihuacuo_fanchang | 256 | wave / 0.90s |
| `mv_baihuacuo_luanhua` | 否 | 否 | family | 256 | pulse / 0.60s |
| `mv_baihuacuo_yihua` | 否 | 否 | family | 256 | pulse / 0.60s |

| 原料清单（各含白底 source_01.png + 4 RGBA 帧） | 候选数 → 入选 | 原创意象 |
|---|---|---|
| `effect/family` | 1→1 | 三路错置曲笔与花瓣状负形；不是实物花朵 |
| `effect/mv_baihuacuo_cuoluo` | 1→1 | 六路不对称近身旋卷；不表示六段命中 |
| `effect/mv_baihuacuo_fanchang` | 2→1（候选 2） | 两路反向回折后合一；候选 1 因独立叶片状墨点淘汰 |

- ✅ 三张入选原件均经 `view_image` 检查，三张黑底切帧预览均无白边；另抽查百家纷呈 / 百花错落峰值，方向、拳峰根部衔接正常。
- ✅ `check_skill_suite.py … --catalog docs/design/catalog/skills-qianlong.md`：0 问题；`check_assets.py … --min 1 --max 60 --min-side 256`：9 图片 / 9 条目 / 0 问题。
- ✅ `check_ids.py --strict`：strict failure=0、new=0；仅保留仓库基线已有 `sk_babuganchan` 未定义 1 条，非本任务新增。
- ✅ 6 招均由 `compose.py` / `build_demo.py` 构建；demo 唯一外链为 Three.js `0.186.1`，全部≤3MB；共享拳图只按相对路径引用，未复制或改写。
- ⚠️ 原著描写依据：百花错拳名称及袁士霄传陈家洛沿用图鉴；具体回目、原著招名（待考），未编造引文、回目或人物。
- ⚠️ 需作者确认事项：默认沿用三套 candidate 造型与淡金色；浏览器动画、CDN 和真机表现（待实测），不以静态检查冒充。
- ✅ 只写指定资产目录与本报告；未修改工具、设计文档或 TODO，未执行改变仓库状态的 git 命令；全文无占位或截断。
