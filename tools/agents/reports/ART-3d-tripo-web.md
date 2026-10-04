# ART-3d-tripo-web 报告 · Tripo Studio 网页版建模 + 绑骨（AR-41 / AR-45 / AR-56）· 2026-10-03 19:20

## §1 结论
- 在作者的 Chrome 里用 Tripo Studio 网页版（Premium 账号）走完了整条流程：单图或多视图生成 → Humanoid·Mixamo 自动绑骨 → 导出 GLB → 入库提交。没用 API，没读 `.env`，也没用 codex。
- 共入库 **37 套**，放在 `assets/default/model3d/<npc_id>/`（model_rig.glb + preview.png + manifest.yaml，status candidate），总计 282 MB，`~/Downloads` 无残留。清单如下：
  - 普通形象男女主角、高魅力形象男女主角（共 4 套，都带 idle / walk / run 动作）；
  - 19 位主角（本次批准的基线）+ 王语嫣、阿朱、阿青；
  - 早先的萧峰、段誉、虚竹、郭靖（青年、壮年各一套）、黄蓉、杨过、小龙女、张无忌、赵敏、周芷若。
- 动作格式统一为单文件 `anim_idle_walk_run.glb`（一个文件含三段动画）；普通形象原来的三个分文件留作备份，manifest 已注明。
- 关键经验：女角、宽袖男角和手持兵器的角色，先出「空手窄轮廓 A 字图」再建模，自动绑骨就能一次成功。这一批 26 个模型绑骨全部一次成功。

## §2 选项与每步点数
- 生成：H3.1 Best Quality（v3.1-20260211），Ultra Mesh、8K 贴图、PBR、去光照都开，Triangle，面数上限 10 万，Private。每次 **65 点**。
- 绑骨：Humanoid + Mixamo，65 个 mixamorig:* 关节（rig v3.0-20260909）。每次 **20 点**，重试也是 20 点。
- 不收点：预设动作、导出（GLB、2k 贴图、带骨架）、生成页的 Free Retry。
- 每个角色一般 85 点。

