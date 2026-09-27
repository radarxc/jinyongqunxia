# 《金庸群侠传·天书录》文档总索引

> 《天书录》（代号 `tianshu`）是一套面向个人、非商业、自娱用途的手机浏览器武侠 RPG 策划与技术规划：主角穿行十四个书界，在统一江湖的时代更替中取天书、改命并积累跨年代传承。
> 截至 2026-09-27，本文索引内的规划文档均已成稿；01–21 与既有技术文档已审校；这表示“设计可进入实现”，**不表示游戏、素材、服务或发布已经完成**。

## 1. 文档体系与事实顺序

阅读和实施时按以下层次解释事实；若同一事项冲突，以排在前面的层次为准：

1. **作者决定与新增需求**：`decisions/author-decisions.md`、`decisions/author-requirements.md`。
2. **设计基准**：`00-canon.md`，固定世界顺序、品阶、属性、战斗、ID、技术基线与唯一归属。
3. **裁定记录**：`decisions/rulings-v1.md` 与提案处置，说明冲突、重命名和基准变更为什么这样落地。
4. **策划正文**：`design/01–21` 定义系统；`catalog/` 登记武学与 NPC；`story/` 唯一拥有主线；`chapters/` 组织每个书界的区域、支线、投放与特色；`map/` 保存统一地图数据和渲染结果。
5. **技术正文**：`tech/01–09` 把策划规则映射为架构、渲染、性能、数据、运行时、素材、在线服务与路线图。
6. **执行与门禁**：`tools/` 提供 ID、数值、地图及多代理流程；项目进度和需求覆盖见仓库根 [TODO.md](../TODO.md)。

状态图例：**🔒 权威**＝事实源 / 裁定记录；**✅ 已审校**＝规划完整且通过审校；**✅/⚠️ 已审校·有遗留**＝规划完整但仍有明确考据、生产或实测债；**🧰 可执行**＝工具已具备并通过当前门禁。行数为 2026-09-27 在当前工作副本以 `wc -l` 实测。

## 2. 文档总索引

### 2.1 基准与决策记录

| 文档 | 一句话摘要 | 行数 | 状态 |
|---|---|---:|---|
| [00-canon.md](00-canon.md) | v1.2 唯一设计基准，固定十四界、数值锚点、ID、归属与技术底线。 | 796 | 🔒；V12-10 两个细项待作者确认 |
| [decisions/author-decisions.md](decisions/author-decisions.md) | P01–P57 作者决策单；G1 已采用未另填项的默认值。 | 164 | 🔒 |
| [decisions/author-requirements.md](decisions/author-requirements.md) | AR-01–AR-14 新增需求及验收口径，效力与作者决定同级。 | 188 | 🔒 |
| [decisions/rulings-v1.md](decisions/rulings-v1.md) | C01–C23 冲突裁定、重命名、图鉴分工和 Buff 缺口清单。 | 711 | 🔒；裁定均已落地 |
| [decisions/canon-proposals-v1.2.md](decisions/canon-proposals-v1.2.md) | 汇总 v1.2 提案的采纳、拒绝、转归属与后续候选。 | 332 | 🔒；历史处置记录 |

### 2.2 核心策划 `design/01–21`

