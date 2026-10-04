# VFX-sk_tianshanliuyangxinfa 报告 · 招式特效 · 天级 天山六阳心法（sk_tianshanliuyangxinfa，5 招）

## 1. 摘要（3–6 行）

- 完成 3 套 `image_gen` 白底四帧原料、12 张 RGBA，三记普通招复用家族图，两绝招各有独有套。
- 完成五招 Composition YAML / JSON、1536×1024 峰值帧及 Three.js 单文件演示；全部 `candidate`。
- 图鉴确认五招均自身支援、`projection:false`；仅表现贴近掌面的局部气场，不增加离体攻击。
- 发出方仅相对引用共享 palm，原 PNG / YAML 与 HEAD 逐字节一致；未复制、未修改共用池。
- 三项强制检查及五招增量 VFX 检查通过；近白底色与原件根部漂移如实保留，浏览器 / 真机待实测。

## 2. 产出（文件、行数、主要章节）

路径均相对 `assets/default/vfx/sk_tianshanliuyangxinfa/`；套件共 53 文件，本报告另计。

| 文件 / 目录 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| `effect/` | 3 套 / 30 文件 | 3 白底原件、12 RGBA、3 EffectSet（各 72 行）、3 质量 JSON、9 三底预览 |
| `moves/` | 5 套 / 20 文件 | 每招 YAML 51 行、工具导出 JSON 187 行、PNG、HTML 497 行 |
| `README.md` / `source_requests.yaml` | 103 / 33 行 | 依据、测量、参数核算、复现与待决；三份完整实发提示词 |
| `manifest.yaml` | 482 行 / 8 条 | 三条原料、五条招式；源路径、完整提示词、尺寸、哈希及派生文件完整性 |

## 3. 关键结论与数值

- 唯一玩法源为 `skills-bulu-01-tianlong.md` §3.1、§4：grade 11、yang、inner、五招自身、两绝招、零外放；没有 `range.max` / `projectionSpreadSteps` 可映射。
- 源图每张 1536×1024，`2×2` 格，单帧 768×512；phase=`[0,.25,.5,1]`。每张 1 候选选 1；内置工具未公开底层生图模型与 effort，未臆填。
- `range_hex=0`；局部长【建议值】=`128×[1.875,2.25,2.625,3]=[240,288,336,384] px`；这些系数仅为版面系数，不表示游戏格数。
- E=`[680,560]`、方向 0°；掌宽=`320×0.55=176 px`。归元 `sx=384/478≈0.8033`、`sy=176/161≈1.0932`；逐帧锚点对齐根部，漂移参数为 0。
- pulse=`0.10+0.15+0.25+0.10=0.60 s`，wave=`0.15+0.20+0.40+0.15=0.90 s`；峰值 phase .5，不改 recovery / CT。
- 12/12 帧边框 alpha 残留与残白比例为 0；白底重建最大误差约 `1.015/255<2/255`。HTML 为 1,910,262–2,179,336 bytes，纹理原尺寸无损内嵌，均 <3,000,000。

## 4. 开放问题（附默认值）

| 事项 | 默认值 |
|---|---|
| 三套造型与朱赤主色 | 沿用候选；六阳回环、交织气带、向心旋纹均（原创扩展），等待作者审美验收 |
| 原件纯白与根部稳定性 | 保留原件；family / hemai 边带 253–255，归元极少 248–249 淡尾经既定去白处理；family 约 9 px 中心漂移已逐帧对齐，默认不追加候选 |
| 局部长度 / palm 示意 | 沿用 240 / 288 / 336 / 384 px 及共享掌；运行时仍自身支援，人物气场挂点另接 |
| 原著考据 | 默认保持原创标注；三联 / 广州修订版《天龙八部》童姥传六阳掌、灵鹫石壁情节逐字依据（待考），无编造引文 / 回目 |
| 浏览器 / 真机 | 静态门禁通过；连续帧、CDN 可达性、WebGL、手机性能与人物挂点（待实测） |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。沿用已有武学与五招 ID，未改变图鉴、战斗公式或 Canon。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `assets/default/vfx/bindings.yaml` | 本功五招 `emitter:null` | 区分 inner 运行时自身气场与本任务独立 palm 演示；默认不把演示掌图回填为 gameplay 出口 |
| `tools/vfx/build_demo.py` | 第 63 / 74 行 | 非外放招仍标“外放样例 / 外放招式预览”，建议统一为“招式演示 / 招式预览”；本任务未改工具或派生文案 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_tianshanliuyangxinfa_guiyuan` | 是 | 否 | `effect/mv_tianshanliuyangxinfa_guiyuan/` | 384 px | wave / 0.90 s |
| `mv_tianshanliuyangxinfa_hemai` | 是 | 否 | `effect/mv_tianshanliuyangxinfa_hemai/` | 384 px | wave / 0.90 s |
| `mv_tianshanliuyangxinfa_huanxi` | 否 | 否 | `effect/family/` | 288 px | pulse / 0.60 s |
| `mv_tianshanliuyangxinfa_huti` | 否 | 否 | `effect/family/` | 336 px | pulse / 0.60 s |
| `mv_tianshanliuyangxinfa_tuna` | 否 | 否 | `effect/family/` | 240 px | pulse / 0.60 s |

| 原料（各目录 `source_sheet.png`） | 候选 → 入选 | 造型依据 |
|---|---:|---|
| `effect/family/` | 1→1 | 朱赤呼吸回环；性质色与护息意象（原创扩展） |
| `effect/mv_tianshanliuyangxinfa_hemai/` | 1→1 | 六股交织气带；合脉稳身意象（原创扩展） |
| `effect/mv_tianshanliuyangxinfa_guiyuan/` | 1→1 | 六缕向心旋纹；回元意象（原创扩展） |

- ✅ 原料由内置 `image_gen` 实际生成，三张均 `view_image` 自查，逐字节入库；`cut_frames.py` 切出 12 张透明帧，普通招未单独生图。
- ✅ 全部黑底预览已查看，另抽查归元灰底 / 家族白底；吐纳与归元两张峰值经 `view_image` 检查，根部衔接掌面、向右形成局部气场、未见白边。
- ✅ 五招均交付四件套；绝招独有 / 普通共用、仅引用共享 palm；8 条 manifest 全为 `candidate`、`pipeline: two-part`，五招 `code` 指向各自 demo。
- ✅ `python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_tianshanliuyangxinfa --catalog docs/design/catalog/skills-bulu-01-tianlong.md`：退出 0，0 问题。
- ✅ `python3 tools/agents/check_assets.py assets/default/vfx/sk_tianshanliuyangxinfa --min 1 --max 60 --min-side 256`：退出 0，8 图 / 8 条 / 0 问题。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出 0，新增严格失败 0；仅报告已登记基线未定义项 1，不是本任务新增。
- ✅ 五招 `check_vfx.py` 的 schema、质量、全帧几何与 HTML 检查全部通过；每份唯一显式外链为指定 three r186 importmap。
- ✅ 原著边界：只引用图鉴已有传承关联，独立心法、招式、颜色与轮廓均原创；逐字考据待办见 §4。
- ⚠️ 原件不是逐像素纯白、family 原始中心漂移超过 2 px 建议；已去底 / 锚点补偿，未声称原件精确达标。浏览器与真机未实跑。
- 需作者确认（默认沿用）：三套赤色候选、四档局部长度、现有四帧过渡；不改变五招自身支援和 `projection:false`。
- ✅ 仅写授权套件与本报告；未改工具、设计文档或任务表，未执行改变仓库状态的 git 命令；分节写入，报告 ≤100 行。
