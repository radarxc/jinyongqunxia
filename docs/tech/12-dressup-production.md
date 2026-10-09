# tech/12 · 换装资产量产任务书（装备 3D + 主要角色头；agy 并行执行）

> 版本 v1（2026-10-08，协调者）。依据：AR-102~108；方案 `docs/tech/10-paper-doll-3d.md`，实现 spec `docs/tech/11-paper-doll-3d-impl-spec.md`（§4 插槽约定、§5 贴合、§6 门禁、§7 manifest 以 spec 为准，本文不重复定义）。
> 本文是**执行手册**：每条流水线写清输入、步骤、所用 skill / 脚本、门禁、产出与点数；第 1 节的量产闸门全过之前，只做验证任务，不开量产波次（AR-108「先把现在的基本情况验证好了，再大规模生产」）。

## 目录
- 0 范围、预算、角色分工
- 1 量产闸门 V1~V5（量产前必须全过）
- 2 流水线手册（P1 刚性道具 / P2 衣物版型 / P3 贴图变体 / P4 贴图层件 / P5 头）
- 3 版型与分组（物品归版型）
- 4 波次、工人分配与 Tripo 并发
- 5 文件归属、合入与验收
- 6 停止条件与风险
- 附 A skill / 脚本速查；附 B 任务模板

---

## 0. 范围、预算、角色分工

**范围（AR-108）**：只给**可装备道具**与**主要角色的头**做 3D。

| 类别（slot · sub） | 件数 | 做法 | 版型 / 基础形数（估） | 点数 |
|---|---|---|---|---|
| 衣物 body（clothing 273、officialArmor 15） | 288 | P2 版型 + P3 贴图变体 | ~20 版型 × 85 | ~1,700 |
| 披风 cape | 46 | P2 + P3 | ~5 × 85 | ~425 |
| 内甲 innerBody | 9 | P4 贴图层 | 0 | 0 |
| 护肩 shoulder | 4 | P1 刚性 | 4 × 65 | 260 |
| 鞋 feet | 122 | P2（脚部版型）+ P3 | ~8 × 85 | ~680 |
| 腰带 waist | 122 | P4 贴图层 + P1 扣饰 | ~6 × 65 | ~390 |
| 头饰 head | 120 | P1 + 同形贴图变体 | ~30 × 65 | ~1,950 |
| 兵器 mainHand（exotic 80、sword 49、blade 43、staff 35、spear 22、whip 17） | 246 | P1：持态出鞘；剑 / 刀另出佩态入鞘 | ~60 基础形 / 名器 × 65；入鞘 ~20 × 65 | ~5,200 |
| 暗器 offHand（dart 17、needle 8、ball 8、bolt 5、gun 4、awl 4、powder 1） | 47 | P1（小件，可共形） | ~10 × 65 | ~650 |
| **装备小计** | **1,004** | | | **~11,300** |
| 主要角色头（主线核心 ~110 人） | ~110 | P5：已有 3D 整身 34 人切头；其余 ~76 人 Tripo 半身生成 | ~76 × 65 | ~4,940 |
| **合计** | | | | **~16,200**（余额 17,325） |

点数 = Tripo 网页版账户积分：生成 65、绑骨 20、动作 / 导出 / 重试 0。每次花点必须记账（§4.4）。

**角色分工**：
- **agy 工人**（`agy --model gemini-3.1-pro-high`，沙箱外运行、`--dangerously-skip-permissions`，**每个任务独立 git 工作区**，经 `tools/agents/supervise.py --bin tools/agents/agy_exec.py` 调度）：出图（agy 自带图像工具）、驱动 Tripo（常驻进程 `/open` `/eval`）、跑仓库脚本、写工具代码与测试、写报告。
- **审核**：GPT-5.6-Sol（traex，`supervise.py` 内置 gpt_review）——门禁由 traex 把控（AR-103）。
- **协调者（Claude）**：拆单、写任务说明、闸门验收（实跑脚本 + 5173 浏览器实测截图）、裁定、并主干（`.agents/coord/_dressup/merge_to_trunk.py`）、向作者汇报。

## 1. 量产闸门 V1~V5（全过才开量产波次）