| 文档 | 一句话摘要 | 行数 | 状态 |
|---|---|---:|---|
| [design/01-vision-and-core-loop.md](design/01-vision-and-core-loop.md) | 现代主角、书灵、十四界循环、序章与叙事体验支柱。 | 1,067 | ✅ 已审校 |
| [design/02-timeline-and-world-tiers.md](design/02-timeline-and-world-tiers.md) | 书界年代、书眠间隔、高中低武与天道压制规则。 | 1,704 | ✅/⚠️ 年代待考清单保留 |
| [design/03-attributes.md](design/03-attributes.md) | 属性 ID、成长曲线、典型配装、轻功值与敌人模板。 | 1,722 | ✅ 已审校 |
| [design/04-damage-formula.md](design/04-damage-formula.md) | Z0–Z10 整数伤害管线、判定、算例与十四界节奏验证。 | 789 | ✅；模拟 40/40 |
| [design/05-martial-arts-system.md](design/05-martial-arts-system.md) | 武学卡、层数、内功、装配、突破、代价与 1,138 门库存。 | 2,795 | ✅/⚠️ 来源比例待专项重配 |
| [design/06-buff-system.md](design/06-buff-system.md) | Buff 分级、抗性、叠加、事件 / 效果 DSL 与 247 条目录。 | 2,176 | ✅ 已审校 |
| [design/07-set-system.md](design/07-set-system.md) | 套装触发、跨品阶与低武可达性；44 套、306 条关系。 | 1,382 | ✅ 已审校 |
| [design/08-terrain-and-qinggong.md](design/08-terrain-and-qinggong.md) | 48 种地形、五阶轻功、探索门禁与环境行动者。 | 1,706 | ✅/⚠️ 八步赶蟾接口待决定 |
| [design/09-combat-system.md](design/09-combat-system.md) | pointy-top 六角格、集气、行动、范围、运劲、道具和 AI。 | 3,192 | ✅ 已审校 |
| [design/10-items-and-equipment.md](design/10-items-and-equipment.md) | 物品、8 格装备、12 件天级装备、词条、强化与交易。 | 2,208 | ✅ 已审校 |
| [design/11-open-world.md](design/11-open-world.md) | 统一开放世界、30 区 / 189 城及每个书界的内容预算。 | 1,586 | ✅ 已审校 |
| [design/12-quests-npc-factions.md](design/12-quests-npc-factions.md) | 任务 DSL、人物接口、门派、经济和生活技能的策划契约。 | 1,869 | ✅/⚠️ 生产 manifest 待实现 |
| [design/13-progression-and-endings.md](design/13-progression-and-endings.md) | 经验、余韵、天书之力、难度、周目、7 结局与 74 成就。 | 1,856 | ✅ 已审校 |
| [design/14-ui-ux-mobile.md](design/14-ui-ux-mobile.md) | 手机信息架构、触控、无障碍、战斗 / 书眠线框与状态呈现。 | 1,327 | ✅ 已审校 |
| [design/15-meridians-and-acupoints.md](design/15-meridians-and-acupoints.md) | 20 脉、180 穴、内劲、通脉、小 / 大周天与九转。 | 1,540 | ✅ 已审校 |
| [design/16-resources-and-estates.md](design/16-resources-and-estates.md) | 36 级资源、资源点、家丁、山庄与行脚 / 教头 / 客卿。 | 1,664 | ✅ 已审校 |
| [design/17-sects-compendium.md](design/17-sects-compendium.md) | 99 个门派 / 组织的历史、驻地、时代、职级与武学索引。 | 2,196 | ✅ 已审校 |
| [design/18-npc-and-companions.md](design/18-npc-and-companions.md) | NPC / 同伴、D1–D5 招募、生命轴、跨书重逢与名录契约。 | 1,642 | ✅/⚠️ 部分生产画像待补 |
| [design/19-world-map.md](design/19-world-map.md) | 水墨大地图、真实坐标、时代地名、图外线路和 YAML / SVG 契约。 | 997 | ✅/⚠️ 历史地名待考 |
| [design/20-legacy-inheritance.md](design/20-legacy-inheritance.md) | 39 个传承源、117 份残卷、缓存 / 信物 / 合成与跨年代状态。 | 1,657 | ✅/⚠️ 字段、点位及 V12-10 待收口 |
| [design/21-meridian-flow-and-moves.md](design/21-meridian-flow-and-moves.md) | 战斗经脉河流模型、招式路线 / 绝招、擒拿点穴、调息与逐单位模拟。 | 1,644 | ✅/⚠️ AR-14 已审校；待下游同步、考据与真机实测 |

### 2.3 武学图鉴 `design/catalog/skills-*`

| 文档 | 一句话摘要 | 行数 | 状态 |
|---|---|---:|---|
| [skills-shaolin.md](design/catalog/skills-shaolin.md) | 少林内外功、绝技、戒律、来源与套装镜像。 | 1,244 | ✅ 已审校 |
| [skills-wujue.md](design/catalog/skills-wujue.md) | 射雕五绝、桃花岛、丐帮等传承与跨书再遇。 | 2,884 | ✅ 已审校 |
| [skills-daojia.md](design/catalog/skills-daojia.md) | 全真、古墓、武当及神雕诸派武学。 | 2,196 | ✅ 已审校 |
| [skills-xiaoyao.md](design/catalog/skills-xiaoyao.md) | 天龙诸派、逍遥、姑苏慕容与吐蕃密宗。 | 2,177 | ✅ 已审校 |
| [skills-yitian.md](design/catalog/skills-yitian.md) | 倚天诸派、明教与时代传承。 | 1,407 | ✅ 已审校 |
| [skills-xiake-bixue.md](design/catalog/skills-xiake-bixue.md) | 侠客行与碧血剑武学、来源和套装镜像。 | 1,295 | ✅ 已审校 |
| [skills-wuyue.md](design/catalog/skills-wuyue.md) | 五岳剑派、日月神教及相关散人武学。 | 1,345 | ✅ 已审校 |
| [skills-kangxi.md](design/catalog/skills-kangxi.md) | 鹿鼎、连城、白马、鸳鸯四部低武时期库存。 | 1,327 | ✅/⚠️ 八步赶蟾卡片待决定 |
| [skills-qianlong.md](design/catalog/skills-qianlong.md) | 书剑、飞狐、雪山时期门派与江湖武学。 | 1,237 | ✅ 已审校 |
| [skills-general.md](design/catalog/skills-general.md) | 江湖通用拳脚、兵器、轻功、暗器与杂学。 | 1,334 | ✅ 已审校 |
| [skills-gulong.md](design/catalog/skills-gulong.md) | 古龙门派的原创扩展库存及跨体系引用边界。 | 1,413 | ✅ 已审校 |

