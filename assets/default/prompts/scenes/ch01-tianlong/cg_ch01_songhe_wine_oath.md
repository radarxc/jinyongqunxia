---
asset_id: cg_ch01_songhe_wine_oath
name: 松鹤豪饮
book: ch01_tianlong
characters: [npc_xiaofeng, npc_duanyu]
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_duanyu__ch01_youth_shizi_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch01/cg_ch01_songhe_wine_oath.png
manifest: assets/default/scene/ch01/manifest.yaml
size: 1536x1024
status: candidate
redo_reason: "作者 10-02 晚：复合基线风格精修"
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "e73c1fd6abb1d97bf1c2b8c275870a9bbcd45e93e8d1a669be99ae03b88c254f"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_duanyu__ch01_youth_shizi_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "f2f26705b81f9f769f0cae736d10c037a66da4cbafed57d55c8e602748a9112e"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
composite_job: cg_ch01_songhe_wine_oath.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch01_songhe_wine_oath.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
无锡松鹤楼，萧峰与段誉饮酒初识。萧峰灰褐粗袍、魁伟豪爽；段誉青色长衫、温雅书卷气，二人隔朴素木桌各举陶酒碗，桌上酒坛和小菜。窗外水乡屋瓦、木栏、暖日斜照。只画饮酒相识，不把正式结拜移进酒楼；概括构图为原创扩展。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
上传人物图仅保持各自身份和骨相，衣物背景按剧情重绘，严禁串脸；同一人的基础与阶段图只代表一个人。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「松鹤豪饮」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
松鹤楼饮酒相识，萧峰与段誉隔木桌举陶碗；只画初识，不把正式结拜移进酒楼。横幅1536×1024，成年手绘人物，右上竖排楷书「松鹤豪饮」。本轮新基础参考用于锁定两人的身份，实际生产提示词在入库时记入本节。
```

## 原著与美术边界

饮酒相识为原著情节；本画面机位、服色与站位为**（原创扩展构图）**，精确回目**（待考）**。网页交叉核对：[段誉人物经历](https://zh.wikipedia.org/wiki/段誉)（访问2026-10-02）；三联／广州修订版逐字校勘仍待考。来源仅用于阶段与选景，不据此声称精确回次已核定。
