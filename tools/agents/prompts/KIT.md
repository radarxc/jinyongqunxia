# 本任务：城镇建筑套件「{{kit_name}}」（`{{kit_id}}`）· 地图拼接建筑单体与年代墙门贴片

本任务生成图片素材并登记，不改策划 / 技术文档。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景与基线

城镇由代码总装：布局坐标 → 贴片底图 → 按坐标贴 45 度建筑单体。已通过的宋套件是本任务的规格与画风基线：`assets/default/baseline/building-map/`（大理 19 张、临安 19 张，`manifest.yaml` 的 `building: {type, footprint, anchor, era}` 字段）、贴片 `assets/default/baseline/tile/`（城门 / 墙件 / 桥 / 植物的登记方式）、模板 `assets/default/prompts/building-map.md`、`tile.md`；总装结果 `assets/default/baseline/town/`（看它们怎么被贴上去）。设计 `docs/design/22-town-layout-and-generation.md` §2（按年代的布局规则）、§3.4（元 / 明 / 清初骨架的 type 与占地）、§4.3（墙门贴片契约），风格 `assets/default/STYLE.md`（城镇 / 建筑写实古风、符合年代）。

作者原话：「建筑分两种， 一种是类似立绘，另一种是要拼到城市地图上，第二种要45度」「贴片就是一些素材，四五十个差不多就行了」。

## 本套件

- 年代 / 地域：{{era_desc}}；参考城市：{{ref_cities}}。
- 建筑类型（每类 1 张，`type` 按 design/22 §3.4 的骨架 ID 或本套件同构命名 `bld_kit_{{kit_id}}_<type>`，占地按骨架表）：民居（大 / 小 2 种）、院落、商铺（单层 / 两层）、客栈、酒楼 / 茶肆、市场棚、衙门 / 官署、镖局 / 货栈、赌场、山庄 / 大院、王府 / 宫殿模块、寺观殿堂、塔 / 宗教地标（按地域：佛塔 / 道观 / 清真寺 / 藏式佛殿）、城门守舍、马厩、仓屋、码头 / 河埠——共 18–20 张；地域套件（西域 / 吐蕃 / 蒙古营地）按当地建筑类型替换同功能项，报告写明对应关系。
- 贴片：本年代 / 地域的城门 2 座（净宽 4、6 格）、城墙直段 1、转角 1、桥 1（若地域有）、本地植物 2 种，放 `assets/default/tile/{{kit_id}}/`。

## 要做的事

1. 读上述基线与设计；联网搜索本年代 / 地域的建筑形制（屋顶、墙体、门窗、彩画、塔式、城门形制），来源登记进报告（标题 + URL + 取用了什么）。
   **历史图片参考（作者 2026-09-30 原话：「建筑套件和城市在生成时搜一下历史图片作为参考」）**：每类建筑搜 1–3 张历史图片——遗址 / 现存古建照片、考古复原图、古画 / 舆图里的建筑、博物馆模型照片（优先 Wikimedia Commons、博物馆 / 考古所官网、学术页面）；本任务沙箱已放开网络，用 `curl -L -o refs/<name>.<ext> <url>` 下载到工作区 `refs/`（写集外，不入库），`view_image` 看过后作为 `image_gen` 的参考输入（只取形制、比例、材质、屋顶样式，不复制整图构图，不用影视 / 游戏截图）。每张成品的 manifest `references` 登记用到的参考（URL + 用途）；下载失败（403 等）就只用文字记载，报告写明。
2. `image_gen` 逐张出图：斜 45°、俯仰 30°、2:1，透明底真 RGBA，光源左上、阴影右下，占地底边清楚，锚点底面中心；画风与宋套件一致（写实古风、同一细节密度），只换年代 / 地域特征。每张 `view_image` 自查；最多 2 候选选 1。
3. 规格化（PIL 纯几何：裁切、等比缩放、修边），入库 `assets/default/building-map/{{kit_id}}/`，`manifest.yaml` 每张一条（字段按 `assets/README.md` + `building: {type, footprint, anchor, era}`），`status: candidate`；贴片同理入 `assets/default/tile/{{kit_id}}/`（`tile: {kind, footprint, variant, autotile_mask}`）。
4. 在 `assets/default/prompts/building-map.md`、`tile.md` 各加一节本套件的年代要点与提示词差异。

约束：不改宋套件文件；不改 `tools/town/`；每次写入 ≤ 150 行；报告 ≤ 100 行。

检查：以下命令必须全部通过。
- `python3 tools/agents/check_assets.py assets/default/building-map/{{kit_id}} --min 18 --max 22 --min-side 256`
- `python3 tools/agents/check_assets.py assets/default/tile/{{kit_id}} --min 5 --max 10 --min-side 32`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：清单（ID / 类型 / 占地 / 尺寸）、来源清单、与宋套件的画风一致性自评、地域替换对应表、需作者确认的事项（默认沿用）。
