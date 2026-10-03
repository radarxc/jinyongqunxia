# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）

> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。
> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。

提示词 **1009** 份：已入库 760、已通过（作者） 132、待出图 117。**待出图队列 117 行**（`python3 tools/agents/build_image_index.py --queue`）。

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
| items | `eq_menggumadannang` | 蒙古马弹囊 | `assets/default/item/hidden-weapons/eq_menggumadannang.png` | 待出图 | [eq_menggumadannang.md](items/hidden-weapons/eq_menggumadannang.md) |
| items | `eq_xiyufengyebiaonang` | 西域风叶镖囊 | `assets/default/item/hidden-weapons/eq_xiyufengyebiaonang.png` | 待出图 | [eq_xiyufengyebiaonang.md](items/hidden-weapons/eq_xiyufengyebiaonang.md) |
| items | `eq_yuanqishoufeidaonang` | 元骑手飞刀囊 | `assets/default/item/hidden-weapons/eq_yuanqishoufeidaonang.png` | 待出图 | [eq_yuanqishoufeidaonang.md](items/hidden-weapons/eq_yuanqishoufeidaonang.md) |
| items | `it_miji_baiyuanjianyi_can` | 白猿剑意残本 | `assets/default/item/manuals/it_miji_baiyuanjianyi_can.png` | 待出图 | [it_miji_baiyuanjianyi_can.md](items/manuals/it_miji_baiyuanjianyi_can.md) |
| items | `it_miji_biandufa` | 辨毒法全本 | `assets/default/item/manuals/it_miji_biandufa.png` | 待出图 | [it_miji_biandufa.md](items/manuals/it_miji_biandufa.md) |
| items | `it_miji_boruozhang` | 般若掌法古本 | `assets/default/item/manuals/it_miji_boruozhang.png` | 待出图 | [it_miji_boruozhang.md](items/manuals/it_miji_boruozhang.md) |
| items | `it_miji_changqiangrumen` | 长枪入门谱 | `assets/default/item/manuals/it_miji_changqiangrumen.png` | 待出图 | [it_miji_changqiangrumen.md](items/manuals/it_miji_changqiangrumen.md) |
| items | `it_miji_chousuizhang_can` | 抽髓掌残本 | `assets/default/item/manuals/it_miji_chousuizhang_can.png` | 待出图 | [it_miji_chousuizhang_can.md](items/manuals/it_miji_chousuizhang_can.md) |
| items | `it_miji_chunyangwuji` | 纯阳无极功抄本 | `assets/default/item/manuals/it_miji_chunyangwuji.png` | 待出图 | [it_miji_chunyangwuji.md](items/manuals/it_miji_chunyangwuji.md) |
| items | `it_miji_diqurumen` | 笛曲入门抄本 | `assets/default/item/manuals/it_miji_diqurumen.png` | 待出图 | [it_miji_diqurumen.md](items/manuals/it_miji_diqurumen.md) |
| items | `it_miji_fengshitoushu` | 风石投术简谱 | `assets/default/item/manuals/it_miji_fengshitoushu.png` | 待出图 | [it_miji_fengshitoushu.md](items/manuals/it_miji_fengshitoushu.md) |
| items | `it_miji_fumozhangfa` | 伏魔杖法古册 | `assets/default/item/manuals/it_miji_fumozhangfa.png` | 待出图 | [it_miji_fumozhangfa.md](items/manuals/it_miji_fumozhangfa.md) |
| items | `it_miji_gongshou_can` | 弓手法残本 | `assets/default/item/manuals/it_miji_gongshou_can.png` | 待出图 | [it_miji_gongshou_can.md](items/manuals/it_miji_gongshou_can.md) |
| items | `it_miji_gumuqinggong` | 古墓轻功图谱 | `assets/default/item/manuals/it_miji_gumuqinggong.png` | 待出图 | [it_miji_gumuqinggong.md](items/manuals/it_miji_gumuqinggong.md) |
| items | `it_miji_honghuahuiheji` | 红花会合击阵谱 | `assets/default/item/manuals/it_miji_honghuahuiheji.png` | 待出图 | [it_miji_honghuahuiheji.md](items/manuals/it_miji_honghuahuiheji.md) |
| items | `it_miji_huyuanquan` | 护院拳谱全本 | `assets/default/item/manuals/it_miji_huyuanquan.png` | 待出图 | [it_miji_huyuanquan.md](items/manuals/it_miji_huyuanquan.md) |
| items | `it_miji_jianghurumenjian` | 江湖入门剑谱 | `assets/default/item/manuals/it_miji_jianghurumenjian.png` | 待出图 | [it_miji_jianghurumenjian.md](items/manuals/it_miji_jianghurumenjian.md) |
| items | `it_miji_jinshejian` | 金蛇秘笈原本 | `assets/default/item/manuals/it_miji_jinshejian.png` | 待出图 | [it_miji_jinshejian.md](items/manuals/it_miji_jinshejian.md) |
| items | `it_miji_jinzhongzhao` | 金钟罩秘籍 | `assets/default/item/manuals/it_miji_jinzhongzhao.png` | 待出图 | [it_miji_jinzhongzhao.md](items/manuals/it_miji_jinzhongzhao.md) |
| items | `it_miji_jiuyang` | 九阳真经夹注原本 | `assets/default/item/manuals/it_miji_jiuyang.png` | 待出图 | [it_miji_jiuyang.md](items/manuals/it_miji_jiuyang.md) |
| items | `it_miji_jiuyinliaoshangpian` | 九阴真经古墓遗刻 | `assets/default/item/manuals/it_miji_jiuyinliaoshangpian.png` | 待出图 | [it_miji_jiuyinliaoshangpian.md](items/manuals/it_miji_jiuyinliaoshangpian.md) |
| items | `it_miji_junwuduandao` | 军伍短刀抄本 | `assets/default/item/manuals/it_miji_junwuduandao.png` | 待出图 | [it_miji_junwuduandao.md](items/manuals/it_miji_junwuduandao.md) |
| items | `it_miji_kuihua` | 葵花宝典传本 | `assets/default/item/manuals/it_miji_kuihua.png` | 待出图 | [it_miji_kuihua.md](items/manuals/it_miji_kuihua.md) |
| items | `it_miji_kurongchangong` | 枯荣禅功经折本 | `assets/default/item/manuals/it_miji_kurongchangong.png` | 待出图 | [it_miji_kurongchangong.md](items/manuals/it_miji_kurongchangong.md) |
| items | `it_miji_liezhengbu_can` | 列阵步残本 | `assets/default/item/manuals/it_miji_liezhengbu_can.png` | 待出图 | [it_miji_liezhengbu_can.md](items/manuals/it_miji_liezhengbu_can.md) |
| items | `it_miji_liumai` | 六脉神剑经丝绢原卷 | `assets/default/item/manuals/it_miji_liumai.png` | 待出图 | [it_miji_liumai.md](items/manuals/it_miji_liumai.md) |
| items | `it_miji_luohanfumo_can` | 罗汉伏魔神功泥人图 | `assets/default/item/manuals/it_miji_luohanfumo_can.png` | 待出图 | [it_miji_luohanfumo_can.md](items/manuals/it_miji_luohanfumo_can.md) |
| items | `it_miji_mohezhi` | 摩诃指秘要古籍 | `assets/default/item/manuals/it_miji_mohezhi.png` | 待出图 | [it_miji_mohezhi.md](items/manuals/it_miji_mohezhi.md) |
| items | `it_miji_muyangzhang` | 牧羊杖法简谱 | `assets/default/item/manuals/it_miji_muyangzhang.png` | 待出图 | [it_miji_muyangzhang.md](items/manuals/it_miji_muyangzhang.md) |
| items | `it_miji_nianhuazhi` | 拈花指法钞本 | `assets/default/item/manuals/it_miji_nianhuazhi.png` | 待出图 | [it_miji_nianhuazhi.md](items/manuals/it_miji_nianhuazhi.md) |
| items | `it_miji_piaomiaojian` | 缥缈剑法抄本 | `assets/default/item/manuals/it_miji_piaomiaojian.png` | 待出图 | [it_miji_piaomiaojian.md](items/manuals/it_miji_piaomiaojian.md) |
| items | `it_miji_qihuangmifa` | 胡青牛医经手本 | `assets/default/item/manuals/it_miji_qihuangmifa.png` | 待出图 | [it_miji_qihuangmifa.md](items/manuals/it_miji_qihuangmifa.md) |
| items | `it_miji_qishirumen_can` | 棋势入门残本 | `assets/default/item/manuals/it_miji_qishirumen_can.png` | 待出图 | [it_miji_qishirumen_can.md](items/manuals/it_miji_qishirumen_can.md) |
| items | `it_miji_shanyetuna` | 山野吐纳帛本 | `assets/default/item/manuals/it_miji_shanyetuna.png` | 待出图 | [it_miji_shanyetuna.md](items/manuals/it_miji_shanyetuna.md) |
| items | `it_miji_shenghuoling` | 圣火令武功原刻 | `assets/default/item/manuals/it_miji_shenghuoling.png` | 待出图 | [it_miji_shenghuoling.md](items/manuals/it_miji_shenghuoling.md) |
| items | `it_miji_shentuoxueshanzhang` | 神驼雪山掌遗谱 | `assets/default/item/manuals/it_miji_shentuoxueshanzhang.png` | 待出图 | [it_miji_shentuoxueshanzhang.md](items/manuals/it_miji_shentuoxueshanzhang.md) |
| items | `it_miji_shiguchong_can` | 识蛊虫残本 | `assets/default/item/manuals/it_miji_shiguchong_can.png` | 待出图 | [it_miji_shiguchong_can.md](items/manuals/it_miji_shiguchong_can.md) |
| items | `it_miji_taishanjianfa` | 泰山剑法全本 | `assets/default/item/manuals/it_miji_taishanjianfa.png` | 待出图 | [it_miji_taishanjianfa.md](items/manuals/it_miji_taishanjianfa.md) |
| items | `it_miji_taixuan` | 太玄经石壁图解 | `assets/default/item/manuals/it_miji_taixuan.png` | 待出图 | [it_miji_taixuan.md](items/manuals/it_miji_taixuan.md) |
| items | `it_miji_tantui_tongxing` | 弹腿通行谱抄本 | `assets/default/item/manuals/it_miji_tantui_tongxing.png` | 待出图 | [it_miji_tantui_tongxing.md](items/manuals/it_miji_tantui_tongxing.md) |
| items | `it_miji_tantuirumen` | 弹腿入门抄本 | `assets/default/item/manuals/it_miji_tantuirumen.png` | 待出图 | [it_miji_tantuirumen.md](items/manuals/it_miji_tantuirumen.md) |
| items | `it_miji_tongrenhenglian` | 铜人横练抄本 | `assets/default/item/manuals/it_miji_tongrenhenglian.png` | 待出图 | [it_miji_tongrenhenglian.md](items/manuals/it_miji_tongrenhenglian.md) |
| items | `it_miji_wuguandao_can` | 武馆刀法残本 | `assets/default/item/manuals/it_miji_wuguandao_can.png` | 待出图 | [it_miji_wuguandao_can.md](items/manuals/it_miji_wuguandao_can.md) |
| items | `it_miji_wuhuduandandao` | 五虎断门刀民间谱 | `assets/default/item/manuals/it_miji_wuhuduandandao.png` | 待出图 | [it_miji_wuhuduandandao.md](items/manuals/it_miji_wuhuduandandao.md) |
| items | `it_miji_wulundazhuan` | 五轮大转图谱 | `assets/default/item/manuals/it_miji_wulundazhuan.png` | 待出图 | [it_miji_wulundazhuan.md](items/manuals/it_miji_wulundazhuan.md) |
| items | `it_miji_wuxingqizhen` | 五行旗阵图谱 | `assets/default/item/manuals/it_miji_wuxingqizhen.png` | 待出图 | [it_miji_wuxingqizhen.md](items/manuals/it_miji_wuxingqizhen.md) |
| items | `it_miji_xiaoaojianghuqu` | 笑傲江湖曲谱手本 | `assets/default/item/manuals/it_miji_xiaoaojianghuqu.png` | 待出图 | [it_miji_xiaoaojianghuqu.md](items/manuals/it_miji_xiaoaojianghuqu.md) |
| items | `it_miji_xixing` | 吸星大法铁板原刻 | `assets/default/item/manuals/it_miji_xixing.png` | 待出图 | [it_miji_xixing.md](items/manuals/it_miji_xixing.md) |
| items | `it_miji_xuanfengsaoyetui` | 旋风扫叶腿修习谱 | `assets/default/item/manuals/it_miji_xuanfengsaoyetui.png` | 待出图 | [it_miji_xuanfengsaoyetui.md](items/manuals/it_miji_xuanfengsaoyetui.md) |
| items | `it_miji_xunquanshu` | 训犬术全本 | `assets/default/item/manuals/it_miji_xunquanshu.png` | 待出图 | [it_miji_xunquanshu.md](items/manuals/it_miji_xunquanshu.md) |
| items | `it_miji_yanxingbu` | 雁行步原本 | `assets/default/item/manuals/it_miji_yanxingbu.png` | 待出图 | [it_miji_yanxingbu.md](items/manuals/it_miji_yanxingbu.md) |
| items | `it_miji_yijinjing` | 易筋经梵文原本 | `assets/default/item/manuals/it_miji_yijinjing.png` | 待出图 | [it_miji_yijinjing.md](items/manuals/it_miji_yijinjing.md) |
| items | `it_miji_yitiantulonggong` | 倚天屠龙功王盘山石刻 | `assets/default/item/manuals/it_miji_yitiantulonggong.png` | 待出图 | [it_miji_yitiantulonggong.md](items/manuals/it_miji_yitiantulonggong.md) |
| items | `it_miji_yueyingshenfa` | 越影身法帛卷 | `assets/default/item/manuals/it_miji_yueyingshenfa.png` | 待出图 | [it_miji_yueyingshenfa.md](items/manuals/it_miji_yueyingshenfa.md) |
| items | `it_miji_yuezu_duanjian` | 越卒短剑简谱 | `assets/default/item/manuals/it_miji_yuezu_duanjian.png` | 待出图 | [it_miji_yuezu_duanjian.md](items/manuals/it_miji_yuezu_duanjian.md) |
| items | `it_miji_yuxiaojianfa` | 玉箫剑法谱 | `assets/default/item/manuals/it_miji_yuxiaojianfa.png` | 待出图 | [it_miji_yuxiaojianfa.md](items/manuals/it_miji_yuxiaojianfa.md) |
| items | `it_miji_zhamabu` | 扎马步抄本 | `assets/default/item/manuals/it_miji_zhamabu.png` | 待出图 | [it_miji_zhamabu.md](items/manuals/it_miji_zhamabu.md) |
| items | `it_miji_zhenqijian_can` | 阵旗剑谱残本 | `assets/default/item/manuals/it_miji_zhenqijian_can.png` | 待出图 | [it_miji_zhenqijian_can.md](items/manuals/it_miji_zhenqijian_can.md) |
| items | `it_miji_zhuangxingong` | 壮行功抄本 | `assets/default/item/manuals/it_miji_zhuangxingong.png` | 待出图 | [it_miji_zhuangxingong.md](items/manuals/it_miji_zhuangxingong.md) |
| items | `it_miji_zhuzhijianfa` | 竹枝剑法原本 | `assets/default/item/manuals/it_miji_zhuzhijianfa.png` | 待出图 | [it_miji_zhuzhijianfa.md](items/manuals/it_miji_zhuzhijianfa.md) |
| items | `it_miji_zixiashengong` | 紫霞秘笈传本 | `assets/default/item/manuals/it_miji_zixiashengong.png` | 待出图 | [it_miji_zixiashengong.md](items/manuals/it_miji_zixiashengong.md) |
| items | `it_chansu` | 蟾酥 | `assets/default/item/medicine/it_chansu.png` | 待出图 | [it_chansu.md](items/medicine/it_chansu.md) |
| items | `it_xionghuang` | 雄黄 | `assets/default/item/medicine/it_xionghuang.png` | 待出图 | [it_xionghuang.md](items/medicine/it_xionghuang.md) |
| items | `eq_changbingyueyachan` | 长柄月牙铲 | `assets/default/item/weapons/eq_changbingyueyachan.png` | 待出图 | [eq_changbingyueyachan.md](items/weapons/eq_changbingyueyachan.md) |
| items | `eq_chunqiutongge` | 春秋青铜戈 | `assets/default/item/weapons/eq_chunqiutongge.png` | 待出图 | [eq_chunqiutongge.md](items/weapons/eq_chunqiutongge.md) |
| items | `eq_dalijunhuan` | 大理护军铜环 | `assets/default/item/weapons/eq_dalijunhuan.png` | 待出图 | [eq_dalijunhuan.md](items/weapons/eq_dalijunhuan.md) |
| items | `eq_fengweishuangbi` | 凤尾双笔 | `assets/default/item/weapons/eq_fengweishuangbi.png` | 待出图 | [eq_fengweishuangbi.md](items/weapons/eq_fengweishuangbi.md) |
| items | `eq_jiujiebian` | 九节鞭 | `assets/default/item/weapons/eq_jiujiebian.png` | 待出图 | [eq_jiujiebian.md](items/weapons/eq_jiujiebian.md) |
| items | `eq_mengguqibingdao` | 蒙古骑兵刀 | `assets/default/item/weapons/eq_mengguqibingdao.png` | 待出图 | [eq_mengguqibingdao.md](items/weapons/eq_mengguqibingdao.md) |
| items | `eq_mingmiaodao` | 明军长刀（苗刀名待考） | `assets/default/item/weapons/eq_mingmiaodao.png` | 待出图 | [eq_mingmiaodao.md](items/weapons/eq_mingmiaodao.md) |
| items | `eq_mingyingpeijian` | 明营佩剑 | `assets/default/item/weapons/eq_mingyingpeijian.png` | 待出图 | [eq_mingyingpeijian.md](items/weapons/eq_mingyingpeijian.md) |
| items | `eq_qingshundao` | 清顺刀 | `assets/default/item/weapons/eq_qingshundao.png` | 待出图 | [eq_qingshundao.md](items/weapons/eq_qingshundao.md) |
| items | `eq_songjunzhimao` | 宋军直矛 | `assets/default/item/weapons/eq_songjunzhimao.png` | 待出图 | [eq_songjunzhimao.md](items/weapons/eq_songjunzhimao.md) |
| items | `eq_tangyidao` | 唐仪刀 | `assets/default/item/weapons/eq_tangyidao.png` | 待出图 | [eq_tangyidao.md](items/weapons/eq_tangyidao.md) |
| items | `eq_tielianfeizhua` | 铁链飞爪 | `assets/default/item/weapons/eq_tielianfeizhua.png` | 待出图 | [eq_tielianfeizhua.md](items/weapons/eq_tielianfeizhua.md) |
| items | `eq_wuleitiejian` | 五雷铁简 | `assets/default/item/weapons/eq_wuleitiejian.png` | 待出图 | [eq_wuleitiejian.md](items/weapons/eq_wuleitiejian.md) |
| items | `eq_wuyueqingtongjian` | 吴越青铜剑 | `assets/default/item/weapons/eq_wuyueqingtongjian.png` | 待出图 | [eq_wuyueqingtongjian.md](items/weapons/eq_wuyueqingtongjian.md) |
| items | `eq_yinkexijinlongbian` | 尹克西金龙鞭 | `assets/default/item/weapons/eq_yinkexijinlongbian.png` | 待出图 | [eq_yinkexijinlongbian.md](items/weapons/eq_yinkexijinlongbian.md) |
| items | `eq_yinyangruanlun` | 阴阳软刃轮 | `assets/default/item/weapons/eq_yinyangruanlun.png` | 待出图 | [eq_yinyangruanlun.md](items/weapons/eq_yinyangruanlun.md) |
| items | `eq_yuanyangyue` | 鸳鸯钺 | `assets/default/item/weapons/eq_yuanyangyue.png` | 待出图 | [eq_yuanyangyue.md](items/weapons/eq_yuanyangyue.md) |
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

