# ART-cast-fill-d 报告 · 新登记人物立绘 D（鹿鼎记～雪山飞狐（ch08–ch14））· DES-npcs-register 新增、还没有立绘的人物按名单补提示词与立绘（AR-47；codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

39 项均已登记提示词：38 张基础立绘完成生成、联系表质检与入库，姜小铁 1 项按要求 hold，不入队、不出图。
38 张均为 1024×1536 PNG、candidate；34 张文字＋两张同性别基线，4 张本人跨书锚点＋两张同性别基线；未下载或上传剧照。
外部 worker23 runner 执行，模型 / 推理日志为 gpt-6-astra / xhigh；实际服从共享 SLOTS 限速。质检重出 0 次，限流 0 次。
原著待考与原创衣貌补足均保留，前史立绘不推导为主体年代活体；未改已有角色图、索引或设计文档。
## 2. 产出（文件、行数、主要章节）

- 提示词 39 份共 2774 行：位于七书获准 prompts 目录；含 Gemini 提示词、人物要点、排除项、质检要点、参考与考据、待决事项。
- 新增 PNG 38 张（男 30 / 女 8），合计 93.8 MiB；10 个 manifest 只追加 38 条 / 1886 行，既有 14 份 manifest 的原字节前缀全部保留。
- 工作账本 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w23/done.txt`；批次联系表 `sheets/batch_01.jpg`～`batch_05.jpg`；总表 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w23/sheets/final_all.jpg`；身份对照 `sheets/final_identity_comparison.jpg`。
## 3. 关键结论与数值

按书核算：16+2+1+1+4+9+5=38 张；A24/B14；另 A1 姜小铁 hold。表中“文字”均为 ref=text，“跨书锚点”均先上传本人缩小 JPEG，再上传两张同性别基线。

| 书 | asset_id | 参考方式 | 重出次数 | 结果 / 跳过原因 |
|---|---|---|---:|---|
| ch08 | `por_npc_weichunhua08__ch08_prime_city_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_duolong__ch08_prime_guard_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_suoetu__ch08_prime_court_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_fengjizhong__ch08_prime_undercover_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_lilishi__ch08_prime_lodge_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_liudahong__ch08_elder_mufu_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_wulishen__ch08_prime_mufu_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_liuyizhou__ch08_youth_mufu_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_maodongzhu__ch08_prime_dowager_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_lugaoxuan__ch08_prime_shenlong_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_pangtoutuo__ch08_prime_drugchanged_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_shoutoutuo__ch08_prime_drugchanged_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_taohongying__ch08_elder_palace_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_huyizhi__ch08_prime_travel_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_wuyingxiong__ch08_youth_heir_base` | 文字 | 0 | candidate |
| ch08 | `por_npc_hetieshou__ch08_prime_mentor_base` | 跨书锚点 | 0 | candidate |
| ch09 | `por_npc_shanyong__ch09_prime_prison_base` | 文字 | 0 | candidate |
| ch09 | `por_npc_shengdi__ch09_prime_prison_base` | 文字 | 0 | candidate |
| ch10 | `por_npc_yalixian__ch10_youth_memory_base` | 文字 | 0 | candidate |
| ch11 | `por_npc_yangbochong__ch11_prime_memory_base` | 文字 | 0 | candidate |
| ch12 | `por_npc_mazhen__ch12_elder_wudang_base` | 文字 | 0 | candidate |
| ch12 | `por_npc_likexiu__ch12_prime_official_base` | 文字 | 0 | candidate |
| ch12 | `por_npc_zhoudanainai__ch12_elder_household_base` | 文字 | 0 | candidate |
| ch12 | `por_npc_tongzhaohe__ch12_prime_escort_base` | 文字 | 0 | candidate |
| ch13 | `por_npc_wuchen13__ch13_elder_memory_base` | 文字 | 0 | candidate |
| ch13 | `por_npc_jiangtieshan__ch13_prime_physician_base` | 文字 | 0 | candidate |
| ch13 | `por_npc_yuanyingu__ch13_youth_memory_base` | 文字 | 0 | candidate |
| ch13 | `por_npc_wanhesheng__ch13_elder_weituo_base` | 文字 | 0 | candidate |
| ch13 | `por_npc_chenyu__ch13_prime_taiji_base` | 文字 | 0 | candidate |
| ch13 | `por_npc_liuhezhen__ch13_prime_messenger_base` | 文字 | 0 | candidate |
| ch13 | `por_npc_shangjianming__ch13_prime_memory_base` | 文字 | 0 | candidate |
| ch13 | `por_npc_wangweiyang__ch13_elder_escort_base` | 跨书锚点 | 0 | candidate |
| ch13 | `por_npc_luobing__ch13_prime_honghua_base` | 跨书锚点 | 0 | candidate |
| ch13 | `por_npc_jiangxiaotie__ch13_youth_protected_base` | 预留文字稿 | — | 暂缓：幼童保护与年龄形象待定；未出图 |
| ch14 | `por_npc_lizicheng__ch14_prime_memory_base` | 跨书锚点 | 0 | candidate |
| ch14 | `por_npc_mazhaizhu14__ch14_prime_stronghold_base` | 文字 | 0 | candidate |
| ch14 | `por_npc_xuanmingzi__ch14_elder_mountain_base` | 文字 | 0 | candidate |
| ch14 | `por_npc_lingqingjushi__ch14_elder_mountain_base` | 文字 | 0 | candidate |
| ch14 | `por_npc_jianglaoquanshi__ch14_elder_taiji_base` | 文字 | 0 | candidate |
## 4. 开放问题（附默认值）

