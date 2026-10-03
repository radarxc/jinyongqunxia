# VFX-sk_xiantiangong 报告 · 招式特效 · 天级 先天功（sk_xiantiangong，3 招）

## 1. 摘要（3–6 行）

- 完成三张 `image_gen` 白底四帧原料、12 张 RGBA，以及三招 Composition YAML / JSON、峰值 PNG 与 Three.js 演示。
- 家族图供普通招复用，两记绝招各有独有造型；三套各一候选选一，全部登记 `candidate`。
- 保留图鉴边界：阳性内功，两绝招一普通招，三招均不擅自标记外放；共享 palm 只引用，未复制或修改。
- 三项指定检查全部退出 0；结构、全帧几何、抠图质量与 HTML 静态检查通过，浏览器 / 真机仍（待实测）。

## 2. 产出（文件、行数、主要章节）

以下资产路径均位于 `assets/default/vfx/sk_xiantiangong/`，共 48 文件；本报告另计。

| 文件 | 数量 / 行数 | 内容 |
|---|---:|---|
| `effect/{family,mv_xiantiangong_gangqi,mv_xiantiangong_wuqi}/` | 33 文件；YAML 各 72 行、prompt 各 7 行 | 三张 1536×1024 原图、12 张 768×512 RGBA、三份配置、三底预览与质量数据 |
| `moves/<mv_id>/` | 12 文件；YAML 各 51 行、JSON 各 188 行 | 三招参数、1536×1024 peak、单文件 demo |
| `manifest.yaml` | 340 行 / 6 条 | 3 原料 + 3 招，完整提示词、来源、候选数、尺寸与 SHA-256 |
| `README.md` / `verification.json` | 107 / 119 行 | 原著边界、量图、长度与节奏算式、复现命令 / 验收与依赖哈希 |

## 3. 关键结论与数值

- 图鉴 §2.2 / AR-16 审计确认：先天罡气 `aoe_self`；五气朝元对敌 `aoe_around`、对己 `aoe_self`；一炁贯虹 `aoe_line n3`、ranged 1–3，但离体真气依据待考，均不设置 `projectionSpreadSteps`。
- 纯表现【建议值】：标尺 180 px/hex；罡气 `1.5×180=270 px`、五气 `1.75×180=315 px` 为局部造型；一炁 `3×180=540 px` 对应既有 3 格示例。前两招 `range_hex=0`，不是新射程。
- 根部对齐 E=`[600,540]`、θ=0°；掌宽 `320×0.65=208 px`；纵 / 横缩放分别 `L/reference_length`、`208/root_width`，三套参考长 630 / 444 / 510、根宽 166 / 157 / 175 px。
- 普通 linear=`0.10+0.10+0.30+0.10=0.60 s`；绝招 wave=`0.15+0.20+0.40+0.15=0.90 s`；峰值相位分别 1/3、7/18，不从 CT 换算。
- 最终 white_key 全保留差值 64；12 帧边框 alpha 与残白比例均 0，最大白底重建误差 0.5373/255 内；初试 white_luma 的 6/255 已通过现有参数解决。
- 全帧几何最小安全边距 74.15 px，留白保守下界 48.11%–61.26%；3 HTML 无纹理降采样，分别 2,047,886 / 1,947,932 / 1,488,781 bytes（罡气 / 五气 / 一炁），均 <3 MB。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 作者审美确认 | 沿用赤色气带、三层护体弧面与五股旋卷，全部 candidate |
| 自身 / 周身接入 | 沿用共享掌面局部演示；正式人物挂点与完整周身表现交下游，不按图像推导 AoE |
| 原著与外放 | 沿用图鉴待考；不把一炁贯虹 ranged 升为 projection |
| 四帧连续性 / 运行环境 | 沿用 crossfade 与方向遮罩；五气初聚到成形的轮廓变化、CDN / WebGL / 真机仍待实测 |
| 原料近白与锚点偏移 | 外缘 32 px 为 253–255 近白，默认现有阈值清除；约 5–7 px 根部纵移用逐帧锚点校正，保留原件 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本套件只消费既有玩法定义，不修改基准或武学卡。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/tech/02-rendering.md` | 招式挂点接入 | 自身护体与周身技改挂真实人物；本套掌图仅作独立示意 |
| `tools/vfx/build_demo.py` | 第 63 / 74 行标题与 aria-label | 当前统一“外放样例 / 外放招式预览”会误称非外放招，建议后续采用中性“招式”或消费明确标记；本次未改工具 |
| `docs/README.md` | 第 185 行 | strict 扫描仍报告既有基线 `sk_babuganchan` 未定义；不是本次新增，本任务不处理 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 用的效果套 | 长度【建议值】 | 节奏 |
|---|---|---|---|---:|---|
| `mv_xiantiangong_gangqi` | 是 | 否 | `mv_xiantiangong_gangqi` | 270 px（局部） | wave / 0.90 s |
| `mv_xiantiangong_wuqi` | 是 | 否 | `mv_xiantiangong_wuqi` | 315 px（局部） | wave / 0.90 s |
| `mv_xiantiangong_yiqi` | 否 | 否，证据待考 | `family` | 540 px（3 格示意） | linear / 0.60 s |

| 原料清单 | 候选 → 入选 | 造型 / 原著描写依据 |
|---|---:|---|
| `effect/family/source_sheet.png` | image_gen 1→1 | 连源赤色气带；阳性色系与一炁意象（原创扩展） |
| `effect/mv_xiantiangong_gangqi/source_sheet.png` | image_gen 1→1 | 三层弧形气膜；护体招名意象（原创扩展） |
| `effect/mv_xiantiangong_wuqi/source_sheet.png` | image_gen 1→1 | 五股气带归元旋卷；招名意象（原创扩展） |

- ✅ 原著依据仅引用道家图鉴关于王重阳内功的归属；三招、颜色、具体轮廓均标（原创扩展）。原著细节（待考）：三联 / 广州修订版《射雕英雄传》一灯向郭靖、黄蓉追述王重阳、段智兴与欧阳锋往事的段落，未编造引文或回目。
- ✅ 三张原图均用 `view_image`；最终三套各看深 / 灰底联系表，三张峰值全部复查，根部接掌、方向向右、未见明显白边；原图近白波动和锚点校正已披露。
- ✅ 普通招仅复用 family，两绝招各自一套；全部由 `cut_frames.py` / `compose.py` / `build_demo.py` 派生，无整图动画帧、无工具逻辑改动。
- ✅ `python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_xiantiangong --catalog docs/design/catalog/skills-daojia.md`：0 问题，退出 0。
- ✅ `python3 tools/agents/check_assets.py assets/default/vfx/sk_xiantiangong --min 1 --max 60 --min-side 256`：6 图片 / 6 条 / 0 问题，退出 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：172 文件，strict failure 0；既有未定义 1、近似 ID 1，新增未定义 0，退出 0。
- ✅ 现有 VFX 校验接口验证三招结构 / 质量 / 全帧几何；HTML 均通过图片解码、唯一 Three.js r186 importmap 与内联 JS 语法检查，详情见 verification。
- ✅ 原图与 image_gen 输出逐字节一致；共享 palm PNG / YAML SHA-256 与 git HEAD 一致，未复制、未修改。manifest 三招均 `pipeline:two-part`、`code` 指向 demo。
- ✅ 只写授权目录与本报告；文档分段写入、无截断或占位；未执行改变 git 状态的命令，未做临时整仓检出或复制 assets。
- ⚠️ 浏览器、真机与作者审美尚未验收；后端模型名未回传。需作者确认项及默认沿用方案均见 §4，不把静态检查写成最终批准。