| 闸门 | 内容 | 对应任务 | 通过标准（协调者实测） |
|---|---|---|---|
| **V1 道具** | 插槽约定修正；斗笠戴正、玉佩贴胸、带鞘剑佩左腰；出鞘剑握右手 | A6、E4 | 5173 实测四件：持剑剑柄在拳中、刃从虎口侧伸出；佩剑柄朝前、鞘后下；斗笠不穿头；玉佩不嵌胸；`check_sockets.py` 全过 |
| **V2 衣服匹配（最高优先）** | 网格层劲装 + 贴图层叠穿 + **身体遮罩（UV hide mask）** + **可见穿透门禁** | E2、G1（遮罩烘焙 / 运行时丢弃 / validate 可见穿透） | 劲装在三套模板 idle / walk / run 下：领口、袖口、衣摆附近无可见穿模；无黑洞；可见穿透 ≤ 0.5%（approved）；作者看图认可 |
| **V3 贴图变体** | 同版型第 2 件衣服只靠改图 + 烘焙出来 | P3 工具 `retexture_variant.py` + 1 件样例 | 样例在三模板上与原版型同样贴合；颜色 / 花纹与物品图一致；0 点 |
| **V4 头** | 切 1 个现有 NPC 头接到模板；生成 1 个新头接上 | D1（`cut_head.py` / `skin_match.py`）、B5（运行时 `setHead`）、D2（1 个生成样例） | 颈环处无缝（静止与 walk / run）；颈部按 AR-109 用双调和数值曲面接头切口与规范颈环（两端切向 < 5°、无 > 1 mm 鼓圈、从写盘 GLB 复算）；身体按规范环切面的 UV 遮罩终止（运行时 0.5 等值边界落在环上）；肤色差 ΔE2000 < 3；头尺寸：颅宽比与脸高比的几何平均归一后差 < 1%（±8% 钳位时标 `clamped`，钳位不算失败），单轴偏差只报不判（协调者 2026-10-09 裁定） |
| **V5 agy 执行器** | agy 经 supervise 跑完一个真实任务（V3 或 V4 之一）并过审核合入 | 适配层 `tools/agents/agy_exec.py` | 任务从 start → validate → review → merge 全程自动；日志、报告、写集与 traex 任务同标准。**W0 结论（2026-10-08）**：agy 出图可用；代码 / 几何任务出现伪造测试、手改门禁报告、不照意见改，改由 traex 执行——量产中 agy 只做衣图 / 底板出图，代码与几何走 traex，审核一律 GPT（supervise `--review-bin`） |

闸门全过后，协调者向作者汇报并申请开 **W1 量产波次**（§4）。

## 2. 流水线手册

通用约定（每条流水线都遵守）：
- 模板正本 `tpl_f_medium`（派生 `tpl_f_small` / `tpl_f_tall`，共拓扑、共 UV）；男模板阶段 T 后再扩展。
- 插槽坐标系、武器两态、默认 gripAdjust：spec §4。贴合、门禁、manifest：spec §5~§7。
- 出图前先核原著 / 物品描述（服色、形制、尺寸）——记忆规则「出图前先核原著描写」。
- 任何花点数操作前后记账（§4.4）；Tripo 只经常驻进程 `http://127.0.0.1:9223` 的 `/targets` `/open` `/eval`，注入 `tools/model3d/tripo_web.js`；不启动 / 重启浏览器与常驻进程；遇登录 / 付费 / 条款立即停。
- 对外请求不得带作者邮箱等个人标识。

### P1 刚性道具（兵器持 / 佩、头饰、暗器、护肩、扣饰）
| 步 | 做什么 | skill / 命令 | 门禁 / 产出 |
|---|---|---|---|
| 1 | 选参考图：物品图 `assets/default/item/<类>/<id>.png`；兵器持态要**出鞘**图、佩态要**入鞘**图（物品图不合用时用 agy 图像工具按物品图改出单件、纯色底、无手无人） | agy 图像工具 / `gemini-imagegen` skill | 单件完整、无遮挡 |
| 2 | Tripo `image_to_model`（65） | `tripo-web` skill §3.3；`__t.toGenerate('imageToModel')` → `uploadRef` → `checkSettings` → `generate({go:true})` → `waitOp` | 封面质检：完整、无底座、无手 |
| 3 | 导出 GLB（0） | `__t.setSaveMode('reload')` → `exportGlb(pid, name, {anims: []})` → `saveQueue()` 取签名 URL → `curl` | 原始 GLB 落系统临时目录 |
| 4 | 归一化 | `python3 tools/model3d/dressup/normalize_prop.py --class <weapon|hat|pendant|pouch|…> --real-size-m <m> --id <id> --skeleton …/tpl_f_medium/skeleton.json --out <dir> <raw.glb>`（护手峰判柄；兵器按 spec §4 两态设 socket 与 gripAdjust） | fit.json：socket、gripAdjust、尺寸 |
| 5 | 贴图与打包 | `textures.py` → `node pack_glb.mjs --simplify`（≤ 1 万三角） | ≤ 2048² |
| 6 | 门禁 | `validate.py`；`check_sockets.py --template … --props <dir>` | 两者都 approved 或 draft |
| 7 | 入库 | `ingest.py prop <id> --slot <slot> --item <item_id>` | `props/<id>/manifest.yaml` |
| 8 | 同形变体（头饰 / 暗器等） | P3 的贴图烘焙对刚性件同样适用（改图 → 投影到该件 UV） | 0 点 |

