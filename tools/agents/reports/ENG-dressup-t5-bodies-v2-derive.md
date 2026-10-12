# ENG-dressup-t5-bodies-v2-derive 报告 · 3D 纸娃娃换装 · T5 · 新素体准备：tpl_f2 / tpl_m 倒置面翻正 + 三体型派生（女 small / tall、男 lean / bulk；0 点）

## 1. 摘要（3–6 行）

第 8 次续作，基点 0bd50e2be；保留并复核获准的 bulk 脚底回归补丁及第 5 次按 T5b 生成的模型、骨架、预览和截图，0 点。
六套倒置面 0、65 关节、rest=bind；四型比例、位移、翻向与 section 颈环差均通过，最大轴差 1.835194 mm < 2 mm。
六模板 bind / walk 拼图、六张预览与男后脑三姿态对照沿用第 5 次 5173 实拍；本次核对浏览器记录、图片与 body SHA 全部一致。
原验收 19/19、补充只读检查 8/8 全过（含 pnpm check）；tests_derive.py 实测 10/10，候选补丁文件已删，清单测试阻塞解除；保持 candidate，交后续重贴合。

## 2. 产出（文件、行数、主要章节）

- tools/model3d/dressup/：fix_inverted_faces.py 233 行、tests_fix_faces.py 250 行、template_specs_v2.json 11 行 / 6 条；tests_derive.py 改为 341 行，仅替换脚底启发式并补合成回归，其余断言保留；未加依赖。
- templates/{tpl_f2_medium,tpl_m_medium}/：body（沿用索引修复）、skeleton、manifest、preview、inverted_faces.json；女目录 validation.*.json 记录本轮命令、字节审计、测试与汇总，区域 / 颅形字节未变。
- templates/{tpl_f2_small,tpl_f2_tall,tpl_m_lean,tpl_m_bulk}/：body / derive（70 行）/ skeleton / regions / skull / validation.t5 / preview 原样保留；manifest（54 行）更新回归已解决及 downstreamRefit=ready；bulk 的候选 patch 与 validation.floor-regression.json 已删除。
- 图片：[六模板 bind / walk](../../../assets/default/model3d/dressup/templates/tpl_f2_medium/shots/derive.six_templates.jpg)（2160×1546）、[男后脑三姿态](../../../assets/default/model3d/dressup/templates/tpl_m_medium/shots/derive.inverted_faces.bind_walk_run.jpg)（1840×1450）；六张 preview 640×960 RGB，拍摄参数 / SHA 在 derive.capture.json；拼图仅列 manifest shots。
- python3 tools/model3d/dressup/{tests_fix_faces.py,tests_derive.py,selftest.py}：均退出 0，分别 12/12、10/10、7/7；获准补丁 patch --batch --fuzz=0 应用退出 0，近单位腿长 6 正例与 25 平移反例通过，见 validation.derive-suite.json。
- 六套 fix_inverted_faces.py --check、normalize_rig.py --check、export_skeleton.py --check 共 18/18 退出 0；四套 derive_template.py --check 4/4 退出 0，命令与输出见 validation.tests.json / validation.checks.json。
- pnpm install --frozen-lockfile：退出 0，8 workspaces，Lockfile is up to date / Already up to date；Node 22.22.1、pnpm 9.15.9、Python 3.11.0，沿用现锁，与 tech/01 的 24 / 12 目标差异未迁移。
- pnpm check：本轮以现有 dressup 共享槽只读 FD 排他 flock 持锁（标准入口的 a+ 被沙箱拒绝）后退出 0；189 文件 / 1339 tests、1777 内容文件、4 story tests；render-dressup 7.20/24 KiB gzip、dev-chunks PASS（735 assets / 94 manifest）；既有完整摘要见 validation.pnpm-check.json。

## 3. 关键结论与数值

