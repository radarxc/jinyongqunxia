# 05 · 笑傲江湖书界（DLC）

> 归属（基准 §18）：`ch05_xiaoao` 的时代图层、非主线任务、门派投放、人物招募、书界产出、特色玩法与难度落地；主线剧情唯一归属为 `design/story/05-xiaoao.md`，本文只建索引与系统接口。
> 上游：`00-canon.md` v1.2；作者新增需求与决定见 `decisions/author-requirements.md`、`decisions/author-decisions.md`；冲突裁定与重命名见 `decisions/rulings-v1.md`。
> 引用而不重定义：核心循环与锚点 → `design/01`；年代、境界、书眠与残承 → `design/02`；属性、伤害、武学与 Buff → `design/03`–`06`；套装、地形、战斗与装备 → `design/07`–`10`；开放世界与任务 → `design/11`–`12`；成长与天书 → `design/13`；经脉 → `design/15`；资源与营生 → `design/16`；门派矩阵 → `design/17`；人物名录 → `design/18`；世界地图 → `design/19`；前代传承 → `design/20`。
> 标注约定：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需按三联 / 广州修订版逐字核对；**（待核实）** = 技术事实尚未联网确认；**（待实测）** = 需要真机或真账号验证；**【建议值】** = 依赖其他文档、先给可用数值并在文末登记。
> 版本：v1.0（D05 初稿，2026-09-26）；审校 D05.R（2026-09-26）；全局审计（2026-09-26）。

---

## 0. 阅读指引

### 0.1 制作边界

本文把《笑傲江湖》落成第五个时代图层，重点是五岳政治、个人选择和“自在”，不是复述小说。下列内容只作消费接口：

| 内容 | 本文职责 | 唯一事实来源 |
|---|---|---|
| 正邪两条主线 | 列幕、选择节点、区域与系统接口 | `design/story/05-xiaoao.md` |
| 六个锚点与主改命 | 对齐状态、条件与现世叙事 | `design/01` §7.6、story §6–§7 |
| 区域、城市与地图 | 选择本时代开放集并描述差量 | `design/11`、`design/19`、`design/map/cities.yaml` |
| 武学、Boss、合击、装备 | 列本界来源与具名配置，不复制通则 | `design/03`–`10` 与图鉴 |
| 门派、人物与招募 | 写本时代特例和内容挂点 | `design/12`、`17`、`18` |
| 资源、营生与冲穴 | 写本界实例和投放 | `design/15`、`16` |
| 前代传承 | 只引用正式 `lgs_*` / `frag_*` / `cache_*` / `rs_*` | `design/20`、`design/02` |

主线一周目为 2 个共有逻辑任务加正线 8 幕或邪线 8 幕，共 10 个逻辑任务。`design/11` 的“主线 9”按制作包计算：共有第一幕“福威残镖”是轻量序幕，与衡州包共享开局制作额度；不得为对齐预算删除已审校任务。

### 0.2 内容规模与时间预算

| 项 | 本界目标 | 本文落点 |
|---|---:|---|
| 全局区域 | 8 | §3.2 |
| 时代城市 | 18 | §3.3 |
| 主线 | 单路线 10 个逻辑任务；9 个制作包 | §4 |
| 手工支线 | 26 条 | §6.2 |
| 完整奇遇链 / 区域触点 | 14 / 32 | §6.3–§6.4 |
| 可招募队友 | 9 名重点投放 | §8.2 |
| 门派内容位 | 10 | §7 |
| Boss | 8 个正式遭遇 | §8.5、§12 |
| 资源点 / 营生场所 | 18 / 22 | §3.5–§3.6 |
| 预估时长 | 12 小时 | 主线 5.4h + 开放 4.2h + 成长 1.8h + 余韵 0.6h |

时间核算为 `12×45%=5.4h`、`12×35%=4.2h`、`12×15%=1.8h`、`12×5%=0.6h`，合计 12 小时。双线内容供多周目复用，不要求单周目清空互斥支线。

### 0.3 地图与命名口径

1. 本时代地图引用 [`jianghu-ch05.svg`](../map/jianghu-ch05.svg)；城市显示名读取 `map/cities.yaml` 的 `eras.ch05.name`。
2. 区域使用 `design/11` 最新 30 区闭集中的全局 `rg_*`，不沿用基准旧例 `rg_05_*`；本界独占关卡使用 `sc_05_*`，以满足 AR-04。
3. 当前 `cities.yaml` 的杭州、衡州、云南等 `region` 仍指向旧粗区；正文采用最新 `rg_jiangnan_taihu`、`rg_huxiang`、`rg_yundian_qianzhong`，迁移需求见文末。
4. 黑木崖地望不确定，仅作为“黑木崖专线”由剧情入口抵达，不虚构历史城市；图外节点只能经专线到达。
5. `rp_*`、`biz_*` 绑定稳定地理而不含书界号；时代差量由 `chapterId: ch05_xiaoao` 区分。

---

## 1. 书界概览

### 1.1 固定参数

| 字段 | 定稿值 | 说明 |
|---|---|---|
| 书界 | 《笑傲江湖》`ch05_xiaoao` | 前接 `ch04_yitian`，后接 `ch06_xiake` |
| 年代 | 明中叶，年代不详；玩法约 1523–1525 | 具体年份为 **（原创扩展）**；原著有意淡化年代，见 `design/02` §1.3.5 |
| 境界 | 中武 `MID` | 从倚天高武骤降，层数上限 9 |
| 武运 | 75 | 武运档 `WY4` |
| 难度 | D7 | `enemyStatMul=0.85+0.05×7=1.20` |
| 等级 | 敌人 48–60；书界上限 60 | 东方不败为唯一建议 `capExempt`，Lv64 |
| 入场携带 | 内功 2 / 拳脚 2 / 兵器 2；装备 6 | 轻功、暗器、杂学不可携带 |
| 外来压制 | −2 小品 | 普通外来天上 12 → 天下 10；仍守压制下限 |
| 主题 | 正邪名目之外，谁有权替别人决定归属与生活 | 立场轴与刘曲命运轴正交 |
| 天书关键词 | “自在” | 天书实物 `it_tianshu_05` |
| 天书之力 | `tsp_05_canon` / `tsp_05_fate` | 效果只引用 `design/13` §4.3 |
| 预估时长 | 12 小时 | 满足基准 8–15 小时 |
| 主改命 | 金盆洗手前救下刘正风、曲洋 | 仅 `dc_05_02` 写 `flg_05_liuqu_fate` |

### 1.2 体验支柱

1. **名门也要投票**：五岳不再是同色阵营；玩家收集授权、胁迫证据和退出条款，在公开程序与暗线制衡间选择。
2. **一曲跨正邪**：琴箫不是剧情钥匙的单向消费品，既可独奏支援，也可双人合奏；能不能合奏取决于器物、武学、羁绊与战场压力。
3. **力量带着债**：吸星大法能夺内，却把异种真气留在体内；治疗、少林印证和调息安排是长期构筑的一部分。
4. **衰败并非贫瘠**：武运由 95 降至 75、上限由 70 降至 60，但五门原生天级孤本、八派争衡和密集人物网使横向选择更丰富。
5. **自在不是不负责**：正线拒绝以名义吞人，邪线拒绝以筹码占人；两线都须让令狐冲、任盈盈、仪琳和刘曲保有自己的决定。

### 1.3 状态轴与结局组合

| 状态 | 取值 | 写入者 | 消费者 |
|---|---|---|---|
| `flg_05_route` | `neutral / orthodox / unorthodox` | story 的选择节点 | 幕入口、关系、后日谈 |
| `flg_05_liuqu_fate` | `canon / rescued` | 仅 `dc_05_02` | 天书变体、刘曲生命态 |
| `flg_05_wuyue_vote` | `free / balanced / coerced` | `dc_05_06` 与并派大会 | 终幕制衡与后日谈 |
| `flg_05_refused_unification` | boolean | `dc_05_08` | 天书共同条件 |

正 / 邪与原著 / 改命构成 `2×2=4` 种平行收束。救下岳灵珊、宁中则等局部人物不改 `flg_05_liuqu_fate`，也不偷偷新增第三种天书。

---

## 2. 穿越开局

### 2.1 固定苏醒地点与身份

主角从 `ch04_yitian` 书眠约 160 年，在福州府外驿路苏醒。书界补齐的唯一公开身份是“福威镖局临时雇来的验路客”**（原创扩展）**，与 `design/story/05-xiaoao.md` §2 完全一致：主角不是林家谱牒成员，不知完整剑谱所在，只负责勘查一段已被青城弟子踩点的镖路。

开局演出按顺序完成：

1. 展示倚天时代装备与武学经中武压制后的有效值；
2. 在 `sc_05_fuzhou_yilu` 教学官道追踪、驿卒问话和不致死救援；
3. 进入镖局外围，发现袭击早于酒肆冲突部署；
4. 接入 `q_05_main_c_01`，但不允许阻止灭门主因或提前拿到完整 `sk_bixie`。

### 2.2 三种验路凭证

下列不是三个互斥人生身份，而是同一“验路客”的三种履历侧重；它们改变自由探索的首个落点、门派接触和首条支线，不改主线身份。

| 凭证 | 首个自由区域 / 城市 | 门派与关系 | 首条支线 | 便利与代价 |
|---|---|---|---|---|
| 镖路保结 | `rg_fujian` / 福州府 | 福威镖局友善，青城警觉 | `q_05_side_01`“失镖不失人” | 首次走镖免押金；公开身份更易被青城盯上 |
| 衡州乐帖 | `rg_huxiang` / 衡州府 | 衡山派听闻，琴师友善 | `q_05_qiyu_21`“空弦辨曲” | `music` 首次检定重掷；福州证物需驿卒代存 |
| 华阴药单 | `rg_guanzhong` / 华阴县 | 华山外门中立，医者线索开启 | `q_05_side_06`“山道送药” | 首次药材交付减一份；无镖局费用折扣 |

第一幕结束后可补做另外两条引导，但只有首选写 `openingCredential_05` 并给关系便利。起始物品均从 `design/10` 同价池选取，不赠属性点或完整秘籍。

### 2.3 开局关系与叙事禁区

| 对象 | 开局状态 | 玩家可做 | 不可越界 |
|---|---|---|---|
| `npc_linpingzhi` | 临时同路 | 救人、保存证物、劝止牵连 | 替他继承仇恨或决定是否练辟邪 |
| `npc_yucanghai` | 敌视 / 试探 | 误导、取证、战斗或暂时交易 | 洗去灭门责任 |
| `npc_yuebuqun` | 观察 | 交换公开证据、接受有限援手 | 把体面自动等同可信 |
| `npc_ningzhongze` | 中立偏善 | 以救助无辜建立信任 | 用读者知识要求她立即背离家门 |
| `npc_linghuchong` | 尚未相识 | 衡州共同作战后建立羁绊 | 抢走其原著核心抉择与传承 |
| 刘正风 / 曲洋 | 只闻其名 | 逐步发现四项退路准备 | 由书灵直接报出改命答案 |

### 2.4 开局失败兜底

- 镖路战败：林平之仍由原著人物链带离，主角失一份旁证，不断主线。
- 证物丢失：账册、尸伤、驿卒证词三取二可还原袭击预谋。
- 错过凭证支线：衡州幕前由驿馆补发无关系加成的普通路引。
- 长时间离开福州：次要人物救援窗关闭，灭门锚点照常成立；不能靠等待反向阻止事件。

---

## 3. 开放世界地图

### 3.1 本时代图层总览

本界采用 [`jianghu-ch05.svg`](../map/jianghu-ch05.svg) 的明中叶图层，并从 `design/11` 的三十区闭集中开放八区。十八座城市的显示名逐项读取 `map/cities.yaml` 的 `eras.ch05.name`；表中“府、县、州”只表示当代题签，不把现代行政边界反投进小说。

| 开放阶段 | 区域 | 推荐等级 | 入口与用途 |
|---|---|---:|---|
| 开局 | `rg_fujian` | 48–51 | 福威残镖、青城追索、镖路教学 |
| 共有幕一 | `rg_huxiang` | 49–53 | 衡州琴箫、金盆洗手与南岳支线 |
| 共有幕二后 | `rg_guanzhong`、`rg_zhongyuan` | 52–57 | 思过崖、洛阳、少林与五岳政治 |
| 分线中段 | `rg_jiangnan_taihu`、`rg_hedong_jinzhong` | 54–60 | 梅庄、北岳恒山、黑木崖专线 |
| 大会准备 | `rg_qilu`、`rg_yundian_qianzhong` | 53–58 | 泰山自由票、五仙教人情与资源支线 |

轻功阈值只引用 `design/08` §6：qg1 / qg2 / qg3 / qg4 / qg5 分别要求 `qinggong ≥20/50/90/140/200`。本界 34 个轻功门禁按 `5/10/14/5/0` 配置；主线必经目标最高 qg3，且每处都有栈道、钥匙、同伴或任务路线，qg4 只通秘境与捷径。

| qg 阶 | 数量 | 典型门禁 | 失败替代 |
|---:|---:|---|---|
| qg1 | 5 | 驿坡、矮墙、浅沟 | 普通官道 |
| qg2 | 10 | 回雁楼屋顶、城坊高墙、山门屋脊 | 梯、门票或交涉 |
| qg3 | 14 | 思过崖石阶、梅庄地牢井壁、黑木崖吊篮外索 | 引路、机关钥匙或剧情同行 |
| qg4 | 5 | 后洞断隙、崖外密窟、滇中毒涧 | 解谜绕路；仅支线奖励 |
| qg5 | 0 | 不投放 | 本界不以顶级轻功门槛抬高难度 |

### 3.2 八个开放区域

#### 3.2.1 闽地

| 字段 | 本时代状态 |
|---|---|
| 全局区域 ID | `rg_fujian`；名称沿用 `design/11` |
| 地貌 / 地形 | 闽江丘陵、海港、坊巷与镖路；`tr_pingdi`、`tr_milin`、`tr_wuding`、`tr_gaoqiang`、`tr_qianshui` |
| 入口 | 开局即开；福州府内城无门禁，向阳巷内宅须证物或林家关系 |
| 轻功门禁 | qg1 驿坡 / 矮墙 2、qg2 屋顶 1、qg3 林间崖道 1；均有官道、梯具或镖局引路 |
| 城市 | 福州府、泉州府；福州为剧情首城，泉州为海商补给和南少林隐世线索 |
| 势力 / NPC | `sect_fuwei`、`sect_qingcheng`追兵、南少林隐院；`npc_linpingzhi`、`npc_yucanghai`、`npc_yuelingshan` |
| 可学武功 | `sk_linjiajianfa`、`sk_fantianzhang`、`sk_songfengjianfa`、`sk_qingchengcuixinzhang` |
| 敌人等级带 | 48–52；青城小头目 51–53 |
| 场景 / 奇遇 | `sc_05_fuzhou_yilu`、`sc_05_fuwei_waiyuan`、`sc_05_xiangyangxiang`；残镖验伤、海帖辨伪 |

#### 3.2.2 湖湘

| 字段 | 本时代状态 |
|---|---|
| 全局区域 ID | `rg_huxiang`；名称沿用 `design/11` |
| 地貌 / 地形 | 湘江水路、南岳林雾、楼阁与岩坡；`tr_dajiang`、`tr_wuding`、`tr_milin`、`tr_qiaobi`、`tr_shushao` |
| 入口 | 福州共有幕完成后开放驿路；刘府内场需请帖、乐师引荐或暗线凭证 |
| 轻功门禁 | qg1 山径 1、qg2 回雁楼 / 刘府屋顶 2、qg3 南岳林梢 2、qg4 雾谷断涧 1 |
| 城市 | 衡州府、长沙府；衡山派与刘府在衡州，长沙是洞庭商路与选票中转 |
| 势力 / NPC | `sect_hengshan_nan`、嵩山使者、日月暗线；`npc_liuzhengfeng`、`npc_quyang`、`npc_moda`、`npc_yilin`、`npc_tianboguang` |
| 可学武功 | `sk_baibianqianhuan`、`sk_huifengluoyan`、`sk_hengshanyunwubu`、`sk_xiaoaojianghuqu` |
| 敌人等级带 | 49–53；刘府封锁按 52–54 的护送型遭遇 |
| 场景 / 奇遇 | `sc_05_huiyanlou`、`sc_05_liufu`、`sc_05_liuqu_shangu`；空弦辨曲、假名册与水路退场 |

#### 3.2.3 关中陕北

| 字段 | 本时代状态 |
|---|---|
| 全局区域 ID | `rg_guanzhong`；名称沿用 `design/11` |
| 地貌 / 地形 | 华山峭壁、栈道、古洞和关中驿路；`tr_qiaobi`、`tr_xuanya`、`tr_zhandao`、`tr_dongku`、`tr_shibi` |
| 入口 | 衡州幕结束后开放；华山内院看门派关系，思过崖由主线、门派 L2 或令狐冲引路 |
| 轻功门禁 | qg2 栈道 1、qg3 崖阶 / 洞口 3、qg4 后洞断隙 1；山门长路与绳索可达主线目标 |
| 城市 | 华阴县、西安府；华阴县承载华山，西安府是商路、医药与前代线索枢纽 |
| 势力 / NPC | `sect_huashan`气宗 / 剑宗、全真遗迹隐线；`npc_linghuchong`、`npc_yuebuqun`、`npc_ningzhongze`、`npc_yuelingshan`、`npc_fengqingyang` |
| 可学武功 | `sk_zixiashengong`、`sk_taiyuesanqingfeng`、`sk_huashanjianfa`、`sk_huashantuna`、`sk_dugu9` |
| 敌人等级带 | 52–57；药王庙围攻精英 55–58 |
| 场景 / 奇遇 | `sc_05_siguoya`、`sc_05_huashan_houdong`、`sc_05_yaowangmiao`；石刻封存、旧矿鸣声 |

#### 3.2.4 中原

| 字段 | 本时代状态 |
|---|---|
| 全局区域 ID | `rg_zhongyuan`；名称沿用 `design/11` |
| 地貌 / 地形 | 河洛平原、城郭、嵩山寺院与封禅台；`tr_pingdi`、`tr_chengqiang`、`tr_taijie`、`tr_wuding`、`tr_qiaobi` |
| 入口 | 衡州后开放河南府 / 开封府；少林内院和封禅台分别需关系、主线请帖或大会阶段 |
| 轻功门禁 | qg1 河堤 1、qg2 绿竹巷屋脊 / 寺墙 2、qg3 少室山壁 1；封禅侧道另设大会行帖 / 身份门禁 1 |
| 城市 | 河南府、开封府、登封县；洛阳是群豪 / 丐帮枢纽，开封承接平一指医线，登封承载少林与嵩山 |
| 势力 / NPC | `sect_shaolin`、`sect_songshan`、`sect_gaibang`、日月洛阳暗点；`npc_renyingying`、`npc_pingyizhi`、`npc_fangzheng`、`npc_zuolengchan` |
| 可学武功 | `sk_yijinjing`、`sk_hanbingzhenqi`、`sk_songshanjianfa`、`sk_dagou` |
| 敌人等级带 | 52–58；少林三战 / 封禅台 57–60 |
| 场景 / 奇遇 | `sc_05_luoyang_luzhuxiang`、`sc_05_wubagang`、`sc_05_shaolin_snow`、`sc_05_fengchantai` |

#### 3.2.5 太湖江南

| 字段 | 本时代状态 |
|---|---|
| 全局区域 ID | `rg_jiangnan_taihu`；名称沿用 `design/11` |
| 地貌 / 地形 | 西湖、太湖水网、园林、孤山庄院与湖底地牢；`tr_qianshui`、`tr_dajiang`、`tr_shinei`、`tr_jiguan`、`tr_shibi` |
| 入口 | 洛阳段后开放；梅庄外园可访，内庄需四艺投帖或向问天引荐，地牢须主线机关 |
| 轻功门禁 | qg2 园墙 1、qg3 水榭 / 地牢井壁 2、qg4 地牢泄水暗道 1 |
| 城市 | 杭州府、苏州府；杭州承载梅庄，苏州承载旧庄遗迹与琴棋书画交易 |
| 势力 / NPC | 日月神教梅庄支、江南文士与漕帮；`npc_xiangwentian`、`npc_renwoxing`、`npc_linghuchong` |
| 可学武功 | `sk_xixing`、`sk_qixianwuxingjian`、`sk_shigudaxuebi`、`sk_pomopimajian` |
| 敌人等级带 | 54–58；地牢首领 57–59 |
| 场景 / 奇遇 | `sc_05_meizhuang`、`sc_05_meizhuang_dilao`、`sc_05_taihu_jiuzhuang`；四艺换帖、旧匣识谱 |

#### 3.2.6 河东与晋中

| 字段 | 本时代状态 |
|---|---|
| 全局区域 ID | `rg_hedong_jinzhong`；名称沿用 `design/11` |
| 地貌 / 地形 | 北岳石阶、晋中镖路、深谷与黑木崖索道；`tr_qiaobi`、`tr_tiesuoqiao`、`tr_zhandao`、`tr_shengu`、`tr_shinei` |
| 入口 | 少林段后开放大同 / 太原；恒山内院需遗命或门派关系；黑木崖只由剧情专线进入 |
| 轻功门禁 | qg2 寺檐 1、qg3 恒山崖阶 / 黑木索道 2、qg4 崖外档案窟 1；黑木崖吊篮入口另设令牌 / 剧情门禁 1 |
| 城市 | 大同府、太原府；黑木崖无 `city_*`，仅以权威坐标落区 |
| 势力 / NPC | `sect_hengshan_bei`、`sect_riyue`、晋中镖户；`npc_yilin`、`npc_linghuchong`、`npc_renyingying`、`npc_dongfangbubai`、`npc_renwoxing` |
| 可学武功 | `sk_wanhuajianfa`、`sk_heimuyajianfa`、`sk_xixing`、`sk_kuihua` |
| 敌人等级带 | 55–60；东方不败建议 Lv64 超限 |
| 场景 / 奇遇 | `sc_05_hengshan_xuankong`、`sc_05_heimuya_suodao`、`sc_05_heimuya_dadian`；崖风传令、失效黑木令 |

#### 3.2.7 齐鲁

