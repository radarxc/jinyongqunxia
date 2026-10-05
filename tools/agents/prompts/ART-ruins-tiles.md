# 本任务：遗迹贴片 · 洞壁、墓道、残墙、石刻、宝箱等地宫 / 遗迹装饰贴片与 Tiled 图块集（AR-47；codex 出图）

本任务出图、规格化并登记，不改工具、不改已有地图与 tileset。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/tools/agents/prompts/_codex_worker.md`（**出图 runner 由追踪者在沙箱外跑，你只写提示词、入队、取结果、规格化、登记**；`worker_no=21`，槽位 2）、`tools/agents/prompts/KIT-hist.md`（贴片的投影、光向、透明与历史细节写法）、`tools/agents/prompts/TILE-water.md`、`assets/default/tile/song_north/manifest.yaml`（贴片 manifest 字段与英文提示词样例）、`tools/agents/reports/ART-ruins-maps.md` §6 与 `ART-ruins-maps-2.md` §6（缺口清单的来源）、`content/tiled/README.md`、`content/tiled/tilesets/terrain.tsj`、`packages/data/src/build/tiled-chunks.ts`（`decoId` 规则、`ramp` / `rampDir`、`flowDir`、水体种类）。

## 作者原话（AR-47，2026-10-03 约 12:40，逐字摘录）
> * 女主角三视图与切件、遗迹贴片（洞壁、墓道、石刻、宝箱）：尚未登记任务。
> 这些都要做

## 清单（新套件 `ruins`，产物 `assets/default/tile/ruins/`，ID = 文件名 = decoId，形如 `deco_ruins_<题材>_v01`，只用小写字母、数字和单下划线）
| 题材 | 件数 | 说明 |
|---|---|---|
| 洞壁 cave_wall | 2 | 天然岩壁段（直段 / 转角），裂隙、苔痕 |
| 墓道 tomb_passage | 2 | 砖砌券顶墓道口、墓道壁段 |
| 土坯残墙 adobe_wall | 2 | 西域 / 河西土坯与夯土残墙段 |
| 石刻 stone_carving | 2 | 残碑（无可读文字）、摩崖小龛造像 |
| 矿支架 mine_prop | 1 | 木构支护框 |
| 毡帐 felt_tent | 1 | 草原毡帐（2×2 格占地） |
| 药架 herb_rack | 1 | 木药架、陶罐与药草捆 |
| 灯具 lamp | 2 | 长明灯（石座油灯）、石灯笼 |
| 宝箱 chest | 2 | 关闭 / 打开（同一只箱子） |
| 钟乳 / 石笋 stalactite / stalagmite | 2 | 各 1 |
| 湿壁滴水痕 wet_wall | 1 | 带水渍与滴水痕的岩壁段 |
| 夯土墓壁剖面 rammed_earth_section | 1 | 可见夯层的墓壁断面 |
| 淤沙边缘 silt_edge | 1 | 地面覆盖物（贴地、无高度） |
| 坍塌断面 collapse | 1 | 塌方乱石堆 |
| 盗洞破口 robber_hole | 1 | 墓壁 / 地面上的盗洞口 |
合计 22 件。

## 规格
- 与城镇贴片同一投影：正交、偏航 45°、俯仰约 30°、2:1 地面轴、竖线垂直、光源左上、右下短接触影；真透明 RGBA（物体外 alpha=0，不要地台、白边、棋盘格）；1 格占地 = 64×32 菱形，高度按实物比例；画布 = 物体外接框 + 8 px 透明边。
- 写实古风，与已过审的 `song_north` 墙门贴片同一写实程度；无人物、无可读文字、无现代物件；年代通用（唐至清都能用），西域 / 草原题材照该地域形制。
- 参考：每件可上传 1–2 张缩到长边 ≤ 1024 的 JPEG（放 `…/gem/codex_w21/staging/`）：一张现有贴片定画风与投影（如 `/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/assets/default/tile/song_north/tex_town_song_north_wall__earth_r000_v01.png`），可再加一张联网找到的考古 / 遗址照片定形制（下载到工作区 `refs/`，不入库，manifest 记网址与取用细节）。

## 做法
1. 队列行 `job_id|asset_id|none|<提示词文件>|<参考 JPEG>`（第 3 列 `none`）；提示词英文为主，照 `song_north` manifest 的写法：先投影 / 光向 / 透明契约，再历史形制细节，再排除项。先出 `cave_wall`、`chest` 两件校准（与参考贴片并排 `view_image`），再批量；每件最多重出 2 次。
2. 规格化（只做几何与抠底，不得代码绘制或拼贴替代图）：不是真透明就用 `tools/item/common.py` 的 `remove_background` 抠底；裁到外接框 + 8 px；按占地缩放到 1 格 64 px 宽的比例；核 alpha 同时含 0 与 255。
3. `assets/default/tile/ruins/manifest.yaml`（顶层列表，字段照 `song_north` 贴片：`id`、`file`、`category: tile`、`style: default`、`subject`、`prompt`、`negative`、`references`（url / 本地参考与 used_detail）、`tool: codex exec · image_gen`、`model: gpt-6-astra`、`created`、`source_path`、`size`、`sha256`、`status: candidate`、`tile: {kind: deco, footprint: [w, h], variant, autotile_mask: null}`、`anchor_px`（占地菱形中心落点）、`notes`）。`assets/default/prompts/tile.md` 末尾加「遗迹贴片（ruins）」一节写提示词要点。
4. Tiled 图块集（只新增文件，不改 `terrain.tsj` / `height.tsj` 与任何 `.tmj`）：
   - `content/tiled/tilesets/deco_ruins.tsj`：图片集合型 tileset（每块 `image` 指向 `../../../assets/default/tile/ruins/<id>.png`，`imagewidth` / `imageheight` 实测），每块属性 `decoId` = 文件 ID。
   - `content/tiled/tilesets/terrain_dir.tsj`：方向地形——`tr_taijie` 6 块（`ramp=true`、`rampDir=0..5`）、`tr_jiliu` 6 块（`flowDir=0..5`）、`tr_pubu` 6 块（`flowDir=0..5`），每块另带 `terrainId`；图像沿用 `terrain.tsj` 的占位缓存图（不出新图、不入库占位 PNG）。
   - 两个 tileset 的用法写进报告 §6（交 README / 地图任务）。
5. 联系表：22 件在浅色地面贴片上 3×3 摆放各一张、透明棋盘各一张，放 `…/gem/codex_w21/sheets/`。

## 约束
- 只写：`assets/default/tile/ruins/**`、`assets/default/prompts/tile.md`、`content/tiled/tilesets/deco_ruins.tsj`、`content/tiled/tilesets/terrain_dir.tsj`、本任务报告。
- 不改 `tools/**`、`packages/**`、已有 tileset 与地图；素材目录不放脚本；每次写入 ≤ 150 行；报告 ≤ 60 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/tile/ruins --min 22 --max 30 --min-side 32`
- `python3 -c "import json,re,os,sys; b='content/tiled/tilesets'; d=json.load(open(b+'/deco_ruins.tsj')); P=[({p['name']:p['value'] for p in t.get('properties',[])}, t.get('image','')) for t in d['tiles']]; bad=[i for p,i in P if not re.fullmatch(r'[a-z][a-z0-9]*(?:_[a-z0-9]+)*', str(p.get('decoId',''))) or not os.path.isfile(os.path.normpath(os.path.join(b,i)))]; print(len(P),'deco tiles; bad',bad); sys.exit(1 if bad or len(P)<22 else 0)"`
- `python3 -c "import json,sys; d=json.load(open('content/tiled/tilesets/terrain_dir.tsj')); P=[{p['name']:p['value'] for p in t.get('properties',[])} for t in d['tiles']]; bad=[p for p in P if not str(p.get('terrainId','')).startswith('tr_') or (p.get('ramp') is True and p.get('rampDir') not in range(6)) or (p.get('terrainId') in ('tr_jiliu','tr_pubu') and p.get('flowDir') not in range(6))]; print(len(P),'dir tiles; bad',bad); sys.exit(1 if bad or len(P)<18 else 0)"`
- `python3 tools/lint/check_ids.py --strict`

## 报告
第 3 节：每件的参考来源与取用细节、重出次数、抠底与否、占地与锚点；第 6 节：两个 tileset 怎么在 Tiled 里用、给地图 / 渲染任务的接入建议；第 7 节逐条对照检查。
