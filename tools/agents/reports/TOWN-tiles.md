# TOWN-tiles 报告 · 城镇程序化生成 · 底图贴片素材

## 1. 摘要（3–6 行）

第9次运行按作者“现有60张作为贴片基线”裁定收尾；未生图，60条均为 candidate，可交样例城装配。
恢复原生PNG及精灵锚点；24张地面归一alpha，删除扩边副本和历史诊断；指定校验60条、0问题。
目录现为78M，低于150MB；岸线缺形、门洞对格与墙缝不再作为本轮交付门禁，保留限制供下游按需处理。

## 2. 产出（文件、行数、主要章节）

`assets/default/baseline/tile/`：60张根PNG、60张选中源图、`manifest.yaml`（1722行）；`assets/default/prompts/tile.md`（128行，9节可复用模板）；本报告行数见§7。
下列尺寸均为PIL实测；60张均RGBA，A为alpha最小–最大值。用途沿用既有条目；没有新增ID。

| ID | 尺寸px | 用途 | A |
|---|---|---|---|
| tex_town_song_dali_rammed_earth__v01 | 64×32 | 大理夯土 | 0–255 |
| tex_town_song_dali_rammed_earth__v02 | 64×32 | 大理夯土 | 0–255 |
| tex_town_song_dali_rammed_earth__v03 | 64×32 | 大理夯土 | 0–255 |
| tex_town_song_dali_rammed_earth__v04 | 64×32 | 大理夯土 | 0–255 |
| tex_town_song_dali_dirt_road__v01 | 64×32 | 大理土路 | 0–255 |
| tex_town_song_dali_dirt_road__v02 | 64×32 | 大理土路 | 0–255 |
| tex_town_song_dali_dirt_road__v03 | 64×32 | 大理土路 | 0–255 |
| tex_town_song_dali_dirt_road__v04 | 64×32 | 大理土路 | 0–255 |
| tex_town_song_dali_grass__v01 | 64×32 | 大理草地 | 0–255 |
| tex_town_song_dali_grass__v02 | 64×32 | 大理草地 | 0–255 |
| tex_town_song_dali_grass__v03 | 64×32 | 大理草地 | 0–255 |
| tex_town_song_dali_grass__v04 | 64×32 | 大理草地 | 0–255 |
| tex_town_song_southern_grey_brick__v01 | 64×32 | 临安青砖御街 | 0–255 |
| tex_town_song_southern_grey_brick__v02 | 64×32 | 临安青砖御街 | 0–255 |
| tex_town_song_southern_grey_brick__v03 | 64×32 | 临安青砖御街 | 0–255 |
| tex_town_song_southern_grey_brick__v04 | 64×32 | 临安青砖御街 | 0–255 |
| tex_town_song_southern_stone_slab__v01 | 64×32 | 临安石板路 | 0–255 |
| tex_town_song_southern_stone_slab__v02 | 64×32 | 临安石板路 | 0–255 |
| tex_town_song_southern_stone_slab__v03 | 64×32 | 临安石板路 | 0–255 |
| tex_town_song_southern_stone_slab__v04 | 64×32 | 临安石板路 | 0–255 |
| tex_town_song_southern_water__v01 | 64×32 | 两城水面 | 0–255 |
| tex_town_song_southern_water__v02 | 64×32 | 两城水面 | 0–255 |
| tex_town_song_southern_water__v03 | 64×32 | 两城水面 | 0–255 |
| tex_town_song_southern_water__v04 | 64×32 | 两城水面 | 0–255 |
| tex_town_song_dali_riverbank__n | 64×32 | 河岸边件 | 0–255 |
| tex_town_song_dali_riverbank__e | 64×32 | 河岸边件 | 0–255 |
| tex_town_song_dali_riverbank__s | 64×32 | 河岸边件 | 0–255 |
| tex_town_song_dali_riverbank__w | 64×32 | 河岸边件 | 0–255 |
| tex_town_song_dali_riverbank__ne | 64×32 | 河岸边件 | 0–255 |
| tex_town_song_dali_riverbank__se | 64×32 | 河岸边件 | 0–255 |
| tex_town_song_dali_riverbank__sw | 64×32 | 河岸边件 | 0–255 |
| tex_town_song_dali_riverbank__nw | 64×32 | 河岸边件 | 0–255 |
| tex_town_song_southern_road_edge__n | 64×32 | 道路边件 | 0–255 |
| tex_town_song_southern_road_edge__e | 64×32 | 道路边件 | 0–255 |
| tex_town_song_southern_road_edge__s | 64×32 | 道路边件 | 0–255 |
| tex_town_song_southern_road_edge__w | 64×32 | 道路边件 | 0–255 |
| tex_town_song_southern_road_edge__ne | 64×32 | 道路边件 | 0–255 |
| tex_town_song_southern_road_edge__se | 64×32 | 道路边件 | 0–255 |
| tex_town_song_southern_road_edge__sw | 64×32 | 道路边件 | 0–255 |
| tex_town_song_southern_road_edge__nw | 64×32 | 道路边件 | 0–255 |
| tex_town_song_dali_city_gate__k6_r000_v01 | 467×333 | 城门 | 0–255 |
| tex_town_song_dali_tree_cluster__broadleaf_v01 | 311×220 | 树丛 | 0–255 |
| tex_town_song_southern_tree_cluster__willow_v01 | 327×224 | 树丛 | 0–255 |
| tex_town_song_dali_shrub__camellia_v01 | 147×103 | 茶花灌木 | 0–255 |
| tex_town_song_southern_reed__canal_v01 | 88×68 | 河渠芦苇 | 0–255 |
| tex_town_song_dali_city_gate__k5_r180_v01 | 408×306 | 城门 | 0–255 |
| tex_town_song_southern_city_gate__k8_r000_v01 | 557×377 | 城门 | 0–255 |
| tex_town_song_dali_city_gate__k4_r270_v01 | 453×298 | 城门 | 0–255 |
| tex_town_song_southern_city_gate__k7_r180_v01 | 534×357 | 城门 | 0–255 |
| tex_town_song_southern_city_gate__k6_r270_v01 | 549×370 | 城门 | 0–255 |
| tex_town_song_southern_city_gate__k5_r090_v01 | 458×308 | 城门 | 0–255 |
| tex_town_song_dali_bridge_deck__w3_l5_r000_v01 | 328×181 | 整跨桥面 | 0–255 |
| tex_town_song_southern_bridge_deck__w5_l10_r090_v01 | 498×270 | 整跨桥面 | 0–255 |
| tex_town_song_dali_bridge_rail__w3_l5_r000_v01 | 302×214 | 整跨桥栏 | 0–255 |
| tex_town_song_southern_bridge_rail__w5_l10_r090_v01 | 533×362 | 整跨桥栏 | 0–255 |
| tex_town_song_dali_wall__earth_r000_v01 | 103×187 | 城墙段 | 0–255 |
| tex_town_song_southern_wall__brick_r000_v01 | 97×171 | 城墙段 | 0–255 |
| tex_town_song_dali_wall_corner__outer_ne_v01 | 151×208 | 城墙角 | 0–255 |
| tex_town_song_southern_wall_corner__outer_ne_v01 | 153×209 | 城墙角 | 0–255 |
| tex_town_song_dali_shadow_soft__contact_v01 | 166×88 | 接触影 | 0–140 |

