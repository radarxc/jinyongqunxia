# 段氏一阳诀 · 两段式 VFX 套件

本目录覆盖图鉴 `sk_duanshiyangjue` 的五招。五招都是支援 / 自身、
`projection:false`；共享 palm 只作独立演示的发劲定位，不把内功改成离体攻击。
发出方逐字节引用 `../emitters/palm/`，本目录不复制或修改共用图。

## 造型与原著边界

图鉴只据原著的大理段氏、一阳指传承补此进阶内功；“段氏一阳诀”、五个招名、
机制与可见能量造型均为（原创扩展）。段延庆所学具体行功层次仍（待考），须按
三联 / 广州修订版《天龙八部》核对；不编引文或回目。原著未确认本功的可见颜色。

本功 `nature:harmony`，按 `STYLE.md` 取淡金。家族套用三缕调和气息与双弧护脉；
“一阳归元”用收束气轮；“任督周流”用上下双路环合。颜色与形态均为（原创扩展）。

## 范围与节奏

五招没有外放射程或 `projectionSpreadSteps`，故 `range_hex=0`。演示标尺取
180 px/hex【建议值】，另给自身局部正长度：养气 `1.5×180=270 px`，护脉 / 回息
`2×180=360 px`，一阳归元 `2.5×180=450 px`，任督周流 `3×180=540 px`。
这些长度只控制版面，不反推玩法射程或命中格。普通 pulse 为
`0.10+0.15+0.25+0.10=0.60 s`；绝招 wave 为
`0.15+0.20+0.40+0.15=0.90 s`。

## 复现与限制

```sh
python3 assets/default/vfx/sk_duanshiyangjue/make_sources.py
python3 assets/default/vfx/sk_duanshiyangjue/make_compositions.py
python3 tools/vfx/cut_frames.py --config assets/default/vfx/sk_duanshiyangjue/effect/family/effect-set.yaml --output assets/default/vfx/sk_duanshiyangjue/effect/family/effect-set.yaml --root assets/default/vfx/sk_duanshiyangjue --preview
python3 tools/vfx/compose.py assets/default/vfx/sk_duanshiyangjue/moves/mv_duanshiyangjue_yangqi/composition.yaml --root assets/default/vfx
python3 tools/vfx/build_demo.py assets/default/vfx/sk_duanshiyangjue/moves/mv_duanshiyangjue_yangqi/composition.yaml --root assets/default/vfx
```

`image_gen` 调用在生成前因本机 app-server `Operation not permitted` 失败；三套候选
按既有套件先例由 Pillow 配方降级生成，未伪称模型出图。后续若换模型原料，保留
Composition 语义，但须重新量锚点、参考长、根宽并重跑门禁。浏览器、CDN、真机
混合与实际人物掌面挂点仍（待实测）；所有条目保持 `candidate` 等作者审批。
