# TOOL-actor3d-t1-lod 报告 · 城镇 3D 人物 · 城镇减面工具链 town_lod.py + measure_gait.mjs；首批六个模型 LOD0 / LOD1
## 1. 摘要（3–6 行）
本轮将 `town_lod.py` 升为 v3 事务发布：全部硬校验在暂存目录完成，成功后才替换最终目录。
新增超标滑移 API/CLI 非零且零发布负例，并直接断言体积、仅 baseColor、实际图片尺寸和两档身高差。
⚠️ 上游四套动画哈希未变；六模 walk/run 仍全超 2 cm，六次生产构建 exit 2，故未提交任何 `town/` 素材。
四条检查均通过；当前阻塞必须由有源动画写权限的任务解除。

## 2. 产出（文件、行数、主要章节）
- 工具/测试：`town_lod.py` 265 行；`measure_gait.mjs` 179 行；`tests_town_lod.py` 169 行；`measure_gait.test.mjs` 45 行。
- 事务语义：先验源动画；LOD/JSON/manifest 暂存并全验；目录替换发布，异常回滚既有目录。
- `pnpm install --frozen-lockfile`：通过（Already up to date，629 ms）；Python unittest：4/4（3.973 s）；Node test：3/3（1.390 s）。
- 最终 `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：通过，273 文件/2315 测试；content 1793 文件/1720 对象/4 Ink/65 地图；story 4 项、编译 3 行/2 章；size/dev-chunks 通过。
- 六模 CLI：均 exit 2（walk/run >0.02 m），且逐一实测 `town_exists=no`；上一轮 24 个失败产物已删除。

## 3. 关键结论与数值
下表 LOD 是返修前同源构建的测量证据（已删除、非当前发布产物）；源哈希未变。单位：三角/px/B/mu/HPS/m。
| 模型 | 源三角 | LOD0（三角/贴图/B） | LOD1（三角/贴图/B） | statureMu | walk/run HPS | walk/run 滑移 |
|---|---:|---:|---:|---:|---:|---:|
| npc_generic_m | 94932 | 25000/1024/922980 | 8998/512/349824 | 0.972196 | 0.581644/1.078234 | 0.041207/0.367791 ⚠️ |
| npc_generic_f | 98862 | 24998/1024/898552 | 8998/512/353524 | 0.975749 | 0.625645/1.153625 | 0.045769/0.399944 ⚠️ |
| npc_zhujue__ch00_m | 99466 | 25000/1024/960664 | 8996/512/364952 | 0.989891 | 0.542257/1.010162 | 0.039181/0.323063 ⚠️ |
| npc_zhujue__ch00_f | 96389 | 24999/1024/1047128 | 8995/512/387908 | 0.970807 | 0.620578/1.143986 | 0.046716/0.397527 ⚠️ |
| npc_duanyu | 97426 | 25000/1024/988884 | 8998/512/388252 | 1.000406 | 0.587485/1.073488 | 0.043351/0.367601 ⚠️ |
| npc_liwenxiu__ch10_youth | 94898 | 24998/1024/961192 | 9000/512/366756 | 0.972998 | 0.611789/1.150982 | 0.044205/0.387165 ⚠️ |
- 与契约一致：身高只取绑定姿势 `HeadTop_End`；有有效水平根位移直接量根，否则每帧选较低脚、同侧连续段累计净水平位移，统一除完整周期与身高；滑移按同序列分相。
- 无口径偏离；有效根位移仅用绝对数值噪声阈值 `1e-6 mu`，不再按身高 1% 过滤。段誉/李文秀分别记录 `clipsFrom=npc_generic_m/f`；外借动画参数与运行时一致。

## 4. 开放问题（附默认值）
- 六套动画都未过滑移门；默认无 `town/` 发布目录，先替换/修正四套源动画，再重跑工具。
- 浏览器转台观感尚未验收；默认六次构建 exit 0 后再拍摄并人工确认。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现与 `docs/tech/16-town-3d-spec.md` §9.1、§9.2、§9.4、§9.6 一致。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 动画任务：修正/替换四套自带 walk/run；通用男女过门后，段誉/李文秀分别继续外借它们。
- ENG-actor3d-a2-port：可开发 `town.json` 解析，但六次 exit 0 并生成目录前不得接发布素材。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 写集/依赖：仅四个工具测试文件与本报告；六个失败 `town/` 已清除；未改源 manifest、dressup、依赖、门禁或 `node_modules`。
- ⚠️ 管线/预算：事务发布和预算测试通过；真实六模因上游 walk/run 滑移失败，均 exit 2 且零发布。
- ✅ 测试/确定性：夹具覆盖完整周期 HPS、根运动、超标 API/CLI 零发布、体积/baseColor/图片/身高、manifest 与双跑 SHA；四条检查通过。
- ⚠️ 给 ENG-actor3d-a2-port：构建期读 `lod[]`、`statureMu`、`nativeHps` 组成 `ActorAssetSet`；`clipsFrom` 仅追溯，当前无可读生产目录。
- ⚠️ 给协调者待拍转台：`npc_generic_m`、`npc_generic_f`、`npc_zhujue__ch00_m`、`npc_zhujue__ch00_f`、`npc_duanyu`、`npc_liwenxiu__ch10_youth` 的 LOD0/LOD1 对照，共六组。
- ✅ 给换装线：未触碰 `tools/model3d/dressup/**`、`assets/default/model3d/dressup/**` 或 `*_base_body`；仅作为只读复用其 pack/textures/glb_io 能力。
