# 黯然销魂掌 · 18 招候选特效

| 项 | 内容 |
|---|---|
| 归属 | `design/23` 制作管线的素材实例；不定义玩法 |
| 上游 | 作者两段式合成要求；`skills-daojia` §4.3；`assets/default/STYLE.md` |
| 引用而不重定义 | 招式身份、范围归图鉴；几何、节奏和格式见 `design/23` §2–6 |
| 标注约定 | 青墨造型（原创扩展）；原著逐字核对（待考）；浏览器与真机（待实测）；表现参数【建议值】 |

## 结论先行（TL;DR）

18 招均未标外放：15 个普通招共用 `effect/family`，3 个绝招各用独立效果套。
每套只有一张入选白底原图和 4 张切出的 RGBA 帧；Three.js 实时合成。
全部保持 `candidate`。发出方直接引用 `../emitters/palm/emitter-plate.yaml`，未复制或修改。

## 查看与复现

普通招示例：[心惊肉跳](moves/mv_anran_xinjing/demo.html)；绝招示例：
[黯然销魂](moves/mv_anran_xiaohun/demo.html)、[想入非非](moves/mv_anran_xiangru/demo.html)、[呆若木鸡](moves/mv_anran_daimu/demo.html)。
其余逐招入口见 `manifest.yaml` 的 `code`。HTML 首屏含静态峰值，唯一显式外链为指定的 Three.js r186 importmap。

从仓库根运行，以心惊肉跳为例：

```sh
python3 tools/vfx/compose.py assets/default/vfx/sk_anran/moves/mv_anran_xinjing/composition.yaml --root assets/default/vfx
python3 tools/vfx/build_demo.py assets/default/vfx/sk_anran/moves/mv_anran_xinjing/composition.yaml --root assets/default/vfx
python3 tools/vfx/check_skill_suite.py assets/default/vfx/sk_anran --catalog docs/design/catalog/skills-daojia.md
python3 tools/agents/check_assets.py assets/default/vfx/sk_anran --min 1 --max 60 --min-side 256
python3 tools/lint/check_ids.py --strict
```

复切帧时对每个 `effect/<套名>/effect-set.yaml` 使用 `cut_frames.py --config <该文件> --output <该文件> --root assets/default/vfx/sk_anran --preview`。
`source_requests.json` 保存实际发出的完整提示词、来源与候选取舍；`measurements.json` 保存原图量取口径；`move_notes.json` 保存逐招表现选择说明。

## 原料与合成选择

| 效果套 | 意象（均为原创扩展） | 候选数 / 入选 | 帧尺寸 | 参考长 / 根宽 px |
|---|---|---|---|---|
| family | 低回、卷袖般的阴青掌风 | 1 / 1 | 768×512 | 655 / 133 |
| mv_anran_daimu | 静滞后推出的短钝青墨弧面、木纹般紧绷笔触 | 1 / 1 | 768×504 | 649 / 273 |
| mv_anran_xiangru | 多缕相连的飘带状掌劲，虚实交错 | 1 / 1 | 768×512 | 661 / 266 |
| mv_anran_xiaohun | 双曲墨褶分开，留出离别般的空缺 | 2 / 2 | 768×512 | 605 / 140 |

原图均为 1536×1024。黯然销魂首选上下格串入邻帧，淘汰；保留其提示词和原保存路径供追溯。
呆若木鸡按两行 504 px 显式裁格，末尾 16 px 为白边；不重采样、不修补造型。
所有帧采用 `white_key=100`、白阈值 250，保留青色内部，线性反解去白；不腐蚀边缘。
尝试 `white_luma` 的低 alpha 白底重建误差超过 2/255，改用保色键后低于 0.67/255。
逐帧锚点是 x=96 附近 9 列 alpha 重心的纵坐标，根宽取第三帧该带 alpha 均值 >32/255 的纵向跨度。
参考长取第三帧最右 alpha>1 像素减 x=96；测量值不充当玩法射程。
原图根部有纵向偏移，以独立锚点登记后由既有播放器对齐；没有对齐前原图漂移≤2 px 的宣称。

