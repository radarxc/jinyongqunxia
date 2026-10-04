# ENG-battle-generic-model 报告 · 游戏工程 · 战斗单位用 3D 模型（AR-85）：有专属模型用专属，没有的人类单位按性别用通用模型 npc_generic_m / _f（未到位时用普通形象男女主角模型顶替，只换资源不改代码）；单位旁显示可区分的标识（design/26，竖屏可读、不遮挡）；模型按引用发布、懒加载；补测试
## 1. 摘要（3–6 行）
完成数据驱动的“专属 → 按性别通用 → 同性主角退路”选型；非人单位继续使用 2D。
战斗按需加载共享 3D 模型，接通待机/走/跑与移动；任一加载失败时纸偶继续可用。
所有单位常显头像圆框姓名牌，390 px 竖屏维持可读并避开格心、浮字。
按章节引用发布 8 个 GLB；测试、构建、尺寸门禁通过，真浏览器 GPU 帧时受沙箱限制未实测。
## 2. 产出（文件、行数、主要章节）
- 解析/发布：`apps/game/build/battle-model-assets.ts`（182 行）及测试（111 行）；manifest 目录 catalog 即映射表，两种命名均由 `decodeModelDirectory` 解析。
- 渲染：`packages/render/src/battle/model-stage.ts`（198 行）及测试（131 行），并装配 `scene.ts`；GLB 缓存、骨架克隆、材质/几何共享、动作和 2D 降级。
- UI/运行时：`model-selection.ts`、`unit-label.ts`、`BattleField.vue`、`battle.css`；schema 与 ch00/ch10 三名参战 NPC 补 gender。
- 构建：`content-plugin.ts` 注入章节 catalog、按引用复制资源，并把 glTF/骨骼/动作放入非递归懒加载组。
## 3. 关键结论与数值
- gender 来自 `npc.identity.gender`（模板可给 `gender`）；阿青/李文秀=female、沈青禾=male。M1 参战人类 NPC 无缺值；`tmpl_normal` 缺值，按 male；白猿为 animal，保持 2D。
- `npc_generic_m/f` manifest 已存在，直接选正式通用模型；任一缺失时自动选 `npc_zhujue__ch00_m/f`，资源恢复后零代码改动。
- 身高默认 male=1.70 m、female=1.62 m；速度=`0.6 或 2.1 × heightM / 0.98`，即男 1.041/3.643、女 0.992/3.471 场景单位/s；视觉滑步尚未真机实测。
- 标识遵循 `design/26` §4.8 的战场摘要分层及“头像不作唯一识别”：所有专属/通用/2D 单位均显示阵营色边+头像+姓名；390 px 为 92×≥44、头像 24、字 14、交错 ±48 px，桌面为宽 104、头像 28、姓名 16/辅助 14 px；浮字层在其上。
- 发布阿青、段誉、李文秀、萧峰、通用男女、主角男女共 8 GLB：49,390,628 B（47.103 MiB），最大 6,799,224 B（<8 MiB）；ch00/ch10 `enterBytes`=18.433/24.290 MiB（均 <60 MiB）。
- 懒块 `battle-model3d-CF6vNx-T.js`=57,088 B raw/17,691 B gzip；entry=39.25/170 KiB、render=164.51/180 KiB（余 15.49 KiB）、WebGL=203.76/350 KiB、首次会话=97.09/110 KiB，全部通过；render 静态闭包不含 3D 块。
- 6/12 个 3D 单位结构 draw call=6/12；Node 无 WebGL update P95=0.036/0.111 ms。浏览器服务 `listen EPERM`、Chrome/Playwright SIGABRT，故 GPU 帧时间未取得，以上 CPU 值不冒充帧时间。
## 4. 开放问题（附默认值）
- 逐角色原著身高表未落库：默认男 1.70 m、女 1.62 m；待上游提供后只替换 catalog 身高。
- 真实竖屏遮挡、脚下滑步与 6/12 单位 GPU 帧时待沙箱外真机复测；默认保留当前标签错位和速度公式。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- BG3D-01 / 在基准登记人类战斗模型三级选型和非人 2D 例外 / 固化 AR-85 的跨层资源契约。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/tech/03-mobile-performance.md` / 战斗渲染预算 / 登记 3D 懒块、按引用章节闭包及真机复测项。
- `docs/design/26-immersive-ui.md` / §4.8 / 登记单位姓名牌的 390 px 尺寸与避让规则。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 解析覆盖专属、通用、主角退路、两种目录命名、缺省 male 和非人不套通用；发布测试证明只复制引用资源及 manifest 自动切换。
- ✅ 3D 懒加载、同模型资源共享、动作/移动、加载失败 2D 回退均有自动测试；不改 core、不增依赖。
- ✅ 通用模型必有标识，且所有单位同口径；390 px 尺寸、夹边和交错定位有断言。
- ✅ `apps/game` 38 文件 147 测试、build、size、lint、render/data/game typecheck 均通过。
- ⚠️ `pnpm check` 在其 171 文件/1226 测试通过后，`content:validate` 因 tsx Unix socket `listen EPERM` 中止；`pnpm content:build` 同因沙箱限制中止，未改 shim 绕过。
- ⚠️ 真浏览器/GPU 帧时、视觉滑步未实测；已给出可复现的结构 draw call 与明确标注的 Node CPU 微基准。
