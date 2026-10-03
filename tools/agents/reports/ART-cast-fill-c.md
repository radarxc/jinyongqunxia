# ART-cast-fill-c 报告 · 新登记人物立绘 C（天龙八部～碧血剑（ch01–ch07））· DES-npcs-register 新增、还没有立绘的人物按名单补提示词与立绘（AR-47；codex gpt-6-astra xhigh）
## 1. 摘要（3–6 行）
完成名单全部 72 张：71 个人形书界版本 + 神雕 1 张，均已生成、联系表自查并入库 candidate。
新建 71 份人物提示词，沿用并解除神雕旧稿暂缓；未新造 npc 主体，何足道只制作倚天楔子版。
三条同人链使用真实锚点：丘处机射雕→神雕、瑛姑本批射雕→神雕、归钟鹿鼎→碧血；非人形纯文字无参考。
两项指定校验通过；原著细部考据、作者美术终审和运行时派生物仍按职责交下游。
## 2. 产出（文件、行数、主要章节）
- 72 份提示词位于七个获准 `assets/default/prompts/characters/ch01-tianlong/` 至 `ch07-bixue/` 目录；共 6753 行，单份 64–98 行，含 Gemini 提示词、人物要点、考据边界、参考资料与生产记录。
- 72 个 1024×1536 RGB PNG（合计 153.75 MiB）及 15 份 manifest：14 份既有男女目录只追加，新增 `assets/default/character/other/ch03/manifest.yaml`。
- 完成账、真实请求、原图、引用 JPEG、逐批联系表与校验日志：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w22`；本报告行数见末行。
## 3. 关键结论与数值
核算：10+9+11+12+16+6+8=72；男48、女23、非人形1；A52/B20。下表每项括号为“参考方式 / 图像重出次数”；文=文字+同性别双基线，锚=同人身份图+双基线，文兽=纯文字且零参考。全部完成，跳过0、暂缓0；72个队列作业均成功，noimg 0、限流记录0、图像重出0。

| 书 | 每人 asset_id（参考 / 重出） |
|---|---|
| ch01《天龙八部》 | `por_npc_kangmin__ch01_prime_xingzilin_base`（文/0）；`por_npc_madayuan__ch01_elder_memory_base`（文/0）；`por_npc_quanguanqing__ch01_prime_xingzilin_base`（文/0）；`por_npc_yelvhongji__ch01_prime_liaoting_base`（文/0） |
| ch01《天龙八部》（续） | `por_npc_menggu__ch01_youth_xixia_base`（文/0）；`por_npc_liqingluo__ch01_prime_mantuo_base`（文/0）；`por_npc_qinhongmian__ch01_prime_jianghu_base`（文/0）；`por_npc_ganbaobao__ch01_prime_wanjie_base`（文/0） |
| ch01《天龙八部》（续） | `por_npc_ruanxingzhu__ch01_prime_xiaojinghu_base`（文/0）；`por_npc_zhongwanchou__ch01_prime_wanjie_base`（文/0） |
| ch02《射雕英雄传》 | `por_npc_guoxiaotian__ch02_prime_memory_base`（文/0）；`por_npc_liping__ch02_prime_damo_base`（文/0）；`por_npc_yinggu__ch02_elder_heizhao_base`（文/0）；`por_npc_shagu__ch02_youth_niujia_base`（文/0） |
| ch02《射雕英雄传》（续） | `por_npc_qiuqianzhang__ch02_elder_jianghu_base`（文/0）；`por_npc_wangchongyang__ch02_elder_memory_base`（文/0）；`por_npc_penglianhu__ch02_prime_zhaowangfu_base`（文/0）；`por_npc_liangziweng__ch02_elder_zhaowangfu_base`（文/0） |
| ch02《射雕英雄传》（续） | `por_npc_shatongtian__ch02_prime_zhaowangfu_base`（文/0） |
| ch03《神雕侠侣（含神雕）》 | `por_npc_yinzhiping__ch03_prime_zhongnan_base`（文/0）；`por_npc_zhaozhijing__ch03_prime_zhongnan_base`（文/0）；`por_npc_honglingbo__ch03_youth_jianghu_base`（文/0）；`por_npc_sunpopo__ch03_elder_gumu_base`（文/0） |
| ch03《神雕侠侣（含神雕）》（续） | `por_npc_guopoluo__ch03_youth_xiangyang_base`（文/0）；`por_npc_yinkexi__ch03_prime_menggu_base`（文/0）；`por_npc_qiuchuji__ch03_elder_zhongnan_base`（锚/0）；`por_npc_hubilie__ch03_prime_yingzhang_base`（文/0） |
| ch03《神雕侠侣（含神雕）》（续） | `por_npc_mengge__ch03_prime_xiangyang_base`（文/0）；`por_npc_yinggu__ch03_elder_baihuagu_base`（锚/0）；`por_npc_shendiao__ch03_prime_jianzhong_base`（文兽/0） |
| ch04《倚天屠龙记》 | `por_npc_huqingniu__ch04_prime_hudiegu_base`（文/0）；`por_npc_wangnangu__ch04_prime_hudiegu_base`（文/0）；`por_npc_jixiaofu__ch04_prime_hudiegu_base`（文/0）；`por_npc_yangbuhui__ch04_youth_adult_base`（文/0） |
| ch04《倚天屠龙记》（续） | `por_npc_yinliting__ch04_prime_wudang_base`（文/0）；`por_npc_moshenggu__ch04_prime_wudang_base`（文/0）；`por_npc_dingminjun__ch04_prime_emei_base`（文/0）；`por_npc_xianyutong__ch04_prime_guangming_base`（文/0） |
| ch04《倚天屠龙记》（续） | `por_npc_zhuchangling__ch04_elder_zhuangyuan_base`（文/0）；`por_npc_huangshannvzi__ch04_youth_gumu_base`（文/0）；`por_npc_hezudao__ch04_youth_shaolin_base`（文/0）；`por_npc_chenyouliang__ch04_prime_gaibang_base`（文/0） |
| ch05《笑傲江湖》 | `por_npc_laodenuo__ch05_elder_huashan_base`（文/0）；`por_npc_ludayou__ch05_youth_huashan_base`（文/0）；`por_npc_linzhennan__ch05_prime_fuwei_base`（文/0）；`por_npc_qufeiyan__ch05_youth_hengyang_base`（文/0） |
| ch05《笑傲江湖》（续） | `por_npc_tianmen__ch05_prime_taishan_base`（文/0）；`por_npc_dingyi__ch05_elder_hengshan_base`（文/0）；`por_npc_dingjing__ch05_elder_hengshan_base`（文/0）；`por_npc_bujie__ch05_prime_jianghu_base`（文/0） |
| ch05《笑傲江湖》（续） | `por_npc_huangzhonggong__ch05_elder_meizhuang_base`（文/0）；`por_npc_heibaizi__ch05_elder_meizhuang_base`（文/0）；`por_npc_tubiweng__ch05_elder_meizhuang_base`（文/0）；`por_npc_danqingsheng__ch05_prime_meizhuang_base`（文/0） |
| ch05《笑傲江湖》（续） | `por_npc_dingmian__ch05_prime_hengyang_base`（文/0）；`por_npc_lubai__ch05_prime_hengyang_base`（文/0）；`por_npc_feibin__ch05_prime_hengyang_base`（文/0）；`por_npc_yanglianting__ch05_prime_heimuya_base`（文/0） |
| ch06《侠客行》 | `por_npc_fanyifei__ch06_prime_guandong_base`（文/0）；`por_npc_fengliang__ch06_prime_guandong_base`（文/0）；`por_npc_lvzhengping__ch06_prime_guandong_base`（文/0）；`por_npc_gaosanniangzi__ch06_prime_wanmazhuang_base`（文/0） |
| ch06《侠客行》（续） | `por_npc_chengzixue__ch06_elder_lingxiao_base`（文/0）；`por_npc_huawanzi__ch06_prime_xueshan_base`（文/0） |
| ch07《碧血剑》 | `por_npc_luoliru__ch07_prime_onearm_base`（文/0）；`por_npc_wenfangshan__ch07_elder_shiliang_base`（文/0）；`por_npc_wenfangwu__ch07_elder_shiliang_base`（文/0）；`por_npc_andaniang__ch07_prime_jianghu_base`（文/0） |
| ch07《碧血剑》（续） | `por_npc_guisong__ch07_youth_adult_base`（锚/0）；`por_npc_hongshenghai__ch07_prime_jianghu_base`（文/0）；`por_npc_huguinan__ch07_prime_jianghu_base`（文/0）；`por_npc_mengbofei__ch07_elder_qunxiong_base`（文/0） |

- 同人年龄差按本任务美术约定：丘处机约+20岁、归钟约−10岁、瑛姑约+30岁；不据此修改小说生卒。归钟、郭破虏、曲非烟等成年化为（原创扩展），罗立如保留右臂缺失。
- 每8张一张联系表，共9张：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w22/sheets/batch01.jpg` 至 `batch09.jpg`；总表 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w22/sheets/all72.jpg`；同人对照 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w22/sheets/crossbook.jpg`。
- 执行日志实证 model=gpt-6-astra、effort=xhigh；runner由追踪者运行，本会话仅入队。无剧照下载；manifest记录源图与实际上传件的SHA-256和顺序，图片审批仍为candidate。
- 1024:1536=2:3；原生输出尺寸一致，入库只做RGB重编码，未裁切、缩放、抠图或镜像；不冒称2048×3072 RGBA运行时母版。
- 参考资料：七书外部检索与访问日期2026-10-03已逐稿登记；二手人物列表仅辅助核对身份和外观方向，未把它们升级为指定修订版逐字证据。未新增API、价格、限额、浏览器兼容性或公开最新版本结论。
## 4. 开放问题（附默认值）
- 默认全部保持candidate，联系表自查不等于作者批准；细指节、衣饰考据和美术细修仍由最终审核判定。
- 七册新增人物索引未进入当前分册正文，默认依design/18 §13.6及DES登记报告制作；具体五官、服色、年龄观感标（原创扩展），原著回目与衣貌保留（待考）。
- 神雕无已核验的非人形画风参考，默认纯文字；已解决原目录写权暂缓。归钟幼龄原著与作者成年化要求并存，默认只改变素材外观，不改变生命轴。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
无；本批只补素材，不修改人物事实归属、玩法、数值或时代定义。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `docs/design/catalog/npcs-ch01–ch07-*.md`：补回DES-npcs-register-a所报71项补充索引中的身份、年龄档、制作层级及外貌依据；当前71项有69项在本书分册找不到对应键，已有2项也缺新增外貌卡；神雕原行存在。
- `design/18 §13.6` / 各书名录：继续核实精确出场年龄、生死窗口与原著衣貌；优先复核罗立如右臂侧别、瑛姑两个阶段的发色/年龄差、尹克西汉服珠饰、归钟幼龄与成年化呈现、何足道楔子阶段。
- `assets/default/prompts/characters/INDEX.md`、运行时立绘索引及审核页：协调者集中纳入72张与71份新稿，再运行build_portraits / build_portrait_index；本任务未运行。
- `tools/imagegen/ingest.py`：非人形调用的默认归档/锁位于受保护的工作区`.agents`；本轮导入原模块，使用worker内窄输出映射与归档，再写回新条目真实绝对source_path；未改仓库工具。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 1 人物事实：逐一核对71项主登记、DES报告及七册名录；只复用名单ID，分册缺漏已交办；新增脸型、衣饰与成年化均明确美术补足。
- ✅ 2 提示词：72稿完整frontmatter与Gemini块；人形全部含成年、禁幼态、去AI化原句、右衽/族群服制边界与无文字，不写演员名；神雕保留非人形分支。
- ✅ 3 出图：72/72，每人1张；三条锚点链和神雕none队列正确，真实上传数量为人形68×2+3×3=145件，非人形0件；引用图未进assets。
- ✅ 4 质检与入库：9张八人联系表、1张总表和同人对照已检查；done72行；每图尺寸/哈希/源图/引用哈希及请求与正文一致；14份原manifest字节前缀保留。
- ✅ 5 汇总边界：未运行build_portraits.py或build_portrait_index.py；只修改写集，未执行改变仓库状态的git命令，未复制整仓或assets至临时目录。
- ✅ `python3 tools/agents/check_roster_portraits.py tools/agents/rosters/ART-cast-fill-c.txt`：72出图、0暂缓、0问题。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出0，strict failure count=0；既有基线豁免不冒称本轮修复。
- ✅ `git diff --check`与自定义引用/源图/写集/旧条目字节/提示词一致性核验通过；每次文本写入≤150行，报告≤80行。
- ⚠️ 原著逐字终校、作者批准及运行时RGBA派生尚未完成，未计入本批完成范围。
- 报告共63行。
