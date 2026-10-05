# VFX-sk_zuoyouhubo 报告 · 招式特效 · 天级 左右互搏（sk_zuoyouhubo，2 招）

## 1. 摘要（3–6 行）

- 完成家族、分心二用、双手全力共 3 套模型原料；各 1 候选选 1，切出 12 张 RGBA。
- 两招均交付 Composition YAML/JSON、1536×1024 峰值与 Three.js HTML；5 条素材登记均为 `candidate`。
- 两招均为绝招入口、无独立外放；掌旁意象不改写图鉴“依所选两招”的攻击范围。
- 三项指定检查全部通过；仅引用共享 palm，源 PNG 与 YAML 均与 HEAD 逐字节一致。
- 原料、三底预览与两张峰值已目视复核；留白建议偏差与浏览器 / 真机未实测均保留说明。

## 2. 产出（文件、行数、主要章节）

以下路径除报告外均相对 `assets/default/vfx/sk_zuoyouhubo/`；资产共 43 文件。

| 产出 | 数量 / 行数 | 主要内容 |
|---|---|---|
| `effect/{family,mv_zuoyouhubo_fenxin,mv_zuoyouhubo_quanli}/` | 30 文件；EffectSet 各 72 行 | 3 张原图、12 RGBA、3 配置、9 三底预览、3 质量记录 |
| `moves/<mv_id>/` | 8 文件；每招 YAML 34 / JSON 187 行 | 两招各自配置、静态峰值和内嵌原料演示 |
| `manifest.yaml` | 194 行 / 5 条 | 3 原料 + 2 招；完整提示词、来源、状态、交付哈希 |
| `README.md` | 89 行 | 造型依据、测量与算式、复现、验收和依赖 |
| `source_requests.json` / `provenance.json` / `verification.yaml` | 5 / 26 / 21 行 | 实发提示词、原件路径 / 哈希、逐帧留白与合成边界 |
| 本报告 | ≤100 行 | 七节交接与验收结论 |

## 3. 关键结论与数值

