# VFX-tool 报告 · 外放招式特效管线 · Python 工具（tools/vfx）

## 1. 摘要（3–6 行）

- 本轮按合入前审核第 2 轮意见原地返修：占位 key_full 从 25 调至 163，补已知金色柔边回归，重建受影响输出；保留已通过的算法、合成及播放器。
- 实现白底切帧/线性去白、根对齐分层合成、时间采样、自包含 HTML、可选 APNG/WebP 和峰值 PNG；不修改策划、技术文档、基准或 manifest。
- 交付严格 YAML/schema/文件/几何/alpha/HTML 校验、24 项无真实素材依赖的测试，以及可重复生成的灰掌/金弧占位。
- 三条要求命令全部 exit 0；占位 HTML 为 32,310 bytes，四帧黑/灰底异常亮边比为 0，实心金色无损；柔边变深和饱和度提高已量化记录。
- 真浏览器交互仍为 unverified，待协调者验收；本轮未重试浏览器，保留前轮启动失败记录并登记新 HTML 哈希。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 内容 |
|---|---:|---|
| `tools/vfx/cut_frames.py` | 295 | 白底算法、量化指标、三底预览、显式 YAML 与 grid/singles CLI |
| `tools/vfx/imaging.py` | 98 | sRGB/线性转换、预乘混合、半像素坐标逆采样 |
| `tools/vfx/compose.py` | 265 | Renderer、根对齐、几何并集、时间包络、关键帧导出 |
| `tools/vfx/animate.py` | 197 | 时间表、关键帧一致性、HTML 预算降档、动图和峰值输出 |
| `tools/vfx/player.html` | 96 | 无外部依赖的 Canvas 控件模板 |
| `tools/vfx/validation.py` | 526 | 实际 schema 子集解释、严格 YAML、文件/图像/跨对象、HTML 与质量检查 |
| `tools/vfx/check_vfx.py` | 65 | YAML/HTML CLI 与 self-test 入口 |
| `tools/vfx/test_vfx.py` | 394 | 24 项程序图正反例测试，含已知金色柔边回归 |
| `tools/vfx/make_placeholder.py` | 273 | 可重复占位、已知前景/覆盖率质量对拍、缩略与说明 |
| `tools/vfx/README.md` | 157 | 用法、参数、数据流、白边指标局限与调参、参考与依赖 |
| `assets/default/baseline/vfx/preview/` | 38 文件 | 三份 YAML、白底/透明原料、帧序列、演示及诊断；具体清单见 §7 |
| `tools/agents/reports/VFX-tool.md` | 165 | 本报告七节及两轮返修记录、最新亮边/色损实测 |

仅写入任务允许的三个路径范围；未执行 commit/push/checkout/reset 等改变仓库状态的 git 命令。本轮只修审核点名的白边、回归与关联记录，每次补丁不超过 50 行；7 个生产算法/播放器文件逐字节未变。

## 3. 关键结论与数值

1. 完整消费 design/23 §2、§4、§5：编码 sRGB 判阈值、线性反解白底、直 alpha PNG、预乘插值；不对发出方抠白，不给整图重复施加包络。金色/气剑可保留颜色，墨色支持 white_luma。
2. 占位：白底长图 `4×320+3×16=1328` px 宽、160 px 高；效果 320×160、发出方 128×128、整图 640×400。小图便于工具验证，未称正式 1536×1024 母版。
3. 参考长度 224 px、展示长度 `1×320=320` px，沿向 `320/224≈1.42857`，横向 `1×32/32×1=1`。E=(160,200)，方向 0°；动画漂移仅消散阶段，最大 `0.02×320=6.4` px，灰掌不移动。
4. 时间 `T=0.10+0.15+0.25+0.10=0.60 s`；20fps 得 `ceil(0.6×20)+1=13` 帧；12个间隔共0.6s，终点持有0.4s，循环共1.0s。峰值精确相位 `0.25/0.60=5/12`，不依赖近邻帧替代。
5. 占位使用 `key_full_8bit=163=255−min(201,164,92)`，公式/通用默认25不变。四帧边框 alpha、半透明近白比、32px源白边污染仍为0；未舍弃像素白底重建最大 `1.014534/255`，最坏帧平均 `0.195926/255`，独立检查器最大 `1.014539/255`。新增真值对拍的黑/灰底异常亮边比均为0，实心4707像素原色不变；柔边黑底最大绝对色差 `87.201492/255`，须保留变深/更饱和的限制，详见§7本轮记录。
6. 全姿态可见并集保守边界约 `[92,169,486.6143,223]`，安全边距92px，留白下界 `1−(486.6143−92)×(223−169)/(640×400)≈91.676%`。包含双线性采样支持域检查，越界硬拒。
7. HTML 32,310 bytes，低于3,000,000；14个 WebP URI（13采样+1峰值），12个独立编码内容；首尾相同画面与相位重合不构成漏帧。预览640×400、质量82，未触发降档。SHA-256：`8da70b367bf767599245e8f6788c086ecc342c42e3b0e97ead0a059a423e4bb5`。

