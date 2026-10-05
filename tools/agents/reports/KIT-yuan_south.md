# KIT-yuan_south 报告 · 建筑套件 · 元 · 江南套件

## 1. 摘要（3–6 行）

- 交付元末江南19张建筑、7张贴片；本轮只返修审核点名的17张建筑，另外2张建筑与7张贴片逐字节不动；26张均为真RGBA与 `candidate`。
- 沿用宋套件灰瓦木构与街巷尺度，官署、王府、寺殿按匿名元末意象处理，不宣称具名文物复原。
- 17张返修图经全图仿射重投影后，两底轴均为`+0.50/-0.50`；连同原已通过2张，19/19满足±0.03。宽深比19/19满足审核放宽后的≤30%。

## 2. 产出（文件、行数、主要章节）

- `assets/default/building-map/yuan_south/`：19成品PNG；逐件`meta/`、候选原图/调用记录、3个清单分片、`reproject_flagged.py`与`validation.json`。
- `assets/default/tile/yuan_south/`：7成品PNG、7选中源PNG、`manifest.yaml` 371行；原始路径、实际prompt、缩放/裁框/锚点均登记。
- `assets/default/prompts/building-map.md`、`tile.md`：既有本套年代提示词保持不动。
- [候选审图页](../../../assets/default/building-map/yuan_south/preview.html)36行，提供26件浅/深底查看；只用于单件审图，显示缩放不代表城内相对尺度。
## 3. 关键结论与数值

- 底面目标为`32(w+h)×16(w+h)`px；小民居7×6得到416×208，王府20×16得到1152×576。画布另容纳建筑高度与透明边。
- 建筑以可见底面L/F/R读点，`s=32(w+h)/(Rx−Lx)`，底面中心`(L+R)/2`随裁框、实际取整缩放与粘贴偏移变换；隐藏后角为推定，非测绘。
- 返修矩阵固定`x′=x`、`y′=c·x+d·y+t`并绕原锚点不动；由原两斜率`m+、m−`解得`d=1/(m+−m−)`、`c=0.5−d·m+`，故两轴解析结果严格为`+0.5/-0.5`。
- 返修17张的`d=0.885–1.232`，仅整图投影变化；尺寸、footprint、锚点均不变。原人工三点导致的宽深比误差保持1.2%–28.3%，19张均≤30%。
- 城门净宽4/6，外占地`(k+4)×4=8×4/10×4`，两侧各2格；净宽为逻辑契约，不能凭PNG透明洞宣称像素精确达标。
- 小民居、官署、摊棚、护运行、王府消费元骨架；其余占地沿用南宋同功能项【建议值】，大民居10×8借用南宋院落包络（原创扩展）。`era=yuan`，地域由ID表达。
## 4. 开放问题（附默认值）

- 作者确认画风、元末地域意象及建筑细部：默认全部candidate；不自动批准，具体门窗、彩画、塔层数（待考）。
- 精密投影：默认单向预览；双轴已按审核要求做整图仿射校正。旋转视图/GLB、门孔、墙缝、桥头及碰撞遮挡（待实测）。
- 护运行称谓、清真寺是否加入具名城市：默认无字号货栈和佛塔；不引入新营生ID，不将通用河埠绑定port。
- 模型版本/seed/图像推理档位工具未披露，默认如实留空语义说明；未新增价格、浏览器支持或限额承诺，无此类待联网条目。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增。这里只生成资产，不修改设计基准或玩法接口。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `design/22` §3.4：后续具体城市任务确认本套地域type及14项同构/变体建议占地，避免把建议值误当骨架既定值。
- `design/22` §4.3、后续总装：接入净宽4/6的逻辑掩膜、单向能力与真实anchor；本批石桥仅bridge_deck，桥栏未交付。
- `assets/default/baseline/town/`总装与`tools/town/`：本次未改；后续联调检验空间尺度、可通行门洞和遮挡，不以候选素材作为release完成。

## 7. 自检（逐条对照验收标准）

- ✅ `python3 tools/agents/check_assets.py assets/default/building-map/yuan_south --min 18 --max 22 --min-side 256`：19张、19条、0问题。
- ✅ `python3 tools/agents/check_assets.py assets/default/tile/yuan_south --min 5 --max 10 --min-side 32`：7张、7条、0问题。
- ✅ `python3 tools/lint/check_ids.py --strict`：退出0，strict failure count 0；既有`sk_babuganchan`未定义由原baseline容许，未修改。
- ✅ 26张成品RGBA、alpha范围0–255、透明四边、尺寸/最终SHA/源SHA核对通过；单件生成，未用拼图切片冒充独立图。
- ✅ 17张返修成品逐张以`view_image(detail=original)`复核；另2张建筑与7张贴片保持原SHA。只改授权路径，未改宋文件/设计/工具，未执行改变仓库状态的git命令；每次补丁≤50行。
- ✅ 几何轴容差±0.03下19/19通过；返修17张解析值均为`+0.500000/-0.500000`。审核放宽的宽深比≤30%亦19/19通过，最大stable 28.3%。
- ⚠️ 本轮工具未暴露`image_gen`，故未重调模型；从17张已选源图确定性重放后做整图仿射。灰瓦、木构、石基、低饱和抹灰及细节密度与审核已通过版本一致。
- ⚠️ 单向26件均非四向完成；门孔净宽、墙段接缝、细枝低alpha边缘与实际城内效果待实测；没有把未完成事项写成通过。需作者确认项默认沿用§4。

**清单**：建筑type等于完整ID；占地单位为规划格，尺寸为最终PNG像素。