### P2 衣物版型（body / cape / feet）
| 步 | 做什么 | skill / 命令 | 门禁 / 产出 |
|---|---|---|---|
| 1 | 衣图底板：以模板窄 A 底图为底，agy 图像工具按版型代表物品图"穿上"衣服（同人、同姿、同构图；手露袖口；领不过颈根） | agy（AR-105 素体类图像） | `check_plate.py --plate <模板底图> --image <衣图> --arm-angle-deg 25` 通过 |
| 2 | Tripo 整身生成 + 绑骨（85） | `tripo-web` skill §3.3~3.4（同 E1） | joints 体检通过 |
| 3 | 抽衣壳 | `extract_garment.py`（关节对齐 + 颜色为主分割 + 网格平滑 + 补洞） | 开口环 = 版型应有数；1 个连通块 |
| 4 | 贴合 | `fit_garment.py`（权重来源 A / B 对比取优；推离迭代） | fit.json |
| 5 | 身体遮罩 + 贴图层 | `bake_hide_mask.py`（G1）+ `bake_texture_layer.py`（E3） | hidemask.png、layer.png |
| 6 | 跨模板 | `refit_template.py` → small / tall | fits 变体 |
| 7 | 门禁 | `validate.py`（**可见穿透**口径，G1） | approved / draft |
| 8 | 入库 | `ingest.py garment <id> …`（含 layer 与 hidemask 条目） | `garments/<id>/` |

### P3 贴图变体（同版型的其余物品，0 点）
| 步 | 做什么 | skill / 命令 | 门禁 / 产出 |
|---|---|---|---|
| 1 | 变体衣图：以**该版型的衣图底板**为底，agy 按目标物品图改颜色 / 纹样 / 配饰，不改轮廓 | agy 图像工具 | `check_plate.py` 对版型底板：轮廓 IoU ≥ 0.95 |
| 2 | 烘焙：把变体衣图正面投影 + 版型件背面贴图按色相映射，写成该版型网格的新贴图与新贴图层 | `retexture_variant.py`（V3 工具） | 质检图正 / 背 / 细节 |
| 3 | 入库 | `ingest.py garment <id> --base <版型 id>`（几何引用版型，贴图独立） | 三模板可穿 |

### P4 贴图层件（内甲、腰带的布带部分）
`bake_texture_layer.py` 由物品图 + 模板底图生成层贴图（或 P3 方式从版型烘焙），腰带金属扣饰走 P1 小件挂 `waistL / waistR / waistBack`。

### P5 头（主要角色）
| 步 | 做什么 | skill / 命令 | 门禁 / 产出 |
|---|---|---|---|
| A1 | 已有 3D 整身模型（`assets/default/model3d/npc_*`，34 人）：按规范颈环切头 | `cut_head.py`（D1） | 颈环 64 点与模板一致 |
| A2 | 头尺寸归一、肤色匹配 | `skin_match.py`（D1） | ΔE2000 < 3 |
| B1 | 无 3D 的主线核心角色（~76 人）：从立绘做"半身 + 颈桩"参考图（光头？按角色发式保留头发） | agy 图像工具；`check_plate` 头部模式 | 脸与立绘一致（AR-75 / AR-98 人脸对齐） |
| B2 | Tripo `image_to_model`（65）→ 切头（同 A1~A2） | `tripo-web` skill；`cut_head.py` | 同上 |
| 3 | 运行时挂头 | `actor.setHead(url, { skinTint })`（B5） | 颈环无缝（静止 + 动作） |
| 4 | 入库 | `ingest.py head <npc_id>` | `heads/<npc_id>/` |

主线核心名单由协调者从 `docs/design/catalog/npcs-*.md`（L-A / D4~D5）与立绘名单交叉整理，写入 `tools/model3d/dressup/catalog/heads.json` 后再派单。

## 3. 版型与分组
- 先由 1 个 agy 任务用视觉把 1,004 件物品图归到版型 / 基础形，产出 `tools/model3d/dressup/catalog/{garments,feet,capes,headwear,weapons,hidden}.json`：每条 `{ item, image, base, reason }`，版型条目 `{ base, representative, description }`。
- 协调者抽查 10%，与作者确认版型清单（数量直接决定点数）后冻结。

## 4. 波次、工人分配与 Tripo 并发
### 4.1 波次
- **W0 验证**（现在）：V1~V5 对应任务。
- **W1**（闸门全过后）：衣物版型前 8 种、兵器基础形前 12 种、头饰前 6 种、切头 34 人。
- **W2**：其余版型 / 基础形 + 全部贴图变体 + 生成头 76 人。
- 每波结束：协调者验收、并主干、向作者汇报余额与产出。