展示画幅 1536×1024、纸底 `#EFE6D2`、发出点 E=[650,512]，共享掌图缩放 0.5。
普通接触片段 L=1×256=256 px；力不从心 / 饮恨吞声是自指掌边凝劲，显式取 L=160 / 192 px【建议值】，不产生零长束。
六神不安示意自身周边的一个掌劲片段，`range_hex=0`、L=256；不把单图画成完整命中集合。
跃击 / 冲刺只画到位后的近身掌劲；想入非非选 1 格片段，不把 5 段随机落点画成一束远射。
倒行逆施卡片仅给 `aoe_behind r2`，未写明 range；本示意取接触距离 1【建议值】，不把 r2 当已确认射程。
18 招全部 `mode: baseline`，不填不存在的外放档 / `projectionSpreadSteps`，不伪装成已解算战斗事件。

按 `design/23` §4.1，sx=L/参考长，sy=0.5×320/根宽×scale[1]。
例如心惊肉跳 sx=256/655≈0.39084，sy=160/133≈1.20301；青墨根宽=160 px，匹配缩小后的掌面截面。
三绝招纵向修正分别 1.10 / 1.25 / 1.15，根宽=176 / 200 / 184 px；这是作者允许的素材缩放，不增加命中范围。
普通 pulse：0.10+0.15+0.25+0.10=0.60 s；绝招 wave：0.15+0.20+0.40+0.15=0.90 s；沿用 `design/23` §5.2。
相位 [0,0.25,0.5,1]，峰值 0.5 对应普通 0.30 s、绝招 0.45 s，均落在完整显现阶段；循环间隔 0.40 s。
`normal` 混合、crossfade、0.08 推进软带；不移走根部。多段伤害和多目标分发均由动作 / Core 事件安排。

## 参考资料

- `docs/design/catalog/skills-daojia.md` §4.3、§8.7.3、§11.4 K-10：本门身份、招式和考据边界。
- `docs/design/23-projection-vfx-pipeline.md` §2–6；`tools/vfx/README.md`；`assets/README.md`。
- `assets/default/baseline/vfx/{mv_xianglong18_kanglong,sk_liumai}`：目录与合成格式参考，未作为图片输入。

## 本文新增术语/约定

只有素材 ID：`vfx_sk_anran__family_base01`、三条 `vfx_mv_anran_*__effect_base01`、18 条 `vfx_mv_anran_*__base01`；不新增玩法 ID。
manifest 主条目为 4 张入选原图和 18 张 peak；切帧、配置、演示和质检附件按 `file_integrity` 登记。

## 待决事项 / 依赖

- 【建议值】默认沿用本套短距长度、角度、根宽修正和四帧节奏；不回填玩法射程。普通招轮廓变化较大，连续观感仍需动态审美验收。
- （待考）沿用图鉴：三联 / 广州修订版《神雕侠侣》杨过与周伯通切磋、救郭襄相关段落；核对十七招名、次序、版本差异及心境与掌力的联系。未引用未核实回目。
- （原创扩展）青色来自本项目 yin 视觉倾向，四套图形没有已核实的原著颜色或能量轮廓依据；游戏第十八招黯然销魂为原图鉴扩展总汇招。
- 部分帧外白边仅 9–30 px，低于 32 px 建议，但 8 px 边框无残留，整图无裁断；默认保留候选，若作者要求更宽原料边距再另开返修。
- （待实测）移动设备、浏览器连续性、挂点与具体掌姿；沿用共用掌图的左右手和人物动作待考，不将局部手图作为杨过人物定稿。
- 作者造型审批仍待完成，默认 candidate；无基准修改提案。范围缺写及多段 / 周边表现接线交下游，见执行报告 §6。
