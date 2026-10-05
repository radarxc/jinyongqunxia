# 太玄经 · 五招两段式特效候选

| 项 | 内容 |
|---|---|
| 归属 | `design/23` 制作管线的素材实例，不定义玩法 |
| 上游 | 作者两段式 / Three.js 决定；`assets/default/STYLE.md`；`catalog/skills-xiake-bixue` §2.2 |
| 引用而不重定义 | 性质、绝招、射程和范围 → 图鉴；几何 / 节奏 → `design/23` §2–6；字段 → `design/vfx/schema.yaml` |
| 标注约定 | 造型（原创扩展）；原著逐字核对（待考）；浏览器 / 真机（待实测）；制作参数【建议值】 |

## 结论先行（TL;DR）

四张 image_gen 白底原件，各切四帧；三绝招各用独有套，石壁图意与五岳倒轻式共用家族套。五招均交付 YAML、脚本导出 JSON、峰值 PNG 与 Three.js HTML；状态全部 `candidate`。共用 palm 只相对引用，未复制、重抠或改动。

## 原料与原著边界

图鉴记载《侠客行》侠客岛石室参悟，并已将本作拆招名称标为原创扩展。这里只沿用该摘要；未新增原著引文、回目或发光颜色结论。金色来自 `harmony` 的制作约定，透明水墨气纹、流星笔势、交锋弧与归一涡纹均为**（原创扩展）**。

| 效果目录 | 造型 | 候选数 / 入选 | 参考长 / 根宽（px） |
|---|---|---:|---:|
| `effect/family` | 图意般流转的双股云气，共同语汇 | 1 / 1 | 595 / 294 |
| `effect/mv_taixuan_guiyi` | 多股合入单一涡纹、单束前端 | 1 / 1 | 661 / 236 |
| `effect/mv_taixuan_sada` | 三道连根流星状扇扫 | 2 / 2 | 369 / 111 |
| `effect/mv_taixuan_shibu` | 交叉急劲与前端短弧 | 1 / 1 | 490 / 191 |

原件均为 1536×1024 的 2×2 排列，显式矩形切成 768×512。第三格为峰值参考；参考长取该格可见右界减锚点 x，根宽取该格锚点列的可见纵向包络。实际逐帧锚点见 EffectSet，测量记录见 `verification.json`。候选来源、完整实发提示词及淘汰原因见各目录 `generation.json` / `prompt.txt`；飒沓首候选的提示词另存，原文件路径与哈希可追溯，不参与合成。

## 几何、范围与节奏

以下参数均为独立演示的**【建议值】**。统一画幅 1536×1024、深墨底 `#4A433C`，E=`[600,540]`，方向 0°，标尺 256 px/格；共享掌图的发出点 `[850,704]`、截面 320 px 只消费原 YAML。

`emitter_scale=0.5`，目标根宽 `320×0.5=160 px`。依 `design/23` §4.1：`sx=L/reference_length_px`，`sy=160/root_width_px`，`scale=[1,1]`。四套 sy 依上表为 `160/294`、`160/236`、`160/111`、`160/191`。允许效果素材缩放，掌图本身的原始字节不变。

| 招式 | 绝招 / 外放 | 效果套 | 示意长度核算 | 节奏 / 峰值相位 |
|---|---|---|---|---|
| `mv_taixuan_guiyi` | 是 / 是 | 归一 | 基础最大射程 `2×256=512 px` | wave / 7/18 |
| `mv_taixuan_sada` | 是 / 否 | 飒沓 | 局部近身 `1×256=256 px` | wave / 7/18 |
| `mv_taixuan_shibu` | 是 / 否 | 十步 | 接触阶段 `1×256=256 px` | wave / 7/18 |
| `mv_taixuan_tuyi` | 否 / 否 | 家族 | 近身 `1×256=256 px` | pulse / 5/12 |
| `mv_taixuan_wuyue` | 否 / 是 | 家族 | 基础最大射程 `3×256=768 px` | pulse / 5/12 |

归一的三档 `projectionSpreadSteps` 都是 `aoe_single`，保持单束、根宽 160 px。五岳为 `aoe_line n3/n4/n5`，当前示例选基础 n3，长度覆盖 3 格，横向仍为一条线；n4/n5 不是增加横向宽度。运行时依上游已解算目标与格集合传入长度，不能将 n4/n5 直接当成 `range.max_eff`，也不能从图片推断命中格。本批不伪造 `resolved_preview` 战斗诊断。

