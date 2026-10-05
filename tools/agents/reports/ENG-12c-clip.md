# ENG-12c-clip 报告 · 游戏工程 · 动作原型 P8–P9 · 片段驱动的 rig 运行时（clip 加载 / 投影 / 播放器、playClip、/rig-demo 开关、金样与性能测试，AR-29）

## 1. 摘要（3–6 行）
- 已交付严格 clip 加载器、零分配投影器、一拍二播放器及 `RigInstance.playClip/stopClip`，程序步态与片段共用 `PartPose` 写入口。
- `clip-map.yaml` 已覆盖 10 个动作键；`/rig-demo` 已提供片段选择、程序/动作库 A/B、八向轮播、剑招与事件日志。
- Python 金样、Q4/Q6、事件/速率/淡入淡出、R15、零分配存储与 2 draw call 均有回归；四条强制检查全绿。
- 独立 100 人片段门禁 best P95 为 0.753 ms；主角正式切件尚未交付，故成品动图与作者 Q8 判定如实保留为开放项。

## 2. 产出（文件、行数、主要章节）
- 新运行时：`clip.ts` 183 行、`project.ts` 181 行、`clip-player.ts` 107 行、`clip-map.ts` 38 行；含严格校验、预分配解码、FK/视图/z/剑轴和播放状态机。
- 新测试：`clip.test.ts` 62 行、`project.test.ts` 137 行、`clip-player.test.ts` 107 行、`clip-map.test.ts` 25 行、`character-clip.test.ts` 83 行。
- 接入：`character.ts`、`types.ts`、`manifest.ts`、`scene.ts`、两级 `index.ts`、`performance.test.ts` 与 `rig.test.ts`。
- 数据与演示：`content/anim/clip-map.yaml` 25 行；`apps/game/src/rig-demo.ts` 87 行及 `style.css` 控件样式。
- 契约：`packages/render/CLAUDE.md` 112 行；普通检查与独立性能门禁口径已按 AR-33 对齐。

## 3. 关键结论与数值
- 投影金样：`clip_walk` 8 帧 × 8 方向 × 4 关节，与 Python 半值远离零结果最大误差 **0 px @128 ppm**（门槛 ≤2 px）。
- Q4：八向所有肢体渲染缩短下限实测 **0.45**；Walk 躯干切换 `[2,0,0,0,2,0,0,0]`，按 1.667 s 核算最大 `2/1.667=1.200 次/s`（≤8）。
- Q6：Sword_Attack 剑轴最大偏差 **0.485°**、握点最大误差 **0.695 px**；`sword_regular` 默认映射该合格片段，失败样本 Regular_A 不发布。
- 播放：固定 12 fps；淡入/淡出各 160 ms 墙钟时间；移动速率 `speed/nativeSpeed` 仅 `[0.8,1.4]` 使用；根运动不写 core。
- Q7：独占 `pnpm check:perf` 启动 loadavg `9.85/9.92/9.08`（12 CPU）；片段三轮 P95 `0.854/0.804/0.742 ms`，best **0.742 ms <0.80 ms**。
- Q7：100 人 / 1,600 实例仍为 **2 draw call**；稳态投影为 **0 B/帧契约**（输出对象、全部 typed array、每个 `PartPose`/affine 子视图身份不变，热路径无构造；未用采样堆工具冒充精确测量）。

## 4. 开放问题（附默认值）
- Q8：仓内只有主角三视图整张 sheet，尚无 39 张正式切件及可加载 manifest；默认先以 `/rig-demo` 占位 rig 做运行时 A/B，待 TOOL-rig-sheet 交件后录制“主角·男 Walk + Sword_Attack”动图请作者判定。
- C8：作者尚未裁定程序步态或动作库 Walk；默认保持程序步态，动作库 Walk 仅由 A/B 开关启用。
- 真机 GPU/观感尚未实测；默认不据 Node CPU 门禁宣称手机帧率。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无新增；实现遵循 AR-29、AR-33 与 `tech/09` §4.6、§5、§8，未改建议值或性能阈值。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `TODO.md` / ENG-12c-clip：登记 P8–P9 代码与门禁完成，Q8 仍待正式切件和作者判定；由调度器同步，本任务未越界修改。
- `docs/tech/02` / `CueApi.playAnim`：ENG-10/ENG-11 接线时只把 `hit/end` 用于 VFX/SFX/cutin，不得反推玩法命中。
- `docs/tech/09-roadmap.md` / 动作原型：记录 `sword_regular → clip_sword_attack` 的生产默认和 Regular_A Q4 失败样本处置。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `tianshu-clip.v1` 严格字段/骨架/许可/Base64/长度/事件校验，枚举错误；只有本加载器验证过的对象可直接注册。
- ✅ 投影顺序、目标 rig 骨长、镜像左右轨迹、10° 滞回、0.45、肩宽、动态 z、剑轴与 Python 金样均覆盖。
- ✅ 一拍二、循环/单次、事件、160 ms、速率边界/回退、原地根、动态近手镜像、±30° 偏航辅助均覆盖。
- ✅ `playClip(id, options)` / `stopClip()` 已导出；TOOL-rig-sheet 提供 `tianshu_humanoid.v1` + `boneLengthsM` 即可替换占位 rig。
- ✅ ENG-10/ENG-11 接口：`playClip(id,{facingYawDeg,rate?,movement?,nearHandWeapon?,yawAssistMaxDeg?,onEvent?})`；`hit/end` 只进表现。
- ✅ `clip-map.yaml` 键：`walk/sword_regular/sword_attack/idle/hit/fall/meditate/dodge/punch/run`；未知键（含原型链键）硬失败。
- ✅ 零分配存储身份、2 draw call 与 R15 core 边界有测试；未新增依赖、未改门槛、无高负载跳过。
- ✅ `pnpm install --frozen-lockfile`、`pnpm check`（113 文件/717 用例）、game build、strict ID（新增失败 0）、`pnpm check:perf` 全通过。
- ✅ 只改授权路径，未执行改变仓库状态的 git 命令；`git diff --check` 通过。
- ⚠️ 主角正式 rig/GIF 不在当前可用输入与写集内，Q8 观感尚待 TOOL-rig-sheet 与作者；未冒充完成。
