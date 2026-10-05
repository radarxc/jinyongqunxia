# ART-P-pc 报告 · 人物立绘提示词 · 主角（男女两版 × 各时代）与书灵

## 1. 摘要（3–6 行）

本轮续作沿用工作区已有的 31 份提示词与报告，只修复合入前审核第 1 轮点名的背景口径及报告笔误。
主角男、女各 15 份时代提示词，加书灵 1 份，共 31 份；统一为不透明暖浅灰纸底、极淡纸纹、无文字，未调用图像生成。
先在本报告锁定两段面容锚点，再逐字嵌入同一性别全部文件；保持约 28 岁成年外观与对等行动感。
时代、ID、角色边界按作者决定与归属文档；使用指定的男 R2、女 R1 最新模板，具体造型标原创扩展。
指定结构检查通过，精确覆盖、参考路径、锚点一致性和文本完整性检查通过；服饰专项考据与成图审核尚未进行。

## 2. 产出（文件、行数、主要章节）

路径均相对仓库根目录；第 7.2 节逐行列出全部 30 份主角文件，第 7.3 节列书灵文件。各提示词正文均含人物要点表、单段完整 text 提示词、排除项、质检要点，frontmatter 只含规定的 11 个键。

| 文件 / 文件组 | 数量与实测行数 | 主要章节 |
|---|---:|---|
| `assets/default/prompts/characters/protagonist/npc_zhujue__m_ch00.md` 至 `npc_zhujue__m_ch14.md` | 15 份 × 66 行 = 990 行 | 男性固定锚点、十五时代服装与发式、普通兵器或空手、逐张质检 |
| `assets/default/prompts/characters/protagonist/npc_zhujue__f_ch00.md` 至 `npc_zhujue__f_ch14.md` | 15 份 × 68 行 = 1,020 行 | 女性固定锚点、十五时代服装与发式、对等行动感、同性别风格参考 |
| `assets/default/prompts/characters/protagonist/npc_shuling.md` | 1 份，66 行 | 无性别墨影识别锚、序章归属、对话 portrait 适配、非战斗与非人形边界 |
| `tools/agents/reports/ART-P-pc.md` | 169 行 | 七节交接、全文锚点、30 变体表、书灵依据、开放问题与自检 |

提示词实测合计 `990 + 1,020 + 66 = 2,076` 行；已更正旧报告书灵 67 行、合计 2,077 行的笔误。本轮每次补丁不超过 50 行，逐文件局部修改；没有新建 PNG、图片 manifest、全局索引或生成器脚本。

## 3. 关键结论与数值

- 数量：`(序章 1 + 正篇 14) × 性别 2 = 30` 份主角；加书灵 `1` 份，共 `31` 份，均为 `tier: S`、`age_variant: prime`、`status: ready`。ready 是提示词准备状态，不是图像批准状态。
- 男、女主角内容 ID 均为既有 `npc_zhujue`；资产 ID 精确采用 `por_npc_zhujue__chNN_m_base` / `por_npc_zhujue__chNN_f_base`。书灵复用 `npc_shuling`，资产 ID 为 `por_npc_shuling__ch00_base`。
- 约 28 岁是 `22 ≤ 28 ≤ 35` 内的原创美术默认，范围来自 `design/01` §4.1【建议值】；男约 7.5、女约 7 头身引用 `tech/07` §2.6。不增加战力、年龄或跨界成长规则。
- 本批生成目标 `2048×3072` PNG，`2048:3072 = 2:3`；人物占高 88–92%，脚底约 4% 净空引用 `tech/07` §1.3、§5.2。对应目标占高约 `2703–2826 px`、脚底净空约 `123 px`，均为目标而非成图实测。书灵非人形，不套人体头身比、占高或足底线。
- 本批 31 份统一生成不透明暖浅灰纸底、极淡纸纹、无文字；书灵的月牙与折角负形均为纸底留白，保留浓淡墨层次。`tech/07` §5.2 的最终透明 RGBA 母版由后续抠图与规格化管线处理，不覆盖本批生成背景要求；无 UI、场景或接触投影。
- 本地男性基线两张均为 candidate，15 份男稿默认 `references: []`；15 份女稿仅列本地存在且 approved 的王语嫣基线；书灵无 other 基线，亦为 `[]`。未将同一基线人物的脸、衣色、体型或道具复制给主角。
- 清代七界 `ch08–ch14` 共 `7×2=14` 份：男版剃发留辫，女版保持汉族常服与束髻。白马采用行经回疆的汉地旅人普通保暖装，不拼接当地族群礼服；书剑选江南行旅阶段。
- 不同书界保持同一成人身份与身体骨架，跨界成长只作神态微调；普通兵器属于画面道具选配，不声明获得剧情装备或技能。春秋序章默认空手，避免套用阿青识别物。