十步的 1–3 格属于突进移动，角色位移由动作系统处理，本图只演出接触处气劲；飒沓的 r2/60° 是逻辑扇形模板，本图为近身扇扫意象，屏幕画角不等于逻辑六角角度。多目标表现由上游事件安排；本套不新增弹丸、攻击次数或范围加持。石壁图意使用空手演示，持剑适配仍归图鉴与运行时。

wave=`0.15+0.20+0.40+0.15=0.90 s`；pulse=`0.10+0.15+0.25+0.10=0.60 s`。峰值为 `(凝聚+发出)/总时长`，分别 `0.35/0.90=7/18`、`0.25/0.60=5/12`；不把 recovery CT 换算成秒。方向遮罩宽为 `0.08×L`，逐帧根部对齐，消散位移 0，循环间隔 0.4 s 仅供观看。

## 复现与验证

在仓库根执行；`effect-set.yaml` 中列明全部切帧参数。已有透明帧时无需重切。

```sh
suite=assets/default/vfx/sk_taixuan
for f in "$suite"/effect/*/effect-set.yaml; do
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/cut_frames.py --config "$f" --output "$f" --root "$suite"
done
for c in "$suite"/moves/*/composition.yaml; do
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/compose.py "$c" --root assets/default/vfx
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/build_demo.py "$c" --root assets/default/vfx
done
python3 tools/vfx/check_skill_suite.py "$suite" --catalog docs/design/catalog/skills-xiake-bixue.md
python3 tools/agents/check_assets.py "$suite" --min 1 --max 60 --min-side 256
python3 tools/lint/check_ids.py --strict
```

white_key 的 cutoff=250、key_full=128、dewhite=true。16 帧边框残留 / 残白比均 0，未舍弃像素的白底重建最大误差 `0.725495/255<2/255`。已用 `view_image` 检查四张入选原料、全部黑 / 灰 / 白底联系表及归一、飒沓、五岳峰值；未见白边。联系表为临时质检，检查后删除；`quality.json` 保留原始指标，色键结果不声称还原生成前的真实 alpha。

HTML 均原尺寸无损 WebP 内嵌，唯一显式外链为工具锁定的 Three.js r186 importmap；CDN 可达性、WebGL 实际播放与真机性能未实测。检查记录见 `checks.json`，全帧 / 阶段极值边界与共用掌图哈希见 `verification.json`。

## 参考资料

- [招式卡](../../../../docs/design/catalog/skills-xiake-bixue.md)：§2.2。
- [制作管线](../../../../docs/design/23-projection-vfx-pipeline.md)：§2–6；[工具说明](../../../../tools/vfx/README.md)。
- [共享发出方](../emitters/palm/emitter-plate.yaml)；[资产字段](../../../README.md)；[风格](../../STYLE.md)。

## 本文新增术语/约定

无新增玩法 ID。资产 ID 为 `vfx_sk_taixuan__{family,guiyi,sada,shibu}_base01` 与五个 `vfx_mv_taixuan_*__base01`；花括号仅说明模式，实际 ID 见 manifest。JSON 为工具派生物；原料提示词、候选链与质量数据只作追溯。

## 待决事项 / 依赖

### 替下游给出的建议值

沿用本节列明的 E、256 px/格、0.5 掌图缩放、160 px 根宽与 pulse/wave 模板；实机以真实挂点、投影目标和表现队列时间替换。

### 本文依赖的上游事实

图鉴的 grade 12 / harmony / inner、三绝招两外放、三档范围与招式命名；共享掌图原件；现有工具和 r186 版本约定。独立演示的 palm 不改变运行时 `bindings.yaml` 的 inner / emitter:null 语义。

### 对基准的修改提案

无。

### 原著考据待办

三联 / 广州修订版《侠客行》石破天在侠客岛石室参悟的图文、诗句与动作对应，以及是否有显色描写均（待考）。默认沿用图鉴摘要，所有本批颜色和造型标原创扩展，不反向据图修订原著事实。

### 开放问题（附默认值）

- 金色饱和度、墨纹与飒沓扇扫审美：默认沿用本批候选，不升级 approved。
- 家族 / 归一原料有效边距最小为 23 / 26 px，低于 32 px 建议但不触 8 px 检查框；默认保留，合成另检安全边距。
- 原料根部位移超过 ≤2 px 建议，已逐帧对齐；根宽与轮廓仍有变化，实际连续播放的重影（待实测），默认保留四帧。
- 十步局部气劲、飒沓近身范围事件、五岳高档展幅接入：默认保持当前基础演示，由下游用已解算事件驱动，不以视觉范围代替判定。
- 真机 / 浏览器 / 减少动态 / 角色与持剑挂点待下游验证；工具通用标题仍称“外放样例”，不代表本门五招均有外放标记。
