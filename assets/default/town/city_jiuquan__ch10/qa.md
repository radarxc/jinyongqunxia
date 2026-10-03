# city_jiuquan · 候选城图目检

| 项 | 内容 |
|---|---|
| 日期 | 2026-10-03 |
| 输入 | preview.png、history/city_jiuquan__tang_702_plan.png；联系表由这两份最终图生成 |
| 图像 SHA-256 | 961359fc44e50e90a719ad41e99be41737ad737f6619ab18815eb1751f8292f7 |
| 工具 | view_image 实际查看本城所在联系表；严格素材校验见 validate.log |

结论先行（TL;DR）：空间候选可审阅，维持 candidate；建筑年代形制未通过唐代验收。

- 仅保留南、东两门，南门通路连通；未画明代东扩城。
- 建筑底面未见互相穿插或压水；屋顶正常透视遮挡不等于占地重叠。静态占地与入口由 check_town 补验。
- 素材光向一致，未见占位方块；missing_assets=[]，diagnostic=False。
- 土地和土路明度接近，整图远看主街对比偏弱；overlay 保留主街轮廓，后续统一道路贴片应增强对比。
- 宋代砖墙、门楼与屋顶为明确替代；内城/坊墙只在分区层表达，未声称已经完整复原。

## 参考资料

对应 history/city_jiuquan__tang_702.md；本目录 manifest.yaml、preview.render.json、stats.json。

## 本文新增术语/约定

无。目检通过只指本轮空间候选，不等于历史考古确认或发布审批。

## 待决事项 / 依赖

默认保留 candidate；唐代套件、多重城墙、图头史料路径修正和运行时验收见任务报告§6。
