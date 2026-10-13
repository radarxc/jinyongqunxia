# ENG-actor3d-a1-core 报告 · 城镇 3D 人物 · 运行时骨架 actor3d（类型、资产目录、步态与播放率、身高缩放）
## 1. 摘要（3–6 行）
- 新建 `actor3d` 纯逻辑骨架：规范类型、静态资产目录、LOD、步态/播放率/追赶/转身、HeadTop 身高缩放。
- `createActorPort` 明确抛 `ACTOR3D_NOT_IMPLEMENTED`，未越界创建 a2 的 GPU/加载文件。
- 返修加入真实缓出与顺序无关的主角 LOD0 保证；5 个测试文件 23 项，全部门禁通过。
## 2. 产出（文件、行数、主要章节）
- 源码 5 文件 / 251 行：`types.ts` 76、`catalog.ts` 82、`gait.ts` 60、`stature.ts` 11、`index.ts` 22；测试 5 文件 / 286 行。
- `pnpm install --frozen-lockfile`：通过（645 ms）；专项 Vitest：5 文件、23 测试通过（3.04 s）；render typecheck：通过。
- `pnpm check`：通过；278 文件 / 2328 测试（109.22 s），1793 内容文件 / 1720 对象、4 Ink/65 地图有效，故事 4 测试通过，size/dev-chunks PASS，actor3d 0.00/16 KiB。
## 3. 关键结论与数值
- 一致处：播放率 `clamp(v/(hps*h),0.80,1.45)`；身高 1.58/1.66/1.72/1.76/1.81/1.86 m 的走率为 1.396/1.329/1.282/1.253/1.219/1.186，跑率为 1.329/1.265/1.221/1.193/1.160/1.129。
- 滞回：静止 `<0.05`；走转跑 `>2.6`；跑转走 `<2.2`；缺省原生步速走 0.612、跑 2.143 身高/秒。
- 追赶：落后 `>0.5 m` 固定 1.15 倍，路线速度与播放率同乘；转身取最短弧、两帧 smoothstep 缓出，上限 `3π rad/s = 540°/s`；180°/1⁄3 s 是 20 帧 × 9° 的饱和特例。
- LOD：低档 0 名全 LOD1；中档仅 player LOD0；高/极致永久保留 player，另给 2/5 个非主角名额，总数仍为 3/6，遍历顺序无关。
- 身高只算 `heightM/statureMu`；数据身高超出 1.2–2.3 m 抛 `ACTOR_HEIGHT_RANGE`，绝不从包围盒推断。
- 偏离处：spec 未定义 `ActorStats` 字段，采用 actors/visible/drawCalls/triangles/fullDetailActors/failures 最小只读集合；未改已定接口。Three 官方 `AnimationMixer.update(deltaTime)` 于 2026-10-12 联网核实：https://threejs.org/docs/pages/AnimationMixer.html 。
## 4. 开放问题（附默认值）
- `ActorStats` 尚无文档字段表；默认沿用本报告 §3 的六字段，a2 若需缓存字节数应先补契约。
- 追赶曲线未规定；默认过 0.5 m 即 1.15 倍，不在 render 猜测渐进规则。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/16` §9.1 / 后续文档任务：补 `ActorStats` 六字段，消除 a2 猜测。
- 无；§9.6 的高/极致 player LOD0 与 3/6 总名额已由保留名额实现。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 仅改写集；无依赖、素材、package/lockfile、门禁阈值改动；源码均 ≤400 行。
- ✅ 类型复用 dressup 导出；纯函数不 import Three；HeapProfiler 预热 1 万次后连续 3 个采样窗零增长。
- ✅ 12 格播放率、夹取、滞回、追赶、连续帧缓出/最短弧/540°、身高范围、目录回退、顺序无关的四档 LOD 均有数值断言。
- ✅ a2：实现 `port.ts/cache.ts/actor.ts/shadow.ts/pick.ts`；从 `town.json` 的 `lod/clipsUrl/statureMu/nativeHps` 组装 `ActorAssetSet`；每帧调用 `mixer.update(dt * gaitPlaybackRate(...))`。`fullDetailSlotsUsed` 只计非主角 LOD0，player 不计且始终保留。
- ✅ TOOL-actor3d-t1-lod：`town.json` 保持 `statureMu: number`、`nativeHps: { walk: number, run: number }`（身高/秒），LOD 数组顺序固定 0/1。
- ✅ 高/极致主角无需先处理：调用顺序不影响 player LOD0 或 3/6 总上限。
