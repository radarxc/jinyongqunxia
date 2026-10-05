# 乾坤大挪移 · 四招特效候选

| 项 | 内容 |
|---|---|
| 归属 | `design/23` 制作管线的资产实例，不定义玩法 |
| 上游 | 作者两段式 / Three.js 决定；`catalog/skills-yitian.md` §2.2、§8.4；`assets/default/STYLE.md` 招式行 |
| 引用而不重定义 | ID 见基准 §12；造型、锚点、混合与节奏契约见 `design/23` §2–§6；范围及命中消费图鉴 / `design/09` |
| 标注约定 | 原创造型（原创扩展）；小说逐字依据（待考）；浏览器 / 真机（待实测）；制作数值【建议值】 |

## 结论先行（TL;DR）

三张内置 `image_gen` 白底原件，每张四帧；共十二张 RGBA 帧。
普通招共用 `effect/family/`，两记绝招各用独有效果套。全部状态为 `candidate`。
四招都不外放，不配置 `projectionSpreadSteps` 或外放加持；共享掌图仅为独立演示的发出方。
网页实时合成，Python 只切帧和导出单张静态峰值，不交付整图动画。

## 1. 造型与原著边界

图鉴 §2.2 将乾坤大挪移概括为运劲、激发潜力与牵引敌劲，并记张无忌在光明顶秘道修习。
这里仅引用该摘要，不新增引文、回目或层级考据；三联 / 广州修订版的逐字依据继续（待考）。
金色来自本作 `nature:harmony` 的风格倾向，不声称小说记载金色可见气场。

| 效果套 | 造型语汇与用途 | 候选 |
|---|---|---|
| `family` | 开口金墨回环、渐隐墨丝根部与留空内圈，表现护体 / 卸劲（原创扩展） | 生成 2，入选第 2 张；第 1 张因根部切口淘汰 |
| `mv_qiankun_diandao` | 深浅两股金墨弯月交错回卷，表现颠倒阴阳；招名与造型均为原创扩展 | 生成 1，入选 1 |
| `mv_qiankun_guiyi` | 多层开口螺旋向心收束，表现乾坤归一；招名与造型均为原创扩展 | 生成 1，入选 1 |

完整实发提示词、工具原始路径见各套 `request.json` 及 `manifest.yaml`。
源图逐字节保存；不重画、补画或修改共享掌图。

## 2. 量图与合成核算

原图均为 1536×1024；按 2×2 显式格切成 768×512。局部坐标为左上原点、向右 / 向下为正。
家族第二候选根部取 x=160.5，其余取 x=100.5；以该列 `min(R,G,B)<210` 的可见主体上下界中点定 y。
根宽用峰值格该截面的高度；参考长度用峰值格低于抠白阈值的最右像素中心减根部 x。
家族抠白阈值为 246，清除边缘极淡背景残像；两绝招沿用 250，色键全保留差值均为 163。
该阈值只辅助量图，不裁掉原图或以图像边界定义命中。

| 套 | 四帧根部 y（px） | 峰值根宽 | 参考长度算式 |
|---|---|---:|---|
| family | 239 / 239.5 / 215.5 / 235.5 | 340−139=201 | 699.5−160.5=539 |
| diandao | 250 / 249.5 / 245.5 / 243.5 | 350−149=201 | 729.5−100.5=629 |
| guiyi | 261.5 / 255.5 / 262.5 / 262.5 | 341−170=171 | 732.5−100.5=632 |

共享掌图仅引用 `../emitters/palm/emitter-plate.yaml`：发出点 `[850,704]`，原宽 320。
演示 E=`[700,540]`，手缩放 0.6，故名义掌面宽 `320×0.6=192 px`。
画幅 1536×1024，纸底 `#EFE6D2`，`normal` 混合保留水墨层次。
标尺 256 px/hex 只用于演示。护体、周身绝招是局部正长度，`range_hex=0`；卸劲选单体近身距离 1。

| 招式 | 效果套 | range_hex / L | 角度 | scale | sx / sy 核算 | 节奏 |
|---|---|---|---:|---|---|---|
| `mv_qiankun_huti` | family | 0 / 256 px | 0° | [1,0.75] | 256/539；192/201×0.75 | pulse |
| `mv_qiankun_xiejin` | family | 1 / 256 px | −10° | [1,0.55] | 256/539；192/201×0.55 | pulse |
| `mv_qiankun_diandao` | 独有 | 0 / 384 px | 0° | [1,1] | 384/629；192/201 | wave |
| `mv_qiankun_guiyi` | 独有 | 0 / 384 px | 0° | [1,1] | 384/632；192/171 | wave |

