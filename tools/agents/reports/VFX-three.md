# VFX-three 报告 · 外放招式 · Three.js 合成播放器与两招样例（降龙、六脉；Python 只切帧）

## 1. 摘要（3–6 行）

- 已将外放动效执行者改为 Three.js：分离原料、预乘插帧、方向推进遮罩、独立发出方与播放控制；Python 不再烘动画。
- 复用 VFX-plates 两套原图、12 张透明帧和原料 YAML；未重新生图、未重新抠图。每套交付 14 文件，保持 candidate。
- 两份 HTML 为 2,000,345 / 917,539 bytes；全部原料以原尺寸无损 WebP 内嵌，唯一显式外链为指定 r186 importmap。
- 指定 Python、Node、两套 YAML/HTML、素材清单及严格 ID 命令全部退出 0；两张峰值图已用 view_image 检查。
- **未在浏览器实跑**；CDN 可达性、传递模块、GPU 着色器编译、真机表现和作者审美审批仍待验收。
- 第 8 次续作只修正提示词 §6.3 的降龙参数与核算，并更新本报告；沿用第 7 次已交付的放大效果，素材、演示、配置、清单、播放器与设计文档逐字节不动。

## 2. 产出（文件、行数、主要章节）

| 文件 / 路径 | 行数 | 主要内容 |
|---|---:|---|
| `tools/vfx/web/timeline.js` | 76 | 纯函数采样、零时长边界、推进遮罩、循环间隔 |
| `tools/vfx/web/vfx_player.js` | 267 | 传入 THREE、正交平面、线性预乘采样和混合、播放器生命周期 |
| `tools/vfx/web/test_timeline.mjs` / `package.json` | 112 / 1 | 7 项 Node 测试；目录测试入口、ES module 声明 |
| `tools/vfx/build_demo.py` | 216 | YAML→展开 JSON、原料/脚本内嵌、首屏峰值、预算、控件 |
| `tools/vfx/compose.py` / `check_vfx.py` / `validation.py` | 227 / 65 / 567 | 单张静态峰值；原料/几何/HTML/内联 JS 校验 |
| `tools/vfx/test_vfx.py` / `_test_fixture.py` / `README.md` | 387 / 106 / 151 | 26 项测试、抽象像素夹具、新流程、切帧细节与旧入口迁移 |
| `tools/vfx/animate.py` / `make_placeholder.py` / `player.html` | 已删除 | 第 5 次最终移除；本轮维持删除状态 |
| `assets/default/baseline/vfx/preview/` | 已删除 38 文件 | 第 6 次移除旧 Canvas 页、烘帧、占位原料/配置、质检记录与过期 README；合计 216,737 bytes |
| `docs/design/23-projection-vfx-pipeline.md` / `docs/design/vfx/schema.yaml` | 555 / 310 | Three.js 分工、展开 JSON、可选方向遮罩 |
| `assets/default/prompts/vfx.md` / `assets/default/baseline/vfx/manifest.yaml` | 207 / 481 | 原出图模板保留；合成参数/命令、真实来源历史与文件哈希 |
| 两套 `composition.yaml` / `composition.json` / `demo.html` | 各 31 / 221 / 418 | 精确相位与几何参数、展开元数据、单文件演示 |
| 两套 `effect/effect-set.yaml`、`emitter/emitter-plate.yaml` | 48 / 47、各 10 | 逐字节复用上游参数；每套另有 8 张原料 PNG 与一张 peak |

套件根为 `assets/default/baseline/vfx/{mv_xianglong18_kanglong,sk_liumai}/`；只含源 sheet、6 帧、EffectSet、源掌/指、EmitterPlate、Composition YAML/JSON、peak、demo。未复制旧 frames、qa、animation 或来源 metadata 文件；来源请求和候选链已并入 manifest，未留下不存在的 metadata 引用。

