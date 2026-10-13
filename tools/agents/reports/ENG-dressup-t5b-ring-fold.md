# ENG-dressup-t5b-ring-fold 报告 · 3D 纸娃娃换装 · T5b · 派生前置修复：颈环改按实际颈截面 + 派生防折叠 / 法线一致（只改工具与测试；0 点）
## 1. 摘要（3–6 行）

新增显式 section 颈环：精确切三角、选择含轴最小闭环、弧长重采样与真实蒙皮权重；默认旧模式保持。
派生加入两环约束双调和平滑、几何最小旋转法线与局部一致性约束；新增只读 `--check`。
临时目录完成六组演示及源倒置面翻正后的四组复验；四派生翻向 0、新增反向面 0，颈环两轴差均 < 2 mm。
旧女三模板默认导出逐字节一致；243 个换装素材文件 SHA 不变；0 点、无新依赖；全量检查停在沙箱 tsx EPERM。
## 2. 产出（文件、行数、主要章节）

- `tools/model3d/dressup/`：`export_skeleton.py` 966 行（section/旧模式、CLI、表面校验）；`derive_template.py` 571 行（防折叠、法线、几何门）；`tests_skeleton.py` 367 行；`tests_derive.py` 295 行；本报告 60 行。未增加包或依赖。
- `python3 tools/model3d/dressup/tests_skeleton.py`：15/15；`tests_derive.py`：9/9；`selftest.py`：7/7；均退出 0。合成椭圆半径误差最大 0.00505%、周长误差最大 0.00251%（均 < 0.5%）。
- 现有五套 `tpl_f_medium/small/tall`、`tpl_f2_medium`、`tpl_m_medium`：逐套 `normalize_rig.py --check --body …` 与 `export_skeleton.py --check --out …`，10/10 退出 0；六组临时演示 normalize/section check 全过，四派生 derive check 全过。
- `pnpm install --frozen-lockfile`：退出 0，复用 567 包、下载 0，lockfile 不变；实机 Python 3.11.0、numpy 2.4.2、scipy 1.17.1、Node 22.22.1、pnpm 9.15.9。
- `pnpm check`：持有 dressup 共享校验槽的只读排他锁执行；lint/typecheck 通过、189 文件/1339 tests 通过；content:validate 因 tsx `listen EPERM …/tsx-501/42822.pipe` 退出 1，后续内容编译/build/size 未执行。未改 shim 或绕过 socket 限制。
## 3. 关键结论与数值

- 高度依据：先按 Neck 局部 0.004–0.035 mu、步长 0.001 精确求闭环。女周长在 h=0.008/0.009/0.010/0.020/0.034 为 0.176688/0.173505/0.170607/0.151668/0.143310 mu；男 h=0.007/0.008/0.020/0.028/0.029/0.032 为 0.242020/0.237333/0.204273/0.198549/0.198550/0.205425 mu。
- 原 0.025–0.045 mu 半径区间约束优先：女 h=0.008/0.009/0.010 的长/短半径为 0.029896/0.025520、0.029254/0.025251、0.028671/0.024993；h≈0.034 虽最平缓，短轴 0.022335 已越界。男 h=0.007/0.008 为 0.042219/0.032693、0.041141/0.032497；h≈0.0285 最平缓但与女性同一比例无法兼容原下限。
- 固定 `SECTION_HEIGHT_FRACTION=0.15`：在百分比 0.01 网格的共同可行区取较平缓端并留数值余量；0.13/0.14/0.15 时每 0.001 mu 周长变化女 1.853/1.761/1.682%、男 2.030/2.001/1.950%。0.16 的女短轴 0.024954 越界；0.15 的女短轴 0.025115，余量 0.000115 mu。女/男 Neck→Head=0.063463259/0.050312445 mu，切高=0.009519489/0.007546867 mu。
- 一致：比例高度随各自骨段长度计算；1024 等弧长点拟合椭圆，x/z 固定为长/短轴；64 点直接插值交线位置、所在三角重心权重聚合取前四根并归一；法线径向上翘 15°。`--ring-from` 只继承源 section 的 heightFraction，派生不搜索。
- 防折叠：比较源/派生三角几何法向点积 ≤ 0；同位置同位移点焊接，坏面两环自由、外部位移固定，解余切 `L M⁻¹ L d=0`，必要时增加坏面平移锚再迭代；含 float32 写出检查，全网格翻向必须 0。small 73→0，一轮、最大修正 4.688317 mm；邻域外严格不变。
- 法线先按面积加权几何法向的最小 Rodrigues 旋转转源法线，再对新增负点积面投影三角顶点法线和并归一，迭代收敛；源自带倒置面保留为基线。临时翻正两源的 89/67 面后再派生，四组翻向/反向面均 0/0。
- 与旧文档差异：section 不以 Neck 权重筛掉半圈，主导率只报告（男 medium 0.796875、lean 0.71875）；以闭环/真实表面检查取代旧权重筛选，半径、长宽比 < 1.3、比例 ±0.005、位移上限均不放宽。输入源 SHA：女 `e528b178bfb8070da36ea7f382aa9aa6ca64560cd312d04d281c832b8e8d733e`，男 `d9db6f2d86979df28bf082e965eacfbe067ba5407e6754ddfd8d70211471b65d`。
六组使用 T5 补充裁定第 2 条的临时六行规格；半径/差/位移/修正均为真实 mm（mu × mPerMu × 1000）。误差依次为身高比/髋比/肩比；中等不派生，列其相对规格的实测差。

