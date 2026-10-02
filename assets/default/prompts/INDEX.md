# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）

> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。
> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。

提示词 **627** 份：已入库 269、待出图 226、已通过（作者） 132。**待出图队列 226 行**（`python3 tools/agents/build_image_index.py --queue`）。

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
| items | `it_dongporou` | 东坡肉 | `assets/default/item/food/it_dongporou.png` | 待出图 | [it_dongporou.md](items/food/it_dongporou.md) |
| items | `it_doufu` | 豆腐 | `assets/default/item/food/it_doufu.png` | 待出图 | [it_doufu.md](items/food/it_doufu.md) |
| items | `it_fanshu` | 番薯 | `assets/default/item/food/it_fanshu.png` | 待出图 | [it_fanshu.md](items/food/it_fanshu.md) |
| items | `it_fenggan_yangrou` | 风干羊肉 | `assets/default/item/food/it_fenggan_yangrou.png` | 待出图 | [it_fenggan_yangrou.md](items/food/it_fenggan_yangrou.md) |
| items | `it_furu` | 腐乳 | `assets/default/item/food/it_furu.png` | 待出图 | [it_furu.md](items/food/it_furu.md) |
| items | `it_gaoliang` | 高粱 | `assets/default/item/food/it_gaoliang.png` | 待出图 | [it_gaoliang.md](items/food/it_gaoliang.md) |
| items | `it_gerou` | 鸽肉 | `assets/default/item/food/it_gerou.png` | 待出图 | [it_gerou.md](items/food/it_gerou.md) |
| items | `it_guangmingding_suxian_yuanbing` | 光明顶素馅圆饼 | `assets/default/item/food/it_guangmingding_suxian_yuanbing.png` | 待出图 | [it_guangmingding_suxian_yuanbing.md](items/food/it_guangmingding_suxian_yuanbing.md) |
| items | `it_guokui` | 锅盔 | `assets/default/item/food/it_guokui.png` | 待出图 | [it_guokui.md](items/food/it_guokui.md) |
| items | `it_haili` | 海蛎 | `assets/default/item/food/it_haili.png` | 待出图 | [it_haili.md](items/food/it_haili.md) |
| items | `it_haishen` | 海参 | `assets/default/item/food/it_haishen.png` | 待出图 | [it_haishen.md](items/food/it_haishen.md) |
| items | `it_haiyu` | 海鱼 | `assets/default/item/food/it_haiyu.png` | 待出图 | [it_haiyu.md](items/food/it_haiyu.md) |
| items | `it_hanshui_siwan_fancai` | 汉水四碗饭菜 | `assets/default/item/food/it_hanshui_siwan_fancai.png` | 待出图 | [it_hanshui_siwan_fancai.md](items/food/it_hanshui_siwan_fancai.md) |
| items | `it_heli` | 河鲤 | `assets/default/item/food/it_heli.png` | 待出图 | [it_heli.md](items/food/it_heli.md) |
| items | `it_hengshan_qingcaidoufu` | 恒山青菜豆腐 | `assets/default/item/food/it_hengshan_qingcaidoufu.png` | 待出图 | [it_hengshan_qingcaidoufu.md](items/food/it_hengshan_qingcaidoufu.md) |
| items | `it_hengshan_suxianzong` | 恒山素馅粽 | `assets/default/item/food/it_hengshan_suxianzong.png` | 待出图 | [it_hengshan_suxianzong.md](items/food/it_hengshan_suxianzong.md) |
| items | `it_hetun` | 河豚 | `assets/default/item/food/it_hetun.png` | 待出图 | [it_hetun.md](items/food/it_hetun.md) |
| items | `it_honghuahui_zongduo_yanxi` | 红花会总舵宴席 | `assets/default/item/food/it_honghuahui_zongduo_yanxi.png` | 待出图 | [it_honghuahui_zongduo_yanxi.md](items/food/it_honghuahui_zongduo_yanxi.md) |
| items | `it_hongzao` | 红枣 | `assets/default/item/food/it_hongzao.png` | 待出图 | [it_hongzao.md](items/food/it_hongzao.md) |
| items | `it_huajiao` | 花胶 | `assets/default/item/food/it_huajiao.png` | 待出图 | [it_huajiao.md](items/food/it_huajiao.md) |
| items | `it_huajiao_xiangliao` | 花椒香料 | `assets/default/item/food/it_huajiao_xiangliao.png` | 待出图 | [it_huajiao_xiangliao.md](items/food/it_huajiao_xiangliao.md) |
| items | `it_huashan_qingcai_doufufan` | 华山青菜豆腐饭 | `assets/default/item/food/it_huashan_qingcai_doufufan.png` | 待出图 | [it_huashan_qingcai_doufufan.md](items/food/it_huashan_qingcai_doufufan.md) |
| items | `it_huayuan_gaobing` | 花园糕饼 | `assets/default/item/food/it_huayuan_gaobing.png` | 待出图 | [it_huayuan_gaobing.md](items/food/it_huayuan_gaobing.md) |
| items | `it_huibu_zhuafan_kaorou` | 回部抓饭烤肉 | `assets/default/item/food/it_huibu_zhuafan_kaorou.png` | 待出图 | [it_huibu_zhuafan_kaorou.md](items/food/it_huibu_zhuafan_kaorou.md) |
| items | `it_huiyanlou_huncai` | 回雁楼荤菜 | `assets/default/item/food/it_huiyanlou_huncai.png` | 待出图 | [it_huiyanlou_huncai.md](items/food/it_huiyanlou_huncai.md) |
| items | `it_humiao_mantou_jiyangtui` | 胡苗馒头鸡羊腿 | `assets/default/item/food/it_humiao_mantou_jiyangtui.png` | 待出图 | [it_humiao_mantou_jiyangtui.md](items/food/it_humiao_mantou_jiyangtui.md) |
| items | `it_huodui_kaozhangji` | 火堆烤獐麂 | `assets/default/item/food/it_huodui_kaozhangji.png` | 待出图 | [it_huodui_kaozhangji.md](items/food/it_huodui_kaozhangji.md) |
| items | `it_huxie` | 湖蟹 | `assets/default/item/food/it_huxie.png` | 待出图 | [it_huxie.md](items/food/it_huxie.md) |
| items | `it_jiangshilang_doufu` | 蒋侍郎豆腐 | `assets/default/item/food/it_jiangshilang_doufu.png` | 待出图 | [it_jiangshilang_doufu.md](items/food/it_jiangshilang_doufu.md) |
| items | `it_jiangyaozhu` | 江瑶柱 | `assets/default/item/food/it_jiangyaozhu.png` | 待出图 | [it_jiangyaozhu.md](items/food/it_jiangyaozhu.md) |
| items | `it_jiangzhi` | 酱汁 | `assets/default/item/food/it_jiangzhi.png` | 待出图 | [it_jiangzhi.md](items/food/it_jiangzhi.md) |
| items | `it_jirou` | 鸡肉 | `assets/default/item/food/it_jirou.png` | 待出图 | [it_jirou.md](items/food/it_jirou.md) |
| items | `it_jiucai` | 韭菜 | `assets/default/item/food/it_jiucai.png` | 待出图 | [it_jiucai.md](items/food/it_jiucai.md) |
| items | `it_juecai` | 蕨菜 | `assets/default/item/food/it_juecai.png` | 待出图 | [it_juecai.md](items/food/it_juecai.md) |
| items | `it_lajiao` | 辣椒 | `assets/default/item/food/it_lajiao.png` | 待出图 | [it_lajiao.md](items/food/it_lajiao.md) |
| items | `it_lizhi` | 荔枝 | `assets/default/item/food/it_lizhi.png` | 待出图 | [it_lizhi.md](items/food/it_lizhi.md) |
| items | `it_lubeiji` | 炉焙鸡 | `assets/default/item/food/it_lubeiji.png` | 待出图 | [it_lubeiji.md](items/food/it_lubeiji.md) |
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

