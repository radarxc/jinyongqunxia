# 《长生诀》七支线与和氏璧线

> **归属（基准 §18）**：七条《长生诀》支线与鹿鼎第九层领悟的逐节点剧情规格；层数、效果、和氏璧生命周期与休眠规则唯一见 `design/25`。
> **上游**：`00-canon.md` v1.9；`decisions/author-requirements.md` AR-26；`design/24` / `story/schema.yaml` 剧情 DAG；`design/25` 《长生诀》主线；各书 `story/NN` 与 `chapters/NN`。
> **引用而不重定义**：任务条件 / 动作 → `design/12`；属性 → `design/03`；跨年代传承 → `design/20`；人物生命态 → `design/18`；逐层效果与和氏璧规则 → `design/25` §2、§5–§6。
> **标注约定**：**（原创扩展）**＝原著没有的内容；**（待考）**＝原著事实尚需按三联 / 广州修订版逐字核对；**（待核实）**＝技术事实待联网确认；**（待实测）**＝需真机验证；**【建议值】**＝依赖归属文档回填的执行默认。
> **版本**：v1.0（AR-26 支线规格，2026-10-02）。

---

## 0. 结论先行

七条支线依显示书序构成不可跳层的“看见—辨伪—守人—舍权—忘形”修炼链：白马至侠客依次把 `changshengLayer` 从 1 提升到 8；鹿鼎不再发支线层，而在第九层领悟线中同时核验第八层、永久悟性硬上限、真实和氏璧与退隐心境。全部内容均为**（原创扩展）**，只借各书已有原著人物、地点和主题，不把《长生诀》嫁接成任何原著武功。

每条支线有 8–15 个可实现节点、至少三个既有 `sc_*` 场景、一个多结局选择和一项前书传承 / 信物校验。错过常规窗口不会锁主线天书：取得天书后的余韵期开放一次“残卷补证”，代价由本线明确，仍须完成核心抉择，不能付钱或读菜单直接补层。

## 1. 总体契约与总表

### 1.1 总表

| 书界 | 层 | 支线名 / ID | DAG 节点 | 估计时长 | 关键物品 / 前书环节 | 和氏璧环节 |
|---|---:|---|---:|---:|---|---|
| 白马 `ch10_baima` | 2 | 空龛听息 `q_10_changsheng_01` | 12 | 90–120 分钟 | 第一层；`it_gaochangditu` | 无 |
| 天龙 `ch01_tianlong` | 3 | 三问众生 `q_01_changsheng_01` | 13 | 120–150 分钟 | 白马层；可选 `lgs_yuenv_aqing` 见闻 | 无 |
| 射雕 `ch02_shediao` | 4 | 真经非寿 `q_02_changsheng_01` | 13 | 105–135 分钟 | 天龙层；`it_shijian_xiaofeng` 或无名残页 | 无 |
| 神雕 `ch03_shendiao` | 5 | 十六年灯 `q_03_changsheng_01` | 13 | 120–150 分钟 | 射雕层；九阴卷册见闻 / 见证口述 | 无 |
| 倚天 `ch04_yitian` | 6 | 玉玺不令天下 `q_04_changsheng_01` | 15 | 150–180 分钟 | 神雕层；`it_shijian_guoxiang` 或祖师像补证 | 追索、辨伪、取得真璧 |
| 笑傲 `ch05_xiaoao` | 7 | 不以长生役人 `q_05_changsheng_01` | 12 | 105–135 分钟 | 倚天层；真实和氏璧只读共鸣 | 验证不可号令，不离匣 |
| 侠客 `ch06_xiake` | 8 | 忘形得意 `q_06_changsheng_01` | 13 | 120–150 分钟 | 笑傲层；思过崖藏品记录 | 只读静息校验，不离匣 |
| 鹿鼎 `ch08_luding` | 9 | 石非天下 `q_08_changsheng_01` | 12 | 75–105 分钟 | 第八层、永久悟性满、真实和氏璧 | 观星台领悟并写已用标记 |

总游玩量中位数为 `105+135+120+135+165+120+135+90=1005` 分钟，即 **16 小时 45 分**；最短合计 `885` 分钟（14 小时 45 分），最长 `1125` 分钟（18 小时 45 分）。表中节点数包含各分支执行节点；单次路线不会逐一经过所有节点。

### 1.2 `story.v1` 映射

每条规格编译为独立 `StoryLine`：`kind: side`，`lineId: side_changsheng_01`，`eraLayer` 与稳定书界编号一致，`startNodeId` 均为表内首节点。本文的节点表等价字段如下：

| 本文列 | `story.v1` 字段 | 约束 |
|---|---|---|
| 节点 / 类型 | `nodes[].id/type` | 节点 ID 仅在线内唯一；八类类型只用 schema 闭集 |
| 地点 / 内容 | `payload` + `sourceRef` | 场景、NPC、任务引用构建期解析；文字标原创 / 待考 |
| 完成 | `completeOn` | 只用稳定玩法事件，不以动画结束推进 |
| 后继 | `edges[]` | `choice` 逐项一边；其他为 `auto/condition/timeout`；完整图无环 |
| 结果 | `end.endingTags[]` | 支线局部标签，不新建 `design/13` 的 `end_*` |

本文件的 `dc_*` 是新增支线选择节点，由本文登记；不占用各书主线已有连续号。生产拆 YAML 时必须保留这些 ID、节点语义与边目标，允许补 `titleKey` / Ink knot，不得把分支压成一句对白。

### 1.3 状态、奖励与幂等

```yaml
changshengQuestState:
  q_10_changsheng_01: {status: locked, endingTag: null, proofMode: null}
  q_01_changsheng_01: {status: locked, endingTag: null, proofMode: null}
  q_02_changsheng_01: {status: locked, endingTag: null, proofMode: null}
  q_03_changsheng_01: {status: locked, endingTag: null, proofMode: null}
  q_04_changsheng_01: {status: locked, endingTag: null, proofMode: null}
  q_05_changsheng_01: {status: locked, endingTag: null, proofMode: null}
  q_06_changsheng_01: {status: locked, endingTag: null, proofMode: null}
  q_08_changsheng_01: {status: locked, endingTag: null, proofMode: null}
changshengLayerReceipts: []
heshibiState: {authentic: false, acquisitionReceiptId: null, attuned: false, consumedForInsight: false}
```

`changshengQuestState` 是跨书完成摘要，不替代 `StoryLineState`；其 `status` 原样采用 `design/12` §1.2 的 `locked/available/active/suspended/completed/failed/expired`，不得另造状态，`missed_normal_window` 只写入 `proofMode`。`endingTag` 取该线已提交的 `choiceKey`，共用 `end` 节点只写公共完成标签。完成二至八层结局时，剧情服务原子发出 `progression/changshengLayerGranted {questId, fromLayer, toLayer, receiptId}`，并写入 `changshengLayerReceipts`。仅当 `fromLayer == toLayer−1` 才成功；重放同 `receiptId` 幂等，层数落后则把下一线保持 `locked` 并显示缺失支线，不补发多层。效果只读 `design/25` §2。鹿鼎成功另发 `progression/changshengNinthUnlocked {questId, fromLayer: 8, toLayer: 9, receiptId}`，在同事务把该收据加入 `changshengLayerReceipts`，并写 `changshengLayer=9`、`heshibiState.attuned=true`、`consumedForInsight=true`；实物仍留图鉴。两个事件名与载荷是交工程的**【建议值】**，待 `tech/05` 登记；通用 `story/lineCompleted` 仍照常发出。

### 1.4 失败、错过与主线隔离

