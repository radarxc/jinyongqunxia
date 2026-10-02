# tools/portrait · 角色立绘 → 运行时素材

把立绘 agent 产出的写实全身立绘加工成游戏代码能直接用的素材，规格对齐 `docs/tech/06-asset-storage.md` §5.3–§5.4。

- **输入**：`assets/default/character/<male|female>/<chNN>/`，每目录一份 `manifest.yaml`，立绘为 1024×1536 PNG，背景是浅暖灰底上的淡水墨山水。
- **输出**：`assets/default/portrait/`，由脚本生成，不要手改。

## 产物

每个**基础形象**（ID 不含 `_scene_`）会生成：

| 文件 | 尺寸 | 背景 | 用途 |
|---|---|---|---|
| `<npcId>/<变体>.mid.webp` | 1024×1536 | 透明 | 对话立绘、人物卡大图（tech/06 立绘 mid 档） |
| `<npcId>/<变体>.low.webp` | 768×1152 | 透明 | 低档设备 |
| `<npcId>/<变体>.bust512.webp` / `.bust256.webp` | 1:1 | 透明 | 半身，头顶到腰：人物卡、对话侧栏 |
| `<npcId>/<变体>.ava512.webp` / `.ava256.webp` / `.ava128.webp` | 1:1 | 透明 | 头肩头像：列表、战斗时间轴（tech/06 avatar） |

**剧情场景图**（ID 含 `_scene_`）带原画背景，只出不透明的 `mid` / `low` 两档，当插图用。

编码按 tech/06 §5.3：有损 WebP，`quality 82`，透明图另设 `alpha_quality 90`。原图 PNG 平均 2.7 MB，一个基础形象的 7 个产物合计约 0.2 MB。

## 代码怎么取

- **`manifest.yaml`**：每个人物一行，`id` 就是 NPC ID（如 `npc_xiaofeng`），`file` 指向默认立绘的 mid 档。
  - 默认立绘取最早书界的基础形象，同书界取变体名最短的。
  - 现行构建插件 `apps/game/build/asset-manifest.ts` 会读 `/portrait/` 下清单的 `file`，复制到 `apps/game/public/assets/default/portrait/…`，并写入 `content.assets[npcId].portrait`。人物卡已经在用这个键。
  - 行内还有 `avatar`（头肩 256）、`bust`（半身 512）和该人物的全部 `variants`，方便后续接线。
- **`index.json`**：完整索引，素材键按 tech/06 的 `<kind>/<subject>/<variant>` 写：
  - `portrait/npc_xiaofeng/ch01_prime_gaibang_base` → `{low, mid}`；
  - `avatar/npc_xiaofeng/ch01_prime_gaibang` → `{128, 256, 512}`；
  - `bust/npc_xiaofeng/ch01_prime_gaibang` → `{256, 512}`。

  每档记录 `f`（相对本目录的路径）、`w`、`h`、`b`（字节），另有 `source`（原立绘 ID）、`source_sha256`、`status`、`alpha`。`default` 字段给出每个人物的默认立绘、头像、半身键。按书界 / 年龄 / 状态切换立绘时，从 `index.json` 取对应变体。

## 处理流程

1. **抠图**：用 BiRefNet（rembg 的 `birefnet-general-lite`，本地 CPU，每张约 7 秒）出 alpha。
   - 手持道具（竹棒、拐杖、扫帚）、白须、白花、发丝间透出的底色、浅色衣裙，实测都能正确处理。
   - 试过的其他方案：
     - macOS Vision 的主体 / 人像分割：发丝间会残留白块，人像分割还会把发饰抠掉；
     - 按底色抠图：背景是山水，行不通；
     - 「人像蒙版 + 颜色种子 + 闭式解 alpha」：会误抠白花、白鞋。
2. **去白边**：pymatting 多级前景色估计（`estimate_foreground_ml`），把边缘半透明像素里渗进来的底色反推掉，换任何底色都不出白边。
3. **裁切**：
   - 头顶取「主体宽度 ≥ 30 px」的第一行，避开举过头顶的细长道具；
   - 头部中心取头部带的质心与列范围中点的平均；
   - 方框边长：半身 0.36 × 身高，头肩 0.24 × 身高；
   - 上方留 6%。
4. **缓存**：alpha 按原图 sha256 缓存在 `.agents/coord/portrait_cache/`（不入库）。原图没变且产物齐全的立绘会跳过，立绘 agent 补图或改图后再跑一遍即可。

## 用法

```bash
pip3 install --user "rembg[cpu]" pymatting    # 一次性；首次运行会下载约 224 MB 的 BiRefNet 模型到 ~/.rembg
python3 tools/portrait/build_portraits.py                       # 全量（增量跳过未变的）
python3 tools/portrait/build_portraits.py --only npc_xiaofeng   # 只处理某人
python3 tools/portrait/build_portraits.py --sheet /tmp/ava.jpg  # 另存头像缩略总览，用于目检
```
