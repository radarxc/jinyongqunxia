# 外放招式特效工具

| 项 | 内容 |
|---|---|
| 归属 | 实现 `docs/design/23-projection-vfx-pipeline.md` 的离线制作契约 |
| 上游 | `docs/design/vfx/schema.yaml`；作者两段式决定见 `assets/default/STYLE.md` |
| 环境 | Python 3.11；仅标准库、Pillow、numpy、PyYAML |
| 边界 | 不生成正式造型、不计算伤害/射程合法性、不写 manifest 或审批状态 |

**结论先行（TL;DR）**：白底效果图 → `cut_frames.py` → RGBA 帧与 EffectSet；独立透明发出方 + EmitterPlate → `compose.py` 整图关键帧 → `animate.py` 分层重采样、PNG、峰值与单文件 Canvas 演示。`check_vfx.py` 验证结构、原料、几何和演示文件。现成的占位可用 `python3 tools/vfx/make_placeholder.py` 重建。

## 1. 快速运行

以下命令均在仓库根目录执行。无需安装其他 schema、视频或 JavaScript 依赖。

```sh
python3 tools/vfx/make_placeholder.py
python3 tools/vfx/check_vfx.py assets/default/baseline/vfx/preview/composition.yaml \
  --html assets/default/baseline/vfx/preview/demo_placeholder.html
python3 -m unittest discover -s tools/vfx -p 'test_*.py'
python3 tools/vfx/check_vfx.py --self-test
python3 tools/lint/check_ids.py --strict
```

打开 `assets/default/baseline/vfx/preview/demo_placeholder.html`。这是明确标记的程序占位，不进入 manifest，不能当作真实金龙、气剑或手部造型验收。生成器可用 `--output DIR` 在另一目录建立同样的测试套件。

## 2. 切帧与抠图

### 显式 YAML 模式（正式素材推荐）

按 design/23 §6.2 或占位 `effect/effect-set.yaml` 填写完整 EffectSet，包括将要输出的 `frames` 清单。源文件必须先存在，帧文件可不存在。

```sh
python3 tools/vfx/cut_frames.py --config path/to/suite/effect/effect-set.yaml \
  --output path/to/suite/effect/effect-set.yaml --root path/to/suite --preview
```

`--config` 内所有路径相对该 YAML；若输出 YAML 换位置，工具转换相对路径，帧仍写到原配置指向的位置。`--root` 指同一素材套件根目录；不能经绝对路径、网络 URL 或符号链接逃出根目录。源 PNG 保留原件，输出帧不能与源图共用路径。

### 规则分格 / 多张单图

以下参数仅示范接口，锚点、参考长度、根宽必须量图。素材 ID 复用已登记的 ID。

```sh
python3 tools/vfx/cut_frames.py white_strip.png --output path/to/suite/effect/effect-set.yaml \
  --asset-id vfx_sk_liumai_beam --grid 4 1 --size 1024 512 --gap 32 0 \
  --anchor 96 256 --direction 1 0 --reference-length 800 --root-width 24 \
  --style qi_sword --blend screen --preview
```

省略 `--grid`，按顺序传入 4–8 张 PNG 即为 singles。外部输入会逐字节复制为输出目录的 `source_01.png` 等；已有不同内容的同名原件会拒绝覆盖。

| 参数 | 说明 |
|---|---|
| `--grid COLS ROWS` / `--size W H` | 左到右、上到下；单格尺寸不做隐式缩放 |
| `--gap X Y` / `--margin X Y` | 格间距及源图左上外边距，默认 0 |
| `--count N` | 使用前 N 格；允许 4–8 帧，不能超过网格容量 |
| `--anchor X Y` | 切格后的局部根部坐标；各帧不同锚点用 YAML |
| `--direction DX DY` | 原素材单位方向向量，默认 `[1,0]` |
| `--reference-length` / `--root-width` | 峰值参考纵向长度 / 根部横向宽度，单位 px |
| `--phases ...` | 严格递增、首 0 尾 1；默认等分 |
| `--style` / `--blend` | schema 枚举；气剑须 screen/lighter；普通默认 normal |
| `--method` | `white_key` 或 `white_luma`；墨默认 luma，其他默认 key |
| `--white-cutoff` / `--opaque-luma` / `--key-full` | 默认 250 / 0.20 / 25；参数含义只见 design/23 §2.3 |
| `--preview` | 输出黑/128灰/白底联系表，另总是保存 `quality.json` |

零 alpha 的 RGB 写零；导出直 alpha，内部采用线性光。残余白边比的分母为半透明像素数；没有半透明像素时比值记 0，并保留实际像素数供判断。重建误差只计算未舍弃前景。边框污染、白边与重建误差是建议指标，不能用来自动认定造型合格。

