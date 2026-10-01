# VFX-sk_bixie 报告 · 招式特效 · 天级 辟邪剑法（sk_bixie，4 招）

## 1. 摘要（3–6 行）

- 完成 4 招：2 个普通招复用家族图，2 个绝招各有专属效果套；全部 `candidate`。
- 内置 `image_gen` 共生成 3 张候选并全部入选，`cut_frames.py` 导出 12 张 768×512 straight-alpha RGBA 帧。
- 每招已交付 Composition YAML/JSON、1536×1024 峰值帧和单文件 Three.js r186 演示。
- 四招图鉴均未标 `projection:true`；按近身 / 局部范围制作，没有把突进、直线或半径误作远程外放。

## 2. 产出（文件、行数、主要章节）

| 产出 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| `assets/default/vfx/sk_bixie/effect/` | 3 套 / 30 文件 | 家族、飞燕穿柳、群邪辟易原图，12 RGBA 帧，EffectSet、三底预览与质量数据 |
| `assets/default/vfx/sk_bixie/moves/` | 4 目录 / 16 文件 | 每招 Composition YAML/JSON、`peak.png`、`demo.html` |
| `manifest.yaml` / `source_requests.json` | 271 / 47 行 | 7 个主条目、完整提示词、生成来源、候选数、SHA-256 与派生附件完整性 |
| 本报告 | ≤100 行 | 数值、开放问题、同步项与验收记录 |

## 3. 关键结论与数值

- 风格：图鉴给定 `nature: yin`，依 `STYLE.md` 采用深蓝绿、冷青、少量炭墨的虚实水墨；具体剑痕均（原创扩展）。
- 3 套均为 1536×1024 白底 2×2 原图，每格 768×512、4 帧 phase=`[0,.25,.5,1]`；`white_cutoff_8bit=250`。
- 近身三招 `L=1×256=256 px`；群邪辟易以局部半径 2 得 `L=2×256=512 px`，但 `range_hex=0`，不声明外放射程。
- 普通 `pulse=0.10+0.15+0.25+0.10=0.60 s`；绝招 `wave=0.15+0.20+0.40+0.15=0.90 s`。
- 12 帧的 8 px 边框 alpha 比与残余白边比均为 0；最大白底重建误差 `0.6622/255`。
- 4 份 HTML 为 923,273–1,322,999 bytes，均 ≤3,000,000；唯一外链为 Three.js `0.186.1` importmap。

## 4. 开放问题（附默认值）

| 事项 | 默认值 / 当前处理 |
|---|---|
| 作者审美审批 | 三套原料及四招均保持 `candidate`；默认沿用当前阴青、纤细、诡速方案，不视本轮自检为批准 |
| 原著招名与动作书证 | 基线图鉴已采用四个招名；三联 / 广州修订版逐字依据仍（待考），默认只把招名当图鉴事实，不编引文与回目 |
| 局部范围可视化 | 群邪辟易默认以单个右向 512 px 扇面代表半径 2 的局部片段；六叉不等于六次命中 |
| 浏览器 / 真机 | HTML 静态门禁已过；CDN、连续播放、移动端混合性能及角色骨骼挂点仍（待实测） |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。现有图鉴与 `design/23` 足以完成表现层资产；本次未新增或修改玩法事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/tech/02-rendering.md` / 运行时接入说明 | 动作事件与武器挂点 | 四招接入共享 sword EmitterPlate；突进、穿越目标、3段、乱击6由 Core 事件驱动，禁止从 VFX 帧 / 分叉数推导判定 |
| `docs/design/catalog/skills-wuyue.md` | §8.2 原著考据 | 后续逐字核对四个招名、七十二路与人物传承依据；未核实前维持（待考） |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 用的效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_bixie_liuxingganyue` | 否 | 否 | `family` | 256 px | pulse / 0.60 s |
| `mv_bixie_huakaijianfo` | 否 | 否 | `family` | 256 px | pulse / 0.60 s |
| `mv_bixie_feiyanchuanliu` | 是 | 否 | `mv_bixie_feiyanchuanliu` | 256 px | wave / 0.90 s |
| `mv_bixie_qunxie` | 是 | 否 | `mv_bixie_qunxie` | 512 px | wave / 0.90 s |

| 原料清单（各含 `source_sheet.png` + 4 RGBA 帧） | 候选数 → 入选 | 造型依据 |
|---|---:|---|
| `effect/family` | 1 → 1 | 图鉴“七十二路快剑以诡速取胜”；纤细主剑痕与双层残迹（原创扩展） |
| `effect/mv_bixie_feiyanchuanliu` | 1 → 1 | 招名来自图鉴；贯线、交错 S 形残迹与燕尾根（原创扩展），原著动作（待考） |
| `effect/mv_bixie_qunxie` | 1 → 1 | 招名、乱击6·半径2来自图鉴；同根六叉不对称扇面（原创扩展），原著动作（待考） |

- ✅ 三张原料均由内置 `image_gen` 各生成一次，原件逐字节保存并记录源路径 / SHA-256；三张源图、三底预览均已 `view_image`。
- ✅ 抽查流星赶月与群邪辟易峰值：从共享剑尖沿右向发出，根部衔接，无可见白边；四招全帧几何均未越界，最小安全边距 63.71 px。
- ✅ 发出方仅相对引用共享 `emitters/sword/`；共享 PNG SHA-256=`85245a416ce4d344542475cc9c943ce67f404f8485564ee5f798a169ad0f96e2`，未复制或修改。
- ✅ `check_skill_suite.py`：0 问题；`check_assets.py`：7 图片 / 7 条目 / 0 问题；`check_ids.py --strict`：strict failure 0，三项均退出 0。
- ✅ 4 招均已由 `compose.py` / `build_demo.py` 导出；manifest 全为 `candidate`，招式条目全为 `pipeline: two-part`。
- ✅ 仅写授权资产目录与本报告，未改 `tools/vfx/`、设计文档、`TODO.md` 或共享发出方；未执行改变仓库状态的 git 命令。
- ⚠️ 需作者确认审美、书证、半径2表现与浏览器/真机结果；默认均沿用 §4，未冒充已审批或已实测。
