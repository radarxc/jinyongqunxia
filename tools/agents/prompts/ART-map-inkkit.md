# 本任务：大地图 · 水墨贴图集小样：照作者已审基线（江湖总图、大理）出一套透明底水墨贴图小样，并拼成对照表，供作者过目（作者 AR-68 第 2 步；本轮只出小样）

本任务出图。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- `docs/decisions/author-requirements.md` 的 AR-68；
- 作者已审基线：`assets/default/baseline/map/ref_map_jianghu__ch01_base01.png`（江湖总图）、`assets/default/baseline/map/ref_map_dali__ch01_base01.png`（大理）；
- `docs/design/19-world-map.md` §7 水墨视觉规范；
- `assets/README.md`：manifest 字段。

## 要做的事

1. 照两张基线的笔墨、设色、纸感，出**透明底**水墨贴图小样，每个品类 1–2 件：
   - 地形：
     - 山峰与山脉，多体量、多走向，含雪山；
     - 丘陵；
     - 湖泊与海面晕染；
     - 盆地平原底纹；
     - 河流笔触样本、道路笔触样本；
     - 关隘。
   - 聚落四级：大城、州府、县镇、村落。
   - 标记：寺庙、道观、门派、驿站、码头、遗迹。
2. 规格：
   - PNG RGBA，真透明，四角 alpha 为 0；
   - 边长 512 或 1024，按体量定；
   - 无文字、无现代元素、无水印。
3. 产物放 `assets/default/map/kit/`，写 `manifest.yaml`，`status: candidate`（check_assets 只认 approved / candidate / rejected；作者过目前一律 candidate）。
4. 把全部小样拼成一张对照表 `assets/default/map/kit/_contact_sheet.png`，按品类分行、标品类名，供协调者转作者过目。
5. **本轮只出小样，不补齐全套**：作者通过后另起任务补齐。

## 约束

- 写集：`assets/default/map/kit/**`。写集外的改动在提交时会被丢弃。
- 不改基线与已有素材。

检查：
- `python3 tools/agents/check_assets.py assets/default/map/kit --min 20 --max 60 --min-side 512`
- 对照表存在，且所有 PNG 都是 RGBA 真透明

## 报告

≤ 30 行，写清：
- 品类清单与件数；
- 与基线对照的要点；
- 对照表路径；
- 作者要拍板的点（附默认值）。
