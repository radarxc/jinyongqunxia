# 批量生产 · 玄 / 黄级统一模板与绑定表（VFX-templates）合入前审核要点（协调者，2026-09-30；作者：验收不要太复杂）

**审核纪律**：必须先实际执行检查命令、看图、核对文件，再写结论；无法执行的项写 ⚠️ 并说明原因，不计为 ❌。写着"尚未执行 / 尚未核实"的 ❌ 一律无效，会被当作审核失败重跑。


共用发出方图池由另一任务（VFX-emitters）产出并已合入，**本任务工作区里没有 `assets/default/vfx/emitters/` 是正常的，不据此判 FAIL**。只审下面 5 条，每条 ✅ / ❌ 附依据：

1. 任务说明"检查"一节全部命令通过；写集内文件齐全：模板原料与样例 demo（`assets/default/vfx/templates/`）、`tools/vfx/bind_moves.py`、`tools/vfx/check_skill_suite.py`（含 2 个单测）、`assets/default/vfx/bindings.yaml`、`docs/design/vfx/palette.yaml`。
2. 模板原料：白底、帧数 4–8、造型中性可调色、无文字水印；切出的帧为真 RGBA。
3. 代码：`vfx_player.js` 模板模式不影响原料模式（两套基线样例 demo 仍能打包并通过 `check_vfx.py --html`）；`bind_moves.py` 幂等、`--check` 通过；绑定表覆盖图鉴全部 `mv_*`（数量与图鉴一致，天 / 地 → bespoke，玄 → qi_projection / afterimage，黄 → plain_strike），判断不了发出方的条目已在报告列出。
4. 颜色规则：阴青 / 阳赤 / 调和金 / 中性素白写进 `palette.yaml` 并被播放器读取。
5. 报告如实。

裁定：1、3 任一不成立判 FAIL；2、4 明显不符判 FAIL；其余列出。返修说明只写要改的文件。
