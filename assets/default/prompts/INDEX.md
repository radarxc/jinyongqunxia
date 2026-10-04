# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）

> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。
> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。

提示词 **1446** 份：已入库 1019、待出图 295、已通过（作者） 132。**待出图队列 295 行**（`python3 tools/agents/build_image_index.py --queue`）。

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
| items | `eq_beisongfeihongsucaixinglvweipi_tongyong` | 北宋绯红素裁行旅围披 | `assets/default/item/accessories/eq_beisongfeihongsucaixinglvweipi_tongyong.png` | 待出图 | [eq_beisongfeihongsucaixinglvweipi_tongyong.md](items/accessories/eq_beisongfeihongsucaixinglvweipi_tongyong.md) |
| items | `eq_beisongfeihongxicaixinglvweipi_tongyong` | 北宋绯红细裁行旅围披 | `assets/default/item/accessories/eq_beisongfeihongxicaixinglvweipi_tongyong.png` | 待出图 | [eq_beisongfeihongxicaixinglvweipi_tongyong.md](items/accessories/eq_beisongfeihongxicaixinglvweipi_tongyong.md) |
| items | `eq_beisongfeihongxiuyuanxinglvweipi_tongyong` | 北宋绯红绣缘行旅围披 | `assets/default/item/accessories/eq_beisongfeihongxiuyuanxinglvweipi_tongyong.png` | 待出图 | [eq_beisongfeihongxiuyuanxinglvweipi_tongyong.md](items/accessories/eq_beisongfeihongxiuyuanxinglvweipi_tongyong.md) |
| items | `eq_beisongqianhuangjingxiufangfujin_nan` | 北宋浅黄精绣方幅巾·男 | `assets/default/item/accessories/eq_beisongqianhuangjingxiufangfujin_nan.png` | 待出图 | [eq_beisongqianhuangjingxiufangfujin_nan.md](items/accessories/eq_beisongqianhuangjingxiufangfujin_nan.md) |
| items | `eq_beisongqianhuangjinwenfangfujin_nan` | 北宋浅黄锦纹方幅巾·男 | `assets/default/item/accessories/eq_beisongqianhuangjinwenfangfujin_nan.png` | 待出图 | [eq_beisongqianhuangjinwenfangfujin_nan.md](items/accessories/eq_beisongqianhuangjinwenfangfujin_nan.md) |
| items | `eq_beisongqianhuanglingwenfangfujin_nan` | 北宋浅黄绫纹方幅巾·男 | `assets/default/item/accessories/eq_beisongqianhuanglingwenfangfujin_nan.png` | 待出图 | [eq_beisongqianhuanglingwenfangfujin_nan.md](items/accessories/eq_beisongqianhuanglingwenfangfujin_nan.md) |
| items | `eq_beisongqianhuangsucaifangfujin_nan` | 北宋浅黄素裁方幅巾·男 | `assets/default/item/accessories/eq_beisongqianhuangsucaifangfujin_nan.png` | 待出图 | [eq_beisongqianhuangsucaifangfujin_nan.md](items/accessories/eq_beisongqianhuangsucaifangfujin_nan.md) |
| items | `eq_beisongqianhuangxicaifangfujin_nan` | 北宋浅黄细裁方幅巾·男 | `assets/default/item/accessories/eq_beisongqianhuangxicaifangfujin_nan.png` | 待出图 | [eq_beisongqianhuangxicaifangfujin_nan.md](items/accessories/eq_beisongqianhuangxicaifangfujin_nan.md) |
| items | `eq_beisongqianhuangxiuyuanfangfujin_nan` | 北宋浅黄绣缘方幅巾·男 | `assets/default/item/accessories/eq_beisongqianhuangxiuyuanfangfujin_nan.png` | 待出图 | [eq_beisongqianhuangxiuyuanfangfujin_nan.md](items/accessories/eq_beisongqianhuangxiuyuanfangfujin_nan.md) |
| items | `eq_beisongsubaijingxiuboshushi_nv` | 北宋素白精绣帛梳饰·女 | `assets/default/item/accessories/eq_beisongsubaijingxiuboshushi_nv.png` | 待出图 | [eq_beisongsubaijingxiuboshushi_nv.md](items/accessories/eq_beisongsubaijingxiuboshushi_nv.md) |
| items | `eq_beisongsubaijinwenboshushi_nv` | 北宋素白锦纹帛梳饰·女 | `assets/default/item/accessories/eq_beisongsubaijinwenboshushi_nv.png` | 待出图 | [eq_beisongsubaijinwenboshushi_nv.md](items/accessories/eq_beisongsubaijinwenboshushi_nv.md) |
| items | `eq_beisongsubailingwenboshushi_nv` | 北宋素白绫纹帛梳饰·女 | `assets/default/item/accessories/eq_beisongsubailingwenboshushi_nv.png` | 待出图 | [eq_beisongsubailingwenboshushi_nv.md](items/accessories/eq_beisongsubailingwenboshushi_nv.md) |
| items | `eq_beisongsubaisucaiboshushi_nv` | 北宋素白素裁帛梳饰·女 | `assets/default/item/accessories/eq_beisongsubaisucaiboshushi_nv.png` | 待出图 | [eq_beisongsubaisucaiboshushi_nv.md](items/accessories/eq_beisongsubaisucaiboshushi_nv.md) |
| items | `eq_beisongsubaixicaiboshushi_nv` | 北宋素白细裁帛梳饰·女 | `assets/default/item/accessories/eq_beisongsubaixicaiboshushi_nv.png` | 待出图 | [eq_beisongsubaixicaiboshushi_nv.md](items/accessories/eq_beisongsubaixicaiboshushi_nv.md) |
| items | `eq_beisongsubaixiuyuanboshushi_nv` | 北宋素白绣缘帛梳饰·女 | `assets/default/item/accessories/eq_beisongsubaixiuyuanboshushi_nv.png` | 待出图 | [eq_beisongsubaixiuyuanboshushi_nv.md](items/accessories/eq_beisongsubaixiuyuanboshushi_nv.md) |
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
| items | `eq_nansongfeihongsucaisuyuanweipi_tongyong` | 南宋绯红素裁素缘围披 | `assets/default/item/accessories/eq_nansongfeihongsucaisuyuanweipi_tongyong.png` | 待出图 | [eq_nansongfeihongsucaisuyuanweipi_tongyong.md](items/accessories/eq_nansongfeihongsucaisuyuanweipi_tongyong.md) |
| items | `eq_nansongfeihongxicaisuyuanweipi_tongyong` | 南宋绯红细裁素缘围披 | `assets/default/item/accessories/eq_nansongfeihongxicaisuyuanweipi_tongyong.png` | 待出图 | [eq_nansongfeihongxicaisuyuanweipi_tongyong.md](items/accessories/eq_nansongfeihongxicaisuyuanweipi_tongyong.md) |
| items | `eq_nansongfeihongxiuyuansuyuanweipi_tongyong` | 南宋绯红绣缘素缘围披 | `assets/default/item/accessories/eq_nansongfeihongxiuyuansuyuanweipi_tongyong.png` | 待出图 | [eq_nansongfeihongxiuyuansuyuanweipi_tongyong.md](items/accessories/eq_nansongfeihongxiuyuansuyuanweipi_tongyong.md) |
| items | `eq_nansongqianhuangjingxiuzhejiaofujin_nan` | 南宋浅黄精绣折角幅巾·男 | `assets/default/item/accessories/eq_nansongqianhuangjingxiuzhejiaofujin_nan.png` | 待出图 | [eq_nansongqianhuangjingxiuzhejiaofujin_nan.md](items/accessories/eq_nansongqianhuangjingxiuzhejiaofujin_nan.md) |
| items | `eq_nansongqianhuangjinwenzhejiaofujin_nan` | 南宋浅黄锦纹折角幅巾·男 | `assets/default/item/accessories/eq_nansongqianhuangjinwenzhejiaofujin_nan.png` | 待出图 | [eq_nansongqianhuangjinwenzhejiaofujin_nan.md](items/accessories/eq_nansongqianhuangjinwenzhejiaofujin_nan.md) |
| items | `eq_nansongqianhuanglingwenzhejiaofujin_nan` | 南宋浅黄绫纹折角幅巾·男 | `assets/default/item/accessories/eq_nansongqianhuanglingwenzhejiaofujin_nan.png` | 待出图 | [eq_nansongqianhuanglingwenzhejiaofujin_nan.md](items/accessories/eq_nansongqianhuanglingwenzhejiaofujin_nan.md) |
| items | `eq_nansongqianhuangsucaizhejiaofujin_nan` | 南宋浅黄素裁折角幅巾·男 | `assets/default/item/accessories/eq_nansongqianhuangsucaizhejiaofujin_nan.png` | 待出图 | [eq_nansongqianhuangsucaizhejiaofujin_nan.md](items/accessories/eq_nansongqianhuangsucaizhejiaofujin_nan.md) |
| items | `eq_nansongqianhuangxicaizhejiaofujin_nan` | 南宋浅黄细裁折角幅巾·男 | `assets/default/item/accessories/eq_nansongqianhuangxicaizhejiaofujin_nan.png` | 待出图 | [eq_nansongqianhuangxicaizhejiaofujin_nan.md](items/accessories/eq_nansongqianhuangxicaizhejiaofujin_nan.md) |
| items | `eq_nansongqianhuangxiuyuanzhejiaofujin_nan` | 南宋浅黄绣缘折角幅巾·男 | `assets/default/item/accessories/eq_nansongqianhuangxiuyuanzhejiaofujin_nan.png` | 待出图 | [eq_nansongqianhuangxiuyuanzhejiaofujin_nan.md](items/accessories/eq_nansongqianhuangxiuyuanzhejiaofujin_nan.md) |
| items | `eq_nansongsubaijingxiushubochai_nv` | 南宋素白精绣束帛钗·女 | `assets/default/item/accessories/eq_nansongsubaijingxiushubochai_nv.png` | 待出图 | [eq_nansongsubaijingxiushubochai_nv.md](items/accessories/eq_nansongsubaijingxiushubochai_nv.md) |
| items | `eq_nansongsubaijinwenshubochai_nv` | 南宋素白锦纹束帛钗·女 | `assets/default/item/accessories/eq_nansongsubaijinwenshubochai_nv.png` | 待出图 | [eq_nansongsubaijinwenshubochai_nv.md](items/accessories/eq_nansongsubaijinwenshubochai_nv.md) |
| items | `eq_nansongsubailingwenshubochai_nv` | 南宋素白绫纹束帛钗·女 | `assets/default/item/accessories/eq_nansongsubailingwenshubochai_nv.png` | 待出图 | [eq_nansongsubailingwenshubochai_nv.md](items/accessories/eq_nansongsubailingwenshubochai_nv.md) |
| items | `eq_nansongsubaisucaishubochai_nv` | 南宋素白素裁束帛钗·女 | `assets/default/item/accessories/eq_nansongsubaisucaishubochai_nv.png` | 待出图 | [eq_nansongsubaisucaishubochai_nv.md](items/accessories/eq_nansongsubaisucaishubochai_nv.md) |
| items | `eq_nansongsubaixicaishubochai_nv` | 南宋素白细裁束帛钗·女 | `assets/default/item/accessories/eq_nansongsubaixicaishubochai_nv.png` | 待出图 | [eq_nansongsubaixicaishubochai_nv.md](items/accessories/eq_nansongsubaixicaishubochai_nv.md) |
| items | `eq_nansongsubaixiuyuanshubochai_nv` | 南宋素白绣缘束帛钗·女 | `assets/default/item/accessories/eq_nansongsubaixiuyuanshubochai_nv.png` | 待出图 | [eq_nansongsubaixiuyuanshubochai_nv.md](items/accessories/eq_nansongsubaixiuyuanshubochai_nv.md) |
| items | `eq_qingtongtaotiekui` | 青铜饕餮盔 | `assets/default/item/accessories/eq_qingtongtaotiekui.png` | 待出图 | [eq_qingtongtaotiekui.md](items/accessories/eq_qingtongtaotiekui.md) |
| items | `eq_tangqianhuangjingxiuruanjiaojin_nan` | 唐浅黄精绣软脚巾·男 | `assets/default/item/accessories/eq_tangqianhuangjingxiuruanjiaojin_nan.png` | 待出图 | [eq_tangqianhuangjingxiuruanjiaojin_nan.md](items/accessories/eq_tangqianhuangjingxiuruanjiaojin_nan.md) |
| items | `eq_tangqianhuangjinwenruanjiaojin_nan` | 唐浅黄锦纹软脚巾·男 | `assets/default/item/accessories/eq_tangqianhuangjinwenruanjiaojin_nan.png` | 待出图 | [eq_tangqianhuangjinwenruanjiaojin_nan.md](items/accessories/eq_tangqianhuangjinwenruanjiaojin_nan.md) |
| items | `eq_tangqianhuanglingwenruanjiaojin_nan` | 唐浅黄绫纹软脚巾·男 | `assets/default/item/accessories/eq_tangqianhuanglingwenruanjiaojin_nan.png` | 待出图 | [eq_tangqianhuanglingwenruanjiaojin_nan.md](items/accessories/eq_tangqianhuanglingwenruanjiaojin_nan.md) |
| items | `eq_tangqianhuangsucairuanjiaojin_nan` | 唐浅黄素裁软脚巾·男 | `assets/default/item/accessories/eq_tangqianhuangsucairuanjiaojin_nan.png` | 待出图 | [eq_tangqianhuangsucairuanjiaojin_nan.md](items/accessories/eq_tangqianhuangsucairuanjiaojin_nan.md) |
| items | `eq_tangqianhuangxicairuanjiaojin_nan` | 唐浅黄细裁软脚巾·男 | `assets/default/item/accessories/eq_tangqianhuangxicairuanjiaojin_nan.png` | 待出图 | [eq_tangqianhuangxicairuanjiaojin_nan.md](items/accessories/eq_tangqianhuangxicairuanjiaojin_nan.md) |
| items | `eq_tangqianhuangxiuyuanruanjiaojin_nan` | 唐浅黄绣缘软脚巾·男 | `assets/default/item/accessories/eq_tangqianhuangxiuyuanruanjiaojin_nan.png` | 待出图 | [eq_tangqianhuangxiuyuanruanjiaojin_nan.md](items/accessories/eq_tangqianhuangxiuyuanruanjiaojin_nan.md) |
| items | `eq_tangsubaijingxiushuchai_nv` | 唐素白精绣梳钗·女 | `assets/default/item/accessories/eq_tangsubaijingxiushuchai_nv.png` | 待出图 | [eq_tangsubaijingxiushuchai_nv.md](items/accessories/eq_tangsubaijingxiushuchai_nv.md) |
| items | `eq_tangsubaijinwenshuchai_nv` | 唐素白锦纹梳钗·女 | `assets/default/item/accessories/eq_tangsubaijinwenshuchai_nv.png` | 待出图 | [eq_tangsubaijinwenshuchai_nv.md](items/accessories/eq_tangsubaijinwenshuchai_nv.md) |
| items | `eq_tangsubailingwenshuchai_nv` | 唐素白绫纹梳钗·女 | `assets/default/item/accessories/eq_tangsubailingwenshuchai_nv.png` | 待出图 | [eq_tangsubailingwenshuchai_nv.md](items/accessories/eq_tangsubailingwenshuchai_nv.md) |
| items | `eq_tangsubaisucaishuchai_nv` | 唐素白素裁梳钗·女 | `assets/default/item/accessories/eq_tangsubaisucaishuchai_nv.png` | 待出图 | [eq_tangsubaisucaishuchai_nv.md](items/accessories/eq_tangsubaisucaishuchai_nv.md) |
| items | `eq_tangsubaixicaishuchai_nv` | 唐素白细裁梳钗·女 | `assets/default/item/accessories/eq_tangsubaixicaishuchai_nv.png` | 待出图 | [eq_tangsubaixicaishuchai_nv.md](items/accessories/eq_tangsubaixicaishuchai_nv.md) |
| items | `eq_tangsubaixiuyuanshuchai_nv` | 唐素白绣缘梳钗·女 | `assets/default/item/accessories/eq_tangsubaixiuyuanshuchai_nv.png` | 待出图 | [eq_tangsubaixiuyuanshuchai_nv.md](items/accessories/eq_tangsubaixiuyuanshuchai_nv.md) |
| items | `eq_tangziluosucaibomianxingpi_tongyong` | 唐紫罗素裁帛面行披 | `assets/default/item/accessories/eq_tangziluosucaibomianxingpi_tongyong.png` | 待出图 | [eq_tangziluosucaibomianxingpi_tongyong.md](items/accessories/eq_tangziluosucaibomianxingpi_tongyong.md) |
| items | `eq_tangziluoxicaibomianxingpi_tongyong` | 唐紫罗细裁帛面行披 | `assets/default/item/accessories/eq_tangziluoxicaibomianxingpi_tongyong.png` | 待出图 | [eq_tangziluoxicaibomianxingpi_tongyong.md](items/accessories/eq_tangziluoxicaibomianxingpi_tongyong.md) |
| items | `eq_tangziluoxiuyuanbomianxingpi_tongyong` | 唐紫罗绣缘帛面行披 | `assets/default/item/accessories/eq_tangziluoxiuyuanbomianxingpi_tongyong.png` | 待出图 | [eq_tangziluoxiuyuanbomianxingpi_tongyong.md](items/accessories/eq_tangziluoxiuyuanbomianxingpi_tongyong.md) |
| items | `eq_taotiemianjia` | 饕餮面甲 | `assets/default/item/accessories/eq_taotiemianjia.png` | 待出图 | [eq_taotiemianjia.md](items/accessories/eq_taotiemianjia.md) |
| items | `eq_mingguangkai` | 明光铠 | `assets/default/item/armor/eq_mingguangkai.png` | 待出图 | [eq_mingguangkai.md](items/armor/eq_mingguangkai.md) |
| items | `eq_penlingtiejia` | 盆领铁甲 | `assets/default/item/armor/eq_penlingtiejia.png` | 待出图 | [eq_penlingtiejia.md](items/armor/eq_penlingtiejia.md) |
| items | `eq_pijia` | 皮甲 | `assets/default/item/armor/eq_pijia.png` | 待出图 | [eq_pijia.md](items/armor/eq_pijia.md) |
| items | `eq_shanwenjia` | 山文甲 | `assets/default/item/armor/eq_shanwenjia.png` | 待出图 | [eq_shanwenjia.md](items/armor/eq_shanwenjia.md) |
| items | `eq_suozijia` | 锁子甲 | `assets/default/item/armor/eq_suozijia.png` | 待出图 | [eq_suozijia.md](items/armor/eq_suozijia.md) |
| items | `eq_tongxiukai` | 筒袖铠 | `assets/default/item/armor/eq_tongxiukai.png` | 待出图 | [eq_tongxiukai.md](items/armor/eq_tongxiukai.md) |
| items | `eq_xilinjia` | 细鳞甲 | `assets/default/item/armor/eq_xilinjia.png` | 待出图 | [eq_xilinjia.md](items/armor/eq_xilinjia.md) |
| items | `eq_beisongbenbaijingxiubutingdai_nan` | 北宋本白精绣布鞓带·男 | `assets/default/item/belts/eq_beisongbenbaijingxiubutingdai_nan.png` | 待出图 | [eq_beisongbenbaijingxiubutingdai_nan.md](items/belts/eq_beisongbenbaijingxiubutingdai_nan.md) |
| items | `eq_beisongbenbaijingxiutaoqundai_nv` | 北宋本白精绣绦裙带·女 | `assets/default/item/belts/eq_beisongbenbaijingxiutaoqundai_nv.png` | 待出图 | [eq_beisongbenbaijingxiutaoqundai_nv.md](items/belts/eq_beisongbenbaijingxiutaoqundai_nv.md) |
| items | `eq_beisongbenbaijinwenbutingdai_nan` | 北宋本白锦纹布鞓带·男 | `assets/default/item/belts/eq_beisongbenbaijinwenbutingdai_nan.png` | 待出图 | [eq_beisongbenbaijinwenbutingdai_nan.md](items/belts/eq_beisongbenbaijinwenbutingdai_nan.md) |
| items | `eq_beisongbenbaijinwentaoqundai_nv` | 北宋本白锦纹绦裙带·女 | `assets/default/item/belts/eq_beisongbenbaijinwentaoqundai_nv.png` | 待出图 | [eq_beisongbenbaijinwentaoqundai_nv.md](items/belts/eq_beisongbenbaijinwentaoqundai_nv.md) |
| items | `eq_beisongbenbailingwenbutingdai_nan` | 北宋本白绫纹布鞓带·男 | `assets/default/item/belts/eq_beisongbenbailingwenbutingdai_nan.png` | 待出图 | [eq_beisongbenbailingwenbutingdai_nan.md](items/belts/eq_beisongbenbailingwenbutingdai_nan.md) |
| items | `eq_beisongbenbailingwentaoqundai_nv` | 北宋本白绫纹绦裙带·女 | `assets/default/item/belts/eq_beisongbenbailingwentaoqundai_nv.png` | 待出图 | [eq_beisongbenbailingwentaoqundai_nv.md](items/belts/eq_beisongbenbailingwentaoqundai_nv.md) |
| items | `eq_beisongbenbaisucaibutingdai_nan` | 北宋本白素裁布鞓带·男 | `assets/default/item/belts/eq_beisongbenbaisucaibutingdai_nan.png` | 待出图 | [eq_beisongbenbaisucaibutingdai_nan.md](items/belts/eq_beisongbenbaisucaibutingdai_nan.md) |
| items | `eq_beisongbenbaisucaitaoqundai_nv` | 北宋本白素裁绦裙带·女 | `assets/default/item/belts/eq_beisongbenbaisucaitaoqundai_nv.png` | 待出图 | [eq_beisongbenbaisucaitaoqundai_nv.md](items/belts/eq_beisongbenbaisucaitaoqundai_nv.md) |
| items | `eq_beisongbenbaixicaibutingdai_nan` | 北宋本白细裁布鞓带·男 | `assets/default/item/belts/eq_beisongbenbaixicaibutingdai_nan.png` | 待出图 | [eq_beisongbenbaixicaibutingdai_nan.md](items/belts/eq_beisongbenbaixicaibutingdai_nan.md) |
| items | `eq_beisongbenbaixicaitaoqundai_nv` | 北宋本白细裁绦裙带·女 | `assets/default/item/belts/eq_beisongbenbaixicaitaoqundai_nv.png` | 待出图 | [eq_beisongbenbaixicaitaoqundai_nv.md](items/belts/eq_beisongbenbaixicaitaoqundai_nv.md) |
| items | `eq_beisongbenbaixiuyuanbutingdai_nan` | 北宋本白绣缘布鞓带·男 | `assets/default/item/belts/eq_beisongbenbaixiuyuanbutingdai_nan.png` | 待出图 | [eq_beisongbenbaixiuyuanbutingdai_nan.md](items/belts/eq_beisongbenbaixiuyuanbutingdai_nan.md) |
| items | `eq_beisongbenbaixiuyuantaoqundai_nv` | 北宋本白绣缘绦裙带·女 | `assets/default/item/belts/eq_beisongbenbaixiuyuantaoqundai_nv.png` | 待出图 | [eq_beisongbenbaixiuyuantaoqundai_nv.md](items/belts/eq_beisongbenbaixiuyuantaoqundai_nv.md) |
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
| items | `eq_nansongbenbaijingxiubiantaodai_nv` | 南宋本白精绣编绦带·女 | `assets/default/item/belts/eq_nansongbenbaijingxiubiantaodai_nv.png` | 待出图 | [eq_nansongbenbaijingxiubiantaodai_nv.md](items/belts/eq_nansongbenbaijingxiubiantaodai_nv.md) |
| items | `eq_nansongbenbaijingxiusutingdai_nan` | 南宋本白精绣素鞓带·男 | `assets/default/item/belts/eq_nansongbenbaijingxiusutingdai_nan.png` | 待出图 | [eq_nansongbenbaijingxiusutingdai_nan.md](items/belts/eq_nansongbenbaijingxiusutingdai_nan.md) |
| items | `eq_nansongbenbaijinwenbiantaodai_nv` | 南宋本白锦纹编绦带·女 | `assets/default/item/belts/eq_nansongbenbaijinwenbiantaodai_nv.png` | 待出图 | [eq_nansongbenbaijinwenbiantaodai_nv.md](items/belts/eq_nansongbenbaijinwenbiantaodai_nv.md) |
| items | `eq_nansongbenbaijinwensutingdai_nan` | 南宋本白锦纹素鞓带·男 | `assets/default/item/belts/eq_nansongbenbaijinwensutingdai_nan.png` | 待出图 | [eq_nansongbenbaijinwensutingdai_nan.md](items/belts/eq_nansongbenbaijinwensutingdai_nan.md) |
| items | `eq_nansongbenbailingwenbiantaodai_nv` | 南宋本白绫纹编绦带·女 | `assets/default/item/belts/eq_nansongbenbailingwenbiantaodai_nv.png` | 待出图 | [eq_nansongbenbailingwenbiantaodai_nv.md](items/belts/eq_nansongbenbailingwenbiantaodai_nv.md) |
| items | `eq_nansongbenbailingwensutingdai_nan` | 南宋本白绫纹素鞓带·男 | `assets/default/item/belts/eq_nansongbenbailingwensutingdai_nan.png` | 待出图 | [eq_nansongbenbailingwensutingdai_nan.md](items/belts/eq_nansongbenbailingwensutingdai_nan.md) |
| items | `eq_nansongbenbaisucaibiantaodai_nv` | 南宋本白素裁编绦带·女 | `assets/default/item/belts/eq_nansongbenbaisucaibiantaodai_nv.png` | 待出图 | [eq_nansongbenbaisucaibiantaodai_nv.md](items/belts/eq_nansongbenbaisucaibiantaodai_nv.md) |
| items | `eq_nansongbenbaisucaisutingdai_nan` | 南宋本白素裁素鞓带·男 | `assets/default/item/belts/eq_nansongbenbaisucaisutingdai_nan.png` | 待出图 | [eq_nansongbenbaisucaisutingdai_nan.md](items/belts/eq_nansongbenbaisucaisutingdai_nan.md) |
| items | `eq_nansongbenbaixicaibiantaodai_nv` | 南宋本白细裁编绦带·女 | `assets/default/item/belts/eq_nansongbenbaixicaibiantaodai_nv.png` | 待出图 | [eq_nansongbenbaixicaibiantaodai_nv.md](items/belts/eq_nansongbenbaixicaibiantaodai_nv.md) |
| items | `eq_nansongbenbaixicaisutingdai_nan` | 南宋本白细裁素鞓带·男 | `assets/default/item/belts/eq_nansongbenbaixicaisutingdai_nan.png` | 待出图 | [eq_nansongbenbaixicaisutingdai_nan.md](items/belts/eq_nansongbenbaixicaisutingdai_nan.md) |
| items | `eq_nansongbenbaixiuyuanbiantaodai_nv` | 南宋本白绣缘编绦带·女 | `assets/default/item/belts/eq_nansongbenbaixiuyuanbiantaodai_nv.png` | 待出图 | [eq_nansongbenbaixiuyuanbiantaodai_nv.md](items/belts/eq_nansongbenbaixiuyuanbiantaodai_nv.md) |
| items | `eq_nansongbenbaixiuyuansutingdai_nan` | 南宋本白绣缘素鞓带·男 | `assets/default/item/belts/eq_nansongbenbaixiuyuansutingdai_nan.png` | 待出图 | [eq_nansongbenbaixiuyuansutingdai_nan.md](items/belts/eq_nansongbenbaixiuyuansutingdai_nan.md) |
| items | `eq_tangbenbaijingxiudiexiedai_nan` | 唐本白精绣蹀躞带·男 | `assets/default/item/belts/eq_tangbenbaijingxiudiexiedai_nan.png` | 待出图 | [eq_tangbenbaijingxiudiexiedai_nan.md](items/belts/eq_tangbenbaijingxiudiexiedai_nan.md) |
| items | `eq_tangbenbaijingxiuqunyaodai_nv` | 唐本白精绣裙腰带·女 | `assets/default/item/belts/eq_tangbenbaijingxiuqunyaodai_nv.png` | 待出图 | [eq_tangbenbaijingxiuqunyaodai_nv.md](items/belts/eq_tangbenbaijingxiuqunyaodai_nv.md) |
| items | `eq_tangbenbaijinwendiexiedai_nan` | 唐本白锦纹蹀躞带·男 | `assets/default/item/belts/eq_tangbenbaijinwendiexiedai_nan.png` | 待出图 | [eq_tangbenbaijinwendiexiedai_nan.md](items/belts/eq_tangbenbaijinwendiexiedai_nan.md) |
| items | `eq_tangbenbaijinwenqunyaodai_nv` | 唐本白锦纹裙腰带·女 | `assets/default/item/belts/eq_tangbenbaijinwenqunyaodai_nv.png` | 待出图 | [eq_tangbenbaijinwenqunyaodai_nv.md](items/belts/eq_tangbenbaijinwenqunyaodai_nv.md) |
| items | `eq_tangbenbailingwendiexiedai_nan` | 唐本白绫纹蹀躞带·男 | `assets/default/item/belts/eq_tangbenbailingwendiexiedai_nan.png` | 待出图 | [eq_tangbenbailingwendiexiedai_nan.md](items/belts/eq_tangbenbailingwendiexiedai_nan.md) |
| items | `eq_tangbenbailingwenqunyaodai_nv` | 唐本白绫纹裙腰带·女 | `assets/default/item/belts/eq_tangbenbailingwenqunyaodai_nv.png` | 待出图 | [eq_tangbenbailingwenqunyaodai_nv.md](items/belts/eq_tangbenbailingwenqunyaodai_nv.md) |
| items | `eq_tangbenbaisucaidiexiedai_nan` | 唐本白素裁蹀躞带·男 | `assets/default/item/belts/eq_tangbenbaisucaidiexiedai_nan.png` | 待出图 | [eq_tangbenbaisucaidiexiedai_nan.md](items/belts/eq_tangbenbaisucaidiexiedai_nan.md) |
| items | `eq_tangbenbaisucaiqunyaodai_nv` | 唐本白素裁裙腰带·女 | `assets/default/item/belts/eq_tangbenbaisucaiqunyaodai_nv.png` | 待出图 | [eq_tangbenbaisucaiqunyaodai_nv.md](items/belts/eq_tangbenbaisucaiqunyaodai_nv.md) |
| items | `eq_tangbenbaixicaidiexiedai_nan` | 唐本白细裁蹀躞带·男 | `assets/default/item/belts/eq_tangbenbaixicaidiexiedai_nan.png` | 待出图 | [eq_tangbenbaixicaidiexiedai_nan.md](items/belts/eq_tangbenbaixicaidiexiedai_nan.md) |
| items | `eq_tangbenbaixicaiqunyaodai_nv` | 唐本白细裁裙腰带·女 | `assets/default/item/belts/eq_tangbenbaixicaiqunyaodai_nv.png` | 待出图 | [eq_tangbenbaixicaiqunyaodai_nv.md](items/belts/eq_tangbenbaixicaiqunyaodai_nv.md) |
| items | `eq_tangbenbaixiuyuandiexiedai_nan` | 唐本白绣缘蹀躞带·男 | `assets/default/item/belts/eq_tangbenbaixiuyuandiexiedai_nan.png` | 待出图 | [eq_tangbenbaixiuyuandiexiedai_nan.md](items/belts/eq_tangbenbaixiuyuandiexiedai_nan.md) |
| items | `eq_tangbenbaixiuyuanqunyaodai_nv` | 唐本白绣缘裙腰带·女 | `assets/default/item/belts/eq_tangbenbaixiuyuanqunyaodai_nv.png` | 待出图 | [eq_tangbenbaixiuyuanqunyaodai_nv.md](items/belts/eq_tangbenbaixiuyuanqunyaodai_nv.md) |
| items | `eq_beisongbenbaijingxiulanshan_nan` | 北宋本白精绣襕衫·男 | `assets/default/item/clothing/eq_beisongbenbaijingxiulanshan_nan.png` | 待出图 | [eq_beisongbenbaijingxiulanshan_nan.md](items/clothing/eq_beisongbenbaijingxiulanshan_nan.md) |
| items | `eq_beisongbenbaijinwenlanshan_nan` | 北宋本白锦纹襕衫·男 | `assets/default/item/clothing/eq_beisongbenbaijinwenlanshan_nan.png` | 待出图 | [eq_beisongbenbaijinwenlanshan_nan.md](items/clothing/eq_beisongbenbaijinwenlanshan_nan.md) |
| items | `eq_beisongbenbailingwenlanshan_nan` | 北宋本白绫纹襕衫·男 | `assets/default/item/clothing/eq_beisongbenbailingwenlanshan_nan.png` | 待出图 | [eq_beisongbenbailingwenlanshan_nan.md](items/clothing/eq_beisongbenbailingwenlanshan_nan.md) |
| items | `eq_beisongbenbaisucailanshan_nan` | 北宋本白素裁襕衫·男 | `assets/default/item/clothing/eq_beisongbenbaisucailanshan_nan.png` | 待出图 | [eq_beisongbenbaisucailanshan_nan.md](items/clothing/eq_beisongbenbaisucailanshan_nan.md) |
| items | `eq_beisongbenbaixicailanshan_nan` | 北宋本白细裁襕衫·男 | `assets/default/item/clothing/eq_beisongbenbaixicailanshan_nan.png` | 待出图 | [eq_beisongbenbaixicailanshan_nan.md](items/clothing/eq_beisongbenbaixicailanshan_nan.md) |
| items | `eq_beisongbenbaixiuyuanlanshan_nan` | 北宋本白绣缘襕衫·男 | `assets/default/item/clothing/eq_beisongbenbaixiuyuanlanshan_nan.png` | 待出图 | [eq_beisongbenbaixiuyuanlanshan_nan.md](items/clothing/eq_beisongbenbaixiuyuanlanshan_nan.md) |
| items | `eq_beisongfeihongjingxiulanshan_nan` | 北宋绯红精绣襕衫·男 | `assets/default/item/clothing/eq_beisongfeihongjingxiulanshan_nan.png` | 待出图 | [eq_beisongfeihongjingxiulanshan_nan.md](items/clothing/eq_beisongfeihongjingxiulanshan_nan.md) |
| items | `eq_beisongfeihongjinwenlanshan_nan` | 北宋绯红锦纹襕衫·男 | `assets/default/item/clothing/eq_beisongfeihongjinwenlanshan_nan.png` | 待出图 | [eq_beisongfeihongjinwenlanshan_nan.md](items/clothing/eq_beisongfeihongjinwenlanshan_nan.md) |
| items | `eq_beisongfeihonglingwenlanshan_nan` | 北宋绯红绫纹襕衫·男 | `assets/default/item/clothing/eq_beisongfeihonglingwenlanshan_nan.png` | 待出图 | [eq_beisongfeihonglingwenlanshan_nan.md](items/clothing/eq_beisongfeihonglingwenlanshan_nan.md) |
| items | `eq_beisongfeihongsucailanshan_nan` | 北宋绯红素裁襕衫·男 | `assets/default/item/clothing/eq_beisongfeihongsucailanshan_nan.png` | 待出图 | [eq_beisongfeihongsucailanshan_nan.md](items/clothing/eq_beisongfeihongsucailanshan_nan.md) |
| items | `eq_beisongfeihongxicailanshan_nan` | 北宋绯红细裁襕衫·男 | `assets/default/item/clothing/eq_beisongfeihongxicailanshan_nan.png` | 待出图 | [eq_beisongfeihongxicailanshan_nan.md](items/clothing/eq_beisongfeihongxicailanshan_nan.md) |
| items | `eq_beisongfeihongxiuyuanlanshan_nan` | 北宋绯红绣缘襕衫·男 | `assets/default/item/clothing/eq_beisongfeihongxiuyuanlanshan_nan.png` | 待出图 | [eq_beisongfeihongxiuyuanlanshan_nan.md](items/clothing/eq_beisongfeihongxiuyuanlanshan_nan.md) |
| items | `eq_beisongsubaijingxiubeishanqun_nv` | 北宋素白精绣褙衫裙·女 | `assets/default/item/clothing/eq_beisongsubaijingxiubeishanqun_nv.png` | 待出图 | [eq_beisongsubaijingxiubeishanqun_nv.md](items/clothing/eq_beisongsubaijingxiubeishanqun_nv.md) |
| items | `eq_beisongsubaijinwenbeishanqun_nv` | 北宋素白锦纹褙衫裙·女 | `assets/default/item/clothing/eq_beisongsubaijinwenbeishanqun_nv.png` | 待出图 | [eq_beisongsubaijinwenbeishanqun_nv.md](items/clothing/eq_beisongsubaijinwenbeishanqun_nv.md) |
| items | `eq_beisongsubailingwenbeishanqun_nv` | 北宋素白绫纹褙衫裙·女 | `assets/default/item/clothing/eq_beisongsubailingwenbeishanqun_nv.png` | 待出图 | [eq_beisongsubailingwenbeishanqun_nv.md](items/clothing/eq_beisongsubailingwenbeishanqun_nv.md) |
| items | `eq_beisongsubaisucaibeishanqun_nv` | 北宋素白素裁褙衫裙·女 | `assets/default/item/clothing/eq_beisongsubaisucaibeishanqun_nv.png` | 待出图 | [eq_beisongsubaisucaibeishanqun_nv.md](items/clothing/eq_beisongsubaisucaibeishanqun_nv.md) |
| items | `eq_beisongsubaixicaibeishanqun_nv` | 北宋素白细裁褙衫裙·女 | `assets/default/item/clothing/eq_beisongsubaixicaibeishanqun_nv.png` | 待出图 | [eq_beisongsubaixicaibeishanqun_nv.md](items/clothing/eq_beisongsubaixicaibeishanqun_nv.md) |
| items | `eq_beisongsubaixiuyuanbeishanqun_nv` | 北宋素白绣缘褙衫裙·女 | `assets/default/item/clothing/eq_beisongsubaixiuyuanbeishanqun_nv.png` | 待出图 | [eq_beisongsubaixiuyuanbeishanqun_nv.md](items/clothing/eq_beisongsubaixiuyuanbeishanqun_nv.md) |
| items | `eq_beisongxuanjingxiulanshan_nan` | 北宋玄精绣襕衫·男 | `assets/default/item/clothing/eq_beisongxuanjingxiulanshan_nan.png` | 待出图 | [eq_beisongxuanjingxiulanshan_nan.md](items/clothing/eq_beisongxuanjingxiulanshan_nan.md) |
| items | `eq_beisongxuanjinwenlanshan_nan` | 北宋玄锦纹襕衫·男 | `assets/default/item/clothing/eq_beisongxuanjinwenlanshan_nan.png` | 待出图 | [eq_beisongxuanjinwenlanshan_nan.md](items/clothing/eq_beisongxuanjinwenlanshan_nan.md) |
| items | `eq_beisongxuanlingwenlanshan_nan` | 北宋玄绫纹襕衫·男 | `assets/default/item/clothing/eq_beisongxuanlingwenlanshan_nan.png` | 待出图 | [eq_beisongxuanlingwenlanshan_nan.md](items/clothing/eq_beisongxuanlingwenlanshan_nan.md) |
| items | `eq_beisongxuansucailanshan_nan` | 北宋玄素裁襕衫·男 | `assets/default/item/clothing/eq_beisongxuansucailanshan_nan.png` | 待出图 | [eq_beisongxuansucailanshan_nan.md](items/clothing/eq_beisongxuansucailanshan_nan.md) |
| items | `eq_beisongxuanxicailanshan_nan` | 北宋玄细裁襕衫·男 | `assets/default/item/clothing/eq_beisongxuanxicailanshan_nan.png` | 待出图 | [eq_beisongxuanxicailanshan_nan.md](items/clothing/eq_beisongxuanxicailanshan_nan.md) |
| items | `eq_beisongxuanxiuyuanlanshan_nan` | 北宋玄绣缘襕衫·男 | `assets/default/item/clothing/eq_beisongxuanxiuyuanlanshan_nan.png` | 待出图 | [eq_beisongxuanxiuyuanlanshan_nan.md](items/clothing/eq_beisongxuanxiuyuanlanshan_nan.md) |
| items | `eq_beisongzhuhongjingxiubeishanqun_nv` | 北宋朱红精绣褙衫裙·女 | `assets/default/item/clothing/eq_beisongzhuhongjingxiubeishanqun_nv.png` | 待出图 | [eq_beisongzhuhongjingxiubeishanqun_nv.md](items/clothing/eq_beisongzhuhongjingxiubeishanqun_nv.md) |
| items | `eq_beisongzhuhongjinwenbeishanqun_nv` | 北宋朱红锦纹褙衫裙·女 | `assets/default/item/clothing/eq_beisongzhuhongjinwenbeishanqun_nv.png` | 待出图 | [eq_beisongzhuhongjinwenbeishanqun_nv.md](items/clothing/eq_beisongzhuhongjinwenbeishanqun_nv.md) |
| items | `eq_beisongzhuhonglingwenbeishanqun_nv` | 北宋朱红绫纹褙衫裙·女 | `assets/default/item/clothing/eq_beisongzhuhonglingwenbeishanqun_nv.png` | 待出图 | [eq_beisongzhuhonglingwenbeishanqun_nv.md](items/clothing/eq_beisongzhuhonglingwenbeishanqun_nv.md) |
| items | `eq_beisongzhuhongsucaibeishanqun_nv` | 北宋朱红素裁褙衫裙·女 | `assets/default/item/clothing/eq_beisongzhuhongsucaibeishanqun_nv.png` | 待出图 | [eq_beisongzhuhongsucaibeishanqun_nv.md](items/clothing/eq_beisongzhuhongsucaibeishanqun_nv.md) |
| items | `eq_beisongzhuhongxicaibeishanqun_nv` | 北宋朱红细裁褙衫裙·女 | `assets/default/item/clothing/eq_beisongzhuhongxicaibeishanqun_nv.png` | 待出图 | [eq_beisongzhuhongxicaibeishanqun_nv.md](items/clothing/eq_beisongzhuhongxicaibeishanqun_nv.md) |
| items | `eq_beisongzhuhongxiuyuanbeishanqun_nv` | 北宋朱红绣缘褙衫裙·女 | `assets/default/item/clothing/eq_beisongzhuhongxiuyuanbeishanqun_nv.png` | 待出图 | [eq_beisongzhuhongxiuyuanbeishanqun_nv.md](items/clothing/eq_beisongzhuhongxiuyuanbeishanqun_nv.md) |
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
| items | `eq_nansongbenbaijingxiubianlanshan_nan` | 南宋本白精绣便襕衫·男 | `assets/default/item/clothing/eq_nansongbenbaijingxiubianlanshan_nan.png` | 待出图 | [eq_nansongbenbaijingxiubianlanshan_nan.md](items/clothing/eq_nansongbenbaijingxiubianlanshan_nan.md) |
| items | `eq_nansongbenbaijinwenbianlanshan_nan` | 南宋本白锦纹便襕衫·男 | `assets/default/item/clothing/eq_nansongbenbaijinwenbianlanshan_nan.png` | 待出图 | [eq_nansongbenbaijinwenbianlanshan_nan.md](items/clothing/eq_nansongbenbaijinwenbianlanshan_nan.md) |
| items | `eq_nansongbenbailingwenbianlanshan_nan` | 南宋本白绫纹便襕衫·男 | `assets/default/item/clothing/eq_nansongbenbailingwenbianlanshan_nan.png` | 待出图 | [eq_nansongbenbailingwenbianlanshan_nan.md](items/clothing/eq_nansongbenbailingwenbianlanshan_nan.md) |
| items | `eq_nansongbenbaisucaibianlanshan_nan` | 南宋本白素裁便襕衫·男 | `assets/default/item/clothing/eq_nansongbenbaisucaibianlanshan_nan.png` | 待出图 | [eq_nansongbenbaisucaibianlanshan_nan.md](items/clothing/eq_nansongbenbaisucaibianlanshan_nan.md) |
| items | `eq_nansongbenbaixicaibianlanshan_nan` | 南宋本白细裁便襕衫·男 | `assets/default/item/clothing/eq_nansongbenbaixicaibianlanshan_nan.png` | 待出图 | [eq_nansongbenbaixicaibianlanshan_nan.md](items/clothing/eq_nansongbenbaixicaibianlanshan_nan.md) |
| items | `eq_nansongbenbaixiuyuanbianlanshan_nan` | 南宋本白绣缘便襕衫·男 | `assets/default/item/clothing/eq_nansongbenbaixiuyuanbianlanshan_nan.png` | 待出图 | [eq_nansongbenbaixiuyuanbianlanshan_nan.md](items/clothing/eq_nansongbenbaixiuyuanbianlanshan_nan.md) |
| items | `eq_nansongfeihongjingxiubianlanshan_nan` | 南宋绯红精绣便襕衫·男 | `assets/default/item/clothing/eq_nansongfeihongjingxiubianlanshan_nan.png` | 待出图 | [eq_nansongfeihongjingxiubianlanshan_nan.md](items/clothing/eq_nansongfeihongjingxiubianlanshan_nan.md) |
| items | `eq_nansongfeihongjinwenbianlanshan_nan` | 南宋绯红锦纹便襕衫·男 | `assets/default/item/clothing/eq_nansongfeihongjinwenbianlanshan_nan.png` | 待出图 | [eq_nansongfeihongjinwenbianlanshan_nan.md](items/clothing/eq_nansongfeihongjinwenbianlanshan_nan.md) |
| items | `eq_nansongfeihonglingwenbianlanshan_nan` | 南宋绯红绫纹便襕衫·男 | `assets/default/item/clothing/eq_nansongfeihonglingwenbianlanshan_nan.png` | 待出图 | [eq_nansongfeihonglingwenbianlanshan_nan.md](items/clothing/eq_nansongfeihonglingwenbianlanshan_nan.md) |
| items | `eq_nansongfeihongsucaibianlanshan_nan` | 南宋绯红素裁便襕衫·男 | `assets/default/item/clothing/eq_nansongfeihongsucaibianlanshan_nan.png` | 待出图 | [eq_nansongfeihongsucaibianlanshan_nan.md](items/clothing/eq_nansongfeihongsucaibianlanshan_nan.md) |
| items | `eq_nansongfeihongxicaibianlanshan_nan` | 南宋绯红细裁便襕衫·男 | `assets/default/item/clothing/eq_nansongfeihongxicaibianlanshan_nan.png` | 待出图 | [eq_nansongfeihongxicaibianlanshan_nan.md](items/clothing/eq_nansongfeihongxicaibianlanshan_nan.md) |
| items | `eq_nansongfeihongxiuyuanbianlanshan_nan` | 南宋绯红绣缘便襕衫·男 | `assets/default/item/clothing/eq_nansongfeihongxiuyuanbianlanshan_nan.png` | 待出图 | [eq_nansongfeihongxiuyuanbianlanshan_nan.md](items/clothing/eq_nansongfeihongxiuyuanbianlanshan_nan.md) |
| items | `eq_nansongsubaijingxiuluoshanqun_nv` | 南宋素白精绣罗衫裙·女 | `assets/default/item/clothing/eq_nansongsubaijingxiuluoshanqun_nv.png` | 待出图 | [eq_nansongsubaijingxiuluoshanqun_nv.md](items/clothing/eq_nansongsubaijingxiuluoshanqun_nv.md) |
| items | `eq_nansongsubaijinwenluoshanqun_nv` | 南宋素白锦纹罗衫裙·女 | `assets/default/item/clothing/eq_nansongsubaijinwenluoshanqun_nv.png` | 待出图 | [eq_nansongsubaijinwenluoshanqun_nv.md](items/clothing/eq_nansongsubaijinwenluoshanqun_nv.md) |
| items | `eq_nansongsubailingwenluoshanqun_nv` | 南宋素白绫纹罗衫裙·女 | `assets/default/item/clothing/eq_nansongsubailingwenluoshanqun_nv.png` | 待出图 | [eq_nansongsubailingwenluoshanqun_nv.md](items/clothing/eq_nansongsubailingwenluoshanqun_nv.md) |
| items | `eq_nansongsubaisucailuoshanqun_nv` | 南宋素白素裁罗衫裙·女 | `assets/default/item/clothing/eq_nansongsubaisucailuoshanqun_nv.png` | 待出图 | [eq_nansongsubaisucailuoshanqun_nv.md](items/clothing/eq_nansongsubaisucailuoshanqun_nv.md) |
| items | `eq_nansongsubaixicailuoshanqun_nv` | 南宋素白细裁罗衫裙·女 | `assets/default/item/clothing/eq_nansongsubaixicailuoshanqun_nv.png` | 待出图 | [eq_nansongsubaixicailuoshanqun_nv.md](items/clothing/eq_nansongsubaixicailuoshanqun_nv.md) |
| items | `eq_nansongsubaixiuyuanluoshanqun_nv` | 南宋素白绣缘罗衫裙·女 | `assets/default/item/clothing/eq_nansongsubaixiuyuanluoshanqun_nv.png` | 待出图 | [eq_nansongsubaixiuyuanluoshanqun_nv.md](items/clothing/eq_nansongsubaixiuyuanluoshanqun_nv.md) |
| items | `eq_nansongxuanjingxiubianlanshan_nan` | 南宋玄精绣便襕衫·男 | `assets/default/item/clothing/eq_nansongxuanjingxiubianlanshan_nan.png` | 待出图 | [eq_nansongxuanjingxiubianlanshan_nan.md](items/clothing/eq_nansongxuanjingxiubianlanshan_nan.md) |
| items | `eq_nansongxuanjinwenbianlanshan_nan` | 南宋玄锦纹便襕衫·男 | `assets/default/item/clothing/eq_nansongxuanjinwenbianlanshan_nan.png` | 待出图 | [eq_nansongxuanjinwenbianlanshan_nan.md](items/clothing/eq_nansongxuanjinwenbianlanshan_nan.md) |
| items | `eq_nansongxuanlingwenbianlanshan_nan` | 南宋玄绫纹便襕衫·男 | `assets/default/item/clothing/eq_nansongxuanlingwenbianlanshan_nan.png` | 待出图 | [eq_nansongxuanlingwenbianlanshan_nan.md](items/clothing/eq_nansongxuanlingwenbianlanshan_nan.md) |
| items | `eq_nansongxuansucaibianlanshan_nan` | 南宋玄素裁便襕衫·男 | `assets/default/item/clothing/eq_nansongxuansucaibianlanshan_nan.png` | 待出图 | [eq_nansongxuansucaibianlanshan_nan.md](items/clothing/eq_nansongxuansucaibianlanshan_nan.md) |
| items | `eq_nansongxuanxicaibianlanshan_nan` | 南宋玄细裁便襕衫·男 | `assets/default/item/clothing/eq_nansongxuanxicaibianlanshan_nan.png` | 待出图 | [eq_nansongxuanxicaibianlanshan_nan.md](items/clothing/eq_nansongxuanxicaibianlanshan_nan.md) |
| items | `eq_nansongxuanxiuyuanbianlanshan_nan` | 南宋玄绣缘便襕衫·男 | `assets/default/item/clothing/eq_nansongxuanxiuyuanbianlanshan_nan.png` | 待出图 | [eq_nansongxuanxiuyuanbianlanshan_nan.md](items/clothing/eq_nansongxuanxiuyuanbianlanshan_nan.md) |
| items | `eq_nansongzihejingxiuluoshanqun_nv` | 南宋紫褐精绣罗衫裙·女 | `assets/default/item/clothing/eq_nansongzihejingxiuluoshanqun_nv.png` | 待出图 | [eq_nansongzihejingxiuluoshanqun_nv.md](items/clothing/eq_nansongzihejingxiuluoshanqun_nv.md) |
| items | `eq_nansongzihejinwenluoshanqun_nv` | 南宋紫褐锦纹罗衫裙·女 | `assets/default/item/clothing/eq_nansongzihejinwenluoshanqun_nv.png` | 待出图 | [eq_nansongzihejinwenluoshanqun_nv.md](items/clothing/eq_nansongzihejinwenluoshanqun_nv.md) |
| items | `eq_nansongzihelingwenluoshanqun_nv` | 南宋紫褐绫纹罗衫裙·女 | `assets/default/item/clothing/eq_nansongzihelingwenluoshanqun_nv.png` | 待出图 | [eq_nansongzihelingwenluoshanqun_nv.md](items/clothing/eq_nansongzihelingwenluoshanqun_nv.md) |
| items | `eq_nansongzihesucailuoshanqun_nv` | 南宋紫褐素裁罗衫裙·女 | `assets/default/item/clothing/eq_nansongzihesucailuoshanqun_nv.png` | 待出图 | [eq_nansongzihesucailuoshanqun_nv.md](items/clothing/eq_nansongzihesucailuoshanqun_nv.md) |
| items | `eq_nansongzihexicailuoshanqun_nv` | 南宋紫褐细裁罗衫裙·女 | `assets/default/item/clothing/eq_nansongzihexicailuoshanqun_nv.png` | 待出图 | [eq_nansongzihexicailuoshanqun_nv.md](items/clothing/eq_nansongzihexicailuoshanqun_nv.md) |
| items | `eq_nansongzihexiuyuanluoshanqun_nv` | 南宋紫褐绣缘罗衫裙·女 | `assets/default/item/clothing/eq_nansongzihexiuyuanluoshanqun_nv.png` | 待出图 | [eq_nansongzihexiuyuanluoshanqun_nv.md](items/clothing/eq_nansongzihexiuyuanluoshanqun_nv.md) |
| items | `eq_tangbenbaijingxiuyuanlingshan_nan` | 唐本白精绣圆领衫·男 | `assets/default/item/clothing/eq_tangbenbaijingxiuyuanlingshan_nan.png` | 待出图 | [eq_tangbenbaijingxiuyuanlingshan_nan.md](items/clothing/eq_tangbenbaijingxiuyuanlingshan_nan.md) |
| items | `eq_tangbenbaijinwenyuanlingshan_nan` | 唐本白锦纹圆领衫·男 | `assets/default/item/clothing/eq_tangbenbaijinwenyuanlingshan_nan.png` | 待出图 | [eq_tangbenbaijinwenyuanlingshan_nan.md](items/clothing/eq_tangbenbaijinwenyuanlingshan_nan.md) |
| items | `eq_tangbenbailingwenyuanlingshan_nan` | 唐本白绫纹圆领衫·男 | `assets/default/item/clothing/eq_tangbenbailingwenyuanlingshan_nan.png` | 待出图 | [eq_tangbenbailingwenyuanlingshan_nan.md](items/clothing/eq_tangbenbailingwenyuanlingshan_nan.md) |
| items | `eq_tangbenbaisucaiyuanlingshan_nan` | 唐本白素裁圆领衫·男 | `assets/default/item/clothing/eq_tangbenbaisucaiyuanlingshan_nan.png` | 待出图 | [eq_tangbenbaisucaiyuanlingshan_nan.md](items/clothing/eq_tangbenbaisucaiyuanlingshan_nan.md) |
| items | `eq_tangbenbaixicaiyuanlingshan_nan` | 唐本白细裁圆领衫·男 | `assets/default/item/clothing/eq_tangbenbaixicaiyuanlingshan_nan.png` | 待出图 | [eq_tangbenbaixicaiyuanlingshan_nan.md](items/clothing/eq_tangbenbaixicaiyuanlingshan_nan.md) |
| items | `eq_tangbenbaixiuyuanyuanlingshan_nan` | 唐本白绣缘圆领衫·男 | `assets/default/item/clothing/eq_tangbenbaixiuyuanyuanlingshan_nan.png` | 待出图 | [eq_tangbenbaixiuyuanyuanlingshan_nan.md](items/clothing/eq_tangbenbaixiuyuanyuanlingshan_nan.md) |
| items | `eq_tangcaolvjingxiuruqun_nv` | 唐草绿精绣襦裙·女 | `assets/default/item/clothing/eq_tangcaolvjingxiuruqun_nv.png` | 待出图 | [eq_tangcaolvjingxiuruqun_nv.md](items/clothing/eq_tangcaolvjingxiuruqun_nv.md) |
| items | `eq_tangcaolvjinwenruqun_nv` | 唐草绿锦纹襦裙·女 | `assets/default/item/clothing/eq_tangcaolvjinwenruqun_nv.png` | 待出图 | [eq_tangcaolvjinwenruqun_nv.md](items/clothing/eq_tangcaolvjinwenruqun_nv.md) |
| items | `eq_tangcaolvlingwenruqun_nv` | 唐草绿绫纹襦裙·女 | `assets/default/item/clothing/eq_tangcaolvlingwenruqun_nv.png` | 待出图 | [eq_tangcaolvlingwenruqun_nv.md](items/clothing/eq_tangcaolvlingwenruqun_nv.md) |
| items | `eq_tangcaolvsucairuqun_nv` | 唐草绿素裁襦裙·女 | `assets/default/item/clothing/eq_tangcaolvsucairuqun_nv.png` | 待出图 | [eq_tangcaolvsucairuqun_nv.md](items/clothing/eq_tangcaolvsucairuqun_nv.md) |
| items | `eq_tangcaolvxicairuqun_nv` | 唐草绿细裁襦裙·女 | `assets/default/item/clothing/eq_tangcaolvxicairuqun_nv.png` | 待出图 | [eq_tangcaolvxicairuqun_nv.md](items/clothing/eq_tangcaolvxicairuqun_nv.md) |
| items | `eq_tangcaolvxiuyuanruqun_nv` | 唐草绿绣缘襦裙·女 | `assets/default/item/clothing/eq_tangcaolvxiuyuanruqun_nv.png` | 待出图 | [eq_tangcaolvxiuyuanruqun_nv.md](items/clothing/eq_tangcaolvxiuyuanruqun_nv.md) |
| items | `eq_tangsubaijingxiuruqun_nv` | 唐素白精绣襦裙·女 | `assets/default/item/clothing/eq_tangsubaijingxiuruqun_nv.png` | 待出图 | [eq_tangsubaijingxiuruqun_nv.md](items/clothing/eq_tangsubaijingxiuruqun_nv.md) |
| items | `eq_tangsubaijinwenruqun_nv` | 唐素白锦纹襦裙·女 | `assets/default/item/clothing/eq_tangsubaijinwenruqun_nv.png` | 待出图 | [eq_tangsubaijinwenruqun_nv.md](items/clothing/eq_tangsubaijinwenruqun_nv.md) |
| items | `eq_tangsubailingwenruqun_nv` | 唐素白绫纹襦裙·女 | `assets/default/item/clothing/eq_tangsubailingwenruqun_nv.png` | 待出图 | [eq_tangsubailingwenruqun_nv.md](items/clothing/eq_tangsubailingwenruqun_nv.md) |
| items | `eq_tangsubaisucairuqun_nv` | 唐素白素裁襦裙·女 | `assets/default/item/clothing/eq_tangsubaisucairuqun_nv.png` | 待出图 | [eq_tangsubaisucairuqun_nv.md](items/clothing/eq_tangsubaisucairuqun_nv.md) |
| items | `eq_tangsubaixicairuqun_nv` | 唐素白细裁襦裙·女 | `assets/default/item/clothing/eq_tangsubaixicairuqun_nv.png` | 待出图 | [eq_tangsubaixicairuqun_nv.md](items/clothing/eq_tangsubaixicairuqun_nv.md) |
| items | `eq_tangsubaixiuyuanruqun_nv` | 唐素白绣缘襦裙·女 | `assets/default/item/clothing/eq_tangsubaixiuyuanruqun_nv.png` | 待出图 | [eq_tangsubaixiuyuanruqun_nv.md](items/clothing/eq_tangsubaixiuyuanruqun_nv.md) |
| items | `eq_tangxuanjingxiuyuanlingshan_nan` | 唐玄精绣圆领衫·男 | `assets/default/item/clothing/eq_tangxuanjingxiuyuanlingshan_nan.png` | 待出图 | [eq_tangxuanjingxiuyuanlingshan_nan.md](items/clothing/eq_tangxuanjingxiuyuanlingshan_nan.md) |
| items | `eq_tangxuanjinwenyuanlingshan_nan` | 唐玄锦纹圆领衫·男 | `assets/default/item/clothing/eq_tangxuanjinwenyuanlingshan_nan.png` | 待出图 | [eq_tangxuanjinwenyuanlingshan_nan.md](items/clothing/eq_tangxuanjinwenyuanlingshan_nan.md) |
| items | `eq_tangxuanlingwenyuanlingshan_nan` | 唐玄绫纹圆领衫·男 | `assets/default/item/clothing/eq_tangxuanlingwenyuanlingshan_nan.png` | 待出图 | [eq_tangxuanlingwenyuanlingshan_nan.md](items/clothing/eq_tangxuanlingwenyuanlingshan_nan.md) |
| items | `eq_tangxuansucaiyuanlingshan_nan` | 唐玄素裁圆领衫·男 | `assets/default/item/clothing/eq_tangxuansucaiyuanlingshan_nan.png` | 待出图 | [eq_tangxuansucaiyuanlingshan_nan.md](items/clothing/eq_tangxuansucaiyuanlingshan_nan.md) |
| items | `eq_tangxuanxicaiyuanlingshan_nan` | 唐玄细裁圆领衫·男 | `assets/default/item/clothing/eq_tangxuanxicaiyuanlingshan_nan.png` | 待出图 | [eq_tangxuanxicaiyuanlingshan_nan.md](items/clothing/eq_tangxuanxicaiyuanlingshan_nan.md) |
| items | `eq_tangxuanxiuyuanyuanlingshan_nan` | 唐玄绣缘圆领衫·男 | `assets/default/item/clothing/eq_tangxuanxiuyuanyuanlingshan_nan.png` | 待出图 | [eq_tangxuanxiuyuanyuanlingshan_nan.md](items/clothing/eq_tangxuanxiuyuanyuanlingshan_nan.md) |
| items | `eq_tangziluojingxiuyuanlingshan_nan` | 唐紫罗精绣圆领衫·男 | `assets/default/item/clothing/eq_tangziluojingxiuyuanlingshan_nan.png` | 待出图 | [eq_tangziluojingxiuyuanlingshan_nan.md](items/clothing/eq_tangziluojingxiuyuanlingshan_nan.md) |
| items | `eq_tangziluojinwenyuanlingshan_nan` | 唐紫罗锦纹圆领衫·男 | `assets/default/item/clothing/eq_tangziluojinwenyuanlingshan_nan.png` | 待出图 | [eq_tangziluojinwenyuanlingshan_nan.md](items/clothing/eq_tangziluojinwenyuanlingshan_nan.md) |
| items | `eq_tangziluolingwenyuanlingshan_nan` | 唐紫罗绫纹圆领衫·男 | `assets/default/item/clothing/eq_tangziluolingwenyuanlingshan_nan.png` | 待出图 | [eq_tangziluolingwenyuanlingshan_nan.md](items/clothing/eq_tangziluolingwenyuanlingshan_nan.md) |
| items | `eq_tangziluosucaiyuanlingshan_nan` | 唐紫罗素裁圆领衫·男 | `assets/default/item/clothing/eq_tangziluosucaiyuanlingshan_nan.png` | 待出图 | [eq_tangziluosucaiyuanlingshan_nan.md](items/clothing/eq_tangziluosucaiyuanlingshan_nan.md) |
| items | `eq_tangziluoxicaiyuanlingshan_nan` | 唐紫罗细裁圆领衫·男 | `assets/default/item/clothing/eq_tangziluoxicaiyuanlingshan_nan.png` | 待出图 | [eq_tangziluoxicaiyuanlingshan_nan.md](items/clothing/eq_tangziluoxicaiyuanlingshan_nan.md) |
| items | `eq_tangziluoxiuyuanyuanlingshan_nan` | 唐紫罗绣缘圆领衫·男 | `assets/default/item/clothing/eq_tangziluoxiuyuanyuanlingshan_nan.png` | 待出图 | [eq_tangziluoxiuyuanyuanlingshan_nan.md](items/clothing/eq_tangziluoxiuyuanyuanlingshan_nan.md) |
| items | `it_yuanqinshufang` | 元代书房琴 | `assets/default/item/collectibles/it_yuanqinshufang.png` | 待出图 | [it_yuanqinshufang.md](items/collectibles/it_yuanqinshufang.md) |
| items | `eq_beisongqianhejingxiuyuantoulv_nan` | 北宋浅褐精绣圆头履·男 | `assets/default/item/shoes/eq_beisongqianhejingxiuyuantoulv_nan.png` | 待出图 | [eq_beisongqianhejingxiuyuantoulv_nan.md](items/shoes/eq_beisongqianhejingxiuyuantoulv_nan.md) |
| items | `eq_beisongqianhejinwenyuantoulv_nan` | 北宋浅褐锦纹圆头履·男 | `assets/default/item/shoes/eq_beisongqianhejinwenyuantoulv_nan.png` | 待出图 | [eq_beisongqianhejinwenyuantoulv_nan.md](items/shoes/eq_beisongqianhejinwenyuantoulv_nan.md) |
| items | `eq_beisongqianhelingwenyuantoulv_nan` | 北宋浅褐绫纹圆头履·男 | `assets/default/item/shoes/eq_beisongqianhelingwenyuantoulv_nan.png` | 待出图 | [eq_beisongqianhelingwenyuantoulv_nan.md](items/shoes/eq_beisongqianhelingwenyuantoulv_nan.md) |
| items | `eq_beisongqianhesucaiyuantoulv_nan` | 北宋浅褐素裁圆头履·男 | `assets/default/item/shoes/eq_beisongqianhesucaiyuantoulv_nan.png` | 待出图 | [eq_beisongqianhesucaiyuantoulv_nan.md](items/shoes/eq_beisongqianhesucaiyuantoulv_nan.md) |
| items | `eq_beisongqianhexicaiyuantoulv_nan` | 北宋浅褐细裁圆头履·男 | `assets/default/item/shoes/eq_beisongqianhexicaiyuantoulv_nan.png` | 待出图 | [eq_beisongqianhexicaiyuantoulv_nan.md](items/shoes/eq_beisongqianhexicaiyuantoulv_nan.md) |
| items | `eq_beisongqianhexiuyuanyuantoulv_nan` | 北宋浅褐绣缘圆头履·男 | `assets/default/item/shoes/eq_beisongqianhexiuyuanyuantoulv_nan.png` | 待出图 | [eq_beisongqianhexiuyuanyuantoulv_nan.md](items/shoes/eq_beisongqianhexiuyuanyuantoulv_nan.md) |
| items | `eq_beisongsubaijingxiuxiuyuanlv_nv` | 北宋素白精绣绣缘履·女 | `assets/default/item/shoes/eq_beisongsubaijingxiuxiuyuanlv_nv.png` | 待出图 | [eq_beisongsubaijingxiuxiuyuanlv_nv.md](items/shoes/eq_beisongsubaijingxiuxiuyuanlv_nv.md) |
| items | `eq_beisongsubaijinwenxiuyuanlv_nv` | 北宋素白锦纹绣缘履·女 | `assets/default/item/shoes/eq_beisongsubaijinwenxiuyuanlv_nv.png` | 待出图 | [eq_beisongsubaijinwenxiuyuanlv_nv.md](items/shoes/eq_beisongsubaijinwenxiuyuanlv_nv.md) |
| items | `eq_beisongsubailingwenxiuyuanlv_nv` | 北宋素白绫纹绣缘履·女 | `assets/default/item/shoes/eq_beisongsubailingwenxiuyuanlv_nv.png` | 待出图 | [eq_beisongsubailingwenxiuyuanlv_nv.md](items/shoes/eq_beisongsubailingwenxiuyuanlv_nv.md) |
| items | `eq_beisongsubaisucaixiuyuanlv_nv` | 北宋素白素裁绣缘履·女 | `assets/default/item/shoes/eq_beisongsubaisucaixiuyuanlv_nv.png` | 待出图 | [eq_beisongsubaisucaixiuyuanlv_nv.md](items/shoes/eq_beisongsubaisucaixiuyuanlv_nv.md) |
| items | `eq_beisongsubaixicaixiuyuanlv_nv` | 北宋素白细裁绣缘履·女 | `assets/default/item/shoes/eq_beisongsubaixicaixiuyuanlv_nv.png` | 待出图 | [eq_beisongsubaixicaixiuyuanlv_nv.md](items/shoes/eq_beisongsubaixicaixiuyuanlv_nv.md) |
| items | `eq_beisongsubaixiuyuanxiuyuanlv_nv` | 北宋素白绣缘绣缘履·女 | `assets/default/item/shoes/eq_beisongsubaixiuyuanxiuyuanlv_nv.png` | 待出图 | [eq_beisongsubaixiuyuanxiuyuanlv_nv.md](items/shoes/eq_beisongsubaixiuyuanxiuyuanlv_nv.md) |
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
| items | `eq_nansongqianhejingxiuqingdilv_nan` | 南宋浅褐精绣轻底履·男 | `assets/default/item/shoes/eq_nansongqianhejingxiuqingdilv_nan.png` | 待出图 | [eq_nansongqianhejingxiuqingdilv_nan.md](items/shoes/eq_nansongqianhejingxiuqingdilv_nan.md) |
| items | `eq_nansongqianhejinwenqingdilv_nan` | 南宋浅褐锦纹轻底履·男 | `assets/default/item/shoes/eq_nansongqianhejinwenqingdilv_nan.png` | 待出图 | [eq_nansongqianhejinwenqingdilv_nan.md](items/shoes/eq_nansongqianhejinwenqingdilv_nan.md) |
| items | `eq_nansongqianhelingwenqingdilv_nan` | 南宋浅褐绫纹轻底履·男 | `assets/default/item/shoes/eq_nansongqianhelingwenqingdilv_nan.png` | 待出图 | [eq_nansongqianhelingwenqingdilv_nan.md](items/shoes/eq_nansongqianhelingwenqingdilv_nan.md) |
| items | `eq_nansongqianhesucaiqingdilv_nan` | 南宋浅褐素裁轻底履·男 | `assets/default/item/shoes/eq_nansongqianhesucaiqingdilv_nan.png` | 待出图 | [eq_nansongqianhesucaiqingdilv_nan.md](items/shoes/eq_nansongqianhesucaiqingdilv_nan.md) |
| items | `eq_nansongqianhexicaiqingdilv_nan` | 南宋浅褐细裁轻底履·男 | `assets/default/item/shoes/eq_nansongqianhexicaiqingdilv_nan.png` | 待出图 | [eq_nansongqianhexicaiqingdilv_nan.md](items/shoes/eq_nansongqianhexicaiqingdilv_nan.md) |
| items | `eq_nansongqianhexiuyuanqingdilv_nan` | 南宋浅褐绣缘轻底履·男 | `assets/default/item/shoes/eq_nansongqianhexiuyuanqingdilv_nan.png` | 待出图 | [eq_nansongqianhexiuyuanqingdilv_nan.md](items/shoes/eq_nansongqianhexiuyuanqingdilv_nan.md) |
| items | `eq_nansongsubaijingxiuluoyuanlv_nv` | 南宋素白精绣罗缘履·女 | `assets/default/item/shoes/eq_nansongsubaijingxiuluoyuanlv_nv.png` | 待出图 | [eq_nansongsubaijingxiuluoyuanlv_nv.md](items/shoes/eq_nansongsubaijingxiuluoyuanlv_nv.md) |
| items | `eq_nansongsubaijinwenluoyuanlv_nv` | 南宋素白锦纹罗缘履·女 | `assets/default/item/shoes/eq_nansongsubaijinwenluoyuanlv_nv.png` | 待出图 | [eq_nansongsubaijinwenluoyuanlv_nv.md](items/shoes/eq_nansongsubaijinwenluoyuanlv_nv.md) |
| items | `eq_nansongsubailingwenluoyuanlv_nv` | 南宋素白绫纹罗缘履·女 | `assets/default/item/shoes/eq_nansongsubailingwenluoyuanlv_nv.png` | 待出图 | [eq_nansongsubailingwenluoyuanlv_nv.md](items/shoes/eq_nansongsubailingwenluoyuanlv_nv.md) |
| items | `eq_nansongsubaisucailuoyuanlv_nv` | 南宋素白素裁罗缘履·女 | `assets/default/item/shoes/eq_nansongsubaisucailuoyuanlv_nv.png` | 待出图 | [eq_nansongsubaisucailuoyuanlv_nv.md](items/shoes/eq_nansongsubaisucailuoyuanlv_nv.md) |
| items | `eq_nansongsubaixicailuoyuanlv_nv` | 南宋素白细裁罗缘履·女 | `assets/default/item/shoes/eq_nansongsubaixicailuoyuanlv_nv.png` | 待出图 | [eq_nansongsubaixicailuoyuanlv_nv.md](items/shoes/eq_nansongsubaixicailuoyuanlv_nv.md) |
| items | `eq_nansongsubaixiuyuanluoyuanlv_nv` | 南宋素白绣缘罗缘履·女 | `assets/default/item/shoes/eq_nansongsubaixiuyuanluoyuanlv_nv.png` | 待出图 | [eq_nansongsubaixiuyuanluoyuanlv_nv.md](items/shoes/eq_nansongsubaixiuyuanluoyuanlv_nv.md) |
| items | `eq_tangqianhejingxiupimiandilv_nan` | 唐浅褐精绣皮面低履·男 | `assets/default/item/shoes/eq_tangqianhejingxiupimiandilv_nan.png` | 待出图 | [eq_tangqianhejingxiupimiandilv_nan.md](items/shoes/eq_tangqianhejingxiupimiandilv_nan.md) |
| items | `eq_tangqianhejinwenpimiandilv_nan` | 唐浅褐锦纹皮面低履·男 | `assets/default/item/shoes/eq_tangqianhejinwenpimiandilv_nan.png` | 待出图 | [eq_tangqianhejinwenpimiandilv_nan.md](items/shoes/eq_tangqianhejinwenpimiandilv_nan.md) |
| items | `eq_tangqianhelingwenpimiandilv_nan` | 唐浅褐绫纹皮面低履·男 | `assets/default/item/shoes/eq_tangqianhelingwenpimiandilv_nan.png` | 待出图 | [eq_tangqianhelingwenpimiandilv_nan.md](items/shoes/eq_tangqianhelingwenpimiandilv_nan.md) |
| items | `eq_tangqianhesucaipimiandilv_nan` | 唐浅褐素裁皮面低履·男 | `assets/default/item/shoes/eq_tangqianhesucaipimiandilv_nan.png` | 待出图 | [eq_tangqianhesucaipimiandilv_nan.md](items/shoes/eq_tangqianhesucaipimiandilv_nan.md) |
| items | `eq_tangqianhexicaipimiandilv_nan` | 唐浅褐细裁皮面低履·男 | `assets/default/item/shoes/eq_tangqianhexicaipimiandilv_nan.png` | 待出图 | [eq_tangqianhexicaipimiandilv_nan.md](items/shoes/eq_tangqianhexicaipimiandilv_nan.md) |
| items | `eq_tangqianhexiuyuanpimiandilv_nan` | 唐浅褐绣缘皮面低履·男 | `assets/default/item/shoes/eq_tangqianhexiuyuanpimiandilv_nan.png` | 待出图 | [eq_tangqianhexiuyuanpimiandilv_nan.md](items/shoes/eq_tangqianhexiuyuanpimiandilv_nan.md) |
| items | `eq_tangsubaijingxiuqiaotoulv_nv` | 唐素白精绣翘头履·女 | `assets/default/item/shoes/eq_tangsubaijingxiuqiaotoulv_nv.png` | 待出图 | [eq_tangsubaijingxiuqiaotoulv_nv.md](items/shoes/eq_tangsubaijingxiuqiaotoulv_nv.md) |
| items | `eq_tangsubaijinwenqiaotoulv_nv` | 唐素白锦纹翘头履·女 | `assets/default/item/shoes/eq_tangsubaijinwenqiaotoulv_nv.png` | 待出图 | [eq_tangsubaijinwenqiaotoulv_nv.md](items/shoes/eq_tangsubaijinwenqiaotoulv_nv.md) |
| items | `eq_tangsubailingwenqiaotoulv_nv` | 唐素白绫纹翘头履·女 | `assets/default/item/shoes/eq_tangsubailingwenqiaotoulv_nv.png` | 待出图 | [eq_tangsubailingwenqiaotoulv_nv.md](items/shoes/eq_tangsubailingwenqiaotoulv_nv.md) |
| items | `eq_tangsubaisucaiqiaotoulv_nv` | 唐素白素裁翘头履·女 | `assets/default/item/shoes/eq_tangsubaisucaiqiaotoulv_nv.png` | 待出图 | [eq_tangsubaisucaiqiaotoulv_nv.md](items/shoes/eq_tangsubaisucaiqiaotoulv_nv.md) |
| items | `eq_tangsubaixicaiqiaotoulv_nv` | 唐素白细裁翘头履·女 | `assets/default/item/shoes/eq_tangsubaixicaiqiaotoulv_nv.png` | 待出图 | [eq_tangsubaixicaiqiaotoulv_nv.md](items/shoes/eq_tangsubaixicaiqiaotoulv_nv.md) |
| items | `eq_tangsubaixiuyuanqiaotoulv_nv` | 唐素白绣缘翘头履·女 | `assets/default/item/shoes/eq_tangsubaixiuyuanqiaotoulv_nv.png` | 待出图 | [eq_tangsubaixiuyuanqiaotoulv_nv.md](items/shoes/eq_tangsubaixiuyuanqiaotoulv_nv.md) |
| maps | `map_jianghu_world__ink_base` | 江湖万里图 · 水墨衬纸（全国底图） | `assets/default/map/jianghu_world/ink_base.png` | 待出图 | [jianghu_world_ink_base.md](maps/jianghu_world_ink_base.md) |
| maps | `map_region_donghai_islands__base` | 东海诸岛区域局部图 | `assets/default/map/regions/rg_donghai_islands.png` | 待出图 | [rg_donghai_islands.md](maps/region/rg_donghai_islands.md) |
| maps | `map_region_huxiang__base` | 湖湘区域局部图 | `assets/default/map/regions/rg_huxiang.png` | 待出图 | [rg_huxiang.md](maps/region/rg_huxiang.md) |
| maps | `map_region_jianghuai__base` | 江淮区域局部图 | `assets/default/map/regions/rg_jianghuai.png` | 待出图 | [rg_jianghuai.md](maps/region/rg_jianghuai.md) |
| maps | `map_region_jiangxi__base` | 江西区域局部图 | `assets/default/map/regions/rg_jiangxi.png` | 待出图 | [rg_jiangxi.md](maps/region/rg_jiangxi.md) |
| maps | `map_region_qilu__base` | 齐鲁区域局部图 | `assets/default/map/regions/rg_qilu.png` | 待出图 | [rg_qilu.md](maps/region/rg_qilu.md) |
| maps | `map_region_qingzang__base` | 青藏区域局部图 | `assets/default/map/regions/rg_qingzang.png` | 待出图 | [rg_qingzang.md](maps/region/rg_qingzang.md) |
| maps | `map_region_yundian_qianzhong__base` | 云滇黔中区域局部图 | `assets/default/map/regions/rg_yundian_qianzhong.png` | 待出图 | [rg_yundian_qianzhong.md](maps/region/rg_yundian_qianzhong.md) |