- 性质 `neutral`，发出方式按任务 `inner`；两招图鉴均 `ultimate:true`，入口 `projection:false`。没有独立 `range.max / projectionSpreadSteps`，不虚构外放升档。
- 源图均 1536×1024，2×2 切为 768×512；`3×4=12` 帧。`white_key` 阈值 250、全保留差值 64，去白后保留 straight alpha。
- 共享掌源宽 320 px、缩放 0.45，显示根宽 `320×0.45=144 px`；局部长度【建议值】为 `2×144=288`、`2.5×144=360 px`。
- 两招都用 wave：`0.15+0.20+0.40+0.15=0.90 s`，峰值 `0.35/0.90≈0.388889`；不由 CT 换算。`range_hex:0` 仅表示局部入口预览。
- 几何按 `design/23` §4.1：分心 `sx=288/621≈0.463768, sy=144/196≈0.734694`；全力 `sx=360/589≈0.611205, sy=144/166≈0.867470`；共同根部 `[736,536]`、0° 向右。
- 12 帧边框 alpha 与残白比例均 0；白底重建最大误差 0.537201/255。全阶段安全边距至少 228.65 px，保守留白至少 75.61%。
- HTML 分别为 1,525,177 / 1,725,061 bytes，均 ≤3,000,000；无损 WebP 内嵌、纹理比例 1.0，唯一显式外链为指定 Three.js r186 importmap。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 造型 / 色彩审批 | 保留银灰方圆分流、双涌与局部长度，全部 `candidate`，不代替作者批准 |
| 原料建议偏差 | 近白背景有 RGB 253–255 微波动，按 250 阈值清除；分心第三帧留白 31 px，全力第二至四帧 30 / 15 / 26 px，低于 32 px 建议但未裁断，默认保留原件 |
| 根部原始漂移 | 分心最大纵差 8 px，已逐帧锚点校正；默认沿用，连续播放仍（待实测） |
| 单掌入口与双手运行时 | 独立演示依任务引用单张共享掌；实际两手与两个原招由运行时挂点 / 已解算事件接入，不从入口图复制伤害 |
| 浏览器与设备 | 本次只完成生成与静态门禁；CDN、连续播放、控制项、移动端颜色和性能均（待实测） |
| 原著措辞 | （待考）核对三联 / 广州修订版《射雕英雄传》周伯通教郭靖互搏、方圆练习的原文及回目；默认只引用现有图鉴转述 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本次只交付表现层素材，未改动玩法、伤害、目标范围或基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `assets/default/vfx/bindings.yaml` | 两条 `mv_zuoyouhubo_*` | 目前 `delivery:unknown / emitter:sword`；按本任务 `inner / palm` 核对并同步；不自动改变所选原招发出方 |
| `docs/tech/02-rendering.md` | 双招事件与挂点接入 | 入口局部意象与两个原招分开消费；双手分别取真实挂点、各自范围和发出方；不能由 288 / 360 px 推导命中 |
| `tools/vfx/build_demo.py` | 第 63 / 74 行标题、aria-label | 当前统一写“外放样例 / 外放招式预览”，本门入口非外放；后续改为中性“招式”或按事实显示 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 用的效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_zuoyouhubo_fenxin` | 是 | 否（入口） | `effect/mv_zuoyouhubo_fenxin` | 288 px | wave / 0.90 s |
| `mv_zuoyouhubo_quanli` | 是 | 否（入口） | `effect/mv_zuoyouhubo_quanli` | 360 px | wave / 0.90 s |

| 原料清单 | 候选 → 入选 | 原著描写依据 / 改编边界 |
|---|---:|---|
| `effect/family/source_sheet.png` | image_gen 1→1 | 两路同源气劲为同门视觉语汇（原创扩展）；家族套保留，无普通招需绑定 |
| `effect/mv_zuoyouhubo_fenxin/source_sheet.png` | image_gen 1→1 | 图鉴方圆练习意象转译；可见方圆银灰气劲为（原创扩展），逐字依据（待考） |
| `effect/mv_zuoyouhubo_quanli/source_sheet.png` | image_gen 1→1 | 图鉴已标招名原创；并行双涌造型与颜色均（原创扩展） |

- ✅ 三张原料由内置 `image_gen` 生成，逐字节落盘，未用程序绘制造型；完整实发提示词、源路径和候选数已登记。
- ✅ 全部原图、9 张黑 / 灰 / 白预览与 2 张峰值经 `view_image`；方向、掌面根部衔接与明显白边已检查；建议偏差如实见 §4。
- ✅ 每招 YAML / JSON / peak / demo 齐全，独用其绝招套；共享掌 PNG 哈希为 `f0e83e6586baae3f7ece37510fcec6b9c75d3401a217bffd703bb4bb0f07322c`，未复制或修改。
- ✅ `python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_zuoyouhubo --catalog docs/design/catalog/skills-wujue.md`：0 问题，退出 0。
- ✅ `python3 tools/agents/check_assets.py assets/default/vfx/sk_zuoyouhubo --min 1 --max 60 --min-side 256`：5 张 / 5 条 / 0 问题，退出 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：strict failure 0，退出 0；保留仓库已知未定义项 1 条及近似 ID 提示，无新增。
- ✅ 3 个 EffectSet、2 个 Composition 和 2 个 HTML 的 `check_vfx.py` 均通过；YAML、派生 JSON 与登记哈希一致。
- ✅ 只新增授权资产目录与本报告，未改工具、设计、任务表；未执行 git 状态变更命令，未复制整仓或 assets 到临时目录。
- ⚠️ 需作者确认事项按 §4 默认沿用；未逐字考据小说，未实跑浏览器 / 真机，不将静态检查冒充完整运行验收。