11 册图鉴合计 **17,859 行**；正式武学总量以 `design/05` §14 的去重库存为准，不能把图鉴行数或出现次数当作武学数量。

### 2.4 NPC 名录 `design/catalog/npcs-*`

| 文档 | 一句话摘要 | 行数 | 状态 |
|---|---|---:|---|
| [npcs-ch01-tianlong.md](design/catalog/npcs-ch01-tianlong.md) | 天龙人物、生命轴、招募难度与生产画像索引。 | 52 | ✅ 已审校 |
| [npcs-ch02-shediao.md](design/catalog/npcs-ch02-shediao.md) | 射雕人物、时代出场、同伴与缺口登记。 | 87 | ✅ 已审校 |
| [npcs-ch03-shendiao.md](design/catalog/npcs-ch03-shendiao.md) | 神雕人物及跨射雕时代继承关系。 | 46 | ✅ 已审校 |
| [npcs-ch04-yitian.md](design/catalog/npcs-ch04-yitian.md) | 倚天人物、阵营、招募与门派关联。 | 47 | ✅ 已审校 |
| [npcs-ch05-xiaoao.md](design/catalog/npcs-ch05-xiaoao.md) | 笑傲人物、五岳 / 日月阵营与招募边界。 | 37 | ✅ 已审校 |
| [npcs-ch06-xiake.md](design/catalog/npcs-ch06-xiake.md) | 侠客行人物、双身份与岛上生命轴。 | 36 | ✅ 已审校 |
| [npcs-ch07-bixue.md](design/catalog/npcs-ch07-bixue.md) | 碧血人物、明末时代关系与招募门槛。 | 55 | ✅ 已审校 |
| [npcs-ch08-luding.md](design/catalog/npcs-ch08-luding.md) | 鹿鼎人物、清初阵营与宫廷 / 江湖身份。 | 48 | ✅ 已审校 |
| [npcs-ch09-liancheng.md](design/catalog/npcs-ch09-liancheng.md) | 连城人物、雪谷 / 荆州关系与招募边界。 | 37 | ✅ 已审校 |
| [npcs-ch10-baima.md](design/catalog/npcs-ch10-baima.md) | 白马人物、西域出场和阵营关系。 | 34 | ✅ 已审校 |
| [npcs-ch11-yuanyang.md](design/catalog/npcs-ch11-yuanyang.md) | 鸳鸯刀人物、短篇群像与招募信息。 | 40 | ✅ 已审校 |
| [npcs-ch12-shujian.md](design/catalog/npcs-ch12-shujian.md) | 书剑人物、红花会与清廷关系。 | 49 | ✅ 已审校 |
| [npcs-ch13-feihu.md](design/catalog/npcs-ch13-feihu.md) | 飞狐外传人物、掌门大会与跨篇关系。 | 42 | ✅ 已审校 |
| [npcs-ch14-xueshan.md](design/catalog/npcs-ch14-xueshan.md) | 雪山飞狐人物、雪山终局与罗生门关系。 | 35 | ✅ 已审校 |
| [npcs-commoners.md](design/catalog/npcs-commoners.md) | 路人模板、生成规则和静态人物 ID 边界。 | 192 | ✅ 已审校 |
| [npcs-facilities.md](design/catalog/npcs-facilities.md) | 城市设施岗位、服务者模板与生成约束。 | 148 | ✅ 已审校 |
| [npcs-sects.md](design/catalog/npcs-sects.md) | 门派、世家与组织岗位模板。 | 177 | ✅ 已审校 |

17 册名录合计 **1,162 行**。`design/18` §11 终审口径为 422 条静态出场行、397 个唯一人物，另有 13 个设施 / 路人支持槽，共 435 行；部分具名人物与 Boss 的 `full` 生产画像仍待补。

### 2.5 十四部主线 `design/story/`

