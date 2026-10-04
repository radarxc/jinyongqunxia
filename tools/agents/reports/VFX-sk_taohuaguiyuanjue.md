# VFX-sk_taohuaguiyuanjue 报告 · 招式特效 · 天级 桃花归元诀（sk_taohuaguiyuanjue，5 招）

## 1. 摘要（3–6 行）

- 完成五招 Composition YAML/JSON、1536×1024 静态峰值与 Three.js 单文件演示。
- 内置 `image_gen` 生成家族、碧回归一、观潮归元三张白底四帧图；各 1 候选选 1，切出 12 张 RGBA。
- 五招均保持图鉴的 `yin / inner / projection:false`、支援自身；三普通招复用家族，两绝招独有原料。
- 仅引用共用 palm；源 PNG 与 EmitterPlate 经 `git show HEAD` 逐字节比对一致，未复制到本套。
- 八条素材统一 `candidate`；未改工具、设计文档、清单或共享图池，未执行改变仓库状态的 git 命令。

## 2. 产出（文件、行数、主要章节）

| 产出（相对 assets/default/vfx/sk_taohuaguiyuanjue/） | 数量 / 行数 | 内容 |
|---|---:|---|
| `effect/` | 21 文件；3 YAML 各 66 行 | 3 白底原件、12 RGBA、3 EffectSet、3 quality.json |
| `moves/` | 20 文件 | 每招 YAML 32 行、JSON 187 行、peak.png、demo.html |
| `manifest.yaml` | 420 行 / 8 条 | 3 原料、5 招式；其余 45 文件全部有大小 / SHA-256 记录 |
| `README.md` / `source_requests.json` | 95 / 38 行 | 造型边界、标定、长度算式、复现 / 实发提示词 |
| `validation.json` / `vfx-check.jsonl` | 157 / 10 行 | 几何、三底 / 峰值目检记录、共享哈希 / 五招检查 |
| 套件总计 | 46 文件 / 20,029,019 bytes | 本报告另计；三底临时预览已查看后删除 |

## 3. 关键结论与数值

- 青碧取阴性风格规则；花瓣、回环、归潮形态均为（原创扩展），没有声称原著显色依据。
- 共用掌面基尺 `W=320×0.6=192 px`；听潮 / 理息 / 护体 / 碧回 / 观潮分别 `1.25/1.5/1.75/2/2.25×W=240/288/336/384/432 px`【建议值】，不是玩法射程。
- 自身 `range_hex=0`，依 design/23 §4.2 显式给正局部长度；E=(600,560)、θ=0°，关闭方向推进遮罩、零漂移，不套外放展幅。
- 普通 pulse=`0.10+0.15+0.25+0.10=0.60 s`；绝招 wave=`0.15+0.20+0.40+0.15=0.90 s`，与 CT 无换算关系。
- 源图实际 1254×1254，切帧 627×627；12 帧最小源留白 34 px，边框残留 / 残余白边均 0，白底最大重建误差 1.014534/255。
- 所有帧和阶段极值变换后最小安全边距 114.6 px；保守留白下界 58.7849%，均通过设计建议值。
- 五 HTML 依报告招式表顺序为 2,128,458 / 2,265,684 / 1,845,084 / 1,824,090 / 1,804,136 bytes；全为原尺度无损 WebP 内嵌，低于 3,000,000 bytes。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 作者审美与局部尺度 | 沿用三套青碧造型和上述长度；八条保持 `candidate` |
| 帧间墨纹与根部稳定 | 按峰值连续根段标定共用锚点，保留生成纹理变化并 crossfade；实际动态过渡观感（待实测） |
| 浏览器 / 真机 / CDN | 本轮未跑 WebGL 或真机，CDN 依赖可用性（待核实）；默认保留指定 r186 importmap，交集成侧实测 |
| 原著与工具元数据 | 原著逐字书证（待考）；造型全按原创；工具未返回图像后端 / effort，记录 not-reported / not-exposed |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。现有图鉴与 design/23 可表达全部五招，仅新增表现层候选资产。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `assets/default/vfx/bindings.yaml` / `docs/tech/02-rendering.md` | 本功五招 / 实际挂点接入 | inner 的 `emitter:null` 与本套独立掌图示意有意区分；运行时映射到自身角色挂点，保留 `projection:false` |
| `tools/vfx/build_demo.py` | 标题、canvas aria-label | 非外放内功仍显示“外放样例 / 外放招式预览”，宜改为中性“招式”；本任务未改工具 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 用的效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_taohuaguiyuanjue_bihui` | 是 | 否 | `mv_taohuaguiyuanjue_bihui` | 384 px / 自身 | wave / 0.90 s |
| `mv_taohuaguiyuanjue_guanchao` | 是 | 否 | `mv_taohuaguiyuanjue_guanchao` | 432 px / 自身 | wave / 0.90 s |
| `mv_taohuaguiyuanjue_huti` | 否 | 否 | `family` | 336 px / 自身 | pulse / 0.60 s |
| `mv_taohuaguiyuanjue_lixi` | 否 | 否 | `family` | 288 px / 自身 | pulse / 0.60 s |
| `mv_taohuaguiyuanjue_tingchao` | 否 | 否 | `family` | 240 px / 自身 | pulse / 0.60 s |

| 原料清单（各目录 source_sheet.png） | 候选 → 选入 | 原著描写依据 |
|---|---:|---|
| `effect/family/` | 1 → 1 | 内功回环气场与花瓣形内息（原创扩展） |
| `effect/mv_taohuaguiyuanjue_bihui/` | 1 → 1 | 碧回归一招名的瓣状回卷意象（原创扩展） |
| `effect/mv_taohuaguiyuanjue_guanchao/` | 1 → 1 | 观潮归元招名的层叠回潮意象（原创扩展） |

- ✅ 原著边界：图鉴 §2.1 已标整门原创；黄药师以内力驱动碧海潮生曲仅引用图鉴，三联 / 广州修订版《射雕英雄传》相关情节措辞（待考），未编引文、回目或原著招名。
- ✅ 全仓搜过拟新增资产 ID 后才登记；三张源图逐字节保留，真实完整提示词与来源可追溯；普通招没有额外生图。
- ✅ 三张原件、九张三底预览经 `view_image` 自查；抽看碧回 / 观潮 / 护体三峰值，效果在 E 沿右向展开，掌面连接且无可见白边。
- ✅ 5/5 招齐全，均有 YAML / JSON / peak / demo；12 RGBA；8 条 manifest 均 `candidate`，逐文件哈希、大小齐全。
- ✅ 五招 `check_vfx.py` 退出 0；HTML ≤3 MB、唯一许可 three r186 importmap、全部内嵌图片与脚本语法通过；JSON 与 YAML / 两类原料元数据一致。
- ✅ `python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_taohuaguiyuanjue --catalog docs/design/catalog/skills-bulu-02-shediao.md`：0 问题，退出 0。
- ✅ `python3 tools/agents/check_assets.py assets/default/vfx/sk_taohuaguiyuanjue --min 1 --max 60 --min-side 256`：8 图 / 8 条 / 0 问题，退出 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：strict failure 0，退出 0；既有 `sk_babuganchan` 未定义引用由基线收录，新增 0。
- ✅ 只写授权套件与本报告；共享源 PNG / YAML 与 HEAD 一致；无 git 写命令、无临时整仓检出；分节 / 分块写入每次 ≤150 行，报告 ≤100 行。
- ⚠️ 需作者确认事项默认沿用 §4；浏览器 / 真机与原著逐字考据未做，技术检查不代替作者批准。
