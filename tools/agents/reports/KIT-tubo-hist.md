# KIT-tubo-hist 报告 · 建筑套件 · 吐蕃 · 藏地套件 · 按历史图片参考重出（强历史细节）

## 1. 摘要（3–6 行）

已用实际下载、查看的历史 / 学术图片重出 19 张建筑与 7 张贴片，同 ID、同文件名覆盖旧 PNG；26 张均与基点字节不同。
每项实际输入 2–3 张参考图，正式 `references` 共 77 条，均登记 URL、下载 SHA、取用细节及 `model_input: true`。
普通建筑落实收分土石墙、毛石基脚、修补白灰、深窗密棂、木梁椽和平压土顶；佛殿与城门按审核默认形制重出。
全部成品保持 `candidate`；文件门禁通过不等于作者批准、精确古建复原或整城拼接通过。

## 2. 产出（文件、行数、主要章节）

- `building-map/tubo/`：19 张成品 PNG、19 张本轮原始生成图；`manifest.yaml` 1,392 行，含实际 prompt、史图输入、尺寸、SHA、候选数与历史细节。
- `tile/tubo/`：7 张成品 PNG、7 张本轮原始生成图；`manifest.yaml` 202 行，含相同审计字段。
- `assets/default/prompts/building-map.md` / `tile.md`：更新吐蕃强历史细节、Bar Chorten 门、桥埠原创边界、植物点景边界与本轮落盘结果。
- `sources/historical-rebuild-map.json`、`historical-rebuild-normalization.json` 与规格化 / 登记脚本：留存生成源映射、实测步骤及可复核流程。参考下载保存在集外 `/private/tmp/KIT-tubo-hist-refs/`。

## 3. 关键结论与数值

- 数量保持 19+7；ID、类型、占地未改。候选数核算：建筑 `19×1=19`；贴片 `4×1+3×2=10`；本轮共生成 29 个候选、选中 26 个。
- 19 项建筑各 3 条正式模型输入；贴片共 20 条（柳树 2 条，其余 3 条）；`57+20=77` 条的集外下载 SHA 全部实测一致。
- 规格化仅做 `alpha≥16` 外框裁切、等比 LANCZOS 缩放与透明扩边；未重绘、拉伸、warp 或镜像。26 图均 RGBA、alpha 0–255、内容不触边。
- `temple_hall`：梯形厚墙主龛、绕行廊、木柱梁平顶，无后世大面积金铜顶；k4 / k6：Bar Chorten 覆钵门、通行孔真透明，k6 画面和孔宽均明显大于 k4。
- 普通民居 / 商铺 / 仓屋 / 官署已去除统一红带模板；桥与河埠为史料约束下的原创同功能概化；柳树和沙棘仅作跨年代地域点景。

## 4. 开放问题（附默认值）

1. 城门最终形制：默认采用当前 Bar Chorten 覆钵门语汇；若作者选原创楼式门，再另轮重出，不回退本轮旧图。
2. 桥与河埠：默认保留当前原创同功能概化；若要求精确年代 / 地区，另做藏地桥梁专项考据。
3. 柳树与西藏沙棘：默认仅作跨年代地域点景，不主张吐蕃期城内栽植。
4. 城镇装配：默认保持 `candidate`；贴片 `anchor_px` 暂取非透明包围框底边中点，门孔净宽、墙缝、桥头接缝与真实底面 / 根锚留给城市拼接实测。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- `KIT-tubo-hist-P01` / 暂不把本批图像细节升格为基准事实 / 民居、桥与植物的直接影像多为约 1900–1948 年，只能约束地域材料和构造，不能单独证明吐蕃期原貌。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `design/22` / 城门、墙、桥装配段 / 后续实测 k4 / k6 通行孔、1×1 墙与 2×2 墙角接缝、桥头锚点；本任务不改逻辑文档。
- `TODO.md` / KIT-tubo-hist 状态 / 调度器校验合入后可登记 19+7 已按史图重出；本任务不修改 TODO。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 写集：只触及授权的 `building-map/tubo/**`、`tile/tubo/**`、两份 prompt 与本报告；未改工具、基准、TODO 或其他套件。
- ✅ 重出：19 建筑 + 7 贴片全部覆盖且相对基点 26/26 字节变化；本轮每项最多 2 候选，候选数非 0。
- ✅ 参考登记：26 项正式 `references` 均为 2–3 条真实 URL，含本地文件名、下载 SHA、取用细节、访问日期和 `model_input: true`；下载 SHA 77/77 匹配。
- ✅ 图像：全量联系图及重点单图已看；真透明、左上光、完整留边，未见文字 / 伪字 / 水印 / 人物 / 现代物；历史细节见下列逐类记录。
- ✅ 兼容：ID、类型、占地保持；prompt 内可解析占地与登记一致；尺寸 / 成品 SHA / 原始归档 SHA 与磁盘一致。
- ✅ 强制检查：建筑 `19 张 / 19 条 / 0 问题`；贴片 `7 张 / 7 条 / 0 问题`；严格 ID 退出 0，仅报告基线已知 `sk_babuganchan`，新增问题 0。
- ✅ 候选：下列未特别注明者均 1 候选；`wall`、`wall_corner`、`seabuckthorn` 各 2 候选选第 2。

