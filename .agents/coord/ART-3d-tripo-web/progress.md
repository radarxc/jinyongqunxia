# ART-3d-tripo-web 进度（Tripo Studio 网页版建模 + 绑骨，AR-41）

更新：2026-10-03 11:55（Opus 5.5 子代理）

## 侦察结论
- 浏览器：作者 Chrome，Claude 标签组 tabId 1957635120，页面 https://studio.tripo3d.ai/workspace/generate 。
- 工具状况：**JS（javascript_tool）与真实点击/按键（computer left_click / key，坐标=CSS 像素）可用；截图 / read_page / find 在 *.tripo3d.ai 全部失败**（连 robots.txt 也失败：Script injection timed out / executeScript 等不到 document_idle），example.com 上截图正常。疑似扩展对 tripo3d.ai 的内容脚本注入受限。
- 账号：已登录；Premium 月付（2026-10-03 开通，有效至 2026-11-03，自动续费）。钱包 total_credit **25125**（其中 125 点 2026-11-01 过期）。顶栏红色「13」是通知角标（消息中心未读数），不是点数。
- 生成面板（Generate Model）：HD Model（H3.1 / H3.0 / H2.5）| Smart Mesh（Nexus-v2.0 低模）；输入方式 4 种：单图、多视图（Front / Left / Right / Back 四个槽）、批量图、文本。
- 高级设置（Geometry & Texture，会记住）：Ultra Mesh Quality(开) / AI Complete(关) / Texture(开) + 质量 2K/4K/8K(8K) / Remove Lighting(开) / PBR(开) / Topology Quad|Triangle(Triangle) / Polycount 500–2,000,000（默认 2,000,000）。另有 Members Only：Generate in Parts(试用×1，关)、8K Texture(开)。
- Privacy：Public / Private / Sharing Only（默认 Sharing Only）。Premium 有 GeneratePrivate 权限 → 选 **Private**（不额外收费）。
- 左侧工具栏：Image / Model / Segment / Fill Parts / Retopo / Smart UV / Texture / Edit / Upscale / PBR / **Rig** / **Animate**。
- 点数表（页面 config-store.algorithmConfig.credits）：GenerateWithTexture 25、GeometryQualityDetailed(Ultra Mesh) 15、TextureQualityExtreme(8K) 20、PBR 5 → **生成 65**（按钮显示 65，吻合）；**Rigging 20**、**Motion(动作) 20/个**、**Export 5/次**、Retopology_Triangle 5 / Quad 10 / SmartPoly 30、Segmentation 40。
- Premium 权限：多视图、私有、8K 导出、带动画导出、批量导出（≤10 个）均可。

## 预算
- 普通角色：生成 65 + 绑骨 20 + 导出 5 ≈ 90 点；主角另加 3 个动作 60 + 动画导出 ≈ 15。
- 31 位全做 ≈ 2,800 点；含重做 / 主角对比 ≈ 3,500–4,000 点。余额 25125，足够。

## 选项（拟定，男主角定稿后全体沿用）
- HD Model · H3.1 Best Quality · Ultra Mesh 开 · Texture 8K · PBR 开 · Remove Lighting 开 · Triangle · Polycount 100,000（2M 默认对游戏 / 仓库过大）· Privacy Private。

## 男主角多视图分配
- Front = 立绘 `assets/default/character/male/ch00/por_npc_zhujue__ch00_m_base.png`（正面）
- Left = `sheet_L.png` 中间人（纯侧面，人物朝画面左 = 露出角色左侧），裁成 scratchpad `m_side.png`
- Back / Right 留空（sheet 里的 back34 / front34 是 3/4 视角，不当正视图用）

