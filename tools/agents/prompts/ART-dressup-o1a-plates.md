# 本任务：3D 纸娃娃换装 · 方案 1 试点 · O1a · 黄蓉 / 穆念慈超高清整人素体图 + 同画布出场服装图（不调用 Tripo、不花点）

只改负责的文件；不执行改变仓库状态的 git 命令；报告如实。先读根 `CLAUDE.md`、`assets/README.md`、`assets/default/prompts/characters/GUIDE.md`、`docs/tech/12-dressup-production.md`（§1、§2 P1 / P2）、`assets/default/character/female/ch02/threeview/manifest.yaml` 里黄蓉 / 穆念慈已有条目的写法。

## 作者要求（2026-10-10）
1. 「方案1是指，用超高清图生成每个角色的整体素体图（和主角素体图一样，但是是角色的脸和身体）。不是单独弄个更清晰的头。」
2. 「方案一做一下黄蓉和穆念慈（穆念慈和黄蓉都要补一下出场服装物品）。最后比较两个方案渲染结果。」

## 背景
- 现行方案 2 是"拼头"：角色头切下来装到主角素体模板上（D2 / D2b / D2c）。方案 1 是每个主要角色一整个人（本人脸 + 本人身体 + 本人头发）直接作 Tripo 输入，整人建模、不拼头。本任务只做 Tripo 输入图；Tripo 生成、模板化、衣物抽取与对比另起任务。
- 主角素体底图 `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose_narrow.png`（1024×1536）与穆念慈现有素体图 `ch02/threeview/por_npc_munianci__ch02_youth_base_body_apose.png`（1024×1536，D2 拼头用过）是画面口径的样板：A 字站姿、双臂外展约 25°、肤色抹胸 + 三角裤、浅暖灰平涂背景、全身居中、头脚留白。现有图分辨率不够，Tripo 出来的脸不清楚——这正是作者要"超高清"的原因。
- 主角穿衣图 `ch00/threeview/por_npc_zhujue__ch00_f_dressup_eq_jinzhuang_front.png` 是"同画布衣图"的样板：与素体图同画布、同姿势、同脸，只多了衣服，供 Tripo 生成穿衣整身后与素体对减抽出衣物。

## 要做的事
1. **核原著**：出图前查《射雕英雄传》原文定两人年龄、发式、饰物与出场服装（黄蓉第八回以女装出场的白衣、束发金带；穆念慈比武招亲时的红衣及发饰等），写进报告；与项目已定稿立绘（黄蓉 `ch02/por_npc_huangrong__ch02_youth_bangzhu_base.png`、穆念慈 `ch02/por_npc_munianci__ch02_youth_base.png`）冲突时以立绘的脸为准、服装以原著为准。女性神态浅笑不露齿，忌 AI 脸。
2. **整人素体图（每人 1 张）**：本人脸、本人发型（不是光头）、本人体态（按原著年龄，不幼态），其余口径同主角素体图。
3. **同画布出场服装图（每人 1 张）**：与第 2 步同一张脸、同一姿势、同一画布对齐（头顶、脚底、手臂角度、脸部轮廓一致，可用 `tools/model3d/dressup/check_plate.py --plate <素体图> --image <衣图> --overlay ...` 量），只多出场服装与鞋。衣服轮廓按"便于绑骨与抽取"收窄：袖口收在腕部、裙摆不超过肩宽或露鞋尖、无飘带披帛。
4. **超高清**：四张图都要 ≥ 2048×3072（2:3），脸部五官在原尺寸下清楚可辨（脸高至少 250 px）。出图通道用本机 `agy` CLI（见 memory 口径：`agy --model gemini-3.1-pro-high --sandbox --dangerously-skip-permissions --print-timeout 540s -p="$(cat prompt.txt)"`，在只放参考图的草稿目录里跑；原生约 848×1264）。先试能否直接出高分辨率；不能就"整图高清化 + 头部细节"：用同一图像模型对整图做放大重绘（保持构图、脸与比例不变），必要时对头部区域另出同脸高分辨率特写、羽化合成回整图——最终仍是一张完整的整人图。禁止只做插值放大冒充超高清；每一步保留中间件与提示词。
5. 交付到 `assets/default/character/female/ch02/threeview/`：`por_npc_huangrong__ch02_youth_base_body_apose_uhd.png`、`por_npc_munianci__ch02_youth_base_body_apose_uhd.png`、`por_npc_huangrong__ch02_youth_dressup_baiyi_front_uhd.png`、`por_npc_munianci__ch02_youth_dressup_hongyi_front_uhd.png`；同目录 `manifest.yaml` 各加一条（字段照已有条目：subject / prompt / negative / references（路径 + sha256）/ tool / model / created / size / sha256 / status: candidate / notes）。

## 约束
- 只写上面四张图、`ch02/threeview/manifest.yaml` 与本任务报告；不改其他素材；不调用 Tripo、不花点；对外请求不带作者邮箱等个人信息。
- 中间件、废片放系统临时目录，不进仓库。

检查：
- 四张图存在、尺寸 ≥ 2048×3072 且 2:3、衣图与对应素体图同尺寸
- `manifest.yaml` 可解析，四条目的 sha256 与文件一致
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/ART-dressup-o1a-plates.md`（≤ 40 行）：原著依据与服装定稿、出图通道与高清化做法（实测原生分辨率、放大方式、头部是否合成）、四张图尺寸与脸高、`check_plate` 对齐结果（衣图对素体图）、废片数与原因、给 O1b（Tripo）的输入建议。

## 协调者补充（2026-10-10 20:10，执行完成后、送审前）
1. **作者追加要求**（10-10 答复 Tripo 预算时）：「黄蓉、穆念慈要根据描述生成不同身高比例的素体。」按原著定目标身高与体型比例，两人必须明显不同；画面仍同画布口径（头顶、脚底对齐），身高差在 3D 环节按目标身高缩放。比例差允许用平滑几何调整得到，但同一映射必须同时作用于衣图（衣图与素体是同一身体），参数写进 manifest notes。
2. 身体表层源自主角底板编辑可以接受：作者要的是"本人脸 + 本人身体比例"，验收看比例、肌肉线条与脸是否按人区分，不要求身体从零重画。
3. 额度用尽后对穆念慈耳下两缕细发做的局部代码修补（相邻背景色填补，几百像素）可以接受，须在报告与 manifest 披露；其余像素须为模型生成 + 配准合成。
4. 黄蓉"金带束发"按 AR-97（发饰不烘焙进人体）不画进图，报告注明另作 P1 头饰。
5. 穆念慈 `check_plate` 的 `hips_ratio_delta` 0.039 是长裙遮住裆部、工具退回 54% 代理行所致，以轮廓叠加图核对为准，不算错位。
