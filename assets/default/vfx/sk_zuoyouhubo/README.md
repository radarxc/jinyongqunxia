# 左右互搏 · 两段式特效候选

| 项 | 内容 |
|---|---|
| 归属 | 本门素材的制作记录；不定义玩法、射程或经脉规则 |
| 上游 | 本任务作者要求；`docs/design/catalog/skills-wujue.md` §6.3；`assets/default/STYLE.md` 招式行 |
| 引用而不重定义 | 双招机制见 `design/05` §9.3.2；几何、混合、节奏见 `design/23` §2–§6 |
| 标注约定 | 视觉改编（原创扩展）；原文逐字核对（待考）；浏览器与设备验证（待实测）；局部尺度【建议值】 |

## 结论先行（TL;DR）

3 张内置 `image_gen` 白底原料，各含 4 帧，切出 12 张透明 PNG；两记绝招各有独立效果套、Composition、静态峰值和 Three.js 演示。每套仅生成 1 个候选并选入，所有登记均为 `candidate`。

两招均是双招机制的绝招入口，`projection:false`；图鉴范围为“依所选两招”。本套只展示掌旁的入口意象，`range_hex:0` 表示本次局部预览，不把图鉴范围改成自指 0 格。真正攻击仍由所选原招及其合法目标决定。

## 1. 造型与原著边界

| 效果套 | 造型与依据 | 使用 |
|---|---|---|
| `effect/family/` | 折弧与圆弧双路气劲，统一同门语汇（原创扩展） | 保留为共用套；本门两招均绝招，未强行配给普通招 |
| `effect/mv_zuoyouhubo_fenxin/` | 上方折转、下方圆转，取方圆分工意象（原创扩展） | 分心二用 |
| `effect/mv_zuoyouhubo_quanli/` | 双股等重涌势同步前推，取“全力”招名意象（原创扩展） | 双手全力 |

图鉴 §6.3 以周伯通的左右互搏和方圆练习为出处依据；本次没有逐字复核小说，未补写引文或回目。**（待考）** 按三联 / 广州修订版核对《射雕英雄传》周伯通教郭靖互搏的原文措辞与回目定位。双手全力的招名已由图鉴标为原创扩展；两招的可见气劲轮廓和颜色同样属于原创扩展。

`neutral` 沿任务要求采用素白倾向；母版用可与白底分离的银灰色，透明帧以 `screen` 合成在既有深墨底 `#4A433C`。未宣称小说描写了银白色气劲。发出方只相对引用 `../emitters/palm/`，无复制、改色、重抠或绘制新手部。单掌是 v1 独立演示的定位参照，不表示左右互搏只有一只手；人物接入时应分别消费真实双手与所选原招事件。

## 2. 量取与合成参数

母版均 1536×1024，按左上、右上、左下、右下切为 768×512。锚点由目视选取的根部列附近测量：列宽 9 px、y=180…299 内以 alpha 三次方加权求中心，再取整；逐帧锚点写入 EffectSet，不重采样母版。根宽按峰值根部 9 列的平均 alpha≥128 的纵向跨度，参考长取峰值 alpha≥64 的最右边界减根部 x。

| 效果套 | 四帧根部坐标 | 根宽核算 | 参考长度核算 |
|---|---|---|---|
| family | `[128,246] [128,241] [128,241] [128,244]` | `336−148=188 px` | `700−128=572 px` |
| fenxin | `[112,241] [112,239] [112,239] [112,247]` | `339−143=196 px` | `733−112=621 px` |
| quanli | `[112,233] [112,234] [112,235] [112,234]` | `326−160=166 px` | `701−112=589 px` |

切帧采用 `white_key / cutoff=250 / key_full=64 / dewhite=true`，保留生成原件。四帧相位 `[0, 0.35/0.90, 0.7, 1]`，生成的末帧仍保留余韵，完全隐去由时间包络完成。

两招画幅均 1536×1024，发出点 `E=[736,536]`、方向 `[1,0]` / 0°、`emitter_scale=0.45`、`scale=[1,1]`、`drift_fraction=0`。共享掌面源宽 320 px，因此显示根宽 `0.45×320=144 px`。以下倍数是局部美术【建议值】，无固定格数含义。

| 招式 | 长度 | `sx=L/reference_length` | `sy=144/root_width` | 节奏 |
|---|---:|---:|---:|---|
| `mv_zuoyouhubo_fenxin` | `2×144=288 px` | `288/621≈0.463768` | `144/196≈0.734694` | wave / 0.90 s |
| `mv_zuoyouhubo_quanli` | `2.5×144=360 px` | `360/589≈0.611205` | `144/166≈0.867470` | wave / 0.90 s |