- 女中等 SHA：e528b178bfb8070da36ea7f382aa9aa6ca64560cd312d04d281c832b8e8d733e → f7c6cfb1f7826f71610bfcf6d3af18e25afbcc3a4edf1149b365f03023782a94；8,575,592 B；男：d9db6f2d86979df28bf082e965eacfbe067ba5407e6754ddfd8d70211471b65d → aa2a1e95258a36555890d8095c75b1711978f30d8134fa45791d6e9889e91549；8,670,272 B。
- 翻正女 / 男 89 / 67 面；中心 y（mesh-local mu）在 [0,.1)、[.4,.5)、[.5,.6)、[.6,.7)、[.7,.8)、[.9,1) 的数量分别 20/8/6/2/49/4 与 11/7/27/2/13/7；前 50 面号见 inverted_faces.json。
- 一致：对 git HEAD 原始 GLB 只交换第 2 / 3 索引即可逐字节复现当前 body；女 / 男改 324 / 244 字节，572 / 583 个非索引 accessor、JSON、贴图不变；合成幂等通过、真实六体只读扫描为 0。中等按 1.66 / 1.81 m 导出，派生继承 unlit / UV / 权重 / 索引 / rotation 轨，rest/bind 最大差 4.975241e-7。
- 最新裁定：六套 section 环取 Neck→Head 15% 处真实截面；四型 --ring-from 源骨架；female small 经两环双调和修复翻向 73→0、最大修正 4.688317 mm，其余无需修正；法线按最小旋转处理，最终四型翻向 / 负点积面均 0。
- k 顺序 leg / spine / shoulder / arm；误差顺序身高 m / 髋比 / 肩比；位移为各自脚底归零后的 max / 门限（mu），环差为 x / z（mm）。

| 模板 | 各链 k | 实测身高 m / 髋比 / 肩比 | 规格误差 | 最大位移 / 门限 | 环差 x / z mm |
|---|---|---|---|---|---|
| tpl_f2_small | .9046391288 / .9895539036 / .9518503832 / .9518072289 | 1.580000009 / .515999986 / .163999996 | +9.205e-9 / −1.356e-8 / −3.881e-9 | .047631151 / .095261976 | 1.663824 / .065756 |
| tpl_f2_tall | 1.0845349120 / .9874790951 / 1.0296746718 / 1.0361445783 | 1.719999916 / .556000018 / .174000005 | −8.375e-8 / +1.790e-8 / +5.369e-9 | .039281109 / .071446482 | 1.835194 / .048088 |
| tpl_m_lean | .9581759046 / .9757981668 / .9618699859 / .9723756906 | 1.760000097 / .562999985 / .189999995 | +9.743e-8 / −1.468e-8 / −5.191e-9 | .027053652 / .054102115 | .879157 / .214406 |
| tpl_m_bulk | .9998333654 / 1.0999036747 / 1.0868873311 / 1.0276243094 | 1.860000114 / .552999982 / .209999993 | +1.142e-7 / −1.846e-8 / −7.010e-9 | .027094245 / .054102115 | .744687 / .493938 |

- 算式：heightRatio=目标 m/源 m；位移门限=max(.04,2×abs(ΔheightMu))；每轴环差=1000×abs(目标 radiusMu×目标 mPerMu−源 radiusMu×源 mPerMu)。三项比例误差最大 3.430117e-8；女短半径最小 .02511529 mu、男长宽比最大 1.2771485，原门未放宽。
- 男后脑面 103350 中心 (−.024326,.909200,−.038932) mu；同机位 140×140 ROI，bind / walk .6 / run .3 暗像素 111/109/107→0/0/0。翻前仅在浏览器内存还原原索引，交付 GLB 不回退；每套 1 draw call，六套共 1,179,507 三角。
- 参考资料（2026-10-11 curl 逐条核验）：[glTF 2.0 官方源码](https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/Specification.adoc) 小端索引与绕序；[KHR_materials_unlit](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_unlit) baseColor / doubleSided 语义；未新增服务版本、价格、配额断言。

## 4. 开放问题（附默认值）

