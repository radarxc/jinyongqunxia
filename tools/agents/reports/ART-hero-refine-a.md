# ART-hero-refine-a 报告 · 主角精修 A（天龙八部～碧血剑）· 复合基线风格立绘、分时期立绘、关键剧情插图配古风题字（作者 10-02 晚，codex gpt-6-astra ultra）

## 1. 摘要（3–6 行）

- 第 5 次续作已完成 **95/95 张 candidate：15 基础、30 阶段、50 CG**；本次补入库3张（取回2张已有runner结果、新生成1张），ch01–ch07全部达到本任务最低数量。
- 原最低任务为 `15 + 15×2 + 5×8 + 2×5 = 95` 张；下文精确列出 95 个目标 ID。已正确完成的图沿用，基础同 ID 覆盖、阶段保留场景。
- 只通过授权工具箱入队，由沙箱外 runner 出图；基础复合参考、阶段新脸身份锚点、CG 题字逐字检查及实际参考 SHA 分别登记。
- 历史磁盘停止保留：第4轮于2026-10-03约01:58 PDT降至2.1 GiB，runner于01:59:05退出；追踪者随后恢复外部runner。本轮开始6.5 GiB、生成后约6.2 GiB，全程未触碰3 GB红线，未自行启动runner。

## 2. 产出（文件、行数、主要章节）

