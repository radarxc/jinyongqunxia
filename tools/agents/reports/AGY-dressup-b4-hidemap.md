# AGY-dressup-b4-hidemap 报告 · 3D 纸娃娃换装 · B4 · 运行时身体遮罩 + 挂头 + 预览开关（agy；AR-108 V2 / V4）
## 1. 摘要（3–6 行）
落实两轮返修：遮罩独立于身体底图合成，逐像素 max，数据纹理与 UV 设置修正。
补齐遮罩引用释放、后台失败展示、无 this 的挂头、单头替换与肤色恢复。
预览按模板选变体、换模板恢复装备，发布遮罩 PNG 与 head fit，保留既有功能。
根 pnpm check 全过；包内串行复查仅既有 rig 性能门未过，浏览器视觉验收待协调者。
## 2. 产出（文件、行数、主要章节）
- render 源码：dressup/{types.ts 200、materials.ts 148、actor.ts 601、runtime.ts 6}；类型、shader、合成/缓存、头与生命周期。
- render 测试：hide-map.test.ts 200（新增）、materials.test.ts 70、actor-runtime.test.ts 341、actor-layers.test.ts 121；CLAUDE.md 162（API/参考资料）。
- game：build/dressup-assets.ts 230、dressup-assets.test.ts 766、content-plugin.test.ts 187（仅 fit 桩合法 JSON）；src/pages/Character3dPage.vue 2447。
- pnpm install --frozen-lockfile：退出 0，锁文件无需更新；实际 Node 24.13.0 / pnpm 9.15.1（根声明 9.15.9，未改依赖/工具）。
- pnpm --filter @tianshu/render test：227/229 通过；dressup P95 2.425 ms / rig 1.724 ms 失败。
- 同命令追加 -- --no-file-parallelism --maxWorkers=1：228/229 通过，dressup 过；rig P95 0.836 ms 仍未过 <0.8 ms（负载仅诊断，不豁免）。
- pnpm check：退出 0；187 files / 1331 tests，内容 1777 files / 1708 objects / 2 Ink / 65 maps，剧情编译测试 4/4。
- pnpm --filter ./apps/game build、pnpm size：由 check 实际依次执行并退出 0；dev-chunks PASS assets=667 / manifest=94。
- python3 tools/lint/check_ids.py --strict：退出 1，359 files / 15674 definitions，4 个新增类别未定义引用，均在未修改的上游文档。
- git diff --check：通过；未改写集外文件、未运行 git 状态变更命令、未改 node_modules / store。
## 3. 关键结论与数值
- API：equip(kind=head)、setHead(url|null,{skinTint})、setHideMapEnabled(on)，新增可注入 hideMapCompositor / templateId；stats.hideMaps / hideMapSize? / hideMapError?。
- 合成：最大遮罩边长 S，Canvas 平滑缩放至 S×S 后红通道逐像素 max；NoColorSpace、flipY=false、LinearFilter、无 mipmap；RGBA8 约 S×S×4，1024²=4 MiB。
- 缓存：复用 B3 模块级引用计数机制，独立 hidemap 键含模板 ID/body URL、有序 ID/URL/声明 size；末位释放与过期 Promise 均 dispose，空集关闭采样。
- shader：onBeforeCompile 声明 USE_UV/uHideMap/uHideMapOn，红通道 >0.5 discard，与 uHideMask 独立；固定 program key；颜色与 customDepthMaterial 同步。
- 头：按骨名重映射、显式 bindMatrix，不改 IBM；新头替换旧头，颜色乘原色，卸头恢复；setHead 使用闭包 equip，支持解构。
- 一致：动态 dressup 入口、既有 three 核心 API、update(dt) 与基点逐字一致。尺寸/错误 stats 仅事件时变更；分配采样方法本轮未改。
- pnpm size 前→后：B3 报告基线 render 166.66 / dressup 4.66 KiB；续作前已有构建实读 166.66 / 5.33；最终 166.66 / 5.90，render 净增 0，dressup <24。
- 技术取舍：actor.ts 延续既有单文件结构达 601 行，超过“尽量 ≤400”软建议；仓库未安装 fast-check 且禁止加依赖，采用真实尺寸、像素数值与并发/释放测试。
## 4. 开放问题（附默认值）
- V2/V4 视觉结果待实测；本副本真实 fit 尚无 G1 hideMask，head 分组暂无 D1 素材。默认由索引自动接入，以夹具证明运行时路径。
- rig 性能门仍失败；默认保留 <0.8 ms 与全部采样，交协调者在低负载复测，不宣称包内测试全绿。
- 校验信号量因沙箱禁止创建 .agents/slots 而失败；本轮串行执行检查，调度器校验时须按正常信号量再跑。
- 已解决：旧报告 content-plugin 桩 JSON、遮罩合成与异步失败问题（见 §2–3）；分配采样已由 ENG-dressup-alloc-steady 修复，本轮全量通过。
- 已解决：头分组在允许修改的页面接线；useDressupIndex 无需为本任务修改，后续可统一收口类型。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- tech/11 §8 与 tech/12 V2/V4：后续登记 B4 API、独立 max 合成和浏览器验收结果；本任务不改上游文档。
- 严格 ID 检查：author-requirements.md:1986 的 ch02_scene_yideng_heals_iron_palm_wound / ch03_prime_base、tech/11:248 的 eq_xianxia_liuxianqun、tech/10:87 的 npc_dir；docs/README.md:185 的 sk_babuganchan 为已知项。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 2048 底图 + 1024/512 遮罩无尺寸异常，输出 1024；四角像素 96/64/255/255，边缘插值 112/207；无遮罩 shader 关闭。
- ✅ 假合成器计数覆盖并集顺序、模板/URL/size 缓存区分、跨 actor 共享、卸装/销毁/过期释放、开关、错误重试，无未处理 rejection。
- ✅ head fit/PNG 发布夹具、PNG 文件头实际尺寸=fit.size；真实索引逐件校验同规则；坏 fit JSON 仍抛错。
- ✅ 头共享骨架、bindMatrix/IBM 保持、单头替换、肤色乘法与卸下恢复、解构 setHead 测试通过。
- ✅ Python 用例 300 s 上限保留；未跳过测试或放宽门禁；根 check/构建/size 通过。⚠️ 包内 rig 性能失败如 §2。
- ⚠️ 协调者实走 5173 /character-3d → 换装 v2 → 穿劲装 → 身体遮罩开/关 → 看领口、袖口、衣摆；三模板各跑 idle/walk/run，确认无黑洞/穿模。
- ⚠️ 再选头、换头、卸头，检查颈环/肤色；window.__dressup.hideMapError 应为空，hideMapSize 随当前遮罩；GPU draw/帧时与视觉门未以 Node 测试冒充。
