# VFX-sk_jinshejian 报告 · 招式特效 · 天级 金蛇剑法（sk_jinshejian，6 招）

## 1. 摘要（3–6 行）

- 完成 6 招：4 个普通招复用家族套，2 个绝招各用专属套；全部为 `candidate`。
- 3 张 1536×1024 白底四帧原料经 `cut_frames.py` 导出 12 张 768×512 RGBA 帧。
- 每招交付 Composition YAML/JSON、静态峰值与 Three.js r186 单文件演示，均引用共享剑图。
- 本会话无 `image_gen` 能力，原料改用 Pillow 可复现绘制；未冒充模型生成，需作者审美复核。

## 2. 产出（文件、行数、主要章节）

| 产出 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| `assets/default/vfx/sk_jinshejian/effect/` | 3 套 / 30 文件 | 白底图、12 RGBA 帧、EffectSet、三底预览、质量数据 |
| `assets/default/vfx/sk_jinshejian/moves/` | 6 目录 / 24 文件 | Composition YAML/JSON、`peak.png`、`demo.html` |
| `manifest.yaml` | 10 行 / 9 条 | 3 原料 + 6 招；哈希、附件完整性、`pipeline:two-part` |
| `make_sources.py` / `make_manifest.py` | 可复现脚本 | 原料绘制与登记；未修改 `tools/vfx/` |

## 3. 关键结论与数值

- 图鉴为 `nature:yin`，故采用阴青水墨；蛇行、回锋弧与七股狂舞均（原创扩展）。
- 普通 `0.10+0.15+0.25+0.10=0.60s`；绝招 `0.15+0.20+0.40+0.15=0.90s`。
- 长度：蛇行/逆鳞 `1×256=256px`；吐信 `2×256=512px`；狂舞 `3×256=768px`；锥剑 `4×180=720px`；盘身局部192px【建议值】。
- 12 帧 8px 边框残留率与残白率均0；最大白底重建误差0.6356/255。
- 6 个 HTML 为331,019–400,430 bytes，均≤3MB；效果根部对齐共享剑尖，抽查无白边。

## 4. 开放问题（附默认值）

| 事项 | 默认值 / 当前处理 |
|---|---|
| 作者审美审批 | 沿用阴青蛇形候选，维持 `candidate`；不把自检视为批准 |
| `image_gen` 缺席 | 默认保留程序化候选；有生成能力时可按相同构图重出，不改 Composition |
| 原著招名、动作与颜色 | 图鉴明确所有招名按意象扩展且具体依据（待考）；默认不编引文、回目或原著颜色 |
| 浏览器 / 真机 | 静态门禁已过；CDN、连续动效、移动端性能与挂点仍（待实测） |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。现有图鉴已明确 6 招范围、绝招与外放审计，本次不新增玩法事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/tech/02-rendering.md` / 运行时接入 | 动作事件与武器挂点 | 接共享剑尖；绕背、后撤、反击、缴械、实体金蛇锥与七段判定均由 Core 驱动 |
| `docs/design/catalog/skills-xiake-bixue.md` | §10.2 / K-6 | 后续逐字核对招名、秘笈机关与剑式次序；未核实前维持现有标注 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 用的效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_jinshejian_shexing` | 否 | 否 | `family` | 256px | pulse / 0.60s |
| `mv_jinshejian_tuxin` | 否 | 否 | `family` | 512px | pulse / 0.60s |
| `mv_jinshejian_panshen` | 否 | 否 | `family` | 192px | pulse / 0.60s |
| `mv_jinshejian_zhuijian` | 否 | 否（实体锥） | `family` | 720px | pulse / 0.60s |
| `mv_jinshejian_nilinhui` | 是 | 否 | `mv_jinshejian_nilinhui` | 256px | wave / 0.90s |
| `mv_jinshejian_kuangwu` | 是 | 否 | `mv_jinshejian_kuangwu` | 768px | wave / 0.90s |

| 原料清单（各含白底图+4帧） | 候选数→入选 | 造型依据 |
|---|---:|---|
| `effect/family` | 1→1 | 图鉴“盘旋奇诡、剑锋吞吐如蛇”；具体蛇行剑痕（原创扩展） |
| `effect/mv_jinshejian_nilinhui` | 1→1 | 招名来自图鉴；高拱回锋弧（原创扩展），动作书证（待考） |
| `effect/mv_jinshejian_kuangwu` | 1→1 | 图鉴锥形r3、N=7；七股同根扇痕（原创扩展），不等于七段 |

- ⚠️ 无可调用 `image_gen`，故3张原料由本地脚本生成；均已 `view_image` 自查，来源如实登记。
- ✅ 抽查蛇行入隙、金蛇狂舞峰值：从共享剑尖沿方向发出、根部相接、无可见白边。
- ✅ 发出方仅引用 `emitters/sword/`，PNG SHA-256=`85245a416ce4ea...96e2`，未复制、未改。
- ✅ 6 招均由 `compose.py` / `build_demo.py` 导出；Three.js 演示≤3MB，manifest均为候选。
- ✅ `check_skill_suite.py`、`check_assets.py`、`check_ids.py --strict` 均退出0（最终结果见交付说明）。
- ✅ 只写授权资产目录与本报告；未改工具、设计文档、TODO或共享发出方，未执行改变仓库状态的git命令。
- ⚠️ 原著依据仅沿图鉴《碧血剑》金蛇秘笈、夏雪宜/袁承志传承事实；具体招名、机关、次序（待考），未编回目或引文。