## 12:05 进展
- 男主角：多视图版 project 5223c172 已绑骨（Humanoid / Mixamo，65 关节 mixamorig:*）+ idle / walk / run（预设动作 0 点）。单图对比版 aafbded0 只生成未绑骨。协调者认可选多视图版。
- 女主角：单图 project 39a2305f 已绑骨 + idle / walk / run。
- 页面内读 GLB（不落盘）核对：男 rig GLB 22.3 MB、99,466 三角 / 55,384 顶点、贴图 PNG 4.9 MB(normal) + JPEG 14.7 MB(base) + JPEG 1.7 MB(MR)；女 27.4 MB、96,389 三角。动作 GLB 只含骨架+单条动画：idle 15.33 s、walk 2.33 s、run 1.25 s（66 通道）。
- 上传方式：find / read_page / file_upload 在 tripo3d.ai 不可用；曾用 macOS 剪贴板粘贴上传（仅男主 2 张 + 女主 1 张），**协调者 12:02 要求停用剪贴板**，等作者修扩展权限或明确同意后再上传主要角色。页面里的 paste 拦截器已移除。

## 主要角色清单（参考图 = 主角精修新基线立绘，单图生成，选项同主角）
| # | 角色 | npc_id | 参考图 | 字节 | sha256 前 16 | 状态 |
|---|---|---|---|---|---|---|
| 1 | 萧峰（天龙八部） | `npc_xiaofeng` | `assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png` | 2478180 | `e73c1fd6abb1d97b…` | 待上传 |
| 2 | 段誉（天龙八部） | `npc_duanyu` | `assets/default/character/male/ch01/por_npc_duanyu__ch01_youth_shizi_base.png` | 2382285 | `deb0dd99a63cc050…` | 待上传 |
| 3 | 虚竹（天龙八部） | `npc_xuzhu` | `assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_lingjiu_base.png` | 2303729 | `6799d52c1d1f34d9…` | 待上传 |
| 4 | 郭靖（射雕英雄传） | `npc_guojing` | `assets/default/character/male/ch02/por_npc_guojing__ch02_youth_base.png` | 2482000 | `57054e6be892aafd…` | 待上传 |
| 5 | 黄蓉（射雕英雄传） | `npc_huangrong` | `assets/default/character/female/ch02/por_npc_huangrong__ch02_youth_bangzhu_base.png` | 2114198 | `829641448f1d48d8…` | 待上传 |
| 6 | 杨过（神雕侠侣） | `npc_yangguo` | `assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_onearm_base.png` | 2578590 | `7ddc89cedc26392a…` | 待上传 |
| 7 | 小龙女（神雕侠侣） | `npc_xiaolongnv` | `assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_jueqing_base.png` | 1997195 | `a6dd6fb0ff602f66…` | 待上传 |
| 8 | 张无忌（倚天屠龙记） | `npc_zhangwuji` | `assets/default/character/male/ch04/por_npc_zhangwuji__ch04_youth_jiaozhu_base.png` | 2385672 | `586da98f2896b5a2…` | 待上传 |
| 9 | 赵敏（倚天屠龙记） | `npc_zhaomin` | `assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_lvliu_base.png` | 2132155 | `84a0b35c2506f93b…` | 待上传 |
| 10 | 周芷若（倚天屠龙记） | `npc_zhouzhiruo` | `assets/default/character/female/ch04/por_npc_zhouzhiruo__ch04_youth_zhangmen_base.png` | 2213665 | `68f0c4016ce69fa2…` | 待上传 |
| 11 | 令狐冲（笑傲江湖） | `npc_linghuchong` | `assets/default/character/male/ch05/por_npc_linghuchong__ch05_youth_huashan_base.png` | 2550452 | `36e59d2ce0dee45a…` | 待上传 |
| 12 | 任盈盈（笑傲江湖） | `npc_renyingying` | `assets/default/character/female/ch05/por_npc_renyingying__ch05_youth_shenggu_base.png` | 2350988 | `52090f52c7434258…` | 待上传 |
| 13 | 石破天（侠客行） | `npc_shipotian` | `assets/default/character/male/ch06/por_npc_shipotian__ch06_youth_jinwu_base.png` | 2471464 | `4975d0e673eaebc5…` | 待上传 |
| 14 | 袁承志（碧血剑） | `npc_yuanchengzhi` | `assets/default/character/male/ch07/por_npc_yuanchengzhi__ch07_youth_jinshe_base.png` | 2313086 | `03311e21db44f6b0…` | 待上传 |
| 15 | 温青青（碧血剑） | `npc_wenqingqing` | `assets/default/character/female/ch07/por_npc_wenqingqing__ch07_youth_disguise_base.png` | 2271042 | `d753b0a2007da5fa…` | 待上传 |
| 16 | 韦小宝（鹿鼎记） | `npc_weixiaobao` | `assets/default/character/male/ch08/por_npc_weixiaobao__ch08_youth_bishou_base.png` | 2156711 | `a780fc55cdb9f467…` | 待上传 |
| 17 | 狄云（连城诀） | `npc_diyun` | `assets/default/character/male/ch09/por_npc_diyun__ch09_youth_rural_base.png` | 2419126 | `29a0dd869c462d23…` | 待上传 |
| 18 | 水笙（连城诀） | `npc_shuisheng` | `assets/default/character/female/ch09/por_npc_shuisheng__ch09_youth_travel_base.png` | 2160552 | `0536b980918b0808…` | 待上传 |
| 19 | 戚芳（连城诀） | `npc_qifang` | `assets/default/character/female/ch09/por_npc_qifang__ch09_youth_mother_base.png` | 2184437 | `3a3ba68c673e6fb8…` | 待上传 |
| 20 | 李文秀（白马啸西风） | `npc_liwenxiu` | `assets/default/character/female/ch10/por_npc_liwenxiu__ch10_youth_astuo_base.png` | 2100127 | `cd8225f8762b31a6…` | 待上传 |
| 21 | 萧中慧（鸳鸯刀） | `npc_xiaozhonghui` | `assets/default/character/female/ch11/por_npc_xiaozhonghui__ch11_youth_departure_base.png` | 2243425 | `5b91443efe8aa538…` | 待上传 |
| 22 | 袁冠南（鸳鸯刀） | `npc_yuanguannan` | `assets/default/character/male/ch11/por_npc_yuanguannan__ch11_youth_scholar_base.png` | 2300712 | `4bce7f1ecbadffd7…` | 待上传 |
| 23 | 陈家洛（书剑恩仇录） | `npc_chenjialuo` | `assets/default/character/male/ch12/por_npc_chenjialuo__ch12_youth_late_base.png` | 2248921 | `0a15d7a6cf8ae11a…` | 待上传 |
| 24 | 霍青桐（书剑恩仇录） | `npc_huoqingtong` | `assets/default/character/female/ch12/por_npc_huoqingtong__ch12_youth_early_base.png` | 2203913 | `aa96488680a5386b…` | 待上传 |
| 25 | 喀丝丽（书剑恩仇录） | `npc_kasili` | `assets/default/character/female/ch12/por_npc_kasili__ch12_youth_prepalace_base.png` | 2281137 | `14b7bfecaacb2376…` | 待上传 |
| 26 | 胡斐（飞狐外传） | `npc_hufei` | `assets/default/character/male/ch13/por_npc_hufei__ch13_youth_base.png` | 2442676 | `4abeeeb2e8b1877b…` | 待上传 |
| 27 | 程灵素（飞狐外传） | `npc_chenglinsu` | `assets/default/character/female/ch13/por_npc_chenglinsu__ch13_youth_alive_base.png` | 2307067 | `43a67daedf4b8dc7…` | 待上传 |
| 28 | 袁紫衣（飞狐外传） | `npc_yuanziyi` | `assets/default/character/female/ch13/por_npc_yuanziyi__ch13_youth_ziyi_base.png` | 2257632 | `ffa5d0c4d34d47d7…` | 待上传 |
| 29 | 苗若兰（雪山飞狐） | `npc_miaoruolan` | `assets/default/character/female/ch14/por_npc_miaoruolan__ch14_youth_base.png` | 2101402 | `69cf69c6e94077ac…` | 待上传 |