| 字段 | 本时代状态 |
|---|---|
| 全局区域 ID | `rg_qilu`；名称沿用 `design/11` |
| 地貌 / 地形 | 泰山盘道、鲁中丘陵、泉城与河渠；`tr_taijie`、`tr_qiaobi`、`tr_milin`、`tr_qianshui` |
| 入口 | 思过崖后由五岳行帖或普通商路开放；泰山内院须门派关系或大会征询任务 |
| 轻功门禁 | qg1 溪石 1、qg2 松间墙头 1、qg3 十八盘捷径 1 |
| 城市 | 泰安州、济南府；泰安是泰山派门庭，济南是北南商货与中立票证存档点 |
| 势力 / NPC | `sect_taishan`、丐帮分舵、地方行会；掌门群像以门派模板表现，不擅造新具名 NPC |
| 可学武功 | `sk_daizongruhe`、`sk_taishan18pan`、`sk_taishanjianfa`、`sk_taishanxinfa` |
| 敌人等级带 | 53–57；掌门考校 56–58 |
| 场景 / 奇遇 | `sc_05_taishan_shibapan`、`sc_05_jinan_yicang`；山势推演、自由票封缄 |

#### 3.2.8 云滇黔中

| 字段 | 本时代状态 |
|---|---|
| 全局区域 ID | `rg_yundian_qianzhong`；名称沿用 `design/11` |
| 地貌 / 地形 | 滇池、黔中高原、苗寨林谷和毒泽；`tr_milin`、`tr_duzhao`、`tr_sheku`、`tr_pubu`、`tr_qiaobi` |
| 入口 | 洛阳群豪段后由蓝凤凰引路，或完成两份西南商旅路签；不是黑木崖陆路捷径 |
| 轻功门禁 | qg2 苗寨栈楼 1、qg3 瀑布药径 2、qg4 毒涧树梢 1 |
| 城市 | 云南府、贵阳府、曲靖府；云南府为五仙教关系中心，贵阳 / 曲靖为药材和商路节点 |
| 势力 / NPC | `sect_wuxian`、苗寨商旅与日月联络；`npc_lanfenghuang` |
| 可学武功 | `sk_wuxianbaidugong`、`sk_wuxianduzhang`、`sk_wuxiandujing`、`sk_wuxiantuna` |
| 敌人等级带 | 53–58；毒泽精英按 56–59 |
| 场景 / 奇遇 | `sc_05_wuxian_zhai`、`sc_05_dujian`；辨蛊、转血医案、山歌传信 **（原创扩展）** |

门禁核算：八区分别投放 `4+6+5+5+4+5+3+4=36` 个场景门禁。封禅侧道 1 处为大会行帖 / 身份门禁，黑木崖吊篮入口 1 处为令牌 / 剧情门禁；余下轻功门禁恰为 34，分布为 `qg1=5`、`qg2=10`、`qg3=14`、`qg4=5`、`qg5=0`。

### 3.3 十八座时代城市

| # | 城市 ID / 本时代显示名 | 区域 | 时代势力、NPC 与状态 | 资源点 | 营生场所 |
|---:|---|---|---|---|---|
| 1 | `city_fuzhou` 福州府 | `rg_fujian` | 福威镖局遭袭、青城潜入；林平之 / 余沧海线 | `rp_fujian_sicha_01` | `biz_fuzhou_escort_01` |
| 2 | `city_quanzhou` 泉州府 | `rg_fujian` | 海商、南少林隐世传闻；无强制主线 | `rp_fujian_mucai_01` | `biz_quanzhou_casino_01` |
| 3 | `city_hengyang` 衡州府 | `rg_huxiang` | 衡山、刘府、嵩山来使与日月暗线交汇 | `rp_huxiang_yaocai_01` | `biz_hengyang_manor_01` |
| 4 | `city_changsha` 长沙府 | `rg_huxiang` | 湘江商路与中立见证人驻点 | `rp_huxiang_sicha_01` | `biz_changsha_casino_01` |
| 5 | `city_huayin` 华阴县 | `rg_guanzhong` | 华山山门、思过崖补给；令狐冲 / 岳氏一家 | `rp_guanzhong_kuangshi_01` | `biz_huayin_manor_01` |
| 6 | `city_xian` 西安府 | `rg_guanzhong` | 关中驿贸、旧道观和医药市场 | `rp_guanzhong_yaocai_01` | `biz_xian_escort_01` |
| 7 | `city_luoyang` 河南府 | `rg_zhongyuan` | 绿竹巷、群豪、日月联络与丐帮分舵 | `rp_zhongyuan_liangshi_01` | `biz_luoyang_escort_01`、`biz_luoyang_casino_01` |
| 8 | `city_kaifeng` 开封府 | `rg_zhongyuan` | 平一指医线、酒具与药材商路 | 同区粮田 | `biz_kaifeng_casino_01` |
| 9 | `city_dengfeng` 登封县 | `rg_zhongyuan` | 少林、嵩山及并派大会；方证 / 左冷禅 | `rp_zhongyuan_mocai_01` | `biz_dengfeng_manor_01` |
| 10 | `city_hangzhou` 杭州府 | `rg_jiangnan_taihu` | 西湖孤山梅庄、日月神教旧囚线 | `rp_jiangnan_sicha_01` | `biz_hangzhou_manor_01`、`biz_hangzhou_casino_01` |
| 11 | `city_suzhou` 苏州府 | `rg_jiangnan_taihu` | 太湖商埠、旧庄与四艺藏家 | `rp_jiangnan_liangshi_01` | `biz_suzhou_escort_01`、`biz_suzhou_manor_01` |
| 12 | `city_datong` 大同府 | `rg_hedong_jinzhong` | 北岳恒山门户；仪琳与恒山门人 | `rp_hedongjinzhong_mucai_01` | `biz_datong_manor_01` |
| 13 | `city_taiyuan` 太原府 | `rg_hedong_jinzhong` | 晋中镖路与黑木崖专线集散 | `rp_hedongjinzhong_tieqi_01` | `biz_taiyuan_escort_01` |
| 14 | `city_taian` 泰安州 | `rg_qilu` | 泰山派门庭与大会授权票 | `rp_qilu_liangshi_01` | `biz_taian_manor_01` |
| 15 | `city_jinan` 济南府 | `rg_qilu` | 中立票证、北南货运与丐帮耳目 | `rp_qilu_shoucai_01` | `biz_jinan_escort_01` |
| 16 | `city_kunming` 云南府 | `rg_yundian_qianzhong` | 五仙教、蓝凤凰与药毒交易 | `rp_yundianqianzhong_ducai_01` | `biz_kunming_manor_01`、`biz_kunming_casino_01` |
| 17 | `city_guiyang` 贵阳府 | `rg_yundian_qianzhong` | 黔中驿路、苗汉商队与药材转运 | `rp_yundianqianzhong_yaocai_01` | `biz_guiyang_escort_01` |
| 18 | `city_qujing` 曲靖府 | `rg_yundian_qianzhong` | 滇东马路、茶货与五仙外围联络 | `rp_yundianqianzhong_sicha_01`、`rp_yundianqianzhong_mapi_01` | `biz_qujing_manor_01` |

### 3.4 特殊节点与专线

| 节点 | 入口条件 | 路线 | 限制 |
|---|---|---|---|
| `sc_05_heimuya_suodao` 黑木崖吊篮 | 完成恒山段，并持 `it_heimuling`、教众口令或向问天引路之一 | 太原府驿路进入剧情专线 | 不绑定伪造城市；确址 **（待考）** |
| `sc_05_meizhuang_dilao` 湖底地牢 | 四艺比试完成三项，或向问天提供机关解 | 梅庄内部垂直切图 | qg3 只作逃脱捷径，不跳过换囚事件 |
| `sc_05_huashan_houdong` 思过崖后洞 | 主线许可、华山 L2 或风清扬引路 | 华阴县山门—思过崖 | qg4 只开断隙收藏点；核心石刻 qg3 以下也可经绳道抵达 |
| `sect_wudang` 武当会盟访学点 | 少林三战后持方证引荐、冲虚约帖或武当关系之一 | 登封会盟入口直达 `rg_jingxiang` 的武当节点 | 只开放会盟、访学与太极传承节点，不解锁荆襄全区自由探索 |
| `offmap_mingjiao_persia` 波斯总教 | 本界无授权航线 | 不可达 | 仅在世界图保留题签；不得从泉州府临时加船 |

### 3.5 十八个资源点与经济校验

资源点取得、家丁、维护、周期产出和四阶九品完整引用 `design/16`。中武普通点常态 `materialGrade≤5`，L5 专精至多 6，稀缺固定点至多 8；天材 10–12 只可一次性取得，绝不循环产出。复用旧时代同地 `rp_*` 时只重建 `EraResourcePointState`，不继承库存和产权。

| # | 资源点 ID | 地点 / 类别 | 常态品级 | 城外 | 初始控制 | 取得经营权与特例 |
|---:|---|---|---|:---:|---|---|
| 1 | `rp_fujian_sicha_01` | 福州府外茶园 / 丝茶 | 2–5 | 是 | 无 | 护园或购买份额；双路径 |
| 2 | `rp_fujian_mucai_01` | 泉州府北山林 / 木材 | 1–5 | 是 | 南少林隐院 | 护林或隐院 L2；不砍寺界古木 |
| 3 | `rp_huxiang_yaocai_01` | 南岳药坡 / 药材 | 3–5；专精 6 | 是 | 衡山派 | 衡山 L2 或救药农；双路径 |
| 4 | `rp_huxiang_sicha_01` | 长沙府外茶园 / 丝茶 | 2–5 | 是 | 无 | 护商或入股；双路径 |
| 5 | `rp_guanzhong_kuangshi_01` | 华山废矿 / 矿石 | 3–5；专精 6 | 是 | 无 | 清落石或购旧契；玄铁不进常产池 |
| 6 | `rp_guanzhong_yaocai_01` | 华山药径 / 药材 | 2–5 | 是 | 华山派 | 华山 L2 或救治门人；双路径 |
| 7 | `rp_zhongyuan_liangshi_01` | 河南府驿田 / 粮食 | 1–5 | 是 | 无 | 查盗粮案或购买；双路径 |
| 8 | `rp_zhongyuan_mocai_01` | 登封碑墨坊 / 墨料 | 3–5；专精 6 | 否 | 少林 / 行会 | 挂单护碑或赎契；拓印不复制秘籍 |
| 9 | `rp_jiangnan_sicha_01` | 杭州府外桑茶园 / 丝茶 | 2–5 | 是 | 商户 | 护运或入股；双路径 |
| 10 | `rp_jiangnan_liangshi_01` | 苏州府外圩田 / 粮食 | 1–5 | 是 | 无 | 修堤或租佃；水患季减产 |
| 11 | `rp_hedongjinzhong_mucai_01` | 北岳山麓林场 / 木材 | 1–5 | 是 | 恒山派 | 恒山 L2 或救护山户 |
| 12 | `rp_hedongjinzhong_tieqi_01` | 太原府铁作 / 铁器 | 2–5；专精 6 | 否 | 行会 | 教头合同或工匠共管；双路径 |
| 13 | `rp_qilu_liangshi_01` | 泰安州外义仓田 / 粮食 | 1–5 | 是 | 无 | 赈济共管；不得私吞 |
| 14 | `rp_qilu_shoucai_01` | 济南府外牧场 / 兽材 | 2–5 | 是 | 无 | 驯畜或雇工经营 |
| 15 | `rp_yundianqianzhong_ducai_01` | 云南府苗岭毒圃 / 毒材 | 3–5；稀缺固定点 6–8 | 是 | 五仙教 | 五仙 L3 或净化蛇灾；固定高品不循环 |
| 16 | `rp_yundianqianzhong_yaocai_01` | 贵阳府外药谷 / 药材 | 2–5；专精 6 | 是 | 无 | 救采药人或合作契约；双路径 |
| 17 | `rp_yundianqianzhong_sicha_01` | 曲靖府外茶坡 / 丝茶 | 2–5 | 是 | 商户 | 护院或入股；双路径 |
| 18 | `rp_yundianqianzhong_mapi_01` | 曲靖驿牧场 / 马匹 | 2–5 | 是 | 驿户 | 找回马群或长期租契；双路径 |

分布校验：每区 `2/2/2/2/2/2/2/4`，合计 18；城外 15 点，满足 `ceil(0.60×18)=11`；明确初始势力控制 6 点，不超过 `floor(0.40×18)=7`；有双取得路径 12 点，满足 `ceil(0.25×18)=5`。本界收入锚为 `I=2×47×1=94 两/h`，12 小时净价值 `B=94×12=1,128 两`，资源点桶 `1,128×8%=90.24≈90.2 两`；这是全界总新增价值，而不是每点额度。

### 3.6 二十二个营生场所与可任职位

职位门槛、班次、缺勤、唯一客卿、赌场止损与报酬完整引用 `design/16`。本表只登记本时代实例；玩家可做行脚、教头、客卿、看场、账房或护院，但同一时段只结算实际履职的一份报酬。

| 城市 | 场所 ID / 类型 | 可任职位 | 代表合同 |
|---|---|---|---|
| 福州府 | `biz_fuzhou_escort_01` 镖局 | 趟子手、行脚、教头、客卿 | “失镖不失人”：护伤员与镖货二选一优先 |
| 泉州府 | `biz_quanzhou_casino_01` 赌场 | 看场、账房、荷官顾问 | “海票双账”：辨出用旧船票套现者 |
| 衡州府 | `biz_hengyang_manor_01` 山庄 | 护院、乐师教习、客卿 | “金盆前夜”：守三处门而不泄来客名册 |
| 长沙府 | `biz_changsha_casino_01` 赌场 | 看场、查账 | “一票两押”：追回被胁迫的大会授权 |
| 华阴县 | `biz_huayin_manor_01` 山庄 | 护院、剑术教头、客卿 | “崖下送饭”：护补给上山且不窥隐私 |
| 西安府 | `biz_xian_escort_01` 镖局 | 行脚、镖师、教头 | “药单西来”：在时限内送冲穴药材 |
| 河南府 | `biz_luoyang_escort_01` 镖局 | 行脚、镖师、客卿 | “曲谱不出匣”：护送封缄副本 |
| 河南府 | `biz_luoyang_casino_01` 赌场 | 看场、账房 | “五霸冈假筹”：查明人情筹码来源 |
| 开封府 | `biz_kaifeng_casino_01` 赌场 | 看场、验酒、账房 | “杯中八丸”：复原酒具与药丸交换顺序 |
| 登封县 | `biz_dengfeng_manor_01` 寺外庄院 | 护院、教头、短期客卿 | “雪夜护院”：守伤者但不介入寺门内议 |
| 杭州府 | `biz_hangzhou_manor_01` 梅庄外庄 | 护院、四艺教习、客卿 | “四帖入庄”：以真实藏品信息完成引见 |
| 杭州府 | `biz_hangzhou_casino_01` 赌场 | 看场、账房 | “湖底赔率”：识破借赌局传递的假口令 |
| 苏州府 | `biz_suzhou_escort_01` 镖局 | 水路行脚、镖师 | “旧匣过太湖”：护送传承匣并留收据 |
| 苏州府 | `biz_suzhou_manor_01` 山庄 | 护院、教头、客卿 | “还施识谱”：辨招而非认血统 |
| 大同府 | `biz_datong_manor_01` 恒山客院 | 护院、医护教习、客卿 | “遗命三证”：护送三份相互印证的文书 |
| 太原府 | `biz_taiyuan_escort_01` 镖局 | 行脚、镖师、教头 | “黑令不黑货”：只护民货，不替神教押人 |
| 泰安州 | `biz_taian_manor_01` 山庄 | 护院、剑术教头 | “十八盘封缄”：将自由票送至中立见证人 |
| 济南府 | `biz_jinan_escort_01` 镖局 | 行脚、镖师、客卿 | “两河一票”：三条路线择一避开截票 |
| 云南府 | `biz_kunming_manor_01` 苗寨山庄 | 护院、医毒教习、客卿 | “不问教籍”：保护施救者免受误伤 |
| 云南府 | `biz_kunming_casino_01` 赌场 | 看场、账房、辨毒顾问 | “三杯无毒”：找出下蛊者而不强迫试饮 |
| 贵阳府 | `biz_guiyang_escort_01` 镖局 | 山路行脚、镖师 | “药苗过关”：护苗木且保留采药人份额 |
| 曲靖府 | `biz_qujing_manor_01` 山庄 | 护院、驭马教头 | “茶马换契”：调解驿户与茶商的双向违约 |

营生桶为 `1,128×10%=112.8 两`。单合同的货物、现银、职位工资必须分别标 `economySource`，同一批资产不可在“任务奖励”和“营生收入”两次入账。

### 3.7 代表性合同数据接口

```yaml
contractId: contract_05_escort_lianghe_ticket
chapterId: ch05_xiaoao
businessRef: biz_jinan_escort_01
role: escort_runner
route: [city_jinan, city_luoyang, city_dengfeng]
recommendedLevel: 55
requirements:
  - { kind: businessRank, op: ge, value: 2 }
  - { kind: factionRelation, factionId: sect_taishan, op: ne, value: hostile }
objectives:
  - protectCargo: { itemKey: sealed_free_ballot, count: 1 }
  - preserveWitnesses: { minAlive: 1 }
alternatives:
  - qinggongShortcut: { tier: 3, routeKey: taishan_ridge }
  - socialPass: { speech: 45, consume: local_route_note }
reward:
  economySource: business
  valueCap: 0.18h * I(ch05_xiaoao)
failure:
  questBlocked: false
  fallback: deliver_witness_testimony_without_ballot
origin: expanded
```

UI 在接单页必须同时显示预计日程、缺勤冲突、货值、赔付上限、敌对势力与替代路线；赌场合同另显示单局 / 单日 / 章节止损，不能以退出重进刷新随机结果。

### 3.8 前代传承（AR-13）

传承调度、消隐、三卷校合和机会预算只引用 `design/20`。本界开放八区，故上限为主载体 4 个（其中后人载体至多 2 个）、新残本 8 卷、新信物 4 件；候选先过消隐事实、开放地点、路线与已有完整来源等硬过滤，再由确定性调度选入。每个激活源提供 1–3 个残本机会，每源每界最多三卷；校合次数不另设章节上限，只在同源三卷、信物和全部条件实际满足时发生。章节不得新造血脉后人，也不得把活跃门派的正常授艺伪装成残本。

| 传承源 | 本时代载体与地点 | 三卷 / 缓存 | 本界状态与条件 |
|---|---|---|---|
| `lgs_yuenv_aqing` | 越地守传者、旧档和若耶溪墓藏；绍兴府题签，属 `rg_jiangnan_taihu` | `cache_yuenv_ruoye`；`frag_yuenv_jianying`、`frag_yuenv_yuanbu`、`frag_yuenv_wuhen`；信物 `it_xinwu_aqingshoujuan` 随墓藏保护线取得 | 可激活；C10，另需其他剑法 5 重、调和内功 7 品 6 重；无血脉宣称。绍兴府只作传承场景，不计十八座完整城市 **（原创扩展；墓址待考）** |
| `lgs_murong_douzhuan` | 姑苏家臣旧匣 / 参合庄遗址；苏州府 | `cache_douzhuan_canghe`；`frag_douzhuan_jieli`、`frag_douzhuan_yixing`、`frag_douzhuan_huanshi`；信物 `it_xinwu_douzhuan_shipu` 由还施识谱线取得 | 可激活；C10（调和），另需识破两类敌招；不要求慕容血缘 |
| `lgs_gaibang_dagou` | 洛阳分舵断棒夹层；河南府 | `cache_dagou_luoyang`；`frag_dagou_bazijue`、`frag_dagou_banglu`、`frag_dagou_koujue`；信物 `it_xinwu_dagou_bangjie` 由分舵守传认可线取得 | 仅前界提交 `legacy/dagou/lineage_broken` 时可激活；C11（棍杖 6）并保留守传认可；丐帮仍开放不等于谱系已断 |
| `lgs_huangshang_jiuyin` | 终南旧刻拓片与隐名校书人；关中 | `cache_jiuyin_zhongnan`；`frag_jiuyin_zonggang`、`frag_jiuyin_lianqi`、`frag_jiuyin_yongfa`；信物 `it_xinwu_jiuyin_jiaokan` 由校书辨伪线取得 | 仅前界提交 `legacy/jiuyin/manual_lost`；C12（调和），另需任一 `lg_jiuyin` 武学 6 重；不复制倚天剑唯一内容 |
| `lgs_gumu_yunv` | 终南守墓门下再传或密室拓谱；关中支点 | `cache_yunv_gumu`；`frag_yunv_shierduo`、`frag_yunv_shiershao`、`frag_yunv_suxin`；信物 `it_xinwu_yunv_shuangyin` 由双人护法线取得 | 可激活；C10（阴），保留古墓心法前置；羁绊 60 护法条件仍为 `design/20` 建议值，卷名对应关系 **（待考）** |
| `lgs_taiji_quan` | 冲虚等武当门下印证、拳谱旧注或道观碑图；主落点 `rg_jingxiang`，须由少林—武当会盟专线到达 | `cache_taijiquan_wudang`；`frag_taijiquan_song`、`frag_taijiquan_huajin`、`frag_taijiquan_guiyuan`；信物 `it_xinwu_taiji_chutu` 由碑图印证线取得 | 可进入候选；C11（拳掌 6、调和），保留武当 / 品德条件或守传认可；§9.2 的 10 品 `partial` 不是完整 11 品来源 |
| `lgs_taiji_jian` | 冲虚等武当门下印证、剑圈刻痕或木剑夹谱；主落点 `rg_jingxiang`，须由少林—武当会盟专线到达 | `cache_taijijian_wudang`；`frag_taijijian_yuan`、`frag_taijijian_nian`、`frag_taijijian_wang`；信物 `it_xinwu_taijijian_mujian` 由木剑辨铭线取得 | 可进入候选且与拳源同界至多一个主载体；C11（剑法 6、调和），保留武当 / 品德条件或守传认可；有正常完整来源时由硬过滤排除 |
| `lgs_mingjiao_qiankun` | 光明顶旧教藏 | `cache_qiankun_guangming`；`frag_qiankun_yinqian`、`frag_qiankun_nuoyi`、`frag_qiankun_qiceng`；信物 `it_xinwu_qiankun_shenghuolingyin` | 西域区域未开放且无授权专线，本界不可生成；只保留史匣提示，不发卷或信物 |

