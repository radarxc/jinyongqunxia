# ENG-dressup-r1-heads-f2 报告 · 3D 纸娃娃换装 · R1 · 新素体切头（黄蓉 / 穆念慈 × tpl_f2 三体型，--texture 8K）+ 换装页变体只在同一套素体内回退（0 点）
## 1. 摘要（3–6 行）
作者 10-11「六个素体可以，但是换黄蓉头以后有问题」：两个头只按 tpl_f_* 切过，换装页在当前素体找不到变体时取任意一份；tpl_f 的遮罩按旧 UV 烘，套到 tpl_f2 上随机藏三角（黑洞），该藏的光头没藏（互穿）。
页面：变体只在同一套素体（tpl_f / tpl_f2 / tpl_m）内回退；同一套里没有变体的素材不出现，换素体时自动卸下。
切头：黄蓉 / 穆念慈 × tpl_f2_medium / tall / small 六份（`--texture` 8K）全部 `gateLevel: pass`、report `draft`，线性密度 ×2.37 / ×2.00；tpl_f_* 已有产物逐字节不变。
执行中实测出两处工具缺陷，按补充裁定 3–6 修在 `cut_head.py`（门禁不改）：穆念慈收细后切口 G1 单度尖峰（改为先裁后收细）；run 帧切口圈权重硬截断跳变（改为切换角两侧渐隐）。六份都用最终代码重切。0 点。

## 2. 产出（文件、行数、主要章节）
- `tools/model3d/dressup/cut_head.py`（3,187 行，相对基点 +50 / −12）：`apply_neck_fit`（从 `fit_neck_to_template` 抽出的逐点收细公式）；`process_head` 有收细时先在收细前的头上 `clip_head`，再对裁后全部点套同一公式；`truncate_ring_weights` 与 `RING_SWITCH_FADE_DEG = 15`。
- `tools/model3d/dressup/tests_head.py`（1,498 行，+59 / −2，共 32 项）：新增 `test_clip_then_neck_fit_exact_cut_ring`、`test_ring_weights_switch_is_continuous`；legacy 逐字节基线常量未改。
- `heads/npc_huangrong/**`、`heads/npc_munianci/**`：各三份 `head / fit / report / hidemask / preview / self_check_preview .tpl_f2_{medium,tall,small}`；manifest `fits` 登记六个体型（只增，tpl_f_* 记录逐字不变）；`shots/f2.tpl_f2_{medium,tall,small}.jpg`。
- `apps/game/src/pages/useDressupIndex.ts`（+29）：`templateFamily`、`selectDressupVariants`、`restoreDressupEntries`。`Character3dPage.vue`（+11 / −17）：头 / 衣物 / 道具与贴图层都按当前模板选变体；换素体后用 `restoreDressupEntries` 重装；贴图层只留当前套可用的；空列表提示改为"当前素体暂无可用素材"。
- `apps/game/src/pages/useDressupIndex.test.ts`（+50 / −1）：5 项新用例。

## 3. 关键结论与数值
- 六份实测（顶点 / 三角；头缩放；头底；收细最大；接缝色差 p95 下 / 上；ΔE；G1 上 / 下最大；run 顶带外露；密度）：
  黄蓉 medium 16,517 / 28,395；0.921；30 mm；0.95 mm；0.79 / 1.48；0.033；3.45° / 0.72°；−0.201 mm；×2.37。
  黄蓉 tall 16,526 / 28,410；0.921；30 mm；0.86 mm；0.82 / 1.28；0.035；3.56° / 0.80°；−0.203 mm；×2.37。
  黄蓉 small 16,535 / 28,434；0.921；30 mm；1.13 mm；0.81 / 1.39；0.033；3.53° / 0.75°；−0.204 mm；×2.37。
  穆念慈 medium 15,457 / 28,926；1.08；18 mm；2.09 mm；0.80 / 1.41；0.029；2.28° / 0.72°；−0.108 mm；×2.00。
  穆念慈 tall 15,497 / 28,996；1.08；18 mm；1.42 mm；1.10 / 1.51；0.032；2.00° / 0.80°；−0.085 mm；×2.00。
  穆念慈 small 15,488 / 28,988；1.08；18 mm；3.37 mm；0.79 / 1.52；0.031；2.08° / 0.75°；−0.045 mm；×2.00。
  六份 bind 顶带均在皮下 0.30 mm；penetration bind 0 点、动作帧最坏 0.53%（门 ≤ 2%）；遮罩外渗 0；颈片求解残差 ≤ 4.4e-8 mu。穆念慈缩放 1.08 为钳位（原始 1.103；tpl_f 同样 1.097 钳到 1.08），黄蓉 0.921 未钳位。
