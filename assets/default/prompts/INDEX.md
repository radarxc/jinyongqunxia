# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）

> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。
> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。

提示词 **627** 份：待出图 445、已通过（作者） 150、已入库 24、待重出 8。**待出图队列 453 行**（`python3 tools/agents/build_image_index.py --queue`）。

## 出图 agent 怎么用

1. 先读本节与「出图位置约定」，再读目标组的 `GUIDE.md`（`items/GUIDE.md`、`maps/GUIDE.md`、`rig/GUIDE.md`），最后读每张图自己的提示词文件（frontmatter = 输出路径 / 规格 / 参考图；正文 = 要点、完整提示词、排除项、质检要点）。
2. 列出能做的行：`python3 tools/agents/build_image_index.py --queue --group maps`（`--json` 给脚本用）。队列 = 图片文件尚不存在的行 + `items/REDO.md` 里作者点名重出的 ID。
3. 每行：加载 frontmatter `references` 里的参考图 → 按「提示词」生成 2 张候选选 1 张（有明确缺陷再补，单轮 ≤ 4 张）→ 按 `output` 存 PNG（文件名 = asset_id 或指定名）→ 在 `manifest` 追加一条（字段见 `assets/README.md`：id、file、category、style、subject、prompt、negative、references、tool、model、created、source_path、size、sha256、`status: candidate`）→ 跑该组 GUIDE 里的检查命令。
4. 不要改提示词文件和本索引；生成完一组，重新运行本脚本，状态会从「待出图」变成「已入库」。作者的审批在审批页做，`candidate` 不等于通过。

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
| items | `eq_dalijinhuaguan_nv` | 大理鎏金花冠·女 | `assets/default/item/accessories/eq_dalijinhuaguan_nv.png` | 待出图 | [eq_dalijinhuaguan_nv.md](items/accessories/eq_dalijinhuaguan_nv.md) |
| items | `eq_dalijinxiupeibo_nv` | 大理锦绣帔帛·女 | `assets/default/item/accessories/eq_dalijinxiupeibo_nv.png` | 待出图 | [eq_dalijinxiupeibo_nv.md](items/accessories/eq_dalijinxiupeibo_nv.md) |
| items | `eq_huijianghuatoujin_nv` | 回疆花布头巾·女 | `assets/default/item/accessories/eq_huijianghuatoujin_nv.png` | 待出图 | [eq_huijianghuatoujin_nv.md](items/accessories/eq_huijianghuatoujin_nv.md) |
| items | `eq_huijiangnihuaipi_nv` | 回疆呢花披·女 | `assets/default/item/accessories/eq_huijiangnihuaipi_nv.png` | 待出图 | [eq_huijiangnihuaipi_nv.md](items/accessories/eq_huijiangnihuaipi_nv.md) |
| items | `eq_jinhubianpifeng_nan` | 金狐边披风·男 | `assets/default/item/accessories/eq_jinhubianpifeng_nan.png` | 待出图 | [eq_jinhubianpifeng_nan.md](items/accessories/eq_jinhubianpifeng_nan.md) |
| items | `eq_jinzaoluojin_nan` | 金皂罗方顶巾·男 | `assets/default/item/accessories/eq_jinzaoluojin_nan.png` | 待出图 | [eq_jinzaoluojin_nan.md](items/accessories/eq_jinzaoluojin_nan.md) |
| items | `eq_liaoyinshupi_nan` | 辽银鼠披·男 | `assets/default/item/accessories/eq_liaoyinshupi_nan.png` | 待出图 | [eq_liaoyinshupi_nan.md](items/accessories/eq_liaoyinshupi_nan.md) |
| items | `eq_menggubailimao_nan` | 蒙古白毡笠帽·男 | `assets/default/item/accessories/eq_menggubailimao_nan.png` | 待出图 | [eq_menggubailimao_nan.md](items/accessories/eq_menggubailimao_nan.md) |
| items | `eq_mingdongpojin_nan` | 明纱制东坡巾·男 | `assets/default/item/accessories/eq_mingdongpojin_nan.png` | 待出图 | [eq_mingdongpojin_nan.md](items/accessories/eq_mingdongpojin_nan.md) |
| items | `eq_mingmianbupifeng_nan` | 明棉布披风·男 | `assets/default/item/accessories/eq_mingmianbupifeng_nan.png` | 待出图 | [eq_mingmianbupifeng_nan.md](items/accessories/eq_mingmianbupifeng_nan.md) |
| items | `eq_mingqingduandachang_nan` | 明青缎大氅·男 | `assets/default/item/accessories/eq_mingqingduandachang_nan.png` | 待出图 | [eq_mingqingduandachang_nan.md](items/accessories/eq_mingqingduandachang_nan.md) |
| items | `eq_mingshuitianpi_nv` | 明水田披·女 | `assets/default/item/accessories/eq_mingshuitianpi_nv.png` | 待出图 | [eq_mingshuitianpi_nv.md](items/accessories/eq_mingshuitianpi_nv.md) |
| items | `eq_mingwushafangjin_nan` | 明乌纱方巾·男 | `assets/default/item/accessories/eq_mingwushafangjin_nan.png` | 待出图 | [eq_mingwushafangjin_nan.md](items/accessories/eq_mingwushafangjin_nan.md) |
| items | `eq_mingyudiebuyao_nv` | 明玉蝶步摇·女 | `assets/default/item/accessories/eq_mingyudiebuyao_nv.png` | 待出图 | [eq_mingyudiebuyao_nv.md](items/accessories/eq_mingyudiebuyao_nv.md) |
| items | `eq_mingyunjinhechang_nv` | 明云锦鹤氅·女 | `assets/default/item/accessories/eq_mingyunjinhechang_nv.png` | 待出图 | [eq_mingyunjinhechang_nv.md](items/accessories/eq_mingyunjinhechang_nv.md) |
| items | `eq_mingzhongjingguan_nan` | 明忠静冠·男 | `assets/default/item/accessories/eq_mingzhongjingguan_nan.png` | 待出图 | [eq_mingzhongjingguan_nan.md](items/accessories/eq_mingzhongjingguan_nan.md) |
| items | `eq_qingbaobu_nv` | 清绣边包髻·女 | `assets/default/item/accessories/eq_qingbaobu_nv.png` | 待出图 | [eq_qingbaobu_nv.md](items/accessories/eq_qingbaobu_nv.md) |
| items | `eq_qingdiaoqiufengchang_nv` | 清貂裘风氅·女 | `assets/default/item/accessories/eq_qingdiaoqiufengchang_nv.png` | 待出图 | [eq_qingdiaoqiufengchang_nv.md](items/accessories/eq_qingdiaoqiufengchang_nv.md) |
| items | `eq_qinghongyingnuanmao_nan` | 清红缨暖帽·男 | `assets/default/item/accessories/eq_qinghongyingnuanmao_nan.png` | 待出图 | [eq_qinghongyingnuanmao_nan.md](items/accessories/eq_qinghongyingnuanmao_nan.md) |
| items | `eq_qingqingbufengpi_nv` | 清青布风披·女 | `assets/default/item/accessories/eq_qingqingbufengpi_nv.png` | 待出图 | [eq_qingqingbufengpi_nv.md](items/accessories/eq_qingqingbufengpi_nv.md) |
| items | `eq_qingxuanhuyuduandoupeng_nan` | 清玄狐羽缎斗篷·男 | `assets/default/item/accessories/eq_qingxuanhuyuduandoupeng_nan.png` | 待出图 | [eq_qingxuanhuyuduandoupeng_nan.md](items/accessories/eq_qingxuanhuyuduandoupeng_nan.md) |
| items | `eq_qingyuduanpifeng_nv` | 清羽缎披风·女 | `assets/default/item/accessories/eq_qingyuduanpifeng_nv.png` | 待出图 | [eq_qingyuduanpifeng_nv.md](items/accessories/eq_qingyuduanpifeng_nv.md) |
| items | `eq_qingzhenzhudiantzi_nv` | 清珠翠钿子·女 | `assets/default/item/accessories/eq_qingzhenzhudiantzi_nv.png` | 待出图 | [eq_qingzhenzhudiantzi_nv.md](items/accessories/eq_qingzhenzhudiantzi_nv.md) |
| items | `eq_songjinhuaguan_nv` | 宋金银花冠·女 | `assets/default/item/accessories/eq_songjinhuaguan_nv.png` | 待出图 | [eq_songjinhuaguan_nv.md](items/accessories/eq_songjinhuaguan_nv.md) |
| items | `eq_songluoshahechang_nv` | 宋罗纱鹤氅·女 | `assets/default/item/accessories/eq_songluoshahechang_nv.png` | 待出图 | [eq_songluoshahechang_nv.md](items/accessories/eq_songluoshahechang_nv.md) |
| items | `eq_songmabufujin_nan` | 宋麻布幅巾·男 | `assets/default/item/accessories/eq_songmabufujin_nan.png` | 待出图 | [eq_songmabufujin_nan.md](items/accessories/eq_songmabufujin_nan.md) |
| items | `eq_songyoujuanyupi_nv` | 宋油绢雨披·女 | `assets/default/item/accessories/eq_songyoujuanyupi_nv.png` | 待出图 | [eq_songyoujuanyupi_nv.md](items/accessories/eq_songyoujuanyupi_nv.md) |
| items | `eq_songzhijiaofutou_nan` | 宋直脚幞头·男 | `assets/default/item/accessories/eq_songzhijiaofutou_nan.png` | 待出图 | [eq_songzhijiaofutou_nan.md](items/accessories/eq_songzhijiaofutou_nan.md) |
| items | `eq_songziluogaitou_nv` | 宋紫罗盖头·女 | `assets/default/item/accessories/eq_songziluogaitou_nv.png` | 待出图 | [eq_songziluogaitou_nv.md](items/accessories/eq_songziluogaitou_nv.md) |
| items | `eq_songzonglvsuoyi_nan` | 宋棕榈蓑衣·男 | `assets/default/item/accessories/eq_songzonglvsuoyi_nan.png` | 待出图 | [eq_songzonglvsuoyi_nan.md](items/accessories/eq_songzonglvsuoyi_nan.md) |
| items | `eq_xixiacuzhanpi_nan` | 西夏粗毡披·男 | `assets/default/item/accessories/eq_xixiacuzhanpi_nan.png` | 待出图 | [eq_xixiacuzhanpi_nan.md](items/accessories/eq_xixiacuzhanpi_nan.md) |
| items | `eq_xixiaxiaotuanguan_nv` | 西夏小团冠·女 | `assets/default/item/accessories/eq_xixiaxiaotuanguan_nv.png` | 待出图 | [eq_xixiaxiaotuanguan_nv.md](items/accessories/eq_xixiaxiaotuanguan_nv.md) |
| items | `eq_yuanguguquan_nv` | 元珠饰罟罟冠·女 | `assets/default/item/accessories/eq_yuanguguquan_nv.png` | 待出图 | [eq_yuanguguquan_nv.md](items/accessories/eq_yuanguguquan_nv.md) |
| items | `eq_yuanmengguzhanpi_nan` | 元蒙古毡披·男 | `assets/default/item/accessories/eq_yuanmengguzhanpi_nan.png` | 待出图 | [eq_yuanmengguzhanpi_nan.md](items/accessories/eq_yuanmengguzhanpi_nan.md) |
| items | `eq_yuanqibaolimao_nan` | 元七宝钹笠帽·男 | `assets/default/item/accessories/eq_yuanqibaolimao_nan.png` | 待出图 | [eq_yuanqibaolimao_nan.md](items/accessories/eq_yuanqibaolimao_nan.md) |
| items | `eq_yuanzhijinzhanshidoupeng_nan` | 元织金战士斗篷·男 | `assets/default/item/accessories/eq_yuanzhijinzhanshidoupeng_nan.png` | 待出图 | [eq_yuanzhijinzhanshidoupeng_nan.md](items/accessories/eq_yuanzhijinzhanshidoupeng_nan.md) |
| items | `eq_mingjinyiweijia` | 明制锦衣卫甲 | `assets/default/item/armor/eq_mingjinyiweijia.png` | 待重出 | [eq_mingjinyiweijia.md](items/armor/eq_mingjinyiweijia.md) |
| items | `eq_mingweisuojia` | 明制卫所甲 | `assets/default/item/armor/eq_mingweisuojia.png` | 待重出 | [eq_mingweisuojia.md](items/armor/eq_mingweisuojia.md) |
| items | `eq_qingyulinjia` | 清制御前侍卫甲 | `assets/default/item/armor/eq_qingyulinjia.png` | 待重出 | [eq_qingyulinjia.md](items/armor/eq_qingyulinjia.md) |
| items | `eq_qingzaolijia` | 清制皂隶衣甲 | `assets/default/item/armor/eq_qingzaolijia.png` | 待重出 | [eq_qingzaolijia.md](items/armor/eq_qingzaolijia.md) |
| items | `eq_songjinjunburenjia` | 宋制禁军步人甲 | `assets/default/item/armor/eq_songjinjunburenjia.png` | 待重出 | [eq_songjinjunburenjia.md](items/armor/eq_songjinjunburenjia.md) |
| items | `eq_songxunyijia` | 宋制巡役甲 | `assets/default/item/armor/eq_songxunyijia.png` | 待重出 | [eq_songxunyijia.md](items/armor/eq_songxunyijia.md) |
| items | `eq_yuanqibingjia` | 元制骑兵札甲 | `assets/default/item/armor/eq_yuanqibingjia.png` | 待重出 | [eq_yuanqibingjia.md](items/armor/eq_yuanqibingjia.md) |
| items | `eq_yuansuweiqiejia` | 元宿卫怯薛甲 | `assets/default/item/armor/eq_yuansuweiqiejia.png` | 待重出 | [eq_yuansuweiqiejia.md](items/armor/eq_yuansuweiqiejia.md) |
| items | `eq_daliyinkoujindai_nv` | 大理银扣锦带·女 | `assets/default/item/belts/eq_daliyinkoujindai_nv.png` | 待出图 | [eq_daliyinkoujindai_nv.md](items/belts/eq_daliyinkoujindai_nv.md) |
| items | `eq_huijianghongbudai_nan` | 回疆红布腰带·男 | `assets/default/item/belts/eq_huijianghongbudai_nan.png` | 待出图 | [eq_huijianghongbudai_nan.md](items/belts/eq_huijianghongbudai_nan.md) |
| items | `eq_jinchunshuiyutuhu_nan` | 金春水玉吐鹘·男 | `assets/default/item/belts/eq_jinchunshuiyutuhu_nan.png` | 待出图 | [eq_jinchunshuiyutuhu_nan.md](items/belts/eq_jinchunshuiyutuhu_nan.md) |
| items | `eq_jintongkuatuhu_nan` | 金铜銙吐鹘·男 | `assets/default/item/belts/eq_jintongkuatuhu_nan.png` | 待出图 | [eq_jintongkuatuhu_nan.md](items/belts/eq_jintongkuatuhu_nan.md) |
| items | `eq_liaoyudiexiedai_nan` | 辽玉蹀躞带·男 | `assets/default/item/belts/eq_liaoyudiexiedai_nan.png` | 待出图 | [eq_liaoyudiexiedai_nan.md](items/belts/eq_liaoyudiexiedai_nan.md) |
| items | `eq_mingbaiyutingdai_nan` | 明白玉鞓带·男 | `assets/default/item/belts/eq_mingbaiyutingdai_nan.png` | 待出图 | [eq_mingbaiyutingdai_nan.md](items/belts/eq_mingbaiyutingdai_nan.md) |
| items | `eq_minghoufeijindadai_nv` | 明后妃锦大带·女 | `assets/default/item/belts/eq_minghoufeijindadai_nv.png` | 待出图 | [eq_minghoufeijindadai_nv.md](items/belts/eq_minghoufeijindadai_nv.md) |
| items | `eq_mingqingjintaosheng_nv` | 明青金桃绳·女 | `assets/default/item/belts/eq_mingqingjintaosheng_nv.png` | 待出图 | [eq_mingqingjintaosheng_nv.md](items/belts/eq_mingqingjintaosheng_nv.md) |
| items | `eq_qinggedaihebao_nan` | 清革带荷包·男 | `assets/default/item/belts/eq_qinggedaihebao_nan.png` | 待出图 | [eq_qinggedaihebao_nan.md](items/belts/eq_qinggedaihebao_nan.md) |
| items | `eq_qinghannvsichou_nv` | 清汉女丝绸束带·女 | `assets/default/item/belts/eq_qinghannvsichou_nv.png` | 待出图 | [eq_qinghannvsichou_nv.md](items/belts/eq_qinghannvsichou_nv.md) |
| items | `eq_qingxiuhuahebaodai_nv` | 清绣花荷包带·女 | `assets/default/item/belts/eq_qingxiuhuahebaodai_nv.png` | 待出图 | [eq_qingxiuhuahebaodai_nv.md](items/belts/eq_qingxiuhuahebaodai_nv.md) |
| items | `eq_songdujinaomiandai_nan` | 宋镀金凹面带·男 | `assets/default/item/belts/eq_songdujinaomiandai_nan.png` | 待出图 | [eq_songdujinaomiandai_nan.md](items/belts/eq_songdujinaomiandai_nan.md) |
| items | `eq_songmabutaosheng_nan` | 宋麻布绦绳·男 | `assets/default/item/belts/eq_songmabutaosheng_nan.png` | 待出图 | [eq_songmabutaosheng_nan.md](items/belts/eq_songmabutaosheng_nan.md) |
| items | `eq_songsubodai_nv` | 宋素帛裙带·女 | `assets/default/item/belts/eq_songsubodai_nv.png` | 待出图 | [eq_songsubodai_nv.md](items/belts/eq_songsubodai_nv.md) |
| items | `eq_songyuhuanxiu_nv` | 宋玉环绶·女 | `assets/default/item/belts/eq_songyuhuanxiu_nv.png` | 待出图 | [eq_songyuhuanxiu_nv.md](items/belts/eq_songyuhuanxiu_nv.md) |
| items | `eq_xixiaxiubianbodai_nv` | 西夏绣边帛带·女 | `assets/default/item/belts/eq_xixiaxiubianbodai_nv.png` | 待出图 | [eq_xixiaxiubianbodai_nv.md](items/belts/eq_xixiaxiubianbodai_nv.md) |
| items | `eq_yuanhongjinyaodai_nv` | 元红锦腰带·女 | `assets/default/item/belts/eq_yuanhongjinyaodai_nv.png` | 待出图 | [eq_yuanhongjinyaodai_nv.md](items/belts/eq_yuanhongjinyaodai_nv.md) |
| items | `eq_yuanshutongkuaodai_nan` | 元鎏银铜銙带·男 | `assets/default/item/belts/eq_yuanshutongkuaodai_nan.png` | 待出图 | [eq_yuanshutongkuaodai_nan.md](items/belts/eq_yuanshutongkuaodai_nan.md) |
| items | `eq_dalibaiduanqun_nv` | 大理白缎裙衣·女 | `assets/default/item/clothing/eq_dalibaiduanqun_nv.png` | 待出图 | [eq_dalibaiduanqun_nv.md](items/clothing/eq_dalibaiduanqun_nv.md) |
| items | `eq_huijiangjiapan_nan` | 回疆棉布袷袢·男 | `assets/default/item/clothing/eq_huijiangjiapan_nan.png` | 待出图 | [eq_huijiangjiapan_nan.md](items/clothing/eq_huijiangjiapan_nan.md) |
| items | `eq_jinchunshuipanlingpao_nan` | 金春水盘领袍·男 | `assets/default/item/clothing/eq_jinchunshuipanlingpao_nan.png` | 待出图 | [eq_jinchunshuipanlingpao_nan.md](items/clothing/eq_jinchunshuipanlingpao_nan.md) |
| items | `eq_jinzhizhisunpao_nan` | 金织质孙袍·男 | `assets/default/item/clothing/eq_jinzhizhisunpao_nan.png` | 待出图 | [eq_jinzhizhisunpao_nan.md](items/clothing/eq_jinzhizhisunpao_nan.md) |
| items | `eq_liaodiaoqiupao_nan` | 辽貂裘窄袍·男 | `assets/default/item/clothing/eq_liaodiaoqiupao_nan.png` | 待出图 | [eq_liaodiaoqiupao_nan.md](items/clothing/eq_liaodiaoqiupao_nan.md) |
| items | `eq_mingbuaoqun_nv` | 明布袄裙·女 | `assets/default/item/clothing/eq_mingbuaoqun_nv.png` | 待出图 | [eq_mingbuaoqun_nv.md](items/clothing/eq_mingbuaoqun_nv.md) |
| items | `eq_mingjinmamianqun_nv` | 明锦马面裙·女 | `assets/default/item/clothing/eq_mingjinmamianqun_nv.png` | 待出图 | [eq_mingjinmamianqun_nv.md](items/clothing/eq_mingjinmamianqun_nv.md) |
| items | `eq_mingqingyesa_nan` | 明青曳撒·男 | `assets/default/item/clothing/eq_mingqingyesa_nan.png` | 待出图 | [eq_mingqingyesa_nan.md](items/clothing/eq_mingqingyesa_nan.md) |
| items | `eq_mingzhijinbijia_nv` | 明织金比甲·女 | `assets/default/item/clothing/eq_mingzhijinbijia_nv.png` | 待出图 | [eq_mingzhijinbijia_nv.md](items/clothing/eq_mingzhijinbijia_nv.md) |
| items | `eq_qinghanvjiaao_nv` | 清汉女夹袄·女 | `assets/default/item/clothing/eq_qinghanvjiaao_nv.png` | 待出图 | [eq_qinghanvjiaao_nv.md](items/clothing/eq_qinghanvjiaao_nv.md) |
| items | `eq_qinglanmagua_nan` | 清蓝缎马褂·男 | `assets/default/item/clothing/eq_qinglanmagua_nan.png` | 待出图 | [eq_qinglanmagua_nan.md](items/clothing/eq_qinglanmagua_nan.md) |
| items | `eq_qingqizhuangjifu_nv` | 清绣旗装吉服·女 | `assets/default/item/clothing/eq_qingqizhuangjifu_nv.png` | 待出图 | [eq_qingqizhuangjifu_nv.md](items/clothing/eq_qingqizhuangjifu_nv.md) |
| items | `eq_songluobeizi_nv` | 宋罗褙子·女 | `assets/default/item/clothing/eq_songluobeizi_nv.png` | 待出图 | [eq_songluobeizi_nv.md](items/clothing/eq_songluobeizi_nv.md) |
| items | `eq_songmabuduanru_nv` | 宋麻布短襦·女 | `assets/default/item/clothing/eq_songmabuduanru_nv.png` | 待出图 | [eq_songmabuduanru_nv.md](items/clothing/eq_songmabuduanru_nv.md) |
| items | `eq_songqingyuanlingpao_nan` | 宋青圆领袍·男 | `assets/default/item/clothing/eq_songqingyuanlingpao_nan.png` | 待出图 | [eq_songqingyuanlingpao_nan.md](items/clothing/eq_songqingyuanlingpao_nan.md) |
| items | `eq_songziluogongpao_nan` | 宋紫罗公袍·男 | `assets/default/item/clothing/eq_songziluogongpao_nan.png` | 待出图 | [eq_songziluogongpao_nan.md](items/clothing/eq_songziluogongpao_nan.md) |
| items | `eq_xixiazhaiheshan_nv` | 西夏窄褙衫·女 | `assets/default/item/clothing/eq_xixiazhaiheshan_nv.png` | 待出图 | [eq_xixiazhaiheshan_nv.md](items/clothing/eq_xixiazhaiheshan_nv.md) |
| items | `eq_zangdicuobu_nan` | 藏地粗氆氇袍·男 | `assets/default/item/clothing/eq_zangdicuobu_nan.png` | 待出图 | [eq_zangdicuobu_nan.md](items/clothing/eq_zangdicuobu_nan.md) |
| items | `it_anchunrou` | 鹌鹑肉 | `assets/default/item/food/it_anchunrou.png` | 待出图 | [it_anchunrou.md](items/food/it_anchunrou.md) |
| items | `it_aqing_qingcha` | 阿青清茶 | `assets/default/item/food/it_aqing_qingcha.png` | 待出图 | [it_aqing_qingcha.md](items/food/it_aqing_qingcha.md) |
| items | `it_baicai` | 白菜 | `assets/default/item/food/it_baicai.png` | 待出图 | [it_baicai.md](items/food/it_baicai.md) |
| items | `it_banya` | 板鸭 | `assets/default/item/food/it_banya.png` | 待出图 | [it_banya.md](items/food/it_banya.md) |
| items | `it_baotai` | 豹胎 | `assets/default/item/food/it_baotai.png` | 待出图 | [it_baotai.md](items/food/it_baotai.md) |
| items | `it_baoyu` | 鲍鱼 | `assets/default/item/food/it_baoyu.png` | 待出图 | [it_baoyu.md](items/food/it_baoyu.md) |
| items | `it_binghuodao_kaoxiongrou` | 冰火岛烤熊肉 | `assets/default/item/food/it_binghuodao_kaoxiongrou.png` | 待出图 | [it_binghuodao_kaoxiongrou.md](items/food/it_binghuodao_kaoxiongrou.md) |
| items | `it_chenglingsu_sancai_yitang` | 程灵素三菜一汤 | `assets/default/item/food/it_chenglingsu_sancai_yitang.png` | 待出图 | [it_chenglingsu_sancai_yitang.md](items/food/it_chenglingsu_sancai_yitang.md) |
| items | `it_chidou` | 赤豆 | `assets/default/item/food/it_chidou.png` | 待出图 | [it_chidou.md](items/food/it_chidou.md) |
| items | `it_chunsun` | 春笋 | `assets/default/item/food/it_chunsun.png` | 待出图 | [it_chunsun.md](items/food/it_chunsun.md) |
| items | `it_cong` | 葱 | `assets/default/item/food/it_cong.png` | 待出图 | [it_cong.md](items/food/it_cong.md) |
| items | `it_dadou` | 大豆 | `assets/default/item/food/it_dadou.png` | 待出图 | [it_dadou.md](items/food/it_dadou.md) |
| items | `it_dali_qingming_chadian` | 大理清茗茶点 | `assets/default/item/food/it_dali_qingming_chadian.png` | 待出图 | [it_dali_qingming_chadian.md](items/food/it_dali_qingming_chadian.md) |
| items | `it_dianchi_shurou_shaoji` | 滇池熟肉烧鸡 | `assets/default/item/food/it_dianchi_shurou_shaoji.png` | 待出图 | [it_dianchi_shurou_shaoji.md](items/food/it_dianchi_shurou_shaoji.md) |
| items | `it_dingshenggao` | 定胜糕 | `assets/default/item/food/it_dingshenggao.png` | 待出图 | [it_dingshenggao.md](items/food/it_dingshenggao.md) |
| items | `it_donggua` | 冬瓜 | `assets/default/item/food/it_donggua.png` | 待出图 | [it_donggua.md](items/food/it_donggua.md) |
| items | `it_dongporou` | 东坡肉 | `assets/default/item/food/it_dongporou.png` | 待出图 | [it_dongporou.md](items/food/it_dongporou.md) |
| items | `it_douchi` | 豆豉 | `assets/default/item/food/it_douchi.png` | 待出图 | [it_douchi.md](items/food/it_douchi.md) |
| items | `it_doufu` | 豆腐 | `assets/default/item/food/it_doufu.png` | 待出图 | [it_doufu.md](items/food/it_doufu.md) |
| items | `it_erou` | 鹅肉 | `assets/default/item/food/it_erou.png` | 待出图 | [it_erou.md](items/food/it_erou.md) |
| items | `it_fanshu` | 番薯 | `assets/default/item/food/it_fanshu.png` | 待出图 | [it_fanshu.md](items/food/it_fanshu.md) |
| items | `it_fenggan_yangrou` | 风干羊肉 | `assets/default/item/food/it_fenggan_yangrou.png` | 待出图 | [it_fenggan_yangrou.md](items/food/it_fenggan_yangrou.md) |
| items | `it_furu` | 腐乳 | `assets/default/item/food/it_furu.png` | 待出图 | [it_furu.md](items/food/it_furu.md) |
| items | `it_fuzhou_yeji_huangtu` | 福州野鸡黄兔 | `assets/default/item/food/it_fuzhou_yeji_huangtu.png` | 待出图 | [it_fuzhou_yeji_huangtu.md](items/food/it_fuzhou_yeji_huangtu.md) |
| items | `it_gaoliang` | 高粱 | `assets/default/item/food/it_gaoliang.png` | 待出图 | [it_gaoliang.md](items/food/it_gaoliang.md) |
| items | `it_gerou` | 鸽肉 | `assets/default/item/food/it_gerou.png` | 待出图 | [it_gerou.md](items/food/it_gerou.md) |
| items | `it_gourou` | 狗肉 | `assets/default/item/food/it_gourou.png` | 待出图 | [it_gourou.md](items/food/it_gourou.md) |
| items | `it_guangmingding_suxian_yuanbing` | 光明顶素馅圆饼 | `assets/default/item/food/it_guangmingding_suxian_yuanbing.png` | 待出图 | [it_guangmingding_suxian_yuanbing.md](items/food/it_guangmingding_suxian_yuanbing.md) |
| items | `it_guokui` | 锅盔 | `assets/default/item/food/it_guokui.png` | 待出图 | [it_guokui.md](items/food/it_guokui.md) |
| items | `it_haili` | 海蛎 | `assets/default/item/food/it_haili.png` | 待出图 | [it_haili.md](items/food/it_haili.md) |
| items | `it_haishen` | 海参 | `assets/default/item/food/it_haishen.png` | 待出图 | [it_haishen.md](items/food/it_haishen.md) |
| items | `it_haiyu` | 海鱼 | `assets/default/item/food/it_haiyu.png` | 待出图 | [it_haiyu.md](items/food/it_haiyu.md) |
| items | `it_hanshui_qingyu` | 汉水青鱼 | `assets/default/item/food/it_hanshui_qingyu.png` | 待出图 | [it_hanshui_qingyu.md](items/food/it_hanshui_qingyu.md) |
| items | `it_hanshui_siwan_fancai` | 汉水四碗饭菜 | `assets/default/item/food/it_hanshui_siwan_fancai.png` | 待出图 | [it_hanshui_siwan_fancai.md](items/food/it_hanshui_siwan_fancai.md) |
| items | `it_heli` | 河鲤 | `assets/default/item/food/it_heli.png` | 待出图 | [it_heli.md](items/food/it_heli.md) |
| items | `it_heliandouzi` | 荷莲兜子 | `assets/default/item/food/it_heliandouzi.png` | 待出图 | [it_heliandouzi.md](items/food/it_heliandouzi.md) |
| items | `it_hengshan_qingcaidoufu` | 恒山青菜豆腐 | `assets/default/item/food/it_hengshan_qingcaidoufu.png` | 待出图 | [it_hengshan_qingcaidoufu.md](items/food/it_hengshan_qingcaidoufu.md) |
| items | `it_hengshan_suxianzong` | 恒山素馅粽 | `assets/default/item/food/it_hengshan_suxianzong.png` | 待出图 | [it_hengshan_suxianzong.md](items/food/it_hengshan_suxianzong.md) |
| items | `it_hetun` | 河豚 | `assets/default/item/food/it_hetun.png` | 待出图 | [it_hetun.md](items/food/it_hetun.md) |
| items | `it_honghuahui_zongduo_yanxi` | 红花会总舵宴席 | `assets/default/item/food/it_honghuahui_zongduo_yanxi.png` | 待出图 | [it_honghuahui_zongduo_yanxi.md](items/food/it_honghuahui_zongduo_yanxi.md) |
| items | `it_hongzao` | 红枣 | `assets/default/item/food/it_hongzao.png` | 待出图 | [it_hongzao.md](items/food/it_hongzao.md) |
| items | `it_houjianji_shaobing` | 侯监集烧饼 | `assets/default/item/food/it_houjianji_shaobing.png` | 待出图 | [it_houjianji_shaobing.md](items/food/it_houjianji_shaobing.md) |
| items | `it_huajiao` | 花胶 | `assets/default/item/food/it_huajiao.png` | 待出图 | [it_huajiao.md](items/food/it_huajiao.md) |
| items | `it_huajiao_xiangliao` | 花椒香料 | `assets/default/item/food/it_huajiao_xiangliao.png` | 待出图 | [it_huajiao_xiangliao.md](items/food/it_huajiao_xiangliao.md) |
| items | `it_huangyu` | 黄鱼 | `assets/default/item/food/it_huangyu.png` | 待出图 | [it_huangyu.md](items/food/it_huangyu.md) |
| items | `it_huashan_qingcai_doufufan` | 华山青菜豆腐饭 | `assets/default/item/food/it_huashan_qingcai_doufufan.png` | 待出图 | [it_huashan_qingcai_doufufan.md](items/food/it_huashan_qingcai_doufufan.md) |
| items | `it_huayuan_gaobing` | 花园糕饼 | `assets/default/item/food/it_huayuan_gaobing.png` | 待出图 | [it_huayuan_gaobing.md](items/food/it_huayuan_gaobing.md) |
| items | `it_hubing` | 胡饼 | `assets/default/item/food/it_hubing.png` | 待出图 | [it_hubing.md](items/food/it_hubing.md) |
| items | `it_huibu_zhuafan_kaorou` | 回部抓饭烤肉 | `assets/default/item/food/it_huibu_zhuafan_kaorou.png` | 待出图 | [it_huibu_zhuafan_kaorou.md](items/food/it_huibu_zhuafan_kaorou.md) |
| items | `it_huiyanlou_huncai` | 回雁楼荤菜 | `assets/default/item/food/it_huiyanlou_huncai.png` | 待出图 | [it_huiyanlou_huncai.md](items/food/it_huiyanlou_huncai.md) |
| items | `it_hujiao` | 胡椒 | `assets/default/item/food/it_hujiao.png` | 待出图 | [it_hujiao.md](items/food/it_hujiao.md) |
| items | `it_humiao_mantou_jiyangtui` | 胡苗馒头鸡羊腿 | `assets/default/item/food/it_humiao_mantou_jiyangtui.png` | 待出图 | [it_humiao_mantou_jiyangtui.md](items/food/it_humiao_mantou_jiyangtui.md) |
| items | `it_huodui_kaozhangji` | 火堆烤獐麂 | `assets/default/item/food/it_huodui_kaozhangji.png` | 待出图 | [it_huodui_kaozhangji.md](items/food/it_huodui_kaozhangji.md) |
| items | `it_hutao` | 胡桃 | `assets/default/item/food/it_hutao.png` | 待出图 | [it_hutao.md](items/food/it_hutao.md) |
| items | `it_huxie` | 湖蟹 | `assets/default/item/food/it_huxie.png` | 待出图 | [it_huxie.md](items/food/it_huxie.md) |
| items | `it_jiangshilang_doufu` | 蒋侍郎豆腐 | `assets/default/item/food/it_jiangshilang_doufu.png` | 待出图 | [it_jiangshilang_doufu.md](items/food/it_jiangshilang_doufu.md) |
| items | `it_jiangxia` | 江虾 | `assets/default/item/food/it_jiangxia.png` | 待出图 | [it_jiangxia.md](items/food/it_jiangxia.md) |
| items | `it_jiangyaozhu` | 江瑶柱 | `assets/default/item/food/it_jiangyaozhu.png` | 待出图 | [it_jiangyaozhu.md](items/food/it_jiangyaozhu.md) |
| items | `it_jiangzhi` | 酱汁 | `assets/default/item/food/it_jiangzhi.png` | 待出图 | [it_jiangzhi.md](items/food/it_jiangzhi.md) |
| items | `it_jinyinmantou` | 金银馒头 | `assets/default/item/food/it_jinyinmantou.png` | 待出图 | [it_jinyinmantou.md](items/food/it_jinyinmantou.md) |
| items | `it_jirou` | 鸡肉 | `assets/default/item/food/it_jirou.png` | 待出图 | [it_jirou.md](items/food/it_jirou.md) |
| items | `it_jiucai` | 韭菜 | `assets/default/item/food/it_jiucai.png` | 待出图 | [it_jiucai.md](items/food/it_jiucai.md) |
| items | `it_jiuzao` | 酒糟 | `assets/default/item/food/it_jiuzao.png` | 待出图 | [it_jiuzao.md](items/food/it_jiuzao.md) |
| items | `it_juecai` | 蕨菜 | `assets/default/item/food/it_juecai.png` | 待出图 | [it_juecai.md](items/food/it_juecai.md) |
| items | `it_lajiao` | 辣椒 | `assets/default/item/food/it_lajiao.png` | 待出图 | [it_lajiao.md](items/food/it_lajiao.md) |
| items | `it_larou` | 腊肉 | `assets/default/item/food/it_larou.png` | 待出图 | [it_larou.md](items/food/it_larou.md) |
| items | `it_li` | 梨 | `assets/default/item/food/it_li.png` | 待出图 | [it_li.md](items/food/it_li.md) |
| items | `it_lianou` | 莲藕 | `assets/default/item/food/it_lianou.png` | 待出图 | [it_lianou.md](items/food/it_lianou.md) |
| items | `it_liaoying_yangrou` | 辽营羊肉 | `assets/default/item/food/it_liaoying_yangrou.png` | 待出图 | [it_liaoying_yangrou.md](items/food/it_liaoying_yangrou.md) |
| items | `it_lizhi` | 荔枝 | `assets/default/item/food/it_lizhi.png` | 待出图 | [it_lizhi.md](items/food/it_lizhi.md) |
| items | `it_lubeiji` | 炉焙鸡 | `assets/default/item/food/it_lubeiji.png` | 待出图 | [it_lubeiji.md](items/food/it_lubeiji.md) |
| items | `it_luobo` | 萝卜 | `assets/default/item/food/it_luobo.png` | 待出图 | [it_luobo.md](items/food/it_luobo.md) |
| items | `it_lvdou` | 绿豆 | `assets/default/item/food/it_lvdou.png` | 待出图 | [it_lvdou.md](items/food/it_lvdou.md) |
| items | `it_lvrou` | 驴肉 | `assets/default/item/food/it_lvrou.png` | 待出图 | [it_lvrou.md](items/food/it_lvrou.md) |
| items | `it_marou` | 马肉 | `assets/default/item/food/it_marou.png` | 待出图 | [it_marou.md](items/food/it_marou.md) |
| items | `it_meigui_subing` | 玫瑰酥饼 | `assets/default/item/food/it_meigui_subing.png` | 待出图 | [it_meigui_subing.md](items/food/it_meigui_subing.md) |
| items | `it_miaojia_huofan_sancai` | 苗家镬饭三菜 | `assets/default/item/food/it_miaojia_huofan_sancai.png` | 待出图 | [it_miaojia_huofan_sancai.md](items/food/it_miaojia_huofan_sancai.md) |
| items | `it_micu` | 米醋 | `assets/default/item/food/it_micu.png` | 待出图 | [it_micu.md](items/food/it_micu.md) |
| items | `it_milian_huotui` | 蜜莲火腿 | `assets/default/item/food/it_milian_huotui.png` | 待出图 | [it_milian_huotui.md](items/food/it_milian_huotui.md) |
| items | `it_mizi_jinju` | 蜜渍金橘 | `assets/default/item/food/it_mizi_jinju.png` | 待出图 | [it_mizi_jinju.md](items/food/it_mizi_jinju.md) |
| items | `it_muer` | 木耳 | `assets/default/item/food/it_muer.png` | 待出图 | [it_muer.md](items/food/it_muer.md) |
| items | `it_muwu_gancaifan` | 木屋干菜饭 | `assets/default/item/food/it_muwu_gancaifan.png` | 待出图 | [it_muwu_gancaifan.md](items/food/it_muwu_gancaifan.md) |
| items | `it_naigan` | 奶干 | `assets/default/item/food/it_naigan.png` | 待出图 | [it_naigan.md](items/food/it_naigan.md) |
| items | `it_naiyou_recha` | 奶油热茶 | `assets/default/item/food/it_naiyou_recha.png` | 待出图 | [it_naiyou_recha.md](items/food/it_naiyou_recha.md) |
| items | `it_nangbing` | 馕饼 | `assets/default/item/food/it_nangbing.png` | 待出图 | [it_nangbing.md](items/food/it_nangbing.md) |
| items | `it_niurou` | 牛肉 | `assets/default/item/food/it_niurou.png` | 待出图 | [it_niurou.md](items/food/it_niurou.md) |
| items | `it_pomiao_shutang` | 破庙鼠汤 | `assets/default/item/food/it_pomiao_shutang.png` | 待出图 | [it_pomiao_shutang.md](items/food/it_pomiao_shutang.md) |
| items | `it_putao` | 葡萄 | `assets/default/item/food/it_putao.png` | 待出图 | [it_putao.md](items/food/it_putao.md) |
| items | `it_qiaomai` | 荞麦 | `assets/default/item/food/it_qiaomai.png` | 待出图 | [it_qiaomai.md](items/food/it_qiaomai.md) |
| items | `it_qiezi` | 茄子 | `assets/default/item/food/it_qiezi.png` | 待出图 | [it_qiezi.md](items/food/it_qiezi.md) |
| items | `it_qincai` | 芹菜 | `assets/default/item/food/it_qincai.png` | 待出图 | [it_qincai.md](items/food/it_qincai.md) |
| items | `it_qingcai` | 青菜 | `assets/default/item/food/it_qingcai.png` | 待出图 | [it_qingcai.md](items/food/it_qingcai.md) |
| items | `it_qingcai_doufu_xiaoyufan` | 青菜豆腐小鱼饭 | `assets/default/item/food/it_qingcai_doufu_xiaoyufan.png` | 待出图 | [it_qingcai_doufu_xiaoyufan.md](items/food/it_qingcai_doufu_xiaoyufan.md) |
| items | `it_qingkezanba` | 青稞糌粑 | `assets/default/item/food/it_qingkezanba.png` | 待出图 | [it_qingkezanba.md](items/food/it_qingkezanba.md) |
| items | `it_qingshui_yufeng_mijiang` | 清水玉蜂蜜浆 | `assets/default/item/food/it_qingshui_yufeng_mijiang.png` | 待出图 | [it_qingshui_yufeng_mijiang.md](items/food/it_qingshui_yufeng_mijiang.md) |
| items | `it_shanhaidou` | 山海兜 | `assets/default/item/food/it_shanhaidou.png` | 待出图 | [it_shanhaidou.md](items/food/it_shanhaidou.md) |
| items | `it_shanjia_sancui` | 山家三脆 | `assets/default/item/food/it_shanjia_sancui.png` | 待出图 | [it_shanjia_sancui.md](items/food/it_shanjia_sancui.md) |
| items | `it_shanyaozhou` | 山药粥 | `assets/default/item/food/it_shanyaozhou.png` | 待出图 | [it_shanyaozhou.md](items/food/it_shanyaozhou.md) |
| items | `it_shaolin_sumian` | 少林素面 | `assets/default/item/food/it_shaolin_sumian.png` | 待出图 | [it_shaolin_sumian.md](items/food/it_shaolin_sumian.md) |
| items | `it_shaoxiaozhu` | 烧小猪 | `assets/default/item/food/it_shaoxiaozhu.png` | 待出图 | [it_shaoxiaozhu.md](items/food/it_shaoxiaozhu.md) |
| items | `it_shengjiang` | 生姜 | `assets/default/item/food/it_shengjiang.png` | 待出图 | [it_shengjiang.md](items/food/it_shengjiang.md) |
| items | `it_shiliu` | 石榴 | `assets/default/item/food/it_shiliu.png` | 待出图 | [it_shiliu.md](items/food/it_shiliu.md) |
| items | `it_shiyu` | 鲥鱼 | `assets/default/item/food/it_shiyu.png` | 待出图 | [it_shiyu.md](items/food/it_shiyu.md) |
| items | `it_shizhuyu` | 食茱萸 | `assets/default/item/food/it_shizhuyu.png` | 待出图 | [it_shizhuyu.md](items/food/it_shizhuyu.md) |
| items | `it_songhelou_xiaren` | 松鹤楼虾仁 | `assets/default/item/food/it_songhelou_xiaren.png` | 待出图 | [it_songhelou_xiaren.md](items/food/it_songhelou_xiaren.md) |
| items | `it_sunzha` | 笋鲊 | `assets/default/item/food/it_sunzha.png` | 待出图 | [it_sunzha.md](items/food/it_sunzha.md) |
| items | `it_suyoubing` | 酥油饼 | `assets/default/item/food/it_suyoubing.png` | 待出图 | [it_suyoubing.md](items/food/it_suyoubing.md) |
| items | `it_taihu_yinyu` | 太湖银鱼 | `assets/default/item/food/it_taihu_yinyu.png` | 待出图 | [it_taihu_yinyu.md](items/food/it_taihu_yinyu.md) |
| items | `it_tangshuangtaotiao` | 糖霜桃条 | `assets/default/item/food/it_tangshuangtaotiao.png` | 待出图 | [it_tangshuangtaotiao.md](items/food/it_tangshuangtaotiao.md) |
| items | `it_tao` | 桃 | `assets/default/item/food/it_tao.png` | 待出图 | [it_tao.md](items/food/it_tao.md) |
| items | `it_tuanyutang` | 团鱼汤 | `assets/default/item/food/it_tuanyutang.png` | 待出图 | [it_tuanyutang.md](items/food/it_tuanyutang.md) |
| items | `it_tuofeng` | 驼峰 | `assets/default/item/food/it_tuofeng.png` | 待出图 | [it_tuofeng.md](items/food/it_tuofeng.md) |
| items | `it_turou` | 兔肉 | `assets/default/item/food/it_turou.png` | 待出图 | [it_turou.md](items/food/it_turou.md) |
| items | `it_wangtaishou_babaodoufu` | 王太守八宝豆腐 | `assets/default/item/food/it_wangtaishou_babaodoufu.png` | 待出图 | [it_wangtaishou_babaodoufu.md](items/food/it_wangtaishou_babaodoufu.md) |
| items | `it_wenjia_huotui_larouyan` | 温家火腿腊肉宴 | `assets/default/item/food/it_wenjia_huotui_larouyan.png` | 待出图 | [it_wenjia_huotui_larouyan.md](items/food/it_wenjia_huotui_larouyan.md) |
| items | `it_xiakedao_siyang_dianxin` | 侠客岛四样点心 | `assets/default/item/food/it_xiakedao_siyang_dianxin.png` | 待出图 | [it_xiakedao_siyang_dianxin.md](items/food/it_xiakedao_siyang_dianxin.md) |
| items | `it_xianlurou` | 鲜鹿肉 | `assets/default/item/food/it_xianlurou.png` | 待出图 | [it_xianlurou.md](items/food/it_xianlurou.md) |
| items | `it_xianrou` | 咸肉 | `assets/default/item/food/it_xianrou.png` | 待出图 | [it_xianrou.md](items/food/it_xianrou.md) |
| items | `it_xiaofu_shoujiuxi` | 萧府寿酒席 | `assets/default/item/food/it_xiaofu_shoujiuxi.png` | 待出图 | [it_xiaofu_shoujiuxi.md](items/food/it_xiaofu_shoujiuxi.md) |
| items | `it_xiaomi` | 小米 | `assets/default/item/food/it_xiaomi.png` | 待出图 | [it_xiaomi.md](items/food/it_xiaomi.md) |
| items | `it_xieniangcheng` | 蟹酿橙 | `assets/default/item/food/it_xieniangcheng.png` | 待出图 | [it_xieniangcheng.md](items/food/it_xieniangcheng.md) |
| items | `it_xing` | 杏 | `assets/default/item/food/it_xing.png` | 待出图 | [it_xing.md](items/food/it_xing.md) |
| items | `it_xingchun` | 猩唇 | `assets/default/item/food/it_xingchun.png` | 待出图 | [it_xingchun.md](items/food/it_xingchun.md) |
| items | `it_xiongbai` | 熊白 | `assets/default/item/food/it_xiongbai.png` | 待出图 | [it_xiongbai.md](items/food/it_xiongbai.md) |
| items | `it_xiongzhang` | 熊掌 | `assets/default/item/food/it_xiongzhang.png` | 待出图 | [it_xiongzhang.md](items/food/it_xiongzhang.md) |
| items | `it_xuedi_kaohuangyang` | 雪地烤黄羊 | `assets/default/item/food/it_xuedi_kaohuangyang.png` | 待出图 | [it_xuedi_kaohuangyang.md](items/food/it_xuedi_kaohuangyang.md) |
| items | `it_xueha` | 雪蛤 | `assets/default/item/food/it_xueha.png` | 待出图 | [it_xueha.md](items/food/it_xueha.md) |
| items | `it_yan` | 盐 | `assets/default/item/food/it_yan.png` | 待出图 | [it_yan.md](items/food/it_yan.md) |
| items | `it_yangrou` | 羊肉 | `assets/default/item/food/it_yangrou.png` | 待出图 | [it_yangrou.md](items/food/it_yangrou.md) |
| items | `it_yangrulao` | 羊乳酪 | `assets/default/item/food/it_yangrulao.png` | 待出图 | [it_yangrulao.md](items/food/it_yangrulao.md) |
| items | `it_yangweizhi` | 羊尾脂 | `assets/default/item/food/it_yangweizhi.png` | 待出图 | [it_yangweizhi.md](items/food/it_yangweizhi.md) |
| items | `it_yangzhou_tangbao_changyumian` | 扬州汤包长鱼面 | `assets/default/item/food/it_yangzhou_tangbao_changyumian.png` | 待出图 | [it_yangzhou_tangbao_changyumian.md](items/food/it_yangzhou_tangbao_changyumian.md) |
| items | `it_yanwo` | 燕窝 | `assets/default/item/food/it_yanwo.png` | 待出图 | [it_yanwo.md](items/food/it_yanwo.md) |
| items | `it_yanwojisitang` | 燕窝鸡丝汤 | `assets/default/item/food/it_yanwojisitang.png` | 待出图 | [it_yanwojisitang.md](items/food/it_yanwojisitang.md) |
| items | `it_yarou` | 鸭肉 | `assets/default/item/food/it_yarou.png` | 待出图 | [it_yarou.md](items/food/it_yarou.md) |
| items | `it_yuchi` | 鱼翅 | `assets/default/item/food/it_yuchi.png` | 待出图 | [it_yuchi.md](items/food/it_yuchi.md) |
| items | `it_yuebing` | 月饼 | `assets/default/item/food/it_yuebing.png` | 待出图 | [it_yuebing.md](items/food/it_yuebing.md) |
| items | `it_yumi` | 玉米 | `assets/default/item/food/it_yumi.png` | 待出图 | [it_yumi.md](items/food/it_yumi.md) |
| items | `it_yuzhou_fanshu_caomifan` | 渔舟番薯糙米饭 | `assets/default/item/food/it_yuzhou_fanshu_caomifan.png` | 待出图 | [it_yuzhou_fanshu_caomifan.md](items/food/it_yuzhou_fanshu_caomifan.md) |
| items | `it_zaoyu` | 糟鱼 | `assets/default/item/food/it_zaoyu.png` | 待出图 | [it_zaoyu.md](items/food/it_zaoyu.md) |
| items | `it_zhayangwei` | 炸羊尾 | `assets/default/item/food/it_zhayangwei.png` | 待出图 | [it_zhayangwei.md](items/food/it_zhayangwei.md) |
| items | `it_zhengbing` | 蒸饼 | `assets/default/item/food/it_zhengbing.png` | 待出图 | [it_zhengbing.md](items/food/it_zhengbing.md) |
| items | `it_zhetang` | 蔗糖 | `assets/default/item/food/it_zhetang.png` | 待出图 | [it_zhetang.md](items/food/it_zhetang.md) |
| items | `it_zhimashaobing` | 芝麻烧饼 | `assets/default/item/food/it_zhimashaobing.png` | 待出图 | [it_zhimashaobing.md](items/food/it_zhimashaobing.md) |
| items | `it_zhudu` | 猪肚 | `assets/default/item/food/it_zhudu.png` | 待出图 | [it_zhudu.md](items/food/it_zhudu.md) |
| items | `it_zhurou` | 猪肉 | `assets/default/item/food/it_zhurou.png` | 待出图 | [it_zhurou.md](items/food/it_zhurou.md) |
| items | `eq_dalijingxiulv_nv` | 大理锦绣履·女 | `assets/default/item/shoes/eq_dalijingxiulv_nv.png` | 待出图 | [eq_dalijingxiulv_nv.md](items/shoes/eq_dalijingxiulv_nv.md) |
| items | `eq_huijiangxiubianpixue_nv` | 回疆绣边皮靴·女 | `assets/default/item/shoes/eq_huijiangxiubianpixue_nv.png` | 待出图 | [eq_huijiangxiubianpixue_nv.md](items/shoes/eq_huijiangxiubianpixue_nv.md) |
| items | `eq_jinwupixue_nan` | 金乌皮靴·男 | `assets/default/item/shoes/eq_jinwupixue_nan.png` | 待出图 | [eq_jinwupixue_nan.md](items/shoes/eq_jinwupixue_nan.md) |
| items | `eq_liaowupiqixue_nan` | 辽乌皮骑靴·男 | `assets/default/item/shoes/eq_liaowupiqixue_nan.png` | 待出图 | [eq_liaowupiqixue_nan.md](items/shoes/eq_liaowupiqixue_nan.md) |
| items | `eq_mengguyangmaozhanxue_nan` | 蒙古羊毛毡靴·男 | `assets/default/item/shoes/eq_mengguyangmaozhanxue_nan.png` | 待出图 | [eq_mengguyangmaozhanxue_nan.md](items/shoes/eq_mengguyangmaozhanxue_nan.md) |
| items | `eq_mingmianbuhualv_nv` | 明棉布花履·女 | `assets/default/item/shoes/eq_mingmianbuhualv_nv.png` | 待出图 | [eq_mingmianbuhualv_nv.md](items/shoes/eq_mingmianbuhualv_nv.md) |
| items | `eq_mingzaopixue_nan` | 明皂皮靴·男 | `assets/default/item/shoes/eq_mingzaopixue_nan.png` | 待出图 | [eq_mingzaopixue_nan.md](items/shoes/eq_mingzaopixue_nan.md) |
| items | `eq_mingzhijinxiuhuagongxie_nv` | 明织金绣花弓鞋·女 | `assets/default/item/shoes/eq_mingzhijinxiuhuagongxie_nv.png` | 待出图 | [eq_mingzhijinxiuhuagongxie_nv.md](items/shoes/eq_mingzhijinxiuhuagongxie_nv.md) |
| items | `eq_qingjinxiuhuapendixie_nv` | 清锦绣花盆底鞋·女 | `assets/default/item/shoes/eq_qingjinxiuhuapendixie_nv.png` | 待出图 | [eq_qingjinxiuhuapendixie_nv.md](items/shoes/eq_qingjinxiuhuapendixie_nv.md) |
| items | `eq_qingqingduanxingxue_nan` | 清青缎行靴·男 | `assets/default/item/shoes/eq_qingqingduanxingxue_nan.png` | 待出图 | [eq_qingqingduanxingxue_nan.md](items/shoes/eq_qingqingduanxingxue_nan.md) |
| items | `eq_qingxuanduanchaoxue_nan` | 清玄缎朝靴·男 | `assets/default/item/shoes/eq_qingxuanduanchaoxue_nan.png` | 待出图 | [eq_qingxuanduanchaoxue_nan.md](items/shoes/eq_qingxuanduanchaoxue_nan.md) |
| items | `eq_songjinxiuyuntoulv_nv` | 宋金绣云头履·女 | `assets/default/item/shoes/eq_songjinxiuyuntoulv_nv.png` | 待出图 | [eq_songjinxiuyuntoulv_nv.md](items/shoes/eq_songjinxiuyuntoulv_nv.md) |
| items | `eq_songmabuxie_nan` | 宋麻布鞋·男 | `assets/default/item/shoes/eq_songmabuxie_nan.png` | 待出图 | [eq_songmabuxie_nan.md](items/shoes/eq_songmabuxie_nan.md) |
| items | `eq_songqingbuyuantoulv_nv` | 宋青布圆头履·女 | `assets/default/item/shoes/eq_songqingbuyuantoulv_nv.png` | 待出图 | [eq_songqingbuyuantoulv_nv.md](items/shoes/eq_songqingbuyuantoulv_nv.md) |
| items | `eq_xixiayuanlvgongxie_nv` | 西夏缘履弓鞋·女 | `assets/default/item/shoes/eq_xixiayuanlvgongxie_nv.png` | 待出图 | [eq_xixiayuanlvgongxie_nv.md](items/shoes/eq_xixiayuanlvgongxie_nv.md) |
| items | `eq_yuanchijinpiqixue_nan` | 元赤金皮骑靴·男 | `assets/default/item/shoes/eq_yuanchijinpiqixue_nan.png` | 待出图 | [eq_yuanchijinpiqixue_nan.md](items/shoes/eq_yuanchijinpiqixue_nan.md) |
| items | `eq_yuanhongzhanxue_nv` | 元红毡靴·女 | `assets/default/item/shoes/eq_yuanhongzhanxue_nv.png` | 待出图 | [eq_yuanhongzhanxue_nv.md](items/shoes/eq_yuanhongzhanxue_nv.md) |
| items | `eq_zangdihougechangxue_nan` | 藏地厚革长靴·男 | `assets/default/item/shoes/eq_zangdihougechangxue_nan.png` | 待出图 | [eq_zangdihougechangxue_nan.md](items/shoes/eq_zangdihougechangxue_nan.md) |
| items | `eq_bailagan` | 白蜡杆 | `assets/default/item/weapons/eq_bailagan.png` | 待出图 | [eq_bailagan.md](items/weapons/eq_bailagan.md) |
| items | `eq_baituoshezhang` | 白驼蛇杖 | `assets/default/item/weapons/eq_baituoshezhang.png` | 待出图 | [eq_baituoshezhang.md](items/weapons/eq_baituoshezhang.md) |
| items | `eq_bintiejiangmochu` | 镔铁降魔杵 | `assets/default/item/weapons/eq_bintiejiangmochu.png` | 待出图 | [eq_bintiejiangmochu.md](items/weapons/eq_bintiejiangmochu.md) |
| items | `eq_bishou` | 韦小宝匕首 | `assets/default/item/weapons/eq_bishou.png` | 待出图 | [eq_bishou.md](items/weapons/eq_bishou.md) |
| items | `eq_bishuijian` | 碧水剑 | `assets/default/item/weapons/eq_bishuijian.png` | 待出图 | [eq_bishuijian.md](items/weapons/eq_bishuijian.md) |
| items | `eq_changlegangdao` | 长乐帮刀 | `assets/default/item/weapons/eq_changlegangdao.png` | 待出图 | [eq_changlegangdao.md](items/weapons/eq_changlegangdao.md) |
| items | `eq_changqiang` | 素木长枪 | `assets/default/item/weapons/eq_changqiang.png` | 待出图 | [eq_changqiang.md](items/weapons/eq_changqiang.md) |
| items | `eq_changsuo` | 牛皮长索 | `assets/default/item/weapons/eq_changsuo.png` | 待出图 | [eq_changsuo.md](items/weapons/eq_changsuo.md) |
| items | `eq_daizongfajian` | 岱宗法剑 | `assets/default/item/weapons/eq_daizongfajian.png` | 待出图 | [eq_daizongfajian.md](items/weapons/eq_daizongfajian.md) |
| items | `eq_duanbingmuchui` | 短柄木锤 | `assets/default/item/weapons/eq_duanbingmuchui.png` | 待出图 | [eq_duanbingmuchui.md](items/weapons/eq_duanbingmuchui.md) |
| items | `eq_duanshihushenjian` | 段氏护身剑 | `assets/default/item/weapons/eq_duanshihushenjian.png` | 待出图 | [eq_duanshihushenjian.md](items/weapons/eq_duanshihushenjian.md) |
| items | `eq_duanyanqingzhang` | 段延庆钢杖 | `assets/default/item/weapons/eq_duanyanqingzhang.png` | 待出图 | [eq_duanyanqingzhang.md](items/weapons/eq_duanyanqingzhang.md) |
| items | `eq_dugulijian` | 独孤利剑 | `assets/default/item/weapons/eq_dugulijian.png` | 待出图 | [eq_dugulijian.md](items/weapons/eq_dugulijian.md) |
| items | `eq_dugumujian` | 独孤木剑 | `assets/default/item/weapons/eq_dugumujian.png` | 待出图 | [eq_dugumujian.md](items/weapons/eq_dugumujian.md) |
| items | `eq_emeijiejian` | 峨眉戒剑 | `assets/default/item/weapons/eq_emeijiejian.png` | 待出图 | [eq_emeijiejian.md](items/weapons/eq_emeijiejian.md) |
| items | `eq_eweibian` | 鳄尾鞭 | `assets/default/item/weapons/eq_eweibian.png` | 待出图 | [eq_eweibian.md](items/weapons/eq_eweibian.md) |
| items | `eq_ezuijian` | 鳄嘴剪 | `assets/default/item/weapons/eq_ezuijian.png` | 待出图 | [eq_ezuijian.md](items/weapons/eq_ezuijian.md) |
| items | `eq_fuchen` | 李莫愁拂尘 | `assets/default/item/weapons/eq_fuchen.png` | 待出图 | [eq_fuchen.md](items/weapons/eq_fuchen.md) |
| items | `eq_gaibangzhubang` | 丐帮竹杖 | `assets/default/item/weapons/eq_gaibangzhubang.png` | 待出图 | [eq_gaibangzhubang.md](items/weapons/eq_gaibangzhubang.md) |
| items | `eq_hebi` | 鹤嘴双笔 | `assets/default/item/weapons/eq_hebi.png` | 待出图 | [eq_hebi.md](items/weapons/eq_hebi.md) |
| items | `eq_hengshanbeijiejian` | 恒山戒剑 | `assets/default/item/weapons/eq_hengshanbeijiejian.png` | 待出图 | [eq_hengshanbeijiejian.md](items/weapons/eq_hengshanbeijiejian.md) |
| items | `eq_hetieshougou` | 何铁手毒钩 | `assets/default/item/weapons/eq_hetieshougou.png` | 待出图 | [eq_hetieshougou.md](items/weapons/eq_hetieshougou.md) |
| items | `eq_honghuahuichangjian` | 红花会长剑 | `assets/default/item/weapons/eq_honghuahuichangjian.png` | 待出图 | [eq_honghuahuichangjian.md](items/weapons/eq_honghuahuichangjian.md) |
| items | `eq_huanziqiang` | 环子枪 | `assets/default/item/weapons/eq_huanziqiang.png` | 待出图 | [eq_huanziqiang.md](items/weapons/eq_huanziqiang.md) |
| items | `eq_huoduzheshan` | 霍都折扇 | `assets/default/item/weapons/eq_huoduzheshan.png` | 待出图 | [eq_huoduzheshan.md](items/weapons/eq_huoduzheshan.md) |
| items | `eq_huoqingtongduanjian` | 霍青桐短剑 | `assets/default/item/weapons/eq_huoqingtongduanjian.png` | 待出图 | [eq_huoqingtongduanjian.md](items/weapons/eq_huoqingtongduanjian.md) |
| items | `eq_hushoushuanggou` | 护手双钩 | `assets/default/item/weapons/eq_hushoushuanggou.png` | 待出图 | [eq_hushoushuanggou.md](items/weapons/eq_hushoushuanggou.md) |
| items | `eq_jinchu` | 达尔巴金杵 | `assets/default/item/weapons/eq_jinchu.png` | 待出图 | [eq_jinchu.md](items/weapons/eq_jinchu.md) |
| items | `eq_jindao` | 成吉思汗金刀 | `assets/default/item/weapons/eq_jindao.png` | 待出图 | [eq_jindao.md](items/weapons/eq_jindao.md) |
| items | `eq_jindaoheijian` | 金刀黑剑 | `assets/default/item/weapons/eq_jindaoheijian.png` | 待出图 | [eq_jindaoheijian.md](items/weapons/eq_jindaoheijian.md) |
| items | `eq_jinlingsuo` | 金铃索 | `assets/default/item/weapons/eq_jinlingsuo.png` | 待出图 | [eq_jinlingsuo.md](items/weapons/eq_jinlingsuo.md) |
| items | `eq_jinlun` | 金轮 | `assets/default/item/weapons/eq_jinlun.png` | 待出图 | [eq_jinlun.md](items/weapons/eq_jinlun.md) |
| items | `eq_jinyinxiaojian` | 金银小剑 | `assets/default/item/weapons/eq_jinyinxiaojian.png` | 待出图 | [eq_jinyinxiaojian.md](items/weapons/eq_jinyinxiaojian.md) |
| items | `eq_kezhenezhang` | 柯镇恶铁杖 | `assets/default/item/weapons/eq_kezhenezhang.png` | 待出图 | [eq_kezhenezhang.md](items/weapons/eq_kezhenezhang.md) |
| items | `eq_kongtongshuangou` | 崆峒护山双钩 | `assets/default/item/weapons/eq_kongtongshuangou.png` | 待出图 | [eq_kongtongshuangou.md](items/weapons/eq_kongtongshuangou.md) |
| items | `eq_kunlunliangyijian` | 昆仑两仪剑 | `assets/default/item/weapons/eq_kunlunliangyijian.png` | 待出图 | [eq_kunlunliangyijian.md](items/weapons/eq_kunlunliangyijian.md) |
| items | `eq_lengyuedao` | 冷月宝刀 | `assets/default/item/weapons/eq_lengyuedao.png` | 待出图 | [eq_lengyuedao.md](items/weapons/eq_lengyuedao.md) |
| items | `eq_lihuaqiang` | 梨花枪 | `assets/default/item/weapons/eq_lihuaqiang.png` | 待出图 | [eq_lihuaqiang.md](items/weapons/eq_lihuaqiang.md) |
| items | `eq_lingxiaochangjian` | 凌霄长剑 | `assets/default/item/weapons/eq_lingxiaochangjian.png` | 待出图 | [eq_lingxiaochangjian.md](items/weapons/eq_lingxiaochangjian.md) |
| items | `eq_liuxingchui` | 流星锤 | `assets/default/item/weapons/eq_liuxingchui.png` | 待出图 | [eq_liuxingchui.md](items/weapons/eq_liuxingchui.md) |
| items | `eq_liuyedao` | 柳叶刀 | `assets/default/item/weapons/eq_liuyedao.png` | 待出图 | [eq_liuyedao.md](items/weapons/eq_liuyedao.md) |
| items | `eq_luzhang` | 鹿杖 | `assets/default/item/weapons/eq_luzhang.png` | 待出图 | [eq_luzhang.md](items/weapons/eq_luzhang.md) |
| items | `eq_lvboxiangludao` | 绿波香露刀 | `assets/default/item/weapons/eq_lvboxiangludao.png` | 待出图 | [eq_lvboxiangludao.md](items/weapons/eq_lvboxiangludao.md) |
| items | `eq_mazhadao` | 麻札刀 | `assets/default/item/weapons/eq_mazhadao.png` | 待出图 | [eq_mazhadao.md](items/weapons/eq_mazhadao.md) |
| items | `eq_mingchangqiang` | 明军长枪 | `assets/default/item/weapons/eq_mingchangqiang.png` | 待出图 | [eq_mingchangqiang.md](items/weapons/eq_mingchangqiang.md) |
| items | `eq_minggangjian` | 明钢长剑 | `assets/default/item/weapons/eq_minggangjian.png` | 待出图 | [eq_minggangjian.md](items/weapons/eq_minggangjian.md) |
| items | `eq_mingyanlingyaodao` | 明雁翎腰刀 | `assets/default/item/weapons/eq_mingyanlingyaodao.png` | 待出图 | [eq_mingyanlingyaodao.md](items/weapons/eq_mingyanlingyaodao.md) |
| items | `eq_mingyaojian` | 明制腰剑 | `assets/default/item/weapons/eq_mingyaojian.png` | 待出图 | [eq_mingyaojian.md](items/weapons/eq_mingyaojian.md) |
| items | `eq_modahuqinjian` | 莫大胡琴藏剑 | `assets/default/item/weapons/eq_modahuqinjian.png` | 待出图 | [eq_modahuqinjian.md](items/weapons/eq_modahuqinjian.md) |
| items | `eq_murongcangfengjian` | 慕容藏锋剑 | `assets/default/item/weapons/eq_murongcangfengjian.png` | 待出图 | [eq_murongcangfengjian.md](items/weapons/eq_murongcangfengjian.md) |
| items | `eq_ningbijian` | 凝碧剑 | `assets/default/item/weapons/eq_ningbijian.png` | 待出图 | [eq_ningbijian.md](items/weapons/eq_ningbijian.md) |
| items | `eq_niuweidao` | 牛尾刀 | `assets/default/item/weapons/eq_niuweidao.png` | 待出图 | [eq_niuweidao.md](items/weapons/eq_niuweidao.md) |
| items | `eq_panguanbi` | 镔铁判官笔 | `assets/default/item/weapons/eq_panguanbi.png` | 待出图 | [eq_panguanbi.md](items/weapons/eq_panguanbi.md) |
| items | `eq_podao` | 朴刀 | `assets/default/item/weapons/eq_podao.png` | 待出图 | [eq_podao.md](items/weapons/eq_podao.md) |
| items | `eq_qiankunyiqidai` | 乾坤一气袋 | `assets/default/item/weapons/eq_qiankunyiqidai.png` | 待出图 | [eq_qiankunyiqidai.md](items/weapons/eq_qiankunyiqidai.md) |
| items | `eq_qimeiyinggun` | 齐眉硬棍 | `assets/default/item/weapons/eq_qimeiyinggun.png` | 待出图 | [eq_qimeiyinggun.md](items/weapons/eq_qimeiyinggun.md) |
| items | `eq_qingchengsongfengjian` | 青城松风剑 | `assets/default/item/weapons/eq_qingchengsongfengjian.png` | 待出图 | [eq_qingchengsongfengjian.md](items/weapons/eq_qingchengsongfengjian.md) |
| items | `eq_qingtonghengdi` | 青铜横笛 | `assets/default/item/weapons/eq_qingtonghengdi.png` | 待出图 | [eq_qingtonghengdi.md](items/weapons/eq_qingtonghengdi.md) |
| items | `eq_qingzhijian` | 清制直剑 | `assets/default/item/weapons/eq_qingzhijian.png` | 待出图 | [eq_qingzhijian.md](items/weapons/eq_qingzhijian.md) |
| items | `eq_qixianqin` | 七弦琴 | `assets/default/item/weapons/eq_qixianqin.png` | 待出图 | [eq_qixianqin.md](items/weapons/eq_qixianqin.md) |
| items | `eq_quanzhenfajian` | 全真法剑 | `assets/default/item/weapons/eq_quanzhenfajian.png` | 待出图 | [eq_quanzhenfajian.md](items/weapons/eq_quanzhenfajian.md) |
| items | `eq_ruanjian` | 百炼软剑 | `assets/default/item/weapons/eq_ruanjian.png` | 待出图 | [eq_ruanjian.md](items/weapons/eq_ruanjian.md) |
| items | `eq_sangujiecha` | 三股铁叉 | `assets/default/item/weapons/eq_sangujiecha.png` | 待出图 | [eq_sangujiecha.md](items/weapons/eq_sangujiecha.md) |
| items | `eq_shaolinhusixizhang` | 少林护寺锡杖 | `assets/default/item/weapons/eq_shaolinhusixizhang.png` | 待出图 | [eq_shaolinhusixizhang.md](items/weapons/eq_shaolinhusixizhang.md) |
| items | `eq_shenghuoling` | 圣火令 | `assets/default/item/weapons/eq_shenghuoling.png` | 待出图 | [eq_shenghuoling.md](items/weapons/eq_shenghuoling.md) |
| items | `eq_shenquantiehutao` | 神拳铁护套 | `assets/default/item/weapons/eq_shenquantiehutao.png` | 待出图 | [eq_shenquantiehutao.md](items/weapons/eq_shenquantiehutao.md) |
| items | `eq_songbuqiang` | 宋步枪 | `assets/default/item/weapons/eq_songbuqiang.png` | 待出图 | [eq_songbuqiang.md](items/weapons/eq_songbuqiang.md) |
| items | `eq_songduanfu` | 宋式短斧 | `assets/default/item/weapons/eq_songduanfu.png` | 待出图 | [eq_songduanfu.md](items/weapons/eq_songduanfu.md) |
| items | `eq_songshaobang` | 宋式哨棒 | `assets/default/item/weapons/eq_songshaobang.png` | 待出图 | [eq_songshaobang.md](items/weapons/eq_songshaobang.md) |
| items | `eq_songshoudao` | 宋手刀 | `assets/default/item/weapons/eq_songshoudao.png` | 待出图 | [eq_songshoudao.md](items/weapons/eq_songshoudao.md) |
| items | `eq_songwenguijian` | 松纹古剑 | `assets/default/item/weapons/eq_songwenguijian.png` | 待出图 | [eq_songwenguijian.md](items/weapons/eq_songwenguijian.md) |
| items | `eq_songyangkuojian` | 嵩阳阔剑 | `assets/default/item/weapons/eq_songyangkuojian.png` | 待出图 | [eq_songyangkuojian.md](items/weapons/eq_songyangkuojian.md) |
| items | `eq_songzhijian` | 宋制直剑 | `assets/default/item/weapons/eq_songzhijian.png` | 待出图 | [eq_songzhijian.md](items/weapons/eq_songzhijian.md) |
| items | `eq_sutieduanbi` | 素铁短匕 | `assets/default/item/weapons/eq_sutieduanbi.png` | 待出图 | [eq_sutieduanbi.md](items/weapons/eq_sutieduanbi.md) |
| items | `eq_tiandihuiduandao` | 天地会短刀 | `assets/default/item/weapons/eq_tiandihuiduandao.png` | 待出图 | [eq_tiandihuiduandao.md](items/weapons/eq_tiandihuiduandao.md) |
| items | `eq_tianlongsijiedao` | 天龙寺戒刀 | `assets/default/item/weapons/eq_tianlongsijiedao.png` | 待出图 | [eq_tianlongsijiedao.md](items/weapons/eq_tianlongsijiedao.md) |
| items | `eq_tieguai` | 铁拐 | `assets/default/item/weapons/eq_tieguai.png` | 待出图 | [eq_tieguai.md](items/weapons/eq_tieguai.md) |
| items | `eq_tieguzhanqi` | 铁骨战旗 | `assets/default/item/weapons/eq_tieguzhanqi.png` | 待出图 | [eq_tieguzhanqi.md](items/weapons/eq_tieguzhanqi.md) |
| items | `eq_tiehuanchanzhang` | 铁环禅杖 | `assets/default/item/weapons/eq_tiehuanchanzhang.png` | 待出图 | [eq_tiehuanchanzhang.md](items/weapons/eq_tiehuanchanzhang.md) |
| items | `eq_tiezhangkaishanfu` | 铁掌开山斧 | `assets/default/item/weapons/eq_tiezhangkaishanfu.png` | 待出图 | [eq_tiezhangkaishanfu.md](items/weapons/eq_tiezhangkaishanfu.md) |
| items | `eq_tubiwengbi` | 秃笔翁之笔 | `assets/default/item/weapons/eq_tubiwengbi.png` | 待出图 | [eq_tubiwengbi.md](items/weapons/eq_tubiwengbi.md) |
| items | `eq_wandao` | 元蒙骑刀 | `assets/default/item/weapons/eq_wandao.png` | 待出图 | [eq_wandao.md](items/weapons/eq_wandao.md) |
| items | `eq_xiaoyaoyubingfuchen` | 逍遥玉柄拂尘 | `assets/default/item/weapons/eq_xiaoyaoyubingfuchen.png` | 待出图 | [eq_xiaoyaoyubingfuchen.md](items/weapons/eq_xiaoyaoyubingfuchen.md) |
| items | `eq_xiuhuazhen` | 绣花针 | `assets/default/item/weapons/eq_xiuhuazhen.png` | 待出图 | [eq_xiuhuazhen.md](items/weapons/eq_xiuhuazhen.md) |
| items | `eq_xuansushuangjian` | 玄素双剑 | `assets/default/item/weapons/eq_xuansushuangjian.png` | 待出图 | [eq_xuansushuangjian.md](items/weapons/eq_xuansushuangjian.md) |
| items | `eq_yingoutiehua` | 银钩铁划 | `assets/default/item/weapons/eq_yingoutiehua.png` | 待出图 | [eq_yingoutiehua.md](items/weapons/eq_yingoutiehua.md) |
| items | `eq_yuanmengmabang` | 元蒙马棒 | `assets/default/item/weapons/eq_yuanmengmabang.png` | 待出图 | [eq_yuanmengmabang.md](items/weapons/eq_yuanmengmabang.md) |
| items | `eq_yuanmengqiqiang` | 元蒙骑枪 | `assets/default/item/weapons/eq_yuanmengqiqiang.png` | 待出图 | [eq_yuanmengqiqiang.md](items/weapons/eq_yuanmengqiqiang.md) |
| items | `eq_yuanyangdao` | 鸳鸯刀 | `assets/default/item/weapons/eq_yuanyangdao.png` | 待出图 | [eq_yuanyangdao.md](items/weapons/eq_yuanyangdao.md) |
| items | `eq_yuxiao` | 玉箫 | `assets/default/item/weapons/eq_yuxiao.png` | 待出图 | [eq_yuxiao.md](items/weapons/eq_yuxiao.md) |
| items | `eq_yuyincha` | 渔隐叉 | `assets/default/item/weapons/eq_yuyincha.png` | 待出图 | [eq_yuyincha.md](items/weapons/eq_yuyincha.md) |
| items | `eq_zhenwujian` | 真武剑 | `assets/default/item/weapons/eq_zhenwujian.png` | 待出图 | [eq_zhenwujian.md](items/weapons/eq_zhenwujian.md) |
| items | `eq_zhugutieshan` | 竹骨铁扇 | `assets/default/item/weapons/eq_zhugutieshan.png` | 待出图 | [eq_zhugutieshan.md](items/weapons/eq_zhugutieshan.md) |
| items | `eq_ziweiruanjian` | 紫薇软剑 | `assets/default/item/weapons/eq_ziweiruanjian.png` | 待出图 | [eq_ziweiruanjian.md](items/weapons/eq_ziweiruanjian.md) |
| maps | `map_jianghu_world__ink_base` | 江湖万里图 · 水墨衬纸（全国底图） | `assets/default/map/jianghu_world/ink_base.png` | 待出图 | [jianghu_world_ink_base.md](maps/jianghu_world_ink_base.md) |
| maps | `map_region_bashu__base` | 巴蜀区域局部图 | `assets/default/map/regions/rg_bashu.png` | 待出图 | [rg_bashu.md](maps/region/rg_bashu.md) |
| maps | `map_region_dali_cangshan__base` | 大理苍山区域局部图 | `assets/default/map/regions/rg_dali_cangshan.png` | 待出图 | [rg_dali_cangshan.md](maps/region/rg_dali_cangshan.md) |
| maps | `map_region_dongbei__base` | 东北边地区域局部图 | `assets/default/map/regions/rg_dongbei.png` | 待出图 | [rg_dongbei.md](maps/region/rg_dongbei.md) |
| maps | `map_region_donghai_islands__base` | 东海诸岛区域局部图 | `assets/default/map/regions/rg_donghai_islands.png` | 待出图 | [rg_donghai_islands.md](maps/region/rg_donghai_islands.md) |
| maps | `map_region_fujian__base` | 闽地区域局部图 | `assets/default/map/regions/rg_fujian.png` | 待出图 | [rg_fujian.md](maps/region/rg_fujian.md) |
| maps | `map_region_guangxi__base` | 桂西桂北区域局部图 | `assets/default/map/regions/rg_guangxi.png` | 待出图 | [rg_guangxi.md](maps/region/rg_guangxi.md) |
| maps | `map_region_guanzhong__base` | 关中陕北区域局部图 | `assets/default/map/regions/rg_guanzhong.png` | 待出图 | [rg_guanzhong.md](maps/region/rg_guanzhong.md) |
| maps | `map_region_hedong_jinzhong__base` | 河东与晋中区域局部图 | `assets/default/map/regions/rg_hedong_jinzhong.png` | 待出图 | [rg_hedong_jinzhong.md](maps/region/rg_hedong_jinzhong.md) |
| maps | `map_region_hexilongyou__base` | 河西与陇右区域局部图 | `assets/default/map/regions/rg_hexilongyou.png` | 待出图 | [rg_hexilongyou.md](maps/region/rg_hexilongyou.md) |
| maps | `map_region_huxiang__base` | 湖湘区域局部图 | `assets/default/map/regions/rg_huxiang.png` | 待出图 | [rg_huxiang.md](maps/region/rg_huxiang.md) |
| maps | `map_region_jianghuai__base` | 江淮区域局部图 | `assets/default/map/regions/rg_jianghuai.png` | 待出图 | [rg_jianghuai.md](maps/region/rg_jianghuai.md) |
| maps | `map_region_jiangnan_taihu__base` | 太湖江南区域局部图 | `assets/default/map/regions/rg_jiangnan_taihu.png` | 待出图 | [rg_jiangnan_taihu.md](maps/region/rg_jiangnan_taihu.md) |
| maps | `map_region_jiangxi__base` | 江西区域局部图 | `assets/default/map/regions/rg_jiangxi.png` | 待出图 | [rg_jiangxi.md](maps/region/rg_jiangxi.md) |
| maps | `map_region_jingxiang__base` | 荆襄区域局部图 | `assets/default/map/regions/rg_jingxiang.png` | 待出图 | [rg_jingxiang.md](maps/region/rg_jingxiang.md) |
| maps | `map_region_liaodong__base` | 辽东区域局部图 | `assets/default/map/regions/rg_liaodong.png` | 待出图 | [rg_liaodong.md](maps/region/rg_liaodong.md) |
| maps | `map_region_liaoxi__base` | 辽西走廊区域局部图 | `assets/default/map/regions/rg_liaoxi.png` | 待出图 | [rg_liaoxi.md](maps/region/rg_liaoxi.md) |
| maps | `map_region_lingnan__base` | 岭南南海岸区域局部图 | `assets/default/map/regions/rg_lingnan.png` | 待出图 | [rg_lingnan.md](maps/region/rg_lingnan.md) |
| maps | `map_region_mobei__base` | 漠北区域局部图 | `assets/default/map/regions/rg_mobei.png` | 待出图 | [rg_mobei.md](maps/region/rg_mobei.md) |
| maps | `map_region_monan__base` | 漠南区域局部图 | `assets/default/map/regions/rg_monan.png` | 待出图 | [rg_monan.md](maps/region/rg_monan.md) |
| maps | `map_region_nanhai_islands__base` | 南海诸岛区域局部图 | `assets/default/map/regions/rg_nanhai_islands.png` | 待出图 | [rg_nanhai_islands.md](maps/region/rg_nanhai_islands.md) |
| maps | `map_region_qilu__base` | 齐鲁区域局部图 | `assets/default/map/regions/rg_qilu.png` | 待出图 | [rg_qilu.md](maps/region/rg_qilu.md) |
| maps | `map_region_qinba__base` | 秦巴汉水区域局部图 | `assets/default/map/regions/rg_qinba.png` | 待出图 | [rg_qinba.md](maps/region/rg_qinba.md) |
| maps | `map_region_qingzang__base` | 青藏区域局部图 | `assets/default/map/regions/rg_qingzang.png` | 待出图 | [rg_qingzang.md](maps/region/rg_qingzang.md) |
| maps | `map_region_xixia_helan__base` | 西夏贺兰区域局部图 | `assets/default/map/regions/rg_xixia_helan.png` | 待出图 | [rg_xixia_helan.md](maps/region/rg_xixia_helan.md) |
| maps | `map_region_xiyu_beijiang__base` | 西域北疆区域局部图 | `assets/default/map/regions/rg_xiyu_beijiang.png` | 待出图 | [rg_xiyu_beijiang.md](maps/region/rg_xiyu_beijiang.md) |
| maps | `map_region_xiyu_nanjiang__base` | 西域南疆区域局部图 | `assets/default/map/regions/rg_xiyu_nanjiang.png` | 待出图 | [rg_xiyu_nanjiang.md](maps/region/rg_xiyu_nanjiang.md) |
| maps | `map_region_yanjing_zhili__base` | 燕京与直隶区域局部图 | `assets/default/map/regions/rg_yanjing_zhili.png` | 待出图 | [rg_yanjing_zhili.md](maps/region/rg_yanjing_zhili.md) |
| maps | `map_region_yundian_qianzhong__base` | 云滇黔中区域局部图 | `assets/default/map/regions/rg_yundian_qianzhong.png` | 待出图 | [rg_yundian_qianzhong.md](maps/region/rg_yundian_qianzhong.md) |
| maps | `map_region_zhedong__base` | 浙东沿海区域局部图 | `assets/default/map/regions/rg_zhedong.png` | 待出图 | [rg_zhedong.md](maps/region/rg_zhedong.md) |
| maps | `map_region_zhongyuan__base` | 中原区域局部图 | `assets/default/map/regions/rg_zhongyuan.png` | 待出图 | [rg_zhongyuan.md](maps/region/rg_zhongyuan.md) |
| rig | `rig_female_std__back34__foot_shared` | 女性标准体 · back34 · 脚 / 鞋（左右共享源） | `assets/default/rig/female_std/back34/foot_shared.png` | 待出图 | [foot_shared.md](rig/female_std/back34/foot_shared.md) |
| rig | `rig_female_std__back34__forearm_L` | 女性标准体 · back34 · 左前臂 | `assets/default/rig/female_std/back34/forearm_L.png` | 待出图 | [forearm_L.md](rig/female_std/back34/forearm_L.md) |
| rig | `rig_female_std__back34__forearm_R` | 女性标准体 · back34 · 右前臂 | `assets/default/rig/female_std/back34/forearm_R.png` | 待出图 | [forearm_R.md](rig/female_std/back34/forearm_R.md) |
| rig | `rig_female_std__back34__hair_or_headgear` | 女性标准体 · back34 · 发式 / 头饰层 | `assets/default/rig/female_std/back34/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/female_std/back34/hair_or_headgear.md) |
| rig | `rig_female_std__back34__hand_L` | 女性标准体 · back34 · 左手 | `assets/default/rig/female_std/back34/hand_L.png` | 待出图 | [hand_L.md](rig/female_std/back34/hand_L.md) |
| rig | `rig_female_std__back34__hand_R` | 女性标准体 · back34 · 右手 | `assets/default/rig/female_std/back34/hand_R.png` | 待出图 | [hand_R.md](rig/female_std/back34/hand_R.md) |
| rig | `rig_female_std__back34__head` | 女性标准体 · back34 · 头（颈至头顶） | `assets/default/rig/female_std/back34/head.png` | 待出图 | [head.md](rig/female_std/back34/head.md) |
| rig | `rig_female_std__back34__pelvis_skirt` | 女性标准体 · back34 · 骨盆 / 下裳 | `assets/default/rig/female_std/back34/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/female_std/back34/pelvis_skirt.md) |
| rig | `rig_female_std__back34__shin_shared` | 女性标准体 · back34 · 小腿（左右共享源） | `assets/default/rig/female_std/back34/shin_shared.png` | 待出图 | [shin_shared.md](rig/female_std/back34/shin_shared.md) |
| rig | `rig_female_std__back34__thigh_shared` | 女性标准体 · back34 · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/female_std/back34/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/female_std/back34/thigh_shared.md) |
| rig | `rig_female_std__back34__torso` | 女性标准体 · back34 · 躯干（骨盆点至颈点） | `assets/default/rig/female_std/back34/torso.png` | 待出图 | [torso.md](rig/female_std/back34/torso.md) |
| rig | `rig_female_std__back34__upper_arm_L` | 女性标准体 · back34 · 左上臂 | `assets/default/rig/female_std/back34/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/female_std/back34/upper_arm_L.md) |
| rig | `rig_female_std__back34__upper_arm_R` | 女性标准体 · back34 · 右上臂 | `assets/default/rig/female_std/back34/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/female_std/back34/upper_arm_R.md) |
| rig | `rig_female_std__front34__foot_shared` | 女性标准体 · front34 · 脚 / 鞋（左右共享源） | `assets/default/rig/female_std/front34/foot_shared.png` | 待出图 | [foot_shared.md](rig/female_std/front34/foot_shared.md) |
| rig | `rig_female_std__front34__forearm_L` | 女性标准体 · front34 · 左前臂 | `assets/default/rig/female_std/front34/forearm_L.png` | 待出图 | [forearm_L.md](rig/female_std/front34/forearm_L.md) |
| rig | `rig_female_std__front34__forearm_R` | 女性标准体 · front34 · 右前臂 | `assets/default/rig/female_std/front34/forearm_R.png` | 待出图 | [forearm_R.md](rig/female_std/front34/forearm_R.md) |
| rig | `rig_female_std__front34__hair_or_headgear` | 女性标准体 · front34 · 发式 / 头饰层 | `assets/default/rig/female_std/front34/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/female_std/front34/hair_or_headgear.md) |
| rig | `rig_female_std__front34__hand_L` | 女性标准体 · front34 · 左手 | `assets/default/rig/female_std/front34/hand_L.png` | 待出图 | [hand_L.md](rig/female_std/front34/hand_L.md) |
| rig | `rig_female_std__front34__hand_R` | 女性标准体 · front34 · 右手 | `assets/default/rig/female_std/front34/hand_R.png` | 待出图 | [hand_R.md](rig/female_std/front34/hand_R.md) |
| rig | `rig_female_std__front34__head` | 女性标准体 · front34 · 头（颈至头顶） | `assets/default/rig/female_std/front34/head.png` | 待出图 | [head.md](rig/female_std/front34/head.md) |
| rig | `rig_female_std__front34__pelvis_skirt` | 女性标准体 · front34 · 骨盆 / 下裳 | `assets/default/rig/female_std/front34/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/female_std/front34/pelvis_skirt.md) |
| rig | `rig_female_std__front34__shin_shared` | 女性标准体 · front34 · 小腿（左右共享源） | `assets/default/rig/female_std/front34/shin_shared.png` | 待出图 | [shin_shared.md](rig/female_std/front34/shin_shared.md) |
| rig | `rig_female_std__front34__thigh_shared` | 女性标准体 · front34 · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/female_std/front34/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/female_std/front34/thigh_shared.md) |
| rig | `rig_female_std__front34__torso` | 女性标准体 · front34 · 躯干（骨盆点至颈点） | `assets/default/rig/female_std/front34/torso.png` | 待出图 | [torso.md](rig/female_std/front34/torso.md) |
| rig | `rig_female_std__front34__upper_arm_L` | 女性标准体 · front34 · 左上臂 | `assets/default/rig/female_std/front34/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/female_std/front34/upper_arm_L.md) |
| rig | `rig_female_std__front34__upper_arm_R` | 女性标准体 · front34 · 右上臂 | `assets/default/rig/female_std/front34/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/female_std/front34/upper_arm_R.md) |
| rig | `rig_female_std__ref_back34` | 女性标准体 · back34 全身参考图 | `assets/default/rig/female_std/ref_back34.png` | 待出图 | [ref_back34.md](rig/female_std/ref_back34.md) |
| rig | `rig_female_std__ref_front34` | 女性标准体 · front34 全身参考图 | `assets/default/rig/female_std/ref_front34.png` | 待出图 | [ref_front34.md](rig/female_std/ref_front34.md) |
| rig | `rig_female_std__ref_side` | 女性标准体 · side 全身参考图 | `assets/default/rig/female_std/ref_side.png` | 待出图 | [ref_side.md](rig/female_std/ref_side.md) |
| rig | `rig_female_std__side__foot_shared` | 女性标准体 · side · 脚 / 鞋（左右共享源） | `assets/default/rig/female_std/side/foot_shared.png` | 待出图 | [foot_shared.md](rig/female_std/side/foot_shared.md) |
| rig | `rig_female_std__side__forearm_L` | 女性标准体 · side · 左前臂 | `assets/default/rig/female_std/side/forearm_L.png` | 待出图 | [forearm_L.md](rig/female_std/side/forearm_L.md) |
| rig | `rig_female_std__side__forearm_R` | 女性标准体 · side · 右前臂 | `assets/default/rig/female_std/side/forearm_R.png` | 待出图 | [forearm_R.md](rig/female_std/side/forearm_R.md) |
| rig | `rig_female_std__side__hair_or_headgear` | 女性标准体 · side · 发式 / 头饰层 | `assets/default/rig/female_std/side/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/female_std/side/hair_or_headgear.md) |
| rig | `rig_female_std__side__hand_L` | 女性标准体 · side · 左手 | `assets/default/rig/female_std/side/hand_L.png` | 待出图 | [hand_L.md](rig/female_std/side/hand_L.md) |
| rig | `rig_female_std__side__hand_R` | 女性标准体 · side · 右手 | `assets/default/rig/female_std/side/hand_R.png` | 待出图 | [hand_R.md](rig/female_std/side/hand_R.md) |
| rig | `rig_female_std__side__head` | 女性标准体 · side · 头（颈至头顶） | `assets/default/rig/female_std/side/head.png` | 待出图 | [head.md](rig/female_std/side/head.md) |
| rig | `rig_female_std__side__pelvis_skirt` | 女性标准体 · side · 骨盆 / 下裳 | `assets/default/rig/female_std/side/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/female_std/side/pelvis_skirt.md) |
| rig | `rig_female_std__side__shin_shared` | 女性标准体 · side · 小腿（左右共享源） | `assets/default/rig/female_std/side/shin_shared.png` | 待出图 | [shin_shared.md](rig/female_std/side/shin_shared.md) |
| rig | `rig_female_std__side__thigh_shared` | 女性标准体 · side · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/female_std/side/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/female_std/side/thigh_shared.md) |
| rig | `rig_female_std__side__torso` | 女性标准体 · side · 躯干（骨盆点至颈点） | `assets/default/rig/female_std/side/torso.png` | 待出图 | [torso.md](rig/female_std/side/torso.md) |
| rig | `rig_female_std__side__upper_arm_L` | 女性标准体 · side · 左上臂 | `assets/default/rig/female_std/side/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/female_std/side/upper_arm_L.md) |
| rig | `rig_female_std__side__upper_arm_R` | 女性标准体 · side · 右上臂 | `assets/default/rig/female_std/side/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/female_std/side/upper_arm_R.md) |
| rig | `rig_male_std__back34__foot_shared` | 男性标准体 · back34 · 脚 / 鞋（左右共享源） | `assets/default/rig/male_std/back34/foot_shared.png` | 待出图 | [foot_shared.md](rig/male_std/back34/foot_shared.md) |
| rig | `rig_male_std__back34__forearm_L` | 男性标准体 · back34 · 左前臂 | `assets/default/rig/male_std/back34/forearm_L.png` | 待出图 | [forearm_L.md](rig/male_std/back34/forearm_L.md) |
| rig | `rig_male_std__back34__forearm_R` | 男性标准体 · back34 · 右前臂 | `assets/default/rig/male_std/back34/forearm_R.png` | 待出图 | [forearm_R.md](rig/male_std/back34/forearm_R.md) |
| rig | `rig_male_std__back34__hair_or_headgear` | 男性标准体 · back34 · 发式 / 头饰层 | `assets/default/rig/male_std/back34/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/male_std/back34/hair_or_headgear.md) |
| rig | `rig_male_std__back34__hand_L` | 男性标准体 · back34 · 左手 | `assets/default/rig/male_std/back34/hand_L.png` | 待出图 | [hand_L.md](rig/male_std/back34/hand_L.md) |
| rig | `rig_male_std__back34__hand_R` | 男性标准体 · back34 · 右手 | `assets/default/rig/male_std/back34/hand_R.png` | 待出图 | [hand_R.md](rig/male_std/back34/hand_R.md) |
| rig | `rig_male_std__back34__head` | 男性标准体 · back34 · 头（颈至头顶） | `assets/default/rig/male_std/back34/head.png` | 待出图 | [head.md](rig/male_std/back34/head.md) |
| rig | `rig_male_std__back34__pelvis_skirt` | 男性标准体 · back34 · 骨盆 / 下裳 | `assets/default/rig/male_std/back34/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/male_std/back34/pelvis_skirt.md) |
| rig | `rig_male_std__back34__shin_shared` | 男性标准体 · back34 · 小腿（左右共享源） | `assets/default/rig/male_std/back34/shin_shared.png` | 待出图 | [shin_shared.md](rig/male_std/back34/shin_shared.md) |
| rig | `rig_male_std__back34__thigh_shared` | 男性标准体 · back34 · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/male_std/back34/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/male_std/back34/thigh_shared.md) |
| rig | `rig_male_std__back34__torso` | 男性标准体 · back34 · 躯干（骨盆点至颈点） | `assets/default/rig/male_std/back34/torso.png` | 待出图 | [torso.md](rig/male_std/back34/torso.md) |
| rig | `rig_male_std__back34__upper_arm_L` | 男性标准体 · back34 · 左上臂 | `assets/default/rig/male_std/back34/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/male_std/back34/upper_arm_L.md) |
| rig | `rig_male_std__back34__upper_arm_R` | 男性标准体 · back34 · 右上臂 | `assets/default/rig/male_std/back34/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/male_std/back34/upper_arm_R.md) |
| rig | `rig_male_std__front34__foot_shared` | 男性标准体 · front34 · 脚 / 鞋（左右共享源） | `assets/default/rig/male_std/front34/foot_shared.png` | 待出图 | [foot_shared.md](rig/male_std/front34/foot_shared.md) |
| rig | `rig_male_std__front34__forearm_L` | 男性标准体 · front34 · 左前臂 | `assets/default/rig/male_std/front34/forearm_L.png` | 待出图 | [forearm_L.md](rig/male_std/front34/forearm_L.md) |
| rig | `rig_male_std__front34__forearm_R` | 男性标准体 · front34 · 右前臂 | `assets/default/rig/male_std/front34/forearm_R.png` | 待出图 | [forearm_R.md](rig/male_std/front34/forearm_R.md) |
| rig | `rig_male_std__front34__hair_or_headgear` | 男性标准体 · front34 · 发式 / 头饰层 | `assets/default/rig/male_std/front34/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/male_std/front34/hair_or_headgear.md) |
| rig | `rig_male_std__front34__hand_L` | 男性标准体 · front34 · 左手 | `assets/default/rig/male_std/front34/hand_L.png` | 待出图 | [hand_L.md](rig/male_std/front34/hand_L.md) |
| rig | `rig_male_std__front34__hand_R` | 男性标准体 · front34 · 右手 | `assets/default/rig/male_std/front34/hand_R.png` | 待出图 | [hand_R.md](rig/male_std/front34/hand_R.md) |
| rig | `rig_male_std__front34__head` | 男性标准体 · front34 · 头（颈至头顶） | `assets/default/rig/male_std/front34/head.png` | 待出图 | [head.md](rig/male_std/front34/head.md) |
| rig | `rig_male_std__front34__pelvis_skirt` | 男性标准体 · front34 · 骨盆 / 下裳 | `assets/default/rig/male_std/front34/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/male_std/front34/pelvis_skirt.md) |
| rig | `rig_male_std__front34__shin_shared` | 男性标准体 · front34 · 小腿（左右共享源） | `assets/default/rig/male_std/front34/shin_shared.png` | 待出图 | [shin_shared.md](rig/male_std/front34/shin_shared.md) |
| rig | `rig_male_std__front34__thigh_shared` | 男性标准体 · front34 · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/male_std/front34/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/male_std/front34/thigh_shared.md) |
| rig | `rig_male_std__front34__torso` | 男性标准体 · front34 · 躯干（骨盆点至颈点） | `assets/default/rig/male_std/front34/torso.png` | 待出图 | [torso.md](rig/male_std/front34/torso.md) |
| rig | `rig_male_std__front34__upper_arm_L` | 男性标准体 · front34 · 左上臂 | `assets/default/rig/male_std/front34/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/male_std/front34/upper_arm_L.md) |
| rig | `rig_male_std__front34__upper_arm_R` | 男性标准体 · front34 · 右上臂 | `assets/default/rig/male_std/front34/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/male_std/front34/upper_arm_R.md) |
| rig | `rig_male_std__ref_back34` | 男性标准体 · back34 全身参考图 | `assets/default/rig/male_std/ref_back34.png` | 待出图 | [ref_back34.md](rig/male_std/ref_back34.md) |
| rig | `rig_male_std__ref_front34` | 男性标准体 · front34 全身参考图 | `assets/default/rig/male_std/ref_front34.png` | 待出图 | [ref_front34.md](rig/male_std/ref_front34.md) |
| rig | `rig_male_std__ref_side` | 男性标准体 · side 全身参考图 | `assets/default/rig/male_std/ref_side.png` | 待出图 | [ref_side.md](rig/male_std/ref_side.md) |
| rig | `rig_male_std__side__foot_shared` | 男性标准体 · side · 脚 / 鞋（左右共享源） | `assets/default/rig/male_std/side/foot_shared.png` | 待出图 | [foot_shared.md](rig/male_std/side/foot_shared.md) |
| rig | `rig_male_std__side__forearm_L` | 男性标准体 · side · 左前臂 | `assets/default/rig/male_std/side/forearm_L.png` | 待出图 | [forearm_L.md](rig/male_std/side/forearm_L.md) |
| rig | `rig_male_std__side__forearm_R` | 男性标准体 · side · 右前臂 | `assets/default/rig/male_std/side/forearm_R.png` | 待出图 | [forearm_R.md](rig/male_std/side/forearm_R.md) |
| rig | `rig_male_std__side__hair_or_headgear` | 男性标准体 · side · 发式 / 头饰层 | `assets/default/rig/male_std/side/hair_or_headgear.png` | 待出图 | [hair_or_headgear.md](rig/male_std/side/hair_or_headgear.md) |
| rig | `rig_male_std__side__hand_L` | 男性标准体 · side · 左手 | `assets/default/rig/male_std/side/hand_L.png` | 待出图 | [hand_L.md](rig/male_std/side/hand_L.md) |
| rig | `rig_male_std__side__hand_R` | 男性标准体 · side · 右手 | `assets/default/rig/male_std/side/hand_R.png` | 待出图 | [hand_R.md](rig/male_std/side/hand_R.md) |
| rig | `rig_male_std__side__head` | 男性标准体 · side · 头（颈至头顶） | `assets/default/rig/male_std/side/head.png` | 待出图 | [head.md](rig/male_std/side/head.md) |
| rig | `rig_male_std__side__pelvis_skirt` | 男性标准体 · side · 骨盆 / 下裳 | `assets/default/rig/male_std/side/pelvis_skirt.png` | 待出图 | [pelvis_skirt.md](rig/male_std/side/pelvis_skirt.md) |
| rig | `rig_male_std__side__shin_shared` | 男性标准体 · side · 小腿（左右共享源） | `assets/default/rig/male_std/side/shin_shared.png` | 待出图 | [shin_shared.md](rig/male_std/side/shin_shared.md) |
| rig | `rig_male_std__side__thigh_shared` | 男性标准体 · side · 大腿（左右共享源，右侧运行时镜像） | `assets/default/rig/male_std/side/thigh_shared.png` | 待出图 | [thigh_shared.md](rig/male_std/side/thigh_shared.md) |
| rig | `rig_male_std__side__torso` | 男性标准体 · side · 躯干（骨盆点至颈点） | `assets/default/rig/male_std/side/torso.png` | 待出图 | [torso.md](rig/male_std/side/torso.md) |
| rig | `rig_male_std__side__upper_arm_L` | 男性标准体 · side · 左上臂 | `assets/default/rig/male_std/side/upper_arm_L.png` | 待出图 | [upper_arm_L.md](rig/male_std/side/upper_arm_L.md) |
| rig | `rig_male_std__side__upper_arm_R` | 男性标准体 · side · 右上臂 | `assets/default/rig/male_std/side/upper_arm_R.png` | 待出图 | [upper_arm_R.md](rig/male_std/side/upper_arm_R.md) |

