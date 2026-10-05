# DES-ruins-ids 报告 · 设计 · 遗迹 / 地宫补 ID：九老洞、敦煌地宫（AR-36 点名）与章节文档具名无 ID 的遗迹登记 sc_* / poi_*，供 ART-ruins-maps 接力

## 1. 摘要（3–6 行）

- 已按 `遗迹|地宫|洞|墓|地窖|密道` 扫描章节、`design/11` 与 `design/20`，并按“具名、已有玩法语义、尚无正式 ID”筛出 5 处地点。
- 新增 6 个章节 `sc_*` 相位与 5 个稳定地理 `poi_*`，覆盖 AR-36 点名的九老洞、敦煌地宫，以及达摩洞、若耶溪墓藏、华山后洞。
- 九老洞归 ch04 / `rg_bashu`；`design/20`、`design/25` 未把它定义成跨书探险点。
- 敦煌采用“一处 POI、唐 / 清两个章节相位”，地理实体不复制，章节状态互相隔离。
- `python3 tools/lint/check_ids.py --strict` 与 `git diff --check` 均已通过。

## 2. 产出（文件、行数、主要章节）

| 文件 | 当前行数 | 主要改动 |
|---|---:|---|
| `docs/design/chapters/01-tianlong.md` | 2050 | 达摩洞、若耶溪墓藏场景登记与场景总数校验 |
| `docs/design/chapters/04-yitian.md` | 1931 | 九老洞场景登记、峨眉 / 巴蜀归属与总数校验 |
| `docs/design/chapters/07-bixue.md` | 2005 | 华山后洞后世相位登记及独孤传承载体引用 |
| `docs/design/chapters/10-baima.md` | 1631 | 敦煌地宫唐代相位、单 POI 双相位说明 |
| `docs/design/chapters/12-shujian.md` | 1750 | 敦煌地宫清代相位、入口条件与总数校验 |
| `docs/design/11-open-world.md` | 1760 | §12.2 登记 5 个遗迹入口 POI、投影参数与校验规则 |
| `docs/design/19-world-map.md` | 1031 | §3.8 登记 WGS84 锚点、坐标置信度和相位映射 |
| `tools/agents/reports/DES-ruins-ids.md` | 101 | §3 ART 交接清单、开放问题、同步项与逐条自检 |

设计文档净变更为 7 个文件、140 行新增、51 行删除；删除主要来自扩展既有表格与统计行，并非删减既有玩法。

## 3. 关键结论与数值

### 新增遗迹 ID 清单

| ID | 名称 | 章 / 年代 | 区域 | 类型 | 尺寸档 | 房间 | 入口条件 | 稳定 POI ID |
|---|---|---|---|---|---|---:|---|---|
| `sc_01_damodong` | 达摩洞 | ch01 / 约 1093–1094 | `rg_zhongyuan` | cave | small | 3 | `q_01_qiyu_82=active` | `poi_zhongyuan_damodong` |
| `sc_01_ruoye_muzang` | 若耶溪墓藏 | ch01 / 约 1093–1094 | `rg_jiangnan_taihu` | tomb | small | 4 | `q_01_qiyu_75=active` 且取得可靠题签 | `poi_jiangnan_taihu_ruoye_muzang` |
| `sc_04_jiulaodong` | 九老洞 | ch04 / 约 1360 | `rg_bashu` | cave | medium | 5 | 巴蜀开放；深入条件**（待设计）** | `poi_bashu_jiulaodong` |
| `sc_07_huashan_houdong` | 华山后洞 | ch07 / 1630–1645 | `rg_guanzhong` | cave | medium | 5 | 共有幕 01 后开放外围；核心条件**（待设计）** | `poi_guanzhong_huashan_houdong` |
| `sc_10_dunhuang_digong` | 敦煌地宫·唐代相位 | ch10 / 702–703 | `rg_hexilongyou` | tomb | medium | 6 | C01 后河西开放；深入条件**（待设计）** | `poi_hexilongyou_dunhuang_digong` |
| `sc_12_dunhuang_digong` | 敦煌地宫·清代相位 | ch12 / 1753–1759 | `rg_hexilongyou` | tomb | medium | 6 | 阶段 3 或清廷通行牌；深入条件**（待设计）** | `poi_hexilongyou_dunhuang_digong` |

| POI ID | WGS84 锚点（经度, 纬度） | ART 场景映射 |
|---|---|---|
| `poi_zhongyuan_damodong` | 112.94, 34.51 | `sc_01_damodong` |
| `poi_jiangnan_taihu_ruoye_muzang` | 120.58, 30.00 | `sc_01_ruoye_muzang` |
| `poi_bashu_jiulaodong` | 103.36, 29.55 | `sc_04_jiulaodong` |
| `poi_guanzhong_huashan_houdong` | 110.09, 34.49 | `sc_07_huashan_houdong` |
| `poi_hexilongyou_dunhuang_digong` | 94.68, 40.17 | `sc_10_dunhuang_digong`、`sc_12_dunhuang_digong` |

数量核算：4 个单相位 POI × 1 场景 + 1 个敦煌 POI × 2 相位 = 6 个 `sc_*`。`small` 对应章节“微型”（≤64×64、≤2×2 chunks），`medium` 对应“标准”（≤96×96、≤3×3 chunks）；房间数依次为 3、4、5、5、6、6，均未突破尺寸档上限。五处场内六角坐标一律待 Tiled 实测，不从 WGS84 或父场景中心反推。