| 模板 | 旧→section 半径 x/z | 相对源 Δx/Δz | 翻向前→后 | 负点积面/源 | 比例误差 高/髋/肩 | 最大规范位移/上限 | 修正 | profile 最大离面 |
|---|---|---|---|---|---|---|---|---|
| tpl_f2_small | 56.036/54.997→46.951/42.249 | 1.664/0.066 | 73→0 | 87/89 | +2.25e-8/−1.36e-8/−3.88e-9 | 80.0003/160 | 4.6883 | 0.0000106 |
| tpl_f2_medium | 56.714/52.577→48.614/42.183 | 0/0 | 0→0 | 89/89 | 0/+1.71e-4/+3.36e-4 | 0/不适用 | 0 | 0.0000092 |
| tpl_f2_tall | 60.359/50.177→50.450/42.231 | 1.835/0.048 | 0→0 | 82/89 | −3.20e-8/+1.79e-8/+5.37e-9 | 65.9757/120 | 0 | 0.0000105 |
| tpl_m_lean | 77.123/64.925→76.043/60.444 | 0.879/0.214 | 0→0 | 67/67 | +2.66e-8/−1.47e-8/−5.19e-9 | 50.0048/100 | 0 | 0.0000110 |
| tpl_m_medium | 76.047/71.225→76.922/60.230 | 0/0 | 0→0 | 67/67 | 0/+3.60e-4/+3.12e-4 | 0/不适用 | 0 | 0.0000126 |
| tpl_m_bulk | 79.133/74.076→76.178/59.736 | 0.745/0.494 | 0→0 | 55/67 | +3.43e-8/−1.85e-8/−7.01e-9 | 50.0798/100 | 0 | 0.0000124 |
## 4. 开放问题（附默认值）

- 当前检出实际只有五套正式模板，已检查所有存在目录；六组指本次临时演示。源倒置面和男性贴图缝仍交 T5；旧 tpl_f_small/tall 自带 3/1 个翻向也未重派生，按要求保持字节。
- 完整 `pnpm check` 尚需沙箱外复跑；默认沿用仓库 package.json 的 Node ≥22.12/pnpm 9，不在本任务升级至 tech/01 的 24/12。两个工具源文件超过 400 行建议值，受四文件写集限制保留现有模块。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；本任务实现 T5b 裁定，不修改 Canon、作者需求或门禁数值。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/11-paper-doll-3d-impl-spec.md` §4/§10.T/§11：登记 section 字段、实际截面/权重、固定比例、派生翻向/法线检查；T5 任务书登记下面命令及六行 v2 规格。正式重导、manifest、截图与头/衣物/道具重贴合由后续任务处理。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ section 精确闭合、profile < 0.5 mm；四派生两轴差 < 2 mm、0 翻向、逐面 0 新增反向；比例/位移/rest=bind/65 骨门全过。✅ 旧三套 skeleton（仅还原路径）/环/区域/颅形/GLB 逐字节一致，243 文件 SHA 不变；只改四工具/测试及报告，无 Tripo、提交或素材写入。
- ⚠️ pnpm 总门因沙箱 socket 未完成，未放宽或跳过；T5 合入后先翻正源倒置面、写 v2 规格，再运行以下命令（仓库根下执行）：
```bash
set -e
dressup_tools=tools/model3d/dressup dressup_templates=assets/default/model3d/dressup/templates
python3 "$dressup_tools/export_skeleton.py" --body "$dressup_templates/tpl_f2_medium/body.glb" --out "$dressup_templates/tpl_f2_medium" --default-height-m 1.66 --ring-mode section
python3 "$dressup_tools/export_skeleton.py" --body "$dressup_templates/tpl_m_medium/body.glb" --out "$dressup_templates/tpl_m_medium" --default-height-m 1.81 --ring-mode section
for item in 'tpl_f2_small 1.58 tpl_f2_medium' 'tpl_f2_tall 1.72 tpl_f2_medium' 'tpl_m_lean 1.76 tpl_m_medium' 'tpl_m_bulk 1.86 tpl_m_medium'; do
  read -r dressup_id dressup_height dressup_source <<< "$item"
  python3 "$dressup_tools/derive_template.py" --from "$dressup_templates/$dressup_source/body.glb" --spec "$dressup_tools/template_specs_v2.json" --id "$dressup_id" --out "$dressup_templates/$dressup_id"
  python3 "$dressup_tools/export_skeleton.py" --body "$dressup_templates/$dressup_id/body.glb" --out "$dressup_templates/$dressup_id" --default-height-m "$dressup_height" --ring-mode section --ring-from "$dressup_templates/$dressup_source/skeleton.json"
  python3 "$dressup_tools/derive_template.py" --from "$dressup_templates/$dressup_source/body.glb" --spec "$dressup_tools/template_specs_v2.json" --id "$dressup_id" --out "$dressup_templates/$dressup_id" --check
  python3 "$dressup_tools/export_skeleton.py" --check --out "$dressup_templates/$dressup_id"
done
```
