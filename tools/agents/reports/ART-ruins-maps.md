# ART-ruins-maps 报告 · 遗迹与探险地宫地图 · 九老洞、敦煌地宫等 Tiled 场景地图与预览（作者 10-02 晚，codex gpt-6-astra xhigh）

## 1. 摘要（3–6 行）

已交付 56 张 Tiled 1.12.2 地图及同名 PNG，覆盖序章与十四书界、18 个全局区域；全部复用章节场景 ID。
布局区分岩窟、墓道、院落、地牢、荒漠遗构、矿洞、雪谷与船骸；53 处具探索闭环，3 处遵从 M1 专属规格。
56 图通过六邻连通检查与逐图目检；四项指定命令均退出 0。没有改运行时代码、设计文档或原有 tileset。
九老洞、敦煌地宫尚无章节场景 ID，未制作；任务、采集、奖励和剧情门禁仍需内容任务绑定，不能宣称整章已可玩。

## 2. 产出（文件、行数、主要章节）

`content/world/regions/<rg>/<sc>.tmj`：56 文件、13,984 行；同路径 `.preview.png`：56 张；`ART-ruins-maps.review-01…10.png`：10 张目检联系表。
同目录 `ART-ruins-maps.catalog.tsv` / `.audit.tsv`：各 57 行；`done.txt`：58 行；`ART-ruins-maps.md`：66 行，交接、边界、参考资料与依赖；本报告 100 行。

## 3. 关键结论与数值

16 微型 + 40 标准 = 56；最大 96×96=9,216 槽=9 chunks；52 战区各 7×7=49≤400 格，容量 4+4≤49【建议值】；6 对 Door 全量闭合。长白 10×8 / 42 可走格；废驿 48×32 / 安全院 12×10；草坡 64×40；侠客岛保留 24 石室。
下表“房/区(外)”含入口与核心，户外按调查分区；侠客岛 24 室分 3 外围组。预览链接即实际路径，同目录替换后缀可得源图。所有布局为（原创扩展）。

