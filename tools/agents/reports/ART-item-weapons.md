# ART-item-weapons 报告 · 物品图 · 兵器（24 项，按名录批量出图）

## 1. 摘要（3–6 行）

- 已按 `items-weapons.md` 原顺序交付 24/24 张 PNG 与同构 `manifest.yaml`；每个 ID 一图，均由 `codex exec -m gpt-6-astra` 代理调用 `image_gen` 生成，未用代码绘图、拼贴或重编码。
- 共生成 40 张候选：8 项采用首稿，16 项在最多一次返修后采用第二稿；入库图均可追溯至仍存在且 SHA-256 相同的工具原图。
- 首图青钢剑已与倚天剑、九阴真经两张基线并排校准：细深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖和近象牙底一致，无粗黑描边、平涂色块或悬浮粒子。
- 24 张逐图复核通过核心禁项与主体完整性；霸王枪尾鐏、烈火旗旧损有轻微偏差，均已达到每项最多 2 张候选，故如实保留并登记。
- 两项强制检查均以退出码 0 通过。

## 2. 产出（文件、行数、主要章节）

- `assets/default/item/weapons/<id>.png`：24 张 RGB PNG，均为 1254×1254，共 27,585,874 bytes。
- `assets/default/item/weapons/manifest.yaml`：24 条、1138 行；含实际全文提示词、负向词、两张基线的路径/哈希/用途、历史参考、生成配置、源图路径、尺寸/哈希、候选数及逐项自检。
- `tools/agents/reports/ART-item-weapons.md`：本报告；含结论、开放问题、跨文档同步项与 24 项验收表。

## 3. 关键结论与数值

- 覆盖：名录 24 行 = 黄 6 + 玄 6 + 地 6 + 天 6；manifest ID、顺序、文件名与名录逐项一致。
- 构图：manifest 实测四边留白的全批最小值为 12.68%，高于验收底线 10%；所有主体完整，未截尖或截杆。
- 底色：20 px 外圈中位数落在 RGB `(228–231, 223–226, 214–218)`，围绕目标 `(230,225,216)`；均为 RGB PNG、无伪透明。
- 生成：`tool: codex exec · image_gen`、`model: gpt-6-astra`、`effort: ultra`；图片后端型号与 seed 未回传，不虚构登记。请求 1536×1536，工具实际统一输出 1254×1254，仍满足本任务短边 ≥1024。
- 历史参考：联网通过大都会博物馆官方馆藏 API 与缩略图复核 8 个唯一 URL（访问 2026-10-01），仅人工取形制/比例/材质，`input_to_model: false`；实际图片输入始终只有两张基线。
- 参考源：<https://collectionapi.metmuseum.org/public/collection/v1/objects/31116>、[/31110](https://collectionapi.metmuseum.org/public/collection/v1/objects/31110)、[/24974](https://collectionapi.metmuseum.org/public/collection/v1/objects/24974)、[/24465](https://collectionapi.metmuseum.org/public/collection/v1/objects/24465)、[/43238](https://collectionapi.metmuseum.org/public/collection/v1/objects/43238)、[/503050](https://collectionapi.metmuseum.org/public/collection/v1/objects/503050)、[/24959](https://collectionapi.metmuseum.org/public/collection/v1/objects/24959)、[/27782](https://collectionapi.metmuseum.org/public/collection/v1/objects/27782)。

## 4. 开放问题（附默认值）

