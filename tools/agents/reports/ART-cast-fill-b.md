# ART-cast-fill-b 报告 · 主要人物补齐 B（鹿鼎记～雪山飞狐）· 逐书搜索主要人物列表并补齐缺的立绘（作者 10-02 晚，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

逐书联网检索 ch08–ch14，检索重点人数分别为 40 / 29 / 19 / 15 / 40 / 40 / 28；短篇未凑人头。
当前工作副本开工有 A 类49项、B类3人；已补入50张：本轮新生成33张 + 主检出既有候选原字节复用17张。
空心菜、ch13幼年苗若兰两项按禁止幼态与既有暂停默认跳过；C类39人/本书出场缺项交DES，未擅自注册ID。
新图由外部worker14 runner三槽生成；34次请求，33张入选，钟兆能重出1次，限流0次；全部仍为candidate。

## 2. 产出（文件、行数、主要章节）

- 人物PNG50张（47男、3女），均1024×1536 RGB；涉及ch09/12/13/14。6个manifest增补50条，文件合计6660行；保留原有条目原字节。
- 人物提示词50份（新建ch13陈家洛、常赫志、常伯志3份，更新缺图条目47份）；按ch09/12/13/14合计行数 1060/2198/652/1300，含实际Gemini文本、输入清单、原稿与质检说明。
- 逐书 `audit/CAST_AUDIT.md` 7份，共320行：搜索名单、开工A/B/C、逐asset处置、C类ID建议和来源；各书入口见§3。
- 工作账本与联系表：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w14/done.txt`、`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w14/sheets/final_01.jpg`～`final_07.jpg`；新旧与淘汰对照见`reuse_*.jpg`、`ch13_01.jpg`；本报告≤80行。

## 3. 关键结论与数值

参考代码：T＝ref=text + 两张同性别基线；I＝书剑版陈家洛本人锚点 + 两张男基线；H1＝历史纯背景输入；H2＝历史男基线 + 用户风格图；H3＝历史书剑赵半山锚点 + 纯背景。H类为复用，不冒称本轮两基线新图。全部网页访问于2026-10-02；原著细节仍待三联/广州修订版终校。

- **ch08《鹿鼎记》**：[来源](https://zh.wikipedia.org/wiki/鹿鼎記角色列表)；[完整清单与asset表](../../../assets/default/prompts/characters/ch08-luding/audit/CAST_AUDIT.md)。A 0：无；B 0：无；C 16：韦春花、多隆、索额图、风际中、李力世、柳大洪、吴立身、刘一舟、毛东珠、陆高轩、胖头陀、瘦头陀、陶红英、胡逸之、吴应熊、何惕守。
  已有图全保留：名录34人无本地缺图；本书未新出图。
- **ch09《连城诀》**：[来源](https://zh.wikipedia.org/wiki/连城诀)；[完整清单与asset表](../../../assets/default/prompts/characters/ch09-liancheng/audit/CAST_AUDIT.md)。A 11：卜垣、冯坦、空心菜、鲁坤、梅念笙、沈城、孙均、桃红、汪啸风、吴坎、周圻；B 0：无；C 2：善勇、胜谛。
  补图：`por_npc_buyuan__ch09_prime_wanfu_base`（T）、`por_npc_fengtan__ch09_prime_wanfu_base`（T）、`por_npc_lukun__ch09_prime_wanfu_base`（T）、`por_npc_meiniansheng__ch09_elder_memory_base`（T）、`por_npc_shencheng__ch09_prime_wanfu_base`（T）、`por_npc_sunjun__ch09_prime_wanfu_base`（T）、`por_npc_taohong__ch09_youth_wanfu_base`（T）、`por_npc_wangxiaofeng__ch09_youth_travel_base`（T）、`por_npc_wukan__ch09_prime_wanfu_base`（T）、`por_npc_zhouqi09__ch09_prime_wanfu_base`（T）。
  跳过 `por_npc_kongxincai__ch09_child_protected_base`：幼童保护阶段与禁止幼态冲突；默认暂缓。
- **ch10《白马啸西风》**：[来源](https://zh.wikipedia.org/wiki/白马啸西风)；[完整清单与asset表](../../../assets/default/prompts/characters/ch10-baima/audit/CAST_AUDIT.md)。A 0：无；B 0：无；C 1：雅丽仙。
  已有图全保留：名录21人无本地缺图；本书未新出图。
- **ch11《鸳鸯刀》**：[来源](https://zh.wikipedia.org/wiki/鸳鸯刀)；[完整清单与asset表](../../../assets/default/prompts/characters/ch11-yuanyang/audit/CAST_AUDIT.md)。A 0：无；B 0：无；C 1：杨伯冲。
  已有图全保留：名录20人无本地缺图；本书未新出图。
- **ch12《书剑恩仇录》**：[来源](https://zh.wikipedia.org/wiki/書劍恩仇錄角色列表)；[完整清单与asset表](../../../assets/default/prompts/characters/ch12-shujian/audit/CAST_AUDIT.md)。A 20：阿凡提、常伯志、常赫志、陈世倌、陈正德、霍阿伊、蒋四根、陆菲青、木卓伦、钱正伦、石双英、王维扬、卫春华、杨成协、阎世章、于万亭、章进、赵半山、周英杰、周仲英；B 0：无；C 4：马真、李可秀、周大奶奶、童兆和。
  补图：`por_npc_afanti__ch12_elder_base`（H1）、`por_npc_changbozhi__ch12_prime_base`（H1）、`por_npc_changhezhi__ch12_prime_base`（H1）、`por_npc_chenshiguan__ch12_elder_memory_base`（H1）、`por_npc_chenzhengde__ch12_elder_alive_base`（H1）、`por_npc_huoayi__ch12_prime_alive_base`（H1）、`por_npc_jiangsigen__ch12_prime_base`（H1）、`por_npc_lufeiqing__ch12_elder_base`（H1）、`por_npc_muzhuolun__ch12_elder_alive_base`（H1）、`por_npc_qianzhenglun__ch12_prime_base`（H1）、`por_npc_shishuangying__ch12_prime_base`（H1）、`por_npc_wangweiyang__ch12_elder_base`（H1）、`por_npc_weichunhua__ch12_prime_base`（H1）、`por_npc_yangchengxie__ch12_prime_base`（T）、`por_npc_yanshizhang__ch12_prime_base`（T）、`por_npc_yuwanting__ch12_elder_memory_base`（T）、`por_npc_zhangjin__ch12_prime_base`（T）、`por_npc_zhaobanshan__ch12_elder_base`（H1）、`por_npc_zhouyingjie__ch12_youth_alive_base`（T）、`por_npc_zhouzhongying__ch12_elder_base`（T）。
- **ch13《飞狐外传》**：[来源](https://zh.wikipedia.org/wiki/飛狐外傳)；[完整清单与asset表](../../../assets/default/prompts/characters/ch13-feihu/audit/CAST_AUDIT.md)。A 5：苗若兰、张云飞、赵半山、钟兆能、钟兆英；B 3：陈家洛、常赫志、常伯志；C 10：无嗔（毒手药王）、姜铁山、姜小铁、袁银姑、万鹤声、陈禹、刘鹤真、商剑鸣、王维扬、骆冰。
  补图：`por_npc_zhangyunfei__ch13_prime_base`（H2）、`por_npc_zhaobanshan__ch13_elder_base`（H3）、`por_npc_zhongzhaoneng__ch13_prime_base`（T）、`por_npc_zhongzhaoying__ch13_prime_base`（H2）、`por_npc_chenjialuo__ch13_youth_afterassembly_base`（I）、`por_npc_changhezhi__ch13_prime_rescue_base`（T）、`por_npc_changbozhi__ch13_prime_rescue_base`（T）。
  跳过 `por_npc_miaoruolan__ch13_child_base`：既有REVIEW-C明确暂停；钟兆能r1杆端贴边淘汰，r2通过，主检出旧图未改。
- **ch14《雪山飞狐》**：[来源](https://zh.wikipedia.org/wiki/雪山飛狐)；[完整清单与asset表](../../../assets/default/prompts/characters/ch14-xueshan/audit/CAST_AUDIT.md)。A 13：曹云奇、杜希孟、范帮主、静智大师、刘元鹤、阮士中、陶百岁、陶子安、田青文、熊元献、殷吉、郑三娘、周云阳；B 0：无；C 5：李自成、马寨主、玄冥子、灵清居士、蒋老拳师。
  补图：`por_npc_caoyunqi__ch14_base`（T）、`por_npc_duximeng__ch14_base`（T）、`por_npc_fanbangzhu__ch14_base`（T）、`por_npc_jingzhidashi__ch14_base`（T）、`por_npc_liuyuanhe__ch14_base`（T）、`por_npc_ruanshizhong__ch14_base`（T）、`por_npc_taobaisui__ch14_base`（T）、`por_npc_taozian__ch14_base`（T）、`por_npc_tianqingwen__ch14_base`（T）、`por_npc_xiongyuanxian__ch14_base`（T）、`por_npc_yinji__ch14_base`（T）、`por_npc_zhengsanniang__ch14_base`（T）、`por_npc_zhouyunyang__ch14_base`（T）。

## 4. 开放问题（附默认值）

- 两个幼童阶段默认继续不出，不暗改年龄ID或原著身份；周英杰沿用名录youth和现有成人方案，实际画约二十岁，属于原创成人化呈现。
- 39项C类默认由DES核定重要性、修订版姓名与本书出场行后再排图；韦春花/韦春芳字形、袁紫衣师父影视专名等不按网页直接定案。
- 复用17张保留旧输入与candidate状态；常氏兄弟肤色反差、赵半山跨书老化等旧备注继续保留，默认不扩大为精修任务。联系表可辨结构通过，细指节不冒称像素级验证。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本任务仅补素材；不改基准、NPC归属、时间线与数值。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

以下全交 `docs/design/catalog/npcs-chNN-*.md` 的DES登记；ID均经全仓检索，标“复用”的使用既有ID，其余只是建议，未在本任务注册：

- ch08：韦春花 → `npc_weichunhua08`（韦小宝之母；网页另见韦春芳，修订版字形待考；避开卫春华 npc_weichunhua）；多隆 → `npc_duolong`（清宫侍卫首领）；索额图 → `npc_suoetu`（康熙朝臣、韦小宝关系人物）；风际中 → `npc_fengjizhong`（天地会青木堂人物；design/18已引用此ID，复用）；李力世 → `npc_lilishi`（天地会青木堂骨干）；柳大洪 → `npc_liudahong`（沐王府长辈）；吴立身 → `npc_wulishen`（沐王府武人）；刘一舟 → `npc_liuyizhou`（沐王府人物）；毛东珠 → `npc_maodongzhu`（假太后、神龙教人物；design/18已引用此ID，复用）；陆高轩 → `npc_lugaoxuan`（神龙教重要教众）；胖头陀 → `npc_pangtoutuo`（神龙教教众）；瘦头陀 → `npc_shoutoutuo`（神龙教教众）；陶红英 → `npc_taohongying`（明宫旧人、九难关系人物）；胡逸之 → `npc_huyizhi`（陈圆圆关系人物）；吴应熊 → `npc_wuyingxiong`（吴三桂之子、建宁婚约人物）；何惕守 → `npc_hetieshou`（庄家线传艺前辈；复用碧血剑何铁手ID）。
- ch09：善勇 → `npc_shanyong`（血刀门弟子、狱中夺诀一方）；胜谛 → `npc_shengdi`（血刀门弟子、狱中夺诀一方）。
- ch10：雅丽仙 → `npc_yalixian`（阿曼之母、车尔库之妻；前史人物；唐代化身份须DES确定）。
- ch11：杨伯冲 → `npc_yangbochong`（萧中慧生父，前史三湘大侠）。
- ch12：马真 → `npc_mazhen`（武当前辈、余鱼同师父）；李可秀 → `npc_likexiu`（李沅芷之父、清廷武官）；周大奶奶 → `npc_zhoudanainai`（周仲英之妻、周绮与周英杰之母）；童兆和 → `npc_tongzhaohe`（镇远镖局人物、铁胆庄线对手）。
- ch13：无嗔（毒手药王） → `npc_wuchen13`（程灵素师父；避开书剑无尘道长 npc_wuchen）；姜铁山 → `npc_jiangtieshan`（药王门弟子、姜小铁之父）；姜小铁 → `npc_jiangxiaotie`（药王门亲属；幼童出图默认暂缓）；袁银姑 → `npc_yuanyingu`（袁紫衣之母，前史人物）；万鹤声 → `npc_wanhesheng`（韦陀门前辈）；陈禹 → `npc_chenyu`（商家堡及太极门相关对手）；刘鹤真 → `npc_liuhezhen`（韦陀门人物、苗人凤中毒线）；商剑鸣 → `npc_shangjianming`（商宝震之父、商家旧怨前史）；王维扬 → `npc_wangweiyang`（镇远镖局总镖头；复用书剑ID，补飞狐出场行）；骆冰 → `npc_luobing`（红花会人物；复用书剑ID，补飞狐出场行）。
- ch14：李自成 → `npc_lizicheng`（闯王宝藏前史；复用碧血/鹿鼎ID）；马寨主 → `npc_mazhaizhu14`（饮马川寨主，姓名未详不补全名）；玄冥子 → `npc_xuanmingzi`（青藏派道人）；灵清居士 → `npc_lingqingjushi`（昆仑山武人）；蒋老拳师 → `npc_jianglaoquanshi`（河南太极门老拳师，姓名未详不补全名）。
- `assets/default/prompts/characters/INDEX.md`：同步50张候选状态，添加ch13新建3个asset行；协调者统一重建，本任务未运行build_portraits/build_portrait_index。
- 提示词结构维护：既有狄云等已具图人物缺“人物要点”，全目录旧检查仍报错；本轮改动的50份逐文件检查通过，未越界改旧人物。
- 入库工具：原worker副本`--no-commit`会在done记账前返回，且锁/归档写入只读.agents；本次仅在可写codex_w14适配ingest8，保留原件、追加manifest、显式记账，不改仓库tools。

## 7. 自检（逐条对照验收标准）

- ✅ 七书联网搜索并登记来源、清单和A/B/C；50张候选落盘、3份B稿补齐；C类39项仅建议ID。
- ✅ `python3 tools/agents/check_asset_dirs.py "assets/default/character/*/ch0[89]" --min 1 --max 999`：退出0。
- ✅ `python3 tools/agents/check_asset_dirs.py "assets/default/character/*/ch1[0-4]" --min 1 --max 999`：退出0。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出0，strict failure count 0；已知未定义sk_babuganchan仍为基线项，新问题0。
- ✅ 新增50图尺寸、SHA256、manifest、实际输入原件与上传缩图哈希核对；本轮50份提示词四节/frontmatter/围栏通过；联系表每张≤8图。
- ✅ 工作副本原有160张PNG逐字节未变；已有图人物提示词未改，旧manifest为新文件原字节前缀。只改写集，无git状态变更命令、无索引重建、无tools仓库修改。
- ⚠️ 空心菜与幼年苗若兰未出；C类未登记不能出；保留candidate待作者审阅，不宣称已获批准或完成RGBA母版。未新增技术版本/API/价格/浏览器支持断言。
