# 九阳神功 · 两段式特效候选

| 项 | 内容 |
|---|---|
| 归属 | `design/23` 的制作实例；不新增玩法定义 |
| 上游 | `catalog/skills-yitian` §2.1；作者两段式决定；`assets/default/STYLE.md` 招式行 |
| 引用而不重定义 | 性质、招式范围与绝招标记见图鉴；几何、混合和节奏见 `design/23` §2–6 |
| 标注约定 | 造型（原创扩展）；书证（待考）；浏览器与真机（待实测）；版面参数【建议值】 |

## 结论先行（TL;DR）

4 套白底原料、16 张 RGBA，配三招独立 Composition、峰值与 Three.js 演示。
三招都是绝招、均未标外放。共享掌图仅作运气发出方的制作定位；自身气场不是离体攻击。
全部维持 `candidate`，家族图提供共同造型语汇；本门无普通招，三招各用独有套。

## 原料与原著边界

| 目录 `effect/` 下 | 意象（均为原创扩展） | 生成候选 / 入选 |
|---|---|---|
| `family` | 回卷金气、疏密相生的云气与开放弧线 | 1 / 1 |
| `mv_jiuyang_huti` | 三层回护金弧，圆钝护罩 | 1 / 1 |
| `mv_jiuyang_liaoshang` | 柔和双带与回环，生息疗伤 | 1 / 1 |
| `mv_jiuyang_puzhao` | 中心云气与周向断续金环 | 2 / 2 |

原著依据只引用图鉴关于《九阳真经》传承及张无忌得全本的摘要，不增写引文、回目。
金色来自 `nature:harmony` 与作者调和淡金约定，不能把“九阳”反推成 `yang`。
三招名称的主动演出、云气、金环和可见颜色均是本作表现（原创扩展）；
三联 / 广州修订版《倚天屠龙记》相关护体、疗伤情节及可见颜色有无描写，仍（待考）。
普照离体敌伤依据延续图鉴待考结论，不增加 `projection:true` 或外放扩张档。

每套 `generation.json` 保存实发完整提示词、工具来源、候选链；入选源图逐字节保留。
实际均为 1536×1024，2×2 切为 768×512；不以程序绘制造型。
普照首张因第三格微粒靠近行界淘汰，第二张通过图像编辑缩小主体、增大留白。

## 参数与复现

共同画幅 1536×1024，E=[740,560]，θ=0° 向右，发出方比例 0.6，掌面宽 `320×0.6=192 px`。
图像逐帧局部根部不同，按 EffectSet 显式锚点对齐 E；不自动紧裁。

| 招式 | range_hex | length_px | 几何核算（`scale=[1,1]`） |
|---|---:|---:|---|
| 护体 | 0（自身） | 320 | 局部长度【建议值】`1.25×256`；sx=`320/473`，sy=`192/271` |
| 疗伤 | 1（0–1 内选 1） | 256 | 示意标尺 `1×256`；sx=`256/571`，sy=`192/206` |
| 普照 | 0（自身） | 512 | 局部长度【建议值】`2×256`；sx=`512/267`，sy=`192/130` |

普照的友方圆盘 r3 是作用范围，不是投送距离；512 px 只呈现一幅局部径向气场，不能生成命中格。
护体与疗伤启用方向显隐；普照关闭有向遮罩以保留根部两侧气场，使用同一透明度包络。
三招采用 §5.2 `wave`：`0.15+0.20+0.40+0.15=0.90 s`；峰值 `0.35/0.90=7/18`。
四帧相位 `[0,1/6,7/18,1]`；漂移 0，凝聚缩放 0.95→1，循环间隔 0.4 s；均不换算 CT。
`screen` + 深墨底 `#4A433C` 沿用设计允许值。色键 200 是本批调参值，非通用金色默认；
它让近白柔边转透明，保留深金笔触。黑 / 灰 / 白底预览及质量记录随每套保留。

在仓库根执行以下命令；另两招替换 `mv_jiuyang_huti`，家族仅执行切帧：

```sh
PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/cut_frames.py --config assets/default/vfx/sk_jiuyang/effect/mv_jiuyang_huti/effect-set.yaml --output assets/default/vfx/sk_jiuyang/effect/mv_jiuyang_huti/effect-set.yaml --root assets/default/vfx --preview
PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/compose.py assets/default/vfx/sk_jiuyang/moves/mv_jiuyang_huti/composition.yaml --root assets/default/vfx
PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/build_demo.py assets/default/vfx/sk_jiuyang/moves/mv_jiuyang_huti/composition.yaml --root assets/default/vfx
```

共享依赖仅引用 `../emitters/palm/emitter-plate.yaml` 及其 `source_palm.png`，没有复制或修改。
重建后须刷新 manifest 的派生文件哈希。质量与几何数值见 `verification.json`。

## 参考资料

- `docs/design/catalog/skills-yitian.md` §2.1、AR-16 审计：逐招语义和外放边界。
- `docs/design/23-projection-vfx-pipeline.md` §2–6；`tools/vfx/README.md`：制作和打包入口。
- `assets/default/STYLE.md`、`assets/README.md`：作者美术约定和登记字段。

## 本文新增术语/约定

无新增玩法 ID；仅登记 manifest 所列 7 个 `vfx_` 资产 ID。源图、帧及演示分别追溯哈希。

## 待决事项 / 依赖

- 替下游给出的建议值：自身护体 320 px、普照 512 px；接入人物时按真实躯干 / 掌面挂点调整，默认沿用。
- 本文依赖的上游事实：三招绝招、调和、内功、当前未标外放；既有普照外放待考项保留。
- 对基准的修改提案：无；不改半径、治疗、护盾、伤害或经脉规则。
- 原著考据待办：见“原料与原著边界”；默认按原创演出使用，不宣称原著存在金色光环。
- 开放问题（附默认值）：源图有近白底色，按白阈值 250 去除；家族 / 护体最小有效白边 26 / 15 px，低于 32 px 建议但无触边，默认保留候选。
- 开放问题（附默认值）：原始分格根部存在位移，已用逐帧锚点对齐；连续性与色键后偏饱和的金色待作者审美确认，默认保留候选。
- 开放问题（附默认值）：Three.js 浏览器播放、CDN 可达性、移动端混合与正式人物挂点（待实测）；不以静态门禁代替实机。