## 物品（11 类，名录 170 项）

每张图的提示词在各文件「提示词」节。「已入库」= 图在 `assets/default/item/` 下（作者尚未审批，manifest `status: candidate`）；「工作区候选」= 图在任务工作区还没合入；作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可进队列。

### 药物 / 补品 / 药材（32）· 已通过（作者） 32

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 九转还魂丹 | `it_jiuzhuanhuanhundan` | 天 | 药物·复活 | 已通过（作者） | [it_jiuzhuanhuanhundan.md](items/medicine/it_jiuzhuanhuanhundan.md) | manifest |
| 2 | 千年灵芝 | `it_qiannianlingzhi` | 天 | 药材·灵芝 | 已通过（作者） | [it_qiannianlingzhi.md](items/medicine/it_qiannianlingzhi.md) | manifest |
| 3 | 千年人参 | `it_qiannianrenshen` | 天 | 药材·人参 | 已通过（作者） | [it_qiannianrenshen.md](items/medicine/it_qiannianrenshen.md) | manifest |
| 4 | 千年雪莲 | `it_qiannianxuelian` | 天 | 药材·雪莲 | 已通过（作者） | [it_qiannianxuelian.md](items/medicine/it_qiannianxuelian.md) | manifest |
| 5 | 千年雪参 | `it_qiannianxueshen` | 天 | 药材·雪参 | 已通过（作者） | [it_qiannianxueshen.md](items/medicine/it_qiannianxueshen.md) | manifest |
| 6 | 生生造化丹 | `it_shengshengzaohuadan` | 天 | 补品·永久属性 | 已通过（作者） | [it_shengshengzaohuadan.md](items/medicine/it_shengshengzaohuadan.md) | manifest |
| 7 | 天髓续命露 | `it_tiansuixuminglu` | 天 | 补品·经脉疗伤 | 已通过（作者） | [it_tiansuixuminglu.md](items/medicine/it_tiansuixuminglu.md) | manifest |
| 8 | 雪参玉蟾丸 | `it_xueshenyuchanwan` | 天 | 补品·内力经脉 | 已通过（作者） | [it_xueshenyuchanwan.md](items/medicine/it_xueshenyuchanwan.md) | manifest |
| 9 | 玉龙苏合散 | `it_yulongsuheisan` | 天 | 药物·救急 | 已通过（作者） | [it_yulongsuheisan.md](items/medicine/it_yulongsuheisan.md) | manifest |
| 10 | 百年人参 | `it_bainianrenshen` | 地 | 药材·人参 | 已通过（作者） | [it_bainianrenshen.md](items/medicine/it_bainianrenshen.md) | manifest |
| 11 | 百年雪参 | `it_bainianxueshen` | 地 | 药材·雪参 | 已通过（作者） | [it_bainianxueshen.md](items/medicine/it_bainianxueshen.md) | manifest |
| 12 | 豹胎易筋丸 | `it_baotaiyijinwan` | 地 | 药物·控制 | 已通过（作者） | [it_baotaiyijinwan.md](items/medicine/it_baotaiyijinwan.md) | manifest |
| 13 | 碧灵丹 | `it_bilingdan` | 地 | 药物·疗伤解毒 | 已通过（作者） | [it_bilingdan.md](items/medicine/it_bilingdan.md) | manifest |
| 14 | 断肠草 | `it_duanchangcao` | 地 | 药材·毒草 | 已通过（作者） | [it_duanchangcao.md](items/medicine/it_duanchangcao.md) | manifest |
| 15 | 黑玉断续膏 | `it_heiyuduanxugao` | 地 | 药物·接骨外敷 | 已通过（作者） | [it_heiyuduanxugao.md](items/medicine/it_heiyuduanxugao.md) | manifest |
| 16 | 九花玉露丸 | `it_jiuhuayulu` | 地 | 药物·补血疗伤 | 已通过（作者） | [it_jiuhuayulu.md](items/medicine/it_jiuhuayulu.md) | manifest |
| 17 | 天山雪莲 | `it_tianshanxuelian` | 地 | 药材·雪莲 | 已通过（作者） | [it_tianshanxuelian.md](items/medicine/it_tianshanxuelian.md) | manifest |
| 18 | 天香断续胶 | `it_tianxiangduanxujiao` | 地 | 药物·接骨外敷 | 已通过（作者） | [it_tianxiangduanxujiao.md](items/medicine/it_tianxiangduanxujiao.md) | manifest |
| 19 | 天一神水 | `it_tianyishenshui` | 地 | 药物·奇毒 | 已通过（作者） | [it_tianyishenshui.md](items/medicine/it_tianyishenshui.md) | manifest |
| 20 | 通犀地龙丸 | `it_tongxidilongwan` | 地 | 补品·抗毒 | 已通过（作者） | [it_tongxidilongwan.md](items/medicine/it_tongxidilongwan.md) | manifest |
| 21 | 茯苓首乌丸 | `it_fulingshouwuwan` | 玄 | 药物·补气疗伤 | 已通过（作者） | [it_fulingshouwuwan.md](items/medicine/it_fulingshouwuwan.md) | manifest |
| 22 | 十年人参 | `it_shinianrenshen` | 玄 | 药材·人参 | 已通过（作者） | [it_shinianrenshen.md](items/medicine/it_shinianrenshen.md) | manifest |
| 23 | 十年雪参 | `it_shinianxueshen` | 玄 | 药材·雪参 | 已通过（作者） | [it_shinianxueshen.md](items/medicine/it_shinianxueshen.md) | manifest |
| 24 | 无常丹 | `it_wuchangdan` | 玄 | 药物·疗伤 | 已通过（作者） | [it_wuchangdan.md](items/medicine/it_wuchangdan.md) | manifest |
| 25 | 小还丹 | `it_xiaohuandan` | 玄 | 补品·疗伤 | 已通过（作者） | [it_xiaohuandan.md](items/medicine/it_xiaohuandan.md) | manifest |
| 26 | 紫霞养气丹 | `it_zixiaoyangqidan` | 玄 | 补品·补气修炼 | 已通过（作者） | [it_zixiaoyangqidan.md](items/medicine/it_zixiaoyangqidan.md) | manifest |
| 27 | 百露草膏 | `it_bailucao` | 黄 | 补品·补气 | 已通过（作者） | [it_bailucao.md](items/medicine/it_bailucao.md) | manifest |
| 28 | 活血丸 | `it_huoxuewan` | 黄 | 药物·补血 | 已通过（作者） | [it_huoxuewan.md](items/medicine/it_huoxuewan.md) | manifest |
| 29 | 金创药 | `it_jinchuangyao` | 黄 | 药物·外伤 | 已通过（作者） | [it_jinchuangyao.md](items/medicine/it_jinchuangyao.md) | manifest |
| 30 | 普通人参 | `it_renshen` | 黄 | 药材·人参 | 已通过（作者） | [it_renshen.md](items/medicine/it_renshen.md) | manifest |
| 31 | 普通雪参 | `it_xueshen` | 黄 | 药材·雪参 | 已通过（作者） | [it_xueshen.md](items/medicine/it_xueshen.md) | manifest |
| 32 | 养精丸 | `it_yangjingwan` | 黄 | 补品·临时属性 | 已通过（作者） | [it_yangjingwan.md](items/medicine/it_yangjingwan.md) | manifest |