1. 普通失败（战败、谜题误答、护送目标受伤）回本线最近安全检查点或补证节点；不杀死原著关键人物，不回滚主线。
2. 时间窗错过、关键场景封闭或原著人物已离场时，在 `proofMode` 写 `missed_normal_window`；取得本书天书后、提交休眠前，开放一次余韵补证。
3. 补证复用至少三个既有地点留下的证言、环境记号或藏品录，不复活人物、不重开主线大战；补证结局只发层数，不补关系、稀有物品或额外成长。
4. 玩家可放弃独占物、关系或省时路线换取补证机会；不能花钱直接买层、用读取旧档外的菜单跳过抉择，亦不能靠下一书自动补层。
5. 任一支线失败均不阻断 `it_tianshu_<NN>`、`tsp_<NN>_*` 或主线 `chapterComplete`；但缺层会顺延锁住后续长生诀线和鹿鼎第九层。

### 1.5 原著、门派与改命共同边界

- 支线只在主线 `sideHook` 解锁，读取主线事实但不写主线正邪、天书轴或锚点生死；所有原著行动主体仍由相应人物完成。
- 门派仅提供合法通行、见证或替代解；无门派身份时必有长路、同伴或技艺路线。支线选择不授职级、不篡改门派传承。
- 任何原著人物死亡、失踪或退隐后的分支都以遗物 / 证言替位；不得为完成《长生诀》复活人物。
- 前书环节只读取已存传承、史笺或藏品记录；没有该可选物时，提供较慢的三点补证，因而“用到前书”不等于强迫玩家取得某一可错过收藏品。
- 第六层前不得取得和氏璧；第六层后它只在天书匣主线信物格中存在，笑傲 / 侠客仅作只读验证，第九层前不可装备、展示给势力或用于政治判定。

---

## 2. 白马 · 第二层「空龛听息」

### 2.1 任务卡

| 项 | 规格 |
|---|---|
| ID / 层 | `q_10_changsheng_01` / 第二层；要求 `changshengLayer == 1` |
| 最早触发 | `q_10_main_c_04` 首次进入 `sc_10_gaochang_migong`，且已取得 `it_gaochangditu`；约主线 45% |
| 最晚常规窗 | `dc_10_07` 提交前；之后转余韵补证，不影响 C05 与天书 |
| 地点 | `sc_10_gaochang_migong` → `sc_10_gaochang_inner` → `sc_10_wushui_shalu` → `sc_10_hasake_yingdi`（4 地） |
| 人物 | `npc_liwenxiu`、`npc_majiajun`（身份未揭时显示计老人）、`npc_aman`；不新增守藏者 NPC |
| 前书环节 | 序章所授第一层 `sk_changshengjue`；它是本线辨出同源吐纳次序的唯一钥匙 |
| 核心玩法 | 三声听息谜题 + 沙暴护送 + 迷宫无战斗复走；90–120 分钟 |
| 原著边界 | 李文秀、计老人 / 马家骏、高昌迷宫及争图关系来自原著，具体细节 **（待考）**；空龛异文、听息与守藏试炼均为**（原创扩展）** |

### 2.2 节点 DAG（12 节点）

| 节点 | 类型 | 地点 / 内容 | 完成 | 后继 |
|---|---|---|---|---|
| `n_bm_mark` | condition | 内环三组残字只有一组与第一层呼吸停顿同频；不要求识读文字 | 比对第一层三次 | `n_bm_ask` |
| `n_bm_ask` | dialogue | 李文秀确认残字不在原地图叙事中；计老人只辨出后刻层**（原创扩展）** | 对话收据 | `n_bm_wind` |
| `n_bm_wind` | quest | 到无水沙路迎回阿曼与驼队；沙暴中水囊、伤者、拓具三目标只能优先保两项 | 救援结算 | `n_bm_loss` |
| `n_bm_loss` | condition | 伤者安全则保留活证；拓具损坏则启用炭灰 / 记步替代；任何结果都可继续 | 条件求值 | `n_bm_echo` |
| `n_bm_echo` | quest | 回迷宫按“风口—滴水—空龛”三声排序；错序触发落沙与撤回，不毁壁刻 | 三段顺序正确 | `n_bm_walk` |
| `n_bm_walk` | quest | 闭合地图，只按第一层吐纳节拍走内环；途中不得拾取高阶遗物槽 | 抵达内殿 | `n_bm_choice` |
| `n_bm_choice` | choice | `dc_10_11`：取完整拓本 / 封存原处只记行气次序 / 交部族共护 | 选择提交 | 三分支 |
| `n_bm_take` | quest | 取拓本：立刻完成校读，但高昌守藏信任下降，失去一次余韵古物鉴定 | 效果事务 | `n_bm_meditate` |
| `n_bm_seal` | quest | 封存：毁去自己的湿拓，凭三处环境记号复走一次 | 复走成功 | `n_bm_meditate` |
| `n_bm_share` | quest | 共护：护送抄录到铁延营地，李文秀 / 阿曼各留一份无功法全文的路线记号 | 护送成功 | `n_bm_meditate` |
| `n_bm_meditate` | quest | 空龛静坐，将“得法不占物”印证为第二层；发层数事件 | 原子奖励 | `n_bm_end` |
| `n_bm_end` | end | 公共标签 `changsheng_layer_2`；分支结局由 `dc_10_11` 已提交选项保存 | 线完成 | — |

边集：`mark→ask→wind→loss→echo→walk→choice`；选择键 `take/seal/share` 分别至三个执行节点，再汇入 `meditate→end`。全图无回边；谜题重试是节点内部检查点，不是 DAG 环。

### 2.3 后果、冲突与补救

`take` 不把拓本建成跨书物，只写“曾强取”史匣记录；`seal` 关系收益最高但多走一次迷宫；`share` 需要完成护送且不宣称铁延部掌握功法。三路都可得层，差异只在本界关系与余韵服务。它不改 `dc_10_07`“人先于藏”的主线判定；若玩家在支线先选取拓，也不能替主线的高阶遗物抉择。

错过常规窗后，在 `sc_10_gaochang_migong`、`sc_10_wushui_shalu`、`sc_10_hasake_yingdi` 各取一处环境 / 证言记号，再到 `sc_10_gaochang_inner` 完成静坐；只得第二层，关系与鉴定收益归零。

---

## 3. 天龙 · 第三层「三问众生」

### 3.1 任务卡

| 项 | 规格 |
|---|---|
| ID / 层 | `q_01_changsheng_01` / 第三层；要求 `changshengLayer == 2` |
| 最早触发 | `q_01_main_c_02` 护经结束后，回访 `sc_01_langhuanfudi` 发现残图；医者与逍遥两问随 Z/X03、Z/X06 依次开放 |
| 最晚常规窗 | Z/X10 雁门止战进入军阵前；止战结算后转余韵补证 |
| 地点 | `sc_01_langhuanfudi` → `sc_01_juxianzhuang` → `sc_01_leigushan` → `sc_01_yanmenguan`（4 地） |
| 人物 | `npc_duanyu`、`npc_xuemuhua`、`npc_xuzhu`、`npc_xiaofeng`；`npc_azhu` 仅在其生命态允许时出现 |
| 前书环节 | 强制读取第二层收据；若 `lgs_yuenv_aqing` 已激活，再读取其“技可留、身会逝”见闻，未激活则以残图三次实测补证 |
| 核心玩法 | 医理脉象配对 + 珍珑外围定息 + 边关护伤；120–150 分钟 |
| 原著边界 | 琅嬛福地、聚贤庄求医、珍珑棋局及雁门终局属原著情节，动作与先后细节 **（待考）**；残图、三问与边关伤营均为**（原创扩展）** |

### 3.2 节点 DAG（13 节点）

