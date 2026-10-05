# 本任务：遗迹与探险地宫地图 · 接力第 2 批（九老洞、敦煌地宫唐 / 清两相位、达摩洞、若耶溪墓藏、华山后洞；作者 AR-36 点名项的补做）

本任务出图并登记，不改规格、不改工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：`tools/agents/prompts/_codex_worker.md`、`tools/agents/prompts/ART-ruins-maps.md`（第 1 批的做法、产物契约、检查命令，本任务完全照用）、`tools/agents/reports/ART-ruins-maps.md`（第 1 批 56 张的布局口径、尺寸档、chunk 规则与 §6 的贴片缺口）、`tools/agents/reports/DES-ruins-ids.md` §3（本批 6 个场景的 ID、区域、类型、尺寸档、房间数、入口条件、POI 锚点）、`content/world/README.md` 与 ENG-18b 的地图合同、`docs/design/11-open-world.md` §4.4.1 最小闭环。

## 本批清单（DES-ruins-ids 6d3121d7 登记，只做这 6 张）

| 场景 ID | 名称 | 章 / 年代 | 区域 | 类型 | 尺寸档 | 房间 |
|---|---|---|---|---|---|---|
| `sc_01_damodong` | 达摩洞 | ch01 / 约 1093 | `rg_zhongyuan` | 岩窟 | 微型 | 3 |
| `sc_01_ruoye_muzang` | 若耶溪墓藏 | ch01 / 约 1093 | `rg_jiangnan_taihu` | 墓道 | 微型 | 4 |
| `sc_04_jiulaodong` | 九老洞（峨眉） | ch04 / 约 1360 | `rg_bashu` | 岩窟 | 标准 | 5 |
| `sc_07_huashan_houdong` | 华山后洞 | ch07 / 1630–1645 | `rg_guanzhong` | 岩窟 | 标准 | 5 |
| `sc_10_dunhuang_digong` | 敦煌地宫·唐代相位 | ch10 / 702–703 | `rg_hexilongyou` | 地宫 | 标准 | 6 |
| `sc_12_dunhuang_digong` | 敦煌地宫·清代相位 | ch12 / 1753–1759 | `rg_hexilongyou` | 地宫 | 标准 | 6 |

- 敦煌两相位共用地理入口与主体结构（同一地宫，唐代初建 / 清代残损），分别制作两份地图：清代相位在唐代基础上体现坍塌、淤沙、后人盗洞与封门；不得只复制一份改名。
- 九老洞按峨眉山真实洞穴特征（溶洞、岔道多、潮湿）布置；华山后洞按花岗岩崖洞（狭长、台阶、后段开阔）；达摩洞小而整；若耶溪墓藏为江南土墓（墓道 + 前后室 + 耳室）。
- 入口条件标「（待设计）」的，地图只做结构，不做剧情门禁对象；入口对象属性按合同留空 / 默认。

## 要做的事

照 `ART-ruins-maps.md` 第 3–5 条：最小闭环、真实地貌、尺寸档位、图层与对象按合同；每张出预览 PNG 并 `view_image` 目检连通与出入口可达；`done.txt` 记每张。只用 `content/tiled/tilesets/` 已有的贴片；缺的写报告 §6（第 1 批已列的洞壁 / 墓道 / 石刻 / 宝箱等贴片缺口不必重复，补充新发现即可）。

## 产物与约束

- `content/world/regions/<rg_id>/<sc_id>.tmj` 与 `<sc_id>.preview.png` 共 6 组；`content/world/regions/ART-ruins-maps.catalog.tsv` / `.audit.tsv` 若第 1 批已建，就**追加**本批 6 行（不改旧行）。
- 只写：`content/world/regions/**`、`content/tiled/tilesets/**`（只增不改已有）、本任务报告。不改 `packages/**`、`tools/**`、设计文档；每次写入 ≤ 150 行；报告 ≤ 60 行。

检查（必须全部通过）：
- `pnpm install --frozen-lockfile`
- `pnpm content:validate`
- `pnpm content:build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

`tools/agents/reports/ART-ruins-maps-2.md`：§3 六张的 ID、类型、尺寸、房间 / 区数、chunk 数、预览路径与目检结论；敦煌两相位的差异说明；§6 新增贴片缺口与需同步项；§7 逐条对照检查项。
