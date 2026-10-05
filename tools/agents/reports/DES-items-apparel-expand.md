# DES-items-apparel-expand 报告 · 设计补充 · 衣服 / 披风 / 头饰 / 腰带 / 鞋 年代制式矩阵扩张（AR-25：地玄黄 × 上中下 × 男女，每种 18）

## 1. 摘要（3–6 行）

- 完成衣物、披风、头饰、腰带、鞋五类各 18 格，共新增 90 件；披风与头饰分别成矩阵，不以护肩凑数。
- 每件均含朝代 / 地域、出现书界、`wearer`、品阶 / `grade`、既有装备槽字段及可直接出图的器物外观。
- 覆盖宋、辽、金、西夏、大理、蒙古 / 元、明、清及回疆、藏地；史制影响品阶表现，不引入魔法解释。
- 旧行、旧 ID 与天级条目均未改；90 个新 ID 已在 `design/10` §14 登记。

## 2. 产出（文件、行数、主要章节）

- `items-clothing.md`：82 行、30 个条目；新增衣物 18 格及“年代与制式依据”。
- `items-accessories.md`：89 行、48 个条目；新增披风 18 格、头饰 18 格。
- `items-belts.md`：67 行、26 个条目；新增腰带 18 格。
- `items-shoes.md`：67 行、26 个条目；新增鞋 18 格及九档轻功算式。
- `design/10-items-and-equipment.md`：2505 行；§14 新增四行 AR-25 登记，共 90 个 ID。
- 本报告：七节，含矩阵、书界、史料、待考和命令校验结果。

## 3. 关键结论与数值

- 品阶严格映射：地上 / 中 / 下=`9/8/7`，玄上 / 中 / 下=`6/5/4`，黄上 / 中 / 下=`3/2/1`；每格男女各 1 件。
- 衣物均为 `body + light`，主防御由 `0.16 × G × DEF_LV` / `0.12 × G × DEF_LV` 自动生成；披风取 `defOutK=0.025; hpMaxK=0.005`；腰带取 `0.05; 0.01`。
- 鞋固定轻功=`2.5 × grade`，九档为 `22.5/20/17.5/15/12.5/10/7.5/5/2.5`；头饰由 `slot=head` 生成主属性。
- 汉式交领与藏袍校为右衽；契丹 / 女真条目才按同期国服史料写左衽；品阶由麻布—绸锦、工艺与身份层级表达。

## 4. 开放问题（附默认值）

- 护肩是否另补 18 格：默认不补；AR-25 明列五类且护肩已有行原样保留。
- 天级是否补男女 / 年代矩阵：默认不补；作者要求已明确天级不计本矩阵。
- 弓鞋、花盆底等敏感形制：默认保留有史料依据的器物条目；只画鞋、不画脚、不情色化，乾隆花盆底采用低矮木台并保留待考标记。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- AR25-P1 / 在基准装备数据约定中增列可选枚举 `wearer=male|female`，并说明是穿戴门槛还是仅款式标签 / 本批按作者要求写入 90 行，但基准尚无统一消费语义。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `design/03` 或装备运行时契约 / 装备校验 / 落实 `wearer` 的穿戴、掉落筛选、无性别限制兼容规则；本任务不越权定义。
- `tech/07` §2.7 与资产脚本 / 目录读入 / 确认读取新增行的“外观要点”，且衣物平展、披风单件、头饰无人头、腰带松弧、鞋成双。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

以下五表单元格均按“上 / 中 / 下”排列，三阶 × 三档 × 两性即每表 18 格。

### 衣物矩阵

| 阶 | 男（上 / 中 / 下） | 女（上 / 中 / 下） |
|---|---|---|
| 地 | `eq_jinzhizhisunpao_nan` / `eq_songziluogongpao_nan` / `eq_liaodiaoqiupao_nan` | `eq_mingjinmamianqun_nv` / `eq_qingqizhuangjifu_nv` / `eq_mingzhijinbijia_nv` |
| 玄 | `eq_mingqingyesa_nan` / `eq_jinchunshuipanlingpao_nan` / `eq_qinglanmagua_nan` | `eq_dalibaiduanqun_nv` / `eq_songluobeizi_nv` / `eq_xixiazhaiheshan_nv` |
| 黄 | `eq_songqingyuanlingpao_nan` / `eq_huijiangjiapan_nan` / `eq_zangdicuobu_nan` | `eq_mingbuaoqun_nv` / `eq_qinghanvjiaao_nv` / `eq_songmabuduanru_nv` |