## 4. 开放问题（附默认值）

| 编号 | 事项 | 默认值 / 处理 |
|---|---|---|
| O-PC-01 | 主角年龄感 | 男女均约 28 岁；在上游 22–35 岁【建议值】范围内，本批 prime/base 不做随朝代老化 |
| O-PC-02 | 男主面容方向 | 本报告 §7.1：方圆偏长脸、自然骨相与极淡胡茬、匀称结实；小痣作原创辨识点，等待作者对首张成图确认 |
| O-PC-03 | 女主面容方向 | 本报告 §7.1：略长鹅蛋脸、清楚下颌与专注杏眼、舒展有力；美丽而不娇弱，小痣作原创辨识点 |
| O-PC-04 | 书灵形象方向 | 浓墨逗点核 + 淡墨弧带 + 月牙留白 + 折角负形；常态无五官、无性别，无实体鱼或纸页 |
| O-PC-05 | 基线审批与后续一致性控制 | 男稿先保留无图参考；不冒认男性候选获批。出图任务若要求输入获批基线，应等相应批准并补录实际输入；主角首张审定后的一致性流程归 tech/07 §5.2，当前不虚构未存在的主角参考图 |
| O-PC-06 | 服饰与地域默认的精细复核 | 沿模板 §3、tech/07 §2.7 的时代语汇，具体衣色、袖型、发髻与御寒层次标原创；本批不声称考古复原 |
| O-PC-07 | 年代逐字核对 | 保留 design/02 §1.3 / §10.4 的（待考）；笑傲、侠客、连城、白马、鸳鸯五界和序章的游戏定年明确为原创扩展；不新增引文、回目或原著服饰事实 |
| O-PC-08 | 书灵真名 | 沿 design/01 §5.1 的上游待确认项；本批统一名“书灵”，常态立绘不提前显示“余墨” |
| O-PC-09 | 现代开场服装 | design/01 §4.2 另需现代装，但本任务明确限定春秋序章 + 十四书界 30 份；现代装交后续资产任务，不能把 ch00 改作现代装 |
| O-PC-10 | 碧血跨明清时段 | 基础立绘默认入关前明末常服；若剧情要求入关后的改装，另立状态变体，不在本批混搭明衣清辫 |
| O-PC-11 | 本批尺寸、纸底与后续透明质量 | 本批默认生成不透明暖浅灰纸底、极淡纸纹、无文字，实际尺寸与边缘须出图后实测；最终透明母版由后续管线处理，不能假填高分辨率或已完成 alpha 修边 |

ID 无需新增命名确认：已解决，基准 §12、design/01 §11.2 与 design/18 §13.3 均已登记主角及书灵；未使用备用新 ID。上述审美默认不阻断本次提示词交付，也未向作者追加提问。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| — | 无 | 本任务消费现有主角、书灵、年代与资产规则，只新增原创视觉表达；不修改基准、数值或玩法归属 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

以下只登记，未修改授权外文件。