## 物品（11 类，名录 1331 项）

每张图的提示词在各文件「提示词」节。下表只列还要出的行（待出图 / 待重出），已入库的不再列出，标题里的计数含已出部分。作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可回到队列。

### 药物 / 补品 / 药材（96）· 已入库 64、已通过（作者） 32

（已全部入库。）

### 食材 / 食品（174）· 已入库 146、已通过（作者） 28

（已全部入库。）

### 武学秘籍（180）· 已入库 180

（已全部入库。）

### 兵器（247）· 已入库 223、已通过（作者） 24

（已全部入库。）

### 衣物（151）· 待出图 121、已入库 18、已通过（作者） 12

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 北宋本白精绣襕衫·男 | `eq_beisongbenbaijingxiulanshan_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_beisongbenbaijingxiulanshan_nan.md](items/clothing/eq_beisongbenbaijingxiulanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 2 | 北宋本白锦纹襕衫·男 | `eq_beisongbenbaijinwenlanshan_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_beisongbenbaijinwenlanshan_nan.md](items/clothing/eq_beisongbenbaijinwenlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 3 | 北宋本白绣缘襕衫·男 | `eq_beisongbenbaixiuyuanlanshan_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_beisongbenbaixiuyuanlanshan_nan.md](items/clothing/eq_beisongbenbaixiuyuanlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 4 | 北宋绯红精绣襕衫·男 | `eq_beisongfeihongjingxiulanshan_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_beisongfeihongjingxiulanshan_nan.md](items/clothing/eq_beisongfeihongjingxiulanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 5 | 北宋绯红锦纹襕衫·男 | `eq_beisongfeihongjinwenlanshan_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_beisongfeihongjinwenlanshan_nan.md](items/clothing/eq_beisongfeihongjinwenlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 6 | 北宋绯红绣缘襕衫·男 | `eq_beisongfeihongxiuyuanlanshan_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_beisongfeihongxiuyuanlanshan_nan.md](items/clothing/eq_beisongfeihongxiuyuanlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 7 | 北宋素白精绣褙衫裙·女 | `eq_beisongsubaijingxiubeishanqun_nv` | 地上 | 衣物·衫裙 | 待出图 | [eq_beisongsubaijingxiubeishanqun_nv.md](items/clothing/eq_beisongsubaijingxiubeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 8 | 北宋素白锦纹褙衫裙·女 | `eq_beisongsubaijinwenbeishanqun_nv` | 地下 | 衣物·衫裙 | 待出图 | [eq_beisongsubaijinwenbeishanqun_nv.md](items/clothing/eq_beisongsubaijinwenbeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 9 | 北宋素白绣缘褙衫裙·女 | `eq_beisongsubaixiuyuanbeishanqun_nv` | 地中 | 衣物·衫裙 | 待出图 | [eq_beisongsubaixiuyuanbeishanqun_nv.md](items/clothing/eq_beisongsubaixiuyuanbeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 10 | 北宋玄精绣襕衫·男 | `eq_beisongxuanjingxiulanshan_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_beisongxuanjingxiulanshan_nan.md](items/clothing/eq_beisongxuanjingxiulanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 11 | 北宋玄锦纹襕衫·男 | `eq_beisongxuanjinwenlanshan_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_beisongxuanjinwenlanshan_nan.md](items/clothing/eq_beisongxuanjinwenlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 12 | 北宋玄绣缘襕衫·男 | `eq_beisongxuanxiuyuanlanshan_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_beisongxuanxiuyuanlanshan_nan.md](items/clothing/eq_beisongxuanxiuyuanlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 13 | 北宋朱红精绣褙衫裙·女 | `eq_beisongzhuhongjingxiubeishanqun_nv` | 地上 | 衣物·衫裙 | 待出图 | [eq_beisongzhuhongjingxiubeishanqun_nv.md](items/clothing/eq_beisongzhuhongjingxiubeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 14 | 北宋朱红锦纹褙衫裙·女 | `eq_beisongzhuhongjinwenbeishanqun_nv` | 地下 | 衣物·衫裙 | 待出图 | [eq_beisongzhuhongjinwenbeishanqun_nv.md](items/clothing/eq_beisongzhuhongjinwenbeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 15 | 北宋朱红绣缘褙衫裙·女 | `eq_beisongzhuhongxiuyuanbeishanqun_nv` | 地中 | 衣物·衫裙 | 待出图 | [eq_beisongzhuhongxiuyuanbeishanqun_nv.md](items/clothing/eq_beisongzhuhongxiuyuanbeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 16 | 春秋本白精绣衣裳·男 | `eq_chunqiubenbaijingxiuyishang_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_chunqiubenbaijingxiuyishang_nan.md](items/clothing/eq_chunqiubenbaijingxiuyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 17 | 春秋本白锦纹衣裳·男 | `eq_chunqiubenbaijinwenyishang_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_chunqiubenbaijinwenyishang_nan.md](items/clothing/eq_chunqiubenbaijinwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 18 | 春秋本白绣缘衣裳·男 | `eq_chunqiubenbaixiuyuanyishang_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_chunqiubenbaixiuyuanyishang_nan.md](items/clothing/eq_chunqiubenbaixiuyuanyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 19 | 春秋素白精绣襦裳·女 | `eq_chunqiusubaijingxiurushang_nv` | 地上 | 衣物·衫裙 | 待出图 | [eq_chunqiusubaijingxiurushang_nv.md](items/clothing/eq_chunqiusubaijingxiurushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 20 | 春秋素白锦纹襦裳·女 | `eq_chunqiusubaijinwenrushang_nv` | 地下 | 衣物·衫裙 | 待出图 | [eq_chunqiusubaijinwenrushang_nv.md](items/clothing/eq_chunqiusubaijinwenrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 21 | 春秋素白绣缘襦裳·女 | `eq_chunqiusubaixiuyuanrushang_nv` | 地中 | 衣物·衫裙 | 待出图 | [eq_chunqiusubaixiuyuanrushang_nv.md](items/clothing/eq_chunqiusubaixiuyuanrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 22 | 春秋玄精绣衣裳·男 | `eq_chunqiuxuanjingxiuyishang_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_chunqiuxuanjingxiuyishang_nan.md](items/clothing/eq_chunqiuxuanjingxiuyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 23 | 春秋玄锦纹衣裳·男 | `eq_chunqiuxuanjinwenyishang_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_chunqiuxuanjinwenyishang_nan.md](items/clothing/eq_chunqiuxuanjinwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 24 | 春秋玄绣缘衣裳·男 | `eq_chunqiuxuanxiuyuanyishang_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_chunqiuxuanxiuyuanyishang_nan.md](items/clothing/eq_chunqiuxuanxiuyuanyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 25 | 春秋纁红精绣襦裳·女 | `eq_chunqiuxunhongjingxiurushang_nv` | 地上 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhongjingxiurushang_nv.md](items/clothing/eq_chunqiuxunhongjingxiurushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 26 | 春秋纁红精绣衣裳·男 | `eq_chunqiuxunhongjingxiuyishang_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhongjingxiuyishang_nan.md](items/clothing/eq_chunqiuxunhongjingxiuyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 27 | 春秋纁红锦纹襦裳·女 | `eq_chunqiuxunhongjinwenrushang_nv` | 地下 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhongjinwenrushang_nv.md](items/clothing/eq_chunqiuxunhongjinwenrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 28 | 春秋纁红锦纹衣裳·男 | `eq_chunqiuxunhongjinwenyishang_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhongjinwenyishang_nan.md](items/clothing/eq_chunqiuxunhongjinwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 29 | 春秋纁红绣缘襦裳·女 | `eq_chunqiuxunhongxiuyuanrushang_nv` | 地中 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhongxiuyuanrushang_nv.md](items/clothing/eq_chunqiuxunhongxiuyuanrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 30 | 春秋纁红绣缘衣裳·男 | `eq_chunqiuxunhongxiuyuanyishang_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhongxiuyuanyishang_nan.md](items/clothing/eq_chunqiuxunhongxiuyuanyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 31 | 南宋本白精绣便襕衫·男 | `eq_nansongbenbaijingxiubianlanshan_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_nansongbenbaijingxiubianlanshan_nan.md](items/clothing/eq_nansongbenbaijingxiubianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 32 | 南宋本白锦纹便襕衫·男 | `eq_nansongbenbaijinwenbianlanshan_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_nansongbenbaijinwenbianlanshan_nan.md](items/clothing/eq_nansongbenbaijinwenbianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 33 | 南宋本白绣缘便襕衫·男 | `eq_nansongbenbaixiuyuanbianlanshan_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_nansongbenbaixiuyuanbianlanshan_nan.md](items/clothing/eq_nansongbenbaixiuyuanbianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 34 | 南宋绯红精绣便襕衫·男 | `eq_nansongfeihongjingxiubianlanshan_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_nansongfeihongjingxiubianlanshan_nan.md](items/clothing/eq_nansongfeihongjingxiubianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 35 | 南宋绯红锦纹便襕衫·男 | `eq_nansongfeihongjinwenbianlanshan_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_nansongfeihongjinwenbianlanshan_nan.md](items/clothing/eq_nansongfeihongjinwenbianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 36 | 南宋绯红绣缘便襕衫·男 | `eq_nansongfeihongxiuyuanbianlanshan_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_nansongfeihongxiuyuanbianlanshan_nan.md](items/clothing/eq_nansongfeihongxiuyuanbianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 37 | 南宋素白精绣罗衫裙·女 | `eq_nansongsubaijingxiuluoshanqun_nv` | 地上 | 衣物·衫裙 | 待出图 | [eq_nansongsubaijingxiuluoshanqun_nv.md](items/clothing/eq_nansongsubaijingxiuluoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 38 | 南宋素白锦纹罗衫裙·女 | `eq_nansongsubaijinwenluoshanqun_nv` | 地下 | 衣物·衫裙 | 待出图 | [eq_nansongsubaijinwenluoshanqun_nv.md](items/clothing/eq_nansongsubaijinwenluoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 39 | 南宋素白绣缘罗衫裙·女 | `eq_nansongsubaixiuyuanluoshanqun_nv` | 地中 | 衣物·衫裙 | 待出图 | [eq_nansongsubaixiuyuanluoshanqun_nv.md](items/clothing/eq_nansongsubaixiuyuanluoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 40 | 南宋玄精绣便襕衫·男 | `eq_nansongxuanjingxiubianlanshan_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_nansongxuanjingxiubianlanshan_nan.md](items/clothing/eq_nansongxuanjingxiubianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 41 | 南宋玄锦纹便襕衫·男 | `eq_nansongxuanjinwenbianlanshan_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_nansongxuanjinwenbianlanshan_nan.md](items/clothing/eq_nansongxuanjinwenbianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 42 | 南宋玄绣缘便襕衫·男 | `eq_nansongxuanxiuyuanbianlanshan_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_nansongxuanxiuyuanbianlanshan_nan.md](items/clothing/eq_nansongxuanxiuyuanbianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 43 | 南宋紫褐精绣罗衫裙·女 | `eq_nansongzihejingxiuluoshanqun_nv` | 地上 | 衣物·衫裙 | 待出图 | [eq_nansongzihejingxiuluoshanqun_nv.md](items/clothing/eq_nansongzihejingxiuluoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 44 | 南宋紫褐锦纹罗衫裙·女 | `eq_nansongzihejinwenluoshanqun_nv` | 地下 | 衣物·衫裙 | 待出图 | [eq_nansongzihejinwenluoshanqun_nv.md](items/clothing/eq_nansongzihejinwenluoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 45 | 南宋紫褐绣缘罗衫裙·女 | `eq_nansongzihexiuyuanluoshanqun_nv` | 地中 | 衣物·衫裙 | 待出图 | [eq_nansongzihexiuyuanluoshanqun_nv.md](items/clothing/eq_nansongzihexiuyuanluoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 46 | 唐本白精绣圆领衫·男 | `eq_tangbenbaijingxiuyuanlingshan_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_tangbenbaijingxiuyuanlingshan_nan.md](items/clothing/eq_tangbenbaijingxiuyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 47 | 唐本白锦纹圆领衫·男 | `eq_tangbenbaijinwenyuanlingshan_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_tangbenbaijinwenyuanlingshan_nan.md](items/clothing/eq_tangbenbaijinwenyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 48 | 唐本白绣缘圆领衫·男 | `eq_tangbenbaixiuyuanyuanlingshan_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_tangbenbaixiuyuanyuanlingshan_nan.md](items/clothing/eq_tangbenbaixiuyuanyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 49 | 唐草绿精绣襦裙·女 | `eq_tangcaolvjingxiuruqun_nv` | 地上 | 衣物·衫裙 | 待出图 | [eq_tangcaolvjingxiuruqun_nv.md](items/clothing/eq_tangcaolvjingxiuruqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 50 | 唐草绿锦纹襦裙·女 | `eq_tangcaolvjinwenruqun_nv` | 地下 | 衣物·衫裙 | 待出图 | [eq_tangcaolvjinwenruqun_nv.md](items/clothing/eq_tangcaolvjinwenruqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 51 | 唐草绿绣缘襦裙·女 | `eq_tangcaolvxiuyuanruqun_nv` | 地中 | 衣物·衫裙 | 待出图 | [eq_tangcaolvxiuyuanruqun_nv.md](items/clothing/eq_tangcaolvxiuyuanruqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 52 | 唐素白精绣襦裙·女 | `eq_tangsubaijingxiuruqun_nv` | 地上 | 衣物·衫裙 | 待出图 | [eq_tangsubaijingxiuruqun_nv.md](items/clothing/eq_tangsubaijingxiuruqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 53 | 唐素白锦纹襦裙·女 | `eq_tangsubaijinwenruqun_nv` | 地下 | 衣物·衫裙 | 待出图 | [eq_tangsubaijinwenruqun_nv.md](items/clothing/eq_tangsubaijinwenruqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 54 | 唐素白绣缘襦裙·女 | `eq_tangsubaixiuyuanruqun_nv` | 地中 | 衣物·衫裙 | 待出图 | [eq_tangsubaixiuyuanruqun_nv.md](items/clothing/eq_tangsubaixiuyuanruqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 55 | 唐玄精绣圆领衫·男 | `eq_tangxuanjingxiuyuanlingshan_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_tangxuanjingxiuyuanlingshan_nan.md](items/clothing/eq_tangxuanjingxiuyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 56 | 唐玄锦纹圆领衫·男 | `eq_tangxuanjinwenyuanlingshan_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_tangxuanjinwenyuanlingshan_nan.md](items/clothing/eq_tangxuanjinwenyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 57 | 唐玄绣缘圆领衫·男 | `eq_tangxuanxiuyuanyuanlingshan_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_tangxuanxiuyuanyuanlingshan_nan.md](items/clothing/eq_tangxuanxiuyuanyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 58 | 唐紫罗精绣圆领衫·男 | `eq_tangziluojingxiuyuanlingshan_nan` | 地上 | 衣物·袍服 | 待出图 | [eq_tangziluojingxiuyuanlingshan_nan.md](items/clothing/eq_tangziluojingxiuyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 59 | 唐紫罗锦纹圆领衫·男 | `eq_tangziluojinwenyuanlingshan_nan` | 地下 | 衣物·袍服 | 待出图 | [eq_tangziluojinwenyuanlingshan_nan.md](items/clothing/eq_tangziluojinwenyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 60 | 唐紫罗绣缘圆领衫·男 | `eq_tangziluoxiuyuanyuanlingshan_nan` | 地中 | 衣物·袍服 | 待出图 | [eq_tangziluoxiuyuanyuanlingshan_nan.md](items/clothing/eq_tangziluoxiuyuanyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 61 | 北宋本白绫纹襕衫·男 | `eq_beisongbenbailingwenlanshan_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_beisongbenbailingwenlanshan_nan.md](items/clothing/eq_beisongbenbailingwenlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 62 | 北宋本白细裁襕衫·男 | `eq_beisongbenbaixicailanshan_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_beisongbenbaixicailanshan_nan.md](items/clothing/eq_beisongbenbaixicailanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 63 | 北宋绯红绫纹襕衫·男 | `eq_beisongfeihonglingwenlanshan_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_beisongfeihonglingwenlanshan_nan.md](items/clothing/eq_beisongfeihonglingwenlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 64 | 北宋绯红细裁襕衫·男 | `eq_beisongfeihongxicailanshan_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_beisongfeihongxicailanshan_nan.md](items/clothing/eq_beisongfeihongxicailanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 65 | 北宋素白绫纹褙衫裙·女 | `eq_beisongsubailingwenbeishanqun_nv` | 玄上 | 衣物·衫裙 | 待出图 | [eq_beisongsubailingwenbeishanqun_nv.md](items/clothing/eq_beisongsubailingwenbeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 66 | 北宋素白细裁褙衫裙·女 | `eq_beisongsubaixicaibeishanqun_nv` | 玄下 | 衣物·衫裙 | 待出图 | [eq_beisongsubaixicaibeishanqun_nv.md](items/clothing/eq_beisongsubaixicaibeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 67 | 北宋玄绫纹襕衫·男 | `eq_beisongxuanlingwenlanshan_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_beisongxuanlingwenlanshan_nan.md](items/clothing/eq_beisongxuanlingwenlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 68 | 北宋玄细裁襕衫·男 | `eq_beisongxuanxicailanshan_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_beisongxuanxicailanshan_nan.md](items/clothing/eq_beisongxuanxicailanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 69 | 北宋朱红绫纹褙衫裙·女 | `eq_beisongzhuhonglingwenbeishanqun_nv` | 玄上 | 衣物·衫裙 | 待出图 | [eq_beisongzhuhonglingwenbeishanqun_nv.md](items/clothing/eq_beisongzhuhonglingwenbeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 70 | 北宋朱红细裁褙衫裙·女 | `eq_beisongzhuhongxicaibeishanqun_nv` | 玄下 | 衣物·衫裙 | 待出图 | [eq_beisongzhuhongxicaibeishanqun_nv.md](items/clothing/eq_beisongzhuhongxicaibeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 71 | 春秋本白绫纹衣裳·男 | `eq_chunqiubenbailingwenyishang_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_chunqiubenbailingwenyishang_nan.md](items/clothing/eq_chunqiubenbailingwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 72 | 春秋本白细裁衣裳·男 | `eq_chunqiubenbaixicaiyishang_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_chunqiubenbaixicaiyishang_nan.md](items/clothing/eq_chunqiubenbaixicaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 73 | 春秋素白绫纹襦裳·女 | `eq_chunqiusubailingwenrushang_nv` | 玄上 | 衣物·衫裙 | 待出图 | [eq_chunqiusubailingwenrushang_nv.md](items/clothing/eq_chunqiusubailingwenrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 74 | 春秋素白细裁襦裳·女 | `eq_chunqiusubaixicairushang_nv` | 玄下 | 衣物·衫裙 | 待出图 | [eq_chunqiusubaixicairushang_nv.md](items/clothing/eq_chunqiusubaixicairushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 75 | 春秋玄绫纹衣裳·男 | `eq_chunqiuxuanlingwenyishang_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_chunqiuxuanlingwenyishang_nan.md](items/clothing/eq_chunqiuxuanlingwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 76 | 春秋玄细裁衣裳·男 | `eq_chunqiuxuanxicaiyishang_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_chunqiuxuanxicaiyishang_nan.md](items/clothing/eq_chunqiuxuanxicaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 77 | 春秋纁红绫纹襦裳·女 | `eq_chunqiuxunhonglingwenrushang_nv` | 玄上 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhonglingwenrushang_nv.md](items/clothing/eq_chunqiuxunhonglingwenrushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 78 | 春秋纁红绫纹衣裳·男 | `eq_chunqiuxunhonglingwenyishang_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhonglingwenyishang_nan.md](items/clothing/eq_chunqiuxunhonglingwenyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 79 | 春秋纁红细裁襦裳·女 | `eq_chunqiuxunhongxicairushang_nv` | 玄下 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhongxicairushang_nv.md](items/clothing/eq_chunqiuxunhongxicairushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 80 | 春秋纁红细裁衣裳·男 | `eq_chunqiuxunhongxicaiyishang_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhongxicaiyishang_nan.md](items/clothing/eq_chunqiuxunhongxicaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 81 | 南宋本白绫纹便襕衫·男 | `eq_nansongbenbailingwenbianlanshan_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_nansongbenbailingwenbianlanshan_nan.md](items/clothing/eq_nansongbenbailingwenbianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 82 | 南宋本白细裁便襕衫·男 | `eq_nansongbenbaixicaibianlanshan_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_nansongbenbaixicaibianlanshan_nan.md](items/clothing/eq_nansongbenbaixicaibianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 83 | 南宋绯红绫纹便襕衫·男 | `eq_nansongfeihonglingwenbianlanshan_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_nansongfeihonglingwenbianlanshan_nan.md](items/clothing/eq_nansongfeihonglingwenbianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 84 | 南宋绯红细裁便襕衫·男 | `eq_nansongfeihongxicaibianlanshan_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_nansongfeihongxicaibianlanshan_nan.md](items/clothing/eq_nansongfeihongxicaibianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 85 | 南宋素白绫纹罗衫裙·女 | `eq_nansongsubailingwenluoshanqun_nv` | 玄上 | 衣物·衫裙 | 待出图 | [eq_nansongsubailingwenluoshanqun_nv.md](items/clothing/eq_nansongsubailingwenluoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 86 | 南宋素白细裁罗衫裙·女 | `eq_nansongsubaixicailuoshanqun_nv` | 玄下 | 衣物·衫裙 | 待出图 | [eq_nansongsubaixicailuoshanqun_nv.md](items/clothing/eq_nansongsubaixicailuoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 87 | 南宋玄绫纹便襕衫·男 | `eq_nansongxuanlingwenbianlanshan_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_nansongxuanlingwenbianlanshan_nan.md](items/clothing/eq_nansongxuanlingwenbianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 88 | 南宋玄细裁便襕衫·男 | `eq_nansongxuanxicaibianlanshan_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_nansongxuanxicaibianlanshan_nan.md](items/clothing/eq_nansongxuanxicaibianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 89 | 南宋紫褐绫纹罗衫裙·女 | `eq_nansongzihelingwenluoshanqun_nv` | 玄上 | 衣物·衫裙 | 待出图 | [eq_nansongzihelingwenluoshanqun_nv.md](items/clothing/eq_nansongzihelingwenluoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 90 | 南宋紫褐细裁罗衫裙·女 | `eq_nansongzihexicailuoshanqun_nv` | 玄下 | 衣物·衫裙 | 待出图 | [eq_nansongzihexicailuoshanqun_nv.md](items/clothing/eq_nansongzihexicailuoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 91 | 唐本白绫纹圆领衫·男 | `eq_tangbenbailingwenyuanlingshan_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_tangbenbailingwenyuanlingshan_nan.md](items/clothing/eq_tangbenbailingwenyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 92 | 唐本白细裁圆领衫·男 | `eq_tangbenbaixicaiyuanlingshan_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_tangbenbaixicaiyuanlingshan_nan.md](items/clothing/eq_tangbenbaixicaiyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 93 | 唐草绿绫纹襦裙·女 | `eq_tangcaolvlingwenruqun_nv` | 玄上 | 衣物·衫裙 | 待出图 | [eq_tangcaolvlingwenruqun_nv.md](items/clothing/eq_tangcaolvlingwenruqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 94 | 唐草绿细裁襦裙·女 | `eq_tangcaolvxicairuqun_nv` | 玄下 | 衣物·衫裙 | 待出图 | [eq_tangcaolvxicairuqun_nv.md](items/clothing/eq_tangcaolvxicairuqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 95 | 唐素白绫纹襦裙·女 | `eq_tangsubailingwenruqun_nv` | 玄上 | 衣物·衫裙 | 待出图 | [eq_tangsubailingwenruqun_nv.md](items/clothing/eq_tangsubailingwenruqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 96 | 唐素白细裁襦裙·女 | `eq_tangsubaixicairuqun_nv` | 玄下 | 衣物·衫裙 | 待出图 | [eq_tangsubaixicairuqun_nv.md](items/clothing/eq_tangsubaixicairuqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 97 | 唐玄绫纹圆领衫·男 | `eq_tangxuanlingwenyuanlingshan_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_tangxuanlingwenyuanlingshan_nan.md](items/clothing/eq_tangxuanlingwenyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 98 | 唐玄细裁圆领衫·男 | `eq_tangxuanxicaiyuanlingshan_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_tangxuanxicaiyuanlingshan_nan.md](items/clothing/eq_tangxuanxicaiyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 99 | 唐紫罗绫纹圆领衫·男 | `eq_tangziluolingwenyuanlingshan_nan` | 玄上 | 衣物·袍服 | 待出图 | [eq_tangziluolingwenyuanlingshan_nan.md](items/clothing/eq_tangziluolingwenyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 100 | 唐紫罗细裁圆领衫·男 | `eq_tangziluoxicaiyuanlingshan_nan` | 玄下 | 衣物·袍服 | 待出图 | [eq_tangziluoxicaiyuanlingshan_nan.md](items/clothing/eq_tangziluoxicaiyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 101 | 北宋本白素裁襕衫·男 | `eq_beisongbenbaisucailanshan_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_beisongbenbaisucailanshan_nan.md](items/clothing/eq_beisongbenbaisucailanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 102 | 北宋绯红素裁襕衫·男 | `eq_beisongfeihongsucailanshan_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_beisongfeihongsucailanshan_nan.md](items/clothing/eq_beisongfeihongsucailanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 103 | 北宋素白素裁褙衫裙·女 | `eq_beisongsubaisucaibeishanqun_nv` | 黄中 | 衣物·衫裙 | 待出图 | [eq_beisongsubaisucaibeishanqun_nv.md](items/clothing/eq_beisongsubaisucaibeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 104 | 北宋玄素裁襕衫·男 | `eq_beisongxuansucailanshan_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_beisongxuansucailanshan_nan.md](items/clothing/eq_beisongxuansucailanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 105 | 北宋朱红素裁褙衫裙·女 | `eq_beisongzhuhongsucaibeishanqun_nv` | 黄中 | 衣物·衫裙 | 待出图 | [eq_beisongzhuhongsucaibeishanqun_nv.md](items/clothing/eq_beisongzhuhongsucaibeishanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 106 | 春秋本白素裁衣裳·男 | `eq_chunqiubenbaisucaiyishang_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_chunqiubenbaisucaiyishang_nan.md](items/clothing/eq_chunqiubenbaisucaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 107 | 春秋素白素裁襦裳·女 | `eq_chunqiusubaisucairushang_nv` | 黄中 | 衣物·衫裙 | 待出图 | [eq_chunqiusubaisucairushang_nv.md](items/clothing/eq_chunqiusubaisucairushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 108 | 春秋玄素裁衣裳·男 | `eq_chunqiuxuansucaiyishang_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_chunqiuxuansucaiyishang_nan.md](items/clothing/eq_chunqiuxuansucaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 109 | 春秋纁红素裁襦裳·女 | `eq_chunqiuxunhongsucairushang_nv` | 黄中 | 衣物·衫裙 | 待出图 | [eq_chunqiuxunhongsucairushang_nv.md](items/clothing/eq_chunqiuxunhongsucairushang_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 110 | 春秋纁红素裁衣裳·男 | `eq_chunqiuxunhongsucaiyishang_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_chunqiuxunhongsucaiyishang_nan.md](items/clothing/eq_chunqiuxunhongsucaiyishang_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 111 | 虎皮衣 | `eq_hupiyi` | 黄中 | 衣物·皮衣 | 待出图 | [eq_hupiyi.md](items/clothing/eq_hupiyi.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 112 | 南宋本白素裁便襕衫·男 | `eq_nansongbenbaisucaibianlanshan_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_nansongbenbaisucaibianlanshan_nan.md](items/clothing/eq_nansongbenbaisucaibianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 113 | 南宋绯红素裁便襕衫·男 | `eq_nansongfeihongsucaibianlanshan_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_nansongfeihongsucaibianlanshan_nan.md](items/clothing/eq_nansongfeihongsucaibianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 114 | 南宋素白素裁罗衫裙·女 | `eq_nansongsubaisucailuoshanqun_nv` | 黄中 | 衣物·衫裙 | 待出图 | [eq_nansongsubaisucailuoshanqun_nv.md](items/clothing/eq_nansongsubaisucailuoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 115 | 南宋玄素裁便襕衫·男 | `eq_nansongxuansucaibianlanshan_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_nansongxuansucaibianlanshan_nan.md](items/clothing/eq_nansongxuansucaibianlanshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 116 | 南宋紫褐素裁罗衫裙·女 | `eq_nansongzihesucailuoshanqun_nv` | 黄中 | 衣物·衫裙 | 待出图 | [eq_nansongzihesucailuoshanqun_nv.md](items/clothing/eq_nansongzihesucailuoshanqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 117 | 唐本白素裁圆领衫·男 | `eq_tangbenbaisucaiyuanlingshan_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_tangbenbaisucaiyuanlingshan_nan.md](items/clothing/eq_tangbenbaisucaiyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 118 | 唐草绿素裁襦裙·女 | `eq_tangcaolvsucairuqun_nv` | 黄中 | 衣物·衫裙 | 待出图 | [eq_tangcaolvsucairuqun_nv.md](items/clothing/eq_tangcaolvsucairuqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 119 | 唐素白素裁襦裙·女 | `eq_tangsubaisucairuqun_nv` | 黄中 | 衣物·衫裙 | 待出图 | [eq_tangsubaisucairuqun_nv.md](items/clothing/eq_tangsubaisucairuqun_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 120 | 唐玄素裁圆领衫·男 | `eq_tangxuansucaiyuanlingshan_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_tangxuansucaiyuanlingshan_nan.md](items/clothing/eq_tangxuansucaiyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 121 | 唐紫罗素裁圆领衫·男 | `eq_tangziluosucaiyuanlingshan_nan` | 黄中 | 衣物·袍服 | 待出图 | [eq_tangziluosucaiyuanlingshan_nan.md](items/clothing/eq_tangziluosucaiyuanlingshan_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |

### 制式盔甲（15）· 已入库 8、待出图 7

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 明光铠 | `eq_mingguangkai` | 地中 | 制式盔甲·明光 | 待出图 | [eq_mingguangkai.md](items/armor/eq_mingguangkai.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 2 | 山文甲 | `eq_shanwenjia` | 地下 | 制式盔甲·山文 | 待出图 | [eq_shanwenjia.md](items/armor/eq_shanwenjia.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 3 | 细鳞甲 | `eq_xilinjia` | 地下 | 制式盔甲·细鳞 | 待出图 | [eq_xilinjia.md](items/armor/eq_xilinjia.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 4 | 盆领铁甲 | `eq_penlingtiejia` | 玄上 | 制式盔甲·盆领 | 待出图 | [eq_penlingtiejia.md](items/armor/eq_penlingtiejia.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 5 | 皮甲 | `eq_pijia` | 玄下 | 制式盔甲·皮札 | 待出图 | [eq_pijia.md](items/armor/eq_pijia.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 6 | 锁子甲 | `eq_suozijia` | 玄上 | 制式盔甲·锁环 | 待出图 | [eq_suozijia.md](items/armor/eq_suozijia.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 7 | 筒袖铠 | `eq_tongxiukai` | 玄下 | 制式盔甲·筒袖 | 待出图 | [eq_tongxiukai.md](items/armor/eq_tongxiukai.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |

### 内甲（8）· 已通过（作者） 8

（已全部入库。）

### 护肩 / 披风 / 头饰（110）· 待出图 62、已入库 36、已通过（作者） 12

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 北宋绯红绣缘行旅围披 | `eq_beisongfeihongxiuyuanxinglvweipi_tongyong` | 地中 | 披风·围披 | 待出图 | [eq_beisongfeihongxiuyuanxinglvweipi_tongyong.md](items/accessories/eq_beisongfeihongxiuyuanxinglvweipi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 2 | 北宋浅黄精绣方幅巾·男 | `eq_beisongqianhuangjingxiufangfujin_nan` | 地上 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongqianhuangjingxiufangfujin_nan.md](items/accessories/eq_beisongqianhuangjingxiufangfujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 3 | 北宋浅黄锦纹方幅巾·男 | `eq_beisongqianhuangjinwenfangfujin_nan` | 地下 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongqianhuangjinwenfangfujin_nan.md](items/accessories/eq_beisongqianhuangjinwenfangfujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 4 | 北宋浅黄绣缘方幅巾·男 | `eq_beisongqianhuangxiuyuanfangfujin_nan` | 地中 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongqianhuangxiuyuanfangfujin_nan.md](items/accessories/eq_beisongqianhuangxiuyuanfangfujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 5 | 北宋素白精绣帛梳饰·女 | `eq_beisongsubaijingxiuboshushi_nv` | 地上 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongsubaijingxiuboshushi_nv.md](items/accessories/eq_beisongsubaijingxiuboshushi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 6 | 北宋素白锦纹帛梳饰·女 | `eq_beisongsubaijinwenboshushi_nv` | 地下 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongsubaijinwenboshushi_nv.md](items/accessories/eq_beisongsubaijinwenboshushi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 7 | 北宋素白绣缘帛梳饰·女 | `eq_beisongsubaixiuyuanboshushi_nv` | 地中 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongsubaixiuyuanboshushi_nv.md](items/accessories/eq_beisongsubaixiuyuanboshushi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 8 | 春秋浅黄精绣束发冠巾·男 | `eq_chunqiuqianhuangjingxiushufaguanjin_nan` | 地上 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuangjingxiushufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangjingxiushufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 9 | 春秋浅黄锦纹束发冠巾·男 | `eq_chunqiuqianhuangjinwenshufaguanjin_nan` | 地下 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuangjinwenshufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangjinwenshufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 10 | 春秋浅黄绣缘束发冠巾·男 | `eq_chunqiuqianhuangxiuyuanshufaguanjin_nan` | 地中 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuangxiuyuanshufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangxiuyuanshufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 11 | 春秋素白精绣笄饰·女 | `eq_chunqiusubaijingxiujishi_nv` | 地上 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubaijingxiujishi_nv.md](items/accessories/eq_chunqiusubaijingxiujishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 12 | 春秋素白锦纹笄饰·女 | `eq_chunqiusubaijinwenjishi_nv` | 地下 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubaijinwenjishi_nv.md](items/accessories/eq_chunqiusubaijinwenjishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 13 | 春秋素白绣缘笄饰·女 | `eq_chunqiusubaixiuyuanjishi_nv` | 地中 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubaixiuyuanjishi_nv.md](items/accessories/eq_chunqiusubaixiuyuanjishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 14 | 春秋纁红绣缘裘帛行披 | `eq_chunqiuxunhongxiuyuanqiuboxingpi_tongyong` | 地中 | 披风·围披 | 待出图 | [eq_chunqiuxunhongxiuyuanqiuboxingpi_tongyong.md](items/accessories/eq_chunqiuxunhongxiuyuanqiuboxingpi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 15 | 南宋绯红绣缘素缘围披 | `eq_nansongfeihongxiuyuansuyuanweipi_tongyong` | 地中 | 披风·围披 | 待出图 | [eq_nansongfeihongxiuyuansuyuanweipi_tongyong.md](items/accessories/eq_nansongfeihongxiuyuansuyuanweipi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 16 | 南宋浅黄精绣折角幅巾·男 | `eq_nansongqianhuangjingxiuzhejiaofujin_nan` | 地上 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongqianhuangjingxiuzhejiaofujin_nan.md](items/accessories/eq_nansongqianhuangjingxiuzhejiaofujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 17 | 南宋浅黄锦纹折角幅巾·男 | `eq_nansongqianhuangjinwenzhejiaofujin_nan` | 地下 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongqianhuangjinwenzhejiaofujin_nan.md](items/accessories/eq_nansongqianhuangjinwenzhejiaofujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 18 | 南宋浅黄绣缘折角幅巾·男 | `eq_nansongqianhuangxiuyuanzhejiaofujin_nan` | 地中 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongqianhuangxiuyuanzhejiaofujin_nan.md](items/accessories/eq_nansongqianhuangxiuyuanzhejiaofujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 19 | 南宋素白精绣束帛钗·女 | `eq_nansongsubaijingxiushubochai_nv` | 地上 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongsubaijingxiushubochai_nv.md](items/accessories/eq_nansongsubaijingxiushubochai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 20 | 南宋素白锦纹束帛钗·女 | `eq_nansongsubaijinwenshubochai_nv` | 地下 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongsubaijinwenshubochai_nv.md](items/accessories/eq_nansongsubaijinwenshubochai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 21 | 南宋素白绣缘束帛钗·女 | `eq_nansongsubaixiuyuanshubochai_nv` | 地中 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongsubaixiuyuanshubochai_nv.md](items/accessories/eq_nansongsubaixiuyuanshubochai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 22 | 青铜饕餮盔 | `eq_qingtongtaotiekui` | 地下 | 头饰·青铜盔 | 待出图 | [eq_qingtongtaotiekui.md](items/accessories/eq_qingtongtaotiekui.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 23 | 唐浅黄精绣软脚巾·男 | `eq_tangqianhuangjingxiuruanjiaojin_nan` | 地上 | 头饰·冠巾簪饰 | 待出图 | [eq_tangqianhuangjingxiuruanjiaojin_nan.md](items/accessories/eq_tangqianhuangjingxiuruanjiaojin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 24 | 唐浅黄锦纹软脚巾·男 | `eq_tangqianhuangjinwenruanjiaojin_nan` | 地下 | 头饰·冠巾簪饰 | 待出图 | [eq_tangqianhuangjinwenruanjiaojin_nan.md](items/accessories/eq_tangqianhuangjinwenruanjiaojin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 25 | 唐浅黄绣缘软脚巾·男 | `eq_tangqianhuangxiuyuanruanjiaojin_nan` | 地中 | 头饰·冠巾簪饰 | 待出图 | [eq_tangqianhuangxiuyuanruanjiaojin_nan.md](items/accessories/eq_tangqianhuangxiuyuanruanjiaojin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 26 | 唐素白精绣梳钗·女 | `eq_tangsubaijingxiushuchai_nv` | 地上 | 头饰·冠巾簪饰 | 待出图 | [eq_tangsubaijingxiushuchai_nv.md](items/accessories/eq_tangsubaijingxiushuchai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 27 | 唐素白锦纹梳钗·女 | `eq_tangsubaijinwenshuchai_nv` | 地下 | 头饰·冠巾簪饰 | 待出图 | [eq_tangsubaijinwenshuchai_nv.md](items/accessories/eq_tangsubaijinwenshuchai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 28 | 唐素白绣缘梳钗·女 | `eq_tangsubaixiuyuanshuchai_nv` | 地中 | 头饰·冠巾簪饰 | 待出图 | [eq_tangsubaixiuyuanshuchai_nv.md](items/accessories/eq_tangsubaixiuyuanshuchai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 29 | 唐紫罗绣缘帛面行披 | `eq_tangziluoxiuyuanbomianxingpi_tongyong` | 地中 | 披风·围披 | 待出图 | [eq_tangziluoxiuyuanbomianxingpi_tongyong.md](items/accessories/eq_tangziluoxiuyuanbomianxingpi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 30 | 北宋绯红细裁行旅围披 | `eq_beisongfeihongxicaixinglvweipi_tongyong` | 玄中 | 披风·围披 | 待出图 | [eq_beisongfeihongxicaixinglvweipi_tongyong.md](items/accessories/eq_beisongfeihongxicaixinglvweipi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 31 | 北宋浅黄绫纹方幅巾·男 | `eq_beisongqianhuanglingwenfangfujin_nan` | 玄上 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongqianhuanglingwenfangfujin_nan.md](items/accessories/eq_beisongqianhuanglingwenfangfujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 32 | 北宋浅黄细裁方幅巾·男 | `eq_beisongqianhuangxicaifangfujin_nan` | 玄下 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongqianhuangxicaifangfujin_nan.md](items/accessories/eq_beisongqianhuangxicaifangfujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 33 | 北宋素白绫纹帛梳饰·女 | `eq_beisongsubailingwenboshushi_nv` | 玄上 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongsubailingwenboshushi_nv.md](items/accessories/eq_beisongsubailingwenboshushi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 34 | 北宋素白细裁帛梳饰·女 | `eq_beisongsubaixicaiboshushi_nv` | 玄下 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongsubaixicaiboshushi_nv.md](items/accessories/eq_beisongsubaixicaiboshushi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 35 | 春秋浅黄绫纹束发冠巾·男 | `eq_chunqiuqianhuanglingwenshufaguanjin_nan` | 玄上 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuanglingwenshufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuanglingwenshufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 36 | 春秋浅黄细裁束发冠巾·男 | `eq_chunqiuqianhuangxicaishufaguanjin_nan` | 玄下 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuangxicaishufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangxicaishufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 37 | 春秋素白绫纹笄饰·女 | `eq_chunqiusubailingwenjishi_nv` | 玄上 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubailingwenjishi_nv.md](items/accessories/eq_chunqiusubailingwenjishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 38 | 春秋素白细裁笄饰·女 | `eq_chunqiusubaixicaijishi_nv` | 玄下 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubaixicaijishi_nv.md](items/accessories/eq_chunqiusubaixicaijishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 39 | 春秋纁红细裁裘帛行披 | `eq_chunqiuxunhongxicaiqiuboxingpi_tongyong` | 玄中 | 披风·围披 | 待出图 | [eq_chunqiuxunhongxicaiqiuboxingpi_tongyong.md](items/accessories/eq_chunqiuxunhongxicaiqiuboxingpi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 40 | 南宋绯红细裁素缘围披 | `eq_nansongfeihongxicaisuyuanweipi_tongyong` | 玄中 | 披风·围披 | 待出图 | [eq_nansongfeihongxicaisuyuanweipi_tongyong.md](items/accessories/eq_nansongfeihongxicaisuyuanweipi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 41 | 南宋浅黄绫纹折角幅巾·男 | `eq_nansongqianhuanglingwenzhejiaofujin_nan` | 玄上 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongqianhuanglingwenzhejiaofujin_nan.md](items/accessories/eq_nansongqianhuanglingwenzhejiaofujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 42 | 南宋浅黄细裁折角幅巾·男 | `eq_nansongqianhuangxicaizhejiaofujin_nan` | 玄下 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongqianhuangxicaizhejiaofujin_nan.md](items/accessories/eq_nansongqianhuangxicaizhejiaofujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 43 | 南宋素白绫纹束帛钗·女 | `eq_nansongsubailingwenshubochai_nv` | 玄上 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongsubailingwenshubochai_nv.md](items/accessories/eq_nansongsubailingwenshubochai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 44 | 南宋素白细裁束帛钗·女 | `eq_nansongsubaixicaishubochai_nv` | 玄下 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongsubaixicaishubochai_nv.md](items/accessories/eq_nansongsubaixicaishubochai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 45 | 唐浅黄绫纹软脚巾·男 | `eq_tangqianhuanglingwenruanjiaojin_nan` | 玄上 | 头饰·冠巾簪饰 | 待出图 | [eq_tangqianhuanglingwenruanjiaojin_nan.md](items/accessories/eq_tangqianhuanglingwenruanjiaojin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 46 | 唐浅黄细裁软脚巾·男 | `eq_tangqianhuangxicairuanjiaojin_nan` | 玄下 | 头饰·冠巾簪饰 | 待出图 | [eq_tangqianhuangxicairuanjiaojin_nan.md](items/accessories/eq_tangqianhuangxicairuanjiaojin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 47 | 唐素白绫纹梳钗·女 | `eq_tangsubailingwenshuchai_nv` | 玄上 | 头饰·冠巾簪饰 | 待出图 | [eq_tangsubailingwenshuchai_nv.md](items/accessories/eq_tangsubailingwenshuchai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 48 | 唐素白细裁梳钗·女 | `eq_tangsubaixicaishuchai_nv` | 玄下 | 头饰·冠巾簪饰 | 待出图 | [eq_tangsubaixicaishuchai_nv.md](items/accessories/eq_tangsubaixicaishuchai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 49 | 唐紫罗细裁帛面行披 | `eq_tangziluoxicaibomianxingpi_tongyong` | 玄中 | 披风·围披 | 待出图 | [eq_tangziluoxicaibomianxingpi_tongyong.md](items/accessories/eq_tangziluoxicaibomianxingpi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 50 | 饕餮面甲 | `eq_taotiemianjia` | 玄上 | 头饰·面甲 | 待出图 | [eq_taotiemianjia.md](items/accessories/eq_taotiemianjia.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 51 | 北宋绯红素裁行旅围披 | `eq_beisongfeihongsucaixinglvweipi_tongyong` | 黄中 | 披风·围披 | 待出图 | [eq_beisongfeihongsucaixinglvweipi_tongyong.md](items/accessories/eq_beisongfeihongsucaixinglvweipi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 52 | 北宋浅黄素裁方幅巾·男 | `eq_beisongqianhuangsucaifangfujin_nan` | 黄中 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongqianhuangsucaifangfujin_nan.md](items/accessories/eq_beisongqianhuangsucaifangfujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 53 | 北宋素白素裁帛梳饰·女 | `eq_beisongsubaisucaiboshushi_nv` | 黄中 | 头饰·冠巾簪饰 | 待出图 | [eq_beisongsubaisucaiboshushi_nv.md](items/accessories/eq_beisongsubaisucaiboshushi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 54 | 春秋浅黄素裁束发冠巾·男 | `eq_chunqiuqianhuangsucaishufaguanjin_nan` | 黄中 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiuqianhuangsucaishufaguanjin_nan.md](items/accessories/eq_chunqiuqianhuangsucaishufaguanjin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 55 | 春秋素白素裁笄饰·女 | `eq_chunqiusubaisucaijishi_nv` | 黄中 | 头饰·冠巾簪饰 | 待出图 | [eq_chunqiusubaisucaijishi_nv.md](items/accessories/eq_chunqiusubaisucaijishi_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 56 | 春秋纁红素裁裘帛行披 | `eq_chunqiuxunhongsucaiqiuboxingpi_tongyong` | 黄中 | 披风·围披 | 待出图 | [eq_chunqiuxunhongsucaiqiuboxingpi_tongyong.md](items/accessories/eq_chunqiuxunhongsucaiqiuboxingpi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 57 | 南宋绯红素裁素缘围披 | `eq_nansongfeihongsucaisuyuanweipi_tongyong` | 黄中 | 披风·围披 | 待出图 | [eq_nansongfeihongsucaisuyuanweipi_tongyong.md](items/accessories/eq_nansongfeihongsucaisuyuanweipi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 58 | 南宋浅黄素裁折角幅巾·男 | `eq_nansongqianhuangsucaizhejiaofujin_nan` | 黄中 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongqianhuangsucaizhejiaofujin_nan.md](items/accessories/eq_nansongqianhuangsucaizhejiaofujin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 59 | 南宋素白素裁束帛钗·女 | `eq_nansongsubaisucaishubochai_nv` | 黄中 | 头饰·冠巾簪饰 | 待出图 | [eq_nansongsubaisucaishubochai_nv.md](items/accessories/eq_nansongsubaisucaishubochai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 60 | 唐浅黄素裁软脚巾·男 | `eq_tangqianhuangsucairuanjiaojin_nan` | 黄中 | 头饰·冠巾簪饰 | 待出图 | [eq_tangqianhuangsucairuanjiaojin_nan.md](items/accessories/eq_tangqianhuangsucairuanjiaojin_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 61 | 唐素白素裁梳钗·女 | `eq_tangsubaisucaishuchai_nv` | 黄中 | 头饰·冠巾簪饰 | 待出图 | [eq_tangsubaisucaishuchai_nv.md](items/accessories/eq_tangsubaisucaishuchai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 62 | 唐紫罗素裁帛面行披 | `eq_tangziluosucaibomianxingpi_tongyong` | 黄中 | 披风·围披 | 待出图 | [eq_tangziluosucaibomianxingpi_tongyong.md](items/accessories/eq_tangziluosucaibomianxingpi_tongyong.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |

### 鞋（74）· 待出图 48、已入库 18、已通过（作者） 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 北宋浅褐精绣圆头履·男 | `eq_beisongqianhejingxiuyuantoulv_nan` | 地上 | 鞋·履靴 | 待出图 | [eq_beisongqianhejingxiuyuantoulv_nan.md](items/shoes/eq_beisongqianhejingxiuyuantoulv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 2 | 北宋浅褐锦纹圆头履·男 | `eq_beisongqianhejinwenyuantoulv_nan` | 地下 | 鞋·履靴 | 待出图 | [eq_beisongqianhejinwenyuantoulv_nan.md](items/shoes/eq_beisongqianhejinwenyuantoulv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 3 | 北宋浅褐绣缘圆头履·男 | `eq_beisongqianhexiuyuanyuantoulv_nan` | 地中 | 鞋·履靴 | 待出图 | [eq_beisongqianhexiuyuanyuantoulv_nan.md](items/shoes/eq_beisongqianhexiuyuanyuantoulv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 4 | 北宋素白精绣绣缘履·女 | `eq_beisongsubaijingxiuxiuyuanlv_nv` | 地上 | 鞋·履靴 | 待出图 | [eq_beisongsubaijingxiuxiuyuanlv_nv.md](items/shoes/eq_beisongsubaijingxiuxiuyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 5 | 北宋素白锦纹绣缘履·女 | `eq_beisongsubaijinwenxiuyuanlv_nv` | 地下 | 鞋·履靴 | 待出图 | [eq_beisongsubaijinwenxiuyuanlv_nv.md](items/shoes/eq_beisongsubaijinwenxiuyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 6 | 北宋素白绣缘绣缘履·女 | `eq_beisongsubaixiuyuanxiuyuanlv_nv` | 地中 | 鞋·履靴 | 待出图 | [eq_beisongsubaixiuyuanxiuyuanlv_nv.md](items/shoes/eq_beisongsubaixiuyuanxiuyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 7 | 春秋浅褐精绣麻履·男 | `eq_chunqiuqianhejingxiumalv_nan` | 地上 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhejingxiumalv_nan.md](items/shoes/eq_chunqiuqianhejingxiumalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 8 | 春秋浅褐锦纹麻履·男 | `eq_chunqiuqianhejinwenmalv_nan` | 地下 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhejinwenmalv_nan.md](items/shoes/eq_chunqiuqianhejinwenmalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 9 | 春秋浅褐绣缘麻履·男 | `eq_chunqiuqianhexiuyuanmalv_nan` | 地中 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhexiuyuanmalv_nan.md](items/shoes/eq_chunqiuqianhexiuyuanmalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 10 | 春秋素白精绣素履·女 | `eq_chunqiusubaijingxiusulv_nv` | 地上 | 鞋·履靴 | 待出图 | [eq_chunqiusubaijingxiusulv_nv.md](items/shoes/eq_chunqiusubaijingxiusulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 11 | 春秋素白锦纹素履·女 | `eq_chunqiusubaijinwensulv_nv` | 地下 | 鞋·履靴 | 待出图 | [eq_chunqiusubaijinwensulv_nv.md](items/shoes/eq_chunqiusubaijinwensulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 12 | 春秋素白绣缘素履·女 | `eq_chunqiusubaixiuyuansulv_nv` | 地中 | 鞋·履靴 | 待出图 | [eq_chunqiusubaixiuyuansulv_nv.md](items/shoes/eq_chunqiusubaixiuyuansulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 13 | 南宋浅褐精绣轻底履·男 | `eq_nansongqianhejingxiuqingdilv_nan` | 地上 | 鞋·履靴 | 待出图 | [eq_nansongqianhejingxiuqingdilv_nan.md](items/shoes/eq_nansongqianhejingxiuqingdilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 14 | 南宋浅褐锦纹轻底履·男 | `eq_nansongqianhejinwenqingdilv_nan` | 地下 | 鞋·履靴 | 待出图 | [eq_nansongqianhejinwenqingdilv_nan.md](items/shoes/eq_nansongqianhejinwenqingdilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 15 | 南宋浅褐绣缘轻底履·男 | `eq_nansongqianhexiuyuanqingdilv_nan` | 地中 | 鞋·履靴 | 待出图 | [eq_nansongqianhexiuyuanqingdilv_nan.md](items/shoes/eq_nansongqianhexiuyuanqingdilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 16 | 南宋素白精绣罗缘履·女 | `eq_nansongsubaijingxiuluoyuanlv_nv` | 地上 | 鞋·履靴 | 待出图 | [eq_nansongsubaijingxiuluoyuanlv_nv.md](items/shoes/eq_nansongsubaijingxiuluoyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 17 | 南宋素白锦纹罗缘履·女 | `eq_nansongsubaijinwenluoyuanlv_nv` | 地下 | 鞋·履靴 | 待出图 | [eq_nansongsubaijinwenluoyuanlv_nv.md](items/shoes/eq_nansongsubaijinwenluoyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 18 | 南宋素白绣缘罗缘履·女 | `eq_nansongsubaixiuyuanluoyuanlv_nv` | 地中 | 鞋·履靴 | 待出图 | [eq_nansongsubaixiuyuanluoyuanlv_nv.md](items/shoes/eq_nansongsubaixiuyuanluoyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 19 | 唐浅褐精绣皮面低履·男 | `eq_tangqianhejingxiupimiandilv_nan` | 地上 | 鞋·履靴 | 待出图 | [eq_tangqianhejingxiupimiandilv_nan.md](items/shoes/eq_tangqianhejingxiupimiandilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 20 | 唐浅褐锦纹皮面低履·男 | `eq_tangqianhejinwenpimiandilv_nan` | 地下 | 鞋·履靴 | 待出图 | [eq_tangqianhejinwenpimiandilv_nan.md](items/shoes/eq_tangqianhejinwenpimiandilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 21 | 唐浅褐绣缘皮面低履·男 | `eq_tangqianhexiuyuanpimiandilv_nan` | 地中 | 鞋·履靴 | 待出图 | [eq_tangqianhexiuyuanpimiandilv_nan.md](items/shoes/eq_tangqianhexiuyuanpimiandilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 22 | 唐素白精绣翘头履·女 | `eq_tangsubaijingxiuqiaotoulv_nv` | 地上 | 鞋·履靴 | 待出图 | [eq_tangsubaijingxiuqiaotoulv_nv.md](items/shoes/eq_tangsubaijingxiuqiaotoulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 23 | 唐素白锦纹翘头履·女 | `eq_tangsubaijinwenqiaotoulv_nv` | 地下 | 鞋·履靴 | 待出图 | [eq_tangsubaijinwenqiaotoulv_nv.md](items/shoes/eq_tangsubaijinwenqiaotoulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 24 | 唐素白绣缘翘头履·女 | `eq_tangsubaixiuyuanqiaotoulv_nv` | 地中 | 鞋·履靴 | 待出图 | [eq_tangsubaixiuyuanqiaotoulv_nv.md](items/shoes/eq_tangsubaixiuyuanqiaotoulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 25 | 北宋浅褐绫纹圆头履·男 | `eq_beisongqianhelingwenyuantoulv_nan` | 玄上 | 鞋·履靴 | 待出图 | [eq_beisongqianhelingwenyuantoulv_nan.md](items/shoes/eq_beisongqianhelingwenyuantoulv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 26 | 北宋浅褐细裁圆头履·男 | `eq_beisongqianhexicaiyuantoulv_nan` | 玄下 | 鞋·履靴 | 待出图 | [eq_beisongqianhexicaiyuantoulv_nan.md](items/shoes/eq_beisongqianhexicaiyuantoulv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 27 | 北宋素白绫纹绣缘履·女 | `eq_beisongsubailingwenxiuyuanlv_nv` | 玄上 | 鞋·履靴 | 待出图 | [eq_beisongsubailingwenxiuyuanlv_nv.md](items/shoes/eq_beisongsubailingwenxiuyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 28 | 北宋素白细裁绣缘履·女 | `eq_beisongsubaixicaixiuyuanlv_nv` | 玄下 | 鞋·履靴 | 待出图 | [eq_beisongsubaixicaixiuyuanlv_nv.md](items/shoes/eq_beisongsubaixicaixiuyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 29 | 春秋浅褐绫纹麻履·男 | `eq_chunqiuqianhelingwenmalv_nan` | 玄上 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhelingwenmalv_nan.md](items/shoes/eq_chunqiuqianhelingwenmalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 30 | 春秋浅褐细裁麻履·男 | `eq_chunqiuqianhexicaimalv_nan` | 玄下 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhexicaimalv_nan.md](items/shoes/eq_chunqiuqianhexicaimalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 31 | 春秋素白绫纹素履·女 | `eq_chunqiusubailingwensulv_nv` | 玄上 | 鞋·履靴 | 待出图 | [eq_chunqiusubailingwensulv_nv.md](items/shoes/eq_chunqiusubailingwensulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 32 | 春秋素白细裁素履·女 | `eq_chunqiusubaixicaisulv_nv` | 玄下 | 鞋·履靴 | 待出图 | [eq_chunqiusubaixicaisulv_nv.md](items/shoes/eq_chunqiusubaixicaisulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 33 | 南宋浅褐绫纹轻底履·男 | `eq_nansongqianhelingwenqingdilv_nan` | 玄上 | 鞋·履靴 | 待出图 | [eq_nansongqianhelingwenqingdilv_nan.md](items/shoes/eq_nansongqianhelingwenqingdilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 34 | 南宋浅褐细裁轻底履·男 | `eq_nansongqianhexicaiqingdilv_nan` | 玄下 | 鞋·履靴 | 待出图 | [eq_nansongqianhexicaiqingdilv_nan.md](items/shoes/eq_nansongqianhexicaiqingdilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 35 | 南宋素白绫纹罗缘履·女 | `eq_nansongsubailingwenluoyuanlv_nv` | 玄上 | 鞋·履靴 | 待出图 | [eq_nansongsubailingwenluoyuanlv_nv.md](items/shoes/eq_nansongsubailingwenluoyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 36 | 南宋素白细裁罗缘履·女 | `eq_nansongsubaixicailuoyuanlv_nv` | 玄下 | 鞋·履靴 | 待出图 | [eq_nansongsubaixicailuoyuanlv_nv.md](items/shoes/eq_nansongsubaixicailuoyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 37 | 唐浅褐绫纹皮面低履·男 | `eq_tangqianhelingwenpimiandilv_nan` | 玄上 | 鞋·履靴 | 待出图 | [eq_tangqianhelingwenpimiandilv_nan.md](items/shoes/eq_tangqianhelingwenpimiandilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 38 | 唐浅褐细裁皮面低履·男 | `eq_tangqianhexicaipimiandilv_nan` | 玄下 | 鞋·履靴 | 待出图 | [eq_tangqianhexicaipimiandilv_nan.md](items/shoes/eq_tangqianhexicaipimiandilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 39 | 唐素白绫纹翘头履·女 | `eq_tangsubailingwenqiaotoulv_nv` | 玄上 | 鞋·履靴 | 待出图 | [eq_tangsubailingwenqiaotoulv_nv.md](items/shoes/eq_tangsubailingwenqiaotoulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 40 | 唐素白细裁翘头履·女 | `eq_tangsubaixicaiqiaotoulv_nv` | 玄下 | 鞋·履靴 | 待出图 | [eq_tangsubaixicaiqiaotoulv_nv.md](items/shoes/eq_tangsubaixicaiqiaotoulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 41 | 北宋浅褐素裁圆头履·男 | `eq_beisongqianhesucaiyuantoulv_nan` | 黄中 | 鞋·履靴 | 待出图 | [eq_beisongqianhesucaiyuantoulv_nan.md](items/shoes/eq_beisongqianhesucaiyuantoulv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 42 | 北宋素白素裁绣缘履·女 | `eq_beisongsubaisucaixiuyuanlv_nv` | 黄中 | 鞋·履靴 | 待出图 | [eq_beisongsubaisucaixiuyuanlv_nv.md](items/shoes/eq_beisongsubaisucaixiuyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 43 | 春秋浅褐素裁麻履·男 | `eq_chunqiuqianhesucaimalv_nan` | 黄中 | 鞋·履靴 | 待出图 | [eq_chunqiuqianhesucaimalv_nan.md](items/shoes/eq_chunqiuqianhesucaimalv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 44 | 春秋素白素裁素履·女 | `eq_chunqiusubaisucaisulv_nv` | 黄中 | 鞋·履靴 | 待出图 | [eq_chunqiusubaisucaisulv_nv.md](items/shoes/eq_chunqiusubaisucaisulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 45 | 南宋浅褐素裁轻底履·男 | `eq_nansongqianhesucaiqingdilv_nan` | 黄中 | 鞋·履靴 | 待出图 | [eq_nansongqianhesucaiqingdilv_nan.md](items/shoes/eq_nansongqianhesucaiqingdilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 46 | 南宋素白素裁罗缘履·女 | `eq_nansongsubaisucailuoyuanlv_nv` | 黄中 | 鞋·履靴 | 待出图 | [eq_nansongsubaisucailuoyuanlv_nv.md](items/shoes/eq_nansongsubaisucailuoyuanlv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 47 | 唐浅褐素裁皮面低履·男 | `eq_tangqianhesucaipimiandilv_nan` | 黄中 | 鞋·履靴 | 待出图 | [eq_tangqianhesucaipimiandilv_nan.md](items/shoes/eq_tangqianhesucaipimiandilv_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 48 | 唐素白素裁翘头履·女 | `eq_tangsubaisucaiqiaotoulv_nv` | 黄中 | 鞋·履靴 | 待出图 | [eq_tangsubaisucaiqiaotoulv_nv.md](items/shoes/eq_tangsubaisucaiqiaotoulv_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |

### 腰带（74）· 待出图 48、已入库 18、已通过（作者） 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 北宋本白精绣布鞓带·男 | `eq_beisongbenbaijingxiubutingdai_nan` | 地上 | 腰带·束带 | 待出图 | [eq_beisongbenbaijingxiubutingdai_nan.md](items/belts/eq_beisongbenbaijingxiubutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 2 | 北宋本白精绣绦裙带·女 | `eq_beisongbenbaijingxiutaoqundai_nv` | 地上 | 腰带·束带 | 待出图 | [eq_beisongbenbaijingxiutaoqundai_nv.md](items/belts/eq_beisongbenbaijingxiutaoqundai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 3 | 北宋本白锦纹布鞓带·男 | `eq_beisongbenbaijinwenbutingdai_nan` | 地下 | 腰带·束带 | 待出图 | [eq_beisongbenbaijinwenbutingdai_nan.md](items/belts/eq_beisongbenbaijinwenbutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 4 | 北宋本白锦纹绦裙带·女 | `eq_beisongbenbaijinwentaoqundai_nv` | 地下 | 腰带·束带 | 待出图 | [eq_beisongbenbaijinwentaoqundai_nv.md](items/belts/eq_beisongbenbaijinwentaoqundai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 5 | 北宋本白绣缘布鞓带·男 | `eq_beisongbenbaixiuyuanbutingdai_nan` | 地中 | 腰带·束带 | 待出图 | [eq_beisongbenbaixiuyuanbutingdai_nan.md](items/belts/eq_beisongbenbaixiuyuanbutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 6 | 北宋本白绣缘绦裙带·女 | `eq_beisongbenbaixiuyuantaoqundai_nv` | 地中 | 腰带·束带 | 待出图 | [eq_beisongbenbaixiuyuantaoqundai_nv.md](items/belts/eq_beisongbenbaixiuyuantaoqundai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 7 | 春秋本白精绣帛带·女 | `eq_chunqiubenbaijingxiubodai_nv` | 地上 | 腰带·束带 | 待出图 | [eq_chunqiubenbaijingxiubodai_nv.md](items/belts/eq_chunqiubenbaijingxiubodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 8 | 春秋本白精绣鞶带·男 | `eq_chunqiubenbaijingxiupandai_nan` | 地上 | 腰带·束带 | 待出图 | [eq_chunqiubenbaijingxiupandai_nan.md](items/belts/eq_chunqiubenbaijingxiupandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 9 | 春秋本白锦纹帛带·女 | `eq_chunqiubenbaijinwenbodai_nv` | 地下 | 腰带·束带 | 待出图 | [eq_chunqiubenbaijinwenbodai_nv.md](items/belts/eq_chunqiubenbaijinwenbodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 10 | 春秋本白锦纹鞶带·男 | `eq_chunqiubenbaijinwenpandai_nan` | 地下 | 腰带·束带 | 待出图 | [eq_chunqiubenbaijinwenpandai_nan.md](items/belts/eq_chunqiubenbaijinwenpandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 11 | 春秋本白绣缘帛带·女 | `eq_chunqiubenbaixiuyuanbodai_nv` | 地中 | 腰带·束带 | 待出图 | [eq_chunqiubenbaixiuyuanbodai_nv.md](items/belts/eq_chunqiubenbaixiuyuanbodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 12 | 春秋本白绣缘鞶带·男 | `eq_chunqiubenbaixiuyuanpandai_nan` | 地中 | 腰带·束带 | 待出图 | [eq_chunqiubenbaixiuyuanpandai_nan.md](items/belts/eq_chunqiubenbaixiuyuanpandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 13 | 南宋本白精绣编绦带·女 | `eq_nansongbenbaijingxiubiantaodai_nv` | 地上 | 腰带·束带 | 待出图 | [eq_nansongbenbaijingxiubiantaodai_nv.md](items/belts/eq_nansongbenbaijingxiubiantaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 14 | 南宋本白精绣素鞓带·男 | `eq_nansongbenbaijingxiusutingdai_nan` | 地上 | 腰带·束带 | 待出图 | [eq_nansongbenbaijingxiusutingdai_nan.md](items/belts/eq_nansongbenbaijingxiusutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 15 | 南宋本白锦纹编绦带·女 | `eq_nansongbenbaijinwenbiantaodai_nv` | 地下 | 腰带·束带 | 待出图 | [eq_nansongbenbaijinwenbiantaodai_nv.md](items/belts/eq_nansongbenbaijinwenbiantaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 16 | 南宋本白锦纹素鞓带·男 | `eq_nansongbenbaijinwensutingdai_nan` | 地下 | 腰带·束带 | 待出图 | [eq_nansongbenbaijinwensutingdai_nan.md](items/belts/eq_nansongbenbaijinwensutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 17 | 南宋本白绣缘编绦带·女 | `eq_nansongbenbaixiuyuanbiantaodai_nv` | 地中 | 腰带·束带 | 待出图 | [eq_nansongbenbaixiuyuanbiantaodai_nv.md](items/belts/eq_nansongbenbaixiuyuanbiantaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 18 | 南宋本白绣缘素鞓带·男 | `eq_nansongbenbaixiuyuansutingdai_nan` | 地中 | 腰带·束带 | 待出图 | [eq_nansongbenbaixiuyuansutingdai_nan.md](items/belts/eq_nansongbenbaixiuyuansutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 19 | 唐本白精绣蹀躞带·男 | `eq_tangbenbaijingxiudiexiedai_nan` | 地上 | 腰带·束带 | 待出图 | [eq_tangbenbaijingxiudiexiedai_nan.md](items/belts/eq_tangbenbaijingxiudiexiedai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 20 | 唐本白精绣裙腰带·女 | `eq_tangbenbaijingxiuqunyaodai_nv` | 地上 | 腰带·束带 | 待出图 | [eq_tangbenbaijingxiuqunyaodai_nv.md](items/belts/eq_tangbenbaijingxiuqunyaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 21 | 唐本白锦纹蹀躞带·男 | `eq_tangbenbaijinwendiexiedai_nan` | 地下 | 腰带·束带 | 待出图 | [eq_tangbenbaijinwendiexiedai_nan.md](items/belts/eq_tangbenbaijinwendiexiedai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 22 | 唐本白锦纹裙腰带·女 | `eq_tangbenbaijinwenqunyaodai_nv` | 地下 | 腰带·束带 | 待出图 | [eq_tangbenbaijinwenqunyaodai_nv.md](items/belts/eq_tangbenbaijinwenqunyaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 23 | 唐本白绣缘蹀躞带·男 | `eq_tangbenbaixiuyuandiexiedai_nan` | 地中 | 腰带·束带 | 待出图 | [eq_tangbenbaixiuyuandiexiedai_nan.md](items/belts/eq_tangbenbaixiuyuandiexiedai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 24 | 唐本白绣缘裙腰带·女 | `eq_tangbenbaixiuyuanqunyaodai_nv` | 地中 | 腰带·束带 | 待出图 | [eq_tangbenbaixiuyuanqunyaodai_nv.md](items/belts/eq_tangbenbaixiuyuanqunyaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 25 | 北宋本白绫纹布鞓带·男 | `eq_beisongbenbailingwenbutingdai_nan` | 玄上 | 腰带·束带 | 待出图 | [eq_beisongbenbailingwenbutingdai_nan.md](items/belts/eq_beisongbenbailingwenbutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 26 | 北宋本白绫纹绦裙带·女 | `eq_beisongbenbailingwentaoqundai_nv` | 玄上 | 腰带·束带 | 待出图 | [eq_beisongbenbailingwentaoqundai_nv.md](items/belts/eq_beisongbenbailingwentaoqundai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 27 | 北宋本白细裁布鞓带·男 | `eq_beisongbenbaixicaibutingdai_nan` | 玄下 | 腰带·束带 | 待出图 | [eq_beisongbenbaixicaibutingdai_nan.md](items/belts/eq_beisongbenbaixicaibutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 28 | 北宋本白细裁绦裙带·女 | `eq_beisongbenbaixicaitaoqundai_nv` | 玄下 | 腰带·束带 | 待出图 | [eq_beisongbenbaixicaitaoqundai_nv.md](items/belts/eq_beisongbenbaixicaitaoqundai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 29 | 春秋本白绫纹帛带·女 | `eq_chunqiubenbailingwenbodai_nv` | 玄上 | 腰带·束带 | 待出图 | [eq_chunqiubenbailingwenbodai_nv.md](items/belts/eq_chunqiubenbailingwenbodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 30 | 春秋本白绫纹鞶带·男 | `eq_chunqiubenbailingwenpandai_nan` | 玄上 | 腰带·束带 | 待出图 | [eq_chunqiubenbailingwenpandai_nan.md](items/belts/eq_chunqiubenbailingwenpandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 31 | 春秋本白细裁帛带·女 | `eq_chunqiubenbaixicaibodai_nv` | 玄下 | 腰带·束带 | 待出图 | [eq_chunqiubenbaixicaibodai_nv.md](items/belts/eq_chunqiubenbaixicaibodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 32 | 春秋本白细裁鞶带·男 | `eq_chunqiubenbaixicaipandai_nan` | 玄下 | 腰带·束带 | 待出图 | [eq_chunqiubenbaixicaipandai_nan.md](items/belts/eq_chunqiubenbaixicaipandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 33 | 南宋本白绫纹编绦带·女 | `eq_nansongbenbailingwenbiantaodai_nv` | 玄上 | 腰带·束带 | 待出图 | [eq_nansongbenbailingwenbiantaodai_nv.md](items/belts/eq_nansongbenbailingwenbiantaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 34 | 南宋本白绫纹素鞓带·男 | `eq_nansongbenbailingwensutingdai_nan` | 玄上 | 腰带·束带 | 待出图 | [eq_nansongbenbailingwensutingdai_nan.md](items/belts/eq_nansongbenbailingwensutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 35 | 南宋本白细裁编绦带·女 | `eq_nansongbenbaixicaibiantaodai_nv` | 玄下 | 腰带·束带 | 待出图 | [eq_nansongbenbaixicaibiantaodai_nv.md](items/belts/eq_nansongbenbaixicaibiantaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 36 | 南宋本白细裁素鞓带·男 | `eq_nansongbenbaixicaisutingdai_nan` | 玄下 | 腰带·束带 | 待出图 | [eq_nansongbenbaixicaisutingdai_nan.md](items/belts/eq_nansongbenbaixicaisutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 37 | 唐本白绫纹蹀躞带·男 | `eq_tangbenbailingwendiexiedai_nan` | 玄上 | 腰带·束带 | 待出图 | [eq_tangbenbailingwendiexiedai_nan.md](items/belts/eq_tangbenbailingwendiexiedai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 38 | 唐本白绫纹裙腰带·女 | `eq_tangbenbailingwenqunyaodai_nv` | 玄上 | 腰带·束带 | 待出图 | [eq_tangbenbailingwenqunyaodai_nv.md](items/belts/eq_tangbenbailingwenqunyaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 39 | 唐本白细裁蹀躞带·男 | `eq_tangbenbaixicaidiexiedai_nan` | 玄下 | 腰带·束带 | 待出图 | [eq_tangbenbaixicaidiexiedai_nan.md](items/belts/eq_tangbenbaixicaidiexiedai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 40 | 唐本白细裁裙腰带·女 | `eq_tangbenbaixicaiqunyaodai_nv` | 玄下 | 腰带·束带 | 待出图 | [eq_tangbenbaixicaiqunyaodai_nv.md](items/belts/eq_tangbenbaixicaiqunyaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 41 | 北宋本白素裁布鞓带·男 | `eq_beisongbenbaisucaibutingdai_nan` | 黄中 | 腰带·束带 | 待出图 | [eq_beisongbenbaisucaibutingdai_nan.md](items/belts/eq_beisongbenbaisucaibutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 42 | 北宋本白素裁绦裙带·女 | `eq_beisongbenbaisucaitaoqundai_nv` | 黄中 | 腰带·束带 | 待出图 | [eq_beisongbenbaisucaitaoqundai_nv.md](items/belts/eq_beisongbenbaisucaitaoqundai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 43 | 春秋本白素裁帛带·女 | `eq_chunqiubenbaisucaibodai_nv` | 黄中 | 腰带·束带 | 待出图 | [eq_chunqiubenbaisucaibodai_nv.md](items/belts/eq_chunqiubenbaisucaibodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 44 | 春秋本白素裁鞶带·男 | `eq_chunqiubenbaisucaipandai_nan` | 黄中 | 腰带·束带 | 待出图 | [eq_chunqiubenbaisucaipandai_nan.md](items/belts/eq_chunqiubenbaisucaipandai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 45 | 南宋本白素裁编绦带·女 | `eq_nansongbenbaisucaibiantaodai_nv` | 黄中 | 腰带·束带 | 待出图 | [eq_nansongbenbaisucaibiantaodai_nv.md](items/belts/eq_nansongbenbaisucaibiantaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 46 | 南宋本白素裁素鞓带·男 | `eq_nansongbenbaisucaisutingdai_nan` | 黄中 | 腰带·束带 | 待出图 | [eq_nansongbenbaisucaisutingdai_nan.md](items/belts/eq_nansongbenbaisucaisutingdai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 47 | 唐本白素裁蹀躞带·男 | `eq_tangbenbaisucaidiexiedai_nan` | 黄中 | 腰带·束带 | 待出图 | [eq_tangbenbaisucaidiexiedai_nan.md](items/belts/eq_tangbenbaisucaidiexiedai_nan.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |
| 48 | 唐本白素裁裙腰带·女 | `eq_tangbenbaisucaiqunyaodai_nv` | 黄中 | 腰带·束带 | 待出图 | [eq_tangbenbaisucaiqunyaodai_nv.md](items/belts/eq_tangbenbaisucaiqunyaodai_nv.md) | extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3 |

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
