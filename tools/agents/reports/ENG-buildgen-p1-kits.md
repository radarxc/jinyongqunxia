# ENG-buildgen-p1-kits 报告 · 城镇 3D 古建 · 年代套件 schema 与编译 + song_dali / xiyu（唐代佛教变体）+ 按城套件表
## 1. 摘要（3–6 行）
- 完成 `buildkit.v1` Zod 边界、整数范围校验、25 类型闭合、单跳 alias 展开和递归键规范排序。
- 新增 `song_dali`、`xiyu` 两套 16 层试点套件及三城覆盖表；吐鲁番 ch10 指向 `xiyu:tang_buddhist`。
- 通用内容发现器已排除构建期 `content/town/buildkits/`，并有仓库实扫回归测试。
- 审核返修已完成：公开完整契约、真实跨包断言与西域出檐/椽头语义均已校正。
- 四条检查全部通过：定向 8 文件 / 137 测试，全量 224 文件 / 1698 测试。

## 2. 产出（文件、行数、主要章节）
- `kit/{schema,compile}.ts`（约 250 行）：源 schema、按城表 schema、范围/alias/闭合校验、规范编译与序列化。
- `types.ts`：`CompiledBuildKit` 本身补齐配方、尺寸、墙面、调色、变体和全部 render 必需字段。
- `kits.test.ts`：YAML、25 类型、§3 数值、唐式禁用、16 层、稳定性/体积、alias 反例与发现排除。
- `content/town/buildkits/{song_dali,xiyu,city-kits}.yaml`（145 行）：两套件与三城表。
- `build/discover.ts`（84 行）：跳过由城镇编译管线读取的 `content/town/buildkits/` 子树。
- `testing/index.ts`、`plan-building.test.ts`：p0 盒子测试改用编译后的完整 `song_dali` 套件。
- `town-contract.test.ts`、render export：真实 `CompiledBuildKit → BuildKitView` 类型断言及两套运行期键检查。
- 实跑：install、定向 8/8 文件与 137/137、data typecheck 均通过；跨包定向 9/9 文件与 140/140 通过。
- 全量 `pnpm check` 退出 0：224/224 文件与 1698/1698 测试、内容/故事/build/size/dev-chunks 全通过。

## 3. 关键结论与数值
- `song_dali`（tech/16 §3「民居/店铺」「中档」「殿堂」行）：台基宅/店/中/殿 300/150/300/900；柱 2800/3000/3200/4200；出檐 700/800/900/1300；举高 bp 2625/2625/2700/3330；翼角 180/120、300/220、480/360；土坯山/后墙 350、裙肩 800；方翘头脊 550。
- `xiyu`（同表「西域土坯」列）：台基 150；平顶柱高 3200/3300/3400/3400；墙厚 450–600；出檐 0、椽头外挑 300；排水坡 200 bp；女儿墙 450、椽距 600；门 2200×1000/1200；窗台/头/宽 1400/2000/600。
- 两套件 `wharf` 均明确 `unsupported`：r0 注册表没有水岸专用配方，映射 stall 会把码头误作摊棚；xiyu 的 `market`、`palace` 按要求直接用 adobe 配方。
- `tang_buddhist`：`forbid=[dome,pointed_arch]`、`finial=tang_stupa`；寺院/官署配方标出 `tang_wood_eave`。
- 编译 JSON：`song_dali` 5,057 B，`xiyu` 5,005 B；均 ≤12 KiB，重复编译 `JSON.stringify` 逐字节相同。
- 与文档一致：mm/bp 全整数、图层顺序即下标；data 不 import render，跨包测试证明公开完整契约可直接赋给 `BuildKitView`。

## 4. 开放问题（附默认值）
- `BuildKitView` 没有当前激活变体名，只有 `variantSets`：默认下游由 `visualKit=xiyu:tang_buddhist` 拆分 kit/variant，并随方案传递选择；本任务只编译变体集合。
- 唐式佛塔刹顶在 schema 中只有 `finial` 名称，无尺寸分段；默认 r5 按 tech/16 §5.1 第4条实现几何。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 已解决：`packages/data/src/build/discover.ts` 已跳过 `content/town/buildkits/**`，套件由城镇编译管线独立读取；回归测试与全量内容校验均通过。
- `docs/tech/16` §4.3 / YAML 草图：把 rise/palette/batter 的小数示例改成 bp 整数，把 `repeatM` 改成 `repeatMm`，与本文任务硬约束一致。
- `tools/agents/prompts/TOOL-town2-sources-pipeline.md` / city-kits 读取：使用 `parseCityKitMap()`；当前文件是按规范要求的裸映射。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 两套 YAML 经 Zod/范围校验；恰 16 层；两套 25 类型全部展开，未知/缺失/alias→alias/alias→不存在均拒绝。
- ✅ §3 数值逐档断言；西域柱径由 `column/diaRatio` 为 228–242 mm；出檐 0 与椽头外挑 300 分项测试；唐式禁 dome/pointed_arch。
- ✅ 规范键排序；直接 `JSON.stringify(compileKit(...))` 两次同字节；体积 5,057/5,005 B。
- ✅ 三城覆盖仅大理 ch01/ch10 与吐鲁番 ch10；未列城市留给下游按类型名前缀回退。
- ✅ `pnpm install --frozen-lockfile`、定向 Vitest 8 文件 / 137 测试、data typecheck、全量 `pnpm check` 均通过；全量 224 文件 / 1698 测试。
- ✅ 发现结果不含 `content/town/buildkits/`；全量运行时内容校验 1777 文件 / 1708 对象 / 2 Ink / 65 地图通过。
- ✅ p2 交接：按 recipe 读 `archetypes[name]`，按 `size` 取 `dims[size]`；rise/batter/palette 抖动均 bp。网格器交接：`layers[0..15]` 下标稳定，材质名通过 layer id 查下标；`variantSets[variant]` 决定禁用屋顶/洞型与 finial。
- ✅ `BuildKitView` 未发现网格器必需字段缺口；共享槽锁因沙箱无主仓写权限未取得，直接 `pnpm check` 已退出 0。