| 文档 / 下游 | 位置 | 改什么 |
|---|---|---|
| `assets/default/prompts/characters/INDEX.md` | 总索引 | 协调者合入各任务后运行现有 build_portrait_index.py，收录本目录 31 份；该路径由脚本确认，本次不越权生成 |
| `assets/default/prompts/characters/GUIDE.md` | 参考图、背景与状态说明 | 区分 ready 提示词、candidate 基线与 approved 基线；记录男版当前无获批同性别输入、女版只用王语嫣、书灵不用男女参考；本批生成不透明暖浅灰纸底、极淡纸纹、无文字，透明母版处理留给后续管线 |
| `docs/design/01-vision-and-core-loop.md` / 后续资产任务 | §4.2 现代装、§5 书灵表现 | 现代开场装另外排期；作者若采用本批锚点，可引用固定主角设定卡，勿把普通时代装升级为固定职业或门派 |
| `docs/tech/07-asset-generation.md` | §1.4、§3.2、§5.2、§7.1 | 后续登记主角 chNN_m/chNN_f 变体与本批 Markdown 提示词入口；保留 30 份时代装口径，区别静态书灵主体与 UI/轻量动画实现 |
| `docs/tech/07-asset-generation.md`、`docs/tech/06-asset-storage.md`、`docs/decisions/author-decisions.md`、`TODO.md` | 旧工具、风格和二进制存储摘要 | 沿 ART-B-male / ART-B-female 报告遗留项，对齐 STYLE 作者的新入口、性别风格与入库要求；本次未替这些文档回填 |
| `assets/default/character/{male,female,other}/chNN/manifest.yaml` | 未来真实出图登记 | 按每份 frontmatter 的精确路径保存 PNG 与条目；登记真实尺寸、哈希、完整提示词和实际参考；不把本文目标当已生成证据 |


## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 男、女主角的面容锚点全文

先锁定以下两段原创美术默认，再原样写入各自 15 份提示词的「人物要点」与完整提示词。约 28 岁属于 `design/01` §4.1 的 22–35 岁【建议值】范围，不新增玩法年龄规则；清代剃发改变发式，不改变保留发丝的发质、脸型或体格。

男性主角面容锚点（原创扩展）：现代中国青年，外观约28岁；偏长的方圆脸，颧骨适度、下颌转折清楚而不宽阔，平直浓眉且左眉尾略高，深棕色中等杏眼，鼻梁直、鼻头圆钝，薄上唇与略厚下唇，左眉尾下有一颗浅褐小痣；暖中性肤色，保留自然纹理与极淡胡茬，无深皱纹；中等偏高、肩背匀称、四肢结实而不魁梧，约7.5头身；原生发质乌黑、直而略硬，保留的发丝密实；目光专注而有好奇心，嘴角平和，警觉但不怯弱。

女性主角面容锚点（原创扩展）：现代中国青年，外观约28岁；略长的鹅蛋脸，颧骨有轻微支撑、下颌利落而不尖削，眉形舒展且眉峰轻提，深棕色中等杏眼，鼻梁秀直、鼻头自然，唇线清晰、上下唇厚度适中，右眼外侧下方有一颗浅褐小痣；暖中性肤色，柔润而保留真实体积，无幼态或深皱纹；中等偏高、肩背舒展、腰腹与四肢有行动力量，约7头身；原生发质乌黑、顺直、发丝细密而有韧性；目光专注而有好奇心，嘴角平和，警觉但不怯弱。

男女版是可选的两套主角呈现，行动能力、判断力与叙事地位对等；女性不作柔弱陪衬。书眠不老与跨书识别沿用基准 §1、`design/01` §4.2；本轮 `prime/base` 保持同一成年外貌，只以衣着、姿态和目光的细微变化表现经历，不新增随剧情变老、伤残或结局外观。

### 7.2 三十份主角时代变体清单

✅ 覆盖精确为 ch00–ch14 × m/f，没有把现代装、回忆楔子、守卷外观或表情补丁混入基础时代装计数。下表的具体衣色与搭配均为原创扩展；年代语义及考据边界引自 design/02 §1。普通兵器都是完整入鞘的一把，男女同界道具选择一致。

