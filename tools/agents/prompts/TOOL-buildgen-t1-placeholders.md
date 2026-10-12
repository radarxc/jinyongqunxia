# 本任务：城镇 3D 古建 · 程序化占位贴图（每套件 16 层 + 道具 8 层，真实尺度、可复现）与按档条带

**第一个动作**：打开 `docs/tech/16-town-3d-spec.md` §12（贴图层表、尺寸、流程）与 §7（写实古风清单里关于贴图尺度的条目），再看 `assets/README.md`（manifest 字段）；读完直接动手，不要先写计划。

本任务写离线 Python 工具与它产出的图片素材。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景
作者 AR-114（2026-10-10）：城镇建筑由代码生成 3D 古建。正式贴图要等作者看过体量闸门 A 之后，由出图线用 Gemini 画（同一槽位替换）。在那之前，建筑层和实验页需要**同尺寸、同槽位、真实尺度**的程序化占位贴图，让体量 / 比例 / 光照先能评审，且"缺图用同尺寸占位，正式图到位后无需改代码"（CLAUDE.md 素材接入）。

## 要做的事
1. `tools/buildgen/common.py`：确定性随机（固定种子，按 `kit/layer` 派生）、噪声（值噪声 / 分形，numpy 实现）、可平铺（四边无缝：在环面上采样噪声或做半移位融合）、写 PNG（Pillow）。
2. `tools/buildgen/make_placeholder_layers.py`：按 tech/16 §12.1 表为 `song_dali`、`xiyu` 各生成 16 层、`props` 生成 8 层，**母版 1024²，每张恰覆盖该层的 `repeatM`**，图案按真实尺度：
   - 瓦（tile_roof）：瓦距 230 mm（2.0 m 一张 ≈ 8.7 列）的仰合瓦条纹 + 微弱块面；脊瓦、望板（椽条间距约 230）、漆木 / 原木（木纹方向沿 u）、白灰墙 / 土坯抹面（低频斑驳 + 墙脚可留给 AO，不在贴图里画阴影）、毛石（不规则块 300–500）、条石（400×200 砌缝）、青砖（宋砖约 410×200×80 的顺砌缝）、格扇（直棂 / 方格，间距 60–80）、门板（竖板 200–250）、地砖（400–600 方砖）、木地板（板宽 200）、彩画带、布棚（经纬纹）；xiyu：泥顶、女儿墙压顶、椽底、雕木、原木、赭泥墙、白灰泥墙、烧砖、土坯砖（400×200×100）、晾房花砖墙（镂空棋盘）、木花格、雕门、土地面、毡毯（几何纹）、穹顶灰（唐式变体不用，照出以占槽）、帆布棚；props：家具木、粗木、釉陶、铁、布匹、书页、草编、药屉。
   - 颜色取 tech/16 §4.3 套件 `palette` 的基色（大理木 #6e4b39、灰泥 #e3dccb、瓦 #55585b、石 #8d877c；xiyu 用赭黄泥色系），**平光、无透视、无投影、无文字**。
3. `tools/buildgen/build_layer_strips.py`：把每套件 16 层拼成按档条带——高 / 极致 512² 层（512 × 8192 WebP）、低 / 中 256² 层（256 × 4096 WebP）；props 恒 256²（256 × 2048）；`--check` 校验条带尺寸、层数、顺序与 manifest 一致。
4. 产物放 `assets/default/buildkit/{song_dali,xiyu,props}/`：母版 `layers/<id>.png`、条带 `strip_512.webp` / `strip_256.webp`、`manifest.yaml`（按 `assets/README.md` 字段，`status: candidate`、`tool: procedural`、记 sha256 与生成命令）。
5. 测试 `tools/buildgen/tests/test_layers.py`（`python3 -m unittest`）：两次运行逐文件 sha256 相同；每张母版四边接缝 ΔE（CIEDE2000，近似实现即可）< 2；FFT 主周期与设计尺度（如瓦 2.0 m / 8.7 列）偏差 ≤ 3%；条带尺寸正确。

## 约束
- 只写：`tools/buildgen/{common.py,make_placeholder_layers.py,build_layer_strips.py}`、`tools/buildgen/tests/test_layers.py`、`assets/default/buildkit/{song_dali,xiyu,props}/**` 与本任务报告。不改其他 `assets/default/**` 既有文件。
- 只用 Python 标准库 + 仓库已在用的 Pillow / numpy（先 `grep -rn "import numpy\|from PIL" tools | head` 确认）；不联网、不调用任何出图服务；单个母版 PNG ≤ 2 MB，条带 WebP 质量约 85。

检查：
- `python3 tools/buildgen/make_placeholder_layers.py --all`
- `python3 tools/buildgen/build_layer_strips.py --all --check`
- `python3 -m unittest discover -s tools/buildgen/tests -p "test_*.py"`

## 报告
`tools/agents/reports/TOOL-buildgen-t1-placeholders.md`（≤ 50 行）：第 3 节列每层的尺度依据与 FFT 实测周期、接缝 ΔE；第 7 节写给建筑层（r9）与出图线的交接：条带文件路径与层下标、正式图替换时要保持的尺寸与对齐约定。
