# 碧海潮生曲 · 招式特效候选

> 归属（基准 §18）：design/23 两段式 VFX 制作实例；不定义玩法。  
> 上游：skills-wujue §3.3、assets/default/STYLE.md、作者 Three.js 合成要求。  
> 引用而不重定义：招式身份、外放与范围归图鉴；几何、节奏和格式见 design/23 §2–6。  
> 标注约定：音波轮廓与金青色（原创扩展）；原著场景（待考）；浏览器/真机（待实测）；表现长度【建议值】。

## 结论先行

正式图鉴解析得到 7 招：5 个普通招复用 effect/family，两记绝招各有独立效果套。
每套是一张 2×2 白底四帧原料，切为 straight RGBA；逐招由 Three.js 实时合成。
发出方逐字节引用共享 emitters/palm，不复制、不修改。全部保持 candidate。

## 造型与颜色

原著可确认黄药师持玉箫以内力催动乐声、扰动听者心神；没有据此确认可见颜色或固定能量轮廓。
本套依项目 harmony 倾向采用金色主音、低饱和青绿辅音，并以同心音环和海潮水纹表现，均为（原创扩展）。
碧海潮生增加大幅交替潮环；定神采用向内收束的护持音环，不把支援招画成伤害命中。

## 范围与节奏

演示标尺取 180 px/hex【建议值】。外放招按图鉴的最高 projectionSpreadSteps：潮起 r4=720 px、
潮涌 d3=540 px、惊涛 r5=900 px、余音最高内圈 r4=720 px；全场绝招用 900 px 方向片段，
并不把单张 Composition 当成完整命中格集合。心随音动 range.max=5，故 5×180=900 px；
定神 allies r3，故 3×180=540 px。普通 pulse 为 0.10+0.15+0.25+0.10=0.60 s；
绝招 wave 为 0.15+0.20+0.40+0.15=0.90 s。长度与展幅仅用于独立演示。

## 复现

```sh
python3 tools/vfx/skills/sk_bihai/make_sources.py
python3 tools/vfx/cut_frames.py --config assets/default/vfx/sk_bihai/effect/family/effect-set.yaml --output assets/default/vfx/sk_bihai/effect/family/effect-set.yaml --root assets/default/vfx/sk_bihai --preview
python3 tools/vfx/compose.py assets/default/vfx/sk_bihai/moves/mv_bihai_chaoqi/composition.yaml --root assets/default/vfx
python3 tools/vfx/build_demo.py assets/default/vfx/sk_bihai/moves/mv_bihai_chaoqi/composition.yaml --root assets/default/vfx
```

`tools/vfx/skills/sk_bihai/make_sources.py` 是本套原料的可复现绘制配方，不是运行时 VFX 逻辑。当前会话未暴露 image_gen；
因此三张原料由 Pillow 程序化绘制，而非图像模型生成，manifest 如实登记。正式美术若要求模型生成，
可保留 Composition 参数，仅替换候选原料并重新量取锚点、参考长和根宽。

## 待决事项 / 依赖

- 【建议值】默认沿用 180 px/hex、共享掌图 0.32 缩放、金青 screen 混合与当前横向美术修正。
- （待考）三联/广州修订版《射雕英雄传》桃花岛斗曲措辞，以及《神雕侠侣》再次使用的对手与场景。
- （待实测）Three.js r186 CDN、移动端混合色、连续帧、实际人物挂点；静态门禁不替代浏览器和真机。
- 任务标题写“8 招”并列出不完整前缀 mv_bihai_；正式图鉴只有 7 个完整招式 ID，未伪造第八招。