## 12:40 男女主角入库
- 看图验收（截图恢复后）：男多视图版四视角完整，左侧头发黑色无肉色块，骨架正确，idle/walk/run 播放正常；女单图版四视角完整，头发深色，骨架正确。
- 导出：GLB、贴图 2k（网页可选 512/1k/2k/4k/8k）、Export Skeleton 开；动作 GLB 每个只含 1 条动画、Animation stay in Place 开（Hips 仅 Y 向起伏）。**导出不扣点**（余额 24890 前后不变）。
- 提交：男 427fa2a1（model_rig 6,062,140 B / 65 关节 / 99,466 三角），女 3d3dc810（model_rig 6,319,852 B / 65 关节 / 96,389 三角）。
- 协调者 12:20：主要角色只先做黄蓉、小龙女（base 已通过）；其余 27 位等基线定稿。12:22 AR-45：主角高魅力形象（男侠客劲装、女白衣飘飘）等 2D 批准后用多视图做，目录 `…_m_charmhigh` / `…_f_charmhigh`。

## 13:20 黄蓉作废
- 黄蓉 project 685acbce 已生成（65）并绑骨（20，rig op f3a887c5，13:17 完成）后，协调者 13:19 转达作者：黄蓉基线要按李一桐版重画（眼睛大一些）→ 停，不导出。**已花 85 点作废**。等新基线文件名转来后重新生成。