## 4. 开放问题（附默认值）

| 事项 | 默认值 / 当前状态 |
|---|---|
| VFX-design VFX-O01 原帧连续性 | 沿用正式6帧起、需要时8帧；本占位4帧只验允许下界 |
| VFX-O02 金光与底色 | lighter或screen依实际效果选；纸底过白时保留深墨底对照，作者判断；占位normal不代表金龙正式混合定案 |
| VFX-O03 六脉颜色/左右手、VFX-O04 人物挂点 | 保留原待考/后续运行时事项；本工具不创建新原著结论或人物绑定 |
| VFX-O05 气剑时长 | 仍用0.6s母时间轴、播放器减速鉴赏，不改CT或伤害事件 |
| VFX-O06 遮罩/透明效果源 | v1仍只收白底效果；需要白色实体高光时重出合规图，格式扩展另审 |
| VFX-O07 浏览器与设备 | PNG+HTML必需、可选动画none；浏览器sandbox/断网/减少动态待协调者验收，三机真图实测保留（待实测） |
| VFX-O08 旧图层包 | 本工具不把旧整图当作可恢复图层；正式animate缺原料直接拒绝 |
| 作者确认 | 无新的玩法参数请求；真实候选造型、掌面根宽与底色对照交VFX-plates按原流程提交；本轮不询问、不停等 |
| 正式素材抠图参数 | 默认仍按design/23从25开始逐图调参；163仅用于已知金色占位，不能直接套到真实金龙；真实素材无覆盖率真值，必须目视三底与颜色损失。本轮无需新增作者确认 |

已解决：VFX-design 报告中“工具尚未实现、CLI/编码/占位体积未验证”部分，本轮有工具测试和实际产物；真实素材与浏览器实测缺口仍保留，不删除旧问题。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| VFX-P01（上游已有） | 继续等待调度器/作者将 design/23 的制作子契约归属加入基准§18 | 本轮只实现，不重复修改归属定义 |

本轮无新增基准、玩法ID、伤害乘区、射程、CT或数值规则提案。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 建议同步 |
|---|---|---|
| `docs/design/23-projection-vfx-pipeline.md` | §5.3、§9.1、§11 | 链接tools/vfx/README；说明工具v1仅正式分层模式、关键帧不加包络且动画先校验一致性；真实浏览器仍未验证 |
| 同上 | §4.4、§11 | 几何检测包含滤波边缘；32px/40%与白边建议指标可报告，硬门是实际越界/格式/alpha |
| 同上 | §2.4 | 增补不透明浅金边也可能使近白半透明比为0的反例；测试图用已知前景/覆盖率检查黑灰亮边和色损。无需改变公式或schema |
| `tools/agents/prompts/VFX-plates.md` / VFX-plates后续报告 | 制作与校验交接 | 使用本报告§7命令，保留原件/三个YAML，逐图量锚点；独立完成真实素材、sandbox/断网/移动实测与作者审批 |
| `docs/tech/07-asset-generation.md`、`docs/tech/02-rendering.md` | VFX-design已列同步项 | 引用完成的离线工具；运行时仍消费分层效果/混合，不把固定底整图或HTML作为游戏贴图 |