## 物品（11 类，名录 512 项）

每张图的提示词在各文件「提示词」节。下表只列还要出的行（待出图 / 待重出），已入库的不再列出，标题里的计数含已出部分。作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可回到队列。

### 药物 / 补品 / 药材（32）· 已通过（作者） 32

（已全部入库。）

### 食材 / 食品（174）· 待出图 111、已入库 35、已通过（作者） 28

| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |
|---:|---|---|---|---|---|---|---|
| 1 | 燕窝 | `it_yanwo` | 天 | 食材·珍材 | 待出图 | [it_yanwo.md](items/food/it_yanwo.md) | template |
| 2 | 燕窝鸡丝汤 | `it_yanwojisitang` | 天 | 食品·名菜 | 待出图 | [it_yanwojisitang.md](items/food/it_yanwojisitang.md) | template |
| 3 | 东坡肉 | `it_dongporou` | 地 | 食品·名菜 | 待出图 | [it_dongporou.md](items/food/it_dongporou.md) | template |
| 4 | 海参 | `it_haishen` | 地 | 食材·珍材 | 待出图 | [it_haishen.md](items/food/it_haishen.md) | template |
| 5 | 恒山素馅粽 | `it_hengshan_suxianzong` | 地 | 食品·名菜 | 待出图 | [it_hengshan_suxianzong.md](items/food/it_hengshan_suxianzong.md) | template |
| 6 | 河豚 | `it_hetun` | 地 | 食材·珍材 | 待出图 | [it_hetun.md](items/food/it_hetun.md) | template |
| 7 | 花胶 | `it_huajiao` | 地 | 食材·珍材 | 待出图 | [it_huajiao.md](items/food/it_huajiao.md) | template |
| 8 | 回部抓饭烤肉 | `it_huibu_zhuafan_kaorou` | 地 | 食品·名菜 | 待出图 | [it_huibu_zhuafan_kaorou.md](items/food/it_huibu_zhuafan_kaorou.md) | template |
| 9 | 蒋侍郎豆腐 | `it_jiangshilang_doufu` | 地 | 食品·名菜 | 待出图 | [it_jiangshilang_doufu.md](items/food/it_jiangshilang_doufu.md) | template |
| 10 | 江瑶柱 | `it_jiangyaozhu` | 地 | 食材·水产 | 待出图 | [it_jiangyaozhu.md](items/food/it_jiangyaozhu.md) | template |
| 11 | 炉焙鸡 | `it_lubeiji` | 地 | 食品·菜肴 | 待出图 | [it_lubeiji.md](items/food/it_lubeiji.md) | template |
| 12 | 蜜莲火腿 | `it_milian_huotui` | 地 | 食品·名菜 | 待出图 | [it_milian_huotui.md](items/food/it_milian_huotui.md) | template |
| 13 | 青菜豆腐小鱼饭 | `it_qingcai_doufu_xiaoyufan` | 地 | 食品·名菜 | 待出图 | [it_qingcai_doufu_xiaoyufan.md](items/food/it_qingcai_doufu_xiaoyufan.md) | template |
| 14 | 山海兜 | `it_shanhaidou` | 地 | 食品·名菜 | 待出图 | [it_shanhaidou.md](items/food/it_shanhaidou.md) | template |
| 15 | 烧小猪 | `it_shaoxiaozhu` | 地 | 食品·名菜 | 待出图 | [it_shaoxiaozhu.md](items/food/it_shaoxiaozhu.md) | template |
| 16 | 鲥鱼 | `it_shiyu` | 地 | 食材·珍材 | 待出图 | [it_shiyu.md](items/food/it_shiyu.md) | template |
| 17 | 团鱼汤 | `it_tuanyutang` | 地 | 食品·汤羹 | 待出图 | [it_tuanyutang.md](items/food/it_tuanyutang.md) | template |
| 18 | 驼峰 | `it_tuofeng` | 地 | 食材·珍材 | 待出图 | [it_tuofeng.md](items/food/it_tuofeng.md) | template |
| 19 | 王太守八宝豆腐 | `it_wangtaishou_babaodoufu` | 地 | 食品·名菜 | 待出图 | [it_wangtaishou_babaodoufu.md](items/food/it_wangtaishou_babaodoufu.md) | template |
| 20 | 温家火腿腊肉宴 | `it_wenjia_huotui_larouyan` | 地 | 食品·名菜 | 待出图 | [it_wenjia_huotui_larouyan.md](items/food/it_wenjia_huotui_larouyan.md) | template |
| 21 | 鲜鹿肉 | `it_xianlurou` | 地 | 食材·珍材 | 待出图 | [it_xianlurou.md](items/food/it_xianlurou.md) | template |
| 22 | 蟹酿橙 | `it_xieniangcheng` | 地 | 食品·名菜 | 待出图 | [it_xieniangcheng.md](items/food/it_xieniangcheng.md) | template |
| 23 | 猩唇 | `it_xingchun` | 地 | 食材·珍材 | 待出图 | [it_xingchun.md](items/food/it_xingchun.md) | template |
| 24 | 熊白 | `it_xiongbai` | 地 | 食材·珍材 | 待出图 | [it_xiongbai.md](items/food/it_xiongbai.md) | template |
| 25 | 熊掌 | `it_xiongzhang` | 地 | 食材·珍材 | 待出图 | [it_xiongzhang.md](items/food/it_xiongzhang.md) | template |
| 26 | 雪地烤黄羊 | `it_xuedi_kaohuangyang` | 地 | 食品·名菜 | 待出图 | [it_xuedi_kaohuangyang.md](items/food/it_xuedi_kaohuangyang.md) | template |
| 27 | 雪蛤 | `it_xueha` | 地 | 食材·珍材 | 待出图 | [it_xueha.md](items/food/it_xueha.md) | template |
| 28 | 扬州汤包长鱼面 | `it_yangzhou_tangbao_changyumian` | 地 | 食品·名菜 | 待出图 | [it_yangzhou_tangbao_changyumian.md](items/food/it_yangzhou_tangbao_changyumian.md) | template |
| 29 | 鱼翅 | `it_yuchi` | 地 | 食材·珍材 | 待出图 | [it_yuchi.md](items/food/it_yuchi.md) | template |
| 30 | 风干羊肉 | `it_fenggan_yangrou` | 玄 | 食品·腌藏 | 待出图 | [it_fenggan_yangrou.md](items/food/it_fenggan_yangrou.md) | template |
| 31 | 鸽肉 | `it_gerou` | 玄 | 食材·肉 | 待出图 | [it_gerou.md](items/food/it_gerou.md) | template |
| 32 | 汉水四碗饭菜 | `it_hanshui_siwan_fancai` | 玄 | 食品·名菜 | 待出图 | [it_hanshui_siwan_fancai.md](items/food/it_hanshui_siwan_fancai.md) | template |
| 33 | 恒山青菜豆腐 | `it_hengshan_qingcaidoufu` | 玄 | 食品·菜肴 | 待出图 | [it_hengshan_qingcaidoufu.md](items/food/it_hengshan_qingcaidoufu.md) | template |
| 34 | 红花会总舵宴席 | `it_honghuahui_zongduo_yanxi` | 玄 | 食品·名菜 | 待出图 | [it_honghuahui_zongduo_yanxi.md](items/food/it_honghuahui_zongduo_yanxi.md) | template |
| 35 | 花椒香料 | `it_huajiao_xiangliao` | 玄 | 食材·调料 | 待出图 | [it_huajiao_xiangliao.md](items/food/it_huajiao_xiangliao.md) | template |
| 36 | 花园糕饼 | `it_huayuan_gaobing` | 玄 | 食品·点心 | 待出图 | [it_huayuan_gaobing.md](items/food/it_huayuan_gaobing.md) | template |
| 37 | 胡苗馒头鸡羊腿 | `it_humiao_mantou_jiyangtui` | 玄 | 食品·名菜 | 待出图 | [it_humiao_mantou_jiyangtui.md](items/food/it_humiao_mantou_jiyangtui.md) | template |
| 38 | 湖蟹 | `it_huxie` | 玄 | 食材·水产 | 待出图 | [it_huxie.md](items/food/it_huxie.md) | template |
| 39 | 辣椒 | `it_lajiao` | 玄 | 食材·菜蔬 | 待出图 | [it_lajiao.md](items/food/it_lajiao.md) | template |
| 40 | 荔枝 | `it_lizhi` | 玄 | 食材·果 | 待出图 | [it_lizhi.md](items/food/it_lizhi.md) | template |
| 41 | 驴肉 | `it_lvrou` | 玄 | 食材·肉 | 待出图 | [it_lvrou.md](items/food/it_lvrou.md) | template |
| 42 | 马肉 | `it_marou` | 玄 | 食材·肉 | 待出图 | [it_marou.md](items/food/it_marou.md) | template |
| 43 | 玫瑰酥饼 | `it_meigui_subing` | 玄 | 食品·点心 | 待出图 | [it_meigui_subing.md](items/food/it_meigui_subing.md) | template |
| 44 | 蜜渍金橘 | `it_mizi_jinju` | 玄 | 食品·腌藏 | 待出图 | [it_mizi_jinju.md](items/food/it_mizi_jinju.md) | template |
| 45 | 木耳 | `it_muer` | 玄 | 食材·菜蔬 | 待出图 | [it_muer.md](items/food/it_muer.md) | template |
| 46 | 木屋干菜饭 | `it_muwu_gancaifan` | 玄 | 食品·菜肴 | 待出图 | [it_muwu_gancaifan.md](items/food/it_muwu_gancaifan.md) | template |
| 47 | 奶干 | `it_naigan` | 玄 | 食品·干粮 | 待出图 | [it_naigan.md](items/food/it_naigan.md) | template |
| 48 | 奶油热茶 | `it_naiyou_recha` | 玄 | 食品·汤羹 | 待出图 | [it_naiyou_recha.md](items/food/it_naiyou_recha.md) | template |
| 49 | 牛肉 | `it_niurou` | 玄 | 食材·肉 | 待出图 | [it_niurou.md](items/food/it_niurou.md) | template |
| 50 | 葡萄 | `it_putao` | 玄 | 食材·果 | 待出图 | [it_putao.md](items/food/it_putao.md) | template |
| 51 | 青稞糌粑 | `it_qingkezanba` | 玄 | 食品·干粮 | 待出图 | [it_qingkezanba.md](items/food/it_qingkezanba.md) | template |
| 52 | 清水玉蜂蜜浆 | `it_qingshui_yufeng_mijiang` | 玄 | 食品·汤羹 | 待出图 | [it_qingshui_yufeng_mijiang.md](items/food/it_qingshui_yufeng_mijiang.md) | template |
| 53 | 山家三脆 | `it_shanjia_sancui` | 玄 | 食品·菜肴 | 待出图 | [it_shanjia_sancui.md](items/food/it_shanjia_sancui.md) | template |
| 54 | 山药粥 | `it_shanyaozhou` | 玄 | 食品·汤羹 | 待出图 | [it_shanyaozhou.md](items/food/it_shanyaozhou.md) | template |
| 55 | 少林素面 | `it_shaolin_sumian` | 玄 | 食品·菜肴 | 待出图 | [it_shaolin_sumian.md](items/food/it_shaolin_sumian.md) | template |
| 56 | 石榴 | `it_shiliu` | 玄 | 食材·果 | 待出图 | [it_shiliu.md](items/food/it_shiliu.md) | template |
| 57 | 食茱萸 | `it_shizhuyu` | 玄 | 食材·调料 | 待出图 | [it_shizhuyu.md](items/food/it_shizhuyu.md) | template |
| 58 | 松鹤楼虾仁 | `it_songhelou_xiaren` | 玄 | 食品·菜肴 | 待出图 | [it_songhelou_xiaren.md](items/food/it_songhelou_xiaren.md) | template |
| 59 | 笋鲊 | `it_sunzha` | 玄 | 食品·腌藏 | 待出图 | [it_sunzha.md](items/food/it_sunzha.md) | template |
| 60 | 酥油饼 | `it_suyoubing` | 玄 | 食品·点心 | 待出图 | [it_suyoubing.md](items/food/it_suyoubing.md) | template |
| 61 | 太湖银鱼 | `it_taihu_yinyu` | 玄 | 食材·水产 | 待出图 | [it_taihu_yinyu.md](items/food/it_taihu_yinyu.md) | template |
| 62 | 糖霜桃条 | `it_tangshuangtaotiao` | 玄 | 食品·腌藏 | 待出图 | [it_tangshuangtaotiao.md](items/food/it_tangshuangtaotiao.md) | template |
| 63 | 侠客岛四样点心 | `it_xiakedao_siyang_dianxin` | 玄 | 食品·名菜 | 待出图 | [it_xiakedao_siyang_dianxin.md](items/food/it_xiakedao_siyang_dianxin.md) | template |
| 64 | 萧府寿酒席 | `it_xiaofu_shoujiuxi` | 玄 | 食品·名菜 | 待出图 | [it_xiaofu_shoujiuxi.md](items/food/it_xiaofu_shoujiuxi.md) | template |
| 65 | 羊乳酪 | `it_yangrulao` | 玄 | 食品·腌藏 | 待出图 | [it_yangrulao.md](items/food/it_yangrulao.md) | template |
| 66 | 羊尾脂 | `it_yangweizhi` | 玄 | 食材·肉 | 待出图 | [it_yangweizhi.md](items/food/it_yangweizhi.md) | template |
| 67 | 月饼 | `it_yuebing` | 玄 | 食品·点心 | 待出图 | [it_yuebing.md](items/food/it_yuebing.md) | template |
| 68 | 渔舟番薯糙米饭 | `it_yuzhou_fanshu_caomifan` | 玄 | 食品·干粮 | 待出图 | [it_yuzhou_fanshu_caomifan.md](items/food/it_yuzhou_fanshu_caomifan.md) | template |
| 69 | 糟鱼 | `it_zaoyu` | 玄 | 食品·腌藏 | 待出图 | [it_zaoyu.md](items/food/it_zaoyu.md) | template |
| 70 | 炸羊尾 | `it_zhayangwei` | 玄 | 食品·菜肴 | 待出图 | [it_zhayangwei.md](items/food/it_zhayangwei.md) | template |
| 71 | 蔗糖 | `it_zhetang` | 玄 | 食材·调料 | 待出图 | [it_zhetang.md](items/food/it_zhetang.md) | template |
| 72 | 豆腐 | `it_doufu` | 黄 | 食材·菜蔬 | 待出图 | [it_doufu.md](items/food/it_doufu.md) | template |
| 73 | 番薯 | `it_fanshu` | 黄 | 食材·菜蔬 | 待出图 | [it_fanshu.md](items/food/it_fanshu.md) | template |
| 74 | 腐乳 | `it_furu` | 黄 | 食品·腌藏 | 待出图 | [it_furu.md](items/food/it_furu.md) | template |
| 75 | 高粱 | `it_gaoliang` | 黄 | 食材·谷物 | 待出图 | [it_gaoliang.md](items/food/it_gaoliang.md) | template |
| 76 | 光明顶素馅圆饼 | `it_guangmingding_suxian_yuanbing` | 黄 | 食品·干粮 | 待出图 | [it_guangmingding_suxian_yuanbing.md](items/food/it_guangmingding_suxian_yuanbing.md) | template |
| 77 | 锅盔 | `it_guokui` | 黄 | 食品·干粮 | 待出图 | [it_guokui.md](items/food/it_guokui.md) | template |
| 78 | 海蛎 | `it_haili` | 黄 | 食材·水产 | 待出图 | [it_haili.md](items/food/it_haili.md) | template |
| 79 | 海鱼 | `it_haiyu` | 黄 | 食材·水产 | 待出图 | [it_haiyu.md](items/food/it_haiyu.md) | template |
| 80 | 河鲤 | `it_heli` | 黄 | 食材·水产 | 待出图 | [it_heli.md](items/food/it_heli.md) | template |
| 81 | 红枣 | `it_hongzao` | 黄 | 食材·果 | 待出图 | [it_hongzao.md](items/food/it_hongzao.md) | template |
| 82 | 华山青菜豆腐饭 | `it_huashan_qingcai_doufufan` | 黄 | 食品·菜肴 | 待出图 | [it_huashan_qingcai_doufufan.md](items/food/it_huashan_qingcai_doufufan.md) | template |
| 83 | 回雁楼荤菜 | `it_huiyanlou_huncai` | 黄 | 食品·名菜 | 待出图 | [it_huiyanlou_huncai.md](items/food/it_huiyanlou_huncai.md) | template |
| 84 | 火堆烤獐麂 | `it_huodui_kaozhangji` | 黄 | 食品·菜肴 | 待出图 | [it_huodui_kaozhangji.md](items/food/it_huodui_kaozhangji.md) | template |
| 85 | 酱汁 | `it_jiangzhi` | 黄 | 食材·调料 | 待出图 | [it_jiangzhi.md](items/food/it_jiangzhi.md) | template |
| 86 | 鸡肉 | `it_jirou` | 黄 | 食材·肉 | 待出图 | [it_jirou.md](items/food/it_jirou.md) | template |
| 87 | 韭菜 | `it_jiucai` | 黄 | 食材·菜蔬 | 待出图 | [it_jiucai.md](items/food/it_jiucai.md) | template |
| 88 | 蕨菜 | `it_juecai` | 黄 | 食材·菜蔬 | 待出图 | [it_juecai.md](items/food/it_juecai.md) | template |
| 89 | 绿豆 | `it_lvdou` | 黄 | 食材·谷物 | 待出图 | [it_lvdou.md](items/food/it_lvdou.md) | template |
| 90 | 苗家镬饭三菜 | `it_miaojia_huofan_sancai` | 黄 | 食品·名菜 | 待出图 | [it_miaojia_huofan_sancai.md](items/food/it_miaojia_huofan_sancai.md) | template |
| 91 | 米醋 | `it_micu` | 黄 | 食材·调料 | 待出图 | [it_micu.md](items/food/it_micu.md) | template |
| 92 | 馕饼 | `it_nangbing` | 黄 | 食品·干粮 | 待出图 | [it_nangbing.md](items/food/it_nangbing.md) | template |
| 93 | 破庙鼠汤 | `it_pomiao_shutang` | 黄 | 食品·汤羹 | 待出图 | [it_pomiao_shutang.md](items/food/it_pomiao_shutang.md) | template |
| 94 | 荞麦 | `it_qiaomai` | 黄 | 食材·谷物 | 待出图 | [it_qiaomai.md](items/food/it_qiaomai.md) | template |
| 95 | 茄子 | `it_qiezi` | 黄 | 食材·菜蔬 | 待出图 | [it_qiezi.md](items/food/it_qiezi.md) | template |
| 96 | 芹菜 | `it_qincai` | 黄 | 食材·菜蔬 | 待出图 | [it_qincai.md](items/food/it_qincai.md) | template |
| 97 | 青菜 | `it_qingcai` | 黄 | 食材·菜蔬 | 待出图 | [it_qingcai.md](items/food/it_qingcai.md) | template |
| 98 | 生姜 | `it_shengjiang` | 黄 | 食材·菜蔬 | 待出图 | [it_shengjiang.md](items/food/it_shengjiang.md) | template |
| 99 | 桃 | `it_tao` | 黄 | 食材·果 | 待出图 | [it_tao.md](items/food/it_tao.md) | template |
| 100 | 兔肉 | `it_turou` | 黄 | 食材·肉 | 待出图 | [it_turou.md](items/food/it_turou.md) | template |
| 101 | 咸肉 | `it_xianrou` | 黄 | 食品·腌藏 | 待出图 | [it_xianrou.md](items/food/it_xianrou.md) | template |
| 102 | 小米 | `it_xiaomi` | 黄 | 食材·谷物 | 待出图 | [it_xiaomi.md](items/food/it_xiaomi.md) | template |
| 103 | 杏 | `it_xing` | 黄 | 食材·果 | 待出图 | [it_xing.md](items/food/it_xing.md) | template |
| 104 | 盐 | `it_yan` | 黄 | 食材·调料 | 待出图 | [it_yan.md](items/food/it_yan.md) | template |
| 105 | 羊肉 | `it_yangrou` | 黄 | 食材·肉 | 待出图 | [it_yangrou.md](items/food/it_yangrou.md) | template |
| 106 | 鸭肉 | `it_yarou` | 黄 | 食材·肉 | 待出图 | [it_yarou.md](items/food/it_yarou.md) | template |
| 107 | 玉米 | `it_yumi` | 黄 | 食材·谷物 | 待出图 | [it_yumi.md](items/food/it_yumi.md) | template |
| 108 | 蒸饼 | `it_zhengbing` | 黄 | 食品·干粮 | 待出图 | [it_zhengbing.md](items/food/it_zhengbing.md) | template |
| 109 | 芝麻烧饼 | `it_zhimashaobing` | 黄 | 食品·干粮 | 待出图 | [it_zhimashaobing.md](items/food/it_zhimashaobing.md) | template |
| 110 | 猪肚 | `it_zhudu` | 黄 | 食材·肉 | 待出图 | [it_zhudu.md](items/food/it_zhudu.md) | template |
| 111 | 猪肉 | `it_zhurou` | 黄 | 食材·肉 | 待出图 | [it_zhurou.md](items/food/it_zhurou.md) | template |

### 武学秘籍（18）· 已入库 18

（已全部入库。）

### 兵器（118）· 已入库 94、已通过（作者） 24

（已全部入库。）

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

### 暗器（24）· 已入库 24

（已全部入库。）

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
