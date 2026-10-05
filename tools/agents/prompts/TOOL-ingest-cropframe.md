# 本任务：工具 · 物品图入库裁框：`crop_frame()` 遇到左右白框会把主体切掉——扫描线只取另一轴已判定的框以内的像素，并补回归测试

本任务改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `tools/imagegen/ingest.py` 的 `crop_frame()`（第 50–76 行）与调用处（第 138 行一带）；
- `tools/imagegen/README.md`（若有「画框」一节）；
- 集成分支上出图员留下的三张带框原件，**只读、不复制进仓库**：
  `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/gemini_qa/frame_fix/it_miji_xingjunbu_can_orig.jpeg`、
  同目录 `it_miji_xijiantoubu_can_orig.jpeg`、`eq_fengweishuangbi_orig.jpeg`。

## 现象（Gemini 出图员 10-03 01:36 报告）

`crop_frame()` 从四边向内扫，每行 / 每列整条取均值与内衬背景色比较，阈值 7。当原图上下有白框、**左右也有白框**时，上下边的每一整行都含两侧白框的像素，整行均值被拉高 7–8，始终过不了阈值，扫描一直走到主体内部（最多 15% 边长）才停：`it_miji_xingjunbu_can` 第一次入库（a59e7bf9）书底被切掉；出图员手工按白框取内框补成方图后重新入库（fa2c1895，manifest notes 已写明）。

## 要做的事

1. **改 `crop_frame()`**：任何一条扫描线只取「另一轴已判定的框以内」的像素求均值——例如先用上下框以内的行扫出左右框宽度，再用左右框以内的列扫上下框高度（或两步迭代一次）。阈值（7 / 14）、`lim`（15% 边长）、按背景色补成正方形、返回 `box` 的约定都不变；无框图（四边 ≤ 2）仍原样返回 `(im, [])`。
2. **手工验证三张原件**：裁后主体完整、四边都不贴边。把每张的 `box`、裁后尺寸、主体到四边的最小边距写进报告（可自写一段 PIL / numpy 量边距；`.agents/coord/gemini_qa/kit/` 里出图员的质检脚本也可参考，但不要改它们）。不把任何图片复制进仓库。
3. **新增 `tools/imagegen/test_ingest_crop.py`**（`unittest`，用 PIL 现场合成图，不带二进制夹具）：
   - 四边白框 + 浅暖灰内衬（约 RGB 230,225,216）+ 深色主体：裁后主体完整，`box` 落在白框内沿 ±2 px；
   - 只有上下框、只有左右框：各自正确；
   - 无框：原样返回，`box == []`；
   - 深色画框：仍能裁；
   - 主体离某一边只有几像素但不贴边：不会被切。
4. `python3 -m unittest discover -s tools -p "test_*.py"` 全过；`tools/imagegen/README.md` 若有画框一节，补一句「扫描线只看另一轴框以内的像素」的说明和这次的案例。

## 约束

- 只改 `tools/imagegen/ingest.py`（只动 `crop_frame()`；其余入库逻辑、manifest 字段、`--manual-title` 分支都不碰）、新建 `tools/imagegen/test_ingest_crop.py`、改 `tools/imagegen/README.md`，以及报告。
- 不改 `assets/**`、`content/**`、`docs/**`；不重新入库任何图；不装新依赖（numpy、PIL 环境里已有）。

## 报告

`tools/agents/reports/TOOL-ingest-cropframe.md`，按 `_common.md` 的格式；§3 写三张原件的裁框数值与裁前后对比说明，§7 逐条对照本任务验收标准（✅ / ⚠️ + 说明）。