此白边比会漏掉被判为不透明的浅金边。占位使用 `key_full_8bit=163`（`255−min(201,164,92)`），通用默认仍为 25；128 虽改善低覆盖柔边，仍有高覆盖亮边。`placeholder_quality.json` 的 `reference_quality` 另以已知前景与生成前覆盖率对拍黑/灰/白底，包含误判为不透明的像素；黑/灰底任一通道高出真值 2/255 才计异常亮边，并记录绝对误差、覆盖率误差与实心色损。163 保留实心金色，柔边会变深、更饱和，不代表透明度或颜色无损恢复。真实素材没有这个真值，须逐帧检查三底并独立调参。

## 3. 发出方与整图合成

发出方是独立的 RGBA PNG，直接保留其 alpha，不能套白底算法。按 design/23 §6.3 填 EmitterPlate，量取 `emit_point_px`、单位 `direction`、有效 `emission_width_px`。Composition 字段以 schema 和占位 `composition.yaml` 为可运行参考。

```sh
python3 tools/vfx/compose.py path/to/suite/composition.yaml --output path/to/suite/frames
```

输出 `key_000.png…` 与 `keyframes.json`。关键帧尚未施加时间包络，动画时只施加一次。`--root` 可显式指定套件根，默认 Composition 同级目录。背景必须为固定不透明颜色，整图允许 alpha 全 255；分离效果/发出方必须含实际透明及非透明像素。

长度取显式 `length_px`，否则 `range_hex × pixels_per_hex`。沿向和横向缩放、锚点变换与四种混合完全遵循 design/23 §4。0° 朝右、90° 朝下，正角顺时针；两张原图的方向可以不同，都会对准同一个 `emit_at_px`。方向不是六角逻辑朝向或精灵索引。

全部帧、凝聚缩放端点、消散位移端点均检查可见像素（包含双线性采样边缘）的画幅范围，超界直接报错。几何报告给出保守安全边距和留白比例下界；32 px/40% 是 design/23 建议，母版审查时需结合实际造型判断。

## 4. 节奏、过渡与动画

```sh
python3 tools/vfx/animate.py path/to/suite/composition.yaml \
  --frames path/to/suite/frames --output path/to/suite --optional-animation apng
```

省略 `--frames` 时读取 Composition 同级 `frames/`；省略 `--output` 时写入 Composition 同级。关键帧必须与当前 Composition 及原料一致；缺原料、缺帧或旧配置产生的关键帧直接报错，先重新运行 compose。v1 工具只提供正式分层采样，**不提供只用整图的降级模式**。

参数保存在 Composition，工具不另维护第二套默认节奏：

| YAML / CLI | 用途 |
|---|---|
| `rhythm.{charge,release,sustain,dissipate}_s` | 四阶段秒数；总长须正；零阶段跳过 |
| `transition.interpolation` | `crossfade`：根对齐的线性预乘插值；`hold`：保持当前关键帧 |
| `transition.scale_from` | 凝聚期以根部为中心缩放，只作用效果；气剑须 1 |
| `transition.drift_fraction` | 仅消散期沿方向移动，最多长度的 0.05；气剑须 0 |
| `transition.brightness` | 五边界线性 RGB 增益；重合边界取后值；不提亮手或底色 |
| `output.fps` / `loop` / `loop_gap_s` | 帧率、是否循环、末帧循环间隔 |
| `output.peak_phase` | 精确采样的峰值位置，与采样帧是否重合无关 |
| `output.preview_size_px` | HTML 内嵌帧尺寸，与母版等比；不改 PNG 母版 |
| `output.html_max_bytes` | schema 固定 3,000,000，不能提高 |
| `output.optional_animation` | none / apng / webp；CLI `--optional-animation` 可覆盖本次输出 |
| `--html-name` / `--quality` | 默认 demo.html / 82；WebP 质量允许 1–100 |

输出 `frames/frame_NNNN.png`、`peak.png`、HTML、`animation.json`，可选 `animation.apng` 或 `animation.webp`。JSON 记录每个采样时刻、实际持续时间、预览尺寸/质量/降档记录及几何诊断。更换编码选项不会删除此前的可选动图，以最新 JSON 的输出清单为准。

`T=0.6 s, fps=20` 得 `ceil(T×fps)+1=13` 帧；0–0.55 s 各持有 0.05 s，终点仅持有 `gap=0.4 s`，循环总长 1.0 s。峰值按明确相位单独采样。浮点加法产生的整数邻近误差会在 `1e-10` 帧容差内消除；不会添加近零时长的重复终点。APNG/WebP 以累计时间取整到毫秒，播放器可能合并相同图帧；非循环末帧持续 0 ms，部分查看器有最小延时限制，HTML 时间表为精确参考。