- 姜小铁维持幼童非战斗，默认不出图；youth 仅预留未来可能获批的成年代理资产键，未改人物事实。男基线与四张本人锚点实际为 candidate，按任务明确授权使用，默认继续待作者审阅。
- 何惕守比 ch07 约长三十岁；王维扬 / 骆冰取 1767−1755=12 岁形象差；李自成取与 ch07 近同期、约长一岁的明末前史。以上仅原创制作默认值，精确年龄与出场仍待考。
- 联系表可辨的身体、衣襟、器物与面部通过；细微指节不冒称像素级穷检。未制作透明 RGBA 母版或运行时派生。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；只复用既有 npc ID 并新增本任务 por 资产键，不修改时间线、数值或剧情。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 七册补充名录 / design/18 §13.7：补核韦春花异文、胖瘦头陀药后体型、何惕守铁钩形制、马真门内身份、无嗔生命态、王维扬 / 骆冰在飞狐中的出场与前史人物生前时点。风际中 / 毛东珠原先只有主记录，没有可用本人图，故本批以文字建立首图。
- 胖瘦头陀默认药后胖高瘦、瘦矮胖；2026-10-03 检索[第二十回节选](https://dodobook.com/index.php?id=books%2Fjinyong%2F07lu%2F020)与[体貌交叉资料](https://www.toutiao.com/article/7181452288085590567/)，全文抓取失败、网页版本未定，仍交 DES 核三联 / 广州版，不当作逐字考据完成。
- INDEX 与运行时 portrait 由协调者集中重建；补入 38 张及姜小铁 hold。未新增技术版本、API、价格、限额或浏览器支持断言；执行模型 / effort 由本地 runner 日志核对。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 1 人物事实：39/39 对照七册名录、design/18 §13.7 和 DES 报告；复用 ID，保留原创扩展与待考，无名单外人物。
- ✅ 2 提示词：39 份 frontmatter 齐全；2:3、单人成年全身、去 AI 化、禁幼态、右衽与无文字均具备；姜小铁 status: hold。
- ✅ 3 出图：38 张，每人一张 base；34 文字 / 4 身份锚点；参考按实际上传顺序、原件与 JPEG SHA256 登记；全部为 candidate。
- ✅ 4 质检入库：每批不超过 8 张 view_image，最终总表及身份对照已查；ingest8.py --no-commit 与 done.txt 记账；每张重出不超过 2 次。
- ✅ 5 范围与检查：未运行 build_portraits.py / build_portrait_index.py；只改写集，未执行改变 git 状态的命令；报告≤80行、各次写入≤150行。
- ✅ `python3 tools/agents/check_roster_portraits.py tools/agents/rosters/ART-cast-fill-d.txt`：38 出图 / 1 暂缓，问题 0；`python3 tools/lint/check_ids.py --strict`：退出 0，strict failure count 0（既有 sk_babuganchan 基线项保留）。
- ⚠️ 原著衣貌、部分命运及跨书存在性未完成指定版本逐字核实；本批不代表作者已批准或运行时已集成。