| 节点 | 类型 | 地点 / 内容 | 完成 | 后继 |
|---|---|---|---|---|
| `n_tl_trace` | condition | 福地残图的三条闭路对应“留气、渡气、散气”，第二层只预览结果，不替玩家作答**（原创扩展）** | 三路各观察一次 | `n_tl_duan` |
| `n_tl_duan` | dialogue | 段誉只核对福地所见与自身遭际，不把北冥 / 凌波解释成长生法 | 对话收据 | `n_tl_medicine` |
| `n_tl_medicine` | quest | 聚贤庄战后协助薛慕华分诊；只能先稳重伤者、转移轻伤者或保药库之一，未优先项留成本 | 分诊完成 | `n_tl_pulse` |
| `n_tl_pulse` | condition | 将三种伤候与残图气路配对；误配只耗本次药材并回安全检查点，不写人物死亡 | 三组配对正确 | `n_tl_xuzhu` |
| `n_tl_xuzhu` | dialogue | 擂鼓山外围与虚竹复核“得传承”不等于能替他人决定生死；不进入珍珑核心机缘 | Z/X06 后对话 | `n_tl_legacy` |
| `n_tl_legacy` | quest | 有阿青传承见闻则对照其跨代留痕；否则以第二层连续完成三次不同伤候的转化预览 | 获得前书补证 | `n_tl_march` |
| `n_tl_march` | quest | 将伤药与撤离图送至雁门关；萧峰负责原著止战行动，阿朱存活时可提供伤者辨认，不在时由既有药案替位 | 物资抵达 | `n_tl_guard` |
| `n_tl_guard` | quest | 撤离途中守住伤者而不追击溃兵；战败回护送起点，主线军阵不停摆 | 撤离进度完成 | `n_tl_choice` |
| `n_tl_choice` | choice | `dc_01_10`：留气自稳、另耗药救人 / 渡气稳住伤者、自己负伤完成余程 | 选择提交 | 两分支 |
| `n_tl_self` | quest | 留气：交出本线全部备用药并放弃战后独占搜检，换医者继续救治；不得让伤者死亡来换收益 | 资源与搜检权结算 | `n_tl_meditate` |
| `n_tl_others` | quest | 渡气：伤者稳定，主角带“气竭”完成最后护送；至本线结算前禁用主动疗伤，不影响主线 Boss 数值 | 抵达关外石台 | `n_tl_meditate` |
| `n_tl_meditate` | quest | 以“延己与济人皆有代价”完成第三层印证；发层数事件，效果见 `design/25` §2 | 原子奖励 | `n_tl_end` |
| `n_tl_end` | end | 公共标签 `changsheng_layer_3`；分支结局由 `dc_01_10` 已提交选项保存 | 线完成 | — |

边集：`trace→duan→medicine→pulse→xuzhu→legacy→march→guard→choice`；选择键 `keep/share` 分别至 `self/others`，再汇入 `meditate→end`。阿朱的生命态只改变 `march` 的对白来源，不生成新边，也不把她的改命结果倒写。

### 3.3 后果、冲突与补救

`keep` 保存主角状态，但清空本线备用药与战后搜检权；`share` 保存伤者和药材，但以局部“气竭”状态完成护送。两路都得第三层，不修改 `dc_01_04` 的聚贤站队、`dc_01_06` 的逍遥传承归属或 `dc_01_09` 的萧峰生死；天龙寺、逍遥派和医者只是三种见证，不授主角职位。

常规窗错过后，在 `sc_01_juxianzhuang` 取封存药案、`sc_01_leigushan` 取空局记号、`sc_01_yanmenguan` 护送一名无名伤者至天明，再当场永久放弃这次余韵搜检收益，完成“一命换一命”补证；只得第三层，不追发药材、关系或传承收益。

---

## 4. 射雕 · 第四层「真经非寿」

### 4.1 任务卡

| 项 | 规格 |
|---|---|
| ID / 层 | `q_02_changsheng_01` / 第四层；要求 `changshengLayer == 3` |
| 最早触发 | `q_02_main_c_01` 查完牛家村旧案，在 `sc_02_niujia_jiudian` 发现被后人误作“驻颜方”的养生残注**（原创扩展）** |
| 最晚常规窗 | Z/X10 华山段离场前；之后转本书余韵补证 |
| 地点 | `sc_02_niujia_jiudian` → `sc_02_zhoubotong_dong` → `sc_02_yideng_shanju` → `sc_02_huashan_juefeng`（4 地） |
| 人物 | `npc_guojing`、`npc_huangrong`、`npc_zhoubotong`、`npc_yideng` |
| 前书环节 | 读取天龙留下的 `it_shijian_xiaofeng`；未取得时读取书灵既定“无名残页”，两者都只证明前人选择，不作武学载体 |
| 核心玩法 | 墨层辨伪 + 周伯通限招切磋 + 四段山路气息试验；105–135 分钟 |
| 原著边界 | 牛家村、桃花岛、周伯通、一灯与华山论剑等关系来自原著，精确时序 **（待考）**；养生残注、误注争夺与四段试验均为**（原创扩展）** |

### 4.2 节点 DAG（13 节点）

| 节点 | 类型 | 地点 / 内容 | 完成 | 后继 |
|---|---|---|---|---|
| `n_sd_note` | quest | 在酒店旧墙夹层取出残注，按纸龄、墨层、药渍分开原文与后世“长生”批语；不生成可装备秘籍 | 三层证据齐备 | `n_sd_echo` |
| `n_sd_echo` | condition | 以 `it_shijian_xiaofeng` 的止战史笺或无名残页核对“延续何物”；前者省一次访证，后者须郭靖、黄蓉各作独立判断 | 前书证据入档 | `n_sd_island` |
| `n_sd_island` | dialogue | 顽童洞中请周伯通拆解残注；他只谈自己见过的经文与修习，不把《九阴真经》等同《长生诀》 | 对话收据 | `n_sd_spar` |
| `n_sd_spar` | quest | 与周伯通限招切磋：依次在静止、左右扰动、封路三局保持自身气路；失败可重赛，不夺其经卷 | 三局通过 | `n_sd_compare` |
| `n_sd_compare` | condition | 把“疗伤、积功、延续选择”三类作用归位；把九阴内容放入长生栏即判误并给证据提示 | 分类正确 | `n_sd_yideng` |
| `n_sd_yideng` | quest | 护送残注与一名伤者至一灯山居，途中玩家可缩短路线但不能以伤者作轻功负重测试 | 人与证物均抵达 | `n_sd_witness` |
| `n_sd_witness` | dialogue | 一灯只验证医理边界；郭靖、黄蓉、周伯通 / 一灯构成三组独立见证，不授予任何一派经义 | 三组见证封存 | `n_sd_climb` |
| `n_sd_climb` | quest | 华山四段路分别禁疗伤、禁爆发、禁跟随导航、禁拾卷，以第三层气息维持抵达；长山道为无轻功替代 | 四段完成 | `n_sd_choice` |
| `n_sd_choice` | choice | `dc_02_10`：封存残注、保留可复核原件 / 毁去误注、把辨伪方法交给三名见证 | 选择提交 | 两分支 |
| `n_sd_archive` | quest | 封存：放弃本线即时再遇提示，换取后世可校验的原件记录；原件不进背包 | 封存签押 | `n_sd_meditate` |
| `n_sd_teach` | quest | 传人：销毁误注而非原始纸层，取得本界再遇提示；三人各只保存一段校验法 | 三份口述一致 | `n_sd_meditate` |
| `n_sd_meditate` | quest | 完成第四层印证并发层数事件；效果见 `design/25` §2 | 原子奖励 | `n_sd_end` |
| `n_sd_end` | end | 公共标签 `changsheng_layer_4`；分支结局由 `dc_02_10` 已提交选项保存 | 线完成 | — |

边集：`note→echo→island→spar→compare→yideng→witness→climb→choice`；选择键 `archive/teach` 分别至 `archive/teach` 执行节点，再汇入 `meditate→end`。切磋失败只重置节点内三局；DAG 无回边。

### 4.3 后果、冲突与补救

`archive` 保存可考原件但本书不再提示相关藏点；`teach` 得一次再遇提示，却必须公开误读过程。两路都得第四层，均不改变《九阴真经》的取得者、卷册归属、人物武学或华山名位，也不改 Z/X04 桃花岛分路、Z/X07 疗伤与 Z/X10 论剑 / 漠北锚点。门派声望只决定入场方式，不可替代四段试验。

