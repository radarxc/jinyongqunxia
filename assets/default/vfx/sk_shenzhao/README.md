# 神照经 · 三招特效候选

| 项 | 内容 |
|---|---|
| 归属 | design/23 制作契约的素材实例；不定义玩法 |
| 上游 | catalog/skills-kangxi §3.1；design/23 §2–6；STYLE.md 招式行；本任务作者要求 |
| 引用而不重定义 | 射程、支援与锁血 → 图鉴 / design/06 / design/09；合成公式 → design/23 §4 |
| 标注约定 | 造型（原创扩展）；书证（待考）；真机（待实测）；版面尺度【建议值】 |

## 结论先行（TL;DR）

三招均为 `harmony / inner / projection:false`。吐纳与护命是自身局部气息，续脉是距离 1 的单体支援；所有图形只表现运劲，不产生攻击、命中格、追加治疗或无限复苏。
生成白底图、切帧、合成和 Three.js 播放均已交付；每招入口见下表，状态统一为 `candidate`。

| 招式 | 效果套 | 演示 | 峰值 | 长度 / 节奏 |
|---|---|---|---|---|
| 神照吐纳 `mv_shenzhao_tuna` | family | [demo](moves/mv_shenzhao_tuna/demo.html) | [peak](moves/mv_shenzhao_tuna/peak.png) | 288 px / pulse 0.60 s |
| 神照护命 `mv_shenzhao_huming` | 独有护命气环 | [demo](moves/mv_shenzhao_huming/demo.html) | [peak](moves/mv_shenzhao_huming/peak.png) | 384 px / wave 0.90 s |
| 续脉 `mv_shenzhao_xumai` | 独有接续气流 | [demo](moves/mv_shenzhao_xumai/demo.html) | [peak](moves/mv_shenzhao_xumai/peak.png) | 384 px / wave 0.90 s |

## 原料、造型与测量

三张入选原件均由内置 `image_gen` 生成，1536×1024 白底四帧，逐字节保留为各效果目录的 `source_sheet.png`。家族 1 候选选 1；两绝招各 2 候选选第 2 张，首张因白亮芯抠成孔洞淘汰。完整初始提示词、修订提示词和原始保存位置见 [source_requests.json](source_requests.json)，manifest 另存来源哈希。底层图像模型名和推理强度未由工具返回，不猜填。

淡金来自任务规定的调和配色。回环气息、双层护命气环与护住的金色内息、交织接续的丝状金流均为**（原创扩展）**，不是原著颜色或招式描写。武学归属仅引用图鉴的《连城诀》丁典、狄云神照经；疗伤、复苏与传承原委按三联 / 广州修订版逐字复核**（待考）**，未编引文与回目。

| 效果套 | 切格尺寸 / 左上坐标顺序 | 四帧根部锚点 | 参考长 / 根宽 |
|---|---|---|---|
| family | 768×512；(0,0)、(768,0)、(0,512)、(768,512) | (120,249)、(120,249)、(120,234)、(120,234) | 616 / 221 px |
| mv_shenzhao_huming | 768×500；(0,0)、(768,0)、(0,500)、(768,500) | (128,250)、(128,250)、(128,246)、(128,246) | 600 / 389 px |
| mv_shenzhao_xumai | 768×512；(0,0)、(768,0)、(0,512)、(768,512) | (140,250)、(140,254)、(140,250)、(140,249) | 585 / 313 px |

按图中气流分岔处定位根部，逐帧锚点消除源图位移，再由播放器对齐。参考长按第 3 帧最右可见色点的半开边界减根部 x：`736−120=616`、`728−128=600`、`725−140=585`。根宽取该帧根部列 `min(R,G,B)<250` 的可见包络：`343−122=221`、`427−38=389`、`405−92=313`，包含淡墨而非仅取亮芯。

护命下排长根靠近原 512 px 分界，故按 500 px 显式裁格，保全图形且不重叠；仅舍弃整张最下 24 px 空白。最小源边距为家族 32、护命 16、续脉 31 px：后两项低于 32 px 建议，8 px 边框均无残留、形体完整。锚点校正前家族最大根部位移 15 px，超过 2 px 建议；已按实图记录而非强填统一锚点，连续播放仍需浏览器复核。

## 合成、时序与复现