| 书界 / 版本 | 年代 | 服饰发式与道具要点 | asset_id | 提示词文件 |
|---|---|---|---|---|
| ch00_yuenv 越女剑·男 | 春秋末·越国；约前482年（原创扩展定年） | 竹青短褐、长裤、布履；椎髻布条束紧；空手 | `por_npc_zhujue__ch00_m_base` | [npc_zhujue__m_ch00.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch00.md) |
| ch00_yuenv 越女剑·女 | 春秋末·越国；约前482年（原创扩展定年） | 竹青深衣、窄布带、素履；椎髻布条固定；空手 | `por_npc_zhujue__ch00_f_base` | [npc_zhujue__f_ch00.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch00.md) |
| ch01_tianlong 天龙八部·男 | 北宋；约1093–1094年（项目推定；待考） | 灰蓝圆领袍、麻白右衽内领；软巾包髻；空手 | `por_npc_zhujue__ch01_m_base` | [npc_zhujue__m_ch01.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch01.md) |
| ch01_tianlong 天龙八部·女 | 北宋；约1093–1094年（项目推定；待考） | 灰蓝褙子、右衽衫、齐腰褶裙；素簪高髻；空手 | `por_npc_zhujue__ch01_f_base` | [npc_zhujue__f_ch01.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch01.md) |
| ch02_shediao 射雕英雄传·男 | 南宋；主体约1217–1227年（项目推定；待考），不取1199年楔子 | 灰赭右衽袍、烟青短外衣；软巾束髻；普通鞘剑 | `por_npc_zhujue__ch02_m_base` | [npc_zhujue__m_ch02.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch02.md) |
| ch02_shediao 射雕英雄传·女 | 南宋；主体约1217–1227年（项目推定；待考），不取1199年楔子 | 烟青窄袖衫、灰赭褶裙；素簪紧髻；普通鞘剑 | `por_npc_zhujue__ch02_f_base` | [npc_zhujue__f_ch02.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch02.md) |
| ch03_shendiao 神雕侠侣·男 | 南宋；约1237–1259年（项目推定；待考） | 石青右衽袍、炭灰护腕；软巾包髻；普通鞘剑 | `por_npc_zhujue__ch03_m_base` | [npc_zhujue__m_ch03.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch03.md) |
| ch03_shendiao 神雕侠侣·女 | 南宋；约1237–1259年（项目推定；待考） | 石青褙子、窄袖衫、炭灰褶裙；高髻；普通鞘剑 | `por_npc_zhujue__ch03_f_base` | [npc_zhujue__f_ch03.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch03.md) |
| ch04_yitian 倚天屠龙记·男 | 元末；主体约1336–1363年（项目推定；待考），不取约1262年序幕 | 青灰右衽长衣、护腕；素方巾束髻；普通鞘剑 | `por_npc_zhujue__ch04_m_base` | [npc_zhujue__m_ch04.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch04.md) |
| ch04_yitian 倚天屠龙记·女 | 元末；主体约1336–1363年（项目推定；待考），不取约1262年序幕 | 青灰袄、暗褐裙、平底鞋；素簪小髻；普通鞘剑 | `por_npc_zhujue__ch04_f_base` | [npc_zhujue__f_ch04.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch04.md) |
| ch05_xiaoao 笑傲江湖·男 | 明中叶；约1523年（原创扩展定年） | 浅赭直身、白护领；网巾顶髻；普通鞘剑 | `por_npc_zhujue__ch05_m_base` | [npc_zhujue__m_ch05.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch05.md) |
| ch05_xiaoao 笑傲江湖·女 | 明中叶；约1523年（原创扩展定年） | 浅赭袄、墨青马面裙；鬏髻木簪；普通鞘剑 | `por_npc_zhujue__ch05_f_base` | [npc_zhujue__f_ch05.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch05.md) |
| ch06_xiake 侠客行·男 | 明代；约1582年（原创扩展定年） | 浅灰褐直身、海青布绦；网巾方巾；空手 | `por_npc_zhujue__ch06_m_base` | [npc_zhujue__m_ch06.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch06.md) |
| ch06_xiake 侠客行·女 | 明代；约1582年（原创扩展定年） | 浅灰褐袄、海青比甲、墨灰裙；低鬏髻；空手 | `por_npc_zhujue__ch06_f_base` | [npc_zhujue__f_ch06.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch06.md) |
| ch07_bixue 碧血剑·男 | 明末；约1630–1645年（项目推定；待考），基础服装取入关前明末阶段 | 暗青直身、白护领；网巾顶髻；普通鞘剑 | `por_npc_zhujue__ch07_m_base` | [npc_zhujue__m_ch07.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch07.md) |
| ch07_bixue 碧血剑·女 | 明末；约1630–1645年（项目推定；待考），基础服装取入关前明末阶段 | 暗青袄、灰褐比甲与马面裙；鬏髻；普通鞘剑 | `por_npc_zhujue__ch07_f_base` | [npc_zhujue__f_ch07.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch07.md) |
| ch08_luding 鹿鼎记·男 | 清初·康熙；主体约1669–1690年（项目推定；待考），不取1661年序幕 | 灰褐圆领掩襟袍、烟蓝短褂；剃发细辫；空手 | `por_npc_zhujue__ch08_m_base` | [npc_zhujue__m_ch08.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch08.md) |
| ch08_luding 鹿鼎记·女 | 清初·康熙；主体约1669–1690年（项目推定；待考），不取1661年序幕 | 烟蓝汉族袄、灰褐裙；完整黑发低髻；空手 | `por_npc_zhujue__ch08_f_base` | [npc_zhujue__f_ch08.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch08.md) |
| ch09_liancheng 连城诀·男 | 本作清初·康熙；约1705–1712年（原创扩展定年） | 铁灰袍、旧青短褂；剃发细辫；普通鞘刀 | `por_npc_zhujue__ch09_m_base` | [npc_zhujue__m_ch09.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch09.md) |
| ch09_liancheng 连城诀·女 | 本作清初·康熙；约1705–1712年（原创扩展定年） | 旧青夹袄、铁灰裙、厚布鞋；低髻；普通鞘刀 | `por_npc_zhujue__ch09_f_base` | [npc_zhujue__f_ch09.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch09.md) |
| ch10_baima 白马啸西风·男 | 本作清初·回疆；约1725年（原创扩展定年） | 沙灰棉衣、毛毡披肩、软皮靴；剃发辫；空手 | `por_npc_zhujue__ch10_m_base` | [npc_zhujue__m_ch10.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch10.md) |
| ch10_baima 白马啸西风·女 | 本作清初·回疆；约1725年（原创扩展定年） | 沙灰夹袄、厚裤素裙、毛毡披肩；低髻；空手 | `por_npc_zhujue__ch10_f_base` | [npc_zhujue__f_ch10.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch10.md) |
| ch11_yuanyang 鸳鸯刀·男 | 清乾隆初；约1740年（原创扩展定年） | 暖灰赭袍、烟青短褂；剃发实辫；空手 | `por_npc_zhujue__ch11_m_base` | [npc_zhujue__m_ch11.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch11.md) |
| ch11_yuanyang 鸳鸯刀·女 | 清乾隆初；约1740年（原创扩展定年） | 暖灰赭汉族袄、烟青裙；低髻木簪；空手 | `por_npc_zhujue__ch11_f_base` | [npc_zhujue__f_ch11.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch11.md) |
| ch12_shujian 书剑恩仇录·男 | 清乾隆；约1753–1759年（项目推定；待考） | 潮青袍、浅灰短褂；剃发实辫；普通鞘剑 | `por_npc_zhujue__ch12_m_base` | [npc_zhujue__m_ch12.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch12.md) |
| ch12_shujian 书剑恩仇录·女 | 清乾隆；约1753–1759年（项目推定；待考） | 潮青汉族衫袄、浅灰裙；低髻木簪；普通鞘剑 | `por_npc_zhujue__ch12_f_base` | [npc_zhujue__f_ch12.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch12.md) |
| ch13_feihu 飞狐外传·男 | 清乾隆；约1766–1771年（项目推定；待考） | 花青袍、灰赭短褂、护腕；剃发实辫；普通鞘刀 | `por_npc_zhujue__ch13_m_base` | [npc_zhujue__m_ch13.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch13.md) |
| ch13_feihu 飞狐外传·女 | 清乾隆；约1766–1771年（项目推定；待考） | 花青袄、灰赭裙、护腕；紧实低髻；普通鞘刀 | `por_npc_zhujue__ch13_f_base` | [npc_zhujue__f_ch13.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch13.md) |
| ch14_xueshan 雪山飞狐·男 | 清乾隆·雪地；1780年（沿用项目年表；具体开篇纪年待考） | 雪灰厚棉袍、短毛领、保暖靴；剃发辫；普通鞘刀 | `por_npc_zhujue__ch14_m_base` | [npc_zhujue__m_ch14.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__m_ch14.md) |
| ch14_xueshan 雪山飞狐·女 | 清乾隆·雪地；1780年（沿用项目年表；具体开篇纪年待考） | 雪灰厚夹袄、深青厚裙、短毛领；低髻；普通鞘刀 | `por_npc_zhujue__ch14_f_base` | [npc_zhujue__f_ch14.md](../../../assets/default/prompts/characters/protagonist/npc_zhujue__f_ch14.md) |

