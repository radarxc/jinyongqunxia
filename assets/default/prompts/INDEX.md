# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）

> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。
> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。

提示词 **847** 份：已入库 465、待出图 250、已通过（作者） 132。**待出图队列 250 行**（`python3 tools/agents/build_image_index.py --queue`）。

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
| items | `eq_feiyanyinsuo` | 飞燕银梭 | `assets/default/item/hidden-weapons/eq_feiyanyinsuo.png` | 待出图 | [eq_feiyanyinsuo.md](items/hidden-weapons/eq_feiyanyinsuo.md) |
| items | `eq_huibufeidaoxia` | 回部飞刀匣 | `assets/default/item/hidden-weapons/eq_huibufeidaoxia.png` | 待出图 | [eq_huibufeidaoxia.md](items/hidden-weapons/eq_huibufeidaoxia.md) |
| items | `eq_huilongbi` | 回龙璧 | `assets/default/item/hidden-weapons/eq_huilongbi.png` | 待出图 | [eq_huilongbi.md](items/hidden-weapons/eq_huilongbi.md) |
| items | `eq_jinhuabiao` | 金花镖 | `assets/default/item/hidden-weapons/eq_jinhuabiao.png` | 待出图 | [eq_jinhuabiao.md](items/hidden-weapons/eq_jinhuabiao.md) |
| items | `eq_jiugongzhenpan` | 九宫针盘 | `assets/default/item/hidden-weapons/eq_jiugongzhenpan.png` | 待出图 | [eq_jiugongzhenpan.md](items/hidden-weapons/eq_jiugongzhenpan.md) |
| items | `eq_lianzhuziwunu` | 连珠子午弩 | `assets/default/item/hidden-weapons/eq_lianzhuziwunu.png` | 待出图 | [eq_lianzhuziwunu.md](items/hidden-weapons/eq_lianzhuziwunu.md) |
| items | `eq_liuxingdanxia` | 流星弹匣 | `assets/default/item/hidden-weapons/eq_liuxingdanxia.png` | 待出图 | [eq_liuxingdanxia.md](items/hidden-weapons/eq_liuxingdanxia.md) |
| items | `eq_menggumadannang` | 蒙古马弹囊 | `assets/default/item/hidden-weapons/eq_menggumadannang.png` | 待出图 | [eq_menggumadannang.md](items/hidden-weapons/eq_menggumadannang.md) |
| items | `eq_mingduanluxia` | 明式短弩匣 | `assets/default/item/hidden-weapons/eq_mingduanluxia.png` | 待出图 | [eq_mingduanluxia.md](items/hidden-weapons/eq_mingduanluxia.md) |
| items | `eq_musangtieqizi` | 木桑铁棋子 | `assets/default/item/hidden-weapons/eq_musangtieqizi.png` | 待出图 | [eq_musangtieqizi.md](items/hidden-weapons/eq_musangtieqizi.md) |
| items | `eq_qingpiaodaoxia` | 清式镖刀匣 | `assets/default/item/hidden-weapons/eq_qingpiaodaoxia.png` | 待出图 | [eq_qingpiaodaoxia.md](items/hidden-weapons/eq_qingpiaodaoxia.md) |
| items | `eq_qingzilianzhuqiangxia` | 青瓷连珠枪匣 | `assets/default/item/hidden-weapons/eq_qingzilianzhuqiangxia.png` | 待出图 | [eq_qingzilianzhuqiangxia.md](items/hidden-weapons/eq_qingzilianzhuqiangxia.md) |
| items | `eq_shengsifubao` | 生死符冰片包 | `assets/default/item/hidden-weapons/eq_shengsifubao.png` | 待出图 | [eq_shengsifubao.md](items/hidden-weapons/eq_shengsifubao.md) |
| items | `eq_songshounuxia` | 宋式手弩匣 | `assets/default/item/hidden-weapons/eq_songshounuxia.png` | 待出图 | [eq_songshounuxia.md](items/hidden-weapons/eq_songshounuxia.md) |
| items | `eq_sunzhongjungangbiao` | 孙仲君钢镖 | `assets/default/item/hidden-weapons/eq_sunzhongjungangbiao.png` | 待出图 | [eq_sunzhongjungangbiao.md](items/hidden-weapons/eq_sunzhongjungangbiao.md) |
| items | `eq_tangfeisuodai` | 唐式飞梭袋 | `assets/default/item/hidden-weapons/eq_tangfeisuodai.png` | 待出图 | [eq_tangfeisuodai.md](items/hidden-weapons/eq_tangfeisuodai.md) |
| items | `eq_tougudingxia` | 透骨钉匣 | `assets/default/item/hidden-weapons/eq_tougudingxia.png` | 待出图 | [eq_tougudingxia.md](items/hidden-weapons/eq_tougudingxia.md) |
| items | `eq_tubofeishinang` | 吐蕃飞石囊 | `assets/default/item/hidden-weapons/eq_tubofeishinang.png` | 待出图 | [eq_tubofeishinang.md](items/hidden-weapons/eq_tubofeishinang.md) |
| items | `eq_wenfangshifeidao` | 温方施二十四飞刀 | `assets/default/item/hidden-weapons/eq_wenfangshifeidao.png` | 待出图 | [eq_wenfangshifeidao.md](items/hidden-weapons/eq_wenfangshifeidao.md) |
| items | `eq_wenfangshifeidaoxia` | 温方施飞刀备用匣 | `assets/default/item/hidden-weapons/eq_wenfangshifeidaoxia.png` | 待出图 | [eq_wenfangshifeidaoxia.md](items/hidden-weapons/eq_wenfangshifeidaoxia.md) |
| items | `eq_wulianfeibingxia` | 五联飞饼匣 | `assets/default/item/hidden-weapons/eq_wulianfeibingxia.png` | 待出图 | [eq_wulianfeibingxia.md](items/hidden-weapons/eq_wulianfeibingxia.md) |
| items | `eq_wuyingyinzhen` | 无影银针 | `assets/default/item/hidden-weapons/eq_wuyingyinzhen.png` | 待出图 | [eq_wuyingyinzhen.md](items/hidden-weapons/eq_wuyingyinzhen.md) |
| items | `eq_xiyufengyebiaonang` | 西域风叶镖囊 | `assets/default/item/hidden-weapons/eq_xiyufengyebiaonang.png` | 待出图 | [eq_xiyufengyebiaonang.md](items/hidden-weapons/eq_xiyufengyebiaonang.md) |
| items | `eq_yanzibiaonang` | 燕子镖囊 | `assets/default/item/hidden-weapons/eq_yanzibiaonang.png` | 待出图 | [eq_yanzibiaonang.md](items/hidden-weapons/eq_yanzibiaonang.md) |
| items | `eq_yuanqishoufeidaonang` | 元骑手飞刀囊 | `assets/default/item/hidden-weapons/eq_yuanqishoufeidaonang.png` | 待出图 | [eq_yuanqishoufeidaonang.md](items/hidden-weapons/eq_yuanqishoufeidaonang.md) |
| items | `it_baizhu` | 白术 | `assets/default/item/medicine/it_baizhu.png` | 待出图 | [it_baizhu.md](items/medicine/it_baizhu.md) |
| items | `it_bingcan` | 冰蚕 | `assets/default/item/medicine/it_bingcan.png` | 待出图 | [it_bingcan.md](items/medicine/it_bingcan.md) |
| items | `it_chaihu` | 柴胡 | `assets/default/item/medicine/it_chaihu.png` | 待出图 | [it_chaihu.md](items/medicine/it_chaihu.md) |
| items | `it_chansu` | 蟾酥 | `assets/default/item/medicine/it_chansu.png` | 待出图 | [it_chansu.md](items/medicine/it_chansu.md) |
| items | `it_cheqianzi` | 车前子 | `assets/default/item/medicine/it_cheqianzi.png` | 待出图 | [it_cheqianzi.md](items/medicine/it_cheqianzi.md) |
| items | `it_chuanxiong` | 川芎 | `assets/default/item/medicine/it_chuanxiong.png` | 待出图 | [it_chuanxiong.md](items/medicine/it_chuanxiong.md) |
| items | `it_danggui` | 当归 | `assets/default/item/medicine/it_danggui.png` | 待出图 | [it_danggui.md](items/medicine/it_danggui.md) |
| items | `it_dangshen` | 党参 | `assets/default/item/medicine/it_dangshen.png` | 待出图 | [it_dangshen.md](items/medicine/it_dangshen.md) |
| items | `it_danshen` | 丹参 | `assets/default/item/medicine/it_danshen.png` | 待出图 | [it_danshen.md](items/medicine/it_danshen.md) |
| items | `it_dazao` | 大枣 | `assets/default/item/medicine/it_dazao.png` | 待出图 | [it_dazao.md](items/medicine/it_dazao.md) |
| items | `it_dilong` | 地龙 | `assets/default/item/medicine/it_dilong.png` | 待出图 | [it_dilong.md](items/medicine/it_dilong.md) |
| items | `it_dongchongxiacao` | 冬虫夏草 | `assets/default/item/medicine/it_dongchongxiacao.png` | 待出图 | [it_dongchongxiacao.md](items/medicine/it_dongchongxiacao.md) |
| items | `it_duanchangshigufuxincao` | 断肠蚀骨腐心草 | `assets/default/item/medicine/it_duanchangshigufuxincao.png` | 待出图 | [it_duanchangshigufuxincao.md](items/medicine/it_duanchangshigufuxincao.md) |
| items | `it_fuling` | 茯苓 | `assets/default/item/medicine/it_fuling.png` | 待出图 | [it_fuling.md](items/medicine/it_fuling.md) |
| items | `it_gancao` | 甘草 | `assets/default/item/medicine/it_gancao.png` | 待出图 | [it_gancao.md](items/medicine/it_gancao.md) |
| items | `it_ganjiang` | 干姜 | `assets/default/item/medicine/it_ganjiang.png` | 待出图 | [it_ganjiang.md](items/medicine/it_ganjiang.md) |
| items | `it_gegen` | 葛根 | `assets/default/item/medicine/it_gegen.png` | 待出图 | [it_gegen.md](items/medicine/it_gegen.md) |
| items | `it_gouqizi` | 枸杞子 | `assets/default/item/medicine/it_gouqizi.png` | 待出图 | [it_gouqizi.md](items/medicine/it_gouqizi.md) |
| items | `it_haizao` | 海藻 | `assets/default/item/medicine/it_haizao.png` | 待出图 | [it_haizao.md](items/medicine/it_haizao.md) |
| items | `it_heshouwu` | 何首乌 | `assets/default/item/medicine/it_heshouwu.png` | 待出图 | [it_heshouwu.md](items/medicine/it_heshouwu.md) |
| items | `it_huanglian` | 黄连 | `assets/default/item/medicine/it_huanglian.png` | 待出图 | [it_huanglian.md](items/medicine/it_huanglian.md) |
| items | `it_huangqi` | 黄芪 | `assets/default/item/medicine/it_huangqi.png` | 待出图 | [it_huangqi.md](items/medicine/it_huangqi.md) |
| items | `it_huangqin` | 黄芩 | `assets/default/item/medicine/it_huangqin.png` | 待出图 | [it_huangqin.md](items/medicine/it_huangqin.md) |
| items | `it_huoxiang` | 藿香 | `assets/default/item/medicine/it_huoxiang.png` | 待出图 | [it_huoxiang.md](items/medicine/it_huoxiang.md) |
| items | `it_jiegeng` | 桔梗 | `assets/default/item/medicine/it_jiegeng.png` | 待出图 | [it_jiegeng.md](items/medicine/it_jiegeng.md) |
| items | `it_jinboxunhua` | 金波旬花 | `assets/default/item/medicine/it_jinboxunhua.png` | 待出图 | [it_jinboxunhua.md](items/medicine/it_jinboxunhua.md) |
| items | `it_jingjie` | 荆芥 | `assets/default/item/medicine/it_jingjie.png` | 待出图 | [it_jingjie.md](items/medicine/it_jingjie.md) |
| items | `it_jinyinhua` | 金银花 | `assets/default/item/medicine/it_jinyinhua.png` | 待出图 | [it_jinyinhua.md](items/medicine/it_jinyinhua.md) |
| items | `it_juhua` | 菊花 | `assets/default/item/medicine/it_juhua.png` | 待出图 | [it_juhua.md](items/medicine/it_juhua.md) |
| items | `it_lianqiao` | 连翘 | `assets/default/item/medicine/it_lianqiao.png` | 待出图 | [it_lianqiao.md](items/medicine/it_lianqiao.md) |
| items | `it_lingzhi` | 灵芝 | `assets/default/item/medicine/it_lingzhi.png` | 待出图 | [it_lingzhi.md](items/medicine/it_lingzhi.md) |
| items | `it_longgu` | 龙骨 | `assets/default/item/medicine/it_longgu.png` | 待出图 | [it_longgu.md](items/medicine/it_longgu.md) |
| items | `it_lurong` | 鹿茸 | `assets/default/item/medicine/it_lurong.png` | 待出图 | [it_lurong.md](items/medicine/it_lurong.md) |
| items | `it_mahuang` | 麻黄 | `assets/default/item/medicine/it_mahuang.png` | 待出图 | [it_mahuang.md](items/medicine/it_mahuang.md) |
| items | `it_mangguzhuha` | 莽牯朱蛤 | `assets/default/item/medicine/it_mangguzhuha.png` | 待出图 | [it_mangguzhuha.md](items/medicine/it_mangguzhuha.md) |
| items | `it_mantuoluo` | 曼陀罗花 | `assets/default/item/medicine/it_mantuoluo.png` | 待出图 | [it_mantuoluo.md](items/medicine/it_mantuoluo.md) |
| items | `it_maqianzi` | 马钱子 | `assets/default/item/medicine/it_maqianzi.png` | 待出图 | [it_maqianzi.md](items/medicine/it_maqianzi.md) |
| items | `it_niuhuang` | 牛黄 | `assets/default/item/medicine/it_niuhuang.png` | 待出图 | [it_niuhuang.md](items/medicine/it_niuhuang.md) |
| items | `it_pugongying` | 蒲公英 | `assets/default/item/medicine/it_pugongying.png` | 待出图 | [it_pugongying.md](items/medicine/it_pugongying.md) |
| items | `it_pusiqushedan` | 菩斯曲蛇胆 | `assets/default/item/medicine/it_pusiqushedan.png` | 待出图 | [it_pusiqushedan.md](items/medicine/it_pusiqushedan.md) |
| items | `it_qinghao` | 青蒿 | `assets/default/item/medicine/it_qinghao.png` | 待出图 | [it_qinghao.md](items/medicine/it_qinghao.md) |
| items | `it_qinghua` | 情花 | `assets/default/item/medicine/it_qinghua.png` | 待出图 | [it_qinghua.md](items/medicine/it_qinghua.md) |
| items | `it_qixinhaitang` | 七心海棠 | `assets/default/item/medicine/it_qixinhaitang.png` | 待出图 | [it_qixinhaitang.md](items/medicine/it_qixinhaitang.md) |
| items | `it_sanqi` | 三七 | `assets/default/item/medicine/it_sanqi.png` | 待出图 | [it_sanqi.md](items/medicine/it_sanqi.md) |
| items | `it_shexiang` | 麝香 | `assets/default/item/medicine/it_shexiang.png` | 待出图 | [it_shexiang.md](items/medicine/it_shexiang.md) |
| items | `it_shigao` | 石膏 | `assets/default/item/medicine/it_shigao.png` | 待出图 | [it_shigao.md](items/medicine/it_shigao.md) |
| items | `it_shihu` | 石斛 | `assets/default/item/medicine/it_shihu.png` | 待出图 | [it_shihu.md](items/medicine/it_shihu.md) |
| items | `it_tianma` | 天麻 | `assets/default/item/medicine/it_tianma.png` | 待出图 | [it_tianma.md](items/medicine/it_tianma.md) |
| items | `it_wutou` | 乌头 | `assets/default/item/medicine/it_wutou.png` | 待出图 | [it_wutou.md](items/medicine/it_wutou.md) |
| items | `it_wuweizi` | 五味子 | `assets/default/item/medicine/it_wuweizi.png` | 待出图 | [it_wuweizi.md](items/medicine/it_wuweizi.md) |
| items | `it_xianhecao` | 仙鹤草 | `assets/default/item/medicine/it_xianhecao.png` | 待出图 | [it_xianhecao.md](items/medicine/it_xianhecao.md) |
| items | `it_xijiao` | 犀角 | `assets/default/item/medicine/it_xijiao.png` | 待出图 | [it_xijiao.md](items/medicine/it_xijiao.md) |
| items | `it_xiongdan` | 熊胆 | `assets/default/item/medicine/it_xiongdan.png` | 待出图 | [it_xiongdan.md](items/medicine/it_xiongdan.md) |
| items | `it_xionghuang` | 雄黄 | `assets/default/item/medicine/it_xionghuang.png` | 待出图 | [it_xionghuang.md](items/medicine/it_xionghuang.md) |
| items | `it_yimucao` | 益母草 | `assets/default/item/medicine/it_yimucao.png` | 待出图 | [it_yimucao.md](items/medicine/it_yimucao.md) |
| items | `it_yuxingcao` | 鱼腥草 | `assets/default/item/medicine/it_yuxingcao.png` | 待出图 | [it_yuxingcao.md](items/medicine/it_yuxingcao.md) |
| items | `it_zhujingbingchan` | 朱睛冰蟾 | `assets/default/item/medicine/it_zhujingbingchan.png` | 待出图 | [it_zhujingbingchan.md](items/medicine/it_zhujingbingchan.md) |
| items | `it_zhuling` | 猪苓 | `assets/default/item/medicine/it_zhuling.png` | 待出图 | [it_zhuling.md](items/medicine/it_zhuling.md) |
| items | `it_zhusha` | 朱砂 | `assets/default/item/medicine/it_zhusha.png` | 待出图 | [it_zhusha.md](items/medicine/it_zhusha.md) |
| items | `it_zisunye` | 紫苏叶 | `assets/default/item/medicine/it_zisunye.png` | 待出图 | [it_zisunye.md](items/medicine/it_zisunye.md) |
| items | `eq_bujiejiedao` | 不戒和尚戒刀 | `assets/default/item/weapons/eq_bujiejiedao.png` | 待出图 | [eq_bujiejiedao.md](items/weapons/eq_bujiejiedao.md) |
| items | `eq_butianwang` | 补天网 | `assets/default/item/weapons/eq_butianwang.png` | 待出图 | [eq_butianwang.md](items/weapons/eq_butianwang.md) |
| items | `eq_changbingyueyachan` | 长柄月牙铲 | `assets/default/item/weapons/eq_changbingyueyachan.png` | 待出图 | [eq_changbingyueyachan.md](items/weapons/eq_changbingyueyachan.md) |
| items | `eq_chunqiuduanmadao` | 春秋青铜短刀 | `assets/default/item/weapons/eq_chunqiuduanmadao.png` | 待出图 | [eq_chunqiuduanmadao.md](items/weapons/eq_chunqiuduanmadao.md) |
| items | `eq_chunqiujunbang` | 春秋军棒 | `assets/default/item/weapons/eq_chunqiujunbang.png` | 待出图 | [eq_chunqiujunbang.md](items/weapons/eq_chunqiujunbang.md) |
| items | `eq_chunqiutongge` | 春秋青铜戈 | `assets/default/item/weapons/eq_chunqiutongge.png` | 待出图 | [eq_chunqiutongge.md](items/weapons/eq_chunqiutongge.md) |
| items | `eq_chunqiutongmao` | 春秋青铜矛 | `assets/default/item/weapons/eq_chunqiutongmao.png` | 待出图 | [eq_chunqiutongmao.md](items/weapons/eq_chunqiutongmao.md) |
| items | `eq_chuwanlidiaogan` | 褚万里铁钓竿 | `assets/default/item/weapons/eq_chuwanlidiaogan.png` | 待出图 | [eq_chuwanlidiaogan.md](items/weapons/eq_chuwanlidiaogan.md) |
| items | `eq_dalihujundao` | 大理护军短刀 | `assets/default/item/weapons/eq_dalihujundao.png` | 待出图 | [eq_dalihujundao.md](items/weapons/eq_dalihujundao.md) |
| items | `eq_dalihujunjian` | 大理护军剑 | `assets/default/item/weapons/eq_dalihujunjian.png` | 待出图 | [eq_dalihujunjian.md](items/weapons/eq_dalihujunjian.md) |
| items | `eq_dalijunhuan` | 大理护军铜环 | `assets/default/item/weapons/eq_dalijunhuan.png` | 待出图 | [eq_dalijunhuan.md](items/weapons/eq_dalijunhuan.md) |
| items | `eq_dalijunhuaqiang` | 大理军花枪 | `assets/default/item/weapons/eq_dalijunhuaqiang.png` | 待出图 | [eq_dalijunhuaqiang.md](items/weapons/eq_dalijunhuaqiang.md) |
| items | `eq_dalijunzhang` | 大理军杖 | `assets/default/item/weapons/eq_dalijunzhang.png` | 待出图 | [eq_dalijunzhang.md](items/weapons/eq_dalijunzhang.md) |
| items | `eq_danqingshengchangjian` | 丹青生长剑 | `assets/default/item/weapons/eq_danqingshengchangjian.png` | 待出图 | [eq_danqingshengchangjian.md](items/weapons/eq_danqingshengchangjian.md) |
| items | `eq_emeiduan_ci` | 峨眉对刺 | `assets/default/item/weapons/eq_emeiduan_ci.png` | 待出图 | [eq_emeiduan_ci.md](items/weapons/eq_emeiduan_ci.md) |
| items | `eq_fangbianchan` | 方便铲 | `assets/default/item/weapons/eq_fangbianchan.png` | 待出图 | [eq_fangbianchan.md](items/weapons/eq_fangbianchan.md) |
| items | `eq_fanyiwenggangzhang` | 樊一翁钢杖 | `assets/default/item/weapons/eq_fanyiwenggangzhang.png` | 待出图 | [eq_fanyiwenggangzhang.md](items/weapons/eq_fanyiwenggangzhang.md) |
| items | `eq_fengweishuangbi` | 凤尾双笔 | `assets/default/item/weapons/eq_fengweishuangbi.png` | 待出图 | [eq_fengweishuangbi.md](items/weapons/eq_fengweishuangbi.md) |
| items | `eq_hanbaojinlongbian` | 韩宝驹金龙鞭 | `assets/default/item/weapons/eq_hanbaojinlongbian.png` | 待出图 | [eq_hanbaojinlongbian.md](items/weapons/eq_hanbaojinlongbian.md) |
| items | `eq_hanbaoyuangun` | 含宝圆棍 | `assets/default/item/weapons/eq_hanbaoyuangun.png` | 待出图 | [eq_hanbaoyuangun.md](items/weapons/eq_hanbaoyuangun.md) |
| items | `eq_hanxiaoyingyuenvjian` | 韩小莹越女剑 | `assets/default/item/weapons/eq_hanxiaoyingyuenvjian.png` | 待出图 | [eq_hanxiaoyingyuenvjian.md](items/weapons/eq_hanxiaoyingyuenvjian.md) |
| items | `eq_heijiaotiechi` | 黑角铁尺 | `assets/default/item/weapons/eq_heijiaotiechi.png` | 待出图 | [eq_heijiaotiechi.md](items/weapons/eq_heijiaotiechi.md) |
| items | `eq_huatiegantieqiang` | 花铁干铁枪 | `assets/default/item/weapons/eq_huatiegantieqiang.png` | 待出图 | [eq_huatiegantieqiang.md](items/weapons/eq_huatiegantieqiang.md) |
| items | `eq_hudiejian` | 蝴蝶双短剑 | `assets/default/item/weapons/eq_hudiejian.png` | 待出图 | [eq_hudiejian.md](items/weapons/eq_hudiejian.md) |
| items | `eq_huibubaotiebang` | 回部包铁棒 | `assets/default/item/weapons/eq_huibubaotiebang.png` | 待出图 | [eq_huibubaotiebang.md](items/weapons/eq_huibubaotiebang.md) |
| items | `eq_huibuchangqiang` | 回部长枪 | `assets/default/item/weapons/eq_huibuchangqiang.png` | 待出图 | [eq_huibuchangqiang.md](items/weapons/eq_huibuchangqiang.md) |
| items | `eq_huibufanqudao` | 回部反曲佩刀 | `assets/default/item/weapons/eq_huibufanqudao.png` | 待出图 | [eq_huibufanqudao.md](items/weapons/eq_huibufanqudao.md) |
| items | `eq_huibujiaojian` | 回部嵌角剑 | `assets/default/item/weapons/eq_huibujiaojian.png` | 待出图 | [eq_huibujiaojian.md](items/weapons/eq_huibujiaojian.md) |
| items | `eq_huibutieshan` | 回部护身铁扇 | `assets/default/item/weapons/eq_huibutieshan.png` | 待出图 | [eq_huibutieshan.md](items/weapons/eq_huibutieshan.md) |
| items | `eq_hutougou` | 虎头护手钩 | `assets/default/item/weapons/eq_hutougou.png` | 待出图 | [eq_hutougou.md](items/weapons/eq_hutougou.md) |
| items | `eq_jiangsigentiejang` | 蒋四根铁桨 | `assets/default/item/weapons/eq_jiangsigentiejang.png` | 待出图 | [eq_jiangsigentiejang.md](items/weapons/eq_jiangsigentiejang.md) |
| items | `eq_jinhuapopojinhuazhang` | 金花婆婆金花杖 | `assets/default/item/weapons/eq_jinhuapopojinhuazhang.png` | 待出图 | [eq_jinhuapopojinhuazhang.md](items/weapons/eq_jinhuapopojinhuazhang.md) |
| items | `eq_jinjunchangdao` | 金军长刀 | `assets/default/item/weapons/eq_jinjunchangdao.png` | 待出图 | [eq_jinjunchangdao.md](items/weapons/eq_jinjunchangdao.md) |
| items | `eq_jinlangyabang` | 金军狼牙棒 | `assets/default/item/weapons/eq_jinlangyabang.png` | 待出图 | [eq_jinlangyabang.md](items/weapons/eq_jinlangyabang.md) |
| items | `eq_jinsiduomingbi` | 金丝夺命笔 | `assets/default/item/weapons/eq_jinsiduomingbi.png` | 待出图 | [eq_jinsiduomingbi.md](items/weapons/eq_jinsiduomingbi.md) |
| items | `eq_jiuhuanxidao` | 九环锡刀 | `assets/default/item/weapons/eq_jiuhuanxidao.png` | 待出图 | [eq_jiuhuanxidao.md](items/weapons/eq_jiuhuanxidao.md) |
| items | `eq_jiujiebian` | 九节鞭 | `assets/default/item/weapons/eq_jiujiebian.png` | 待出图 | [eq_jiujiebian.md](items/weapons/eq_jiujiebian.md) |
| items | `eq_jiujiegangbian` | 九节钢鞭 | `assets/default/item/weapons/eq_jiujiegangbian.png` | 待出图 | [eq_jiujiegangbian.md](items/weapons/eq_jiujiegangbian.md) |
| items | `eq_lianziqiang` | 链子枪 | `assets/default/item/weapons/eq_lianziqiang.png` | 待出图 | [eq_lianziqiang.md](items/weapons/eq_lianziqiang.md) |
| items | `eq_liaojinpeijian` | 辽金佩剑 | `assets/default/item/weapons/eq_liaojinpeijian.png` | 待出图 | [eq_liaojinpeijian.md](items/weapons/eq_liaojinpeijian.md) |
| items | `eq_liaojinqiqiang` | 辽金骑枪 | `assets/default/item/weapons/eq_liaojinqiqiang.png` | 待出图 | [eq_liaojinqiqiang.md](items/weapons/eq_liaojinqiqiang.md) |
| items | `eq_liaojintiebang` | 辽金铁头棒 | `assets/default/item/weapons/eq_liaojintiebang.png` | 待出图 | [eq_liaojintiebang.md](items/weapons/eq_liaojintiebang.md) |
| items | `eq_liaojintiegu` | 辽金铁骨朵 | `assets/default/item/weapons/eq_liaojintiegu.png` | 待出图 | [eq_liaojintiegu.md](items/weapons/eq_liaojintiegu.md) |
| items | `eq_liuchengfengrouyunjian` | 刘乘风柔云剑 | `assets/default/item/weapons/eq_liuchengfengrouyunjian.png` | 待出图 | [eq_liuchengfengrouyunjian.md](items/weapons/eq_liuchengfengrouyunjian.md) |
| items | `eq_luobingyuanyangdao` | 骆冰鸳鸯短刀 | `assets/default/item/weapons/eq_luobingyuanyangdao.png` | 待出图 | [eq_luobingyuanyangdao.md](items/weapons/eq_luobingyuanyangdao.md) |
| items | `eq_lutianshuguitoudao` | 陆天抒鬼头刀 | `assets/default/item/weapons/eq_lutianshuguitoudao.png` | 待出图 | [eq_lutianshuguitoudao.md](items/weapons/eq_lutianshuguitoudao.md) |
| items | `eq_menggugunbang` | 蒙古骨箍棒 | `assets/default/item/weapons/eq_menggugunbang.png` | 待出图 | [eq_menggugunbang.md](items/weapons/eq_menggugunbang.md) |
| items | `eq_mengguqibingdao` | 蒙古骑兵刀 | `assets/default/item/weapons/eq_mengguqibingdao.png` | 待出图 | [eq_mengguqibingdao.md](items/weapons/eq_mengguqibingdao.md) |
| items | `eq_menggutietaosuo` | 蒙古铁套索 | `assets/default/item/weapons/eq_menggutietaosuo.png` | 待出图 | [eq_menggutietaosuo.md](items/weapons/eq_menggutietaosuo.md) |
| items | `eq_mengguweishijian` | 蒙古卫士剑 | `assets/default/item/weapons/eq_mengguweishijian.png` | 待出图 | [eq_mengguweishijian.md](items/weapons/eq_mengguweishijian.md) |
| items | `eq_miaorenfengpeijian` | 苗人凤佩剑 | `assets/default/item/weapons/eq_miaorenfengpeijian.png` | 待出图 | [eq_miaorenfengpeijian.md](items/weapons/eq_miaorenfengpeijian.md) |
| items | `eq_mingjundabang` | 明军大棒 | `assets/default/item/weapons/eq_mingjundabang.png` | 待出图 | [eq_mingjundabang.md](items/weapons/eq_mingjundabang.md) |
| items | `eq_mingjunlangqiang` | 明军狼枪 | `assets/default/item/weapons/eq_mingjunlangqiang.png` | 待出图 | [eq_mingjunlangqiang.md](items/weapons/eq_mingjunlangqiang.md) |
| items | `eq_mingjunlangxian` | 明军狼筅 | `assets/default/item/weapons/eq_mingjunlangxian.png` | 待出图 | [eq_mingjunlangxian.md](items/weapons/eq_mingjunlangxian.md) |
| items | `eq_mingmiaodao` | 明军长刀（苗刀名待考） | `assets/default/item/weapons/eq_mingmiaodao.png` | 待出图 | [eq_mingmiaodao.md](items/weapons/eq_mingmiaodao.md) |
| items | `eq_mingtangpa` | 明军镋钯 | `assets/default/item/weapons/eq_mingtangpa.png` | 待出图 | [eq_mingtangpa.md](items/weapons/eq_mingtangpa.md) |
| items | `eq_mingyingpeijian` | 明营佩剑 | `assets/default/item/weapons/eq_mingyingpeijian.png` | 待出图 | [eq_mingyingpeijian.md](items/weapons/eq_mingyingpeijian.md) |
| items | `eq_mugaofengtuojian` | 木高峰驼剑 | `assets/default/item/weapons/eq_mugaofengtuojian.png` | 待出图 | [eq_mugaofengtuojian.md](items/weapons/eq_mugaofengtuojian.md) |
| items | `eq_nanxirentiebian` | 南希仁铁扁担 | `assets/default/item/weapons/eq_nanxirentiebian.png` | 待出图 | [eq_nanxirentiebian.md](items/weapons/eq_nanxirentiebian.md) |
| items | `eq_nimoxingtieshe` | 尼摩星铁蛇 | `assets/default/item/weapons/eq_nimoxingtieshe.png` | 待出图 | [eq_nimoxingtieshe.md](items/weapons/eq_nimoxingtieshe.md) |
| items | `eq_qilinzhen` | 麒麟镇纸 | `assets/default/item/weapons/eq_qilinzhen.png` | 待出图 | [eq_qilinzhen.md](items/weapons/eq_qilinzhen.md) |
| items | `eq_qingshundao` | 清顺刀 | `assets/default/item/weapons/eq_qingshundao.png` | 待出图 | [eq_qingshundao.md](items/weapons/eq_qingshundao.md) |
| items | `eq_qingtengpai` | 清营藤牌 | `assets/default/item/weapons/eq_qingtengpai.png` | 待出图 | [eq_qingtengpai.md](items/weapons/eq_qingtengpai.md) |
| items | `eq_qingtongtiedi` | 青铜竖笛 | `assets/default/item/weapons/eq_qingtongtiedi.png` | 待出图 | [eq_qingtongtiedi.md](items/weapons/eq_qingtongtiedi.md) |
| items | `eq_qingyingchangqiang` | 清营长枪 | `assets/default/item/weapons/eq_qingyingchangqiang.png` | 待出图 | [eq_qingyingchangqiang.md](items/weapons/eq_qingyingchangqiang.md) |
| items | `eq_qingyingpeijian` | 清营佩剑 | `assets/default/item/weapons/eq_qingyingpeijian.png` | 待出图 | [eq_qingyingpeijian.md](items/weapons/eq_qingyingpeijian.md) |
| items | `eq_qingyingtiebang` | 清营铁箍棒 | `assets/default/item/weapons/eq_qingyingtiebang.png` | 待出图 | [eq_qingyingtiebang.md](items/weapons/eq_qingyingtiebang.md) |
| items | `eq_qingyingyaodao` | 清营腰刀 | `assets/default/item/weapons/eq_qingyingyaodao.png` | 待出图 | [eq_qingyingyaodao.md](items/weapons/eq_qingyingyaodao.md) |
| items | `eq_quanjinfadacheng` | 全金发大秤 | `assets/default/item/weapons/eq_quanjinfadacheng.png` | 待出图 | [eq_quanjinfadacheng.md](items/weapons/eq_quanjinfadacheng.md) |
| items | `eq_riyueqiankunquan` | 日月乾坤圈 | `assets/default/item/weapons/eq_riyueqiankunquan.png` | 待出图 | [eq_riyueqiankunquan.md](items/weapons/eq_riyueqiankunquan.md) |
| items | `eq_sanjietiebang` | 三节铁棍 | `assets/default/item/weapons/eq_sanjietiebang.png` | 待出图 | [eq_sanjietiebang.md](items/weapons/eq_sanjietiebang.md) |
| items | `eq_shuangliuxingchui` | 双流星锤 | `assets/default/item/weapons/eq_shuangliuxingchui.png` | 待出图 | [eq_shuangliuxingchui.md](items/weapons/eq_shuangliuxingchui.md) |
| items | `eq_shuangtiechi` | 双铁尺 | `assets/default/item/weapons/eq_shuangtiechi.png` | 待出图 | [eq_shuangtiechi.md](items/weapons/eq_shuangtiechi.md) |
| items | `eq_shuidailengyuejian` | 水岱冷月剑 | `assets/default/item/weapons/eq_shuidailengyuejian.png` | 待出图 | [eq_shuidailengyuejian.md](items/weapons/eq_shuidailengyuejian.md) |
| items | `eq_songbubinggun` | 宋军步棍 | `assets/default/item/weapons/eq_songbubinggun.png` | 待出图 | [eq_songbubinggun.md](items/weapons/eq_songbubinggun.md) |
| items | `eq_songdiaodao` | 宋掉刀 | `assets/default/item/weapons/eq_songdiaodao.png` | 待出图 | [eq_songdiaodao.md](items/weapons/eq_songdiaodao.md) |
| items | `eq_songgoulianqiang` | 宋钩镰枪 | `assets/default/item/weapons/eq_songgoulianqiang.png` | 待出图 | [eq_songgoulianqiang.md](items/weapons/eq_songgoulianqiang.md) |
| items | `eq_songjunhuanshoujian` | 宋军环首剑 | `assets/default/item/weapons/eq_songjunhuanshoujian.png` | 待出图 | [eq_songjunhuanshoujian.md](items/weapons/eq_songjunhuanshoujian.md) |
| items | `eq_songjunpangpai` | 宋军旁牌 | `assets/default/item/weapons/eq_songjunpangpai.png` | 待出图 | [eq_songjunpangpai.md](items/weapons/eq_songjunpangpai.md) |
| items | `eq_songjunzhimao` | 宋军直矛 | `assets/default/item/weapons/eq_songjunzhimao.png` | 待出图 | [eq_songjunzhimao.md](items/weapons/eq_songjunzhimao.md) |
| items | `eq_songyaxiangqiang` | 宋鸦项枪 | `assets/default/item/weapons/eq_songyaxiangqiang.png` | 待出图 | [eq_songyaxiangqiang.md](items/weapons/eq_songyaxiangqiang.md) |
| items | `eq_songzhanmadao` | 宋斩马刀 | `assets/default/item/weapons/eq_songzhanmadao.png` | 待出图 | [eq_songzhanmadao.md](items/weapons/eq_songzhanmadao.md) |
| items | `eq_tanghengdao` | 唐横刀 | `assets/default/item/weapons/eq_tanghengdao.png` | 待出图 | [eq_tanghengdao.md](items/weapons/eq_tanghengdao.md) |
| items | `eq_tangjunyingbang` | 唐军营棒 | `assets/default/item/weapons/eq_tangjunyingbang.png` | 待出图 | [eq_tangjunyingbang.md](items/weapons/eq_tangjunyingbang.md) |
| items | `eq_tangjunzhangyue` | 唐军长钺 | `assets/default/item/weapons/eq_tangjunzhangyue.png` | 待出图 | [eq_tangjunzhangyue.md](items/weapons/eq_tangjunzhangyue.md) |
| items | `eq_tangjunzhijian` | 唐军直剑 | `assets/default/item/weapons/eq_tangjunzhijian.png` | 待出图 | [eq_tangjunzhijian.md](items/weapons/eq_tangjunzhijian.md) |
| items | `eq_tangmaqishuo` | 唐骑矟 | `assets/default/item/weapons/eq_tangmaqishuo.png` | 待出图 | [eq_tangmaqishuo.md](items/weapons/eq_tangmaqishuo.md) |
| items | `eq_tangmodao` | 唐陌刀 | `assets/default/item/weapons/eq_tangmodao.png` | 待出图 | [eq_tangmodao.md](items/weapons/eq_tangmodao.md) |
| items | `eq_tangyidao` | 唐仪刀 | `assets/default/item/weapons/eq_tangyidao.png` | 待出图 | [eq_tangyidao.md](items/weapons/eq_tangyidao.md) |
| items | `eq_tianboguangkuaidao` | 田伯光快刀 | `assets/default/item/weapons/eq_tianboguangkuaidao.png` | 待出图 | [eq_tianboguangkuaidao.md](items/weapons/eq_tianboguangkuaidao.md) |
| items | `eq_tielianfeizhua` | 铁链飞爪 | `assets/default/item/weapons/eq_tielianfeizhua.png` | 待出图 | [eq_tielianfeizhua.md](items/weapons/eq_tielianfeizhua.md) |
| items | `eq_tiesuanpan` | 铁算盘 | `assets/default/item/weapons/eq_tiesuanpan.png` | 待出图 | [eq_tiesuanpan.md](items/weapons/eq_tiesuanpan.md) |
| items | `eq_tubochangmao` | 吐蕃长矛 | `assets/default/item/weapons/eq_tubochangmao.png` | 待出图 | [eq_tubochangmao.md](items/weapons/eq_tubochangmao.md) |
| items | `eq_tubohuanshoudao` | 吐蕃环首刀 | `assets/default/item/weapons/eq_tubohuanshoudao.png` | 待出图 | [eq_tubohuanshoudao.md](items/weapons/eq_tubohuanshoudao.md) |
| items | `eq_tubotiebang` | 吐蕃铁头杖 | `assets/default/item/weapons/eq_tubotiebang.png` | 待出图 | [eq_tubotiebang.md](items/weapons/eq_tubotiebang.md) |
| items | `eq_tubotiejian` | 吐蕃铁剑 | `assets/default/item/weapons/eq_tubotiejian.png` | 待出图 | [eq_tubotiejian.md](items/weapons/eq_tubotiejian.md) |
| items | `eq_tubotiejingangchu` | 吐蕃铁金刚杵 | `assets/default/item/weapons/eq_tubotiejingangchu.png` | 待出图 | [eq_tubotiejingangchu.md](items/weapons/eq_tubotiejingangchu.md) |
| items | `eq_wangweiyangbaguadao` | 王维扬八卦刀 | `assets/default/item/weapons/eq_wangweiyangbaguadao.png` | 待出图 | [eq_wangweiyangbaguadao.md](items/weapons/eq_wangweiyangbaguadao.md) |
| items | `eq_wujietiedi` | 五节铁笛 | `assets/default/item/weapons/eq_wujietiedi.png` | 待出图 | [eq_wujietiedi.md](items/weapons/eq_wujietiedi.md) |
| items | `eq_wuleitiejian` | 五雷铁简 | `assets/default/item/weapons/eq_wuleitiejian.png` | 待出图 | [eq_wuleitiejian.md](items/weapons/eq_wuleitiejian.md) |
| items | `eq_wuyueqingtongjian` | 吴越青铜剑 | `assets/default/item/weapons/eq_wuyueqingtongjian.png` | 待出图 | [eq_wuyueqingtongjian.md](items/weapons/eq_wuyueqingtongjian.md) |
| items | `eq_xiaoxiangzikusangbang` | 潇湘子哭丧棒 | `assets/default/item/weapons/eq_xiaoxiangzikusangbang.png` | 待出图 | [eq_xiaoxiangzikusangbang.md](items/weapons/eq_xiaoxiangzikusangbang.md) |
| items | `eq_xiyuhuanshoujian` | 西域环首剑 | `assets/default/item/weapons/eq_xiyuhuanshoujian.png` | 待出图 | [eq_xiyuhuanshoujian.md](items/weapons/eq_xiyuhuanshoujian.md) |
| items | `eq_xiyujietougun` | 西域节头棍 | `assets/default/item/weapons/eq_xiyujietougun.png` | 待出图 | [eq_xiyujietougun.md](items/weapons/eq_xiyujietougun.md) |
| items | `eq_xiyuqidao` | 西域骑刀 | `assets/default/item/weapons/eq_xiyuqidao.png` | 待出图 | [eq_xiyuqidao.md](items/weapons/eq_xiyuqidao.md) |
| items | `eq_xiyuyueyachan` | 西域月牙铲 | `assets/default/item/weapons/eq_xiyuyueyachan.png` | 待出图 | [eq_xiyuyueyachan.md](items/weapons/eq_xiyuyueyachan.md) |
| items | `eq_xuangutieshan` | 玄骨铁扇 | `assets/default/item/weapons/eq_xuangutieshan.png` | 待出图 | [eq_xuangutieshan.md](items/weapons/eq_xuangutieshan.md) |
| items | `eq_xuanmenshuangguai` | 玄门双拐 | `assets/default/item/weapons/eq_xuanmenshuangguai.png` | 待出图 | [eq_xuanmenshuangguai.md](items/weapons/eq_xuanmenshuangguai.md) |
| items | `eq_xuantielepipa` | 铁琵琶 | `assets/default/item/weapons/eq_xuantielepipa.png` | 待出图 | [eq_xuantielepipa.md](items/weapons/eq_xuantielepipa.md) |
| items | `eq_yeerniangfangdao` | 叶二娘方头薄刀 | `assets/default/item/weapons/eq_yeerniangfangdao.png` | 待出图 | [eq_yeerniangfangdao.md](items/weapons/eq_yeerniangfangdao.md) |
| items | `eq_yinkexijinlongbian` | 尹克西金龙鞭 | `assets/default/item/weapons/eq_yinkexijinlongbian.png` | 待出图 | [eq_yinkexijinlongbian.md](items/weapons/eq_yinkexijinlongbian.md) |
| items | `eq_yinyangruanlun` | 阴阳软刃轮 | `assets/default/item/weapons/eq_yinyangruanlun.png` | 待出图 | [eq_yinyangruanlun.md](items/weapons/eq_yinyangruanlun.md) |
| items | `eq_yiziguai` | 一字铁拐 | `assets/default/item/weapons/eq_yiziguai.png` | 待出图 | [eq_yiziguai.md](items/weapons/eq_yiziguai.md) |
| items | `eq_yuanjungalengguduo` | 元军瓜棱骨朵 | `assets/default/item/weapons/eq_yuanjungalengguduo.png` | 待出图 | [eq_yuanjungalengguduo.md](items/weapons/eq_yuanjungalengguduo.md) |
| items | `eq_yuanjunmabang` | 元军铁箍马棒 | `assets/default/item/weapons/eq_yuanjunmabang.png` | 待出图 | [eq_yuanjunmabang.md](items/weapons/eq_yuanjunmabang.md) |
| items | `eq_yuanjunqishuo` | 元军骑矟 | `assets/default/item/weapons/eq_yuanjunqishuo.png` | 待出图 | [eq_yuanjunqishuo.md](items/weapons/eq_yuanjunqishuo.md) |
| items | `eq_yuanjunwandao` | 元军弯刀 | `assets/default/item/weapons/eq_yuanjunwandao.png` | 待出图 | [eq_yuanjunwandao.md](items/weapons/eq_yuanjunwandao.md) |
| items | `eq_yuanjunzhijian` | 元军护手直剑 | `assets/default/item/weapons/eq_yuanjunzhijian.png` | 待出图 | [eq_yuanjunzhijian.md](items/weapons/eq_yuanjunzhijian.md) |
| items | `eq_yuanyangyue` | 鸳鸯钺 | `assets/default/item/weapons/eq_yuanyangyue.png` | 待出图 | [eq_yuanyangyue.md](items/weapons/eq_yuanyangyue.md) |
| items | `eq_yueyashuanggou` | 月牙双钩 | `assets/default/item/weapons/eq_yueyashuanggou.png` | 待出图 | [eq_yueyashuanggou.md](items/weapons/eq_yueyashuanggou.md) |
| items | `eq_yuguanchen` | 玉管拂尘 | `assets/default/item/weapons/eq_yuguanchen.png` | 待出图 | [eq_yuguanchen.md](items/weapons/eq_yuguanchen.md) |
| items | `eq_yunzhonghegangzhua` | 云中鹤钢抓 | `assets/default/item/weapons/eq_yunzhonghegangzhua.png` | 待出图 | [eq_yunzhonghegangzhua.md](items/weapons/eq_yunzhonghegangzhua.md) |
| items | `eq_zhangashengtuniudao` | 张阿生屠牛刀 | `assets/default/item/weapons/eq_zhangashengtuniudao.png` | 待出图 | [eq_zhangashengtuniudao.md](items/weapons/eq_zhangashengtuniudao.md) |
| items | `eq_zhangbaqushemao` | 丈八曲蛇矛 | `assets/default/item/weapons/eq_zhangbaqushemao.png` | 待出图 | [eq_zhangbaqushemao.md](items/weapons/eq_zhangbaqushemao.md) |
| items | `eq_zhucongtieshan` | 朱聪铁扇 | `assets/default/item/weapons/eq_zhucongtieshan.png` | 待出图 | [eq_zhucongtieshan.md](items/weapons/eq_zhucongtieshan.md) |
| items | `eq_zhudanchenpanguanbi` | 朱丹臣判官笔 | `assets/default/item/weapons/eq_zhudanchenpanguanbi.png` | 待出图 | [eq_zhudanchenpanguanbi.md](items/weapons/eq_zhudanchenpanguanbi.md) |
| items | `eq_zhujieduanzhang` | 竹节短杖 | `assets/default/item/weapons/eq_zhujieduanzhang.png` | 待出图 | [eq_zhujieduanzhang.md](items/weapons/eq_zhujieduanzhang.md) |
| items | `eq_zimuwuyanglun` | 子母五阳轮 | `assets/default/item/weapons/eq_zimuwuyanglun.png` | 待出图 | [eq_zimuwuyanglun.md](items/weapons/eq_zimuwuyanglun.md) |
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
| rig | `rig_female_std__ref_back34` | 女性标准体 · back34 全身参考图 | `assets/default/rig/female_std/ref_back34.png` | 待出图 | [ref_back34.md](rig/female_std/ref_back34.md) |
| rig | `rig_female_std__ref_front34` | 女性标准体 · front34 全身参考图 | `assets/default/rig/female_std/ref_front34.png` | 待出图 | [ref_front34.md](rig/female_std/ref_front34.md) |
| rig | `rig_female_std__ref_side` | 女性标准体 · side 全身参考图 | `assets/default/rig/female_std/ref_side.png` | 待出图 | [ref_side.md](rig/female_std/ref_side.md) |
| rig | `rig_male_std__ref_back34` | 男性标准体 · back34 全身参考图 | `assets/default/rig/male_std/ref_back34.png` | 待出图 | [ref_back34.md](rig/male_std/ref_back34.md) |
| rig | `rig_male_std__ref_front34` | 男性标准体 · front34 全身参考图 | `assets/default/rig/male_std/ref_front34.png` | 待出图 | [ref_front34.md](rig/male_std/ref_front34.md) |
| rig | `rig_male_std__ref_side` | 男性标准体 · side 全身参考图 | `assets/default/rig/male_std/ref_side.png` | 待出图 | [ref_side.md](rig/male_std/ref_side.md) |

