# VFX-sk_huashanziqijue 报告 · 招式特效 · 天级 华山紫气诀（sk_huashanziqijue，5 招）

## 1. 摘要（3–6 行）

- 完成图鉴 5 招的 Composition YAML/JSON、1536×1024 峰值帧与单文件 Three.js 演示。
- 完成家族与两记绝招共 3 套白底四帧原料，切出 12 张 straight-alpha RGBA；全部为 `candidate`。
- 五招均保持自身作用与 `projection:false`，共享 palm 只作视觉定位，不虚构离体攻击。
- 三项指定检查和五招增量 VFX 检查全部通过；共享发出方未复制、未修改。
- `image_gen` 在产图前被 app-server 权限 / workspace routing 网络错误阻断，原料按仓库先例降级为可复现 Pillow 配方。

## 2. 产出（文件、行数、主要章节）

| 产出 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| `effect/` | 3 套 / 30 文件 | 3 张 1536×1024 白底母版、12 RGBA、EffectSet、三底预览与质量数据 |
| `moves/` | 5 目录 / 20 文件 | 每招 `composition.yaml/json`、`peak.png`、`demo.html` |
| README / 请求 / 3 个脚本 | 45 / 28 / 346 行 | 原著边界、生成记录、可复现原料、Composition 与 manifest 构建 |
| `manifest.yaml` | 9 行 / 8 条 | 3 条原料 + 5 招；主文件及全部派生交付登记哈希 |
| 资产目录合计 | 56 文件 | 仅相对引用共享 palm；本报告另计 |

## 3. 关键结论与数值

- 图鉴核实 `nature:yang`、`delivery:inner`；五招均为自身目标、`projection:false`，无 `range.max` 或 `projectionSpreadSteps`。
- 三套原料均为 2×2 四帧白底图，单格 768×512，phase=`[0,.25,.5,1]`；各 1 候选选 1。
- 功名语义取紫罗兰，阳性以赤金作暖边；原著未确认可见颜色与轮廓，全部视觉均为（原创扩展）。
- 自身局部标尺【建议值】180 px/hex：`270=1.5×180`、`315=1.75×180`、`360=2×180`、`450=2.5×180` px；`range_hex=0`。
- 普通 pulse=`0.10+0.15+0.25+0.10=0.60 s`；绝招 wave=`0.15+0.20+0.40+0.15=0.90 s`。
- 12/12 帧边框 alpha 与残白比例均为 0，白底重建最大误差 0.6622/255；全帧几何最小安全边距 171.12 px。
- 5 个 HTML 为 867,576–1,009,246 bytes，均小于 3 MB；唯一外链为 Three.js `0.186.1` importmap。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 作者审美审批 | 三套紫 / 赤金造型与五招均维持 `candidate`，不把静态自检视为批准 |
| `image_gen` 失败 | 暂沿用 Pillow candidate；后续若强制模型生成，只换原料并重新量锚点、参考长、根宽 |
| 自身气场局部长度 | 沿用 270 / 315 / 360 / 450 px，不写回玩法射程 |
| 浏览器 / 真机 | 静态门禁通过；CDN、连续播放、移动端 screen 混合与人物掌面挂点仍（待实测） |
| 原著考据 | （待考）按三联 / 广州修订版核对华山气宗与紫霞神功相关文字边界；不为原创功名和招名补写书证 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。现有图鉴和 `design/23` 足以完成表现层资产；本次未新增或修改玩法事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `assets/default/vfx/bindings.yaml` | 本功五招 | 当前自动绑定为 `emitter:null`；明确内功 bespoke 独立演示是否登记任务强制使用的共享 palm |
| `docs/tech/02-rendering.md` | 招式挂点接入 | 运行时改挂真实角色掌面 / 躯干；局部气场长度不得驱动目标格或投射物 |
| `tools/vfx/build_demo.py` | 演示标题 / aria-label | 非外放内功仍显示“外放样例 / 外放招式预览”，后续宜改为中性“招式” |
| VFX 生产环境 | Codex 图像入口 | 修复 in-process app-server 权限与 workspace routing，后续同类任务才能严格使用模型原料 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 用的效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_huashanziqijue_tuna` | 否 | 否 | `family` | `1.5×180=270 px` | pulse / 0.60 s |
| `mv_huashanziqijue_yunqi` | 否 | 否 | `family` | `1.75×180=315 px` | pulse / 0.60 s |
| `mv_huashanziqijue_huti` | 否 | 否 | `family` | `2×180=360 px` | pulse / 0.60 s |
| `mv_huashanziqijue_yingfeng` | 是 | 否 | `mv_huashanziqijue_yingfeng` | `2.5×180=450 px` | wave / 0.90 s |
| `mv_huashanziqijue_guiyuan` | 是 | 否 | `mv_huashanziqijue_guiyuan` | `2.5×180=450 px` | wave / 0.90 s |

| 原料清单 | 候选 → 入选 | 造型依据 |
|---|---:|---|
| `effect/family` | Pillow 1→1；image_gen 0 | 紫色气息带、克制峰脊弧与赤金内芯（原创扩展） |
| `effect/mv_huashanziqijue_yingfeng` | Pillow 1→1；image_gen 0 | 招名意象的三层守峰气障与中央脊线（原创扩展） |
| `effect/mv_huashanziqijue_guiyuan` | Pillow 1→1；image_gen 0 | 招名意象的外展回卷紫气与开放归元旋环（原创扩展） |

- ✅ 原著依据：仅沿用图鉴所述“原著有华山气宗与紫霞神功”；独立功名、五招、机制、颜色和轮廓均明确为（原创扩展），未编引文、回目或人物事实。
- ✅ 三张源图和三张黑底预览均经 `view_image`；抽查吐纳、迎峰、归元峰值，效果从共享掌面向右发出、根部衔接且无白边。
- ✅ 每招有 YAML/JSON/peak/demo；普通招仅复用 family，两绝招各用独有套；5 个 HTML 唯一外链均为指定 Three.js r186。
- ✅ `check_skill_suite.py`：0 问题；`check_assets.py`：8 图片 / 8 条 / 0 问题；`check_ids.py --strict`：strict failure 0。
- ✅ 五招 `check_vfx.py` 全通过；共享 palm 两文件 SHA-256 与工作树基线一致，未复制或修改。
- ✅ 只写授权资产目录与本报告，未改工具、设计文档或任务清单，未执行改变仓库状态的 git 命令。
- ⚠️ `image_gen` 未产出候选，浏览器 / 真机未实跑；已如实登记，不把降级或静态检查冒充完整美术审批。