### 7.3 书灵的设定依据与 ID

- ✅ 文件：[npc_shuling.md](../../../assets/default/prompts/characters/protagonist/npc_shuling.md)；`subject_id: npc_shuling`、`asset_id: por_npc_shuling__ch00_base`、`gender: other`、`book: ch00_yuenv`。
- ✅ P54 默认抽象墨影与对话立绘框架、P55 默认轻量网格变形已由 author-decisions 文首 G1 采纳；design/01 §5.1–§5.3 限定其为非战斗器灵，tech/07 §3.2 只规划一套。
- ✅ 首次书界不是猜测：design/01 §5.4 写序章—天龙的“记档”阶段、§8 写序章教学；design/02 §1.2 明确序章书灵苏醒。故复用 ch00，不增设独立书界。
- ✅ 固定 ID 已在基准 §12、design/01 §11.2、design/18 §13.3 登记，不使用新造备用名。上游报告中的早期“待登记”已经解决，不重复提交命名请求。
- ✅ 本稿选常态无面墨影；design/01 允许情绪激烈时显近似眉眼与袖影，本基础稿不提前制作这些差分。逗点核、弧带、月牙与折角为本次原创轮廓，未伪称原著形象。
- ✅ “框架”落实为稳定取景、纸底上清楚完整的墨影轮廓与既有 portrait 槽适配；本批生成不透明暖浅灰纸底、极淡纸纹、无文字，内部负形为纸底留白；透明母版、UI 框线、姓名文本、分层绑定和微动由下游处理。
- ⚠️ prime 是按本任务要求填入的元数据值，书灵没有人类年龄；当前一张静态提示词不等于动画或 UI 框体已经制作。

