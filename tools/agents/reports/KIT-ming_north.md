# KIT-ming_north 报告 · 建筑套件 · 明 · 北方套件

## 1. 摘要（3–6 行）

交付19张建筑、7张贴片，均为真正RGBA透明PNG，登记为 `candidate`，未写成作者已批准。
第3轮曾对审核点名10张建筑和3张贴片调用内置 `image_gen`，共24候选、每张最多2个；替换9张建筑，衙门及3贴片因新候选更差保留原成品，失败尝试全部归档。
采用宋套件的写实材质、细节密度和左上光；替换为北方灰砖灰瓦、合院、砖塔与克制官式配色。
三条指定检查重新执行均退出0；点名13张中8张底轮廓及占地比例进入容差、5张仍未解决。第9次续作无可调用 `image_gen`，未伪造修复；26张成品逐图复核后保持不变。

## 2. 产出（文件、行数、主要章节）

- `assets/default/building-map/ming_north/`：19张成品，局部替换9张；`manifest.yaml` 999行；对应9份制作YAML及来源登记更新；`sources/`保留旧图和第3轮18个候选。PNG不适用行数。
- 同目录：原制作脚本及`preview.html`保留；`geometry-summary.json` 21行、`revision3-validation.json` 1行；`sources/revision4/audit.py` 122行与`asset-audit.json`复核26项/0一致性错误，联网证据及生成失败日志一并归档。
- `assets/default/tile/ming_north/`：7张成品全部保留；`manifest.yaml` 245行，仅双门及桥补充返修尝试说明；`source/revision3/`归档6候选、3份单行JSON实测记录；两个`normalization*.json`及植物来源不动。
- 两份prompts仍为366/171行，仅更新§11.3/§10的本轮几何结论；年代、来源与既有待决事项保留。本报告100行，按小块修订，未整篇重写。

## 3. 关键结论与数值

- 地面尺度沿用64×32px/格；建筑底面水平目标跨度为 `32(w+h)`，缩放 `s=32(w+h)/(Rx−Lx)`，锚点由 `(L+R)/2` 随裁框和缩放换算。PNG宽高不是占地宽深比，不拉伸图像纠偏。
- 建筑仅裁切、等比缩放、透明留边；赌场/两层商铺/客栈/王府另裁去外围薄铺地，未变形、补绘或裁建筑脚，逐项裁量见meta。其内部砖缝/横梁未重投影，底轮廓通过不等于完整3D投影验收。短边≥256px；贴片本轮未改像素。
- 门净宽目标4/6格，外占地 `(k+4)×4`，两侧各2格；成品实测净宽约4.102/5.680格，孔内采样alpha0，但未精确落实净宽。k4底边约+.5400/+.5455/−.5259，k6约+.5594/+.5397/−.4553，仍超差。仅绘r000，瓮城另由布局拼墙。
- 建筑轴斜率容差±0.03，宽深比例误差10%为既有制作告警【建议值】。本轮8张底轮廓通过，比例误差0.8376%–3.7482%；山庄成品+.532328/−.586184仍超差；衙门保留前轮+.50388/−.58175、比例误差15.478%。桥短边+.5616仍失败，不能用三项命令通过替代几何验收。

## 4. 开放问题（附默认值）