| 文档 | 一句话摘要 | 行数 | 状态 |
|---|---|---:|---|
| [story/01-tianlong.md](design/story/01-tianlong.md) | 天龙八部正邪双线、选择节点、锚点与覆盖表。 | 1,504 | ✅/⚠️ 生产实例待生成 |
| [story/02-shediao.md](design/story/02-shediao.md) | 射雕英雄传正邪双线、选择节点、锚点与覆盖表。 | 1,272 | ✅/⚠️ 生产实例待生成 |
| [story/03-shendiao.md](design/story/03-shendiao.md) | 神雕侠侣正邪双线、选择节点、锚点与覆盖表。 | 1,545 | ✅/⚠️ 生产实例待生成 |
| [story/04-yitian.md](design/story/04-yitian.md) | 倚天屠龙记正邪双线、选择节点、锚点与覆盖表。 | 1,878 | ✅/⚠️ 生产实例待生成 |
| [story/05-xiaoao.md](design/story/05-xiaoao.md) | 笑傲江湖正邪双线、选择节点、锚点与覆盖表。 | 1,260 | ✅/⚠️ 生产实例待生成 |
| [story/06-xiake.md](design/story/06-xiake.md) | 侠客行正邪双线、选择节点、锚点与覆盖表。 | 1,844 | ✅/⚠️ 生产实例待生成 |
| [story/07-bixue.md](design/story/07-bixue.md) | 碧血剑正邪双线、选择节点、锚点与覆盖表。 | 1,620 | ✅/⚠️ 生产实例待生成 |
| [story/08-luding.md](design/story/08-luding.md) | 鹿鼎记正邪双线、选择节点、锚点与覆盖表。 | 1,846 | ✅/⚠️ 生产实例待生成 |
| [story/09-liancheng.md](design/story/09-liancheng.md) | 连城诀正邪双线、选择节点、锚点与覆盖表。 | 1,593 | ✅/⚠️ 生产实例待生成 |
| [story/10-baima.md](design/story/10-baima.md) | 白马啸西风正邪双线、选择节点、锚点与覆盖表。 | 1,544 | ✅/⚠️ 生产实例待生成 |
| [story/11-yuanyang.md](design/story/11-yuanyang.md) | 鸳鸯刀正邪双线、选择节点、锚点与覆盖表。 | 1,511 | ✅/⚠️ 生产实例待生成 |
| [story/12-shujian.md](design/story/12-shujian.md) | 书剑恩仇录正邪双线、选择节点、锚点与覆盖表。 | 1,705 | ✅/⚠️ 生产实例待生成 |
| [story/13-feihu.md](design/story/13-feihu.md) | 飞狐外传正邪双线、选择节点、锚点与覆盖表。 | 1,711 | ✅/⚠️ 生产实例待生成 |
| [story/14-xueshan.md](design/story/14-xueshan.md) | 雪山飞狐正邪双线、选择节点、锚点与覆盖表。 | 1,738 | ✅/⚠️ 生产实例待生成 |

十四篇合计 **22,571 行**；每篇均有正邪双主线、至少 6 个选择节点及原著重要剧情覆盖表。主线事实以本组为准，`chapters/` 只消费主线索引；后续仍须编译逐章 manifest / `quest.v1`。

### 2.6 十四部书界 `design/chapters/`

| 文档 | 一句话摘要 | 行数 | 状态 |
|---|---|---:|---|
| [chapters/01-tianlong.md](design/chapters/01-tianlong.md) | 天龙区域、支线、人物、投放、珍珑 / 谜案等特色机制。 | 1,763 | ✅ 已审校 |
| [chapters/02-shediao.md](design/chapters/02-shediao.md) | 射雕区域、支线、人物、投放、论剑 / 厨艺 / 西征。 | 1,423 | ✅ 已审校 |
| [chapters/03-shendiao.md](design/chapters/03-shendiao.md) | 神雕区域、支线、情花毒、剑冢练剑与襄阳守城。 | 1,668 | ✅ 已审校 |
| [chapters/04-yitian.md](design/chapters/04-yitian.md) | 倚天区域、支线、光明顶、屠龙秘密与明教统御。 | 1,485 | ✅ 已审校 |
| [chapters/05-xiaoao.md](design/chapters/05-xiaoao.md) | 笑傲区域、支线、琴箫、五岳投票与异种真气。 | 1,520 | ✅ 已审校 |
| [chapters/06-xiake.md](design/chapters/06-xiake.md) | 侠客区域、支线、石壁解谜与赏善罚恶清算。 | 1,614 | ✅ 已审校 |
| [chapters/07-bixue.md](design/chapters/07-bixue.md) | 碧血区域、支线、金蛇秘籍与闯王宝藏。 | 1,735 | ✅ 已审校 |
| [chapters/08-luding.md](design/chapters/08-luding.md) | 鹿鼎区域、宫廷权谋、四十二章经与洪安通 Boss。 | 1,732 | ✅ 已审校 |
| [chapters/09-liancheng.md](design/chapters/09-liancheng.md) | 连城区域、狱中 / 雪谷生存、谎言与唐诗密码。 | 1,213 | ✅ 已审校 |
| [chapters/10-baima.md](design/chapters/10-baima.md) | 白马区域、支线与高昌迷宫特色。 | 1,364 | ✅ 已审校 |
| [chapters/11-yuanyang.md](design/chapters/11-yuanyang.md) | 鸳鸯刀夺刀喜剧与“仁者无敌”非致命解法。 | 1,484 | ✅ 已审校 |
| [chapters/12-shujian.md](design/chapters/12-shujian.md) | 书剑区域、红花会群像与乾隆身世机制。 | 1,564 | ✅ 已审校 |
| [chapters/13-feihu.md](design/chapters/13-feihu.md) | 飞狐区域、承诺系统与掌门人大会。 | 1,168 | ✅ 已审校 |
| [chapters/14-xueshan.md](design/chapters/14-xueshan.md) | 雪山区域、罗生门叙事、“劈与不劈”及终局接口。 | 1,559 | ✅ 已审校 |

