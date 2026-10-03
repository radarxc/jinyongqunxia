# city_luoyang · 候选城图目检

| 项 | 内容 |
|---|---|
| 日期 | 2026-10-03 |
| 输入 | 本目录 preview.png 与对应 history 平面 PNG |
| 图像 SHA-256 | d1a9bd30a39178369dcb1d3202b8c722862224755fa444dd605d59f3470b1e93 |
| 方法 | view_image 已查看最终图；空间验算见 validate.log |

结论先行（TL;DR）：可审阅的宋素材代用候选，唐代形制未验收。

- 西北宫区、南宽北窄外廓、洛水与两座桥和规划图一致；两桥均覆盖道路并接两岸。
- 目检不通过整城验收：河道东西穿墙处仍画实墙、缺水门。斜西墙台阶明显；不把这张候选计为完成。
- 未见占位块和异常光向；严格检查验证底面无重叠、入口可达；屋檐正常透视遮挡不能用作碰撞证据。
- 土路和地面明度接近，缩图主街较淡；沿街部分有空地，未声称达到历史人口密度。
- 平面图副标题仍误引 history/linan.md（工具硬编码），应以本城 history 和 manifest 为准。
- 第6次复看同一preview：两端共有18个水格/实墙格交集。新增水门的内存试验触发`TOWN_GATE_ON_WATER`；失败记录见`docs/design/town/r6-watergate-blocker.json`。
- 本轮未改变洛阳几何和图像，manifest仅复核尺寸/哈希并更新限制；未把复检写成已重渲染或已修复。

## 参考资料

对应 docs/design/town/history/city_luoyang__tang_702.md；本目录 manifest.yaml、preview.render.json、stats.json。

## 本文新增术语/约定

无；本记录不代替发行、真机或历史考古验收。

## 待决事项 / 依赖

默认 candidate；唐代套件、多层城墙及平面图副标题修复交工具与素材归属任务。