## 13:45 小龙女绑骨失败
- 生成 v1（84f2eb0f，65 点）：完整，正面黑发，背面长发偏灰褐浅色发丝 → Free Retry（**免费**，tooltip「Retry generation for free…current version in model history」）得 v2（6508cd61，94,874 面），背发深褐，较好。
- 绑骨（Humanoid/Mixamo）3 次全部错位（各 20 点，共 60）：v2 两次骨架整体压缩在头部 1/3（Hips y=0.82、脚 y=0.65，网格高 0.98）；恢复 v1 后绑骨，手臂水平横在腰部、头骨朝下。页面内解析 GLB 关节世界坐标 + 骨架叠加截图双重确认。推测宽袖 + 长飘带 + 及腰长发让自动绑骨找不到手臂。
- 小龙女已花 125 点（65 + 60），停在这里等协调者决定。

## 14:06 协调者决定
- 小龙女走方案 B：10 号出图员按已通过 base 出 A 字姿势全身图（同服同脸、手臂离身约 30°、不拿飘带、头发收在身后、纯色背景）；路径转来后再生成 → 绑骨 → 导出。之前不花点。
- 以后主要角色都先出 A 字姿势参考图再建模（宽袖、长兵器、长发尤其）。
- 等待：小龙女 A 字图；主角高魅力形象三视图（AR-45，作者未批）；其余 27 位新基线。
- 记账：黄蓉作废 85 点；小龙女已花 125 点（v1 生成 65 + 绑骨 3×20），模型留在 Tripo project 83ecd9b8（当前版本 = v1 恢复 + 失败 rig），不导出。
- 已复核入库主角骨架（Python 解析 GLB）：男 Hips y0.515 / 头顶 0.99 / 脚 0.063；女 Hips 0.569 / 头顶 0.971 / 脚 0.079，与网格（0–0.98）吻合。

## 14:25 小龙女 A 字姿势版仍绑骨失败（已按指示停）
- A 字参考 `threeview/por_npc_xiaolongnv__ch03_youth_jueqing_apose.png`（a0f373ef）单图生成 project 96b40b34（65 点）+ Free Retry 一次（0 点，选 retry 版 941e8d0e，98,189 面）：完整、双臂离身、无飘带；背面长发仍偏灰褐（不是肉色）。
- 绑骨 b5880c3c（20 点）：骨架**上下颠倒**——Spine 绕 X 轴约 180°，脊柱/头朝下（头骨 y≈0.24、头顶 y≈-0.33），双腿朝上（脚 y≈0.93-0.95，人高 0.98）。早先 v1 恢复版那次（d4692681）也是同样的颠倒。推测：长裙下摆外扩，轮廓下宽上窄，自动绑骨把上下方向判反；宽袖垂在手臂下也加重误判。
- 小龙女累计 210 点（生成 65×2 + 绑骨 20×4），均未导出。已停，等协调者（窄袖 / 挽袖 / 下摆收窄的新参考）。

