# 城镇程序化组装记录

| 项 | 内容 |
|---|---|
| 归属 | 默认风格包的城镇基线组装命令、素材依赖与质检要点 |
| 上游 | `docs/design/22-town-layout-and-generation.md`、`docs/design/town/city_*.yaml`、`docs/design/town/history/` |
| 工具 | `tools/town/gen_layout.py` → `check_town.py --strict-assets` → `render_town.py` |
| 产物 | 两城全尺寸 PNG、0.25 缩略图、叠加 SVG、布局 YAML 与逐图 manifest |
| 标注 | `candidate` 供作者审批；历史拓扑含推定与（原创扩展），不是古城测绘复原 |

## 结论先行（TL;DR）

城镇由程序化生成，本文件记录组装命令、素材依赖与质检要点。整城不再使用纯生图提示词。布局取自上游规格，代码投影为45°视角。第11次运行依协调者更正恢复第6轮西湖11点、洱海9点多边形及湖体契约；湖岸是历史方位约束下的缩景推定，不冒称古岸实测。街墙、分区、固定地标坐标保留。建筑继续全部0°原生占地，入口朝向只作放置偏好。

## 1. 复现命令

从仓库根运行；Python 需已有 Pillow、NumPy、PyYAML。下列命令循环两城，必须逐步成功后再执行下一步。

```bash
for city in dali__ch01 hangzhou__ch02; do
  python3 tools/town/gen_layout.py "docs/design/town/city_${city}.yaml" \
    -o "assets/default/baseline/town/town_${city}.layout.yaml" \
    --stats "assets/default/baseline/town/town_${city}.stats.json" || exit 1
  python3 tools/town/check_town.py "docs/design/town/city_${city}.yaml" \
    "assets/default/baseline/town/town_${city}.layout.yaml" --strict-assets \
    > "assets/default/baseline/town/town_${city}.validation.txt" || exit 1
  python3 tools/town/render_town.py "assets/default/baseline/town/town_${city}.layout.yaml" \
    -o "assets/default/baseline/town/town_${city}.png" --scale 1 \
    --overlay "assets/default/baseline/town/town_${city}.overlay.svg" \
    --report "assets/default/baseline/town/town_${city}.render.json" || exit 1
  python3 tools/town/render_town.py "assets/default/baseline/town/town_${city}.layout.yaml" \
    -o "assets/default/baseline/town/town_${city}.preview.png" --scale 0.25 \
    --report "assets/default/baseline/town/town_${city}.preview.render.json" || exit 1
done
python3 -m unittest discover -s tools/town -p 'test_*.py'
python3 tools/town/plan_view.py docs/design/town/city_dali__ch01.yaml assets/default/baseline/town/town_dali__ch01.layout.yaml -o docs/design/town/history/dali_plan.svg
python3 tools/town/plan_view.py docs/design/town/city_hangzhou__ch02.yaml assets/default/baseline/town/town_hangzhou__ch02.layout.yaml -o docs/design/town/history/linan_plan.svg
```

两份 `TownLayout` 的 `source_spec.sha256` 锁定源规格，整图 `manifest.yaml` 登记实际渲染命令、尺寸及 PNG SHA-256。重出图后须重测哈希并更新登记，`references` 取最终报告的 `used_asset_ids`；不能沿用旧哈希。缩略图与调试附件不增加 manifest 图片条目。登记完成后执行：

```bash
python3 tools/agents/check_assets.py assets/default/baseline/town --min 2 --max 2
```

## 2. 素材依赖与缩放

