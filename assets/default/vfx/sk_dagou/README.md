# 打狗棒法 · 11 个正式招式演示

| 项 | 内容 |
|---|---|
| 归属 | `design/23` 制作管线的素材实例；不定义玩法 |
| 上游 | 作者两段式合成要求；`skills-wujue` §2.3；`assets/default/STYLE.md` |
| 引用而不重定义 | 招式身份、范围归图鉴；几何、节奏和格式见 `design/23` §2–6 |
| 标注约定 | 素白水墨造型（原创扩展）；原著逐字核对（待考）；浏览器与真机（待实测）；表现参数【建议值】 |

## 结论先行（TL;DR）

图鉴正式定义 11 招：8 个普通招共用 `effect/family`，3 个绝招各用独立效果套。
任务清单把前缀 `mv_dagou_` 误列为第 12 招；它不符合基准 §12 的完整招式 ID，故不伪造目录或玩法资产。
图鉴未给任何一招 `projection:true`；远程引字诀仍是实体长棒拉拽，全部按近身或兵器接触片段制作。
发出方逐字节引用 `assets/default/vfx/emitters/staff/`，未复制或修改。

## 查看与复现

每个 `moves/<mv>/` 含 Composition YAML / JSON、`peak.png` 与自包含 Three.js `demo.html`。
原料由 `tools/vfx/skills/sk_dagou/make_sources.py` 生成白底四帧图，再由 `cut_frames.py` 转 straight RGBA。
本次曾调用指定 CLI 的 `image_gen`：首轮约 9 分钟无回执或文件，单图重试又在工具调用前报 app-server `Operation not permitted`；因此按仓库既有降级口径采用确定性 Pillow 原料，详见 `source_requests.json`。

```sh
python3 tools/vfx/skills/sk_dagou/make_sources.py
python3 tools/vfx/skills/sk_dagou/make_compositions.py
python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_dagou --catalog docs/design/catalog/skills-wujue.md
```

## 原料与合成选择

| 效果套 | 意象（均为原创扩展） | 候选 | 帧尺寸 | 参考长 / 根宽 px |
|---|---|---:|---:|---:|
| `family` | 轻灵钩月、回卷棒劲 | 1→1 | 768×512 | 560 / 30 |
| `mv_dagou_aokouduozhang` | 双钩合拢、中央留缺 | 1→1 | 768×512 | 560 / 62 |
| `mv_dagou_tianxiawugou` | 棒影扇面与断续圆弧 | 1→1 | 768×512 | 560 / 19 |
| `mv_dagou_yajiangoubei` | 斜落重脊与压缩横纹 | 1→1 | 768×512 | 560 / 32 |

统一母版 1536×1024、纸底 `#EFE6D2`、E=[650,512]，共享 staff 图缩放 0.5。
引字诀依 `range.max=3` 取 `3×128=384px`；其余普通招局部192–288px、绝招256–320px【建议值】。沿向比例为 `length_px/560`，横向根宽按 `0.5×54/root_width×scale[1]` 对齐棒端截面。
普通 pulse=`0.10+0.15+0.25+0.10=0.60s`；绝招 wave=`0.15+0.20+0.40+0.15=0.90s`。峰值相位 0.5，循环观看另加 0.4s，不改变 CT、命中或伤害段。

## 参考资料

- `docs/design/catalog/skills-wujue.md` §2.3：武学性质、八字诀、11 个正式招式与玩法范围。
- `docs/design/23-projection-vfx-pipeline.md` §2–6；`tools/vfx/README.md`；`assets/README.md`。

## 本文新增术语/约定

仅新增 4 个原料素材 ID 与 11 个正式招式资产 ID；不新增玩法 ID。

## 待决事项 / 依赖

- （待考）三联 / 广州修订版《射雕英雄传》《神雕侠侣》中八字诀、具体招名与“天下无狗”棒影描写须逐字核对；本文不造引文或回目。
- （原创扩展）素白、暖灰、焦墨配色及四套能量轮廓不是已核实原著颜色。
- 【建议值】默认沿用短距长度、角度、横向修正与四帧节奏；不回填玩法。
- （待实测）浏览器 / 真机连续性、CDN 可达、人物动作挂点；作者美术审批前全部保持 `candidate`。
- 任务标题“12 招”与图鉴 11 招冲突；默认以图鉴为准、不生成不完整前缀 `mv_dagou_`，后续应修任务清单。
