# 角色部件贴图（ART-rig-parts-*）合入前审核要点（协调者，2026-10-01；作者：验收不要太复杂）

**审核纪律**：必须先实际执行检查命令、看图、核对文件，再写结论；无法执行的项写 ⚠️ 并说明原因，不计为 ❌。写着"尚未执行 / 尚未核实"的 ❌ 一律无效，会被当作审核失败重跑。

只审下面 5 条，每条 ✅ / ❌ 附依据；看预览条带 `preview.png` 与最多 4 张部件图：

1. 齐全与登记：规格 `docs/tech/09-character-rig.md` §1 的部件 × 三视图都有图，manifest 每条 pivot / childJoint / size / sha256 与磁盘一致，`make_parts.py --check` 与 `check_assets.py` 通过。
2. 透明底真 RGBA、每张只有该部件、轴向与枢轴位置符合规格约定（抽 4 张）；不符超过 1 张判 ❌。
3. 预览条带：步态各帧关节不露缝、比例正常、三视图是同一个人（脸 / 发 / 衣色一致）；明显露缝或比例失真判 ❌。
4. 画风：与建筑 / 贴片素材一致（光源左上、墨线描边、低饱和），无文字、无具体影视游戏造型（提示词 grep 演员 / 作品名）；有判 ❌。
5. 报告如实（部件清单与目录一致，重出记录）；manifest 每条 `tool` 为 image_gen、`model` 为真实模型名，出现 `fallback` / `Pillow` / 程序绘制或目录有生成脚本判 ❌（伪造素材，直接 FAIL）。

裁定：1、3、4 任一不成立判 FAIL；2 超过 1 张不符判 FAIL；5 的伪造判 FAIL、其余只列出。返修说明只写要重出的部件。

**口径**：只有上面写明判 FAIL 的条件是阻断项；审核不得新增判定标准，其他观察只列出不影响结论。

**素材线第三波补充裁定（2026-10-03，TOOL-rig-parts-f 专用）**：本任务按 AR-29 的「三视图 + 工具切件」流程，部件由 `tools/rig/` 从 codex 出的女主三视图（`npc_zhujue__ch00_f/sheet/`）切出；部件 manifest 记切件来源与工具、`model` 为 none 或源图模型，**不算第 5 条的「程序绘制 / 伪造素材」**（男主 TOOL-rig-sheet 同此办理）；源图看不到而按源图纹理补绘、或回退标准体的部件，只要 manifest 与报告如实标明（`sourceTrouserPatch` / 回退）就不判 ❌。第 1 条的规格以 `docs/tech/09-character-rig.md` §1 的 3 视图 × 13 件 = 39 件为准；第 3 条看报告里的三张 GIF 与姿势条带，长袍随动的轻微穿插只列出。若改了 `tools/rig/`，按 review_checks_tool.md 第 1、4 条加审单测与写集。

**素材线第三波补充裁定（2026-10-03，TOOL-rig-std-parts 专用）**：标准体没有身份立绘，「三视图是同一个人」以 `assets/default/rig/<set>/sheet/sheet_L.png` 为准；部件由 `tools/rig/` 从该三视图切出，同 TOOL-rig-parts-f 一样不算第 5 条的程序绘制；manifest 必须去掉 `placeholder: true`、palette 保持原值。两套都要 `make_parts --check` 通过。