- 默认19类及借用占地沿用本清单；骨架明确项引用 `design/22` §3.4，其余借宋套件同功能占地【建议值】，等待作者确认。
- 默认接受为历史意象原创候选：王府深绿琉璃、寺殿黑灰瓦、概化八角砖塔、国槐与侧柏；不称具名古建复原。塔檐间距仍偏疏，官署局部翘檐、河埠台高待作者审图。
- 默认仅原向静态试贴，`allowRotation:false`；通行、遮挡、屋顶淡出、接缝、墙高与实际尺度均（待实测）。前轮13项审核问题中8项底轮廓已解决；山庄、衙门、双门及桥5项仍待修正，均已用尽本轮2候选额度；未运行总装，不提供四向或GLB成果。
- 历史与植物资料于2026-09-30重新联网检索并逐URL取得HTTP 200；现代地域资料不能证明全部明代细部。当前API只提供 `view_image`，本机 Codex CLI 0.159.0 尝试亦以 app-server 初始化权限错误退出；底层图像模型版本及seed未公开，不猜写。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。新增内容为地域美术资产与制作建议，不修改玩法、数值公式或历史基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 后续同步事项 |
|---|---|
| `docs/design/22-town-layout-and-generation.md` §3.4、§4.3 | 地域映射及借用占地仍待原流程确认；第3轮剩山庄/衙门2项建筑告警，双门与桥仍未达标；4张铺地修边的内部轴向未重投影，不能作为完整投影金样；本轮不改设计正文 |
| `tools/agents/reports/TOWN-render.md`、`TOWN-assemble`后续任务 | 消费最终像素锚与64×32格尺度，先原向试贴；验证门洞通行、墙角逻辑中心代理、石桥接缝和河埠高差，不将PNG旋转冒充新朝向 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 建筑检查：`python3 tools/agents/check_assets.py assets/default/building-map/ming_north --min 18 --max 22 --min-side 256`，19图/19条目/0问题。
- ✅ 贴片检查：`python3 tools/agents/check_assets.py assets/default/tile/ming_north --min 5 --max 10 --min-side 32`，7图/7条目/0问题。
- ✅ ID检查：`python3 tools/lint/check_ids.py --strict`，退出0、新增问题0；既有 `sk_babuganchan` 未定义1处由基线豁免。另核对本批26项无重名、漏登记。
- ✅ 本续作逐张 `view_image` 复核26张最终图；独立审计验证RGBA、alpha0/255、尺寸、SHA、来源SHA、锚点与透明边，26项/0一致性错误。未改宋基线、`tools/town/`、策划技术文档或任务总表，未执行git状态变更命令。
- ⚠️ 仍失败：manor、yamen及双门、桥；旧轮8张底轮廓/比例返修进入人工测点容差。独立底边回归另对house_small、market_stall给出0.0046/0.0037的临界超差，属取样口径差异；全部保持candidate。本续作无生成能力，未用非等比/仿射纠偏冒充完成。

清单：占地单位为格，尺寸为最终PNG像素；建筑 `type` 与ID完全相同，`era=ming_north`；贴片类型为 `tile.kind`。

| ID | 类型 | 占地 | 尺寸 |
|---|---|---|---|
| `bld_kit_ming_north_house_large` | 大民居 | 10×8 | 640×512 |
| `bld_kit_ming_north_house_small` | 小民居 | 7×6 | 480×384 |
| `bld_kit_ming_north_courtyard` | 院落 | 10×8 | 640×512 |
| `bld_kit_ming_north_shop_1f` | 单层商铺 | 7×5 | 448×384 |
| `bld_kit_ming_north_shop_2f` | 两层商铺 | 7×5 | 448×416 |
| `bld_kit_ming_north_inn` | 客栈 | 12×9 | 736×512 |
| `bld_kit_ming_north_restaurant` | 酒楼/茶肆 | 12×9 | 736×672 |
| `bld_kit_ming_north_market_stall` | 市场棚 | 3×2 | 256×256 |
| `bld_kit_ming_north_yamen` | 衙门/官署 | 16×13 | 992×640 |
| `bld_kit_ming_north_biaoju` | 镖局/货栈 | 15×12 | 928×608 |
| `bld_kit_ming_north_casino` | 赌场 | 10×8 | 640×512 |
| `bld_kit_ming_north_manor` | 山庄/大院 | 16×13 | 992×768 |
| `bld_kit_ming_north_wangfu` | 王府模块 | 22×18 | 1344×992 |
| `bld_kit_ming_north_temple_hall` | 寺观殿堂 | 14×11 | 864×608 |
| `bld_kit_ming_north_pagoda` | 佛塔地标 | 7×7 | 512×864 |
| `bld_kit_ming_north_guardhouse` | 城门守舍 | 6×5 | 416×320 |
| `bld_kit_ming_north_stable` | 马厩 | 8×6 | 512×352 |
| `bld_kit_ming_north_warehouse` | 仓屋 | 9×7 | 576×512 |
| `bld_kit_ming_north_wharf` | 码头/河埠 | 8×4 | 448×256 |
| `tex_town_ming_north_city_gate__k4_r000_v01` | city_gate | 8×4 | 463×416 |
| `tex_town_ming_north_city_gate__k6_r000_v01` | city_gate | 10×4 | 531×467 |
| `tex_town_ming_north_wall__brick_r000_v01` | wall | 1×1 | 90×179 |
| `tex_town_ming_north_wall_corner__outer_ne_v01` | wall_corner | 2×2 | 154×193 |
| `tex_town_ming_north_bridge_deck__w3_l5_r000_v01` | bridge_deck | 3×5 | 284×171 |
| `tex_town_ming_north_tree_cluster__guohuai_v01` | tree_cluster | 3×3 | 282×256 |
| `tex_town_ming_north_tree_cluster__cebai_v01` | tree_cluster | 3×3 | 218×293 |

