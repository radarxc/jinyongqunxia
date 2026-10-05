# 波斯圣火玄功 · 两段式 VFX 套件

本目录覆盖图鉴 `sk_bosishenghuoxuangong` 的五招。五招都是自身吐纳、转换或护体，
均为 `projection:false`；共享 palm 只承担独立演示的发劲定位，不把内功改成离体伤害。
发出方逐字节引用 `../emitters/palm/`，本目录不复制发出方图片。

## 造型与原著边界

图鉴只确认原著存在波斯总教、宝树王、风云月三使和圣火令武功；“波斯圣火玄功”、
五个招名及其机制均为（原创扩展）。总教所涉教主心法前提仍（待考），需按三联 / 广州
修订版《倚天屠龙记》核对。原著未确认本功有可见颜色或固定能量轮廓。

本功性质为 `yang`，故按 `STYLE.md` 采用赤朱主色、暗金辅色。家族套以回环气带和呼吸弧环
表现吐纳 / 转换 / 护体；“幻明归环”以交错双环和回卷焰带区分；“守令归真”以闭合断续
令纹和归心气息区分。颜色、令纹、焰带均为（原创扩展），不画原著引文或实体圣火令。

## 范围与节奏

演示标尺取 180 px/hex【建议值】。图鉴五招都是“自身”，没有 `range.max` 或
`projectionSpreadSteps`，所以 `range_hex=0`，另给正的局部 `length_px`：吐纳取
`1.5×180=270 px`，转换 / 护令取 `2×180=360 px`，两记绝招取
`2.5×180=450 px`。这些长度只控制近身气场版面，不能反推玩法射程或命中格。
普通 pulse 为 `0.10+0.15+0.25+0.10=0.60 s`；绝招 wave 为
`0.15+0.20+0.40+0.15=0.90 s`。

## 复现

```sh
python3 tools/vfx/skills/sk_bosishenghuoxuangong/make_sources.py
python3 tools/vfx/cut_frames.py --config assets/default/vfx/sk_bosishenghuoxuangong/effect/family/effect-set.yaml --output assets/default/vfx/sk_bosishenghuoxuangong/effect/family/effect-set.yaml --root assets/default/vfx/sk_bosishenghuoxuangong --preview
python3 tools/vfx/compose.py assets/default/vfx/sk_bosishenghuoxuangong/moves/mv_bosishenghuoxuangong_tuna/composition.yaml --root assets/default/vfx
python3 tools/vfx/build_demo.py assets/default/vfx/sk_bosishenghuoxuangong/moves/mv_bosishenghuoxuangong_tuna/composition.yaml --root assets/default/vfx
```

`tools/vfx/skills/sk_bosishenghuoxuangong/make_sources.py` 是本套原料的可复现绘制配方，不是运行时 VFX 逻辑。当前会话未暴露
`image_gen`，三张原料因此采用 Pillow 降级生成，并在 manifest 如实登记。后续若必须换成
模型候选，可保留 Composition 语义，但须重新量取锚点、参考长、根宽并重跑全部门禁。

## 待决事项 / 依赖

- 【建议值】默认沿用 180 px/hex、共享掌图 0.32 缩放、赤金 screen 混合与当前横向修正。
- （待考）波斯总教所涉教主心法前提；不据此把原创功名、招名或视觉写成原著事实。
- （待实测）Three.js r186 CDN、移动端 screen 混合、连续帧和实际人物掌面挂点。
