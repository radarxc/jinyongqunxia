# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）

> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。
> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。

提示词 **1009** 份：已入库 605、待出图 272、已通过（作者） 132。**待出图队列 272 行**（`python3 tools/agents/build_image_index.py --queue`）。

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
| items | `eq_huilongbi` | 回龙璧 | `assets/default/item/hidden-weapons/eq_huilongbi.png` | 待出图 | [eq_huilongbi.md](items/hidden-weapons/eq_huilongbi.md) |
| items | `eq_jinhuabiao` | 金花镖 | `assets/default/item/hidden-weapons/eq_jinhuabiao.png` | 待出图 | [eq_jinhuabiao.md](items/hidden-weapons/eq_jinhuabiao.md) |
| items | `eq_menggumadannang` | 蒙古马弹囊 | `assets/default/item/hidden-weapons/eq_menggumadannang.png` | 待出图 | [eq_menggumadannang.md](items/hidden-weapons/eq_menggumadannang.md) |
| items | `eq_shengsifubao` | 生死符冰片包 | `assets/default/item/hidden-weapons/eq_shengsifubao.png` | 待出图 | [eq_shengsifubao.md](items/hidden-weapons/eq_shengsifubao.md) |
| items | `eq_tubofeishinang` | 吐蕃飞石囊 | `assets/default/item/hidden-weapons/eq_tubofeishinang.png` | 待出图 | [eq_tubofeishinang.md](items/hidden-weapons/eq_tubofeishinang.md) |
| items | `eq_wuyingyinzhen` | 无影银针 | `assets/default/item/hidden-weapons/eq_wuyingyinzhen.png` | 待出图 | [eq_wuyingyinzhen.md](items/hidden-weapons/eq_wuyingyinzhen.md) |
| items | `eq_xiyufengyebiaonang` | 西域风叶镖囊 | `assets/default/item/hidden-weapons/eq_xiyufengyebiaonang.png` | 待出图 | [eq_xiyufengyebiaonang.md](items/hidden-weapons/eq_xiyufengyebiaonang.md) |
| items | `eq_yanzibiaonang` | 燕子镖囊 | `assets/default/item/hidden-weapons/eq_yanzibiaonang.png` | 待出图 | [eq_yanzibiaonang.md](items/hidden-weapons/eq_yanzibiaonang.md) |
| items | `eq_yuanqishoufeidaonang` | 元骑手飞刀囊 | `assets/default/item/hidden-weapons/eq_yuanqishoufeidaonang.png` | 待出图 | [eq_yuanqishoufeidaonang.md](items/hidden-weapons/eq_yuanqishoufeidaonang.md) |
| items | `it_miji_baidubianzheng` | 王难姑毒经抄本 | `assets/default/item/manuals/it_miji_baidubianzheng.png` | 待出图 | [it_miji_baidubianzheng.md](items/manuals/it_miji_baidubianzheng.md) |
| items | `it_miji_baiyuanjianyi_can` | 白猿剑意残本 | `assets/default/item/manuals/it_miji_baiyuanjianyi_can.png` | 待出图 | [it_miji_baiyuanjianyi_can.md](items/manuals/it_miji_baiyuanjianyi_can.md) |
| items | `it_miji_baoshangfa` | 包伤法抄本 | `assets/default/item/manuals/it_miji_baoshangfa.png` | 待出图 | [it_miji_baoshangfa.md](items/manuals/it_miji_baoshangfa.md) |
| items | `it_miji_beiming` | 北冥神功帛卷原本 | `assets/default/item/manuals/it_miji_beiming.png` | 待出图 | [it_miji_beiming.md](items/manuals/it_miji_beiming.md) |
| items | `it_miji_biandufa` | 辨毒法全本 | `assets/default/item/manuals/it_miji_biandufa.png` | 待出图 | [it_miji_biandufa.md](items/manuals/it_miji_biandufa.md) |
| items | `it_miji_bianshe` | 边塞射法全本 | `assets/default/item/manuals/it_miji_bianshe.png` | 待出图 | [it_miji_bianshe.md](items/manuals/it_miji_bianshe.md) |
| items | `it_miji_biaojuqiangfa_can` | 镖局枪法残本 | `assets/default/item/manuals/it_miji_biaojuqiangfa_can.png` | 待出图 | [it_miji_biaojuqiangfa_can.md](items/manuals/it_miji_biaojuqiangfa_can.md) |
| items | `it_miji_biaojurumen` | 镖局入门刀谱 | `assets/default/item/manuals/it_miji_biaojurumen.png` | 待出图 | [it_miji_biaojurumen.md](items/manuals/it_miji_biaojurumen.md) |
| items | `it_miji_bixie` | 辟邪剑谱袈裟原本 | `assets/default/item/manuals/it_miji_bixie.png` | 待出图 | [it_miji_bixie.md](items/manuals/it_miji_bixie.md) |
| items | `it_miji_boruozhang` | 般若掌法古本 | `assets/default/item/manuals/it_miji_boruozhang.png` | 待出图 | [it_miji_boruozhang.md](items/manuals/it_miji_boruozhang.md) |
| items | `it_miji_bubingcao` | 步兵操全本 | `assets/default/item/manuals/it_miji_bubingcao.png` | 待出图 | [it_miji_bubingcao.md](items/manuals/it_miji_bubingcao.md) |
| items | `it_miji_buzhenrumen` | 布阵入门全本 | `assets/default/item/manuals/it_miji_buzhenrumen.png` | 待出图 | [it_miji_buzhenrumen.md](items/manuals/it_miji_buzhenrumen.md) |
| items | `it_miji_canfengyinlugong` | 餐风饮露功秘籍 | `assets/default/item/manuals/it_miji_canfengyinlugong.png` | 待出图 | [it_miji_canfengyinlugong.md](items/manuals/it_miji_canfengyinlugong.md) |
| items | `it_miji_caoshangfei_can` | 草上飞残本 | `assets/default/item/manuals/it_miji_caoshangfei_can.png` | 待出图 | [it_miji_caoshangfei_can.md](items/manuals/it_miji_caoshangfei_can.md) |
| items | `it_miji_caoyaozhi` | 草药知原本 | `assets/default/item/manuals/it_miji_caoyaozhi.png` | 待出图 | [it_miji_caoyaozhi.md](items/manuals/it_miji_caoyaozhi.md) |
| items | `it_miji_changqiangrumen` | 长枪入门谱 | `assets/default/item/manuals/it_miji_changqiangrumen.png` | 待出图 | [it_miji_changqiangrumen.md](items/manuals/it_miji_changqiangrumen.md) |
| items | `it_miji_changquanrumen` | 长拳入门谱 | `assets/default/item/manuals/it_miji_changquanrumen.png` | 待出图 | [it_miji_changquanrumen.md](items/manuals/it_miji_changquanrumen.md) |
| items | `it_miji_chilianshenzhang_can` | 赤练神掌残本 | `assets/default/item/manuals/it_miji_chilianshenzhang_can.png` | 待出图 | [it_miji_chilianshenzhang_can.md](items/manuals/it_miji_chilianshenzhang_can.md) |
| items | `it_miji_chousuizhang_can` | 抽髓掌残本 | `assets/default/item/manuals/it_miji_chousuizhang_can.png` | 待出图 | [it_miji_chousuizhang_can.md](items/manuals/it_miji_chousuizhang_can.md) |
| items | `it_miji_chuanyinfa` | 传音法抄本 | `assets/default/item/manuals/it_miji_chuanyinfa.png` | 待出图 | [it_miji_chuanyinfa.md](items/manuals/it_miji_chuanyinfa.md) |
| items | `it_miji_chunyangwuji` | 纯阳无极功抄本 | `assets/default/item/manuals/it_miji_chunyangwuji.png` | 待出图 | [it_miji_chunyangwuji.md](items/manuals/it_miji_chunyangwuji.md) |
| items | `it_miji_dagouzhen` | 打狗阵谱 | `assets/default/item/manuals/it_miji_dagouzhen.png` | 待出图 | [it_miji_dagouzhen.md](items/manuals/it_miji_dagouzhen.md) |
| items | `it_miji_dajingangquan` | 大金刚拳神功古籍 | `assets/default/item/manuals/it_miji_dajingangquan.png` | 待出图 | [it_miji_dajingangquan.md](items/manuals/it_miji_dajingangquan.md) |
| items | `it_miji_dantianyangqi` | 丹田养气全本 | `assets/default/item/manuals/it_miji_dantianyangqi.png` | 待出图 | [it_miji_dantianyangqi.md](items/manuals/it_miji_dantianyangqi.md) |
| items | `it_miji_diqurumen` | 笛曲入门抄本 | `assets/default/item/manuals/it_miji_diqurumen.png` | 待出图 | [it_miji_diqurumen.md](items/manuals/it_miji_diqurumen.md) |
| items | `it_miji_duandashou` | 短打手抄本 | `assets/default/item/manuals/it_miji_duandashou.png` | 待出图 | [it_miji_duandashou.md](items/manuals/it_miji_duandashou.md) |
| items | `it_miji_duanqiangfa` | 短枪法抄本 | `assets/default/item/manuals/it_miji_duanqiangfa.png` | 待出图 | [it_miji_duanqiangfa.md](items/manuals/it_miji_duanqiangfa.md) |
| items | `it_miji_duanzhenqiang` | 断阵枪谱全本 | `assets/default/item/manuals/it_miji_duanzhenqiang.png` | 待出图 | [it_miji_duanzhenqiang.md](items/manuals/it_miji_duanzhenqiang.md) |
| items | `it_miji_emeirumenjian` | 峨眉入门剑谱 | `assets/default/item/manuals/it_miji_emeirumenjian.png` | 待出图 | [it_miji_emeirumenjian.md](items/manuals/it_miji_emeirumenjian.md) |
| items | `it_miji_emeixinfa` | 峨眉心法抄本 | `assets/default/item/manuals/it_miji_emeixinfa.png` | 待出图 | [it_miji_emeixinfa.md](items/manuals/it_miji_emeixinfa.md) |
| items | `it_miji_feihuangshi` | 飞蝗石图谱 | `assets/default/item/manuals/it_miji_feihuangshi.png` | 待出图 | [it_miji_feihuangshi.md](items/manuals/it_miji_feihuangshi.md) |
| items | `it_miji_fengshitoushu` | 风石投术简谱 | `assets/default/item/manuals/it_miji_fengshitoushu.png` | 待出图 | [it_miji_fengshitoushu.md](items/manuals/it_miji_fengshitoushu.md) |
| items | `it_miji_fumozhangfa` | 伏魔杖法古册 | `assets/default/item/manuals/it_miji_fumozhangfa.png` | 待出图 | [it_miji_fumozhangfa.md](items/manuals/it_miji_fumozhangfa.md) |
| items | `it_miji_gaizhuangfa` | 改装法抄本 | `assets/default/item/manuals/it_miji_gaizhuangfa.png` | 待出图 | [it_miji_gaizhuangfa.md](items/manuals/it_miji_gaizhuangfa.md) |
| items | `it_miji_ganyebu` | 赶夜步全本 | `assets/default/item/manuals/it_miji_ganyebu.png` | 待出图 | [it_miji_ganyebu.md](items/manuals/it_miji_ganyebu.md) |
| items | `it_miji_gongshou_can` | 弓手法残本 | `assets/default/item/manuals/it_miji_gongshou_can.png` | 待出图 | [it_miji_gongshou_can.md](items/manuals/it_miji_gongshou_can.md) |
| items | `it_miji_guangmingxinfa` | 光明心法全本 | `assets/default/item/manuals/it_miji_guangmingxinfa.png` | 待出图 | [it_miji_guangmingxinfa.md](items/manuals/it_miji_guangmingxinfa.md) |
| items | `it_miji_gumuqinggong` | 古墓轻功图谱 | `assets/default/item/manuals/it_miji_gumuqinggong.png` | 待出图 | [it_miji_gumuqinggong.md](items/manuals/it_miji_gumuqinggong.md) |
| items | `it_miji_gumuxinfa` | 古墓心法抄本 | `assets/default/item/manuals/it_miji_gumuxinfa.png` | 待出图 | [it_miji_gumuxinfa.md](items/manuals/it_miji_gumuxinfa.md) |
| items | `it_miji_haifengbu` | 海风步全本 | `assets/default/item/manuals/it_miji_haifengbu.png` | 待出图 | [it_miji_haifengbu.md](items/manuals/it_miji_haifengbu.md) |
| items | `it_miji_hengdaorumenzhao` | 横刀入门招全本 | `assets/default/item/manuals/it_miji_hengdaorumenzhao.png` | 待出图 | [it_miji_hengdaorumenzhao.md](items/manuals/it_miji_hengdaorumenzhao.md) |
| items | `it_miji_hengshanbeijianfa` | 恒山剑法抄本 | `assets/default/item/manuals/it_miji_hengshanbeijianfa.png` | 待出图 | [it_miji_hengshanbeijianfa.md](items/manuals/it_miji_hengshanbeijianfa.md) |
| items | `it_miji_honghuahuiheji` | 红花会合击阵谱 | `assets/default/item/manuals/it_miji_honghuahuiheji.png` | 待出图 | [it_miji_honghuahuiheji.md](items/manuals/it_miji_honghuahuiheji.md) |
| items | `it_miji_honghuaxinfa` | 红花心法抄本 | `assets/default/item/manuals/it_miji_honghuaxinfa.png` | 待出图 | [it_miji_honghuaxinfa.md](items/manuals/it_miji_honghuaxinfa.md) |
| items | `it_miji_huashanjianfa` | 华山剑法抄本 | `assets/default/item/manuals/it_miji_huashanjianfa.png` | 待出图 | [it_miji_huashanjianfa.md](items/manuals/it_miji_huashanjianfa.md) |
| items | `it_miji_huifengluoyan` | 回风落雁剑谱 | `assets/default/item/manuals/it_miji_huifengluoyan.png` | 待出图 | [it_miji_huifengluoyan.md](items/manuals/it_miji_huifengluoyan.md) |
| items | `it_miji_hujiadao_can` | 胡家刀谱残本 | `assets/default/item/manuals/it_miji_hujiadao_can.png` | 待出图 | [it_miji_hujiadao_can.md](items/manuals/it_miji_hujiadao_can.md) |
| items | `it_miji_huweijian` | 护围剑谱全本 | `assets/default/item/manuals/it_miji_huweijian.png` | 待出图 | [it_miji_huweijian.md](items/manuals/it_miji_huweijian.md) |
| items | `it_miji_huxixingqi_can` | 呼吸行气残本 | `assets/default/item/manuals/it_miji_huxixingqi_can.png` | 待出图 | [it_miji_huxixingqi_can.md](items/manuals/it_miji_huxixingqi_can.md) |
| items | `it_miji_huyuanquan` | 护院拳谱全本 | `assets/default/item/manuals/it_miji_huyuanquan.png` | 待出图 | [it_miji_huyuanquan.md](items/manuals/it_miji_huyuanquan.md) |
| items | `it_miji_jianghuchangquan` | 江湖长拳谱 | `assets/default/item/manuals/it_miji_jianghuchangquan.png` | 待出图 | [it_miji_jianghuchangquan.md](items/manuals/it_miji_jianghuchangquan.md) |
| items | `it_miji_jianghurumenjian` | 江湖入门剑谱 | `assets/default/item/manuals/it_miji_jianghurumenjian.png` | 待出图 | [it_miji_jianghurumenjian.md](items/manuals/it_miji_jianghurumenjian.md) |
| items | `it_miji_jianghutuna` | 江湖吐纳全本 | `assets/default/item/manuals/it_miji_jianghutuna.png` | 待出图 | [it_miji_jianghutuna.md](items/manuals/it_miji_jianghutuna.md) |
| items | `it_miji_jiebiaodaofa` | 解镖刀法原本 | `assets/default/item/manuals/it_miji_jiebiaodaofa.png` | 待出图 | [it_miji_jiebiaodaofa.md](items/manuals/it_miji_jiebiaodaofa.md) |
| items | `it_miji_jindingjiushi` | 金顶九式剑谱 | `assets/default/item/manuals/it_miji_jindingjiushi.png` | 待出图 | [it_miji_jindingjiushi.md](items/manuals/it_miji_jindingjiushi.md) |
| items | `it_miji_jindunxinfa_can` | 金盾心法残本 | `assets/default/item/manuals/it_miji_jindunxinfa_can.png` | 待出图 | [it_miji_jindunxinfa_can.md](items/manuals/it_miji_jindunxinfa_can.md) |
| items | `it_miji_jinguanyusuo` | 金关玉锁二十四诀抄本 | `assets/default/item/manuals/it_miji_jinguanyusuo.png` | 待出图 | [it_miji_jinguanyusuo.md](items/manuals/it_miji_jinguanyusuo.md) |
| items | `it_miji_jinshejian` | 金蛇秘笈原本 | `assets/default/item/manuals/it_miji_jinshejian.png` | 待出图 | [it_miji_jinshejian.md](items/manuals/it_miji_jinshejian.md) |
| items | `it_miji_jinzhongzhao` | 金钟罩秘籍 | `assets/default/item/manuals/it_miji_jinzhongzhao.png` | 待出图 | [it_miji_jinzhongzhao.md](items/manuals/it_miji_jinzhongzhao.md) |
| items | `it_miji_jiuxuefa_can` | 救穴法残本 | `assets/default/item/manuals/it_miji_jiuxuefa_can.png` | 待出图 | [it_miji_jiuxuefa_can.md](items/manuals/it_miji_jiuxuefa_can.md) |
| items | `it_miji_jiuyang` | 九阳真经夹注原本 | `assets/default/item/manuals/it_miji_jiuyang.png` | 待出图 | [it_miji_jiuyang.md](items/manuals/it_miji_jiuyang.md) |
| items | `it_miji_jiuyinliaoshangpian` | 九阴真经古墓遗刻 | `assets/default/item/manuals/it_miji_jiuyinliaoshangpian.png` | 待出图 | [it_miji_jiuyinliaoshangpian.md](items/manuals/it_miji_jiuyinliaoshangpian.md) |
| items | `it_miji_jundituna` | 军旅吐纳抄本 | `assets/default/item/manuals/it_miji_jundituna.png` | 待出图 | [it_miji_jundituna.md](items/manuals/it_miji_jundituna.md) |
| items | `it_miji_junwuduandao` | 军伍短刀抄本 | `assets/default/item/manuals/it_miji_junwuduandao.png` | 待出图 | [it_miji_junwuduandao.md](items/manuals/it_miji_junwuduandao.md) |
| items | `it_miji_junzhangtuna` | 军帐吐纳抄本 | `assets/default/item/manuals/it_miji_junzhangtuna.png` | 待出图 | [it_miji_junzhangtuna.md](items/manuals/it_miji_junzhangtuna.md) |
| items | `it_miji_junzhongdao` | 军中刀法抄本 | `assets/default/item/manuals/it_miji_junzhongdao.png` | 待出图 | [it_miji_junzhongdao.md](items/manuals/it_miji_junzhongdao.md) |
| items | `it_miji_kanzhenfa` | 看阵法抄本 | `assets/default/item/manuals/it_miji_kanzhenfa.png` | 待出图 | [it_miji_kanzhenfa.md](items/manuals/it_miji_kanzhenfa.md) |
| items | `it_miji_kongtongrumenquan` | 崆峒入门拳谱 | `assets/default/item/manuals/it_miji_kongtongrumenquan.png` | 待出图 | [it_miji_kongtongrumenquan.md](items/manuals/it_miji_kongtongrumenquan.md) |
| items | `it_miji_kuihua` | 葵花宝典传本 | `assets/default/item/manuals/it_miji_kuihua.png` | 待出图 | [it_miji_kuihua.md](items/manuals/it_miji_kuihua.md) |
| items | `it_miji_kunlunrumenjian` | 昆仑入门剑谱 | `assets/default/item/manuals/it_miji_kunlunrumenjian.png` | 待出图 | [it_miji_kunlunrumenjian.md](items/manuals/it_miji_kunlunrumenjian.md) |
| items | `it_miji_kunlunxinfa` | 昆仑心法抄本 | `assets/default/item/manuals/it_miji_kunlunxinfa.png` | 待出图 | [it_miji_kunlunxinfa.md](items/manuals/it_miji_kunlunxinfa.md) |
| items | `it_miji_kurongchangong` | 枯荣禅功经折本 | `assets/default/item/manuals/it_miji_kurongchangong.png` | 待出图 | [it_miji_kurongchangong.md](items/manuals/it_miji_kurongchangong.md) |
| items | `it_miji_langhuanjian` | 琅嬛剑法图谱 | `assets/default/item/manuals/it_miji_langhuanjian.png` | 待出图 | [it_miji_langhuanjian.md](items/manuals/it_miji_langhuanjian.md) |
| items | `it_miji_lianhuanjian` | 连环剑谱全本 | `assets/default/item/manuals/it_miji_lianhuanjian.png` | 待出图 | [it_miji_lianhuanjian.md](items/manuals/it_miji_lianhuanjian.md) |
| items | `it_miji_lianhuanqiang` | 连环镖枪抄本 | `assets/default/item/manuals/it_miji_lianhuanqiang.png` | 待出图 | [it_miji_lianhuanqiang.md](items/manuals/it_miji_lianhuanqiang.md) |
| items | `it_miji_liezhengbu_can` | 列阵步残本 | `assets/default/item/manuals/it_miji_liezhengbu_can.png` | 待出图 | [it_miji_liezhengbu_can.md](items/manuals/it_miji_liezhengbu_can.md) |
| items | `it_miji_lingshezhangfa` | 灵蛇杖法秘本 | `assets/default/item/manuals/it_miji_lingshezhangfa.png` | 待出图 | [it_miji_lingshezhangfa.md](items/manuals/it_miji_lingshezhangfa.md) |
| items | `it_miji_linmotieshi` | 临摹帖式原本 | `assets/default/item/manuals/it_miji_linmotieshi.png` | 待出图 | [it_miji_linmotieshi.md](items/manuals/it_miji_linmotieshi.md) |
| items | `it_miji_liumai` | 六脉神剑经丝绢原卷 | `assets/default/item/manuals/it_miji_liumai.png` | 待出图 | [it_miji_liumai.md](items/manuals/it_miji_liumai.md) |
| items | `it_miji_liuxingchui` | 流星锤图谱原本 | `assets/default/item/manuals/it_miji_liuxingchui.png` | 待出图 | [it_miji_liuxingchui.md](items/manuals/it_miji_liuxingchui.md) |
| items | `it_miji_luohanfumo_can` | 罗汉伏魔神功泥人图 | `assets/default/item/manuals/it_miji_luohanfumo_can.png` | 待出图 | [it_miji_luohanfumo_can.md](items/manuals/it_miji_luohanfumo_can.md) |
| items | `it_miji_mohezhi` | 摩诃指秘要古籍 | `assets/default/item/manuals/it_miji_mohezhi.png` | 待出图 | [it_miji_mohezhi.md](items/manuals/it_miji_mohezhi.md) |
| items | `it_miji_muyangzhang` | 牧羊杖法简谱 | `assets/default/item/manuals/it_miji_muyangzhang.png` | 待出图 | [it_miji_muyangzhang.md](items/manuals/it_miji_muyangzhang.md) |
| items | `it_miji_nianhuazhi` | 拈花指法钞本 | `assets/default/item/manuals/it_miji_nianhuazhi.png` | 待出图 | [it_miji_nianhuazhi.md](items/manuals/it_miji_nianhuazhi.md) |
| items | `it_miji_nizhuanjingmai_can` | 逆转经脉残本 | `assets/default/item/manuals/it_miji_nizhuanjingmai_can.png` | 待出图 | [it_miji_nizhuanjingmai_can.md](items/manuals/it_miji_nizhuanjingmai_can.md) |
| items | `it_miji_penglairumenquan` | 蓬莱入门拳抄本 | `assets/default/item/manuals/it_miji_penglairumenquan.png` | 待出图 | [it_miji_penglairumenquan.md](items/manuals/it_miji_penglairumenquan.md) |
| items | `it_miji_piaomiaojian` | 缥缈剑法抄本 | `assets/default/item/manuals/it_miji_piaomiaojian.png` | 待出图 | [it_miji_piaomiaojian.md](items/manuals/it_miji_piaomiaojian.md) |
| items | `it_miji_pingfengjian` | 平锋剑抄本 | `assets/default/item/manuals/it_miji_pingfengjian.png` | 待出图 | [it_miji_pingfengjian.md](items/manuals/it_miji_pingfengjian.md) |
| items | `it_miji_qiankun` | 乾坤大挪移羊皮原本 | `assets/default/item/manuals/it_miji_qiankun.png` | 待出图 | [it_miji_qiankun.md](items/manuals/it_miji_qiankun.md) |
| items | `it_miji_qihuangmifa` | 胡青牛医经手本 | `assets/default/item/manuals/it_miji_qihuangmifa.png` | 待出图 | [it_miji_qihuangmifa.md](items/manuals/it_miji_qihuangmifa.md) |
| items | `it_miji_qimeigun_can` | 齐眉棍谱残本 | `assets/default/item/manuals/it_miji_qimeigun_can.png` | 待出图 | [it_miji_qimeigun_can.md](items/manuals/it_miji_qimeigun_can.md) |
| items | `it_miji_qinlonggong` | 擒龙功秘本 | `assets/default/item/manuals/it_miji_qinlonggong.png` | 待出图 | [it_miji_qinlonggong.md](items/manuals/it_miji_qinlonggong.md) |
| items | `it_miji_qishangquan` | 七伤拳谱古抄本 | `assets/default/item/manuals/it_miji_qishangquan.png` | 待出图 | [it_miji_qishangquan.md](items/manuals/it_miji_qishangquan.md) |
| items | `it_miji_qishangquan_can` | 七伤拳残本 | `assets/default/item/manuals/it_miji_qishangquan_can.png` | 待出图 | [it_miji_qishangquan_can.md](items/manuals/it_miji_qishangquan_can.md) |
| items | `it_miji_qishirumen_can` | 棋势入门残本 | `assets/default/item/manuals/it_miji_qishirumen_can.png` | 待出图 | [it_miji_qishirumen_can.md](items/manuals/it_miji_qishirumen_can.md) |
| items | `it_miji_quanzhentunajue` | 全真吐纳诀抄本 | `assets/default/item/manuals/it_miji_quanzhentunajue.png` | 待出图 | [it_miji_quanzhentunajue.md](items/manuals/it_miji_quanzhentunajue.md) |
| items | `it_miji_riyuexinfa` | 日月心法秘本 | `assets/default/item/manuals/it_miji_riyuexinfa.png` | 待出图 | [it_miji_riyuexinfa.md](items/manuals/it_miji_riyuexinfa.md) |
| items | `it_miji_sanshou` | 散手全本 | `assets/default/item/manuals/it_miji_sanshou.png` | 待出图 | [it_miji_sanshou.md](items/manuals/it_miji_sanshou.md) |
| items | `it_miji_shanyetuna` | 山野吐纳帛本 | `assets/default/item/manuals/it_miji_shanyetuna.png` | 待出图 | [it_miji_shanyetuna.md](items/manuals/it_miji_shanyetuna.md) |
| items | `it_miji_shaobanggun_can` | 哨棒棍谱残本 | `assets/default/item/manuals/it_miji_shaobanggun_can.png` | 待出图 | [it_miji_shaobanggun_can.md](items/manuals/it_miji_shaobanggun_can.md) |
| items | `it_miji_shaolingunfa` | 少林棍法谱 | `assets/default/item/manuals/it_miji_shaolingunfa.png` | 待出图 | [it_miji_shaolingunfa.md](items/manuals/it_miji_shaolingunfa.md) |
| items | `it_miji_shaolinxinfa` | 少林心法抄本 | `assets/default/item/manuals/it_miji_shaolinxinfa.png` | 待出图 | [it_miji_shaolinxinfa.md](items/manuals/it_miji_shaolinxinfa.md) |
| items | `it_miji_shenghuoling` | 圣火令武功原刻 | `assets/default/item/manuals/it_miji_shenghuoling.png` | 待出图 | [it_miji_shenghuoling.md](items/manuals/it_miji_shenghuoling.md) |
| items | `it_miji_shenghuotunajue` | 圣火吐纳诀抄本 | `assets/default/item/manuals/it_miji_shenghuotunajue.png` | 待出图 | [it_miji_shenghuotunajue.md](items/manuals/it_miji_shenghuotunajue.md) |
| items | `it_miji_shenmen13` | 神门十三剑抄本 | `assets/default/item/manuals/it_miji_shenmen13.png` | 待出图 | [it_miji_shenmen13.md](items/manuals/it_miji_shenmen13.md) |
| items | `it_miji_shentuoxueshanzhang` | 神驼雪山掌遗谱 | `assets/default/item/manuals/it_miji_shentuoxueshanzhang.png` | 待出图 | [it_miji_shentuoxueshanzhang.md](items/manuals/it_miji_shentuoxueshanzhang.md) |
| items | `it_miji_shiguchong_can` | 识蛊虫残本 | `assets/default/item/manuals/it_miji_shiguchong_can.png` | 待出图 | [it_miji_shiguchong_can.md](items/manuals/it_miji_shiguchong_can.md) |
| items | `it_miji_shuhuabifa` | 书画笔法抄本 | `assets/default/item/manuals/it_miji_shuhuabifa.png` | 待出图 | [it_miji_shuhuabifa.md](items/manuals/it_miji_shuhuabifa.md) |
| items | `it_miji_songfengjianfa` | 松风剑法全本 | `assets/default/item/manuals/it_miji_songfengjianfa.png` | 待出图 | [it_miji_songfengjianfa.md](items/manuals/it_miji_songfengjianfa.md) |
| items | `it_miji_songshanjianfa` | 嵩山剑法全本 | `assets/default/item/manuals/it_miji_songshanjianfa.png` | 待出图 | [it_miji_songshanjianfa.md](items/manuals/it_miji_songshanjianfa.md) |
| items | `it_miji_taishanjianfa` | 泰山剑法全本 | `assets/default/item/manuals/it_miji_taishanjianfa.png` | 待出图 | [it_miji_taishanjianfa.md](items/manuals/it_miji_taishanjianfa.md) |
| items | `it_miji_taixuan` | 太玄经石壁图解 | `assets/default/item/manuals/it_miji_taixuan.png` | 待出图 | [it_miji_taixuan.md](items/manuals/it_miji_taixuan.md) |
| items | `it_miji_tangshijian` | 唐诗剑谱原本 | `assets/default/item/manuals/it_miji_tangshijian.png` | 待出图 | [it_miji_tangshijian.md](items/manuals/it_miji_tangshijian.md) |
| items | `it_miji_tanluobu` | 探路步抄本 | `assets/default/item/manuals/it_miji_tanluobu.png` | 待出图 | [it_miji_tanluobu.md](items/manuals/it_miji_tanluobu.md) |
| items | `it_miji_tantui_tongxing` | 弹腿通行谱抄本 | `assets/default/item/manuals/it_miji_tantui_tongxing.png` | 待出图 | [it_miji_tantui_tongxing.md](items/manuals/it_miji_tantui_tongxing.md) |
| items | `it_miji_tantuirumen` | 弹腿入门抄本 | `assets/default/item/manuals/it_miji_tantuirumen.png` | 待出图 | [it_miji_tantuirumen.md](items/manuals/it_miji_tantuirumen.md) |
| items | `it_miji_taohuazhen` | 桃花阵图谱 | `assets/default/item/manuals/it_miji_taohuazhen.png` | 待出图 | [it_miji_taohuazhen.md](items/manuals/it_miji_taohuazhen.md) |
| items | `it_miji_tiandihuidao` | 天地会刀谱 | `assets/default/item/manuals/it_miji_tiandihuidao.png` | 待出图 | [it_miji_tiandihuidao.md](items/manuals/it_miji_tiandihuidao.md) |
| items | `it_miji_tianlongjian` | 天龙门剑谱原本 | `assets/default/item/manuals/it_miji_tianlongjian.png` | 待出图 | [it_miji_tianlongjian.md](items/manuals/it_miji_tianlongjian.md) |
| items | `it_miji_tianwangbuxin` | 天王补心针抄本 | `assets/default/item/manuals/it_miji_tianwangbuxin.png` | 待出图 | [it_miji_tianwangbuxin.md](items/manuals/it_miji_tianwangbuxin.md) |
| items | `it_miji_tiebishou` | 铁臂手全本 | `assets/default/item/manuals/it_miji_tiebishou.png` | 待出图 | [it_miji_tiebishou.md](items/manuals/it_miji_tiebishou.md) |
| items | `it_miji_tiebogong_can` | 铁钵功残本 | `assets/default/item/manuals/it_miji_tiebogong_can.png` | 待出图 | [it_miji_tiebogong_can.md](items/manuals/it_miji_tiebogong_can.md) |
| items | `it_miji_tiexiu` | 铁袖功抄本 | `assets/default/item/manuals/it_miji_tiexiu.png` | 待出图 | [it_miji_tiexiu.md](items/manuals/it_miji_tiexiu.md) |
| items | `it_miji_tongbeijin` | 通背劲原本 | `assets/default/item/manuals/it_miji_tongbeijin.png` | 待出图 | [it_miji_tongbeijin.md](items/manuals/it_miji_tongbeijin.md) |
| items | `it_miji_tongrenhenglian` | 铜人横练抄本 | `assets/default/item/manuals/it_miji_tongrenhenglian.png` | 待出图 | [it_miji_tongrenhenglian.md](items/manuals/it_miji_tongrenhenglian.md) |
| items | `it_miji_tongxingfeishi` | 通行飞石图谱 | `assets/default/item/manuals/it_miji_tongxingfeishi.png` | 待出图 | [it_miji_tongxingfeishi.md](items/manuals/it_miji_tongxingfeishi.md) |
| items | `it_miji_tunaqianjue` | 吐纳浅诀抄本 | `assets/default/item/manuals/it_miji_tunaqianjue.png` | 待出图 | [it_miji_tunaqianjue.md](items/manuals/it_miji_tunaqianjue.md) |
| items | `it_miji_wudangchangquan` | 武当长拳谱 | `assets/default/item/manuals/it_miji_wudangchangquan.png` | 待出图 | [it_miji_wudangchangquan.md](items/manuals/it_miji_wudangchangquan.md) |
| items | `it_miji_wudumichuan` | 五毒秘传抄本 | `assets/default/item/manuals/it_miji_wudumichuan.png` | 待出图 | [it_miji_wudumichuan.md](items/manuals/it_miji_wudumichuan.md) |
| items | `it_miji_wuguandao_can` | 武馆刀法残本 | `assets/default/item/manuals/it_miji_wuguandao_can.png` | 待出图 | [it_miji_wuguandao_can.md](items/manuals/it_miji_wuguandao_can.md) |
| items | `it_miji_wuguangun` | 武馆棍法全本 | `assets/default/item/manuals/it_miji_wuguangun.png` | 待出图 | [it_miji_wuguangun.md](items/manuals/it_miji_wuguangun.md) |
| items | `it_miji_wuguanxinfa` | 武馆心法抄本 | `assets/default/item/manuals/it_miji_wuguanxinfa.png` | 待出图 | [it_miji_wuguanxinfa.md](items/manuals/it_miji_wuguanxinfa.md) |
| items | `it_miji_wuhuduandandao` | 五虎断门刀民间谱 | `assets/default/item/manuals/it_miji_wuhuduandandao.png` | 待出图 | [it_miji_wuhuduandandao.md](items/manuals/it_miji_wuhuduandandao.md) |
| items | `it_miji_wulundazhuan` | 五轮大转图谱 | `assets/default/item/manuals/it_miji_wulundazhuan.png` | 待出图 | [it_miji_wulundazhuan.md](items/manuals/it_miji_wulundazhuan.md) |
| items | `it_miji_wumuyishu` | 武穆遗书原本 | `assets/default/item/manuals/it_miji_wumuyishu.png` | 待出图 | [it_miji_wumuyishu.md](items/manuals/it_miji_wumuyishu.md) |
| items | `it_miji_wuxianduzhang` | 五仙毒掌抄本 | `assets/default/item/manuals/it_miji_wuxianduzhang.png` | 待出图 | [it_miji_wuxianduzhang.md](items/manuals/it_miji_wuxianduzhang.md) |
| items | `it_miji_wuxiangjiezhi` | 无相劫指谱古本 | `assets/default/item/manuals/it_miji_wuxiangjiezhi.png` | 待出图 | [it_miji_wuxiangjiezhi.md](items/manuals/it_miji_wuxiangjiezhi.md) |
| items | `it_miji_wuxingqizhen` | 五行旗阵图谱 | `assets/default/item/manuals/it_miji_wuxingqizhen.png` | 待出图 | [it_miji_wuxingqizhen.md](items/manuals/it_miji_wuxingqizhen.md) |
| items | `it_miji_wuyingshou_can` | 无影手残本 | `assets/default/item/manuals/it_miji_wuyingshou_can.png` | 待出图 | [it_miji_wuyingshou_can.md](items/manuals/it_miji_wuyingshou_can.md) |
| items | `it_miji_xiaoaojianghuqu` | 笑傲江湖曲谱手本 | `assets/default/item/manuals/it_miji_xiaoaojianghuqu.png` | 待出图 | [it_miji_xiaoaojianghuqu.md](items/manuals/it_miji_xiaoaojianghuqu.md) |
| items | `it_miji_xijiantoubu_can` | 溪涧投步残卷 | `assets/default/item/manuals/it_miji_xijiantoubu_can.png` | 待出图 | [it_miji_xijiantoubu_can.md](items/manuals/it_miji_xijiantoubu_can.md) |
| items | `it_miji_xingjunbu_can` | 行军步残本 | `assets/default/item/manuals/it_miji_xingjunbu_can.png` | 待出图 | [it_miji_xingjunbu_can.md](items/manuals/it_miji_xingjunbu_can.md) |
| items | `it_miji_xingqizhou` | 行气走抄本 | `assets/default/item/manuals/it_miji_xingqizhou.png` | 待出图 | [it_miji_xingqizhou.md](items/manuals/it_miji_xingqizhou.md) |
| items | `it_miji_xixing` | 吸星大法铁板原刻 | `assets/default/item/manuals/it_miji_xixing.png` | 待出图 | [it_miji_xixing.md](items/manuals/it_miji_xixing.md) |
| items | `it_miji_xuanfengsaoyetui` | 旋风扫叶腿修习谱 | `assets/default/item/manuals/it_miji_xuanfengsaoyetui.png` | 待出图 | [it_miji_xuanfengsaoyetui.md](items/manuals/it_miji_xuanfengsaoyetui.md) |
| items | `it_miji_xuedaojing` | 血刀经原本 | `assets/default/item/manuals/it_miji_xuedaojing.png` | 待出图 | [it_miji_xuedaojing.md](items/manuals/it_miji_xuedaojing.md) |
| items | `it_miji_xunquanshu` | 训犬术全本 | `assets/default/item/manuals/it_miji_xunquanshu.png` | 待出图 | [it_miji_xunquanshu.md](items/manuals/it_miji_xunquanshu.md) |
| items | `it_miji_yanqingzhang` | 延庆杖法抄本 | `assets/default/item/manuals/it_miji_yanqingzhang.png` | 待出图 | [it_miji_yanqingzhang.md](items/manuals/it_miji_yanqingzhang.md) |
| items | `it_miji_yanxingbu` | 雁行步原本 | `assets/default/item/manuals/it_miji_yanxingbu.png` | 待出图 | [it_miji_yanxingbu.md](items/manuals/it_miji_yanxingbu.md) |
| items | `it_miji_yaowangdujing` | 无嗔医药录原本 | `assets/default/item/manuals/it_miji_yaowangdujing.png` | 待出图 | [it_miji_yaowangdujing.md](items/manuals/it_miji_yaowangdujing.md) |
| items | `it_miji_yijinjing` | 易筋经梵文原本 | `assets/default/item/manuals/it_miji_yijinjing.png` | 待出图 | [it_miji_yijinjing.md](items/manuals/it_miji_yijinjing.md) |
| items | `it_miji_yingzhaoshou` | 鹰爪手抄本 | `assets/default/item/manuals/it_miji_yingzhaoshou.png` | 待出图 | [it_miji_yingzhaoshou.md](items/manuals/it_miji_yingzhaoshou.md) |
| items | `it_miji_yitiantulonggong` | 倚天屠龙功王盘山石刻 | `assets/default/item/manuals/it_miji_yitiantulonggong.png` | 待出图 | [it_miji_yitiantulonggong.md](items/manuals/it_miji_yitiantulonggong.md) |
| items | `it_miji_yizhichan` | 一指禅残本 | `assets/default/item/manuals/it_miji_yizhichan.png` | 待出图 | [it_miji_yizhichan.md](items/manuals/it_miji_yizhichan.md) |
| items | `it_miji_yueyingshenfa` | 越影身法帛卷 | `assets/default/item/manuals/it_miji_yueyingshenfa.png` | 待出图 | [it_miji_yueyingshenfa.md](items/manuals/it_miji_yueyingshenfa.md) |
| items | `it_miji_yuezu_duanjian` | 越卒短剑简谱 | `assets/default/item/manuals/it_miji_yuezu_duanjian.png` | 待出图 | [it_miji_yuezu_duanjian.md](items/manuals/it_miji_yuezu_duanjian.md) |
| items | `it_miji_yuxiaojianfa` | 玉箫剑法谱 | `assets/default/item/manuals/it_miji_yuxiaojianfa.png` | 待出图 | [it_miji_yuxiaojianfa.md](items/manuals/it_miji_yuxiaojianfa.md) |
| items | `it_miji_zhamabu` | 扎马步抄本 | `assets/default/item/manuals/it_miji_zhamabu.png` | 待出图 | [it_miji_zhamabu.md](items/manuals/it_miji_zhamabu.md) |
| items | `it_miji_zhenqijian_can` | 阵旗剑谱残本 | `assets/default/item/manuals/it_miji_zhenqijian_can.png` | 待出图 | [it_miji_zhenqijian_can.md](items/manuals/it_miji_zhenqijian_can.md) |
| items | `it_miji_zhuangxingong` | 壮行功抄本 | `assets/default/item/manuals/it_miji_zhuangxingong.png` | 待出图 | [it_miji_zhuangxingong.md](items/manuals/it_miji_zhuangxingong.md) |
| items | `it_miji_zhuzhijianfa` | 竹枝剑法原本 | `assets/default/item/manuals/it_miji_zhuzhijianfa.png` | 待出图 | [it_miji_zhuzhijianfa.md](items/manuals/it_miji_zhuzhijianfa.md) |
| items | `it_miji_zixiashengong` | 紫霞秘笈传本 | `assets/default/item/manuals/it_miji_zixiashengong.png` | 待出图 | [it_miji_zixiashengong.md](items/manuals/it_miji_zixiashengong.md) |
| items | `it_chansu` | 蟾酥 | `assets/default/item/medicine/it_chansu.png` | 待出图 | [it_chansu.md](items/medicine/it_chansu.md) |
| items | `it_danggui` | 当归 | `assets/default/item/medicine/it_danggui.png` | 待出图 | [it_danggui.md](items/medicine/it_danggui.md) |
| items | `it_ganjiang` | 干姜 | `assets/default/item/medicine/it_ganjiang.png` | 待出图 | [it_ganjiang.md](items/medicine/it_ganjiang.md) |
| items | `it_heshouwu` | 何首乌 | `assets/default/item/medicine/it_heshouwu.png` | 待出图 | [it_heshouwu.md](items/medicine/it_heshouwu.md) |
| items | `it_qinghao` | 青蒿 | `assets/default/item/medicine/it_qinghao.png` | 待出图 | [it_qinghao.md](items/medicine/it_qinghao.md) |
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
| items | `eq_songjunhuanshoujian` | 宋军环首剑 | `assets/default/item/weapons/eq_songjunhuanshoujian.png` | 待出图 | [eq_songjunhuanshoujian.md](items/weapons/eq_songjunhuanshoujian.md) |
| items | `eq_songjunzhimao` | 宋军直矛 | `assets/default/item/weapons/eq_songjunzhimao.png` | 待出图 | [eq_songjunzhimao.md](items/weapons/eq_songjunzhimao.md) |
| items | `eq_songzhanmadao` | 宋斩马刀 | `assets/default/item/weapons/eq_songzhanmadao.png` | 待出图 | [eq_songzhanmadao.md](items/weapons/eq_songzhanmadao.md) |
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

