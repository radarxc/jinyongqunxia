# 本任务：3D 纸娃娃换装 · V3 · 贴图变体：同版型第 2 件衣服只靠改图 + 烘焙（粗布短褐 eq_buyi，0 点；AR-108 闸门 V3）

本任务出图、写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/12-dressup-production.md`（§0、§1 V3、§2 P3）、`docs/tech/11-paper-doll-3d-impl-spec.md`（§5.5、§6、§7）、E1 / E2 / E3 报告第 7 节，`tools/model3d/dressup/{bake_texture_layer.py,check_plate.py,textures.py,pack_glb.mjs,validate.py,ingest.py}`，以及版型件 `assets/default/model3d/dressup/garments/eq_jinzhuang/`（E2 实验件，三模板）与其衣图底板 `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_dressup_eq_jinzhuang_front.png`（与模板底图同画布：人物高 1375 px、脚底 y=1474、头顶冠带中心 x≈512）。

> 工具链口径：以根 `package.json` 为准（pnpm 9.15.9、Node ≥22.12）。

## 作者要求
**AR-108**：装备走"版型库 + 贴图变体"——每个版型只生成一次 3D，同版型其余物品按物品图改图后烘焙贴图，**0 点**；量产前先验证（闸门 V3）。本件：粗布短褐 `eq_buyi`（`content/items/eq_buyi.yaml`；物品图 `assets/default/item/clothing/eq_buyi.png`：灰褐粗麻交领短褐、侧系带），与江湖劲装同属"交领短衣到髋"版型。

## 要做的事
1. **变体衣图**（agy 图像工具，只调用一次图像工具即可重试至合格；不写代码改像素）：以劲装衣图底板为底，把衣服换成粗布短褐的面料与颜色（灰褐粗麻、粗织纹、本色系带；腰带位置保留同形布带，颜色同衣），**轮廓、交领线、袖长、衣摆、人物、姿势、构图、背景全部不变**。产物整图缩放对齐到底板画布（同人物高与脚底；可参考协调者对齐办法：按背景色分割人物框、等比缩放、脚底与头顶冠带中心对齐、背景色补边）。门禁：`check_plate.py --plate <模板底图> --image <变体衣图> --arm-angle-deg 25` 通过，且变体与劲装底板的**衣服区域轮廓 IoU ≥ 0.95**（衣服区 = 与模板底图差异大的像素）。落 `assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_dressup_eq_buyi_front.png` + 同目录 manifest 条目（prompt、references、normalization、check_plate 数字、`status: candidate`）。
2. **`tools/model3d/dressup/retexture_variant.py --base <版型件目录> --base-plate <版型衣图> --plate <变体衣图> --id <id> --out <dir> [--json]`**（新工具）：
   - 正面可见纹素：版型件在模板 bind 空间，按底板画布映射（人物高 / 脚底 / 中线 ↔ 模板身高 / 脚底 / 中线）做正交投影，z-buffer 判可见，取变体衣图颜色；
   - 其余纹素（背面、侧面、被遮挡）：用"版型衣图衣服区 ↔ 变体衣图衣服区"同位像素对学一个颜色映射（Lab 空间 3D LUT 或分段仿射，不写死颜色常数），作用到版型件原贴图；
   - 两者在掠射角处羽化混合；UV 岛外扩边；输出变体 GLB（几何 / UV / skin 与版型件逐字节相同，只换 baseColor）三模板各一份（共 UV，同一张新贴图）；
   - 同时用 E3 的 `bake_texture_layer.py` 思路（从**变体件**而非整身模型）烘一张身体贴图层，供叠穿；
   - 遮罩：若版型件 fit.json 有 `hideMask`（G1），变体直接引用同一张（几何相同）。
3. **入库**：`garments/eq_buyi/`（网格件，manifest `status: draft`、`experimental: true`、`base: eq_jinzhuang`、`item: eq_buyi`，fit / report 复用版型件数值并重跑 `validate.py`）与 `garments/eq_buyi_tex/`（贴图层，`kind: dressup-layer`）。
4. **质检图**：`preview_front.png` / `preview_back.png` / `preview_compare.png`（与变体衣图并排）。
5. **测试** `tools/model3d/dressup/tests_variant.py`：合成"带 UV 的圆柱衣 + 两张纯色底板"：正面纹素取变体色、背面按 LUT 映射、几何逐字节不变；只写临时目录。

## 协调者实测意见（第 1 轮，2026-10-08 14:30；返修必须照做，审核按此判定）
变体衣图（agy 出图）合格：轮廓、交领、腰带、姿势与劲装底板一致，面料换成灰褐粗麻。但：
1. **网格变体贴图大片空白**：`eq_buyi.glb` 的新贴图只填了部分 UV 岛，其余是黑色（与版型件贴图并排看，版型件每个岛都有颜色），穿上会出现大块黑色。要求：版型件贴图里有内容的每个纹素在变体里都必须有颜色——正面可见处用投影，其余**全部**走 LUT 映射版型件原色；输出前统计"版型件有效纹素中变体已填比例"，必须 ≥ 99.5%，写进报告与 fit.json。
2. **身体贴图层坏了**：`eq_buyi.layer.png` 的质检图只是散在皮肤上的灰色斑块。改为直接复用 E3 的 `bake_texture_layer.py` 烘焙流程（体表纹素沿法线射线、取最外侧交点、3D 上定衣服度、只在真实分界羽化），只是把"整身模型"换成"贴合后的变体网格件（bind 姿态）"；质检标准同 E3 第 4 版。
3. 新增网格变体的质检图 `garments/eq_buyi/preview_mesh_front.png` / `preview_mesh_back.png`（模板 + 变体件 bind 姿态，用新贴图着色），协调者要能看出是灰褐粗麻短褐。

## 协调者实测意见（第 2 轮，2026-10-08 15:05）
第 2 次运行网格变体已填满、正面系带腰带可辨（方向对了）。还差：
1. 审核 r2 两条：删除写集外文件（`project_front_pixels.py` / `render_layered.py` / `render_utils.py` / `out*.log` 等，辅助代码并入 `retexture_variant.py` 或测试文件）；**衣服区轮廓 IoU**（变体衣图 vs 劲装衣图，衣服区 = 与模板底图差异大的像素）真实计算并 ≥ 0.95，写报告与 manifest。
2. **质检渲染用错贴图**：身体被画成蓝紫色——模板 body.glb 有 normal / basecolor / rm 三张图，渲染必须取材质 `baseColorTexture` 指向的那张，不得取第 0 张。
3. **边缘浅色描边**：衣服轮廓边一圈浅色线是正面投影在掠射角取到了底板背景。投影只用于 `|n·z| ≥ 0.35` 且投影像素属于底板"衣服区"的纹素，其余走 LUT。
4. **V 领浅色方块**：底板 V 领处是皮肤，不能投到衣服内侧；同上，只投"衣服区"像素。
5. 改完重出 `preview_mesh_front.png` / `preview_mesh_back.png` / `preview_compare.png`（身体用正确肤色）。

## 协调者实测意见（第 3 轮，2026-10-08 15:25；返修必须照做，审核按此判定）
第 4 次运行的变体衣图是**写脚本给劲装衣图改色加噪**做出来的，违反第 1 步"不写代码改像素"；第 5 次运行又把写集外的 `packages/render/src/dressup/actor-runtime.test.ts` 分配断言从 `toBe` 放宽成 `toBeLessThan(10000)`（协调者已撤回，并删除 `test-alloc.js`）。改法：
1. **衣图用图像工具的产物**：协调者已取回你第 1 次运行图像工具出的图并对齐到底板画布：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/coord/_dressup/v3/agy_imagetool_eq_buyi_front.aligned.png`（原图同目录 `agy_imagetool_eq_buyi_front.jpg`；对齐：整图缩放 1.2072、偏移 (0, 5)、背景色补边）。直接复制为 `por_npc_zhujue__ch00_f_dressup_eq_buyi_front.png`，覆盖脚本改色版；manifest 条目写图像工具提示词、references、normalization（上述数字）、check_plate 数字、IoU，`status: candidate`。
2. **衣服区 IoU 口径固定**：衣服区 = 与模板底图 `por_npc_zhujue__ch00_f_bald_base_body_apose_narrow.png` 逐像素 RGB 最大通道差 > 25 的像素（不做形态学）；变体与劲装衣图各按此求衣服区再算 IoU，门禁 ≥ 0.95（协调者实测这张为 0.956）；阈值 40 / 60 的值只报不判。把这一算法写进 `retexture_variant.py`（如 `--iou-only` 子功能）并在报告里列三组数字。
3. **布料上的白色划痕**：网格变体贴图的布料岛里有成串白色短线（对比图 `…/_dressup/v3/tex_compare_jinzhuang_vs_buyi_run4.png` 右半），穿上就是白道。查明来源（多半是投影取到了衣服区边缘 / 缝线外的浅色像素，或 LUT 外推）并修掉；验收：布料岛内亮度高于变体衣图衣服区第 99 百分位亮度的纹素占比 < 0.1%，写进报告与 fit.json。
4. **网格质检渲染器 UV 采样错了**：`preview_mesh_front.png` 里模板身体和衣服都是一块块肤色 / 深色迷彩——连身体都花了，说明是渲染器的问题（变体贴图本身布料岛颜色正常）。按 `bake_texture_layer.py` 同一 UV 约定采样材质 `baseColorTexture`；先用同一渲染器渲劲装版型件（应是深蓝劲装、无肤色补丁）做自检，再渲布衣。重出 `preview_mesh_front.png` / `preview_mesh_back.png`，协调者要看到正常肤色身体上的灰褐粗麻短褐。
5. **不碰写集外文件**：`actor-runtime.test.ts` 的分配采样用例是已知的 JIT 时机偶发失败，由协调者在 B4 处理；你的 `pnpm check` 遇到它，重跑一次，仍失败就在报告里写明，不得修改。结束前删除工作区里所有不在写集的文件。

