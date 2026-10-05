# VFX-sk_tiangang 报告 · 招式特效 · 天级 天罡北斗阵（sk_tiangang，5 招）

## 1. 摘要（3–6 行）

- 完成 3 套白底原料、12 张透明帧，以及 5 招 Composition YAML / JSON、峰值 PNG 与 Three.js 演示。
- 家族套由 3 记普通招共用，2 记绝招各有独立套；每套 2 候选选第 2 张，全部登记 candidate。
- 五招均未标外放；按任务只引用共享 palm，原图 / YAML 逐字节不变，不改变阵法、范围和追击规则。
- 三项指定检查全部退出 0；静态视觉与几何检查通过，真实浏览器、CDN、真机及作者审美验收仍未完成。

## 2. 产出（文件、行数、主要章节）

资产目录 `assets/default/vfx/sk_tiangang/` 共 64 文件；本报告另计，≤100 行。

| 文件 | 数量 / 行数 | 内容 |
|---|---:|---|
| `effect/{family,mv_tiangang_guiyi,mv_tiangang_hewei}/` | 36 文件；YAML 各 72 行；提示词各 4+1 行 | 3 原图、12 RGBA、9 三底预览、配置 / 质量数据与生成 / 编辑提示词 |
| `moves/<mv_id>/` | 20 文件；YAML 各 51 行、JSON 各 188 行 | 5 招独立参数、peak、demo |
| `manifest.yaml` | 537 行 / 8 条 | 3 原料 + 5 招；完整提示词、候选链、来源、尺寸、哈希与附件 |
| `README.md` / `generation.json` | 114 / 92 行 | 造型边界、锚点量法、长度 / 节奏算式、复现与待决；6 次实际工具请求溯源 |
| `verification.json` / `build-results.jsonl` / `checks/` | 13 / 5 行；3 日志 | 质量、全帧几何、HTML 静态门禁、原件 / 共享池哈希及三项命令结果 |

## 3. 关键结论与数值

- 图鉴卡第 248–284 行：yang；归一 / 合围为绝招；五招均无 projection。功能招友方 r3 与自身架势不改为伤敌束，不添加 projectionSpreadSteps。
- `3×(1536×1024 四帧表) → 3×4=12` 张 `768×512` RGBA。初次白色星心抠空已由 image_gen 第 2 候选改赤色墨结，未代码补画。
- 演示标尺【建议值】320 px/hex：归一 `2×320=640 px`，合围 `1×320=320 px`；布阵 / 回旋 / 镇守局部长度 `1/1.125/0.875×320=320/360/280 px`，range_hex=0，不等价于玩法射程。
- E=`[650,540]`、θ=0°、掌缩放 0.6、掌面宽 `320×0.6=192 px`；参考长家族 / 归一 / 合围=544 / 530 / 580，根宽=217 / 295 / 297，`sx=L/参考长，sy=192/根宽`。
- 普通 pulse=`0.10+0.15+0.25+0.10=0.60 s`；绝招 wave=`0.15+0.20+0.40+0.15=0.90 s`；峰值相位 5/12、7/18，均为 design/23 §5.2 表现建议值。
- 最终 12 帧边框 alpha 残留 / 残白比例均 0；白底重建最大误差 1.01454/255 <2/255；全帧最小安全距离 130.2 px，留白保守下界 46.27%–64.15%。
- 五 HTML 最大 2,118,064 bytes <3,000,000；均以原尺寸无损 WebP 内嵌，image_scale=1，唯一显式外链为指定 three r186 importmap。

## 4. 开放问题（附默认值）

