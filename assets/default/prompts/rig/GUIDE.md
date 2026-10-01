# 角色分层部件 · 生成与存放规程（给出图 agent；是否现在做由作者定）

在仓库根目录执行；路径都相对仓库根。AR-22（作者 2026-10-01）：角色在地图上行走要反映装备，行走动画用代码写轨迹、分别贴图——所以基础美术只画两个标准体型（男 1.70 m、女 1.62 m）的 **3 个视图 × 13 张源部件 = 每体型 39 张 + 3 张全身参考图**，共 84 份提示词：`rig/<set>/ref_<view>.md`、`rig/<set>/<view>/<part>.md`。规格全在 `docs/tech/09-character-rig.md`（§1 绑定与部件表、§1.3 三视图、§1.4 z 序与描边、§6 目录与 manifest）。

## 1. 先读什么

1. `docs/tech/09-character-rig.md` §1、§6；`docs/tech/07-asset-generation.md` §2.6（头身比）、§2.7（服饰时代感）、§2.9（禁止项）。
2. 人物画风规则：`assets/default/prompts/character-male.md` / `character-female.md` §6–§7（比例、服饰、墨线、低饱和）；画风要与建筑 / 贴片素材一致（写实古风 2.5D、光源左上、阴影右下）。
3. 配色（可换色区域按 tint 槽）：clothPrimary `#6B5141`、clothSecondary `#394C53`、skin `#E9CFB4`、footwear `#332B27`、hair `#211C1A`。

## 2. 顺序（必须先参考图、后部件）

```bash
python3 tools/agents/build_image_index.py --queue --group rig --json   # order=0 的是全身参考图，先做
```

1. 每个体型集先出 3 张全身参考图（`ref_front34` / `ref_back34` / `ref_side`）：A 字站姿、四肢与躯干分开、透明底 512×512、身高按 256 px/m（男 ≈ 435 px、女 ≈ 415 px）。三张必须是同一个人、同一套衣着与配色。
2. 再以**同视图的全身参考图为唯一图片输入**，逐部件出 13 张：只画那一个部件，衣着配色墨线与参考图一致，画布 / pivot / 子关节按各文件 frontmatter（男为 tech/09 §1.2 模板像素，女 ×0.9529），部件轴向竖直，关节两端留 6–10 px 重叠余量。
3. 每张 2 张候选选 1 张；参考图不合格就不要开始出部件。

## 3. 存放与登记

- 参考图：`assets/default/rig/<set>/ref_<view>.png`；部件：`assets/default/rig/<set>/<view>/<part>.png`（`<set>` = `male_std` / `female_std`；`<part>` 严格用 13 个 source key：`head`、`hair_or_headgear`、`torso`、`pelvis_skirt`、`upper_arm_L/R`、`forearm_L/R`、`hand_L/R`、`thigh_shared`、`shin_shared`、`foot_shared`）。
- 透明 RGBA（alpha 同时含 0 与 255），部件外一切像素 alpha=0；不画文字、辅助线、pivot 标记。
- manifest `assets/default/rig/<set>/manifest.yaml`（schema `tianshu-rig.v1`，字段见 tech/09 §6.2）由工具写：
  ```bash
  python3 tools/rig/make_parts.py assets/default/rig/<set>              # 裁边、定枢轴、写 manifest
  python3 tools/rig/make_parts.py assets/default/rig/<set> --check
  python3 tools/rig/preview.py assets/default/rig/<set> --out assets/default/rig/<set>/preview.png   # 姿势条带，看关节不断裂
  python3 tools/agents/check_assets.py assets/default/rig/<set> --min 40 --max 48 --min-side 64
  ```
  手工只补每张的 `prompt` / `tool` / `model` / `source_path` / `status: candidate`，不改 pivot 数值。

## 4. 质检

- 透明底、单一部件、轴向竖直、pivot 位置对；2 px 墨线描边清楚；与同视图参考图衣着一致。
- 预览条带里 walk / run / idle 三行姿势关节处无断裂、无明显错位；有问题先怀疑画布与 pivot 登记，再怀疑图。
- 禁止用代码绘制或裁旧立绘冒充部件图；工具不可用就停下写明。