常规窗错过后，分别从 `sc_02_niujia_jiudian` 的墨层记录、`sc_02_zhoubotong_dong` 的切磋记号、`sc_02_yideng_shanju` 的医理口述取得三证，再走 `sc_02_huashan_juefeng` 长山道完成无提示分类；只得第四层，不补再遇提示。任一见证人因主线生命态不能出场时，读取其已封存口述，不复活、不改命。

---

## 5. 神雕 · 第五层「十六年灯」

### 5.1 任务卡

| 项 | 规格 |
|---|---|
| ID / 层 | `q_03_changsheng_01` / 第五层；要求 `changshengLayer == 4` |
| 最早触发 | Z/X02 见过 `sc_03_zhongnan_gumu` 的重阳遗刻后；前半段须在 `q_03_main_c_02` 十六年书页前完成 |
| 最晚常规窗 | `q_03_main_c_03` 华山作别前；跨十六年未完成前半段则直接转余韵补证 |
| 地点 | `sc_03_zhongnan_gumu` → `sc_03_jueqinggu` → `sc_03_duanchangya` → `sc_03_huashan_xuefeng`（4 地） |
| 人物 | `npc_yangguo`、`npc_xiaolongnv`、`npc_guoxiang`；人物只在主线生命态与出场窗允许时参与 |
| 前书环节 | 读取射雕九阴卷册见闻 / `flag_02_jiuyin_chain_known`；若记录缺失，以古墓遗刻的本土见证补齐，不要求跨界携带实体经卷 |
| 核心玩法 | 旧刻来源分层 + 情花药理计时 + 跨十六年环境对照 + 雪峰守候；120–150 分钟 |
| 原著边界 | 古墓遗刻、情花与断肠崖十六年之约、后期郭襄及华山作别来自原著，细部 **（待考）**；跨年灯记、残卷竞逐与守候试炼均为**（原创扩展）** |

### 5.2 节点 DAG（13 节点）

| 节点 | 类型 | 地点 / 内容 | 完成 | 后继 |
|---|---|---|---|---|
| `n_sj_oldmark` | condition | 在古墓把重阳遗刻、九阴内容与后刻长生气路分层；有射雕见闻可直接指出同源层，无记录则逐壁比对 | 来源层确认 | `n_sj_oath` |
| `n_sj_oath` | dialogue | 杨过、小龙女只说明墓中所见与守诺选择；玩家不得据此改变二人关系或偷学石刻 | 对话收据 | `n_sj_valley` |
| `n_sj_valley` | quest | 绝情谷采三份同株不同龄药叶，分辨药性随时令改变；不得把情花毒改写成长生试验 | 三样本完成 | `n_sj_care` |
| `n_sj_care` | quest | 在谷中救援时守住药火、伤者、线索卷三者中的两项；伤者为必保底，另一项决定后续快慢 | 救援结算 | `n_sj_cliff` |
| `n_sj_cliff` | condition | 断肠崖在十六年约成立后封入一盏“不可提前开启”的灯记；禁止下谷、禁止揭露重逢答案 | 写时间封印 | `n_sj_years` |
| `n_sj_years` | quest | `q_03_main_c_02` 五张书页逐张比对灯油、石痕、药圃与人物生命态，承认清醒者会老去 | 五页均确认 | `n_sj_guoxiang` |
| `n_sj_guoxiang` | dialogue | 十六年后的郭襄核对神雕侠传闻与当世善缘；只谈见闻，不预写其倚天后世命运 | 对话收据 | `n_sj_return` |
| `n_sj_return` | quest | 依次回访断肠崖、绝情谷、古墓的三处时间记号；主线已关闭地点用封存记录，不复活人物 | 三记号齐备 | `n_sj_choice` |
| `n_sj_choice` | choice | `dc_03_11`：留守雪峰护送会老去的旅人 / 趁风雪未封路抢取残卷印证 | 选择提交 | 两分支 |
| `n_sj_guard` | quest | 守人：连续三段夜巡，残卷被雪水损去一角；取得完整守候见证与本线额外训练回响 | 三段均无人失散 | `n_sj_meditate` |
| `n_sj_scroll` | quest | 取卷：限时登顶并带所有同行者下山；取得清晰残文，但永久放弃本线额外训练回响 | 人、卷均下山 | `n_sj_meditate` |
| `n_sj_meditate` | quest | 在雪峰承认“不老不免失去”，完成第五层印证并发层数事件；效果完整引用 `design/25` §2 | 原子奖励 | `n_sj_end` |
| `n_sj_end` | end | 公共标签 `changsheng_layer_5`；分支结局由 `dc_03_11` 已提交选项保存 | 线完成 | — |

边集：`oldmark→oath→valley→care→cliff→years→guoxiang→return→choice`；选择键 `guard/scroll` 分别至 `guard/scroll`，再汇入 `meditate→end`。十六年书页是向前时间门而非回边；`scroll` 丢失的只是本线附加回响，不削减第五层在 `design/25` 定义的效果。

### 5.3 后果、冲突与补救

`guard` 失去完整残文却保住旅人，获得一段无数值守候记录；`scroll` 留下清晰校读记录，却不发该回响。两路都得第五层，不取消杨过断臂、情花因果、小龙女跃崖与十六年离别，不提前揭露谷底，不替杨过完成蒙哥之死；`dc_03_06` 的旁人生死和 `dc_03_10` 的终局立场均原样读取。古墓 / 全真身份只改变入场路径。

若错过跨年常规窗，华山余韵以古墓旧刻封存、绝情谷药案、断肠崖灯记三份静态证据完成一次“守到天明”的无卷试炼；只得第五层，不补额外训练回响，也不重放十六年书页。

---

## 6. 倚天 · 第六层「玉玺不令天下」

### 6.1 任务卡

| 项 | 规格 |
|---|---|
| ID / 层 | `q_04_changsheng_01` / 第六层；要求 `changshengLayer == 5` |
| 最早触发 | Z/X09 的 `dc_04_08` 已揭开刀剑藏物线索；互斫、无损探取或暂封三路均可触发 |
| 最晚常规窗 | Z/X11 进入 `dc_04_10` 前；交权失败路及漏接者转取得天书后的余韵窗口 |
| 地点 | `sc_04_xiangyang_ruins` → `sc_04_emei_jinding` → `sc_04_gaibang_secret_hall` → `sc_04_shaolin_tushihui` → `city_kaifeng` 旧都地下库实例（5 地） |
| 人物 | `npc_zhangwuji`、`npc_zhaomin`、`npc_zhouzhiruo`；地下库知情人仅作无名 `witness` 任务角色，不创建人物 ID |
| 前书环节 | 有 `it_shijian_guoxiang` 则读取郭襄史笺；没有时在 `sc_04_emei_jinding` 祖师像前以襄阳旧刻、峨眉藏记两证补齐 |
| 核心玩法 | 三源谱牒核验 + 九格印痕辨伪 + 地下库护证撤离；150–180 分钟 |
| 原著边界 | 倚天刀剑秘密、峨眉传承、屠狮大会及张无忌退出权力中心来自原著，细节 **（待考）**；后周调包、开封旧库与和氏璧全线均为**（原创扩展）** |

### 6.2 节点 DAG（15 节点）