### 食材 / 食品（174）· 待出图 146、已通过（作者） 28

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 百花灵露 | `it_baihualinglu` | 天 | 食材·珍材 | 已通过（作者） | [it_baihualinglu.md](items/food/it_baihualinglu.md) | manifest |
| 2 | 天山灵蜜 | `it_tianshanlingmi` | 天 | 食材·珍材 | 已通过（作者） | [it_tianshanlingmi.md](items/food/it_tianshanlingmi.md) | manifest |
| 3 | 天香玉露羹 | `it_tianxiangyulu` | 天 | 食品·汤羹 | 已通过（作者） | [it_tianxiangyulu.md](items/food/it_tianxiangyulu.md) | manifest |
| 4 | 天香御宴 | `it_tianxiangyuyan` | 天 | 食品·名菜 | 已通过（作者） | [it_tianxiangyuyan.md](items/food/it_tianxiangyuyan.md) | manifest |
| 5 | 雪域冷膳 | `it_xueyulengchan` | 天 | 食品·腌藏 | 已通过（作者） | [it_xueyulengchan.md](items/food/it_xueyulengchan.md) | manifest |
| 6 | 燕窝 | `it_yanwo` | 天 | 食材·珍材 | 待出图 | [it_yanwo.md](items/food/it_yanwo.md) | template |
| 7 | 燕窝鸡丝汤 | `it_yanwojisitang` | 天 | 食品·名菜 | 待出图 | [it_yanwojisitang.md](items/food/it_yanwojisitang.md) | template |
| 8 | 百花糕 | `it_baihuagao` | 地 | 食品·点心 | 已通过（作者） | [it_baihuagao.md](items/food/it_baihuagao.md) | manifest |
| 9 | 豹胎 | `it_baotai` | 地 | 食材·珍材 | 待出图 | [it_baotai.md](items/food/it_baotai.md) | template |
| 10 | 鲍鱼 | `it_baoyu` | 地 | 食材·珍材 | 待出图 | [it_baoyu.md](items/food/it_baoyu.md) | template |
| 11 | 冰湖雪藕 | `it_binghuxueou` | 地 | 食材·菜蔬 | 已通过（作者） | [it_binghuxueou.md](items/food/it_binghuxueou.md) | manifest |
| 12 | 程灵素三菜一汤 | `it_chenglingsu_sancai_yitang` | 地 | 食品·名菜 | 待出图 | [it_chenglingsu_sancai_yitang.md](items/food/it_chenglingsu_sancai_yitang.md) | template |
| 13 | 东坡肉 | `it_dongporou` | 地 | 食品·名菜 | 待出图 | [it_dongporou.md](items/food/it_dongporou.md) | template |
| 14 | 二十四桥明月夜 | `it_ershisiqiaomingyueye` | 地 | 食品·名菜 | 已通过（作者） | [it_ershisiqiaomingyueye.md](items/food/it_ershisiqiaomingyueye.md) | manifest |
| 15 | 海参 | `it_haishen` | 地 | 食材·珍材 | 待出图 | [it_haishen.md](items/food/it_haishen.md) | template |
| 16 | 好逑汤 | `it_haoqiutang` | 地 | 食品·汤羹 | 已通过（作者） | [it_haoqiutang.md](items/food/it_haoqiutang.md) | manifest |
| 17 | 荷莲兜子 | `it_heliandouzi` | 地 | 食品·名菜 | 待出图 | [it_heliandouzi.md](items/food/it_heliandouzi.md) | template |
| 18 | 恒山素馅粽 | `it_hengshan_suxianzong` | 地 | 食品·名菜 | 待出图 | [it_hengshan_suxianzong.md](items/food/it_hengshan_suxianzong.md) | template |
| 19 | 河豚 | `it_hetun` | 地 | 食材·珍材 | 待出图 | [it_hetun.md](items/food/it_hetun.md) | template |
| 20 | 花胶 | `it_huajiao` | 地 | 食材·珍材 | 待出图 | [it_huajiao.md](items/food/it_huajiao.md) | template |
| 21 | 回部抓饭烤肉 | `it_huibu_zhuafan_kaorou` | 地 | 食品·名菜 | 待出图 | [it_huibu_zhuafan_kaorou.md](items/food/it_huibu_zhuafan_kaorou.md) | template |
| 22 | 胡椒 | `it_hujiao` | 地 | 食材·调料 | 待出图 | [it_hujiao.md](items/food/it_hujiao.md) | template |
| 23 | 蒋侍郎豆腐 | `it_jiangshilang_doufu` | 地 | 食品·名菜 | 待出图 | [it_jiangshilang_doufu.md](items/food/it_jiangshilang_doufu.md) | template |
| 24 | 江瑶柱 | `it_jiangyaozhu` | 地 | 食材·水产 | 待出图 | [it_jiangyaozhu.md](items/food/it_jiangyaozhu.md) | template |
| 25 | 金银馒头 | `it_jinyinmantou` | 地 | 食品·点心 | 待出图 | [it_jinyinmantou.md](items/food/it_jinyinmantou.md) | template |
| 26 | 腊八粥 | `it_labazhou` | 地 | 食品·汤羹 | 已通过（作者） | [it_labazhou.md](items/food/it_labazhou.md) | manifest |
| 27 | 辽营羊肉 | `it_liaoying_yangrou` | 地 | 食品·菜肴 | 待出图 | [it_liaoying_yangrou.md](items/food/it_liaoying_yangrou.md) | template |
| 28 | 龙肝凤髓料 | `it_longganfengsui` | 地 | 食材·珍材 | 已通过（作者） | [it_longganfengsui.md](items/food/it_longganfengsui.md) | manifest |
| 29 | 炉焙鸡 | `it_lubeiji` | 地 | 食品·菜肴 | 待出图 | [it_lubeiji.md](items/food/it_lubeiji.md) | template |
| 30 | 蜜莲火腿 | `it_milian_huotui` | 地 | 食品·名菜 | 待出图 | [it_milian_huotui.md](items/food/it_milian_huotui.md) | template |
| 31 | 青菜豆腐小鱼饭 | `it_qingcai_doufu_xiaoyufan` | 地 | 食品·名菜 | 待出图 | [it_qingcai_doufu_xiaoyufan.md](items/food/it_qingcai_doufu_xiaoyufan.md) | template |
| 32 | 山海兜 | `it_shanhaidou` | 地 | 食品·名菜 | 待出图 | [it_shanhaidou.md](items/food/it_shanhaidou.md) | template |
| 33 | 烧小猪 | `it_shaoxiaozhu` | 地 | 食品·名菜 | 待出图 | [it_shaoxiaozhu.md](items/food/it_shaoxiaozhu.md) | template |
| 34 | 鲥鱼 | `it_shiyu` | 地 | 食材·珍材 | 待出图 | [it_shiyu.md](items/food/it_shiyu.md) | template |
| 35 | 团鱼汤 | `it_tuanyutang` | 地 | 食品·汤羹 | 待出图 | [it_tuanyutang.md](items/food/it_tuanyutang.md) | template |
| 36 | 驼峰 | `it_tuofeng` | 地 | 食材·珍材 | 待出图 | [it_tuofeng.md](items/food/it_tuofeng.md) | template |
| 37 | 王太守八宝豆腐 | `it_wangtaishou_babaodoufu` | 地 | 食品·名菜 | 待出图 | [it_wangtaishou_babaodoufu.md](items/food/it_wangtaishou_babaodoufu.md) | template |
| 38 | 温家火腿腊肉宴 | `it_wenjia_huotui_larouyan` | 地 | 食品·名菜 | 待出图 | [it_wenjia_huotui_larouyan.md](items/food/it_wenjia_huotui_larouyan.md) | template |
| 39 | 鲜鹿肉 | `it_xianlurou` | 地 | 食材·珍材 | 待出图 | [it_xianlurou.md](items/food/it_xianlurou.md) | template |
| 40 | 蟹酿橙 | `it_xieniangcheng` | 地 | 食品·名菜 | 待出图 | [it_xieniangcheng.md](items/food/it_xieniangcheng.md) | template |
| 41 | 猩唇 | `it_xingchun` | 地 | 食材·珍材 | 待出图 | [it_xingchun.md](items/food/it_xingchun.md) | template |
| 42 | 熊白 | `it_xiongbai` | 地 | 食材·珍材 | 待出图 | [it_xiongbai.md](items/food/it_xiongbai.md) | template |
| 43 | 熊掌 | `it_xiongzhang` | 地 | 食材·珍材 | 待出图 | [it_xiongzhang.md](items/food/it_xiongzhang.md) | template |
| 44 | 雪地烤黄羊 | `it_xuedi_kaohuangyang` | 地 | 食品·名菜 | 待出图 | [it_xuedi_kaohuangyang.md](items/food/it_xuedi_kaohuangyang.md) | template |
| 45 | 雪蛤 | `it_xueha` | 地 | 食材·珍材 | 待出图 | [it_xueha.md](items/food/it_xueha.md) | template |
| 46 | 雪山鹿脯 | `it_xueshanlufu` | 地 | 食材·肉 | 已通过（作者） | [it_xueshanlufu.md](items/food/it_xueshanlufu.md) | manifest |
| 47 | 扬州汤包长鱼面 | `it_yangzhou_tangbao_changyumian` | 地 | 食品·名菜 | 待出图 | [it_yangzhou_tangbao_changyumian.md](items/food/it_yangzhou_tangbao_changyumian.md) | template |
| 48 | 鱼翅 | `it_yuchi` | 地 | 食材·珍材 | 待出图 | [it_yuchi.md](items/food/it_yuchi.md) | template |
| 49 | 玉笛谁家听落梅 | `it_yudishuijiatingluomei` | 地 | 食品·名菜 | 已通过（作者） | [it_yudishuijiatingluomei.md](items/food/it_yudishuijiatingluomei.md) | manifest |
| 50 | 玉露丸子 | `it_yuluwan` | 地 | 食品·点心 | 已通过（作者） | [it_yuluwan.md](items/food/it_yuluwan.md) | manifest |
| 51 | 御膳 | `it_yushan` | 地 | 食品·名菜 | 已通过（作者） | [it_yushan.md](items/food/it_yushan.md) | manifest |
| 52 | 鹌鹑肉 | `it_anchunrou` | 玄 | 食材·肉 | 待出图 | [it_anchunrou.md](items/food/it_anchunrou.md) | template |
| 53 | 阿青清茶 | `it_aqing_qingcha` | 玄 | 食品·汤羹 | 待出图 | [it_aqing_qingcha.md](items/food/it_aqing_qingcha.md) | template |
| 54 | 板鸭 | `it_banya` | 玄 | 食品·腌藏 | 待出图 | [it_banya.md](items/food/it_banya.md) | template |
| 55 | 冰火岛烤熊肉 | `it_binghuodao_kaoxiongrou` | 玄 | 食品·菜肴 | 待出图 | [it_binghuodao_kaoxiongrou.md](items/food/it_binghuodao_kaoxiongrou.md) | template |
| 56 | 春笋 | `it_chunsun` | 玄 | 食材·菜蔬 | 待出图 | [it_chunsun.md](items/food/it_chunsun.md) | template |
| 57 | 大理清茗茶点 | `it_dali_qingming_chadian` | 玄 | 食品·点心 | 待出图 | [it_dali_qingming_chadian.md](items/food/it_dali_qingming_chadian.md) | template |
| 58 | 滇池熟肉烧鸡 | `it_dianchi_shurou_shaoji` | 玄 | 食品·名菜 | 待出图 | [it_dianchi_shurou_shaoji.md](items/food/it_dianchi_shurou_shaoji.md) | template |
| 59 | 定胜糕 | `it_dingshenggao` | 玄 | 食品·点心 | 待出图 | [it_dingshenggao.md](items/food/it_dingshenggao.md) | template |
| 60 | 豆豉 | `it_douchi` | 玄 | 食材·调料 | 待出图 | [it_douchi.md](items/food/it_douchi.md) | template |
| 61 | 风干羊肉 | `it_fenggan_yangrou` | 玄 | 食品·腌藏 | 待出图 | [it_fenggan_yangrou.md](items/food/it_fenggan_yangrou.md) | template |
| 62 | 芙蓉糕 | `it_furonggao` | 玄 | 食品·点心 | 已通过（作者） | [it_furonggao.md](items/food/it_furonggao.md) | manifest |
| 63 | 福州野鸡黄兔 | `it_fuzhou_yeji_huangtu` | 玄 | 食品·菜肴 | 待出图 | [it_fuzhou_yeji_huangtu.md](items/food/it_fuzhou_yeji_huangtu.md) | template |
| 64 | 鸽肉 | `it_gerou` | 玄 | 食材·肉 | 待出图 | [it_gerou.md](items/food/it_gerou.md) | template |
| 65 | 汉水青鱼 | `it_hanshui_qingyu` | 玄 | 食材·水产 | 待出图 | [it_hanshui_qingyu.md](items/food/it_hanshui_qingyu.md) | template |
| 66 | 汉水四碗饭菜 | `it_hanshui_siwan_fancai` | 玄 | 食品·名菜 | 待出图 | [it_hanshui_siwan_fancai.md](items/food/it_hanshui_siwan_fancai.md) | template |
| 67 | 恒山青菜豆腐 | `it_hengshan_qingcaidoufu` | 玄 | 食品·菜肴 | 待出图 | [it_hengshan_qingcaidoufu.md](items/food/it_hengshan_qingcaidoufu.md) | template |
| 68 | 红花会总舵宴席 | `it_honghuahui_zongduo_yanxi` | 玄 | 食品·名菜 | 待出图 | [it_honghuahui_zongduo_yanxi.md](items/food/it_honghuahui_zongduo_yanxi.md) | template |
| 69 | 侯监集烧饼 | `it_houjianji_shaobing` | 玄 | 食品·干粮 | 待出图 | [it_houjianji_shaobing.md](items/food/it_houjianji_shaobing.md) | template |
| 70 | 花椒香料 | `it_huajiao_xiangliao` | 玄 | 食材·调料 | 待出图 | [it_huajiao_xiangliao.md](items/food/it_huajiao_xiangliao.md) | template |
| 71 | 黄鱼 | `it_huangyu` | 玄 | 食材·水产 | 待出图 | [it_huangyu.md](items/food/it_huangyu.md) | template |
| 72 | 花园糕饼 | `it_huayuan_gaobing` | 玄 | 食品·点心 | 待出图 | [it_huayuan_gaobing.md](items/food/it_huayuan_gaobing.md) | template |
| 73 | 胡苗馒头鸡羊腿 | `it_humiao_mantou_jiyangtui` | 玄 | 食品·名菜 | 待出图 | [it_humiao_mantou_jiyangtui.md](items/food/it_humiao_mantou_jiyangtui.md) | template |
| 74 | 胡桃 | `it_hutao` | 玄 | 食材·果 | 待出图 | [it_hutao.md](items/food/it_hutao.md) | template |
| 75 | 湖蟹 | `it_huxie` | 玄 | 食材·水产 | 待出图 | [it_huxie.md](items/food/it_huxie.md) | template |
| 76 | 叫化鸡 | `it_jiaohuaji` | 玄 | 食品·菜肴 | 已通过（作者） | [it_jiaohuaji.md](items/food/it_jiaohuaji.md) | manifest |
| 77 | 辣椒 | `it_lajiao` | 玄 | 食材·菜蔬 | 待出图 | [it_lajiao.md](items/food/it_lajiao.md) | template |
| 78 | 腊肉 | `it_larou` | 玄 | 食品·腌藏 | 待出图 | [it_larou.md](items/food/it_larou.md) | template |
| 79 | 荔枝 | `it_lizhi` | 玄 | 食材·果 | 待出图 | [it_lizhi.md](items/food/it_lizhi.md) | template |
| 80 | 驴肉 | `it_lvrou` | 玄 | 食材·肉 | 待出图 | [it_lvrou.md](items/food/it_lvrou.md) | template |
| 81 | 马肉 | `it_marou` | 玄 | 食材·肉 | 待出图 | [it_marou.md](items/food/it_marou.md) | template |
| 82 | 玫瑰酥饼 | `it_meigui_subing` | 玄 | 食品·点心 | 待出图 | [it_meigui_subing.md](items/food/it_meigui_subing.md) | template |
| 83 | 蜜渍金橘 | `it_mizi_jinju` | 玄 | 食品·腌藏 | 待出图 | [it_mizi_jinju.md](items/food/it_mizi_jinju.md) | template |
| 84 | 木耳 | `it_muer` | 玄 | 食材·菜蔬 | 待出图 | [it_muer.md](items/food/it_muer.md) | template |
| 85 | 木屋干菜饭 | `it_muwu_gancaifan` | 玄 | 食品·菜肴 | 待出图 | [it_muwu_gancaifan.md](items/food/it_muwu_gancaifan.md) | template |
| 86 | 奶干 | `it_naigan` | 玄 | 食品·干粮 | 待出图 | [it_naigan.md](items/food/it_naigan.md) | template |
| 87 | 奶油热茶 | `it_naiyou_recha` | 玄 | 食品·汤羹 | 待出图 | [it_naiyou_recha.md](items/food/it_naiyou_recha.md) | template |
| 88 | 牛肉 | `it_niurou` | 玄 | 食材·肉 | 待出图 | [it_niurou.md](items/food/it_niurou.md) | template |
| 89 | 酱香牛肉干 | `it_niurougan` | 玄 | 食品·腌藏 | 已通过（作者） | [it_niurougan.md](items/food/it_niurougan.md) | manifest |
| 90 | 葡萄 | `it_putao` | 玄 | 食材·果 | 待出图 | [it_putao.md](items/food/it_putao.md) | template |
| 91 | 青稞糌粑 | `it_qingkezanba` | 玄 | 食品·干粮 | 待出图 | [it_qingkezanba.md](items/food/it_qingkezanba.md) | template |
| 92 | 清水玉蜂蜜浆 | `it_qingshui_yufeng_mijiang` | 玄 | 食品·汤羹 | 待出图 | [it_qingshui_yufeng_mijiang.md](items/food/it_qingshui_yufeng_mijiang.md) | template |
| 93 | 山家三脆 | `it_shanjia_sancui` | 玄 | 食品·菜肴 | 待出图 | [it_shanjia_sancui.md](items/food/it_shanjia_sancui.md) | template |
| 94 | 山药粥 | `it_shanyaozhou` | 玄 | 食品·汤羹 | 待出图 | [it_shanyaozhou.md](items/food/it_shanyaozhou.md) | template |
| 95 | 少林素面 | `it_shaolin_sumian` | 玄 | 食品·菜肴 | 待出图 | [it_shaolin_sumian.md](items/food/it_shaolin_sumian.md) | template |
| 96 | 石榴 | `it_shiliu` | 玄 | 食材·果 | 待出图 | [it_shiliu.md](items/food/it_shiliu.md) | template |
| 97 | 食茱萸 | `it_shizhuyu` | 玄 | 食材·调料 | 待出图 | [it_shizhuyu.md](items/food/it_shizhuyu.md) | template |
| 98 | 松鹤楼虾仁 | `it_songhelou_xiaren` | 玄 | 食品·菜肴 | 待出图 | [it_songhelou_xiaren.md](items/food/it_songhelou_xiaren.md) | template |
| 99 | 笋鲊 | `it_sunzha` | 玄 | 食品·腌藏 | 待出图 | [it_sunzha.md](items/food/it_sunzha.md) | template |
| 100 | 酥油饼 | `it_suyoubing` | 玄 | 食品·点心 | 待出图 | [it_suyoubing.md](items/food/it_suyoubing.md) | template |
| 101 | 太湖银鱼 | `it_taihu_yinyu` | 玄 | 食材·水产 | 待出图 | [it_taihu_yinyu.md](items/food/it_taihu_yinyu.md) | template |
| 102 | 糖霜桃条 | `it_tangshuangtaotiao` | 玄 | 食品·腌藏 | 待出图 | [it_tangshuangtaotiao.md](items/food/it_tangshuangtaotiao.md) | template |
| 103 | 侠客岛四样点心 | `it_xiakedao_siyang_dianxin` | 玄 | 食品·名菜 | 待出图 | [it_xiakedao_siyang_dianxin.md](items/food/it_xiakedao_siyang_dianxin.md) | template |
| 104 | 山林香菇 | `it_xianggu` | 玄 | 食材·菜蔬 | 已通过（作者） | [it_xianggu.md](items/food/it_xianggu.md) | manifest |
| 105 | 萧府寿酒席 | `it_xiaofu_shoujiuxi` | 玄 | 食品·名菜 | 待出图 | [it_xiaofu_shoujiuxi.md](items/food/it_xiaofu_shoujiuxi.md) | template |
| 106 | 雪莲子 | `it_xuelianzi` | 玄 | 食材·珍材 | 已通过（作者） | [it_xuelianzi.md](items/food/it_xuelianzi.md) | manifest |
| 107 | 羊乳酪 | `it_yangrulao` | 玄 | 食品·腌藏 | 待出图 | [it_yangrulao.md](items/food/it_yangrulao.md) | template |
| 108 | 羊尾脂 | `it_yangweizhi` | 玄 | 食材·肉 | 待出图 | [it_yangweizhi.md](items/food/it_yangweizhi.md) | template |
| 109 | 月饼 | `it_yuebing` | 玄 | 食品·点心 | 待出图 | [it_yuebing.md](items/food/it_yuebing.md) | template |
| 110 | 玉雪果 | `it_yuxueguo` | 玄 | 食材·果 | 已通过（作者） | [it_yuxueguo.md](items/food/it_yuxueguo.md) | manifest |
| 111 | 渔舟番薯糙米饭 | `it_yuzhou_fanshu_caomifan` | 玄 | 食品·干粮 | 待出图 | [it_yuzhou_fanshu_caomifan.md](items/food/it_yuzhou_fanshu_caomifan.md) | template |
| 112 | 糟鱼 | `it_zaoyu` | 玄 | 食品·腌藏 | 待出图 | [it_zaoyu.md](items/food/it_zaoyu.md) | template |
| 113 | 炸羊尾 | `it_zhayangwei` | 玄 | 食品·菜肴 | 待出图 | [it_zhayangwei.md](items/food/it_zhayangwei.md) | template |
| 114 | 蔗糖 | `it_zhetang` | 玄 | 食材·调料 | 待出图 | [it_zhetang.md](items/food/it_zhetang.md) | template |
| 115 | 白菜 | `it_baicai` | 黄 | 食材·菜蔬 | 待出图 | [it_baicai.md](items/food/it_baicai.md) | template |
| 116 | 赤豆 | `it_chidou` | 黄 | 食材·谷物 | 待出图 | [it_chidou.md](items/food/it_chidou.md) | template |
| 117 | 葱 | `it_cong` | 黄 | 食材·菜蔬 | 待出图 | [it_cong.md](items/food/it_cong.md) | template |
| 118 | 粗面 | `it_cumian` | 黄 | 食材·谷物 | 已通过（作者） | [it_cumian.md](items/food/it_cumian.md) | manifest |
| 119 | 大豆 | `it_dadou` | 黄 | 食材·谷物 | 待出图 | [it_dadou.md](items/food/it_dadou.md) | template |
| 120 | 冬瓜 | `it_donggua` | 黄 | 食材·菜蔬 | 待出图 | [it_donggua.md](items/food/it_donggua.md) | template |
| 121 | 豆腐 | `it_doufu` | 黄 | 食材·菜蔬 | 待出图 | [it_doufu.md](items/food/it_doufu.md) | template |
| 122 | 鹅肉 | `it_erou` | 黄 | 食材·肉 | 待出图 | [it_erou.md](items/food/it_erou.md) | template |
| 123 | 番薯 | `it_fanshu` | 黄 | 食材·菜蔬 | 待出图 | [it_fanshu.md](items/food/it_fanshu.md) | template |
| 124 | 腐乳 | `it_furu` | 黄 | 食品·腌藏 | 待出图 | [it_furu.md](items/food/it_furu.md) | template |
| 125 | 行旅干粮 | `it_ganliang` | 黄 | 食品·干粮 | 已通过（作者） | [it_ganliang.md](items/food/it_ganliang.md) | manifest |
| 126 | 高粱 | `it_gaoliang` | 黄 | 食材·谷物 | 待出图 | [it_gaoliang.md](items/food/it_gaoliang.md) | template |
| 127 | 狗肉 | `it_gourou` | 黄 | 食材·肉 | 待出图 | [it_gourou.md](items/food/it_gourou.md) | template |
| 128 | 光明顶素馅圆饼 | `it_guangmingding_suxian_yuanbing` | 黄 | 食品·干粮 | 待出图 | [it_guangmingding_suxian_yuanbing.md](items/food/it_guangmingding_suxian_yuanbing.md) | template |
| 129 | 桂酥糕 | `it_guisugao` | 黄 | 食品·点心 | 已通过（作者） | [it_guisugao.md](items/food/it_guisugao.md) | manifest |
| 130 | 锅盔 | `it_guokui` | 黄 | 食品·干粮 | 待出图 | [it_guokui.md](items/food/it_guokui.md) | template |
| 131 | 海蛎 | `it_haili` | 黄 | 食材·水产 | 待出图 | [it_haili.md](items/food/it_haili.md) | template |
| 132 | 海鱼 | `it_haiyu` | 黄 | 食材·水产 | 待出图 | [it_haiyu.md](items/food/it_haiyu.md) | template |
| 133 | 河鲤 | `it_heli` | 黄 | 食材·水产 | 待出图 | [it_heli.md](items/food/it_heli.md) | template |
| 134 | 红枣 | `it_hongzao` | 黄 | 食材·果 | 待出图 | [it_hongzao.md](items/food/it_hongzao.md) | template |
| 135 | 华山青菜豆腐饭 | `it_huashan_qingcai_doufufan` | 黄 | 食品·菜肴 | 待出图 | [it_huashan_qingcai_doufufan.md](items/food/it_huashan_qingcai_doufufan.md) | template |
| 136 | 胡饼 | `it_hubing` | 黄 | 食品·干粮 | 待出图 | [it_hubing.md](items/food/it_hubing.md) | template |
| 137 | 回雁楼荤菜 | `it_huiyanlou_huncai` | 黄 | 食品·名菜 | 待出图 | [it_huiyanlou_huncai.md](items/food/it_huiyanlou_huncai.md) | template |
| 138 | 火堆烤獐麂 | `it_huodui_kaozhangji` | 黄 | 食品·菜肴 | 待出图 | [it_huodui_kaozhangji.md](items/food/it_huodui_kaozhangji.md) | template |
| 139 | 火腿尖 | `it_huotuijian` | 黄 | 食材·肉 | 已通过（作者） | [it_huotuijian.md](items/food/it_huotuijian.md) | manifest |
| 140 | 酱牛肉 | `it_jiangniurou` | 黄 | 食品·菜肴 | 已通过（作者） | [it_jiangniurou.md](items/food/it_jiangniurou.md) | manifest |
| 141 | 江虾 | `it_jiangxia` | 黄 | 食材·水产 | 待出图 | [it_jiangxia.md](items/food/it_jiangxia.md) | template |
| 142 | 酱汁 | `it_jiangzhi` | 黄 | 食材·调料 | 待出图 | [it_jiangzhi.md](items/food/it_jiangzhi.md) | template |
| 143 | 精米 | `it_jingmi` | 黄 | 食材·谷物 | 已通过（作者） | [it_jingmi.md](items/food/it_jingmi.md) | manifest |
| 144 | 鸡肉 | `it_jirou` | 黄 | 食材·肉 | 待出图 | [it_jirou.md](items/food/it_jirou.md) | template |
| 145 | 韭菜 | `it_jiucai` | 黄 | 食材·菜蔬 | 待出图 | [it_jiucai.md](items/food/it_jiucai.md) | template |
| 146 | 酒糟 | `it_jiuzao` | 黄 | 食材·调料 | 待出图 | [it_jiuzao.md](items/food/it_jiuzao.md) | template |
| 147 | 蕨菜 | `it_juecai` | 黄 | 食材·菜蔬 | 待出图 | [it_juecai.md](items/food/it_juecai.md) | template |
| 148 | 梨 | `it_li` | 黄 | 食材·果 | 待出图 | [it_li.md](items/food/it_li.md) | template |
| 149 | 莲藕 | `it_lianou` | 黄 | 食材·菜蔬 | 待出图 | [it_lianou.md](items/food/it_lianou.md) | template |
| 150 | 萝卜 | `it_luobo` | 黄 | 食材·菜蔬 | 待出图 | [it_luobo.md](items/food/it_luobo.md) | template |
| 151 | 绿豆 | `it_lvdou` | 黄 | 食材·谷物 | 待出图 | [it_lvdou.md](items/food/it_lvdou.md) | template |
| 152 | 苗家镬饭三菜 | `it_miaojia_huofan_sancai` | 黄 | 食品·名菜 | 待出图 | [it_miaojia_huofan_sancai.md](items/food/it_miaojia_huofan_sancai.md) | template |
| 153 | 米醋 | `it_micu` | 黄 | 食材·调料 | 待出图 | [it_micu.md](items/food/it_micu.md) | template |
| 154 | 馕饼 | `it_nangbing` | 黄 | 食品·干粮 | 待出图 | [it_nangbing.md](items/food/it_nangbing.md) | template |
| 155 | 破庙鼠汤 | `it_pomiao_shutang` | 黄 | 食品·汤羹 | 待出图 | [it_pomiao_shutang.md](items/food/it_pomiao_shutang.md) | template |
| 156 | 荞麦 | `it_qiaomai` | 黄 | 食材·谷物 | 待出图 | [it_qiaomai.md](items/food/it_qiaomai.md) | template |
| 157 | 茄子 | `it_qiezi` | 黄 | 食材·菜蔬 | 待出图 | [it_qiezi.md](items/food/it_qiezi.md) | template |
| 158 | 芹菜 | `it_qincai` | 黄 | 食材·菜蔬 | 待出图 | [it_qincai.md](items/food/it_qincai.md) | template |
| 159 | 青菜 | `it_qingcai` | 黄 | 食材·菜蔬 | 待出图 | [it_qingcai.md](items/food/it_qingcai.md) | template |
| 160 | 生姜 | `it_shengjiang` | 黄 | 食材·菜蔬 | 待出图 | [it_shengjiang.md](items/food/it_shengjiang.md) | template |
| 161 | 桃 | `it_tao` | 黄 | 食材·果 | 待出图 | [it_tao.md](items/food/it_tao.md) | template |
| 162 | 兔肉 | `it_turou` | 黄 | 食材·肉 | 待出图 | [it_turou.md](items/food/it_turou.md) | template |
| 163 | 咸肉 | `it_xianrou` | 黄 | 食品·腌藏 | 待出图 | [it_xianrou.md](items/food/it_xianrou.md) | template |
| 164 | 鲜鱼 | `it_xianyu` | 黄 | 食材·水产 | 已通过（作者） | [it_xianyu.md](items/food/it_xianyu.md) | manifest |
| 165 | 小米 | `it_xiaomi` | 黄 | 食材·谷物 | 待出图 | [it_xiaomi.md](items/food/it_xiaomi.md) | template |
| 166 | 杏 | `it_xing` | 黄 | 食材·果 | 待出图 | [it_xing.md](items/food/it_xing.md) | template |
| 167 | 盐 | `it_yan` | 黄 | 食材·调料 | 待出图 | [it_yan.md](items/food/it_yan.md) | template |
| 168 | 羊肉 | `it_yangrou` | 黄 | 食材·肉 | 待出图 | [it_yangrou.md](items/food/it_yangrou.md) | template |
| 169 | 鸭肉 | `it_yarou` | 黄 | 食材·肉 | 待出图 | [it_yarou.md](items/food/it_yarou.md) | template |
| 170 | 玉米 | `it_yumi` | 黄 | 食材·谷物 | 待出图 | [it_yumi.md](items/food/it_yumi.md) | template |
| 171 | 蒸饼 | `it_zhengbing` | 黄 | 食品·干粮 | 待出图 | [it_zhengbing.md](items/food/it_zhengbing.md) | template |
| 172 | 芝麻烧饼 | `it_zhimashaobing` | 黄 | 食品·干粮 | 待出图 | [it_zhimashaobing.md](items/food/it_zhimashaobing.md) | template |
| 173 | 猪肚 | `it_zhudu` | 黄 | 食材·肉 | 待出图 | [it_zhudu.md](items/food/it_zhudu.md) | template |
| 174 | 猪肉 | `it_zhurou` | 黄 | 食材·肉 | 待出图 | [it_zhurou.md](items/food/it_zhurou.md) | template |