- `assets/default/baseline/tile/manifest.yaml`：60张原生素材；六种地面各4变体、八向岸/路边件、门墙桥与装饰。缺失边型由八向边件组合，不扩图量。
- `assets/default/baseline/building-map/manifest.yaml`：38种建筑；附属 `props/manifest.yaml` 提供7种植物各2变体。最终使用的逐张 ID 见城镇 manifest 的 `references`，具体借用见 `*.render.json` 的 `asset_substitutions`。
- 建筑比例为 `输出scale × 32 × (实例占地宽+深) / 素材底面投影宽`；透明画布不参与计算。桥面双轴配准、外栏单独配准；同河同向且并集为矩形的交叠桥在生成阶段合并，其他重叠拒绝。临安12源桥→11桥面，北部共享56格。
- 墙用原材质重组连续顶面与外露侧面。六张门图按实测柱脚分段配准，垂直柱线保持垂直，门墩高度对应3m墙高；校准绑定源SHA，换图须重测。岸线按水陆两侧8邻mask叠真实边件，陆格加0.16格窄水带；仅对角接触裁取顶点帽，避免短叉。所有混合严格裁到本格菱形。
- 河湖共用 `southern_water__v01–v04`：读取内部纹理、统一均色、镜像接边，全图连续坐标平滑混合，并叠加种子确定的连续低频明度场，增益范围0.985–1.015；没有逐格明度跳变，不改源PNG。本工作区仍使用旧水片；按续作要求不等待新片，细波纹偏弱继续交 TOWN-tiles-water，换片后重跑总装与目检。边界混合不改变逻辑水格及碰撞。
- 母版地面64×32，投影 `px=32(x+z)`、`py=16(H+x−z)`。大理地表高3072，塔顶另需523像素留白，完整图6144×3595、0.25图1536×899；临安完整图10240×5120、0.25图2560×1280。SVG同步平移，不改布局坐标。
- 建筑只需实际使用的0°视图，6×5按6×5放置；四边逻辑接入点可选，原图门向优先但不强求朝街。`--strict-assets` 仍拒绝缺图及错误占地；旧非0°布局须重生，不能重标素材视图。`tools/town/required_building_views.json` 保留已解决的前轮缺口审计。

## 3. 目检要点

1. 道路连通、门洞接路、溪渠与桥头合理；SVG可对照道路、水域、入口与底面。
2. 建筑底面不互压、不压河、不进入整桥矩形（含陆侧桥头）；屋顶透叠与遮挡检查全尺寸局部，不能只看布局校验。
3. 左上主光与短接触影基本一致；单独看临安北部唯一桥面及两外栏、墙顶连续/门柱贴墙、岸线和路缘无水中短线。
4. 大理土草为主，不铺满青砖；山茶与竹木、桃溪北寺塔及低密民居可辨。寺域游戏包络不画成实心历史城墙；成品PNG不画规划或调试标记，规划信息仅在SVG叠加层查看。母版区域`(3520,1470)–(4160,1800)`应无包络短横线。
5. 临安南宫北市、二层店铺与摊棚、河仓河埠和石砖街面形成繁华差异；西湖呈11点弧形东岸、南北收窄，向画幅西侧延伸，不画矩形湖带。大理画幅东缘洱海为9点推定岸线。全尺寸和缩略均检查相邻水格颜色连续、岸线连接与边界格岸水共存；画幅截断处不添加假岸。
6. 两小塔提前并置、临安分期资料借用等历史限制见上游 history；本轮不新增历史查证结论。

## 参考资料

- `assets/README.md`：逐图登记字段与候选审批。
- `tools/town/README.md`：CLI、数据流与候选替代规则。
- `tools/agents/reports/TOWN-assemble.md`：本次实测、目检、遗留问题及交办。

## 本文新增术语/约定

不新增玩法、建筑或城镇 ID；沿用任务指定文件名。`used_asset_ids` 记录真实参与合成的逐图 ID，`asset_substitutions` 记录共享材质及规格差异借用；缺建筑朝向进入 `missing_assets`，不能登记为可用借用。

## 待决事项 / 依赖

- 已解决：纯生图整城管线改为程序化组装；审批对象为两张 `candidate` 合成图。
- 已解决：第3–4轮14/22种缺朝向阻断由第5轮0°单视图裁定取代；两城重新生成并通过严格校验，素材和整图仍为 `candidate` 待作者审美审批，不要求补交四向图。
- 历史证据与三塔年代默认沿用 `history/dali.md`、`history/linan.md` 既有待决；作者审美审批不替代考据。
- 已解决：第7轮取消逐格明度跳变，第11次运行用连续低频场落实明度变化，水陆两侧8向岸水混合保留；成品PNG无规划短横线。第8–10轮撤湖决定已由本次协调者更正，湖体能力及第6轮原控制点已恢复。古岸精度仍待考；四张水面贴片纹理交 TOWN-tiles-water，默认保留candidate待作者审美审批；本次总装不承担重出水片。
- 分片、GLB、正式场景引用和真机纹理预算仍由后续任务验证 **（待实测）**。