来源清单（本续作于2026-09-30重新联网检索并逐URL取得HTTP 200；只取文字形制依据，网页照片未输入模型）：

- [北京政府《北京传统民居——老北京四合院》](https://www.beijing.gov.cn/tsbj/sxym/202007/t20200713_1946380.html)：正房、倒座、厢房合院母题；不据近现代案例断言明代全部细节。
- [北京政府《本市明确二环路以内老城房屋修缮标准》](https://www.beijing.gov.cn/zhengce/zcjd/202004/t20200426_1882617.html)：传统木门窗、合瓦/筒瓦与避免“南装北饰”；现代规范不作明代断代证据。
- [北京政府《万寿寺修缮见闻之屋顶形式（上）》](https://www.beijing.gov.cn/renwen/sy/whkb/201810/t20181009_1864550.html)：硬山屋檐不出左右山墙的形态定义；不据清代实例倒推全部明代民居。
- [北京文物局《【回眸国保一甲子】之智化寺》](https://wwj.beijing.gov.cn/bjww/362760/362767/2021nwhhzrycr/wwbh/10998901/index.html)：明代木构、梁枋彩画与黑琉璃寺殿意象。
- [北京文物局《慈寿寺塔》](https://wwj.beijing.gov.cn/bjww/362771/362779/dqpqgzdwwbhdw/523526/index.html)：明代八角密檐实心砖塔母题；成品未照搬层数、实高或具名身份。
- [故宫博物院院刊《试论明代藩王所用建筑琉璃的烧造、使用与组织管理》](https://www.dpm.org.cn/journal/371479.html?_list=1)：青琉璃因地方原料呈蓝绿差异；深绿为本模块原创选择，非所有明王府统一颜色。
- [北京文物局《明北京城城墙遗存》](https://wwj.beijing.gov.cn/bjww/362771/362779/dqpqgzdwwbhdw/523514/index.html)：砖包外墙、三合土内芯的材质依据，不取历史尺寸。
- [北京文物局《正阳门箭楼箭窗之谜》](https://wwj.beijing.gov.cn/bjww/362760/362770/623138/index.html)：明代瓮城、箭楼与闸楼体系；避用近代改造细节。
- [北京园林绿化局《适宜北京地区节水耐旱植物名录》](https://yllhj.beijing.gov.cn/zwgk/sjfb/mlxx/202204/t20220418_2679549.shtml)：国槐、侧柏适地性；不证明具体明代栽植地点。

画风一致性自评：返修后瓦缝、木纹、砖石颗粒与原图及宋参考接近，保留北方灰砖硬山和官式等级区别；前轮赌场绿桌面候选继续弃用，砖塔保留砖石檐。几何仍有5项失败；铺地修边的内部轴向限制已明示，仍为可审阅候选，非精确拼接金样。

| 地域替换对应 | 本套件处理 |
|---|---|
| 通用19功能槽 | 全部保留，无西域/吐蕃/蒙古式功能替换；商铺可作匿名当铺、大院可作会馆意象，不增玩法ID |
| 宗教地标/寺观、桥、植物 | 八角砖佛塔与北方寺殿；平石桥替木桥；国槐/侧柏替宋套件植物，均为原创组合 |

需作者确认：本轮无新增确认事项；前轮19类占地与功能对应、王府配色、塔式概化、院落精细度及河埠高度仍保留追溯，默认沿用。剩余5项返修属于制作缺口，不推给作者决定；全部保持candidate，不因无人回复转为approved。