## 物品（11 类，名录 894 项）

每张图的提示词在各文件「提示词」节。下表只列还要出的行（待出图 / 待重出），已入库的不再列出，标题里的计数含已出部分。作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可回到队列。

### 药物 / 补品 / 药材（96）· 已入库 58、已通过（作者） 32、待出图 6

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 蟾酥 | `it_chansu` | 地 | 药材·动物 | 待出图 | [it_chansu.md](items/medicine/it_chansu.md) | template |
| 2 | 何首乌 | `it_heshouwu` | 地 | 药材·根茎 | 待出图 | [it_heshouwu.md](items/medicine/it_heshouwu.md) | template |
| 3 | 青蒿 | `it_qinghao` | 玄 | 药材·草本 | 待出图 | [it_qinghao.md](items/medicine/it_qinghao.md) | template |
| 4 | 雄黄 | `it_xionghuang` | 玄 | 药材·矿物 | 待出图 | [it_xionghuang.md](items/medicine/it_xionghuang.md) | template |
| 5 | 当归 | `it_danggui` | 黄 | 药材·根茎 | 待出图 | [it_danggui.md](items/medicine/it_danggui.md) | template |
| 6 | 干姜 | `it_ganjiang` | 黄 | 药材·根茎 | 待出图 | [it_ganjiang.md](items/medicine/it_ganjiang.md) | template |