| ID | 类型 | 占地 | 尺寸 |
|---|---|---|---|
| bld_kit_yuan_south_house_small | 小民居 | 7×6 | 480×480 |
| bld_kit_yuan_south_house_large | 大民居 | 10×8 | 656×656 |
| bld_kit_yuan_south_courtyard | 院落 | 10×8 | 656×480 |
| bld_kit_yuan_south_shop_1f | 单层商铺 | 6×5 | 448×432 |
| bld_kit_yuan_south_shop_2f | 两层商铺 | 8×6 | 544×496 |
| bld_kit_yuan_south_inn | 客栈 | 12×9 | 752×720 |
| bld_kit_yuan_south_restaurant | 酒楼/茶肆 | 12×9 | 768×688 |
| bld_kit_yuan_south_market_stall | 市场棚 | 5×4 | 512×512 |
| bld_kit_yuan_south_yamen | 路府官署 | 16×12 | 1120×832 |
| bld_kit_yuan_south_biaoju | 护运货栈 | 14×11 | 992×672 |
| bld_kit_yuan_south_casino | 赌场 | 10×8 | 704×640 |
| bld_kit_yuan_south_manor | 山庄大院 | 16×13 | 1152×800 |
| bld_kit_yuan_south_wangfu | 王府殿堂模块 | 20×16 | 1312×1024 |
| bld_kit_yuan_south_temple_hall | 寺观殿堂 | 13×10 | 928×736 |
| bld_kit_yuan_south_pagoda | 楼阁佛塔 | 7×7 | 832×1024 |
| bld_kit_yuan_south_guardhouse | 城门守舍 | 7×5 | 672×512 |
| bld_kit_yuan_south_stable | 马厩 | 9×7 | 736×544 |
| bld_kit_yuan_south_warehouse | 仓屋 | 10×8 | 736×544 |
| bld_kit_yuan_south_wharf | 河埠 | 10×4 | 640×512 |
| tex_town_yuan_south_city_gate__k4_r000_v01 | city_gate净宽4 | 8×4 | 618×433 |
| tex_town_yuan_south_city_gate__k6_r000_v01 | city_gate净宽6 | 10×4 | 568×382 |
| tex_town_yuan_south_wall__brick_r000_v01 | wall | 1×1 | 161×228 |
| tex_town_yuan_south_wall_corner__outer_ne_v01 | wall_corner | 2×2 | 151×209 |
| tex_town_yuan_south_bridge_deck__w4_l8_r000_v01 | bridge_deck | 4×8 | 414×264 |
| tex_town_yuan_south_tree_cluster__willow_v01 | tree_cluster柳 | 3×3 | 301×272 |
| tex_town_yuan_south_reed__canal_v01 | reed芦苇 | 1×1 | 137×130 |

**地域替换对应表**（均为匿名原创组合，默认沿用）：

| 通用功能 | 江南表达 | 边界 |
|---|---|---|
| 镖局/护运行 | 无招牌货栈院 | 称谓待考，不改营生功能 |
| 王府/宫殿模块 | 灰瓦红褐柱殿堂 | 不复制帝都宫禁，也不混同路府衙门 |
| 塔/宗教地标 | 江南楼阁佛塔 | 不冒名瑞光塔，不用藏式白塔替代；清真寺留给具名城市 |
| 码头/河埠、植物 | 台阶卸货面、柳与芦苇 | 无port功能；植物历史栽植点待考 |

**来源清单 / 参考资料**（均于2026-09-30访问；仅文字研究，图像输入以manifest为准）：

- [金华文旅《六、景区介绍》](https://v.jhwlv.com/app/index.php?a=site&c=site&do=detail&i=3&id=654&uniacid=3)与[上海市普陀区政府《走进真如寺，探秘大殿的建筑密码》](https://www.shpt.gov.cn/tupianxinwen/20250416/958655.html)：天宁寺宋元木构延续、真如寺元代大殿单檐歇山和平缓屋面；只约束寺殿母题，不外推民居门窗和彩画。
- [苏州市志办《苏州古城门之盘门》](https://dfzb.suzhou.gov.cn/dfzb/szdq/201811/497a392651c54c2781bf1258f8b40d19.shtml)：瑞光塔七级八面砖木楼阁家族、现存盘门元代重建与后世修缮边界；本塔层数为原创。
- [杭州文保导览《凤凰寺》](https://wbdl.hzwbzx.cn/house?id=13)：元重建与历代重修、2009门楼复建；避免现代建筑误作元代原貌。
- [故宫院刊《〈营造法式〉大木作控制性尺度规律研究》](https://www.dpm.org.cn/Uploads/File/2018/06/04/u5b15212a9a148.pdf)：以唐至元实例验证大木作控制性尺度规律；未将论文比例当作生成图测绘值。
- [杭州日报《杭州庆春门与艮山门》](https://hznews.hangzhou.com.cn/chengshi/content/2017-11/02/content_6703711.htm)：元末城防重建及2006复建门的清代原型边界；本门仅原创概化。
- [上海市青浦区博物馆《顺德桥》](http://museum.shqp.gov.cn/museum/ql/20190304/479101.html)：取石梁材质母题；[上海数字植物志《芦苇》](https://shflora.ibiodiversity.net/pages/phragmites_australis.html)：只取形态/生境，不推出元末栽植点。
- [Pillow Image API](https://pillow.readthedocs.io/en/stable/reference/Image.html)、[W3C PNG规范](https://www.w3.org/TR/png-3/#6AlphaRepresentation)：核实crop/resize/paste与alpha语义；底层图像模型信息未由工具披露，未捏造版本或费用。
