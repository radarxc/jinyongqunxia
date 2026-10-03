# city_taiyuan · 候选城图目检

| 项 | 内容 |
|---|---|
| 日期 | 2026-10-03 |
| 输入 | 本目录 preview.png 与对应 history 平面 PNG |
| 图像 SHA-256 | 228a7f3c3b83fb49cacdfd2793810c9ac94ce73b25400b4aa6ac0ea8e63ed8a3 |
| 方法 | view_image 已查看最终图；空间验算见 validate.log |

结论先行（TL;DR）：第6次已补中城、东城及跨汾桥，三城范围齐；跨水城垣与内隔墙未解决，整城验收仍不通过。

- 西城80×64格、中城28×46格、东城36×46格；西北宫区、5个旱门、贯中城汾河及跨河桥与平面图一致。
- 已解决：旧图只含西城。新图西/中/东城分别17/2/17栋，中城两岸各1座守舍，东城有民居及商坊，合计36栋。
- 未解决：单外廓不含共用内隔墙；汾河与南北城垣仍有24个水格/实墙格交集，目检可见实墙封河，不能标完整候选。
- 12×8格通行桥覆盖横街并连接两岸；桥只解决行人通行，不代表已解决上下游水关。
- 未见占位块和异常光向；严格检查验证底面无重叠、入口可达；屋檐正常透视遮挡不能用作碰撞证据。
- 土路和地面明度接近，缩图主街较淡；沿街部分有空地，未声称达到历史人口密度。
- 平面图副标题仍误引 history/linan.md（工具硬编码），应以本城 history 和 manifest 为准。

## 参考资料

对应 docs/design/town/history/city_taiyuan__tang_702.md；本目录 manifest.yaml、preview.render.json、stats.json。

## 本文新增术语/约定

无；本记录不代替发行、真机或历史考古验收。

## 待决事项 / 依赖

默认 candidate、进度partial_candidate；唐代套件、多层城墙、水门及平面图副标题修复交工具与素材归属任务。
本轮实际查看最终plan与preview；strict-assets为0 errors/28 warnings，渲染缺素材为空、diagnostic=false；检查未覆盖的墙水相交由补充审计明确保留。
详见`docs/design/town/r6-geometry-audit.json`与`r6-repair-boundaries.md`。历史`recheck-r4.log`只表示第4次旧西城检查，当前结果见validate.log、recheck.log。
