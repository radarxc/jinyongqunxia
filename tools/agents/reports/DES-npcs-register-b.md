# DES-npcs-register-b 报告 · 名录补登记 B（ch08–ch14）· 人物补齐发现的原著主要人物登记进各书名录与 design/18（AR-36 前置）
## 1. 摘要（3–6 行）
已把 ART-cast-fill-b C 类清单的 39 个书籍—人物项登记到 ch08–ch14 七册补充名录，并在 `design/18` §13.7 建立同量人物键。
七册均含身份、性别 / 年龄段、A/B 制作层级、出场、面部辨识点与衣饰、D 级招募、结局 / 跨书；未核事实保留（待考），玩法和补足形象均标（原创扩展）。
本批为 33 个新身份 + 6 个既有身份复用；跨书同人不拆 ID，前史人物不在主体年代无因生成活体。
本轮按审核收窄 `design/18`：恢复全部无关既有行，仅保留 v1.5、§13.7 与纯新增校验 NPC-V23。
## 2. 产出（文件、行数、主要章节）
- `docs/design/18-npc-and-companions.md`：升 v1.5；净增 81 行（版本行替换 1 行，新增变更记录、§13.7 七书 39 项与 NPC-V23）；未替换其他既有行。
- 七册补充名录：`npcs-08-luding.md` 60 行、`npcs-09-liancheng.md` 45 行、`npcs-10-baima.md` 44 行、`npcs-11-yuanyang.md` 44 行、`npcs-12-shujian.md` 47 行、`npcs-13-feihu.md` 53 行、`npcs-14-xueshan.md` 48 行。
- `tools/agents/reports/DES-npcs-register-b.md`：本报告，不超过 50 行。
## 3. 关键结论与数值
- ch08 16：`npc_weichunhua08`、`npc_duolong`、`npc_suoetu`、`npc_fengjizhong`、`npc_lilishi`、`npc_liudahong`、`npc_wulishen`、`npc_liuyizhou`、`npc_maodongzhu`、`npc_lugaoxuan`、`npc_pangtoutuo`、`npc_shoutoutuo`、`npc_taohongying`、`npc_huyizhi`、`npc_wuyingxiong`、`npc_hetieshou`。
- ch09 2：`npc_shanyong`、`npc_shengdi`；ch10 1：`npc_yalixian`；ch11 1：`npc_yangbochong`。
- ch12 4：`npc_mazhen`、`npc_likexiu`、`npc_zhoudanainai`、`npc_tongzhaohe`。
- ch13 10：`npc_wuchen13`、`npc_jiangtieshan`、`npc_jiangxiaotie`、`npc_yuanyingu`、`npc_wanhesheng`、`npc_chenyu`、`npc_liuhezhen`、`npc_shangjianming`、`npc_wangweiyang`、`npc_luobing`。
- ch14 5：`npc_lizicheng`、`npc_mazhaizhu14`、`npc_xuanmingzi`、`npc_lingqingjushi`、`npc_jianglaoquanshi`。
- 核算：`16+2+1+1+4+10+5=39` 项，男 31 / 女 8，A 25 / B 14；本批 39 行由 35 个目录新唯一人物与 4 条跨书复用行组成。
- 复用 6：`npc_fengjizhong`、`npc_maodongzhu`、`npc_hetieshou`、`npc_wangweiyang`、`npc_luobing`、`npc_lizicheng`；前两项此前仅有 §13.4 主记录，故 39 项对应 35 个目录新唯一键。
## 4. 开放问题（附默认值）
- 39 项的回目、姓名字形、部分身份 / 命运 / 跨书存在性与原著衣貌待三联 / 广州修订版逐字核对；默认保留“回目待考”与 `unknown`，不据建议 ID 反推事实。
- 姜小铁默认维持幼童、非战斗并暂缓出图；雅丽仙、杨伯冲、袁银姑、商剑鸣、李自成等默认只作前史 / 史笺，除独立改命时代外不生成主体年代活体。
- 七份文件按本任务机器写集以 `npcs-08`～`npcs-14` 补充名录落盘；默认与 `npcs-ch08`～`npcs-ch14` 主表并列，不占 20–40 配额，后续是否合并由目录归属任务决定。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无新增；沿用 `design/18` 既有 N18-P01～P04。本任务只登记人物、统计和校验规则，不修改 `docs/00-canon.md`。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 下一波 ART-cast-fill 新建提示词与立绘（格式 `ID/书/性别/层级`；以下 38 项先排产）：
- ch08：`npc_weichunhua08`/鹿鼎/女/A；`npc_duolong`/鹿鼎/男/A；`npc_suoetu`/鹿鼎/男/A；`npc_fengjizhong`/鹿鼎/男/A；`npc_lilishi`/鹿鼎/男/B；`npc_liudahong`/鹿鼎/男/B；`npc_wulishen`/鹿鼎/男/B；`npc_liuyizhou`/鹿鼎/男/A；`npc_maodongzhu`/鹿鼎/女/A；`npc_lugaoxuan`/鹿鼎/男/B；`npc_pangtoutuo`/鹿鼎/男/B；`npc_shoutoutuo`/鹿鼎/男/B；`npc_taohongying`/鹿鼎/女/A；`npc_huyizhi`/鹿鼎/男/A；`npc_wuyingxiong`/鹿鼎/男/A；`npc_hetieshou`/鹿鼎/女/A。
- ch09：`npc_shanyong`/连城/男/B；`npc_shengdi`/连城/男/B；ch10：`npc_yalixian`/白马/女/A；ch11：`npc_yangbochong`/鸳鸯/男/A。
- ch12：`npc_mazhen`/书剑/男/A；`npc_likexiu`/书剑/男/A；`npc_zhoudanainai`/书剑/女/A；`npc_tongzhaohe`/书剑/男/B。
- ch13：`npc_wuchen13`/飞狐/男/A；`npc_jiangtieshan`/飞狐/男/A；`npc_yuanyingu`/飞狐/女/A；`npc_wanhesheng`/飞狐/男/A；`npc_chenyu`/飞狐/男/B；`npc_liuhezhen`/飞狐/男/A；`npc_shangjianming`/飞狐/男/A；`npc_wangweiyang`/飞狐/男/A；`npc_luobing`/飞狐/女/A。
- ch13 暂缓：`npc_jiangxiaotie`/飞狐/男/A；待幼童保护与年龄形象确认后仍须新建提示词 / 立绘，不从清单删除。
- ch14：`npc_lizicheng`/雪山/男/A；`npc_mazhaizhu14`/雪山/男/B；`npc_xuanmingzi`/雪山/男/B；`npc_lingqingjushi`/雪山/男/B；`npc_jianglaoquanshi`/雪山/男/B。
- story / chapters / 数据实现：按 D 级补正式任务引用、`full` 画像、生命轴与窗口；`npcs-ch08-luding.md` 的旧风际中槽须绑定同一 ID；本任务未越权修改。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ ART C 类、七册补充名录与 §13.7 逐 ID 比对为 39/39，缺失 0、额外 0；各书行数 16/2/1/1/4/10/5，八列表格无空字段。
- ✅ 新建键均为 `npc_*`；复用同人不拆 ID；主角亲属与主要反派不低于 A；全批 A25/B14、男31/女8。
- ✅ 七册写完均曾运行严格校验；最终 `python3 tools/lint/check_ids.py --strict` 退出 0，新增严格失败 0，仅报告基线 `sk_babuganchan`。
- ✅ 修改范围仅九份获准文档；围栏成对、无占位语，未执行改变仓库状态的 git 命令。
- ✅ 合入前返修已恢复 §0、§11、§13.4/§13.6、§14 既有行及 §15 既有待决项；最终 `design/18` diff 只含审核允许的新增内容。
- ⚠️ 原著逐字考据、正式任务 / 数值画像与 39 份提示词 / 立绘仍未制作；姜小铁在 ART 阶段默认暂缓。