## 15:20 男角 5 位 + 赵敏 / 周芷若 入库；手动绑骨与修色调查
- 入库：萧峰 9f282723、虚竹 7038f0a6、郭靖 f5748992、杨过 fe01ad26（+7e4c29ce）、张无忌 c8146f63、小龙女 9959fed3、周芷若 5e91b450、赵敏 eae00a16。全部 A 字 / 窄轮廓参考，自动绑骨一次成功。
- 赵敏骨架 66 关节：65 个 mixamorig:* + 1 个 `neutral_bone`（挂 Armature 下，只绑头顶 1 个顶点），引擎侧可并到 Head。赵敏后脑一缕灰白发：Free Retry 一次后变小仍在，保留并写进 manifest。
- 杨过独臂：标准双臂骨架，空袖侧手臂骨收在空袖里。
- 预览白模：同页连续看多个 8K 模型后预览只剩白模（显存），整页刷新即恢复；之后每个模型前用 navigate 刷新，并用 sessionStorage 里的引导脚本恢复页面钩子。

### Tripo Studio 绑骨能力（协调者 14:22 要求调查）
- 绑骨页只有：Rigging Type（Humanoid / Other）、Skeleton Preset（ActorCore / Mixamo / UE5 Mannequin / VRM 1.0 Humanoid / Unity Humanoid Compatible）、Auto Rig 20 点（绑过后变 Retry 20 点）。**没有**手动放关节标记、翻转 / 校正方向、上传参考骨架。Other 只多一个 Skeleton 开关。
- 绑骨页提示「Use a T- or A-pose for best results.」点进去是 Generate Image 工具的 **T Pose 模板**（Nano Banana / GPT image 等），可把参考图转成 T 字姿势再建模；Premium 下显示 3 张 0 点（原价 30）。
- 版本历史（时钟图标）：每次生成 / 绑骨都是一个版本，可「Restore This Version」或「Save as a New Model」，绑坏了能回退到未绑骨版本重绑。
- 生成页「Free Retry」：对当前模型免费重新生成（不扣点，旧版本留在历史里）。
- 站外可选（未做，需作者账号 / 安装）：Adobe Mixamo 自动绑骨（手动放下巴 / 手腕 / 手肘 / 膝盖 / 裆部标记）、Reallusion AccuRIG（免费桌面版，可手调关节）、Blender 手工绑。
- 结论：宽袖 / 外扩长裙女角在 Tripo 内只能靠「窄轮廓 A 字参考」或「T Pose 模板图」解决。

### 贴图修色（Magic Brush，Edit 工具）
- Gen Mode（AI 局部重绘，5 点）：提示「Magic Brush does not support 8K textures yet. Edit in 4K mode, then enhance to 8K.」——我们的模型都是 8K，需先用 Texture 工具 4K 重贴图（30 点）再修，再 Upscale 回 8K。未执行。
- Paint Mode（手绘，免费）：有颜色 / 笔刷大小 / 强度（默认 20）/ 硬度、填充、橡皮、吸管；但用模拟拖拽时，起点不在细发丝网格上就变成转视角，画不准；未保存任何改动。
- 小龙女、赵敏的背发颜色问题保留，manifest 已写明。

