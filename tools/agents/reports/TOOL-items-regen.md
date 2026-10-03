# TOOL-items-regen 报告 · 工具 · 按九列名录重新生成 content/items（lore 全部合入后；提交生成物 AR-39；不改生成器）

## 1. 摘要（3–6 行）

已用现成生成器将 11 份九列名录的 894 行投影为 889 份物品文件；5 个 bootstrap 行仍按既有规则不生成独立文件。
全部生成物新增 `text.lore` 与 `extension.value.attributes`，原有字段映射经对象级对照保持不变，`--check` 通过。
当前基点的 `AttributeProjectionV2` schema 已接纳全部投影；指定检查与全仓门禁均通过，没有生成失败条目。
## 2. 产出（文件、行数、主要章节）

- `content/items/*.yaml`：889 个生成物、合计 28,070 行；主要结构为基础字段、`use`（适用时）、`assets`、`text`、`extension`。
- `tools/agents/reports/TOOL-items-regen.md`：本报告（不超过 40 行）。
## 3. 关键结论与数值

- 变更文件：新增 0、修改 889、删除 0；生成 diff 为 `+4771/-107`。
- 新字段覆盖：`text.lore` 889/889；`extension.value.attributes` 889/889；`version: 2` 889/889，其中 104 项仅含 `version`。
- 去掉上述两个新增字段后，新旧 YAML 对象 889/889 相同；故旧效果、类型、价格、素材等映射未漂移。以下均为“旧 → 新增 lore 字数 / attributes”，其余字段不变：
- accessories：`eq_baiyuguan` 68 / `{version:2,def:9}`，`eq_zijinfaguan` 69 / `{version:2,def:12}`；armor：`eq_songxunyijia` 66 / `{version:2,def:36}`，`eq_qingyulinjia` 71 / `{version:2,def:98}`；belts：`eq_mayaodai` 67 / `{version:2,def:6}`，`eq_yunlongyudai` 62 / `{version:2,def:12}`。
- clothing：`eq_buyi` 65 / `{version:2,def:34}`，`eq_zixiaqingyi` 69 / `{version:2,def:78,agi:4}`；food：`it_anchunrou` 63 / `{version:2}`，`it_labazhou` 73 / `{version:2,qiCultivation:3500,stamina:24}`；hidden-weapons：`eq_baoyulihuading` 70 / `{version:2,atk:120,hardness:75,qiAffinity:100}`，`it_xiujian` 71 / `{version:2,atk:90,hardness:0,qiAffinity:100}`。
- innerarmor：`eq_zhusutiejia` 66 / `{version:2,def:22}`，`eq_tianchansiruanjia` 68 / `{version:2,def:50,antiPoison:6}`；manuals：`it_miji_baidubianzheng` 78 / `{version:2,skillRef:sk_baidubianzheng,readWis:50,maxLayer:8,cultivation:2400}`，`it_miji_zixiashengong` 82 / `{version:2,skillRef:sk_zixiashengong,readBre:55,maxLayer:8,cultivation:2800}`；medicine：`it_aiye` 77 / `{version:2,healOuter:5}`，`it_zixiaoyangqidan` 65 / `{version:2,restoreQi:10}`。
- shoes：`eq_caoxie` 64 / `{version:2,def:6,agi:1}`，`eq_feiyuxue` 64 / `{version:2,def:9,agi:2,stamina:3}`；weapons：`eq_bailagan` 77 / `{version:2,atk:110,hardness:34,qiAffinity:100}`，`eq_ziweiruanjian` 70 / `{version:2,atk:92,hardness:50,qiAffinity:100}`。
- `pnpm size`：entry `38.44/170`、render `161.87/180`、WebGL `200.31/350 KiB`，均 PASS；与当前集成基线一致，按需加载的物品叶片未造成 entry 漂移。
- 检查：安装与 `--check` 成功；指定 unittest 39/39；严格 ID 新增失败 0；`pnpm check` 的 lint/typecheck、Vitest 140 文件 983/983、内容校验 987 文件/925 对象/62 地图、size 与 dev-chunks 均通过。
## 4. 开放问题（附默认值）

- 无生成失败；名录校验仅有 3 个允许告警：`eq_kongqueling.skillRef`、`eq_feiyuxue.stamina` 为类别非常用键，`eq_xiuhuazhen.atk=65` 低于典型带。默认保留名录投影。
- 无生成失败或 schema 警告；默认继续保留名录的三条允许投影，不手改生成物。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；生成结果遵循 `design/10` §4.10。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 无；上一轮所列 `AttributeProjectionV2` schema 同步已在当前基点完成。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 未改生成器或名录；889 份生成物可重现；11 类各抽 2 件；新旧映射、覆盖率、变更数与 size 对照均已记录。
- ✅ 全部必跑命令通过；本沙箱仅以进程内兼容层跳过 `tsx` CLI 被禁的信号转发 Unix socket，项目脚本、loader 与校验逻辑均未修改，并另以 `node --import tsx` 复验内容校验。
- ✅ 最终写集仅 `content/items/**` 与本报告；`git diff --check` 通过。