本表是开放八区加武当授权专线过滤后的本时代候选 / 排除清单，不承诺同周目全投。越女、斗转、打狗、九阴、玉女与太极源均须先被调度进 4 个主载体席位；太极拳 / 剑共用同界二选一限制，打狗 / 九阴还须各自的 `lineage_broken` / `manual_lost` 事实键成立。大理、江淮、东海、西域等未开放区域的其余候选没有授权专线，本界不生成。表中 C10 / C11 / C12 的通用门槛、三卷同源、目标残本真实 7 重、唯一信物、有效硬前置与安全据点研读全部读取 `design/20` §7、§9；本文不预留固定校合次数，也不把未入选源的信物或残本保底发放。

本界没有必要新建 `rs_*`：思过崖、梅庄、黑木崖是本界 `sc_05_*`，前代源由既有 `cache_*` 绑定稳定地理。若后续地图注册古迹，只能先在 `design/20` / `19` 登记后由本文引用。

---

## 4. 主线

### 4.1 索引原则

本节只索引 `design/story/05-xiaoao.md` 已审校的幕和选择节点，不复写目标流程、对白或分支结果。每条路线实际为 `2 共有 + 8 专属 = 10` 个逻辑任务；§0 所述 9 是制作包预算。表内“接口”只指出本章需要提供的区域、NPC、Boss、门派或系统资源。

### 4.2 共有幕索引

| 幕 ID / 标题 | 原著事件范围 | 地点 | 线路 | story 引用 | 本文接口 |
|---|---|---|---|---|---|
| `q_05_main_c_01` 福威残镖 | 灭门、聆秘 | 福州府、城外驿路 | 共有 | story §2.3 | `rg_fujian`、`sc_05_fuzhou_yilu`；林平之 / 余沧海；镖局营生、Boss 01 |
| `q_05_main_c_02` 衡州琴箫 | 救难至授谱、金盆洗手 | 衡州府、刘府与城外山野 | 共有 | story §2.4–§2.5 | `rg_huxiang`、`sc_05_huiyanlou` / `liufu`；琴箫、刘曲改命、Boss 02 |

### 4.3 正线幕索引

| 幕 ID / 标题 | 原著事件范围 | 地点 | 线路 | story 引用 | 本文接口 |
|---|---|---|---|---|---|
| `q_05_main_z_01` 思过崖守秘 | 面壁至围攻 | 华山、思过崖 | 正 | story §3.1 | 华山关系、后洞门禁、令狐冲 / 风清扬、Boss 03 |
| `q_05_main_z_02` 群豪与内伤 | 学琴至联手 | 河南府、开封府、五霸冈、少林 | 正 | story §3.2 | 琴谱、异种真气、平一指、蓝凤凰、冲穴线 |
| `q_05_main_z_03` 梅庄破局 | 打赌至脱困 | 杭州府梅庄 | 正 | story §3.3 | 四艺、湖底地牢、任我行、Boss 04 |
| `q_05_main_z_04` 少林三战 | 伏击至积雪 | 福州、龙泉、登封 | 正 | story §3.4 | 少林 / 武当关系、寒冰反制、Boss 05 |
| `q_05_main_z_05` 恒山承责 | 掌门、密议 | 北岳恒山 | 正 | story §3.5 | 恒山职级、仪琳 / 令狐冲、Boss 06 |
| `q_05_main_z_06` 黑木崖止杀 | 绣花 | 黑木崖 | 正 | story §3.6 | 吊篮专线、普通教众保护、东方不败 Boss 07 |
| `q_05_main_z_07` 五岳止并 | 并派至夺帅 | 嵩山封禅台 | 正 | story §3.7 | 五岳投票、授权证据、左冷禅 / 岳不群 Boss 08A |
| `q_05_main_z_08` 后洞救人与江湖作别 | 复仇至曲谐 | 北方驿路、恒山、华山、梅庄 | 正 | story §3.8 | 后洞照明、人物局部改命、拒盟、天书与书眠 |

### 4.4 邪线幕索引

| 幕 ID / 标题 | 原著事件范围 | 地点 | 线路 | story 引用 | 本文接口 |
|---|---|---|---|---|---|
| `q_05_main_x_01` 思过崖取图 | 面壁至围攻 | 华山、思过崖 | 邪 | story §4.1 | 残缺洞图、华山关系、Boss 03 |
| `q_05_main_x_02` 药债与人情网 | 学琴至联手 | 河南府、开封府、五霸冈、少林 | 邪 | story §4.2 | 人情筹码、异种真气、五仙医毒与冲穴线 |
| `q_05_main_x_03` 梅庄换主 | 打赌至脱困 | 杭州府梅庄 | 邪 | story §4.3 | 四艺诱饵、地牢、旧教主密令、Boss 04 |
| `q_05_main_x_04` 空寺迷局 | 伏击至积雪 | 福州、龙泉、登封 | 邪 | story §4.4 | 假调令、少林地道、三战演出、Boss 05 |
| `q_05_main_x_05` 双教筹码 | 掌门、密议 | 北岳恒山 | 邪 | story §4.5 | 安全名单、黑木崖路线、Boss 06 |
| `q_05_main_x_06` 黑木崖易帜 | 绣花 | 黑木崖 | 邪 | story §4.6 | 双令潜入、档案库、东方不败 Boss 07 |
| `q_05_main_x_07` 五岳执秤 | 并派至夺帅 | 嵩山封禅台 | 邪 | story §4.7 | 否决权、退出条款、左 / 岳 Boss 08A |
| `q_05_main_x_08` 后洞清算与拒盟 | 复仇至曲谐 | 驿路、恒山、华山、梅庄 | 邪 | story §4.8 | 后洞反围、人物状态、拒盟、天书与书眠 |

### 4.5 八个选择节点索引

| 节点 | 标题 | 所在幕 / 时机 | 轴与锁定 | story 引用 | 本文消费接口 |
|---|---|---|---|---|---|
| `dc_05_01` | 辟邪证物去向 | 共有幕一结束前 | 证物去向；不锁线 | story §5.2 | 福州支线、林 / 华山 / 青城关系 |
| `dc_05_02` | 金盆洗手：曲终还是人在 | 共有幕二典礼封锁后 | 唯一命运轴；不可逆 | story §5.3 | 四项准备、刘曲生命态、天书变体 |
| `dc_05_03` | 曲谱作证还是作筹码 | 共有幕二末 | 首次分正 / 邪 | story §5.4 | 琴箫、五岳 / 日月关系 |
| `dc_05_04` | 旧教主出牢后的盟约 | 梅庄后 | 正 / 邪或切线 | story §5.5 | 少林入口、任我行 / 任盈盈关系 |
| `dc_05_05` | 恒山在明还是在暗 | 少林后、恒山前 | 正 / 邪或切线 | story §5.6 | 恒山公开 / 幕后身份与职级权限 |
| `dc_05_06` | 黑木崖之后把证据给谁 | 黑木崖后 | 维持或切线；大会前锁证据 | story §5.7 | 五岳投票、教众名单保护 |
| `dc_05_07` | 复仇与救人 | 并派后 | 最终锁正 / 邪 | story §5.8 | 林平之、岳灵珊、宁中则局部生命态 |
| `dc_05_08` | 任我行迫盟与最后拒绝 | 后洞后 | 不再切线；锁拒盟方式 | story §5.9 | `flg_05_refused_unification`、天书共同条件 |

### 4.6 主线与本文其他节的接口

| 消费方 | 契约 | 失败保护 |
|---|---|---|
| 区域 §3 | 主线必须按福州 → 衡州 → 华山 / 河洛 → 杭州 / 少林 → 恒山 / 黑木崖 → 嵩山 / 华山开放 | 轻功不足走慢路；专线缺令牌由同行 NPC 引路 |
| 锚点 §5 | 六锚点顺序固定，且黑木崖必须早于并派；只有刘曲是主改命 | 局部伤亡不能改写 `flg_05_liuqu_fate` |
| 支线 §6 | 四项改命准备、五派授权、医债与四艺证据由支线供给 | 任一关键证据至少两来源；错过仍有原著线 |
| 门派 §7 | 主线临时通行不等于入门或晋升；大会授权不是玩家代投 | 门派敌对时使用证人、伪装或中立通道 |
| 人物 §8 | 原著人物保有关键选择；招募窗不得挪走核心演出者 | 核心 NPC 暂离队，以剧情态参战 |
| Boss §8 / §12 | 主线只引用 8 个独立遭遇预算；核心原著对决由原人物完成 | 护送、降服、撤退和守擂不是全歼 |
| 系统 §10 | 琴箫、投票、吸星状态均由主线触发但不由 story 重定义 | 系统检定失败改变代价和后日谈，不删必经锚点 |

---

## 5. 锚点事件与天书现世条件

### 5.1 六个锚点索引

| # | 锚点 | 原著线 | 可介入 / 改命线 | 状态与顺序 | story 引用 |
|---:|---|---|---|---|---|
| 1 | 福威镖局灭门与辟邪线索 | 灭门因果成立，林平之踏上复仇路 | 救次要人物、保存或分流证物；不能令剑谱之争从未发生 | `flg_05_fuwei_witnessed` | story §6.1 #1 |
| 2 | ★ 刘正风金盆洗手 | 刘曲死亡，曲谱托付 | 四项退路取三并在撤离战保住二人，刘曲隐姓埋名生还 **（原创扩展）** | 仅此处写 `flg_05_liuqu_fate` | story §6.1 #2、§6.2 |
| 3 | 思过崖与五岳剑招 | 令狐冲见石刻并获风清扬传剑 | 玩家封存石洞或拓残图作筹码；不自动学会五岳剑法 | 锚点 2 后 | story §6.1 #3 |
| 4 | 梅庄与任我行脱困 | 任我行脱困重返江湖 | 改变四友 / 庄客伤亡与证据去向，不取消脱困 | `flg_05_ren_freed=true` | story §6.1 #4 |
| 5 | 黑木崖决战 | 东方不败败亡、任我行复位 | 改变教众伤亡和名册去向；东方存活不是本界默认改命 | `flg_05_heimuya_done=true`，必须先于锚点 6 | story §6.1 #5 |
| 6 | 五岳并派、后洞与作别 | 夺帅、聚歼、拒盟、合奏收束 | 自由票 / 制衡票、救援和退出条款改变过程；仍由令狐冲拒盟 | `flg_05_anchor6_done=true` | story §6.1 #6 |

### 5.2 主改命的两条达成路径

四项准备为乐谱 / 退隐意愿证据、撤离路线、家眷转移、识别双方耳目；其细节唯一见 story §2.5。资格与战场成功条件只在此引用：

```text
anchorReady = count(
  flg_05_anchor_score,
  flg_05_anchor_escape,
  flg_05_anchor_family,
  flg_05_anchor_eyes
) >= 3

fateSuccess = anchorReady
  && choice(dc_05_02) == RESCUE
  && npc_liuzhengfeng.notDowned
  && npc_quyang.notDowned
```

| 路径 | 达成 | 叙事与代价 | 结果 |
|---|---|---|---|
| 原著线 | `dc_05_02=A/C/D`，或准备少于 3，或撤离中任一人倒地 | 玩家可以护家眷、托曲谱、减少伤亡；不能把“不改命”写成毫无行动 | `flg_05_liuqu_fate=canon` |
| 改命线 | 四项取三、选择 B、刘曲均未倒地 | 放弃刘府公开扬名及一项五岳奖励，五岳公开关系下降；若二人曾入队，首次同伴改命按 `design/13` §6.6 支付 2 点余韵 | `flg_05_liuqu_fate=rescued` |

### 5.3 天书现世共同条件

下列五项全部满足才生成 `it_tianshu_05`：

1. 六锚点按序完成，`flg_05_heimuya_done` 的时间戳早于并派大会；
2. `flg_05_anchor6_done=true`；
3. `flg_05_refused_unification=true`，玩家与令狐冲均未被强行纳入五岳或日月的唯一秩序；
4. `sk_xiaoaojianghuqu` 至少完成一次合法演奏见证；合击条件不足时只播叙事演奏，不伪造 `cmb_qinxiao`；
5. 若玩家曾协助强迫婚姻 / 入教，须先完成“撤令”，恢复令狐冲、任盈盈的自主选择。

天书变体只读取刘曲命运，不读取正邪标签、票数或局部救援：

```text
powerId = flg_05_liuqu_fate == rescued
  ? tsp_05_fate
  : tsp_05_canon
```

`tsp_05_canon`“自在”和 `tsp_05_fate`“曲终在人”的效果只以 `design/13` §4.3 为准。本文只写演出：原著线由后来者续上遗曲；改命线由隐姓埋名的刘曲亲奏，天书文字从两声部之间显现。

### 5.4 四种收束与失败兜底

| 路线 × 命运 | 局部标题 | 天书 | 后日谈重点 |
|---|---|---|---|
| 正 × 原著 | 一曲江湖 | `tsp_05_canon` | 公开证据限制门派吞并，后来者续奏 |
| 正 × 改命 | 曲终人在 | `tsp_05_fate` | 刘曲以自己的姓名与生活退出江湖 |
| 邪 × 原著 | 无主之秤 | `tsp_05_canon` | 秘密互相制衡，拒绝权位与强迫婚姻 |
| 邪 × 改命 | 弦外自由 | `tsp_05_fate` | 刘曲生还地点不被任何组织独占 |

- 投票失败：岳不群仍取得优势，后洞救援与公开拒盟继续。
- 证据全失：`dc_05_08.A` 以令狐冲在场作为通关保底；玩家保护退路。
- 合击不达标：叙事演奏仍满足“曲谱见证”，但不给战斗合击收益。
- 刘曲改命失败：立即写 `canon`，不得在终局凭品德或读档残值补成 `rescued`。
- 现世条件未齐：余韵任务列出缺项，不发错版本天书，也不以另一条路线替代。

---

## 6. 支线任务

### 6.1 数量、命名与安全边界

本界登记 26 条手工支线，其中普通 8、门派 7、人物羁绊 7、奇遇 4；另以其中 4 条奇遇和 10 条门派 / 人物 / 普通支线组合为 14 条完整奇遇链。既有示例 `q_05_bond_90` 属 `design/12` 的接口演示，不纳入本文 26 条，也不复用编号。

所有支线遵守三项硬规则：不提前写主线决定旗标；不把临时同行当永久招募；关键证物至少有一个主线兜底来源。互斥奖励按多周目预算，不要求单周目拿齐。

### 6.2 二十六条手工支线

| ID / 名称 | 类型 | 区域 | 触发 | 简述 | 奖励 | 原著关联 |
|---|---|---|---|---|---|---|
| `q_05_side_01` 失镖不失人 | 普通 | 闽地 | 选镖路保结或见残镖 | 在追兵前救伤员、封存账页；货、人可分队保全 **（原创扩展）** | 镖局关系、福州营生入口、证物旁证 | 福威镖局遇害背景 |
| `q_05_side_02` 向阳巷旧契 | 普通 | 闽地 | 共有幕一后 | 核验老宅契书，不进入核心藏谱处 | 林家关系、地契线索 | 林家向阳巷老宅；细节 **（待考）** |
| `q_05_side_03` 海帖双印 | 普通 | 闽地 | 泉州府开放 | 查两枚伪造商印，保住避祸船位 **（原创扩展）** | 丝茶经营权双路径、路费减免 | 无，原创商路线 |
| `q_05_side_04` 三处退路 | 普通 | 湖湘 | 金盆典礼前 | 比较水路、地窖、换车点，任选安全两处 **（原创扩展）** | `flg_05_anchor_escape` | 刘曲退隐愿望的玩法扩展 |
| `q_05_side_05` 假名册 | 普通 | 湖湘 | 取得刘府信任 | 分批安置家眷并制作不伤旁人的假名单 **（原创扩展）** | `flg_05_anchor_family` | 金盆洗手牵连家眷 |
| `q_05_side_06` 山道送药 | 普通 | 关中 | 选华阴药单或入华山 | 分三温层把药送上思过崖 **（原创扩展）** | 华山药径经营权、冲穴药包 | 令狐冲受伤与面壁 |
| `q_05_side_07` 五霸冈药账 | 普通 | 中原 | 洛阳群豪段 | 登记各路疗法、阻止药性继续冲突 | 医理经验、`it_xumingbawan`线索 | 群豪为令狐冲疗伤 |
| `q_05_side_08` 梅庄旧仆 | 普通 | 太湖江南 | 梅庄幕结束 | 救助未参与囚禁的庄客并追缴假令 **（原创扩展）** | 梅庄营生入口、四艺线索 | 梅庄四友与庄客背景 |
| `q_05_faction_09` 华山两宗旧账 | 门派 | 关中 | 华山 L1 或主线引荐 | 复核旧谱与口述，拒绝把石洞当夺位武器 | 华山贡献、`sk_huashanjianfa`授艺资格 | 气剑之争；具体旧事 **（待考）** |
| `q_05_faction_10` 嵩阳冰脉 | 门派 | 中原 | 嵩山 L2、或雪地救援 | 追踪寒劲伤势并决定公开或封存练功事故 | `sk_songshanjianfa`；高阶线开启 `sk_hanbingzhenqi`试炼 | 左冷禅寒冰真气 |
| `q_05_faction_11` 泰山十八盘 | 门派 | 齐鲁 | 泰山 L1 或大会征询 | 以方位推演护送自由票过盘道 | `sk_taishan18pan`、泰山授权 | 泰山参与五岳并派 |
| `q_05_faction_12` 衡山云雾谱 | 门派 | 湖湘 | 莫大关系中立以上 | 在雾中辨出同招异势并归还失谱 | `sk_baibianqianhuan`观摩或贡献 | 衡山剑路与莫大 |
| `q_05_faction_13` 恒山药戒 | 门派 | 河东 | 恒山 L1 或医护事件 | 分配熊胆丸与断续胶，救敌我伤者 | 恒山贡献、药物、`sk_wanhuajianfa`前置 | 恒山慈悲与医药 |
| `q_05_faction_14` 黑木两令 | 门派 | 河东 | 日月 L1 或向问天引荐 | 核验旧教主令与现任令，保护被夹在中间的教众，并追回三尸药账与解药库 **（原创扩展）** | `it_heimuling` 临时权限、日月贡献；服丹者可按下述条件永久根治 | 神教权力更替；根治路径原创 |
| `q_05_faction_15` 五仙百毒课 | 门派 | 云滇黔中 | 蓝凤凰引荐 | 辨毒、配解药，不以活人强迫试药 | `sk_wuxianduzhang`或毒抗材料 | 蓝凤凰及五仙教医毒 |
| `q_05_bond_16` 令狐冲·酒醒有言 | 羁绊 | 中原 | 令狐冲同行、羁绊 2 | 在不代他决定师门 / 婚姻前提下听其自述 | 羁绊、合击候选、酒具收藏 | 令狐冲饮酒与被逐 |
| `q_05_bond_17` 任盈盈·帘后无名 | 羁绊 | 中原 | 绿竹巷后 | 守住她暂不公开身份的边界 | 羁绊、琴箫第二声部训练 | 绿竹巷学琴 |
| `q_05_bond_18` 宁中则·旧门新路 | 羁绊 | 关中 | 华山关系友好 | 护送女弟子、核验流言，不逼她立刻背离家庭 | 招募门槛进度、华山口碑 | 宁中则处境；细节 **（待考）** |
| `q_05_bond_19` 岳灵珊·不替我选 | 羁绊 | 闽地 / 关中 | 福州相识、华山幕后 | 让她自行决定证物与去向，不设强制配对 **（原创扩展）** | 招募门槛、局部救援准备 | 岳灵珊与林平之线 |
| `q_05_bond_20` 林平之·仇与剑 | 羁绊 | 闽地 / 中原 | 辟邪证物仍可核验 | 把复仇对象与无辜旁人分开，保留其知情选择 | 招募门槛、`sk_linjiajianfa`授艺 | 林家灭门与复仇 |
| `q_05_qiyu_21` 空弦辨曲 | 奇遇 | 湖湘 | 衡州乐帖或 `music≥30` | 从缺弦节拍辨出两声部，不获得完整曲谱 | `music`经验、`flg_05_anchor_score` | 刘曲以音相知 |
| `q_05_qiyu_22` 续命八丸 | 奇遇 | 中原 | 开封医线 | 复原八丸去向，选择救急或留作反噬缓解 | `it_xumingbawan`一份或医理经验 | 祖千秋、老头子与老不死；细节 **（待考）** |
| `q_05_qiyu_23` 若耶剑影 | 奇遇 | 太湖江南 | `lgs_yuenv_aqing` 激活 | 在旧档、口述、墓藏机会中确认同源卷位 | `frag_yuenv_*`之一或信物线索 | 《越女剑》跨书传承；载体 **（原创扩展）** |
| `q_05_qiyu_24` 还施旧匣 | 奇遇 | 太湖江南 | `lgs_murong_douzhuan` 激活 | 以两类敌招识破旧匣机关，不验证血缘 | `frag_douzhuan_*`之一、缓存收据 | 《天龙八部》慕容传承；后世载体 **（原创扩展）** |
| `q_05_bond_25` 仪琳·一念不迫 | 羁绊 | 河东 | 少林段后、仪琳羁绊 2 | 护送恒山门人并明确拒绝以婚姻替她作主 | 招募门槛、恒山关系 | 仪琳对令狐冲的情感与后期逼婚 |
| `q_05_bond_26` 蓝凤凰·借血还情 | 羁绊 | 云滇黔中 | 完成转血救援 | 处理苗女受辱流言、让受救者亲自答谢 | 招募门槛、五仙双路径经营权 | 水蛭转血救治 |

### 6.3 十四条完整奇遇链

完整链不是额外 14 个任务 ID，而是上表任务的制作标签，防止把一个触点误算成一条链。

| 链 # | 主任务 | 串联触点 | 完成判据 |
|---:|---|---|---|
| 1 | `q_05_side_01` | 残镖、伤员、账房 | 人或账至少保一，证物封存 |
| 2 | `q_05_side_02` | 旧契、邻证、空龛 | 不越过核心藏谱边界 |
| 3 | `q_05_side_04` | 水路、地窖、换车点 | 勘察三取二 |
| 4 | `q_05_side_05` | 名册、家眷、耳目 | 完成转移且不以杀耳目代替 |
| 5 | `q_05_side_06` | 药铺、栈道、崖口 | 药材损耗不超过一份 |
| 6 | `q_05_side_07` | 酒杯、药账、诊案 | 正确识别相冲来源 |
| 7 | `q_05_faction_09` | 旧谱、石壁、剑宗口述 | 两种证据互证 |
| 8 | `q_05_faction_11` | 山脚、十八盘、封缄亭 | 自由票未被替换 |
| 9 | `q_05_faction_13` | 药库、伤营、戒律堂 | 敌我伤者均有处置 |
| 10 | `q_05_faction_15` | 毒圃、蛇窟、瀑布药径 | 解药检验不伤活人 |
| 11 | `q_05_qiyu_21` | 空弦、山歌、刘府乐席 | 两声部节拍复原 |
| 12 | `q_05_qiyu_22` | 酒具、八丸、医案 | 复原交换次序 |
| 13 | `q_05_qiyu_23` | 旧档、若耶溪、墓藏 | 依调度写卷位 / 信物收据 |
| 14 | `q_05_qiyu_24` | 苏州旧宅、太湖水阁、旧匣 | 识破两类招路后开匣 |

