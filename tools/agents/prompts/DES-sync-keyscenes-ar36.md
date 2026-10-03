# 本任务：设计同步 · AR-36 情景图第二波之后——`key-scenes.md` 口径与条目修正、`story/07` §2.2、`story/09` 制衣方向、`npcs-ch09` 铃剑双侠、`npcs-ch08` / `design/18` 的人物主记录核查

本任务改文档。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/decisions/author-requirements.md` 的 AR-36（主角精修 + 关键剧情插图配古风题字）、AR-39（生成后都要落库）；
- `tools/agents/reports/ART-hero-refine-a.md`（天龙～碧血）与 `ART-hero-refine-b.md`（鹿鼎～雪山）的 §3、§6——两份 §6 是本任务的清单，原文优先于本说明的转述；
- `docs/design/catalog/key-scenes.md` 全文；
- `assets/default/scene/ch01`～`ch14` 的 `manifest.yaml`（本轮实际入库的 `cg_chNN_*` 插图：`status: candidate`、参考图、题字记录）与 `assets/default/prompts/scenes/**`（hero 任务已按实际画面修正过出场清单）；
- `docs/design/story/07-bixue.md` §2.2、`docs/design/story/09-liancheng.md` 第 158 行一带、`docs/design/story/sleep-events.md` §3.2；
- `docs/design/catalog/npcs-ch08-luding.md`、`docs/design/catalog/npcs-ch09-liancheng.md`（第 10、16 行）、`docs/design/18-npc-and-companions.md`；
- `docs/tech/07-asset-generation.md` §1.4、§2.4（`cg_` 前缀、单书正式 CG 预算）。

## 背景

`key-scenes.md` 是 10-02 为 Gemini 出图写的 102 场**规划清单**（每书恰 7、序章 4、只许 `approved` 参考、白马七场不上传参考）。作者 10-02 晚（AR-36）改由 codex 主角精修任务按书出关键剧情插图（配古风题字），参考图用 `candidate` 立绘即可，Gemini 不再出情景图（10-02 22:40 范围变更）。两轮已入库 82 张插图（hero-a 50、hero-b 32，`assets/default/scene/chNN/`，全部 `candidate`）。hero 任务按「只追加表行」的约束追加了行，但 §0 / §16 / §17 的旧统计与门禁没动，各书表里还有一批与原著或已入库画面不一致的旧说法。

## 要做的事

1. **`key-scenes.md` §0、§16、§17 改口径**（不删规划行）：
   - 102 场规划行保留为「候选清单」，新增一段说明：正式插图由 codex 主角精修任务按书出（巨作 8–10 幅、其他 4–6 幅），统计以 `assets/default/scene/chNN/manifest.yaml` 为准，并把每书实际入库数写进各书标题括号（如「《天龙八部》（规划 7 / 入库 N）」，N 从 manifest 数）；
   - 参考图：`candidate` 立绘可作身份参考（AR-36 / AR-39），不再要求 `approved`；白马七场改为可用唐代化后的李文秀等人物立绘（hero-b 已这样做）；
   - §17 的数量 / 参考图校验规则按上面改写：删掉「每书恰 7」「非 approved 判失败」「白马存在上传判失败」三条，改成「规划行每书 ≥ 7、入库数以 manifest 为准、参考 asset_id 必须能映射到现有 `por_*`」；
   - 「Gemini 上传顺序」改为「参考图顺序」，不写死工具名。
2. **各书表逐条修正**（只改措辞与标注，不删行、不改 ID）。清单以两份报告 §6 为准，摘要：
   - ch01：聚贤庄的参考与题字口径同步到已入库画面；雁门行的等待标记改「已解决（`story/sleep-events.md` §3.2 `slp_01_yiminghuanyiming`）」。
   - ch02：张家口先画乞儿装，勿混后来揭晓。ch03：桃花岛第三试是背诵经文、不画机关拼块；重阳宫时杨过已断右臂；三礼不是普通礼盒，留书与发现分时层；郭黄中年与郭襄保持代际。
   - ch04：张三丰教剑的左手道具按提示词核对；万安寺救人先后。ch05：结局令狐冲抚琴、盈盈吹箫；梅庄换囚不画清醒目送；少林是偏殿三战。
   - ch06：长乐帮揭伪是李四掷凳破顶、石中玉落入厅内；十八泥人与烧饼藏令不是同一场。ch07：金蛇洞是成年再访、铁盒，不画初探时青青在场或夏雪宜实体鬼魂；泰山李岩 / 红娘子、盛京青青 / 程青竹分置回忆层，连续动作并置标「原创构图」；李岩获救为 AR-20。
   - ch08：青木堂捧香立誓；擒鳌拜的茶盏信号；五台山人物到场顺序；通吃岛崖道；退隐时康熙不到场送行。
   - ch09：天宁寺不让已死的万震山 / 言达平争宝；雪谷改成水笙缀羽衣；夹墙救戚芳标「原创改命」。
   - ch10：马家骏不能活着送东归；唐代门禁的说法按白马唐代化改写。ch11：鸳鸯刀一长一短；枣林萧中慧被点穴。
   - ch12：宫墙白巾标「非原著」。ch13：佛山袁紫衣拦凤天南、钟阿四台上作证标「待核」；药圃初遇是傍晚浇花；程灵素葬地。ch14：胡苗月夜以树枝代兵刃；苗若兰不在决斗中央。
   - 未选用的 `cg_ch11_pine_forest_blades`、`cg_ch12_ancient_road_rescue`、`cg_ch14_snow_rope_cut` 三行去掉旧身份门禁说法，标「候选未出」。
3. **`story/07-bixue.md` §2.2**：「十四岁发现铁盒，约十年后艺成下山」易误读为发现后另过十年；改成「在华山学艺约十年后下山」的写法；发现年龄保留「（待考：三联 / 广州纸本）」，不擅改时间轴。
4. **`story/09-liancheng.md` 第 158 行一带**：制衣方向写反了，改为水笙抽淡黄衫的线、用金钗穿缀羽衣。
5. **`catalog/npcs-ch09-liancheng.md` 第 10、16 行**：「铃剑双侠」不是父女——是水笙与汪啸风；水岱是「落花流水」之一。只改说明文字，不改 ID 与其他列。
6. **`catalog/npcs-ch08-luding.md`**：核查顺治（行痴）、风际中有没有独立主记录；没有就按该名录的格式补一行（ID 按名录既有规则起，`tier` 与阵营按原著），有就不动。
7. **`design/18-npc-and-companions.md` 与 `catalog/npcs-ch03-*.md`**：核查孙婆婆、蒙哥是否缺正式人物 ID；缺则在 ch03 名录补登记（同第 6 条做法），不新造多余 ID；design/18 若有人物总表就同步。
8. 全部改完跑 `python3 tools/lint/check_ids.py --strict`（新登记的 ID 按该脚本的规则登记）；`python3 tools/lint/check_story_dag.py` 若覆盖这些文件也要通过。

## 约束

- 只改：`docs/design/catalog/key-scenes.md`、`docs/design/story/07-bixue.md`、`docs/design/story/09-liancheng.md`、`docs/design/catalog/npcs-ch08-luding.md`、`docs/design/catalog/npcs-ch09-liancheng.md`、`docs/design/catalog/npcs-ch03-*.md` 与 `docs/design/18-npc-and-companions.md`（后两者只在第 7 条需要时），以及报告。
- 不改 `assets/**`（含 manifest 与提示词）、`content/**`、`tools/**`；不改各书 story 的状态机与事件 ID；原著考据拿不准的写「（待考）」而不是改事实。
- 双儿是否精修由作者定，本任务不碰。

## 报告

`tools/agents/reports/DES-sync-keyscenes-ar36.md`，按 `_common.md` 的格式；§3 列各书「规划 / 入库」数与修改的行数；§6 写仍需人工拍板的项；§7 逐条对照本任务第 1–8 条（✅ / ⚠️ + 说明）。