## 物品（11 类，名录 732 项）

每张图的提示词在各文件「提示词」节。下表只列还要出的行（待出图 / 待重出），已入库的不再列出，标题里的计数含已出部分。作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可回到队列。

### 药物 / 补品 / 药材（96）· 待出图 60、已通过（作者） 32、已入库 4

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 冰蚕 | `it_bingcan` | 天 | 药材·动物 | 待出图 | [it_bingcan.md](items/medicine/it_bingcan.md) | template |
| 2 | 莽牯朱蛤 | `it_mangguzhuha` | 天 | 药材·动物 | 待出图 | [it_mangguzhuha.md](items/medicine/it_mangguzhuha.md) | template |
| 3 | 朱睛冰蟾 | `it_zhujingbingchan` | 天 | 药材·动物 | 待出图 | [it_zhujingbingchan.md](items/medicine/it_zhujingbingchan.md) | template |
| 4 | 蟾酥 | `it_chansu` | 地 | 药材·动物 | 待出图 | [it_chansu.md](items/medicine/it_chansu.md) | template |
| 5 | 冬虫夏草 | `it_dongchongxiacao` | 地 | 药材·菌藻 | 待出图 | [it_dongchongxiacao.md](items/medicine/it_dongchongxiacao.md) | template |
| 6 | 断肠蚀骨腐心草 | `it_duanchangshigufuxincao` | 地 | 药材·草本 | 待出图 | [it_duanchangshigufuxincao.md](items/medicine/it_duanchangshigufuxincao.md) | template |
| 7 | 何首乌 | `it_heshouwu` | 地 | 药材·根茎 | 待出图 | [it_heshouwu.md](items/medicine/it_heshouwu.md) | template |
| 8 | 金波旬花 | `it_jinboxunhua` | 地 | 药材·花果 | 待出图 | [it_jinboxunhua.md](items/medicine/it_jinboxunhua.md) | template |
| 9 | 曼陀罗花 | `it_mantuoluo` | 地 | 药材·草本 | 待出图 | [it_mantuoluo.md](items/medicine/it_mantuoluo.md) | template |
| 10 | 马钱子 | `it_maqianzi` | 地 | 药材·花果 | 待出图 | [it_maqianzi.md](items/medicine/it_maqianzi.md) | template |
| 11 | 牛黄 | `it_niuhuang` | 地 | 药材·动物 | 待出图 | [it_niuhuang.md](items/medicine/it_niuhuang.md) | template |
| 12 | 菩斯曲蛇胆 | `it_pusiqushedan` | 地 | 药材·动物 | 待出图 | [it_pusiqushedan.md](items/medicine/it_pusiqushedan.md) | template |
| 13 | 情花 | `it_qinghua` | 地 | 药材·草本 | 待出图 | [it_qinghua.md](items/medicine/it_qinghua.md) | template |
| 14 | 七心海棠 | `it_qixinhaitang` | 地 | 药材·草本 | 待出图 | [it_qixinhaitang.md](items/medicine/it_qixinhaitang.md) | template |
| 15 | 麝香 | `it_shexiang` | 地 | 药材·动物 | 待出图 | [it_shexiang.md](items/medicine/it_shexiang.md) | template |
| 16 | 乌头 | `it_wutou` | 地 | 药材·根茎 | 待出图 | [it_wutou.md](items/medicine/it_wutou.md) | template |
| 17 | 犀角 | `it_xijiao` | 地 | 药材·动物 | 待出图 | [it_xijiao.md](items/medicine/it_xijiao.md) | template |
| 18 | 熊胆 | `it_xiongdan` | 地 | 药材·动物 | 待出图 | [it_xiongdan.md](items/medicine/it_xiongdan.md) | template |
| 19 | 白术 | `it_baizhu` | 玄 | 药材·根茎 | 待出图 | [it_baizhu.md](items/medicine/it_baizhu.md) | template |
| 20 | 柴胡 | `it_chaihu` | 玄 | 药材·根茎 | 待出图 | [it_chaihu.md](items/medicine/it_chaihu.md) | template |
| 21 | 川芎 | `it_chuanxiong` | 玄 | 药材·根茎 | 待出图 | [it_chuanxiong.md](items/medicine/it_chuanxiong.md) | template |
| 22 | 党参 | `it_dangshen` | 玄 | 药材·根茎 | 待出图 | [it_dangshen.md](items/medicine/it_dangshen.md) | template |
| 23 | 丹参 | `it_danshen` | 玄 | 药材·根茎 | 待出图 | [it_danshen.md](items/medicine/it_danshen.md) | template |
| 24 | 黄连 | `it_huanglian` | 玄 | 药材·根茎 | 待出图 | [it_huanglian.md](items/medicine/it_huanglian.md) | template |
| 25 | 黄芩 | `it_huangqin` | 玄 | 药材·根茎 | 待出图 | [it_huangqin.md](items/medicine/it_huangqin.md) | template |
| 26 | 灵芝 | `it_lingzhi` | 玄 | 药材·菌藻 | 待出图 | [it_lingzhi.md](items/medicine/it_lingzhi.md) | template |
| 27 | 龙骨 | `it_longgu` | 玄 | 药材·矿物 | 待出图 | [it_longgu.md](items/medicine/it_longgu.md) | template |
| 28 | 鹿茸 | `it_lurong` | 玄 | 药材·动物 | 待出图 | [it_lurong.md](items/medicine/it_lurong.md) | template |
| 29 | 麻黄 | `it_mahuang` | 玄 | 药材·草本 | 待出图 | [it_mahuang.md](items/medicine/it_mahuang.md) | template |
| 30 | 青蒿 | `it_qinghao` | 玄 | 药材·草本 | 待出图 | [it_qinghao.md](items/medicine/it_qinghao.md) | template |
| 31 | 三七 | `it_sanqi` | 玄 | 药材·根茎 | 待出图 | [it_sanqi.md](items/medicine/it_sanqi.md) | template |
| 32 | 石斛 | `it_shihu` | 玄 | 药材·草本 | 待出图 | [it_shihu.md](items/medicine/it_shihu.md) | template |
| 33 | 天麻 | `it_tianma` | 玄 | 药材·根茎 | 待出图 | [it_tianma.md](items/medicine/it_tianma.md) | template |
| 34 | 五味子 | `it_wuweizi` | 玄 | 药材·花果 | 待出图 | [it_wuweizi.md](items/medicine/it_wuweizi.md) | template |
| 35 | 雄黄 | `it_xionghuang` | 玄 | 药材·矿物 | 待出图 | [it_xionghuang.md](items/medicine/it_xionghuang.md) | template |
| 36 | 朱砂 | `it_zhusha` | 玄 | 药材·矿物 | 待出图 | [it_zhusha.md](items/medicine/it_zhusha.md) | template |
| 37 | 车前子 | `it_cheqianzi` | 黄 | 药材·花果 | 待出图 | [it_cheqianzi.md](items/medicine/it_cheqianzi.md) | template |
| 38 | 当归 | `it_danggui` | 黄 | 药材·根茎 | 待出图 | [it_danggui.md](items/medicine/it_danggui.md) | template |
| 39 | 大枣 | `it_dazao` | 黄 | 药材·花果 | 待出图 | [it_dazao.md](items/medicine/it_dazao.md) | template |
| 40 | 地龙 | `it_dilong` | 黄 | 药材·动物 | 待出图 | [it_dilong.md](items/medicine/it_dilong.md) | template |
| 41 | 茯苓 | `it_fuling` | 黄 | 药材·菌藻 | 待出图 | [it_fuling.md](items/medicine/it_fuling.md) | template |
| 42 | 甘草 | `it_gancao` | 黄 | 药材·根茎 | 待出图 | [it_gancao.md](items/medicine/it_gancao.md) | template |
| 43 | 干姜 | `it_ganjiang` | 黄 | 药材·根茎 | 待出图 | [it_ganjiang.md](items/medicine/it_ganjiang.md) | template |
| 44 | 葛根 | `it_gegen` | 黄 | 药材·根茎 | 待出图 | [it_gegen.md](items/medicine/it_gegen.md) | template |
| 45 | 枸杞子 | `it_gouqizi` | 黄 | 药材·花果 | 待出图 | [it_gouqizi.md](items/medicine/it_gouqizi.md) | template |
| 46 | 海藻 | `it_haizao` | 黄 | 药材·菌藻 | 待出图 | [it_haizao.md](items/medicine/it_haizao.md) | template |
| 47 | 黄芪 | `it_huangqi` | 黄 | 药材·根茎 | 待出图 | [it_huangqi.md](items/medicine/it_huangqi.md) | template |
| 48 | 藿香 | `it_huoxiang` | 黄 | 药材·草本 | 待出图 | [it_huoxiang.md](items/medicine/it_huoxiang.md) | template |
| 49 | 桔梗 | `it_jiegeng` | 黄 | 药材·根茎 | 待出图 | [it_jiegeng.md](items/medicine/it_jiegeng.md) | template |
| 50 | 荆芥 | `it_jingjie` | 黄 | 药材·草本 | 待出图 | [it_jingjie.md](items/medicine/it_jingjie.md) | template |
| 51 | 金银花 | `it_jinyinhua` | 黄 | 药材·花果 | 待出图 | [it_jinyinhua.md](items/medicine/it_jinyinhua.md) | template |
| 52 | 菊花 | `it_juhua` | 黄 | 药材·花果 | 待出图 | [it_juhua.md](items/medicine/it_juhua.md) | template |
| 53 | 连翘 | `it_lianqiao` | 黄 | 药材·花果 | 待出图 | [it_lianqiao.md](items/medicine/it_lianqiao.md) | template |
| 54 | 蒲公英 | `it_pugongying` | 黄 | 药材·草本 | 待出图 | [it_pugongying.md](items/medicine/it_pugongying.md) | template |
| 55 | 石膏 | `it_shigao` | 黄 | 药材·矿物 | 待出图 | [it_shigao.md](items/medicine/it_shigao.md) | template |
| 56 | 仙鹤草 | `it_xianhecao` | 黄 | 药材·草本 | 待出图 | [it_xianhecao.md](items/medicine/it_xianhecao.md) | template |
| 57 | 益母草 | `it_yimucao` | 黄 | 药材·草本 | 待出图 | [it_yimucao.md](items/medicine/it_yimucao.md) | template |
| 58 | 鱼腥草 | `it_yuxingcao` | 黄 | 药材·草本 | 待出图 | [it_yuxingcao.md](items/medicine/it_yuxingcao.md) | template |
| 59 | 猪苓 | `it_zhuling` | 黄 | 药材·菌藻 | 待出图 | [it_zhuling.md](items/medicine/it_zhuling.md) | template |
| 60 | 紫苏叶 | `it_zisunye` | 黄 | 药材·草本 | 待出图 | [it_zisunye.md](items/medicine/it_zisunye.md) | template |

