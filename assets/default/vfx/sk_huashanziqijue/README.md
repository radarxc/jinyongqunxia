# 华山紫气诀 · 两段式 VFX 套件

本目录覆盖图鉴 `sk_huashanziqijue` 的五招。五招都是自身作用且
`projection:false`；共享 palm 仅承担独立演示的视觉发劲定位，不把内功改成离体攻击。
发出方逐字节引用 `../emitters/palm/`，本目录不复制或修改共用图。

## 造型与原著边界

图鉴确认原著有华山气宗与紫霞神功，但未见“华山紫气诀”作为独立成套武学；
本功、五个招名、机制与数值均为（原创扩展）。原著未确认本功有固定可见颜色或能量轮廓。

视觉按功名采用紫罗兰主色，并按 `nature:yang` 加赤金暖边。家族套以紫色气息带与克制
峰脊弧线表现吐纳、运气和护体；“迎峰守一”以三层角状峰脊和中央脊线表现坚固守势；
“紫气归元”以外展后回卷的开放旋环表现恢复。颜色和形态均为（原创扩展），不画实体
山景、盾牌、珠子或经络图，也不把招名意象冒充原著描写。

## 范围与节奏

图鉴五招均为“自身”，没有 `range.max` 或 `projectionSpreadSteps`，所以
`range_hex=0`。演示标尺取 180 px/hex【建议值】，另给正的局部 `length_px`：吐纳取
`1.5×180=270 px`，运气取 `1.75×180=315 px`，护体取 `2×180=360 px`，两记绝招
均取 `2.5×180=450 px`。这些长度只控制贴身气场版面，不能反推玩法射程或命中格。
普通 pulse 为 `0.10+0.15+0.25+0.10=0.60 s`；绝招 wave 为
`0.15+0.20+0.40+0.15=0.90 s`。

## 复现与限制

```sh
python3 tools/vfx/skills/sk_huashanziqijue/make_sources.py
python3 tools/vfx/skills/sk_huashanziqijue/make_compositions.py
python3 tools/vfx/cut_frames.py --config assets/default/vfx/sk_huashanziqijue/effect/family/effect-set.yaml --output assets/default/vfx/sk_huashanziqijue/effect/family/effect-set.yaml --root assets/default/vfx/sk_huashanziqijue --preview
python3 tools/vfx/compose.py assets/default/vfx/sk_huashanziqijue/moves/mv_huashanziqijue_tuna/composition.yaml --root assets/default/vfx
python3 tools/vfx/build_demo.py assets/default/vfx/sk_huashanziqijue/moves/mv_huashanziqijue_tuna/composition.yaml --root assets/default/vfx
```

`image_gen` 在产图前分别被本机 app-server 权限与 workspace routing 网络错误阻断；三套候选
按仓库同类套件先例由 Pillow 配方降级生成，未伪称模型出图。若后续替换模型原料，保留
Composition 语义，但须重新量锚点、参考长、根宽并重跑门禁。浏览器、CDN、真机混合与
实际人物掌面挂点仍（待实测）；所有条目保持 `candidate` 等作者审批。

## 待决事项 / 依赖

- 【建议值】默认沿用 180 px/hex、共享掌图 0.32 缩放、深墨背景与 screen 混合。
- （待考）仅需核对原著华山气宗 / 紫霞神功文字边界；不为原创功名、招名追加伪书证。
- （待实测）Three.js r186 CDN、移动端混合、连续帧和实际角色掌面挂点。