敦煌选择双相位而非两个 POI：`poi_hexilongyou_dunhuang_digong` 保存跨时代稳定的地理知识，`sc_10_*` 与 `sc_12_*` 分别保存唐、清布景、入口与清理状态。九老洞未在 `design/20` 或 `design/25` 获得跨书归属，故按作者点名默认落入峨眉所在 ch04。

### 关键词扫描处置

| 扫描结果类别 | 代表命中 | 处置 |
|---|---|---|
| 具名且有玩法语义、缺正式地点 ID | 达摩洞、若耶溪墓藏、九老洞、华山后洞、敦煌地宫 | 本任务全部登记 |
| 已有正式场景 ID | 长白山洞、古墓、剑冢、笑傲思过崖后洞、定海潮洞、雪谷山洞、胡一刀墓、闯王宝藏洞等 | 复用既有 ID，不重复建点 |
| 已有场景内部子区或泛称 | 地窖、密道、墓道、洞口、暗洞等 | 保持为房间 / 通路，不冒充独立 POI |
| 尚未冻结为生产地点的传承候选载体 | 昆仑旧洞、石梁旧洞等 | 不抢占 `sc_*` / `poi_*`；待传承与章节归属先冻结 |

新增关卡玩法均按原著边界标为**（原创扩展）**；若耶溪墓藏、敦煌地下结构及精确入口保持**（待考）**。未编造引文、回目号、人物或招式。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 五处遗迹的场内六角坐标何时冻结 | ART / 关卡绘制后由 Tiled 实测回填；此前保持“待回填” |
| 九老洞、华山后洞、敦煌两相位的核心深入条件 | 保持**（待设计）**；只开放外围，不新增任务线、事件或状态机 |
| 若耶溪墓藏、华山后洞、敦煌地宫的精确位置 / 历史性质 | 继续使用城市或山体锚；可靠考据完成前不宣称现实确址 |
| 敦煌是否拆成两个地理 POI | 不拆；默认维持一个稳定 POI 映射唐 / 清两个 `sc_*` |
| 遗迹重访与遗迹采集是否共用周期 | 默认不共用：`ruinProjection.revisit` 按 §12.2 示例取 3 日；具体 `kind=gather` 遗迹采集点按 D-OW05 取 5 日 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| DES-RI-P01 | 在 Canon §12 的 `poi_*` / `sc_*` 规则补充：跨时代同址只建一个稳定 `poi_*`，各章节分别拥有 `sc_NN_*` 相位；具体映射字段仍归 `design/11` 与 `tech/04` | 敦煌证明地理身份与章节可变状态需要分层；可防止地图重复点、跨章状态串扰和 ID 所有权冲突 |

除上述 ID 身份规则外，本任务不提议修改基准数值、任务状态机或事件。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 下游 | 位置 | 需同步内容 |
|---|---|---|
| `docs/design/20-legacy-inheritance.md` | 阿青三卷、独孤九剑载体段 | 将“若耶溪一带墓藏”引用到 `sc_01_ruoye_muzang` / 对应 POI，将“华山后洞”引用到 `sc_07_huashan_houdong` / 对应 POI；只补引用，不重定义场景 |
| `docs/tech/04-data-pipeline.md` | `PoiDef` schema / 编译校验 | 当前示例只有单值 `sceneId`；为稳定 POI 增加按 `chapterId` / 时代选择场景相位的结构或等价覆盖机制 |
| `docs/design/map/*.yaml` | POI / 时代图层数据归属位置 | 由有权限任务写入 5 个 WGS84 锚点和敦煌双相位映射；不得把锚点当场内六角坐标 |
| `ART-ruins-maps` 产物 | 遗迹地图清单 | 按 §3 的 5 个 POI 绘制 6 个章节相位；敦煌复用地理入口但分别制作唐 / 清地图状态 |
| `docs/decisions/author-decisions.md` | 后续作者拍板项 | 若需冻结，确认九老洞归 ch04 / `rg_bashu`，以及敦煌单 POI 双相位；当前均按该默认值执行 |
| `docs/design/11-open-world.md` | O-B3-10 | 后续把“明确可再生节点”细化为非采集重访生态；`kind=gather` 遗迹采集点继续服从 D-OW05 的 5 日 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| 项 | 结果 | 说明 |
|---|---|---|
| 1. 列清单 | ✅ | 已扫描指定关键词与语料；新增 5 处，已具 ID、内部子区及未冻结候选均分类排除；另核对 `design/25` 未赋予九老洞跨书归属 |
| 2. 登记 ID | ✅ | 5 个 POI 在 `design/11` / `19` 登记，6 个 `sc_*` 在所属章节登记；均含名称、类型、尺寸、房数、入口、年代、区域和关联项 |
| 3. 不设计新任务线 | ✅ | 只引用既有 `q_*`、章节阶段、`lgs_*` / `cache_*`；未知深入条件写**（待设计）**，原创与待考边界已标注 |
| 4. 严格 ID 校验 | ✅ | `python3 tools/lint/check_ids.py --strict` 退出 0；仅显示基线已知 `sk_babuganchan` 与 allowlist 近似项，新增失败数为 0 |
| 修改范围 | ✅ | `git status --short` 仅含 7 个获准设计文档与本报告；未改 Canon、decisions、`TODO.md`、内容或资产 |
| 文档完整性 | ✅ | `git diff --check` 通过；5 POI / 6 场景映射逐项核对，未新增 `TODO`、省略占位或未闭合代码块 |
| 下游地图制作 | ⚠️ | 本任务只补 ID 与锚点；Tiled 地图、场内六角坐标及地图数据写入按职责交 `ART-ruins-maps` / 相应归属任务 |