- `W` 为 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/`；研究、队列、日志、联系表和临时包装器位于W，不入素材仓库。
- 相对HEAD累计211个变更文件：95张PNG、95份提示词、19个manifest、key-scenes及本报告；提示词总9441行、manifest总21239行（包含未改旧条目，并非新增行数）；key-scenes现245行。本轮仅改3项的PNG/提示词、2份manifest及报告，共9文件。人物1024×1536，CG1536×1024，旧提示词分节保留。
- `key-scenes.md` 仅追加5行：`cg_ch01_songhe_wine_oath`、`cg_ch02_junshan_succession`、`cg_ch03_sword_tomb_training`、`cg_ch04_jiuyang_valley`、`cg_ch05_hengshan_succession`；已有行逐字不变，其余CG复用已有ID。
- W 内 `common.py` 已补 `REF["composite"]`；包装原 ingest 的工具只将归档、锁、临时补丁转至 W，每份补丁 ≤50 行，未改仓库工具源码。旧图片、条目、提示词归档保留；受保护聚贤庄三图保持先前合格字节。
- `resume/ch01-complete.json` 至 `ch07-complete.json` 与done.txt均记录逐书完成；`resume/ch07-partial-run4.json`保留停机历史。当前回执与最终校验见 `audit_support/delivery-audit.json`、`resume/final-checks-run5.json`。
- 最终联系表：`W/sheets/resume-all-base-before-after.jpg` 总览、`resume-base-before-after-1.jpg` 至 `-4.jpg` 每组≤8图、`resume-por_npc_<人物>-stages.jpg` 共15排、`resume-ch01-all-cg.jpg` 至 `ch07` 共7组。本次更新并目视核对青青一排与ch07五图组，其余已通过联系表保留。

## 3. 关键结论与数值

计数按唯一asset_id（基础/阶段/CG）：ch01 `3/6/8`、ch02 `2/4/8`、ch03 `2/4/8`、ch04 `3/6/8`、ch05 `2/4/8`、ch06 `1/2/5`、ch07 `2/4/5`，合计 `15+30+50=95`。下表95个目标均已交付；基础列均为提交前沿用ID。

| 书 | 基础（人名 / 提交前同 ID） | 分时期全 ID | CG 全 ID / 题字 | 参考版本 |
|---|---|---|---|---|
| ch01 | 萧峰 `por_npc_xiaofeng__ch01_prime_gaibang_base`；段誉 `por_npc_duanyu__ch01_youth_shizi_base`；虚竹 `por_npc_xuzhu__ch01_youth_lingjiu_base` | `por_npc_duanyu__ch01_youth_scene_langhuan_scroll`；`por_npc_duanyu__ch01_youth_scene_shaoshi_invisible_sword`；`por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard`；`por_npc_xiaofeng__ch01_prime_scene_yanmen_raise_broken_arrow`；`por_npc_xuzhu__ch01_youth_scene_lingjiu_compassion`；`por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move` | `cg_ch01_juxianzhuang_wine`「聚贤绝交」；`cg_ch01_shaoshi_three_brothers`「少室同心」；`cg_ch01_songhe_wine_oath`「松鹤豪饮」；`cg_ch01_wuliang_lingbo`「无量微步」；`cg_ch01_xiaojinghu_azhu`「镜湖回生」；`cg_ch01_xingzilin_reveal`「杏林惊变」；`cg_ch01_yanmen_life_for_life`「雁门换命」；`cg_ch01_zhenlong_break`「珍珑破局」 | 萧峰：1997 TVB；黄日华，HDGRP_51-1.png；段誉：1997 TVB；陈浩民，HDGRP_54-1.png；虚竹：1997 TVB；樊少皇，HDGRP_50-1.png |
| ch02 | 郭靖 `por_npc_guojing__ch02_youth_base`；黄蓉 `por_npc_huangrong__ch02_youth_bangzhu_base` | `por_npc_guojing__ch02_youth_scene_grassland_double_eagle`；`por_npc_guojing__ch02_youth_scene_peach_island_square_circle`；`por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader`；`por_npc_huangrong__ch02_youth_scene_young_beggar_disguise` | `cg_ch02_beiwuzhaoqin`「比武招亲」；`cg_ch02_grassland_eagles`「弯弓射雕」；`cg_ch02_guorong_first_meet`「张垣初逢」；`cg_ch02_huashan_discourse`「华山论剑」；`cg_ch02_ironspear_truth`「铁枪辨冤」；`cg_ch02_junshan_succession`「轩辕夺棒」；`cg_ch02_niujia_snow`「牛家风雪」；`cg_ch02_peach_island_trials`「桃岛三试」 | 郭靖：1983 TVB；黄日华，HDGRP_56-1.png；黄蓉：1994 TVB；朱茵，HDGRP_57-1.png |
| ch03 | 杨过 `por_npc_yangguo__ch03_youth_onearm_base`；小龙女 `por_npc_xiaolongnv__ch03_youth_jueqing_base` | `por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson`；`por_npc_xiaolongnv__ch03_youth_scene_valley_jade_bee_message`；`por_npc_yangguo__ch03_prime_scene_sixteen_years_valley_reunion`；`por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff` | `cg_ch03_chongyang_swords`「重阳同心」；`cg_ch03_dashengguan_heroes`「大胜群英」；`cg_ch03_heartbreak_message`「十六年约」；`cg_ch03_sword_tomb_training`「重剑无锋」；`cg_ch03_tomb_acceptance`「古墓相依」；`cg_ch03_valley_reunion`「谷底重逢」；`cg_ch03_xiangyang_flying_stone`「飞石靖难」；`cg_ch03_xiangyang_gift`「襄阳献礼」 | 杨过：1995 TVB；古天乐，HDGRP_59-1.png；小龙女：1995 TVB；李若彤，HDGRP_60-1.png |
| ch04 | 张无忌 `por_npc_zhangwuji__ch04_youth_jiaozhu_base`；赵敏 `por_npc_zhaomin__ch04_youth_lvliu_base`；周芷若 `por_npc_zhouzhiruo__ch04_youth_zhangmen_base` | `por_npc_zhangwuji__ch04_youth_scene_jiuyang`；`por_npc_zhangwuji__ch04_youth_scene_sandu`；`por_npc_zhaomin__ch04_youth_scene_haozhou`；`por_npc_zhaomin__ch04_youth_scene_lvliu`；`por_npc_zhouzhiruo__ch04_youth_scene_guangmingding`；`por_npc_zhouzhiruo__ch04_youth_scene_shaolin` | `cg_ch04_guangming_peak`「光明止戈」；`cg_ch04_haozhou_wedding`「濠州惊变」；`cg_ch04_jiuyang_valley`「幽谷九阳」；`cg_ch04_lingshe_farewell`「灵蛇别梦」；`cg_ch04_lvliu_footplay`「绿柳初逢」；`cg_ch04_vajra_circle`「金刚伏魔」；`cg_ch04_wanan_fire_rescue`「火塔救群雄」；`cg_ch04_wudang_taiji`「太极初传」 | 张无忌：2003；苏有朋，HDGRP_10-1.png；赵敏：2003；贾静雯，作者游戏封面；周芷若：2003；高圆圆，作者游戏封面 |
| ch05 | 令狐冲 `por_npc_linghuchong__ch05_youth_huashan_base`；任盈盈 `por_npc_renyingying__ch05_youth_shenggu_base` | `por_npc_linghuchong__ch05_youth_scene_hengshan`；`por_npc_linghuchong__ch05_youth_scene_siguoya`；`por_npc_renyingying__ch05_youth_scene_quxie`；`por_npc_renyingying__ch05_youth_scene_zhuxiang` | `cg_ch05_blackwood_showdown`「黑木决战」；`cg_ch05_hengshan_succession`「恒山承责」；`cg_ch05_hengyang_score`「琴箫托谱」；`cg_ch05_luoyang_qinxiao`「绿竹知音」；`cg_ch05_meizhuang_duet`「琴箫曲谐」；`cg_ch05_meizhuang_prison`「梅庄换囚」；`cg_ch05_shaolin_three_bouts`「少林三战」；`cg_ch05_siguoya_sword`「思过悟剑」 | 令狐冲：1996 TVB；吕颂贤，作者游戏封面；任盈盈：1996 TVB；梁佩玲（梁艺龄），作者游戏封面 |
| ch06 | 石破天 `por_npc_shipotian__ch06_youth_jinwu_base` | `por_npc_shipotian__ch06_youth_scene_motianya`；`por_npc_shipotian__ch06_youth_scene_taixuan` | `cg_ch06_changle_truth`「真假帮主」；`cg_ch06_laba_porridge`「腊八赴约」；`cg_ch06_motian_mudfigures`「摩天传薪」；`cg_ch06_taixuan_unlettered`「石壁悟玄」；`cg_ch06_xuantie_token`「玄铁奇缘」 | 石破天：作者指定《金庸群侠传》游戏头像；不用剧照，HDGRP_39-1.png |
| ch07 | 袁承志 `por_npc_yuanchengzhi__ch07_youth_jinshe_base`；温青青 `por_npc_wenqingqing__ch07_youth_disguise_base` | `por_npc_wenqingqing__ch07_youth_scene_shiliang`；`por_npc_wenqingqing__ch07_youth_scene_yuexiao`；`por_npc_yuanchengzhi__ch07_youth_scene_jinshedong`；`por_npc_yuanchengzhi__ch07_youth_scene_shengjing` | `cg_ch07_chongzheng_cannon`「剑动盛京」；`cg_ch07_golden_serpent_cave`「金蛇遗藏」；`cg_ch07_liyan_rescue`「碧血留人」；`cg_ch07_taishan_alliance`「泰山聚义」；`cg_ch07_xueyi_wenyi_memory`「金蛇旧梦」 | 袁承志：1985 TVB；黄日华，HDGRP_55-1.png；温青青：1985 TVB；庄静而，作者游戏封面 |

逐张参考的精确取值：以上 ID 对应当前提示词 frontmatter 的 `reference_upload` 顺序与 `references[].path/sha256`，同 ID manifest 保存产物 SHA、输入列表及 notes；不把源剧照路径当成实际上传件。`W/reference-inventory.json` 和各来源 `SOURCES.md` 提供演员版本 / 原件，`W/resume/refs/` 为裁切或放大件；游戏头像长边 ≥448，作者封面为 `author-20261002/linghuchong_game_cover_wuyuejianpai.png`。表中演员名只用于溯源，不进入生成提示词。
基础按“影视造型→游戏画风→同性别两基线”上传（石破天按作者要求无剧照）；阶段首张为本轮该人新基础，再接造型/游戏参考与两基线。CG仅上传主角、S级与获授权玩家身份，其他人用文字；超过3件身份时第3件为联系图，源文件与左右格位见同名JSON，实际上传件SHA见frontmatter/manifest。
本次逐张实际参考：石梁r2＝温青青新base→庄静而版剧照裁切→作者游戏封面放大件→女性两基线；盛京＝袁承志新盛京阶段→温青青新base→程青竹／玉真子既有S级联系图→男性两基线；金蛇旧梦＝新版石梁r2→既有S级夏雪宜→女性两基线，温仪仅文字。每件实际上传路径及SHA见各提示词与manifest。
已入库50张CG均放大逐字检查、原生题字，字体叠加0张。实际字形含「襄陽献礼」「幽谷九陽」「恒山承責」「金蛇遺藏」「劍動盛京」，对应manifest如实记录；「金蛇旧梦」为简体，其他同表列题名。
已入库资产中15个资产视觉重出共16次，其他已入库资产为0，初次生成不计。青青石梁首图因阶段服装差异不足拒收，r2成功且本轮已接收入库；本轮新生成金蛇旧梦一次成功、没有新增重出。最初萧峰3次路由失败另属技术失败。

| 书 | 发生重出的 asset_id / 次数 / 原因 |
|---|---|
| ch02 | `cg_ch02_huashan_discourse` 1：欧阳锋误老化；`cg_ch02_ironspear_truth` 1：柯镇恶须发；`cg_ch02_niujia_snow` 1：丘处机应三十余岁；`cg_ch02_peach_island_trials` 2：第三试回归背诵经文，去无据机关方块。 |
| ch03 | `cg_ch03_sword_tomb_training` 1：神雕补血红肉冠；`cg_ch03_xiangyang_flying_stone` 1、`cg_ch03_xiangyang_gift` 1：郭黄中年与郭襄代际。 |
| ch04 | `por_npc_zhaomin__ch04_youth_lvliu_base` 1：纠正女装为书生男装；`por_npc_zhaomin__ch04_youth_scene_lvliu` 1、`por_npc_zhaomin__ch04_youth_scene_haozhou` 1：同步新基础；`cg_ch04_guangming_peak` 1：清除额外佛字；`cg_ch04_wudang_taiji` 1：张三丰左手木剑。 |
| ch05 | `cg_ch05_shaolin_three_bouts` 1：清除题名以外额外佛字。 |
| ch06 / ch07 | `cg_ch06_changle_truth` 1：去掉背景额外字徽；`por_npc_wenqingqing__ch07_youth_scene_shiliang` 1：女装襦裙／素帕／门庭晨光区别月下男装吹箫；其余ch07资产重出0。 |

参考资料（访问 2026-10-02～03）：七书联网搜索与本地 story / chapters 对照见 `W/research-ch01-03.md`、`research-ch04-07.md` 及 `prep_ch02_04/`、`prep_ch05_07/`；网络转载只核对具体剧情，不代替三联 / 广州纸本逐字终校。射雕 / 神雕关键动作、阶段差异及配角年龄的重出理由均已保留。
剧情补核：[笑傲第29章掌门](https://www.99csw.com/book/2176/64098.htm)、[第40章曲谐](https://www.99csw.com/book/2176/64109.htm)；[三联《金庸小说里的中国文学》试读](https://www.jointpublishing.com/wp-content/uploads/2024/10/9789620449215-text.pdf)支持侠客不识字悟形；[碧血第4回](https://m.gulongbbs.com/jinyong/bxj/2935.htm)核铁盒与再访取剑、[第13回修订版转载](https://www.jinyongwx.com/bi/774_2.html)核泰山会盟与李岩时序、[第14回](https://read.99csw.com/book/2184/64949.html)核青青城外等候。碧血网络版十三 / 十四岁异文与布景动作保留（待考），新提示词不写精确年龄。
本轮补核（访问2026-10-03）：[碧血第十四回](https://read.99csw.com/book/2184/64949.html)支持青青城外等候；[修订版目录与叙事说明](https://www.jinyongwx.com/bi/)辅助核对追忆结构。第六、七回指定转载子页本次抓取失败，未声称重新逐字核验；沿前轮研究与story/07，具体追忆动作仍（待考），详见 `W/resume/run5-research.md`。
技术事实沿用旧实测与来源：[Codex配置](https://learn.chatgpt.com/docs/config-file/config-reference)、[错误恢复](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery)（首轮访问2026-10-02）；CLI 0.159.0 为首轮实测，不宣称当前最新版。外部 runner 可成功生成，首轮 routing 错误根因仍未知，长期稳定性（待实测）；本次无新增价格、额度、浏览器兼容性承诺。

## 4. 开放问题（附默认值）

- 已解决：首轮路由故障及第4轮磁盘阻断已解除，95张均已验；停机与追踪者续跑历史保留。本轮仅通过授权队列新提交金蛇旧梦，外部runner 120秒成功，未发生限流。
- 小昭、白阿绣、阿九有 S 级图且承担女主线；默认按用户明确列出的 15 位主角实施每人两阶段，不扩全部 S 级。三人既有图仅在适合的 CG 引用；未来扩精修需作者确定范围，不报告为名录缺人。
- 郭靖 / 黄蓉襄阳中年默认归 ch03，由 ch02 新脸自然增龄；杨过全真 / 古墓早年成年化回忆标原创美术处理，既有 child 阶段保留且不计入本轮。未选择的既有阶段保持旧图，不冒称已按新脸全量重出。
- 带玩家的改命 CG 默认仅引用既有玩家图，不修改 `npc_zhujue`；阿朱获救、雁门换命、李岩获救明确原创改命。严谨原著考据与审美最终批准仍由作者终审，candidate 不等于 approved。

- 已解决：返修3项全部入库。石梁采用新base为首参的r2，盛京采用既有成功resume3，金蛇旧梦在石梁入库后才生成；拒收r1留在W/out。默认保留candidate：石梁发髻偏高、盛京金蛇剑曲折及分叉尖不明显，属轻微美术偏差，供作者终审。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。制作范围、图像执行和旧名录同步不需改 Canon。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容与默认处理（本轮未越权修改） |
|---|---|
| 执行环境 / ingest | 已解决：外部 runner 正常出图、W 包装器重定向锁和归档，未改原工具源码；长期通用改造仍交工具维护任务。首轮 routing 根因未确认。 |
| `key-scenes.md` §0、§16–17 | 旧每书恰 7 / 合计 102、只允许 approved 参考，与 AR-36 候选生产及追加五行后的数量不同；协调者另行同步。本任务只追加表行，不改旧统计或门禁定义。 |
| `key-scenes.md` ch01 | 聚贤庄现为新基础 / 新阶段 / 阿朱 S 图 / 两基线及题字；旧表顺序与无字口径须同步。雁门已有 `story/sleep-events.md` §3.2 `slp_01_yiminghuanyiming`，旧等待标记需改已解决。 |
| `key-scenes.md` ch02 / ch03 | 张家口先乞儿装，勿混后来揭晓；桃岛第三试背诵经文，勿画机关拼块；重阳杨过已断右臂；三礼不是普通礼盒，留书与发现分时层；郭黄中年与郭襄保持代际。 |
| `key-scenes.md` ch04 / ch05 | 张三丰教剑的左手道具、万安寺救人先后按提示词核对；结局令狐冲抚琴、盈盈吹箫；梅庄换囚不画清醒目送；少林是偏殿三战，不能误画令狐冲连打三人。 |
| `key-scenes.md` ch06 / ch07 | 长乐揭伪应为李四掷凳破顶、石中玉落入厅内；十八泥人不是烧饼藏令同场；金蛇洞取成年再访、铁盒，不画初探时青青在场或夏雪宜实体鬼魂；泰山李岩 / 红娘子、盛京青青 / 程青竹分置回忆层，连续动作并置须标原创构图；李岩获救为 AR-20。 |
| `story/07` §2.2 | “十四岁发现铁盒，约十年后艺成下山”易误读为发现后另过十年；应明确在华山总学艺约十年后下山。网络第四回有十三 / 十四岁异文，具体发现年龄按三联 / 广州纸本复核，本次不擅改时间轴。 |
| `design/18`、`catalog/npcs-ch03-*` | 保留前轮初查疑点：孙婆婆、蒙哥是否缺正式人物 ID 交人物任务全仓复核，未证实前不新建；扫地僧已在 ch01，已解决。小昭 / 阿绣 / 阿九属于范围取舍。 |
| 人物参考记录 | 已解决：当前黄蓉采用朱茵复合参考；旧翁美玲字段仅应留历史。郭靖 / 杨过被撤回未核验照片不回用；杨过可用文件沿旧核验，但独立 source JSON 追溯仍需来源维护者补证。 |
| 素材参考与人物元数据 | 已恢复72个W/out引用至SHA匹配原归档；12个淘汰旧尝试原字节未找回，均非当前引用。11份CG提示词出场清单已按实际画面修正；ch05另修5个身份参考用途误标。报告不把这些列为新出图。 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 已读工作规范、作者要求和上游相关节；七书研究、15 人参考审计与既有失败证据保留；续作只补剩余项，没有重新生成已正确保护三图。
- ✅ ch01–ch07逐书完成且done齐全；95个已入库资产的尺寸、PNG/参考SHA、实际提示词、上传顺序、frontmatter通过专项核验，errors=0、warnings=0。
- ✅ 95图均为candidate；基础复合参考，阶段首图锁定新脸并保留背景；CG只上传授权身份。50张题字已目视核验、全部原生未叠加；本轮两CG已放大逐字检查并登记繁简字形。
- ✅ 无提问、无改变仓库状态的git命令、未启动runner、未改仓库tools源码、未跑两个portrait构建脚本；素材补丁≤50行，报告≤100行。累计211个变更全部在写集内，无删除；本轮除3项返修及其元数据、报告外，已有成果字节未动。
- ✅ 已入库版本联系表共27张（总览1、基础分组4、人物阶段15、CG7）；青青base＋两时期、ch07五CG均已补齐并检查，未混用旧版石梁图凑数。
- ✅ `python3 tools/agents/check_asset_dirs.py "assets/default/character/*/ch0[1-7]" --min 1 --max 999`：退出0，14目录、333张、问题0；其中本任务精修45张，其余不计本轮成果。
- ✅ `python3 tools/agents/check_asset_dirs.py "assets/default/scene/ch0[1-7]" --min 1 --max 999`：退出0，7目录、50张、问题0；每书8/8/8/8/8/5/5，全部满足要求。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出0，strict failure count=0；既有未定义 `sk_babuganchan` 1项由baseline豁免，无新增ID错误。
- ✅ 最终95/95，3项返修均闭合；⚠️原著纸本终校、三名女主扩展、未选旧阶段范围及两处轻微造型偏差保留在§4、§6，candidate仍待作者最终审美批准。