### 武学秘籍（18）· 已通过（作者） 18

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 打狗棒法残谱 | `it_miji_dagou_can` | 天 | 秘籍·残本 | 已通过（作者） | [it_miji_dagou_can.md](items/manuals/it_miji_dagou_can.md) | manifest |
| 2 | 斗转星移藏本 | `it_miji_douzhuan` | 天 | 秘籍·残本 | 已通过（作者） | [it_miji_douzhuan.md](items/manuals/it_miji_douzhuan.md) | manifest |
| 3 | 九阴真经上卷 | `it_miji_jiuyin_shang` | 天 | 秘籍·原本 | 已通过（作者） | [it_miji_jiuyin_shang.md](items/manuals/it_miji_jiuyin_shang.md) | manifest |
| 4 | 九阴真经下卷 | `it_miji_jiuyin_xia` | 天 | 秘籍·原本 | 已通过（作者） | [it_miji_jiuyin_xia.md](items/manuals/it_miji_jiuyin_xia.md) | manifest |
| 5 | 降龙十八掌残本 | `it_miji_xianglong18_can` | 天 | 秘籍·残本 | 已通过（作者） | [it_miji_xianglong18_can.md](items/manuals/it_miji_xianglong18_can.md) | manifest |
| 6 | 白虹掌力藏本 | `it_miji_baihongzhang` | 地 | 秘籍·残本 | 已通过（作者） | [it_miji_baihongzhang.md](items/manuals/it_miji_baihongzhang.md) | manifest |
| 7 | 参合指藏本 | `it_miji_canhezhi` | 地 | 秘籍·残本 | 已通过（作者） | [it_miji_canhezhi.md](items/manuals/it_miji_canhezhi.md) | manifest |
| 8 | 大金刚掌秘籍 | `it_miji_dajingangzhang` | 地 | 秘籍·全本 | 已通过（作者） | [it_miji_dajingangzhang.md](items/manuals/it_miji_dajingangzhang.md) | manifest |
| 9 | 龙爪手秘本 | `it_miji_longzhaoshou` | 地 | 秘籍·全本 | 已通过（作者） | [it_miji_longzhaoshou.md](items/manuals/it_miji_longzhaoshou.md) | manifest |
| 10 | 铁布衫秘籍 | `it_miji_tiebushan` | 地 | 秘籍·全本 | 已通过（作者） | [it_miji_tiebushan.md](items/manuals/it_miji_tiebushan.md) | manifest |
| 11 | 洗髓经藏本 | `it_miji_xisuijing` | 地 | 秘籍·残本 | 已通过（作者） | [it_miji_xisuijing.md](items/manuals/it_miji_xisuijing.md) | manifest |
| 12 | 白驼毒经残本 | `it_miji_baituodujing` | 玄 | 秘籍·残本 | 已通过（作者） | [it_miji_baituodujing.md](items/manuals/it_miji_baituodujing.md) | manifest |
| 13 | 两仪心法谱 | `it_miji_liangyixinfa` | 玄 | 秘籍·全本 | 已通过（作者） | [it_miji_liangyixinfa.md](items/manuals/it_miji_liangyixinfa.md) | manifest |
| 14 | 全真心法抄本 | `it_miji_quanzhenxinfa` | 玄 | 秘籍·抄本 | 已通过（作者） | [it_miji_quanzhenxinfa.md](items/manuals/it_miji_quanzhenxinfa.md) | manifest |
| 15 | 锁喉擒拿手遗谱 | `it_miji_suohouqinnashou` | 玄 | 秘籍·全本 | 已通过（作者） | [it_miji_suohouqinnashou.md](items/manuals/it_miji_suohouqinnashou.md) | manifest |
| 16 | 杨家枪法遗谱 | `it_miji_yangjiaqiangfa` | 玄 | 秘籍·全本 | 已通过（作者） | [it_miji_yangjiaqiangfa.md](items/manuals/it_miji_yangjiaqiangfa.md) | manifest |
| 17 | 罗汉拳谱 | `it_miji_luohanquan` | 黄 | 秘籍·全本 | 已通过（作者） | [it_miji_luohanquan.md](items/manuals/it_miji_luohanquan.md) | manifest |
| 18 | 太祖长拳谱 | `it_miji_taizuchangquan` | 黄 | 秘籍·全本 | 已通过（作者） | [it_miji_taizuchangquan.md](items/manuals/it_miji_taizuchangquan.md) | manifest |

