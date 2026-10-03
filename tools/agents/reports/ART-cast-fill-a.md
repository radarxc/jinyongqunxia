# ART-cast-fill-a 报告 · 主要人物补齐 A（天龙八部～碧血剑）· 逐书搜索主要人物列表并补齐缺的立绘（作者 10-02 晚，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

逐书联网筛选40/40/40/40/40/32/40人，共272个书籍—人物项；全量对照七书名录244条、提示词、INDEX与真实PNG/manifest。
已补齐本轮可处理的7个人形缺图，全部candidate；新建4份提示词（含神雕待生成稿），更新4份原稿，新增7份逐书覆盖表。
神雕输出目录不在写集，未出图；何足道仅是倚天楔子钩子，不建立ch03人物资产；71个C类书籍—人物项交DES补登记。
首轮3次Codex连接失败后执行器恢复；此后7次生成成功、图像质检重出0、限流0。未覆盖既有PNG或修改既有manifest条目。

## 2. 产出（文件、行数、主要章节）

- 7张PNG合计16,258,526字节；5份manifest各追加本轮条目（共7条），未重排旧条目；逐图ID见§3。
- 提示词路径前缀 `assets/default/prompts/characters/`；更新：`ch02-shediao/npc_qiuchuji.md`（104行）、`ch02-shediao/npc_tiemuzhen.md`（104行）、`ch02-shediao/npc_tuolei.md`（104行）、`ch07-bixue/npc_yuanchonghuan.md`（105行）。
- 新建：`ch04-yitian/npc_hetaichong.md`（61行）、`ch04-yitian/npc_banshuxian.md`（61行）、`ch06-xiake/npc_situheng.md`（60行）、`ch03-shendiao/npc_shendiao.md`（53行，待非人形任务执行）。
- 七书目录各新增 `CAST-COVERAGE.md`，行数依次88/89/89/92/93/77/87；含来源、逐人对照、A/B/C、素材ID、建议ID及身份、版本边界。
- 外部工作记录：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w13/` 的 `done.txt`、`jobs.tsv`、`index.json`、完整请求/日志/原图/校验结果；最终联系表 `sheets/final_contact_all.jpg`、细节表 `sheets/final_details.jpg`，校准表 `sheets/calibration_ch02.jpg`。

## 3. 关键结论与数值

来源均为下表所链维基百科小说人物列表（碧血为小说页出场角色），访问2026-10-02（America/Los_Angeles）；只作人物检索，指定修订版逐字考据仍待完成。A/B为执行前全量名录缺口，C为重点名单缺本书名录项，名单不冒称全书所有人物。

| 书 / 来源 | A / B / C人数与名单 | 本轮图与跳过原因 |
|---|---|---|
| [ch01《天龙八部》](https://zh.wikipedia.org/wiki/天龙八部角色列表) | A0：无；B0：无；C10：康敏、马大元、全冠清、耶律洪基、梦姑、李青萝、秦红棉、甘宝宝、阮星竹、钟万仇 | 扫地僧已有 `por_npc_saodiseng__ch01_elder_cangjingge_base`；本书不重出；C类均待DES |
| [ch02《射雕英雄传》](https://zh.wikipedia.org/wiki/射鵰英雄傳角色列表) | A3：丘处机、铁木真、拖雷；B0：无；C9：郭啸天、李萍、瑛姑、傻姑、裘千丈、王重阳、彭连虎、梁子翁、沙通天 | `por_npc_qiuchuji__ch02_elder_base`（ref=text）；`por_npc_tiemuzhen__ch02_elder_khan_base`（ref=text）；`por_npc_tuolei__ch02_prime_xizheng_base`（ref=text）；C类均待DES |
| [ch03《神雕侠侣》](https://zh.wikipedia.org/wiki/神鵰俠侶角色列表) | A0：无；B2：何足道、神雕；C10：尹志平、赵志敬、洪凌波、孙婆婆、郭破虏、尹克西、丘处机、忽必烈、蒙哥、瑛姑 | 神雕只补稿，other目录越出写集；何足道仅后界钩子，转倚天登记；C类均待DES |
| [ch04《倚天屠龙记》](https://zh.wikipedia.org/wiki/倚天屠龍記角色列表) | A0：无；B2：何太冲、班淑娴；C12：胡青牛、王难姑、纪晓芙、杨不悔、殷梨亭、莫声谷、丁敏君、鲜于通、朱长龄、黄衫女子、何足道、陈友谅 | `por_npc_hetaichong__ch04_elder_guangming_base`（ref=text）；`por_npc_banshuxian__ch04_elder_guangming_base`（ref=text）；C类均待DES |
| [ch05《笑傲江湖》](https://zh.wikipedia.org/wiki/笑傲江湖角色列表) | A0：无；B0：无；C16：劳德诺、陆大有、林震南、曲非烟、天门道人、定逸师太、定静师太、不戒和尚、黄钟公、黑白子、秃笔翁、丹青生、丁勉、陆柏、费彬、杨莲亭 | 现有名录26人均有图，不重出；C类均待DES |
| [ch06《侠客行》](https://zh.wikipedia.org/wiki/俠客行角色列表) | A0：无；B1：司徒横；C6：范一飞、风良、吕正平、高三娘子、成自学、花万紫 | `por_npc_situheng__ch06_prime_memory_base`（ref=text）；C类均待DES |
| [ch07《碧血剑》](https://zh.wikipedia.org/wiki/碧血劍) | A1：袁崇焕；B0：无；C8：罗立如、温方山、温方悟、安大娘、归钟、洪胜海、胡桂南、孟伯飞 | `por_npc_yuanchonghuan__ch07_prime_memory_base`（ref=text）；C类均待DES |

- 7张均为1024×1536 RGB不透明PNG，1024:1536=2:3；未裁切、未缩放（源图已是目标尺寸），入库按工具重编码；不是2048×3072 RGBA运行时母版。
- 全部ref=text，实际上传顺序：男性令狐冲→萧峰，女性王语嫣→小龙女；均为baseline_small JPEG，manifest分别实测并记录原基线与上传件SHA-256。未下载或上传剧照。
- 执行配置由日志证实gpt-6-astra/xhigh、3槽；本机CLI 0.159.0由`--version`实测，不宣称为公开最新版本或底层成像模型。未新增API、价格、浏览器支持事实。
- 丘处机前2次、铁木真前1次为`workspace routing discovery failed`，均无图；执行器恢复后成功。按联系表逐张核对身份年龄、完整轮廓、右衽、手与道具、无字和基线画风；细指节及美术终审仍待作者，candidate不等于approved。

## 4. 开放问题（附默认值）

- 神雕：默认保留当前非人形稿，另派有`character/other/ch03/**`写权限的任务，选择非人形参考后生成；不借男性目录绕过写集。
- 何足道：默认在倚天楔子正式登记后使用既有`npc_hezudao`，不在神雕造本人出场。司徒横只作旧案memory方案（原创扩展），不改主线在场约束；袁崇焕保持既有生前memory。
- C类默认先由DES登记/补引用；已有全局ID直接复用。新图默认维持candidate，精确原著衣貌及年代细部仍（待考），脸型、衣色等补足标（原创扩展）。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；本任务不改玩法、人物主定义、数值或书界归属。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

以下C类仅为登记建议（姓名 / 建议或复用ID / 身份）；未创建任何新npc主体定义。请DES补入对应`docs/design/catalog/npcs-chNN-*.md`，细节与全仓命中见各书CAST-COVERAGE。

- ch01《天龙八部》：康敏 / `npc_kangmin` / 马大元之妻、萧峰身世线；马大元 / `npc_madayuan` / 丐帮副帮主、旧案核心；全冠清 / `npc_quanguanqing` / 丐帮夺权人物；耶律洪基 / `npc_yelvhongji` / 辽帝、萧峰结义关系；梦姑 / `npc_menggu` / 西夏公主、虚竹伴侣；李青萝 / `npc_liqingluo` / 王夫人、王语嫣之母；秦红棉 / `npc_qinhongmian` / 木婉清之母；甘宝宝 / `npc_ganbaobao` / 钟灵之母；阮星竹 / `npc_ruanxingzhu` / 阿朱阿紫之母；钟万仇 / `npc_zhongwanchou` / 万劫谷主人。
- ch02《射雕英雄传》：郭啸天 / `npc_guoxiaotian` / 郭靖之父、旧事人物；李萍 / `npc_liping` / 郭靖之母；瑛姑 / `npc_yinggu` / 刘瑛、一灯周伯通关系线；傻姑 / `npc_shagu` / 曲灵风之女、桃花岛关系线；裘千丈 / `npc_qiuqianzhang` / 裘千仞之兄、冒名人物；王重阳 / `npc_wangchongyang` / 全真创派者、五绝前史；彭连虎 / `npc_penglianhu` / 完颜洪烈麾下高手；梁子翁 / `npc_liangziweng` / 参仙老怪；沙通天 / `npc_shatongtian` / 鬼门龙王。
- ch03《神雕侠侣》：尹志平 / `npc_yinzhiping` / 全真弟子，依三联修订版；不套新修甄志丙；赵志敬 / `npc_zhaozhijing` / 杨过的全真师父、叛乱人物；洪凌波 / `npc_honglingbo` / 李莫愁弟子；孙婆婆 / `npc_sunpopo` / 古墓照护者；郭破虏 / `npc_guopoluo` / 郭靖黄蓉之子；尹克西 / `npc_yinkexi` / 蒙古阵营高手、九阳线索；丘处机 / `npc_qiuchuji` / 全真长辈；复用射雕 ID；忽必烈 / `npc_hubilie` / 蒙古王子、招揽群雄；蒙哥 / `npc_mengge` / 蒙古大汗、襄阳结局；瑛姑 / `npc_yinggu` / 百花谷与一灯周伯通关系线。
- ch04《倚天屠龙记》：胡青牛 / `npc_huqingniu` / 蝴蝶谷医者；design/18 §13.4已有主记录；王难姑 / `npc_wangnangu` / 毒术人物；design/18 §13.4已有主记录；纪晓芙 / `npc_jixiaofu` / 峨眉弟子；design/18 §13.4已有主记录；杨不悔 / `npc_yangbuhui` / 杨逍纪晓芙之女；design/18 §13.4已有主记录；殷梨亭 / `npc_yinliting` / 武当六侠；莫声谷 / `npc_moshenggu` / 武当七侠；丁敏君 / `npc_dingminjun` / 峨眉弟子；鲜于通 / `npc_xianyutong` / 华山掌门；朱长龄 / `npc_zhuchangling` / 朱武连环庄人物；黄衫女子 / `npc_huangshannvzi` / 古墓传人；何足道 / `npc_hezudao` / 昆仑三圣、倚天楔子；复用既有ID；陈友谅 / `npc_chenyouliang` / 丐帮阴谋线；design/18 §13.4已有主记录。
- ch05《笑傲江湖》：劳德诺 / `npc_laodenuo` / 华山二弟子、嵩山卧底；陆大有 / `npc_ludayou` / 华山六弟子；林震南 / `npc_linzhennan` / 福威镖局总镖头；曲非烟 / `npc_qufeiyan` / 曲洋孙女；天门道人 / `npc_tianmen` / 泰山掌门；定逸师太 / `npc_dingyi` / 恒山长辈；定静师太 / `npc_dingjing` / 恒山长辈；不戒和尚 / `npc_bujie` / 仪琳之父；黄钟公 / `npc_huangzhonggong` / 梅庄四友之首；黑白子 / `npc_heibaizi` / 梅庄四友；秃笔翁 / `npc_tubiweng` / 梅庄四友；丹青生 / `npc_danqingsheng` / 梅庄四友；丁勉 / `npc_dingmian` / 嵩山高手；陆柏 / `npc_lubai` / 嵩山高手；费彬 / `npc_feibin` / 嵩山高手；杨莲亭 / `npc_yanglianting` / 日月神教总管。
- ch06《侠客行》：范一飞 / `npc_fanyifei` / 关东鹤笔门人物；风良 / `npc_fengliang` / 关东青龙门人物；吕正平 / `npc_lvzhengping` / 关东快刀门人物；高三娘子 / `npc_gaosanniangzi` / 万马庄庄主；成自学 / `npc_chengzixue` / 雪山派内乱人物；花万紫 / `npc_huawanzi` / 雪山派弟子。
- ch07《碧血剑》：罗立如 / `npc_luoliru` / 金龙帮、焦宛儿关系线；温方山 / `npc_wenfangshan` / 温氏五老、温仪之父；温方悟 / `npc_wenfangwu` / 温氏五老；安大娘 / `npc_andaniang` / 安小慧之母；归钟 / `npc_guisong` / 归辛树归二娘之子；复用鹿鼎既有 ID，不另造 guizhong；洪胜海 / `npc_hongshenghai` / 渤海派人物、袁承志同伴；胡桂南 / `npc_huguinan` / 三头蛟、江湖同伴；孟伯飞 / `npc_mengbofei` / 盖孟尝、群雄人物。
- 倚天胡青牛、王难姑、纪晓芙、杨不悔、陈友谅已在design/18 §13.4定义；补名录引用，禁止重复造ID。神雕丘处机复用射雕ID；碧血归钟必须复用鹿鼎`npc_guisong`，不另造`npc_guizhong`。
- `INDEX.md`与立绘索引：由协调者集中纳入新增4稿和7图；本轮未运行build_portraits.py/build_portrait_index.py。非人形输出与何足道后界资产另派任务。
- `tools/imagegen/ingest.py` / 8号ingest8：原版会整表重写、归档和锁写入工作区`.agents`，且`--no-commit`路径不记done；本轮仅在外部13号工具箱适配为保留旧条目字节、追加登记、原图留out、自动记账，不改仓库tools脚本。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 七书逐书联网并形成32–40人的可追溯列表；244条名录全部对照，A4/B5/C71名单与处置完整。
- ✅ 7个可处理的人形缺图全部生成入库；4份B类提示词已补（神雕仅稿）；原有332张PNG逐字节未变，旧manifest原文保留，只追加7条。
- ✅ 新图参考顺序/哈希、请求、源图、尺寸、candidate状态、联系表自查及done记账齐全；禁幼态、去AI化、两三面部识别点与标志物已落实。
- ✅ `python3 tools/agents/check_asset_dirs.py "assets/default/character/*/ch0[1-7]" --min 1 --max 999`通过：14目录、339图、339条、0问题。
- ✅ `python3 tools/lint/check_ids.py --strict`通过：strict failure count=0；已有基线豁免`sk_babuganchan`仍在，未将其冒称本轮修复。
- ✅ `git diff --check`与本轮8稿frontmatter/围栏/路径、7图哈希/参考、写集/旧文件保护检查通过；仓库文本每次写入小于150行；报告小于80行；未执行改变仓库状态的git命令。
- ⚠️ C类71个书籍—人物项、神雕成图、何足道倚天资产及作者审批未完成；原因与默认处理已列明，不把它们算成补图完成。
