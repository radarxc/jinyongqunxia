# 本任务：角色部件贴图 · {{set_name}}（`{{set_id}}`）· 三视图分部件出图（AR-22）

本任务出图并登记，不改规格、不改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 作者要求

`docs/decisions/author-requirements.md` **AR-22**：「…行走动画要用代码写出轨迹，分别贴图」——角色各部件各一张贴图，由代码按轨迹摆动；装备覆盖层另由代码从物品图生成，本任务只画**裸身基础部件**（素色中衣中裤、布鞋，作为未装备时的默认外观）。

## 规格与工具

`docs/tech/09-character-rig.md` §1（部件表、枢轴与子关节约定、三视图、ppm 256、z 序、描边烘焙、可 tint 部件）、§6（目录与 manifest）；`tools/rig/make_parts.py`（裁边、定枢轴、写 manifest）、`tools/rig/preview.py`（步态姿势预览条带）。画风：与建筑 / 贴片素材一致的写实古风 2.5D（光源左上、阴影右下、墨线描边清楚、低饱和），参考 `assets/default/prompts/character-{{gender}}.md` 的人物比例与服饰时代感、`docs/tech/07-asset-generation.md` §2.6–§2.7；不用演员 / 具体影视游戏造型。

## 硬规则

- 每张部件图必须由 `image_gen` 生成，manifest `tool` 写 image_gen 与实际模型名；禁止用 Pillow / 代码绘制或合成替代图、禁止素材目录放生成脚本；`image_gen` 不可用就停下来并在报告写明，不得伪造。

## 做法

1. 先出 **三张全身参考图**（前 3/4、后 3/4、左侧；A 字站姿，手臂与躯干分开、双腿分开，透明底真 RGBA，身高 1.70 m 男 / 1.62 m 女 按 256 px/m ≈ 435 / 415 px 高，画布 512×512），确定本套的脸、发式、素色衣着与配色；三张彼此一致。
2. 以该视图的全身参考图为图片输入，**逐部件出图**（规格 §1 的 13 个部件 × 3 视图）：每张只画该部件，部件轴向按规格约定摆正、枢轴位置按约定（四肢顶端中央 / 躯干骨盆点 / 头颈点），其余区域透明；同一套内线条粗细、配色、光照一致；给关节处留 6–10 px 重叠余量以免摆动露缝。
3. 用 `tools/rig/make_parts.py assets/default/rig/{{set_id}}` 裁边、定枢轴、写 manifest；用 `tools/rig/preview.py assets/default/rig/{{set_id}} --out assets/default/rig/{{set_id}}/preview.png` 出姿势条带，`view_image` 看：关节不露缝、比例对、三视图一致；有问题的部件重出（每部件最多 2 次）。
4. 登记：`assets/default/rig/{{set_id}}/manifest.yaml`（规格 §6 字段 + 每张 prompt / sha256 / size / status: candidate / notes）；全身参考图也入库为 `ref_front.png` 等并登记。

约束：不改 `tools/`、不改规格；每次写入 ≤ 150 行；报告 ≤ 100 行。

检查：以下命令必须全部通过。
- `python3 tools/rig/make_parts.py assets/default/rig/{{set_id}} --check`
- `python3 tools/agents/check_assets.py assets/default/rig/{{set_id}} --min 40 --max 48 --min-side 64`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：部件清单（视图 × 部件 × 候选数）；预览条带路径与自检结论；重出过的部件与原因；需作者确认（附默认）。
