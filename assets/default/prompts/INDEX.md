# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）

> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。
> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。

提示词 **1233** 份：已入库 1019、已通过（作者） 132、待出图 82。**待出图队列 82 行**（`python3 tools/agents/build_image_index.py --queue`）。

## 出图 agent 怎么用

1. 先读本节与「出图位置约定」，再读目标组的 `GUIDE.md`（`items/GUIDE.md`、`maps/GUIDE.md`、`rig/GUIDE.md`），最后读每张图自己的提示词文件（frontmatter = 输出路径 / 规格 / 参考图；正文 = 要点、完整提示词、排除项、质检要点）。
2. 列出能做的行：`python3 tools/agents/build_image_index.py --queue --group maps`（`--json` 给脚本用）。队列 = 图片文件尚不存在的行 + `items/REDO.md` 里作者点名重出的 ID。
3. 每行：加载 frontmatter `references` 里的参考图 → 按「提示词」生成 2 张候选选 1 张（有明确缺陷再补，单轮 ≤ 4 张）→ 按 `output` 存 PNG（文件名 = asset_id 或指定名）→ 在 `manifest` 追加一条（字段见 `assets/README.md`：id、file、category、style、subject、prompt、negative、references、tool、model、created、source_path、size、sha256、`status: candidate`）→ 跑该组 GUIDE 里的检查命令。
4. 不要改提示词文件和本索引；每出完一张就重新运行本脚本，已入库的行会从本索引删掉（作者 10-01：做完一个就删掉对应条目）。已出的图与审批状态看各目录 `manifest.yaml` 和素材总览页；作者的审批在审批页做，`candidate` 不等于通过。

## 出图位置约定

| 类别 | 输出 PNG | 登记清单 | 规格 |
|---|---|---|---|
| 物品 | `assets/default/item/<类>/<物品ID>.png` | `assets/default/item/<类>/manifest.yaml` | 1536×1536（≥1024），不透明浅暖灰底 RGB(230,225,216)，单一物品、四边留白 ≥10% |
| 区域地图 | `assets/default/map/regions/<rg_id>.png` | `assets/default/map/regions/manifest.yaml` | 1536×1024，北上，不透明暖纸白，无文字（标签由代码叠加） |
| 全国水墨衬纸（可选） | `assets/default/map/jianghu_world/ink_base.png` | `assets/default/map/jianghu_world/manifest.yaml` | 4096×3072，与 `docs/design/map/jianghu-base.svg` 对位 |
| 角色部件 | `assets/default/rig/<set>/ref_<view>.png`、`assets/default/rig/<set>/<view>/<part>.png` | `assets/default/rig/<set>/manifest.yaml`（`tianshu-rig.v1`，由 `tools/rig/make_parts.py` 写） | 透明 RGBA，256 px/m，画布见各文件 |
| 建筑 / 贴片（已出齐） | `assets/default/building-map/<kit>/`、`assets/default/tile/<kit>/` | 各目录 `manifest.yaml` | 45° 俯视 2:1，透明 RGBA |

运行时怎么找到这些图：根 `CLAUDE.md`「素材接入」与 `apps/game/CLAUDE.md`「素材」一节——构建时从 `assets/default/<类别>/` 按 manifest 复制到 `apps/game/public/assets/default/`，运行时只认 manifest 里 `status` 不为 `rejected` 的条目。

## 待出图队列

