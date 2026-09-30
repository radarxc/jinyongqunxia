# 城镇占位布局预览

两城均由当前 CitySpec 构造生成，并通过 `check_town.py` 的完整布局检查（0 error）。这些是**代码占位预览**：地表、道路、河岸、桥、城墙、建筑和植物均为纯色或线框，建筑盒体带实例 ID；不代表正式美术。图片不进入任何素材 manifest。

| 文件 | 尺寸 | 建筑数 | 道路格数 |
|---|---:|---:|---:|
| `town_dali__ch01_layout.png` | 1536×768 | 47 | 1485 |
| `town_hangzhou__ch02_layout.png` | 2560×1280 | 92 | 4336 |

配套 `*.overlay.svg` 引用同目录 PNG，可开关分区、网格、道路水面、建筑 ID、入口与行走层。`walk` 组默认隐藏；`viewBox` 保留母版坐标。PNG 没有 `INCOMPLETE` 水印，渲染报告的 `diagnostic=false`。

- `*.stats.json`：逐类型数量、余地块、道路/入口连通性、生成耗时与布局 SHA-256；`complete=true`、`missing_required={}`。
- `*.render.json`：输出尺寸、耗时、绘制顺序和完整缺失素材清单。强制占位下的替代键仍全部报告，不因预览可见而当作素材已经齐备。
- 生成耗时只在 sidecar 中；TownLayout 不含时间戳与绝对路径。布局存于 `/tmp`，可随时重建。

从仓库根目录复现大理：

```bash
python3 tools/town/gen_layout.py docs/design/town/city_dali__ch01.yaml -o /tmp/tianshu_town_dali.yaml
python3 tools/town/check_town.py docs/design/town/city_dali__ch01.yaml /tmp/tianshu_town_dali.yaml
python3 tools/town/render_town.py /tmp/tianshu_town_dali.yaml -o assets/default/baseline/town/preview/town_dali__ch01_layout.png --scale 0.25 --placeholders-only --overlay assets/default/baseline/town/preview/town_dali__ch01_layout.overlay.svg --report assets/default/baseline/town/preview/town_dali__ch01_layout.render.json
```

临安将规格换为 `city_hangzhou__ch02.yaml`，输出前缀换为 `town_hangzhou__ch02_layout`。完整选项与素材字段见 `tools/town/README.md`。

2026-09-30 第九次裁定后，四项通用建筑下限及临安两处分区边界已同步源规格与 `design/22`。前八轮的失败水印图已由完整预览替换，过程摘要仅留任务报告。

交 TOWN-assemble：先按当前源规格重新生成并校验，再移除 `--placeholders-only`、配置真实 manifest；缺素材严格检查必须通过后才做正式总装。锚点、footprint、旋转视图、47-mask、桥与城门孔不可由成图手调替代。母版为大理 6144×3072、临安 10240×5120；运行时须另做分层、分片和纹理转换。

历史图面、三塔年代、宋代建筑称谓等上游待考项继续保留。本预览验证程序布局与通行，不是历史城市复原结论；正式素材接缝、光向和真机表现仍待总装验收。
