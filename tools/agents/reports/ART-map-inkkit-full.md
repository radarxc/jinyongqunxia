# ART-map-inkkit-full 报告 · 大地图 · 水墨贴图集补齐变体（AR-69：小样画法通过，城镇与标记照小景画法；山峰、山脉各 6–8，雪山另出，丘陵 / 湖泊 / 海面 / 平原底纹各 4–6，聚落每级 3–4，标记每种 2–3，关隘 3；透明底；manifest 加 kit 机读字段；过程文件不进 assets/）

## 1. 摘要（3–6 行）

内置image_gen独立生图44次，选41件新变体；道观、驿站、码头首稿构图过近小样，已重新生成；原22件保留，共63件贴图、1张对照表。
每件输入江湖总图、大理基线及同类小样；山峰无原小样，参照已通过的山脉笔墨。保持三级墨、披麻皴、飞白、湿墨渗化、淡赭灰绿与灰青水色，主体内纸感，城镇与标记使用实物小景。
64条均有kit；22件小样除kit外字段、状态和图片不变，新件candidate；过程资料外置，README只末尾追加AR-69节，完整验收通过。
## 2. 产出（文件、行数、主要章节）

`assets/default/map/kit/`新增41件PNG；`manifest.yaml`3522行/64条，逐件完整提示词、来源、SHA与kit；`README.md`104行，末尾「补齐变体（AR-69）」含件数、契约、复核及默认值；`tools/map/kit/full/build_kit.py`304行，入库/安全替换新件/对照表/合同校验。本报告30行。
对照表：`assets/default/map/kit/_contact_sheet.png`，2400×6640，20组分行，品类名与件数、小样在前新件在后，含两基线与浅格/深底预览；manifest的size与sha256已同步。
## 3. 关键结论与数值

小样+新件：山峰0+6=6；山脉1+5=6；雪山1+3=4；丘陵、湖泊、海面各1+3=4；平原与盆地合计2+2=4（两类各2）；大城/州府/县镇/村落每级1+2=3；寺庙/道观/门派/驿站/码头/遗迹每种1+1=2；关隘1+2=3；河流、道路4+0=4；合计22+41=63，另1表=64。
新增8件1024方图、33件512方图，完整画幅缩至round(边长×0.9)=922/461像素后居中透明补边；山脉四走向、大中体量，山峰大中小与单双峰/峰丛，湖型四种、关隘三类。anchor取alpha≥32主体包围盒底边中点按宽高归一；对照表kind=contact，拼合须排除role: contact_sheet。
## 4. 开放问题（附默认值）

雪山数量未另定，默认4件（允许4–6）；新件逐件取舍默认candidate。具体年代建筑形制（待考），默认通用概念；GIS落位、融合参数与小尺寸辨识（待实测），默认由TOOL-map-compose先做样区验证。图像后端未披露，不猜测型号。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；只新增map_kit/ico_map_kit资源变体，不新增或重定义玩法、地点与年代ID。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

`assets/README.md`manifest字段：登记kit及sample/variant/contact_sheet角色；`docs/design/19-world-map.md`§7：引用AR-69小景贴图与契约；TOOL-map-compose取件接口：按kit.kind取63件、消费volume/orient/anchor并排除对照表；TOOL-assets-logs-cleanup：统一搬走旧build_review.py与原过程文件，本轮保持它们原样。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ 指定输入、基线与小样已读/目检；各类达下限，四级聚落与六标记为实物小景；同类轮廓/布局不同，贴图无可见文字、现代元素或水印；44次独立生成，无代码派生变体。
✅ `python3 tools/agents/check_assets.py assets/default/map/kit --min 64 --max 120 --min-side 512`退出0：64张、64条、0问题；`python3 tools/map/kit/full/build_kit.py check`退出0：RGBA、四角/全外缘alpha=0、半透明笔触、SHA唯一、kit与ID一致、数量、目录白名单及原文件保留均通过。
✅ 来源逐像素审计通过：41件最终PNG等于独立RGBA原图完整画幅90%缩放+透明补边；小样字段/状态/图片、基线、原过程文件SHA及README原文快照核对通过；git diff --check通过，只写授权路径，无改仓状态git命令、无临时整仓检出。
✅ 提示词、44条生成记录、3条弃稿记录、快照与校验日志保存在`/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_asset_logs/assets/default/map/kit/full/`，未新增assets过程文件；新件取舍及GIS/真机验证仍按第4节默认值交下游。