## 物品（11 类，名录 894 项）

每张图的提示词在各文件「提示词」节。下表只列还要出的行（待出图 / 待重出），已入库的不再列出，标题里的计数含已出部分。作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可回到队列。

### 药物 / 补品 / 药材（96）· 已入库 62、已通过（作者） 32、待出图 2

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 蟾酥 | `it_chansu` | 地 | 药材·动物 | 待出图 | [it_chansu.md](items/medicine/it_chansu.md) | template |
| 2 | 雄黄 | `it_xionghuang` | 玄 | 药材·矿物 | 待出图 | [it_xionghuang.md](items/medicine/it_xionghuang.md) | template |

### 食材 / 食品（174）· 已入库 146、已通过（作者） 28

（已全部入库。）

### 武学秘籍（180）· 已入库 122、待出图 58

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 金蛇秘笈原本 | `it_miji_jinshejian` | 天 | 秘籍·原本 | 待出图 | [it_miji_jinshejian.md](items/manuals/it_miji_jinshejian.md) | template |
| 2 | 九阳真经夹注原本 | `it_miji_jiuyang` | 天 | 秘籍·原本 | 待出图 | [it_miji_jiuyang.md](items/manuals/it_miji_jiuyang.md) | template |
| 3 | 葵花宝典传本 | `it_miji_kuihua` | 天 | 秘籍·抄本 | 待出图 | [it_miji_kuihua.md](items/manuals/it_miji_kuihua.md) | template |
| 4 | 六脉神剑经丝绢原卷 | `it_miji_liumai` | 天 | 秘籍·原本 | 待出图 | [it_miji_liumai.md](items/manuals/it_miji_liumai.md) | template |
| 5 | 罗汉伏魔神功泥人图 | `it_miji_luohanfumo_can` | 天 | 秘籍·残本 | 待出图 | [it_miji_luohanfumo_can.md](items/manuals/it_miji_luohanfumo_can.md) | template |
| 6 | 圣火令武功原刻 | `it_miji_shenghuoling` | 天 | 秘籍·原本 | 待出图 | [it_miji_shenghuoling.md](items/manuals/it_miji_shenghuoling.md) | template |
| 7 | 太玄经石壁图解 | `it_miji_taixuan` | 天 | 秘籍·抄本 | 待出图 | [it_miji_taixuan.md](items/manuals/it_miji_taixuan.md) | template |
| 8 | 吸星大法铁板原刻 | `it_miji_xixing` | 天 | 秘籍·原本 | 待出图 | [it_miji_xixing.md](items/manuals/it_miji_xixing.md) | template |
| 9 | 易筋经梵文原本 | `it_miji_yijinjing` | 天 | 秘籍·原本 | 待出图 | [it_miji_yijinjing.md](items/manuals/it_miji_yijinjing.md) | template |
| 10 | 般若掌法古本 | `it_miji_boruozhang` | 地 | 秘籍·全本 | 待出图 | [it_miji_boruozhang.md](items/manuals/it_miji_boruozhang.md) | template |
| 11 | 抽髓掌残本 | `it_miji_chousuizhang_can` | 地 | 秘籍·残本 | 待出图 | [it_miji_chousuizhang_can.md](items/manuals/it_miji_chousuizhang_can.md) | template |
| 12 | 纯阳无极功抄本 | `it_miji_chunyangwuji` | 地 | 秘籍·抄本 | 待出图 | [it_miji_chunyangwuji.md](items/manuals/it_miji_chunyangwuji.md) | template |
| 13 | 伏魔杖法古册 | `it_miji_fumozhangfa` | 地 | 秘籍·抄本 | 待出图 | [it_miji_fumozhangfa.md](items/manuals/it_miji_fumozhangfa.md) | template |
| 14 | 古墓轻功图谱 | `it_miji_gumuqinggong` | 地 | 秘籍·全本 | 待出图 | [it_miji_gumuqinggong.md](items/manuals/it_miji_gumuqinggong.md) | template |
| 15 | 红花会合击阵谱 | `it_miji_honghuahuiheji` | 地 | 秘籍·全本 | 待出图 | [it_miji_honghuahuiheji.md](items/manuals/it_miji_honghuahuiheji.md) | template |
| 16 | 金钟罩秘籍 | `it_miji_jinzhongzhao` | 地 | 秘籍·全本 | 待出图 | [it_miji_jinzhongzhao.md](items/manuals/it_miji_jinzhongzhao.md) | template |
| 17 | 枯荣禅功经折本 | `it_miji_kurongchangong` | 地 | 秘籍·全本 | 待出图 | [it_miji_kurongchangong.md](items/manuals/it_miji_kurongchangong.md) | template |
| 18 | 摩诃指秘要古籍 | `it_miji_mohezhi` | 地 | 秘籍·抄本 | 待出图 | [it_miji_mohezhi.md](items/manuals/it_miji_mohezhi.md) | template |
| 19 | 拈花指法钞本 | `it_miji_nianhuazhi` | 地 | 秘籍·抄本 | 待出图 | [it_miji_nianhuazhi.md](items/manuals/it_miji_nianhuazhi.md) | template |
| 20 | 缥缈剑法抄本 | `it_miji_piaomiaojian` | 地 | 秘籍·抄本 | 待出图 | [it_miji_piaomiaojian.md](items/manuals/it_miji_piaomiaojian.md) | template |
| 21 | 胡青牛医经手本 | `it_miji_qihuangmifa` | 地 | 秘籍·抄本 | 待出图 | [it_miji_qihuangmifa.md](items/manuals/it_miji_qihuangmifa.md) | template |
| 22 | 五轮大转图谱 | `it_miji_wulundazhuan` | 地 | 秘籍·全本 | 待出图 | [it_miji_wulundazhuan.md](items/manuals/it_miji_wulundazhuan.md) | template |
| 23 | 五行旗阵图谱 | `it_miji_wuxingqizhen` | 地 | 秘籍·全本 | 待出图 | [it_miji_wuxingqizhen.md](items/manuals/it_miji_wuxingqizhen.md) | template |
| 24 | 倚天屠龙功王盘山石刻 | `it_miji_yitiantulonggong` | 地 | 秘籍·原本 | 待出图 | [it_miji_yitiantulonggong.md](items/manuals/it_miji_yitiantulonggong.md) | template |
| 25 | 玉箫剑法谱 | `it_miji_yuxiaojianfa` | 地 | 秘籍·全本 | 待出图 | [it_miji_yuxiaojianfa.md](items/manuals/it_miji_yuxiaojianfa.md) | template |
| 26 | 紫霞秘笈传本 | `it_miji_zixiashengong` | 地 | 秘籍·抄本 | 待出图 | [it_miji_zixiashengong.md](items/manuals/it_miji_zixiashengong.md) | template |
| 27 | 白猿剑意残本 | `it_miji_baiyuanjianyi_can` | 玄 | 秘籍·残本 | 待出图 | [it_miji_baiyuanjianyi_can.md](items/manuals/it_miji_baiyuanjianyi_can.md) | template |
| 28 | 九阴真经古墓遗刻 | `it_miji_jiuyinliaoshangpian` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_jiuyinliaoshangpian.md](items/manuals/it_miji_jiuyinliaoshangpian.md) | template |
| 29 | 神驼雪山掌遗谱 | `it_miji_shentuoxueshanzhang` | 玄 | 秘籍·残本 | 待出图 | [it_miji_shentuoxueshanzhang.md](items/manuals/it_miji_shentuoxueshanzhang.md) | template |
| 30 | 泰山剑法全本 | `it_miji_taishanjianfa` | 玄 | 秘籍·全本 | 待出图 | [it_miji_taishanjianfa.md](items/manuals/it_miji_taishanjianfa.md) | template |
| 31 | 弹腿通行谱抄本 | `it_miji_tantui_tongxing` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_tantui_tongxing.md](items/manuals/it_miji_tantui_tongxing.md) | template |
| 32 | 铜人横练抄本 | `it_miji_tongrenhenglian` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_tongrenhenglian.md](items/manuals/it_miji_tongrenhenglian.md) | template |
| 33 | 五虎断门刀民间谱 | `it_miji_wuhuduandandao` | 玄 | 秘籍·全本 | 待出图 | [it_miji_wuhuduandandao.md](items/manuals/it_miji_wuhuduandandao.md) | template |
| 34 | 笑傲江湖曲谱手本 | `it_miji_xiaoaojianghuqu` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_xiaoaojianghuqu.md](items/manuals/it_miji_xiaoaojianghuqu.md) | template |
| 35 | 旋风扫叶腿修习谱 | `it_miji_xuanfengsaoyetui` | 玄 | 秘籍·全本 | 待出图 | [it_miji_xuanfengsaoyetui.md](items/manuals/it_miji_xuanfengsaoyetui.md) | template |
| 36 | 越影身法帛卷 | `it_miji_yueyingshenfa` | 玄 | 秘籍·全本 | 待出图 | [it_miji_yueyingshenfa.md](items/manuals/it_miji_yueyingshenfa.md) | template |
| 37 | 阵旗剑谱残本 | `it_miji_zhenqijian_can` | 玄 | 秘籍·残本 | 待出图 | [it_miji_zhenqijian_can.md](items/manuals/it_miji_zhenqijian_can.md) | template |
| 38 | 竹枝剑法原本 | `it_miji_zhuzhijianfa` | 玄 | 秘籍·原本 | 待出图 | [it_miji_zhuzhijianfa.md](items/manuals/it_miji_zhuzhijianfa.md) | template |
| 39 | 辨毒法全本 | `it_miji_biandufa` | 黄 | 秘籍·全本 | 待出图 | [it_miji_biandufa.md](items/manuals/it_miji_biandufa.md) | template |
| 40 | 长枪入门谱 | `it_miji_changqiangrumen` | 黄 | 秘籍·全本 | 待出图 | [it_miji_changqiangrumen.md](items/manuals/it_miji_changqiangrumen.md) | template |
| 41 | 笛曲入门抄本 | `it_miji_diqurumen` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_diqurumen.md](items/manuals/it_miji_diqurumen.md) | template |
| 42 | 风石投术简谱 | `it_miji_fengshitoushu` | 黄 | 秘籍·全本 | 待出图 | [it_miji_fengshitoushu.md](items/manuals/it_miji_fengshitoushu.md) | template |
| 43 | 弓手法残本 | `it_miji_gongshou_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_gongshou_can.md](items/manuals/it_miji_gongshou_can.md) | template |
| 44 | 护院拳谱全本 | `it_miji_huyuanquan` | 黄 | 秘籍·全本 | 待出图 | [it_miji_huyuanquan.md](items/manuals/it_miji_huyuanquan.md) | template |
| 45 | 江湖入门剑谱 | `it_miji_jianghurumenjian` | 黄 | 秘籍·全本 | 待出图 | [it_miji_jianghurumenjian.md](items/manuals/it_miji_jianghurumenjian.md) | template |
| 46 | 军伍短刀抄本 | `it_miji_junwuduandao` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_junwuduandao.md](items/manuals/it_miji_junwuduandao.md) | template |
| 47 | 列阵步残本 | `it_miji_liezhengbu_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_liezhengbu_can.md](items/manuals/it_miji_liezhengbu_can.md) | template |
| 48 | 牧羊杖法简谱 | `it_miji_muyangzhang` | 黄 | 秘籍·全本 | 待出图 | [it_miji_muyangzhang.md](items/manuals/it_miji_muyangzhang.md) | template |
| 49 | 棋势入门残本 | `it_miji_qishirumen_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_qishirumen_can.md](items/manuals/it_miji_qishirumen_can.md) | template |
| 50 | 山野吐纳帛本 | `it_miji_shanyetuna` | 黄 | 秘籍·原本 | 待出图 | [it_miji_shanyetuna.md](items/manuals/it_miji_shanyetuna.md) | template |
| 51 | 识蛊虫残本 | `it_miji_shiguchong_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_shiguchong_can.md](items/manuals/it_miji_shiguchong_can.md) | template |
| 52 | 弹腿入门抄本 | `it_miji_tantuirumen` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_tantuirumen.md](items/manuals/it_miji_tantuirumen.md) | template |
| 53 | 武馆刀法残本 | `it_miji_wuguandao_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_wuguandao_can.md](items/manuals/it_miji_wuguandao_can.md) | template |
| 54 | 训犬术全本 | `it_miji_xunquanshu` | 黄 | 秘籍·全本 | 待出图 | [it_miji_xunquanshu.md](items/manuals/it_miji_xunquanshu.md) | template |
| 55 | 雁行步原本 | `it_miji_yanxingbu` | 黄 | 秘籍·原本 | 待出图 | [it_miji_yanxingbu.md](items/manuals/it_miji_yanxingbu.md) | template |
| 56 | 越卒短剑简谱 | `it_miji_yuezu_duanjian` | 黄 | 秘籍·全本 | 待出图 | [it_miji_yuezu_duanjian.md](items/manuals/it_miji_yuezu_duanjian.md) | template |
| 57 | 扎马步抄本 | `it_miji_zhamabu` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_zhamabu.md](items/manuals/it_miji_zhamabu.md) | template |
| 58 | 壮行功抄本 | `it_miji_zhuangxingong` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_zhuangxingong.md](items/manuals/it_miji_zhuangxingong.md) | template |

### 兵器（247）· 已入库 206、已通过（作者） 24、待出图 17

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 长柄月牙铲 | `eq_changbingyueyachan` | 玄中 | 兵器·奇门铲 | 待出图 | [eq_changbingyueyachan.md](items/weapons/eq_changbingyueyachan.md) | template |
| 2 | 大理护军铜环 | `eq_dalijunhuan` | 玄上 | 兵器·奇门轮 | 待出图 | [eq_dalijunhuan.md](items/weapons/eq_dalijunhuan.md) | template |
| 3 | 凤尾双笔 | `eq_fengweishuangbi` | 玄上 | 兵器·奇门笔 | 待出图 | [eq_fengweishuangbi.md](items/weapons/eq_fengweishuangbi.md) | template |
| 4 | 蒙古骑兵刀 | `eq_mengguqibingdao` | 玄下 | 兵器·刀 | 待出图 | [eq_mengguqibingdao.md](items/weapons/eq_mengguqibingdao.md) | template |
| 5 | 明军长刀（苗刀名待考） | `eq_mingmiaodao` | 玄中 | 兵器·长刀 | 待出图 | [eq_mingmiaodao.md](items/weapons/eq_mingmiaodao.md) | template |
| 6 | 明营佩剑 | `eq_mingyingpeijian` | 玄下 | 兵器·剑 | 待出图 | [eq_mingyingpeijian.md](items/weapons/eq_mingyingpeijian.md) | template |
| 7 | 铁链飞爪 | `eq_tielianfeizhua` | 玄上 | 兵器·鞭索 | 待出图 | [eq_tielianfeizhua.md](items/weapons/eq_tielianfeizhua.md) | template |
| 8 | 五雷铁简 | `eq_wuleitiejian` | 玄上 | 兵器·奇门简 | 待出图 | [eq_wuleitiejian.md](items/weapons/eq_wuleitiejian.md) | template |
| 9 | 尹克西金龙鞭 | `eq_yinkexijinlongbian` | 玄上 | 兵器·鞭索 | 待出图 | [eq_yinkexijinlongbian.md](items/weapons/eq_yinkexijinlongbian.md) | template |
| 10 | 阴阳软刃轮 | `eq_yinyangruanlun` | 玄中 | 兵器·奇门轮 | 待出图 | [eq_yinyangruanlun.md](items/weapons/eq_yinyangruanlun.md) | template |
| 11 | 春秋青铜戈 | `eq_chunqiutongge` | 黄下 | 兵器·奇门戈 | 待出图 | [eq_chunqiutongge.md](items/weapons/eq_chunqiutongge.md) | template |
| 12 | 九节鞭 | `eq_jiujiebian` | 黄中 | 兵器·鞭索 | 待出图 | [eq_jiujiebian.md](items/weapons/eq_jiujiebian.md) | template |
| 13 | 清顺刀 | `eq_qingshundao` | 黄上 | 兵器·刀 | 待出图 | [eq_qingshundao.md](items/weapons/eq_qingshundao.md) | template |
| 14 | 宋军直矛 | `eq_songjunzhimao` | 黄下 | 兵器·枪 | 待出图 | [eq_songjunzhimao.md](items/weapons/eq_songjunzhimao.md) | template |
| 15 | 唐仪刀 | `eq_tangyidao` | 黄上 | 兵器·刀 | 待出图 | [eq_tangyidao.md](items/weapons/eq_tangyidao.md) | template |
| 16 | 吴越青铜剑 | `eq_wuyueqingtongjian` | 黄下 | 兵器·剑 | 待出图 | [eq_wuyueqingtongjian.md](items/weapons/eq_wuyueqingtongjian.md) | template |
| 17 | 鸳鸯钺 | `eq_yuanyangyue` | 黄下 | 兵器·奇门钺 | 待出图 | [eq_yuanyangyue.md](items/weapons/eq_yuanyangyue.md) | template |

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

### 暗器（51）· 已入库 48、待出图 3

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 蒙古马弹囊 | `eq_menggumadannang` | 黄上 | 暗器·弹丸囊 | 待出图 | [eq_menggumadannang.md](items/hidden-weapons/eq_menggumadannang.md) | template |
| 2 | 西域风叶镖囊 | `eq_xiyufengyebiaonang` | 黄上 | 暗器·飞镖 | 待出图 | [eq_xiyufengyebiaonang.md](items/hidden-weapons/eq_xiyufengyebiaonang.md) | template |
| 3 | 元骑手飞刀囊 | `eq_yuanqishoufeidaonang` | 黄中 | 暗器·飞刀 | 待出图 | [eq_yuanqishoufeidaonang.md](items/hidden-weapons/eq_yuanqishoufeidaonang.md) | template |

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