HTML 首次展示峰值，点击播放才运动；减少动态使用系统偏好并可手动切换。暂停保留当前位置，改变速度不改母时间轴。Canvas 仅画内嵌 WebP 图片，无外部字体、脚本、路径或网络 API，并有禁用网络资源的 CSP；可以直接作为 `<iframe sandbox="allow-scripts" srcdoc="…">` 的内容。

若超 3 MB，依次降低 WebP 质量、等比降低演示尺寸，完整记录尝试；12 次仍超预算则非零退出。PNG 母版和峰值保持尺寸。大型原料帧与动画采样当前在内存处理，先用小预览检查构图，再按实际母版测时/测内存；未宣称手机端执行 Python。

## 5. 校验与常见问题

```sh
python3 tools/vfx/check_vfx.py path/to/suite/effect/effect-set.yaml \
  path/to/suite/emitter/emitter-plate.yaml path/to/suite/composition.yaml \
  --root path/to/suite --html path/to/suite/demo.html
```

校验从仓库真实 schema 读取规则；仅实现其当前使用的 JSON Schema 关键字，遇到新断言会拒绝而非静默忽略。拒绝未知字段、重复键、非有限数、非 JSON YAML 值、循环引用、非法路径、文件类型/尺寸不符、全透明/全不透明源层和越界锚点。Composition 验证既有玩法外键、气剑限制、等比预览和几何范围；resolved_preview 必需上游字段并固定沿向 scale=1，但不自行重算战斗合法性。

`--html` 验证十进制 3 MB、内嵌 WebP 实际解码、外部 URL、src/href、CSS url、常见网络 API/动态导入。它不是任意 JavaScript 的安全证明；浏览器 sandbox/断网运行与移动设备观感仍需单独验证。三种 YAML 对象定义输入制作数据，因此仅检查 YAML 不会声称 demo/peak 已存在，交付时同时检查输出清单和 `--html`。

| 现象 | 处理 |
|---|---|
| 黑底出现白边 | 即使 `quality.json` 的白边比为 0 也可能有不透明浅边；适当提高 `--key-full` 并逐帧看三底及颜色损失，不腐蚀细线；占位 oracle 见上文 |
| 白色高光被抠掉 | 当前格式要求效果内部不用近白实心高光；重出合规原图，不对发出方做色键 |
| PNG 有 alpha 但棋盘格仍看得见 | 棋盘格可能已烤进 RGB，自动检查不能可靠判形；须人工查看黑/灰底，重出真透明发出方 |
| 手漂移 / 根部跳动 | 逐帧量局部 anchor，确认源 direction 和发出方 direction；不自动紧裁、不移动整图补偿 |
| 金光在纸底变白 | lighter/screen 依赖固定底色；可改既有深墨底 `#4A433C` 对照，保留纸底审图 |
| 超界报错 | 调整发出点、画幅或比例；工具不静默截断。32px 安全边距需按全姿态审图 |
| 缺原料或关键帧过期 | 保留白底原件、RGBA 与 YAML；配置/锚点改动后先 compose 再 animate |
| `range_hex=0` | 必须显式给正 length_px；它可表示自指事件的局部效果，不反推主动射程 |

## 6. 参考资料

- [design/23](../../docs/design/23-projection-vfx-pipeline.md)：公式、坐标、节奏和制作边界。
- [离线 schema](../../docs/design/vfx/schema.yaml)：三种制作对象字段的唯一来源。
- [作者风格决定](../../assets/default/STYLE.md)：正式效果/发出方必须分别生成。

## 7. 本文新增术语/约定

`quality.json` 为抠图指标；`keyframes.json` 为未加包络的整图关键帧清单；`animation.json` 为分层单次包络重采样和输出记录。这些是离线诊断文件，不新增 schema 字段、玩法 ID 或运行时契约。`make_placeholder.py` 的程序图只用于工具测试。

## 8. 待决事项 / 依赖

- 已解决：两段式抠图/合成/过渡/自包含演示的 CLI 与合成图测试，见本目录脚本和任务报告。
- **（待实测）** 正式素材白边、根宽、掌面、连续性；默认沿用 design/23 的 8px 边框残留 0、白边 ≤1%、重建误差 ≤2/255，不以占位通过替代审美批准。
- **（待实测）** 三类移动设备、Safari 与真实素材大画幅播放/内存；默认 PNG + HTML 必需、可选动画 none。
- 对 design/23 的实现补充：未加包络关键帧会与原料重新渲染结果比对；越界检测包含保守双线性边缘；无整图降级模式；诊断文件不进入制作 schema。没有更改上游文档。
- 作者确认沿用现有 VFX-O01～08 的默认值；本任务无新的玩法参数请求。正式素材质量、纸底/深墨底选择及作者审批交 VFX-plates。