| 组 | asset_id | 名称 | 输出 | 状态 | 提示词 |
|---|---|---|---|---|---|
| items | `eq_chunqiuqianhuangjingxiushufaguanjin_nan` | 春秋浅黄精绣束发冠巾·男 | `assets/default/item/accessories/eq_chunqiuqianhuangjingxiushufaguanjin_nan.png` | 待出图 | [eq_chunqiuqianhuangjingxiushufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangjingxiushufaguanjin_nan.md) |
| items | `eq_chunqiuqianhuangjinwenshufaguanjin_nan` | 春秋浅黄锦纹束发冠巾·男 | `assets/default/item/accessories/eq_chunqiuqianhuangjinwenshufaguanjin_nan.png` | 待出图 | [eq_chunqiuqianhuangjinwenshufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangjinwenshufaguanjin_nan.md) |
| items | `eq_chunqiuqianhuanglingwenshufaguanjin_nan` | 春秋浅黄绫纹束发冠巾·男 | `assets/default/item/accessories/eq_chunqiuqianhuanglingwenshufaguanjin_nan.png` | 待出图 | [eq_chunqiuqianhuanglingwenshufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuanglingwenshufaguanjin_nan.md) |
| items | `eq_chunqiuqianhuangsucaishufaguanjin_nan` | 春秋浅黄素裁束发冠巾·男 | `assets/default/item/accessories/eq_chunqiuqianhuangsucaishufaguanjin_nan.png` | 待出图 | [eq_chunqiuqianhuangsucaishufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangsucaishufaguanjin_nan.md) |
| items | `eq_chunqiuqianhuangxicaishufaguanjin_nan` | 春秋浅黄细裁束发冠巾·男 | `assets/default/item/accessories/eq_chunqiuqianhuangxicaishufaguanjin_nan.png` | 待出图 | [eq_chunqiuqianhuangxicaishufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangxicaishufaguanjin_nan.md) |
| items | `eq_chunqiuqianhuangxiuyuanshufaguanjin_nan` | 春秋浅黄绣缘束发冠巾·男 | `assets/default/item/accessories/eq_chunqiuqianhuangxiuyuanshufaguanjin_nan.png` | 待出图 | [eq_chunqiuqianhuangxiuyuanshufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangxiuyuanshufaguanjin_nan.md) |
| items | `eq_chunqiusubaijingxiujishi_nv` | 春秋素白精绣笄饰·女 | `assets/default/item/accessories/eq_chunqiusubaijingxiujishi_nv.png` | 待出图 | [eq_chunqiusubaijingxiujishi_nv.md](items/accessories/eq_chunqiusubaijingxiujishi_nv.md) |
| items | `eq_chunqiusubaijinwenjishi_nv` | 春秋素白锦纹笄饰·女 | `assets/default/item/accessories/eq_chunqiusubaijinwenjishi_nv.png` | 待出图 | [eq_chunqiusubaijinwenjishi_nv.md](items/accessories/eq_chunqiusubaijinwenjishi_nv.md) |
| items | `eq_chunqiusubailingwenjishi_nv` | 春秋素白绫纹笄饰·女 | `assets/default/item/accessories/eq_chunqiusubailingwenjishi_nv.png` | 待出图 | [eq_chunqiusubailingwenjishi_nv.md](items/accessories/eq_chunqiusubailingwenjishi_nv.md) |
| items | `eq_chunqiusubaisucaijishi_nv` | 春秋素白素裁笄饰·女 | `assets/default/item/accessories/eq_chunqiusubaisucaijishi_nv.png` | 待出图 | [eq_chunqiusubaisucaijishi_nv.md](items/accessories/eq_chunqiusubaisucaijishi_nv.md) |
| items | `eq_chunqiusubaixicaijishi_nv` | 春秋素白细裁笄饰·女 | `assets/default/item/accessories/eq_chunqiusubaixicaijishi_nv.png` | 待出图 | [eq_chunqiusubaixicaijishi_nv.md](items/accessories/eq_chunqiusubaixicaijishi_nv.md) |
| items | `eq_chunqiusubaixiuyuanjishi_nv` | 春秋素白绣缘笄饰·女 | `assets/default/item/accessories/eq_chunqiusubaixiuyuanjishi_nv.png` | 待出图 | [eq_chunqiusubaixiuyuanjishi_nv.md](items/accessories/eq_chunqiusubaixiuyuanjishi_nv.md) |
| items | `eq_chunqiuxunhongsucaiqiuboxingpi_tongyong` | 春秋纁红素裁裘帛行披 | `assets/default/item/accessories/eq_chunqiuxunhongsucaiqiuboxingpi_tongyong.png` | 待出图 | [eq_chunqiuxunhongsucaiqiuboxingpi_tongyong.md](items/accessories/eq_chunqiuxunhongsucaiqiuboxingpi_tongyong.md) |
| items | `eq_chunqiuxunhongxicaiqiuboxingpi_tongyong` | 春秋纁红细裁裘帛行披 | `assets/default/item/accessories/eq_chunqiuxunhongxicaiqiuboxingpi_tongyong.png` | 待出图 | [eq_chunqiuxunhongxicaiqiuboxingpi_tongyong.md](items/accessories/eq_chunqiuxunhongxicaiqiuboxingpi_tongyong.md) |
| items | `eq_chunqiuxunhongxiuyuanqiuboxingpi_tongyong` | 春秋纁红绣缘裘帛行披 | `assets/default/item/accessories/eq_chunqiuxunhongxiuyuanqiuboxingpi_tongyong.png` | 待出图 | [eq_chunqiuxunhongxiuyuanqiuboxingpi_tongyong.md](items/accessories/eq_chunqiuxunhongxiuyuanqiuboxingpi_tongyong.md) |
| items | `eq_qingtongtaotiekui` | 青铜饕餮盔 | `assets/default/item/accessories/eq_qingtongtaotiekui.png` | 待出图 | [eq_qingtongtaotiekui.md](items/accessories/eq_qingtongtaotiekui.md) |
| items | `eq_taotiemianjia` | 饕餮面甲 | `assets/default/item/accessories/eq_taotiemianjia.png` | 待出图 | [eq_taotiemianjia.md](items/accessories/eq_taotiemianjia.md) |
| items | `eq_pijia` | 皮甲 | `assets/default/item/armor/eq_pijia.png` | 待出图 | [eq_pijia.md](items/armor/eq_pijia.md) |
| items | `eq_chunqiubenbaijingxiubodai_nv` | 春秋本白精绣帛带·女 | `assets/default/item/belts/eq_chunqiubenbaijingxiubodai_nv.png` | 待出图 | [eq_chunqiubenbaijingxiubodai_nv.md](items/belts/eq_chunqiubenbaijingxiubodai_nv.md) |
| items | `eq_chunqiubenbaijingxiupandai_nan` | 春秋本白精绣鞶带·男 | `assets/default/item/belts/eq_chunqiubenbaijingxiupandai_nan.png` | 待出图 | [eq_chunqiubenbaijingxiupandai_nan.md](items/belts/eq_chunqiubenbaijingxiupandai_nan.md) |
| items | `eq_chunqiubenbaijinwenbodai_nv` | 春秋本白锦纹帛带·女 | `assets/default/item/belts/eq_chunqiubenbaijinwenbodai_nv.png` | 待出图 | [eq_chunqiubenbaijinwenbodai_nv.md](items/belts/eq_chunqiubenbaijinwenbodai_nv.md) |
| items | `eq_chunqiubenbaijinwenpandai_nan` | 春秋本白锦纹鞶带·男 | `assets/default/item/belts/eq_chunqiubenbaijinwenpandai_nan.png` | 待出图 | [eq_chunqiubenbaijinwenpandai_nan.md](items/belts/eq_chunqiubenbaijinwenpandai_nan.md) |
| items | `eq_chunqiubenbailingwenbodai_nv` | 春秋本白绫纹帛带·女 | `assets/default/item/belts/eq_chunqiubenbailingwenbodai_nv.png` | 待出图 | [eq_chunqiubenbailingwenbodai_nv.md](items/belts/eq_chunqiubenbailingwenbodai_nv.md) |
| items | `eq_chunqiubenbailingwenpandai_nan` | 春秋本白绫纹鞶带·男 | `assets/default/item/belts/eq_chunqiubenbailingwenpandai_nan.png` | 待出图 | [eq_chunqiubenbailingwenpandai_nan.md](items/belts/eq_chunqiubenbailingwenpandai_nan.md) |
| items | `eq_chunqiubenbaisucaibodai_nv` | 春秋本白素裁帛带·女 | `assets/default/item/belts/eq_chunqiubenbaisucaibodai_nv.png` | 待出图 | [eq_chunqiubenbaisucaibodai_nv.md](items/belts/eq_chunqiubenbaisucaibodai_nv.md) |
| items | `eq_chunqiubenbaisucaipandai_nan` | 春秋本白素裁鞶带·男 | `assets/default/item/belts/eq_chunqiubenbaisucaipandai_nan.png` | 待出图 | [eq_chunqiubenbaisucaipandai_nan.md](items/belts/eq_chunqiubenbaisucaipandai_nan.md) |
| items | `eq_chunqiubenbaixicaibodai_nv` | 春秋本白细裁帛带·女 | `assets/default/item/belts/eq_chunqiubenbaixicaibodai_nv.png` | 待出图 | [eq_chunqiubenbaixicaibodai_nv.md](items/belts/eq_chunqiubenbaixicaibodai_nv.md) |
| items | `eq_chunqiubenbaixicaipandai_nan` | 春秋本白细裁鞶带·男 | `assets/default/item/belts/eq_chunqiubenbaixicaipandai_nan.png` | 待出图 | [eq_chunqiubenbaixicaipandai_nan.md](items/belts/eq_chunqiubenbaixicaipandai_nan.md) |
| items | `eq_chunqiubenbaixiuyuanbodai_nv` | 春秋本白绣缘帛带·女 | `assets/default/item/belts/eq_chunqiubenbaixiuyuanbodai_nv.png` | 待出图 | [eq_chunqiubenbaixiuyuanbodai_nv.md](items/belts/eq_chunqiubenbaixiuyuanbodai_nv.md) |
| items | `eq_chunqiubenbaixiuyuanpandai_nan` | 春秋本白绣缘鞶带·男 | `assets/default/item/belts/eq_chunqiubenbaixiuyuanpandai_nan.png` | 待出图 | [eq_chunqiubenbaixiuyuanpandai_nan.md](items/belts/eq_chunqiubenbaixiuyuanpandai_nan.md) |
| items | `eq_chunqiubenbaijingxiuyishang_nan` | 春秋本白精绣衣裳·男 | `assets/default/item/clothing/eq_chunqiubenbaijingxiuyishang_nan.png` | 待出图 | [eq_chunqiubenbaijingxiuyishang_nan.md](items/clothing/eq_chunqiubenbaijingxiuyishang_nan.md) |
| items | `eq_chunqiubenbaijinwenyishang_nan` | 春秋本白锦纹衣裳·男 | `assets/default/item/clothing/eq_chunqiubenbaijinwenyishang_nan.png` | 待出图 | [eq_chunqiubenbaijinwenyishang_nan.md](items/clothing/eq_chunqiubenbaijinwenyishang_nan.md) |
| items | `eq_chunqiubenbailingwenyishang_nan` | 春秋本白绫纹衣裳·男 | `assets/default/item/clothing/eq_chunqiubenbailingwenyishang_nan.png` | 待出图 | [eq_chunqiubenbailingwenyishang_nan.md](items/clothing/eq_chunqiubenbailingwenyishang_nan.md) |
| items | `eq_chunqiubenbaisucaiyishang_nan` | 春秋本白素裁衣裳·男 | `assets/default/item/clothing/eq_chunqiubenbaisucaiyishang_nan.png` | 待出图 | [eq_chunqiubenbaisucaiyishang_nan.md](items/clothing/eq_chunqiubenbaisucaiyishang_nan.md) |
| items | `eq_chunqiubenbaixicaiyishang_nan` | 春秋本白细裁衣裳·男 | `assets/default/item/clothing/eq_chunqiubenbaixicaiyishang_nan.png` | 待出图 | [eq_chunqiubenbaixicaiyishang_nan.md](items/clothing/eq_chunqiubenbaixicaiyishang_nan.md) |
| items | `eq_chunqiubenbaixiuyuanyishang_nan` | 春秋本白绣缘衣裳·男 | `assets/default/item/clothing/eq_chunqiubenbaixiuyuanyishang_nan.png` | 待出图 | [eq_chunqiubenbaixiuyuanyishang_nan.md](items/clothing/eq_chunqiubenbaixiuyuanyishang_nan.md) |
| items | `eq_chunqiusubaijingxiurushang_nv` | 春秋素白精绣襦裳·女 | `assets/default/item/clothing/eq_chunqiusubaijingxiurushang_nv.png` | 待出图 | [eq_chunqiusubaijingxiurushang_nv.md](items/clothing/eq_chunqiusubaijingxiurushang_nv.md) |
| items | `eq_chunqiusubaijinwenrushang_nv` | 春秋素白锦纹襦裳·女 | `assets/default/item/clothing/eq_chunqiusubaijinwenrushang_nv.png` | 待出图 | [eq_chunqiusubaijinwenrushang_nv.md](items/clothing/eq_chunqiusubaijinwenrushang_nv.md) |
| items | `eq_chunqiusubailingwenrushang_nv` | 春秋素白绫纹襦裳·女 | `assets/default/item/clothing/eq_chunqiusubailingwenrushang_nv.png` | 待出图 | [eq_chunqiusubailingwenrushang_nv.md](items/clothing/eq_chunqiusubailingwenrushang_nv.md) |
| items | `eq_chunqiusubaisucairushang_nv` | 春秋素白素裁襦裳·女 | `assets/default/item/clothing/eq_chunqiusubaisucairushang_nv.png` | 待出图 | [eq_chunqiusubaisucairushang_nv.md](items/clothing/eq_chunqiusubaisucairushang_nv.md) |
| items | `eq_chunqiusubaixicairushang_nv` | 春秋素白细裁襦裳·女 | `assets/default/item/clothing/eq_chunqiusubaixicairushang_nv.png` | 待出图 | [eq_chunqiusubaixicairushang_nv.md](items/clothing/eq_chunqiusubaixicairushang_nv.md) |
| items | `eq_chunqiusubaixiuyuanrushang_nv` | 春秋素白绣缘襦裳·女 | `assets/default/item/clothing/eq_chunqiusubaixiuyuanrushang_nv.png` | 待出图 | [eq_chunqiusubaixiuyuanrushang_nv.md](items/clothing/eq_chunqiusubaixiuyuanrushang_nv.md) |
| items | `eq_chunqiuxuanjingxiuyishang_nan` | 春秋玄精绣衣裳·男 | `assets/default/item/clothing/eq_chunqiuxuanjingxiuyishang_nan.png` | 待出图 | [eq_chunqiuxuanjingxiuyishang_nan.md](items/clothing/eq_chunqiuxuanjingxiuyishang_nan.md) |
| items | `eq_chunqiuxuanjinwenyishang_nan` | 春秋玄锦纹衣裳·男 | `assets/default/item/clothing/eq_chunqiuxuanjinwenyishang_nan.png` | 待出图 | [eq_chunqiuxuanjinwenyishang_nan.md](items/clothing/eq_chunqiuxuanjinwenyishang_nan.md) |
| items | `eq_chunqiuxuanlingwenyishang_nan` | 春秋玄绫纹衣裳·男 | `assets/default/item/clothing/eq_chunqiuxuanlingwenyishang_nan.png` | 待出图 | [eq_chunqiuxuanlingwenyishang_nan.md](items/clothing/eq_chunqiuxuanlingwenyishang_nan.md) |
| items | `eq_chunqiuxuansucaiyishang_nan` | 春秋玄素裁衣裳·男 | `assets/default/item/clothing/eq_chunqiuxuansucaiyishang_nan.png` | 待出图 | [eq_chunqiuxuansucaiyishang_nan.md](items/clothing/eq_chunqiuxuansucaiyishang_nan.md) |
| items | `eq_chunqiuxuanxicaiyishang_nan` | 春秋玄细裁衣裳·男 | `assets/default/item/clothing/eq_chunqiuxuanxicaiyishang_nan.png` | 待出图 | [eq_chunqiuxuanxicaiyishang_nan.md](items/clothing/eq_chunqiuxuanxicaiyishang_nan.md) |
| items | `eq_chunqiuxuanxiuyuanyishang_nan` | 春秋玄绣缘衣裳·男 | `assets/default/item/clothing/eq_chunqiuxuanxiuyuanyishang_nan.png` | 待出图 | [eq_chunqiuxuanxiuyuanyishang_nan.md](items/clothing/eq_chunqiuxuanxiuyuanyishang_nan.md) |
| items | `eq_chunqiuxunhongjingxiurushang_nv` | 春秋纁红精绣襦裳·女 | `assets/default/item/clothing/eq_chunqiuxunhongjingxiurushang_nv.png` | 待出图 | [eq_chunqiuxunhongjingxiurushang_nv.md](items/clothing/eq_chunqiuxunhongjingxiurushang_nv.md) |
| items | `eq_chunqiuxunhongjingxiuyishang_nan` | 春秋纁红精绣衣裳·男 | `assets/default/item/clothing/eq_chunqiuxunhongjingxiuyishang_nan.png` | 待出图 | [eq_chunqiuxunhongjingxiuyishang_nan.md](items/clothing/eq_chunqiuxunhongjingxiuyishang_nan.md) |
| items | `eq_chunqiuxunhongjinwenrushang_nv` | 春秋纁红锦纹襦裳·女 | `assets/default/item/clothing/eq_chunqiuxunhongjinwenrushang_nv.png` | 待出图 | [eq_chunqiuxunhongjinwenrushang_nv.md](items/clothing/eq_chunqiuxunhongjinwenrushang_nv.md) |
| items | `eq_chunqiuxunhongjinwenyishang_nan` | 春秋纁红锦纹衣裳·男 | `assets/default/item/clothing/eq_chunqiuxunhongjinwenyishang_nan.png` | 待出图 | [eq_chunqiuxunhongjinwenyishang_nan.md](items/clothing/eq_chunqiuxunhongjinwenyishang_nan.md) |
| items | `eq_chunqiuxunhonglingwenrushang_nv` | 春秋纁红绫纹襦裳·女 | `assets/default/item/clothing/eq_chunqiuxunhonglingwenrushang_nv.png` | 待出图 | [eq_chunqiuxunhonglingwenrushang_nv.md](items/clothing/eq_chunqiuxunhonglingwenrushang_nv.md) |
| items | `eq_chunqiuxunhonglingwenyishang_nan` | 春秋纁红绫纹衣裳·男 | `assets/default/item/clothing/eq_chunqiuxunhonglingwenyishang_nan.png` | 待出图 | [eq_chunqiuxunhonglingwenyishang_nan.md](items/clothing/eq_chunqiuxunhonglingwenyishang_nan.md) |
| items | `eq_chunqiuxunhongsucairushang_nv` | 春秋纁红素裁襦裳·女 | `assets/default/item/clothing/eq_chunqiuxunhongsucairushang_nv.png` | 待出图 | [eq_chunqiuxunhongsucairushang_nv.md](items/clothing/eq_chunqiuxunhongsucairushang_nv.md) |
| items | `eq_chunqiuxunhongsucaiyishang_nan` | 春秋纁红素裁衣裳·男 | `assets/default/item/clothing/eq_chunqiuxunhongsucaiyishang_nan.png` | 待出图 | [eq_chunqiuxunhongsucaiyishang_nan.md](items/clothing/eq_chunqiuxunhongsucaiyishang_nan.md) |
| items | `eq_chunqiuxunhongxicairushang_nv` | 春秋纁红细裁襦裳·女 | `assets/default/item/clothing/eq_chunqiuxunhongxicairushang_nv.png` | 待出图 | [eq_chunqiuxunhongxicairushang_nv.md](items/clothing/eq_chunqiuxunhongxicairushang_nv.md) |
| items | `eq_chunqiuxunhongxicaiyishang_nan` | 春秋纁红细裁衣裳·男 | `assets/default/item/clothing/eq_chunqiuxunhongxicaiyishang_nan.png` | 待出图 | [eq_chunqiuxunhongxicaiyishang_nan.md](items/clothing/eq_chunqiuxunhongxicaiyishang_nan.md) |
| items | `eq_chunqiuxunhongxiuyuanrushang_nv` | 春秋纁红绣缘襦裳·女 | `assets/default/item/clothing/eq_chunqiuxunhongxiuyuanrushang_nv.png` | 待出图 | [eq_chunqiuxunhongxiuyuanrushang_nv.md](items/clothing/eq_chunqiuxunhongxiuyuanrushang_nv.md) |
| items | `eq_chunqiuxunhongxiuyuanyishang_nan` | 春秋纁红绣缘衣裳·男 | `assets/default/item/clothing/eq_chunqiuxunhongxiuyuanyishang_nan.png` | 待出图 | [eq_chunqiuxunhongxiuyuanyishang_nan.md](items/clothing/eq_chunqiuxunhongxiuyuanyishang_nan.md) |
| items | `eq_hupiyi` | 虎皮衣 | `assets/default/item/clothing/eq_hupiyi.png` | 待出图 | [eq_hupiyi.md](items/clothing/eq_hupiyi.md) |
| items | `it_yuanqinshufang` | 元代书房琴 | `assets/default/item/collectibles/it_yuanqinshufang.png` | 待出图 | [it_yuanqinshufang.md](items/collectibles/it_yuanqinshufang.md) |
| items | `eq_chunqiuqianhejingxiumalv_nan` | 春秋浅褐精绣麻履·男 | `assets/default/item/shoes/eq_chunqiuqianhejingxiumalv_nan.png` | 待出图 | [eq_chunqiuqianhejingxiumalv_nan.md](items/shoes/eq_chunqiuqianhejingxiumalv_nan.md) |
| items | `eq_chunqiuqianhejinwenmalv_nan` | 春秋浅褐锦纹麻履·男 | `assets/default/item/shoes/eq_chunqiuqianhejinwenmalv_nan.png` | 待出图 | [eq_chunqiuqianhejinwenmalv_nan.md](items/shoes/eq_chunqiuqianhejinwenmalv_nan.md) |
| items | `eq_chunqiuqianhelingwenmalv_nan` | 春秋浅褐绫纹麻履·男 | `assets/default/item/shoes/eq_chunqiuqianhelingwenmalv_nan.png` | 待出图 | [eq_chunqiuqianhelingwenmalv_nan.md](items/shoes/eq_chunqiuqianhelingwenmalv_nan.md) |
| items | `eq_chunqiuqianhesucaimalv_nan` | 春秋浅褐素裁麻履·男 | `assets/default/item/shoes/eq_chunqiuqianhesucaimalv_nan.png` | 待出图 | [eq_chunqiuqianhesucaimalv_nan.md](items/shoes/eq_chunqiuqianhesucaimalv_nan.md) |
| items | `eq_chunqiuqianhexicaimalv_nan` | 春秋浅褐细裁麻履·男 | `assets/default/item/shoes/eq_chunqiuqianhexicaimalv_nan.png` | 待出图 | [eq_chunqiuqianhexicaimalv_nan.md](items/shoes/eq_chunqiuqianhexicaimalv_nan.md) |
| items | `eq_chunqiuqianhexiuyuanmalv_nan` | 春秋浅褐绣缘麻履·男 | `assets/default/item/shoes/eq_chunqiuqianhexiuyuanmalv_nan.png` | 待出图 | [eq_chunqiuqianhexiuyuanmalv_nan.md](items/shoes/eq_chunqiuqianhexiuyuanmalv_nan.md) |
| items | `eq_chunqiusubaijingxiusulv_nv` | 春秋素白精绣素履·女 | `assets/default/item/shoes/eq_chunqiusubaijingxiusulv_nv.png` | 待出图 | [eq_chunqiusubaijingxiusulv_nv.md](items/shoes/eq_chunqiusubaijingxiusulv_nv.md) |
| items | `eq_chunqiusubaijinwensulv_nv` | 春秋素白锦纹素履·女 | `assets/default/item/shoes/eq_chunqiusubaijinwensulv_nv.png` | 待出图 | [eq_chunqiusubaijinwensulv_nv.md](items/shoes/eq_chunqiusubaijinwensulv_nv.md) |
| items | `eq_chunqiusubailingwensulv_nv` | 春秋素白绫纹素履·女 | `assets/default/item/shoes/eq_chunqiusubailingwensulv_nv.png` | 待出图 | [eq_chunqiusubailingwensulv_nv.md](items/shoes/eq_chunqiusubailingwensulv_nv.md) |
| items | `eq_chunqiusubaisucaisulv_nv` | 春秋素白素裁素履·女 | `assets/default/item/shoes/eq_chunqiusubaisucaisulv_nv.png` | 待出图 | [eq_chunqiusubaisucaisulv_nv.md](items/shoes/eq_chunqiusubaisucaisulv_nv.md) |
| items | `eq_chunqiusubaixicaisulv_nv` | 春秋素白细裁素履·女 | `assets/default/item/shoes/eq_chunqiusubaixicaisulv_nv.png` | 待出图 | [eq_chunqiusubaixicaisulv_nv.md](items/shoes/eq_chunqiusubaixicaisulv_nv.md) |
| items | `eq_chunqiusubaixiuyuansulv_nv` | 春秋素白绣缘素履·女 | `assets/default/item/shoes/eq_chunqiusubaixiuyuansulv_nv.png` | 待出图 | [eq_chunqiusubaixiuyuansulv_nv.md](items/shoes/eq_chunqiusubaixiuyuansulv_nv.md) |
| maps | `map_jianghu_world__ink_base` | 江湖万里图 · 水墨衬纸（全国底图） | `assets/default/map/jianghu_world/ink_base.png` | 待出图 | [jianghu_world_ink_base.md](maps/jianghu_world_ink_base.md) |
| maps | `map_region_donghai_islands__base` | 东海诸岛区域局部图 | `assets/default/map/regions/rg_donghai_islands.png` | 待出图 | [rg_donghai_islands.md](maps/region/rg_donghai_islands.md) |
| maps | `map_region_huxiang__base` | 湖湘区域局部图 | `assets/default/map/regions/rg_huxiang.png` | 待出图 | [rg_huxiang.md](maps/region/rg_huxiang.md) |
| maps | `map_region_jianghuai__base` | 江淮区域局部图 | `assets/default/map/regions/rg_jianghuai.png` | 待出图 | [rg_jianghuai.md](maps/region/rg_jianghuai.md) |
| maps | `map_region_jiangxi__base` | 江西区域局部图 | `assets/default/map/regions/rg_jiangxi.png` | 待出图 | [rg_jiangxi.md](maps/region/rg_jiangxi.md) |
| maps | `map_region_qilu__base` | 齐鲁区域局部图 | `assets/default/map/regions/rg_qilu.png` | 待出图 | [rg_qilu.md](maps/region/rg_qilu.md) |
| maps | `map_region_qingzang__base` | 青藏区域局部图 | `assets/default/map/regions/rg_qingzang.png` | 待出图 | [rg_qingzang.md](maps/region/rg_qingzang.md) |
| maps | `map_region_yundian_qianzhong__base` | 云滇黔中区域局部图 | `assets/default/map/regions/rg_yundian_qianzhong.png` | 待出图 | [rg_yundian_qianzhong.md](maps/region/rg_yundian_qianzhong.md) |