### 6.4 三十二个区域奇遇触点

武运 `W=75`，故每区触点数 `floor(1+75/25)=4`；八区合计 `8×4=32`。每个机会只在稳定种子第一次结算，读档不重掷。

| 区域 | 四个触点 | 对应任务 / 用途 |
|---|---|---|
| `rg_fujian` | 残镖辙印、向阳巷旧契、海帖印泥、寺界古木 | `side_01/02/03`、资源入口 |
| `rg_huxiang` | 回雁楼空弦、刘府水门、南岳雾谱、长沙封票 | `side_04/05`、`faction_12`、`qiyu_21` |
| `rg_guanzhong` | 思过崖回声、后洞断隙、药径冰痕、废矿鸣石 | `side_06`、`faction_09`、资源事件 |
| `rg_zhongyuan` | 绿竹巷隔帘、酒杯药末、少林雪印、封禅假票 | `side_07`、`qiyu_22`、主线 / 投票 |
| `rg_jiangnan_taihu` | 梅庄四帖、地牢水声、若耶旧档、还施旧匣 | `side_08`、`qiyu_23/24` |
| `rg_hedong_jinzhong` | 恒山药篮、吊篮断绳、失效黑木令、崖外名册 | `faction_13/14`、主线 |
| `rg_qilu` | 十八盘刻度、义仓双锁、济南封缄、松风问向 | `faction_11`、资源 / 投票 |
| `rg_yundian_qianzhong` | 毒圃错叶、瀑布药径、苗寨山歌、转血水蛭 | `faction_15`、`bond_26` |

### 6.5 奖励、互斥与回收

- 26 条支线总奖励的新增经济价值计入“任务 451.2 两”或其明确的资源 / 营生桶；同一物品不重复记账。
- 天级武学、神兵、唯一信物不得用随机支线箱掉落；只给来源资格、残页、观摩或一次性固定物。
- 刘曲四项准备在典礼开始时锁定；少于三项仍可救家眷、托曲谱，不产生假完成。
- 门派身份互斥时允许以外客 / 客卿版本完成故事，但不发该派月钱、内部贡献或职级秘籍。
- 命定人物离队或死亡后，未完成羁绊任务转成“书信 / 遗物收束”，不给虚假的招募完成标记。

---

## 7. 门派与势力

### 7.1 本时代开放矩阵与十个制作位

本节只消费 `design/17` §3 的时代六态和 §1 的称谓模板。`O` 表示本时代可发生完整组织互动，但不保证任何路线都能拜师；`H` 只允许遗迹、来客、残本或隐藏接触；`P/N/D/M` 均不能冒充当代公开山门。笑傲列的机械统计为 `O 15 + H 19 + P 1 + N 41 + D 23 + M 0 = 99`。

| 状态 | 本界组织 | 投放边界 |
|---|---|---|
| `O`，九个五岳图鉴组织 | `sect_huashan`、`sect_songshan`、`sect_taishan`、`sect_hengshan_nan`、`sect_hengshan_bei`、`sect_riyue`、`sect_fuwei`、`sect_qingcheng`、`sect_wuxian` | 均有身份、任务与正式图鉴目录；路线冲突可暂时封门 |
| `O`，正道协调共享位 | `sect_shaolin`、`sect_wudang` | 共用一个“正道协调”制作位：各保留合法 L1–L5 数据与入门入口，但共享登封—武当会盟任务资产；不是把两个组织合并 |
| `O`，地域帮会 | `sect_gaibang` | 本界只做残承、消息网与客盟支线，不制作专属完整经营链；仍保持矩阵 `O`，可读通用 T05A 身份数据 |
| `O`，古龙跨作品投放 | `sect_daqimen`、`sect_kuaihuowangfu`、`sect_renyizhuang` | 依 `design/17` 为机制支线，只作客盟 / 对手 / 隐线，不占本界金庸主线门派制作位 **（原创扩展）** |
| `H` | 南少林、天龙寺、全真、峨眉、昆仑、崆峒、古墓、桃花岛、灵鹫宫、吐蕃密宗等共 19 个 | 只能投遗迹、后人、来客或传承机会；发现后也不自动变 `O` |
| `P` | `sect_huibu` | 只作地方共同体前身，不提前使用清代组织称谓 |
| `D` | 明教、天鹰教、姑苏慕容、逍遥、星宿等共 23 个 | 只允许史料、遗址、传承回响；不得复建组织 |
| `N` | 其余 41 个 | 本界不投放 |

`design/11` 的“门派 10”是完整内容制作位，不是活跃组织计数：五岳 5 位，日月、福威、青城、五仙各 1 位，少林 / 武当协调共享 1 位，合计 `5+4+1=10`。丐帮与三支古龙组织以轻量支线资产出现，不能据此宣称预算有 14 个完整经营位。

### 7.2 通用入门、贡献、晋升与月结

正式身份按 `design/12` §6 的 `member(L1) → L5` 状态机推进：最低贡献依次为 `0/300/900/2400/6000`，声望门槛依次为 `100（或条目豁免）/100/300/800/1600`，年资为 `0/3/10/30/90` 游戏日。达到职级只开放图鉴来源，不能跳过属性、资质、前置、人物许可、真谱或誓约。每书界最多一个 L5；只有 `primarySectId` 领取月钱和配给。

笑傲基准小时收入 `I=94 两`。月钱直接读取 `design/16` §10；下表只把本界实例算出，实际现金与实物都再乘 `dutyRatio=已完成职责块÷要求职责块`：

| 级 | 抽象权限 | 现金 `I×系数` | 配给价值上限 `I×系数` | 足额合计 | 职责块 |
|---:|---|---:|---:|---:|---:|
| L1 | 黄阶基础目录 | `94×0.03=2.82` 两 | `94×0.02=1.88` 两 | 4.70 两 | 2 |
| L2 | 黄阶全开、玄下候选 | `94×0.06=5.64` 两 | `94×0.04=3.76` 两 | 9.40 两 | 3 |
| L3 | 玄阶全开、地下候选 | `94×0.10=9.40` 两 | `94×0.07=6.58` 两 | 15.98 两 | 4 |
| L4 | 地阶与分支秘传 | `94×0.16=15.04` 两 | `94×0.10=9.40` 两 | 24.44 两 | 5 |
| L5 | 最高目录访问权 | `94×0.22=20.68` 两 | `94×0.15=14.10` 两 | 34.78 两 | 6 |

例：L4 完成 4/5 职责，现金为 `15.04×4/5=12.032` 两，资源上限为 `9.40×4/5=7.52` 两等值。全界门派个人收入池为 `1,128×5%=56.4 两`；到顶后暂停循环现金、可售配给和合法掌门分成，但食宿、任务、公账与不可售救济物资仍可用。

共同门规底线：证据不足只立调查任务；拒绝委托不扣贡献；逐出后不删除已合法习得武学，但关闭师父、内库、晋升与月结；五岳并派只按 §10.3 的授权结果迁移或冻结身份，不把所有旧派贡献直接并成一份新钱包。

### 7.3 十个制作位的加入、门规与晋升特例

| 制作位 / 组织 | 入门条件与首链 | 核心门规 | 晋升与配给特例 |
|---|---|---|---|
| 华山 `sect_huashan` | `q_05_faction_09` 后由宁中则 / 岳不群其一认可；剑宗支须另见风清扬 | 不以气剑旧账迫害同门，不盗思过崖石刻 | L3 起选 `qizong/jianzong`；粮、药、绳索；`sk_dugu9` 永不因职级赠送 |
| 嵩山 `sect_songshan` | 公开效力须完成封票或寒伤调查；正线通常止于客卿 | 不伪造五岳授权，不以家眷作胁迫筹码 | L4 须完成 `q_05_faction_10`；铁器、御寒药；强并证据成立时冻结晋升 |
| 泰山 `sect_taishan` | `q_05_faction_11` 保全自由票并通过十八盘考校 | 议事票须可撤回，不得代门人投票 | T03/T02 显示分轨；药材、纸墨、山行具 |
| 南衡山 `sect_hengshan_nan` | `q_05_faction_12` 归还云雾谱，或刘正风 / 莫大引荐 | 不以正邪名目禁绝私人知交，不夺他派曲谱 | L4 须莫大认可；琴弦、木料、药材；刘曲改命不自动给 L5 |
| 北恒山 `sect_hengshan_bei` | `q_05_faction_13` 完成敌我同救；俗家 / 尼众身份分轨 | 护弱、戒滥杀，不强迫弟子以婚姻或出家换安全 | T01/T03 混合称谓；药材、布匹；掌门特例仍须门议 |
| 日月 `sect_riyue` | `q_05_faction_14` 核验两令；任盈盈 / 向问天 / 教务线之一担保 | 不假传黑木令，不以三尸脑神丹强迫普通教众 | L4 可为长老 / 左右使；毒药、铁器、情报；`sk_xixing`、`sk_kuihua` 各走独立剧情硬门槛 |
| 福威 `sect_fuwei` | `q_05_side_01` 保全人证，林家幸存者或总号账房授籍 | 镖物、人命、保密三账分列，不弃伤员保货 | T05B 镖局变体；粮、马料、修缮料；`sk_bixie` 仍需真谱与誓约 |
| 青城 `sect_qingcheng` | 条件正式：须直面灭门责任并完成非伪造的赎罪 / 内应链 | 不得追杀无辜林氏、不毁证、不以师命洗罪 | T03/T02；药材、剑器料；余沧海敌对时只能潜伏身份 |
| 五仙 `sect_wuxian` | `q_05_faction_15` 辨毒且不用活人强试，蓝凤凰认可 | 医毒同账、先备解法；不得把现实族群污名化 | T06；药材、毒材、解药；受控毒材仍服从品阶和库存上限 |
| 正道协调：少林 `sect_shaolin` / 武当 `sect_wudang` | 登封戒杀 / 护院考验或冲虚试剑；两派分别授籍 | 少林不盗寺藏，武当不恃强凌弱；会盟不能替他派投票 | 共用制作资产、身份账独立；粮药 / 丹材 / 墨料；易筋经与太极仍逐项看图鉴来源 |

### 7.4 五级称谓、武学与资源配给

为避免重复九张五行表，先列模板称谓，再列各派 L1→L5 的正式目录切片。每级现金 / 配给统一引用 §7.2 同一行；“配给侧重”只在等值上限内换类别，不增加价值。

| 模板 | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| T01 禅宗 | 俗家弟子 / 沙弥 | 剃度弟子 / 入室僧 | 亲传弟子 / 闭关僧 | 首座 / 长老 / 院堂职司 | 方丈 / 住持 |
| T02 道门 | 记名弟子 / 道童 | 入门道士 | 亲传弟子 | 监院 / 长老 / 都讲 | 掌教 / 观主 / 掌门 |
| T03 剑派 | 外门 / 馆徒 | 内门弟子 | 亲传 / 闭门弟子 | 长老 / 剑堂堂主 / 教习 | 掌门 / 总馆主 |
| T05B 镖局 | 趟子手 | 镖师 / 骨干 | 镖头 / 香主 | 总镖头 / 堂主 | 总号主 / 总舵主 |
| T06 教派 | 教众 | 旗弟子 / 香主 | 堂主 / 客卿 | 法王 / 长老 / 使者 | 教主 |

| 门派 | 模板 | L1 可学 | L2 可学 | L3 可学 | L4 可学 | L5 与配给特例 |
|---|---|---|---|---|---|---|
| 华山 | T03 | `sk_huashanrumenjian`、`sk_huashanjichuquan`、`sk_huashantuna`、`sk_huashanxingbu` | `sk_huashanjianfa`、`sk_xiyijian`、`sk_yunvjian19` | `sk_yangwujian`、`sk_kuangfengkuaijian`、`sk_huashanxinfa` | `sk_taiyuesanqingfeng`、`sk_zixiashengong` | 全谱；`sk_dugu9` 仍为风清扬奇遇；粮药 / 绳索 |
| 嵩山 | T03 | `sk_songshanrumenjian`、`sk_songyangrumenzhang`、`sk_songyangtuna`、`sk_songshanxingbu` | `sk_songshanjianfa`、`sk_songshanzhuangong` | `sk_dayinyangshou`、`sk_songyangxinfa` | `sk_hanbingzhenqi` | 全谱；铁器 / 御寒药 |
| 泰山 | T03/T02 | `sk_taishanrumenjian`、`sk_taishanrumenquan`、`sk_taishantuna`、`sk_shibanshanbu` | `sk_taishanjianfa`、`sk_taishanquan` | `sk_taishan18pan`、`sk_taishanxinfa` | `sk_daizongruhe` | 全谱；药材 / 纸墨 |
| 南衡山 | T03 | `sk_hengshanrumenjian`、`sk_hengshanrumenzhang`、`sk_hengshantuna`、`sk_hengshanqingbu` | `sk_hengshanxinfa` | `sk_huifengluoyan`、`sk_hengshanwushenjian` | `sk_baibianqianhuan`、`sk_hengshanyunwubu` | 全谱；琴弦 / 木料 |
| 北恒山 | T01/T03 | `sk_hengshanbeirumenjian`、`sk_hengshanbeirumenquan`、`sk_hengshanbeituna`、`sk_hengshanbeibu` | `sk_hengshanbeixinfa`、`sk_hengshanbeishenfa` | `sk_hengshanbeijianfa`、`sk_tianchangzhangfa` | `sk_wanhuajianfa` | 全谱；药材 / 布匹 |
| 日月 | T06 | `sk_heimuyarumenjian`、`sk_riyuejichuquan`、`sk_heimutuna`、`sk_shenjiaobu` | `sk_riyuejianfa`、`sk_riyuexinfa` | `sk_shigudaxuebi`、`sk_pomopimajian`、`sk_xuantianzhi`、`sk_xiaoaojianghuqu` | `sk_heimuyajianfa`、`sk_qixianwuxingjian`、`sk_xixing` | 秘库可见 `sk_kuihua`，不等于取得；毒药 / 情报 |
| 福威 | T05B | `sk_linjiarumenjian`、`sk_linjiarumenquan`、`sk_biaojuxinfa`、`sk_tangzibu` | `sk_linjiajianfa`、`sk_linjiashou` | `sk_fantianzhang` | 无新增普授 | L5 也不自动授 `sk_bixie`；粮 / 马料 |
| 青城 | T03/T02 | `sk_qingchengrumenjian`、`sk_qingchengrumenquan`、`sk_qingchengtuna`、`sk_qingchengshanjingbu` | `sk_qingchengxinfa` | `sk_songfengjianfa` | `sk_qingchengcuixinzhang` | 全谱；药材 / 剑器料 |
| 五仙 | T06 | `sk_wuxianrumenzhang`、`sk_miaozhaidufa`、`sk_wuxiantuna` | `sk_wuxiandujing` | `sk_wuxianduzhang` | `sk_wuxianbaidugong` | 全谱；药材 / 受控毒材 |
| 少林 | T01 | `sk_shaolinzhuanggong`、`sk_shaolinxinfa`、`sk_luohanquan`、`sk_shaolinchangquan`、`sk_shaolingunfa`、`sk_chanmenshenfa` | `sk_tongzigong`、`sk_shuaibeishou`、`sk_jingangzhi`、`sk_yinshougun`、`sk_meihuazhuang` | `sk_tongrenhenglian`、`sk_xinyiba`、`sk_tieshazhang`、`sk_cibeidao`、`sk_fumojian`、`sk_shaolinshangke` | `sk_jinzhongzhao`、`sk_dajingangzhang`、`sk_yizhichan`、`sk_ruyingsuixingtui`、`sk_longzhaoshou`、`sk_damojianfa` | `sk_qianshourulaizhang`；`sk_yijinjing` 仍须方证印证与 §9.1 硬门槛；粮药 / 丹材 |
| 武当 | T02 | `sk_taihegong`、`sk_wudangchangquan`、`sk_zhenwujian`、`sk_wudangyunbu` | `sk_liangyixinfa`、`sk_mianzhang`、`sk_wudangjiemaishou` | `sk_taijituishou`、`sk_raozhirou`、`sk_rouyunjian`、`sk_tiyunzong` | `sk_chunyangwuji`、`sk_huzhaojuehushou`、`sk_wujixuangongquan`、`sk_shenmen13`、`sk_zhenwuqijie` | 太极拳 / 剑只开 10 品印证资格，见 §9.2；墨料 / 丹材 |

少林 / 武当共享的是一份会盟任务资产，不共享贡献、称谓、月钱或秘籍。表中只列图鉴明确可在笑傲取得的当代切片；少林 L5 的易筋经、武当的太极残承仍须满足人物许可、剧情与 §9 的章节预算，不因晋级自动发放。

### 7.5 敌对势力、客盟与兼并后果

| 势力 | 默认关系 | 战斗 / 任务作用 | 可转圜边界 |
|---|---|---|---|
| 嵩山强并派 | 随证据从中立转敌对 | 金盆施压、封票、并派大会 | 可分化执行者；不能把胁迫票洗成自由票 |
| 青城灭门追索队 | 敌对 | 福州追击、夺谱、毁证 | 可招降内应；余沧海责任不因合作消失 |
| 黑木崖现任教务 | 条件敌对 | 索道警戒、教众控制、东方不败战 | 教众与杨莲亭教务分账；不把全教一键变敌 |
| 任我行复位集团 | 邪线盟友 / 后期制衡对象 | 梅庄脱困、黑木崖复位、吸星风险 | 合作不等于支持其全部统治手段 |
| 五岳自由派 | 客盟 | 提供独立授权、退派条款和大会证人 | 客盟不发月钱；可保留原派身份 |
| 丐帮消息网 | 客盟 / 轻量 `O` | 追踪失镖、药账、跨城传信 | 可读 T05A 身份；首版不做完整 F0–F6 链 |
| 三支古龙组织 | 隐线 / 机制对手 **（原创扩展）** | 提供高机制、低数值支线遭遇 | 不介入刘曲、黑木崖或并派核心因果 |

并派大会后，选择退出的旧派保持 `member/ally`；自愿并入者写 `absorbed` 并保留个人已学武学；受胁迫票在证据翻案后恢复原身份。任何结果都不能把少林、武当、丐帮或日月并入“五岳”数据域。

---

## 8. 人物

### 8.1 数据源、年龄与招募口径

本界 25 名正式人物只读 `catalog/npcs-ch05-xiaoao.md`；招募、好感、年龄、死亡与跨书重逢只读 `design/18`。小说人物没有可靠精确年份，故一律写“年龄段；生卒待考”，不以约 1523–1525 的玩法定年倒推出生年。具名、可招募角色走 `design/03` §10 的 `full` 管线；普通弟子、守卫与设施人员才可用 `template`。

活动编组仍为主角加最多 5 名队友。D 级衡量叙事门槛，不是强度：D4 至少一条专属人物支线，D5 还必须绑定主线幕 / 锚点、开放窗、锁定警告与联盟兜底。羁绊等级、合击发动与结算统一引用 `design/09` §6.7，本文只列候选组合。

### 8.2 九名重点可招募队友

| NPC | 年龄 / 生卒 | 难度 | 招募任务与硬门槛 | 窗口、暂离与兜底 | 羁绊 / 合击方向 |
|---|---|---:|---|---|---|
| `npc_linghuchong` 令狐冲 | 青年；生卒待考 | D5 | 衡州救仪琳且不夺曲谱；完成 `q_05_bond_16`；华山幕后处理被逐与恒山责任 | 风清扬授剑、梅庄、少林、接掌恒山、拒盟时回剧情席位；未常驻仍作核心盟友 | 任盈盈：琴箫 / 破局；主角：守秘与反击 |
| `npc_renyingying` 任盈盈 | 青年；生卒待考 | D5 | 守住绿竹巷身份边界，完成 `q_05_bond_17`，且救父选择由她本人确认 | 自囚、救父、黑木崖与拒盟时暂离；关系不足仍提供交换窗口 | 令狐冲：`cmb_qinxiao` 候选；向问天：救援 |
| `npc_ningzhongze` 宁中则 | 中年；生卒待考；原著命定死亡状态待上游同步 | D5 | 完成 `q_05_bond_18`，华山关系非敌对，并把至少一份真实证据交给她 | 家庭危机暂离；`dc_05_07` 局部改命后才开放终段常驻 | 岳灵珊：母女援护；主角：剑阵护人 |
| `npc_yuelingshan` 岳灵珊 | 青年；生卒待考；命定死亡 | D5 | 完成 `q_05_bond_19`，林平之非敌对；不得用强制配对替她作主 | 复仇阶段剧情锁定；`dc_05_07` 决定救援窗，未救则遗物收束 | 宁中则：援护；林平之：仅关系修复后可连携 |
| `npc_linpingzhi` 林平之 | 青年；生卒待考；原著结局伤残 | D5 | 福州救援、交还证物并完成 `q_05_bond_20`；必须让其知情选择是否练辟邪 | 修炼与复仇阶段依本人选择离队；不能替他复仇，错过则保留证言盟友 | 岳灵珊：只在无胁迫状态开放；主角：追迹夹击 |
| `npc_xiangwentian` 向问天 | 中年；生卒待考 | D4 | 官道解围、不伤平民，接受梅庄行动边界并完成脱困善后 | 教内交接时暂离；拒绝盟约则提供一次登崖情报 | 任盈盈：撤离；令狐冲：突围 |
| `npc_yilin` 仪琳 | 青年；生卒待考 | D4 | 衡州保护她且不替田伯光开脱；完成 `q_05_bond_25` | 玩家伤害俘虏或替她决定婚姻时拒绝；否则可在恒山事务外同行 | 令狐冲：救护而非情感强绑；主角：慈悲援护 |
| `npc_moda` 莫大 | 老年；生卒待考 | D4 | 不泄露其暗助，完成 `q_05_faction_12` 与刘曲善后 | 并派投票回剧情席位；若不同行，仍作为衡山见证人 | 刘正风：衡山剑路；主角：雾中换位 |
| `npc_lanfenghuang` 蓝凤凰 | 青年；生卒待考 | D4 | `q_05_faction_15` 与 `q_05_bond_26` 均不以活人强试药，任盈盈非敌对 | 黑木崖只到外围；关系未满仍提供解毒服务 | 任盈盈：医毒互援；主角：毒区控制 |