| 节点 | 类型 | 地点 / 内容 | 完成 | 后继 |
|---|---|---|---|---|
| `n_yt_echo` | condition | 襄阳废墟比对刀剑藏物目录与神雕史笺；无史笺则记录故垒石号，绝不把刀剑内藏经书改成玉玺线索 | 两项来源分层 | `n_yt_lineage` |
| `n_yt_lineage` | quest | 将五代末至元末的传递说法按“可核原件 / 同代抄件 / 后世传闻”归三栏；具体年代与玺文一律标待考 | 谱牒无自相矛盾 | `n_yt_emei` |
| `n_yt_emei` | dialogue | 周芷若在金顶只验证祖师藏记与刀剑秘密的交界，不交出、复制或改写峨眉核心传承 | 证言封存 | `n_yt_gaibang` |
| `n_yt_gaibang` | quest | 在丐帮密厅从三份伪路引中找出唯一与襄阳水运旧记相容者；失败会惊动追兵但不毁线索 | 路引辨明 | `n_yt_route` |
| `n_yt_route` | dialogue | 赵敏核对元廷库档封印习惯，张无忌核对救人退路；两人的政治立场不能替代物证 | 双证独立 | `n_yt_vault` |
| `n_yt_vault` | quest | 由 `city_kaifeng` 进入任务实例旧库，先开泄水道与撤离索，再触碰匣室**（原创扩展）** | 两条退路开放 | `n_yt_seals` |
| `n_yt_seals` | condition | 九格印痕谜题核对材质旧伤、封泥年代与谱牒流向；只判本作真 / 伪，不宣称现实考古结论 | 真匣锁定 | `n_yt_witness` |
| `n_yt_witness` | quest | 护送知情库役撤出塌陷区；战败回匣室前，不以灭口、弃人换真璧 | 知情人安全 | `n_yt_choice` |
| `n_yt_choice` | choice | `dc_04_11`：隐去坐标 / 公开辨伪方法但拆分保管 / 把“真璧”交任一争位势力 | 选择提交 | 三分支 |
| `n_yt_hide` | quest | 隐藏：销毁唯一坐标，三名既有人物各封一段无定位能力的鉴定记录；拒绝全部索取者 | 拒交收据 | `n_yt_meditate` |
| `n_yt_split` | quest | 公开：先将真璧收入天书匣，再公开可复核方法；任何单方都不能据此定位或主张统治 | 三份公开证明 | `n_yt_meditate` |
| `n_yt_cede` | quest | 交权失败：对方以调包取走伪玺，真璧被转运；任务转 `suspended` 并写 `proofMode=missed_normal_window`，本节点不发层**（原创扩展）** | 假玺识破 | `n_yt_recover` |
| `n_yt_recover` | quest | 仅余韵开放：凭封泥、泄水道与证人口述追回真璧，救出证人并当众拒绝第二次索取；放弃本线全部政治筹码 | 三硬条件补齐 | `n_yt_meditate` |
| `n_yt_meditate` | quest | 将真璧放入天书匣主线信物格，领悟“功法不能替天下作主”，发第六层事件；效果见 `design/25` §2 | 原子奖励 | `n_yt_end` |
| `n_yt_end` | end | 公共标签 `changsheng_layer_6`；分支结局由 `dc_04_11` 已提交选项保存 | 线完成 | — |

边集：`echo→lineage→emei→gaibang→route→vault→seals→witness→choice`；选择键 `hide/publish/cede` 分别至 `hide/split/cede`；前两路汇入 `meditate→end`，交权路为 `cede→recover→meditate→end`。`recover` 的时间条件只延迟边，不形成回环。

### 6.3 后果、冲突与补救

取得真实和氏璧必须同时有 `seals` 辨伪、`witness` 安全与 `hide/split/recover` 拒绝全体争位者三张收据；缺一时 `heshibiState.authentic=false`，剧情手中之物只按伪玺证物显示，不得使用建议 ID `it_heshibi`。成功后按 `design/25` §5 入天书匣；本文不定义物品属性。

本线不改变 `dc_04_08` 的刀剑命运、周芷若掌门责任、赵敏去留、张无忌退位或 `dc_04_10` 的兵书处置；和氏璧不参与明教、元廷或义军合法性判定。漏接常规窗者在四处既有场景补齐史笺 / 藏记 / 路引 / 公审封泥后进入 `n_yt_recover`；只得第六层与真璧，不补关系、政治筹码或公开声望。

---

## 7. 笑傲 · 第七层「不以长生役人」

### 7.1 任务卡

| 项 | 规格 |
|---|---|
| ID / 层 | `q_05_changsheng_01` / 第七层；要求 `changshengLayer == 6` 且真实和氏璧已入匣 |
| 最早触发 | Z/X03 梅庄脱困后；此时已见思过崖“守 / 取技艺”与地牢“权 / 自由”两种道路 |
| 最晚常规窗 | Z/X08 的 `dc_05_08` 拒盟结算前；之后转余韵自限补试 |
| 地点 | `sc_05_siguoya` → `sc_05_meizhuang_dilao` → `sc_05_heimuya_dadian` → `sc_05_fengchantai`（4 地） |
| 人物 | `npc_linghuchong`、`npc_renyingying`、`npc_fengqingyang`；人物缺席时读取其已发生对白 / 行动记录 |
| 前书环节 | 必须读取天书匣内真实和氏璧并完成“不响应号令”的只读共鸣；物品从不离匣 |
| 核心玩法 | 三种自在见证 + 权威诱饵辨识 + 禁用前书高阶武学的自限连战；105–135 分钟 |
| 原著边界 | 思过崖、梅庄囚禁、黑木崖权力更替、五岳并派与令狐冲拒绝强迫来自原著，细节 **（待考）**；长生见证与自限试炼均为**（原创扩展）** |

### 7.2 节点 DAG（12 节点）

| 节点 | 类型 | 地点 / 内容 | 完成 | 后继 |
|---|---|---|---|---|
| `n_xa_stone` | condition | 思过崖将“石壁留技”与“持技号令人”拆开；天书匣只显示真璧仍封存，不提供政治判定 | 两项事实确认 | `n_xa_feng` |
| `n_xa_feng` | dialogue | 风清扬在其合法出场窗谈“招式与用招之人”；若已离场，以此前试炼记录替位，不伪造其后续行踪 | 对话 / 记录收据 | `n_xa_cell` |
| `n_xa_cell` | quest | 回梅庄地牢按旧机关走一遍“门已开仍不替人决定去向”的路线，救出误入囚室者 | 撤离完成 | `n_xa_ying` |
| `n_xa_ying` | dialogue | 任盈盈核对号令、恩义与自由的界限；关系只改变语气，不免除后续试炼 | 对话收据 | `n_xa_black` |
| `n_xa_black` | quest | 黑木崖大战后护送普通教众撤离，拒用长生秘密换任一方服从；不得改变既定 Boss 结果 | 两条撤离路清空 | `n_xa_compare` |
| `n_xa_compare` | condition | 将思过崖、梅庄、黑木崖三次见证分别归为“技、身、权”；错配时展示已见行为，不给正确答案 | 三栏正确 | `n_xa_limit` |
| `n_xa_limit` | quest | 封禅台自限试炼：暂禁 `sourceChapter != ch05` 且来源品阶 ≥10 的武学、长生主动能力及和氏璧提示；以本界合法能力护三名撤离者 | 三波目标完成 | `n_xa_choice` |
| `n_xa_choice` | choice | `dc_05_09`：退出各方邀约并毁号令抄件 / 留下协助拆除控制网并公开自己无权号令 | 选择提交 | 两分支 |
| `n_xa_leave` | quest | 退出：放弃一次本界派系服务与独占藏点，确保抄件不可恢复 | 放弃事务完成 | `n_xa_meditate` |
| `n_xa_stay` | quest | 留下：公开和氏璧不能命人的验证结论，但不展示实物；放弃本线独占声望，逐项解除胁迫名单 | 名单全部释放 | `n_xa_meditate` |
| `n_xa_meditate` | quest | 在无号令、无外来强技状态下完成第七层印证并发层数事件；效果见 `design/25` §2 | 原子奖励 | `n_xa_end` |
| `n_xa_end` | end | 公共标签 `changsheng_layer_7`；分支结局由 `dc_05_09` 已提交选项保存 | 线完成 | — |