### 兵器（118）· 待出图 94、已通过（作者） 24

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 霸王枪 | `eq_bawangqiang` | 天 | 兵器·枪 | 已通过（作者） | [eq_bawangqiang.md](items/weapons/eq_bawangqiang.md) | manifest |
| 2 | 韦小宝匕首 | `eq_bishou` | 天下 | 兵器·奇门匕 | 待出图 | [eq_bishou.md](items/weapons/eq_bishou.md) | template |
| 3 | 打狗棒 | `eq_dagoubang` | 天 | 兵器·棍 | 已通过（作者） | [eq_dagoubang.md](items/weapons/eq_dagoubang.md) | manifest |
| 4 | 金蛇剑 | `eq_jinshejian` | 天 | 兵器·剑 | 已通过（作者） | [eq_jinshejian.md](items/weapons/eq_jinshejian.md) | manifest |
| 5 | 冷月宝刀 | `eq_lengyuedao` | 天下 | 兵器·刀 | 待出图 | [eq_lengyuedao.md](items/weapons/eq_lengyuedao.md) | template |
| 6 | 圣火令 | `eq_shenghuoling` | 天下 | 兵器·奇门令 | 待出图 | [eq_shenghuoling.md](items/weapons/eq_shenghuoling.md) | template |
| 7 | 屠龙刀 | `eq_tulongdao` | 天 | 兵器·重刀 | 已通过（作者） | [eq_tulongdao.md](items/weapons/eq_tulongdao.md) | manifest |
| 8 | 玄铁重剑 | `eq_xuantiejian` | 天 | 兵器·重剑 | 已通过（作者） | [eq_xuantiejian.md](items/weapons/eq_xuantiejian.md) | manifest |
| 9 | 倚天剑 | `eq_yitianjian` | 天 | 兵器·剑 | 已通过（作者） | [eq_yitianjian.md](items/weapons/eq_yitianjian.md) | manifest |
| 10 | 鸳鸯刀 | `eq_yuanyangdao` | 天下 | 兵器·刀 | 待出图 | [eq_yuanyangdao.md](items/weapons/eq_yuanyangdao.md) | template |
| 11 | 真武剑 | `eq_zhenwujian` | 天下 | 兵器·剑 | 待出图 | [eq_zhenwujian.md](items/weapons/eq_zhenwujian.md) | template |
| 12 | 白驼蛇杖 | `eq_baituoshezhang` | 地上 | 兵器·棍杖 | 待出图 | [eq_baituoshezhang.md](items/weapons/eq_baituoshezhang.md) | template |
| 13 | 碧水剑 | `eq_bishuijian` | 地下 | 兵器·剑 | 待出图 | [eq_bishuijian.md](items/weapons/eq_bishuijian.md) | template |
| 14 | 碧玉刀 | `eq_biyudao` | 地 | 兵器·刀 | 已通过（作者） | [eq_biyudao.md](items/weapons/eq_biyudao.md) | manifest |
| 15 | 长乐帮刀 | `eq_changlegangdao` | 地中 | 兵器·刀 | 待出图 | [eq_changlegangdao.md](items/weapons/eq_changlegangdao.md) | template |
| 16 | 岱宗法剑 | `eq_daizongfajian` | 地中 | 兵器·剑 | 待出图 | [eq_daizongfajian.md](items/weapons/eq_daizongfajian.md) | template |
| 17 | 段氏护身剑 | `eq_duanshihushenjian` | 地中 | 兵器·剑 | 待出图 | [eq_duanshihushenjian.md](items/weapons/eq_duanshihushenjian.md) | template |
| 18 | 段延庆钢杖 | `eq_duanyanqingzhang` | 地中 | 兵器·棍杖 | 待出图 | [eq_duanyanqingzhang.md](items/weapons/eq_duanyanqingzhang.md) | template |
| 19 | 独孤利剑 | `eq_dugulijian` | 地中 | 兵器·剑 | 待出图 | [eq_dugulijian.md](items/weapons/eq_dugulijian.md) | template |
| 20 | 峨眉戒剑 | `eq_emeijiejian` | 地中 | 兵器·剑 | 待出图 | [eq_emeijiejian.md](items/weapons/eq_emeijiejian.md) | template |
| 21 | 李莫愁拂尘 | `eq_fuchen` | 地下 | 兵器·鞭索 | 待出图 | [eq_fuchen.md](items/weapons/eq_fuchen.md) | template |
| 22 | 丐帮竹杖 | `eq_gaibangzhubang` | 地下 | 兵器·棍 | 待出图 | [eq_gaibangzhubang.md](items/weapons/eq_gaibangzhubang.md) | template |
| 23 | 鹤嘴双笔 | `eq_hebi` | 地中 | 兵器·奇门笔 | 待出图 | [eq_hebi.md](items/weapons/eq_hebi.md) | template |
| 24 | 恒山戒剑 | `eq_hengshanbeijiejian` | 地下 | 兵器·剑 | 待出图 | [eq_hengshanbeijiejian.md](items/weapons/eq_hengshanbeijiejian.md) | template |
| 25 | 何铁手毒钩 | `eq_hetieshougou` | 地下 | 兵器·奇门钩 | 待出图 | [eq_hetieshougou.md](items/weapons/eq_hetieshougou.md) | template |
| 26 | 红花会长剑 | `eq_honghuahuichangjian` | 地中 | 兵器·剑 | 待出图 | [eq_honghuahuichangjian.md](items/weapons/eq_honghuahuichangjian.md) | template |
| 27 | 霍青桐短剑 | `eq_huoqingtongduanjian` | 地下 | 兵器·奇门匕 | 待出图 | [eq_huoqingtongduanjian.md](items/weapons/eq_huoqingtongduanjian.md) | template |
| 28 | 达尔巴金杵 | `eq_jinchu` | 地下 | 兵器·奇门杵 | 待出图 | [eq_jinchu.md](items/weapons/eq_jinchu.md) | template |
| 29 | 成吉思汗金刀 | `eq_jindao` | 地下 | 兵器·刀 | 待出图 | [eq_jindao.md](items/weapons/eq_jindao.md) | template |
| 30 | 金刀黑剑 | `eq_jindaoheijian` | 地中 | 兵器·刀剑成对 | 待出图 | [eq_jindaoheijian.md](items/weapons/eq_jindaoheijian.md) | template |
| 31 | 金铃索 | `eq_jinlingsuo` | 地下 | 兵器·鞭索 | 待出图 | [eq_jinlingsuo.md](items/weapons/eq_jinlingsuo.md) | template |
| 32 | 金轮 | `eq_jinlun` | 地上 | 兵器·奇门轮 | 待出图 | [eq_jinlun.md](items/weapons/eq_jinlun.md) | template |
| 33 | 金银小剑 | `eq_jinyinxiaojian` | 地中 | 兵器·奇门匕 | 待出图 | [eq_jinyinxiaojian.md](items/weapons/eq_jinyinxiaojian.md) | template |
| 34 | 君子剑 | `eq_junzijian` | 地 | 兵器·剑 | 已通过（作者） | [eq_junzijian.md](items/weapons/eq_junzijian.md) | manifest |
| 35 | 崆峒护山双钩 | `eq_kongtongshuangou` | 地下 | 兵器·奇门钩 | 待出图 | [eq_kongtongshuangou.md](items/weapons/eq_kongtongshuangou.md) | template |
| 36 | 昆仑两仪剑 | `eq_kunlunliangyijian` | 地上 | 兵器·剑 | 待出图 | [eq_kunlunliangyijian.md](items/weapons/eq_kunlunliangyijian.md) | template |
| 37 | 离别钩 | `eq_libiegou` | 地 | 兵器·奇门钩 | 已通过（作者） | [eq_libiegou.md](items/weapons/eq_libiegou.md) | manifest |
| 38 | 烈火旗 | `eq_liehuoqi` | 地 | 兵器·奇门旗 | 已通过（作者） | [eq_liehuoqi.md](items/weapons/eq_liehuoqi.md) | manifest |
| 39 | 凌霄长剑 | `eq_lingxiaochangjian` | 地上 | 兵器·剑 | 待出图 | [eq_lingxiaochangjian.md](items/weapons/eq_lingxiaochangjian.md) | template |
| 40 | 鹿杖 | `eq_luzhang` | 地中 | 兵器·棍杖 | 待出图 | [eq_luzhang.md](items/weapons/eq_luzhang.md) | template |
| 41 | 绿波香露刀 | `eq_lvboxiangludao` | 地下 | 兵器·刀 | 待出图 | [eq_lvboxiangludao.md](items/weapons/eq_lvboxiangludao.md) | template |
| 42 | 莫大胡琴藏剑 | `eq_modahuqinjian` | 地中 | 兵器·剑 | 待出图 | [eq_modahuqinjian.md](items/weapons/eq_modahuqinjian.md) | template |
| 43 | 慕容藏锋剑 | `eq_murongcangfengjian` | 地中 | 兵器·剑 | 待出图 | [eq_murongcangfengjian.md](items/weapons/eq_murongcangfengjian.md) | template |
| 44 | 凝碧剑 | `eq_ningbijian` | 地中 | 兵器·剑 | 待出图 | [eq_ningbijian.md](items/weapons/eq_ningbijian.md) | template |
| 45 | 乾坤一气袋 | `eq_qiankunyiqidai` | 地下 | 兵器·奇门袋 | 待出图 | [eq_qiankunyiqidai.md](items/weapons/eq_qiankunyiqidai.md) | template |
| 46 | 青城松风剑 | `eq_qingchengsongfengjian` | 地中 | 兵器·剑 | 待出图 | [eq_qingchengsongfengjian.md](items/weapons/eq_qingchengsongfengjian.md) | template |
| 47 | 七弦琴 | `eq_qixianqin` | 地中 | 兵器·奇门琴 | 待出图 | [eq_qixianqin.md](items/weapons/eq_qixianqin.md) | template |
| 48 | 全真法剑 | `eq_quanzhenfajian` | 地上 | 兵器·剑 | 待出图 | [eq_quanzhenfajian.md](items/weapons/eq_quanzhenfajian.md) | template |
| 49 | 少林护寺锡杖 | `eq_shaolinhusixizhang` | 地上 | 兵器·棍杖 | 待出图 | [eq_shaolinhusixizhang.md](items/weapons/eq_shaolinhusixizhang.md) | template |
| 50 | 神拳铁护套 | `eq_shenquantiehutao` | 地下 | 兵器·奇门拳套 | 待出图 | [eq_shenquantiehutao.md](items/weapons/eq_shenquantiehutao.md) | template |
| 51 | 淑女剑 | `eq_shunvjian` | 地 | 兵器·剑 | 已通过（作者） | [eq_shunvjian.md](items/weapons/eq_shunvjian.md) | manifest |
| 52 | 嵩阳阔剑 | `eq_songyangkuojian` | 地中 | 兵器·剑 | 待出图 | [eq_songyangkuojian.md](items/weapons/eq_songyangkuojian.md) | template |
| 53 | 天地会短刀 | `eq_tiandihuiduandao` | 地下 | 兵器·刀 | 待出图 | [eq_tiandihuiduandao.md](items/weapons/eq_tiandihuiduandao.md) | template |
| 54 | 天龙寺戒刀 | `eq_tianlongsijiedao` | 地上 | 兵器·刀 | 待出图 | [eq_tianlongsijiedao.md](items/weapons/eq_tianlongsijiedao.md) | template |
| 55 | 铁掌开山斧 | `eq_tiezhangkaishanfu` | 地下 | 兵器·奇门斧 | 待出图 | [eq_tiezhangkaishanfu.md](items/weapons/eq_tiezhangkaishanfu.md) | template |
| 56 | 秃笔翁之笔 | `eq_tubiwengbi` | 地下 | 兵器·奇门笔 | 待出图 | [eq_tubiwengbi.md](items/weapons/eq_tubiwengbi.md) | template |
| 57 | 逍遥玉柄拂尘 | `eq_xiaoyaoyubingfuchen` | 地上 | 兵器·鞭索 | 待出图 | [eq_xiaoyaoyubingfuchen.md](items/weapons/eq_xiaoyaoyubingfuchen.md) | template |
| 58 | 绣花针 | `eq_xiuhuazhen` | 地上 | 兵器·奇门针 | 待出图 | [eq_xiuhuazhen.md](items/weapons/eq_xiuhuazhen.md) | template |
| 59 | 玄素双剑 | `eq_xuansushuangjian` | 地中 | 兵器·剑 | 待出图 | [eq_xuansushuangjian.md](items/weapons/eq_xuansushuangjian.md) | template |
| 60 | 血刀 | `eq_xuedao` | 地 | 兵器·刀 | 已通过（作者） | [eq_xuedao.md](items/weapons/eq_xuedao.md) | manifest |
| 61 | 银钩铁划 | `eq_yingoutiehua` | 地中 | 兵器·奇门钩笔 | 待出图 | [eq_yingoutiehua.md](items/weapons/eq_yingoutiehua.md) | template |
| 62 | 玉箫 | `eq_yuxiao` | 地上 | 兵器·奇门箫 | 待出图 | [eq_yuxiao.md](items/weapons/eq_yuxiao.md) | template |
| 63 | 渔隐叉 | `eq_yuyincha` | 地下 | 兵器·奇门叉 | 待出图 | [eq_yuyincha.md](items/weapons/eq_yuyincha.md) | template |
| 64 | 紫薇软剑 | `eq_ziweiruanjian` | 地上 | 兵器·剑 | 待出图 | [eq_ziweiruanjian.md](items/weapons/eq_ziweiruanjian.md) | template |
| 65 | 镔铁降魔杵 | `eq_bintiejiangmochu` | 玄上 | 兵器·奇门杵 | 待出图 | [eq_bintiejiangmochu.md](items/weapons/eq_bintiejiangmochu.md) | template |
| 66 | 禅杖 | `eq_chanzhang` | 玄 | 兵器·棍杖 | 已通过（作者） | [eq_chanzhang.md](items/weapons/eq_chanzhang.md) | manifest |
| 67 | 独孤木剑 | `eq_dugumujian` | 玄上 | 兵器·剑 | 待出图 | [eq_dugumujian.md](items/weapons/eq_dugumujian.md) | template |
| 68 | 鳄尾鞭 | `eq_eweibian` | 玄上 | 兵器·鞭索 | 待出图 | [eq_eweibian.md](items/weapons/eq_eweibian.md) | template |
| 69 | 鳄嘴剪 | `eq_ezuijian` | 玄上 | 兵器·奇门剪 | 待出图 | [eq_ezuijian.md](items/weapons/eq_ezuijian.md) | template |
| 70 | 霍都折扇 | `eq_huoduzheshan` | 玄上 | 兵器·奇门扇 | 待出图 | [eq_huoduzheshan.md](items/weapons/eq_huoduzheshan.md) | template |
| 71 | 护手双钩 | `eq_hushoushuanggou` | 玄下 | 兵器·奇门钩 | 待出图 | [eq_hushoushuanggou.md](items/weapons/eq_hushoushuanggou.md) | template |
| 72 | 金笛 | `eq_jindi` | 玄 | 兵器·奇门笛 | 已通过（作者） | [eq_jindi.md](items/weapons/eq_jindi.md) | manifest |
| 73 | 柯镇恶铁杖 | `eq_kezhenezhang` | 玄中 | 兵器·棍杖 | 待出图 | [eq_kezhenezhang.md](items/weapons/eq_kezhenezhang.md) | template |
| 74 | 梨花枪 | `eq_lihuaqiang` | 玄上 | 兵器·枪 | 待出图 | [eq_lihuaqiang.md](items/weapons/eq_lihuaqiang.md) | template |
| 75 | 流星锤 | `eq_liuxingchui` | 玄中 | 兵器·奇门锤 | 待出图 | [eq_liuxingchui.md](items/weapons/eq_liuxingchui.md) | template |
| 76 | 柳叶刀 | `eq_liuyedao` | 玄中 | 兵器·刀 | 待出图 | [eq_liuyedao.md](items/weapons/eq_liuyedao.md) | template |
| 77 | 龙泉剑 | `eq_longquanjian` | 玄 | 兵器·剑 | 已通过（作者） | [eq_longquanjian.md](items/weapons/eq_longquanjian.md) | manifest |
| 78 | 明军长枪 | `eq_mingchangqiang` | 玄中 | 兵器·枪 | 待出图 | [eq_mingchangqiang.md](items/weapons/eq_mingchangqiang.md) | template |
| 79 | 明钢长剑 | `eq_minggangjian` | 玄上 | 兵器·剑 | 待出图 | [eq_minggangjian.md](items/weapons/eq_minggangjian.md) | template |
| 80 | 明雁翎腰刀 | `eq_mingyanlingyaodao` | 玄上 | 兵器·刀 | 待出图 | [eq_mingyanlingyaodao.md](items/weapons/eq_mingyanlingyaodao.md) | template |
| 81 | 牛尾刀 | `eq_niuweidao` | 玄中 | 兵器·刀 | 待出图 | [eq_niuweidao.md](items/weapons/eq_niuweidao.md) | template |
| 82 | 青铜横笛 | `eq_qingtonghengdi` | 玄中 | 兵器·奇门笛 | 待出图 | [eq_qingtonghengdi.md](items/weapons/eq_qingtonghengdi.md) | template |
| 83 | 清制直剑 | `eq_qingzhijian` | 玄下 | 兵器·剑 | 待出图 | [eq_qingzhijian.md](items/weapons/eq_qingzhijian.md) | template |
| 84 | 百炼软剑 | `eq_ruanjian` | 玄中 | 兵器·剑 | 待出图 | [eq_ruanjian.md](items/weapons/eq_ruanjian.md) | template |
| 85 | 三节棍 | `eq_sanjiegun` | 玄 | 兵器·鞭索 | 已通过（作者） | [eq_sanjiegun.md](items/weapons/eq_sanjiegun.md) | manifest |
| 86 | 铁胆 | `eq_tiedan` | 玄 | 兵器·奇门 | 已通过（作者） | [eq_tiedan.md](items/weapons/eq_tiedan.md) | manifest |
| 87 | 铁拐 | `eq_tieguai` | 玄中 | 兵器·棍杖 | 待出图 | [eq_tieguai.md](items/weapons/eq_tieguai.md) | template |
| 88 | 铁骨战旗 | `eq_tieguzhanqi` | 玄上 | 兵器·奇门旗 | 待出图 | [eq_tieguzhanqi.md](items/weapons/eq_tieguzhanqi.md) | template |
| 89 | 铁环禅杖 | `eq_tiehuanchanzhang` | 玄上 | 兵器·棍杖 | 待出图 | [eq_tiehuanchanzhang.md](items/weapons/eq_tiehuanchanzhang.md) | template |
| 90 | 元蒙骑刀 | `eq_wandao` | 玄下 | 兵器·刀 | 待出图 | [eq_wandao.md](items/weapons/eq_wandao.md) | template |
| 91 | 雁翎刀 | `eq_yanlingdao` | 玄 | 兵器·刀 | 已通过（作者） | [eq_yanlingdao.md](items/weapons/eq_yanlingdao.md) | manifest |
| 92 | 元蒙马棒 | `eq_yuanmengmabang` | 玄下 | 兵器·棍 | 待出图 | [eq_yuanmengmabang.md](items/weapons/eq_yuanmengmabang.md) | template |
| 93 | 元蒙骑枪 | `eq_yuanmengqiqiang` | 玄下 | 兵器·枪 | 待出图 | [eq_yuanmengqiqiang.md](items/weapons/eq_yuanmengqiqiang.md) | template |
| 94 | 竹骨铁扇 | `eq_zhugutieshan` | 玄下 | 兵器·奇门扇 | 待出图 | [eq_zhugutieshan.md](items/weapons/eq_zhugutieshan.md) | template |
| 95 | 白蜡杆 | `eq_bailagan` | 黄中 | 兵器·棍 | 待出图 | [eq_bailagan.md](items/weapons/eq_bailagan.md) | template |
| 96 | 素木长枪 | `eq_changqiang` | 黄上 | 兵器·枪 | 待出图 | [eq_changqiang.md](items/weapons/eq_changqiang.md) | template |
| 97 | 牛皮长索 | `eq_changsuo` | 黄上 | 兵器·鞭索 | 待出图 | [eq_changsuo.md](items/weapons/eq_changsuo.md) | template |
| 98 | 单刀 | `eq_dandao` | 黄 | 兵器·刀 | 已通过（作者） | [eq_dandao.md](items/weapons/eq_dandao.md) | manifest |
| 99 | 短匕 | `eq_duanbi` | 黄 | 兵器·奇门匕 | 已通过（作者） | [eq_duanbi.md](items/weapons/eq_duanbi.md) | manifest |
| 100 | 短柄木锤 | `eq_duanbingmuchui` | 黄下 | 兵器·奇门锤 | 待出图 | [eq_duanbingmuchui.md](items/weapons/eq_duanbingmuchui.md) | template |
| 101 | 环子枪 | `eq_huanziqiang` | 黄中 | 兵器·枪 | 待出图 | [eq_huanziqiang.md](items/weapons/eq_huanziqiang.md) | template |
| 102 | 花枪 | `eq_huaqiang` | 黄 | 兵器·枪 | 已通过（作者） | [eq_huaqiang.md](items/weapons/eq_huaqiang.md) | manifest |
| 103 | 麻札刀 | `eq_mazhadao` | 黄上 | 兵器·刀 | 待出图 | [eq_mazhadao.md](items/weapons/eq_mazhadao.md) | template |
| 104 | 明制腰剑 | `eq_mingyaojian` | 黄中 | 兵器·剑 | 待出图 | [eq_mingyaojian.md](items/weapons/eq_mingyaojian.md) | template |
| 105 | 镔铁判官笔 | `eq_panguanbi` | 黄中 | 兵器·奇门笔 | 待出图 | [eq_panguanbi.md](items/weapons/eq_panguanbi.md) | template |
| 106 | 朴刀 | `eq_podao` | 黄中 | 兵器·刀 | 待出图 | [eq_podao.md](items/weapons/eq_podao.md) | template |
| 107 | 齐眉棍 | `eq_qimeigun` | 黄 | 兵器·棍 | 已通过（作者） | [eq_qimeigun.md](items/weapons/eq_qimeigun.md) | manifest |
| 108 | 齐眉硬棍 | `eq_qimeiyinggun` | 黄上 | 兵器·棍 | 待出图 | [eq_qimeiyinggun.md](items/weapons/eq_qimeiyinggun.md) | template |
| 109 | 青钢剑 | `eq_qinggangjian` | 黄 | 兵器·剑 | 已通过（作者） | [eq_qinggangjian.md](items/weapons/eq_qinggangjian.md) | manifest |
| 110 | 软鞭 | `eq_ruanbian` | 黄 | 兵器·鞭索 | 已通过（作者） | [eq_ruanbian.md](items/weapons/eq_ruanbian.md) | manifest |
| 111 | 三股铁叉 | `eq_sangujiecha` | 黄上 | 兵器·奇门叉 | 待出图 | [eq_sangujiecha.md](items/weapons/eq_sangujiecha.md) | template |
| 112 | 宋步枪 | `eq_songbuqiang` | 黄下 | 兵器·枪 | 待出图 | [eq_songbuqiang.md](items/weapons/eq_songbuqiang.md) | template |
| 113 | 宋式短斧 | `eq_songduanfu` | 黄中 | 兵器·奇门斧 | 待出图 | [eq_songduanfu.md](items/weapons/eq_songduanfu.md) | template |
| 114 | 宋式哨棒 | `eq_songshaobang` | 黄下 | 兵器·棍 | 待出图 | [eq_songshaobang.md](items/weapons/eq_songshaobang.md) | template |
| 115 | 宋手刀 | `eq_songshoudao` | 黄下 | 兵器·刀 | 待出图 | [eq_songshoudao.md](items/weapons/eq_songshoudao.md) | template |
| 116 | 松纹古剑 | `eq_songwenguijian` | 黄上 | 兵器·剑 | 待出图 | [eq_songwenguijian.md](items/weapons/eq_songwenguijian.md) | template |
| 117 | 宋制直剑 | `eq_songzhijian` | 黄下 | 兵器·剑 | 待出图 | [eq_songzhijian.md](items/weapons/eq_songzhijian.md) | template |
| 118 | 素铁短匕 | `eq_sutieduanbi` | 黄下 | 兵器·奇门匕 | 待出图 | [eq_sutieduanbi.md](items/weapons/eq_sutieduanbi.md) | template |

