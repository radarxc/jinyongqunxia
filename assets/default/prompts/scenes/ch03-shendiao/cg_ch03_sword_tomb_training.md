---
asset_id: cg_ch03_sword_tomb_training
name: 重剑无锋
book: ch03_shendiao
characters:
- npc_yangguo
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yangguo__ch03_youth_onearm_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch03/cg_ch03_sword_tomb_training.png
manifest: assets/default/scene/ch03/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: "作者 10-02 晚：复合基线风格精修"
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yangguo__ch03_youth_onearm_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "0c4fa42a5bbf79f72b7d699ab82766820ad3159245fffec7ed8043781dc42a50"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
composite_job: cg_ch03_sword_tomb_training.resume3r2
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch03_sword_tomb_training.resume3r2`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
断右臂后、十六年等待以前的杨过随神雕练重剑。年轻成年杨过在山洪岩面上，只用左手稳持乌黑宽钝玄铁剑抗衡水势，肩背发力真实；人物自身右臂缺失，空右袖收在右腰，衣装苍灰青练功袍完整、被水打湿但不透肤。一只身高超过成年人的褐黑巨大神雕站在旁边岩石，神雕必须有明确可见的血红色大肉冠：头顶秃而长着天然红色大肉瘤，不是伤口、无血迹；颈长、喙钝、毛羽疏落、丑拙雄壮，双翼短小有力，不可飞翔。头顶红色肉冠在画面上占有足够像素一眼可辨，绝不能画成普通鹰、金雕、白雕或华丽凤凰。山岩与水势形成斜线，无剑气光效、无伤口；具体机位属原创扩展美术设计。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_yangguo的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「重剑无锋」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
断右臂后、十六年等待以前的杨过随神雕练重剑。年轻成年杨过在山洪岩面上，只用左手稳持乌黑宽钝玄铁剑抗衡水势，肩背发力真实；人物自身右臂缺失，空右袖收在右腰，衣装苍灰青练功袍完整、被水打湿但不透肤。一只高大褐黑神雕立在旁边岩石，头顶肉冠、短而有力的翅膀，绝不是白雕或怪兽。山岩与水势形成斜线，无剑气光效、无伤口；具体机位属原创扩展美术设计。

右上角留白处单列自上而下竖排楷书题字“重剑无锋”，共4字，逐字正确、无多字、无其他文字；文字高度约画高四分之一，墨色温黑，旁可一枚无可读字的小朱印，不遮人物和道具。
```

## 原著与美术边界

取景、服色与站位为（原创扩展美术设计）；精确回目与动作时序（待考），以三联／广州修订版核对。

## 原著依据

- 《神雕侠侣》第二十三回 手足情仇：“头顶生着个血红的大肉瘤”；https://www.xuges.com/wuxia/jinyong/sdxl/162.htm
- AR-82 返修约束（本节优先于历史提示词）：只编辑左侧神雕躯干翅膀腿脚：全身黄黑羽毛疏疏落落，显出明显大块裸露灰皮，翅膀缩短紧贴躯干，腿脚比普通鹰粗壮数倍且腿上部露皮。神雕很丑，不能是普通密羽大鹰。保留原头部血红大肉瘤、脸和朝向、身体站位及整体身高。杨过、玄铁剑、河水、岩石、题字朱印逐像素不动。
