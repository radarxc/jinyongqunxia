# CITY-layouts-all · 第6次返修边界与复现

| 项 | 内容 |
|---|---|
| 归属 | 本任务执行记录；布局契约仍由`design/22`定义 |
| 上游 | 协调者2026-10-03 04:40裁定；仅处理洛阳、太原、页眉，不新开城市 |
| 输入 | 两城CitySpec、现有`tools/town/`代码、前次候选 |
| 检查日 | 2026-10-03 |

## 结论先行（TL;DR）

本轮没有完成两城的整城修复。太原补齐三城范围并重新生成所有派生物，但跨汾城垣仍封河；洛阳水门仍被现契约拒绝。两项保持`partial_candidate`。页眉按裁定保留，等待工具归属任务修复。

## 1. 水门的实际阻碍

`tools/town/check_town.py:281`无条件拒绝城门占地与水格相交；`common.py:312`把墙减门孔后作为实体阻挡；`render_town.py:396`按一条闭合墙线画出所有实墙。仅修改`basis`不能改变这些行为。

洛阳水门试验：加载生效规格，在(20,84)加入west/90度/净宽5格、在(148,84)加入east/270度/净宽6格的现有宋门楼。两者均引用`south_bank`，不改生效文件。调用`check_town.validate_spec`的结果见[r6-watergate-blocker.json](r6-watergate-blocker.json)。

两门各触发`TOWN_GATE_ON_WATER`，另因旱门规则要求接陆路，各触发`TOWN_GATE_PASSAGE`。后者不能消除前者；水门不应被当作必须供行人出入的旱门。将水面截断为不连通河段或涂成干地虽可能避开检查，却没有实现水门，故未采用。

本轮未伪造source hash、删除校验错误、借大理特殊ID隐藏墙体，亦未修改渲染工具或图像掩盖源数据冲突。

## 2. 太原补齐范围与剩余缺口

新读并实际查看推想图，来源边界见[太原依据](history/city_taiyuan__tang_702.md)§2；西城80×64格、中城28×46格、东城36×46格。

西/中/东城分别17/2/17栋；5个旱门、8条固定道路、1条贯城汾河、1座12×8格桥。三城必需行人目标连通；中城两岸守舍与东城居坊不是空分区。

连续外廓仅为单polygon工具能输出的候选：缺两条共用内隔墙，南北贯河处还缺水门。不能将“有三个分区”解释成完整三座城垣均已落实。

本轮`gen_layout → check_town --strict-assets → plan_view → render_town(0.5/1)`全部运行；严格检查0 errors/28 warnings，缺素材为空、diagnostic=false，但目检未通过。机器检查盲区不是通过理由。

两城墙水相交的坐标、数量及太原分城建筑数见[r6-geometry-audit.json](r6-geometry-audit.json)：洛阳18格，太原24格。按`geometry_masks(spec)`的`water & hard`计算。

## 3. 页眉与交接要求

`tools/town/plan_view.py:235`将除大理外的所有城市依据文件选成`linan.md`。现有16张唐代plan都受影响；按本轮裁定不修改工具，也不手改派生图。正确指针在CitySpec.design_intent、manifest.references和逐城history。

建议工具归属任务增加：独立的外/内墙段；水门开口与岸侧支承；水面穿过开口但不可被行人当作陆门；墙水相交错误检查；按实际史料路径生成页眉。此处只是交接，不新增生效schema字段或玩法ID。

通过标准：两城墙水交集仅允许已声明且支承不压水的水门；三城共有内墙与城门正确；重新生成plan与双尺寸图、更新哈希，再目检、改done。

## 参考资料

- [裴静蓉：山西晋阳城考古发掘和研究](https://tohoku-gakuin.repo.nii.ac.jp/record/2000285/files/20240625_peijingrong.pdf)，2026-10-03重读PDF第2、4页。
- [樊晓静：唐代并州经济研究](https://ygx.sxu.edu.cn/db/%E5%AD%A6%E4%BD%8D/D01640591.pdf)，2026-10-03实际看PDF第64页图4-6；不是同期测绘。
- [霍宏伟：隋唐洛阳城空间体系研究](https://www.nopss.gov.cn/n1/2024/0904/c458483-40313012.html)，2026-10-03重读跨水营建记述。
- 本仓库`tools/town/{common,check_town,render_town,plan_view}.py`，本地读取与实际运行；没有新增第三方版本、API、价格或浏览器支持结论。

## 本文新增术语/约定

无。JSON和日志仅为审计记录，不改变CitySpec/TownLayout或运行时契约。

## 待决事项 / 依赖

默认保留14份完整候选、2份既有基线、2份部分候选；2351项仍未完整交付。本轮没有按旧全量队列续开城市。
旧太原“中/东城未总装”已解决为范围补齐；水门与共用墙尚未解决。必须待工具支持后再验收，不能把它们改成完成。