### 衣物（30）· 待出图 18、已通过（作者） 12

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 天蚕宝衣 | `eq_tianchanbaoyi` | 天 | 衣物·宝衣 | 已通过（作者） | [eq_tianchanbaoyi.md](items/clothing/eq_tianchanbaoyi.md) | manifest |
| 2 | 乌蚕衣 | `eq_wucanyi` | 天 | 衣物·宝衣 | 已通过（作者） | [eq_wucanyi.md](items/clothing/eq_wucanyi.md) | manifest |
| 3 | 紫霞轻衣 | `eq_zixiaqingyi` | 天 | 衣物·宝衣 | 已通过（作者） | [eq_zixiaqingyi.md](items/clothing/eq_zixiaqingyi.md) | manifest |
| 4 | 金织质孙袍·男 | `eq_jinzhizhisunpao_nan` | 地上 | 衣物·礼服 | 待出图 | [eq_jinzhizhisunpao_nan.md](items/clothing/eq_jinzhizhisunpao_nan.md) | template |
| 5 | 辽貂裘窄袍·男 | `eq_liaodiaoqiupao_nan` | 地下 | 衣物·胡服 | 待出图 | [eq_liaodiaoqiupao_nan.md](items/clothing/eq_liaodiaoqiupao_nan.md) | template |
| 6 | 明锦马面裙·女 | `eq_mingjinmamianqun_nv` | 地上 | 衣物·礼服 | 待出图 | [eq_mingjinmamianqun_nv.md](items/clothing/eq_mingjinmamianqun_nv.md) | template |
| 7 | 明织金比甲·女 | `eq_mingzhijinbijia_nv` | 地下 | 衣物·礼服 | 待出图 | [eq_mingzhijinbijia_nv.md](items/clothing/eq_mingzhijinbijia_nv.md) | template |
| 8 | 清绣旗装吉服·女 | `eq_qingqizhuangjifu_nv` | 地中 | 衣物·礼服 | 待出图 | [eq_qingqizhuangjifu_nv.md](items/clothing/eq_qingqizhuangjifu_nv.md) | template |
| 9 | 宋紫罗公袍·男 | `eq_songziluogongpao_nan` | 地中 | 衣物·官服 | 待出图 | [eq_songziluogongpao_nan.md](items/clothing/eq_songziluogongpao_nan.md) | template |
| 10 | 桃花锦袍 | `eq_taohuajinpao` | 地 | 衣物·礼服 | 已通过（作者） | [eq_taohuajinpao.md](items/clothing/eq_taohuajinpao.md) | manifest |
| 11 | 西域胡服 | `eq_xiyuhufu` | 地 | 衣物·骑装 | 已通过（作者） | [eq_xiyuhufu.md](items/clothing/eq_xiyuhufu.md) | manifest |
| 12 | 云锦鹤氅 | `eq_yunjinhechang` | 地 | 衣物·氅服 | 已通过（作者） | [eq_yunjinhechang.md](items/clothing/eq_yunjinhechang.md) | manifest |
| 13 | 大理白缎裙衣·女 | `eq_dalibaiduanqun_nv` | 玄上 | 衣物·礼服 | 待出图 | [eq_dalibaiduanqun_nv.md](items/clothing/eq_dalibaiduanqun_nv.md) | template |
| 14 | 青布道袍 | `eq_daopao` | 玄 | 衣物·袍服 | 已通过（作者） | [eq_daopao.md](items/clothing/eq_daopao.md) | manifest |
| 15 | 黄马褂 | `eq_huangmagua` | 玄 | 衣物·礼服 | 已通过（作者） | [eq_huangmagua.md](items/clothing/eq_huangmagua.md) | manifest |
| 16 | 金春水盘领袍·男 | `eq_jinchunshuipanlingpao_nan` | 玄中 | 衣物·袍服 | 待出图 | [eq_jinchunshuipanlingpao_nan.md](items/clothing/eq_jinchunshuipanlingpao_nan.md) | template |
| 17 | 明青曳撒·男 | `eq_mingqingyesa_nan` | 玄上 | 衣物·骑装 | 待出图 | [eq_mingqingyesa_nan.md](items/clothing/eq_mingqingyesa_nan.md) | template |
| 18 | 清蓝缎马褂·男 | `eq_qinglanmagua_nan` | 玄下 | 衣物·便服 | 待出图 | [eq_qinglanmagua_nan.md](items/clothing/eq_qinglanmagua_nan.md) | template |
| 19 | 宋罗褙子·女 | `eq_songluobeizi_nv` | 玄中 | 衣物·袍服 | 待出图 | [eq_songluobeizi_nv.md](items/clothing/eq_songluobeizi_nv.md) | template |
| 20 | 西夏窄褙衫·女 | `eq_xixiazhaiheshan_nv` | 玄下 | 衣物·胡服 | 待出图 | [eq_xixiazhaiheshan_nv.md](items/clothing/eq_xixiazhaiheshan_nv.md) | template |
| 21 | 夜行衣 | `eq_yexingyi` | 玄 | 衣物·潜行服 | 已通过（作者） | [eq_yexingyi.md](items/clothing/eq_yexingyi.md) | manifest |
| 22 | 粗布短褐 | `eq_buyi` | 黄 | 衣物·便服 | 已通过（作者） | [eq_buyi.md](items/clothing/eq_buyi.md) | manifest |
| 23 | 回疆棉布袷袢·男 | `eq_huijiangjiapan_nan` | 黄中 | 衣物·胡服 | 待出图 | [eq_huijiangjiapan_nan.md](items/clothing/eq_huijiangjiapan_nan.md) | template |
| 24 | 江湖劲装 | `eq_jinzhuang` | 黄 | 衣物·劲装 | 已通过（作者） | [eq_jinzhuang.md](items/clothing/eq_jinzhuang.md) | manifest |
| 25 | 明布袄裙·女 | `eq_mingbuaoqun_nv` | 黄上 | 衣物·便服 | 待出图 | [eq_mingbuaoqun_nv.md](items/clothing/eq_mingbuaoqun_nv.md) | template |
| 26 | 清汉女夹袄·女 | `eq_qinghanvjiaao_nv` | 黄中 | 衣物·便服 | 待出图 | [eq_qinghanvjiaao_nv.md](items/clothing/eq_qinghanvjiaao_nv.md) | template |
| 27 | 素色僧衣 | `eq_sengyi` | 黄 | 衣物·袍服 | 已通过（作者） | [eq_sengyi.md](items/clothing/eq_sengyi.md) | manifest |
| 28 | 宋麻布短襦·女 | `eq_songmabuduanru_nv` | 黄下 | 衣物·便服 | 待出图 | [eq_songmabuduanru_nv.md](items/clothing/eq_songmabuduanru_nv.md) | template |
| 29 | 宋青圆领袍·男 | `eq_songqingyuanlingpao_nan` | 黄上 | 衣物·袍服 | 待出图 | [eq_songqingyuanlingpao_nan.md](items/clothing/eq_songqingyuanlingpao_nan.md) | template |
| 30 | 藏地粗氆氇袍·男 | `eq_zangdicuobu_nan` | 黄下 | 衣物·胡服 | 待出图 | [eq_zangdicuobu_nan.md](items/clothing/eq_zangdicuobu_nan.md) | template |