以上仅登记，未修改其他文档。既有 `sk_babuganchan` 未定义豁免仍由原归属任务处理，不因本轮严格检查exit0而称全仓无诊断。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| 验收项 | 结果 |
|---|---|
| cut_frames：白底长图/多单图→RGBA+EffectSet | ✅ 两模式同序结果测试；显式rects、4–8帧、局部锚点/phase；默认无腐蚀/紧裁；源与输出碰撞/符号链接逃逸拒绝 |
| preview与抠图质量 | ✅ 已查看三底全部4帧、关键帧与采样缩略；黑/灰真值异常亮边=0%，8px边框残留=0%；白底未舍弃像素重建最大1.014534级；新增柔边回归能检出25/128，色损详见本轮记录 |
| compose方向/射程/缩放/混合 | ✅ 0°/90°/37°、根漂移补偿、normal/multiply/screen/lighter公式对拍；固定底RGBA整图；超界拒绝、手不随效果移动 |
| animate节奏/过渡/峰值 | ✅ 分离图层线性预乘crossfade/hold；同帧交叉不变薄；零时长阶段后值；24个测试中含13帧、1s周期和精确峰值 |
| HTML格式与体积 | ✅ Canvas图片播放、WebP data URI、全部资源内嵌、32,310 bytes；控件/系统偏好实现保持原样；重建后静态外链/API扫描与14个WebP解码通过 |
| 浏览器交互逻辑 | ✅ 前轮Node VM的19个控件/时钟断言记录保留；本轮未重跑，播放器模板逐字节未变，不将历史逻辑测试当成新HTML浏览器验收 |
| 真浏览器sandbox/断网运行 | ⚠️ 待协调者验收；本轮未执行浏览器检查。前轮3个隔离启动未能建页，记录保留于browser_check.json的revision_2；revision_3登记新HTML体积/哈希和unverified状态 |
| 可选APNG/WebP | ✅ 本轮APNG单测编码/解码且循环时长1000ms；前轮CLI导WebP为13帧、1000ms、22,452bytes并解码（历史数据，本轮未重导）；可选动图不加入占位交付，默认none |
| check_vfx | ✅ 真实schema驱动类型/required/枚举/范围/未知字段；严格YAML、PNG尺寸/alpha、锚点/方向/路径、rects/phase、气剑与resolved_preview约束、正式外键、HTML体积/嵌入图像 |
| 假透明/人工质量边界 | ✅ 拒全空/全实/RGB伪RGBA；⚠️ 局部烧入棋盘格、造型、手部解剖、实测根宽仍需人工验收，未宣称自动识别 |
| 单元测试必需命令 | ✅ `python3 -m unittest discover -s tools/vfx -p "test_*.py"`：24项、36.145秒、exit0 |
| 自检必需命令 | ✅ `python3 tools/vfx/check_vfx.py --self-test`：24项、36.437秒、exit0 |
| 严格ID必需命令 | ✅ `python3 tools/lint/check_ids.py --strict`：exit0，new=0、strict failure count=0；已有1项豁免诊断保留 |
| 占位与README | ✅ 程序生成金弧/灰掌，全流程38文件、不进manifest；缩略图和峰值已目视；README明确非正式素材 |
| 范围/保存/诚实报告 | ✅ 仅允许路径；无仓库状态变更git命令；按节保存、说明与代码围栏闭合；实际浏览器/真机未通过项如实保留 |

各脚本用法与关键参数（从仓库根运行）：

| 脚本 | 命令入口与参数 |
|---|---|
| cut_frames | `python3 tools/vfx/cut_frames.py --config SUITE/effect/effect-set.yaml --output SUITE/effect/effect-set.yaml --root SUITE --preview`；简易源图模式用`--grid COLS ROWS --size W H --gap X Y --anchor X Y --reference-length L --root-width W --asset-id ID`，单图清单省略grid |
| compose | `python3 tools/vfx/compose.py SUITE/composition.yaml --output SUITE/frames`；可加`--root SUITE` |
| animate | `python3 tools/vfx/animate.py SUITE/composition.yaml --frames SUITE/frames --output SUITE --html-name demo.html --quality 82 --optional-animation none`；节奏/过渡在Composition.rhythm/transition/output显式填写 |
| check_vfx | `python3 tools/vfx/check_vfx.py SUITE/composition.yaml --html SUITE/demo.html`；独立effect/emitter检查可用`--root`；`--self-test`跑全部单测 |
| make_placeholder | `python3 tools/vfx/make_placeholder.py`；可用`--output DIR`另存；只用于非生产占位 |

除API测试外，首轮用临时目录实际跑通direct-grid cut CLI（含三底预览）、compose CLI、animate CLI+WebP、check CLI；另用CLI反例验证外部源图复制遇逃逸符号链接时退出1且目标字节未改变。本轮重跑占位生成、Composition+HTML检查及三条必需命令。