## 物品（11 类，名录 1118 项）

每张图的提示词在各文件「提示词」节。下表只列还要出的行（待出图 / 待重出），已入库的不再列出，标题里的计数含已出部分。作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可回到队列。

### 药物 / 补品 / 药材（96）· 已入库 64、已通过（作者） 32

（已全部入库。）

### 食材 / 食品（174）· 已入库 146、已通过（作者） 28

（已全部入库。）

### 武学秘籍（180）· 已入库 180

（已全部入库。）

### 兵器（247）· 已入库 223、已通过（作者） 24

（已全部入库。）

### 衣物（61）· 待出图 31、已入库 18、已通过（作者） 12

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 春秋本白精绣衣裳·男 | `eq_chunqiubenbaijingxiuyishang_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_chunqiubenbaijingxiuyishang_nan.md](items/clothing/eq_chunqiubenbaijingxiuyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 2 | 春秋本白锦纹衣裳·男 | `eq_chunqiubenbaijinwenyishang_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_chunqiubenbaijinwenyishang_nan.md](items/clothing/eq_chunqiubenbaijinwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 3 | 春秋本白绣缘衣裳·男 | `eq_chunqiubenbaixiuyuanyishang_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_chunqiubenbaixiuyuanyishang_nan.md](items/clothing/eq_chunqiubenbaixiuyuanyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 4 | 春秋素白精绣襦裳·女 | `eq_chunqiusubaijingxiurushang_nv` | 地上 | 衣物·衫裙 | 待出图 | [eq_chunqiusubaijingxiurushang_nv.md](items/clothing/eq_chunqiusubaijingxiurushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 5 | 春秋素白锦纹襦裳·女 | `eq_chunqiusubaijinwenrushang_nv` | 地下 | 衣物·衫裙 | 待出图 | [eq_chunqiusubaijinwenrushang_nv.md](items/clothing/eq_chunqiusubaijinwenrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 6 | 春秋素白绣缘襦裳·女 | `eq_chunqiusubaixiuyuanrushang_nv` | 地中 | 衣物·衫裙 | 待出图 | [eq_chunqiusubaixiuyuanrushang_nv.md](items/clothing/eq_chunqiusubaixiuyuanrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 7 | 春秋玄精绣衣裳·男 | `eq_chunqiuxuanjingxiuyishang_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_chunqiuxuanjingxiuyishang_nan.md](items/clothing/eq_chunqiuxuanjingxiuyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 8 | 春秋玄锦纹衣裳·男 | `eq_chunqiuxuanjinwenyishang_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_chunqiuxuanjinwenyishang_nan.md](items/clothing/eq_chunqiuxuanjinwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 9 | 春秋玄绣缘衣裳·男 | `eq_chunqiuxuanxiuyuanyishang_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_chunqiuxuanxiuyuanyishang_nan.md](items/clothing/eq_chunqiuxuanxiuyuanyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 10 | 春秋纁红精绣襦裳·女 | `eq_chunqiuxunhongjingxiurushang_nv` | 地上 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhongjingxiurushang_nv.md](items/clothing/eq_chunqiuxunhongjingxiurushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 11 | 春秋纁红精绣衣裳·男 | `eq_chunqiuxunhongjingxiuyishang_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhongjingxiuyishang_nan.md](items/clothing/eq_chunqiuxunhongjingxiuyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 12 | 春秋纁红锦纹襦裳·女 | `eq_chunqiuxunhongjinwenrushang_nv` | 地下 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhongjinwenrushang_nv.md](items/clothing/eq_chunqiuxunhongjinwenrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 13 | 春秋纁红锦纹衣裳·男 | `eq_chunqiuxunhongjinwenyishang_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhongjinwenyishang_nan.md](items/clothing/eq_chunqiuxunhongjinwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 14 | 春秋纁红绣缘襦裳·女 | `eq_chunqiuxunhongxiuyuanrushang_nv` | 地中 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhongxiuyuanrushang_nv.md](items/clothing/eq_chunqiuxunhongxiuyuanrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 15 | 春秋纁红绣缘衣裳·男 | `eq_chunqiuxunhongxiuyuanyishang_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhongxiuyuanyishang_nan.md](items/clothing/eq_chunqiuxunhongxiuyuanyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 16 | 春秋本白绫纹衣裳·男 | `eq_chunqiubenbailingwenyishang_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_chunqiubenbailingwenyishang_nan.md](items/clothing/eq_chunqiubenbailingwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 17 | 春秋本白细裁衣裳·男 | `eq_chunqiubenbaixicaiyishang_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_chunqiubenbaixicaiyishang_nan.md](items/clothing/eq_chunqiubenbaixicaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 18 | 春秋素白绫纹襦裳·女 | `eq_chunqiusubailingwenrushang_nv` | 玄上 | 衣物·衫裙 | 待出图 | [eq_chunqiusubailingwenrushang_nv.md](items/clothing/eq_chunqiusubailingwenrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 19 | 春秋素白细裁襦裳·女 | `eq_chunqiusubaixicairushang_nv` | 玄下 | 衣物·衫裙 | 待出图 | [eq_chunqiusubaixicairushang_nv.md](items/clothing/eq_chunqiusubaixicairushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 20 | 春秋玄绫纹衣裳·男 | `eq_chunqiuxuanlingwenyishang_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_chunqiuxuanlingwenyishang_nan.md](items/clothing/eq_chunqiuxuanlingwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 21 | 春秋玄细裁衣裳·男 | `eq_chunqiuxuanxicaiyishang_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_chunqiuxuanxicaiyishang_nan.md](items/clothing/eq_chunqiuxuanxicaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 22 | 春秋纁红绫纹襦裳·女 | `eq_chunqiuxunhonglingwenrushang_nv` | 玄上 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhonglingwenrushang_nv.md](items/clothing/eq_chunqiuxunhonglingwenrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 23 | 春秋纁红绫纹衣裳·男 | `eq_chunqiuxunhonglingwenyishang_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhonglingwenyishang_nan.md](items/clothing/eq_chunqiuxunhonglingwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 24 | 春秋纁红细裁襦裳·女 | `eq_chunqiuxunhongxicairushang_nv` | 玄下 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhongxicairushang_nv.md](items/clothing/eq_chunqiuxunhongxicairushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 25 | 春秋纁红细裁衣裳·男 | `eq_chunqiuxunhongxicaiyishang_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhongxicaiyishang_nan.md](items/clothing/eq_chunqiuxunhongxicaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 26 | 春秋本白素裁衣裳·男 | `eq_chunqiubenbaisucaiyishang_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_chunqiubenbaisucaiyishang_nan.md](items/clothing/eq_chunqiubenbaisucaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 27 | 春秋素白素裁襦裳·女 | `eq_chunqiusubaisucairushang_nv` | 黄中 | 衣物·衫裙 | 待出图 | [eq_chunqiusubaisucairushang_nv.md](items/clothing/eq_chunqiusubaisucairushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 28 | 春秋玄素裁衣裳·男 | `eq_chunqiuxuansucaiyishang_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_chunqiuxuansucaiyishang_nan.md](items/clothing/eq_chunqiuxuansucaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 29 | 春秋纁红素裁襦裳·女 | `eq_chunqiuxunhongsucairushang_nv` | 黄中 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhongsucairushang_nv.md](items/clothing/eq_chunqiuxunhongsucairushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 30 | 春秋纁红素裁衣裳·男 | `eq_chunqiuxunhongsucaiyishang_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhongsucaiyishang_nan.md](items/clothing/eq_chunqiuxunhongsucaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 31 | 虎皮衣 | `eq_hupiyi` | 黄中 | 衣物·皮衣 | 待出图 | [eq_hupiyi.md](items/clothing/eq_hupiyi.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |

### 制式盔甲（9）· 已入库 8、待出图 1

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 皮甲 | `eq_pijia` | 玄下 | 制式盔甲·皮札 | 待出图 | [eq_pijia.md](items/armor/eq_pijia.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |

### 内甲（8）· 已通过（作者） 8

（已全部入库。）

### 护肩 / 披风 / 头饰（65）· 已入库 36、待出图 17、已通过（作者） 12

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 春秋浅黄精绣束发冠巾·男 | `eq_chunqiuqianhuangjingxiushufaguanjin_nan` | 地上 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuangjingxiushufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangjingxiushufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 2 | 春秋浅黄锦纹束发冠巾·男 | `eq_chunqiuqianhuangjinwenshufaguanjin_nan` | 地下 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuangjinwenshufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangjinwenshufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 3 | 春秋浅黄绣缘束发冠巾·男 | `eq_chunqiuqianhuangxiuyuanshufaguanjin_nan` | 地中 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuangxiuyuanshufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangxiuyuanshufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 4 | 春秋素白精绣笄饰·女 | `eq_chunqiusubaijingxiujishi_nv` | 地上 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubaijingxiujishi_nv.md](items/accessories/eq_chunqiusubaijingxiujishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 5 | 春秋素白锦纹笄饰·女 | `eq_chunqiusubaijinwenjishi_nv` | 地下 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubaijinwenjishi_nv.md](items/accessories/eq_chunqiusubaijinwenjishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 6 | 春秋素白绣缘笄饰·女 | `eq_chunqiusubaixiuyuanjishi_nv` | 地中 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubaixiuyuanjishi_nv.md](items/accessories/eq_chunqiusubaixiuyuanjishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 7 | 春秋纁红绣缘裘帛行披 | `eq_chunqiuxunhongxiuyuanqiuboxingpi_tongyong` | 地中 | 披风·围披 | 待出图 | [eq_chunqiuxunhongxiuyuanqiuboxingpi_tongyong.md](items/accessories/eq_chunqiuxunhongxiuyuanqiuboxingpi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 8 | 青铜饕餮盔 | `eq_qingtongtaotiekui` | 地下 | 头饰·青铜盔 | 待出图 | [eq_qingtongtaotiekui.md](items/accessories/eq_qingtongtaotiekui.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 9 | 春秋浅黄绫纹束发冠巾·男 | `eq_chunqiuqianhuanglingwenshufaguanjin_nan` | 玄上 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuanglingwenshufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuanglingwenshufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 10 | 春秋浅黄细裁束发冠巾·男 | `eq_chunqiuqianhuangxicaishufaguanjin_nan` | 玄下 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuangxicaishufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangxicaishufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 11 | 春秋素白绫纹笄饰·女 | `eq_chunqiusubailingwenjishi_nv` | 玄上 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubailingwenjishi_nv.md](items/accessories/eq_chunqiusubailingwenjishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 12 | 春秋素白细裁笄饰·女 | `eq_chunqiusubaixicaijishi_nv` | 玄下 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubaixicaijishi_nv.md](items/accessories/eq_chunqiusubaixicaijishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 13 | 春秋纁红细裁裘帛行披 | `eq_chunqiuxunhongxicaiqiuboxingpi_tongyong` | 玄中 | 披风·围披 | 待出图 | [eq_chunqiuxunhongxicaiqiuboxingpi_tongyong.md](items/accessories/eq_chunqiuxunhongxicaiqiuboxingpi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 14 | 饕餮面甲 | `eq_taotiemianjia` | 玄上 | 头饰·面甲 | 待出图 | [eq_taotiemianjia.md](items/accessories/eq_taotiemianjia.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 15 | 春秋浅黄素裁束发冠巾·男 | `eq_chunqiuqianhuangsucaishufaguanjin_nan` | 黄中 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuangsucaishufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangsucaishufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 16 | 春秋素白素裁笄饰·女 | `eq_chunqiusubaisucaijishi_nv` | 黄中 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubaisucaijishi_nv.md](items/accessories/eq_chunqiusubaisucaijishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 17 | 春秋纁红素裁裘帛行披 | `eq_chunqiuxunhongsucaiqiuboxingpi_tongyong` | 黄中 | 披风·围披 | 待出图 | [eq_chunqiuxunhongsucaiqiuboxingpi_tongyong.md](items/accessories/eq_chunqiuxunhongsucaiqiuboxingpi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |

### 鞋（38）· 已入库 18、待出图 12、已通过（作者） 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 春秋浅褐精绣麻履·男 | `eq_chunqiuqianhejingxiumalv_nan` | 地上 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhejingxiumalv_nan.md](items/shoes/eq_chunqiuqianhejingxiumalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 2 | 春秋浅褐锦纹麻履·男 | `eq_chunqiuqianhejinwenmalv_nan` | 地下 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhejinwenmalv_nan.md](items/shoes/eq_chunqiuqianhejinwenmalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 3 | 春秋浅褐绣缘麻履·男 | `eq_chunqiuqianhexiuyuanmalv_nan` | 地中 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhexiuyuanmalv_nan.md](items/shoes/eq_chunqiuqianhexiuyuanmalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 4 | 春秋素白精绣素履·女 | `eq_chunqiusubaijingxiusulv_nv` | 地上 | 鞋·履靴 | 待出图 | [eq_chunqiusubaijingxiusulv_nv.md](items/shoes/eq_chunqiusubaijingxiusulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 5 | 春秋素白锦纹素履·女 | `eq_chunqiusubaijinwensulv_nv` | 地下 | 鞋·履靴 | 待出图 | [eq_chunqiusubaijinwensulv_nv.md](items/shoes/eq_chunqiusubaijinwensulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 6 | 春秋素白绣缘素履·女 | `eq_chunqiusubaixiuyuansulv_nv` | 地中 | 鞋·履靴 | 待出图 | [eq_chunqiusubaixiuyuansulv_nv.md](items/shoes/eq_chunqiusubaixiuyuansulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 7 | 春秋浅褐绫纹麻履·男 | `eq_chunqiuqianhelingwenmalv_nan` | 玄上 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhelingwenmalv_nan.md](items/shoes/eq_chunqiuqianhelingwenmalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 8 | 春秋浅褐细裁麻履·男 | `eq_chunqiuqianhexicaimalv_nan` | 玄下 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhexicaimalv_nan.md](items/shoes/eq_chunqiuqianhexicaimalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 9 | 春秋素白绫纹素履·女 | `eq_chunqiusubailingwensulv_nv` | 玄上 | 鞋·履靴 | 待出图 | [eq_chunqiusubailingwensulv_nv.md](items/shoes/eq_chunqiusubailingwensulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 10 | 春秋素白细裁素履·女 | `eq_chunqiusubaixicaisulv_nv` | 玄下 | 鞋·履靴 | 待出图 | [eq_chunqiusubaixicaisulv_nv.md](items/shoes/eq_chunqiusubaixicaisulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 11 | 春秋浅褐素裁麻履·男 | `eq_chunqiuqianhesucaimalv_nan` | 黄中 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhesucaimalv_nan.md](items/shoes/eq_chunqiuqianhesucaimalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 12 | 春秋素白素裁素履·女 | `eq_chunqiusubaisucaisulv_nv` | 黄中 | 鞋·履靴 | 待出图 | [eq_chunqiusubaisucaisulv_nv.md](items/shoes/eq_chunqiusubaisucaisulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |

### 腰带（38）· 已入库 18、待出图 12、已通过（作者） 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 春秋本白精绣帛带·女 | `eq_chunqiubenbaijingxiubodai_nv` | 地上 | 腰带·束带 | 待出图 | [eq_chunqiubenbaijingxiubodai_nv.md](items/belts/eq_chunqiubenbaijingxiubodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 2 | 春秋本白精绣鞶带·男 | `eq_chunqiubenbaijingxiupandai_nan` | 地上 | 腰带·束带 | 待出图 | [eq_chunqiubenbaijingxiupandai_nan.md](items/belts/eq_chunqiubenbaijingxiupandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 3 | 春秋本白锦纹帛带·女 | `eq_chunqiubenbaijinwenbodai_nv` | 地下 | 腰带·束带 | 待出图 | [eq_chunqiubenbaijinwenbodai_nv.md](items/belts/eq_chunqiubenbaijinwenbodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 4 | 春秋本白锦纹鞶带·男 | `eq_chunqiubenbaijinwenpandai_nan` | 地下 | 腰带·束带 | 待出图 | [eq_chunqiubenbaijinwenpandai_nan.md](items/belts/eq_chunqiubenbaijinwenpandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 5 | 春秋本白绣缘帛带·女 | `eq_chunqiubenbaixiuyuanbodai_nv` | 地中 | 腰带·束带 | 待出图 | [eq_chunqiubenbaixiuyuanbodai_nv.md](items/belts/eq_chunqiubenbaixiuyuanbodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 6 | 春秋本白绣缘鞶带·男 | `eq_chunqiubenbaixiuyuanpandai_nan` | 地中 | 腰带·束带 | 待出图 | [eq_chunqiubenbaixiuyuanpandai_nan.md](items/belts/eq_chunqiubenbaixiuyuanpandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 7 | 春秋本白绫纹帛带·女 | `eq_chunqiubenbailingwenbodai_nv` | 玄上 | 腰带·束带 | 待出图 | [eq_chunqiubenbailingwenbodai_nv.md](items/belts/eq_chunqiubenbailingwenbodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 8 | 春秋本白绫纹鞶带·男 | `eq_chunqiubenbailingwenpandai_nan` | 玄上 | 腰带·束带 | 待出图 | [eq_chunqiubenbailingwenpandai_nan.md](items/belts/eq_chunqiubenbailingwenpandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 9 | 春秋本白细裁帛带·女 | `eq_chunqiubenbaixicaibodai_nv` | 玄下 | 腰带·束带 | 待出图 | [eq_chunqiubenbaixicaibodai_nv.md](items/belts/eq_chunqiubenbaixicaibodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 10 | 春秋本白细裁鞶带·男 | `eq_chunqiubenbaixicaipandai_nan` | 玄下 | 腰带·束带 | 待出图 | [eq_chunqiubenbaixicaipandai_nan.md](items/belts/eq_chunqiubenbaixicaipandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 11 | 春秋本白素裁帛带·女 | `eq_chunqiubenbaisucaibodai_nv` | 黄中 | 腰带·束带 | 待出图 | [eq_chunqiubenbaisucaibodai_nv.md](items/belts/eq_chunqiubenbaisucaibodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 12 | 春秋本白素裁鞶带·男 | `eq_chunqiubenbaisucaipandai_nan` | 黄中 | 腰带·束带 | 待出图 | [eq_chunqiubenbaisucaipandai_nan.md](items/belts/eq_chunqiubenbaisucaipandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |

### 暗器（51）· 已入库 51

（已全部入库。）

## 地图（31）· 已入库 23、待出图 8

全国导航图是 `tools/map/render_map.py` 从 design/19 数据生成的 SVG（14 个时代图层），**不是出图任务**。要画的是 30 个区域的水墨局部图（类比作者已审的大理苍洱局部图）；全国水墨衬纸为可选项。下表只列还要出的。

| # | 名称 | asset_id | 输出 | 图 | 提示词 |
|---:|---|---|---|---|---|
| 1 | 东海诸岛区域局部图 | `map_region_donghai_islands__base` | `assets/default/map/regions/rg_donghai_islands.png` | 待出图 | [rg_donghai_islands.md](maps/region/rg_donghai_islands.md) |
| 2 | 湖湘区域局部图 | `map_region_huxiang__base` | `assets/default/map/regions/rg_huxiang.png` | 待出图 | [rg_huxiang.md](maps/region/rg_huxiang.md) |
| 3 | 江淮区域局部图 | `map_region_jianghuai__base` | `assets/default/map/regions/rg_jianghuai.png` | 待出图 | [rg_jianghuai.md](maps/region/rg_jianghuai.md) |
| 4 | 江西区域局部图 | `map_region_jiangxi__base` | `assets/default/map/regions/rg_jiangxi.png` | 待出图 | [rg_jiangxi.md](maps/region/rg_jiangxi.md) |
| 5 | 齐鲁区域局部图 | `map_region_qilu__base` | `assets/default/map/regions/rg_qilu.png` | 待出图 | [rg_qilu.md](maps/region/rg_qilu.md) |
| 6 | 青藏区域局部图 | `map_region_qingzang__base` | `assets/default/map/regions/rg_qingzang.png` | 待出图 | [rg_qingzang.md](maps/region/rg_qingzang.md) |
| 7 | 云滇黔中区域局部图 | `map_region_yundian_qianzhong__base` | `assets/default/map/regions/rg_yundian_qianzhong.png` | 待出图 | [rg_yundian_qianzhong.md](maps/region/rg_yundian_qianzhong.md) |
| 8 | 江湖万里图 · 水墨衬纸（全国底图） | `map_jianghu_world__ink_base` | `assets/default/map/jianghu_world/ink_base.png` | 待出图（可选） | [jianghu_world_ink_base.md](maps/jianghu_world_ink_base.md) |

## 角色分层部件（AR-22，tech/09）

两套标准体型各 3 张全身参考图 + 13 部件 × 3 视图 = 42 份。**顺序**：先出该视图的全身参考图，再以它为唯一图片输入逐部件出图；全部出完跑 `python3 tools/rig/make_parts.py assets/default/rig/<set>` 裁边定枢轴写 manifest，`python3 tools/rig/preview.py assets/default/rig/<set> --out assets/default/rig/<set>/preview.png` 看姿势条带。是否现在就出由作者定。

| 体型集 | 视图 | 参考图 | 部件（13） | 图 |
|---|---|---|---|---|
| male_std | front34 | [ref_front34.md](rig/male_std/ref_front34.md)（已入库） | （已全部入库） | 已入库 13 |
| male_std | back34 | [ref_back34.md](rig/male_std/ref_back34.md)（已入库） | （已全部入库） | 已入库 13 |
| male_std | side | [ref_side.md](rig/male_std/ref_side.md)（已入库） | （已全部入库） | 已入库 13 |
| female_std | front34 | [ref_front34.md](rig/female_std/ref_front34.md)（已入库） | （已全部入库） | 已入库 13 |
| female_std | back34 | [ref_back34.md](rig/female_std/ref_back34.md)（已入库） | （已全部入库） | 已入库 13 |
| female_std | side | [ref_side.md](rig/female_std/ref_side.md)（已入库） | （已全部入库） | 已入库 13 |

## 建筑套件与贴片（已出齐，只列完成度）

| 套件 | 建筑 | 贴片 | 历史图片重出 | 目录 |
|---|---:|---:|---|---|
| liao_jin_north | 19 | 7 | ✓ 全部 | `assets/default/building-map/liao_jin_north/`、`assets/default/tile/liao_jin_north/` |
| ming_north | 19 | 7 | ✓ 全部 | `assets/default/building-map/ming_north/`、`assets/default/tile/ming_north/` |
| ming_south | 19 | 7 | ✓ 全部 | `assets/default/building-map/ming_south/`、`assets/default/tile/ming_south/` |
| mongol | 19 | 7 | ✓ 全部 | `assets/default/building-map/mongol/`、`assets/default/tile/mongol/` |
| qing_north | 19 | 7 | ✓ 全部 | `assets/default/building-map/qing_north/`、`assets/default/tile/qing_north/` |
| qing_south | 19 | 7 | ✓ 全部 | `assets/default/building-map/qing_south/`、`assets/default/tile/qing_south/` |
| song_north | 19 | 7 | ✓ 全部 | `assets/default/building-map/song_north/`、`assets/default/tile/song_north/` |
| tubo | 19 | 7 | ✓ 全部 | `assets/default/building-map/tubo/`、`assets/default/tile/tubo/` |
| xiyu | 19 | 7 | ✓ 全部 | `assets/default/building-map/xiyu/`、`assets/default/tile/xiyu/` |
| yuan_north | 19 | 7 | ✓ 全部 | `assets/default/building-map/yuan_north/`、`assets/default/tile/yuan_north/` |
| yuan_south | 19 | 7 | ✓ 全部 | `assets/default/building-map/yuan_south/`、`assets/default/tile/yuan_south/` |
| song_dali（基线，作者已审） | 17 | — | ✗ 未重出（待作者定） | `assets/default/baseline/building-map/` |
| song_southern（基线，作者已审） | 18 | — | ✗ 未重出（待作者定） | `assets/default/baseline/building-map/` |
| 通用贴片（基线 TOWN-tiles） | — | 64 | — | `assets/default/baseline/tile/` |

全部 11 套年代套件均已按历史图片重出并合入；城镇合成图由 `tools/town/` 代码用这些素材拼装，不是出图任务。基线两套宋套件是否也按历史图片重出，待作者定（要做就复制 `tools/agents/prompts/KIT.md` 的做法）。