当前 `assets/default/baseline/vfx/` 共 33 文件：两套各 14 文件、四个旧 `ref_*` 文件及一份 manifest；没有 `preview/` 或烘帧目录。第 8 次本轮仅改提示词 §6.3 与本报告，共 2 文件。

## 3. 关键结论与数值

- 降龙母版 3072×2048、六脉仍为 1536×1024，均按 3:2 预览为 768×512；六张原帧实时插值，HTML 另有一张首屏静态峰值，共 8 张内嵌图片；没有烘整图动画帧。
- 金龙 `sx=1700/554×1≈3.0686`，`sy=0.6×320/183×2≈2.0984`，均为原值 2 倍；根宽 `183×sy=384 px`，掌宽仍 `320×0.6=192 px`，两图根部在新发出点 [1040,1180] 对齐。
- 六脉 `sx=820/606≈1.3531`，`sy=0.4×43/46≈0.3739`，根宽 `46×sy=17.2 px`，匹配指尖截面；只提高亮度，不扩大束宽。
- 两招 `T=0.60 s`，加 `gap=0.40 s` 得观看周期 1.00 s；峰值为 0.25 / 0.20 s，不量化到旧 20 fps 网格，不新增战斗伤害事件。
- 软带全宽为 `1700×0.08=136 px` / `820×0.045=36.9 px`（k=1、scale[0]=1）；这是美术参数，不是玩法射程。
- 12 帧的 8 px 边框残留率、半透明残白率均为 0；最大白底重建误差金龙 1.014539、六脉 0.537201 个 8-bit 通道级数；指标不证明解剖或原始 alpha 真值。
- peak 实测 804,526 / 147,080 bytes；HTML 占 3 MB 预算约 66.68% / 30.58%。主图尺寸/哈希、全部 28 文件的字节数/哈希均写入 manifest 并独立重算。
- 旧两条 ref 记录的原文本前缀及四个 ref 文件与 HEAD 逐字节一致；新两条为 `pipeline: two-part`、`status: candidate`、`code: <套件>/demo.html`。

## 4. 开放问题（附默认值）

| 问题 | 默认值 / 交接 |
|---|---|
| 六脉原料是否重出、是否仍像细棍 | 本轮不重出；亮度峰值 2、screen 与方向遮罩先交动态审批，原料偏细仍如实保留 |
| 两招手部画法、掌面朝向和发劲审美 | 保留现有透明手图；不把五指目视或像素接合当作作者批准，等作者审定 |
| 原白底与细节限制 | 保留 253–255 的轻微白底波动、手部 alpha 噪点、六脉第 2 帧最淡尾部 1 px 断列；本轮不擅自重出或补画 |
| CDN 与 Three.js 传递模块 | 固定用户指定 0.186.1，不替换版本；当前环境未核实该 CDN 可达性，浏览器应检查同包 core 模块等传递请求 |
| 浏览器、移动设备及色彩 | 未在浏览器实跑；按主力手机、中端 Android、iPad 与 Safari 验收，含浮点目标及 8 位线性回退精度 |
| 原著书证与运行时挂点 | 沿用 design/23 VFX-O01～08；左右手、具体指法、气剑显色与亢龙掌姿仍待修订版核对；不新增玩法事实 |
| 原任务删除旧文件与续作保留路径的取舍 | 已解决：第 3 / 4 次曾删除 / 恢复提示文件；第 5 次按协调者更正最终删除三个旧入口，第 6 次删除旧 preview；本轮维持最终状态，见 §7 历史记录 |

已解决：VFX-plates 的历史目录入参阻断在本任务按用户指定三份 YAML + `--root/--html` 验收，不宣称旧目录命令已修复。既有 VFX-P01、O01～08 保留追溯，文档新增 O09 记录原料与手部审批。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| VFX-P01（沿用） | 由协调者处理 design/23 制作子契约加入基准 §18 的既有提案 | 本轮落实播放器，不越权修改唯一归属 |

