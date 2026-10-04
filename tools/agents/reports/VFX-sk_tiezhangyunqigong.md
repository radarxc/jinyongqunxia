# VFX-sk_tiezhangyunqigong 报告 · 招式特效 · 天级 铁掌运气功（sk_tiezhangyunqigong，5 招）

## 1. 摘要（3–6 行）

- 完成 5 招 Composition YAML / JSON、1536×1024 峰值图及 Three.js 单文件演示，8 条素材均为 `candidate`。
- 内置 `image_gen` 共生成 4 候选、选入 3 张白底四帧图，`cut_frames.py` 切出 12 张 RGBA；完整提示词与来源已落库。
- 普通招共用家族，两绝招独有；五招保持图鉴 `yang / inner / projection:false` 与自身运功、护体语义。
- 仅引用共用 palm，PNG / YAML 与 HEAD 逐字节一致；没有复制共享图、改工具或设计文档、执行 git 写命令。
- 三项指定验收全部退出 0；浏览器 / 真机与原著逐字考据未完成，保留默认与待确认项。

## 2. 产出（文件、行数、主要章节）

| 产出（相对 `assets/default/vfx/sk_tiezhangyunqigong/`） | 数量 / 行数 | 内容 |
|---|---|---|
| `effect/` | 21 文件；3 YAML 各 72 行 | 3 原件、12 RGBA、3 EffectSet、3 quality.json |
| `moves/` | 20 文件；YAML 各 33 行、JSON 各 188 行 | 五招各 composition.yaml / composition.json / peak.png / demo.html |
| `manifest.yaml` | 463 行 / 8 条 | 3 原料、5 招式，全部附属文件大小 / SHA-256 |
| `README.md` / `source_requests.json` | 109 / 65 行 | 造型边界、标定、长度核算、复现；四次真实请求及候选链 |
| `validation.json` / `build-log.jsonl` / `vfx-check.jsonl` | 118 / 5 / 10 行 | 原件与共享哈希、几何、质量、目检、打包及五招校验 |
| 套件总计 | 47 文件 / 18,824,372 bytes | 三底临时检查图已查看后删除；报告另计 |

## 3. 关键结论与数值

- 图鉴 §1.1 明示武学名、五招及机制（原创扩展）；赤色取 `yang` 风格倾向，铁灰、回气、双带、峰形全部原创，无原著显色断言。
- 掌面展示尺 `W=320×0.6=192 px`；吐纳 / 运掌 / 凝息 / 连臂 / 守峰取 `1.25/1.5/1.75/2/2.25×W=240/288/336/384/432 px`【建议值】。
- 五招无数值 range、无 `projectionSpreadSteps`；依据“自身”语义设 `range_hex=0`，按 design/23 §4.2 给正局部长度，不新增玩法射程。
- E=`[600,560]`、方向右、零漂移、关闭方向推进遮罩；峰值根宽统一 192 px，逐帧锚点补偿生成源中心变化。
- 普通 pulse=`0.10+0.15+0.25+0.10=0.60 s`；绝招 wave=`0.15+0.20+0.40+0.15=0.90 s`；不由 CT 换算。
- 原件 1254²，切帧 627²；white_key / 250 / 64，边框残留与残余白边指标均 0，最大白底重建误差 `0.537201/255<2/255`。
- 原料最小边距 family / 连臂 / 守峰为 29 / 41 / 92 px；全部帧 / 阶段的整图最小安全边距 114.6 px，保守留白下界 58.6895%。
- 五 HTML 按 §7 招式表顺序为 2,026,279 / 2,026,264 / 1,623,095 / 1,992,598 / 2,009,582 bytes，全部原尺寸无损 WebP 内嵌，≤3 MB。

## 4. 开放问题（附默认值）

