# 本任务：人物立绘 · AR-32 作者修改 A（洪七公微须、神雕中年郭靖与黄蓉核对、侠客 / 鸳鸯 / 白马 11 人幼态与 AI 感复查）

本任务出图并登记，不改规格、不改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/prompts/_codex_portrait.md`（做法，必读）、`tools/agents/prompts/_imagegen.md`、`docs/decisions/author-requirements.md` 的 AR-31、AR-32（含补记）、AR-34。你是 **9 号出图员**（`worker_no=9`），同时跑 **3 个槽位**。

## 作者要求（2026-10-02 11:36，逐字）
> 1. 洪七公：原著是下巴上微须，现在按 1983 版画成了长须，保留哪个？用微须
> 2. 神雕中年郭靖：现在借 1983 版的剧照，能不能接受？ -  郭靖用射雕的经典形象但是变成中年，不要用神雕剧中形象，同样的黄蓉也是
> 5. 侠客、鸳鸯、白马、范蠡这 12 个只能靠文字的人，范蠡参考历史图片，其他用之前的，避免幼态和AI感

（范蠡归另一任务 ART-portrait-ar32-fix-b，本任务不做。）

## 要做的事

1. **洪七公两张**（都重出）：
   - `por_npc_hongqigong__ch02_elder_bangzhu_base`（射雕，男，S）与 `por_npc_hongqigong__ch03_elder_base`（神雕，男）。
   - 身份参考沿用现有 1983 版剧照（主检出 `.agents/coord/imagegen-reference/identity-20261001/shediao/hongqigong_1983_liudan_*.jpg`，不要下载新的）。
   - 描写改为原著：长方脸、**颏下微须**（短而稀疏的几绺短须，不是长髯、不是白须垂胸）、粗手大脚、补丁衣洗得干净、绿竹杖、朱红葫芦、**九指**（右手食指缺一截，愈合旧缺失，不要画成五指或断口）；神经矍铄的老叫化。神雕那张比射雕那张年长约十余岁，先出射雕张，再把它作第一张 `-i` 当同一人锚点出神雕张。
   - 两张的 `redo_reason` 都写明「作者 10-02：改微须」。
2. **神雕中年郭靖、黄蓉核对**：
   - `por_npc_guojing__ch03_prime_base`、`por_npc_huangrong__ch03_prime_base`。
   - 先 `view_image` 现图，并与射雕里 AR-32 重出的基础立绘（看 manifest `classic_ref`：郭靖 1983 黄日华、黄蓉 1994 朱茵）并排比。合格标准：**同一张脸长到中年（约四十上下）**、不是神雕剧中演员的脸、不显老态也不显青年、无幼态与 AI 感。
   - 不合格才重出：第一张 `-i` 用射雕新版基础立绘（同一人锚点），之后才是剧照（郭靖 1983、黄蓉 1994 朱茵）与两张基线；提示词写明「同一人，年长约二十岁」。合格就不动，报告写明核对结论与依据。
3. **侠客 4、鸳鸯 3、白马 4 共 11 人复查**（作者：不换剧照，用之前的做法，只避免幼态和 AI 感）：
   - 侠客：`por_npc_shipotian__ch06_youth_jinwu_base`、`por_npc_shizhongyu__ch06_youth_bangzhu_base`、`por_npc_axiu__ch06_youth_ziyan_base`、`por_npc_dingdang__ch06_youth_changle_base`；
   - 鸳鸯：`por_npc_yuanguannan__ch11_youth_scholar_base`、`por_npc_xiaozhonghui__ch11_youth_departure_base`、`por_npc_zhuotianxiong__ch11_elder_feignedblind_base`；
   - 白马：`por_npc_liwenxiu__ch10_youth_astuo_base`、`por_npc_supu__ch10_youth_base`、`por_npc_aman__ch10_base`、`por_npc_majiajun__ch10_elder_disguised_base`。
   - 拼一张 11 人联系表看。只对**幼态**（童颜、娃娃脸、少年身材、大头小身）或**明显 AI 感**（塑料皮肤、磨皮、网红模板脸、过度对称、偶像打光、蜡像感）的重出；重出沿用该人现有的参考方式（manifest `classic_ref` / references 里是《金庸群侠传》头像的仍用头像，是文字的仍只用文字），只改描写里的年龄骨相与去 AI 化句子。合格的不动。
4. 全部出完：联系表与「新旧对比」表存到你的 `codex_w9/sheets/`。

## 约束
- 只写：
  - `assets/default/character/male/ch02/**`、`assets/default/character/male/ch03/**`、`assets/default/character/female/ch03/**`
  - `assets/default/character/male/ch06/**`、`assets/default/character/female/ch06/**`
  - `assets/default/character/male/ch10/**`、`assets/default/character/female/ch10/**`
  - `assets/default/character/male/ch11/**`、`assets/default/character/female/ch11/**`
  - 上述人物的提示词文件 `assets/default/prompts/characters/{ch02-shediao,ch03-shendiao,ch06-xiake,ch10-baima,ch11-yuanyang}/*.md`
  - 本任务报告
- 不碰其他人的图与 manifest 条目（manifest 只改本任务人物那几条）；不下载任何新剧照；不改 `tools/**`。
- 每张图最多重出 2 次；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/character/male/ch02 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/male/ch03 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/female/ch03 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/male/ch06 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/female/ch06 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/male/ch10 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/female/ch10 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/male/ch11 --min 1 --max 999`
- `python3 tools/agents/check_assets.py assets/default/character/female/ch11 --min 1 --max 999`
- `python3 tools/lint/check_ids.py --strict`

## 报告
按 `_codex_portrait.md` 第 6 节；另写明：郭靖、黄蓉的核对结论；11 人里哪些重出了、为什么，哪些判定合格不动。