九人均超过“至少 6 名”下限。合击候选并不自动创建新 `cmb_*`；只有已登记的 `cmb_qinxiao` 可直接调用，其余使用援护、追击或普通协同行为，待 `design/09` 另行登记后才可称合击。

### 8.3 其余十六名关键 NPC

| NPC | 年龄 / 生卒 | D | 本界职责与招募边界 |
|---|---|---:|---|
| `npc_yuebuqun` 岳不群 | 中年；生卒待考；命定死亡待考 | D5 | 邪线揭露前可受限合作；夺帅 / 后洞必回剧情席位，明确背叛预警 |
| `npc_dongfangbubai` 东方不败 | 中年；生卒待考；命定死亡 | D5 | 本稿不开存活改命；黑木崖核心战绝不作为普通队友，与任我行互斥 |
| `npc_renwoxing` 任我行 | 中老年；生卒待考；命定死亡待考 | D5 | 梅庄后至登崖可限定同行；迫盟时按自身目标行动，不能用招募洗去控制欲 |
| `npc_fangzheng` 方证 | 老年；生卒待考 | D5 | 围寺未盗经、香客伤亡受控后可极短同行；方丈责任通常转盟援 |
| `npc_chongxu` 冲虚 | 老年；生卒待考 | D5 | 少林守约、太极印证后限定同行；并派只作见证 |
| `npc_fengqingyang` 风清扬 | 老年；生卒待考 | D5 | 守秘后仅思过崖试炼同行，不离华山、不参加门派政治 |
| `npc_zuolengchan` 左冷禅 | 中年；生卒待考；命定结局待考 | D5 | 大会前可受制合作；夺帅时强制成为对手，合作不洗胁迫责任 |
| `npc_dingxian` 定闲 | 中老年；生卒待考；命定死亡 | D5 | 龙泉至少林为剧情限定同行；当前主线无可达生还改命，不制造重复救援窗 |
| `npc_liuzhengfeng` 刘正风 | 中年；生卒待考；命定死亡 | D5 | 典礼前限定同行；只有 §5 改命成功，余韵期才可隐秘招募 |
| `npc_quyang` 曲洋 | 中老年；生卒待考；命定死亡 | D5 | 取得暗号、保护曲谱；改命后与刘正风分别判定招募，可共同触发 `cmb_qinxiao` |
| `npc_tianboguang` 田伯光 | 壮年；生卒待考 | D4 | 须走止恶、赔偿、受害者安全链；不能用好感洗白，再犯即背叛 |
| `npc_pingyizhi` 平一指 | 中年；生卒待考；命定死亡待考 | D4 | 完成医债且拒绝无辜抵命；本稿不开放生还改命 |
| `npc_mugaofeng` 木高峰 | 中老年；生卒待考；命定死亡待考 | D4 | 邪线短时同行且显示高背叛风险；伤害林家幸存者立即敌对 |
| `npc_yucanghai` 余沧海 | 中年；生卒待考；命定结局待考 | D5 | 只能以罪证迫使短时同行 / 赎罪，不存在“原谅即招募” |
| `npc_laotouzi` 老头子 | 中老年；生卒待考 | D4 | 完成家人救治与药债线；不得强取无辜性命 **（待考）** |
| `npc_zuqianqiu` 祖千秋 | 中老年；生卒待考 | D4 | 完成酒器与续命八丸真相，归还借物后可同行 **（待考）** |

### 8.4 前一书界重逢与本界跨书人物能力

`ch04_yitian` 离界 1363，`ch05_xiaoao` 约 1523 入场，间隔 `1523−1363=160` 年。逐项检查倚天 28 名正式人物后，没有任何一名在《笑傲江湖》时代具备可确认的活体 appearance，因此本界可确认活体重逢数为 **0**。不得借卒年不详强行延寿；旧同伴只以遗物、后人、门派记载与 §3.8 传承回响出现。

本界正式名录亦没有同一 `npc_*` 的前界 appearance，故“新出现的跨书 NPC”活体能力重设同样为 0 项。若后续上游新增可确认人物，必须按 `design/18` §6.5 合并：

```text
realLevel = max(oldSnapshot.realLevel, newPortrait.realLevel)
trueLayer[skill] = max(oldSnapshot.trueLayer[skill], newPortrait.trueLayer[skill])
displayLevel = min(realLevel, 60)       # 普通同伴
effLayer = min(trueLayer, tierCapEff, gateCap, special.layerCap ?? 10)
```

保存的真实能力只增不减，但本界中武压制仍可降低显示能力。门派同名延续不等于人物存活：笑傲少林、武当、华山的新人物按本界 `full` 画像生成，不能继承倚天人物的个人层数、羁绊或装备。

### 8.5 八个 Boss 遭遇索引

八个遭遇与 `design/11` 内容预算一致。具名人物只用 `full` 管线；下表等级和模板面板是遭遇预算，不覆盖人物画像。机制统一消费 `design/09` 的阶段门、预警、控制递减、狂暴与失败保护；数值复算见 §12。

| # | 遭遇 / 脚本 | 等级 | 首领 / 角色组 | 武学与品阶 | 核心机制 | 失败保护 |
|---:|---|---:|---|---|---|---|
| 1 | `enc_05_fuzhou_qingcheng` / `bsc_yucanghai_fuzhou` | 52 | `npc_yucanghai`、青城追索队 | `sk_songfengjianfa` 6、`sk_qingchengcuixinzhang` 7 | 三份证物、人 / 货分流；首领不可在此被剧情处决 | 林平之由原著人物链带离，保留一份旁证 |
| 2 | `enc_05_liufu_weidu` / `bsc_liuqu_tuilu` | 54 | 嵩山使者组；刘曲为护送单位 | 五岳玄阶剑路；不预建群体绝学 | 四项准备、两条撤离路、拖延计时；胜利不要求击败左冷禅 | 准备不足回原著线，家眷与曲谱仍可部分保全 |
| 3 | `enc_05_huashan_weigong` / `bsc_huashan_shoumi` | 56 | 剑宗来客、药王庙蒙面组 | 华山 / 五岳玄地阶，按图鉴核配 | 石洞情报、护非战斗者、令狐冲核心对决席位 | 伤员与证据降档，锚点仍完成 |
| 4 | `enc_05_meizhuang_poju` / `bsc_renwoxing_dilao` | 57 | `npc_renwoxing`、梅庄守备 | `sk_xixing` 11；梅庄四艺图鉴项 | 四艺切磋、换囚、牢门与异种真气；俘获 / 撤退目标 | 任我行仍依锚点脱困，庄客伤亡与证据降档 |
| 5 | `enc_05_shaolin_sanzhan` / `bsc_sanzhan_shaolin` | 58 | `npc_fangzheng`、`npc_zuolengchan`、任我行演出组 | `sk_yijinjing` 12、`sk_hanbingzhenqi` 9、`sk_xixing` 11 | 保留任对方证、任对左、冲虚认输、岳令挑战次序；玩家护场截暗手 | 原著胜负照常，玩家只失互保证据 |
| 6 | `enc_05_hengshan_bianling` / `bsc_hengshan_bianling` | 59 | 日月来袭组、真假令使 | 日月 / 恒山玄地阶 | 双令辨伪、门人保护、索道撤离 | 令狐冲仍承担恒山责任，门人伤亡改变后日谈 |
| 7 | `enc_05_heimuya` / `bsc_dongfangbubai_heimuya` | 64 | `npc_dongfangbubai`；任我行等为剧情单位 | `sk_kuihua` 11、`eq_xiuhuazhen` | 正式 `full` 特例：高速残影、锁定杨莲亭命令链、控机关与救非战斗者 | 核心对决不跳过；失败重开阶段，不清洗普通教众 |
| 8 | `enc_05_songshan_duoshuai` / `bsc_wuyue_duoshuai` | 60 | `npc_yuebuqun`、`npc_zuolengchan` | `sk_bixie` 10、`sk_hanbingzhenqi` 9、五岳剑路 | 自由票、守擂、失明画像、退出条款；岳左核心对决仍发生 | 大会结果降为受胁迫 / 合法性受损，主线继续后洞 |

### 8.6 具名人物状态保护

1. 命定死亡只由 story 节点和 `design/18` 的 `fateRuleRef` 写入；普通战斗倒地转重伤、撤离或俘获。
2. 刘正风、曲洋是本界唯一主改命；宁中则、岳灵珊等局部救援只写各自生命态，不改变天书版本。
3. Boss 战时若某核心人物已招募，先原子切换为剧情席位，战后再按生命、关系和窗口决定归队，禁止同时出现队友版与敌方版。
4. 东方不败、任我行、岳不群、左冷禅的合作窗口都不能抹去既有伤害，也不能让玩家替原著人物完成核心对决。
5. 尚未进入正式名录的梅庄四友、桃谷六仙、绿竹翁、杨莲亭、天门道人等只用显示角色 / 群体槽；需要独立生死或招募时，先由 `design/18` 建主记录。

---

## 9. 武学与装备产出

### 9.1 五门完整原生天级与单周目预算

本界完整原生天级池固定为 **5 门**：`skills-wuyue` 的四门，加少林图鉴中的 `sk_yijinjing`。太极拳、太极剑是另外两门 10 品残承，不得混入这 5 门。品阶、招式、层数、内功贡献、誓约和反噬均只读 `design/05` 与相应图鉴；本节只负责把合法来源挂到本界内容节点。

| 武学 | 绝对品阶 / 类别 | 固定获取节点 | 本界门槛与代价 | 互斥 / 预算处理 |
|---|---|---|---|---|
| `sk_yijinjing` 易筋经 | 12 天上 / 内功 | 少林三战后的方证印证；挂 `q_05_main_z_04` / `q_05_main_x_04` 善后 | 少林未敌对、未盗经，且愿为异种真气承担后续修炼；完整来源或已携全本只印证 | 消耗 1 个本界天级获取名额；同 ID 已携全本只印证，不重复计数 |
| `sk_dugu9` 独孤九剑 | 12 天上 / 兵器·剑 | 思过崖风清扬试炼；挂 `q_05_main_z_01` / `q_05_main_x_01` | 先见证令狐冲完成主传承；玩家须守秘、`wis≥70`、剑资质达图鉴要求，或由高羁绊令狐冲引荐 **（原创扩展）** | 消耗 1 名额；不能以神雕剑冢直接习得 |
| `sk_xixing` 吸星大法 | 11 天中 / 内功 | `enc_05_meizhuang_poju` 后读湖底铁板，或任我行合法授艺 | 须有 `sk_riyuexinfa` 6 重；选择研习即开启异种真气教学 | 消耗 1 名额；与易筋并不互斥，但同时取得占 2 名额 |
| `sk_kuihua` 葵花宝典 | 11 天中 / 内功 | `enc_05_heimuya` 后的教藏结算 | 黑木崖秘库来源、冷静期、二次确认与 `vow_duanchen` 全部满足；仅看残页不算取得 | 与辟邪同属本界“葵花源”最多取得 1 门；消耗 1 名额 |
| `sk_bixie` 辟邪剑法 | 10 天下 / 兵器·剑 | 林家老宅袈裟真谱；由 `dc_05_01` 与 `q_05_bond_20` 决定合法读取窗 | `sk_linjiajianfa≥5`；完整修炼须 `vow_duanchen`；无誓约只能按图鉴得 5 品 / 5 重“有形无实”，此时不算天级取得 | 与葵花同源最多取得 1 门；完整来源才消耗 1 名额 |

中武的 `playerTianBudget=3`，所以所有完整来源、残承新学和完整补传都进入同一章节计数器；改门派、队友代领、撤销拜师或重放节点都不能刷新。最外层预算组与葵花源子组如下；`budgetKey` / `sourceKey` 是 `tianExclusiveGroup` 字段内局部键，不申请新的全局 ID：

```yaml
chapterId: ch05_xiaoao
playerTianBudget: 3
tianExclusiveGroup:
  - budgetKey: ch05_xiaoao
    maxAcquired: 3
    members:
      - {skillId: sk_yijinjing, sourceKind: full}
      - {skillId: sk_dugu9, sourceKind: full}
      - {skillId: sk_xixing, sourceKind: full}
      - {skillId: sk_kuihua, sourceKind: full}
      - {skillId: sk_bixie, sourceKind: full}
      - {skillId: sk_taijiquan, sourceKind: partial, sourceGrade: 10}
      - {skillId: sk_taijijian, sourceKind: partial, sourceGrade: 10}
    countRules:
      firstAcquireInChapter: 1
      completeUpgradeInChapter: 1
      carriedFullAttunement: 0
      sameIdRepeat: 0
  - sourceKey: kuihua_line  # `tianExclusiveGroup` 内局部键，不是 `ch*` 全局 ID
    maxAcquired: 1
    members: [sk_kuihua, sk_bixie]
```

合法路线的上界是 `min(3, 5 个完整候选 + 2 个残承候选)=3`；例如“独孤 + 易筋 + 吸星”正好用满 3，“太极拳残承 + 太极剑残承 + 辟邪”也正好用满 3。取得第四项时，UI 必须显示已占用的三个来源并要求放弃当前新来源，不得先发放再回收。葵花 / 辟邪子组使两者不能靠不同任务同时绕过同源限制；“有形无实”的 5 品辟邪不占名额，但以后补成 10 品时才计 1。

### 9.2 两门太极残承：与完整池分列

| 武学 | 来源形态 | 本界获取 / 印证 | 精确结算 | 离界边界 |
|---|---|---|---|---|
| `sk_taijiquan` 太极拳 | `partial`，`lineageGrade=10` | 冲虚 / 武当访学的拳理印证 **（原创扩展）**；武当 L4 或守约外客，高品德 | 若从倚天携完整 11 入界：`max(11−2,10)=10`；若本界新学：`sourceGrade=10` | 本界新学再入侠客为 `10−2=8`，不是按完整 11 算 9 |
| `sk_taijijian` 太极剑 | `partial`，`lineageGrade=10` | 冲虚对剑后的剑圈印证；挂少林三战 / 并派见证窗，不能靠普通观摩自动取得 | 携完整 11 同样为 `max(11−2,10)=10`；新学固定来源 10 | 保存 `partial`、`sourceGrade=10`、`nativeTo=ch04_yitian`，书眠不自动补全 |

两门各自计入本界 3 份天级获取预算，但不把“完整原生 5 门”写成 7 门。若玩家携带完整太极来笑傲，只做 10 品印证而不计新取得；若玩家原本只有残篇，本界首次形成 10 品来源，则计 1。`design/20` 的三卷校合将来可补回 11 品，但仍须三卷、信物和配方齐全；章节的冲虚印证不能越权替代校合。

### 9.3 地、玄、黄阶代表与装配补齐

| 大阶 | 内功代表 | 拳脚 / 杂学代表 | 兵器 / 轻功代表 | 主要来源 |
|---|---|---|---|---|
| 地 | `sk_zixiashengong`、`sk_hanbingzhenqi`、`sk_wuxianbaidugong` | `sk_fantianzhang`、`sk_qingchengcuixinzhang`、`sk_qixianwuxingjian` | `sk_taiyuesanqingfeng`、`sk_daizongruhe`、`sk_baibianqianhuan`、`sk_wanhuajianfa`、`sk_heimuyajianfa`、`sk_hengshanyunwubu` | 门派 L4、专属试炼或梅庄四艺；不可从普通掉落池取得整本 |
| 玄 | `sk_huashanxinfa`、`sk_songyangxinfa`、`sk_riyuexinfa` | `sk_linjiashou`、`sk_wuxianduzhang`、`sk_shigudaxuebi`、`sk_xuantianzhi` | `sk_huashanjianfa`、`sk_songshanjianfa`、`sk_taishanjianfa`、`sk_huifengluoyan`、`sk_hengshanbeijianfa`、`sk_linjiajianfa`、`sk_songfengjianfa`、`sk_pomopimajian` | 门派 L2–L3、支线授艺、四艺观摩 |
| 黄 | `sk_huashantuna`、`sk_songyangtuna`、`sk_taishantuna`、`sk_hengshantuna`、`sk_hengshanbeituna`、`sk_heimutuna`、`sk_biaojuxinfa`、`sk_qingchengtuna`、`sk_wuxiantuna` | 各派 `*_rumenquan` / `*_rumenzhang`，另有 `sk_taizuchangquan` | 各派 `*_rumenjian`，另有 `sk_jianghurumenjian` | L1 授艺、镖局 / 武馆 / 游方武师；作为零携带兜底 |

本界从零起步仍必须能填满内功、拳脚、兵器各 3 格。下表给出一组不要求同时拜入三个敌对门派的可达证明；“通行”表示 `skills-general` 的 `ALL14` 本地来源，而非跨书携带。

| 核心栏 | 三门最低可达组合 | 来源安排 | 可达性核算 |
|---|---|---|---|
| 内功 | `sk_tunaqianjue` → `sk_jianghutuna`，另选 `sk_biaojuxinfa` | 福州武师公开抄本、洛阳武馆进阶、福威镖局短授 | 前两门为同一通行链，第三门只需镖局任职 / 救援，不要求正式加入五岳；共 3 门 |
| 拳脚 | `sk_taizuchangquan`、`sk_jianghuchangquan`、`sk_sanshou` | 衡州 / 洛阳武馆与镖局教头 | 都是通行来源；依图鉴层数与资质学习，不用门派身份；共 3 门 |
| 兵器·剑 | `sk_jianghurumenjian` → `sk_qingfengjian` → `sk_jianghubaizhanjian` | 游方武师、护院演练、完成一份高风险走镖合同 | 同一把剑可轮换三栏，按黄→玄→地前置逐级取得；共 3 门 |

门派玩家另可用 §7 的本派黄→玄→地链替换上述通行链。观摩 / 短授只发图鉴允许的 `maxLayer`，不把 L4 镇派武学公共化；身份冲突导致某条链关闭时，通行三链仍保底。

### 9.4 本界名器、信物与套装候选

本界没有天级神兵固定产出；四件具名武器均是 `design/10` 已登记的地阶名器。它们不占 `playerTianBudget`，但仍受唯一实例、装备槽、持有权和书眠 6 件携带规则。

| 装备 | 品阶 / 槽位 | 固定取得方式 | 关键联动与边界 |
|---|---|---|---|
| `eq_xiuhuazhen` 绣花针 | 9 地上 / 奇门单手 | `enc_05_heimuya` 战后按教藏与遗物持有权结算 | 配 `sk_kuihua` 可按图鉴“以针代剑”；东方不败掉落不等于必归玩家，若交还教中则只登记图鉴 |
| `eq_qixianqin` 七弦琴 | 8 地中 / 琴双手 | 梅庄以 `it_guanglingsan` 投黄钟公所好，完成四艺切磋 | 强化音功 / 音律；是 `cmb_qinxiao` 的合法琴类，不代表持琴即会曲谱 |
| `eq_tubiwengbi` 秃笔翁之笔 | 7 地下 / 笔单手 | 以 `it_shuaiyitie` 完成书法切磋，或梅庄善后由物主授予 | 读取 `art`；不得把文物直接消耗成兵器 |
| `eq_xuantieqipan` 铁棋枰 | 7 地下 / 副手牌 | 以 `it_ouxuepu` 完成棋局，或保护梅庄后按持有权结算 | 名称沿用兼容 ID，不断言材质为玄铁；读取 `chess` |

剧情信物只作权限而非战斗装备：`it_heimuling` 控制黑木崖专线，`it_wuyuelingqi` 证明大会授权，`it_jinpen` 记录金盆洗手见证。它们的丢失 / 交还必须有任务状态替代，不得卡死主线。

`skills-wuyue` 已提出 `set_huashan_qijian`、`set_songshan_hanbing`、`set_taishan_daizong`、`set_hengshan_yunwu`、`set_hengshan_cibei`、`set_riyue_heimu`、`set_meizhuang_siyou`、`set_linjia_bixie`、`set_qingcheng_songfeng`、`set_wuxian_baidu` 等候选。当前 checkout 缺少 `design/07-set-system.md`，所以本文只保留候选 ID 和成员引用，**不宣称件数阈值、最终效果或装备成员已经定稿**；构建时这些候选未解析应降为无套装标签，而不是阻断武学本体。

### 9.5 秘籍、药物与收藏品的取得矩阵

| 对象 | 获取 | 用途 / 限制 |
|---|---|---|
| `it_xiaoaoqupu` | 刘曲原著线托付或改命线授权抄录 | 一次研读 `music+10` 并解锁铭文；与武学 `sk_xiaoaojianghuqu` 分开，持物不自动加层 |
| `it_guanglingsan` | 曲洋旧藏线索、梅庄前置 | 梅庄四艺的琴谱投帖；研读与馈赠二选所造成的物权变化须提示 |
| `it_ouxuepu` | 洛阳 / 苏州棋谱收藏链 | 黑白子投帖与 `chess+8` 研读 |
| `it_shuaiyitie` | 书画商路与向问天提供的合法临时持有 | 秃笔翁投帖与 `art+8` 研读；不得伪造题跋 |
| `it_xishanxinglvtu` | 苏州画商保全、梅庄投帖 | 丹青生投帖与 `art+6` 研读 |
| `it_baiyunxiongdanwan` | 恒山药库、`q_05_faction_13` | 地下疗伤与内伤驱散；不擅自附加冲穴成功率 |
| `it_tianxiangduanxujiao` | 恒山医护线 | 外伤、流血与骨伤处理；不是经脉丹 |
| `it_xumingbawan` | `q_05_qiyu_22` 固定节点 | 战斗挂 `bf_xuming` 3；战外延缓 3 级走火 5 日并移除 5 层 `bf_yizhongzhenqi` |
| `it_sanshi_jieyao` | 日月 L4 公账或保护解药库 | 重置三尸脑神丹期限；不可从普通商店无限购买 |
| `it_sanshinaoshendan` | 教藏证据 / 敌对路线暂存 | 剧情毒物，禁止作为强制服从的无后果奖励 |