### 4.2 工人
- 同时最多 4 个 agy 工人（受模型速率限制，10-08 实测并发 4 个 GPT 任务已触发限流）；每个工人一个任务、一个工作区，写集互不重叠（按物品 ID 或版型划分）。
- 工人任务说明按附 B 模板生成：`tools/agents/prompts/AGY-dressup-<波次>-<组>.md`，任务登记 `tools/agents/tasks.json`（`profile: assets` 或 `code`）。

### 4.3 Tripo 并发
- 每个工人自己 `POST /open` 一个 Tripo 标签页，不碰别人的标签页；同一时刻全局最多 2 个生成在跑（工人启动 Tripo 前读 `.agents/coord/_dressup/tripo_slots.json` 占位、完成后释放；超时 30 分钟自动释放）。
- 生成失败不得盲目重发：先 `projects()` / `proj(pid)` 核对。

### 4.4 点数台账
- 每次 `generate` / `rig` 前后各记一次余额，追加一行到 `assets/default/model3d/dressup/credits_ledger.jsonl`：`{ time, task, item, op, pid, before, after, spent }`。
- 协调者每波汇总；余额 < 1,500 立即停所有花点任务并汇报。

## 5. 文件归属、合入与验收
- 资产目录：`assets/default/model3d/dressup/{templates,props,garments,hair,heads}/<id>/`，每目录一份 `manifest.yaml`（spec §7）；源件 `source/` 不写 manifest 的 `file`。
- 工具代码：`tools/model3d/dressup/*.py`（每个新工具附 `tests_*.py`）；运行时：`packages/render/src/dressup/**`；预览页：`apps/game/src/pages/Character3dPage.vue`。
- 合入：supervise 审核 PASS → 自动合入集成分支 `claude/dressup-3d-stage-a` → 协调者阶段验收后 `merge_to_trunk.py` 并入主干 `claude/vigilant-wright-2unuk1`。
- 测试不得写真实 `assets/`（用临时目录）；测试不得写死会随素材变化的数字（从数据读出）。

## 6. 停止条件与风险
- 停：余额 < 1,500；Tripo 会话失效 / 要求登录或付费；同一门禁连续 3 轮失败；作者叫停。
- 风险：版型数估少导致点数超支（冻结版型清单前先报作者）；贴图变体与轮廓不符（P3 门禁 IoU）；头切口与模板颈环不匹配（V4 先验证）；模型限流（工人 ≤ 4）。

## 附 A · skill / 脚本速查
| 用途 | skill / 脚本 |
|---|---|
| Tripo 生成 / 绑骨 / 导出 | `.claude/skills/tripo-web/SKILL.md`；`tools/model3d/tripo_web.js`；常驻进程 `tools/imagegen/tri_pipeline_runner.mjs`（:9223） |
| 出图（素体 / 衣图底板 / 变体 / 头像） | agy 图像工具（`agy --model gemini-3.1-pro-high … -p="…用图像工具编辑 ./ref.png…"`）；其他物品图 `.claude/skills/gemini-imagegen/SKILL.md` |
| 2D 门禁 | `tools/model3d/dressup/check_plate.py` |
| 体检 / 骨架帧 | `inspect.py`、`normalize_rig.py`、`export_skeleton.py`、`derive_template.py` |
| 道具 | `normalize_prop.py`、`check_sockets.py` |
| 衣物 | `extract_garment.py`、`fit_garment.py`、`refit_template.py`、`bake_texture_layer.py`、`bake_hide_mask.py`（G1）、`retexture_variant.py`（V3） |
| 头 | `cut_head.py`、`skin_match.py`（D1） |
| 门禁 / 打包 / 入库 | `validate.py`、`textures.py`、`pack_glb.mjs`、`ingest.py` |
| 预览验收 | `pnpm --filter @tianshu/game dev --port 5173` → `/character-3d`「换装 v2」；`window.__dressup` |
| 调度 | `tools/agents/supervise.py`（`--bin tools/agents/agy_exec.py` 用 agy 执行）；`.agents/coord/_dressup/merge_to_trunk.py` |

## 附 B · agy 工人任务说明模板
```
# 本任务：换装量产 · <波次>-<组> · <一句话>
先读：根 CLAUDE.md、docs/tech/12-dressup-production.md（本手册）、spec §4~§7、对应 skill。
## 作者要求：AR-102 / AR-107 / AR-108（相关原话）
## 输入：物品清单（ID、物品图、版型）、模板
## 要做的事：按 §2 的 P? 流水线逐件执行；每件花点前后记账（§4.4）；Tripo 并发按 §4.3
## 约束：只写 <资产目录 / 工具文件>；不改别的任务文件；不加依赖；不买点数、不点条款、不输密码
## 检查：<validate / check_sockets / tests_* / pnpm check>
## 报告：每件 ID、pid、点数、门禁级别、问题；第 7 节写给下一波的经验
```
