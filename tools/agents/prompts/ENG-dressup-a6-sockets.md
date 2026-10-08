# 本任务：3D 纸娃娃换装 · A6 · 插槽坐标系约定修正 + 道具默认 gripAdjust（剑进手、斗笠戴正、挂件贴胸；AR-102 第 4、5 条）

本任务写代码并实跑。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md` **§4 新增的"插槽坐标系约定"**（本任务规格）、§5.2、§6、§11，`docs/tech/10-paper-doll-3d.md` §2.5 与 §3.2，A2 / A3 / A5 / B1a / B2 报告第 7 节，现有 `tools/model3d/dressup/{export_skeleton.py,normalize_prop.py,validate.py,ingest.py,textures.py,pack_glb.mjs}` 与 `packages/render/src/dressup/actor.ts`（只读：运行时把道具挂在 `socket · gripAdjust` 上）。

> 工具链口径（协调者 2026-10-08 07:25）：以根 `package.json` 为准——`packageManager: pnpm@9.15.9`、`engines.node >=22.12.0`（本机 Node 22.22.1）。公共说明 `_code.md` 里的 Node ≥ 24 / pnpm 12 是旧口径，与之不同**不算偏离**，报告注明一句即可，审核不得据此判 FAIL。

## 作者要求
**AR-102** 第 4、5 条：饰品自动缩放到合适大小、与人物结合；手能拿武器。协调者 2026-10-08 03:30 在本地 `/character-3d` 实测（三件道具经运行时挂上，`drawCalls=4`、`triangles=221846`）：**插槽位置都对**（gripR 紧挨右手骨、headTop 在头顶、chest 在前胸），**道具网格也对**（剑沿 +Y 长 0.59 mu、斗笠锥顶在原点开口 −Y、玉佩自原点下垂 0.047 mu），但**朝向全错**——待机姿势下剑身沿前臂竖直朝上、剑尖高过头顶并穿过肩头（剑 +Y 世界方向 ≈ (0.12, 0.99, 0.01)）；斗笠整个横躺（+Y 世界方向 ≈ (0.99, 0.00, 0.15)）；玉佩歪 23°。根因：`export_skeleton._frame_quaternion` 让插槽 +Z = 表面法线、+X = 骨局部 x 轴，而 `normalize_prop` 约定道具 +Y = 主轴，两边约定没对上（spec 原先漏写，协调者已补进 §4）。另外斗笠以外锥尖顶在头顶，头会穿出帽面；玉佩挂点在体表上，会嵌进胸口。

## 要做的事
1. **`export_skeleton.py`** 按 §4 约定重写插槽 `quat`：非握持插槽 bind 时与模板世界轴一致（`quat = inv(R_父骨,bind)`），`normalLocal` 改为在插槽系内表达；gripR / gripL 的 +Y = `Pinky1 → Index1` 去掉手指方向（`Hand → Middle1`）分量后归一、+Z = 掌心法线（PCA 最薄轴朝拇指侧）对 +Y 正交化、+X = Y × Z。**插槽 `pos` 与 skeleton.json 其余所有字段逐位不变**（neckRing / measures / regions / fingerPose / skullProfile / bindWorld 等；用 JSON 逐键比对证明，写进报告）。`--check` 增加约定校验：非握持插槽 bind 世界旋转与单位阵差 < 1e-5；握持插槽三轴正交、det = +1、+Y 与 Pinky→Index 夹角 < 1°（去掉手指分量后）。
2. **重导三套模板**：`export_skeleton.py --body templates/<id>/body.glb --out templates/<id>` 跑 tpl_f_medium / tpl_f_small / tpl_f_tall（body.glb、regions.npy、skull_profile.json 不得变化；只有 skeleton.json 的 sockets 变），更新各自 `manifest.yaml` 里的 `skeletonSha`（如有）与 notes。
3. **`normalize_prop.py`** 按 §4 写默认 `gripAdjust`（需要模板时读 `--skeleton` 及同目录 `skull_profile.json`）：
   - weapon：在掌面内把刃向朝手指方向转 `--rest-tilt-deg`（默认 40°；正负号由"转后 +Y 与手指方向夹角变小"确定），记 `fit.json.restTiltDeg`；
   - hat：沿插槽 +Y 抬到"颅骨轮廓全周间隙 ≥ 3 mm"的最低位置（对颅骨轮廓各行的 x / z 半径椭圆采样点做竖直射线，找帽子内表面最低交点；帽檐外的点不约束），记 `fit.json.clearanceMm`（实测最小间隙）与 `liftMu`；
   - pendant / pouch：沿插槽 `normalLocal` 外移"物件沿法线半厚 + 2 mm"，记 `offsetMm`；
   - 其余类别 gripAdjust 保持单位。
4. **重做三件道具**：按 A5 报告记录的同一套参数（class / realSizeM / gripRatio / keep 等，从各自现有 `fit.json` 读）对 `item_qingfeng_sword` / `item_bamboo_hat` / `luxury_jade_pendant` 重跑 `normalize_prop.py` → `textures.py` → `pack_glb.mjs` → `validate.py` → `ingest.py`，`status` 与 report.level 一致（应仍是 approved → candidate）；GLB 几何应与现有逐位一致或只差打包噪声（报告写对比）。
5. **`tools/model3d/dressup/check_sockets.py --template <dir> --props <dir>… [--json]`**（新增，退出码 0 / 2）：对模板 idle / walk / run 各采 24 帧（与 `validate.py` 同一套采样与 LBS，直接用模板 clip），计算每件道具的世界位姿并判定：
   - 剑：握点到右手掌心（gripR 原点）距离 < 1 mm（定义上为 0，校验插槽链）；bind 时刃向与"Pinky→Index 刃向转 restTilt 后"夹角 < 1°；全部采样帧剑身顶点到模板体表带符号距离 < −5 mm（插进身体）的占比报出来（预期 0，若握拳指骨与剑柄交叠属正常，只统计刃身段）；
   - 斗笠：bind 时 +Y 与世界上夹角 < 2°；颅骨间隙 ≥ 3 mm；全部采样帧帽子顶点在头部区域（regions=head）体表内的数目 = 0；
   - 玉佩：bind 时 +Y 与世界上夹角 < 2°；全部采样帧到模板体表带符号距离 < 0 的顶点数 = 0；
   - 输出每件的最小 / 中位数值与是否通过，写 `<prop>/sockets_check.json`。
6. **测试**：`tests_skeleton.py` 加约定校验用例（合成骨架上非握持插槽 bind 世界旋转 = I、握持插槽轴向与 Pinky→Index 一致、左右手 det = +1）；`tests_prop.py` 加 weapon 倾角符号、hat 抬升（合成球形颅骨 + 圆锥帽：抬升后间隙 = 3 mm ± 0.1）、pendant 外移用例；`check_sockets.py` 在三件真实道具上退出 0。

## 协调者裁定（2026-10-08 05:00，依据审核 r1）
- **武器动态深穿门禁**：通用 idle / walk / run 不是持械动作，1 m 长剑随摆臂扫过大腿 / 髋部，做不到 0。改为与衣物同一分级：全部 72 帧刃身顶点采样中"带符号距离 < −5 mm"的占比 **approved ≤ 0.5%、draft ≤ 2%、> 2% 判 fail（退出 2）**；`check_sockets.py` 必须如实判定（删除豁免），级别写进 `sockets_check.json`（`level`）与该道具 manifest 的 notes；`status` 取 validate 与 sockets_check 两者中较低的级别。
- **`restTiltDeg` 默认值**：在 {0, 20, 40, 60} 度与反握（刃向朝前臂方向，约 −150°）中按"动态深穿占比最小"选取，各候选数字写进 `sockets_check.json.tiltSweep` 与报告；选定值写入 fit.json。
- 持械专用动作（armed idle / walk / run）留给后续阶段，届时把武器深穿收紧到 0。
- 审核 r1 的其他意见照做：全部待判顶点用严格最近三角带符号距离（或证明不漏报的保守宽相）；斗笠按 `regions=head` 的三角判定；补"最近顶点与最近三角符号不一致"回归测试；报告第 7 节写交接约定。

## check_sockets 速度（协调者 2026-10-08 10:25）
第 7 次运行后的严格逐点版本协调者实测要 **24.7 分钟**（三件全过），加上机器睡眠导致校验超时。要求：全量严格计算（全部顶点 × 72 帧 × 三件，以及 tiltSweep 各候选）在本机 **≤ 5 分钟**完成，报告写实测耗时。做法：直接用 A1 `common.nearest_triangle` / `signed_distance`（k 候选 + 包围半径扩候选，结果精确，无需自造宽相）；每帧只对刃身 / 帽身 / 挂件顶点查询，模板体表三角按帧 LBS 一次后建树复用；tiltSweep 各候选共享同一组帧的体表树。不得为提速降低精度或抽样。

## 作者实测反馈（2026-10-08 10:50）与协调者补充要求
作者在 5173 原话："挂载点不对，斗笠斜着的，剑不是手握着，而且尺寸偏宽。"（作者看到的是主干上的旧插槽；协调者把本任务产物临时挂上复核：斗笠已扶正、玉佩贴胸，**但剑握在鞘尖**——护手与红剑穗在远端。）
1. **剑柄端判定错了**：青锋剑是带鞘整体，鞘尖比护手一端更窄，"窄端 = 柄"把方向判反。改 `normalize_prop.py` weapon 柄端判定：沿主轴做宽度剖面，找距端点 5%~30% 内的**护手峰**（宽度局部极大且 ≥ 1.4 × 两侧邻段中位宽），护手外侧（较短的一侧）为柄；找不到护手峰才退回"窄端 = 柄"；把判定依据（剖面、峰位置、所选端）写进 fit.json。补测试：合成"细长鞘 + 护手 + 短柄"的带鞘剑，断言柄端在护手外侧。
2. **尺寸**：作者嫌宽。青锋剑 `realSizeM` 由 1.0 改 0.9（宽度随之等比缩小），fit.json 记录。
3. 改完重跑青锋剑全流程（normalize_prop → textures → pack → validate → ingest）与 tiltSweep（握对端之后各倾角的深穿要重算，按已有裁定取深穿最小者），三件 `sockets_check.json` 重生成；报告写清前后对比（握点到护手的距离、刃向、倾角选择）。
4. 斗笠帽檐压到眉眼：保持现有颅骨间隙算法，报告里记一句"帽檐最低点相对眉弓的高度"，供作者判断是否要再抬。

## 作者裁定（2026-10-08 11:05，覆盖上一节第 1~3 条里关于青锋剑握持的部分）
作者原话："剑拿反了。而且如果拿手里，应该是拔出来的状态，挂在腰上才是放到剑鞘的状态"。据此：
- **武器分两态、两个资产**：持（出鞘剑，握 `gripR`，slot `mainHand`）与佩（入鞘剑，挂腰 `waistL`，slot `waist`）。现有 `item_qingfeng_sword` 是**带鞘整剑**，只能作"佩"：改挂 `waistL`，**不再挂 gripR**；出鞘的持剑资产由后续任务用龙泉剑物品图另行生成。
- **佩剑姿态**（写进该件 fit.json 的 gripAdjust，并记录参数）：柄端朝前、略向上，鞘身沿身体左外侧向后下斜挂，鞘轴与水平面约 35°、与身体左侧面平行并外移到不与髋 / 大腿相交；柄端判定仍按上一节的"护手峰"规则（护手外侧为柄）；`realSizeM` 0.9。
- check_sockets 对佩剑的判定：bind 时柄端朝前（柄端点 z 坐标 > 鞘尾 z）、鞘轴与水平夹角 35° ± 5°；72 帧鞘身顶点深穿按衣物分级（approved ≤ 0.5% / draft ≤ 2%）；若 35° 下 walk / run 摆腿扫到鞘身超过 draft，可在 25°~50° 间取深穿最小者并记录 sweep。
- 原"持剑倾角扫描（tiltSweep）"对本件取消；gripR 插槽约定（+Y 刃向 Pinky→Index、+Z 掌心法线）保留，供后续出鞘剑使用，check_sockets 的握持检查对"slot mainHand"的件才执行。
- manifest：本件 `slot: waist`、`socket: waistL`，notes 写"入鞘·佩剑态"。

## 协调者补充（2026-10-08 12:42）
`apps/game/build/dressup-assets.test.ts` 的"indexes template metadata and prop sockets, then loads all real packed props"用例把真实道具插槽写死为 `['chest','gripR','headTop']`；青锋剑按作者裁定改为佩剑态挂 `waistL` 后应为 `['chest','headTop','waistL']`。本任务写集已加入该测试文件，**只允许**改这一处期望（最好改成从各件 manifest / fit.json 读出期望值，而不是再写死），其余用例不动。

## 约束
- 只写 `tools/model3d/dressup/{export_skeleton.py,tests_skeleton.py,normalize_prop.py,tests_prop.py,check_sockets.py}`、`assets/default/model3d/dressup/templates/{tpl_f_medium,tpl_f_small,tpl_f_tall}/{skeleton.json,manifest.yaml}`、`assets/default/model3d/dressup/props/**` 与本任务报告。
- 不改运行时（`packages/**`）、不改 validate / ingest / textures / pack、不改 fit_garment / refit / derive；不加依赖；不改门禁阈值；不花 Tripo 点数。
- `normalize_rig.py --check` 与 `export_skeleton.py --check` 对三套模板都要通过。

检查：
- `python3 tools/model3d/dressup/tests_skeleton.py`
- `python3 tools/model3d/dressup/tests_prop.py`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_f_medium`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_f_small`
- `python3 tools/model3d/dressup/export_skeleton.py --check --out assets/default/model3d/dressup/templates/tpl_f_tall`
- `python3 tools/model3d/dressup/check_sockets.py --template assets/default/model3d/dressup/templates/tpl_f_medium --props assets/default/model3d/dressup/props/item_qingfeng_sword assets/default/model3d/dressup/props/item_bamboo_hat assets/default/model3d/dressup/props/luxury_jade_pendant`
- `python3 tools/model3d/dressup/selftest.py`
- `pnpm install --frozen-lockfile`
- `pnpm check`

## 报告
第 3 节写：新旧插槽 quat 对比（每插槽 bind 世界旋转与单位阵的角度差）、skeleton.json 除 sockets 外逐键不变的证明、三件道具 gripAdjust（restTiltDeg / clearanceMm / liftMu / offsetMm）、check_sockets 每件数字、GLB 对比；第 7 节写给 B 系列运行时与 C2 Skill 手册的约定说明（道具作者如何定义新类别的 gripAdjust）。报告 ≤ 60 行。