占位输出清单（全在 `assets/default/baseline/vfx/preview/`）：

| 分组 | 文件 / 数量 |
|---|---|
| 效果 | `effect/source_placeholder.png`、`effect-set.yaml`、`frame_000.png`–`frame_003.png`、`preview_black/gray/white.png`、`quality.json`；10文件 |
| 发出方 | `emitter/plate.png`、`emitter-plate.yaml`；2文件 |
| 整图帧 | `frames/key_000.png`–`key_003.png`、`keyframes.json`、`frame_0000.png`–`frame_0012.png`；18文件 |
| 套件与演示 | `composition.yaml`、`demo_placeholder.html`、`peak.png`、`frames_thumbnail.png`、`animation.json`、`placeholder_quality.json`、`browser_check.json`、`README.md`；8文件 |

对design/23的偏离或补充：未更改公式/schema。工具v1只接受可解析原料的正式分层动画，不实现可选的whole-frame降级；关键帧与同一配置重渲染逐像素比对防止过期；诊断JSON记录时间表/参数/几何/质量；双线性核边缘纳入保守越界检测；浮点采样边界消除1e-10帧以内舍入误差。示例640×400/4帧是允许的小占位，不替换正式尺寸/6帧建议。质量建议只报告，真实越界、格式与alpha是硬门。本轮在schema允许范围内把占位key_full调至163，新增已知前景/覆盖率诊断；不替换默认25，不将测试真值扩为生产字段。

交VFX-plates要点：正式效果和发出方分别生成，保留白底原件；逐帧标局部根部、发出点、真实掌面/指尖截面；气剑screen/lighter、scale_from=1、drift=0；改配置后重跑compose和animate；同时看黑/灰/白质检及全帧缩略，检查掌面覆盖、连续性、尾迹和留白。完成真实浏览器sandbox/断网/减少动态、三类设备与美术验收后，另依素材规则登记candidate，不能把本占位或检查通过改称approved。

需作者确认：沿用§4及VFX-design原开放项，不重复询问已决定的两段式、气剑非水墨、降龙金色/全掌面；本轮没有新增阻断决策。

### 合入前审核第 1 轮返修记录（2026-09-30）

以下保留第1轮历史记录：该轮只更新 `browser_check.json` 和本报告，未改播放器、算法、配置或图片。真实浏览器验收仍为 unverified，按最新裁定待协调者验收。这不代表已发现播放器故障；该轮所有浏览器进程都在测试页面建立前失败。

| 审核要求 | 本轮实际结果 |
|---|---|
| WebP 解码、首次峰值、无脚本异常 | ⚠️ 未执行实际页面检查，无法观察解码、Canvas 像素或脚本异常 |
| 播放、暂停、调速、减少动态、系统偏好 | ⚠️ 未执行真实浏览器交互；前轮 Node VM 结果仅保留为逻辑测试 |
| 0.6 秒动画、0.4 秒循环间隔 | ⚠️ 仍只有既有逻辑与时间表证据，没有浏览器实际显示计时 |
| sandbox/srcdoc、断网可用、无外部请求 | ⚠️ 未加载实际 iframe，未取得浏览器网络事件；静态扫描不能替代 |

CUA 返回可用浏览器 0，内置浏览器返回 `Browser is not available: iab`。自动批准审查拒绝现有 Chrome 界面访问，原文 `Computer Use was not approved to use Google Chrome`，未给更具体理由。独立 Python Playwright 使用临时配置目录和 `chromium_sandbox=True`：Chrome for Testing 151.0.7922.34 headless shell 报 `sandbox_parameters_mac.mm:87`、`Input/output error (5)` 后 SIGTRAP；151.0.7922.34 与 148.0.7778.96 完整版均 SIGABRT，未给 stderr 原因。未安装软件、禁用沙箱、改变权限或访问个人浏览器配置。

浏览器记录修改后重跑全部必需命令：`unittest discover` 23 项 / 13.086 秒、`check_vfx.py --self-test` 23 项 / 13.087 秒、`check_ids.py --strict` 新增 0 / 严格失败 0，三条均 exit 0。检查设置 `PYTHONDONTWRITEBYTECODE=1`，然后才更新报告。