`q_05_faction_14` 同时是三尸脑神丹的永久根治任务：完成两令核验、追回完整药账、保全解药库并取得任盈盈 / 向问天 / 教务线任一合法授权后，对指定服丹者移除 `bf_gu_sanshi`。任一条件未满足时只能用 `it_sanshi_jieyao` 重置年度期限；任务奖励不复制解药库存，也不得据此给全队无条件根治。此路径为 **（原创扩展）**。

天级武学来源发 `LearnSource` 与来源封签，不凭空创造未登记的 `it_miji_*`。随机掉落上限依 `design/02` §2.12，中武普通 / 精英 / Boss 随机池都不出天级秘籍或天级装备；固定 Boss 奖励与随机池分开结算。

### 9.6 冲穴投放（AR-03）

笑傲阶段建议新通 `mer_shoujueyin`、`mer_shoushaoyang`，每脉 9 穴，共 `2×9=18` 穴；单穴工作量由 `design/15` 的阶段表汇总为 `18×480=8,640 H`。第二转另需 `6,000 H`，本界建议总工作量因此为：

```text
H_ch05 = 18 × 480 + 6,000 = 8,640 + 6,000 = 14,640 H
```

| 辅助来源 | 开放条件 | 输出 | 限制 |
|---|---|---|---|
| `npc_pingyizhi` 指点 | 完成五霸冈药账、拒绝无辜抵命，且人物仍处合法剧情窗 | `MeridianGuidance`：心包 / 三焦二选一 | 每周目 1 次；其命定状态结束后不可继续刷新 |
| `npc_fangzheng` 指点 | 少林三战守约、未盗经、香客伤亡受控 | `MeridianGuidance`：心包 / 三焦或异气调息 | 每周目 1 次；不要求玩家改投少林 |
| 少林禅房 | 少林友好或方证临时许可 | 著名门派静室档：`rateBp+1000`、`successBp+600` **【建议值】** | 安全点；主线围寺阶段暂停 |
| 北岳恒山禅房 | 恒山 L2、医护客卿或掌门许可 | 同上 **【建议值】** | 敌对 / 遇袭时暂停 |
| 华山静室 | 华山 L2 或宁中则 / 风清扬许可 | 安静地点档：`rateBp+500`、`successBp+300` **【建议值】** | 不把思过崖战斗场景常态视为安全点 |

师父指导沿用 `rateBp=1500`、`successBp=800`、`costReduceBp=500` **【建议值】**，绑定一条经脉并消耗一次额度；不同来源依 `design/15` 加算、同来源各槽取高。专精经脉的本界内功只引用图鉴，例如 `sk_zixiashengong` 的任 / 督、`sk_xixing` 的冲 / 带，以及各派吐纳的既有 `meridians`，不由本章添加第二份属性。

当前笑傲药物中没有已登记 `meridianAid` 的冲穴丹。`it_xumingbawan` 只能延缓走火并减少异种真气，白云熊胆丸和天香断续胶只治其正式条目所列伤势；三者均不能直接增加冲穴速度、成功率或降低消耗。书眠时已开穴、两脉进度与第二转进度完整保留，进入侠客后只按新 `Ld` 与装配重算继续修炼速度。

---

## 10. 本书界特色系统

### 10.1 共用边界与提案状态

三个特色系统只负责把既有战斗、任务与成长规则编排成本书界玩法，不另立第二套结算。琴箫的发动和效果唯一见 `design/09` §6.7.4；五岳票务的资格、条件与幂等写入归 `design/12`，剧情语义只读 story §3.7 / §4.7；吸星的反噬数值唯一见 `design/05` §9.1.3 与 `design/06`。天书之力、结局和余韵只读 `design/13`。

| 系统 | 编排对象 | 权威输入 | 本章输出 | 不得越界 |
|---|---|---|---|---|
| 琴箫合奏 | `cmb_qinxiao` | 曲谱层数、乐器细类、羁绊、距离、战斗状态 | 合奏开始 / 续奏 / 收曲与中断原因 | 不重定义 `bf_qingxin`、`bf_luanxin`，不把剧情演奏伪装成合击 |
| 五岳并派投票 | `feat_05_wuyue_vote` **（提案态、原创扩展）** | 五派授权、胁迫证据、退出条款、story 路线 | `flg_05_wuyue_vote` 与 `flg_05_three_sects_exit` | 不代替岳不群与左冷禅的核心对决，不让玩家成为五岳掌门 |
| 吸星异种真气 | `feat_05_xixing_yizhong` **（提案态、原创扩展）** | `sk_xixing` 吸取量、既有 Buff、主 / 辅运 | 风险提示、化解动作与任务教学状态 | 不改武学、Buff、走火或伤势数值，不用剧情旗标免除反噬 |

以下 YAML 使用 `chapter-feature.v1` 与三个 `feat_05_*` 作为**提案态**章节配置。Canon v1.2 提案裁定 CP-39 / CP-40 已明确不将该前缀和 schema 升格；生产实现须拆回既有 `q_*`、`cmb_*`、任务局部键、Buff 与动作数据，不能静默注册这些示例 ID。

### 10.2 琴箫合奏

#### 10.2.1 发动、维持与中断

1. 两名参演者都装配 `sk_xiaoaojianghuqu≥3`；一方持琴类武器、一方持箫类武器，羁绊至少 3，双方距离不超过 3 格。任一条件不满足，只能选择普通音律动作或剧情演奏。
2. 发起后进入非攻击的持续合奏，最多 3 轮。每名演奏者轮到行动时只能“续奏”或“收曲”；续奏等同待机并消耗自身 `5% mpMax`，收曲则先终止合奏，再执行本次正常行动。
3. 每轮开始调用 `design/09` §6.7.4：两名演奏者任一周围 4 格内友方获得清心，任一周围 3 格内敌人接受乱心效果命中判定。`bf_qingxin`、`bf_luanxin` 的正式效果、叠加与抗性只读 `design/06`，本文不复写数值。
4. 任一演奏者单次受伤达到其 `10% hpMax`，或遭受硬控制，立即中断；死亡 / 倒地、缴械导致乐器条件失效、主动收曲或第三轮结束也会关闭状态。多段攻击以每段实际受伤分别检查，不能把多段小伤错误合并为一次中断。
5. 同一角色不能同时占琴位与箫位；复制角色、召唤物或临时换装都不得绕过双人、羁绊和合法曲谱来源。剧情终局即使条件不足仍可播放 story §7.1 的叙事演奏，但不产生战斗清心 / 乱心。

```yaml
schemaVersion: chapter-feature.v1   # 提案态
id: feat_05_qinxiao                # 提案态
chapterId: ch05_xiaoao
combatRef: cmb_qinxiao
requirements:
  performers: 2
  bothSkill: {skillId: sk_xiaoaojianghuqu, minLayer: 3}
  instrumentSlots: [qin, flute]
  minBond: 3
  maxDistance: 3
channel:
  maxRounds: 3
  turnOptions: [continue, stop]
  continueCost: {resource: mpMax, ratio: 0.05}
  interruptAny:
    - {singleHitHpRatioGte: 0.10}
    - {hardControl: true}
    - {performerDowned: true}
    - {instrumentConditionLost: true}
effectsRef:
  ally: {buffRef: bf_qingxin, radiusFromEither: 4}
  enemy: {buffRef: bf_luanxin, radiusFromEither: 3, baseChance: 0.40}
storyWitness:
  questRefs: [q_05_main_c_02, q_05_main_z_08, q_05_main_x_08]
  narrativeFallbackMayGrantCombatEffects: false
```

#### 10.2.2 UI 与通用接口

- 战斗 HUD 将琴位、箫位并列显示，分别展示曲谱层数、羁绊、距离、剩余轮数、续奏耗内和中断风险；条件失败时在对应字段旁给出文本原因，不只用颜色。
- 合奏范围以两个圆的并集显示：友方 4 格、敌方 3 格使用不同线型；敌方只显示“将接受效果命中判定”，不可把 40% 基础概率显示成最终命中率。
- 受到一击后，战报必须写明“本次伤害 / 该演奏者 hpMax / 10% 阈值”；硬控中断则显示控制来源。中断发生在效果触发前还是后，严格按 `design/09` 的回合事件顺序。
- `design/09` 消费动作、距离和战斗事件，`design/12` 只接收“合法演奏见证”这一幂等摘要，`design/13` 在天书现世时读取见证，不反向修改合击参数。

### 10.3 五岳并派投票

#### 10.3.1 两阶段表决与四份证据

投票是对 story 已审校流程的可视化与数据化 **（原创扩展）**。大会依次表决“是否合并”和“由谁主事”；第二阶段不能覆盖第一阶段的授权瑕疵。五派各自一张派别票，但每张票必须保存四类材料：

| 字段 | 必须回答的问题 | 有效条件 | 无效 / 降级情形 |
|---|---|---|---|
| 授权 `mandate` | 谁被本派允许发言，权限到何时？ | 可核验的本派代表、授权范围与撤回状态齐全 | 冒名、过期、被本派撤回或授权只涵盖议事却被用于并派 |
| 胁迫证据 `coercionEvidence` | 表态是否受人质、暴力、伪令或隐瞒关键事实影响？ | 证人 / 文书至少一项通过验真；只用于揭露具体胁迫 | 玩家声望、阵营标签或传闻不能直接当证据 |
| 退出条款 `exitClause` | 合并后能否按公开条件退出？ | 条款有触发条件、保全对象、执行见证与副本持有人 | “日后再议”或由盟主单方决定，不算有效退出权 |
| 自由票 `freeBallot` | 本派最终选择是否自由？ | 授权有效、无未解除胁迫、代表完成确认 | 玩家代投、假票、胁迫未解除或读档残留都为 false |

正线目标是让各派在获得事实后自行表态；邪线可以用筹码逼出胁迫者或让两强互曝，但用于验真的假票必须在终局剔除。任何路线都不能以 `fame` 一次检定换取五张自由票。每派只有 story 规定的一次拉票 / 议价窗口，错过后按该派已受压力结算；投票失败不堵主线。

岳不群与左冷禅的夺帅是原著核心对决：投票界面在两阶段表决后关闭，切入 `enc_05_songshan_duoshuai` / `bsc_wuyue_duoshuai` 的守擂演出。票务结果可以改变对权位合法性的评价、会场保护目标和后日谈，**不能取消、替演或自动决定二人的胜负**。

```yaml
schemaVersion: chapter-feature.v1   # 提案态
id: feat_05_wuyue_vote             # 提案态，原创扩展
chapterId: ch05_xiaoao
questRefs: [q_05_main_z_07, q_05_main_x_07]
decisionPrerequisite: dc_05_06
stages: [merge_or_not, leader_if_merged]
ballots:
  - sectRef: sect_huashan
    mandate: {holder: null, scope: null, verified: false, revoked: false}
    coercionEvidence: []
    exitClause: {termsRef: null, witnessed: false}
    freeBallot: false
  - {sectRef: sect_songshan, mandate: {}, coercionEvidence: [], exitClause: {}, freeBallot: false}
  - {sectRef: sect_taishan, mandate: {}, coercionEvidence: [], exitClause: {}, freeBallot: false}
  - {sectRef: sect_hengshan_nan, mandate: {}, coercionEvidence: [], exitClause: {}, freeBallot: false}
  - {sectRef: sect_hengshan_bei, mandate: {}, coercionEvidence: [], exitClause: {}, freeBallot: false}
integrityRules:
  playerMayCastFactionBallot: false
  fabricatedBallotMustBeRemoved: true
  fameMayReplaceMandate: false
  duelStillOccurs: true
outputs:
  voteResultRef: flg_05_wuyue_vote
  exitResultRef: flg_05_three_sects_exit
  resultEnum: [free, balanced, coerced]
nextEncounter: enc_05_songshan_duoshuai
```

这里的空对象表示运行时待写的本派记录，不是“无条件有效”。`free` 对应正线取得足够真实授权并解除胁迫，`balanced` 对应邪线形成至少三派互相承认的退出条款；其余降为 `coerced`。精确写入语义以 story 的 `flg_05_wuyue_vote` 为准，不由 YAML 示例另定第二组结果。

#### 10.3.2 UI 与通用接口

- 议事界面固定五列派别卡、两行表决；每张卡显示“授权、胁迫、退出、最终确认”四枚可展开印记，并提供证据来源与持有人。秘密证据只显示已公开部分，避免 UI 泄露尚未取得的任务信息。
- 玩家动作是“询问诉求、出示证据、请求验真、促成条款”，不是替某派点“赞成 / 反对”。最终确认由该派剧情代表执行；代表尚无正式 `npc_*` 时使用角色组，不擅自创建可招募人物。
- 进入夺帅前生成不可变的投票快照；战后只能追加“对结果的承认 / 退出”，不能倒写会前自由票。重放任务按同一 `idempotencyKey` 返回原快照。
- `design/12` 管资格、证据、关系与幂等写入；`design/09` 管护票战和夺帅战；`design/13` 只用 `free / balanced / coerced` 修饰后日谈，不据票数改变 `tsp_05_*`。

### 10.4 吸星异种真气

#### 10.4.1 吸取、反噬与化解

`sk_xixing` 的收益和代价由同一次吸取事件结算。每累计吸取相当于自身 `mpMax×5%` 的内力，增加 1 层 `bf_yizhongzhenqi`；不足一层的余量保留到下一次吸取，上限 20 层。自身 `mpMax` 变化时，运行时按每次吸取发生时的阈值折算，不能通过临时卸装抹掉已积累层数。

| 当前层数 | 自身回合开始反噬概率 | 走火级别 | 即时结果引用 |
|---:|---:|---:|---|
| 0–9 | 0 | 0 | 无反噬判定 |
| 10–14 | 10% | 1 | `bf_nixing` + 1 级走火，见 `design/06` |
| 15–19 | 20% | 2 | `bf_nixing` + 2 级走火，见 `design/06` |
| 20 | 30% | 3 | `bf_nixing` + `bf_zouhuorumo`，见 `design/06` |

化解有四种合法入口：普通行动“运功化解”耗 `10% MPREF(Ld)`（UI 简称 10% MP）并移除 3 层；闭关 1 日移除 5 层；装配 `sk_yijinjing≥5` 时每回合移除 2 层，10 重时移除 5 层；`sk_beiming` 作主运时不产生反噬，并按上游规则转化 / 移除异种层。易筋经辅运仍按 `auxMode: full` 生效。任务、门派友好、天书变体、喝酒或普通疗伤药都不能直接关闭反噬。

```yaml
schemaVersion: chapter-feature.v1   # 提案态
id: feat_05_xixing_yizhong         # 提案态，原创扩展编排
chapterId: ch05_xiaoao
skillRef: sk_xixing
buffRef: bf_yizhongzhenqi
stacking:
  absorbedMpPerStackRatio: 0.05
  maxStacks: 20
  keepRemainder: true
backlashAtTurnStart:
  - {minStacks: 10, maxStacks: 14, chance: 0.10, deviationLevel: 1, instantBuffRef: bf_nixing}
  - {minStacks: 15, maxStacks: 19, chance: 0.20, deviationLevel: 2, instantBuffRef: bf_nixing}
  - {minStacks: 20, maxStacks: 20, chance: 0.30, deviationLevel: 3, instantBuffRef: bf_nixing}
mitigation:
  action: {actionRef: huajie, mpRefRatio: 0.10, removeStacks: 3}
  retreatOneDay: {removeStacks: 5}
  yijinjing:
    skillRef: sk_yijinjing
    minLayer: 5
    removeEachTurn: 2
    removeAtLayer10: 5
    auxiliaryMode: full
  beimingMain:
    skillRef: sk_beiming
    suppressBacklash: true
questTeachingRefs: [q_05_main_z_03, q_05_main_x_03, q_05_qiyu_22]
```

#### 10.4.2 UI 与通用接口

- 角色框以 0–20 段气脉环显示层数；第 10、15、20 层分别出现清晰刻度，并同步显示“下一回合 10% / 20% / 30%”和对应走火等级。提示必须同时有图标、文本与声音，不只靠红黄颜色。
- 吸取预览同时展示“将吸取内力、预计新增层数、保留余量、到达后的反噬档”；若被吸目标内力不足，按实际吸取量更新，不按招式理论值预加层。
- “运功化解”按钮显示实际耗内与移除 3 层；MP 不足时禁用并列出闭关、易筋、北冥、名医 / 高僧指点等合法去路。名医和方证只提供任务 / 指导入口，不能把一次对话伪装成永久免疫。
- 战斗层由 `design/05` 产生吸取摘要、`design/06` 持有 Buff 与伤势、`design/09` 调度行动和回合事件；`design/12` 只记录是否完成教学与治疗任务；`design/13` 保留书眠净化和成长结果，不增加天书专属免疫。

三个系统都必须经过重放测试：同一合奏开始、票务快照或吸取事件重复送达时，不能重复发 Buff、重复写票或重复累计吸取量。章节配置只保存引用和局部 UI 状态；武学、Buff、任务、天书的唯一事实仍在各自归属文档。

---

## 11. 与前后书界衔接

### 11.1 从倚天读入的六类回响

`ch04_yitian` 约 1363 年离界，`ch05_xiaoao` 约 1523 年入场，相隔 `1523−1363=160` 年。书眠只把同伴移出活动队伍，保留招募史与能力快照；但经 `design/18` 名录逐项核对，本界**没有可确认仍健在的倚天活体同伴**，因此本节只投印证、物件、门派档案和传闻，不以卒年不详推定长生。

| 倚天写出 / 携带条件 | 笑傲落点 | 回响与奖励 | 边界 |
|---|---|---|---|
| 携完整 `sk_yijinjing` 或合法全本来源 | 登封少林、方证印证任务 | 识别旧来源并把本界合法完整来源印证到 `ch05_xiaoao`；只更新同一武学实例 | 笑傲是唯一可完整印证易筋经的中武书界；同 ID 不重复发书，不重复占天级预算 |
| 携完整 `sk_taijiquan` / `sk_taijijian` 或前界残承记录 | 武当 / 冲虚访学 | 显示前界见闻与本界 10 品残承；公式 `max(11−2,10)=10` | 不改 `nativeTo`，不补回完整 11 品；本界新学的 10 品残承离界后按 `10−2=8` |
| 前界 `fate_04=saved_parents`（书眠适配器派生标准 `echo_NN_fate=true`，前界 `NN=04`） | 武当旧档与江湖口述 | 留下张翠山夫妇守约、共同承担旧案的档案回声 **（原创扩展）** | 相隔 160 年，只作 `dialog/codex`；唯一真值仍是 `fate_04`，不生成活体或第二个写入源 |
| 携完整 `eq_yitianjian` 或 `eq_tulongdao` | 峨眉旧路、少林与江湖传闻支线 | “倚天屠龙重现”引来辨伪、觊觎和物权交涉 **（原创扩展）** | 断器不满足；不复制装备、不改变笑傲门派格局，传闻任务奖励不高于地阶 |
| `flag_04_mingjiao_archive_saved=true`（前章局部状态） | 黑木崖藏书阁 | 出现一页“明尊”残页与藏书图鉴 **（原创扩展）** | 须由 ch04 迁移 manifest 提供可核验结果；只表达后人附会，不断言明教与日月神教有组织传承 |
| `command_04=consent` 或前界互持盟约成立 | 地方旧档 / 说书对白 | 一页残缺议事簿回应“号令是否来自同意” **（原创扩展）** | 只改对白、图鉴或不高于地阶的小额奖励；不得改本界正邪线 |

前两项是 `design/02` 已列的印证接口；`fate_04` 行承接 §6.3 的标准改命投影；其后三项是已列的跨书彩蛋。若前界尚未正式登记局部旗标，则以存档中可核验的物件 / 任务结果临时解析，不能由本文独立创建内容专用 `echo_05_*`。通用 `echo_NN_fate` 由书眠适配器从 `fate_04` 派生，不是章节新增状态。任何回响都不得跳过 §2 的验路客开局、六锚点或 story 的首幕。

### 11.2 本界写给侠客行的回响

笑傲约 1525 年结束，侠客约 1582 年开始，玩法间隔为：

```text
sleepYears_05_06 = 1582 − 1525 = 57 年
```

叙事字幕仍采用 `design/02` 的“一觉过去，约莫一甲子”，不把精确玩法定年冒充原著年代。写出项只作为后界入口、图鉴、物件或门槛修饰，不改变 `ch06_xiake` 的玄铁令、身份错认与侠客岛主线起点。

| 写出条件 / 载体 | 侠客行消费点 | 效果 | 边界 |
|---|---|---|---|
| 五岳各派招募 / 关系与 `flg_05_wuyue_vote` | 侠客岛邀约名录 | 名单中出现五岳剑派后人，措辞随自由票 / 制衡票变化 **（原创扩展）** | 后人只作名录或后界正式人物；本文不创建其 `npc_*` |
| 携 `sk_dugu9` | 侠客岛石壁前 | 触发石壁剑意共鸣，略降太玄领悟门槛 **（原创扩展）** | 只降门槛，不赠 `sk_taixuan`、不改石壁内容；精确幅度由 `chapters/06` / 成长归属定 |
| `flg_05_siguo_use=seal/leverage`，且思过崖拓记已写入藏品录 | 侠客岛拓印 / 辨刻支线 | `it_shiketapian` 显示思过崖封存拓记或残缺洞图来历，与无字图形形成图鉴对照 **（原创扩展）** | 收藏品实体在书眠时清空；后界只消费旗标与藏品录记忆，不自动授五岳剑法或独孤九剑 |
| `flg_05_liuqu_fate=rescued` | 一册无名乐谱的后跋 | 多一段“曲成而人隐”的文本 **（原创扩展）** | 只增文本，不改变侠客岛事件，也不证明刘曲在 1582 年仍健在 |
| 本界曾招募且到 1582 年判定健在的同伴 | 后界 `companionReunion` | 按 `design/18` 开重逢线索，真实能力以离队快照为下限 | 生卒未知时保持 `unknown` / 传闻；不能仅因相隔 57 年默认死亡或存活 |

`sk_dugu9` 的“略降门槛”尚无上游数值，本文默认只提供一次**非叠加**提示与一个前置检定替代，不直接减属性点；该值须由侠客行章节或成长系统定稿。若后界不接纳，保留纯文本共鸣，不能阻断主线。

本界主改命仍只写 `flg_05_liuqu_fate`；书眠提交适配器按 `flg_05_liuqu_fate == rescued` 派生 `design/02` §6.3 的标准 `echo_NN_fate`（本界 `NN=05`）。消费者读取本地单写者或标准投影必须等价，剧情节点不双写。

