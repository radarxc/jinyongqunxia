# ART-map-inkkit 报告 · 大地图 · 水墨贴图集小样（地形 / 聚落四级 / 标记，透明底，照江湖总图与大理基线；拼对照表交作者过目；AR-68 第 2 步）

## 1. 摘要（3–6 行）

续作保留已有22件透明水墨小样和对照表，未重生成或改动图片；23条状态改为candidate，新增review_stage: draft保留待审草稿语义。
每件均以江湖总图、大理两张approved基线为风格输入；细墨皴擦、淡赭、灰绿和灰青水色相衔接，纸纹只留主体内部。
对照表按九类分行标名，并列两张基线，附浅格/深底叠放预览；显式--max 23校验通过，原验收命令上下限冲突尚需协调者修正。
## 2. 产出（文件、行数、主要章节）

`assets/default/map/kit/`：22件PNG；`_contact_sheet.png`（2400×3780，保持原图）；manifest 1056行（23条）；README 62行（状态/复核/依赖）；prompts 27行、generation 22行、validation 23行；build_review.py 219行；check_assets.log 2行、check_assets_explicit_max.log 1行。本报告28行。
## 3. 关键结论与数值

山峰/山脉2（东西长岭、斜向雪岭）+丘陵1+湖/海2+盆地/平原2+河流2+道路2+关隘1=地形12；大城/州府/县镇/村落各1=4；寺庙/道观/门派/驿站/码头/遗迹各1=6；合计22。10件1024方图、12件512方图；23张PNG均RGBA，四角及全外缘alpha=0，小样全透明像素58.10%–96.22%。
## 4. 开放问题（附默认值）

作者审墨色、水域晕染、四级聚落与标记辨识度；默认保持现图，candidate + review_stage: draft待审。湖岸/关隘及部分标记地景较厚重，道路含地面晕染；默认先审样，生产另画简化版或按GIS遮罩约束。验收命令默认由协调者追加--max 23，保留全部小样。
河/路未做连续曲线与无缝拼接，湖岸非GIS轮廓；默认不得直接充当地理几何。宗教/城郭具体年代形制（待考）、小尺寸辨识与拼合效果（待实测）；图像后端未披露，不猜测型号。
## 5. 对基准的修改提案（编号 / 提案 / 理由）

无；只执行AR-68第2步，新增map_kit/ico_map_kit素材键，不新增玩法或地理ID。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）

调度器ART-map-inkkit验收命令：追加`--max 23`（22件+1表）；`tools/agents/check_assets.py` §main默认max=2导致20–2无解，不能只改素材解决，公共脚本保持原样。`assets/README.md` 字段：可登记review_stage草稿阶段；`docs/design/19-world-map.md` §7：作者审定后引用贴图集、明确聚落四级及GIS铺设约定。均未越权修改。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

✅ 指定输入已读、两张基线及对照表复核；题材齐全、贴图无可见文字/现代元素/水印；只保留小样，23条状态枚举错误已解决（candidate），review_stage: draft表示未批准；完整提示词与来源保留。
✅ `python3 tools/agents/check_assets.py assets/default/map/kit --min 20 --max 23 --min-side 512`退出0（0问题）；`python3 assets/default/map/kit/build_review.py check`退出0（尺寸/字段/SHA/23张真实RGBA/透明四角与外缘/半透明笔触/基线hash）；图片与公共检查器散列未变；git diff --check通过，仅写授权路径，每次补丁≤50行，无改仓状态git命令或临时整仓复制。
⚠️ 必跑原命令`python3 tools/agents/check_assets.py assets/default/map/kit --min 20 --min-side 512`仍退出1：仅剩“图片23张，要求20–2张”1项；未达到原命令全部通过，详见kit/check_assets.log，显式上限通过日志见kit/check_assets_explicit_max.log。作者审批、GIS拼合与真机验证仍待后续。