边集：`stone→feng→cell→ying→black→compare→limit→choice`；选择键 `leave/stay` 分别至 `leave/stay`，再汇入 `meditate→end`。自限只在任务实例生成临时 loadout，不卸除、遗忘或散去玩家既有武学。

### 7.3 后果、冲突与补救

`leave` 损失一次派系服务和独占藏点；`stay` 损失独占声望并多做名单解除。两路都拒绝以长生、武功或传国信物役人并取得第七层；不选择任我行、岳不群或任一门派为正统，不改刘曲命运轴、东方不败战果、五岳并派投票或 `dc_05_08` 的令狐冲拒盟。

错过常规窗或自限战三次失败后，可在余韵依次回访梅庄空牢、封禅台散席处、思过崖旧刻，并永久放弃一项尚未领取的本界独占奖励，再以固定基础武学完成单场护送；只得第七层，不补派系服务、藏点或声望。

---

## 8. 侠客 · 第八层「忘形得意」

### 8.1 任务卡

| 项 | 规格 |
|---|---|
| ID / 层 | `q_06_changsheng_01` / 第八层；要求 `changshengLayer == 7` |
| 最早触发 | `q_06_main_c_04` 在 `sc_06_ningbo_jieyingang` 登船后接下；到 `sc_06_xiakedao_shishi` 首次分层观壁时正式展开 |
| 最晚常规窗 | `q_06_main_c_06` 离岛前；离岛后余韵只给一次补试 |
| 地点 | `sc_06_ningbo_jieyingang` → `sc_06_dinghai_chaodong` → `sc_06_xiakedao_yanting` → `sc_06_xiakedao_shishi`（4 地） |
| 人物 | `npc_shipotian`、`npc_longdaozhu`、`npc_mudaozhu` |
| 前书环节 | 读取 `flg_05_siguo_use` 与藏品录内 `it_shiketapian` 来历；没有记录则在定海潮洞完成较慢的几何影线补证，实体拓片不跨书携带 |
| 核心玩法 | 潮影几何 + 图文分离 + 经脉试走 + 双岛主问难 + 无提示运气；120–150 分钟 |
| 原著边界 | 侠客岛邀客、群雄释诗、石破天从图形 / 经脉会意及石壁终局来自原著，具体过程 **（待考）**；潮洞旁证和长生试走均为**（原创扩展）** |

### 8.2 节点 DAG（13 节点）

| 节点 | 类型 | 地点 / 内容 | 完成 | 后继 |
|---|---|---|---|---|
| `n_xk_manifest` | condition | 接引港核对第七层、赴岛资格与真璧仍在主线信物格；只记一张“匣内静息”只读收据，不开匣、不改信物状态；支线失败不改 `dc_06_08` 已冻结的主线名单 | 三项通过 | `n_xk_tide` |
| `n_xk_tide` | quest | 定海潮洞以三次潮线拼出无文字几何；有思过崖藏品记录则多一条对照，没有则完整观测一轮潮汐 | 图形闭合 | `n_xk_arrive` |
| `n_xk_arrive` | dialogue | 石破天只描述自己所见形势，不替玩家解释文字；不预支他的原著顿悟 | 对话收据 | `n_xk_debate` |
| `n_xk_debate` | dialogue | 宴厅分别记录龙、木二岛主的问难；两份信任与证言独立，不合并人物状态 | 两问均答 | `n_xk_split` |
| `n_xk_split` | quest | 石室界面把字义、笔画图形、经脉走向拆成三层；只切换一层可见，其余隐藏 | 三层各观一次 | `n_xk_walk` |
| `n_xk_walk` | quest | 依三条候选线路试走气息；错路只加可恢复紊乱并回节点检查点，不伤经脉、不升级太玄 | 找出自洽线路 | `n_xk_refute` |
| `n_xk_refute` | condition | 用实测结果逐项反证一份众说拼成的错误抄本；高 `lore` 只多显示争论，不替代身体验证 | 三项矛盾确认 | `n_xk_question` |
| `n_xk_question` | dialogue | 龙岛主问“何者可传”，木岛主问“何者亲证”；玩家必须分别回答，石破天仍是完整太玄会意者 | 双问收据 | `n_xk_choice` |
| `n_xk_choice` | choice | `dc_06_11`：封存权威注解作错误样本 / 亲证后毁掉自己的错误抄本 | 选择提交 | 两分支 |
| `n_xk_keep` | quest | 封存：保留带来源链的错误样本，只能用于反证；最终试炼多一组干扰提示，换完整考据记录 | 封条签押 | `n_xk_empty` |
| `n_xk_destroy` | quest | 毁本：三方确认只毁玩家抄本，不伤原壁；失去本线完整注解图鉴页，最终试炼无干扰 | 毁本见证 | `n_xk_empty` |
| `n_xk_empty` | quest | 关闭全部文字提示，仅按七层长生气路完成最终运气；不得调用 `sk_taixuan` 的领悟状态；成功原子发第八层事件，效果见 `design/25` §2 | 运气三段无逆行并结算奖励 | `n_xk_end` |
| `n_xk_end` | end | 公共标签 `changsheng_layer_8`；分支结局由 `dc_06_11` 已提交选项保存 | 线完成 | — |

边集：`manifest→tide→arrive→debate→split→walk→refute→question→choice`；选择键 `archive/destroy` 分别至 `keep/destroy`，再汇入 `empty→end`。试走与运气重试均为节点内检查点，不形成 DAG 环。

### 8.3 后果、冲突与补救

`archive` 保存的是有明确“已证伪”水印的考据记录，不能成为秘籍；`destroy` 只毁玩家抄本并少一页图鉴。两路均得第八层，不改变 `dc_06_09` 的原著 / 改命轴，不复制、授予或改写 `sk_taixuan`，不阻止原著石壁结局、龙木生命态或群雄归航；第八层亦不等于自动取得第九层。

离岛前，`n_xk_empty` 失败可在气息恢复后重复。若在主线强制归航时仍未完成，余韵菜单只送到清理后的 `sc_06_xiakedao_shishi` 入口，开放一次无文字补试；成功只得第八层，失败则本轮永久错过，但不影响 `it_tianshu_06`、书眠或后续书界。

---

## 9. 和氏璧跨书线与鹿鼎第九层

### 9.1 唯一信物的跨书保存

本文只实现 `design/25` §5 的生命周期，不另定物品属性；`it_heshibi` 仍是**建议 ID，待 `design/10` 正式登记**。

| 阶段 | 状态事务 | 可见 / 可用边界 |
|---|---|---|
| 倚天取得 | `heshibiState.authentic=true`，写唯一 `acquisitionReceiptId`；装入天书匣主线信物格 | 只在 §6 三项硬条件齐备后写真；伪玺不占该格 |
| 倚天 → 笑傲书眠 | 从核心存档复制信物状态，不进入装备、背包、3+3 或传承匣清理集合 | 不可交易、丢弃、藏史或作为政权判据 |
| 笑傲验证 | §7 只读 `authentic` 与匣内共鸣，不生成世界掉落，不改变唯一信物归属 | 验证“不能号令人”；不得展示给争权势力 |
| 笑傲 → 侠客书眠 | 沿用同一唯一实例和取得收据 | 不因第七层或跨性质投放而改变物品状态 |
| 侠客验证 | §8 只读静息反应，物品不离匣 | 不与太玄石壁、拓片或注解合成 |
| 侠客 → 碧血 → 鹿鼎 | 两次转场均原样复制；碧血无长生层，可在整备余韵只读复核匣封并记一条非门槛回响 | 不挂碧血政治、宝藏、装备或任务消耗 |
| 鹿鼎领悟后 | 同事务写 `attuned=true`、`consumedForInsight=true` | 实物留图鉴；不可再次触发、兑换或充当统治凭据 |

加载时若 `authentic=true` 而唯一取得收据缺失，或出现两件实体，存档校验必须阻断领悟并进入数据修复，不能用复制品择一；若只是 UI 物品未显示，以核心状态与收据重建同一实例，不再发一件。

