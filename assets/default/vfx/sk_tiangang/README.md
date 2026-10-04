# 天罡北斗阵 · 五招特效候选

| 项 | 内容 |
|---|---|
| 归属 | `design/23` 制作管线的单门资产实例；素材元数据归本目录 manifest |
| 上游 | 作者本任务要求；`docs/design/catalog/skills-daojia.md` §2 的 `sk_tiangang` 卡；AR-16；`design/23` §2–§6 |
| 引用而不重定义 | 招式、阵员、援护与追击归图鉴 / design/05、09、21；画面不推导命中格、伤害或行动次数 |
| 标注约定 | 造型（原创扩展）；原著细节（待考）；CDN（待核实）；浏览器 / 真机（待实测）；画幅、长度与节奏【建议值】 |

## 结论先行（TL;DR）

三张内置 `image_gen` 原料，每张四帧，分别为家族星链、归一汇聚、合围环弧。
三记普通招共用家族图，两记绝招各用独立图；全部 `candidate`。
五招都引用 `../emitters/palm/emitter-plate.yaml`，共享 PNG / YAML 不复制、不修改。
五招均无 `projection:true`；独立掌图表现阵意，不能据效果离掌的画法把招式改成外放。

## 1. 造型与原著边界

本门名称、全真阵法与北斗七星意象来自道家图鉴的原著概述；本轮没有逐字核对小说。
三联 / 广州修订版《射雕英雄传》全真七子围斗黄药师段落中的星位对应，以及《神雕侠侣》全真弟子布阵细节均（待考），不编造引文和回目。
未取得原著中阵法发出赤光、星结或气束的颜色 / 轮廓描写，故统一按本门 `yang` 取阳赤倾向 `#D9483B`（原创扩展）。
具体视觉全部为招名与阵意的原创扩展：

| 效果套 | 可见造型 | 复用 |
|---|---|---|
| `family` | 宽根赤墨接弯折斗柄星链；六个独立星结与根部聚气区共同表达七位意象 | 布阵、斗柄回旋、天枢镇守 |
| `mv_tiangang_guiyi` | 多股带星结的赤色气流归拢为一个前端 | 天罡归一 |
| `mv_tiangang_hewei` | 七个主要星结围成空心弧环，前沿内收 | 七星合围 |

星结、细流与根部均为图像造型，不分别对应实际阵员、虚位、追击或伤害段。
归一原料没有严格限定七根流线；当前默认接受汇聚意象，不声称是七人逐位实景。
图鉴已经把“天罡归一”命名标为原创扩展；其余游戏招式的可视化也不冒称原著原招画法。

## 2. 原料、切帧与锚点

每套 `source_sheet.png` 都是入选工具原件的逐字节副本，完整实发提示词为同目录 `prompt.txt` 与 `prompt_edit.txt`，来源在 `generation.json`。
每套均为两候选选第二张：首次生成后用 image_gen 定向编辑近白星心为赤色墨结，解决深底抠空；首次原件路径与淘汰原因保留在生成记录。
`1536×1024 → 2×2 格 → 4×768×512`，共 `3×4=12` 张 straight RGBA；未生成第三候选。
矩形依次为 `[0,0,768,512]`、`[768,0,768,512]`、`[0,512,768,512]`、`[768,512,768,512]`。
使用现有 `cut_frames.py` 的 `white_key`、白阈值 250、全保留差值 163、`dewhite:true`、`epsilon=1/255`。
初试差值 64 在黑底偏粉白，最终提高至基线已有的 163，保留原图和墨丝，不做腐蚀、补画或裁掉散点。

| 套 | 各帧根部锚点 | 峰值参考前端 / 长度 | 根宽 |
|---|---|---|---:|
| family | `[120,246] [120,247] [120,239] [120,239]` | 前端星结 x=664；`664−120=544 px` | `351−135+1=217 px` |
| guiyi | `[120,243] [120,246] [120,235] [120,237]` | 前端星结 x=650；`650−120=530 px` | `364−70+1=295 px` |
| hewei | `[120,238] [120,236] [120,237] [120,236]` | 前端星结 x=700；`700−120=580 px` | `372−76+1=297 px` |

锚点 y 取原图根区 `x=105..135, y=80..419` 的 `(255−G)` 加权重心后四舍五入；x=120 为人工选定的掌面连接截面。
根宽取最终峰值帧 x=120 列 `alpha≥128` 的最上 / 最下像素包络（含内部飞白）；参考长量至主体前端，不把散点当作射程。
原图根部 y 漂移最大 11 px，超过 design/23 的 2 px 原料建议；逐帧锚点已校正定位，真实播放连续性仍（待实测）。
峰值第三帧相位：家族 `5/12`、两绝招 `7/18`；其他相位为 `0,0.2,1`。末帧仍有余韵，由包络在终点清零。
每套保留黑 / 灰 / 白三底联系表与 `quality.json`；量化门槛及算法只引用 design/23 §2.3–2.4。

## 3. 五招合成参数