- `biaoju`：[British Mission](https://commons.wikimedia.org/wiki/File:The_British_Mission_in_Lhasa,_1936.jpg) / [Kussung Magar](https://www.asianart.com/lhasa_restoration/report98/ch_05.htm) / [Tsetan](https://www.loc.gov/item/2021670610/)；低门围院、单层长翼、木装卸棚、毛石基脚和平土顶；1。
- `casino`：[Tsarong](https://commons.wikimedia.org/wiki/File:Tsarong%27s_house_in_Lhasa.jpg) / [Trimon](https://commons.wikimedia.org/wiki/File:Trimon%27s_house.jpg) / [Old City ch.2](https://www.asianart.com/associations/lhasa_restoration/report98/ch_02.htm)；厚收分墙、深窗密棂、石板雨披、少红饰；1。
- `courtyard`：[Trimon](https://commons.wikimedia.org/wiki/File:Trimon%27s_house.jpg) / [British Mission](https://commons.wikimedia.org/wiki/File:The_British_Mission_in_Lhasa,_1936.jpg) / [Kussung Magar](https://www.asianart.com/lhasa_restoration/report98/ch_05.htm)；门院—内院—侧翼、木廊、厚院墙；1。
- `guardhouse`：[De-chen jong](https://www.loc.gov/item/2021670602/) / [Yumbu Lagang](https://rubinmuseum.org/projecthimalayanart/essays/yumbu-lagang-castle/) / [Bar Chorten](https://www.loc.gov/item/2021670618/)；山堡收分墙、窄深窗、粗石基脚和透明门洞；1。
- `house_large` / `house_small`：[Tsarong](https://commons.wikimedia.org/wiki/File:Tsarong%27s_house_in_Lhasa.jpg) / [Trimon](https://commons.wikimedia.org/wiki/File:Trimon%27s_house.jpg) / [Old City ch.2](https://www.asianart.com/associations/lhasa_restoration/report98/ch_02.htm) / [Tsetan](https://www.loc.gov/item/2021670610/)；两层 / 单层收分碉房、深窗、石雨披、梁椽和平土顶；各 1。
- `inn` / `manor`：[British Mission](https://commons.wikimedia.org/wiki/File:The_British_Mission_in_Lhasa,_1936.jpg) / [Kussung Magar](https://www.asianart.com/lhasa_restoration/report98/ch_05.htm) / [Lhasa market](https://www.loc.gov/item/2002698079/) / [Tsarong](https://commons.wikimedia.org/wiki/File:Tsarong%27s_house_in_Lhasa.jpg)；门院内院、双层房翼、木廊密棂和主从层级；各 1。
- `market_stall` / `restaurant`：[Lhasa market](https://www.loc.gov/item/2002698079/) / [Old City ch.2](https://www.asianart.com/associations/lhasa_restoration/report98/ch_02.htm) / [Tsetan](https://www.loc.gov/item/2021670610/) / [Trimon](https://commons.wikimedia.org/wiki/File:Trimon%27s_house.jpg)；低层街面、粗木棚、素布篷、沿街深开口和石板雨披；各 1。
- `shop_1f` / `shop_2f`：[Lhasa market](https://www.loc.gov/item/2002698079/) / [Old City ch.2](https://www.asianart.com/associations/lhasa_restoration/report98/ch_02.htm) / [Trimon](https://commons.wikimedia.org/wiki/File:Trimon%27s_house.jpg) / [Tsarong](https://commons.wikimedia.org/wiki/File:Tsarong%27s_house_in_Lhasa.jpg)；单 / 双层店口、密木棂、短挑檐、修补白灰，无连续红带；各 1。
- `stable` / `warehouse`：[Trimon](https://commons.wikimedia.org/wiki/File:Trimon%27s_house.jpg) / [Tsetan](https://www.loc.gov/item/2021670610/) / [Old City ch.2](https://www.asianart.com/associations/lhasa_restoration/report98/ch_02.htm)；低矮石木厩棚、粗木柱梁、少窗仓屋与平土顶；各 1。
- `palace_hall`：[Norbu linga](https://www.loc.gov/item/2021670617/) / [Yumbu Lagang](https://rubinmuseum.org/projecthimalayanart/essays/yumbu-lagang-castle/) / [Kussung Magar](https://www.asianart.com/lhasa_restoration/report98/ch_05.htm)；收分主楼、层叠白墙、门院轴线与深窗列；1。
- `temple_hall`：[Jokhang / Katsel](https://rubinmuseum.org/projecthimalayanart/essays/jokhang-temple-lhasa/) 两幅图解 / [Yumbu Lagang](https://rubinmuseum.org/projecthimalayanart/essays/yumbu-lagang-castle/)；梯形厚墙主龛、绕行廊、木柱梁平顶，排除后世金顶；1。
- `stupa`：[LACMA 61926](https://collections.lacma.org/object/61926) / [Met 39421](https://www.metmuseum.org/art/collection/search/39421) / [Bar Chorten](https://www.loc.gov/item/2021670618/)；方台—覆钵—叠轮—伞盖清楚分层；1。
- `wharf` / `bridge`：[Yu-tog zamba](https://www.loc.gov/item/2021670619/) / [Nyamchu 1928](https://web.prm.ox.ac.uk/tibet/photo_BMH.F.79.1.html) / [Iron bridge 1936](https://web.prm.ox.ac.uk/tibet/photo_2001.35.76.1.html)；低跨粗石岸坎 / 桥台、短木面，铁构只作排除反例，均为原创同功能概化；各 1。
- `yamen`：[Amban’s Yamen](https://www.loc.gov/item/2021670596/) / [Kussung Magar](https://www.asianart.com/lhasa_restoration/report98/ch_05.htm) / [Norbu linga](https://www.loc.gov/item/2021670617/)；围墙门院、轴线内院、收分房翼与木廊；1。
- `city_gate k4 / k6`：[Bar Chorten](https://www.loc.gov/item/2021670618/) / [Met 39421](https://www.metmuseum.org/art/collection/search/39421) / [LACMA 61926](https://collections.lacma.org/object/61926) / [Old City ch.2](https://www.asianart.com/associations/lhasa_restoration/report98/ch_02.htm) / [Amban’s Yamen](https://www.loc.gov/item/2021670596/)；覆钵、方台、叠轮、收分土石墙和真透明孔；各 1。
- `wall` / `wall_corner`：[Amban’s Yamen](https://www.loc.gov/item/2021670596/) / [Old City ch.2](https://www.asianart.com/associations/lhasa_restoration/report98/ch_02.htm) / [Tsetan](https://www.loc.gov/item/2021670610/)；毛石砌层、收分、修补白灰、石板压顶，紧凑 1×1 / 2×2；各 2。
- `willow`：[Pitt Rivers 1998.131.270](https://web.prm.ox.ac.uk/tibet/photo_1998.131.270.html) / [Norbu linga](https://www.loc.gov/item/2021670617/)；多干与疏垂树冠；1。`seabuckthorn`：[Tsetan](https://www.loc.gov/item/2021670610/) / [Frontiers 2022](https://doi.org/10.3389/fpls.2022.1051587) / [Flowers of India](https://flowersofindia.net/catalog/slides/Tibetan%20Sea%20Buckthorn.html)；地域尺度、刺枝狭叶和橙果；2。
- ✅ 下不到图的类型：无；77 条正式输入对应的 25 个去重下载文件均存在并通过 SHA。Met 网页曾限流，实际图片由其公开 collection 数据端取得；不影响登记 URL 与输入文件核验。
- ⚠️ 需作者确认：城门最终门制、桥 / 河埠是否另做专项考据、植物是否只作地域点景；未确认前沿用 §4 默认值。