### 制式盔甲（8）· 待重出 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 清制御前侍卫甲 | `eq_qingyulinjia` | 天 | 制式盔甲·清 | 待重出 | [eq_qingyulinjia.md](items/armor/eq_qingyulinjia.md) | manifest |
| 2 | 元宿卫怯薛甲 | `eq_yuansuweiqiejia` | 天 | 制式盔甲·元 | 待重出 | [eq_yuansuweiqiejia.md](items/armor/eq_yuansuweiqiejia.md) | manifest |
| 3 | 明制锦衣卫甲 | `eq_mingjinyiweijia` | 地 | 制式盔甲·明 | 待重出 | [eq_mingjinyiweijia.md](items/armor/eq_mingjinyiweijia.md) | manifest |
| 4 | 宋制禁军步人甲 | `eq_songjinjunburenjia` | 地 | 制式盔甲·宋 | 待重出 | [eq_songjinjunburenjia.md](items/armor/eq_songjinjunburenjia.md) | manifest |
| 5 | 明制卫所甲 | `eq_mingweisuojia` | 玄 | 制式盔甲·明 | 待重出 | [eq_mingweisuojia.md](items/armor/eq_mingweisuojia.md) | manifest |
| 6 | 元制骑兵札甲 | `eq_yuanqibingjia` | 玄 | 制式盔甲·元 | 待重出 | [eq_yuanqibingjia.md](items/armor/eq_yuanqibingjia.md) | manifest |
| 7 | 清制皂隶衣甲 | `eq_qingzaolijia` | 黄 | 制式盔甲·清 | 待重出 | [eq_qingzaolijia.md](items/armor/eq_qingzaolijia.md) | manifest |
| 8 | 宋制巡役甲 | `eq_songxunyijia` | 黄 | 制式盔甲·宋 | 待重出 | [eq_songxunyijia.md](items/armor/eq_songxunyijia.md) | manifest |

### 内甲（8）· 已通过（作者） 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 软猬甲 | `eq_ruanweijia` | 天 | 内甲·猬刺宝甲 | 已通过（作者） | [eq_ruanweijia.md](items/innerarmor/eq_ruanweijia.md) | manifest |
| 2 | 天蚕丝软甲 | `eq_tianchansiruanjia` | 天 | 内甲·蚕丝软甲 | 已通过（作者） | [eq_tianchansiruanjia.md](items/innerarmor/eq_tianchansiruanjia.md) | manifest |
| 3 | 金丝背心 | `eq_jinsibeixin` | 地 | 内甲·金丝背心 | 已通过（作者） | [eq_jinsibeixin.md](items/innerarmor/eq_jinsibeixin.md) | manifest |
| 4 | 玄锁软甲 | `eq_xuansuoruanjia` | 地 | 内甲·锁甲 | 已通过（作者） | [eq_xuansuoruanjia.md](items/innerarmor/eq_xuansuoruanjia.md) | manifest |
| 5 | 金丝甲 | `eq_jinsijia` | 玄 | 内甲·金丝 | 已通过（作者） | [eq_jinsijia.md](items/innerarmor/eq_jinsijia.md) | manifest |
| 6 | 软丝甲 | `eq_ruansijia` | 玄 | 内甲·丝甲 | 已通过（作者） | [eq_ruansijia.md](items/innerarmor/eq_ruansijia.md) | manifest |
| 7 | 皮绒贴甲 | `eq_pirutiejia` | 黄 | 内甲·皮甲 | 已通过（作者） | [eq_pirutiejia.md](items/innerarmor/eq_pirutiejia.md) | manifest |
| 8 | 竹丝贴甲 | `eq_zhusutiejia` | 黄 | 内甲·编织 | 已通过（作者） | [eq_zhusutiejia.md](items/innerarmor/eq_zhusutiejia.md) | manifest |

### 护肩 / 披风 / 头饰（48）· 待出图 36、已通过（作者） 12

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 龙鳞护肩 | `eq_longlinpijian` | 天 | 护肩·宝肩 | 已通过（作者） | [eq_longlinpijian.md](items/accessories/eq_longlinpijian.md) | manifest |
| 2 | 七星宝冠 | `eq_qixingbaoguan` | 天 | 头饰·宝冠 | 已通过（作者） | [eq_qixingbaoguan.md](items/accessories/eq_qixingbaoguan.md) | manifest |
| 3 | 天风披风 | `eq_tianfengpifeng` | 天 | 披风·宝披 | 已通过（作者） | [eq_tianfengpifeng.md](items/accessories/eq_tianfengpifeng.md) | manifest |
| 4 | 大理锦绣帔帛·女 | `eq_dalijinxiupeibo_nv` | 地下 | 披风·帔 | 待出图 | [eq_dalijinxiupeibo_nv.md](items/accessories/eq_dalijinxiupeibo_nv.md) | template |
| 5 | 鹤羽大氅 | `eq_heyudachang` | 地 | 披风·大氅 | 已通过（作者） | [eq_heyudachang.md](items/accessories/eq_heyudachang.md) | manifest |
| 6 | 辽银鼠披·男 | `eq_liaoyinshupi_nan` | 地下 | 披风·裘披 | 待出图 | [eq_liaoyinshupi_nan.md](items/accessories/eq_liaoyinshupi_nan.md) | template |
| 7 | 明云锦鹤氅·女 | `eq_mingyunjinhechang_nv` | 地上 | 披风·鹤氅 | 待出图 | [eq_mingyunjinhechang_nv.md](items/accessories/eq_mingyunjinhechang_nv.md) | template |
| 8 | 明忠静冠·男 | `eq_mingzhongjingguan_nan` | 地中 | 头饰·冠 | 待出图 | [eq_mingzhongjingguan_nan.md](items/accessories/eq_mingzhongjingguan_nan.md) | template |
| 9 | 清貂裘风氅·女 | `eq_qingdiaoqiufengchang_nv` | 地中 | 披风·风氅 | 待出图 | [eq_qingdiaoqiufengchang_nv.md](items/accessories/eq_qingdiaoqiufengchang_nv.md) | template |
| 10 | 清玄狐羽缎斗篷·男 | `eq_qingxuanhuyuduandoupeng_nan` | 地上 | 披风·斗篷 | 待出图 | [eq_qingxuanhuyuduandoupeng_nan.md](items/accessories/eq_qingxuanhuyuduandoupeng_nan.md) | template |
| 11 | 清珠翠钿子·女 | `eq_qingzhenzhudiantzi_nv` | 地中 | 头饰·钿子 | 待出图 | [eq_qingzhenzhudiantzi_nv.md](items/accessories/eq_qingzhenzhudiantzi_nv.md) | template |
| 12 | 宋金银花冠·女 | `eq_songjinhuaguan_nv` | 地下 | 头饰·花冠 | 待出图 | [eq_songjinhuaguan_nv.md](items/accessories/eq_songjinhuaguan_nv.md) | template |
| 13 | 宋直脚幞头·男 | `eq_songzhijiaofutou_nan` | 地上 | 头饰·幞头 | 待出图 | [eq_songzhijiaofutou_nan.md](items/accessories/eq_songzhijiaofutou_nan.md) | template |
| 14 | 玄铁披肩 | `eq_xuantiepijian` | 地 | 护肩·金属 | 已通过（作者） | [eq_xuantiepijian.md](items/accessories/eq_xuantiepijian.md) | manifest |
| 15 | 元珠饰罟罟冠·女 | `eq_yuanguguquan_nv` | 地上 | 头饰·罟罟冠 | 待出图 | [eq_yuanguguquan_nv.md](items/accessories/eq_yuanguguquan_nv.md) | template |
| 16 | 元七宝钹笠帽·男 | `eq_yuanqibaolimao_nan` | 地下 | 头饰·笠帽 | 待出图 | [eq_yuanqibaolimao_nan.md](items/accessories/eq_yuanqibaolimao_nan.md) | template |
| 17 | 元织金战士斗篷·男 | `eq_yuanzhijinzhanshidoupeng_nan` | 地中 | 披风·斗篷 | 待出图 | [eq_yuanzhijinzhanshidoupeng_nan.md](items/accessories/eq_yuanzhijinzhanshidoupeng_nan.md) | template |
| 18 | 紫金发冠 | `eq_zijinfaguan` | 地 | 头饰·冠 | 已通过（作者） | [eq_zijinfaguan.md](items/accessories/eq_zijinfaguan.md) | manifest |
| 19 | 白玉冠 | `eq_baiyuguan` | 玄 | 头饰·冠 | 已通过（作者） | [eq_baiyuguan.md](items/accessories/eq_baiyuguan.md) | manifest |
| 20 | 大理鎏金花冠·女 | `eq_dalijinhuaguan_nv` | 玄上 | 头饰·花冠 | 待出图 | [eq_dalijinhuaguan_nv.md](items/accessories/eq_dalijinhuaguan_nv.md) | template |
| 21 | 回疆呢花披·女 | `eq_huijiangnihuaipi_nv` | 玄下 | 披风·呢披 | 待出图 | [eq_huijiangnihuaipi_nv.md](items/accessories/eq_huijiangnihuaipi_nv.md) | template |
| 22 | 金狐边披风·男 | `eq_jinhubianpifeng_nan` | 玄中 | 披风·裘披 | 待出图 | [eq_jinhubianpifeng_nan.md](items/accessories/eq_jinhubianpifeng_nan.md) | template |
| 23 | 金皂罗方顶巾·男 | `eq_jinzaoluojin_nan` | 玄中 | 头饰·巾 | 待出图 | [eq_jinzaoluojin_nan.md](items/accessories/eq_jinzaoluojin_nan.md) | template |
| 24 | 鳞片护肩 | `eq_linpijian` | 玄 | 护肩·鳞甲 | 已通过（作者） | [eq_linpijian.md](items/accessories/eq_linpijian.md) | manifest |
| 25 | 明纱制东坡巾·男 | `eq_mingdongpojin_nan` | 玄上 | 头饰·巾 | 待出图 | [eq_mingdongpojin_nan.md](items/accessories/eq_mingdongpojin_nan.md) | template |
| 26 | 明青缎大氅·男 | `eq_mingqingduandachang_nan` | 玄上 | 披风·大氅 | 待出图 | [eq_mingqingduandachang_nan.md](items/accessories/eq_mingqingduandachang_nan.md) | template |
| 27 | 明玉蝶步摇·女 | `eq_mingyudiebuyao_nv` | 玄中 | 头饰·簪钗 | 待出图 | [eq_mingyudiebuyao_nv.md](items/accessories/eq_mingyudiebuyao_nv.md) | template |
| 28 | 清红缨暖帽·男 | `eq_qinghongyingnuanmao_nan` | 玄下 | 头饰·暖帽 | 待出图 | [eq_qinghongyingnuanmao_nan.md](items/accessories/eq_qinghongyingnuanmao_nan.md) | template |
| 29 | 清羽缎披风·女 | `eq_qingyuduanpifeng_nv` | 玄上 | 披风·披风 | 待出图 | [eq_qingyuduanpifeng_nv.md](items/accessories/eq_qingyuduanpifeng_nv.md) | template |
| 30 | 宋罗纱鹤氅·女 | `eq_songluoshahechang_nv` | 玄中 | 披风·鹤氅 | 待出图 | [eq_songluoshahechang_nv.md](items/accessories/eq_songluoshahechang_nv.md) | template |
| 31 | 宋紫罗盖头·女 | `eq_songziluogaitou_nv` | 玄下 | 头饰·盖头 | 待出图 | [eq_songziluogaitou_nv.md](items/accessories/eq_songziluogaitou_nv.md) | template |
| 32 | 乌夜披风 | `eq_wuyepifeng` | 玄 | 披风·潜行 | 已通过（作者） | [eq_wuyepifeng.md](items/accessories/eq_wuyepifeng.md) | manifest |
| 33 | 元蒙古毡披·男 | `eq_yuanmengguzhanpi_nan` | 玄下 | 披风·毡披 | 待出图 | [eq_yuanmengguzhanpi_nan.md](items/accessories/eq_yuanmengguzhanpi_nan.md) | template |
| 34 | 布面披风 | `eq_bumianpifeng` | 黄 | 披风·布 | 已通过（作者） | [eq_bumianpifeng.md](items/accessories/eq_bumianpifeng.md) | manifest |
| 35 | 回疆花布头巾·女 | `eq_huijianghuatoujin_nv` | 黄下 | 头饰·头巾 | 待出图 | [eq_huijianghuatoujin_nv.md](items/accessories/eq_huijianghuatoujin_nv.md) | template |
| 36 | 蒙古白毡笠帽·男 | `eq_menggubailimao_nan` | 黄中 | 头饰·毡帽 | 待出图 | [eq_menggubailimao_nan.md](items/accessories/eq_menggubailimao_nan.md) | template |
| 37 | 明棉布披风·男 | `eq_mingmianbupifeng_nan` | 黄上 | 披风·布 | 待出图 | [eq_mingmianbupifeng_nan.md](items/accessories/eq_mingmianbupifeng_nan.md) | template |
| 38 | 明水田披·女 | `eq_mingshuitianpi_nv` | 黄上 | 披风·水田披 | 待出图 | [eq_mingshuitianpi_nv.md](items/accessories/eq_mingshuitianpi_nv.md) | template |
| 39 | 明乌纱方巾·男 | `eq_mingwushafangjin_nan` | 黄上 | 头饰·方巾 | 待出图 | [eq_mingwushafangjin_nan.md](items/accessories/eq_mingwushafangjin_nan.md) | template |
| 40 | 皮护肩 | `eq_pijian` | 黄 | 护肩·皮革 | 已通过（作者） | [eq_pijian.md](items/accessories/eq_pijian.md) | manifest |
| 41 | 清绣边包髻·女 | `eq_qingbaobu_nv` | 黄上 | 头饰·包髻 | 待出图 | [eq_qingbaobu_nv.md](items/accessories/eq_qingbaobu_nv.md) | template |
| 42 | 青布头巾 | `eq_qingjin` | 黄 | 头饰·巾 | 已通过（作者） | [eq_qingjin.md](items/accessories/eq_qingjin.md) | manifest |
| 43 | 清青布风披·女 | `eq_qingqingbufengpi_nv` | 黄下 | 披风·布 | 待出图 | [eq_qingqingbufengpi_nv.md](items/accessories/eq_qingqingbufengpi_nv.md) | template |
| 44 | 宋麻布幅巾·男 | `eq_songmabufujin_nan` | 黄下 | 头饰·巾 | 待出图 | [eq_songmabufujin_nan.md](items/accessories/eq_songmabufujin_nan.md) | template |
| 45 | 宋油绢雨披·女 | `eq_songyoujuanyupi_nv` | 黄中 | 披风·雨披 | 待出图 | [eq_songyoujuanyupi_nv.md](items/accessories/eq_songyoujuanyupi_nv.md) | template |
| 46 | 宋棕榈蓑衣·男 | `eq_songzonglvsuoyi_nan` | 黄下 | 披风·蓑衣 | 待出图 | [eq_songzonglvsuoyi_nan.md](items/accessories/eq_songzonglvsuoyi_nan.md) | template |
| 47 | 西夏粗毡披·男 | `eq_xixiacuzhanpi_nan` | 黄中 | 披风·毡披 | 待出图 | [eq_xixiacuzhanpi_nan.md](items/accessories/eq_xixiacuzhanpi_nan.md) | template |
| 48 | 西夏小团冠·女 | `eq_xixiaxiaotuanguan_nv` | 黄中 | 头饰·冠 | 待出图 | [eq_xixiaxiaotuanguan_nv.md](items/accessories/eq_xixiaxiaotuanguan_nv.md) | template |

### 鞋（26）· 待出图 18、已通过（作者） 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 天马履 | `eq_tianmalv` | 天 | 鞋·宝履 | 已通过（作者） | [eq_tianmalv.md](items/shoes/eq_tianmalv.md) | manifest |
| 2 | 无影履 | `eq_wuyinglv` | 天 | 鞋·宝履 | 已通过（作者） | [eq_wuyinglv.md](items/shoes/eq_wuyinglv.md) | manifest |
| 3 | 辽乌皮骑靴·男 | `eq_liaowupiqixue_nan` | 地下 | 鞋·骑靴 | 待出图 | [eq_liaowupiqixue_nan.md](items/shoes/eq_liaowupiqixue_nan.md) | template |
| 4 | 明织金绣花弓鞋·女 | `eq_mingzhijinxiuhuagongxie_nv` | 地上 | 鞋·弓鞋 | 待出图 | [eq_mingzhijinxiuhuagongxie_nv.md](items/shoes/eq_mingzhijinxiuhuagongxie_nv.md) | template |
| 5 | 清锦绣花盆底鞋·女 | `eq_qingjinxiuhuapendixie_nv` | 地中 | 鞋·旗鞋 | 待出图 | [eq_qingjinxiuhuapendixie_nv.md](items/shoes/eq_qingjinxiuhuapendixie_nv.md) | template |
| 6 | 清玄缎朝靴·男 | `eq_qingxuanduanchaoxue_nan` | 地上 | 鞋·朝靴 | 待出图 | [eq_qingxuanduanchaoxue_nan.md](items/shoes/eq_qingxuanduanchaoxue_nan.md) | template |
| 7 | 宋金绣云头履·女 | `eq_songjinxiuyuntoulv_nv` | 地下 | 鞋·云头履 | 待出图 | [eq_songjinxiuyuntoulv_nv.md](items/shoes/eq_songjinxiuyuntoulv_nv.md) | template |
| 8 | 踏云履 | `eq_tayunlv` | 地 | 鞋·名履 | 已通过（作者） | [eq_tayunlv.md](items/shoes/eq_tayunlv.md) | manifest |
| 9 | 雪行靴 | `eq_xuexingxue` | 地 | 鞋·裘靴 | 已通过（作者） | [eq_xuexingxue.md](items/shoes/eq_xuexingxue.md) | manifest |
| 10 | 元赤金皮骑靴·男 | `eq_yuanchijinpiqixue_nan` | 地中 | 鞋·骑靴 | 待出图 | [eq_yuanchijinpiqixue_nan.md](items/shoes/eq_yuanchijinpiqixue_nan.md) | template |
| 11 | 大理锦绣履·女 | `eq_dalijingxiulv_nv` | 玄上 | 鞋·绣履 | 待出图 | [eq_dalijingxiulv_nv.md](items/shoes/eq_dalijingxiulv_nv.md) | template |
| 12 | 飞羽靴 | `eq_feiyuxue` | 玄 | 鞋·轻靴 | 已通过（作者） | [eq_feiyuxue.md](items/shoes/eq_feiyuxue.md) | manifest |
| 13 | 回疆绣边皮靴·女 | `eq_huijiangxiubianpixue_nv` | 玄下 | 鞋·皮靴 | 待出图 | [eq_huijiangxiubianpixue_nv.md](items/shoes/eq_huijiangxiubianpixue_nv.md) | template |
| 14 | 明皂皮靴·男 | `eq_mingzaopixue_nan` | 玄上 | 鞋·皂靴 | 待出图 | [eq_mingzaopixue_nan.md](items/shoes/eq_mingzaopixue_nan.md) | template |
| 15 | 清青缎行靴·男 | `eq_qingqingduanxingxue_nan` | 玄下 | 鞋·行靴 | 待出图 | [eq_qingqingduanxingxue_nan.md](items/shoes/eq_qingqingduanxingxue_nan.md) | template |
| 16 | 青云履 | `eq_qingyunlv` | 玄 | 鞋·布履 | 已通过（作者） | [eq_qingyunlv.md](items/shoes/eq_qingyunlv.md) | manifest |
| 17 | 元红毡靴·女 | `eq_yuanhongzhanxue_nv` | 玄中 | 鞋·毡靴 | 待出图 | [eq_yuanhongzhanxue_nv.md](items/shoes/eq_yuanhongzhanxue_nv.md) | template |
| 18 | 藏地厚革长靴·男 | `eq_zangdihougechangxue_nan` | 玄中 | 鞋·藏靴 | 待出图 | [eq_zangdihougechangxue_nan.md](items/shoes/eq_zangdihougechangxue_nan.md) | template |
| 19 | 捕快快靴 | `eq_bukuaixue` | 黄 | 鞋·布靴 | 已通过（作者） | [eq_bukuaixue.md](items/shoes/eq_bukuaixue.md) | manifest |
| 20 | 麻编草鞋 | `eq_caoxie` | 黄 | 鞋·草鞋 | 已通过（作者） | [eq_caoxie.md](items/shoes/eq_caoxie.md) | manifest |
| 21 | 金乌皮靴·男 | `eq_jinwupixue_nan` | 黄上 | 鞋·皮靴 | 待出图 | [eq_jinwupixue_nan.md](items/shoes/eq_jinwupixue_nan.md) | template |
| 22 | 蒙古羊毛毡靴·男 | `eq_mengguyangmaozhanxue_nan` | 黄中 | 鞋·毡靴 | 待出图 | [eq_mengguyangmaozhanxue_nan.md](items/shoes/eq_mengguyangmaozhanxue_nan.md) | template |
| 23 | 明棉布花履·女 | `eq_mingmianbuhualv_nv` | 黄下 | 鞋·布履 | 待出图 | [eq_mingmianbuhualv_nv.md](items/shoes/eq_mingmianbuhualv_nv.md) | template |
| 24 | 宋麻布鞋·男 | `eq_songmabuxie_nan` | 黄下 | 鞋·麻鞋 | 待出图 | [eq_songmabuxie_nan.md](items/shoes/eq_songmabuxie_nan.md) | template |
| 25 | 宋青布圆头履·女 | `eq_songqingbuyuantoulv_nv` | 黄中 | 鞋·布履 | 待出图 | [eq_songqingbuyuantoulv_nv.md](items/shoes/eq_songqingbuyuantoulv_nv.md) | template |
| 26 | 西夏缘履弓鞋·女 | `eq_xixiayuanlvgongxie_nv` | 黄上 | 鞋·弓鞋 | 待出图 | [eq_xixiayuanlvgongxie_nv.md](items/shoes/eq_xixiayuanlvgongxie_nv.md) | template |