### 7.4 对照验收标准

| 验收项 | 结果与证据 |
|---|---|
| 只改授权路径 | ✅ 31 份提示词与本报告；未改基准、规划、模板、脚本、索引或图片 manifest |
| 续作检查与保留 | ✅ 本轮起始已有 31 份提示词与报告，git 显示为未跟踪产物；原文件局部修正，保留人物锚点、时代表、元数据、参考和全部旧待决项 |
| 本轮背景返修 | ✅ 每份仅改 4 个背景相关行，共 `31×4=124` 行：男稿 29/37/50/62、女稿 31/39/52/64、书灵 31/38/50/62；人工核对正负要求一致，书灵负形用纸底留白，浓淡层次保留 |
| 数量与命名 | ✅ 精确 31 份；主角 m/f 各覆盖 ch00–ch14，全部使用要求的文件名和 por_ 变体键 |
| 元数据 | ✅ 正好 11 个键，无额外字段；性别、书界、output、manifest 相互匹配；全部 prime/S/ready |
| 完整提示词 | ✅ 每份一个 text 块、一个完整段落，无占位符；四个必需正文标题、要点表、负向要求和质检清单齐全 |
| 同一性 | ✅ 两段完整锚点先写报告后逐字嵌入；每文件在表格和 prompt 各出现一次，同性别 15 份一致 |
| 时代与身份 | ✅ 春秋、宋、元、明、清逐界适配，清代七张男稿明写剃发辫发；不用官服、具名人物装束或神兵 |
| 男女风格 | ✅ 男偏写实、女偏美丽；男女同界共享道具与姿态方向，女版明确肩背力量与主动判断 |
| 书灵 | ✅ 单份 other/ch00、既有 ID、非人形无性别、非战斗；不借男女基线，不新增模型或精灵需求 |
| 参考规则 | ✅ 15 条参考均是存在的 approved 女性基线，用途仅纸底色感、光线、笔触和设色；男性与书灵为空 |
| 禁止项 | ✅ 无演员名、画师名、影视或游戏公司名、具体改编作品名；不引用外部画像。作品书名只在说明表/标题定位，不用作画风词 |
| 指定检查 | ✅ 本轮重跑 `python3 tools/agents/check_portrait_prompts.py --dir assets/default/prompts/characters/protagonist --min 31`，退出码 0，31 份全部通过；另查 124 个正文小节的背景要求一致 |
| 新 ID 查重 | ✅ 创建前全仓检索 npc_zhujue、npc_shuling 及 por_ 前缀；复用两主体，新增 31 个资产变体；本批 asset_id 与 output 唯一 |
| 原著与服饰考据 | ⚠️ 只消费已给上游，不联网新增史实；精确纪年、袖型发式与裁制未完成专项核验，无虚构引文或回目 |
| 出图与视觉一致性 | ⚠️ 按任务不出图，因此未测实际尺寸、纸底效果、墨色层次、手指、同脸相似度与审美通过率；最终透明母版尚未处理，prompt 的静态一致不能保证生成结果一致 |
| 索引与下游 | ✅ 不在本任务生成全局 INDEX.md；目录结构和 frontmatter 已可供协调者脚本读取，交接见 §6 |