十四篇合计 **21,292 行**，按基准 §17 模板组织；区域 / 支线 / 特色归本组，正邪主线仍引用对应 `story/`。

### 2.7 地图数据与渲染产物 `design/map/`

| 文件 | 一句话摘要 | 行数 | 状态 |
|---|---|---:|---|
| [cities.yaml](design/map/cities.yaml) | 189 座城市的稳定 ID、坐标、时代名称与归属。 | 29,649 | 🧰 校验通过 |
| [regions.yaml](design/map/regions.yaml) | 30 个区域、投影、边界与时代可用性。 | 21,395 | 🧰 校验通过 |
| [routes.yaml](design/map/routes.yaml) | 陆路、水路、驿站、货船与图外专线。 | 3,577 | 🧰 校验通过 |
| [sects.yaml](design/map/sects.yaml) | 99 个门派 / 组织的驻地及时代映射。 | 3,604 | 🧰 校验通过 |
| [jianghu-base.svg](design/map/jianghu-base.svg) | 无时代覆盖的水墨江湖底图。 | 6,486 | 🧰 可复现 |
| [jianghu-ch01.svg](design/map/jianghu-ch01.svg) | 天龙时代图层。 | 737 | 🧰 可复现 |
| [jianghu-ch02.svg](design/map/jianghu-ch02.svg) | 射雕时代图层。 | 746 | 🧰 可复现 |
| [jianghu-ch03.svg](design/map/jianghu-ch03.svg) | 神雕时代图层。 | 740 | 🧰 可复现 |
| [jianghu-ch04.svg](design/map/jianghu-ch04.svg) | 倚天时代图层。 | 786 | 🧰 可复现 |
| [jianghu-ch05.svg](design/map/jianghu-ch05.svg) | 笑傲时代图层。 | 784 | 🧰 可复现 |
| [jianghu-ch06.svg](design/map/jianghu-ch06.svg) | 侠客时代图层。 | 799 | 🧰 可复现 |
| [jianghu-ch07.svg](design/map/jianghu-ch07.svg) | 碧血时代图层。 | 797 | 🧰 可复现 |
| [jianghu-ch08.svg](design/map/jianghu-ch08.svg) | 鹿鼎时代图层。 | 823 | 🧰 可复现 |
| [jianghu-ch09.svg](design/map/jianghu-ch09.svg) | 连城时代图层。 | 791 | 🧰 可复现 |
| [jianghu-ch10.svg](design/map/jianghu-ch10.svg) | 白马时代图层。 | 790 | 🧰 可复现 |
| [jianghu-ch11.svg](design/map/jianghu-ch11.svg) | 鸳鸯时代图层。 | 805 | 🧰 可复现 |
| [jianghu-ch12.svg](design/map/jianghu-ch12.svg) | 书剑时代图层。 | 823 | 🧰 可复现 |
| [jianghu-ch13.svg](design/map/jianghu-ch13.svg) | 飞狐时代图层。 | 832 | 🧰 可复现 |
| [jianghu-ch14.svg](design/map/jianghu-ch14.svg) | 雪山时代图层。 | 822 | 🧰 可复现 |

地图目录共 4 份 YAML 与 15 张 SVG、合计 **75,786 行**；SVG 是 `tools/map/render_map.py` 的可重复生成结果，不是另一个地图事实源。

### 2.8 技术规划 `tech/01–09`

| 文档 | 一句话摘要 | 行数 | 状态 |
|---|---|---:|---|
| [tech/01-architecture.md](tech/01-architecture.md) | Three.js + Vue 3 + 确定性 TypeScript 核心、模块边界与 ADR。 | 1,767 | ✅ 已审校 |
| [tech/02-rendering.md](tech/02-rendering.md) | 正交 2.5D、3D 地形、2D 精灵、光照、水墨后处理与渲染器闸门。 | 2,060 | ✅/⚠️ WebGPU 待 P0 证据 |
| [tech/03-mobile-performance.md](tech/03-mobile-performance.md) | 手机性能预算、内存、包体、降级、输入与真机验收。 | 2,102 | ✅/⚠️ 三类真机待实测 |
| [tech/04-data-pipeline.md](tech/04-data-pipeline.md) | schema、内容编译、迁移、地图 / 剧情导入、校验与 CI。 | 1,722 | ✅/⚠️ 生产内容待生成 |
| [tech/05-gameplay-engine.md](tech/05-gameplay-engine.md) | 确定性玩法 core、战斗 / Buff / 任务、存档与回放。 | 2,153 | ✅/⚠️ 传承字段待统一 |
| [tech/06-asset-storage.md](tech/06-asset-storage.md) | 代码 / 本机 / 私有桶三层素材、清单、分包、CDN 与恢复。 | 2,347 | ✅/⚠️ 账号和网络待实测 |
| [tech/07-asset-generation.md](tech/07-asset-generation.md) | “工笔为骨、水墨为气”的原画、角色、精灵、视频和音频管线。 | 1,968 | ✅/⚠️ 许可、账号与真实产物待核 |
| [tech/08-backend-and-online.md](tech/08-backend-and-online.md) | 本地优先存档、私有同步、认证、部署、运维与灾备。 | 2,993 | ✅/⚠️ 实服尚未验证 |
| [tech/09-roadmap.md](tech/09-roadmap.md) | P0–P16 路线图、三点工时、发布闸门、决策点与削减阶梯。 | 1,055 | ✅/⚠️ 执行证据尚未产生 |