### 腰带（26）· 待出图 18、已通过（作者） 8

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 乾坤宝带 | `eq_qiankundaidai` | 天 | 腰带·宝带 | 已通过（作者） | [eq_qiankundaidai.md](items/belts/eq_qiankundaidai.md) | manifest |
| 2 | 天蚕腰带 | `eq_tianchanyaodai` | 天 | 腰带·丝带 | 已通过（作者） | [eq_tianchanyaodai.md](items/belts/eq_tianchanyaodai.md) | manifest |
| 3 | 金春水玉吐鹘·男 | `eq_jinchunshuiyutuhu_nan` | 地上 | 腰带·玉带 | 待出图 | [eq_jinchunshuiyutuhu_nan.md](items/belts/eq_jinchunshuiyutuhu_nan.md) | template |
| 4 | 辽玉蹀躞带·男 | `eq_liaoyudiexiedai_nan` | 地下 | 腰带·蹀躞带 | 待出图 | [eq_liaoyudiexiedai_nan.md](items/belts/eq_liaoyudiexiedai_nan.md) | template |
| 5 | 明白玉鞓带·男 | `eq_mingbaiyutingdai_nan` | 地中 | 腰带·玉带 | 待出图 | [eq_mingbaiyutingdai_nan.md](items/belts/eq_mingbaiyutingdai_nan.md) | template |
| 6 | 明后妃锦大带·女 | `eq_minghoufeijindadai_nv` | 地上 | 腰带·礼带 | 待出图 | [eq_minghoufeijindadai_nv.md](items/belts/eq_minghoufeijindadai_nv.md) | template |
| 7 | 清绣花荷包带·女 | `eq_qingxiuhuahebaodai_nv` | 地下 | 腰带·荷包带 | 待出图 | [eq_qingxiuhuahebaodai_nv.md](items/belts/eq_qingxiuhuahebaodai_nv.md) | template |
| 8 | 玄铁护腰 | `eq_xuantiedai` | 地 | 腰带·金属 | 已通过（作者） | [eq_xuantiedai.md](items/belts/eq_xuantiedai.md) | manifest |
| 9 | 元红锦腰带·女 | `eq_yuanhongjinyaodai_nv` | 地中 | 腰带·锦带 | 待出图 | [eq_yuanhongjinyaodai_nv.md](items/belts/eq_yuanhongjinyaodai_nv.md) | template |
| 10 | 云龙玉带 | `eq_yunlongyudai` | 地 | 腰带·玉带 | 已通过（作者） | [eq_yunlongyudai.md](items/belts/eq_yunlongyudai.md) | manifest |
| 11 | 百纳腰封 | `eq_baonadai` | 玄 | 腰带·布带 | 已通过（作者） | [eq_baonadai.md](items/belts/eq_baonadai.md) | manifest |
| 12 | 大理银扣锦带·女 | `eq_daliyinkoujindai_nv` | 玄中 | 腰带·锦带 | 待出图 | [eq_daliyinkoujindai_nv.md](items/belts/eq_daliyinkoujindai_nv.md) | template |
| 13 | 明青金桃绳·女 | `eq_mingqingjintaosheng_nv` | 玄下 | 腰带·丝绦 | 待出图 | [eq_mingqingjintaosheng_nv.md](items/belts/eq_mingqingjintaosheng_nv.md) | template |
| 14 | 清革带荷包·男 | `eq_qinggedaihebao_nan` | 玄下 | 腰带·荷包带 | 待出图 | [eq_qinggedaihebao_nan.md](items/belts/eq_qinggedaihebao_nan.md) | template |
| 15 | 青玉束带 | `eq_qingyudai` | 玄 | 腰带·玉带 | 已通过（作者） | [eq_qingyudai.md](items/belts/eq_qingyudai.md) | manifest |
| 16 | 宋镀金凹面带·男 | `eq_songdujinaomiandai_nan` | 玄上 | 腰带·鞓带 | 待出图 | [eq_songdujinaomiandai_nan.md](items/belts/eq_songdujinaomiandai_nan.md) | template |
| 17 | 宋玉环绶·女 | `eq_songyuhuanxiu_nv` | 玄上 | 腰带·丝绦 | 待出图 | [eq_songyuhuanxiu_nv.md](items/belts/eq_songyuhuanxiu_nv.md) | template |
| 18 | 元鎏银铜銙带·男 | `eq_yuanshutongkuaodai_nan` | 玄中 | 腰带·金属 | 待出图 | [eq_yuanshutongkuaodai_nan.md](items/belts/eq_yuanshutongkuaodai_nan.md) | template |
| 19 | 回疆红布腰带·男 | `eq_huijianghongbudai_nan` | 黄中 | 腰带·布带 | 待出图 | [eq_huijianghongbudai_nan.md](items/belts/eq_huijianghongbudai_nan.md) | template |
| 20 | 金铜銙吐鹘·男 | `eq_jintongkuatuhu_nan` | 黄上 | 腰带·金属 | 待出图 | [eq_jintongkuatuhu_nan.md](items/belts/eq_jintongkuatuhu_nan.md) | template |
| 21 | 麻绳腰带 | `eq_mayaodai` | 黄 | 腰带·布绳 | 已通过（作者） | [eq_mayaodai.md](items/belts/eq_mayaodai.md) | manifest |
| 22 | 皮护腰 | `eq_pihudai` | 黄 | 腰带·皮革 | 已通过（作者） | [eq_pihudai.md](items/belts/eq_pihudai.md) | manifest |
| 23 | 清汉女丝绸束带·女 | `eq_qinghannvsichou_nv` | 黄上 | 腰带·丝带 | 待出图 | [eq_qinghannvsichou_nv.md](items/belts/eq_qinghannvsichou_nv.md) | template |
| 24 | 宋麻布绦绳·男 | `eq_songmabutaosheng_nan` | 黄下 | 腰带·布绳 | 待出图 | [eq_songmabutaosheng_nan.md](items/belts/eq_songmabutaosheng_nan.md) | template |
| 25 | 宋素帛裙带·女 | `eq_songsubodai_nv` | 黄下 | 腰带·帛带 | 待出图 | [eq_songsubodai_nv.md](items/belts/eq_songsubodai_nv.md) | template |
| 26 | 西夏绣边帛带·女 | `eq_xixiaxiubianbodai_nv` | 黄中 | 腰带·帛带 | 待出图 | [eq_xixiaxiubianbodai_nv.md](items/belts/eq_xixiaxiubianbodai_nv.md) | template |

### 暗器（24）· 已入库 24

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 暴雨梨花钉 | `eq_baoyulihuading` | 天 | 暗器·机括钉匣 | 已入库 | [eq_baoyulihuading.md](items/hidden-weapons/eq_baoyulihuading.md) | manifest |
| 2 | 小李飞刀 | `eq_xiaolifeidao` | 天 | 暗器·飞刀 | 已入库 | [eq_xiaolifeidao.md](items/hidden-weapons/eq_xiaolifeidao.md) | manifest |
| 3 | 冰魄银针 | `eq_bingpoyinzhen` | 地 | 暗器·名针 | 已入库 | [eq_bingpoyinzhen.md](items/hidden-weapons/eq_bingpoyinzhen.md) | manifest |
| 4 | 芙蓉金针 | `eq_furongjinzhen` | 地下 | 暗器·金针 | 已入库 | [eq_furongjinzhen.md](items/hidden-weapons/eq_furongjinzhen.md) | manifest |
| 5 | 黑血神针 | `eq_heixueshenzhen` | 地 | 暗器·毒针 | 已入库 | [eq_heixueshenzhen.md](items/hidden-weapons/eq_heixueshenzhen.md) | manifest |
| 6 | 金蛇锥 | `eq_jinshezhui` | 地中 | 暗器·名锥 | 已入库 | [eq_jinshezhui.md](items/hidden-weapons/eq_jinshezhui.md) | manifest |
| 7 | 孔雀翎 | `eq_kongqueling` | 地 | 暗器·机括 | 已入库 | [eq_kongqueling.md](items/hidden-weapons/eq_kongqueling.md) | manifest |
| 8 | 罗刹短铳 | `eq_luochaduanchong` | 地 | 暗器·火器 | 已入库 | [eq_luochaduanchong.md](items/hidden-weapons/eq_luochaduanchong.md) | manifest |
| 9 | 三笑逍遥散匣 | `eq_sanxiaosanxia` | 地中 | 暗器·毒粉匣 | 已入库 | [eq_sanxiaosanxia.md](items/hidden-weapons/eq_sanxiaosanxia.md) | manifest |
| 10 | 蚊须针 | `eq_wenxuzhen` | 地 | 暗器·名针 | 已入库 | [eq_wenxuzhen.md](items/hidden-weapons/eq_wenxuzhen.md) | manifest |
| 11 | 玉蜂针 | `eq_yufengzhen` | 地下 | 暗器·名针 | 已入库 | [eq_yufengzhen.md](items/hidden-weapons/eq_yufengzhen.md) | manifest |
| 12 | 枣核钉匣 | `eq_zaohedingxia` | 地中 | 暗器·名钉 | 已入库 | [eq_zaohedingxia.md](items/hidden-weapons/eq_zaohedingxia.md) | manifest |
| 13 | 毒菱 | `eq_duling` | 玄上 | 暗器·毒镖 | 已入库 | [eq_duling.md](items/hidden-weapons/eq_duling.md) | manifest |
| 14 | 飞刀匣 | `eq_feidaoxia` | 玄中 | 暗器·飞刀 | 已入库 | [eq_feidaoxia.md](items/hidden-weapons/eq_feidaoxia.md) | manifest |
| 15 | 含沙射影 | `eq_hanshasheying` | 玄 | 暗器·机括 | 已入库 | [eq_hanshasheying.md](items/hidden-weapons/eq_hanshasheying.md) | manifest |
| 16 | 连发匣弩 | `eq_lianfaxiunu` | 玄上 | 暗器·机括弩 | 已入库 | [eq_lianfaxiunu.md](items/hidden-weapons/eq_lianfaxiunu.md) | manifest |
| 17 | 连珠弹弓 | `eq_lianzhudangong` | 玄下 | 暗器·弹丸 | 已入库 | [eq_lianzhudangong.md](items/hidden-weapons/eq_lianzhudangong.md) | manifest |
| 18 | 梅花针 | `it_meihuazhen` | 玄 | 暗器·针 | 已入库 | [it_meihuazhen.md](items/hidden-weapons/it_meihuazhen.md) | manifest |
| 19 | 飞镖囊 | `eq_feibiaonang` | 黄中 | 暗器·飞镖囊 | 已入库 | [eq_feibiaonang.md](items/hidden-weapons/eq_feibiaonang.md) | manifest |
| 20 | 飞石囊 | `eq_feishinang` | 黄下 | 暗器·弹丸囊 | 已入库 | [eq_feishinang.md](items/hidden-weapons/eq_feishinang.md) | manifest |
| 21 | 铜簧袖箭 | `eq_tonghuangxiujian` | 黄上 | 暗器·弩箭 | 已入库 | [eq_tonghuangxiujian.md](items/hidden-weapons/eq_tonghuangxiujian.md) | manifest |
| 22 | 飞蝗石 | `it_feihuangshi` | 黄 | 暗器·弹丸 | 已入库 | [it_feihuangshi.md](items/hidden-weapons/it_feihuangshi.md) | manifest |
| 23 | 金钱镖 | `it_jinqianbiao` | 黄 | 暗器·飞镖 | 已入库 | [it_jinqianbiao.md](items/hidden-weapons/it_jinqianbiao.md) | manifest |
| 24 | 袖箭 | `it_xiujian` | 黄 | 暗器·弩箭 | 已入库 | [it_xiujian.md](items/hidden-weapons/it_xiujian.md) | manifest |

## 地图

全国导航图是 `tools/map/render_map.py` 从 design/19 数据生成的 SVG（14 个时代图层），**不是出图任务**。要画的是 30 个区域的水墨局部图（类比作者已审的大理苍洱局部图）；全国水墨衬纸为可选项。

| # | 名称 | asset_id | 输出 | 图 | 提示词 |
|---:|---|---|---|---|---|
| 1 | 巴蜀区域局部图 | `map_region_bashu__base` | `assets/default/map/regions/rg_bashu.png` | 待出图 | [rg_bashu.md](maps/region/rg_bashu.md) |
| 2 | 大理苍山区域局部图 | `map_region_dali_cangshan__base` | `assets/default/map/regions/rg_dali_cangshan.png` | 待出图 | [rg_dali_cangshan.md](maps/region/rg_dali_cangshan.md) |
| 3 | 东北边地区域局部图 | `map_region_dongbei__base` | `assets/default/map/regions/rg_dongbei.png` | 待出图 | [rg_dongbei.md](maps/region/rg_dongbei.md) |
| 4 | 东海诸岛区域局部图 | `map_region_donghai_islands__base` | `assets/default/map/regions/rg_donghai_islands.png` | 待出图 | [rg_donghai_islands.md](maps/region/rg_donghai_islands.md) |
| 5 | 闽地区域局部图 | `map_region_fujian__base` | `assets/default/map/regions/rg_fujian.png` | 待出图 | [rg_fujian.md](maps/region/rg_fujian.md) |
| 6 | 桂西桂北区域局部图 | `map_region_guangxi__base` | `assets/default/map/regions/rg_guangxi.png` | 待出图 | [rg_guangxi.md](maps/region/rg_guangxi.md) |
| 7 | 关中陕北区域局部图 | `map_region_guanzhong__base` | `assets/default/map/regions/rg_guanzhong.png` | 待出图 | [rg_guanzhong.md](maps/region/rg_guanzhong.md) |
| 8 | 河东与晋中区域局部图 | `map_region_hedong_jinzhong__base` | `assets/default/map/regions/rg_hedong_jinzhong.png` | 待出图 | [rg_hedong_jinzhong.md](maps/region/rg_hedong_jinzhong.md) |
| 9 | 河西与陇右区域局部图 | `map_region_hexilongyou__base` | `assets/default/map/regions/rg_hexilongyou.png` | 待出图 | [rg_hexilongyou.md](maps/region/rg_hexilongyou.md) |
| 10 | 湖湘区域局部图 | `map_region_huxiang__base` | `assets/default/map/regions/rg_huxiang.png` | 待出图 | [rg_huxiang.md](maps/region/rg_huxiang.md) |
| 11 | 江淮区域局部图 | `map_region_jianghuai__base` | `assets/default/map/regions/rg_jianghuai.png` | 待出图 | [rg_jianghuai.md](maps/region/rg_jianghuai.md) |
| 12 | 太湖江南区域局部图 | `map_region_jiangnan_taihu__base` | `assets/default/map/regions/rg_jiangnan_taihu.png` | 待出图 | [rg_jiangnan_taihu.md](maps/region/rg_jiangnan_taihu.md) |
| 13 | 江西区域局部图 | `map_region_jiangxi__base` | `assets/default/map/regions/rg_jiangxi.png` | 待出图 | [rg_jiangxi.md](maps/region/rg_jiangxi.md) |
| 14 | 荆襄区域局部图 | `map_region_jingxiang__base` | `assets/default/map/regions/rg_jingxiang.png` | 待出图 | [rg_jingxiang.md](maps/region/rg_jingxiang.md) |
| 15 | 辽东区域局部图 | `map_region_liaodong__base` | `assets/default/map/regions/rg_liaodong.png` | 待出图 | [rg_liaodong.md](maps/region/rg_liaodong.md) |
| 16 | 辽西走廊区域局部图 | `map_region_liaoxi__base` | `assets/default/map/regions/rg_liaoxi.png` | 待出图 | [rg_liaoxi.md](maps/region/rg_liaoxi.md) |
| 17 | 岭南南海岸区域局部图 | `map_region_lingnan__base` | `assets/default/map/regions/rg_lingnan.png` | 待出图 | [rg_lingnan.md](maps/region/rg_lingnan.md) |
| 18 | 漠北区域局部图 | `map_region_mobei__base` | `assets/default/map/regions/rg_mobei.png` | 待出图 | [rg_mobei.md](maps/region/rg_mobei.md) |
| 19 | 漠南区域局部图 | `map_region_monan__base` | `assets/default/map/regions/rg_monan.png` | 待出图 | [rg_monan.md](maps/region/rg_monan.md) |
| 20 | 南海诸岛区域局部图 | `map_region_nanhai_islands__base` | `assets/default/map/regions/rg_nanhai_islands.png` | 待出图 | [rg_nanhai_islands.md](maps/region/rg_nanhai_islands.md) |
| 21 | 齐鲁区域局部图 | `map_region_qilu__base` | `assets/default/map/regions/rg_qilu.png` | 待出图 | [rg_qilu.md](maps/region/rg_qilu.md) |
| 22 | 秦巴汉水区域局部图 | `map_region_qinba__base` | `assets/default/map/regions/rg_qinba.png` | 待出图 | [rg_qinba.md](maps/region/rg_qinba.md) |
| 23 | 青藏区域局部图 | `map_region_qingzang__base` | `assets/default/map/regions/rg_qingzang.png` | 待出图 | [rg_qingzang.md](maps/region/rg_qingzang.md) |
| 24 | 西夏贺兰区域局部图 | `map_region_xixia_helan__base` | `assets/default/map/regions/rg_xixia_helan.png` | 待出图 | [rg_xixia_helan.md](maps/region/rg_xixia_helan.md) |
| 25 | 西域北疆区域局部图 | `map_region_xiyu_beijiang__base` | `assets/default/map/regions/rg_xiyu_beijiang.png` | 待出图 | [rg_xiyu_beijiang.md](maps/region/rg_xiyu_beijiang.md) |
| 26 | 西域南疆区域局部图 | `map_region_xiyu_nanjiang__base` | `assets/default/map/regions/rg_xiyu_nanjiang.png` | 待出图 | [rg_xiyu_nanjiang.md](maps/region/rg_xiyu_nanjiang.md) |
| 27 | 燕京与直隶区域局部图 | `map_region_yanjing_zhili__base` | `assets/default/map/regions/rg_yanjing_zhili.png` | 待出图 | [rg_yanjing_zhili.md](maps/region/rg_yanjing_zhili.md) |
| 28 | 云滇黔中区域局部图 | `map_region_yundian_qianzhong__base` | `assets/default/map/regions/rg_yundian_qianzhong.png` | 待出图 | [rg_yundian_qianzhong.md](maps/region/rg_yundian_qianzhong.md) |
| 29 | 浙东沿海区域局部图 | `map_region_zhedong__base` | `assets/default/map/regions/rg_zhedong.png` | 待出图 | [rg_zhedong.md](maps/region/rg_zhedong.md) |
| 30 | 中原区域局部图 | `map_region_zhongyuan__base` | `assets/default/map/regions/rg_zhongyuan.png` | 待出图 | [rg_zhongyuan.md](maps/region/rg_zhongyuan.md) |
| 31 | 江湖万里图 · 水墨衬纸（全国底图） | `map_jianghu_world__ink_base` | `assets/default/map/jianghu_world/ink_base.png` | 待出图（可选） | [jianghu_world_ink_base.md](maps/jianghu_world_ink_base.md) |

## 角色分层部件（AR-22，tech/09）

两套标准体型各 3 张全身参考图 + 13 部件 × 3 视图 = 42 份。**顺序**：先出该视图的全身参考图，再以它为唯一图片输入逐部件出图；全部出完跑 `python3 tools/rig/make_parts.py assets/default/rig/<set>` 裁边定枢轴写 manifest，`python3 tools/rig/preview.py assets/default/rig/<set> --out assets/default/rig/<set>/preview.png` 看姿势条带。是否现在就出由作者定。

| 体型集 | 视图 | 参考图 | 部件（13） | 图 |
|---|---|---|---|---|
| male_std | front34 | [ref_front34.md](rig/male_std/ref_front34.md)（待出图） | [foot_shared](rig/male_std/front34/foot_shared.md)、[forearm_L](rig/male_std/front34/forearm_L.md)、[forearm_R](rig/male_std/front34/forearm_R.md)、[hair_or_headgear](rig/male_std/front34/hair_or_headgear.md)、[hand_L](rig/male_std/front34/hand_L.md)、[hand_R](rig/male_std/front34/hand_R.md)、[head](rig/male_std/front34/head.md)、[pelvis_skirt](rig/male_std/front34/pelvis_skirt.md)、[shin_shared](rig/male_std/front34/shin_shared.md)、[thigh_shared](rig/male_std/front34/thigh_shared.md)、[torso](rig/male_std/front34/torso.md)、[upper_arm_L](rig/male_std/front34/upper_arm_L.md)、[upper_arm_R](rig/male_std/front34/upper_arm_R.md) | 待出图 13 |
| male_std | back34 | [ref_back34.md](rig/male_std/ref_back34.md)（待出图） | [foot_shared](rig/male_std/back34/foot_shared.md)、[forearm_L](rig/male_std/back34/forearm_L.md)、[forearm_R](rig/male_std/back34/forearm_R.md)、[hair_or_headgear](rig/male_std/back34/hair_or_headgear.md)、[hand_L](rig/male_std/back34/hand_L.md)、[hand_R](rig/male_std/back34/hand_R.md)、[head](rig/male_std/back34/head.md)、[pelvis_skirt](rig/male_std/back34/pelvis_skirt.md)、[shin_shared](rig/male_std/back34/shin_shared.md)、[thigh_shared](rig/male_std/back34/thigh_shared.md)、[torso](rig/male_std/back34/torso.md)、[upper_arm_L](rig/male_std/back34/upper_arm_L.md)、[upper_arm_R](rig/male_std/back34/upper_arm_R.md) | 待出图 13 |
| male_std | side | [ref_side.md](rig/male_std/ref_side.md)（待出图） | [foot_shared](rig/male_std/side/foot_shared.md)、[forearm_L](rig/male_std/side/forearm_L.md)、[forearm_R](rig/male_std/side/forearm_R.md)、[hair_or_headgear](rig/male_std/side/hair_or_headgear.md)、[hand_L](rig/male_std/side/hand_L.md)、[hand_R](rig/male_std/side/hand_R.md)、[head](rig/male_std/side/head.md)、[pelvis_skirt](rig/male_std/side/pelvis_skirt.md)、[shin_shared](rig/male_std/side/shin_shared.md)、[thigh_shared](rig/male_std/side/thigh_shared.md)、[torso](rig/male_std/side/torso.md)、[upper_arm_L](rig/male_std/side/upper_arm_L.md)、[upper_arm_R](rig/male_std/side/upper_arm_R.md) | 待出图 13 |
| female_std | front34 | [ref_front34.md](rig/female_std/ref_front34.md)（待出图） | [foot_shared](rig/female_std/front34/foot_shared.md)、[forearm_L](rig/female_std/front34/forearm_L.md)、[forearm_R](rig/female_std/front34/forearm_R.md)、[hair_or_headgear](rig/female_std/front34/hair_or_headgear.md)、[hand_L](rig/female_std/front34/hand_L.md)、[hand_R](rig/female_std/front34/hand_R.md)、[head](rig/female_std/front34/head.md)、[pelvis_skirt](rig/female_std/front34/pelvis_skirt.md)、[shin_shared](rig/female_std/front34/shin_shared.md)、[thigh_shared](rig/female_std/front34/thigh_shared.md)、[torso](rig/female_std/front34/torso.md)、[upper_arm_L](rig/female_std/front34/upper_arm_L.md)、[upper_arm_R](rig/female_std/front34/upper_arm_R.md) | 待出图 13 |
| female_std | back34 | [ref_back34.md](rig/female_std/ref_back34.md)（待出图） | [foot_shared](rig/female_std/back34/foot_shared.md)、[forearm_L](rig/female_std/back34/forearm_L.md)、[forearm_R](rig/female_std/back34/forearm_R.md)、[hair_or_headgear](rig/female_std/back34/hair_or_headgear.md)、[hand_L](rig/female_std/back34/hand_L.md)、[hand_R](rig/female_std/back34/hand_R.md)、[head](rig/female_std/back34/head.md)、[pelvis_skirt](rig/female_std/back34/pelvis_skirt.md)、[shin_shared](rig/female_std/back34/shin_shared.md)、[thigh_shared](rig/female_std/back34/thigh_shared.md)、[torso](rig/female_std/back34/torso.md)、[upper_arm_L](rig/female_std/back34/upper_arm_L.md)、[upper_arm_R](rig/female_std/back34/upper_arm_R.md) | 待出图 13 |
| female_std | side | [ref_side.md](rig/female_std/ref_side.md)（待出图） | [foot_shared](rig/female_std/side/foot_shared.md)、[forearm_L](rig/female_std/side/forearm_L.md)、[forearm_R](rig/female_std/side/forearm_R.md)、[hair_or_headgear](rig/female_std/side/hair_or_headgear.md)、[hand_L](rig/female_std/side/hand_L.md)、[hand_R](rig/female_std/side/hand_R.md)、[head](rig/female_std/side/head.md)、[pelvis_skirt](rig/female_std/side/pelvis_skirt.md)、[shin_shared](rig/female_std/side/shin_shared.md)、[thigh_shared](rig/female_std/side/thigh_shared.md)、[torso](rig/female_std/side/torso.md)、[upper_arm_L](rig/female_std/side/upper_arm_L.md)、[upper_arm_R](rig/female_std/side/upper_arm_R.md) | 待出图 13 |

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
