# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）

> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。
> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。

提示词 **1160** 份：已入库 916、已通过（作者） 132、待出图 112。**待出图队列 112 行**（`python3 tools/agents/build_image_index.py --queue`）。

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
| items | `it_beisongsuqin` | 北宋素髹琴 | `assets/default/item/collectibles/it_beisongsuqin.png` | 待出图 | [it_beisongsuqin.md](items/collectibles/it_beisongsuqin.md) |
| items | `it_dingyaojiangyougaiwan` | 定窑酱釉盖碗 | `assets/default/item/collectibles/it_dingyaojiangyougaiwan.png` | 待出图 | [it_dingyaojiangyougaiwan.md](items/collectibles/it_dingyaojiangyougaiwan.md) |
| items | `it_gaochangqixianqin` | 高昌旧藏七弦琴 | `assets/default/item/collectibles/it_gaochangqixianqin.png` | 待出图 | [it_gaochangqixianqin.md](items/collectibles/it_gaochangqixianqin.md) |
| items | `it_mingyusuhuan` | 明素玉环 | `assets/default/item/collectibles/it_mingyusuhuan.png` | 待出图 | [it_mingyusuhuan.md](items/collectibles/it_mingyusuhuan.md) |
| items | `it_nansongduanwenqin` | 南宋断纹琴 | `assets/default/item/collectibles/it_nansongduanwenqin.png` | 待出图 | [it_nansongduanwenqin.md](items/collectibles/it_nansongduanwenqin.md) |
| items | `it_nansonghuzhoubi` | 南宋湖州书笔 | `assets/default/item/collectibles/it_nansonghuzhoubi.png` | 待出图 | [it_nansonghuzhoubi.md](items/collectibles/it_nansonghuzhoubi.md) |
| items | `it_nansongtaoheyan` | 宋式洮河石砚 | `assets/default/item/collectibles/it_nansongtaoheyan.png` | 待出图 | [it_nansongtaoheyan.md](items/collectibles/it_nansongtaoheyan.md) |
| items | `it_nansongzhuxiao` | 南宋素竹箫 | `assets/default/item/collectibles/it_nansongzhuxiao.png` | 待出图 | [it_nansongzhuxiao.md](items/collectibles/it_nansongzhuxiao.md) |
| items | `it_qingheiqiqin` | 清黑漆琴 | `assets/default/item/collectibles/it_qingheiqiqin.png` | 待出图 | [it_qingheiqiqin.md](items/collectibles/it_qingheiqiqin.md) |
| items | `it_qingjiaoyeqin` | 清式蕉叶琴 | `assets/default/item/collectibles/it_qingjiaoyeqin.png` | 待出图 | [it_qingjiaoyeqin.md](items/collectibles/it_qingjiaoyeqin.md) |
| items | `it_shiketapian` | 石刻拓片 | `assets/default/item/collectibles/it_shiketapian.png` | 待出图 | [it_shiketapian.md](items/collectibles/it_shiketapian.md) |
| items | `it_shusutiejizhen` | 蜀素帖 | `assets/default/item/collectibles/it_shusutiejizhen.png` | 待出图 | [it_shusutiejizhen.md](items/collectibles/it_shusutiejizhen.md) |
| items | `it_songqingshiyuwenyan` | 青石鱼纹砚 | `assets/default/item/collectibles/it_songqingshiyuwenyan.png` | 待出图 | [it_songqingshiyuwenyan.md](items/collectibles/it_songqingshiyuwenyan.md) |
| items | `it_suibolibianping` | 隋式玻璃扁瓶 | `assets/default/item/collectibles/it_suibolibianping.png` | 待出图 | [it_suibolibianping.md](items/collectibles/it_suibolibianping.md) |
| items | `it_suijingaozubei` | 隋式金高足杯 | `assets/default/item/collectibles/it_suijingaozubei.png` | 待出图 | [it_suijingaozubei.md](items/collectibles/it_suijingaozubei.md) |
| items | `it_suijinxiangyubei` | 隋式镶金玉杯 | `assets/default/item/collectibles/it_suijinxiangyubei.png` | 待出图 | [it_suijinxiangyubei.md](items/collectibles/it_suijinxiangyubei.md) |
| items | `it_suiqingyougaiguan` | 青釉双层齿沿盖罐 | `assets/default/item/collectibles/it_suiqingyougaiguan.png` | 待出图 | [it_suiqingyougaiguan.md](items/collectibles/it_suiqingyougaiguan.md) |
| items | `it_suiyuzhihuan` | 隋式白玉指环 | `assets/default/item/collectibles/it_suiyuzhihuan.png` | 待出图 | [it_suiyuzhihuan.md](items/collectibles/it_suiyuzhihuan.md) |
| items | `it_sunruiqingshenpinmo` | 孙瑞卿神品墨 | `assets/default/item/collectibles/it_sunruiqingshenpinmo.png` | 待出图 | [it_sunruiqingshenpinmo.md](items/collectibles/it_sunruiqingshenpinmo.md) |
| items | `it_tanghaishouputaojing` | 海兽葡萄铜镜 | `assets/default/item/collectibles/it_tanghaishouputaojing.png` | 待出图 | [it_tanghaishouputaojing.md](items/collectibles/it_tanghaishouputaojing.md) |
| items | `it_tangjixingtaoyan` | 唐箕形陶砚 | `assets/default/item/collectibles/it_tangjixingtaoyan.png` | 待出图 | [it_tangjixingtaoyan.md](items/collectibles/it_tangjixingtaoyan.md) |
| items | `it_tangshierfengyan` | 唐十二峰陶砚 | `assets/default/item/collectibles/it_tangshierfengyan.png` | 待出图 | [it_tangshierfengyan.md](items/collectibles/it_tangshierfengyan.md) |
| items | `it_tangtongsanxianglu` | 武周素铜香炉 | `assets/default/item/collectibles/it_tangtongsanxianglu.png` | 待出图 | [it_tangtongsanxianglu.md](items/collectibles/it_tangtongsanxianglu.md) |
| items | `it_tangyueyaoqingwan` | 越窑青瓷茶碗 | `assets/default/item/collectibles/it_tangyueyaoqingwan.png` | 待出图 | [it_tangyueyaoqingwan.md](items/collectibles/it_tangyueyaoqingwan.md) |
| items | `it_tangyuwoshou` | 白玉卧兽 | `assets/default/item/collectibles/it_tangyuwoshou.png` | 待出图 | [it_tangyuwoshou.md](items/collectibles/it_tangyuwoshou.md) |
| items | `it_tangzhuganbi` | 唐式竹管兔毫笔 | `assets/default/item/collectibles/it_tangzhuganbi.png` | 待出图 | [it_tangzhuganbi.md](items/collectibles/it_tangzhuganbi.md) |
| items | `it_wenzhengmingchibifu` | 文徵明《赤壁赋》页 | `assets/default/item/collectibles/it_wenzhengmingchibifu.png` | 待出图 | [it_wenzhengmingchibifu.md](items/collectibles/it_wenzhengmingchibifu.md) |
| items | `it_wuyazihuajuan` | 无崖子画卷 | `assets/default/item/collectibles/it_wuyazihuajuan.png` | 待出图 | [it_wuyazihuajuan.md](items/collectibles/it_wuyazihuajuan.md) |
| items | `it_wuzhoubaijian` | 武周请益帖 | `assets/default/item/collectibles/it_wuzhoubaijian.png` | 待出图 | [it_wuzhoubaijian.md](items/collectibles/it_wuzhoubaijian.md) |
| items | `it_wuzhouqimuqihe` | 武周漆木棋盒 | `assets/default/item/collectibles/it_wuzhouqimuqihe.png` | 待出图 | [it_wuzhouqimuqihe.md](items/collectibles/it_wuzhouqimuqihe.md) |
| items | `it_wuzhousuqin` | 武周素漆琴 | `assets/default/item/collectibles/it_wuzhousuqin.png` | 待出图 | [it_wuzhousuqin.md](items/collectibles/it_wuzhousuqin.md) |
| items | `it_wuzhouzhuseqin` | 武周朱漆琴 | `assets/default/item/collectibles/it_wuzhouzhuseqin.png` | 待出图 | [it_wuzhouzhuseqin.md](items/collectibles/it_wuzhouzhuseqin.md) |
| items | `it_xiaozhonghuijinchai` | 萧中慧金钗 | `assets/default/item/collectibles/it_xiaozhonghuijinchai.png` | 待出图 | [it_xiaozhonghuijinchai.md](items/collectibles/it_xiaozhonghuijinchai.md) |
| items | `it_xixiafashutie` | 西夏赐赠法书卷 | `assets/default/item/collectibles/it_xixiafashutie.png` | 待出图 | [it_xixiafashutie.md](items/collectibles/it_xixiafashutie.md) |
| items | `it_xueshanxiaoyuma` | 雪山小玉马 | `assets/default/item/collectibles/it_xueshanxiaoyuma.png` | 待出图 | [it_xueshanxiaoyuma.md](items/collectibles/it_xueshanxiaoyuma.md) |
| items | `it_xueyezhongqin` | 雪夜钟琴 | `assets/default/item/collectibles/it_xueyezhongqin.png` | 待出图 | [it_xueyezhongqin.md](items/collectibles/it_xueyezhongqin.md) |
| items | `it_yongleyashoubei` | 永乐青花压手杯 | `assets/default/item/collectibles/it_yongleyashoubei.png` | 待出图 | [it_yongleyashoubei.md](items/collectibles/it_yongleyashoubei.md) |
| items | `it_yongzhengmeimuwan` | 雍正珐琅彩梅牡碗 | `assets/default/item/collectibles/it_yongzhengmeimuwan.png` | 待出图 | [it_yongzhengmeimuwan.md](items/collectibles/it_yongzhengmeimuwan.md) |
| items | `it_yuanheiquqin` | 元式黑漆琴 | `assets/default/item/collectibles/it_yuanheiquqin.png` | 待出图 | [it_yuanheiquqin.md](items/collectibles/it_yuanheiquqin.md) |
| items | `it_yuanhetianyuyu` | 元玉鱼 | `assets/default/item/collectibles/it_yuanhetianyuyu.png` | 待出图 | [it_yuanhetianyuyu.md](items/collectibles/it_yuanhetianyuyu.md) |
| items | `it_yuanhuangjingzhi` | 元黄色写经纸 | `assets/default/item/collectibles/it_yuanhuangjingzhi.png` | 待出图 | [it_yuanhuangjingzhi.md](items/collectibles/it_yuanhuangjingzhi.md) |
| items | `it_yuanhuanxuezhai` | 元代焕雪斋题字 | `assets/default/item/collectibles/it_yuanhuanxuezhai.png` | 待出图 | [it_yuanhuanxuezhai.md](items/collectibles/it_yuanhuanxuezhai.md) |
| items | `it_yuanhuzhoubaihaobi` | 元湖州白毫笔 | `assets/default/item/collectibles/it_yuanhuzhoubaihaobi.png` | 待出图 | [it_yuanhuzhoubaihaobi.md](items/collectibles/it_yuanhuzhoubaihaobi.md) |
| items | `it_yuanliulizhan` | 元式琉璃盏 | `assets/default/item/collectibles/it_yuanliulizhan.png` | 待出图 | [it_yuanliulizhan.md](items/collectibles/it_yuanliulizhan.md) |
| items | `it_yuanqinghualianpan` | 元青花莲纹盘 | `assets/default/item/collectibles/it_yuanqinghualianpan.png` | 待出图 | [it_yuanqinghualianpan.md](items/collectibles/it_yuanqinghualianpan.md) |
| items | `it_yuanqinghuazhihu` | 元青花凤穿牡丹执壶 | `assets/default/item/collectibles/it_yuanqinghuazhihu.png` | 待出图 | [it_yuanqinghuazhihu.md](items/collectibles/it_yuanqinghuazhihu.md) |
| items | `it_yuanqingyitie` | 元代清议帖 | `assets/default/item/collectibles/it_yuanqingyitie.png` | 待出图 | [it_yuanqingyitie.md](items/collectibles/it_yuanqingyitie.md) |
| items | `it_yuanqingyouxiaowan` | 元青釉小碗 | `assets/default/item/collectibles/it_yuanqingyouxiaowan.png` | 待出图 | [it_yuanqingyouxiaowan.md](items/collectibles/it_yuanqingyouxiaowan.md) |
| items | `it_yuanqinshufang` | 元代书房琴 | `assets/default/item/collectibles/it_yuanqinshufang.png` | 待出图 | [it_yuanqinshufang.md](items/collectibles/it_yuanqinshufang.md) |
| items | `it_yuanqiyuqin` | 元式漆玉徽琴 | `assets/default/item/collectibles/it_yuanqiyuqin.png` | 待出图 | [it_yuanqiyuqin.md](items/collectibles/it_yuanqiyuqin.md) |
| items | `it_yuantongshoulu` | 元式素铜香炉 | `assets/default/item/collectibles/it_yuantongshoulu.png` | 待出图 | [it_yuantongshoulu.md](items/collectibles/it_yuantongshoulu.md) |
| items | `it_yuanxiangmuqiguan` | 元式香木棋罐 | `assets/default/item/collectibles/it_yuanxiangmuqiguan.png` | 待出图 | [it_yuanxiangmuqiguan.md](items/collectibles/it_yuanxiangmuqiguan.md) |
| items | `it_yuanyinshuiyu` | 元式银水盂 | `assets/default/item/collectibles/it_yuanyinshuiyu.png` | 待出图 | [it_yuanyinshuiyu.md](items/collectibles/it_yuanyinshuiyu.md) |
| items | `it_yuanyuheyezun` | 元式荷叶玉杯 | `assets/default/item/collectibles/it_yuanyuheyezun.png` | 待出图 | [it_yuanyuheyezun.md](items/collectibles/it_yuanyuheyezun.md) |
| items | `it_yuanzhenkuanshiyan` | 元贞款石砚 | `assets/default/item/collectibles/it_yuanzhenkuanshiyan.png` | 待出图 | [it_yuanzhenkuanshiyan.md](items/collectibles/it_yuanzhenkuanshiyan.md) |
| items | `it_yuanzhushan` | 元式素竹扇 | `assets/default/item/collectibles/it_yuanzhushan.png` | 待出图 | [it_yuanzhushan.md](items/collectibles/it_yuanzhushan.md) |
| items | `it_yuanzhuyujue` | 元竹节玉玦 | `assets/default/item/collectibles/it_yuanzhuyujue.png` | 待出图 | [it_yuanzhuyujue.md](items/collectibles/it_yuanzhuyujue.md) |
| items | `it_yuebeizhong` | 越地宝贝壳 | `assets/default/item/collectibles/it_yuebeizhong.png` | 待出图 | [it_yuebeizhong.md](items/collectibles/it_yuebeizhong.md) |
| items | `it_yuegaobingdou` | 越地原始瓷豆 | `assets/default/item/collectibles/it_yuegaobingdou.png` | 待出图 | [it_yuegaobingdou.md](items/collectibles/it_yuegaobingdou.md) |
| items | `it_yuehexiqin` | 越地合席琴 | `assets/default/item/collectibles/it_yuehexiqin.png` | 待出图 | [it_yuehexiqin.md](items/collectibles/it_yuehexiqin.md) |
| items | `it_yuejinyubi` | 越地缀金礼璧 | `assets/default/item/collectibles/it_yuejinyubi.png` | 待出图 | [it_yuejinyubi.md](items/collectibles/it_yuejinyubi.md) |
| items | `it_yuelongwenhuang` | 龙纹旧玉璜 | `assets/default/item/collectibles/it_yuelongwenhuang.png` | 待出图 | [it_yuelongwenhuang.md](items/collectibles/it_yuelongwenhuang.md) |
| items | `it_yueluganruanbi` | 越地苇管软毫笔 | `assets/default/item/collectibles/it_yueluganruanbi.png` | 待出图 | [it_yueluganruanbi.md](items/collectibles/it_yueluganruanbi.md) |
| items | `it_yuemanaochangzhu` | 越地玛瑙长珠 | `assets/default/item/collectibles/it_yuemanaochangzhu.png` | 待出图 | [it_yuemanaochangzhu.md](items/collectibles/it_yuemanaochangzhu.md) |
| items | `it_yuemubaitie` | 越地木牍拜简 | `assets/default/item/collectibles/it_yuemubaitie.png` | 待出图 | [it_yuemubaitie.md](items/collectibles/it_yuemubaitie.md) |
| items | `it_yueqimuzun` | 越地漆木盛器 | `assets/default/item/collectibles/it_yueqimuzun.png` | 待出图 | [it_yueqimuzun.md](items/collectibles/it_yueqimuzun.md) |
| items | `it_yueqingtongxiangpan` | 越地青铜香草盘 | `assets/default/item/collectibles/it_yueqingtongxiangpan.png` | 待出图 | [it_yueqingtongxiangpan.md](items/collectibles/it_yueqingtongxiangpan.md) |
| items | `it_yueqingyouguan` | 越地青釉双耳罐 | `assets/default/item/collectibles/it_yueqingyouguan.png` | 待出图 | [it_yueqingyouguan.md](items/collectibles/it_yueqingyouguan.md) |
| items | `it_yuesuyuhuan` | 越地素玉环 | `assets/default/item/collectibles/it_yuesuyuhuan.png` | 待出图 | [it_yuesuyuhuan.md](items/collectibles/it_yuesuyuhuan.md) |
| items | `it_yuetongjian` | 越地素面铜鉴 | `assets/default/item/collectibles/it_yuetongjian.png` | 待出图 | [it_yuetongjian.md](items/collectibles/it_yuetongjian.md) |
| items | `it_yuewuseqin` | 越地乌漆礼琴 | `assets/default/item/collectibles/it_yuewuseqin.png` | 待出图 | [it_yuewuseqin.md](items/collectibles/it_yuewuseqin.md) |
| items | `it_yuexianwenwan` | 越地弦纹原始瓷碗 | `assets/default/item/collectibles/it_yuexianwenwan.png` | 待出图 | [it_yuexianwenwan.md](items/collectibles/it_yuexianwenwan.md) |
| items | `it_yueyanmoshi` | 越地研墨石 | `assets/default/item/collectibles/it_yueyanmoshi.png` | 待出图 | [it_yueyanmoshi.md](items/collectibles/it_yueyanmoshi.md) |
| items | `it_yueyouqin` | 越地幽弦琴 | `assets/default/item/collectibles/it_yueyouqin.png` | 待出图 | [it_yueyouqin.md](items/collectibles/it_yueyouqin.md) |
| items | `it_yueyushiwen` | 越地玉石盟辞摹片 | `assets/default/item/collectibles/it_yueyushiwen.png` | 待出图 | [it_yueyushiwen.md](items/collectibles/it_yueyushiwen.md) |
| items | `it_yuezhuganhaobi` | 越地竹管毫笔 | `assets/default/item/collectibles/it_yuezhuganhaobi.png` | 待出图 | [it_yuezhuganhaobi.md](items/collectibles/it_yuezhuganhaobi.md) |
| items | `it_yuezhukeqingci` | 越地竹刻请辞 | `assets/default/item/collectibles/it_yuezhukeqingci.png` | 待出图 | [it_yuezhukeqingci.md](items/collectibles/it_yuezhukeqingci.md) |
| items | `it_zhaominjinhe` | 赵敏修补金盒 | `assets/default/item/collectibles/it_zhaominjinhe.png` | 待出图 | [it_zhaominjinhe.md](items/collectibles/it_zhaominjinhe.md) |
| items | `it_zhenlongqiju` | 珍珑棋局图 | `assets/default/item/collectibles/it_zhenlongqiju.png` | 待出图 | [it_zhenlongqiju.md](items/collectibles/it_zhenlongqiju.md) |
| items | `it_zunjuantielinben` | 尊眷帖临本 | `assets/default/item/collectibles/it_zunjuantielinben.png` | 待出图 | [it_zunjuantielinben.md](items/collectibles/it_zunjuantielinben.md) |
| items | `it_zuqianqiujiubei` | 祖千秋酒杯组 | `assets/default/item/collectibles/it_zuqianqiujiubei.png` | 待出图 | [it_zuqianqiujiubei.md](items/collectibles/it_zuqianqiujiubei.md) |
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

## 物品（11 类，名录 1045 项）

每张图的提示词在各文件「提示词」节。下表只列还要出的行（待出图 / 待重出），已入库的不再列出，标题里的计数含已出部分。作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可回到队列。

### 药物 / 补品 / 药材（96）· 已入库 64、已通过（作者） 32

（已全部入库。）

### 食材 / 食品（174）· 已入库 146、已通过（作者） 28

（已全部入库。）

### 武学秘籍（180）· 已入库 180

（已全部入库。）

### 兵器（247）· 已入库 223、已通过（作者） 24

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

### 暗器（51）· 已入库 51

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
