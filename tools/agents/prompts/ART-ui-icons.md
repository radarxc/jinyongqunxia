# 本任务：界面图标 · 武侠主题图标一套（工具栏 8 + 城镇 / 战斗 / 银两 / 城池标记 4 + 状态 10，共 22 件；作者 AR-48，codex 出图）

本任务出图并登记，不改设计文档、不改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/tools/agents/prompts/_codex_worker.md`（集成分支最新版；**出图 runner 由追踪者在沙箱外跑，你只写提示词、入队、取结果、后期处理与登记**；`worker_no=18`，槽位 2）、`docs/design/catalog/ui-art-kit.md` §0、§2、§3、§5、§7（规格与逐件提示词）、`docs/design/26-immersive-ui.md` §5–§8（界面视觉方向）、`docs/tech/07-asset-generation.md` §2.1 S3 一行（游戏化工笔：外轮廓 2–3 px、2–3 阶色阶、主体占 70–80%、不烘焙纸纹）。

## 作者原话（AR-48，2026-10-03 约 12:58，逐字）
> 下面不要有框和黑色背景，图标要专门用codex画一套符合游戏主题的出来，现在图标太素了
> 银两用图标，值用中文码字
>
> 整体再优化一波，要符合武侠风

协调者口径（13:12）：512×512 RGBA 真透明，不画方卡，造型要有分量，不能素；产物 `assets/default/ui/icons/` + manifest。

## 清单（22 件，asset_id = 文件名）
- 工具栏 8 件（ui-art-kit §2，各件「本件主体」为题材）：`ui_tool_bag` 行囊、`ui_tool_martial` 武学、`ui_tool_character` 人物、`ui_tool_codex` 图鉴、`ui_tool_journal` 江湖志、`ui_tool_system` 系统、`ui_tool_map` 地图、`ui_tool_save` 藏卷。
- 新增 4 件（ui-art-kit 没有，提示词由你按同一结构撰写，题材如下）：`ui_tool_town` 城镇（城门楼与一段城垣的缩影）、`ui_tool_battle` 战斗（交叉的剑与刀，或剑与令旗）、`ui_res_silver` 银两（一锭元宝形银锭，旁衬两三枚铜钱，HUD 资源图标，数值另由代码用中文数字排）、`ui_map_city` 地图城池标记（俯视城垣方城或城楼小印，供大地图点位用，要在山水底图上一眼可辨）。
- 状态 10 件（ui-art-kit §3）：`ui_status_hp` 气血、`ui_status_mp` 内力、`ui_status_sta` 体力、`ui_status_rage` 气势、`ui_status_poison` 中毒、`ui_status_bleed` 流血、`ui_status_seal` 穴封、`ui_status_grapple` 擒拿、`ui_status_stagnation` 迟滞、`ui_status_rupture` 胀损。

## 画风（在 ui-art-kit 规格上按 AR-48 加重）
- 题材、负形、「不画字 / 不画底板」等约束照 ui-art-kit 各件；但 ui-art-kit 的提示词偏淡（「淡设色、低饱和」），作者嫌素。本任务统一改为：**有体积和材质的器物感**——旧铜、乌木、温润玉、朱漆、皮革、麻绳、纸卷等真实材质，清楚的明暗三阶（亮 / 中 / 暗）+ 一道深墨外轮廓，饱和度比立绘高 10–15%，光源左上、无投影（阴影由程序叠加）。武侠气息靠器物形制（剑穗、令牌、卷轴轴头、铜钱方孔、云纹包角）而不是加花边。
- 一套统一：同一光向、同一轮廓粗细、同一色系（烟墨、朱砂、旧铜、石青点缀）；工具栏 12 件同一视角（正面略俯）与同一主体占比（约 75%，四周均匀留白）；状态 10 件同一种紧凑剪影（单色显示也彼此可分），比工具栏更简洁。
- **真透明**：主体外 alpha=0，不画方卡、圆牌、底板、纸面、光晕、棋盘格；不要任何文字、伪字、数字、印文、水印。
- 小尺寸可辨：缩到 64 / 48 px 仍能认出用途（大剪影、关键负形），不靠细花纹区分。
- 参考图（runner 队列第 5 列，先缩到长边 ≤ 1024 的 JPEG 放 `…/gem/codex_w18/staging/`）：`assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png`、`ref_it_miji_jiuyin_shang__ch02_base01.png`（取器物的体积、材质与描边），可再加 `assets/default/baseline/map/ref_map_jianghu__ch01_base01.png`（只取配色与墨韵）。提示词里写明参考图只取画风，不照搬器物。

## 做法
1. 队列行：`job_id|asset_id|none|<提示词文件绝对路径>|<参考 JPEG，逗号分隔>`（第 3 列写 `none`：不附人物基线）。提示词文件放 `…/gem/codex_w18/prompts/<job_id>.txt`，英文为主、可夹中文，首句之后逐项写：题材、材质与色、视角与占比、透明要求、排除项（no text / letters / numbers / seal script / watermark / square card / plate / frame / paper background / checkerboard / drop shadow）。
2. **先校准**：先出 `ui_tool_bag`、`ui_tool_martial`、`ui_status_hp` 三件；拼联系表（每件：原图、128 / 64 / 48 px、浅底与深底各一、灰度）`view_image`，确认「有分量、不素、统一」后再批量出其余 19 件。每件最多重出 2 次。
3. **后期（只做几何与抠底，不得代码绘制或拼贴替代图）**：若模型没给真透明（四角非透明或带纸底），在提示词里要求纯平浅底重出，再用 `tools/item/common.py` 的 `remove_background` 抠底；裁到主体外接框后居中放回 512×512、主体约占 75%；核 alpha 同时含 0 与 255、边缘无白边 / 色边、无半透明雾（四角 32×32 区 alpha 全 0）。
4. **登记** `assets/default/ui/icons/manifest.yaml`（顶层列表，每件一条）：`id`、`file`、`category: ui/icon`、`style: default`、`subject`（中文名 + 用途）、`prompt`（实际发出的全文）、`negative`、`references`（参考图路径 + sha256 + 用途）、`tool: codex exec · image_gen`、`model: gpt-6-astra`、`created`、`source_path`（runner 原图路径）、`size: 512x512`、`sha256`、`status: candidate`、`notes`（抠底 / 裁切 / 重出次数）。新增 4 件的提示词全文也写进报告 §3。
5. 联系表放 `…/gem/codex_w18/sheets/`：全套 22 件一张（按 ui-art-kit §5 的要求：原尺寸、128 / 64 / 48、浅底 / 深底、灰度），报告写路径。

## 约束
- 只写：`assets/default/ui/icons/**`、本任务报告。不改 `docs/**`（ui-art-kit 的提示词修订写进报告 §6 交 DES-ui-immersive-2）、不改 `tools/**`；素材目录不放脚本。
- 每次写入 ≤ 150 行；报告 ≤ 60 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/ui/icons --min 22 --max 22 --min-side 512`
- `python3 -c "import glob,sys; from PIL import Image; fs=sorted(glob.glob('assets/default/ui/icons/*.png')); bad=[f for f in fs if (lambda im: im.mode!='RGBA' or im.size!=(512,512) or im.getchannel('A').getextrema()!=(0,255) or max(im.getchannel('A').crop(b).getextrema()[1] for b in ((0,0,32,32),(480,0,512,32),(0,480,32,512),(480,480,512,512)))>0)(Image.open(f))]; print(len(fs),'icons; bad:',bad); sys.exit(1 if bad or len(fs)!=22 else 0)"`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：每件重出次数、抠底与否、联系表路径、新增 4 件的提示词全文；第 6 节：给 DES-ui-immersive-2 的接入建议（运行时 128 / 64 图集、深浅主题下的观感）；第 7 节逐条对照上面的检查与画风要求。