## §3 逐位结果（GLB 大小单位 MB；关节数都是 65，唯一例外是赵敏 66）
| npc_id | Tripo project | 提交 | GLB | 三角 | 备注 |
|---|---|---|---:|---:|---|
| npc_zhujue__ch00_m | 5223c172 | 427fa2a1 / b82e610e | 6.06 | 99,466 | 多视图生成；动作单文件 6.54 MB |
| npc_zhujue__ch00_f | 39a2305f | 3d3dc810 / 31b308b8 | 6.32 | 96,389 | 动作单文件 6.80 MB |
| npc_zhujue__ch00_m_charmhigh | 58935529 | 2fe15fb4 | 5.96 | 98,304 | 三视图切成三张做多视图；动作单文件 6.44 MB |
| npc_zhujue__ch00_f_charmhigh | 51dec492 | e7a7a18b | 5.47 | 96,916 | 窄轮廓 A 字图生成，宽袖收成束袖；动作 5.95 MB |
| npc_xiaofeng / npc_duanyu / npc_xuzhu | f0afb746 / 0a99ae9d / 1995ecb7 | 9f282723 / f78cc0dd / 7038f0a6 | 6.38 / 5.60 / 5.95 | — | A 字图 |
| npc_guojing / npc_guojing__ch03_prime | 2ee1d4a7 / 81fb5440 | f5748992 / 1a3cdd22 | 6.07 / 6.35 | — | 壮年版直接用 base |
| npc_huangrong | a2ae3f7b | cdf8c61e | 5.89 | 93,406 | 旧基线做的版本作废（85 点） |
| npc_yangguo | 69bc599d | fe01ad26 | 6.79 | 97,468 | 独臂一侧的臂骨收在空袖里 |
| npc_xiaolongnv | 1f087cd3 | 9959fed3 | 5.78 | 97,547 | 宽袖、宽裙两版绑骨失败（210 点）；背发偏灰褐 |
| npc_zhangwuji / npc_zhaomin / npc_zhouzhiruo | 829f322f / d88ff8c9 / 11257841 | c8146f63 / eae00a16 / 5e91b450 | 5.63 / 5.80 / 6.22 | — | 赵敏多一个 neutral_bone，后脑有一缕灰白发 |
| npc_aqing__ch00_youth | 26a4de40 | 4cf94b5e | 6.10 | 96,036 | 用的是改脸（c813207d）之前的 A 字图 |
| npc_shipotian__ch06_youth | 0ce10722 | 5c3b43f8 | 6.53 | 99,774 | 直接用 base；佩刀和网格是一体的 |
| npc_renyingying__ch05_youth | 441bf372 | f50113ad | 6.03 | 95,068 | |
| npc_wenqingqing__ch07_youth | 17a95a55 | 303b49fd | 5.93 | 95,634 | 免费重做 1 次；背后灰绿长条是头巾垂带 |
| npc_shuisheng__ch09_youth | ec747681 | 29baf3d6 | 5.45 | 95,302 | 免费重做 1 次；后发仍偏灰褐 |
| npc_qifang__ch09_youth | c8644f98 | 8694ab70 | 5.71 | 92,526 | |
| npc_liwenxiu__ch10_youth | b54b9839 | 7e8110b7 | 5.98 | 94,898 | |
| npc_xiaozhonghui__ch11_youth | 8933d59c | fc2739e4 | 6.18 | 93,548 | |
| npc_huoqingtong__ch12_youth | 85be8a48 | 6916b1a3 | 5.72 | 95,088 | 帽上翠羽跟着头骨一起动 |
| npc_kasili__ch12_youth | 524a5119 | f299376a | 5.78 | 96,222 | |
| npc_chenglinsu__ch13_youth / npc_yuanziyi__ch13_youth | bb8a4f76 / e7ea308a | e619ac90 / d6604b0f | 6.08 / 5.62 | — | |
| npc_miaoruolan__ch14_youth | 1c8464e3 | 80d2e4d8 | 5.96 | 89,296 | |
| npc_wangyuyan__ch01_youth / npc_azhu__ch01_youth | 15ec351f / 625326d3 | be77d527 / 306fa6ed | 5.92 / 5.64 | — | 新脸版 |
| npc_linghuchong__ch05_youth / npc_yuanchengzhi__ch07_youth | 0e608a8a / 0f64c57b | 31e883dd / 80aa573c | 6.01 / 5.69 | — | 空手 A 字图 |
| npc_yuanguannan__ch11_youth / npc_chenjialuo__ch12_youth | 323ad70c / 3d52b7b9 | 09097cd3 / cf804288 | 6.23 / 6.02 | — | 清代剃额、背后辫子 |
| npc_weixiaobao__ch08_youth / npc_hufei__ch13_youth / npc_diyun__ch09_youth | bf3d1396 / 283cd5b3 / 5e02e099 | 050730bd / 32a22860 / 791e00d0 | 5.86 / 6.01 / 6.45 | — | 空手 A 字图 |
- 每个模型都用 JS 解析关节世界坐标做了检查（髋 y 0.51–0.57，头顶在头骨之上，双手外展，脚 y 0.055–0.08），再和四视角截图对照；网格高度统一归一化到约 0.98。

## §4 余额
- 25125 → **21620**，实扣 **3505 点**，共 41 次生成、42 次绑骨、1 次 4K 重贴图，导出和动作都没扣点。
- 没进库的花费 380 点：黄蓉旧版 85、小龙女两版失败 210、修发失败 20、男主单图对比版 65。逐项流水合计 3525 点，比实扣多 20 点，原因不明（可能是卡住的重贴图被退回）。

## §5 未做 / 失败清单
- 已知瑕疵（都已写进 manifest）：小龙女、水笙后发偏灰褐；赵敏后脑一缕灰白发；高魅力女主宽袖收成了束袖。
- 修发失败：Magic Brush 局部重绘不支持 8K 贴图；4K 重贴图又卡在 99%，已回退。
- 阿青的 A 字图在我建模后改过脸（c813207d），模型用的是改前那张，等作者看了模型再决定是否重做（约 85 点）。

## §6 建议
1. 建模输入一律用「空手窄轮廓 A 字图」（束袖、直筒裙、露鞋尖、双臂离身约 30°）；窄袖、空手的男角可以直接用 base。
2. Tripo 不支持手动绑骨。绑坏了就用版本历史回退到生成版重绑，或者用 Free Retry、T Pose 模板图重做。
3. 引擎接入要注意：按角色身高缩放模型；赵敏的 neutral_bone 并入 Head；杨过空袖那侧的臂骨不驱动；兵器要单独挂（石破天的佩刀是网格的一部分，接入时要考虑）；导出贴图是 2k，需要时可以从云端重导 8K。
4. 目录命名现在有两套（npc_xiaofeng 和 npc_shipotian__ch06_youth 并存），建议工程接入时统一，或者在索引里映射。