### 2.9 工具与执行资料

| 路径 / 入口 | 一句话摘要 | 实测规模 | 状态 |
|---|---|---:|---|
| [tools/lint/README.md](../tools/lint/README.md) / [check_ids.py](../tools/lint/check_ids.py) | 扫描定义、引用、废弃 ID、近似拼写、套装双向关系与 baseline。 | 5 文件 / 4,119 行 | 🧰 strict 门禁；唯一 baseline 为禁用的 `sk_babuganchan` |
| [tools/balance/README.md](../tools/balance/README.md) / [damage_sim.py](../tools/balance/damage_sim.py) / [meridian_flow_sim.py](../tools/balance/meridian_flow_sim.py) / [meridian_flow_golden.json](../tools/balance/meridian_flow_golden.json) | 复算属性、伤害、TTK、十四界 Boss 节奏与逐单位经脉流。 | 4 文件 / 3,400 行 | 🧰 伤害 40/40、经脉 `--check` 通过 |
| [tools/map/render_map.py](../tools/map/render_map.py) / [migrate_regions_v2.py](../tools/map/migrate_regions_v2.py) | 校验地图数据并确定性渲染 base + 十四时代 SVG。 | 2 文件 / 813 行 | 🧰 `--check` 通过 |
| [tools/agents/README.md](../tools/agents/README.md) | 任务图、多 worktree、审校、校验、提交和监督模式总说明。 | 224 行 | 🧰 执行说明 |
| [tools/agents/SUPERVISOR.md](../tools/agents/SUPERVISOR.md) | 每任务启动、等待、续作、校验和合入的监督手册。 | 36 行 | 🧰 执行说明 |
| [tools/agents/run.py](../tools/agents/run.py) | 任务图查询、提示词渲染、闸门、自动调度与校验器。 | 1,040 行 | 🧰 可执行 |
| [tools/agents/step.py](../tools/agents/step.py) | 本轮实际采用的逐任务监督执行器。 | 554 行 | 🧰 可执行 |
| [tools/agents/tasks.json](../tools/agents/tasks.json) | 全任务依赖、写入白名单、模型参数和验收条件。 | 4,799 行 | 🔒 执行配置 |
| [tools/agents/reports/](../tools/agents/reports/) | 各起草、审校与全局终审的证据和遗留汇总。 | 148 个 F45 前置节点已完成 | ✅ 规划轮次完成 |

## 3. 推荐阅读顺序