两招均沿 `design/23` §5.2 的长模板：`0.15+0.20+0.40+0.15=0.90 s`，峰值 `t=0.35 s`、`phase=0.35/0.90`；不由收招 CT 换算。亮度五边界 `[0.8,1,1,1,0.8]`，方向遮罩软宽 0.08，循环间隔 0.40 s。未填写不存在的独立 `range.max` 或 `projectionSpreadSteps`，也未制造外放升档。

## 3. 复现与验收

从仓库根目录运行，`--root assets/default/vfx` 才能合法解析共享掌图：

```sh
for effect in family mv_zuoyouhubo_fenxin mv_zuoyouhubo_quanli; do
  effect_config="assets/default/vfx/sk_zuoyouhubo/effect/$effect/effect-set.yaml"
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/cut_frames.py --config "$effect_config" --output "$effect_config" --root assets/default/vfx --preview
done
for move in mv_zuoyouhubo_fenxin mv_zuoyouhubo_quanli; do
  composition="assets/default/vfx/sk_zuoyouhubo/moves/$move/composition.yaml"
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/compose.py "$composition" --root assets/default/vfx
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/build_demo.py "$composition" --root assets/default/vfx
done
```

源图、9 张三底联系表与两张峰值均已 `view_image` 检查：双路轮廓可辨、根部覆盖掌面并向右展开，无明显白底残边。12 帧的 8 px 边框 alpha 与残白比例均为 0，白底重建最大误差 0.537201/255。所有阶段的合成安全边距 ≥228.65 px，保守留白 ≥75.61%，见 `verification.yaml`。

两 HTML 大小分别为 1,525,177 / 1,725,061 bytes，原纹理比例 1.0，无损 WebP 内嵌；唯一显式外链为工具固定的 Three.js r186 importmap。静态 HTML / 脚本门禁通过，未在浏览器或真机运行，不推断 CDN 可达性、依赖请求数或播放帧率。

## 参考资料

- `docs/design/catalog/skills-wujue.md` §6.3：两招 ID、绝招身份、中性与范围。
- `docs/design/05-martial-arts-system.md` §9.3.2：双招选择、目标与结算唯一归属。
- `docs/design/23-projection-vfx-pipeline.md` §2–§6、`tools/vfx/README.md`：原料、合成与演示规范。
- `assets/default/baseline/vfx/mv_xianglong18_kanglong/`、`sk_liumai/`：目录与 YAML 参考；非本次图像输入。
- `source_requests.json`、`provenance.json`、`manifest.yaml`：完整实发提示词、工具源路径、哈希与候选链。

## 本文新增术语/约定

只新增 5 个素材 ID：`vfx_sk_zuoyouhubo__family_base01`、`vfx_sk_zuoyouhubo__fenxin_base01`、`vfx_sk_zuoyouhubo__quanli_base01`、`vfx_mv_zuoyouhubo_fenxin__base01`、`vfx_mv_zuoyouhubo_quanli__base01`。招式、武学与机制 ID 全部复用；没有新玩法术语。

## 待决事项 / 依赖

- **建议值与审美**：默认保留上述 288 / 360 px、银灰与方圆 / 双涌造型，状态 `candidate`；审批后再提升。
- **原料建议偏差**：白底存在 RGB 253–255 的微小波动，按 250 阈值剔除；分心第三帧可见留白 31 px，双手全力第二至四帧为 30 / 15 / 26 px，低于 32 px 建议但无裁断、8 px 边框完全透明。默认保留原件，不靠腐蚀删墨丝；作者需要更宽留白时再按剩余候选预算重出。
- **原料对齐**：分心原始根部纵向差最大 8 px，高于初始 2 px 建议；已用逐帧锚点归一到同一发出点，连续播放审美仍（待实测）。
- **上游事实**：默认沿用图鉴绝招入口与各自原招范围，不把局部预览的 `range_hex:0` 回填到玩法。
- **外部同步**：现有 `bindings.yaml` 两招为 `delivery:unknown / emitter:sword`，与任务指定 `inner / palm` 不符；本次未改绑定表。生成器标题仍写“外放样例”，本门入口无外放；交工具维护处理。
- **原著考据 / 开放问题**：上述修订版逐字考据未做，默认只用图鉴出处转述；人物双手挂点、浏览器加载 / 连续播放、移动端颜色及性能均（待实测）。
- **对基准的修改提案**：无。