## 协调者裁定（2026-10-08 18:40）
1. **胸口肤色块不作本任务门禁**：它在版型件劲装（E2 抽取）上原样存在，根子在 `extract_garment` 把 V 领内侧皮肤纹素带进了衣服贴图；修版型件后同版型所有变体自动干净，归入后续任务（E2 抽取清理）。本任务把"变体贴图皮肤色纹素占比"如实写进报告与 fit.json（只报不判），不要为它牺牲填充率。
2. **填充率必须 ≥ 99.5%**：第 12 次运行 `variantFillRatio` 从此前的 100% 掉到 98.3%（多半是皮肤修补把纹素清空了），这是本轮新出的退步，必须修回。
3. 审核 r3 第 1 条（真实测试）照做：正面 ≈ 变体色、背面 = LUT(版型色)、输出 GLB 除图片外字节相同、IoU 对已知掩码给已知值、错误输入会失败；第 12 次运行的测试只有一条中位色断言，不够。
4. 本任务的审核从现在起由 GPT-5.6-Sol 做（此前 supervise 误把 agy 当审核器，已修）。

## 约束
- 只写 `tools/model3d/dressup/{retexture_variant.py,tests_variant.py}`（可 import 但不改 `bake_texture_layer.py`）、`assets/default/model3d/dressup/garments/{eq_buyi,eq_buyi_tex}/**`、`assets/default/character/female/ch00/threeview/{por_npc_zhujue__ch00_f_dressup_eq_buyi_front.png,manifest.yaml}`（manifest 只追加一条）与本任务报告。
- 不改版型件 `garments/eq_jinzhuang/**`、不改其他工具；不加依赖；**不花 Tripo 点数**。
- 本任务由 agy 执行：必须把出图、代码、实跑、检查全部做完再结束；不执行改变仓库状态的 git 命令。

检查：
- `python3 tools/model3d/dressup/tests_variant.py`
- `python3 tools/model3d/dressup/check_plate.py --plate assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose_narrow.png --image assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_dressup_eq_buyi_front.png --arm-angle-deg 25`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
`tools/agents/reports/AGY-dressup-v3-variant.md`：第 3 节写出图轮次与门禁数字、衣服区 IoU、LUT 拟合误差、正面投影覆盖率、耗时；第 4 节写变体法的局限（腰带 / 系带等版型差异）；第 7 节写给量产 P3 的命令序列。报告 ≤ 50 行。
