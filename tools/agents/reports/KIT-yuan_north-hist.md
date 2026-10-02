# KIT-yuan_north-hist 报告 · 建筑套件 · 元 · 北方套件 · 按历史图片参考重出（强历史细节）
## 1. 摘要（3–6 行）

- 套件仍为19张建筑、7张贴片，ID、类型、占地与入口登记全部保留，26件均为 `candidate`。
- 第6次运行仅重出审核点名的护运行货栈、博戏堂、市场棚、酒楼、王府、仓屋六张；其余13张建筑与7张贴片相对返修起点逐字节不动。
- 六类各用2张经 `view_image` 确认可辨构造的影像作真实生成输入；共生成9个候选并选6个，入选源、完整候选链与回执已原位更新。
- 六张均为真RGBA、四边alpha最大值0；三条指定检查均通过。

## 2. 产出（文件、行数、主要章节）

| 路径 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| `assets/default/building-map/yuan_north/` | 19 PNG；manifest 2575行 | 六张成品与对应六块manifest更新；尺寸/SHA、prompt、有效参考和像素QA |
| 同目录 `sources/historical-20261001/` | 19源PNG + 19 JSON | 仅更新六组入选源/回执；逐图URL、取用细节、输入SHA及规格化过程 |
| `assets/default/tile/yuan_north/` | 7 PNG；manifest 767行 | 本轮未改；保留已通过的门、墙、桥、两树 |
| `assets/default/prompts/building-map.md` / `tile.md` | 1125 / 722行 | 前者局部补六项返修历史细节；后者本轮未改 |

## 3. 关键结论与数值

- 数量：19建筑 + 7贴片 = 26；建筑manifest登记候选总数23。本轮 `1+1+2+2+1+2=9` 个候选，六张各选一。
- 规格：建筑画布384×320至1248×864，贴片256×320至576×512；所有短边满足256/32px门禁。
- 生成：六类使用 `gpt-image-2`、透明背景；每次真实输入2张有效历史影像，首候选另以旧图锁构图。源图仅做alpha≤2清零、alpha裁边、等比LANCZOS缩放与透明扩边，未warp。
- 历史性：货栈/仓屋取姬氏民居，博戏堂/市场棚取可辨街市画与元代界画，酒楼取可辨楼店画与元代界画，王府取永乐宫元构照片；均为形制类比的 **（原创扩展）**。
- 占地未改；本轮未重测26件底面/根点，`anchor_px`只是旧锚归一映射代理，严格2:1、门洞、接缝、遮挡和场景拼装仍 **（待实测）**。

## 4. 开放问题（附默认值）

