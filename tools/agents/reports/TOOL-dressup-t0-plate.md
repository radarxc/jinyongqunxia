# TOOL-dressup-t0-plate 报告 · 3D 纸娃娃换装 · T0 · 模板板工具 make_template_plate.py 与 2D 门禁 check_plate.py（AR-104）
## 1. 摘要（3–6 行）
- 已交付可批处理的模板板测量 / 拉伸与 2D 门禁，落实 AR-102；左右上臂分别拟合并执行 AR-104 的 30° ± 3° 绝对门禁。
- 合成 30° 人体实测左 30.116°、右 29.837°；同图通过，10° 变体失败。
- 现光头过渡底图实测 41.523° / 41.388°，以 30° 门禁检查按预期退出 3。
- 全量 pnpm check 通过；未增加依赖、未改素材。
## 2. 产出（文件、行数、主要章节）
- make_template_plate.py 365 行：边缘连通近白背景分割、地标 / 双臂测量、逐行髋高重采样、肩带横向反馈校正、4% 留白。
- check_plate.py 157 行：绝对角 / 理论跨度、相对几何 / 脸 IoU、逐项 JSON、红蓝轮廓 overlay、退出码 0/2/3，兼容脚本与包导入。
- tests_plate.py 112 行：6 项合成测试，覆盖公开函数、左右独立角、跨度、拉伸、留白、门禁与 CLI。
- 验收输出：tests 6/6；pnpm install --frozen-lockfile（锁文件一致、依赖已齐）；pnpm check 178 files / 1272 tests、1777 内容文件、4 编译测试、尺寸门全通过。
## 3. 关键结论与数值
- 一致处：Python 3.11 + numpy / scipy / Pillow；画布不变；绝对臂角 30° ± 3°；相对阈值 y 各 <2%、脸 IoU ≥0.9、跨度比差 <0.03、髋高比差 <0.02。
- 光头底图：头顶/脚底 99/1475，高 1377 px；左/右臂 41.523°/41.388°；跨度比 0.622367；髋高比 0.496006；肩宽比 0.196079；头身比 8.941558。
- charmhigh 窄轮廓：头顶/脚底 19/1125，高 1107 px；左/右臂 18.349°/12.679°；跨度比 0.355917；髋高比 0.459801；肩宽比 0.181793；头身比 7.741259。
- 方法：近背景色从画布边缘中位色取得，只把与边缘连通者当背景；最大前景域填洞；上臂取躯干外横截面中轴近肩 55% 直线拟合，左右独立。
- 已知误差：合成线段角误差 ≤0.163°；抗锯齿 / 衣袖 / 手臂弯曲会移动轮廓中轴；2D 肩轮廓不是 3D 肩关节。charmhigh 长裙遮裆，髋高使用 silhouette_fallback（54% 高度代理），不能当真裆点。
- 偏离说明：仓库当前 packageManager / engines 固定 pnpm 9.15.9、Node ≥22.12，本机 Node 22.22.1；与任务附加规则所述 Node≥24 / pnpm12 不同。按当前正本未擅改工具链，冻结安装与全门禁均通过。
## 4. 开放问题（附默认值）
- 长袍图不可观察真实裆部；默认输出 crotch_method="silhouette_fallback" 并用 54% 高度代理，只供相同遮挡构图相对比较，模板派生须用 visible_gap。
- T4 男底图无旧板可比较时，默认先自检绝对 30°，再定稿为 plate；其后的衣图与该 plate 相对比较。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现遵循 tech/10 §1.3 / §2.1 与 tech/11 §10.T。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- .claude/skills/dressup-3d/SKILL.md / 2D 出图门禁：后续写入第 7 节命令、退出码 3 与 crotch_method 限制。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ python3 tools/model3d/dressup/tests_plate.py：6 tests，OK；合成角误差 ≤1°、跨度逐像素、髋高目标 ±0.5%、同图过 / 10° 不过。
- ✅ 正式 measure ...bald_base_body_apose.png --json：本工作区指定路径实跑成功，输出见第 3 节。
- ✅ 光头同图 --arm-angle-deg 30 --json：角差 11.523° / 11.388°，跨度差 0.104337，总 pass=false，退出 3。
- ✅ pnpm install --frozen-lockfile：完成；pnpm check：lint / typecheck / 1272 tests / content / build / size 全通过。
- ✅ 续作复验：先前缺失的两张 ch00 素材现已同步；先前 ch01 manifest 重复 status 也已由上游消除，本任务未修改写集外文件。
- ✅ 中文 --help、文档字符串、可导入 main(argv)、JSON 逐项 value / threshold / pass、overlay、输入错误 2 / 门禁失败 3 均覆盖。
- ✅ T1 女板：python3 tools/model3d/dressup/check_plate.py --plate <旧光头图> --image <apose30.png> --arm-angle-deg 30 --arm-tol-deg 3 --overlay <overlay.png> --json；阈值即 y<2%、脸≥0.9、理论跨度差<0.03、髋差<0.02、双臂各 27°~33°。
- ✅ T4 男板：首张先用 measure <男板> --json 确认左右 27°~33°；定稿后以自身为 --plate/--image --arm-angle-deg 30 留门禁基线，后续男衣图沿用 T1 命令和同阈值。