### 食材 / 食品（174）· 已入库 146、已通过（作者） 28

（已全部入库。）

### 武学秘籍（180）· 待出图 162、已入库 18

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 北冥神功帛卷原本 | `it_miji_beiming` | 天 | 秘籍·原本 | 待出图 | [it_miji_beiming.md](items/manuals/it_miji_beiming.md) | template |
| 2 | 辟邪剑谱袈裟原本 | `it_miji_bixie` | 天 | 秘籍·原本 | 待出图 | [it_miji_bixie.md](items/manuals/it_miji_bixie.md) | template |
| 3 | 胡家刀谱残本 | `it_miji_hujiadao_can` | 天 | 秘籍·残本 | 待出图 | [it_miji_hujiadao_can.md](items/manuals/it_miji_hujiadao_can.md) | template |
| 4 | 金蛇秘笈原本 | `it_miji_jinshejian` | 天 | 秘籍·原本 | 待出图 | [it_miji_jinshejian.md](items/manuals/it_miji_jinshejian.md) | template |
| 5 | 九阳真经夹注原本 | `it_miji_jiuyang` | 天 | 秘籍·原本 | 待出图 | [it_miji_jiuyang.md](items/manuals/it_miji_jiuyang.md) | template |
| 6 | 葵花宝典传本 | `it_miji_kuihua` | 天 | 秘籍·抄本 | 待出图 | [it_miji_kuihua.md](items/manuals/it_miji_kuihua.md) | template |
| 7 | 六脉神剑经丝绢原卷 | `it_miji_liumai` | 天 | 秘籍·原本 | 待出图 | [it_miji_liumai.md](items/manuals/it_miji_liumai.md) | template |
| 8 | 罗汉伏魔神功泥人图 | `it_miji_luohanfumo_can` | 天 | 秘籍·残本 | 待出图 | [it_miji_luohanfumo_can.md](items/manuals/it_miji_luohanfumo_can.md) | template |
| 9 | 乾坤大挪移羊皮原本 | `it_miji_qiankun` | 天 | 秘籍·原本 | 待出图 | [it_miji_qiankun.md](items/manuals/it_miji_qiankun.md) | template |
| 10 | 圣火令武功原刻 | `it_miji_shenghuoling` | 天 | 秘籍·原本 | 待出图 | [it_miji_shenghuoling.md](items/manuals/it_miji_shenghuoling.md) | template |
| 11 | 太玄经石壁图解 | `it_miji_taixuan` | 天 | 秘籍·抄本 | 待出图 | [it_miji_taixuan.md](items/manuals/it_miji_taixuan.md) | template |
| 12 | 吸星大法铁板原刻 | `it_miji_xixing` | 天 | 秘籍·原本 | 待出图 | [it_miji_xixing.md](items/manuals/it_miji_xixing.md) | template |
| 13 | 易筋经梵文原本 | `it_miji_yijinjing` | 天 | 秘籍·原本 | 待出图 | [it_miji_yijinjing.md](items/manuals/it_miji_yijinjing.md) | template |
| 14 | 王难姑毒经抄本 | `it_miji_baidubianzheng` | 地 | 秘籍·抄本 | 待出图 | [it_miji_baidubianzheng.md](items/manuals/it_miji_baidubianzheng.md) | template |
| 15 | 般若掌法古本 | `it_miji_boruozhang` | 地 | 秘籍·全本 | 待出图 | [it_miji_boruozhang.md](items/manuals/it_miji_boruozhang.md) | template |
| 16 | 赤练神掌残本 | `it_miji_chilianshenzhang_can` | 地 | 秘籍·残本 | 待出图 | [it_miji_chilianshenzhang_can.md](items/manuals/it_miji_chilianshenzhang_can.md) | template |
| 17 | 抽髓掌残本 | `it_miji_chousuizhang_can` | 地 | 秘籍·残本 | 待出图 | [it_miji_chousuizhang_can.md](items/manuals/it_miji_chousuizhang_can.md) | template |
| 18 | 纯阳无极功抄本 | `it_miji_chunyangwuji` | 地 | 秘籍·抄本 | 待出图 | [it_miji_chunyangwuji.md](items/manuals/it_miji_chunyangwuji.md) | template |
| 19 | 打狗阵谱 | `it_miji_dagouzhen` | 地 | 秘籍·全本 | 待出图 | [it_miji_dagouzhen.md](items/manuals/it_miji_dagouzhen.md) | template |
| 20 | 大金刚拳神功古籍 | `it_miji_dajingangquan` | 地 | 秘籍·抄本 | 待出图 | [it_miji_dajingangquan.md](items/manuals/it_miji_dajingangquan.md) | template |
| 21 | 伏魔杖法古册 | `it_miji_fumozhangfa` | 地 | 秘籍·抄本 | 待出图 | [it_miji_fumozhangfa.md](items/manuals/it_miji_fumozhangfa.md) | template |
| 22 | 古墓轻功图谱 | `it_miji_gumuqinggong` | 地 | 秘籍·全本 | 待出图 | [it_miji_gumuqinggong.md](items/manuals/it_miji_gumuqinggong.md) | template |
| 23 | 红花会合击阵谱 | `it_miji_honghuahuiheji` | 地 | 秘籍·全本 | 待出图 | [it_miji_honghuahuiheji.md](items/manuals/it_miji_honghuahuiheji.md) | template |
| 24 | 金关玉锁二十四诀抄本 | `it_miji_jinguanyusuo` | 地 | 秘籍·抄本 | 待出图 | [it_miji_jinguanyusuo.md](items/manuals/it_miji_jinguanyusuo.md) | template |
| 25 | 金钟罩秘籍 | `it_miji_jinzhongzhao` | 地 | 秘籍·全本 | 待出图 | [it_miji_jinzhongzhao.md](items/manuals/it_miji_jinzhongzhao.md) | template |
| 26 | 枯荣禅功经折本 | `it_miji_kurongchangong` | 地 | 秘籍·全本 | 待出图 | [it_miji_kurongchangong.md](items/manuals/it_miji_kurongchangong.md) | template |
| 27 | 琅嬛剑法图谱 | `it_miji_langhuanjian` | 地 | 秘籍·全本 | 待出图 | [it_miji_langhuanjian.md](items/manuals/it_miji_langhuanjian.md) | template |
| 28 | 灵蛇杖法秘本 | `it_miji_lingshezhangfa` | 地 | 秘籍·全本 | 待出图 | [it_miji_lingshezhangfa.md](items/manuals/it_miji_lingshezhangfa.md) | template |
| 29 | 摩诃指秘要古籍 | `it_miji_mohezhi` | 地 | 秘籍·抄本 | 待出图 | [it_miji_mohezhi.md](items/manuals/it_miji_mohezhi.md) | template |
| 30 | 拈花指法钞本 | `it_miji_nianhuazhi` | 地 | 秘籍·抄本 | 待出图 | [it_miji_nianhuazhi.md](items/manuals/it_miji_nianhuazhi.md) | template |
| 31 | 逆转经脉残本 | `it_miji_nizhuanjingmai_can` | 地 | 秘籍·残本 | 待出图 | [it_miji_nizhuanjingmai_can.md](items/manuals/it_miji_nizhuanjingmai_can.md) | template |
| 32 | 缥缈剑法抄本 | `it_miji_piaomiaojian` | 地 | 秘籍·抄本 | 待出图 | [it_miji_piaomiaojian.md](items/manuals/it_miji_piaomiaojian.md) | template |
| 33 | 胡青牛医经手本 | `it_miji_qihuangmifa` | 地 | 秘籍·抄本 | 待出图 | [it_miji_qihuangmifa.md](items/manuals/it_miji_qihuangmifa.md) | template |
| 34 | 擒龙功秘本 | `it_miji_qinlonggong` | 地 | 秘籍·全本 | 待出图 | [it_miji_qinlonggong.md](items/manuals/it_miji_qinlonggong.md) | template |
| 35 | 七伤拳谱古抄本 | `it_miji_qishangquan` | 地 | 秘籍·抄本 | 待出图 | [it_miji_qishangquan.md](items/manuals/it_miji_qishangquan.md) | template |
| 36 | 七伤拳残本 | `it_miji_qishangquan_can` | 地 | 秘籍·残本 | 待出图 | [it_miji_qishangquan_can.md](items/manuals/it_miji_qishangquan_can.md) | template |
| 37 | 神门十三剑抄本 | `it_miji_shenmen13` | 地 | 秘籍·抄本 | 待出图 | [it_miji_shenmen13.md](items/manuals/it_miji_shenmen13.md) | template |
| 38 | 唐诗剑谱原本 | `it_miji_tangshijian` | 地 | 秘籍·原本 | 待出图 | [it_miji_tangshijian.md](items/manuals/it_miji_tangshijian.md) | template |
| 39 | 桃花阵图谱 | `it_miji_taohuazhen` | 地 | 秘籍·全本 | 待出图 | [it_miji_taohuazhen.md](items/manuals/it_miji_taohuazhen.md) | template |
| 40 | 铁钵功残本 | `it_miji_tiebogong_can` | 地 | 秘籍·残本 | 待出图 | [it_miji_tiebogong_can.md](items/manuals/it_miji_tiebogong_can.md) | template |
| 41 | 五轮大转图谱 | `it_miji_wulundazhuan` | 地 | 秘籍·全本 | 待出图 | [it_miji_wulundazhuan.md](items/manuals/it_miji_wulundazhuan.md) | template |
| 42 | 武穆遗书原本 | `it_miji_wumuyishu` | 地 | 秘籍·原本 | 待出图 | [it_miji_wumuyishu.md](items/manuals/it_miji_wumuyishu.md) | template |
| 43 | 无相劫指谱古本 | `it_miji_wuxiangjiezhi` | 地 | 秘籍·抄本 | 待出图 | [it_miji_wuxiangjiezhi.md](items/manuals/it_miji_wuxiangjiezhi.md) | template |
| 44 | 五行旗阵图谱 | `it_miji_wuxingqizhen` | 地 | 秘籍·全本 | 待出图 | [it_miji_wuxingqizhen.md](items/manuals/it_miji_wuxingqizhen.md) | template |
| 45 | 血刀经原本 | `it_miji_xuedaojing` | 地 | 秘籍·原本 | 待出图 | [it_miji_xuedaojing.md](items/manuals/it_miji_xuedaojing.md) | template |
| 46 | 延庆杖法抄本 | `it_miji_yanqingzhang` | 地 | 秘籍·抄本 | 待出图 | [it_miji_yanqingzhang.md](items/manuals/it_miji_yanqingzhang.md) | template |
| 47 | 无嗔医药录原本 | `it_miji_yaowangdujing` | 地 | 秘籍·原本 | 待出图 | [it_miji_yaowangdujing.md](items/manuals/it_miji_yaowangdujing.md) | template |
| 48 | 倚天屠龙功王盘山石刻 | `it_miji_yitiantulonggong` | 地 | 秘籍·原本 | 待出图 | [it_miji_yitiantulonggong.md](items/manuals/it_miji_yitiantulonggong.md) | template |
| 49 | 一指禅残本 | `it_miji_yizhichan` | 地 | 秘籍·残本 | 待出图 | [it_miji_yizhichan.md](items/manuals/it_miji_yizhichan.md) | template |
| 50 | 玉箫剑法谱 | `it_miji_yuxiaojianfa` | 地 | 秘籍·全本 | 待出图 | [it_miji_yuxiaojianfa.md](items/manuals/it_miji_yuxiaojianfa.md) | template |
| 51 | 紫霞秘笈传本 | `it_miji_zixiashengong` | 地 | 秘籍·抄本 | 待出图 | [it_miji_zixiashengong.md](items/manuals/it_miji_zixiashengong.md) | template |
| 52 | 白猿剑意残本 | `it_miji_baiyuanjianyi_can` | 玄 | 秘籍·残本 | 待出图 | [it_miji_baiyuanjianyi_can.md](items/manuals/it_miji_baiyuanjianyi_can.md) | template |
| 53 | 边塞射法全本 | `it_miji_bianshe` | 玄 | 秘籍·全本 | 待出图 | [it_miji_bianshe.md](items/manuals/it_miji_bianshe.md) | template |
| 54 | 餐风饮露功秘籍 | `it_miji_canfengyinlugong` | 玄 | 秘籍·全本 | 待出图 | [it_miji_canfengyinlugong.md](items/manuals/it_miji_canfengyinlugong.md) | template |
| 55 | 短打手抄本 | `it_miji_duandashou` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_duandashou.md](items/manuals/it_miji_duandashou.md) | template |
| 56 | 断阵枪谱全本 | `it_miji_duanzhenqiang` | 玄 | 秘籍·全本 | 待出图 | [it_miji_duanzhenqiang.md](items/manuals/it_miji_duanzhenqiang.md) | template |
| 57 | 峨眉心法抄本 | `it_miji_emeixinfa` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_emeixinfa.md](items/manuals/it_miji_emeixinfa.md) | template |
| 58 | 飞蝗石图谱 | `it_miji_feihuangshi` | 玄 | 秘籍·全本 | 待出图 | [it_miji_feihuangshi.md](items/manuals/it_miji_feihuangshi.md) | template |
| 59 | 光明心法全本 | `it_miji_guangmingxinfa` | 玄 | 秘籍·全本 | 待出图 | [it_miji_guangmingxinfa.md](items/manuals/it_miji_guangmingxinfa.md) | template |
| 60 | 恒山剑法抄本 | `it_miji_hengshanbeijianfa` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_hengshanbeijianfa.md](items/manuals/it_miji_hengshanbeijianfa.md) | template |
| 61 | 红花心法抄本 | `it_miji_honghuaxinfa` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_honghuaxinfa.md](items/manuals/it_miji_honghuaxinfa.md) | template |
| 62 | 华山剑法抄本 | `it_miji_huashanjianfa` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_huashanjianfa.md](items/manuals/it_miji_huashanjianfa.md) | template |
| 63 | 回风落雁剑谱 | `it_miji_huifengluoyan` | 玄 | 秘籍·全本 | 待出图 | [it_miji_huifengluoyan.md](items/manuals/it_miji_huifengluoyan.md) | template |
| 64 | 护围剑谱全本 | `it_miji_huweijian` | 玄 | 秘籍·全本 | 待出图 | [it_miji_huweijian.md](items/manuals/it_miji_huweijian.md) | template |
| 65 | 江湖吐纳全本 | `it_miji_jianghutuna` | 玄 | 秘籍·全本 | 待出图 | [it_miji_jianghutuna.md](items/manuals/it_miji_jianghutuna.md) | template |
| 66 | 解镖刀法原本 | `it_miji_jiebiaodaofa` | 玄 | 秘籍·原本 | 待出图 | [it_miji_jiebiaodaofa.md](items/manuals/it_miji_jiebiaodaofa.md) | template |
| 67 | 金顶九式剑谱 | `it_miji_jindingjiushi` | 玄 | 秘籍·全本 | 待出图 | [it_miji_jindingjiushi.md](items/manuals/it_miji_jindingjiushi.md) | template |
| 68 | 金盾心法残本 | `it_miji_jindunxinfa_can` | 玄 | 秘籍·残本 | 待出图 | [it_miji_jindunxinfa_can.md](items/manuals/it_miji_jindunxinfa_can.md) | template |
| 69 | 九阴真经古墓遗刻 | `it_miji_jiuyinliaoshangpian` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_jiuyinliaoshangpian.md](items/manuals/it_miji_jiuyinliaoshangpian.md) | template |
| 70 | 军旅吐纳抄本 | `it_miji_jundituna` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_jundituna.md](items/manuals/it_miji_jundituna.md) | template |
| 71 | 军中刀法抄本 | `it_miji_junzhongdao` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_junzhongdao.md](items/manuals/it_miji_junzhongdao.md) | template |
| 72 | 昆仑心法抄本 | `it_miji_kunlunxinfa` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_kunlunxinfa.md](items/manuals/it_miji_kunlunxinfa.md) | template |
| 73 | 连环剑谱全本 | `it_miji_lianhuanjian` | 玄 | 秘籍·全本 | 待出图 | [it_miji_lianhuanjian.md](items/manuals/it_miji_lianhuanjian.md) | template |
| 74 | 连环镖枪抄本 | `it_miji_lianhuanqiang` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_lianhuanqiang.md](items/manuals/it_miji_lianhuanqiang.md) | template |
| 75 | 流星锤图谱原本 | `it_miji_liuxingchui` | 玄 | 秘籍·原本 | 待出图 | [it_miji_liuxingchui.md](items/manuals/it_miji_liuxingchui.md) | template |
| 76 | 齐眉棍谱残本 | `it_miji_qimeigun_can` | 玄 | 秘籍·残本 | 待出图 | [it_miji_qimeigun_can.md](items/manuals/it_miji_qimeigun_can.md) | template |
| 77 | 日月心法秘本 | `it_miji_riyuexinfa` | 玄 | 秘籍·全本 | 待出图 | [it_miji_riyuexinfa.md](items/manuals/it_miji_riyuexinfa.md) | template |
| 78 | 神驼雪山掌遗谱 | `it_miji_shentuoxueshanzhang` | 玄 | 秘籍·残本 | 待出图 | [it_miji_shentuoxueshanzhang.md](items/manuals/it_miji_shentuoxueshanzhang.md) | template |
| 79 | 松风剑法全本 | `it_miji_songfengjianfa` | 玄 | 秘籍·全本 | 待出图 | [it_miji_songfengjianfa.md](items/manuals/it_miji_songfengjianfa.md) | template |
| 80 | 嵩山剑法全本 | `it_miji_songshanjianfa` | 玄 | 秘籍·全本 | 待出图 | [it_miji_songshanjianfa.md](items/manuals/it_miji_songshanjianfa.md) | template |
| 81 | 泰山剑法全本 | `it_miji_taishanjianfa` | 玄 | 秘籍·全本 | 待出图 | [it_miji_taishanjianfa.md](items/manuals/it_miji_taishanjianfa.md) | template |
| 82 | 探路步抄本 | `it_miji_tanluobu` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_tanluobu.md](items/manuals/it_miji_tanluobu.md) | template |
| 83 | 弹腿通行谱抄本 | `it_miji_tantui_tongxing` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_tantui_tongxing.md](items/manuals/it_miji_tantui_tongxing.md) | template |
| 84 | 天地会刀谱 | `it_miji_tiandihuidao` | 玄 | 秘籍·全本 | 待出图 | [it_miji_tiandihuidao.md](items/manuals/it_miji_tiandihuidao.md) | template |
| 85 | 天龙门剑谱原本 | `it_miji_tianlongjian` | 玄 | 秘籍·原本 | 待出图 | [it_miji_tianlongjian.md](items/manuals/it_miji_tianlongjian.md) | template |
| 86 | 天王补心针抄本 | `it_miji_tianwangbuxin` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_tianwangbuxin.md](items/manuals/it_miji_tianwangbuxin.md) | template |
| 87 | 通背劲原本 | `it_miji_tongbeijin` | 玄 | 秘籍·原本 | 待出图 | [it_miji_tongbeijin.md](items/manuals/it_miji_tongbeijin.md) | template |
| 88 | 铜人横练抄本 | `it_miji_tongrenhenglian` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_tongrenhenglian.md](items/manuals/it_miji_tongrenhenglian.md) | template |
| 89 | 五毒秘传抄本 | `it_miji_wudumichuan` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_wudumichuan.md](items/manuals/it_miji_wudumichuan.md) | template |
| 90 | 武馆心法抄本 | `it_miji_wuguanxinfa` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_wuguanxinfa.md](items/manuals/it_miji_wuguanxinfa.md) | template |
| 91 | 五虎断门刀民间谱 | `it_miji_wuhuduandandao` | 玄 | 秘籍·全本 | 待出图 | [it_miji_wuhuduandandao.md](items/manuals/it_miji_wuhuduandandao.md) | template |
| 92 | 五仙毒掌抄本 | `it_miji_wuxianduzhang` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_wuxianduzhang.md](items/manuals/it_miji_wuxianduzhang.md) | template |
| 93 | 无影手残本 | `it_miji_wuyingshou_can` | 玄 | 秘籍·残本 | 待出图 | [it_miji_wuyingshou_can.md](items/manuals/it_miji_wuyingshou_can.md) | template |
| 94 | 笑傲江湖曲谱手本 | `it_miji_xiaoaojianghuqu` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_xiaoaojianghuqu.md](items/manuals/it_miji_xiaoaojianghuqu.md) | template |
| 95 | 行军步残本 | `it_miji_xingjunbu_can` | 玄 | 秘籍·残本 | 待出图 | [it_miji_xingjunbu_can.md](items/manuals/it_miji_xingjunbu_can.md) | template |
| 96 | 行气走抄本 | `it_miji_xingqizhou` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_xingqizhou.md](items/manuals/it_miji_xingqizhou.md) | template |
| 97 | 旋风扫叶腿修习谱 | `it_miji_xuanfengsaoyetui` | 玄 | 秘籍·全本 | 待出图 | [it_miji_xuanfengsaoyetui.md](items/manuals/it_miji_xuanfengsaoyetui.md) | template |
| 98 | 鹰爪手抄本 | `it_miji_yingzhaoshou` | 玄 | 秘籍·抄本 | 待出图 | [it_miji_yingzhaoshou.md](items/manuals/it_miji_yingzhaoshou.md) | template |
| 99 | 越影身法帛卷 | `it_miji_yueyingshenfa` | 玄 | 秘籍·全本 | 待出图 | [it_miji_yueyingshenfa.md](items/manuals/it_miji_yueyingshenfa.md) | template |
| 100 | 阵旗剑谱残本 | `it_miji_zhenqijian_can` | 玄 | 秘籍·残本 | 待出图 | [it_miji_zhenqijian_can.md](items/manuals/it_miji_zhenqijian_can.md) | template |
| 101 | 竹枝剑法原本 | `it_miji_zhuzhijianfa` | 玄 | 秘籍·原本 | 待出图 | [it_miji_zhuzhijianfa.md](items/manuals/it_miji_zhuzhijianfa.md) | template |
| 102 | 包伤法抄本 | `it_miji_baoshangfa` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_baoshangfa.md](items/manuals/it_miji_baoshangfa.md) | template |
| 103 | 辨毒法全本 | `it_miji_biandufa` | 黄 | 秘籍·全本 | 待出图 | [it_miji_biandufa.md](items/manuals/it_miji_biandufa.md) | template |
| 104 | 镖局枪法残本 | `it_miji_biaojuqiangfa_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_biaojuqiangfa_can.md](items/manuals/it_miji_biaojuqiangfa_can.md) | template |
| 105 | 镖局入门刀谱 | `it_miji_biaojurumen` | 黄 | 秘籍·全本 | 待出图 | [it_miji_biaojurumen.md](items/manuals/it_miji_biaojurumen.md) | template |
| 106 | 步兵操全本 | `it_miji_bubingcao` | 黄 | 秘籍·全本 | 待出图 | [it_miji_bubingcao.md](items/manuals/it_miji_bubingcao.md) | template |
| 107 | 布阵入门全本 | `it_miji_buzhenrumen` | 黄 | 秘籍·全本 | 待出图 | [it_miji_buzhenrumen.md](items/manuals/it_miji_buzhenrumen.md) | template |
| 108 | 草上飞残本 | `it_miji_caoshangfei_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_caoshangfei_can.md](items/manuals/it_miji_caoshangfei_can.md) | template |
| 109 | 草药知原本 | `it_miji_caoyaozhi` | 黄 | 秘籍·原本 | 待出图 | [it_miji_caoyaozhi.md](items/manuals/it_miji_caoyaozhi.md) | template |
| 110 | 长枪入门谱 | `it_miji_changqiangrumen` | 黄 | 秘籍·全本 | 待出图 | [it_miji_changqiangrumen.md](items/manuals/it_miji_changqiangrumen.md) | template |
| 111 | 长拳入门谱 | `it_miji_changquanrumen` | 黄 | 秘籍·全本 | 待出图 | [it_miji_changquanrumen.md](items/manuals/it_miji_changquanrumen.md) | template |
| 112 | 传音法抄本 | `it_miji_chuanyinfa` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_chuanyinfa.md](items/manuals/it_miji_chuanyinfa.md) | template |
| 113 | 丹田养气全本 | `it_miji_dantianyangqi` | 黄 | 秘籍·全本 | 待出图 | [it_miji_dantianyangqi.md](items/manuals/it_miji_dantianyangqi.md) | template |
| 114 | 笛曲入门抄本 | `it_miji_diqurumen` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_diqurumen.md](items/manuals/it_miji_diqurumen.md) | template |
| 115 | 短枪法抄本 | `it_miji_duanqiangfa` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_duanqiangfa.md](items/manuals/it_miji_duanqiangfa.md) | template |
| 116 | 峨眉入门剑谱 | `it_miji_emeirumenjian` | 黄 | 秘籍·全本 | 待出图 | [it_miji_emeirumenjian.md](items/manuals/it_miji_emeirumenjian.md) | template |
| 117 | 风石投术简谱 | `it_miji_fengshitoushu` | 黄 | 秘籍·全本 | 待出图 | [it_miji_fengshitoushu.md](items/manuals/it_miji_fengshitoushu.md) | template |
| 118 | 改装法抄本 | `it_miji_gaizhuangfa` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_gaizhuangfa.md](items/manuals/it_miji_gaizhuangfa.md) | template |
| 119 | 赶夜步全本 | `it_miji_ganyebu` | 黄 | 秘籍·全本 | 待出图 | [it_miji_ganyebu.md](items/manuals/it_miji_ganyebu.md) | template |
| 120 | 弓手法残本 | `it_miji_gongshou_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_gongshou_can.md](items/manuals/it_miji_gongshou_can.md) | template |
| 121 | 古墓心法抄本 | `it_miji_gumuxinfa` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_gumuxinfa.md](items/manuals/it_miji_gumuxinfa.md) | template |
| 122 | 海风步全本 | `it_miji_haifengbu` | 黄 | 秘籍·全本 | 待出图 | [it_miji_haifengbu.md](items/manuals/it_miji_haifengbu.md) | template |
| 123 | 横刀入门招全本 | `it_miji_hengdaorumenzhao` | 黄 | 秘籍·全本 | 待出图 | [it_miji_hengdaorumenzhao.md](items/manuals/it_miji_hengdaorumenzhao.md) | template |
| 124 | 呼吸行气残本 | `it_miji_huxixingqi_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_huxixingqi_can.md](items/manuals/it_miji_huxixingqi_can.md) | template |
| 125 | 护院拳谱全本 | `it_miji_huyuanquan` | 黄 | 秘籍·全本 | 待出图 | [it_miji_huyuanquan.md](items/manuals/it_miji_huyuanquan.md) | template |
| 126 | 江湖长拳谱 | `it_miji_jianghuchangquan` | 黄 | 秘籍·全本 | 待出图 | [it_miji_jianghuchangquan.md](items/manuals/it_miji_jianghuchangquan.md) | template |
| 127 | 江湖入门剑谱 | `it_miji_jianghurumenjian` | 黄 | 秘籍·全本 | 待出图 | [it_miji_jianghurumenjian.md](items/manuals/it_miji_jianghurumenjian.md) | template |
| 128 | 救穴法残本 | `it_miji_jiuxuefa_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_jiuxuefa_can.md](items/manuals/it_miji_jiuxuefa_can.md) | template |
| 129 | 军伍短刀抄本 | `it_miji_junwuduandao` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_junwuduandao.md](items/manuals/it_miji_junwuduandao.md) | template |
| 130 | 军帐吐纳抄本 | `it_miji_junzhangtuna` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_junzhangtuna.md](items/manuals/it_miji_junzhangtuna.md) | template |
| 131 | 看阵法抄本 | `it_miji_kanzhenfa` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_kanzhenfa.md](items/manuals/it_miji_kanzhenfa.md) | template |
| 132 | 崆峒入门拳谱 | `it_miji_kongtongrumenquan` | 黄 | 秘籍·全本 | 待出图 | [it_miji_kongtongrumenquan.md](items/manuals/it_miji_kongtongrumenquan.md) | template |
| 133 | 昆仑入门剑谱 | `it_miji_kunlunrumenjian` | 黄 | 秘籍·全本 | 待出图 | [it_miji_kunlunrumenjian.md](items/manuals/it_miji_kunlunrumenjian.md) | template |
| 134 | 列阵步残本 | `it_miji_liezhengbu_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_liezhengbu_can.md](items/manuals/it_miji_liezhengbu_can.md) | template |
| 135 | 临摹帖式原本 | `it_miji_linmotieshi` | 黄 | 秘籍·原本 | 待出图 | [it_miji_linmotieshi.md](items/manuals/it_miji_linmotieshi.md) | template |
| 136 | 牧羊杖法简谱 | `it_miji_muyangzhang` | 黄 | 秘籍·全本 | 待出图 | [it_miji_muyangzhang.md](items/manuals/it_miji_muyangzhang.md) | template |
| 137 | 蓬莱入门拳抄本 | `it_miji_penglairumenquan` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_penglairumenquan.md](items/manuals/it_miji_penglairumenquan.md) | template |
| 138 | 平锋剑抄本 | `it_miji_pingfengjian` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_pingfengjian.md](items/manuals/it_miji_pingfengjian.md) | template |
| 139 | 棋势入门残本 | `it_miji_qishirumen_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_qishirumen_can.md](items/manuals/it_miji_qishirumen_can.md) | template |
| 140 | 全真吐纳诀抄本 | `it_miji_quanzhentunajue` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_quanzhentunajue.md](items/manuals/it_miji_quanzhentunajue.md) | template |
| 141 | 散手全本 | `it_miji_sanshou` | 黄 | 秘籍·全本 | 待出图 | [it_miji_sanshou.md](items/manuals/it_miji_sanshou.md) | template |
| 142 | 山野吐纳帛本 | `it_miji_shanyetuna` | 黄 | 秘籍·原本 | 待出图 | [it_miji_shanyetuna.md](items/manuals/it_miji_shanyetuna.md) | template |
| 143 | 哨棒棍谱残本 | `it_miji_shaobanggun_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_shaobanggun_can.md](items/manuals/it_miji_shaobanggun_can.md) | template |
| 144 | 少林棍法谱 | `it_miji_shaolingunfa` | 黄 | 秘籍·全本 | 待出图 | [it_miji_shaolingunfa.md](items/manuals/it_miji_shaolingunfa.md) | template |
| 145 | 少林心法抄本 | `it_miji_shaolinxinfa` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_shaolinxinfa.md](items/manuals/it_miji_shaolinxinfa.md) | template |
| 146 | 圣火吐纳诀抄本 | `it_miji_shenghuotunajue` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_shenghuotunajue.md](items/manuals/it_miji_shenghuotunajue.md) | template |
| 147 | 识蛊虫残本 | `it_miji_shiguchong_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_shiguchong_can.md](items/manuals/it_miji_shiguchong_can.md) | template |
| 148 | 书画笔法抄本 | `it_miji_shuhuabifa` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_shuhuabifa.md](items/manuals/it_miji_shuhuabifa.md) | template |
| 149 | 弹腿入门抄本 | `it_miji_tantuirumen` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_tantuirumen.md](items/manuals/it_miji_tantuirumen.md) | template |
| 150 | 铁臂手全本 | `it_miji_tiebishou` | 黄 | 秘籍·全本 | 待出图 | [it_miji_tiebishou.md](items/manuals/it_miji_tiebishou.md) | template |
| 151 | 铁袖功抄本 | `it_miji_tiexiu` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_tiexiu.md](items/manuals/it_miji_tiexiu.md) | template |
| 152 | 通行飞石图谱 | `it_miji_tongxingfeishi` | 黄 | 秘籍·全本 | 待出图 | [it_miji_tongxingfeishi.md](items/manuals/it_miji_tongxingfeishi.md) | template |
| 153 | 吐纳浅诀抄本 | `it_miji_tunaqianjue` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_tunaqianjue.md](items/manuals/it_miji_tunaqianjue.md) | template |
| 154 | 武当长拳谱 | `it_miji_wudangchangquan` | 黄 | 秘籍·全本 | 待出图 | [it_miji_wudangchangquan.md](items/manuals/it_miji_wudangchangquan.md) | template |
| 155 | 武馆刀法残本 | `it_miji_wuguandao_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_wuguandao_can.md](items/manuals/it_miji_wuguandao_can.md) | template |
| 156 | 武馆棍法全本 | `it_miji_wuguangun` | 黄 | 秘籍·全本 | 待出图 | [it_miji_wuguangun.md](items/manuals/it_miji_wuguangun.md) | template |
| 157 | 溪涧投步残卷 | `it_miji_xijiantoubu_can` | 黄 | 秘籍·残本 | 待出图 | [it_miji_xijiantoubu_can.md](items/manuals/it_miji_xijiantoubu_can.md) | template |
| 158 | 训犬术全本 | `it_miji_xunquanshu` | 黄 | 秘籍·全本 | 待出图 | [it_miji_xunquanshu.md](items/manuals/it_miji_xunquanshu.md) | template |
| 159 | 雁行步原本 | `it_miji_yanxingbu` | 黄 | 秘籍·原本 | 待出图 | [it_miji_yanxingbu.md](items/manuals/it_miji_yanxingbu.md) | template |
| 160 | 越卒短剑简谱 | `it_miji_yuezu_duanjian` | 黄 | 秘籍·全本 | 待出图 | [it_miji_yuezu_duanjian.md](items/manuals/it_miji_yuezu_duanjian.md) | template |
| 161 | 扎马步抄本 | `it_miji_zhamabu` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_zhamabu.md](items/manuals/it_miji_zhamabu.md) | template |
| 162 | 壮行功抄本 | `it_miji_zhuangxingong` | 黄 | 秘籍·抄本 | 待出图 | [it_miji_zhuangxingong.md](items/manuals/it_miji_zhuangxingong.md) | template |

