# 外放招式：分离原料 + Three.js 合成

| 项 | 内容 |
|---|---|
| 归属 | design/23 的制作与演示工具实现，不定义玩法规则 |
| 上游 | 作者 2026-09-30 Three.js 合成决定；design/23 §2、§4–6；tech/01 的 r186 |
| 引用而不重定义 | 几何、混合、节奏与字段唯一见 design/23 和 schema |
| 标注约定 | 技术版本可用性（待核实）；浏览器、设备与视觉效果（待实测） |

## 结论先行（TL;DR）

效果白底图经 Python 切帧、抠成透明 PNG；发出方使用独立透明图。
Three.js 在网页中按同一份 Composition 合成与播放，不预烘整图动画帧。
`compose.py` 仅保留一张静态 `peak.png`，供素材清单、审批与首屏展示。
所有造型来自原料图；测试中的抽象像素块不进入正式素材。

## 从原料到演示

依赖沿用仓库现有 Python 标准库、Pillow、numpy、PyYAML；Node 用于测试与语法校验。
演示唯一外链是 importmap 中锁定的 Three.js r186：
`https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.min.js`。

从仓库根目录执行，以下路径可替换为 `sk_liumai`：

```sh
python3 tools/vfx/cut_frames.py --config assets/default/baseline/vfx/mv_xianglong18_kanglong/effect/effect-set.yaml --output assets/default/baseline/vfx/mv_xianglong18_kanglong/effect/effect-set.yaml --root assets/default/baseline/vfx/mv_xianglong18_kanglong
python3 tools/vfx/compose.py assets/default/baseline/vfx/mv_xianglong18_kanglong/composition.yaml --root assets/default/baseline/vfx/mv_xianglong18_kanglong
python3 tools/vfx/build_demo.py assets/default/baseline/vfx/mv_xianglong18_kanglong/composition.yaml --root assets/default/baseline/vfx/mv_xianglong18_kanglong
python3 tools/vfx/check_vfx.py assets/default/baseline/vfx/mv_xianglong18_kanglong/effect/effect-set.yaml assets/default/baseline/vfx/mv_xianglong18_kanglong/emitter/emitter-plate.yaml assets/default/baseline/vfx/mv_xianglong18_kanglong/composition.yaml --root assets/default/baseline/vfx/mv_xianglong18_kanglong --html assets/default/baseline/vfx/mv_xianglong18_kanglong/demo.html
```

原料已有合格切帧时直接从第二步开始，避免无目的覆盖。具体切帧参数以
`python3 tools/vfx/cut_frames.py --help` 为准；`--preview` 仅在制作质检时生成三底图，
最终样例只保留任务规定的源图、RGBA 帧、三份 YAML、Composition JSON、peak 与 demo。

### 切帧输入与原件保护

正式素材优先使用 `--config` 的完整 EffectSet。所有原料路径相对所属 YAML，
`--root` 指同一套件根；路径不能通过绝对地址、网络 URL 或符号链接逃出该根。
源白底 PNG 与切出的 RGBA 帧必须使用不同文件名；发出方已有 alpha，不能再次套白底算法。

| 输入参数 | 使用方式 |
|---|---|
| `--grid COLS ROWS` / `--size W H` | 规则图格按左到右、上到下切分，单格不隐式缩放 |
| `--gap X Y` / `--margin X Y` | 格间距与左上外边距；默认均为 0 |
| `--count N` | 选用前 N 格，须在 4–8 帧范围且不超过图格容量 |
| `--anchor X Y` | 切格后的局部根部坐标；各帧不同时在 YAML 中逐帧填写 |
| `--direction DX DY` | 原料单位方向向量；与画面发出方向分别配置 |
| `--reference-length` / `--root-width` | 原料参考长度与根宽，必须量图，不当作玩法射程 |
| `--phases ...` | 与帧数相同，严格递增，首 0 尾 1；默认等分 |
| `--preview` | 制作时检查黑、128 灰、白底联系表，另输出质量记录 |

不指定 `--grid` 时，按顺序传入 4–8 张单图。外部原件逐字节复制，
已有不同内容的同名原件会拒绝覆盖。现有两套候选无需重新执行这些步骤。
抠图参数的定义和建议指标见 design/23 §2.3；导出为直 alpha，透明像素 RGB 清零。
白边指标为 0 仍可能遗漏被判为不透明的浅色边缘，必须结合三底图检查。
手部棋盘格若已画进 RGB，也不能靠“PNG 含 alpha”自动认定合格。

### 当前工具职责

| 文件 | 当前职责 |
|---|---|
| `cut_frames.py` | 白底裁格、线性反解 alpha、去白、可选三底检查 |
| `compose.py` | 校验全帧几何边界；只在 `peak_phase` 采样静态 PNG |
| `build_demo.py` | YAML 转 JSON；内联播放器、元数据、原料图和首屏静态 peak |
| `web/timeline.js` | 无 Three.js 依赖的纯时间线函数 |
| `web/vfx_player.js` | 正交像素相机、分离图层、shader 插值、推进遮罩与播放控制 |
| `check_vfx.py` / `validation.py` | YAML、原料、跨字段、几何、质量报告及 HTML 静态门禁 |
| `imaging.py` | 切帧与静态峰值使用的线性色彩、预乘 alpha、几何与混合运算 |

不再输出 `frames/key_*.png`、`frames/frame_*.png`、`animation.json` 或 APNG/WebP 动图。
旧 schema 的 `fps` 为兼容元数据；浏览器按 RAF 实时时间采样。
`optional_animation` 必须为 `none`，其他取值在打包时明确失败。

