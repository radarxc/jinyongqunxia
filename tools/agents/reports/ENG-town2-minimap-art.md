# ENG-town2-minimap-art 报告 · 城镇探索 v2 · 小地图改版（AR-117）：微缩城镇图底图 + 关键建筑标记 + 竖直缩放条 + 司南示南北
## 1. 摘要（3–6 行）
大理、杭州 candidate 基线预览已确定性派生为按需加载的 WebP 缩影与 `town-minimap.v1` 元数据。
城内优先显示圆盘缩影、关键建筑徽记和最近三处名签，缺图才一次告警并回落旧栅格。
标记点击按元数据入口发不带 `buildingId` 的普通 `town/move`；窄屏统一使用 132 px 坐标系。
原四圆钮改为竖直缩放条、司南与“图”印章；审核指出的裁切、列表混入 NPC、硬编码颜色均已返修。
## 2. 产出（文件、行数、主要章节）
- 离线：`make_minimap.py` 249 行、测试 131 行；`town-minimap/` 两组 WebP/JSON 与 candidate manifest。
- 发布：`town-assets.ts`/test 121/164 行；非 rejected 的 WebP/JSON 复制到 public，不进 PWA 预缓存。
- 运行时：`v1-minimap.ts`/test 330/236 行（测试首行 `// @vitest-environment happy-dom`）；加载、仿射正反换算、入口目标、缺图回退；`TownPage.vue` 938 行完成装配。
- UI：`TxMinimap.vue`/test 468/306 行，`TxSinan.vue`/test 58/37 行；另含 strings、painter/test、sinan-math。
- `pnpm install --frozen-lockfile`：通过，未新增依赖，lockfile 未变。
- 离线 `--check` + unittest：通过，2 城产物一致，4/4；Node 专项 10 文件/91 例；UI 专项 7 文件/60 例。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：上一轮退出 0（246 文件/2043 例）；协调者本轮只补测试首行环境声明与报告数字，全量结果以监督校验步骤为准；1793 内容文件/1720 对象/4 Ink/65 地图有效；构建、size、dev-chunks PASS。
## 3. 关键结论与数值
- 与文档一致处：AR-117 四项（缩影底图、关键建筑徽记与名签、竖直缩放条、司南）与本任务书第 1–5 条；tech/15 的 `town/move` 由 core 判可达、页面不算路径；素材只新增 `town-minimap/**`、不改基线。
- 偏离处：无。
- 大理 1536×899、134448 B；杭州 2560×1280、278560 B；WebP 固定 quality=82、method=6、exact。
- 比例 `minimap px/m = clamp(main px/m ÷ 16, 2.5, 7)`；主缩放 40–112 px/m，刻度 48/64/80/96，默认 80。
- 规划坐标南为 `-z`，投影增量 `(-32,+16)`，故 `south=[-0.89442719,0.4472136]`；两城南门相对城心误差均 ≤30°。
- 大理 locale 设施：shop 药/苍山药肆、杂/南门杂货、铁/太和铁作、衣/白布衣肆、马/苍洱马市、食/南市食案；inn 客/洱风客舍。
- 大理布局地标：pagoda 塔/千寻塔、北小塔、南小塔；temple 寺/天龙寺护经殿、祠庙×2；office 衙/衙署；gate 门/南门、北门。
- 杭州布局地标：gate 门/和宁门及嘉会、余杭、便、候潮、保安、新开、崇新、东青、艮山、钱湖、清波、丰豫、钱塘门；temple 寺/景灵宫；office 衙/衙署。
- 所有 painted marker 视觉位置用 `px`，点击优先把 `entrance` 反算为 world point；无入口的城门用自身 `px`，命令不带 `buildingId`，core 只判可达。
- 竖条拖动/方向键/±与外部键盘、滚轮、捏合共用 `ZoomController`；折叠态为控制轨预留桌面 54 px、粗指针 62 px，完整容纳 44/60 px 命中区。
- 司南按 south+相机基旋转，点击切 north-up；M 全城图暂停 tick、地图显示全部名字，设施列表排除 npc/quest/meditation。
- 店铺/客栈/寺塔/城门衙署圈色由 canvas palette 读取主题变量；司南铜盘、勺、刻线、铜绿均用可覆盖 CSS 变量及组件默认值。
## 4. 开放问题（附默认值）
- （原创扩展）徽记类别色、名签、铜绿斑与墨晕强度沿用当前主题默认，待作者在 5173 决定是否收淡。
- 布局含两个同名“祠庙”，默认保留通名而不编造专名；任务 NPC 取 active 任务 `subjectNpcIds`。
- WebP 字节确定性已在当前 Pillow/libwebp 实测；升级编码器后默认重新生成并复审 SHA。
- 基线清单仍是 candidate 且待作者审批；派生 manifest 同为 candidate，不修改基线状态。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；实现 AR-117，不修改基准。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `ENG-town2-v1-page` / 城镇页装配：保留 `ZoomController`、按需缩影、active 任务 NPC、司南设置、area-map 暂停及 painted marker 普通点寻路契约。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 离线两城确定性/结构、真实 overlay 三栋轮廓、两城南门、facility+locale 名源；✅ 发布状态过滤且未改 asset-manifest/PWA 预缓存。
- ✅ 药铺/马市/食摊/千寻塔均对拍真实入口并断言无 `buildingId`；空白反算、缺图栅格和一次告警有测试。
- ✅ 桌面 200/窄屏 132 统一 canvas、名签、点击；54/62 px 控制沟槽保证缩放条不被舞台裁切，命中桌面 44/粗指针 60。
- ✅ 全城图 NPC 只留地图点和名签、不进设施列表；四类标记圈及司南各部件主题取色均有回归测试。
- ✅ `git diff --check`、冻结安装、全部指定专项与完整 check 通过；构建的既有缺图清单及 localhost:3000 拒绝日志不影响退出码。
- ⚠️ 5173 待协调者手检：进大理城 → 看缩影与标记 → 拖竖条 → 点司南 → M 全城图 → 点苍山药肆并确认只走到入口 → Esc。
- 交接 ENG-town2-v1-page：勿恢复四圆钮或有图时的抽象栅格；模拟店铺/侧栏可替换，但缩放、北向、area-map 与普通点寻路接口须保留。