### 食材 / 食品（174）· 已入库 146、已通过（作者） 28

（已全部入库。）

### 武学秘籍（18）· 已入库 18

（已全部入库。）

### 兵器（247）· 待出图 128、已入库 95、已通过（作者） 24

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 丹青生长剑 | `eq_danqingshengchangjian` | 地下 | 兵器·剑 | 待出图 | [eq_danqingshengchangjian.md](items/weapons/eq_danqingshengchangjian.md) | template |
| 2 | 樊一翁钢杖 | `eq_fanyiwenggangzhang` | 地中 | 兵器·棍杖 | 待出图 | [eq_fanyiwenggangzhang.md](items/weapons/eq_fanyiwenggangzhang.md) | template |
| 3 | 韩宝驹金龙鞭 | `eq_hanbaojinlongbian` | 地中 | 兵器·鞭索 | 待出图 | [eq_hanbaojinlongbian.md](items/weapons/eq_hanbaojinlongbian.md) | template |
| 4 | 花铁干铁枪 | `eq_huatiegantieqiang` | 地下 | 兵器·枪 | 待出图 | [eq_huatiegantieqiang.md](items/weapons/eq_huatiegantieqiang.md) | template |
| 5 | 蒋四根铁桨 | `eq_jiangsigentiejang` | 地下 | 兵器·奇门桨 | 待出图 | [eq_jiangsigentiejang.md](items/weapons/eq_jiangsigentiejang.md) | template |
| 6 | 金花婆婆金花杖 | `eq_jinhuapopojinhuazhang` | 地中 | 兵器·棍杖 | 待出图 | [eq_jinhuapopojinhuazhang.md](items/weapons/eq_jinhuapopojinhuazhang.md) | template |
| 7 | 骆冰鸳鸯短刀 | `eq_luobingyuanyangdao` | 地下 | 兵器·刀 | 待出图 | [eq_luobingyuanyangdao.md](items/weapons/eq_luobingyuanyangdao.md) | template |
| 8 | 陆天抒鬼头刀 | `eq_lutianshuguitoudao` | 地下 | 兵器·刀 | 待出图 | [eq_lutianshuguitoudao.md](items/weapons/eq_lutianshuguitoudao.md) | template |
| 9 | 苗人凤佩剑 | `eq_miaorenfengpeijian` | 地上 | 兵器·剑 | 待出图 | [eq_miaorenfengpeijian.md](items/weapons/eq_miaorenfengpeijian.md) | template |
| 10 | 木高峰驼剑 | `eq_mugaofengtuojian` | 地下 | 兵器·剑 | 待出图 | [eq_mugaofengtuojian.md](items/weapons/eq_mugaofengtuojian.md) | template |
| 11 | 全金发大秤 | `eq_quanjinfadacheng` | 地下 | 兵器·奇门秤 | 待出图 | [eq_quanjinfadacheng.md](items/weapons/eq_quanjinfadacheng.md) | template |
| 12 | 田伯光快刀 | `eq_tianboguangkuaidao` | 地中 | 兵器·刀 | 待出图 | [eq_tianboguangkuaidao.md](items/weapons/eq_tianboguangkuaidao.md) | template |
| 13 | 王维扬八卦刀 | `eq_wangweiyangbaguadao` | 地中 | 兵器·刀 | 待出图 | [eq_wangweiyangbaguadao.md](items/weapons/eq_wangweiyangbaguadao.md) | template |
| 14 | 潇湘子哭丧棒 | `eq_xiaoxiangzikusangbang` | 地中 | 兵器·棍 | 待出图 | [eq_xiaoxiangzikusangbang.md](items/weapons/eq_xiaoxiangzikusangbang.md) | template |
| 15 | 云中鹤钢抓 | `eq_yunzhonghegangzhua` | 地下 | 兵器·奇门爪 | 待出图 | [eq_yunzhonghegangzhua.md](items/weapons/eq_yunzhonghegangzhua.md) | template |
| 16 | 朱丹臣判官笔 | `eq_zhudanchenpanguanbi` | 地下 | 兵器·奇门笔 | 待出图 | [eq_zhudanchenpanguanbi.md](items/weapons/eq_zhudanchenpanguanbi.md) | template |
| 17 | 不戒和尚戒刀 | `eq_bujiejiedao` | 玄上 | 兵器·刀 | 待出图 | [eq_bujiejiedao.md](items/weapons/eq_bujiejiedao.md) | template |
| 18 | 长柄月牙铲 | `eq_changbingyueyachan` | 玄中 | 兵器·奇门铲 | 待出图 | [eq_changbingyueyachan.md](items/weapons/eq_changbingyueyachan.md) | template |
| 19 | 褚万里铁钓竿 | `eq_chuwanlidiaogan` | 玄上 | 兵器·奇门钩 | 待出图 | [eq_chuwanlidiaogan.md](items/weapons/eq_chuwanlidiaogan.md) | template |
| 20 | 大理护军短刀 | `eq_dalihujundao` | 玄中 | 兵器·刀 | 待出图 | [eq_dalihujundao.md](items/weapons/eq_dalihujundao.md) | template |
| 21 | 大理护军剑 | `eq_dalihujunjian` | 玄下 | 兵器·剑 | 待出图 | [eq_dalihujunjian.md](items/weapons/eq_dalihujunjian.md) | template |
| 22 | 大理护军铜环 | `eq_dalijunhuan` | 玄上 | 兵器·奇门轮 | 待出图 | [eq_dalijunhuan.md](items/weapons/eq_dalijunhuan.md) | template |
| 23 | 大理军杖 | `eq_dalijunzhang` | 玄中 | 兵器·棍杖 | 待出图 | [eq_dalijunzhang.md](items/weapons/eq_dalijunzhang.md) | template |
| 24 | 方便铲 | `eq_fangbianchan` | 玄下 | 兵器·奇门铲 | 待出图 | [eq_fangbianchan.md](items/weapons/eq_fangbianchan.md) | template |
| 25 | 凤尾双笔 | `eq_fengweishuangbi` | 玄上 | 兵器·奇门笔 | 待出图 | [eq_fengweishuangbi.md](items/weapons/eq_fengweishuangbi.md) | template |
| 26 | 含宝圆棍 | `eq_hanbaoyuangun` | 玄中 | 兵器·棍 | 待出图 | [eq_hanbaoyuangun.md](items/weapons/eq_hanbaoyuangun.md) | template |
| 27 | 韩小莹越女剑 | `eq_hanxiaoyingyuenvjian` | 玄上 | 兵器·剑 | 待出图 | [eq_hanxiaoyingyuenvjian.md](items/weapons/eq_hanxiaoyingyuenvjian.md) | template |
| 28 | 黑角铁尺 | `eq_heijiaotiechi` | 玄中 | 兵器·奇门尺 | 待出图 | [eq_heijiaotiechi.md](items/weapons/eq_heijiaotiechi.md) | template |
| 29 | 蝴蝶双短剑 | `eq_hudiejian` | 玄中 | 兵器·奇门匕 | 待出图 | [eq_hudiejian.md](items/weapons/eq_hudiejian.md) | template |
| 30 | 回部包铁棒 | `eq_huibubaotiebang` | 玄上 | 兵器·棍 | 待出图 | [eq_huibubaotiebang.md](items/weapons/eq_huibubaotiebang.md) | template |
| 31 | 回部长枪 | `eq_huibuchangqiang` | 玄上 | 兵器·枪 | 待出图 | [eq_huibuchangqiang.md](items/weapons/eq_huibuchangqiang.md) | template |
| 32 | 回部反曲佩刀 | `eq_huibufanqudao` | 玄上 | 兵器·刀 | 待出图 | [eq_huibufanqudao.md](items/weapons/eq_huibufanqudao.md) | template |
| 33 | 回部嵌角剑 | `eq_huibujiaojian` | 玄上 | 兵器·剑 | 待出图 | [eq_huibujiaojian.md](items/weapons/eq_huibujiaojian.md) | template |
| 34 | 回部护身铁扇 | `eq_huibutieshan` | 玄上 | 兵器·奇门扇 | 待出图 | [eq_huibutieshan.md](items/weapons/eq_huibutieshan.md) | template |
| 35 | 虎头护手钩 | `eq_hutougou` | 玄下 | 兵器·奇门钩 | 待出图 | [eq_hutougou.md](items/weapons/eq_hutougou.md) | template |
| 36 | 金军狼牙棒 | `eq_jinlangyabang` | 玄中 | 兵器·奇门锤 | 待出图 | [eq_jinlangyabang.md](items/weapons/eq_jinlangyabang.md) | template |
| 37 | 金丝夺命笔 | `eq_jinsiduomingbi` | 玄下 | 兵器·奇门笔 | 待出图 | [eq_jinsiduomingbi.md](items/weapons/eq_jinsiduomingbi.md) | template |
| 38 | 九节钢鞭 | `eq_jiujiegangbian` | 玄下 | 兵器·奇门鞭 | 待出图 | [eq_jiujiegangbian.md](items/weapons/eq_jiujiegangbian.md) | template |
| 39 | 辽金骑枪 | `eq_liaojinqiqiang` | 玄下 | 兵器·枪 | 待出图 | [eq_liaojinqiqiang.md](items/weapons/eq_liaojinqiqiang.md) | template |
| 40 | 辽金铁头棒 | `eq_liaojintiebang` | 玄下 | 兵器·棍 | 待出图 | [eq_liaojintiebang.md](items/weapons/eq_liaojintiebang.md) | template |
| 41 | 辽金铁骨朵 | `eq_liaojintiegu` | 玄下 | 兵器·奇门锤 | 待出图 | [eq_liaojintiegu.md](items/weapons/eq_liaojintiegu.md) | template |
| 42 | 刘乘风柔云剑 | `eq_liuchengfengrouyunjian` | 玄上 | 兵器·剑 | 待出图 | [eq_liuchengfengrouyunjian.md](items/weapons/eq_liuchengfengrouyunjian.md) | template |
| 43 | 蒙古骨箍棒 | `eq_menggugunbang` | 玄上 | 兵器·棍 | 待出图 | [eq_menggugunbang.md](items/weapons/eq_menggugunbang.md) | template |
| 44 | 蒙古骑兵刀 | `eq_mengguqibingdao` | 玄下 | 兵器·刀 | 待出图 | [eq_mengguqibingdao.md](items/weapons/eq_mengguqibingdao.md) | template |
| 45 | 蒙古铁套索 | `eq_menggutietaosuo` | 玄下 | 兵器·鞭索 | 待出图 | [eq_menggutietaosuo.md](items/weapons/eq_menggutietaosuo.md) | template |
| 46 | 蒙古卫士剑 | `eq_mengguweishijian` | 玄上 | 兵器·剑 | 待出图 | [eq_mengguweishijian.md](items/weapons/eq_mengguweishijian.md) | template |
| 47 | 明军大棒 | `eq_mingjundabang` | 玄中 | 兵器·棍 | 待出图 | [eq_mingjundabang.md](items/weapons/eq_mingjundabang.md) | template |
| 48 | 明军狼枪 | `eq_mingjunlangqiang` | 玄中 | 兵器·枪 | 待出图 | [eq_mingjunlangqiang.md](items/weapons/eq_mingjunlangqiang.md) | template |
| 49 | 明军狼筅 | `eq_mingjunlangxian` | 玄中 | 兵器·奇门筅 | 待出图 | [eq_mingjunlangxian.md](items/weapons/eq_mingjunlangxian.md) | template |
| 50 | 明军长刀（苗刀名待考） | `eq_mingmiaodao` | 玄中 | 兵器·长刀 | 待出图 | [eq_mingmiaodao.md](items/weapons/eq_mingmiaodao.md) | template |
| 51 | 明军镋钯 | `eq_mingtangpa` | 玄上 | 兵器·奇门镋钯 | 待出图 | [eq_mingtangpa.md](items/weapons/eq_mingtangpa.md) | template |
| 52 | 明营佩剑 | `eq_mingyingpeijian` | 玄下 | 兵器·剑 | 待出图 | [eq_mingyingpeijian.md](items/weapons/eq_mingyingpeijian.md) | template |
| 53 | 南希仁铁扁担 | `eq_nanxirentiebian` | 玄上 | 兵器·棍 | 待出图 | [eq_nanxirentiebian.md](items/weapons/eq_nanxirentiebian.md) | template |
| 54 | 尼摩星铁蛇 | `eq_nimoxingtieshe` | 玄上 | 兵器·奇门杖 | 待出图 | [eq_nimoxingtieshe.md](items/weapons/eq_nimoxingtieshe.md) | template |
| 55 | 麒麟镇纸 | `eq_qilinzhen` | 玄上 | 兵器·奇门镇纸 | 待出图 | [eq_qilinzhen.md](items/weapons/eq_qilinzhen.md) | template |
| 56 | 清营藤牌 | `eq_qingtengpai` | 玄上 | 兵器·奇门牌 | 待出图 | [eq_qingtengpai.md](items/weapons/eq_qingtengpai.md) | template |
| 57 | 清营长枪 | `eq_qingyingchangqiang` | 玄上 | 兵器·枪 | 待出图 | [eq_qingyingchangqiang.md](items/weapons/eq_qingyingchangqiang.md) | template |
| 58 | 清营佩剑 | `eq_qingyingpeijian` | 玄中 | 兵器·剑 | 待出图 | [eq_qingyingpeijian.md](items/weapons/eq_qingyingpeijian.md) | template |
| 59 | 清营铁箍棒 | `eq_qingyingtiebang` | 玄上 | 兵器·棍 | 待出图 | [eq_qingyingtiebang.md](items/weapons/eq_qingyingtiebang.md) | template |
| 60 | 清营腰刀 | `eq_qingyingyaodao` | 玄上 | 兵器·刀 | 待出图 | [eq_qingyingyaodao.md](items/weapons/eq_qingyingyaodao.md) | template |
| 61 | 三节铁棍 | `eq_sanjietiebang` | 玄下 | 兵器·鞭索 | 待出图 | [eq_sanjietiebang.md](items/weapons/eq_sanjietiebang.md) | template |
| 62 | 双流星锤 | `eq_shuangliuxingchui` | 玄中 | 兵器·鞭索 | 待出图 | [eq_shuangliuxingchui.md](items/weapons/eq_shuangliuxingchui.md) | template |
| 63 | 水岱冷月剑 | `eq_shuidailengyuejian` | 玄上 | 兵器·剑 | 待出图 | [eq_shuidailengyuejian.md](items/weapons/eq_shuidailengyuejian.md) | template |
| 64 | 宋斩马刀 | `eq_songzhanmadao` | 玄下 | 兵器·长刀 | 待出图 | [eq_songzhanmadao.md](items/weapons/eq_songzhanmadao.md) | template |
| 65 | 唐陌刀 | `eq_tangmodao` | 玄中 | 兵器·长刀 | 待出图 | [eq_tangmodao.md](items/weapons/eq_tangmodao.md) | template |
| 66 | 铁链飞爪 | `eq_tielianfeizhua` | 玄上 | 兵器·鞭索 | 待出图 | [eq_tielianfeizhua.md](items/weapons/eq_tielianfeizhua.md) | template |
| 67 | 吐蕃长矛 | `eq_tubochangmao` | 玄中 | 兵器·枪 | 待出图 | [eq_tubochangmao.md](items/weapons/eq_tubochangmao.md) | template |
| 68 | 吐蕃铁头杖 | `eq_tubotiebang` | 玄下 | 兵器·棍杖 | 待出图 | [eq_tubotiebang.md](items/weapons/eq_tubotiebang.md) | template |
| 69 | 吐蕃铁金刚杵 | `eq_tubotiejingangchu` | 玄中 | 兵器·奇门杵 | 待出图 | [eq_tubotiejingangchu.md](items/weapons/eq_tubotiejingangchu.md) | template |
| 70 | 五雷铁简 | `eq_wuleitiejian` | 玄上 | 兵器·奇门简 | 待出图 | [eq_wuleitiejian.md](items/weapons/eq_wuleitiejian.md) | template |
| 71 | 西域环首剑 | `eq_xiyuhuanshoujian` | 玄中 | 兵器·剑 | 待出图 | [eq_xiyuhuanshoujian.md](items/weapons/eq_xiyuhuanshoujian.md) | template |
| 72 | 玄门双拐 | `eq_xuanmenshuangguai` | 玄上 | 兵器·棍杖 | 待出图 | [eq_xuanmenshuangguai.md](items/weapons/eq_xuanmenshuangguai.md) | template |
| 73 | 叶二娘方头薄刀 | `eq_yeerniangfangdao` | 玄上 | 兵器·刀 | 待出图 | [eq_yeerniangfangdao.md](items/weapons/eq_yeerniangfangdao.md) | template |
| 74 | 尹克西金龙鞭 | `eq_yinkexijinlongbian` | 玄上 | 兵器·鞭索 | 待出图 | [eq_yinkexijinlongbian.md](items/weapons/eq_yinkexijinlongbian.md) | template |
| 75 | 阴阳软刃轮 | `eq_yinyangruanlun` | 玄中 | 兵器·奇门轮 | 待出图 | [eq_yinyangruanlun.md](items/weapons/eq_yinyangruanlun.md) | template |
| 76 | 元军瓜棱骨朵 | `eq_yuanjungalengguduo` | 玄下 | 兵器·奇门锤 | 待出图 | [eq_yuanjungalengguduo.md](items/weapons/eq_yuanjungalengguduo.md) | template |
| 77 | 元军铁箍马棒 | `eq_yuanjunmabang` | 玄中 | 兵器·棍 | 待出图 | [eq_yuanjunmabang.md](items/weapons/eq_yuanjunmabang.md) | template |
| 78 | 元军骑矟 | `eq_yuanjunqishuo` | 玄下 | 兵器·枪 | 待出图 | [eq_yuanjunqishuo.md](items/weapons/eq_yuanjunqishuo.md) | template |
| 79 | 元军弯刀 | `eq_yuanjunwandao` | 玄下 | 兵器·刀 | 待出图 | [eq_yuanjunwandao.md](items/weapons/eq_yuanjunwandao.md) | template |
| 80 | 玉管拂尘 | `eq_yuguanchen` | 玄上 | 兵器·鞭索 | 待出图 | [eq_yuguanchen.md](items/weapons/eq_yuguanchen.md) | template |
| 81 | 张阿生屠牛刀 | `eq_zhangashengtuniudao` | 玄上 | 兵器·刀 | 待出图 | [eq_zhangashengtuniudao.md](items/weapons/eq_zhangashengtuniudao.md) | template |
| 82 | 丈八曲蛇矛 | `eq_zhangbaqushemao` | 玄上 | 兵器·枪 | 待出图 | [eq_zhangbaqushemao.md](items/weapons/eq_zhangbaqushemao.md) | template |
| 83 | 朱聪铁扇 | `eq_zhucongtieshan` | 玄上 | 兵器·奇门扇 | 待出图 | [eq_zhucongtieshan.md](items/weapons/eq_zhucongtieshan.md) | template |
| 84 | 子母五阳轮 | `eq_zimuwuyanglun` | 玄上 | 兵器·奇门轮 | 待出图 | [eq_zimuwuyanglun.md](items/weapons/eq_zimuwuyanglun.md) | template |
| 85 | 补天网 | `eq_butianwang` | 黄下 | 兵器·奇门网 | 待出图 | [eq_butianwang.md](items/weapons/eq_butianwang.md) | template |
| 86 | 春秋青铜短刀 | `eq_chunqiuduanmadao` | 黄下 | 兵器·刀 | 待出图 | [eq_chunqiuduanmadao.md](items/weapons/eq_chunqiuduanmadao.md) | template |
| 87 | 春秋军棒 | `eq_chunqiujunbang` | 黄下 | 兵器·棍 | 待出图 | [eq_chunqiujunbang.md](items/weapons/eq_chunqiujunbang.md) | template |
| 88 | 春秋青铜戈 | `eq_chunqiutongge` | 黄下 | 兵器·奇门戈 | 待出图 | [eq_chunqiutongge.md](items/weapons/eq_chunqiutongge.md) | template |
| 89 | 春秋青铜矛 | `eq_chunqiutongmao` | 黄下 | 兵器·枪 | 待出图 | [eq_chunqiutongmao.md](items/weapons/eq_chunqiutongmao.md) | template |
| 90 | 大理军花枪 | `eq_dalijunhuaqiang` | 黄中 | 兵器·枪 | 待出图 | [eq_dalijunhuaqiang.md](items/weapons/eq_dalijunhuaqiang.md) | template |
| 91 | 峨眉对刺 | `eq_emeiduan_ci` | 黄下 | 兵器·奇门刺 | 待出图 | [eq_emeiduan_ci.md](items/weapons/eq_emeiduan_ci.md) | template |
| 92 | 金军长刀 | `eq_jinjunchangdao` | 黄中 | 兵器·刀 | 待出图 | [eq_jinjunchangdao.md](items/weapons/eq_jinjunchangdao.md) | template |
| 93 | 九环锡刀 | `eq_jiuhuanxidao` | 黄上 | 兵器·刀 | 待出图 | [eq_jiuhuanxidao.md](items/weapons/eq_jiuhuanxidao.md) | template |
| 94 | 九节鞭 | `eq_jiujiebian` | 黄中 | 兵器·鞭索 | 待出图 | [eq_jiujiebian.md](items/weapons/eq_jiujiebian.md) | template |
| 95 | 链子枪 | `eq_lianziqiang` | 黄中 | 兵器·鞭索 | 待出图 | [eq_lianziqiang.md](items/weapons/eq_lianziqiang.md) | template |
| 96 | 辽金佩剑 | `eq_liaojinpeijian` | 黄中 | 兵器·剑 | 待出图 | [eq_liaojinpeijian.md](items/weapons/eq_liaojinpeijian.md) | template |
| 97 | 清顺刀 | `eq_qingshundao` | 黄上 | 兵器·刀 | 待出图 | [eq_qingshundao.md](items/weapons/eq_qingshundao.md) | template |
| 98 | 青铜竖笛 | `eq_qingtongtiedi` | 黄上 | 兵器·奇门笛 | 待出图 | [eq_qingtongtiedi.md](items/weapons/eq_qingtongtiedi.md) | template |
| 99 | 日月乾坤圈 | `eq_riyueqiankunquan` | 黄中 | 兵器·奇门轮 | 待出图 | [eq_riyueqiankunquan.md](items/weapons/eq_riyueqiankunquan.md) | template |
| 100 | 双铁尺 | `eq_shuangtiechi` | 黄下 | 兵器·奇门尺 | 待出图 | [eq_shuangtiechi.md](items/weapons/eq_shuangtiechi.md) | template |
| 101 | 宋军步棍 | `eq_songbubinggun` | 黄上 | 兵器·棍 | 待出图 | [eq_songbubinggun.md](items/weapons/eq_songbubinggun.md) | template |
| 102 | 宋掉刀 | `eq_songdiaodao` | 黄下 | 兵器·长刀 | 待出图 | [eq_songdiaodao.md](items/weapons/eq_songdiaodao.md) | template |
| 103 | 宋钩镰枪 | `eq_songgoulianqiang` | 黄上 | 兵器·枪 | 待出图 | [eq_songgoulianqiang.md](items/weapons/eq_songgoulianqiang.md) | template |
| 104 | 宋军环首剑 | `eq_songjunhuanshoujian` | 黄下 | 兵器·剑 | 待出图 | [eq_songjunhuanshoujian.md](items/weapons/eq_songjunhuanshoujian.md) | template |
| 105 | 宋军旁牌 | `eq_songjunpangpai` | 黄上 | 兵器·奇门牌 | 待出图 | [eq_songjunpangpai.md](items/weapons/eq_songjunpangpai.md) | template |
| 106 | 宋军直矛 | `eq_songjunzhimao` | 黄下 | 兵器·枪 | 待出图 | [eq_songjunzhimao.md](items/weapons/eq_songjunzhimao.md) | template |
| 107 | 宋鸦项枪 | `eq_songyaxiangqiang` | 黄上 | 兵器·枪 | 待出图 | [eq_songyaxiangqiang.md](items/weapons/eq_songyaxiangqiang.md) | template |
| 108 | 唐横刀 | `eq_tanghengdao` | 黄中 | 兵器·刀 | 待出图 | [eq_tanghengdao.md](items/weapons/eq_tanghengdao.md) | template |
| 109 | 唐军营棒 | `eq_tangjunyingbang` | 黄中 | 兵器·棍 | 待出图 | [eq_tangjunyingbang.md](items/weapons/eq_tangjunyingbang.md) | template |
| 110 | 唐军长钺 | `eq_tangjunzhangyue` | 黄中 | 兵器·奇门斧 | 待出图 | [eq_tangjunzhangyue.md](items/weapons/eq_tangjunzhangyue.md) | template |
| 111 | 唐军直剑 | `eq_tangjunzhijian` | 黄中 | 兵器·剑 | 待出图 | [eq_tangjunzhijian.md](items/weapons/eq_tangjunzhijian.md) | template |
| 112 | 唐骑矟 | `eq_tangmaqishuo` | 黄中 | 兵器·枪 | 待出图 | [eq_tangmaqishuo.md](items/weapons/eq_tangmaqishuo.md) | template |
| 113 | 唐仪刀 | `eq_tangyidao` | 黄上 | 兵器·刀 | 待出图 | [eq_tangyidao.md](items/weapons/eq_tangyidao.md) | template |
| 114 | 铁算盘 | `eq_tiesuanpan` | 黄上 | 兵器·奇门算盘 | 待出图 | [eq_tiesuanpan.md](items/weapons/eq_tiesuanpan.md) | template |
| 115 | 吐蕃环首刀 | `eq_tubohuanshoudao` | 黄上 | 兵器·刀 | 待出图 | [eq_tubohuanshoudao.md](items/weapons/eq_tubohuanshoudao.md) | template |
| 116 | 吐蕃铁剑 | `eq_tubotiejian` | 黄上 | 兵器·剑 | 待出图 | [eq_tubotiejian.md](items/weapons/eq_tubotiejian.md) | template |
| 117 | 五节铁笛 | `eq_wujietiedi` | 黄中 | 兵器·奇门笛 | 待出图 | [eq_wujietiedi.md](items/weapons/eq_wujietiedi.md) | template |
| 118 | 吴越青铜剑 | `eq_wuyueqingtongjian` | 黄下 | 兵器·剑 | 待出图 | [eq_wuyueqingtongjian.md](items/weapons/eq_wuyueqingtongjian.md) | template |
| 119 | 西域节头棍 | `eq_xiyujietougun` | 黄上 | 兵器·棍 | 待出图 | [eq_xiyujietougun.md](items/weapons/eq_xiyujietougun.md) | template |
| 120 | 西域骑刀 | `eq_xiyuqidao` | 黄中 | 兵器·刀 | 待出图 | [eq_xiyuqidao.md](items/weapons/eq_xiyuqidao.md) | template |
| 121 | 西域月牙铲 | `eq_xiyuyueyachan` | 黄上 | 兵器·奇门铲 | 待出图 | [eq_xiyuyueyachan.md](items/weapons/eq_xiyuyueyachan.md) | template |
| 122 | 玄骨铁扇 | `eq_xuangutieshan` | 黄上 | 兵器·奇门扇 | 待出图 | [eq_xuangutieshan.md](items/weapons/eq_xuangutieshan.md) | template |
| 123 | 铁琵琶 | `eq_xuantielepipa` | 黄上 | 兵器·奇门琴 | 待出图 | [eq_xuantielepipa.md](items/weapons/eq_xuantielepipa.md) | template |
| 124 | 一字铁拐 | `eq_yiziguai` | 黄中 | 兵器·棍杖 | 待出图 | [eq_yiziguai.md](items/weapons/eq_yiziguai.md) | template |
| 125 | 元军护手直剑 | `eq_yuanjunzhijian` | 黄上 | 兵器·剑 | 待出图 | [eq_yuanjunzhijian.md](items/weapons/eq_yuanjunzhijian.md) | template |
| 126 | 鸳鸯钺 | `eq_yuanyangyue` | 黄下 | 兵器·奇门钺 | 待出图 | [eq_yuanyangyue.md](items/weapons/eq_yuanyangyue.md) | template |
| 127 | 月牙双钩 | `eq_yueyashuanggou` | 黄中 | 兵器·奇门钩 | 待出图 | [eq_yueyashuanggou.md](items/weapons/eq_yueyashuanggou.md) | template |
| 128 | 竹节短杖 | `eq_zhujieduanzhang` | 黄下 | 兵器·棍杖 | 待出图 | [eq_zhujieduanzhang.md](items/weapons/eq_zhujieduanzhang.md) | template |

