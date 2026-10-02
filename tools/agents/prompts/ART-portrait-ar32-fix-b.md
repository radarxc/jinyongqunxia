# 本任务：人物立绘 · AR-32 作者修改 B（杨逍 1994 台视版、范蠡历史画像、连城 / 书剑 / 飞狐 / 雪山 8 人下载剧照重出）

本任务出图并登记，不改规格、不改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/prompts/_codex_portrait.md`（做法，必读，含剧照下载与登记规则）、`tools/agents/prompts/_imagegen.md`、`docs/decisions/author-requirements.md` 的 AR-31、AR-32（含补记）、AR-34。你是 **10 号出图员**（`worker_no=10`），同时跑 **3 个槽位**。

## 作者要求（2026-10-02，逐字）
> 4. 成昆、黛绮丝保留原来的版本，杨逍用马景涛版本
> 5. 侠客、鸳鸯、白马、范蠡这 12 个只能靠文字的人，范蠡参考历史图片，其他用之前的，避免幼态和AI感

AR-32 补记第 5 条（作者 AR-34 确认）：杨逍取 **1994 台视版《倚天屠龙记》**（马景涛主演；该版杨逍由**孙兴**饰演）。作者当天同意从公开网页下载缺的剧照。成昆、黛绮丝已由协调者恢复旧版（bba3c50b），**本任务不碰**。

## 要做的事（12 张）

1. **杨逍** `por_npc_yangxiao__ch04_prime_base`（男，ch04）：下载 1994 台视版杨逍（孙兴）剧照 1–2 张（核实依据必须是页面图注 / 演员表「孙兴 饰 杨逍」），存 `identity-20261002/yitian/yangxiao_1994_sunxing_<来源>.jpg` 并登记 SOURCES.md；按剧照 + 基线重出。现图是 2003 版（张铁林）的，作废。
2. **范蠡** `por_npc_fanli__ch00_prime_base`（男，ch00）：作者要「参考历史图片」。下载 1 张公有领域的古代范蠡画像（优先 Wikimedia Commons 上的古籍版画 / 绢本像，如《历代名臣像》《三才图会》类；登记网址、所在页面、许可说明），存 `identity-20261002/yuenv/fanli_hist_<来源>.jpg`。提示词用 `ref=still1` 的写法改成：「第 1 张参考图是范蠡的古代画像：借鉴其冠服形制（春秋末深衣、高冠 / 巾）、长须、清癯儒雅的气质与脸型，但必须重绘成项目画风的写实人物，不要木刻线条、古画纸色或印章题款」；人物成年中年（约四十余）、文士，不画成老翁。
3. **连城诀 2004 版**（狄云、丁典、凌霜华）：下载各 1–2 张剧照并核实演员；重出
   - `por_npc_diyun__ch09_youth_disguise_base`（男）、`por_npc_dingdian__ch09_prime_prison_base`（男）、`por_npc_lingshuanghua__ch09_youth_scarred_base`（女）。
   - 凌霜华：**疤在她自己的左颊**（画面上是观者的右侧），自毁容后仍可辨清丽骨相；剧照只借脸型气质，疤按文字画，不要镜像。
4. **书剑恩仇录 1976 TVB 版**（霍青桐、乾隆）：下载并核实（1976 版郑少秋一人分饰多角，乾隆一角以页面图注为准）；重出 `por_npc_huoqingtong__ch12_youth_early_base`（女）、`por_npc_qianlong__ch12_prime_palace_base`（男，清制剃额留辫，AR-32）。
5. **飞狐外传 / 雪山飞狐**（程灵素、苗人凤、胡一刀）：作者定「取最经典的一版」。联网比较各版（1999 TVB 黄日华版、1991 台视孟飞版等），选剧照清楚、演员核实可靠的一版，报告写明理由；重出
   - `por_npc_chenglinsu__ch13_youth_alive_base`（女；作者要「别太丑，弄得比较高级」：清秀素净、聪慧，不美化成艳丽）；
   - `por_npc_miaorenfeng__ch13_prime_recovered_base`（男，壮年）与 `por_npc_miaorenfeng__ch14_elder_base`（男，老年）：先出 ch13，再以它为第一张 `-i` 作同一人锚点出 ch14；
   - `por_npc_huyidao__ch13_prime_memory_base`、`por_npc_huyidao__ch14_prime_memory_base`（男，壮年，回忆中的形象）：先出 ch13，再以它为锚点出 ch14；清代男主按清制剃额留辫（AR-32）。
6. 找不到可靠剧照的人：保留现有文字版（不重出），报告写明找过哪些页面。
7. 全部出完：联系表与「新旧对比」表存到你的 `codex_w10/sheets/`。

## 约束
- 只写：
  - `assets/default/character/male/ch00/**`、`assets/default/character/male/ch04/**`
  - `assets/default/character/male/ch09/**`、`assets/default/character/female/ch09/**`
  - `assets/default/character/male/ch12/**`、`assets/default/character/female/ch12/**`
  - `assets/default/character/male/ch13/**`、`assets/default/character/female/ch13/**`
  - `assets/default/character/male/ch14/**`
  - 上述人物的提示词文件 `assets/default/prompts/characters/{ch00-yuenv,ch04-yitian,ch09-liancheng,ch12-shujian,ch13-feihu,ch14-xueshan}/*.md`
  - 本任务报告
- ch04 只改杨逍一条，**成昆、黛绮丝、张无忌等一律不碰**；ch00 只改范蠡。manifest 只改本任务人物那几条。
- 剧照只存主检出 `imagegen-reference/`，不进 `assets/`；提示词里不写演员名。
- 每张图最多重出 2 次；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/character/male/ch00 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/male/ch04 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/male/ch09 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/female/ch09 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/male/ch12 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/female/ch12 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/male/ch13 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/female/ch13 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/male/ch14 --min 1 --max 999`
- `python3 tools/lint/check_ids.py --strict`

## 报告
按 `_codex_portrait.md` 第 6 节；另写明：每个人取的版本与剧照来源页面、下载了几张、SOURCES.md 的条目数。