| 事项 | 默认值 |
|---|---|
| 作者审美、气场尺度 | 沿用三套赤色护息造型、上述局部长度及共用 palm；保持 candidate |
| 留白与深底观感 | family 薄雾距格边 29 px，略低于 32 px 建议；不裁雾。深底浅赤部分较亮，保留原件，交作者确认 |
| 动态稳定性 | 原图根中心有变化；逐帧标定后同落 E，保留纹理变化与 crossfade；真实播放（待实测） |
| 浏览器、CDN、设备 | 未跑 WebGL 或真机，CDN 模块链（待核实）；默认沿用指定 r186 importmap，交集成侧实测 |
| 原著与工具元数据 | 原著逐字书证（待考），造型按原创；工具未返回模型后端 / effort，记 not-reported / not-exposed |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。图鉴与 design/23 已能表达五招，只增加候选表现资产。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `tools/vfx/build_demo.py` | 标题与 canvas aria-label | 沿用工具会显示“外放样例 / 外放招式预览”，对这五招不准确；建议维护方改为中性“招式”，本次未改工具 |
| `assets/default/vfx/bindings.yaml` / `docs/tech/02-rendering.md` | 本功五招的游戏接入 | 按 moveRef 消费本套；独立 palm 演示与 inner 的 emitter:null 区分，实际使用自身人物挂点，保留 projection:false |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 用的效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_tiezhangyunqigong_lianbi` | 是 | 否 | `mv_tiezhangyunqigong_lianbi` | 384 px / 自身 | wave / 0.90 s |
| `mv_tiezhangyunqigong_ningxi` | 否 | 否 | `family` | 336 px / 自身 | pulse / 0.60 s |
| `mv_tiezhangyunqigong_shoufeng` | 是 | 否 | `mv_tiezhangyunqigong_shoufeng` | 432 px / 自身 | wave / 0.90 s |
| `mv_tiezhangyunqigong_tuna` | 否 | 否 | `family` | 240 px / 自身 | pulse / 0.60 s |
| `mv_tiezhangyunqigong_yunzhang` | 否 | 否 | `family` | 288 px / 自身 | pulse / 0.60 s |

| 原料清单（各目录 `source_sheet.png`） | 候选 → 选入 | 原著描写依据 |
|---|---:|---|
| `effect/family/` | 1 → 1 | 圆转回气与铁灰墨纹（原创扩展），没有宣称原著显色 |
| `effect/mv_tiezhangyunqigong_lianbi/` | 1 → 1 | 连臂归气招名的双带回环意象（原创扩展） |
| `effect/mv_tiezhangyunqigong_shoufeng/` | 2 → 第 2 张 | 守峰定息招名的三叠护息意象（原创扩展）；首稿因左侧边距窄淘汰 |

- ✅ 原著边界：依据图鉴 §1.1；《射雕英雄传》裘千仞铁掌措辞、《神雕侠侣》绝情谷裘千尺承传细节按三联 / 广州修订版（待考），未编引文、回目、人物或原著招名。
- ✅ 新资产 ID 创建前已全仓搜索；复用既有 sk / mv。3 入选原件逐字节保存，完整生成 / 编辑提示词、参考首稿哈希与来源可追溯。
- ✅ 每张 4 帧；家族与绝招各一套、普通招无额外出图；切帧用原有 cut_frames.py，源 PNG 与共享发出方保持原字节。
- ✅ 4 候选均目检，9 张最终三底联系图经 view_image；抽看连臂、守峰、凝息 3 张最终峰值，根在掌面沿右向连接，无硬白边或白底矩形。
- ✅ 5 招四件套齐全，manifest 为 8 条 candidate，招式 code 指向 demo、pipeline:two-part；各 JSON 与 YAML / 两类原料元数据一致。
- ✅ 五招 check_vfx.py 均退出 0；全部帧几何、HTML ≤3 MB、唯一许可 r186 importmap、内嵌图片与脚本语法检查通过。
- ✅ `python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_tiezhangyunqigong --catalog docs/design/catalog/skills-bulu-02-shediao.md`：0 问题，退出 0。
- ✅ `python3 tools/agents/check_assets.py assets/default/vfx/sk_tiezhangyunqigong --min 1 --max 60 --min-side 256`：8 图 / 8 条 / 0 问题，退出 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：strict failure 0，退出 0；既有 sk_babuganchan 基线豁免未变，新增 0。
- ✅ 仅写授权套件与本报告，无 git 写命令、无临时整仓检出或整份 assets 复制；人工补丁 / 分块写入均 ≤150 行，报告 ≤100 行。
- ⚠️ 需作者确认项默认沿用 §4；29 px 原料边距例外、深底浅赤观感与动态 / 真机 / 考据限制已保留，检查通过不等于作者批准。