| 书 / 场景 ID | 名称 · 类型 | 档 / 格数 | 房/区(外) | 预览路径 |
|---|---|---|---|---|
| 越女序章 / `sc_00_changbai_cave` | 长白山雪穴 · 雪穴 | 微型 / 10x8 | 1(0) | [PNG](../../../content/world/regions/rg_dongbei/sc_00_changbai_cave.preview.png) |
| 白马 / `sc_10_fengshi_feiyi` | 风蚀废驿 · 废驿 | 微型 / 48x32 | 2(0) | [PNG](../../../content/world/regions/rg_xiyu_beijiang/sc_10_fengshi_feiyi.preview.png) |
| 白马 / `sc_10_tieyan_caopo` | 铁延草坡 · 草坡 | 微型 / 64x40 | 4(2) | [PNG](../../../content/world/regions/rg_xiyu_beijiang/sc_10_tieyan_caopo.preview.png) |
| 白马 / `sc_10_gaochang_migong` | 高昌迷宫外环 · 荒漠迷宫 | 标准 / 96x80 | 5(3) | [PNG](../../../content/world/regions/rg_xiyu_beijiang/sc_10_gaochang_migong.preview.png) |
| 白马 / `sc_10_gaochang_inner` | 高昌迷宫内殿 · 地宫 | 微型 / 64x64 | 4(2) | [PNG](../../../content/world/regions/rg_xiyu_beijiang/sc_10_gaochang_inner.preview.png) |
| 白马 / `sc_10_jiubiao_cang` | 晋威旧仓 · 旧仓地窖 | 微型 / 48x40 | 3(1) | [PNG](../../../content/world/regions/rg_hedong_jinzhong/sc_10_jiubiao_cang.preview.png) |
| 白马 / `sc_10_wushui_shalu` | 无水沙路 · 荒漠支路 | 标准 / 96x64 | 6(2) | [PNG](../../../content/world/regions/rg_xiyu_beijiang/sc_10_wushui_shalu.preview.png) |
| 白马 / `sc_10_qingzang_yaolu` | 青藏药庐风洞 · 风蚀岩洞 | 标准 / 72x64 | 5(2) | [PNG](../../../content/world/regions/rg_qingzang/sc_10_qingzang_yaolu.preview.png) |
| 天龙 / `sc_01_langhuanfudi` | 无量山·琅嬛福地 · 湖畔岩窟 | 标准 / 80x64 | 5(2) | [PNG](../../../content/world/regions/rg_dali_cangshan/sc_01_langhuanfudi.preview.png) |
| 天龙 / `sc_01_bingjiao` | 西夏冰窖 · 冰窖 | 微型 / 64x56 | 4(2) | [PNG](../../../content/world/regions/rg_xixia_helan/sc_01_bingjiao.preview.png) |
| 天龙 / `sc_01_jiufengsui` | 旧烽燧 · 废垒 | 微型 / 64x56 | 4(2) | [PNG](../../../content/world/regions/rg_hedong_jinzhong/sc_01_jiufengsui.preview.png) |
| 天龙 / `sc_01_guanwaijuya` | 关外崖壁侧洞 · 崖侧岩洞 | 微型 / 64x64 | 4(2) | [PNG](../../../content/world/regions/rg_hedong_jinzhong/sc_01_guanwaijuya.preview.png) |
| 天龙 / `sc_01_sihoubinggu` | 寺后冰谷 · 雪谷 | 标准 / 80x64 | 8(2) | [PNG](../../../content/world/regions/rg_qingzang/sc_01_sihoubinggu.preview.png) |
| 射雕 / `sc_02_niujia_jiudian` | 牛家村酒店旧窖 · 旧窖 | 微型 / 64x48 | 3(1) | [PNG](../../../content/world/regions/rg_jiangnan_taihu/sc_02_niujia_jiudian.preview.png) |
| 射雕 / `sc_02_tieqiangmiao` | 铁枪庙 · 废寺 | 微型 / 64x56 | 4(2) | [PNG](../../../content/world/regions/rg_jiangnan_taihu/sc_02_tieqiangmiao.preview.png) |
| 射雕 / `sc_02_zhoubotong_dong` | 桃花岛顽童洞 · 海崖岩洞 | 微型 / 64x56 | 4(1) | [PNG](../../../content/world/regions/rg_donghai_islands/sc_02_zhoubotong_dong.preview.png) |
| 射雕 / `sc_02_tiezhangfeng` | 铁掌峰墓穴 · 山峰墓穴 | 标准 / 80x64 | 4(2) | [PNG](../../../content/world/regions/rg_huxiang/sc_02_tiezhangfeng.preview.png) |
| 射雕 / `sc_02_taohua_qimenzhen` | 桃花岛奇门阵 · 林阵 | 标准 / 80x72 | 7(2) | [PNG](../../../content/world/regions/rg_donghai_islands/sc_02_taohua_qimenzhen.preview.png) |
| 神雕 / `sc_03_zhongnan_gumu` | 终南古墓 · 古墓 | 标准 / 96x80 | 6(3) | [PNG](../../../content/world/regions/rg_guanzhong/sc_03_zhongnan_gumu.preview.png) |
| 神雕 / `sc_03_jueqinggu` | 绝情谷 · 山谷 | 标准 / 96x80 | 10(2) | [PNG](../../../content/world/regions/rg_guanzhong/sc_03_jueqinggu.preview.png) |
| 神雕 / `sc_03_duanchangya` | 断肠崖谷底 · 崖谷 | 标准 / 80x72 | 8(2) | [PNG](../../../content/world/regions/rg_guanzhong/sc_03_duanchangya.preview.png) |
| 神雕 / `sc_03_jianzhong` | 剑冢 · 山洞与剑台 | 标准 / 80x72 | 5(2) | [PNG](../../../content/world/regions/rg_guanzhong/sc_03_jianzhong.preview.png) |
| 神雕 / `sc_03_xiangyang_anchannel` | 襄阳暗渠 · 地下水道 | 标准 / 80x56 | 4(2) | [PNG](../../../content/world/regions/rg_jingxiang/sc_03_xiangyang_anchannel.preview.png) |
| 神雕 / `sc_03_cangshan_yinzheju` | 苍山隐者居瀑后洞 · 瀑后岩洞 | 标准 / 80x64 | 5(2) | [PNG](../../../content/world/regions/rg_dali_cangshan/sc_03_cangshan_yinzheju.preview.png) |
| 倚天 / `sc_04_qingyuan_wreck` | 庆元废船仓 · 船骸 | 微型 / 64x56 | 4(2) | [PNG](../../../content/world/regions/rg_zhedong/sc_04_qingyuan_wreck.preview.png) |
| 倚天 / `sc_04_guangming_tunnel` | 光明顶密道 · 密道 | 标准 / 96x80 | 5(3) | [PNG](../../../content/world/regions/rg_xiyu_nanjiang/sc_04_guangming_tunnel.preview.png) |
| 倚天 / `sc_04_jiuyang_valley` | 九阳山谷 · 隐谷 | 标准 / 80x72 | 10(2) | [PNG](../../../content/world/regions/rg_xiyu_nanjiang/sc_04_jiuyang_valley.preview.png) |
| 倚天 / `sc_04_binghuo_cave` | 冰火岛内陆洞 · 火山岩洞 | 标准 / 80x72 | 5(2) | [PNG](../../../content/world/regions/rg_liaodong/sc_04_binghuo_cave.preview.png) |
| 倚天 / `sc_04_wangpanshan_ruins` | 王盘山遗址 · 岛上旧台 | 标准 / 80x64 | 5(2) | [PNG](../../../content/world/regions/rg_donghai_islands/sc_04_wangpanshan_ruins.preview.png) |
| 倚天 / `sc_04_xiangyang_ruins` | 襄阳遗垒 · 旧战场 | 标准 / 80x64 | 4(2) | [PNG](../../../content/world/regions/rg_jingxiang/sc_04_xiangyang_ruins.preview.png) |
| 笑傲 / `sc_05_siguoya` | 思过崖 · 崖台 | 标准 / 80x56 | 3(1) | [PNG](../../../content/world/regions/rg_guanzhong/sc_05_siguoya.preview.png) |
| 笑傲 / `sc_05_huashan_houdong` | 华山后洞 · 刻壁岩洞 | 标准 / 80x72 | 4(2) | [PNG](../../../content/world/regions/rg_guanzhong/sc_05_huashan_houdong.preview.png) |
| 笑傲 / `sc_05_yaowangmiao` | 药王庙 · 废庙 | 标准 / 72x64 | 4(2) | [PNG](../../../content/world/regions/rg_guanzhong/sc_05_yaowangmiao.preview.png) |
| 笑傲 / `sc_05_meizhuang_dilao` | 梅庄湖底地牢 · 地牢 | 标准 / 80x64 | 4(2) | [PNG](../../../content/world/regions/rg_jiangnan_taihu/sc_05_meizhuang_dilao.preview.png) |
| 笑傲 / `sc_05_taihu_jiuzhuang` | 太湖旧庄 · 旧庄遗构 | 标准 / 80x64 | 4(2) | [PNG](../../../content/world/regions/rg_jiangnan_taihu/sc_05_taihu_jiuzhuang.preview.png) |
| 侠客 / `sc_06_xiakedao_shishi` | 侠客岛二十四石室 · 石室群 | 标准 / 96x96 | 24(3) | [PNG](../../../content/world/regions/rg_nanhai_islands/sc_06_xiakedao_shishi.preview.png) |
| 侠客 / `sc_06_dinghai_chaodong` | 定海潮洞 · 海蚀洞 | 标准 / 80x64 | 5(2) | [PNG](../../../content/world/regions/rg_zhedong/sc_06_dinghai_chaodong.preview.png) |
| 碧血 / `sc_07_lingnan_yizhan` | 岭南废驿 · 废驿 | 微型 / 64x56 | 3(1) | [PNG](../../../content/world/regions/rg_lingnan/sc_07_lingnan_yizhan.preview.png) |
| 碧血 / `sc_07_jinshedong` | 金蛇洞 · 裂隙洞 | 标准 / 80x72 | 4(2) | [PNG](../../../content/world/regions/rg_guanzhong/sc_07_jinshedong.preview.png) |
| 碧血 / `sc_07_kujin_didao` | 库银地道 · 库房地道 | 标准 / 88x56 | 4(2) | [PNG](../../../content/world/regions/rg_yanjing_zhili/sc_07_kujin_didao.preview.png) |
| 鹿鼎 / `sc_08_ludingshan_kuangdao` | 鹿鼎山矿道 · 矿洞 | 标准 / 96x72 | 4(2) | [PNG](../../../content/world/regions/rg_liaodong/sc_08_ludingshan_kuangdao.preview.png) |
| 鹿鼎 / `sc_08_shenlongdao_sheku` | 神龙岛蛇窟 · 蛇窟 | 标准 / 80x64 | 5(2) | [PNG](../../../content/world/regions/rg_donghai_islands/sc_08_shenlongdao_sheku.preview.png) |
| 连城 / `sc_09_tianningsi` | 天宁寺 · 寺院地宫 | 标准 / 80x64 | 4(2) | [PNG](../../../content/world/regions/rg_jingxiang/sc_09_tianningsi.preview.png) |
| 连城 / `sc_09_xuegu_rukou` | 雪谷入口 · 峡口 | 标准 / 72x64 | 4(2) | [PNG](../../../content/world/regions/rg_qingzang/sc_09_xuegu_rukou.preview.png) |
| 连城 / `sc_09_xuegu` | 雪谷 · 雪谷 | 标准 / 96x80 | 8(2) | [PNG](../../../content/world/regions/rg_qingzang/sc_09_xuegu.preview.png) |
| 连城 / `sc_09_xuegu_shandong` | 雪谷山洞 · 雪洞 | 微型 / 64x56 | 5(2) | [PNG](../../../content/world/regions/rg_qingzang/sc_09_xuegu_shandong.preview.png) |
| 连城 / `sc_09_qijia_laowu` | 戚家老屋 · 旧宅 | 微型 / 64x48 | 3(1) | [PNG](../../../content/world/regions/rg_huxiang/sc_09_qijia_laowu.preview.png) |
| 鸳鸯 / `sc_11_zizhunan` | 紫竹庵 · 庵院 | 微型 / 64x56 | 4(2) | [PNG](../../../content/world/regions/rg_hedong_jinzhong/sc_11_zizhunan.preview.png) |
| 鸳鸯 / `sc_11_zhongtiaoshan` | 中条山残壁 · 山崖遗刻 | 标准 / 80x64 | 4(2) | [PNG](../../../content/world/regions/rg_hedong_jinzhong/sc_11_zhongtiaoshan.preview.png) |
| 书剑 / `sc_12_yufeng_midong` | 玉峰秘洞 · 雪岭秘洞 | 标准 / 80x72 | 5(2) | [PNG](../../../content/world/regions/rg_xiyu_nanjiang/sc_12_yufeng_midong.preview.png) |
| 书剑 / `sc_12_lanyang_shifosi` | 兰阳石佛寺 · 寺院库房 | 标准 / 80x64 | 4(2) | [PNG](../../../content/world/regions/rg_zhongyuan/sc_12_lanyang_shifosi.preview.png) |
| 书剑 / `sc_12_shacheng` | 沙城遗构 · 荒漠遗城 | 标准 / 96x80 | 4(2) | [PNG](../../../content/world/regions/rg_xiyu_nanjiang/sc_12_shacheng.preview.png) |
| 飞狐 / `sc_13_fengyugumiao` | 风雨古庙 · 古庙 | 标准 / 72x64 | 4(2) | [PNG](../../../content/world/regions/rg_huxiang/sc_13_fengyugumiao.preview.png) |
| 飞狐 / `sc_13_huyidaomu` | 胡一刀墓前 · 墓地外庭 | 标准 / 80x64 | 6(2) | [PNG](../../../content/world/regions/rg_liaodong/sc_13_huyidaomu.preview.png) |
| 飞狐 / `sc_13_yaowanggu` | 药王谷药窖 · 药谷与药窖 | 标准 / 96x80 | 5(2) | [PNG](../../../content/world/regions/rg_jingxiang/sc_13_yaowanggu.preview.png) |
| 雪山 / `sc_14_chuangwang_vault` | 闯王宝藏洞 · 雪山宝洞 | 标准 / 96x80 | 6(3) | [PNG](../../../content/world/regions/rg_liaodong/sc_14_chuangwang_vault.preview.png) |