### 披风矩阵

| 阶 | 男（上 / 中 / 下） | 女（上 / 中 / 下） |
|---|---|---|
| 地 | `eq_qingxuanhuyuduandoupeng_nan` / `eq_yuanzhijinzhanshidoupeng_nan` / `eq_liaoyinshupi_nan` | `eq_mingyunjinhechang_nv` / `eq_qingdiaoqiufengchang_nv` / `eq_dalijinxiupeibo_nv` |
| 玄 | `eq_mingqingduandachang_nan` / `eq_jinhubianpifeng_nan` / `eq_yuanmengguzhanpi_nan` | `eq_qingyuduanpifeng_nv` / `eq_songluoshahechang_nv` / `eq_huijiangnihuaipi_nv` |
| 黄 | `eq_mingmianbupifeng_nan` / `eq_xixiacuzhanpi_nan` / `eq_songzonglvsuoyi_nan` | `eq_mingshuitianpi_nv` / `eq_songyoujuanyupi_nv` / `eq_qingqingbufengpi_nv` |

### 头饰矩阵

| 阶 | 男（上 / 中 / 下） | 女（上 / 中 / 下） |
|---|---|---|
| 地 | `eq_songzhijiaofutou_nan` / `eq_mingzhongjingguan_nan` / `eq_yuanqibaolimao_nan` | `eq_yuanguguquan_nv` / `eq_qingzhenzhudiantzi_nv` / `eq_songjinhuaguan_nv` |
| 玄 | `eq_mingdongpojin_nan` / `eq_jinzaoluojin_nan` / `eq_qinghongyingnuanmao_nan` | `eq_dalijinhuaguan_nv` / `eq_mingyudiebuyao_nv` / `eq_songziluogaitou_nv` |
| 黄 | `eq_mingwushafangjin_nan` / `eq_menggubailimao_nan` / `eq_songmabufujin_nan` | `eq_qingbaobu_nv` / `eq_xixiaxiaotuanguan_nv` / `eq_huijianghuatoujin_nv` |

### 腰带矩阵

| 阶 | 男（上 / 中 / 下） | 女（上 / 中 / 下） |
|---|---|---|
| 地 | `eq_jinchunshuiyutuhu_nan` / `eq_mingbaiyutingdai_nan` / `eq_liaoyudiexiedai_nan` | `eq_minghoufeijindadai_nv` / `eq_yuanhongjinyaodai_nv` / `eq_qingxiuhuahebaodai_nv` |
| 玄 | `eq_songdujinaomiandai_nan` / `eq_yuanshutongkuaodai_nan` / `eq_qinggedaihebao_nan` | `eq_songyuhuanxiu_nv` / `eq_daliyinkoujindai_nv` / `eq_mingqingjintaosheng_nv` |
| 黄 | `eq_jintongkuatuhu_nan` / `eq_huijianghongbudai_nan` / `eq_songmabutaosheng_nan` | `eq_qinghannvsichou_nv` / `eq_xixiaxiubianbodai_nv` / `eq_songsubodai_nv` |

### 鞋矩阵

| 阶 | 男（上 / 中 / 下） | 女（上 / 中 / 下） |
|---|---|---|
| 地 | `eq_qingxuanduanchaoxue_nan` / `eq_yuanchijinpiqixue_nan` / `eq_liaowupiqixue_nan` | `eq_mingzhijinxiuhuagongxie_nv` / `eq_qingjinxiuhuapendixie_nv` / `eq_songjinxiuyuntoulv_nv` |
| 玄 | `eq_mingzaopixue_nan` / `eq_zangdihougechangxue_nan` / `eq_qingqingduanxingxue_nan` | `eq_dalijingxiulv_nv` / `eq_yuanhongzhanxue_nv` / `eq_huijiangxiubianpixue_nv` |
| 黄 | `eq_jinwupixue_nan` / `eq_mengguyangmaozhanxue_nan` / `eq_songmabuxie_nan` | `eq_xixiayuanlvgongxie_nv` / `eq_songqingbuyuantoulv_nv` / `eq_mingmianbuhualv_nv` |

