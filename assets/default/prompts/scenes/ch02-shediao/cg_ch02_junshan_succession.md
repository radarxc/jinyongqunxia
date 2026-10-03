---
asset_id: cg_ch02_junshan_succession
name: 轩辕夺棒
book: ch02_shediao
characters:
- npc_huangrong
- npc_guojing
- npc_yangkang
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_guojing__ch02_youth_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_wangyuyan__ch01_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_xiaolongnv__ch03_base01.jpg"
output: assets/default/scene/ch02/cg_ch02_junshan_succession.png
manifest: assets/default/scene/ch02/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: "作者 10-02 晚：复合基线风格精修"
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_huangrong__ch02_youth_scene_junshan_beggar_leader.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "a7e70176c73600162cba98ab6540cd96a4bcc52dbd4a9ec49127a1f9bdde26ca"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_guojing__ch02_youth_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "6dda0912ffe20515e847cf54dc77e7bd83e9ce977a205805effd6f7baf759a44"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_wangyuyan__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "cd6b69da364b28cfc91738d9647b8a94962e740cc8adbef303c721bfcf352bed"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_xiaolongnv__ch03_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "f45e437fad61090b11ba36df0779b783b1996e6a61942c019d49a121b7d9feae"}
composite_job: cg_ch02_junshan_succession.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch02_junshan_succession.resume3`；实际上传顺序见frontmatter，末两张为female项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
君山轩辕台，黄蓉夺回打狗棒并获得群丐认可的关键事件。她立在石台前，翠绿竹棒斜指地面，神情灵动而果决；郭靖台侧护持，青年贵公子杨康退入远景，群丐的目光向黄蓉聚拢。夜色、湖雾、少量火把，人物真实不魔幻。选择胜负已定后的静态瞬间，不臆画具体招数，实际站位待考；这是编辑性概括构图。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
第1张为npc_huangrong的本轮立绘；第2张为npc_guojing的本轮立绘。按各自骨相保持身份，严格禁止串脸、串服装；同一人多张图只代表一个人，人物动作和背景按剧情重绘。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「轩辕夺棒」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
君山轩辕台，黄蓉夺回打狗棒并获得群丐认可的关键事件。她立在石台前，翠绿竹棒斜指地面，神情灵动而果决；郭靖台侧护持，青年贵公子杨康退入远景，群丐的目光向黄蓉聚拢。夜色、湖雾、少量火把，人物真实不魔幻。选择胜负已定后的静态瞬间，不臆画具体招数，实际站位待考；这是编辑性概括构图。

右上角留白处单列自上而下竖排楷书题字“轩辕夺棒”，共4字，逐字正确、无多字、无其他文字；文字高度约画高四分之一，墨色温黑，旁可一枚无可读字的小朱印，不遮人物和道具。
```

## 原著与美术边界

取景、服色与站位为（原创扩展美术设计）；精确回目与动作时序（待考），以三联／广州修订版核对。