| 事项 | 默认值 / 交接 |
|---|---|
| 作者确认色彩与阵意 | 沿用阳赤水墨与星链 / 汇聚 / 合围，全部 candidate；星结不作实际人数 UI |
| 原著星位与颜色依据 | 沿用图鉴概述；颜色、气流、星结均原创扩展；三联 / 广州修订版段落待考 |
| 多人阵法与自身架势接入 | 默认掌面局部演示，完整阵员挂点 / 事件由下游处理；不以星结生成单位或追击 |
| 原料留白与根部漂移 | 少量飞墨不足 32 px 留白建议；原图根部最大漂移 11 px，默认保留并逐帧锚点补偿；最终合成安全距离已通过 |
| 连续播放与运行环境 | 默认 crossfade + 方向遮罩；浏览器 / GPU / CDN / 真机仍待实测，静态检查不视为作者审批 |
| 生成后端信息 | 工具未回传模型 / effort，默认如实登记“未回传”，不猜测型号 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本任务仅交付表现资产，不提出玩法或基准修改。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 改什么 |
|---|---|
| `assets/default/vfx/bindings.yaml` 本门 5 条 | 当前 delivery=unknown、emitter=sword；与任务指定 inner / palm 有差异，建议按本任务同步；本轮未改 |
| `tools/vfx/build_demo.py` 第 63 / 74 行 | 标题和 aria-label 固定“外放”，误称非外放招；建议改中性“招式”或消费明确标记，本轮保留脚本产物 |
| `docs/tech/02-rendering.md` 招式事件 / 挂点 | 消费本套分离原料，将局部掌图替换为真实阵主 / 阵员挂点，不按图像推导 AoE |
| `docs/design/catalog/skills-daojia.md` 第 259 行层数要点 | “1 重布阵、七星合围”与同列 / 正式招式表 unlock:9 冲突；建议清理旧的 1 重条目，本轮按 9 重绝招登记 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 用的效果套 | 长度【建议值】 | 节奏 |
|---|---|---|---|---:|---|
| `mv_tiangang_buzhen` | 否 | 否 | family | 320 px（局部） | pulse / 0.60 s |
| `mv_tiangang_doubing` | 否 | 否 | family | 360 px（局部） | pulse / 0.60 s |
| `mv_tiangang_guiyi` | 是 | 否 | mv_tiangang_guiyi | 640 px（2 格） | wave / 0.90 s |
| `mv_tiangang_hewei` | 是 | 否 | mv_tiangang_hewei | 320 px（1 格） | wave / 0.90 s |
| `mv_tiangang_tianshu` | 否 | 否 | family | 280 px（局部） | pulse / 0.60 s |

| 原料清单 | 候选 → 入选 | 造型 / 原著依据 |
|---|---:|---|
| `effect/family/source_sheet.png` | 2 → 2 | 六个星结 + 根部聚气区表达七位、斗柄星链（原创扩展） |
| `effect/mv_tiangang_guiyi/source_sheet.png` | 2 → 2 | 多股星流归一，流线不严格计七根（原创扩展） |
| `effect/mv_tiangang_hewei/source_sheet.png` | 2 → 2 | 七主要星结围拢为空心环弧（原创扩展） |

- ✅ 6 次 image_gen：每套生成一次、定向编辑一次，共 2 候选取第 2 张；未超限。普通招没有另出原料。
- ✅ 原著仅转引图鉴关于全真北斗阵的概述；（待考）三联 / 广州修订版《射雕英雄传》七子围斗黄药师的星位、及《神雕侠侣》全真弟子布阵段落，未编引文 / 回目。
- ✅ 六张候选均 view_image；最终三套查看黑 / 灰底，最终布阵 / 归一 / 合围三张 peak 抽查：从掌面向右发出、根部相接，无明显白边，赤色星心不再抠空。
- ✅ 原料 / 切帧均独立；每招 YAML、JSON、peak、demo 齐全；由指定现有脚本导出，无整图动画帧、无工具逻辑修改。
- ✅ `python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_tiangang --catalog docs/design/catalog/skills-daojia.md`：最终 0 问题、退出 0。
- ✅ `python3 tools/agents/check_assets.py assets/default/vfx/sk_tiangang --min 1 --max 60 --min-side 256`：最终 8 图片条目、0 问题、退出 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：172 文件，strict failure=0、新增未定义=0，退出 0；既有 sk_babuganchan 未定义和 1 近似对仍保留。本轮后续仅改图像资产与说明，未改该检查扫描输入。
- ✅ 5 招 YAML / 展开 JSON 一致；全帧几何、唯一 r186 外链、内嵌图片解码、JS 语法检查通过；五条 manifest 均 pipeline: two-part、code 指向 demo、status: candidate。
- ✅ 三张入选原图与工具原件逐字节一致；共享掌 PNG / YAML 与 git HEAD 哈希一致；所有资产落入授权目录，提示词 / 候选来源可追溯。
- ✅ 只修改本套件与本报告；未执行改变仓库状态的 git 命令，未做临时整仓检出 / assets 复制；分节写入、表格与代码块完整，无未完占位。
- ⚠️ 原料边距 / 漂移建议值有偏差，已披露并校正定位；真实多人阵法、连续播放、CDN / WebGL / 真机和作者审美未验收。需作者确认事项默认沿用第 4 节。
