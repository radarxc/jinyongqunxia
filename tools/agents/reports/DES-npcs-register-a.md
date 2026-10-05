# DES-npcs-register-a 报告 · 名录补登记 A（ch01–ch07）· 人物补齐发现的原著主要人物登记进各书名录与 design/18（AR-36 前置）
## 1. 摘要（3–6 行）
已把 ART-cast-fill-a C 类清单的 71 个书籍—人物项完整登记到 ch01–ch07 名录，并在 `design/18` §13.6 建立同量人物键。
七册补充索引均含身份、性别 / 年龄段、S/A/B 制作层级、出场、2–3 个面部辨识点与衣饰、D 级招募、结局 / 跨书；未核原著细节保留（待考），玩法补足标（原创扩展）。
跨书同人复用 `npc_yinggu`、`npc_qiuchuji`、`npc_hezudao`、`npc_guisong`；倚天 5 人复用 `design/18` §13.4 主记录。
`check_ids.py --strict` 退出 0、新增严格失败 0；未生成提示词或图片。
## 2. 产出（文件、行数、主要章节）
- `docs/design/18-npc-and-companions.md`（1864 行）：v1.4；新增 §13.6 七书 71 项，更新 §0、§11、§13.3、§14、§15 的实盘统计与依赖。
- 七册名录（117/144/116/109/104/93/114 行）：各新增“AR-36 主要人物补充索引”；版本依次为 v1.5/v1.5/v1.5/v1.5/v1.5/v1.5/v1.6。
- `tools/agents/reports/DES-npcs-register-a.md`：42 行，本报告。
## 3. 关键结论与数值
- ch01 10：`npc_kangmin`、`npc_madayuan`、`npc_quanguanqing`、`npc_yelvhongji`、`npc_menggu`、`npc_liqingluo`、`npc_qinhongmian`、`npc_ganbaobao`、`npc_ruanxingzhu`、`npc_zhongwanchou`。
- ch02 9：`npc_guoxiaotian`、`npc_liping`、`npc_yinggu`、`npc_shagu`、`npc_qiuqianzhang`、`npc_wangchongyang`、`npc_penglianhu`、`npc_liangziweng`、`npc_shatongtian`。
- ch03 10：`npc_yinzhiping`、`npc_zhaozhijing`、`npc_honglingbo`、`npc_sunpopo`、`npc_guopoluo`、`npc_yinkexi`、`npc_qiuchuji`、`npc_hubilie`、`npc_mengge`、`npc_yinggu`。
- ch04 12：`npc_huqingniu`、`npc_wangnangu`、`npc_jixiaofu`、`npc_yangbuhui`、`npc_yinliting`、`npc_moshenggu`、`npc_dingminjun`、`npc_xianyutong`、`npc_zhuchangling`、`npc_huangshannvzi`、`npc_hezudao`、`npc_chenyouliang`。
- ch05 16：`npc_laodenuo`、`npc_ludayou`、`npc_linzhennan`、`npc_qufeiyan`、`npc_tianmen`、`npc_dingyi`、`npc_dingjing`、`npc_bujie`、`npc_huangzhonggong`、`npc_heibaizi`、`npc_tubiweng`、`npc_danqingsheng`、`npc_dingmian`、`npc_lubai`、`npc_feibin`、`npc_yanglianting`。
- ch06 6：`npc_fanyifei`、`npc_fengliang`、`npc_lvzhengping`、`npc_gaosanniangzi`、`npc_chengzixue`、`npc_huawanzi`。
- ch07 8：`npc_luoliru`、`npc_wenfangshan`、`npc_wenfangwu`、`npc_andaniang`、`npc_guisong`、`npc_hongshenghai`、`npc_huguinan`、`npc_mengbofei`。
- 核算：`10+9+10+12+16+6+8=71` 项、70 个批内唯一 ID；相对既有目录新增 67 个唯一人物与 4 个复用索引。全目录现为主表 `441=413+28`、补充 `71=67+4`，合计 `512=480+32`。
## 4. 开放问题（附默认值）
- 71 项回目、命运时点、部分身份 / 跨书存在性与原著衣貌待按三联 / 广州修订版逐字核对；默认保留“回目待考”与 `unknown`，外貌补足继续标（原创扩展）。
- 王重阳默认只做前史 / 投影；儿童与命定死亡人物默认只在保护、前史或独立改命窗同行；登记本身不代表救援或任务已实现。
- S/A/B 为美术制作层级、D1–D5 为招募难度；默认永不互换或据此推断战力。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无新增；沿用 `design/18` 既有 N18-P01～P04。本任务仅登记人物与统计，不修改 `docs/00-canon.md`。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 下一波 ART-cast-fill 新建提示词与立绘（格式均为 `ID / 书 / 性别 / 层级`）：
- ch01：`npc_kangmin`/天龙/女/A；`npc_madayuan`/天龙/男/A；`npc_quanguanqing`/天龙/男/A；`npc_yelvhongji`/天龙/男/A；`npc_menggu`/天龙/女/A；`npc_liqingluo`/天龙/女/A；`npc_qinhongmian`/天龙/女/A；`npc_ganbaobao`/天龙/女/A；`npc_ruanxingzhu`/天龙/女/A；`npc_zhongwanchou`/天龙/男/A。
- ch02：`npc_guoxiaotian`/射雕/男/A；`npc_liping`/射雕/女/A；`npc_yinggu`/射雕/女/A；`npc_shagu`/射雕/女/B；`npc_qiuqianzhang`/射雕/男/B；`npc_wangchongyang`/射雕/男/A；`npc_penglianhu`/射雕/男/B；`npc_liangziweng`/射雕/男/B；`npc_shatongtian`/射雕/男/B。
- ch03：`npc_yinzhiping`/神雕/男/A；`npc_zhaozhijing`/神雕/男/A；`npc_honglingbo`/神雕/女/A；`npc_sunpopo`/神雕/女/A；`npc_guopoluo`/神雕/男/A；`npc_yinkexi`/神雕/男/A；`npc_qiuchuji`/神雕/男/A；`npc_hubilie`/神雕/男/A；`npc_mengge`/神雕/男/A；`npc_yinggu`/神雕/女/A。
- ch04：`npc_huqingniu`/倚天/男/A；`npc_wangnangu`/倚天/女/A；`npc_jixiaofu`/倚天/女/A；`npc_yangbuhui`/倚天/女/A；`npc_yinliting`/倚天/男/A；`npc_moshenggu`/倚天/男/A；`npc_dingminjun`/倚天/女/B；`npc_xianyutong`/倚天/男/A；`npc_zhuchangling`/倚天/男/A；`npc_huangshannvzi`/倚天/女/A；`npc_hezudao`/倚天/男/A；`npc_chenyouliang`/倚天/男/A。
- ch05：`npc_laodenuo`/笑傲/男/A；`npc_ludayou`/笑傲/男/A；`npc_linzhennan`/笑傲/男/A；`npc_qufeiyan`/笑傲/女/A；`npc_tianmen`/笑傲/男/A；`npc_dingyi`/笑傲/女/A；`npc_dingjing`/笑傲/女/A；`npc_bujie`/笑傲/男/A；`npc_huangzhonggong`/笑傲/男/A；`npc_heibaizi`/笑傲/男/B；`npc_tubiweng`/笑傲/男/B；`npc_danqingsheng`/笑傲/男/B；`npc_dingmian`/笑傲/男/B；`npc_lubai`/笑傲/男/B；`npc_feibin`/笑傲/男/A；`npc_yanglianting`/笑傲/男/A。
- ch06：`npc_fanyifei`/侠客/男/B；`npc_fengliang`/侠客/男/B；`npc_lvzhengping`/侠客/男/B；`npc_gaosanniangzi`/侠客/女/A；`npc_chengzixue`/侠客/男/A；`npc_huawanzi`/侠客/女/B。
- ch07：`npc_luoliru`/碧血/男/B；`npc_wenfangshan`/碧血/男/A；`npc_wenfangwu`/碧血/男/B；`npc_andaniang`/碧血/女/A；`npc_guisong`/碧血/男/A；`npc_hongshenghai`/碧血/男/B；`npc_huguinan`/碧血/男/B；`npc_mengbofei`/碧血/男/B。
- story / chapters / 数据实现：后续按各人 D 级补正式任务引用、`full` 画像、生命轴与窗口；本任务未越权修改。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 上游 C 类与七册补充索引集合逐 ID 比对：71/71，缺失 0、额外 0、重复次数差 0；§13.6 亦为 71 行。
- ✅ 71 行九列表格无空字段；制作层级 A51/B20，性别男48/女23；主角亲属与大反派未低于 A。
- ✅ 新建键均为 `npc_*`；跨书 / 既有主记录按同人复用；未新建武学、任务、门派 ID。
- ✅ `python3 tools/lint/check_ids.py --strict` 退出 0：新增严格失败 0；仅报告基线已知 `sk_babuganchan`。
- ✅ 修改范围仅八份获准文档与本报告；未执行改变仓库状态的 git 命令。
- ⚠️ 原著逐字考据、正式任务 / 数值画像与提示词 / 立绘仍未制作，均已在 §4 / §6 如实交办。