无新增玩法 ID、数值、伤害乘区、CT、射程或 AoE 提案；全部长度/秒数仅为表现参数。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/tech/02-rendering.md` | §2.6、§6 | 对接可注入 THREE 的分层播放器、掌/指挂点；不消费烘帧 HTML 或以视觉宽度推导命中 |
| `docs/tech/07-asset-generation.md` | §1.4、§5.9 | 外放两段式与 Three.js 合成；Python 仅切帧、静态缩略及打包；引用 design/23 |
| `docs/design/05-martial-arts-system.md` | §4.1 anim | 保持 anim.vfx→fx_*→vfx_* 引用，不将 Composition YAML 变成玩法定义 |
| `assets/default/STYLE.md`、`docs/README.md`、基准 | 作者记录 / 索引 / §18 | 引用新分工和 design/23；作者原话不改写；基准归属按既有提案处理 |
| `tools/agents/prompts/VFX-plates.md`、后续任务配置 | 合成与验收命令 | 去旧 animate/frames 路线，采用 README 命令及显式 YAML 入参，补浏览器验收 |
| `tools/agents/reports/VFX-tool.md` | §2、§7 及返修记录 | 标记 preview 产物与 make_placeholder 执行指引已停用；历史验收记录保留，当前流程引用 tools/vfx/README.md |
| `tools/agents/prompts/VFX-tool.md`、`tools/agents/tasks.json` | 旧任务交付定义（第 16 行）/ 写集（第 15840 行） | 标记 preview 为已退出的历史产物，后续任务不再要求重建该目录 |

以上仅登记，未修改写集外文件。已解决：旧 `preview/` 第 6 次全部删除，其 README 中的旧入口执行指引随之移除；当前工具 README 无该指引。两个 `ref_*` 条目及四个文件按要求原样保留。已解决：第 8 次将 `assets/default/prompts/vfx.md` §6.3 同步至当前 Composition，拆开两招母版与 scale，并修正降龙几何及软带核算。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

**接口与字段**：✅ `createVfxPlayer(THREE,{canvas,composition,emitterImage,effectFrames})` 返回 play/pause/seek/setSpeed/dispose/duration/onFrame；时间单位秒，onFrame 可赋回调。模块不 import three。JSON 保留 YAML 并展开 effect/emitter；新增可选 `transition.directional_mask={enabled,softness}`，softness∈(0,0.5] 为全宽，缺省关闭兼容旧数据。

| 两招参数 | 亢龙有悔 | 六脉单束 |
|---|---|---|
| 画幅 / 预览 | 3072×2048 / 768×512 | 1536×1024 / 768×512 |
| 原发出点 → 画面发出点 | [850,704] → [1040,1180] | [1178,468] → [600,500] |
| 源方向 / 目标角 / 长度 | [1,0] / 0° / 1700 px | [1,0] / 0° / 820 px |
| emission_width / emitter_scale | 320 / 0.6 | 43 / 0.4 |
| reference_length / root_width | 554 / 183 px | 606 / 46 px |
| blend / scale | lighter / [1,2] | screen / [1,1] |
| 凝聚 / 发出 / 持续 / 消散 | 0.10 / 0.15 / 0.25 / 0.10 s | 0.10 / 0.10 / 0.30 / 0.10 s |
| scale_from / drift_fraction | 0.95 / 0 | 1 / 0 |
| brightness 五边界 | [0.8,1,1,1,0.8] | [0.9,1.65,2,1.8,0.9] |
| 推进遮罩 / softness | 开启 / 0.08 | 开启 / 0.045 |
| peak_phase / gap | 5/12 / 0.4 s | 1/3 / 0.4 s |

✅ 两招均采用深墨底 #4A433C。凝聚从根向前显现，发出/持续全显，消散同方向退去；效果几何与遮罩同向旋转。线性预乘插帧、逐帧锚点、normal/multiply/screen/lighter 代码复核完成；ShaderMaterial 只采样原料，不画造型。

| 实际执行的验收命令 | 结果 |
|---|---|
| `python3 -m unittest discover -s tools/vfx -p "test_*.py"` | ✅ 第 8 次续作重跑：26 项通过，15.041 s，exit 0 |
| `node --test tools/vfx/web/` | ✅ 7 项通过，exit 0；覆盖相位、hold、零阶段、亮度重边界、漂移、遮罩、循环 |
| `node --check tools/vfx/web/vfx_player.js` | ✅ exit 0；不冒充 GPU 编译 |
| 两套各执行下方三 YAML + root + HTML 命令 | ✅ 两套全部 valid、geometry_checked=true；各 8 图片、1 段内联 JS；exit 0 |
| `python3 tools/agents/check_assets.py assets/default/baseline/vfx --min 2 --max 4` | ✅ 4 图片、4 条目、0 问题，exit 0 |
| `python3 tools/lint/check_ids.py --strict` | ✅ strict failure 0、new 0；已有 sk_babuganchan 豁免诊断 1 条仍保留 |
| 文件哈希/旧 ref；`git diff --check` | ✅ 第 8 次核对 48 个素材、工具与设计文件 SHA-256 全同，含两套各 14 文件、manifest 和旧 ref；未重生成产物，diff 检查通过；前轮清单/配置对拍结论保留 |

两套检查实际展开 `suite=assets/default/baseline/vfx/mv_xianglong18_kanglong`、`suite=assets/default/baseline/vfx/sk_liumai` 后分别运行：

```sh
python3 tools/vfx/check_vfx.py "$suite/effect/effect-set.yaml" "$suite/emitter/emitter-plate.yaml" "$suite/composition.yaml" --root "$suite" --html "$suite/demo.html"
```

- ✅ 旧动画采样/编码/烘帧实现与专用测试已移除；三个旧入口维持删除。第 6 次清理 `preview/` 全部 38 文件，含 18 个 frames 文件、Canvas 页、animation.json、占位原料与质检记录；除指定保留的 ref 历史对照外，无旧烘帧播放器残留。cut_frames.py、imaging.py 未改；compose 只输出峰值。
- ✅ 前轮设计主改 §0、§5.3、§6、§9.1；§1.1、§11、§12 仅修关联目录、验收与待决冲突；§4、§5.1–5.2 原公式/节奏保留。schema、双模板后的合成节与 README 已同步，既有待决项保留；本轮设计与工具逐字节不动。
- ✅ 第 7 次用 view_image 对照降龙旧/新峰值：龙相对掌的长宽明显增大，根部仍透出掌面，未见明显白边、接缝断口或出框；六脉沿用第 3 次指尖衔接目视记录。静帧不代表动态已通过。
- ⚠️ **待协调者浏览器验收**：CDN/传递依赖及 GLSL 编译；首屏/网络失败峰值；0.25–2×、暂停续播、循环 gap、精确 seek、减少动态/系统偏好；根部衔接与方向退散；8 位/浮点目标色彩对拍；dispose、bfcache 返回、sandbox srcdoc 与三类移动设备性能。
- ⚠️ **需作者审批**：原料图是否重出（尤其六脉细棍感）、两招手部画法与掌面姿态、金光力度和气线色缘；默认保留本套 candidate，未在浏览器实跑，不登记 approved。

### 第 3–5 次运行返修记录（2026-09-30）

已解决：第 3 / 4 次曾因守卫误报反复恢复 / 删除；第 5 次按协调者更正最终删除 `animate.py`、`make_placeholder.py`、`player.html`，README 去掉相关指引；本轮维持该最终状态。
第 5 次记录：全部指定检查 exit 0，Python 26 项（14.949 s）、Node 7 项；仅删除三个提示文件及修改 README/报告，其余产物未变。

### 第 6 次运行返修记录（2026-09-30）

已解决：合入前审核第 1 项的旧动效残留。本轮只删除 `preview/` 全部 38 文件并更新本报告，未重写播放器/文档或重生成任何素材。旧 README 随目录删除，无失效入口执行指引留在当前工具 README。
✅ 本轮重跑任务全部七条实际命令均 exit 0：Python 26 项（14.756 s）、Node 7 项、播放器语法、两套 YAML/HTML、素材清单、严格 ID；既有 `sk_babuganchan` 豁免仍为 1 条、新增 0、strict failure 0。
✅ 独立残留扫描：旧三个入口、animation.json、keyframes.json、demo_placeholder.html 与 frames 烘帧均不存在；Canvas 2D/drawImage 只留在要求保留的两个 ref HTML。新演示的 WebP 内嵌是原料/静态峰值封装，不是烘帧序列。
✅ 清理前后 49 个保留文件 SHA-256 全同；manifest 的旧 ref 文本前缀 11,756 bytes 与 HEAD 相同，四个 ref 文件亦逐字节相同。两套各 14 文件，HTML 实测仍为 1,733,858 / 917,539 bytes。
⚠️ **未在浏览器实跑**；本轮未重新看图，沿用已通过的候选图片审核。上述浏览器验收、六脉是否重出及两招手部画法审批继续有效，默认 candidate。

### 作者第 3 轮意见的落实（第 7 次运行，2026-09-30）

✅ 作者要求“龙放大2倍，素材不变”：依 design/23 §4.1 仅将降龙 `length_px: 850→1700`、`scale: [1,1]→[1,2]`，沿向与横向恰为 2 倍，未再乘沿向 scale。掌的 `emitter_scale=0.6` 不变；`canvas_px=[3072,2048]`、`emit_at_px=[1040,1180]`，预览维持 768×512（3:2），根部和掌面仍共用发出点。
✅ 六帧及满尺寸、凝聚 k=0.95、消散末端 δ=0 的保守可见并集 `[554.6,770.2,2741.0343,1476.4]`；最小边距 `3072−2741.0343=330.9657 px`，留白下界 75.4578%，包含插值采样支持域，无越界。
✅ 已重新导出 composition.json、打包 demo.html（2,000,345 bytes，无原料降采样）、生成 peak.png（3072×2048，804,526 bytes），并更新降龙清单 size/sha256/文件实测记录；文件清单仍为 14 项。素材原件、切帧、原料 YAML、六脉整套及旧 ref 均逐字节不变。
✅ 本轮全部指定命令 exit 0：Python 26 项、Node 7 项、JS 语法、两套 YAML/HTML、素材清单与严格 ID；后者仍仅有既有 sk_babuganchan 豁免 1 条、新增 0。峰值已用 view_image 检查；本报告 150 行以内。
⚠️ **未在浏览器实跑**；协调者须复验放大后的动态根部覆盖、方向推进和消散、首屏及减少动态；原料是否重出与手部画法仍待作者审批，默认 candidate。

### 合入前审核第 1 轮返修（第 8 次运行，2026-09-30）

✅ 已解决提示词 §6.3 旧参数：E=[1040,1180]、length=1700、scale=[1,2]、母版3072×2048；sx=1700/554≈3.0686、sy=0.6×320/183×2≈2.0984、龙根384 px、掌192 px、推进软带1700×0.08=136 px；六脉画幅与 scale 单列。仅修改提示词与报告，未重生成图片或演示。
✅ 全部指定命令重新执行且 exit 0：Python 26 项（15.041 s）、Node 7 项、JS 语法、两套 YAML/HTML、素材清单与严格 ID；既有 sk_babuganchan 豁免1条、新增0。48个保留文件 SHA-256 全同，HTML 实测仍为2,000,345 / 917,539 bytes；提示词207行，本报告147行。
⚠️ **未在浏览器实跑**，本轮未重新看图，沿用已通过的图片审核；既有浏览器验收及六脉原料是否重出、两招手部画法、金光力度与气线色缘审批继续有效，默认 candidate。