- 缺陷 1（补充裁定 2 / 5）：新素体颈更细，穆念慈要收细 1.4–3.4 mm（黄蓉 ≤ 1.1 mm）；源件是 0.7 简化版，颈部三角跨 5 mm 以上，先收细再裁时切口圈由收细后的大三角线性插出，半径一两度内跳 0.3–0.9 mm，G1 单度尖峰 7.7° / 10.5°。改为先裁后收细：原有点逐位不变，切口圈新点按公式取值。G1 最大降到 2.28° / 2.08°，黄蓉不变（3.45°）。
- 缺陷 2（补充裁定 6）：穆念慈 small 唯一不过项是 run 0.9375 s 顶带 935 点中 1 点外露 +0.185 mm（门 ≤ 0.1）。该点 bind 时在皮下 0.30 mm、权重与正上方头皮三角插值逐位相同；病根在切口逐角权重"截前 3 根再混 Head"是硬截断，34.6° 处相邻两个切口点 Head 0.042 ↔ Spine2 0.041 互换，run 帧相对错开最多 1.9 mm，头皮折出棱。六份 tpl_f2 切口圈都有这种跳变（L1 0.08–0.16，新素体颈根肩 / Spine2 权重更高；旧素体 0.02–0.05）。`truncate_ring_weights` 在骨骼集合切换角两侧 15° 内把进出集合的骨骼 smoothstep 渐隐到 0，每角仍 ≤ 3 根 + Head；无切换时与硬截断逐位相同。切口权重场相邻 1° 的 L1 变化：硬截断 0.10–0.15，渐隐后 0.013–0.021，与模板自身权重随角度的变化（0.008–0.040）同量级。穆念慈 small run 外露 +0.185 → −0.045 mm，medium −0.040 → −0.108 mm；penetration 与底带不变。颈片 G1 裙带 73 帧边长绝对变化 ≤ 1.0 mm，与同高度身体三角（0.6–0.9 mm）和旧素体版（0.9–1.0 mm）同量级。
- 无 `--texture` 逐字节基线（head.glb / hidemask / preview / self_check / fit.json）两次改动后都不变；`RING_SWITCH_FADE_DEG` 不写进 report params（写进去会改 fit.json 摘要）。
- 页面实测（本任务工作区的 dev 5191 `/character-3d`；5173 是主检出，合入前没有本任务的页面与头产物）：tpl_f2_medium 戴黄蓉头无黑洞、光头已藏；切 tpl_f2_small 后黄蓉自动换成 small 变体；换穆念慈头 run 动作正常；切 tpl_f2_tall 穆念慈自动换成 tall 变体；切 tpl_m_medium 头列表为"当前素体暂无可用素材"、穆念慈头自动卸下；切回 tpl_f_medium 头 / 衣物 / 道具照常列出。页面服务的六个 GLB 摘要与盘上一致；控制台无报错。
- 截图（`shoot_head.mjs` 无头 Chrome，dpr 2，最终产物）：`shots/f2.tpl_f2_medium.jpg` 为正脸 / 颈 3/4 / 全身 × bind / walk@0.35 / run@0.25；tall / small 为颈 3/4 / 全身 × bind / run@0.25。颈缝看不出，无黑洞、无互穿；黄蓉发片尖刺是源件发片几何，tpl_f 版同样。
- 耗时：负载约 13–29 时每份完整重切 398–513 s（两条链并行）；截图每组 1–3 s。

## 4. 开放问题（附默认值）
- 渐隐宽度 15° 为经验取值（两处相邻切换角最近相距 21°，窗口会重叠，按逐骨骼取最小处理）；默认不再调，量产其他头若切换角更密、外露余量变小再看。
- manifest `fits` 里穆念慈三体型顺序是 tall / medium / small（中间轮次 medium 落门后重登记）；页面按模板同名取，不影响。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- R1-P1 / 切头量产一律用本版 cut_head（先裁后收细 + 权重渐隐）/ 新素体颈细、简化源件常见，两处缺陷都会复现。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `tools/model3d/dressup/README.md` cut_head 段：补"收细时先裁后收细"与"切口逐角权重截前 3 根、切换角两侧渐隐"两句。
- `docs/tech/12-dressup-production.md` P5 切头：注明换装页变体只在同一套素体内回退，新素体须逐体型切头。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 六份新切头门禁全过（接缝色差 p95 < 2、ΔE < 3、G1 < 5°、遮罩、73 帧动作外露等原口径，阈值未改）；线性密度 ×2.37 / ×2.00（≥ 2）。
- ✅ 页面单测通过（`useDressupIndex.test.ts` 6 项：套名映射、同名优先、同套回退、跨套不回退、换素体卸下、顺序）；浏览器实测无洞、无互穿，tpl_m_* 头列表不出现这两个头。
- ✅ tpl_f_* 头产物与其他素材逐字节不变（git 只见两个 manifest 的新增行与 tpl_f2 新文件）。
- ✅ 写集：cut_head.py、tests_head.py、两个头目录、三个页面文件与本报告；测试只写临时目录；0 点。
- ✅ 检查命令实跑（Node 22.22.1 / pnpm 9.15.9，按 package.json；负载约 13–17）：`tests_head.py` 32/32 通过（751 s，含 12 份真实头逐份 73 帧复算）；`selftest.py` 通过；两个头各体型 `report*.json` level 均为 draft（12 份 gateLevel pass）；`pnpm install --frozen-lockfile` 退出 0；`pnpm check` 退出 0（189 个测试文件 / 1344 项、包体预算通过，222 s）。
- 交接（之后衣物 / 道具重贴合与切换默认素体）：衣物 `fit_garment` / 道具 `normalize_prop` 按 tpl_f2_medium 先、tall / small 后重贴合，产物带 `.tpl_f2_*` 后缀登记；男头与男衣物待 W1 前问作者。全部套齐后把换装页默认模板 `selectedTemplate` 从 tpl_f_medium 改为 tpl_f2_medium（页面已按套回退，未贴合的物件在新素体上不显示、不会穿帮）。