## 16:15 段誉入库；小龙女修背发失败已回退
- 段誉（B 版基线 ee442606 → A 字参考 fb3ddd38，去扇子）：project 0a99ae9d，绑骨一次成功，提交 f78cc0dd（+a3e4efef 补 base sha256）。
- 小龙女修背发：前置确认版本历史可回退；4K 重贴图（Texture 工具，4K + Remove Lighting，20 点，op 08285df5）15:26 提交后一直 running 99%（47 分钟），16:14 判失败，用版本历史「Restore This Version」恢复 14:24 绑骨版（新 op 171a361b，rigging success）。局部重绘 / 升 8K 未做；花 20 点。协调者口径：赵敏不再试，两人背发保持现状。
- 修色路线备忘：Texture 工具 2K/4K/8K 重贴图分别约 ?/20/30 点；重贴图版本仍带 is_rigged=true（理论上不必重绑）；Magic Brush Gen Mode 只支持 ≤4K 贴图。

## 16:37 黄蓉 / 郭靖壮年入库；阶段报告
- 黄蓉（A 版基线 bc87bc91 → 窄轮廓 A 字 b2f441e6）：project a2ae3f7b，绑骨一次成功，提交 cdf8c61e。
- 郭靖壮年（base 96f0865c，窄袖直接用 base）：project 81fb5440，绑骨一次成功，入库 `model3d/npc_guojing__ch03_prime/`，提交 1a3cdd22。
- 阶段报告 `tools/agents/reports/ART-3d-tripo-web.md` 提交 ad04026c（13 套入库、点数、失败清单、建议）。
- 余额 23660（实扣 1465；流水合计 1485，有 20 点未扣）。
- 续做口径（协调者 16:2x）：19 位主角基线作者批了逐个转来；女角 / 宽袖男角用窄轮廓 A 字图，窄袖男角直接用 base；主角高魅力新图定了再转。
- 续做方法：页面钩子存在 sessionStorage `__claude_bs`，每次 navigate 后 `(0, eval)(sessionStorage.getItem('__claude_bs'))`；脚本 `scratchpad/tripo/{ingest.py,commit.sh,spec_common.py,write_manifest.py,glbinfo.py,joints.py}`。

## 19:20 整批完成
- 入库 37 套（见报告 §3）：19 位主角（AR-56 基线 + 空手窄轮廓 A 字图）、王语嫣、阿朱、阿青、高魅力男女主角（单文件动作）、早先 13 套。这一批 26 个模型绑骨全部一次成功。
- 普通形象男女主角补导单文件动作 anim_idle_walk_run.glb（b82e610e / 31b308b8），三个分文件留作备份。
- 余额 25125 → 21620（实扣 3505）。报告 tools/agents/reports/ART-3d-tripo-web.md 已提交（10d02fb9）。
- 续做：之后若有新基线 / A 字图，用 sessionStorage 引导脚本 + scratchpad/tripo/ingest2.py（meta_batch2.json 加一条）+ commit.sh；阿青模型用的是改脸前的 A 字图（c813207d 之前），等作者决定是否重做。

## 19:35 阿青换脸重做
- 输入 A 字参考 c813207d（AR-53 总审复核只改脸：剑眉、颧骨棱角），base 08a2a3fb（第 2 轮 B 版）。project 1ab2acee，生成 65 + 绑骨 20 = 85 点，绑骨一次成功（Hips 0.535、头顶 0.973、双手外展、脚 0.063）。
- 覆盖 model3d/npc_aqing__ch00_youth/，按文件分三次提交：model_rig.glb 0ac4882a、preview.png 406dd99a、manifest.yaml 43656bbf。旧版（4cf94b5e）备份在 replaced/npc_aqing__ch00_youth__4cf94b5e/，新旧并排图 replaced/aqing_old_vs_new.png。
- 余额 21620 → 21535。

