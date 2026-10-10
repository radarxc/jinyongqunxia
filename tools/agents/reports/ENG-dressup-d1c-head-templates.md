# ENG-dressup-d1c-head-templates 报告 · 3D 纸娃娃换装 · D1c · 头按体型出变体（Claude 直接实现，AR-110）

## 1. 摘要
作者反馈 tall 体型脖子一圈黑带。原因：D1b 只有 medium 头，页面找不到 tall 头就退回 medium 那颗，切口对不上。按体型各拼一份时 tall / small 首跑不过，查明五个根因并修复（第 3 节）。现在三个体型的 V4 门禁全过，各 45 项检查（level draft）：medium 为主体型，tall / small 作为变体写入同一目录，manifest `fits` 登记三体型。运行时实拍 tall / small，黑带消失、接缝连续。未花点数，不改运行时、构建和 validate 阈值。

## 2. 产出
- `cut_head.py`：碎三角保流形消去 `remove_slivers`（针形并点、帽形翻边、边界帽形删除）；遮罩平面以下保留模板原三角（先沿平面切开，只细分平面以上）；顶带内收按真实距离梯度折算步长；重叠带权重按几何口径复制；`SKIRT_ROOM_MM` 取 0.7；体型变体命名与 manifest 合并 / 撤下（`output_names` / `_write_manifest` / `_drop_variant`）；validate 的整身 holes 预览不留在资产目录。
- `tests_head.py`（15 个用例）：新增碎三角保流形回归（直接删会开洞，新做法仍一圈边界、面积与逐角 UV 不变）；合成端到端追加第二体型（后缀命名、主体型字节不变、manifest 合并与撤下）；真实素材对 manifest 每个体型逐一复算（73 帧外露、标准 penetration、两端 G1、底带外移、文件摘要）。
- `shoot_head.mjs`：加 `--template`，先在页面切体型；头目录有 `head.<模板>.glb` + `fit.<模板>.json` 时优先使用（与运行时按体型选头一致）。
- `heads/npc_huangrong/`：三体型 × {head / fit / report / hidemask / preview / self_check_preview}；manifest 登记 18 个文件摘要。

## 3. 关键结论与数值
- **根因 1：碎三角直接删除会开洞**（G1 80.5° / 90.0°，鼓包 5.53 / 4.84 mm）。tall 颈片有 73 个碎条（最小高 < 0.02 mm），全是裁切 / 细分出来的；删掉后留下 5 个 4–6 点小洞和两道零宽裂缝（下探到切口下 5.5 mm），small 有 3 个洞，medium 的碎条都在边界上所以没出事。洞边被当成侧开口钉在模板原位（半径 53 mm，头皮 35 mm），顶出鼓包。修复后只剩上下两圈边界，碎条 0（tall 并点 40、翻边 5、删 1）。
- **根因 2：G1 裙带余量不足**（5.6–6.1°）。tall / small 切口在环上 18 / 19 mm（medium 24 mm），左后方 212–218° 头颈斜率 −0.25。扫描余量 0.5 / 0.7 / 0.8 / 0.9：取 0.7 时三体型 G1 3.37–4.05°、鼓包 ≤ 0.60 mm；0.8 起 medium 过渡区鼓包超过 1 mm。
- **根因 3：底带权重被截断**（run 压进身体 0.23 / 0.20 mm）。最深点在下沿裁切线上，插值权重带 5 根骨骼（含 Head 0.019），截成 4 根后 run 帧偏 0.87 mm。拆开看：插值权重 LBS 只差 0.04 mm，外移量保持 0.28 mm，偏差全部来自截断。修复后遮罩平面以下只剩模板原顶点，run 最小值 ≥ +0.263 mm。
- **根因 4：顶带内收步长偏小**（bind 只压到 0.186 mm）。最近点落在面角附近时，插值法向与真实梯度差约 50°，每轮只走需要量的 1/4。修复后三体型 bind 均为 −0.300 mm。
- **根因 5：重叠带权重漏复制**（run 外露 0.109 / 0.105 mm）。过渡区边缘 304° 被粗网格判成"无皮肤"，那里的点比头皮三角插值少 0.011 的 Head 权重。修复后 73 帧最大外露 ≤ −0.192 mm。

| 项 | medium | tall | small |
|---|---|---|---|
| 顶点 / 三角 | 16,283 / 27,924 | 15,984 / 27,320 | 16,194 / 27,703 |
| 双调和残差 / 完整流程耗时 | 2.5e-8 mu / 197,552 ms | 9e-9 mu / 196,892 ms | 5e-9 mu / 224,906 ms |
| G1 顶 / 底，鼓包 | 3.37° / 0.70°，0.47 mm | 4.05° / 1.15°，0.60 mm | 3.58° / 1.16°，0.56 mm |
| ΔE p95 顶 / 底 | 1.37 / 0.85 | 1.42 / 0.68 | 1.40 / 0.66 |
| penetration bind / 动作最坏 | 0 / 0.14% | 0 / 0 | 0 / 0.14% |
| 顶带 bind / 73 帧最大，底带最小 | −0.300 / −0.203，+0.271 mm | −0.300 / −0.198，+0.263 mm | −0.300 / −0.192，+0.266 mm |

锚点：三个头的 65 个关节顺序与对应模板一致，inverseBindMatrices 原始字节相等（独立读 GLB 核对）。holes 只报，三体型 ≤ 0.13%。截图在 `.agents/coord/_dressup/shots_w0/d1c/`：
- `compare_tall_medium_vs_tall.jpg`：旧 medium 头有黑带，新 tall 头没有；
- `medium.jpg` / `tall.jpg` / `small.jpg`：当前产物在各自体型上 bind / idle / run × 6 机位（正面、左右侧颈、后颈、后颈裁切、全身），均无黑带、碎片或鼓圈。

## 4. 开放问题（附默认值）
- 模板 neckRing 不在颈表面上（D1 遗留）：沿用实际截面口径，不改模板。
- run 帧发片甩进后颈，属于源发片问题；过渡列只报（D1b 裁定 6）。

## 5. 对基准的修改提案
- D1c-P1：P5 头一律三体型都出（medium 先，tall / small 后），`fits` 齐全才算交付。理由：缺体型时运行时会退回别的体型，切口必然对不上。

## 6. 需同步到其他文档
- `docs/tech/12` §2 P5 A1：改为三体型各跑一次 `cut_head.py`，命令见第 7 节。

## 7. 自检与 P5 交接
- ✅ 三体型 45 项 × 3 全过；`tests_head.py` 15/15、`selftest.py` 通过；`pnpm install --frozen-lockfile`、`pnpm check` 由 supervise 校验。运行时实拍三体型，接缝连续无黑带。
- P5 命令：
  1. `cut_head.py --source <model_rig.glb> --template templates/tpl_f_medium --id <npc> --out heads/<npc>`（主体型）；
  2. 同一命令换成 `tpl_f_tall`、`tpl_f_small` 各跑一次，自动加后缀并登记 `fits`；
  3. `shoot_head.mjs --template tpl_f_tall --head before=<旧> --head after=heads/<npc> ...` 截图验收，small 同理。