- **策划读者**：[00-canon](00-canon.md) → [01 世界观](design/01-vision-and-core-loop.md) → [02 时间线](design/02-timeline-and-world-tiers.md) → [03–10 核心规则](design/03-attributes.md) → [11–20 世界与扩展系统](design/11-open-world.md) → 对应 [story/](design/story/01-tianlong.md) 与 [chapters/](design/chapters/01-tianlong.md) → 按需查 [catalog/](design/catalog/skills-shaolin.md) 和 [map/](design/map/cities.yaml)。遇到冲突回看 [rulings-v1](decisions/rulings-v1.md)。
- **技术读者**：[00-canon §18–§20](00-canon.md#18-文档归属避免重复定义) → [tech/01](tech/01-architecture.md) → [tech/04](tech/04-data-pipeline.md) 与 [tech/05](tech/05-gameplay-engine.md) → [tech/02](tech/02-rendering.md) 与 [tech/03](tech/03-mobile-performance.md) → [tech/06–08](tech/06-asset-storage.md) → [tech/09](tech/09-roadmap.md) → [tools/](../tools/lint/README.md)；实现具体系统前再回读其唯一归属策划文档。

## 4. 执行摘要：已定设计与技术结论

1. **项目边界**：单作者、非商业、自娱；交付物当前是可实施规划，不以“个人使用”替代版权、字体或工具许可核验（`00-canon` §0、§16；tech/07 §1、§8）。
2. **十四书与书眠**：可跳过《越女剑》序章，十四部按天龙 → 射雕 → 神雕 → 倚天 → 笑傲 → 侠客 → 碧血 → 鹿鼎 → 连城 → 白马 → 鸳鸯 → 书剑 → 飞狐 → 雪山串联；取得天书后进入余韵，再以《长生诀》书眠切换时代（`00-canon` §2；design/01 §6–§10；design/02 §1、§4）。
3. **高中低武压制**：书界分高 / 中 / 低武，外来武学分别不降 / 降 2 小品 / 降 4 小品，有效层数上限为 10 / 9 / 8；真实成长保留（`00-canon` §3；design/02 §2–§3）。
4. **装配约束**：高 / 中 / 低武分别携带 3/3/3、2/2/2、1/1/1 门内功 / 拳脚 / 兵器，另带 6 件装备；轻功、暗器、杂学不随书眠携带（`00-canon` §3、§20；design/05 §6）。
5. **十二品与武学规模**：天地玄黄 × 上中下共 12 级；正式武学为 `51 + 169 + 459 + 459 = 1,138` 门，约合 **1:3:9:9**，普通天级 51 门闭集（`00-canon` §4、§13；design/05 §14）。
6. **属性和伤害可推导**：属性、典型配装与敌人模板归 design/03；伤害固定走 Z0–Z10 整数管线，`P_ref`、乘区和取整顺序唯一，模拟 40/40 通过（design/03 §2–§13；design/04 §1–§9）。
7. **Buff 与套装闭合**：Buff 目录 247 条，包含分级抗性、四类叠加、59 个事件钩子与 49 个效果原语；套装为 44 套、306 条双向成员关系（design/06 §2–§9；design/07 §8–§18）。
8. **六角格战斗**：战场使用 pointy-top 六角格与六邻接；轻功决定移动力和首轮顺序，动作覆盖点、环、线 / 面、扇形，包含运劲、道具、环境行动者及 AI（design/09 §2–§7、§10、§13；design/08 §7）。
9. **地形、轻功与装备**：48 种地形、轻功五阶阈值 20/50/90/140/200、18 类门禁；装备有 8 格，普通天级装备为 12 件闭集（design/08 §3–§9；design/10 §3–§7）。
10. **成长与结局**：真实等级只增不减，显示等级受书界上限约束；满级经验转余韵，14 本天书各有原著 / 改命之力，全作 7 个结局、74 项成就（design/13 §2、§4、§7、§10–§12）。
11. **冲穴与周天**：经脉系统含 20 脉、180 穴，内功提供内劲，通脉形成小周天 / 大周天并可推进至九转；数值和存档接口已定义（design/15 §2–§11）。
12. **资源与营生**：资源采用天地玄黄 × 九品共 36 级；资源点、家丁与山庄形成生命周期，行脚按次、教头可多处、客卿全局唯一（design/16 §2、§5–§10）。
13. **门派矩阵**：登记 99 个门派 / 组织，按历史与小说组合时代开放矩阵，并统一五级职级、称谓、月钱 / 资源和武学索引（design/17 §1–§12）。
14. **NPC 与同伴**：静态名录有 422 条出场、397 个唯一人物，另有 13 个支持槽，共 435 行；同伴按 D1–D5 招募，健在者可跨书重逢且能力不回退（design/18 §2–§11）。
15. **统一大地图与时代图层**：不是十四套互不相干的地图；同一江湖含 30 区、189 城、99 门派 / 组织与 base + 14 张时代 SVG，地名和开放状态随时代覆盖（design/11 §1–§3；design/19 §2–§11）。
16. **跨年代传承**：39 个传承源各有上 / 中 / 下三卷，共 117 份残卷，并配 39 个缓存 / 信物链；集齐残卷、信物和条件后合成全本（design/20 §2–§10）。
17. **经脉运行与招式路线**：每个我方 / 敌方武学行动者各有独立经脉实例；路线按气量、容量、流畅、迟滞与胀损形成 Z3 加成和 CT，擒拿 / 点穴为 1–9 级，调息负责疏通修复（design/21 §2–§15）。
18. **十四部剧情双线**：`story/01–14` 各自拥有正邪两条主线、8–14 幕级结构、至少 6 个选择节点与原著重要剧情覆盖表；章节稿只组织制作和遭遇，不重写主线（story/01–14 各 §1、§3–§6；`00-canon` §18）。
19. **渲染架构**：客户端采用 Three.js + Vue 3 + 纯 TypeScript 确定性玩法核心；当前只维护 WebGLRenderer 生产路径，WebGPU 必须由 P0 全量包体和真机门决定（tech/01 §2–§6；tech/02 §9；tech/09 §2）。
20. **2.5D 视觉**：正交相机偏航 45°、俯仰 30°，以 3D 高度地形承载深度和遮挡，人物用 8 方向 2D 精灵公告板，水墨后处理合并为单个全屏 pass（tech/02 §1–§8）。
21. **确定性与数据驱动**：玩法 core 禁用非确定性时间、随机与浮点超越函数，使用种子随机和整数 / 万分点；内容经过 schema、编译、迁移、golden 与回放门禁（tech/04 §2–§9；tech/05 §2–§10）。
22. **本地优先、私有同步**：IndexedDB 是权威本地副本，云端是可恢复备份；素材分代码库 / 本机库 / 私有桶三层，运行时按哈希和书界分包，新书界必需部分 ≤60 MB（tech/06 §2–§10；tech/08 §2–§9）。
23. **素材容量**：美术方向为“工笔为骨、水墨为气”，角色精灵采用 3D 中转；精简素材约 `200 + 40 + 14×270 + 200 = 4,220 h ≈ 4,200 h`，包括约 170 名主要人物、约 300 张正式 CG、46 条正式视频的容量口径（tech/07 §2–§9；tech/09 §7.2）。
24. **路线与工时**：实施顺序为 P0 技术闸门 → P1 天龙纵切片 → P2 完整天龙 → P3–P15 逐界 → P16 终局；单人 + AI 辅助三档为 `15,740×0.80≈12,590 h`、`15,740 h`、`15,740×1.35≈21,250 h`，基准约 22.8–28.5 年（12–15 h/周、46 周/年）（tech/09 §1、§7.3）。
25. **削减有次序、底线不可削**：先关 AI NPC / 遥测，再削非关键表现、变体和可选支线演出；只有作者修改内容唯一来源才可减数量，正邪主线、确定性、旧档迁移、离线导出、许可和三机安全门不可削（tech/09 §11.3）。

## 5. 仍待作者决定与实施时冻结

完整清单见 [decisions/author-decisions.md](decisions/author-decisions.md)；G1 已使 P01–P57 的默认值成为当前执行值。以下 9 项是最早会影响实现或全局数据的未闭合入口，均可按默认值继续，不应被误写成已实测：

| 决策点 | 当前默认值 | 出处 |
|---|---|---|
| `O-A3-01 / F2-O01` 越女剑合成形态 | 使用同一 `sk_yuenvjian@legacy_complete=10`，不新建第 52 门普通天级。 | `00-canon` §13、§20；design/20 §7.6；F2 §4.2 |
| `O-A3-02 / F2-O02` 传承当界上限 | `legacyWorldCap` 依书界取 12 / 10 / 9；只截当界有效品阶，保留真实品阶。 | `00-canon` §3；design/20 §7.6；F2 §4.2 |
| `F2-O03` 八步赶蟾是否入正式库 | 不纳入 1,138、生产禁用；若纳入，先指定同品阶替换项再补完整卡。 | F2 §3.1、§4.2 |
| `RD-01` 三台实机 | 主力手机 + 中端 Android + iPad；落实具体型号和入口前 P0 不签出。 | tech/09 §2.3、§10.2；作者决定 P01 |
| `RD-02` 渲染器 | 任一包体、三机硬门或项目采纳门失败即保持 WebGL 单路径。 | tech/09 §2.4、§10.2 |
| `RD-03` 默认画质 | 中端 Android 先试 mid，失败降 low；不把瞬时 60 fps 当稳定结论。 | tech/09 §2.5、§10.2 |
| `RD-04` 标题字体 | 冻结具体 OFL 字体前使用系统字体 / 已核占位，并核中文覆盖、嵌入和子集许可。 | tech/09 §10.2；作者决定 P04 |
| `RD-05` 总工作量 | 至少 8 个有效周日志前维持 15,740 h、12–15 h/周；之后按实耗和返工复估。 | tech/09 §7、§10.2 |
| `RD-06 / RD-07` 云费用、Passkey 与遥测 | Workers 先用 Free，超限能力不上线；Passkey 可延后，遥测默认关闭。 | tech/09 §10.2 |

此外，F2 终审已登记但不要求作者改变设计方向的实施债包括：统一传承 `recipeKey` / 旧 `recipeId` 迁移；生成十四篇 story 的 manifest / `quest.v1`；重配 `design/05` §14.4 来源比例；由 design/20 定稿缓存运行态；补具名人物 / Boss 完整画像；逐点考据 39 个传承缓存 `placeKey`。详见 [F2 报告 §4](../tools/agents/reports/F2.md#4-开放问题附默认值)。

## 6. 如何继续

本轮规划采用依赖图拆分：**每个任务由本机 TraeX CLI 调用 GPT 模型撰写，监督代理逐任务驱动 `tools/agents/step.py`，在独立 worktree 中校验、提交并合入；起草任务后紧跟审校，最后由 F2 做全局一致性终审。**流程细节见 [tools/agents/README.md](../tools/agents/README.md)，实际监督步骤见 [tools/agents/SUPERVISOR.md](../tools/agents/SUPERVISOR.md)。

继续工作时先看 [TODO.md](../TODO.md) §5 的当前决策 / 实测入口和 §6 的阶段状态，再以 [tech/09](tech/09-roadmap.md) P0 开始实现。任何新增规则先确认 `00-canon` §18 的唯一归属；跨文档变化先更新 owner，再运行 ID、伤害与地图门禁。提交 / 推送仍属于调度器的 F6，不由本文宣称完成。