## AR-65 · Tripo 网页版 JS 驱动（2026-10-04 PDT 10-03 晚）
- 提交：71587827 `tools/model3d/tripo_web.js`（window.__t）、899e2655 `tools/model3d/ingest.py`、2791603c `.claude/skills/tripo-web/SKILL.md`。
- 0 点验证（余额始终 21535）：余额 / 资产列表 / 项目详情 / 版本历史 / 进度；参考图 IndexedDB 暂存 + 纯 JS 上传（单图、多视图 Front/Right 槽），生成请求体 dry 与 10-03 实抓逐字段一致后清掉；绑骨、动作、Free Retry、回退 dry；关节体检（阿青 ok，小龙女两版坏绑骨判 fail）；后端导出（阿青单模型、男主三动作单文件命中缓存，sha256 与入库文件相同）；封面预览 studio_mesh 600×778。
- 下载：页面脚本第一次存盘落盘（已删），之后 Chrome 不再放行（疑似「下载多个文件」提示挂起）→ 已报协调者，等作者处理；驱动默认 reload 存盘方式（每文件整页刷新一次），作者允许后改 direct。
- 待办：作者定下载权限后验证 flushSave / direct 落盘，清掉补下的测试文件（tripo__npc_aqing__ch00_youth.glb/.webp/__rig.webp、tripo__dltest*.webp）。
- 21:15 协调者定：① 时区更正 → b71ab68e（6 套 22 条 created +08:00 → -07:00；其余 31 套本来就对）；SKILL 跟改 f270845c。② 预览统一换成 Tripo 白底封面（等下载权限）。
- 准备：e991d68e ingest.py 加 --preview-only；37 个项目都有 studio_mesh 封面（600×778，抽看 6 张与模型一致）；对照表 scratchpad/tripo/preview_map.json，拆包脚本 scratchpad/tripo/unpack_covers.py。
- 计划：权限定了以后在页面里一次取 37 张封面打成一个 JSON（tripo__covers_<日期>.json，只需 1 次下载；reload 方式也只要刷新 1 次）→ unpack_covers.py 逐个 --preview-only → 37 目录一个提交 → 删 JSON 和暂存。
- 21:58 仍未收到作者对下载权限的答复；~/Downloads 无 tripo 文件；Tripo 页停在 /workspace/generate、无上传残留。
- 22:32 作者处理了下载提示（实为「允许」）：先前被拦的 5 个测试文件 22:14 补下，核对后删除；direct 连续两个脚本下载都落盘 → 驱动默认改 direct（1a3a30f7），手册同步（f539d448），reload 留作备用（只验证到排队）。
- 22:33 预览统一：页面里一次取齐 37 张 studio_mesh 封面，打包下载 1 次（tripo__covers_20261003.json，10.7 MB，sha256 逐张核对）→ 新旧对照联系表目视 37 对全部同一角色 → unpack_covers.py 逐套 ingest.py --preview-only → 只改 preview.png 与 manifest 末尾 preview 条目（脚本逐套核对模型条目逐字不变）→ 一个提交 86c11ba7（74 个文件）。~/Downloads 已清空，余额 21535。
- 23:55 AR-79 体检完成（0 点）：.agents/coord/ART-3d-tripo-web/audit_ar79.md + audit_ar79/（37 张逐套图、脸部总览、男女排队、侧面轮廓核对、A 字图量尺）。离线渲染用 Claude 预览浏览器 + 本地 three.js（不占作者 Chrome），临时 launch.json 条目已删。
- AR-85：郭靖重做搁置；下一步做通用男女模型 npc_generic_m / npc_generic_f（等 A 字图入库）。
- 01:00 AR-85 收尾：通用男 bef08e9b、女 3b6ab305（170 点，余额 21365）；4 套主角动作文件修 run 整段偏移 4dbaf660（零点数）；TODO §3.6 日后参考 763e56cd。
- 交接：其余 3D 工作按 AR-85 搁置（AR-79 全量重做、郭靖 AR-74 B 装、换脸主角重做）。重开时从 .claude/skills/tripo-web/SKILL.md 读起：驱动 tools/model3d/tripo_web.js（生成 / 绑骨 / 动作 / 导出已真跑通）；比例先拉长（stretch_apose.py）、绑骨前量（measure_heads.py）；入库 ingest.py；动作导出后过 fix_anim_offset.py。体检材料 audit_ar79.md + audit_ar79/；离线渲染脚本在本会话 scratchpad，没进仓库。