前后 SHA-256 核对：10 个工具文件及其余 37 个预览文件逐字节一致；HTML 仍为 31,866 bytes，SHA-256 为 `f9b6adf72b9b0ab309e4631acbdecc05668ffd77f6ae49a8b67f7a115a811c6e`。既有占位输出清单、量化质量与 design/23 偏离说明均未改变。

交 VFX-plates / 后续验收者：在已授权且可启动的浏览器中，将当前重建后的 HTML 放入仅 `allow-scripts` 的 srcdoc iframe，逐项完成上表观察并更新记录；此前不能把本占位浏览器验收写成通过。无需新增作者设计决策，浏览器检查待协调者验收。

### 合入前审核第 2 轮返修记录（2026-09-30）

✅ 按审核仅修白边及关联产物。保持 `white_to_rgba`、通用 `quality_metrics` 与默认25原样；占位使用163。128虽然消除了低覆盖的不透明浅边，实际帧1/2黑底仍比已知真值高出32.139610/40.441086级，故不采用。163来自 `255−92`，没有引入新公式或schema字段。

✅ 新测试用已知前景 `(201,164,92)`，覆盖率 `[0.05,0.1,0.25,0.5,0.75,0.85,0.95,1]` 在线性域合白，8-bit量化后抠图；黑/灰底对拍包括所有原始柔边像素，不依赖输出是否半透明。任一通道正向误差超过2级计异常亮边，另检查绝对误差、实心原色与保留/舍弃行为；25与128均触发反例。初次全测暴露0.05覆盖按白阈值应舍弃，已修正测试断言后重跑通过，未改变算法。

下表单位为8-bit通道级；真值为生成前已知金色和浮点覆盖率，误差在完成线性合成、编码sRGB后计算：

| 帧 | 原始柔边像素 | 黑底最大正向误差 | 灰底最大正向误差 | 黑底绝对误差均值 | 灰底绝对误差均值 |
|---|---:|---:|---:|---:|---:|
| 000 | 5796 | 0.362295 | 1.594577 | 30.173309 | 9.913894 |
| 001 | 5796 | 0.296893 | 1.590093 | 38.787544 | 18.532476 |
| 002 | 1089 | 0.212393 | 1.573951 | 28.499813 | 10.737847 |
| 003 | 5796 | 0.100041 | 1.628547 | 28.616003 | 8.870746 |

四帧黑/灰底异常亮边比均0；审核点 `frame_002.png (160,49)` 从 `(238,229,216,255)` 变为 `(194,151,0,80)`。4707个实心点保持 `(201,164,92,255)`，核心色差0。⚠️ 柔边有颜色损失：黑底最大绝对误差87.201492级、灰底37.979630级，覆盖率最大误差0.095643；这不是原透明度恢复。白底全柔边真值误差最高5.498032级来自近白阈值舍弃；design/23规定的未舍弃像素重建最大1.014534级，两个统计口径分别保留。

✅ 已复查黑/灰/白三底的全部4帧、4关键帧、13采样缩略与峰值，浅色描边已消除，黑底柔边更深、更饱和；无裁切或发出方移动。重建效果帧/预览、合成关键帧/采样、峰值/缩略、HTML、YAML参数与质量记录；仍为38个预览文件、不进manifest。新增诊断只存在于 `placeholder_quality.json.reference_quality`，正式素材不能假造真值。

✅ 最终三条必需命令均exit0：discovery 24项/36.145秒；self-test 24项/36.437秒；严格ID新增0、失败0，保留既有1项豁免。另跑Composition+HTML检查通过，14个内嵌WebP均可解码。检查使用 `PYTHONDONTWRITEBYTECODE=1`，全部完成后才更新报告。

✅ 本轮SHA-256对比：7个生产算法/播放器文件及7个预览文件未变（白底原件、灰掌及其YAML、Composition、关键帧清单、首尾采样帧）；28个已跟踪baseline文件哈希一致，全部已跟踪文件 `git diff --stat` 为空。变化限于3个工具文件、31个关联预览文件及本报告。新HTML为32,310 bytes，SHA-256见§3，与 `browser_check.json.revision_3` 一致。

⚠️ 浏览器记录仍为unverified，待协调者验收sandbox/srcdoc、真实控件、减少动态、断网及网络请求；本轮无浏览器执行。交VFX-plates：使用显式参数重新切帧后再compose/animate，逐帧看三底与颜色损失，不能只用白边比0或白底重建合格签出，也不能把163当通用金色参数。需作者确认：本轮无。
