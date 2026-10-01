# VFX-sk_duanshiyangjue 报告 · 招式特效 · 天级 段氏一阳诀（sk_duanshiyangjue，5 招）

## 1. 摘要（3–6 行）

- 完成图鉴五招的 Composition YAML/JSON、1536×1024 峰值帧与单文件 Three.js 演示。
- 完成家族及两记绝招共 3 套白底四帧原料，切出 12 张 straight RGBA；全部为 candidate。
- 五招均按图鉴保持自身目标与 `projection:false`，只表现局部运劲，不虚构离体攻击。
- 发出方仅逐字节引用共享 palm；三项指定检查和五招增量 VFX 检查全部通过。
- `image_gen` 在生成前被 app-server 权限拒绝，原料按仓库先例降级为可复现 Pillow 配方。

## 2. 产出（文件、行数、主要章节）

| 产出 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| `effect/` | 3 套 / 30 文件 | 3 张 1536×1024 白底母版、12 RGBA、EffectSet、三底预览与质量数据 |
| `moves/` | 5 目录 / 20 文件 | 每招 composition.yaml/json、peak.png、demo.html |
| README / 请求 / 3 个脚本 | 38 / 28 / 312 行 | 边界与复现、原料意图、确定性源图、Composition 与 manifest 构建 |
| `manifest.yaml` | 9 行 / 8 条 | 3 条原料 + 5 招；主文件及全部派生交付登记哈希 |
| 资产目录合计 | 56 文件 | 仅引用共享 palm；本报告另计 |

## 3. 关键结论与数值

- 图鉴核实 `nature:harmony`、`delivery:inner`；五招均自身目标、`projection:false`，无 `range.max` 或 `projectionSpreadSteps`。
- 三套均为 2×2 四帧白底图，单格 768×512，phase=`[0,.25,.5,1]`；各 1 候选选 1。
- 调和按 `STYLE.md` 取淡金；原著未确认可见颜色与轮廓，全部视觉均为（原创扩展）。
- 自身局部标尺【建议值】180 px/hex：`270=1.5×180`、`360=2×180`、`450=2.5×180`、`540=3×180` px；`range_hex=0`。
- 普通 pulse=`0.10+0.15+0.25+0.10=0.60 s`；绝招 wave=`0.15+0.20+0.40+0.15=0.90 s`。
- 12/12 帧边框 alpha 与残白比例均为 0，白底重建最大误差 0.586/255；HTML 660,840–728,990 bytes，均 <3 MB。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 作者审美审批 | 淡金调和气息、归元气轮、周天双路均维持 `candidate` |
| `image_gen` 权限失败 | 暂沿用 Pillow candidate；后续若强制模型生成，只换原料并重新量锚点 / 参考长 / 根宽 |
| 自身气场局部长度 | 沿用 270 / 360 / 450 / 540 px，不写回玩法射程 |
| 浏览器 / 真机 | 静态门禁通过；CDN、连续帧、移动端 screen 混合与人物掌面挂点仍（待实测） |
| 原著考据 | 段延庆具体行功层次按三联 / 广州修订版《天龙八部》核对（待考） |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本套遵循图鉴既有自身范围与 `projection:false`，未改变玩法或 Canon。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `assets/default/vfx/bindings.yaml` | 本功五招 | 当前自动绑定为 `emitter:null`；协调者应明确内功 bespoke 独立演示是否登记任务强制使用的共享 palm，本套按任务引用 palm |
| VFX 生产环境 | `image_gen` 能力 | 修复 Codex in-process app-server `Operation not permitted`，后续同类任务才能严格使用模型原料 |
| `tools/vfx/build_demo.py` | 演示标题 / aria-label | 非外放招仍显示“外放样例 / 外放招式预览”，建议改为中性“招式”；本任务未改工具 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_duanshiyangjue_guanyuan` | 否 | 否 | family | `2×180=360 px` | pulse / 0.60 s |
| `mv_duanshiyangjue_humai` | 否 | 否 | family | `2×180=360 px` | pulse / 0.60 s |
| `mv_duanshiyangjue_yangqi` | 否 | 否 | family | `1.5×180=270 px` | pulse / 0.60 s |
| `mv_duanshiyangjue_yiyang` | 是 | 否 | yiyang | `2.5×180=450 px` | wave / 0.90 s |
| `mv_duanshiyangjue_zhouliu` | 是 | 否 | zhouliu | `3×180=540 px` | wave / 0.90 s |

| 原料 | 候选 → 入选 | 原创造型 |
|---|---:|---|
| family | 1→1 | 三缕调和气息与双层护脉弧 |
| yiyang | 1→1 | 三层归元气轮向一束收拢 |
| zhouliu | 1→1 | 上下双路长弧与近根周天环 |

- 需作者确认（默认沿用）：① 三套淡金造型保持 `candidate`；② 自身局部长度继续用 270 / 360 / 450 / 540 px；③ 后续若恢复 `image_gen`，只替换原料，不改变五招 `projection:false` 与 Composition 语义。
- ✅ 原著依据：只沿用大理段氏与一阳指传承；独立功名、五招、颜色和可见轮廓均标（原创扩展）；段延庆行功层次（待考），未编引文、回目或人物事实。
- ✅ 三张源图和三张黑底预览均经 `view_image`；抽查养气 / 周流峰值，效果由共享掌面发出点向右，宽根覆盖掌面且无白边。
- ✅ 每招有 YAML/JSON/peak/demo；普通招仅复用 family，两绝招各用独有套；5 个 HTML 唯一外链均为指定 Three.js r186。
- ✅ `check_skill_suite`：0 问题；`check_assets`：8 图 / 8 条 / 0 问题；`check_ids --strict`：新增严格失败 0。
- ✅ 五招 `check_vfx` 全通过；共享 palm 两文件 SHA-256 与 HEAD 一致；只写授权套件与本报告，未改工具 / 图鉴 / TODO。
- ⚠️ `image_gen` 未产出候选、浏览器 / 真机未实跑；已如实登记，不把静态检查当作者美术批准。