- 六张返修图是否升为正式素材：默认保持 `candidate`；其构造证据已补齐，但不宣称逐尺度文物复原，待场景拼装和作者审美验收后再升 `approved`。
- 普通民居、铺面、市场棚、护运行货栈等元代专属细部 **（待考）**：默认采用克制北方土木建筑母题，不把玩法建筑命名或形制写成史实。
- 锚点、严格投影、门墙接口、桥遮挡和四向：默认仅供当前r000静态试贴，未实测前不升 `approved`，不旋转单图冒充四向。
- 国槐/侧柏在具体元代城市场景中的栽植 **（待考）**：默认作为地域植物意象保留。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。本任务只覆盖既有素材及其追溯元数据，不修改Canon、玩法ID、类型或占地。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 需同步内容（本任务未改） |
|---|---|
| `design/22` / town装配验收 | 对26件重新量取底面/根点，验证2:1轴线、锚点、门洞净宽、直墙/转角接缝、桥遮挡与四向；当前manifest明确为代理锚点 |
| 后续资产审美审校 | 复核本轮六张与参考的屋顶、瓦作、木构、门窗和墙材对应；六类功能均为原创扩展，不把形制类比写成具名遗址复原 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 范围：本轮只写六张点名建筑及其六组 source、manifest 六块、building-map prompt对应小节和本报告；13张未点名建筑与全部贴片经返修起点快照核对逐字节不动。`tile.md` 是本轮启动前已存在的并行/续作内容，本轮未写。未改工具、任务清单或其他套件，未执行改变仓库状态的git命令。
- ✅ 身份/占地：19+7个既有ID、`building.type` / `tile.kind`、footprint及entrance全部保留；无新玩法ID。
- ✅ 像素/元数据：26/26 RGBA、alpha 0–255、边缘alpha=0；manifest尺寸/SHA与磁盘一致，完整prompt、模型、生成ID、候选数与来源均已登记。
- ✅ 护运行货栈（1选1，**原创扩展**）：[姬氏民居院落](http://sx.people.com.cn/NMediaFile/2021/1025/LOCAL202110251056000479181413354.png)与[正立面](http://sx.people.com.cn/NMediaFile/2021/1025/LOCAL202110251103000545126112312.png)均为真实输入；取低举折硬山灰筒板瓦、圆椽头、土墙/灰砖裙、粗木柱枋、厚板门与方格窗。
- ✅ 博戏堂（1选1，**原创扩展**）：[《清明上河图》可辨铺面局部](https://img.jiguzuo.com/guohua/changjuan/202511/9cadde09ad1fbfdb0a0a44f4e0679383.jpg)与[王振鹏界画06](https://www.shuge.org/wp-content/uploads/2026/06/long_chi_jing_du_tu_juan06-1500x1133.jpg)均为真实输入；取开放柜台/板门、柱网、瓦垄、榫接、疏朗斗拱和低台基。
- ✅ 市场棚（2选第2，**原创扩展**）：同上两图均为两候选真实输入；取棚架尺度、开放木柱、瓦垄、横梁榫接与疏朗承托，第二候选去除整块铺地，使柱脚直落透明底。
- ✅ 酒楼（2选第2，**原创扩展**）：[《清明上河图》可辨楼店局部](https://img.jiguzuo.com/guohua/changjuan/202511/afe2d555092873a14e7840d910a2f34a.jpg)与[王振鹏界画08](https://www.shuge.org/wp-content/uploads/2026/06/long_chi_jing_du_tu_juan08-1500x1133.jpg)均为两候选真实输入；取两层柱网、密直棂窗、直栏杆、挑廊、分层灰瓦檐与低石脚，第二候选补足透明边。
- ✅ 王府（1选1，**原创扩展**且非具名王府复原）：[永乐宫正立面](https://www.sxrcylg.cn/uploads/allimg/210901/1-210Z1100033b4.jpg)与[屋面近照](https://www.sxrcylg.cn/uploads/allimg/210901/1-210Z1100222V1.jpg)均为真实输入；取五间柱网、格扇、石台基、灰筒板瓦、克制鸱吻、疏朗斗拱与低饱和彩画。
- ✅ 仓屋（2选第2，**原创扩展**）：同上姬氏民居两图均为两候选真实输入；取长条低举折硬山、灰筒板瓦/圆椽头、土墙、灰砖防潮裙、厚板双门与高位小格窗，第二候选去除铺地、草和杂物。
- ✅ 官署（2选第2，本轮未改）：[霍州州署正立面](https://dimg04.c-ctrip.com/images/0103i120008siudt1F3FB_W_1200_0_Q90.jpg?proc=autoorient)、[旧照](https://s9.sinaimg.cn/bmiddle/001m77tDgy6Fpb9H13258&690)、[梁架](https://s3.sinaimg.cn/bmiddle/001m77tDgy6FpbarrFwa2&690)；取五间悬山、卷棚抱厦、灰瓦、柱列/月台、梁檩椽与疏朗斗拱。
- ✅ 寺殿（1选1，本轮未改）：[永乐宫正立面](https://www.sxrcylg.cn/uploads/allimg/210901/1-210Z1100033b4.jpg)、[屋面](https://www.sxrcylg.cn/uploads/allimg/210901/1-210Z1100222V1.jpg)、[阑额](https://www.sxrcylg.cn/uploads/allimg/20230927/1-23092G0013B04.jpg)；取单檐庑殿、筒板瓦/脊吻、柱网格扇、高台基、阑额木作与克制彩绘。
- ✅ 大/小民居（各1选1，本轮未改）：[姬氏民居](http://sx.people.com.cn/n2/2021/1025/c189153-34972542.html)院落、立面与近照；取低缓硬山灰瓦、圆椽头、梁柱、板门格窗、砖墙/砖脚、柱础与石阶。
- ✅ 单/双层铺（各1选1，本轮未改）：[街市铺面](https://img.jiguzuo.com/guohua/changjuan/202511/9cadde09ad1fbfdb0a0a44f4e0679383.jpg)、[楼店](https://img.jiguzuo.com/guohua/changjuan/202511/afe2d555092873a14e7840d910a2f34a.jpg)、[元画06](https://www.shuge.org/wp-content/uploads/2026/06/long_chi_jing_du_tu_juan06-1500x1133.jpg)、[元画08](https://www.shuge.org/wp-content/uploads/2026/06/long_chi_jing_du_tu_juan08-1500x1133.jpg)；取铺面开间、柜台/板门、柱网、格窗、栏杆、灰瓦与斗拱。
- ⚠️ 院落/守舍（各1选1，本轮未改）：[王振鹏图卷](https://www.shuge.org/view/long_chi_jing_du_tu_juan/)05–08仅05/06/08可辨楼台、柱廊、屋面或桥岸层级，不能证明具体功能；成品取正翼房/影壁与硬山门屋/粗柱枋。
- ⚠️ 客栈/山庄（各1选1，本轮未改）：同一[图卷](https://www.shuge.org/view/long_chi_jing_du_tu_juan/)仅05/06可辨楼台和层级，01/02无建筑证据；成品取二层木廊/侧院与双院/五间主厅，功能均为原创扩展。
- ✅ 白塔（1选1，本轮未改）：[妙应寺白塔](https://commons.wikimedia.org/wiki/File:20090528_Beijing_White_Dagoba_8092.jpg)支持覆钵体、台座、十三天、华盖与刹顶；误配佛像图明确未取用。
- ✅ 马厩（1选1，本轮未改）：[姬氏民居](http://sx.people.com.cn/n2/2021/1025/c189153-34972542.html)两图支持硬山灰瓦、土墙砖裙和木门窗；开敞柱间、檩椽与槽枥为原创组合。
- ⚠️ 河埠（1选1，本轮未改）：[万宁桥](https://commons.wikimedia.org/wiki/File:Wanning_Bridge_1.jpg)仅支持石券、铺石和低栏材料母题；石阶、计数房和木吊架为原创组合，王振鹏12题跋未取用。
- ✅ 贴片类（7类）：k4门[云台北券门](https://commons.wikimedia.org/wiki/File:Yuntai_north_entrance.jpg)＋[元大都遗址01](https://commons.wikimedia.org/wiki/File:%E5%85%83%E5%A4%A7%E9%83%BD%E5%9F%8E%E5%9E%A3%E9%81%97%E5%9D%80_-_Yuan_Dynasty_City_Wall_Relics_-_2015.09_-_panoramio.jpg)（石券/土城语境；夯土墩/灰瓦门屋，1）；k6门[云台北侧](https://commons.wikimedia.org/wiki/File:Yuntai_north_side.jpg)＋[元大都遗址02](https://commons.wikimedia.org/wiki/File:East_View_of_the_West_Gate_of_Beijing_Yuandadu_Site_Park.jpg)（石砌侧面/遗址语境；宽门洞/土墩/木门屋，1）；直墙[遗址01/02](https://commons.wikimedia.org/wiki/File:%E5%85%83%E5%A4%A7%E9%83%BD%E5%9F%8E%E5%9E%A3%E9%81%97%E5%9D%80_-_Yuan_Dynasty_City_Wall_Relics_-_2015.09_-_panoramio.jpg)（远景弱；水平版筑层/裸土顶，2选第2）；墙角[遗址02/03](https://commons.wikimedia.org/wiki/File:%E5%85%83%E5%A4%A7%E9%83%BD%E5%9F%8E%E5%9E%A3%E9%81%97%E5%9D%80%E5%85%AC%E5%9B%AD_-_Yuan_Dynasty_City_Wall_Relics_Park_-_2012.05_-_panoramio.jpg)（公园照弱；连续层理/L形阴角，2选第2）；桥[万宁桥](https://commons.wikimedia.org/wiki/File:Wanning_Bridge_1.jpg)＋[卢沟桥](https://commons.wikimedia.org/wiki/File:Marco_Polo_bridge_Beijing.jpg)（券石/铺石/低栏；单孔透明拱，1）；国槐[北京古树](https://yllhj.beijing.gov.cn/ztxx/lhysh/sh/202112/t20211214_2560949.shtml)两图（老干/疏朗阔冠，2选第2）；侧柏[大觉寺柏树](https://wwj.beijing.gov.cn/bjww/362760/362770/428610/index.html)及古树页（扭曲老干/窄冠/鳞叶枝片，2选第2）。
- ✅ 城门（本轮未改）：k4/k6沿用审核通过结论，可由居庸关云台参考核对石券洞、券面雕饰和块石砌筑；成品另有夯土墩、灰瓦门屋和格窗。
- ✅ 下载：本轮六类各成功取得2张可辨构造建筑影像，无下载失败类型；题跋、印章、表格、空白页及59px全卷缩略图均未计作这六类的有效参考。
- ✅ 目检：8张去重参考（六类共12个输入引用）、6张入选原图与6张规格化成品均已 `view_image`；每件成品至少可核对屋顶/瓦作/构架或斗拱/门窗/墙材中的三项，且无文字、伪字、水印、人物、现代物、厚地台或裁边。
- ✅ 作者确认：无；默认保持 `candidate`，待严格2:1与场景接口实测。
- ✅ 强制检查：建筑 `19张/19条/0问题`；贴片 `7张/7条/0问题`；`check_ids.py --strict` 通过（仅项目既有允许基线提示，无本任务新增失败）。