### 兵器（247）· 已入库 166、待出图 57、已通过（作者） 24

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 田伯光快刀 | `eq_tianboguangkuaidao` | 地中 | 兵器·刀 | 待出图 | [eq_tianboguangkuaidao.md](items/weapons/eq_tianboguangkuaidao.md) | template |
| 2 | 王维扬八卦刀 | `eq_wangweiyangbaguadao` | 地中 | 兵器·刀 | 待出图 | [eq_wangweiyangbaguadao.md](items/weapons/eq_wangweiyangbaguadao.md) | template |
| 3 | 潇湘子哭丧棒 | `eq_xiaoxiangzikusangbang` | 地中 | 兵器·棍 | 待出图 | [eq_xiaoxiangzikusangbang.md](items/weapons/eq_xiaoxiangzikusangbang.md) | template |
| 4 | 云中鹤钢抓 | `eq_yunzhonghegangzhua` | 地下 | 兵器·奇门爪 | 待出图 | [eq_yunzhonghegangzhua.md](items/weapons/eq_yunzhonghegangzhua.md) | template |
| 5 | 朱丹臣判官笔 | `eq_zhudanchenpanguanbi` | 地下 | 兵器·奇门笔 | 待出图 | [eq_zhudanchenpanguanbi.md](items/weapons/eq_zhudanchenpanguanbi.md) | template |
| 6 | 长柄月牙铲 | `eq_changbingyueyachan` | 玄中 | 兵器·奇门铲 | 待出图 | [eq_changbingyueyachan.md](items/weapons/eq_changbingyueyachan.md) | template |
| 7 | 大理护军铜环 | `eq_dalijunhuan` | 玄上 | 兵器·奇门轮 | 待出图 | [eq_dalijunhuan.md](items/weapons/eq_dalijunhuan.md) | template |
| 8 | 凤尾双笔 | `eq_fengweishuangbi` | 玄上 | 兵器·奇门笔 | 待出图 | [eq_fengweishuangbi.md](items/weapons/eq_fengweishuangbi.md) | template |
| 9 | 蒙古骑兵刀 | `eq_mengguqibingdao` | 玄下 | 兵器·刀 | 待出图 | [eq_mengguqibingdao.md](items/weapons/eq_mengguqibingdao.md) | template |
| 10 | 明军长刀（苗刀名待考） | `eq_mingmiaodao` | 玄中 | 兵器·长刀 | 待出图 | [eq_mingmiaodao.md](items/weapons/eq_mingmiaodao.md) | template |
| 11 | 明营佩剑 | `eq_mingyingpeijian` | 玄下 | 兵器·剑 | 待出图 | [eq_mingyingpeijian.md](items/weapons/eq_mingyingpeijian.md) | template |
| 12 | 宋斩马刀 | `eq_songzhanmadao` | 玄下 | 兵器·长刀 | 待出图 | [eq_songzhanmadao.md](items/weapons/eq_songzhanmadao.md) | template |
| 13 | 唐陌刀 | `eq_tangmodao` | 玄中 | 兵器·长刀 | 待出图 | [eq_tangmodao.md](items/weapons/eq_tangmodao.md) | template |
| 14 | 铁链飞爪 | `eq_tielianfeizhua` | 玄上 | 兵器·鞭索 | 待出图 | [eq_tielianfeizhua.md](items/weapons/eq_tielianfeizhua.md) | template |
| 15 | 吐蕃长矛 | `eq_tubochangmao` | 玄中 | 兵器·枪 | 待出图 | [eq_tubochangmao.md](items/weapons/eq_tubochangmao.md) | template |
| 16 | 吐蕃铁头杖 | `eq_tubotiebang` | 玄下 | 兵器·棍杖 | 待出图 | [eq_tubotiebang.md](items/weapons/eq_tubotiebang.md) | template |
| 17 | 吐蕃铁金刚杵 | `eq_tubotiejingangchu` | 玄中 | 兵器·奇门杵 | 待出图 | [eq_tubotiejingangchu.md](items/weapons/eq_tubotiejingangchu.md) | template |
| 18 | 五雷铁简 | `eq_wuleitiejian` | 玄上 | 兵器·奇门简 | 待出图 | [eq_wuleitiejian.md](items/weapons/eq_wuleitiejian.md) | template |
| 19 | 西域环首剑 | `eq_xiyuhuanshoujian` | 玄中 | 兵器·剑 | 待出图 | [eq_xiyuhuanshoujian.md](items/weapons/eq_xiyuhuanshoujian.md) | template |
| 20 | 玄门双拐 | `eq_xuanmenshuangguai` | 玄上 | 兵器·棍杖 | 待出图 | [eq_xuanmenshuangguai.md](items/weapons/eq_xuanmenshuangguai.md) | template |
| 21 | 叶二娘方头薄刀 | `eq_yeerniangfangdao` | 玄上 | 兵器·刀 | 待出图 | [eq_yeerniangfangdao.md](items/weapons/eq_yeerniangfangdao.md) | template |
| 22 | 尹克西金龙鞭 | `eq_yinkexijinlongbian` | 玄上 | 兵器·鞭索 | 待出图 | [eq_yinkexijinlongbian.md](items/weapons/eq_yinkexijinlongbian.md) | template |
| 23 | 阴阳软刃轮 | `eq_yinyangruanlun` | 玄中 | 兵器·奇门轮 | 待出图 | [eq_yinyangruanlun.md](items/weapons/eq_yinyangruanlun.md) | template |
| 24 | 元军瓜棱骨朵 | `eq_yuanjungalengguduo` | 玄下 | 兵器·奇门锤 | 待出图 | [eq_yuanjungalengguduo.md](items/weapons/eq_yuanjungalengguduo.md) | template |
| 25 | 元军铁箍马棒 | `eq_yuanjunmabang` | 玄中 | 兵器·棍 | 待出图 | [eq_yuanjunmabang.md](items/weapons/eq_yuanjunmabang.md) | template |
| 26 | 元军骑矟 | `eq_yuanjunqishuo` | 玄下 | 兵器·枪 | 待出图 | [eq_yuanjunqishuo.md](items/weapons/eq_yuanjunqishuo.md) | template |
| 27 | 元军弯刀 | `eq_yuanjunwandao` | 玄下 | 兵器·刀 | 待出图 | [eq_yuanjunwandao.md](items/weapons/eq_yuanjunwandao.md) | template |
| 28 | 玉管拂尘 | `eq_yuguanchen` | 玄上 | 兵器·鞭索 | 待出图 | [eq_yuguanchen.md](items/weapons/eq_yuguanchen.md) | template |
| 29 | 张阿生屠牛刀 | `eq_zhangashengtuniudao` | 玄上 | 兵器·刀 | 待出图 | [eq_zhangashengtuniudao.md](items/weapons/eq_zhangashengtuniudao.md) | template |
| 30 | 丈八曲蛇矛 | `eq_zhangbaqushemao` | 玄上 | 兵器·枪 | 待出图 | [eq_zhangbaqushemao.md](items/weapons/eq_zhangbaqushemao.md) | template |
| 31 | 朱聪铁扇 | `eq_zhucongtieshan` | 玄上 | 兵器·奇门扇 | 待出图 | [eq_zhucongtieshan.md](items/weapons/eq_zhucongtieshan.md) | template |
| 32 | 子母五阳轮 | `eq_zimuwuyanglun` | 玄上 | 兵器·奇门轮 | 待出图 | [eq_zimuwuyanglun.md](items/weapons/eq_zimuwuyanglun.md) | template |
| 33 | 春秋青铜戈 | `eq_chunqiutongge` | 黄下 | 兵器·奇门戈 | 待出图 | [eq_chunqiutongge.md](items/weapons/eq_chunqiutongge.md) | template |
| 34 | 九节鞭 | `eq_jiujiebian` | 黄中 | 兵器·鞭索 | 待出图 | [eq_jiujiebian.md](items/weapons/eq_jiujiebian.md) | template |
| 35 | 清顺刀 | `eq_qingshundao` | 黄上 | 兵器·刀 | 待出图 | [eq_qingshundao.md](items/weapons/eq_qingshundao.md) | template |
| 36 | 宋军环首剑 | `eq_songjunhuanshoujian` | 黄下 | 兵器·剑 | 待出图 | [eq_songjunhuanshoujian.md](items/weapons/eq_songjunhuanshoujian.md) | template |
| 37 | 宋军直矛 | `eq_songjunzhimao` | 黄下 | 兵器·枪 | 待出图 | [eq_songjunzhimao.md](items/weapons/eq_songjunzhimao.md) | template |
| 38 | 唐军营棒 | `eq_tangjunyingbang` | 黄中 | 兵器·棍 | 待出图 | [eq_tangjunyingbang.md](items/weapons/eq_tangjunyingbang.md) | template |
| 39 | 唐军长钺 | `eq_tangjunzhangyue` | 黄中 | 兵器·奇门斧 | 待出图 | [eq_tangjunzhangyue.md](items/weapons/eq_tangjunzhangyue.md) | template |
| 40 | 唐军直剑 | `eq_tangjunzhijian` | 黄中 | 兵器·剑 | 待出图 | [eq_tangjunzhijian.md](items/weapons/eq_tangjunzhijian.md) | template |
| 41 | 唐骑矟 | `eq_tangmaqishuo` | 黄中 | 兵器·枪 | 待出图 | [eq_tangmaqishuo.md](items/weapons/eq_tangmaqishuo.md) | template |
| 42 | 唐仪刀 | `eq_tangyidao` | 黄上 | 兵器·刀 | 待出图 | [eq_tangyidao.md](items/weapons/eq_tangyidao.md) | template |
| 43 | 铁算盘 | `eq_tiesuanpan` | 黄上 | 兵器·奇门算盘 | 待出图 | [eq_tiesuanpan.md](items/weapons/eq_tiesuanpan.md) | template |
| 44 | 吐蕃环首刀 | `eq_tubohuanshoudao` | 黄上 | 兵器·刀 | 待出图 | [eq_tubohuanshoudao.md](items/weapons/eq_tubohuanshoudao.md) | template |
| 45 | 吐蕃铁剑 | `eq_tubotiejian` | 黄上 | 兵器·剑 | 待出图 | [eq_tubotiejian.md](items/weapons/eq_tubotiejian.md) | template |
| 46 | 五节铁笛 | `eq_wujietiedi` | 黄中 | 兵器·奇门笛 | 待出图 | [eq_wujietiedi.md](items/weapons/eq_wujietiedi.md) | template |
| 47 | 吴越青铜剑 | `eq_wuyueqingtongjian` | 黄下 | 兵器·剑 | 待出图 | [eq_wuyueqingtongjian.md](items/weapons/eq_wuyueqingtongjian.md) | template |
| 48 | 西域节头棍 | `eq_xiyujietougun` | 黄上 | 兵器·棍 | 待出图 | [eq_xiyujietougun.md](items/weapons/eq_xiyujietougun.md) | template |
| 49 | 西域骑刀 | `eq_xiyuqidao` | 黄中 | 兵器·刀 | 待出图 | [eq_xiyuqidao.md](items/weapons/eq_xiyuqidao.md) | template |
| 50 | 西域月牙铲 | `eq_xiyuyueyachan` | 黄上 | 兵器·奇门铲 | 待出图 | [eq_xiyuyueyachan.md](items/weapons/eq_xiyuyueyachan.md) | template |
| 51 | 玄骨铁扇 | `eq_xuangutieshan` | 黄上 | 兵器·奇门扇 | 待出图 | [eq_xuangutieshan.md](items/weapons/eq_xuangutieshan.md) | template |
| 52 | 铁琵琶 | `eq_xuantielepipa` | 黄上 | 兵器·奇门琴 | 待出图 | [eq_xuantielepipa.md](items/weapons/eq_xuantielepipa.md) | template |
| 53 | 一字铁拐 | `eq_yiziguai` | 黄中 | 兵器·棍杖 | 待出图 | [eq_yiziguai.md](items/weapons/eq_yiziguai.md) | template |
| 54 | 元军护手直剑 | `eq_yuanjunzhijian` | 黄上 | 兵器·剑 | 待出图 | [eq_yuanjunzhijian.md](items/weapons/eq_yuanjunzhijian.md) | template |
| 55 | 鸳鸯钺 | `eq_yuanyangyue` | 黄下 | 兵器·奇门钺 | 待出图 | [eq_yuanyangyue.md](items/weapons/eq_yuanyangyue.md) | template |
| 56 | 月牙双钩 | `eq_yueyashuanggou` | 黄中 | 兵器·奇门钩 | 待出图 | [eq_yueyashuanggou.md](items/weapons/eq_yueyashuanggou.md) | template |
| 57 | 竹节短杖 | `eq_zhujieduanzhang` | 黄下 | 兵器·棍杖 | 待出图 | [eq_zhujieduanzhang.md](items/weapons/eq_zhujieduanzhang.md) | template |

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

