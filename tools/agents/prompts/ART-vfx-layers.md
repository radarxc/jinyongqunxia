# 本任务：招式特效演示重做 · 用生成图的图层做动画（默认风格包 `assets/default`）

本任务生成图片图层并写演示代码，不改策划 / 技术文档。上面"规则"一节中关于文档格式的条目不适用；"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"等条目照常适用。

## 背景

两张招式基线图（`assets/default/baseline/vfx/ref_mv_xianglong18_kanglong__ch02_base01.png` 金色龙气、`ref_sk_liumai__ch01_base01.png` 线性剑气）的画面方向作者已接受，但配套的演示代码是用 Canvas 线条手绘的手和龙，作者看后原话：「这个特效看起来太蠢了，跟渲染的图完全不一样」。

新做法：**演示必须直接用生成图本身**。把每张图拆成带透明通道的图层，动画只做图层的显现、发光、流动与消散，不再用代码画任何造型。峰值帧叠起来就是原图。

## 要做的事（两张图各做一遍）

1. **拆图层**（用内置 `image_gen` 的编辑能力，输出透明底 PNG，与原图同尺寸 1536×1024、像素对齐）：
   - `base`：去掉特效后的手 / 袖 / 背景底板（不透明）。
   - 降龙：`dragon_body`（龙身与飞白）、`dragon_head`（龙首）、`palm_glow`（掌面透出的金光）、`flecks`（飞溅金点）；可按需要再拆 1–2 层。
   - 六脉：`beam_1`…`beam_6`（六道剑气各一层，或一张含六道的层 + 每道的遮罩多边形）、`tips`（六个指端凝聚点的光）。
   - 每层都用 PIL 实测：真 RGBA、与原图同尺寸；把所有层按顺序叠在 `base` 上合成，与原图做逐像素比对，平均绝对差写进报告（目标 ≤ 6/255，做不到就说明原因）。
   - 图层存 `assets/default/baseline/vfx/<id>/layers/<layer>.png`；另存一份 ≤1024 px 宽的 WebP（带 alpha，PIL 直接转）供演示内嵌。
2. **路径与锚点数据** `assets/default/baseline/vfx/<id>/layers/layers.json`：每层的绘制顺序、混合模式（`normal` / `lighter`）、动画类型；降龙的龙身脊线折线（从掌面到龙首，用 `view_image` 看图定坐标）；六脉每道剑气的起点（指端）与终点、每个凝聚点坐标。
3. **重写演示 `assets/default/baseline/vfx/<id>/index.html`**：
   - 自包含，把 WebP 图层以 data URI 内嵌；不联网、不用外部资源、不用 storage、不访问父页面；能在 `<iframe sandbox="allow-scripts" srcdoc>` 里运行；单个文件 ≤ 3 MB。
   - Canvas 2D 绘制：先画 `base`，再按 `layers.json` 叠加特效层。**只允许对图层做**：沿路径的渐进显现（移动的渐变遮罩，用 `globalCompositeOperation` 或离屏 canvas 实现）、透明度与亮度脉动、`lighter` 叠加发光、沿路径的轻微位移 / 流动、粒子用 `flecks` 层或从图层里裁的小块。**禁止**用代码画手、龙、剑气等任何造型。
   - 节奏：降龙——掌面先亮 → 龙气从掌面沿脊线显现到龙首 → 龙首凝势、金点飞溅 → 由尾向首消散，循环约 5.6 秒；六脉——指端凝聚 → 六道剑气从指端沿线持续显现（略错开）→ 持续激射带流动 → 收束消散（作者要求"线性的、持续的"）。
   - 保留播放 / 暂停 / 重播、速度滑杆、减少动态时静帧、隐藏时暂停。
   - 峰值帧截图（用离屏 canvas 在代码里导出，或在报告里说明如何核对）应与原图一致。
4. **登记**：manifest 两条的 `code` 路径不变；新增 `layers` 字段列出图层文件与 `layers.json`；`notes` 照录作者原话并写明"演示改为图层动画"。PNG 原图本身**不改**（sha 不变）。
5. **模板** `assets/default/prompts/vfx.md`：把"演示由生成图的图层驱动，不用代码画造型"写成规则，附拆层步骤与质检要点。
6. 每次写入不超过约 150 行，分多次写。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/baseline/vfx --min 1 --max 2`
- `python3 -c "import json,sys; [json.load(open(p)) for p in sys.argv[1:]]" assets/default/baseline/vfx/ref_mv_xianglong18_kanglong__ch02_base01/layers/layers.json assets/default/baseline/vfx/ref_sk_liumai__ch01_base01/layers/layers.json`
- `node --check` 无法直接检查 HTML；把内联脚本抽出来用 `node --check` 验证语法，命令与结果写进报告。

## 报告

第 7 节写：每张图的图层清单与合成比对结果（平均绝对差）；演示文件大小；动画节奏参数；峰值帧与原图的核对方式；需作者审批的事项。