1. 霸王枪返修稿尾端生成尖锥式鐏，名录只明确“旧铜箍”。默认：作为未排除的实用尾鐏保留；作者若要求严格只留铜箍，后续审批批次再重出。
2. 烈火旗旗尾旧损较明显，但仍是完整旗幅且无燃烧效果。默认：按“旧而妥善保存”的地阶画面语言接受；作者若偏好整齐旗缘，后续审批批次再重出。
3. `eq_tiedan` 器物细节、`eq_liehuoqi` 是否直接作为兵器、`eq_jinshejian` 原著形制、`eq_dagoubang` 跨书流转与形制沿用名录 **（待考）**；默认：只按名录的原创外观表现，不声称原著逐字复原。
4. 当前工作副本缺少任务点名的 `tools/agents/prompts/_imagegen.md`。默认：本次以 manifest 留存的每次实际调用全文、原始源图和两张基线哈希作为可复核执行记录；不越权补文件。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。素材执行未发现必须修改 `docs/00-canon.md` 的规则冲突。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `tools/agents/prompts/_imagegen.md` / 任务引用路径：文件当前缺失；由其归属任务恢复或修正引用，避免后续批次无法读取执行说明。
- `docs/design/catalog/items-weapons.md` / `eq_bawangqiang`、`eq_liehuoqi` 审批备注：仅在作者不接受第 4 节默认值时登记返修需求；本任务不改名录。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| ID | 候选数 | 自检结论 | 历史参考 URL（有则列） |
|---|---:|---|---|
| `eq_qinggangjian` | 1 | ✅ 完整、无字/人/场景/投影/光效；首图风格校准通过 | https://www.metmuseum.org/art/collection/search/31116 |
| `eq_dandao` | 1 | ✅ 完整，名录所需朴素微弧刀可辨 | https://www.metmuseum.org/art/collection/search/31110 |
| `eq_qimeigun` | 2 | ✅ 完整，返修后留白通过 | — |
| `eq_huaqiang` | 2 | ✅ 枪头、红缨、白蜡杆完整 | [24974](https://www.metmuseum.org/art/collection/search/24974)、[24465](https://www.metmuseum.org/art/collection/search/24465) |
| `eq_duanbi` | 1 | ✅ 匕与名录所需鞘组成一套，均完整 | https://www.metmuseum.org/art/collection/search/43238 |
| `eq_ruanbian` | 2 | ✅ 单鞭连续，柄、鞭梢完整 | — |
| `eq_longquanjian` | 1 | ✅ 直身双刃、青灰钢、如意护手可辨 | https://www.metmuseum.org/art/collection/search/31116 |
| `eq_yanlingdao` | 2 | ✅ 刀与名录所需黑皮鞘组成一套 | https://www.metmuseum.org/art/collection/search/31110 |
| `eq_chanzhang` | 2 | ✅ 锡杖头、铁环、长杆完整 | — |
| `eq_sanjiegun` | 1 | ✅ 三段两链完整、数量正确 | — |
| `eq_jindi` | 2 | ✅ 横笛七孔、卷草纹无字 | https://www.metmuseum.org/art/collection/search/503050 |
| `eq_tiedan` | 1 | ✅ 一对无字铁球；器物细节 **（待考）** | — |
| `eq_junzijian` | 2 | ✅ 剑与完整剑鞘成套、方正小护手可辨 | https://www.metmuseum.org/art/collection/search/24959 |
| `eq_shunvjian` | 2 | ✅ 独立完整、银白纤细、浅青柄缠 | https://www.metmuseum.org/art/collection/search/31116 |
| `eq_xuedao` | 2 | ✅ 暗红窄刃、藏地装具；无血腥 | https://www.metmuseum.org/art/collection/search/27782 |
| `eq_biyudao` | 2 | ✅ 玉集中于柄鞘，钢刃边界清楚 | — |
| `eq_libiegou` | 1 | ✅ 单钩完整、内刃连续可辨 | — |
| `eq_liehuoqi` | 2 | ⚠️ 完整无字无火；旗尾旧损偏明显，形制 **（待考）** | — |
| `eq_yitianjian` | 1 | ✅ 新构图且未复制基线装具，剑身完整 | https://www.metmuseum.org/art/collection/search/24959 |
| `eq_tulongdao` | 2 | ✅ 宽厚重刀完整；非日本刀、无光效 | — |
| `eq_xuantiejian` | 2 | ✅ 无锋厚重、极简小护手完整 | — |
| `eq_jinshejian` | 2 | ✅ 返修去除具象蛇头；形制 **（待考）** | https://www.metmuseum.org/art/collection/search/31116 |
| `eq_bawangqiang` | 2 | ⚠️ 重枪完整；尾端尖锥式鐏超出名录明示细节 | [24974](https://www.metmuseum.org/art/collection/search/24974)、[24465](https://www.metmuseum.org/art/collection/search/24465) |
| `eq_dagoubang` | 2 | ✅ 深碧竹节、无刻字；流转与形制 **（待考）** | — |

- ✅ 24/24 张均由 `image_gen` 生成；无脚本、Pillow 绘图、拼贴或程序化替代图；所有具体装具与未有原著定本的形制均按名录视为 **（原创扩展）**。
- ✅ 24/24 张经 `view_image` 逐图复核：完整、浅暖灰底，无文字、人物、手、场景、地面、投影、品阶框、发光刃或悬浮粒子；两项轻微偏差已在表内标 ⚠️。
- ✅ `python3 tools/agents/check_assets.py assets/default/item/weapons --min 24 --max 24 --min-side 1024`：图片 24、条目 24、问题 0。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出码 0；仅报告基线已知的 `sk_babuganchan` 未定义，new=0、strict failure count=0。
- ✅ 只改授权目录与本报告；未改 `docs/`、`TODO.md`、基线或提示词，未执行改变仓库状态的 git 命令。