### 7.5 读取的关键输入与模板版本

- `TODO.md` 的进度、已定结论、C01–C23、历史提案、作者待决与原始需求；基准 v1.8 文首变更记录、§0–§2、§12、§16、§18；author-requirements、author-decisions 的 G1/P05/P54/P55；rulings-v1 的重命名表。
- design/01 的现代身份、性别呈现、跨书心境、书灵、序章和 ID；design/02 §1 年代；design/13 §1、§3 跨书成长；design/18 §13.3 系统角色登记；tech/07 §1.3–§1.4、§2.6–§2.9、§3.2、§5.2。
- `assets/default/STYLE.md` 的作者原文与审批意见，以及本工作区男女基线 manifest 的完整提示词和状态；没有把旧报告 candidate 状态覆盖本地女性 manifest 的 approved 状态。
- 男模板读取指定路径 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R2-male/assets/default/prompts/character-male.md`；女模板读取指定路径 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/ART-R1-female/assets/default/prompts/character-female.md`，两者均存在，未回退旧版。
- 相关报告检查 B2/B2.R、R13、RT7 与 ART-B-male/ART-B-female 的角色、数量、参考与遗留事项；报告是追溯材料，当前事实以上游现文和 manifest 为准。
- 最新返修模板中的萧峰整齐头发、令狐冲浪子风动与小龙女白手套/佩剑/铃铛是其角色专属约束，未机械套到主角；仅转用风格、时代、结构和审核规则。

### 7.6 需作者确认的事项（已有默认，不等待答复）

1. 年龄感：默认男女均约 28 岁，不按书界年代增长；仅是这批成年基础立绘默认。
2. 男主面容：默认 §7.1 的方圆偏长脸与匀称结实体型，写实、有好奇心，不取萧峰或令狐冲的脸。
3. 女主面容：默认 §7.1 的利落鹅蛋脸与有力量的肩背，精致自然、主动而不娇弱，不取女性基线人物的脸。
4. 书灵形象：默认常态无面的墨核与回收弧带，既不具象成人，也不具象成鱼；框线、姓名与动画在 UI/表现管线后置。
5. 参考与首张审定：默认本稿男版无图输入、女版用获批王语嫣风格参考；主角真正跨图同一性仍需首张成图与后续并排审核。未发生本次图像生成或作者审批。