### 暗器（51）· 已入库 41、待出图 10

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 飞燕银梭 | `eq_feiyanyinsuo` | 地中 | 暗器·名梭 | 待出图 | [eq_feiyanyinsuo.md](items/hidden-weapons/eq_feiyanyinsuo.md) | template |
| 2 | 回龙璧 | `eq_huilongbi` | 地中 | 暗器·名镖 | 待出图 | [eq_huilongbi.md](items/hidden-weapons/eq_huilongbi.md) | template |
| 3 | 金花镖 | `eq_jinhuabiao` | 地中 | 暗器·名镖 | 待出图 | [eq_jinhuabiao.md](items/hidden-weapons/eq_jinhuabiao.md) | template |
| 4 | 生死符冰片包 | `eq_shengsifubao` | 地上 | 暗器·名符 | 待出图 | [eq_shengsifubao.md](items/hidden-weapons/eq_shengsifubao.md) | template |
| 5 | 无影银针 | `eq_wuyingyinzhen` | 地中 | 暗器·机括针靴 | 待出图 | [eq_wuyingyinzhen.md](items/hidden-weapons/eq_wuyingyinzhen.md) | template |
| 6 | 燕子镖囊 | `eq_yanzibiaonang` | 玄中 | 暗器·飞镖 | 待出图 | [eq_yanzibiaonang.md](items/hidden-weapons/eq_yanzibiaonang.md) | template |
| 7 | 蒙古马弹囊 | `eq_menggumadannang` | 黄上 | 暗器·弹丸囊 | 待出图 | [eq_menggumadannang.md](items/hidden-weapons/eq_menggumadannang.md) | template |
| 8 | 吐蕃飞石囊 | `eq_tubofeishinang` | 黄上 | 暗器·弹丸囊 | 待出图 | [eq_tubofeishinang.md](items/hidden-weapons/eq_tubofeishinang.md) | template |
| 9 | 西域风叶镖囊 | `eq_xiyufengyebiaonang` | 黄上 | 暗器·飞镖 | 待出图 | [eq_xiyufengyebiaonang.md](items/hidden-weapons/eq_xiyufengyebiaonang.md) | template |
| 10 | 元骑手飞刀囊 | `eq_yuanqishoufeidaonang` | 黄中 | 暗器·飞刀 | 待出图 | [eq_yuanqishoufeidaonang.md](items/hidden-weapons/eq_yuanqishoufeidaonang.md) | template |

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