未制作：作者点名两处及其余没有独立场景键的洞 / 地宫；普通遗迹 83 处预算尚未逐处登记，不能用本批主线 / 回访场景数抵扣。城市、完整山庄 / 门派外景、`design/20` 仅有 `rs/cache/placeKey` 的遗绪不冒名建图。

## 4. 开放问题（附默认值）

默认调查点只保留合法 Trigger 局部名，不虚构 event / loot / encounter 引用；CONTENT 绑定后才解谜、采集、发奖。默认外部门禁、封洞、首次对白软锁由剧情相位控制，基础图不自动兑现访问许可。默认本批为色块格网预览，非最终装饰美术；真机与 Tiled GUI 未实测。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；按现行场景 ID、六邻与尺寸合同执行。长白山无岔路 / 无奖励按序章特例，不提改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

`design/chapters/*` / 场景注册：先登记九老洞、敦煌地宫的书界 / rg / sc / poi；曼陀山庄琅嬛玉洞不可误用大理琅嬛福地。未独立登记者还有泛称旧矿、废井、药窖、玉笔山庄地窖及遗绪缓存点；已有宿主场景不等于获准拆出新 ID。
CONTENT 各章 / 本批交接 §2：绑定 Trigger 调查、采集季节、奖励收据、52 候选战区与门禁；6 对门补剧情许可，长白补初眠事务。地形语义 / 动态封路的可达性仍归 ENG-20。
美术 tileset / deco：缺洞壁、墓道、土坯残墙、石刻、矿支架、毡帐、药架、灯具、宝箱贴片；原 terrain 的台阶缺 rampDir、急流 / 瀑布缺 flowDir。本次不用这些方向地形，不改旧 tileset。具体原著文字和确址沿章节（待考），未自造引文。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ 清单、注册 ID / 区域、四层、现有 tileset、56 对源图与 PNG、done 台账、10 张联系表的逐图 view_image、无写集外源文件改动；每次文本写入 ≤120 行，未执行改变仓库状态的 git 命令。
✅ 56/56 基础图交互锚点及保守步行白名单内 98,618 格连通；53/53 奖励位在封闭战区后仍可达并返程。已修正四处孤立格。长白 / 废驿 / 草坡无普通奖励闭环为章节特例。
✅ `pnpm install --frozen-lockfile`；`pnpm content:validate`（981 files / 925 objects / 56 maps）；`pnpm content:build`（978 objects / 15 chapters）；`python3 tools/lint/check_ids.py --strict`（新增失败 0，仅既有 sk_babuganchan 基线）；Tiled drift 与 diff whitespace 检查通过。
⚠️ 作者点名两图缺 ID 未交付；机关 / 门禁 / 奖励是待绑定位置，非已实装玩法；三联 / 广州原文未逐字复核；未做 Tiled GUI、运行时和真机验收。已联网核实 Tiled 1.12.2 与 JSON 格式，来源及 2026-10-03 访问日期见场景交接“参考资料”；无新增价格 / API 限额。
