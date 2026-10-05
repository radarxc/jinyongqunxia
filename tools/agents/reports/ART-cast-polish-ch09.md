# ART-cast-polish-ch09 报告 · 人物差异化小返修 · 连城诀万门六弟子（脸、姿势、蓝袍几乎一样）

## 1. 摘要（3–6 行）

六人全部按ref=text与两张男性基线重新生成，覆盖原asset_id并登记同门差异化，均为candidate待审。
脸型、年龄感、体型、手势与衣色已拉开；六人并排、面部、手部及新旧对比完成目视复核，15对可区分。
汪啸风按名录保留水笙表兄与江南侠门身份，不误作万门弟子；原著待考与历史提示词保留。
## 2. 产出（文件、行数、主要章节）

`assets/default/character/male/ch09/`覆盖6张PNG及manifest.yaml（1503行）；`assets/default/prompts/characters/ch09-liancheng/`更新六份npc提示词（各125行，孙均127行），新增[audit/CAST-POLISH.md](../../../assets/default/prompts/characters/ch09-liancheng/audit/CAST-POLISH.md)（55行：造型表、15对复核、溯源、依赖）与5张JPG质检表；本报告30行。
## 3. 关键结论与数值

卜垣苔绿拢袖、冯坦赤陶棕叉腰、鲁坤烟褐黑褂抱臂、沈城象牙白灰紫合手、孙均枣红扶剑、汪啸风姜黄提金铃；六个完整asset_id见复核表。全员文字版.r1，每人本轮重出1次、追加0次；成功6、失败0、限流0。
全员1024×1536、2:3原字节入库；27条manifest只替换6条，余21条及21张PNG未变；6×5÷2=15对通过。工作根为`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w15/`；最终表`sheets/final_contact.jpg`，新旧表`sheets/before_after_a.jpg`、`sheets/before_after_b.jpg`，已复制入写集audit目录。
## 4. 开放问题（附默认值）

默认保留candidate待作者审阅；具体年龄感与外貌细部为原创扩展，不推生卒；指定版原著逐字终校未做，沿用人物稿待考。孙均实际左手扶柄，与文字右手设想略有差异；手部自然且无伤残侧别冲突，默认接受，已记提示词、manifest和复核表。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；本轮只修素材，不改基准、名录身份、人物ID或玩法数值。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

协调者合入后统一重建`assets/default/portrait/`、人物`INDEX.md`及素材总览，沿用原ID更新图像；调度任务标题中的“万门六弟子”建议改为“连城六人（五名万门弟子与汪啸风）”。worker副本ingest8已适配写入授权工作目录与--no-commit记账，未改仓库tools；无需同步通用工具。
## 7. 自检（逐条对照本任务的验收标准）

- ✅ 六人逐人改写并生成；两张男性基线按实际上传顺序登记原件及JPEG哈希；联系表15对、完整全身、成年、脸/姿势/衣色、手部器物与画风目视通过，每人1次≤2次。
- ✅ `ingest8.py <job> --no-commit`逐人入库；六张图与原图SHA256一致、旧图哈希均变化；提示词与真实请求、manifest逐字一致；redo_reason均为「同门差异化」。
- ✅ `python3 tools/agents/check_asset_dirs.py "assets/default/character/*/ch09" --min 1 --max 999`退出0（女9/男27，问题0）；`python3 tools/lint/check_ids.py --strict`退出0（strict failure count 0；既有sk_babuganchan基线项未改）。
- ✅ 六份提示词四节/frontmatter/围栏/无占位通过，历史与待考保留；git diff --check通过；只改指定仓库写集，每次文本写入≤100行，报告≤30行；未运行改变仓库状态的git命令或头像重建。
- ⚠️ 未获作者批准，未制作透明RGBA母版；本轮无新增技术版本/API/浏览器支持/价格/限额断言，无相关联网核实条目；模型名仅记录runner配置，不宣称核实底层图像模型版本。
