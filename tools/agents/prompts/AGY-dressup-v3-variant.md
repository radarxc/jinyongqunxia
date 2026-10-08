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