### 9.2 鹿鼎任务卡

| 项 | 规格 |
|---|---|
| ID / 层 | `q_08_changsheng_01` / 第九层领悟；不是第八条“得层支线”，要求 `changshengLayer == 8` |
| 渐进触发 | 入书即可在 `sc_08_yangzhou_shufang` 核验匣封；随后读取紫禁城、五台山、鹿鼎山三段主线见闻 |
| 最早结算 | `dc_08_10` 已结算，玩家已拒绝真实清剿并完成放弃官职 / 暗网控制的不可逆动作；挂在 Z/X08 天书现世前 |
| 最晚窗口 | 取得 `it_tianshu_08` 后的余韵仍可补条件，直到原 `BS_COMMIT`；条件不足不阻断鹿鼎通关 |
| 地点 | `sc_08_yangzhou_shufang` → `sc_08_zijincheng` → `sc_08_wutaishan_qingliang` → `sc_08_ludingshan_kuangdao` → 北京城外观星台任务实例 |
| 人物 | `npc_weixiaobao`、`npc_kangxi`；后者只在紫禁城既有窗口参与，不为支线延长出场 |
| 前书环节 | 第八层收据 + 倚天取得的真实和氏璧；并核笑傲、侠客两次只读验证记录，缺后两项可现场重验，不降硬门槛 |
| 属性门 | `innatePerm.wis == innateCap.wis`；由 `design/03` §2.1 得 `innateCap.wis=100+5×breakCount_wis`、`0≤breakCount_wis≤4`，即当前永久上限为 100–120；`temp_wis` 不计 |
| 核心玩法 | 权力见闻四证 + 星图 / 匣痕对位 + 退隐抉择；75–105 分钟 |
| 新场景依赖 | 观星台为 `design/25` §6 已定的**（原创扩展）**地点；建议 ID `sc_08_beijing_guanxingtai`，待 `chapters/08` 登记前不得写入生产 YAML |

### 9.3 节点 DAG（12 节点）

| 节点 | 类型 | 地点 / 内容 | 完成 | 后继 |
|---|---|---|---|---|
| `n_ld_inventory` | condition | 扬州书坊核对真璧唯一收据、匣封与未领悟标记；只看纸样和封痕，不取出示人 | 三项一致 | `n_ld_palace` |
| `n_ld_palace` | dialogue | 紫禁城见玉玺、诏令与少年旧谊如何被权位改变；康熙只按主线阶段出场**（原创扩展观察）** | 记录“玺能令而不能服人” | `n_ld_wutai` |
| `n_ld_wutai` | quest | 清凉寺把官身、门派、旧名三种称谓逐一暂置，护送不愿卷入争斗者走香客道 | 护送完成 | `n_ld_mine` |
| `n_ld_mine` | condition | 鹿鼎山矿道以真 / 伪藏宝图结果对照“石、图、权”三者；不可重开宝藏或改变经书线 | 三项归类正确 | `n_ld_reflect` |
| `n_ld_reflect` | condition | 等待 `dc_08_10` 后的退隐心境收据：拒绝真实清剿，且已不可逆放弃官职或暗网控制；未满足仅保持可用 | 收据存在 | `n_ld_depart` |
| `n_ld_depart` | dialogue | 韦小宝在出京前以自己的选择回应“英雄是否必须掌权”；主角不替他辞官、清名或安排家人 | 对话收据 | `n_ld_gate` |
| `n_ld_gate` | condition | 观星台入口同时核验第八层、永久悟性满、真璧未用、退隐心境；任一不足显示精确缺项并退出实例 | 四项全真 | `n_ld_choice` |
| `n_ld_choice` | choice | `dc_08_11`：请韦小宝见证“璧只是石” / 独自卸下名号、以七层收据对照天象 | 选择提交 | 两分支 |
| `n_ld_shared` | dialogue | 共同见证：短暂开匣，不谈玺文真伪或天下归属，随即由主角亲手归匣 | 见证完成 | `n_ld_insight` |
| `n_ld_solitary` | quest | 独自见证：按七层收据顺序校准七处星位，把真璧只作为重量与材质基准，再归匣 | 七处对位完成 | `n_ld_insight` |
| `n_ld_insight` | quest | 原子发 `progression/changshengNinthUnlocked` 并写 `changshengLayer=9`、`attuned/consumedForInsight=true`；效果唯一见 `design/25` §2–§3 | 原子奖励 | `n_ld_end` |
| `n_ld_end` | end | 公共标签 `changsheng_layer_9`；分支结局由 `dc_08_11` 已提交选项保存 | 线完成 | — |

边集：`inventory→palace→wutai→mine→reflect→depart→gate→choice`；选择键 `shared/solitary` 分别至 `shared/solitary`，再汇入 `insight→end`。条件未满足时退出任务实例而非通向失败 `end`，以后条件变化可重新进入；完成后因 `consumedForInsight=true` 永久禁用入口。

### 9.4 主线冲突、失败与后续

本线只读 `dc_08_10`、法场救援、清名与疏散结果，不重开任何窗口；康熙与韦小宝的原著关系、韦小宝退隐和四种正式结局仍由 `story/08` 决定。玩家选择共同或独自见证只改尾声镜头，不改门派、天书轴或人际结局。

属性、层数或信物未齐时可继续鹿鼎主线；鹿鼎余韵只能补到永久悟性当前上限并完成本书尚开放的退隐心境，之后可再验。倚天追回真璧与侠客第八层试炼必须在各自书界的余韵窗口完成，进入下一书界后不得跨界重开；缺任一硬条件时本轮不能领悟第九层。笑傲 / 侠客只读验证记录不是额外硬门，旧档缺记录时可按 §9.2 在鹿鼎现场重验真璧，而非重开旧任务。`BS_COMMIT` 后本轮窗口关闭；第九层成功则按 `design/25` §9 改走周游世界，不再执行鹿鼎后的书眠、遗忘或 3+3，但外来压制及时代资产清理照旧。

---

## 10. 原著出处与原创边界

| 书 | 本文借用的原著事实 | 本文原创内容 |
|---|---|---|
| 《白马啸西风》 | 李文秀、计老人 / 马家骏、阿曼、高昌迷宫与争图；细节 **（待考）**，逐回索引见 `story/10` §1 | 空龛壁刻、三声听息、部族共护 |
| 《天龙八部》 | 琅嬛福地、聚贤庄求医、珍珑棋局、雁门止战；细节 **（待考）**，见 `story/01` §1 | 三问残图、分诊气路、边关伤营 |
| 《射雕英雄传》 | 牛家村、桃花岛九阴旧事、一灯疗伤、华山论剑；细节 **（待考）**，见 `story/02` §1 | 养生残注、三见证辨伪、四段试息 |
| 《神雕侠侣》 | 古墓遗刻、绝情谷情花、十六年之约、郭襄与华山作别；细节 **（待考）**，见 `story/03` §1 | 灯记、跨年环境证据、守候残卷 |
| 《倚天屠龙记》 | 刀剑秘密、峨眉传承、屠狮大会、张无忌退位；细节 **（待考）**，见 `story/04` §1 | 后周调包、开封旧库、真伪玺与护证线 |
| 《笑傲江湖》 | 思过崖石刻、梅庄囚禁、黑木崖与拒绝迫盟；细节 **（待考）**，见 `story/05` §1 | 三种自在见证、和氏璧只读共鸣、自限试炼 |
| 《侠客行》 | 侠客岛邀客、群雄解诗、石破天会意与石壁终局；细节 **（待考）**，见 `story/06` §1 | 潮影旁证、错误抄本、长生无字运气 |
| 《鹿鼎记》 | 康熙 / 韦小宝关系、鹿鼎山线索、拒绝两边相残与退隐；细节 **（待考）**，见 `story/08` §1 | 和氏璧跨代保存、前朝观星台与九层领悟 |

