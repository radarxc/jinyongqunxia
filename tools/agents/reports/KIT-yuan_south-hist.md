# KIT-yuan_south-hist 报告 · 建筑套件 · 元 · 江南套件 · 按历史图片参考重出（强历史细节）

## 1. 摘要（3–6 行）
- 19张建筑与7张墙门/桥/植物贴片已用 `gpt-image-2` 逐项重新生成并同 ID 覆盖；不是旧图滤镜、程序绘画或全图仿射返修。
- 每项实际输入1张宋基线透明精灵（只约束相机/透明/写实密度）及2张已下载、`view_image` 检查的历史图片；两城门用第二候选，河埠2选1，其余用第一候选。
- 入库后处理仅 alpha 包围框裁切、一次等比 LANCZOS 与透明留白；26张均为真 RGBA、四边透明，ID/type/footprint 不变。
- 历史边界明确：现存寺、盘门、桥、聚沙塔的后世修缮不冒充元代原状；全部仍为匿名 `candidate`。

## 2. 产出（文件、行数、主要章节）
- `assets/default/building-map/yuan_south/`：19 PNG、根/3分片 manifest、19份 meta、19份入选源图与服务回执；根 manifest 872行。
- `assets/default/tile/yuan_south/`：7 PNG、manifest 266行、7份入选源图与服务回执。
- `assets/default/prompts/building-map.md`、`tile.md`：各补“历史图片参考重出/历史细节要点”；本报告≤100行。

## 3. 关键结论与数值
- 占地保持原登记：建筑7×6至20×16；门8×4/10×4（逻辑净宽4/6）、墙1×1、角2×2、桥4×8、柳3×3、芦苇1×1。
- 26项=23项×1候选+两城门/河埠各2候选，共29次正式候选；另有寺殿透明契约探针2次，均拒收且未入库。
- 目标相机为斜45°、俯仰30°、2:1斜二测、左上光、短右下接触影；未用 warp 强制达标，精确轴线/门孔/接缝仍待总装实测。
- alpha审计：26张均 `(0,255)`、四边透明；建筑短边≥256，贴片短边≥32；清单尺寸和 SHA 与文件一致。

## 4. 开放问题（附默认值）
- 作者审美确认：默认26项保持 `candidate`，不自动转 `approved`；王府红褐柱色、摊棚商品、院落少量植物可在作者审图后收敛。
- 几何联调：默认沿用原 footprint 与 anchor 登记；门洞净宽、墙角接缝、桥面碰撞/遮挡和单视图旋转均 **（待实测）**。
- 历史精度：匿名民居门窗、官署等级、植物具体品种与元末栽植位置 **（待考）**；默认采用本轮克制母题，不命名具名古迹。

## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。此次只重出授权素材并强化来源，不修改基准、玩法接口或 footprint。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- `design/22` §3.4/§4.3、后续总装：实测本轮单视图的地面轴、门孔、墙缝、桥头和遮挡；确认后再决定是否批准。
- `assets/default/baseline/town/`：后续城市装配引用新 SHA；本任务按约束未修改。

## 7. 自检（逐条对照本任务的验收标准）
- ✅ 民居/商业（house_small/large、courtyard、shop_1f/2f、inn、restaurant、casino、stable、warehouse、market_stall）：故宫王振鹏《龙舟夺标图》 `https://m-minghuaji.dpm.org.cn/paint/detail?id=8b90556546a340a2a688b0cb9e6e49d8` + 上海博物馆倪瓒《渔庄秋霁》 `https://www.shanghaimuseum.net/mu/frontend/pg/article/id/CI00001018` /《汀树遥岑》 `https://www.shanghaimuseum.net/mu/frontend/pg/article/id/CI00005285` / 金华元构页面 `http://wglyj.jinhua.gov.cn/art/2021/3/22/art_1229485174_58917773.html`；取滨水楼屋、草亭、板门格扇、灰瓦、深檐与木构柱网；各1候选。
- ✅ 礼制/公共（yamen、biaoju、manor、wangfu）：上海博物馆夏永《滕王阁图》 `https://www.shanghaimuseum.net/mu/frontend/pg/article/id/CI00000900` + 王振鹏/金华元构；取台基、平座、栏杆、柱网、院落等级与简素铺作；各1候选。
- ✅ 宗教（temple_hall）：普陀区政府真如寺 `https://www.shpt.gov.cn/tupianxinwen/20250416/958655.html` + 金华天宁/延福元构页（同上）；取三间柱网、低台基、单檐歇山举折、筒板瓦、鸱吻、椽望、二至三层出跳；1正式候选（2个探针拒收）。
- ✅ 佛塔（pagoda）：常熟市政府聚沙塔 `https://www.changshu.gov.cn/zgcs/c100290/202311/54ee18e3bab9460fb467a58d78d8eef5.shtml` + 夏永界画；取八角七层、收分、砖木腰檐和平座；1候选；1996大修细部未照搬。
- ✅ 城墙/城门/守舍/河埠：苏州方志盘门 `http://dfzb.suzhou.gov.cn/dfzb/szdq/201811/497a392651c54c2781bf1258f8b40d19.shtml` + 王振鹏；取青灰砖券、厚墙、石基、水脚和船岸关系；门各2候选择第2，河埠2选1，守舍/墙/角各1；排除后世楼橹。
- ✅ 桥：青浦区政府古桥页 `https://www.shqp.gov.cn/shqp/ggfw/bmts/20250116/1224818.html`（顺德、迎祥照片）+ 王振鹏；取多跨平梁、细石柱墩、纵横梁和缓坡；1候选；明清重修栏杆/碑刻不照搬。
- ✅ 植物（柳/芦）：倪瓒两画+王振鹏；取疏林斜干、通透冠层、河岸细茎与疏密；各1候选；具体物种/栽植位置待考。
- ✅ 无一类型下载失败；所有列入的历史图均实际下载并 `view_image` 检查；损坏的延福正面图与宣传图未使用。
- ✅ 规格化没有阈值、重绘、拉伸或 warp；ID、type、footprint 未改；`refs/` 仅工作池，不属于授权产物。
- ✅ `check_assets` 建筑：19张/19条/0问题；贴片：7张/7条/0问题。
- ✅ `check_ids.py --strict`：退出0，strict failure count 0；仅报告既有 baseline `sk_babuganchan`。
- ✅ `PYTHONPATH=tools/town python3 -m unittest ...test_asset_adapter ...test_assembled_assets ...test_single_view`：20项通过；首次未带 `PYTHONPATH` 的导入错误已按仓库运行方式纠正。
- ⚠️ 需作者确认：整套风格、礼制建筑红褐用色、门楼比例与植被季相；精确投影、孔对格、墙缝及碰撞不能由文件门禁证明。