### 旧入口迁移

| 旧用法 | 当前操作 |
|---|---|
| `compose.py --output <frames目录>` | `compose.py <composition.yaml> --root <套件>`；默认只写 `peak.png` |

旧入口及仅供它们使用的测试已退出工具链。`build_demo.py` 直接读取原料与
`web/` 模块；游戏接入 `web/` 模块，不依赖旧文件或历史整图帧。

## 播放器与数据

```js
import { createVfxPlayer } from './vfx_player.js';
const player = createVfxPlayer(THREE, { canvas, composition, emitterImage, effectFrames });
player.onFrame = state => { /* state.stage、time、alpha 等 */ };
player.play();
player.pause();
player.seek(0.2); // 秒
player.setSpeed(0.5);
player.dispose();
```

`THREE` 由调用方传入；模块本身不导入 Three.js。`emitterImage` / `effectFrames`
为已解码图像。JSON 保留 YAML 的全部 Composition 字段，并内联 `effect`（EffectSet）
和 `emitter`（EmitterPlate）；根部、图像尺寸仍是原 PNG 的逻辑像素坐标。
预览内嵌图可等比缩小，shader 按逻辑尺寸映射 UV；不会缩小母版或修改锚点。

`transition.directional_mask: { enabled: true, softness: 0.08 }` 控制方向显隐。
`softness` 是前沿完整软带宽与参考长度的比，取值 `(0,0.5]`；缺省关闭，兼容旧数据。
凝聚期根到尖显现，消散期根到尖擦除；不绘制新轮廓。具体公式唯一归
`docs/design/23-projection-vfx-pipeline.md` §4–6 与 `docs/design/vfx/schema.yaml`。
帧过渡采用线性颜色、预乘 alpha 和根部对齐；增益与包络只作用效果，不影响手。

首屏静止显示精确 `peak_phase`，原料和模块加载成功后切换到同相位 Three.js。
播放/暂停、0.25–2× 速度、减少动态开关可用于鉴赏；系统减少动态偏好也会生效。
循环间隔只影响观看，不发出任何游戏命中或伤害事件。资源与模块除 Three.js 外
全部内联；首次加载 Three.js 需要联网，离线失败会保留静态峰值并显示错误。

单 HTML 硬上限为 3,000,000 bytes。原料先按原尺寸以无损 WebP 内嵌；
若超预算，每次乘 0.8，最多尝试 8 档，实际比例与字节数写到命令输出。
这是展示纹理压缩，不是动效帧编码。Composition JSON 与峰值 PNG 保持原尺寸语义。

## 验证与限制

```sh
python3 -m unittest discover -s tools/vfx -p 'test_*.py'
node --test tools/vfx/web/
node --check tools/vfx/web/vfx_player.js
```

HTML 门禁验证精确 importmap、禁止额外外链、解码内嵌图、逐段运行 `node --check`。
它是已知生成器的静态检查，不能证明任意 JavaScript 绝不联网，也不代替 WebGL 实跑。
人工应检查真实浏览器加载、掌面/指尖衔接、四阶段方向感、混合/色彩、速度、循环间隔、
减少动态以及 dispose；当前沙箱未在浏览器实跑。真机性能与跨工具色彩对拍仍（待实测）。

## 参考资料

- [design/23](../../docs/design/23-projection-vfx-pipeline.md)：公式、坐标、节奏和制作边界。
- [制作 schema](../../docs/design/vfx/schema.yaml)：三种制作对象字段的唯一来源。
- [作者风格决定](../../assets/default/STYLE.md)：效果和发出方的出图约束。
- [Three.js ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html)、[色彩管理](https://threejs.org/manual/pages/color-management.html)：着色器与线性合成；不替代 r186 浏览器实跑。

## 本文新增术语/约定

`composition.json` 是展开原料元数据的派生文件，不能回填为第二份 YAML 真值。
`directional_mask` 见 design/23 §6.1；不新增玩法 ID。旧 `keyframes.json`、
`animation.json` 已退出当前交付；`quality.json`
仍可由切帧质检生成。测试夹具只画抽象像素块，不是候选素材。

## 待决事项 / 依赖

- 已解决：两段式 CLI 由旧 Python 动画合成与 Canvas 播放改为 Three.js 管线，见本目录脚本及 VFX-three 报告；不把检查通过视为素材批准。
- **（待实测）** 正式素材白边、根宽、掌面与连续性；默认仍采用 design/23 的 8 px 边框残留 0、白边 ≤1%、重建误差 ≤2/255，三底与色损须人工检查，不以测试夹具通过代替审批。
- **（待实测）** 主力手机、中端 Android、iPad、Safari 和真实大画幅的播放/内存；默认 PNG + HTML 必需，可选动画 none。新增 GPU 线性目标的 8 位回退精度须一并检查。
- 旧实现补充已解决：关键帧重新渲染对拍退出当前流程（不再烘帧）；保留含双线性边缘的越界检测、不设整图降级、诊断文件不进入制作 schema。本文已同步 design/23 指定章节。
- VFX-O01～08 继续沿用 design/23 的默认值，追加 O09 原料/手部审批；帧数与连续性、金光背景、六脉左右手/颜色、人物挂点与最终手部画法仍待相应验收，不提出新玩法参数。
- 固定 CDN 可达性**（待核实）**；Three.js ESM 可能请求同包 core 分块，HTML 单条显式外链不代表运行时仅一条网络请求，交协调者检查依赖链。
