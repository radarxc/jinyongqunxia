# TOOL-rig-nearside 报告 · 动作原型 P0 · 修正 rig 近侧与左右约定（tech/09 z 表、make_parts、placeholder，AR-29）

## 1. 摘要（3–6 行）
- 已将 `_L/_R` 统一为角色解剖学左右；三个未镜像视图均面向画面左、近侧为 L，镜像后为 R。
- 已贯通“三视图关键点/枢轴旁注 → 切件清单 → 运行时关节”；有旁注时优先采用，无旁注时正式 set 与占位均按分视图比例回退。
- 本轮修复镜像的锚点、姿势、贴图、z 与武器附着同侧交换，并由非对称数据验证水平反射。
- 已由脚本重建男女占位套件；三项指定门禁最终全部通过。

## 2. 产出（文件、行数、主要章节）
- 文档：`docs/tech/09-character-rig.md` 678 行（v1.1、视图/层级、旁注契约）；`docs/tech/07-asset-generation.md` 1741 行（三视图切件流程）；`assets/default/prompts/rig/GUIDE.md` 35 行（旧逐部件流程退役）。
- Python：`make_parts.py` 307 行、`templates.py` 116 行、`preview.py` 248 行、新增 `make_placeholder_parts.py` 68 行及 `test_make_parts.py` 225 行。
- Render rig：更新 `types/placeholder/manifest/character/equipment/index`（合计 781 行）及 `rig/equipment` 测试（270 行）。
- 素材：`male_std`、`female_std` 各 39 PNG + 731 行 `manifest.yaml`；共 78 PNG、32.4 KiB 内容（目录占用 336 KiB），均标记 `placeholder: true`。

## 3. 关键结论与数值
- 常量改为 Python `NEAR_SIDE="L"`、TS `RIG_NEAR_SIDE='L'`；manifest 固定 `nearSide: L`，校验器拒绝其他值。
- z 表改为三视图 L 肢体在前：手臂 R=0/1/2、L=13/14/15；共享腿展开后 R=3/4/5，L 在 front34/side=10/11/12、back34=9/10/11；镜像只交换 L/R 值。
- 肩/髋比例回退按视图区分：front34 为 `L>R`、back34 为 `L<R`、side 为 `L=R`；正式 set 无 `jointSource` 时 Python 构建与 TS 校验均通过，有旁注则优先采用并校验安全路径。
- 镜像时优先读取相反侧肩/髋点，并交换 shoulder/elbow/hip/knee/ankle 姿势；贴图、锚点、动作、z 与双武器附着保持同侧。
- 新测试断言正式 set 无旁注仍生成 39 条记录及三视图肩髋投影；并以不同 L/R 关节和姿势值验证完整骨链、武器层反射、三视图 L 在前及镜像后 R 在前。
- `/rig-demo` 核对法为同一 `dir/motion/phase` 前后截图叠加：姿势应不变，仅近远遮挡纠正；本轮确认两端 gait 源文件零改动并用 z/关节测试代验，未声称完成浏览器截图。
- 性能门禁通过：本轮采样 loadavg `15.73/12.10/10.77`；20/100 角色最佳 P95 分别 `0.089/0.401 ms`，未改阈值或跳过检查。

## 4. 开放问题（附默认值）
- 浏览器视觉 A/B：宿主 Chromium Mach port 沙箱报 `Permission denied (1100)`；默认在可运行浏览器的环境按上述固定输入补拍并做叠加核对。
- 正式素材尚未提供；默认视图级旁注用 normalized 坐标、部件级旁注用 source 坐标；缺失时允许比例回退，但默认在入库前人工复核。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
| 编号 | 提案 | 理由 |
|---|---|---|
| 无 | 不修改 `docs/00-canon.md` | 本次是 AR-29 已授权的技术规格纠错，归属 `tech/09` 与 `tech/07` 即可。 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
| 文档 | 位置 | 改什么 |
|---|---|---|
| 旧 rig 部件提示词 84 份 | `assets/default/prompts/rig/<set>/` | 非本任务可写范围；后续统一退役或删除其中“近侧为右侧”文案，当前一律不得执行。 |
| `TODO.md` | AR-29 状态 | 由调度器登记本原型的近侧纠错、占位生成与门禁结果。 |
| `/rig-demo` 验收记录 | 后续视觉回归 | 在允许 Chromium 启动的环境补充同输入前后截图与像素叠加证据。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 文档、Python、Render 均统一解剖学 L/R、未镜像近侧 L；三视图与镜像真值表有测试。
- ✅ 旁注优先、缺失时比例回退；正式无旁注 set 的 Python 构建和 TS 校验已有用例，三视图肩/髋符号均复核。
- ✅ 男女清单由 `make_placeholder_parts.py` 重建，未手改；78 张 PNG 与两个清单复核通过。
- ✅ GUIDE 明确三视图切件为现行流程、逐部件出图作废；历史 84 份留待上表同步。
- ✅ `python3 -m unittest discover -s tools -p "test_*.py"`：26/26；`pnpm install --frozen-lockfile`：通过。
- ✅ `pnpm check`：83 文件、423 测试及 2 项性能测试全部通过；内容、构建、体积门禁通过。
- ✅ 本轮解开 `packages/render/src/rig/index.ts` 导出冲突，同时保留 ENG-11 的 `RigSnapshot` 与本任务的 `zOrderForPart`；`character.ts` 两侧实现均已核对保留。
- ✅ 男女 manifest `--check` 通过；78 PNG 的 SHA-256、尺寸、透明边均匹配；两次预览 SHA-256 均为 `3a9cdcf22e23190dcd5810710b62fc689a9053aaddbc51b88357c5f337d1e5a4`。
- ✅ `git diff --check` 通过；改动路径均在授权清单内，未修改 core、gait 或 rig 外 render。
- ⚠️ `/rig-demo` 浏览器截图受宿主沙箱阻止；已如实记录，并以源文件零改动及确定性测试覆盖本轮可验证部分。
