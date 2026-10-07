# 本任务：3D 纸娃娃换装 · 阶段 A3 · 刚性道具归一化 normalize_prop.py（武器 / 帽 / 佩饰；AR-102）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0、§3、§5.2、§5.5、§11）、`tools/model3d/dressup/README.md` 与 A1 报告第 7 节（基础库 API）。

## 作者要求
**AR-102** 第 5 条：装备大小自动处理到合适尺寸并与人物结合、手能拿武器——尺度来自真实尺寸表，锚点（握点 / 锥顶 / 绳顶）归原点，主轴归一；不靠手工 offset 常量。

## 规格
spec §5.2：
- `--class weapon|hat|pendant|pouch|fan|scroll|beads|gourd|generic --real-size-m <m> [--size-axis length|width|height] [--flip] [--grip-ratio 0.07] [--keep largest|all] --id <id> --out <dir> [--body <正本>|--skeleton <skeleton.json>] [--json]`。
- 输入是 Tripo 原始 `_raw.glb`（meshopt 压缩，glb_io 自动解压）：AABB 最长边 ≈ 0.98 但**不是**主轴长（剑斜放主轴 1.44），锚点在 AABB 中心，可能多连通块（匕首 + 鞘、香囊 + 穗）。
- 定向：PCA 主轴 → +Y；weapon 柄端由剖面宽度判定（沿主轴分 20 段，窄端 = 柄），握点 = 柄尾起 `gripRatio` × 主长处移到原点，刃面（第二主轴）→ +Z；hat 锥顶 → 原点、开口向 −Y；pendant / pouch 绳顶（y 最高簇质心）→ 原点；fan / scroll / beads / gourd 按 spec 规则或 generic（AABB 中心）。
- 缩放 `scaleApplied = realSizeM / (measuredLengthMu × mPerMu)`，`mPerMu = defaultHeightM / heightMu`：优先读 `--skeleton` 的 `mPerMu`，否则由 `--body` 网格包围盒高与 `--default-height-m 1.65` 算。
- 输出：顶点已变换的 GLB（节点无 TRS、`KHR_materials_unlit`、只留 baseColor 贴图引用、贴图字节原样）+ `fit.json`（spec §5.2 格式，`socket` 默认：weapon → gripR、hat → headTop、pendant / pouch / beads → chest、gourd / fan / scroll → waistL）。

## 要做的事
1. 写 `tools/model3d/dressup/normalize_prop.py`。
2. 实跑三件（输入在主检出 `/Users/bytedance/Projects/jinyongqunxia/apps/game/public/models/props/`，只读）：
   - `item_qingfeng_sword_raw.glb` class weapon realSize 1.0；
   - `item_bamboo_hat_raw.glb` class hat realSize 0.45（size-axis width）；
   - `luxury_jade_pendant_raw.glb` class pendant realSize 0.08。
   输出到 `assets/default/model3d/dressup/props/<id>/`（`<id>.glb` + `fit.json`；manifest 由 A5 的 ingest 写，本任务不写 manifest）。
3. `tools/model3d/dressup/tests_prop.py`：合成"剑"（细长盒 + 宽护手）验证柄端判定、握点归原点、主轴 +Y、缩放；合成"锥"验证 hat 锥顶。

## 约束
- 只写 `tools/model3d/dressup/normalize_prop.py`、`tools/model3d/dressup/tests_prop.py`、`assets/default/model3d/dressup/props/**` 与本任务报告。
- 不改基础库；不加依赖；不写死绝对路径（样例路径只出现在命令行里）。

检查：
- `python3 tools/model3d/dressup/tests_prop.py`
- 三件实跑命令退出 0，且 `fit.json` 的 `anchor` 位置 |pos| < 1e-4、`up` 为 +Y。
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写每件：连通块数、measuredLengthMu、scaleApplied、定向判定依据（柄端剖面宽度曲线、锥顶位置）、输出三角数与文件大小；第 7 节写 B1 运行时消费 `fit.json` 的字段清单。报告 ≤ 80 行。
