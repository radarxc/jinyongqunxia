# 本任务：3D 纸娃娃换装 · 阶段 T0 · 模板板工具 make_template_plate.py 与 2D 门禁 check_plate.py（AR-102 / AR-104）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md`（§0 规范 A 姿势、§2 阶段 T、§10.T）、`docs/tech/10-paper-doll-3d.md` §1.3（三模板比例表）与 §2.1（出图规范与 2D 门禁）。可参考既有脚本 `tools/model3d/stretch_apose.py`（逐行纵向拉伸）。

## 作者要求
**AR-104**：规范 A 字张角 **30° ± 3°**（上臂与竖直夹角），所有模板板与衣图统一；模板走路 A。**AR-102**：一切贴合代码化、可批处理。

## 规格
只用 Python 3.11 + numpy / scipy / Pillow（不装 pip 包）。输入是白底（或近白底）全身 A 字图（PNG/JPG，人物居中）。
1. `tools/model3d/dressup/make_template_plate.py`
   - `measure <image> [--json]`：前景分割（与边角连通的近白像素为背景，阈值可调），输出：头顶 y、脚底 y、身高 px、左右上臂与竖直夹角（取肩点到肘点：肩点 = 躯干轮廓在腋下以上的最外点，肘点 = 手臂中轴在前臂起点处；实现可用手臂区域骨架化 / 主轴拟合，**左右分别测**）、手臂跨度 / 身高、髋高（裆部 y）/ 身高、肩宽 / 身高、头高（头顶到下巴，下巴取颈部最窄处上沿）与头身比；
   - `stretch <image> --out <png> --hips-ratio <r> [--shoulder-ratio <r>]`：颈以下逐行纵向重采样使裆高 / 身高达到目标（复用 stretch_apose 思路），肩部横向重采样到目标肩宽比；画布尺寸不变、人物居中、留白 ≥ 4%；打印前后测量值。
2. `tools/model3d/dressup/check_plate.py --plate <底图> --image <待检图> [--arm-angle-deg 30 --arm-tol-deg 3] [--json]`：
   - 绝对检查：`--arm-angle-deg` 给定时，左右上臂角都要在目标 ± 容差内；
   - 相对检查（与底图比）：头顶 / 脚底 y 差 < 2% 身高；脸区（头顶到下巴的前景掩码）IoU ≥ 0.9；跨度 / 身高比差 < 3%（若给了绝对臂角目标，则跨度按 30° 理论值换算后比较，而不是与底图比）；髋高 / 身高差 < 2%；
   - 输出逐项 value / threshold / pass 与总 `pass`，退出码 0 通过、3 不过、2 输入错误；可选 `--overlay <png>` 输出底图与待检图轮廓叠加图（底图红、待检蓝）。
3. `tools/model3d/dressup/tests_plate.py`：用 Pillow 画合成"火柴人 + 圆头 + 矩形躯干 + 已知角度手臂"测试 measure 的臂角（误差 ≤ 1°）、头顶 / 脚底、跨度；stretch 后裆高比命中目标 ± 0.5%；check_plate 对同图通过、对改臂角 10° 的图不过。

## 要做的事
1. 写以上三个文件（中文 `--help`、文档字符串、`main(argv)` 可 import）。
2. 实跑：`measure assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose.png --json`（预期上臂约 39°~43°）与 `por_npc_zhujue__ch00_f_charmhigh_apose_slim.png`（窄轮廓，预期更小），报告逐项数值；`check_plate --plate <光头底图> --image <光头底图> --arm-angle-deg 30` 应因臂角不过（证明绝对门禁生效）。

## 约束
- 只写 `tools/model3d/dressup/{make_template_plate.py,check_plate.py,tests_plate.py}` 与本任务报告；`tools/model3d/dressup/` 目录若尚不存在就新建（阶段 A 的基础库可能还没合入，本任务不依赖它）。
- 不得用代码画替代正式素材图；本任务只做测量、重采样与门禁。

检查：以下命令必须全部通过。
- `python3 tools/model3d/dressup/tests_plate.py`
- `python3 tools/model3d/dressup/make_template_plate.py measure assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose.png --json`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写两张底图的全部测量值（左右臂角、跨度比、髋高比、肩宽比、头身比）与测量方法的已知误差；第 7 节写 t1 / t4 出图任务怎么用 check_plate（命令与阈值）。报告 ≤ 60 行。