共同【建议值】：画幅 `1536×1024`、纸底 `#EFE6D2`、E=`[650,540]`、方向 `[1,0]`、θ=`0°`、标尺 `320 px/hex`。
共享掌图缩放 `0.6`，发出截面 `320×0.6=192 px`；`scale=[1,1]`，效果采用 normal 混合。
依 design/23 §4.1：`sx=L/reference_length`，`sy=192/root_width`；手部变换独立，效果根部严格映射至 E。

| 招式 | 绝招 / 外放 | 图鉴目标范围 | range_hex | length_px 与核算 | 节奏 |
|---|---|---|---:|---|---|
| 布阵 | 否 / 否 | 友方 r3 | 0 | `320=1×320`，掌面局部图 | pulse / 0.60 s |
| 斗柄回旋 | 否 / 否 | 友方 r3 | 0 | `360=1.125×320`，掌面局部图 | pulse / 0.60 s |
| 天罡归一 | 是 / 否 | 单体 1–2 格 | 2 | `640=2×320`，2 格基线示意 | wave / 0.90 s |
| 七星合围 | 是 / 否 | 单体 1 格 | 1 | `320=1×320`，1 格基线示意 | wave / 0.90 s |
| 天枢镇守 | 否 / 否 | 自身 | 0 | `280=0.875×320`，掌面局部图 | pulse / 0.60 s |

三个功能 / 架势招的 `range_hex=0` 是施展者局部基线，正长度仅给素材显示；不把友方 r3 缩成一格，不改变援护范围。
两绝招按卡片基础单体距离给演示长度，均无外放展幅档；不创建 `projectionSpreadSteps` 或虚构已解算诊断值。
普通 `0.10+0.15+0.25+0.10=0.60 s`，绝招 `0.15+0.20+0.40+0.15=0.90 s`；峰值 `(c+r)/T=5/12,7/18`。
均 crossfade、根部缩放起值 0.95、漂移 0、方向遮罩软带 0.08；循环间隔 0.4 s，仅供观看，不转换 CT。
正式战斗按 design/23 §4.2 从实际挂点与目标求长度和角度，支援事件按已解算阵员安排；本套不实现完整多人站位。

## 4. 复现与验收

在仓库根运行；下列循环只写本套件，`--root` 扩到共享 vfx 根以解析共用掌图。

```sh
for s in family mv_tiangang_guiyi mv_tiangang_hewei; do
  python3 tools/vfx/cut_frames.py --config assets/default/vfx/sk_tiangang/effect/$s/effect-set.yaml --output assets/default/vfx/sk_tiangang/effect/$s/effect-set.yaml --root assets/default/vfx --preview
done
for m in buzhen doubing guiyi hewei tianshu; do
  python3 tools/vfx/compose.py assets/default/vfx/sk_tiangang/moves/mv_tiangang_$m/composition.yaml --root assets/default/vfx
  python3 tools/vfx/build_demo.py assets/default/vfx/sk_tiangang/moves/mv_tiangang_$m/composition.yaml --root assets/default/vfx
done
python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_tiangang --catalog docs/design/catalog/skills-daojia.md
python3 tools/agents/check_assets.py assets/default/vfx/sk_tiangang --min 1 --max 60 --min-side 256
python3 tools/lint/check_ids.py --strict
```

重建改变文件后需刷新 manifest 的哈希。校验记录在 `verification.json` 和 `checks/`；打包尺寸 / 无损 WebP 展示比例在 `build-results.jsonl`。
演示仅有仓库指定的 Three.js r186 importmap 外链，其他内容内嵌；浏览器、CDN 和真机未实跑。

## 参考资料

- `docs/design/catalog/skills-daojia.md` 第 248–284 行：本门卡片与五招；原著描述仅转引此处。
- `docs/decisions/author-requirements.md` AR-16、`rulings-v1.md` C13：逐招外放与阵法边界。
- `docs/design/23-projection-vfx-pipeline.md` §2–§6、`assets/default/STYLE.md`、`tools/vfx/README.md`：制作依据。

## 本文新增术语/约定

无新增玩法 ID。manifest 登记 3 个原料素材 ID、5 个招式素材 ID；EffectSet 与 Composition 的 asset_id 与对应条目一致。

## 待决事项 / 依赖

- 作者审美：默认沿用阳赤水墨、斗柄星链 / 归一星流 / 合围环弧，保持 candidate；星结数量不作实际人数 UI。
- 已解决：第一候选近白星心在黑底透出小孔；三套第二候选改为赤色墨结，见 §2 与生成记录，未用代码补画。
- 原著考据：默认只引用图鉴，赤色、气流与星结视为原创扩展，待核对段落见 §1。
- 原料留白：8 px 边框指标为 0，但少量飞墨距格边不足 32 px 建议值；默认保留原件，最终合成全帧边界另检。
- 根部漂移与播放：默认逐帧锚点补偿 + crossfade；不把静态自检视为连续播放或真机验收。
- 共享掌图与绑定：本任务指定 palm 优先；现有 bindings 对本门仍为 unknown / sword，交协调者同步，未改上游。
- 已知工具文案：demo 标题 / aria-label 固定写“外放”，不适合本门；默认保留脚本产物并登记问题，不修改工具。
- 对基准无修改提案；不改阵员门槛、追击数量、阴阳或任何战斗数值。
