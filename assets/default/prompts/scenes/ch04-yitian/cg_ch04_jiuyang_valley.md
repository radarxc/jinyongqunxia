---
asset_id: cg_ch04_jiuyang_valley
name: 幽谷九阳
book: ch04_yitian
characters:
- npc_zhangwuji
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhangwuji__ch04_youth_scene_jiuyang.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch04/cg_ch04_jiuyang_valley.png
manifest: assets/default/scene/ch04/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: "作者 10-02 晚：复合基线风格精修"
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_zhangwuji__ch04_youth_scene_jiuyang.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "cf73441e2043935c8ad7c8c6e5b840c9cdf955356744579429e743393300b19b"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
composite_job: cg_ch04_jiuyang_valley.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch04_jiuyang_valley.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
昆仑幽谷得经后修习九阳，成年张无忌穿完整粗布旧衣，坐在岩石上凝神捧经，眉眼温厚安定；已康复的白猿在旁边安静坐着，远处绿树、泉水与洞口构成幽谷纵深。只画经卷已取出后的安宁瞬间，不画剖腹、血迹或手术，不画发光经书、法阵；书页不生成可读段落。实际取经动作待考，本画机位与布景属原创扩展美术设计。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_zhangwuji的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「幽谷九阳」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
昆仑幽谷得经后修习九阳，成年张无忌穿完整粗布旧衣，坐在岩石上凝神捧经，眉眼温厚安定；已康复的白猿在旁边安静坐着，远处绿树、泉水与洞口构成幽谷纵深。只画经卷已取出后的安宁瞬间，不画剖腹、血迹或手术，不画发光经书、法阵；书页不生成可读段落。实际取经动作待考，本画机位与布景属原创扩展美术设计。

右上角留白处单列自上而下竖排楷书题字“幽谷九阳”，共4字，逐字正确、无多字、无其他文字；文字高度约画高四分之一，墨色温黑，旁可一枚无可读字的小朱印，不遮人物和道具。
```

## 原著与美术边界

取景、服色与站位为（原创扩展美术设计）；精确回目与动作时序（待考），以三联／广州修订版核对。

## 原著依据

- 《倚天屠龙记》十六 剥极而复参九阳：“四本薄薄的经书”；https://www.xuges.com/wuxia/jinyong/yttlj/112.htm
- AR-82 返修约束（本节优先于历史提示词）：只把张无忌两手捧的山水卷轴改为一本打开的薄经书，经文为异文夹蝇头汉字，不画山水卷。身旁前下方石上放另三本薄经书及打开油布包，总共四本。手指、脸、体格、衣服、白猿、山水风景和题字印章全不动。
