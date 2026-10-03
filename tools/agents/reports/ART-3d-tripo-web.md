# ART-3d-tripo-web 报告 · Tripo Studio 网页版建模 + 绑骨（AR-41）· 阶段报告（截至 2026-10-03 16:35）

## §1 结论
- 作者 Chrome（Claude in Chrome 扩展）+ Tripo Studio 网页版（Premium 账号）跑通：单图 / 多视图生成 → Humanoid·Mixamo 自动绑骨 → GLB 导出 → 入库提交。全程未用 API，未读 `.env`，也没用 codex。
- 已入库 13 套模型，放在 `assets/default/model3d/<npc_id>/`（model_rig.glb + preview.png + manifest.yaml，status candidate），共 114 MB：男女主角（各带 idle/walk/run 三个动作 GLB）和 11 位主要角色（其中郭靖分青年、壮年两套）。
- 男主角头发问题已解决：多视图（正面立绘 + 侧面三视图）版左侧头发为黑色，没有肉色块。
- 关键经验：自动绑骨对轮廓很敏感。宽袖、外扩长裙或手持长物的女角会绑错，出现骨架缩在头部或上下颠倒；改用窄轮廓 A 字参考图（束袖、直筒裙、露鞋尖、双臂离身约 30°）后，女角都一次绑对。
- 剩余 19 位主要角色等作者批新基线，主角高魅力形象（AR-45）等新 2D，详见 §5。

## §2 选项与每步点数
- 生成：HD Model · H3.1 Best Quality（v3.1-20260211）；Ultra Mesh 开，Texture 8K，PBR 开，Remove Lighting 开，Triangle，面数上限 100,000，Private，不分件。**65 点**（GenerateWithTexture 25 + Ultra Mesh 15 + 8K 20 + PBR 5）。
- 绑骨：Rigging Type Humanoid，Skeleton Preset Mixamo（mixamorig:*，65 关节），模型版本 v3.0-20260909。**20 点**，重试也是 20 点。
- 预设动作（Animate → Preset，biped idle/walk/run）**0 点**；导出（GLB、2k 贴图、Export Skeleton 开）**0 点**；生成页 **Free Retry 0 点**（旧版本留在历史里）。
- 重贴图（Texture 工具）：4K 20 点，8K 30 点。Magic Brush 局部重绘 5 点，但不支持 8K 贴图。
- 导出的动作 GLB 每个都带一整份网格，约 6 MB。导出面板的「Number of Animations」可以勾多条，下次做主角高魅力形象时导成一个多段动画 GLB。

## §3 逐位结果（GLB = model_rig.glb；预览 = 同目录 preview.png）
| 书 | npc_id | Tripo project | 重做 | 点数 | 关节 | GLB | 结论 |
|---|---|---|---|---:|---:|---:|---|
| 越女剑 | npc_zhujue__ch00_m | 5223c172（多视图） | 0（另做单图对比版 aafbded0，未选） | 150 | 65 | 6.06 MB | 合格；另有 anim_idle/walk/run（15.3/2.3/1.25 s，原地） |
| 越女剑 | npc_zhujue__ch00_f | 39a2305f | 0 | 85 | 65 | 6.32 MB | 合格；带三个动作 GLB |
| 天龙 | npc_xiaofeng | f0afb746 | 0 | 85 | 65 | 6.38 MB | 合格 |
| 天龙 | npc_duanyu | 0a99ae9d | 0 | 85 | 65 | 5.60 MB | 合格（B 版基线，A 字图去掉折扇） |
| 天龙 | npc_xuzhu | 1995ecb7 | 0 | 85 | 65 | 5.95 MB | 合格 |
| 射雕 | npc_guojing | 2ee1d4a7 | 0 | 85 | 65 | 6.07 MB | 合格（ch02 青年） |
| 神雕 | npc_guojing__ch03_prime | 81fb5440 | 0 | 85 | 65 | 6.35 MB | 合格（窄袖，直接用 base 生成） |
| 射雕 | npc_huangrong | a2ae3f7b | 1（旧基线版 685acbce 作废） | 170 | 65 | 5.89 MB | 合格（A 版新基线，窄轮廓 A 字图） |
| 神雕 | npc_yangguo | 69bc599d | 0 | 85 | 65 | 6.79 MB | 合格；独臂一侧的臂骨收在空袖里 |
| 神雕 | npc_xiaolongnv | 1f087cd3 | 3（宽袖版绑 3 次、宽裙 A 字版绑 1 次都失败） | 315 | 65 | 5.78 MB | 合格；背发偏灰褐（修色失败，保留原样） |
| 倚天 | npc_zhangwuji | 829f322f | 0 | 85 | 65 | 5.63 MB | 合格 |
| 倚天 | npc_zhaomin | d88ff8c9 | Free Retry 1 | 85 | 66 | 5.80 MB | 合格；多一个 neutral_bone（只绑 1 个顶点）；后脑有一缕灰白发 |
| 倚天 | npc_zhouzhiruo | 11257841 | 0 | 85 | 65 | 6.22 MB | 合格 |
- 提交：427fa2a1 3d3dc810 9f282723 f78cc0dd(+a3e4efef) 7038f0a6 f5748992 1a3cdd22 cdf8c61e fe01ad26(+7e4c29ce) 9959fed3 c8146f63 eae00a16 5e91b450。
- 骨架核对：每个 GLB 都用 Python 解析了关节世界坐标，并和截图叠加对照。网格高度统一归一化到约 0.98（Tripo 单位），Hips 约 0.51–0.55，脚约 0.06–0.08。

## §4 余额
- 开工前 25125（Premium 月付，到 2026-11-03）→ 现在 23660，实扣 1465 点。逐项流水合计 1485 点，有一笔 20 点没扣（可能是郭靖壮年那次绑骨，也可能是卡住的重贴图被退回）。

## §5 未做 / 失败清单
- 等作者批新基线（19 位）：令狐冲、任盈盈、石破天、袁承志、温青青、韦小宝、狄云、水笙、戚芳、李文秀、萧中慧、袁冠南、陈家洛、霍青桐、喀丝丽、胡斐、程灵素、袁紫衣、苗若兰。
- 等 2D：主角高魅力形象男、女（AR-45，作者要求重画脸），入库目录定为 `npc_zhujue__ch00_{m,f}_charmhigh/`。
- 作废：黄蓉旧基线版 85 点；小龙女宽袖版和宽裙 A 字版共 210 点；小龙女 4K 重贴图卡在 99% 达 47 分钟，判失败并回退，20 点。
- 已知瑕疵：小龙女背发偏灰褐，赵敏后脑一缕灰白发（都不是肉色），都已写进 manifest notes。

## §6 建议
1. 女角、宽袖男角和手持长物的角色，一律先出窄轮廓 A 字参考图（束袖、直筒裙、露鞋尖、空手、双臂离身约 30°、纯色背景）再建模；窄袖男角可以直接用 base 立绘。
2. Tripo 绑骨页没有手放关节或校正功能。绑坏了用版本历史回退到生成版再绑，或者用生图的 T Pose 模板（Premium 0 点）先改姿势。站外可以用 Mixamo 或 AccuRIG 手放标记（需作者账号或安装）。
3. 引擎接入要注意：模型是归一化尺寸，要按角色身高缩放；赵敏的 neutral_bone 并到 Head 处理；杨过空袖一侧的臂骨不驱动；导出贴图是 2k，云端原件是 8K，需要时可以重导。
4. 操作要点：同一页面连看多个 8K 模型后预览会变白模，整页刷新即可；Chrome 窗口不能最小化（否则页面 hidden、不渲染）；上传用 find + file_upload。