### 11.3 书眠过场与压制预览

取得 `it_tianshu_05` 后进入余韵；玩家可立即入眠，也可先完成印证、藏史、告别和未锁死支线。建议书眠之所为华山思过崖，与 `design/02` §4.1 / §4.3 一致。逻辑视频 ID 为 `vid_sleep_05_06`：目标 24 秒，允许 20–30 秒；首播前 10 秒不可跳，重播可立即跳，资源失败以静帧、字幕和加载进度提供等价信息。

过场首镜由琴弦与箫孔化作两道墨线；原著线中断的一声由后来者续上，改命线由刘曲奏到曲终。墨线沿思过崖剑痕延伸，风雪磨浅刻痕，再转成约一甲子后的侠客岛无字石壁 **（原创扩展的地景转换）**。这只是转场隐喻，不能把两处石刻说成同一来源。

`BS_PREVIEW` 至少显示：

| 项 | 笑傲离界 | 侠客入场 | 推导 / 说明 |
|---|---:|---:|---|
| 武运 | 75 | 70 | 基准 §2 固定；不是人物属性直接减 5 |
| 显示等级上限 | 60 | 58 | 真实等级保留，显示等级取 `min(realLevel,58)` |
| 核心携带 | 2 / 2 / 2 | 2 / 2 / 2 | 都是中武；仍须逐类确认，不能把空槽自动填满 |
| 外来压制 | 本土 0 | 离乡后 −2 小品 | `nativeTo=ch05_xiaoao` 的武学到侠客成为外来；天书之力不受压制 |
| 武学层数上限 | 9 | 9 | 真实层数保留，普通有效层数仍不超过 9 |
| 独孤九剑 12 品 9 重 | 本土 `3.50×1.40=4.90` | 外来 10 品 `2.80×1.40=3.92` | `3.92/4.90=80%`；石壁共鸣只改学习门槛，不恢复品阶 |
| 本界新学太极残承 | 10 品来源 | 外来 8 品来源 | `sourceGrade=10` 先受 `−2`；不能按绝对 11 算成 9 |

书眠提交时，同伴离开活动队伍但保留招募史与能力快照；已开穴、经脉进度、第二转进度、誓约与永久成长依上游规则保存。资源点、营生职位、门派月钱、委托与本界公账不得随主角跨时代继续结算。

### 11.4 前代传承、物件与离界处置

- §3.8 已激活的 `lgs_*`、`frag_*`、`cache_*` 与校合结果按 `design/20` 保存；未激活候选不因书眠自动生成。稳定古迹继续使用其既有 `rs_*`，本章场景 `sc_05_*` 不冒充传承源。
- `it_shiketapian` 是普通收藏品：取得思过崖拓记时写入藏品录并保存 `flg_05_siguo_use`，物品实体随书眠清空。后界可让同一收藏品定义显示前代来历，但不得把实体按装备额度携带，也不得以藏史绕过普通物品清空规则。
- 四件本界地阶名器可选入六件装备携带额度；同次书眠中“携带装备数 + 本界新藏史装备数 ≤ 6”。未携带、未藏史者留在本时代，不自动复制到侠客。
- 天书实物进入天书匣，不占背包；`tsp_05_canon` 或 `tsp_05_fate` 只取其一并永久保留。刘曲命运、五岳票务与局部人物改命保留事实结果，但仅由有权下游消费。
- 前界携来的倚天剑 / 屠龙刀若继续携带，依旧占装备额度并受侠客压制；本文不为跨两界携带提供额外槽位，也不让物件自动“史自愈”到原著持有人。

---

## 12. 难度与数值要点

### 12.1 D7 全局口径与等级带

本界固定中武、武运 75、D7、等级上限 60、敌人总带 48–60，唯一建议超限 Boss 东方不败为 Lv64。因此：

```text
enemyStatMul = 0.85 + 0.05 × D
             = 0.85 + 0.05 × 7
             = 1.20
```

`enemyStatMul` 只乘模板敌人的 `hpMax`、`atkOut`、`atkIn`；不乘 MP、防御与评级。难度模式的 `dm_hp` / `dm_atk` / `dm_rat` 在其后独立处理。D7 对应 `ai_expert`、Boss 2–3 阶段和精英词条数 `floor(7/3)=2`，均只引用 `design/02`、`design/03` 与 `design/09`。

| 推进段 | 区域 / 场景 | 普通 | 精英 / 头目 | 关键遭遇 | 节奏意图 |
|---|---|---:|---:|---:|---|
| 福州—衡州 | 闽地、湖湘 | 48–51 | 51–54 | 余沧海预算 52、刘府围堵 54 | 先教证物、护送与撤离，不以全歼决定刘曲命运 |
| 华山—洛阳 | 关中、中原 | 52–55 | 55–58 | 华山围攻 56 | 石刻与医债都提供交涉 / 守护目标，避免连续单挑 |
| 梅庄—少林 | 江南、中原 | 54–57 | 57–59 | 梅庄 57、少林三战 58 | 四艺、换囚、公开三战分担战斗密度 |
| 恒山—黑木崖 | 河东晋中 | 55–60 | 58–60 | 恒山 59、东方不败 64 | 先做辨令与撤离，再以高速具名 Boss 达峰 |
| 并派—后洞 | 中原、关中 | 56–60 | 59–60 | 五岳夺帅 60 | 投票、守擂、照明和救援共同结算，不堆第二个超限 Boss |
| 自由探索 | 齐鲁、云滇黔中及回访区 | 48–58 | 53–59 | 无额外天级随机 Boss | 留出补装、门派、资源与营生空间 |

### 12.2 Lv60 基底与模板实装

`design/03` §10.2 给出的笑傲显示基底如下。它们是模板乘数之前的 `STD_E` 输入，不是地图里一只普通杂兵 / 精英已经完成模板化的最终面板。

| Lv60 基底 | `hpMax` | `mpMax` | `atkOut` | `atkIn` | `defOut` | `defIn` |
|---|---:|---:|---:|---:|---:|---:|
| 普通武学池（6 品 7 重） | 18,864 | 11,777 | 2,680 | 2,355 | 2,226 | 1,989 |
| 精英 / Boss 武学池（8 品 8 重） | 21,393 | 13,779 | 2,970 | 2,756 | 2,505 | 2,355 |

应用 `tmpl_normal` 与 D7 后，Lv60 普通敌人为：

```text
hpMax  ≈ 18,864 × 0.60 × 1.20 = 13,582
atkOut =  2,680 × 1.00 × 1.20 =  3,216
atkIn  =  2,355 × 1.00 × 1.20 =  2,826
defOut ≈  2,226 × 0.85        =  1,892
defIn  ≈  1,989 × 0.85        =  1,691
mpMax  = 11,777                          # 难度不乘 MP
```

应用 `tmpl_elite` 与 D7 后，Lv60 精英约为 HP 33,373、MP 13,779、外攻 3,920、内攻 3,638、外防 2,505、内防 2,355。例：`21,393×1.30×1.20≈33,373`，`2,970×1.10×1.20≈3,920`。显示整数只是由已舍入基底复核，生产必须从未舍入内部值一次计算，不能逐段反复取整。

### 12.3 八个遭遇的模板 Boss 预算

宗师 Lv51–60 使用 HP `×6.5`，化境 Lv61–70 使用 `×7.0`；Boss 另有攻击 `×1.25`、防御 `×1.20`、MP `×2.0`、八项评级 `+15`、速度 `×1.06`、八项抗性 `+30pp`（`resCC` 再 `+40pp`），模板威力归一 `tmplPower=1.10`。D7 的 1.20 只再乘 HP 和攻击。

下表的 HP / 攻防是当前 `damage_sim.py` 从未舍入基底计算出的模板值；“脚本 MP”列如实记录当前工具输出，“规范 MP”则按 `design/03` 的 `×2` 复核。工具目前没有应用 Boss MP 倍率，故两列存在差异，须修工具而不能在章节偷改规则。

| 遭遇预算 | Lv | HP | 脚本 MP | 规范 MP `≈脚本×2` | 外攻 | 内攻 | 外防 | 内防 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `enc_05_fuzhou_qingcheng` | 52 | 118,419 | 9,565 | 19,130 | 3,217 | 2,870 | 2,159 | 1,958 |
| `enc_05_liufu_weidu` | 54 | 130,175 | 10,602 | 21,204 | 3,472 | 3,181 | 2,330 | 2,163 |
| `enc_05_huashan_weigong` | 56 | 139,931 | 11,394 | 22,788 | 3,732 | 3,418 | 2,504 | 2,325 |
| `enc_05_meizhuang_poju` | 57 | 144,944 | 11,801 | 23,602 | 3,865 | 3,540 | 2,593 | 2,408 |
| `enc_05_shaolin_sanzhan` | 58 | 155,975 | 12,881 | 25,762 | 4,165 | 3,864 | 2,810 | 2,642 |
| `enc_05_hengshan_bianling` | 59 | 161,374 | 13,326 | 26,652 | 4,309 | 3,998 | 2,907 | 2,733 |
| `enc_05_songshan_duoshuai` | 60 | 166,867 | 13,779 | 27,558 | 4,455 | 4,134 | 3,006 | 2,826 |
| `enc_05_heimuya` | 64 | 204,377 | 15,666 | 31,332 | 5,065 | 4,700 | 3,417 | 3,213 |

以 Lv60 为例，从显示基底可近似复核：

```text
hpMax  ≈ 21,393 × 6.5 × 1.20 = 166,865.4  # 未舍入内部值输出 166,867
atkOut =  2,970 × 1.25 × 1.20 =   4,455
atkIn  =  2,756 × 1.25 × 1.20 =   4,134
defOut =  2,505 × 1.20        =   3,006
defIn  =  2,355 × 1.20        =   2,826
mpMax  = 13,779 × 2           =  27,558
```

这些数值是**遭遇预算，不是具名人物画像**。余沧海、任我行、方证、岳不群、左冷禅等均走 `full`：合法先天、真实武学品阶 / 层数和装备进入与主角相同管线；可乘 Boss 的防御、评级、速度、抗性与 D7 攻击修正，但**不再乘模板攻击 `×1.25`**。多人战把一份遭遇耐久拆给各角色 / 阶段，不能给少林三战每人或岳、左二人各套一整份单 Boss HP。

### 12.4 东方不败 `full` 特例

正式遭遇只用 `enc_05_heimuya`，脚本只用 `bsc_dongfangbubai_heimuya`。东方不败 Lv64，装配 `sk_kuihua` 11 品、受中武 9 重上限，使用 `eq_xiuhuazhen`；核心机制、残影、瞬移、杨莲亭命令链和四人可控上限全部引用 `design/09` §8.11。

速度目标沿用 `design/09` 的 `spd≈216`。可读性核算是 `216/121≈1.785`，即标准收招下主角每行动一次，东方约行动 1.8 次；因此耐久取 `full` 合法下沿，用速度、闪避和阶段行为而不是堆血制造压力。

`design/03` §10.1 要求具名 `full` 的 `hpMax` 位于同级模板 Boss 的 `0.6–1.2` 倍。D7 Lv64 模板 HP 为 204,377，故本章正式值取下沿：

```text
hpMax = roundHalfUp(204,377 × 0.60) = 122,626
```

`design/09` §8.11 的旧建议 108,000 仅约为 `108,000/204,377≈0.528`，低于合法区间，须由其归属文档同步；本章不再把旧值作为运行覆写。

东方不败的攻击由其合法 `full` 属性与 D7 的 1.20 产生，不再乘 `×1.25`；HP、速度、阶段门和脚本覆写均只应用一次。战斗失败重开当前阶段，不能靠重复挑战永久削减其残影上限或跳过任盈盈攻击杨莲亭所触发的原著核心转折 **（细节待考）**。

### 12.5 节奏模拟与验收窗口

本次运行复现 `python3 tools/balance/damage_sim.py --report`，笑傲模板基线为：

| 对局 | 主 / 敌等级 | 主角命中等价 | 主角行动轮 | 敌人命中 | 敌方行动轮 | 主 / 敌命中率 | 普通招式耗内 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 普通 | 60 / 60 | 4.1 | 4.2 | 10.3 | 12.5 | 99.0% / 82.6% | 7.0% |
| 精英 | 60 / 60 | 9.4 | 9.5 | 9.4 | 10.8 | 99.0% / 87.0% | 7.0% |
| Boss | 60 / 64 | 团队 71.5 | 24.9 | 6.4 | 6.8 | 92.6% / 93.8% | 7.0% |

Boss 的 71.5 是四人队标准命中等价，不是要求主角单人出手 71.5 次；当前中武遭遇层模板 Boss 有效耐久校准为面板 HP `×0.77`，但它不自动覆盖东方不败等具名 `full` 配置。当前报表是通用模板节奏，不是东方不败专场实测；黑木崖高速移动、琴箫持续态、少林连战、后洞黑暗与五岳投票转战仍须录入实际阵容回归 **（待实测）**。

数值验收以“公式一次应用”为首要条件：D7 不乘防御，模板 `P_ref×tmplPower` 只在 Z1 归一一次，`full` 用真实 `P_actual`，难度模式另乘且 UI 明示。任何为了追求回合数而改面板的调整，都必须先在 `design/03` / `04` / `09` 归属处落定，再回填本章。

---

## 13. 原创扩展清单与考据备注

### 13.1 原创扩展总表

下表集中登记原著没有、但为开放世界与系统化游玩所作的扩展。表中“原创”不等于可随意改写原著锚点；所有扩展都受 story 的人物决定权、六锚点顺序与史自愈边界约束。

| 类别 | 原创扩展 | 位置 | 边界 |
|---|---|---|---|
| 年代与开局 | 约 1523–1525 的玩法定年；福州驿路“验路客”；镖路保结、衡州乐帖、华阴药单三种履历凭证 | §1–§2 | 年代不冒充原著明载；三凭证只是同一身份的玩法侧重 |
| 刘曲改命 | 四项准备取三、两条撤离线、家眷转移、假死与隐姓埋名生还流程 | §5、§6 | 只改第二锚点；失败仍有完整原著线，不能以终局补票 |
| 地图场景 | 八区的 `sc_05_*` 场景组合、专线入口、轻功替代路、毒涧与书眠地景转换 | §3、§11 | 城市名读 `cities.yaml`；黑木崖确址不作定论，图外节点只走专线 |
| 资源与营生 | 18 个 `rp_*`、22 个 `biz_*`、两份代表合同，以及镖师、护院、客卿、看场等职位内容 | §3.5–§3.7 | 收入、产能、品级与公私账只读 `design/16`；实例不证明史实存在 |
| 支线与奇遇 | 证物分流、三处退路、假名册、自由票封缄、医毒互惠、前代残本调查等手工任务 | §6 | 不抢原人物抉择，不把失误变死档；全部任务名与玩法流程视为原创 |
| 前代传承 | 越女、斗转、打狗、九阴、玉女与太极残本在后世的守传者、旧匣、断棒夹层、拓片等载体 | §3.8 | ID 与校合条件只读 `design/20`；后世载体不证明原著谱系或血缘 |
| 门派经营 | 十个制作位、五级职级在本界的任务化、月结职责、客盟与资源配给实例 | §7 | 通用规则读 `design/12` / `16` / `17`；不把晋升写成原著事件 |
| 人物玩法 | 九名重点队友的招募流程、局部改命条件、援护 / 协作方向和外客同行窗口 | §8 | 生卒与命定状态读 `design/18`；不得以好感抹去伤害或替人物作主 |
| 武学来源 | 玩家向风清扬求试、冲虚拳理印证、天级三份预算的界面化与葵花源子组 | §9 | 武学本体读图鉴；令狐冲仍是独孤主承者，残承不冒充完整来源 |
| 琴箫系统 | 合奏席位、状态条、双圆范围、中断战报与剧情演奏降级 UI 编排 | §10.2 | 战斗数值只读 `design/09` / `06`；不满足条件时不得发合击效果 |
| 五岳票务 | 两阶段投票、授权 / 胁迫证据 / 退出条款 / 自由票的数据化与验真界面 | §10.3 | 岳不群与左冷禅的核心对决仍发生；玩家不能代投或当掌门 |
| 吸星风险 | 20 段气脉环、阈值提示、吸取余量和化解入口的风险 UI | §10.4 | 层数、概率、走火与化解值只读 `design/05` / `06` / `09` |
| 前界回响 | 倚天屠龙传闻、黑木崖“明尊”残页、议事簿回声 | §11.1 | 只作任务 / 图鉴 / 对白，不断言明教与日月神教有组织继承 |
| 后界回响 | 邀约名录中的五岳后人、独孤与石壁剑意、思过崖拓片、无名乐谱后跋 | §11.2 | 不改变侠客行主线；刘曲后跋不证明二人在 1582 年仍健在 |
| 书眠演出 | 琴箫墨线、风雪磨崖、思过崖转无字石壁的 24 秒地景蒙太奇 | §11.3 | 只是跨时代隐喻，不主张两处石刻同源 |

`feat_05_qinxiao`、`feat_05_wuyue_vote`、`feat_05_xixing_yizhong` 和 `chapter-feature.v1` 也是本文提出的数据编排方式，不是已批准的基准事实；必须在接纳前保持提案态。

### 13.2 原著考据待办

以下项目尚未逐字对照三联 / 广州修订版，正文均保持概述、**（待考）**或不依赖争议细节的玩法表达：

1. 黑木崖的确切地望、登崖路线、吊篮 / 索道与教中建筑细节；未核定前不得标真实行政坐标。
2. 刘正风金盆洗手会场、刘曲离场、曲终 / 托谱地点，以及家眷、嵩山使者和莫大在相关段落的准确动作。
3. 思过崖后洞五岳石刻的发现次序、各派剑招与破法细节；不得从石刻自造新招名或伪引文。
4. 梅庄四友的比试次序、武学招式、琴棋书画名物与地牢机关细节；图鉴已有 ID 可用，文本关系仍须校勘。
5. 冲虚与令狐冲对剑、太极剑表现及冲虚认输的准确过程；太极拳印证继续标为原创扩展。
6. 东方不败、杨莲亭、任盈盈、任我行、令狐冲、向问天等在黑木崖战的参战顺序、称谓、受伤和分心细节。
7. 任我行朝阳峰迫盟后的骤逝、华山后洞聚歼、令狐冲拒盟，以及终局琴箫合奏的准确地点、时序与人物动作。
8. 岳不群、左冷禅、宁中则、岳灵珊、林平之、定闲等人的命定结局及版本差异；不得以未经核对的回目细节覆盖 `design/18`。
9. 平一指、老头子、祖千秋、续命八丸与群豪医债的准确人物关系和物件细节。
10. 福威镖局向阳巷老宅、南北恒山、五岳并派代表与各处小说地点的文本地望；历史城市名另依 `cities.yaml`，不以现代行政区反推。

### 13.3 写作与实现禁区

- 本文不提供任何未经纸本核对的原文引语，不新增回目标题、招名或人物名来填空。
- “明中叶”“约 1523–1525”是玩法年代层；原著事实与历史地理分栏存放。
- 原著人物的关键选择与死亡只由 story / `design/18` 写入。东方不败常规线不生还，刘曲是本书唯一主改命；其他救援只是局部生命态。
- 未入人物名录的梅庄四友、桃谷六仙、杨莲亭、绿竹翁、天门道人等只能用显示角色 / 角色组；建立招募、跨书或 `full` 面板前须先补 `design/18`。
- 技术版本、价格、API、平台限额不属于本文，故没有待联网核实项；黑木崖、少林连战、后洞黑暗、琴箫持续态、票务转战和书眠视频仍需实际输入回放与设备性能验证 **（待实测）**。

---

## 本文新增术语与 ID

### 新增术语与局部状态

| 术语 / 状态 | 含义 | 注册边界 |
|---|---|---|
| 验路凭证 | 同一福威镖局“验路客”身份下的镖路、乐帖、药单三种履历侧重 | 本界开局概念；不形成职业或第二身份系统 |
| `openingCredential_05` | `escort / music / medicine` 三选一的开局记录 | 本章建议的局部状态；按 `design/12` §2.6 在迁移 manifest 中指定映射与单写者，不升格为全局内容 ID |
| 自由票 | 授权有效、胁迫解除且由本派代表确认的派别票 | story 已提出的本界局部术语；按 `design/12` §2.6 映入任务计数，不扩成通用票务实体 |
| 退出条款 | 合并后仍可按公开条件退出并保护门人 / 资产的约定 | 本界任务对象；不等同于即时退派 |
| 票务快照 | 夺帅战开始前冻结的五派授权、证据、条款与表决结果 | 本界幂等对象；不注册为装备或任务 ID |
| 合奏席位 | `cmb_qinxiao` 中互斥的琴位与箫位 | 战斗 UI 局部概念；合击规则仍归 `design/09` |
| 制作包 | 共用场景、演出、战斗与对白资产的排产单位 | 用于解释 10 个逻辑任务 / 9 个制作包；不是任务 ID |

`flg_05_route`、`flg_05_liuqu_fate`、`flg_05_wuyue_vote`、`flg_05_three_sects_exit`、`flg_05_refused_unification` 及四项刘曲准备旗标均来自已审校 story，本章只消费，不声称重新定义。

### 本章提出的内容实例

以下实例在写入本章前已做全仓检索；跨时代复用的 `rp_*` / `biz_*` 表示同一稳定地点，不是重名冲突。`sc_05_*` 遵照 Canon v1.2 §12；旧 `scn_*` 只允许显式迁移，不双写。任务、资源、营生和遭遇实例仍需各自归属注册表收录。

