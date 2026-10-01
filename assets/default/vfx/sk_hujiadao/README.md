# 胡家刀法 · 7 招演示

| 项 | 内容 |
|---|---|
| 归属 | `design/23` 制作管线的素材实例；不定义玩法 |
| 上游 | 作者两段式合成要求；`skills-qianlong` §3.1；`assets/default/STYLE.md` |
| 引用而不重定义 | 招式身份、范围归图鉴；几何、节奏与格式见 `design/23` §2–6 |
| 标注约定 | 赤色水墨造型（原创扩展）；原著逐字核对（待考）；浏览器与真机（待实测）；表现参数【建议值】 |

## 结论先行（TL;DR）

图鉴正式定义 7 招：5 个普通招共用 `effect/family`，2 个绝招各用独立效果套。
七招均为 `projection:false` 的近身兵器招；线2、锥2、横扫与绕背是玩法范围，未伪作离体真气外放。
发出方逐字节引用 `assets/default/vfx/emitters/sabre/`，没有复制或修改。

## 查看与复现

每个 `moves/<mv>/` 含 Composition YAML / JSON、`peak.png` 与自包含 Three.js `demo.html`。
本续作工作树没有保留前两次运行产物，当前会话又未提供 `image_gen`；故按仓库已验收降级先例，使用确定性 Pillow 白底候选，并如实保持 `candidate`。

```sh
python3 assets/default/vfx/sk_hujiadao/make_sources.py
python3 assets/default/vfx/sk_hujiadao/make_effect_sets.py
python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_hujiadao --catalog docs/design/catalog/skills-qianlong.md
```

## 原料与合成选择

| 效果套 | 意象（均为原创扩展） | 候选 | 帧尺寸 | 参考长 / 根宽 px |
|---|---|---:|---:|---:|
| `family` | 刚健赤色刀罡与回刃双弧 | 1→1 | 768×512 | 570 / 48 |
| `mv_hujiadao_fengxue` | 锥形赤刃卷入灰蓝飞雪 | 1→1 | 768×512 | 580 / 72 |
| `mv_hujiadao_humiaohuzhao` | 刀弧夹出剑隙、互照破绽 | 1→1 | 768×512 | 580 / 62 |

统一母版 1536×1024、纸底 `#EFE6D2`、E=[630,512]，共享 sabre 缩放 0.46。
所有招式 `range_hex=0`；长度 240–512 px 是局部表现【建议值】，不回填玩法射程。
普通 pulse=`0.10+0.15+0.25+0.10=0.60s`；绝招 wave=`0.15+0.20+0.40+0.15=0.90s`。

## 参考资料

- `docs/design/catalog/skills-qianlong.md` §3.1：性质、七招与玩法范围。
- `docs/design/23-projection-vfx-pipeline.md` §2–6；`tools/vfx/README.md`；`assets/README.md`。

## 本文新增术语/约定

仅新增 3 个原料素材 ID 与 7 个招式资产 ID；不新增玩法 ID。

## 待决事项 / 依赖

- （待考）三联 / 广州修订版《飞狐外传》《雪山飞狐》中胡苗比武、刀法动作与具体招名须逐字核对；图鉴已明确七个招名均为（原创扩展命名）。
- （原创扩展）阳赤、灰蓝飞雪及三套能量轮廓不是已核实的原著可见颜色或形状。
- 【建议值】默认沿用局部长度、角度、横向修正与四帧节奏；不回填玩法。
- （待实测）浏览器 / 真机连续性、CDN 可达、人物动作挂点；作者审批前全部保持 `candidate`。