### 年代 / 书界、史料与验证

| 书界 | 年代 / 地域 | 五类覆盖 |
|---|---|---|
| ch01 | 北宋并行辽、西夏、大理、吐蕃 | 五类齐全 |
| ch02/ch03 | 南宋并行金、蒙古 | 五类齐全 |
| ch04 | 元 | 五类齐全 |
| ch05/ch06/ch07 | 明 | 五类齐全 |
| ch08–ch14 | 清；ch10/ch12 回疆、ch09 藏地 | 清五类齐全；回疆五类齐全，藏地补衣物 / 鞋 |

- ✅ 史料（访问 2026-10-01）：[宋史·舆服志](https://www.guoxuedashi.com/a/49nbmi/131767x.html)、[东京梦华录](https://m.gushiwen.cn/guwen/bookv_591416edca52.aspx)、[辽史卷五十六](https://www.shidianguji.com/book/CADAL01027858/chapter/1l4aiq16vopvw)、[金史·舆服志](http://www.guoxue123.com/shibu/0101/00jinsf/043.htm)、[元史·舆服志](https://m.gushiwen.cn/guwen/bookv_5eb473fc4b9d.aspx)、[大明会典卷六十一](http://www.guoxue123.com/shibu/0401/01dmhd/0071.htm)、[大清会典卷三十](https://api.cnkgraph.com/Book/%E5%8F%B2%E9%83%A8/%E6%B3%95%E5%88%B6%E5%8F%B2%E9%A1%9E/%E6%AC%BD%E5%AE%9A%E5%A4%A7%E6%B8%85%E6%9C%83%E5%85%B8/14902/KR2m0012_030)。
- ✅ 图像 / 实物互证（访问 2026-10-01）：[国博古代服饰文化](https://www.chnmuseum.cn/portals/0/web/zt/202102gdfsh/)、[故宫罟罟冠](https://www.dpm.org.cn/explode/others/210566.html)、[明代曳撒](https://www.dpm.org.cn/Uploads/File/2020/04/22/u5e9fff2deb2d4.pdf)、[明代后妃服饰](https://www.dpm.org.cn/Uploads/File/2020/04/27/u5ea6aea86025c.pdf)、[故宫清代羽毛纱](https://www.dpm.org.cn/explode/others/251353.html)、[故宫钿子工艺](https://www.dpm.org.cn/explode/others/262514.html)、[故宫《皇清职贡图》](https://www.dpm.org.cn/journal_detail/379097.html)、[花盆底鞋](https://www.dpm.org.cn/collection/embroider/234290.html)、[《中国古代服饰研究》书目](https://www.cp.com.cn/book/bbbed8f6-7.html)。
- ⚠️ AR-25 明标待考仅 `eq_qingjinxiuhuapendixie_nv`：故宫实例为光绪，乾隆书界采用低矮中底的流行范围仍需专项实物报告确认；旧 `eq_wucanyi` 的既有待考未改。
- ✅ 自动审计：五类各 18 格、90 ID 唯一且与四行登记集合完全一致；全部新行有 `wearer`、书界、原创标注和指定构图。
- ✅ 指定命令：目录行数为 30 / 48 / 26 / 26，四项 `check_item_catalog.py` 均通过；`check_ids.py --strict` 通过（仅报告基线既有未定义 `sk_babuganchan`，`new=0`、严格失败 0）；`git diff --check` 通过。
- ⚠️ 需作者确认：护肩矩阵默认不补、天级默认不补；弓鞋与低矮乾隆花盆底默认按史料边界保留，详见 §4。