仅引用 `../emitters/palm/emitter-plate.yaml` 与其原 PNG；不复制发出方。共享发出点 (850,704)、方向 [1,0]、发劲宽 320 px 保持原样。三招统一 E=(640,540)、θ=0°、1536×1024 画幅、深墨底 `#4A433C`、`screen` 混合。`emitter_scale=0.6` 得掌面截面 `W=320×0.6=192 px`。

局部尺寸【建议值】：吐纳 `1.5W=288`，护命 `2W=384`；两者 `range_hex=0` 且显式正 `length_px`，沿用 design/23 §4.2 自指气场约定。续脉以 `1 格×384 px/格=384 px` 示意短距支援。`scale=[1,1]`；`sx=L/参考长`，`sy=192/根宽`。这些版面值不回写玩法射程，不套用外放展幅档位。

普通招沿用 pulse：`0.10+0.15+0.25+0.10=0.60 s`；绝招沿用 wave：`0.15+0.20+0.40+0.15=0.90 s`。相位分别为 `[0,1/6,5/12,1]`、`[0,1/6,7/18,1]`，第 3 帧精确对应 `(c+r)/T`。采用根部对齐 crossfade、`scale_from=0.95`、零漂移与 0.08 软边方向遮罩；不换算 CT、不新增伤害段。

从仓库根目录执行；切帧只在源图或参数变化时重跑：

```sh
export PYTHONDONTWRITEBYTECODE=1
suite=assets/default/vfx/sk_shenzhao
for effect in family mv_shenzhao_huming mv_shenzhao_xumai; do
  python3 tools/vfx/cut_frames.py --config "$suite/effect/$effect/effect-set.yaml" --output "$suite/effect/$effect/effect-set.yaml" --root "$suite"
done
for move in mv_shenzhao_tuna mv_shenzhao_huming mv_shenzhao_xumai; do
  python3 tools/vfx/compose.py "$suite/moves/$move/composition.yaml" --root assets/default/vfx
  python3 tools/vfx/build_demo.py "$suite/moves/$move/composition.yaml" --root assets/default/vfx
done
python3 tools/vfx/check_skill_suite.py "$suite" --catalog docs/design/catalog/skills-kangxi.md
python3 tools/agents/check_assets.py "$suite" --min 1 --max 60 --min-side 256
python3 tools/lint/check_ids.py --strict
```

`quality.json` 保留切帧指标；黑 / 灰 / 白检查图已逐张查看，未作为最终素材保留，可用 `--preview` 重建。演示由既有工具输出，唯一显式外链是指定 Three.js r186 importmap；控件、贴图与播放器内嵌。静态门禁与几何记录见 [validation.json](validation.json)，不代表 WebGL 已实跑。修改源图、YAML 或重建派生物后需更新 manifest 大小和哈希。

## 参考资料

- [神照经武学卡](../../../../docs/design/catalog/skills-kangxi.md)：§3.1。
- [特效管线](../../../../docs/design/23-projection-vfx-pipeline.md)：§2–6。
- [工具用法](../../../../tools/vfx/README.md)；[素材登记](../../../README.md)；[风格](../../STYLE.md)。

## 本文新增术语/约定

仅登记六个资产 ID：`vfx_sk_shenzhao__family_base01`、`vfx_sk_shenzhao__huming_base01`、`vfx_sk_shenzhao__xumai_base01`，以及三招 `vfx_<mv_id>__base01`。不新增玩法 ID；`composition.json` 是 YAML 的展开派生文件。

## 待决事项 / 依赖

- 作者审美审批：默认三套金色造型与所有条目保持 `candidate`，不以检查通过代替批准。
- 局部尺寸与方向：默认沿用本页数值；运行时改挂真实掌面 / 躯干挂点，自身气场与治疗支援的含义仍由上游决定。
- 浏览器 / 真机**（待实测）**：本轮未实跑 WebGL；连续过渡、移动设备、CDN 可达性与模块依赖、纸底 screen 观感交下游。保留源图边距与根部位移限制，不用量化白边指标代替视觉复核。
- 原著**（待考）**：核对《连城诀》丁典、狄云疗伤复苏与传承文字；默认全部可见金色和招名意象为原创，不等候考据阻塞资产交付。
- 工具及绑定：现有生成器仍使用“外放样例 / 外放招式预览”文案，bindings 的 inner 发出方为 null；本套按任务引用 palm，需协调者统一展示名称与接入规则，本任务未改工具或绑定。