局部长度【建议值】：普通护体 `1×256=256 px`、绝招 `1.5×256=384 px`；卸劲 `1 格×256=256 px`。
上述 1 / 1.5 是版面比例，不是新增自指射程；绝招周身范围由上游事件在真实角色挂点表现。
`sx=L/reference_length`、`sy=192/root_width×scale[1]`，两层的各自锚点均严格映射到 E。
节奏直接取 `design/23` §5.2：pulse=`0.10+0.15+0.25+0.10=0.60 s`，wave=`0.15+0.20+0.40+0.15=0.90 s`。
普通 / 绝招峰值相位分别 `0.25/0.60=5/12`、`0.35/0.90=7/18`，都对应第二格。
卸劲开启方向显隐；其余局部气场关闭方向遮罩、整体凝聚。全部 `drift_fraction=0`，根部不离掌。

## 3. 复现与检查

仓库根目录运行；共享引用要求 `--root assets/default/vfx`。

```sh
for set in family mv_qiankun_diandao mv_qiankun_guiyi; do
  cfg="assets/default/vfx/sk_qiankun/effect/$set/effect-set.yaml"
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/cut_frames.py --config "$cfg" --output "$cfg" --root assets/default/vfx
done
for move in huti xiejin diandao guiyi; do
  cfg="assets/default/vfx/sk_qiankun/moves/mv_qiankun_$move/composition.yaml"
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/compose.py "$cfg" --root assets/default/vfx
  PYTHONDONTWRITEBYTECODE=1 python3 tools/vfx/build_demo.py "$cfg" --root assets/default/vfx
done
python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_qiankun --catalog docs/design/catalog/skills-yitian.md
python3 tools/agents/check_assets.py assets/default/vfx/sk_qiankun --min 1 --max 60 --min-side 256
python3 tools/lint/check_ids.py --strict
```

`verification.json` 记录三套逐帧抠图指标、四招全阶段几何检查、HTML 门禁及共享掌图的 HEAD 字节一致性。
黑 / 灰 / 白质检联系表已逐张查看后删除，需要时切帧追加 `--preview` 重建。
重建后若工具输出改变，应重新计算 manifest 完整性哈希，不改源图来迁就旧哈希。

## 参考资料

- [本门图鉴](../../../../docs/design/catalog/skills-yitian.md) §2.2、§8.4：招式、两记绝招与非外放裁定。
- [制作规范](../../../../docs/design/23-projection-vfx-pipeline.md) §2–§6、[工具说明](../../../../tools/vfx/README.md)。
- [默认风格](../../STYLE.md)、[素材登记](../../../README.md)、[共用掌图](../emitters/palm/emitter-plate.yaml)。

## 本文新增术语/约定

不新增玩法术语或 ID。仅登记 3 个原料资产与 4 个招式资产，完整 ID 见 `manifest.yaml`。
Composition JSON 是脚本派生文件；制作真值为 YAML，玩法真值仍归图鉴。

## 待决事项 / 依赖

- 【建议值】局部长度 256 / 384、横向缩放 0.75 / 0.55、角度 −10° 与量图阈值 210；默认沿用当前候选，不回填为玩法数值。
- 上游依赖：四招非外放、两记绝招、调和内功及共享掌图沿用；`bindings.yaml` 的 `emitter:null` 是运行时内功语义，本演示 palm 不覆写它。
- 原著考据待办：三联 / 广州修订版《倚天屠龙记》光明顶秘道修习与牵引敌劲情节的逐字依据、显色有无描写（待考）；默认所有金色与旋涡造型视为原创扩展。
- 开放问题：有效帧最小留白 family / diandao / guiyi 为 10 / 15 / 29 px，低于 32 px 建议；8 px 边框无残留，默认保留。
- 开放问题：原图根部 y 漂移为 24 / 6.5 / 7 px；逐帧锚点已对齐，未声称原图满足 ≤2 px 建议。轮廓连续性默认交作者审美复核。
- 已解决：家族第一候选根部直切口已由第二候选的渐隐墨丝替换；重切四帧并重建护体 / 卸劲，三底联系表和两张峰值均目检无直切口、无白边，见 `verification.json` 的 `review_round_2`。
- （待实测）Three.js 浏览器连续播放、减少动态、CDN 依赖、手机性能及真实人物周身挂点；静态检查不代替 WebGL 或真机验收。默认保留 `candidate`。
- 对基准的修改提案：无；不更改射程、范围、换位、伤害、CT 或反应规则。