- 已解决：上一轮颈环差 2.4–6.3 mm、派生负点积面 / 翻向，经 T5b section + --ring-from + 防折叠 / 法线处理全部通过（见 §3）。
- 已解决：tests_derive.py 原脚底差 >.001 mu 启发式误报 bulk（k_leg=.9998333654，脚底差 .0000815995 mu）。按 18:50 授权替换为全骨架与声明分骨缩放一致、顶点与 LBS + 防折叠 float32 逐位相等；近单位腿长 6 正例、25 平移反例通过，10/10 套件通过，Hips / 动画轨 / 无 rootOffset 原断言保留；补丁及临时说明已删。
- 派生 bind 脚底非 0：small/tall/lean/bulk 为 .044513240/−.039460193/.020477947/.000081450 mu；截图只在显示层归零且 walk 沿用此偏移。默认由切换任务核对运行时脚底 / Hips 根运动，不能直接复用静态展示偏移。
- 新男模头顶偏后细浅色贴图缝仍在，默认留给贴图任务；pnpm 9→12 工具链迁移另办；持剑 raw 源文件本工作区缺失，下游恢复清单记录的 SHA 后再归一。本次未重拍或启动服务，沿用 captureRun=5 的图片并核验 SHA。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；沿用 AR-104、T4b 规格与 T5b 裁定，保持 2 mm / 比例 / 位移 / 翻向原门。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

tech/10 §1.2–1.3、tech/11 §4/§10.T：登记六套 section 与新规格 / SHA、分骨缩放/LBS 精确回归口径；tests_derive.py 授权修复已完成，无需另排补丁任务；切换任务处理脚底与根运动。上述文档未改，命令及输入 SHA 见 §7。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 本次六套 fix / normalize / export --check、四型 derive --check 全过；65 骨 / rest=bind / 共拓扑 / unlit / 颈环两轴 <2 mm、清单 SHA / size / 源链 / 侧车闭合，既有图片与 captureRun=5 SHA 一致；三组 Python 套件、冻结安装及 pnpm check 全过。
- ✅ 仅白名单路径变化；旧 template_specs.json、tpl_f_*、derive / normalize / export / 基础库未改，测试仅应用获准补丁；未新增依赖、未调生成服务、未执行 git 状态变更命令；两个候选补丁文件已删。
- 交接：测试阻塞已解除，可用下列输入开展衣物 / 头 / 道具在 tpl_f2_* 上重贴合，验收后切默认模板；tests_derive.py SHA 739aa84ccfb9ad34cb07300c191a9840f2fbc0ca5ac9222222b490707086d09b。命令变量：D=assets/default/model3d/dressup; P=tools/model3d/dressup; T=$D/templates; G=$D/garments/eq_jinzhuang。
- 中等贴合输入 body SHA 为 §3 箭头右侧；女 skeleton bdc6a4ae59eb2667397b78e2d99ba1abf9bed49ed41c99839eb582377f8c04c1、ring e18dc8be1289abb8190fb90ea3f1a142781c42de3fef2786e05d952e792bb3b2；四型 body / 源 / 骨架 / 环 SHA 见各 manifest，旧环 fit 不复用。
- 衣物：python3 $P/refit_template.py --from-body $T/tpl_f_medium/body.glb --from-skeleton $T/tpl_f_medium/skeleton.json --to-body $T/tpl_f2_medium/body.glb --to-skeleton $T/tpl_f2_medium/skeleton.json --garment $G/eq_jinzhuang.glb --fit $G/fit.json --out $D/garments/eq_jinzhuang_f2 --json；GLB SHA 851f325c2b6e39714f4952bd103e49921ebef26c5d888f584a36bc6f9dd8cb70、fit 2be4f3803ecb151bdf814b9d9e16b2201ae2a73a71b95787bea2bedab4cbf23f；再从新 medium 贴 small/tall，重烘遮罩 / pose-skin / validate。
- 头：python3 $P/cut_head.py --source assets/default/model3d/npc_huangrong/model_rig.glb --template $T/tpl_f2_medium --id npc_huangrong --out $D/heads/npc_huangrong_f2 --json；源 SHA cc745165bf7798c35763a813b6cb0d54bb0d6e39cc35c58951e75c54c0ad1797，逐体型重切颈桥。
- 道具：恢复清单记录的 raw SHA d75b051dee5a4606b7f8c329c35a7958efbdeb86e28dcfc394075cdfa10526ac 后，python3 $P/normalize_prop.py apps/game/public/models/props/eq_longquanjian_raw.glb --class weapon --real-size-m .95 --rest-tilt-deg 60 --id eq_longquanjian --skeleton $T/tpl_f2_medium/skeleton.json --out $D/props/eq_longquanjian_f2 --json；其他道具用各自原始件 / 参数。全部 fit/report/头/衣物/道具及动作门通过后，下游再切 Character3dPage 默认模板与引用。