| 类别 | 数量 | ID / 范围 |
|---|---:|---|
| 本界场景 | 23 个明确场景 | `sc_05_fuzhou_yilu`、`sc_05_fuwei_waiyuan`、`sc_05_xiangyangxiang`、`sc_05_huiyanlou`、`sc_05_liufu`、`sc_05_liuqu_shangu`、`sc_05_siguoya`、`sc_05_huashan_houdong`、`sc_05_yaowangmiao`、`sc_05_luoyang_luzhuxiang`、`sc_05_wubagang`、`sc_05_shaolin_snow`、`sc_05_fengchantai`、`sc_05_meizhuang`、`sc_05_meizhuang_dilao`、`sc_05_taihu_jiuzhuang`、`sc_05_hengshan_xuankong`、`sc_05_heimuya_suodao`、`sc_05_heimuya_dadian`、`sc_05_taishan_shibapan`、`sc_05_jinan_yicang`、`sc_05_wuxian_zhai`、`sc_05_dujian` |
| 资源点 | 18 | `rp_fujian_sicha_01`、`rp_fujian_mucai_01`、`rp_huxiang_yaocai_01`、`rp_huxiang_sicha_01`、`rp_guanzhong_kuangshi_01`、`rp_guanzhong_yaocai_01`、`rp_zhongyuan_liangshi_01`、`rp_zhongyuan_mocai_01`、`rp_jiangnan_sicha_01`、`rp_jiangnan_liangshi_01`、`rp_hedongjinzhong_mucai_01`、`rp_hedongjinzhong_tieqi_01`、`rp_qilu_liangshi_01`、`rp_qilu_shoucai_01`、`rp_yundianqianzhong_ducai_01`、`rp_yundianqianzhong_yaocai_01`、`rp_yundianqianzhong_sicha_01`、`rp_yundianqianzhong_mapi_01` |
| 营生场所 | 22 | `biz_fuzhou_escort_01`、`biz_quanzhou_casino_01`、`biz_hengyang_manor_01`、`biz_changsha_casino_01`、`biz_huayin_manor_01`、`biz_xian_escort_01`、`biz_luoyang_escort_01`、`biz_luoyang_casino_01`、`biz_kaifeng_casino_01`、`biz_dengfeng_manor_01`、`biz_hangzhou_manor_01`、`biz_hangzhou_casino_01`、`biz_suzhou_escort_01`、`biz_suzhou_manor_01`、`biz_datong_manor_01`、`biz_taiyuan_escort_01`、`biz_taian_manor_01`、`biz_jinan_escort_01`、`biz_kunming_manor_01`、`biz_kunming_casino_01`、`biz_guiyang_escort_01`、`biz_qujing_manor_01` |
| 手工支线 | 26 | `q_05_side_01`–`08`、`q_05_faction_09`–`15`、`q_05_bond_16`–`20`、`q_05_qiyu_21`–`24`、`q_05_bond_25`–`26` |
| 遭遇 | 8 | `enc_05_fuzhou_qingcheng`、`enc_05_liufu_weidu`、`enc_05_huashan_weigong`、`enc_05_meizhuang_poju`、`enc_05_shaolin_sanzhan`、`enc_05_hengshan_bianling`、`enc_05_heimuya`、`enc_05_songshan_duoshuai` |
| Boss 脚本 | 8 | `bsc_yucanghai_fuzhou`、`bsc_liuqu_tuilu`、`bsc_huashan_shoumi`、`bsc_renwoxing_dilao`、`bsc_sanzhan_shaolin`、`bsc_hengshan_bianling`、`bsc_dongfangbubai_heimuya`、`bsc_wuyue_duoshuai` |
| 营生合同 | 1 个结构化代表 | `contract_05_escort_lianghe_ticket` |

`enc_05_heimuya` 与 `bsc_dongfangbubai_heimuya` 已由 `design/09` 登记，本文只是复用；主线 `q_05_main_c_01`–`02`、`q_05_main_z_01`–`08`、`q_05_main_x_01`–`08` 和 `dc_05_01`–`08` 均来自 story，不列为本章新建。所有 `city_*`、`rg_*`、`npc_*`、`sect_*`、`sk_*`、`eq_*`、`it_*`、`bf_*`、`cmb_*`、`tsp_*`、`lgs_*`、`frag_*`、`cache_*`、`rs_*` 也都是上游引用。

### 提案态 ID 与 schema

| 类别 | ID / schema | 状态与降级方式 |
|---|---|---|
| 章节特色 | `feat_05_qinxiao`、`feat_05_wuyue_vote`、`feat_05_xixing_yizhong` | **提案态**；未接纳时拆为已有合击、任务旗标、Buff 与 UI 配置 |
| 配置 schema | `chapter-feature.v1` | **提案态**；不能直接加入发布注册表 |
| 分支主线格式 | `q_05_main_c_NN`、`q_05_main_z_NN`、`q_05_main_x_NN`、`dc_05_NN` | **已解决：**story 定义，Canon v1.2 §12 已登记；`dc_*` 生产映射见 `design/12` §2.6 |
| 本界场景格式 | `sc_05_*` | **已解决：**Canon v1.2 §12 正式格式；旧 `scn_*` 仅作迁移输入 |

“黑木崖专线”只作叙事称谓，不注册为独立场景 ID；实际节点是 `sc_05_heimuya_suodao` 与 `sc_05_heimuya_dadian`。

---

## 数据校验规则与测试用例

### 构建期校验规则

| ID | 校验 | 通过条件 | 失败级别 |
|---|---|---|---|
| `CH05-V01` | 章节结构 | 一级编号恰为 §0、§1–§13，文末依次为术语、校验、待决；没有重号、截断句或占位语 | error |
| `CH05-V02` | 固定参数 | 年代、中武、武运 75、D7、上限 60、敌带 48–60、携带 2/2/2、装备 6、压制 −2、“自在”逐项匹配基准 §2 | error |
| `CH05-V03` | 地图时代层 | 实际引用 `jianghu-ch05.svg`；八个唯一全局 `rg_*`、18 座 `cities.yaml` 时代城市；不生成 `rg_05_*` | error |
| `CH05-V04` | 区域字段 | 八区各有 `tr_*`、入口、qg 与替代路、城市 / 势力、NPC、合法 `sk_*`、等级带、场景 / 奇遇 | error |
| `CH05-V05` | 门禁预算 | 34 个轻功门禁严格为 `5/10/14/5/0`；主线必经最高 qg3，qg4 只开秘境 / 捷径 | error |
| `CH05-V06` | 资源与营生 | 资源点 18、营生 22；资源价值桶 `1128×8%=90.24` 两，营生桶 `1128×10%=112.8` 两，不双重入账 | error |
| `CH05-V07` | 主线索引 | §4 仅索引 story；共有 2、正 8、邪 8；每条完整路线 `2+8=10` 个逻辑任务，不出现第二套剧情 | error |
| `CH05-V08` | 选择与锚点 | `dc_05_01`–`08` 连续；六锚点逐项映射 story；仅 `dc_05_02` 写刘曲命运 | error |
| `CH05-V09` | 天书互斥 | canon 只发 `tsp_05_canon`，rescued 只发 `tsp_05_fate`；正邪、票务与局部人物救援不得造第三变体 | error |
| `CH05-V10` | 支线数量 | 26 个唯一手工支线、14 条完整链、八区各四触点共 32；`q_05_bond_90` 不计入本章 26 条 | error |
| `CH05-V11` | 门派 | 笑傲矩阵计数 `O15/H19/P1/N41/D23/M0=99`；10 个完整制作位均有加入 / 门规 / 五级称谓 / 武学 / 月钱与配给 | error |
| `CH05-V12` | 人物 | 重点招募至少 6，本文 9；每人有 D 级与任务门槛；前界可确认活体重逢为 0 | error |
| `CH05-V13` | NPC 引用 | 所有可招募和具名 `full` 角色能在 `npcs-ch05-xiaoao` / `design/18` 解析；名录缺口只用显示角色组 | error |
| `CH05-V14` | 武学引用 | `sk_*` 均解析到指定图鉴；完整原生天级恰 5，太极 10 品残承恰 2，单周目新增 / 补传 / 残承上限 3 | error |
| `CH05-V15` | 低阶装配 | 从零携带仍有非互斥内功、拳脚、兵器各三门合法来源，且不越图鉴 `maxLayer` | error |
| `CH05-V16` | 特色接口 | 琴箫门槛 / 中断、票务四证、吸星 10/15/20 阈值逐项等于上游；`feat_*` 始终标提案态 | error |
| `CH05-V17` | Boss 数值 | D7 仅乘 HP / 攻击 1.20；模板 MP 乘 2；`full` 不乘 Boss 攻击 1.25；多人战不复制整份单 Boss 耐久 | error |
| `CH05-V18` | 东方不败 | 只用 `enc_05_heimuya` / `bsc_dongfangbubai_heimuya`；Lv64、HP 约 122,626、速度约 216；HP 恰为同级模板下沿 `×0.6` | error |
| `CH05-V19` | 传承 | 只引用 `design/20` 的 `lgs_*` / `frag_*` / `cache_*` / `rs_*`；主载体≤4、其中后人≤2、新残本≤8、新信物≤4；不自造章节校合上限或血脉后人 | error |
| `CH05-V20` | YAML / Markdown | 所有 YAML 可解析、无重复键；代码围栏成对；Markdown 表格各行列数一致 | error |
| `CH05-V21` | 书眠 | 1525→1582 为 57 年；`vid_sleep_05_06` 为 20–30 秒、目标 24 秒、首 10 秒不可跳；不改侠客主线起点 | error |
| `CH05-V22` | 标注与考据 | 原创扩展在 §13 集中登记；未核事实标待考；无伪引文、伪回目、伪城市坐标 | error |

### 路径、数值与接口测试

| ID | 前置 / 操作 | 精确期望 |
|---|---|---|
| `CH05-T01` | 新档依次选择三种验路凭证 | 都以同一验路客身份进入 `q_05_main_c_01`；只改变首个自由区、关系、首条支线和一项便利 |
| `CH05-T02` | 原著命运分别走正 / 邪至终幕 | 每路 10 个逻辑任务；发唯一 `it_tianshu_05` + `tsp_05_canon` |
| `CH05-T03` | 四项刘曲准备取三、选救援且两人未倒地 | 写 `flg_05_liuqu_fate=rescued`；扣约定代价；任一路线均只发 `tsp_05_fate` |
| `CH05-T04` | 只完成两项准备仍选救援 | 明示缺项，回 canon 后继续主线；不能写假 rescued 状态 |
| `CH05-T05` | 正线五派逐一取得授权并解除胁迫 | 玩家不代投；生成 `free` 快照；岳不群 / 左冷禅核心对决照常触发 |
| `CH05-T06` | 邪线造假票逼证后进入结算 | 假票必须剔除；三派有效退出条款可得 `balanced`；缺项则为 `coerced`，主线仍通 |
| `CH05-T07` | 两人曲谱 3 重、琴箫齐、羁绊 3、距 3 发动合奏 | 最多 3 轮；每次续奏各耗 5% `mpMax`；单次伤害达到 10% `hpMax` 或硬控即中断 |
| `CH05-T08` | 合击条件不足但终局需要演奏见证 | 只播剧情演奏并写合法见证，不生成战斗清心 / 乱心 |
| `CH05-T09` | 吸星累计吸取 4.9% / 5% / 100% 自身 `mpMax` | 分别新增 0 / 1 / 20 层并保留余量；层数封顶 20 |
| `CH05-T10` | 异种层数为 10 / 15 / 20，于自身回合开始判定 | 反噬概率 10% / 20% / 30%，对应走火 1 / 2 / 3；触发 `bf_nixing` |
| `CH05-T11` | 以普通化解、易筋 5 / 10 重、北冥主运分别处理 | 耗 10% MP 移 3；每回合移 2 / 5；北冥不产生反噬；任务旗标不得替代 |
| `CH05-T12` | 零携带武学完成通行三链 | 内功、拳脚、兵器各可装三门；门派敌对不堵通行保底 |
| `CH05-T13` | 依图鉴尝试第 4 份本界天级来源 | 显示已占三项并拒发；葵花 / 辟邪仍额外满足同源最多一项 |
| `CH05-T14` | 本界新学 `sk_taijiquan` 10 品残承后入侠客 | 保存 `partial/sourceGrade=10`，外来后为 8 品；不按绝对 11 算 9 |
| `CH05-T15` | 用显示基底复核 Lv60 模板 Boss | HP≈166,867、规范 MP 27,558、外攻 4,455、内攻 4,134、外防 3,006、内防 2,826 |
| `CH05-T16` | 执行 `damage_sim.py --report` | 笑傲 Boss 行显示 71.5 团队命中、24.9 主角行动轮、6.4 敌命中、6.8 敌行动轮、92.6% / 93.8%、耗内 7% |
| `CH05-T17` | 东方不败使用 `full` 配置 | HP 约 122,626、速度约 216；HP 为 Lv64 模板 `204,377×0.6` 的合法下沿，攻击不乘模板 1.25 |
| `CH05-T18` | 任一结局从思过崖书眠 | 播 `vid_sleep_05_06`；显示 57 年、侠客上限 58、2/2/2、外来 −2；真实能力与招募史保留 |
| `CH05-T19` | 前界无可确认活体同伴，但存在遗物 / 档案回响 | 不生成倚天人物肉身；易筋、太极、刀剑传闻和明尊残页按条件解析 |
| `CH05-T20` | 对所有引用 ID 做注册表解析 | 上游 ID 全命中；本章实例进入待收录清单；提案 `feat_*` 不得静默当正式 ID |

### 人工审校与实测用例

1. 正 / 邪各通关一次，并分别组合 canon / rescued，确认四个收束都能进入同一余韵；天书变体只看刘曲命运。
2. 逐项对照三联 / 广州修订版清理 §13.2；核对完成前不把网页转述写成原著引文。
3. 以低、中、高三档设备实测黑木崖高速残影、少林连战、后洞黑暗 / 坍塌、琴箫双范围和五岳票务转战 **（待实测）**。
4. 以键鼠、手柄与触屏检查琴箫席位、票务四证和异种真气风险环；确认焦点顺序、文字替代、缩放与不依赖颜色 **（待实测）**。
5. 断网 / 资源缺失时播放书眠静帧降级，确认 24 秒目标内容中的年代、携带、压制与后界钩子仍可读 **（待实测）**。

---

## 待决事项 / 依赖

### 替下游给出的建议值

| 编号 | 本文建议值 / 已采用默认 | 下游归属 / 回填要求 |
|---|---|---|
| `D05-S01` | 10 个逻辑任务以 9 个制作包承载：福州轻量序幕与衡州共用一份开局资产额度 | `design/11`；明确预算列统计“制作包”而非删掉 story 的共有幕 |
| `D05-S02` | 少林 / 北岳恒山静室 `rateBp+1000, successBp+600`；华山静室 `+500/+300` | `design/15`；定稿后把正文**【建议值】**改为已解决引用 |
| `D05-S03` | 师父 / 名医 / 高僧指导沿用 `rateBp=1500, successBp=800, costReduceBp=500`，每来源每周目一次 | `design/15` / `12`；不得与同来源重复叠加 |
| `D05-S04` | **已解决**：东方不败 `full` 采用 `hpMax≈122,626`、`spd≈216`（见 §12.4） | `design/09` / 人物数值须把旧 108,000 同步为合法下沿，并重跑专场 |
| `D05-S05` | 三个特色系统暂用 `chapter-feature.v1` / `feat_05_*` 作为文档编排对象 | `design/12` / 数据管线；未接纳前拆回既有对象，不进入发布注册表 |
| `D05-S06` | 独孤九剑入侠客的“略降门槛”默认只替代一次前置检定，不直接降低属性点且不可叠加 | `chapters/06` / `design/13`；若不接纳则降级为纯文本共鸣 |
| `D05-S07` | 笑傲三处冲穴安全点与两位指导者各投一个许可入口，不额外制造冲穴丹 | `design/15` / `12`；由经脉正式节点和指导额度覆盖 |

### 本文依赖的上游事实

| 上游 | 本文采用情况 / 未决依赖 |
|---|---|
| 基准 §2、§3、§12、§13、§16、§17 | 已采用固定参数、外来压制、ID 规则、完整天级池、考据边界和 13 节模板 |
| `design/01`、`story/05-xiaoao` | 已采用六锚点、2+8 双线、八选择、唯一刘曲主改命和四种收束；§4 未重写剧情 |
| `design/02`、`13` | 已采用 160 / 57 年书眠、残承、回响、天书、余韵和后界压制；侠客的独孤门槛幅度仍待下游 |
| `design/03`、`04`、`09` | 已采用 D7、模板 / `full` 分流、Boss 机制、合击和节奏报告；本章已按 `design/03` 将东方 HP 收敛到 0.6 下沿，`design/09` 旧值与 Boss MP 工具差异仍待上游同步 |
| `design/05`、`06` 与指定武学图鉴 | 已采用所有武学 ID、品阶、吸星反噬与易筋 / 北冥化解；本章不定义招式或 Buff |
| `design/07` | **当前缺失**：无法核对套装最终成员、件数与效果；本章只保留 `skills-wuyue` 的候选 ID，不把套装作为奖励门槛 |
| `design/08`、`10` | 已采用地形、qg、装备和收藏品；本界无已登记具名箫，琴箫的箫位暂由普通 `exoticKind: flute` 装备实例满足 |
| `design/11`、`16` | 已采用八区、18 城、18 资源点、22 营生和收入桶；`cities.yaml.region` 旧粗区与章节新区域映射仍待同步 |
| `design/12`、`15`、`17`、`18` | 已采用任务、门派、经脉与人物规则；章节实例、状态单写者和部分人物命定状态待归属文档收录 |
| `design/19`、地图产物 | 已采用全局 `rg_*`、图外节点、实际 `jianghu-ch05.svg` 与 `cities.yaml` 时代名；本界专属场景前缀仍待统一 |
| `design/20` | 已逐 ID 采用传承源、三卷、缓存、信物与校合规则；章节只做本时代调度，不重定义传承 |

### 对基准的修改提案

> 本任务不修改基准或其他归属文档，仅登记提案。

| 编号 | 提案 | 理由 |
|---|---|---|
| `D05-B01` | **已解决：**Canon v1.2 §12 已接纳 `q_NN_main_c_MM` / `q_NN_main_z_MM` / `q_NN_main_x_MM` 与 `dc_NN_MM` | AR-10 的共有 / 正 / 邪幕已有稳定格式 |
| `D05-B02` | **已解决：**Canon v1.2 §12 统一使用 `sc_NN_*`，旧 `scn_*` 仅作显式迁移输入 | 同一章节场景不再双前缀 |
| `D05-B03` | **部分解决：**Canon v1.2 §12 已登记 `city_*`、`rp_*`、`biz_*`、`job_*`、`frag_*`、`lgs_*`；`contract_*` 仍须由归属 schema 收口 | AR-04～06 / 13 的正式前缀已覆盖，合同键不擅自升格 |
| `D05-B04` | **已解决（不升格）：**Canon v1.2 提案裁定 CP-39 / CP-40 不接纳 `feat_NN_*` 与 `chapter-feature.v1`；生产实现拆回既有任务 / 战斗 schema 与局部状态 | 琴箫、投票、异种真气保留字段需求，但不形成新全局内容对象 |
| `D05-B05` | 明确 `design/11`“笑傲主线 9”的列是制作包，并另记“一周目 10 个逻辑任务” | story 固定为 2 共有 + 8 专属；按 9 个任务裁剪会破坏已审校主线 |
| `D05-B06` | **已解决（不升格）：**`openingCredential_05` 作为章节 / 任务局部状态，按 `design/12` §2.6 在迁移 manifest 中登记映射、单写者与版本，不进入 Canon 全局前缀 | CP-39 已拒绝 `opening_*` 升格，同时保留三种履历的可迁移存档语义 |
| `D05-B07` | 建立缺失的 `design/07-set-system.md`，收敛五岳图鉴十个套装候选 | 当前无法验证成员、阈值、效果与掉落；章节只能安全降级为单件 / 单武学 |
| `D05-B08` | **章节侧已解决**：具名 `full` HP 按同级模板完成取整后再乘个体比例；请 `design/09` 将东方不败旧值同步为 122,626 | `design/03` 已定 0.6–1.2 合法区间；108,000 实际约为模板的 0.528 倍 |

### 原著考据待办

集中清单见 §13.2。优先顺序为：① 刘曲会场、退场与曲谱；② 黑木崖地望和决战动作；③ 五岳并派、夺帅与后洞聚歼；④ 冲虚对剑与梅庄四艺；⑤ 任我行骤逝和琴箫终局；⑥ 人物生卒、命定结局与版本差异。核对完成前不新增逐字引文、确定回目号或伪造招名。

### 开放问题（附默认值）

| 编号 | 问题 | 本文默认值 | 影响 |
|---|---|---|---|
| `D05-O01` | **已解决：**`feat_*` 不成为正式全局前缀 | 按 CP-39 / CP-40，仅作文档配置提案；运行时拆为 `cmb_*`、任务局部键、Buff 和 UI 状态 | schema、热更、存档迁移 |
| `D05-O02` | **已解决：**本界场景使用 `sc_05_*` | Canon v1.2 §12 已裁定；旧 `scn_*` 仅迁移，不双写 | 地图、任务、资源和构建器 |
| `D05-O03` | 9 份主线预算如何容纳 10 个逻辑任务？ | 福州轻量序幕与衡州共用开局包，保持所有 story 幕 ID | 排期、任务统计、资产复用 |
| `D05-O04` | **已解决**：东方不败 HP 取模板 `×0.6≈122,626`（见 §12.4） | 以 `design/03` 的 `full` 合法区间为准；`design/09` 的 108,000 作为待同步旧值，不再参与运行 | Boss 时长、伤害模拟、文档一致性 |
| `D05-O05` | Boss MP 表以工具值还是规范 `×2` 为准？ | 以 `design/03` 规范为准；生产 MP 为表中“规范 MP”，工具输出仅留差异证据 | 数值生成器、回归金标准 |
| `D05-O06` | 琴箫是否需要一件笑傲原生具名箫？ | 首版用普通 `cat: exotic, exoticKind: flute` 装备实例；若要刘正风专属名器，先由 `design/10` 登记 | 合奏可达性、收藏与唯一物权 |
| `D05-O07` | 独孤剑意对太玄门槛降低多少？ | 不直接减属性；只替代一次非核心前置检定，后界不支持则纯文本 | 侠客成长与跨书平衡 |
| `D05-O08` | `cities.yaml.region` 与新 30 区冲突时读哪一方？ | 城市 ID / 时代名读 YAML，区域归属读 `design/11` / 本章映射 | 导航、区域筛选与地图构建 |
| `D05-O09` | 套装候选何时可作为正式奖励？ | `design/07` 建立并登记前一律不可；单件和武学照常掉落 / 授艺 | 装备成长、收集与构建校验 |
| `D05-O10` | 生卒未知的刘曲等改命人物能否在侠客肉身重逢？ | 读 `design/18`；健在则必须可重逢，未知则只给传闻 / 后跋，不按 57 年直觉裁定 | 后界人物、演出与存档兼容 |