## 3. 关键结论与数值

清理：原1577文件→121文件；删除density/native/qa/review/metadata，原生图移到根目录；source删除103份、保留60份（均长边≤2048，无需缩放）。manifest仅留README字段及本轮允许扩展；26个已删除历史参考保留路径、SHA与说明。
实测：`du -sh assets/default/baseline/tile` → `78M`；文件逻辑总大小81,588,141字节。24地面共24,454像素alpha变化，RGB逐像素不变；36非地面PNG和60源图SHA均与清理前一致。
20张非水地面各1024透明+1024不透明像素；4张水面各1024透明，部分alpha保留；59张A=0–255，接触影A=0–140。精灵20个锚点全部恢复原生坐标并落在画布内。
alpha处理核心（在仓库根运行，脚本置于`/tmp/`，不入库；实际临时脚本为`/tmp/town_tiles_closeout.py`）：
```python
from pathlib import Path
import hashlib, yaml
from PIL import Image
b = Path("assets/default/baseline/tile"); es = yaml.safe_load((b / "manifest.yaml").read_text())
for e in es:
    if e["tile"]["kind"] in {"rammed_earth", "dirt_road", "grass", "grey_brick", "stone_slab", "water"}:
        p = b / e["file"]; im = Image.open(p); im.load()
        im.putalpha(im.getchannel("A").point(lambda a: 255 if a >= 250 else 0 if a <= 5 else a)); im.save(p)
        e["sha256"] = hashlib.sha256(p.read_bytes()).hexdigest()
with (b / "manifest.yaml").open("w") as out:
    for e in es: out.write(yaml.safe_dump([e], allow_unicode=True, sort_keys=False, width=100000))
```

## 4. 开放问题（附默认值）

已解决：完整家族数量与60张冲突→按作者裁定交60张；短边512→32；扩边解码与坐标冲突→直接读原生file；地面alpha→本轮阈值归一，影子保留半透明。
保留限制：岸线形状不全→8向边件代码叠加或后补；地面纹理接缝、门洞宽度与网格未严格对齐、墙件接缝、桥面/栏杆配准→按成图需要调整，不阻断本轮。
其他既有待决：schema素材字段待同步→以本轮显式字段为准；光向冲突→左上光/右下影；植物prp分工已解决→TOWN-buildings独立交付；材质、门楼形制、植物可读性→保持candidate待作者审美审批，形制与物种分布仍（待考）。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增基准修改提案；本轮不改玩法、策划或技术文档。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

`design/22`清单/光向、`town/schema.yaml`素材字段、`tech/07`§1.4/§5.5.2及`assets/README.md`：同步60张基线、原生尺寸与精简字段；当前工作区及旧TOWN-design路径缺design/22/schema，仅有旧临时快照，本轮未宣称通过最新schema。
TOWN-render / TOWN-assemble：直接读顶层file与tile；40张地面/边件64×32，中心[32,16]，步长东[32,16]/北[32,-16]；精灵按anchor_px放置（门为底面中心，植物为根部），整桥一次放置。八向mask沿用提示词§5；本轮未运行缺失的tools/town/render_town.py或生成两城成图。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ `python3 tools/agents/check_assets.py assets/default/baseline/tile --min 40 --max 60 --min-side 32`：退出0，60图片、60条、0问题；尺寸/双SHA/字段/透明通道及锚点逐条复核通过，逐图实测见§2。
✅ 本轮新增候选0、淘汰成品0；保留全部60张，删除的是旧副本与未选候选；未生图、未重绘、未改白名单外文件、未执行改变仓库状态的git命令；提示词已删除过程记录。 本报告116行。
⚠️ 风格沿用既有写实古风、左上光/右下影与建筑基线气质；本轮仅做资产收尾，未重新逐张美术验收，不宣称所有对象精确满足45°/30°或历史复原；审批仍为candidate。