和氏璧史实 / 传说边界统一见 `design/25` §5.1；本文不新增史书引文，不断言玺文、缺角或亡失版本为唯一事实。《长生诀》、和氏璧组合及全部修炼节点均按 `design/25` §10 标为**（原创扩展）**。

## 本文新增术语与 ID

| 术语 / ID | 类型 | 定义 |
|---|---|---|
| `q_10_changsheng_01`、`q_01_changsheng_01`…`q_06_changsheng_01` | 支线任务 | 白马至侠客依序授第二至八层；每书仅一条 |
| `q_08_changsheng_01` | 领悟任务 | 鹿鼎第九层条件核验与观星台领悟，不计入七条得层支线 |
| `dc_10_11`、`dc_01_10`、`dc_02_10`、`dc_03_11`、`dc_04_11`、`dc_05_09`、`dc_06_11`、`dc_08_11` | 选择节点 | 各线唯一局部多结局抉择；在各书既有连续编号后续号 |
| `side_changsheng_01` | `StoryLine.lineId` | 各章节包内局部线名；与 `chapterId` 组成唯一键 |
| `changshengQuestState` | 存档映射 | 八个任务按 `design/12` §1.2 保存标准状态，并附结局与补证模式 |
| `changshengLayerReceipts` | 幂等收据集 | 防止二至九层奖励重放，并证明不可跳层 |
| `heshibiState` | 信物状态 | `authentic/acquisitionReceiptId/attuned/consumedForInsight`；物品生命周期仍归 `design/25` |
| `progression/changshengLayerGranted` | 建议领域事件 | 二至八层逐层获得事件，载荷见 §1.3；待 `tech/05` 登记 |
| `progression/changshengNinthUnlocked` | 建议领域事件 | 第九层与和氏璧领悟标记的原子结算事件；待 `tech/05` 登记 |
| `sc_08_beijing_guanxingtai` | 建议场景 ID | 北京城外废弃前朝观星台；待 `chapters/08` / `design/11` 登记后方可生产引用 |

`n_bm_* / n_tl_* / n_sd_* / n_sj_* / n_yt_* / n_xa_* / n_xk_* / n_ld_*` 均为各 `StoryLine` 内节点 ID，不进入全局内容表。`it_heshibi` 沿用 `design/25` 的建议 ID，本文不越权转为物品正式定义。

## 数据校验规则与测试用例

### 构建期校验

| ID | 检查 | 通过条件 |
|---|---|---|
| CSS-V01 | 支线集合 | 七条得层线恰对应白马、天龙、射雕、神雕、倚天、笑傲、侠客；奖励严格为 2…8 |
| CSS-V02 | DAG 结构 | 每线单起点、8–15 节点、全可达、无环；`end` 无出边，`choice` 的键与出边一一对应 |
| CSS-V03 | 复杂度 | 每线至少引用 3 个已登记地点、1 个前书状态 / 物品环节、1 个多结局选择及明确估时 |
| CSS-V04 | 层数幂等 | `fromLayer == toLayer−1` 且 `receiptId` 未消费才写层；重放不升层，缺前层不自动补齐 |
| CSS-V05 | 主线隔离 | 支线失败、超时或放弃不得写天书、路线、锚点生死；余韵补证不追发已错过的附加收益 |
| CSS-V06 | 真璧取得 | 辨伪、护证人、拒绝所有争位者三张收据齐备，才允许 `authentic=true`；全局唯一实例 |
| CSS-V07 | 跨书保存 | 和氏璧不进入背包 / 装备 / 传承匣 / 3+3 清理集，逐次书眠状态与收据不增不减 |
| CSS-V08 | 九层条件 | `ch08`、层 8、`innatePerm.wis==innateCap.wis`、真璧未用、退隐心境同时满足；临时悟性无效 |
| CSS-V09 | 原子终局 | 第九层事件、`changshengLayer=9`、`attuned=true`、`consumedForInsight=true` 同事务；失败全回滚，成功不可重触发 |
| CSS-V10 | 武学隔离 | 九阴、太玄、独孤等仅作见证 / 自限接口，不因支线增层、复制秘籍或改变原著承者 |

### 流程测试

| ID | 输入 / 操作 | 预期 |
|---|---|---|
| CSS-T01 | 按书序走完七线，每线重放奖励节点一次 | 层数为 8；七张唯一收据；重放均无第二次奖励 |
| CSS-T02 | 缺第三层进入射雕；其余条件齐 | 第四层线保持锁定并显示天龙缺项；射雕主线照常完成 |
| CSS-T03 | 七线各枚举选择键，并触发普通失败 / 余韵补证 | 所有出口可达；补证只发层，不倒改主线或补附加奖励 |
| CSS-T04 | 倚天交权后持伪玺 / 余韵追回真璧 | 前者不可得层或跨书；后者三收据齐，取得第六层与唯一真璧 |
| CSS-T05 | 笑傲、侠客分别读取真璧，再存档加载 | 两次均只读；`authentic`、`acquisitionReceiptId` 与 `consumedForInsight=false` 不变 |
| CSS-T06 | `innatePerm.wis=100, innateCap.wis=105, temp_wis=20` | 九层属性门失败；永久悟性升到 105 后通过 |
| CSS-T07 | 四项九层条件齐，在共同 / 独自分支各结算两次 | 各档层数均为 9 且仅一次第九层事件；真璧仍见于图鉴且不能再触发 |
| CSS-T08 | 未领悟先取鹿鼎天书，余韵补齐 / 直接提交 `BS_COMMIT` | 前者仍可领悟；后者关闭本轮窗口但不破坏通关存档 |

## 待决事项 / 依赖

### 替下游给出的建议值

- 八线估时与各 `lineId` 采用 §1.1–§1.2；工程拆表时可调对白时长，不得删减节点约束。
- 观星台建议登记为 `sc_08_beijing_guanxingtai`，挂 `rg_yanjing_zhili`，普通官道可达，不设轻功硬门。

### 本文依赖的上游事实

- 层数效果、真璧生命周期、第九层与周游规则依赖 `design/25`；永久悟性和动态上限依赖 `design/03` §2.1。
- 所有场景、NPC 生命态、主线时间窗与传承记录依赖相应 `chapters/NN`、`story/NN`、`design/18`、`design/20`。
- `it_heshibi` 须由 `design/10` 登记；登记前本文所有使用均为建议引用。
- 两个长生诀领域事件及 `changshengQuestState/changshengLayerReceipts/heshibiState` 的生产 schema、迁移和原子事务由 `tech/05` 落地；本文只给剧情侧载荷与不变量。

### 对基准的修改提案

- CSS-P01：无需修改 `00-canon.md`；建议同步修订 `design/25` §6 的旧“100【建议值】”为动态判定 `innatePerm.wis == innateCap.wis`，与现行 `design/03` 一致。
- CSS-P02：建议把 `design/25` §6 的“取得本界天书前”明确为主窗口，并保留该节正文既有“取得天书后至 `BS_COMMIT`”余韵补窗，消除表文歧义。

### 原著考据待办

- 按三联 / 广州修订版逐字复核 §10 八行所列人物、地点、物件流转与先后；尤其高昌争图、雁门终局、九阴卷册、十六年约、刀剑秘密、拒盟、侠客岛石壁及鹿鼎退隐。
- 和氏璧史实只沿用 `design/25` 的待考结论；正式文本不得补造玺文、缺角、年代或引文。

### 开放问题（附默认值）

- 第九层是否必须先取得第八层：默认**必须**，不允许悟性与和氏璧越级，沿用 `design/25` §6。
- 观星台是否升级为正式场景：默认登记上述建议 ID；若复用现有场景，也须保持“北京城外、非权力中心、普通路线可达”。
- 和氏璧正式物品登记完成前如何联调：默认用受控 feature flag 映射建议 ID，不生成可掉落临时物品。
