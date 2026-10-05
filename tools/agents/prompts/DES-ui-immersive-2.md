# 本任务：设计 · 沉浸式界面样稿第二版：去框去黑底、换用 codex 武侠图标、银两图标与中文数值、整体更武侠（作者 AR-48）

本任务改设计文档与静态样稿，不写游戏代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/decisions/author-requirements.md` 的 **AR-48**（作者原话与协调者口径）、AR-43；
- `docs/design/26-immersive-ui.md`（第一版，DES-ui-immersive 761c6b83）、`docs/design/catalog/ui-art-kit.md`；
- 现有样稿 `docs/design/ui-mock/`（index.html、ASSETS.md、README.md、img/）与报告 `tools/agents/reports/DES-ui-immersive.md`；
- 图标成品 `assets/default/ui/icons/`（ART-ui-icons 产出，含 manifest.yaml）。

## 作者要求（AR-48，逐字）

> 不要有框和黑色背景（图1）
> 下面不要有框和黑色背景，图标要专门用codex画一套符合游戏主题的出来，现在图标太素了
> 银两用图标，值用中文码字
>
> 整体再优化一波，要符合武侠风

图 1 是大地图地名标签「张掖 / 洛阳」的方框深色底；图 2 是底部工具栏。

## 要做的事

1. **去框去黑底**：地名标签、底部工具栏、行路笺、队伍卡等叠层，一律不用方框和深色底板。改用以下手法，任选、可组合：
   - 墨迹、晕染笔触；
   - 题签、竖排签条；
   - 朱印；
   - 让图标或文字直接浮在画面上，靠描边、投影或留白保证可读。
   在 design/26 对应小节写明每类叠层的做法与可读性保障（对比度、最小字号）。
2. **图标**：工具栏和各页面的图标全部换成 `assets/default/ui/icons/` 的成品。
   - 缩成 webp 放进 `docs/design/ui-mock/img/`，只放样稿用到的，单张 ≤ 40 KB；
   - 在 `ASSETS.md` 记来源 ID；
   - 不改 `assets/default/**`。
3. **银两**：用银两图标，数值写成中文数字，例如「一千二百八十」。在 design/26 定义数字格式规则：
   - 万、千、百、十的读法；
   - 零的写法；
   - 超长时的缩写，例如「三万二千余」。
4. **整体武侠化**：配色、纹样、字体层级、分隔与留白再推一轮，与第一版对比写进报告。古风字体沿用第一版的子集化方案，不新增大字体文件。
5. **两种尺寸**：1280×720 与 390×844 都要好看。样稿里给两种视口的切换或并排；报告附两种尺寸的截图说明（文件放 `ui-mock/img/`）。

## 约束

- 写集：`docs/design/26-immersive-ui.md`、`docs/design/ui-mock/**`、本任务报告。写集外的改动在提交时会被丢弃。
- 样稿总大小 ≤ 4.5 MB；纯静态 HTML / CSS，不引外部 CDN 字体以外的资源。
- 不改 `assets/default/**`、`apps/**`、`packages/**`、`docs/design/catalog/**`。
- 每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `python3 tools/lint/check_ids.py --strict`
- 样稿大小检查（同第一版）

## 报告

第 3 节写：
- 四条要求逐条的落实位置（design/26 小节号、样稿区块）；
- 用到的图标 ID 清单；
- 两种尺寸的检查结果。

第 7 节写交 ENG-ui-* 的实现要点。

报告 ≤ 50 行。

## 补充（协调者 10-03 14:22）

- 「人物」图标是没有五官的半身像。若在样稿里显得怪（例如在工具栏里像空白头像），在报告第 4 节提出来，并给一个替代建议（例如改用印章字「人」或团扇剪影），不要自己改图标文件。
- `ui_status_stagnation`（墨色旋纹）在深底上偏暗：接入时要加描边或底光，保证在深色画面上也看得清；在 design/26 的图标接入小节写明做法。
- 图标成品接入建议见 `tools/agents/reports/ART-ui-icons.md` §6；联系表（128 / 64 / 48 px，深浅底）：`.agents/coord/_handoff/gem/codex_w18/sheets/completed_22.png`。样稿 `img/` 里的图标一律用缩成 webp 的版本，控制体积。