### 衣物（30）· 已入库 18、已通过（作者） 12

（已全部入库。）

### 制式盔甲（8）· 已入库 8

（已全部入库。）

### 内甲（8）· 已通过（作者） 8

（已全部入库。）

### 护肩 / 披风 / 头饰（48）· 已入库 36、已通过（作者） 12

（已全部入库。）

### 鞋（26）· 已入库 18、已通过（作者） 8

（已全部入库。）

### 腰带（26）· 已入库 18、已通过（作者） 8

（已全部入库。）

### 暗器（51）· 已入库 26、待出图 25

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 飞燕银梭 | `eq_feiyanyinsuo` | 地中 | 暗器·名梭 | 待出图 | [eq_feiyanyinsuo.md](items/hidden-weapons/eq_feiyanyinsuo.md) | template |
| 2 | 回龙璧 | `eq_huilongbi` | 地中 | 暗器·名镖 | 待出图 | [eq_huilongbi.md](items/hidden-weapons/eq_huilongbi.md) | template |
| 3 | 金花镖 | `eq_jinhuabiao` | 地中 | 暗器·名镖 | 待出图 | [eq_jinhuabiao.md](items/hidden-weapons/eq_jinhuabiao.md) | template |
| 4 | 木桑铁棋子 | `eq_musangtieqizi` | 地下 | 暗器·名棋子 | 待出图 | [eq_musangtieqizi.md](items/hidden-weapons/eq_musangtieqizi.md) | template |
| 5 | 生死符冰片包 | `eq_shengsifubao` | 地上 | 暗器·名符 | 待出图 | [eq_shengsifubao.md](items/hidden-weapons/eq_shengsifubao.md) | template |
| 6 | 温方施二十四飞刀 | `eq_wenfangshifeidao` | 地下 | 暗器·名飞刀 | 待出图 | [eq_wenfangshifeidao.md](items/hidden-weapons/eq_wenfangshifeidao.md) | template |
| 7 | 无影银针 | `eq_wuyingyinzhen` | 地中 | 暗器·机括针靴 | 待出图 | [eq_wuyingyinzhen.md](items/hidden-weapons/eq_wuyingyinzhen.md) | template |
| 8 | 回部飞刀匣 | `eq_huibufeidaoxia` | 玄下 | 暗器·飞刀 | 待出图 | [eq_huibufeidaoxia.md](items/hidden-weapons/eq_huibufeidaoxia.md) | template |
| 9 | 九宫针盘 | `eq_jiugongzhenpan` | 玄上 | 暗器·针盘 | 待出图 | [eq_jiugongzhenpan.md](items/hidden-weapons/eq_jiugongzhenpan.md) | template |
| 10 | 连珠子午弩 | `eq_lianzhuziwunu` | 玄中 | 暗器·机括弩 | 待出图 | [eq_lianzhuziwunu.md](items/hidden-weapons/eq_lianzhuziwunu.md) | template |
| 11 | 流星弹匣 | `eq_liuxingdanxia` | 玄下 | 暗器·弹丸匣 | 待出图 | [eq_liuxingdanxia.md](items/hidden-weapons/eq_liuxingdanxia.md) | template |
| 12 | 青瓷连珠枪匣 | `eq_qingzilianzhuqiangxia` | 玄上 | 暗器·弹丸匣 | 待出图 | [eq_qingzilianzhuqiangxia.md](items/hidden-weapons/eq_qingzilianzhuqiangxia.md) | template |
| 13 | 孙仲君钢镖 | `eq_sunzhongjungangbiao` | 玄上 | 暗器·钢镖 | 待出图 | [eq_sunzhongjungangbiao.md](items/hidden-weapons/eq_sunzhongjungangbiao.md) | template |
| 14 | 透骨钉匣 | `eq_tougudingxia` | 玄中 | 暗器·钉匣 | 待出图 | [eq_tougudingxia.md](items/hidden-weapons/eq_tougudingxia.md) | template |
| 15 | 温方施飞刀备用匣 | `eq_wenfangshifeidaoxia` | 玄上 | 暗器·飞刀匣 | 待出图 | [eq_wenfangshifeidaoxia.md](items/hidden-weapons/eq_wenfangshifeidaoxia.md) | template |
| 16 | 五联飞饼匣 | `eq_wulianfeibingxia` | 玄上 | 暗器·轮刃匣 | 待出图 | [eq_wulianfeibingxia.md](items/hidden-weapons/eq_wulianfeibingxia.md) | template |
| 17 | 燕子镖囊 | `eq_yanzibiaonang` | 玄中 | 暗器·飞镖 | 待出图 | [eq_yanzibiaonang.md](items/hidden-weapons/eq_yanzibiaonang.md) | template |
| 18 | 蒙古马弹囊 | `eq_menggumadannang` | 黄上 | 暗器·弹丸囊 | 待出图 | [eq_menggumadannang.md](items/hidden-weapons/eq_menggumadannang.md) | template |
| 19 | 明式短弩匣 | `eq_mingduanluxia` | 黄中 | 暗器·机括弩 | 待出图 | [eq_mingduanluxia.md](items/hidden-weapons/eq_mingduanluxia.md) | template |
| 20 | 清式镖刀匣 | `eq_qingpiaodaoxia` | 黄中 | 暗器·飞刀 | 待出图 | [eq_qingpiaodaoxia.md](items/hidden-weapons/eq_qingpiaodaoxia.md) | template |
| 21 | 宋式手弩匣 | `eq_songshounuxia` | 黄下 | 暗器·机括弩 | 待出图 | [eq_songshounuxia.md](items/hidden-weapons/eq_songshounuxia.md) | template |
| 22 | 唐式飞梭袋 | `eq_tangfeisuodai` | 黄下 | 暗器·飞梭 | 待出图 | [eq_tangfeisuodai.md](items/hidden-weapons/eq_tangfeisuodai.md) | template |
| 23 | 吐蕃飞石囊 | `eq_tubofeishinang` | 黄上 | 暗器·弹丸囊 | 待出图 | [eq_tubofeishinang.md](items/hidden-weapons/eq_tubofeishinang.md) | template |
| 24 | 西域风叶镖囊 | `eq_xiyufengyebiaonang` | 黄上 | 暗器·飞镖 | 待出图 | [eq_xiyufengyebiaonang.md](items/hidden-weapons/eq_xiyufengyebiaonang.md) | template |
| 25 | 元骑手飞刀囊 | `eq_yuanqishoufeidaonang` | 黄中 | 暗器·飞刀 | 待出图 | [eq_yuanqishoufeidaonang.md](items/hidden-weapons/eq_yuanqishoufeidaonang.md) | template |

## 地图（31）· 待出图 31

全国导航图是 `tools/map/render_map.py` 从 design/19 数据生成的 SVG（14 个时代图层），**不是出图任务**。要画的是 30 个区域的水墨局部图（类比作者已审的大理苍洱局部图）；全国水墨衬纸为可选项。下表只列还要出的。

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
| male_std | front34 | [ref_front34.md](rig/male_std/ref_front34.md)（待出图） | （已全部入库） | 已入库 13 |
| male_std | back34 | [ref_back34.md](rig/male_std/ref_back34.md)（待出图） | （已全部入库） | 已入库 13 |
| male_std | side | [ref_side.md](rig/male_std/ref_side.md)（待出图） | （已全部入库） | 已入库 13 |
| female_std | front34 | [ref_front34.md](rig/female_std/ref_front34.md)（待出图） | （已全部入库） | 已入库 13 |
| female_std | back34 | [ref_back34.md](rig/female_std/ref_back34.md)（待出图） | （已全部入库） | 已入库 13 |
| female_std | side | [ref_side.md](rig/female_std/ref_side.md)（待出图） | （已全部入库） | 已入库 13 |

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
