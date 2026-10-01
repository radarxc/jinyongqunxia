# VFX-sk_anran 报告 · 招式特效 · 天级 黯然销魂掌（sk_anran，18 招）

## 1. 摘要（3–6 行）

- 完成 18 招：15 普通招共用家族图，3 绝招各有独立效果套；全数 candidate。
- 内置 image_gen 共生成 5 张候选，4 张入选白底四帧图，经 cut_frames.py 导出 16 张 RGBA 帧。
- 每招已交付 Composition YAML / JSON、peak.png、Three.js demo.html；三项指定检查全部退出 0。
- 图鉴本门 18 招全部未标外放；按近身 / 自指 / 到位后接触制作，未添加 projection 或玩法范围。

## 2. 产出（文件、行数、主要章节）

以下资产路径相对 `assets/default/vfx/sk_anran/`；资产目录共 118 文件，另有本报告。

| 文件 | 行数 / 数量 | 内容 |
|---|---:|---|
| `effect/{family,mv_anran_daimu,mv_anran_xiangru,mv_anran_xiaohun}/` | 4×10 文件；YAML 各 72 行 | 原图、4 帧、EffectSet、quality.json、黑灰白三底预览 |
| `moves/<mv_id>/` | 18×4 文件 | YAML 各34行、JSON各188行、HTML各497行、1536×1024峰值 |
| `manifest.yaml` | 1197 行 / 22 主条目 | 4 原料 + 18 招；来源、提示词、候选、哈希、依赖与附件完整性 |
| `README.md`、`source_requests.json` | 84 / 48 行 | 查看与复现、几何节奏、原创/待考边界；实发提示词及来源 |
| `measurements.json`、`move_notes.json`、`geometry_checks.json` | 各1行结构化 JSON | 量图、逐招选择、全帧几何验证 |

## 3. 关键结论与数值

- 18=15+3；原著十七招与游戏第十八招区分。全套阴青水墨、normal；青色和具体轮廓均（原创扩展）。
- 全部母版1536×1024，E=[650,512]，掌图0.5倍；近身 L=1×256=256px，自指局部 L=160/192px【建议值】。六神不安自指0、单片段256px。
- 例：心惊肉跳 sx=256/655≈0.39084，sy=0.5×320/133≈1.20301，效果根宽160px=掌面截面160px；绝招纵向修正1.10/1.25/1.15，仅放宽图形。
- 普通 pulse=0.10+0.15+0.25+0.10=0.60s；绝招 wave=0.15+0.20+0.40+0.15=0.90s；峰值phase0.5，循环另加0.40s；不改变CT或伤害段。
- HTML 1,530,622–2,607,215 bytes，18/18≤3,000,000，全部原尺寸无损WebP内嵌；保守全帧安全边距最小140.62px，留白下界最小65.74%。
- 16帧8px边框残留率与残白率均0；white_key=100后最大白底重建误差0.6622/255。原料白边不足32px及原始根漂移超2px的建议偏差见§4。

## 4. 开放问题（附默认值）

| 事项 | 默认值 / 当前事实 |
|---|---|
| 作者造型、掌姿、四帧连贯性 | 沿用候选与共享掌图，未冒充 approved；具体人物左右手仍（待考） |
| 原料边距 / 根部跨帧漂移 | family/呆/想最小17/9/10px，低于32px建议；纵向锚点跨度24/19/9/8px，超过2px建议；已逐帧量取并由既有合成器对齐，无裁断，不假称原图已达建议值 |
| 浏览器 / 真机 / CDN | 未实跑浏览器、未核实CDN及传递模块可达性；默认保留指定r186 importmap和静态首屏，动态色彩/性能（待实测） |
| 范围缺写 / 多段接线 | 倒行逆施仅写aoe_behind r2，默认接触示意1；自指与周边图只为局部片段。多目标、多段、位移、反击由Core动作事件接线 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无新增。沿用上游 VFX-P01（design/23 制作子契约归属）等待协调处理；本次不新增玩法事实或修改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `docs/design/catalog/skills-daojia.md` | §4.3 倒行逆施等省略range的卡片 | 下游补明确range；本轮不将aoe半径视作射程、不回填示意值 |
| `docs/tech/02-rendering.md` / 运行时接入 | 动作挂点与表现队列 | 接入共享掌与原料；多段/周边/随机落点按已有Core事件分发，禁止用四帧数推导伤害次数 |
| `tools/vfx/build_demo.py` / 工具任务 | 固定标题与画布 aria-label | 现有生成器对非外放片段也写“外放样例/外放招式预览”；建议改中性“招式”文案，本轮按要求未改工具或其生成结果 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

下表 mv 均带 `mv_anran_` 前缀；效果套 F=`family`，其余与完整mv同名。长度单位px，节奏为模板 / 总秒数；外放“否”沿图鉴。

| mv | 绝招 | 外放 | 效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| mv_anran_daimu | 是 | 否 | mv_anran_daimu | 256 | wave / 0.90 |
| mv_anran_daoxing | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_feiqin | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_guxing | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_libucongxin | 否 | 否 | F | 160 | pulse / 0.60 |
| mv_anran_liushen | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_mianwu | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_paihuai | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_qiongtu | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_qiren | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_tuoni | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_wuzhong | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_xiangru | 是 | 否 | mv_anran_xiangru | 256 | wave / 0.90 |
| mv_anran_xiaohun | 是 | 否 | mv_anran_xiaohun | 256 | wave / 0.90 |
| mv_anran_xingshi | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_xinjing | 否 | 否 | F | 256 | pulse / 0.60 |
| mv_anran_yinhen | 否 | 否 | F | 192 | pulse / 0.60 |
| mv_anran_yongren | 否 | 否 | F | 256 | pulse / 0.60 |

| 原料清单（各含source_sheet.png＋4 RGBA帧） | 候选数 → 入选 | 原创意象 |
|---|---|---|
| effect/family | 1→1 | 低回卷袖状掌风 |
| effect/mv_anran_daimu | 1→1 | 凝滞短钝弧面、紧绷墨纹 |
| effect/mv_anran_xiangru | 1→1 | 交错飘带掌劲，不以飘带数定义五段命中 |
| effect/mv_anran_xiaohun | 2→1（候选2） | 双褶分离的空缺；候选1上下串格淘汰 |

- ✅ 5张候选均生成后目视，4张入选原件均view_image；黑底切帧和心惊/销魂两峰值已view_image，无明显白边、掌面断口或反向；原图逐字节来源核对通过。
- ✅ 指定 `check_skill_suite.py … --catalog docs/design/catalog/skills-daojia.md`：0问题；`check_assets.py … --min 1 --max 60 --min-side 256`：22图片/22条目/0问题。
- ✅ 指定 `check_ids.py --strict`：strict failure=0，new=0；已有 `sk_babuganchan` 未定义豁免1条保留。以上三项均退出0。
- ✅ 18招均由 compose.py / build_demo.py 本次重建成功；套件门禁核对YAML、派生JSON、effect/emitter与附件完整性；仅指定Three.js显式外链，无烘焙动画帧。
- ✅ 掌PNG SHA-256=`f0e83e6586baae3f7ece37510fcec6b9c75d3401a217bffd703bb4bb0f07322c`；PNG及共享YAML均与HEAD逐字节一致，未复制、改写。
- ⚠️ 原著依据沿图鉴：三联/广州修订版《神雕侠侣》杨过与周伯通切磋、救郭襄段落；招名版本/次序/心境仍（待考），未编回目或引文。青色、四套形态与第十八招总汇命名均（原创扩展）；需作者确认项默认沿用§4。
- ✅ 只写指定资产目录与本报告；无git状态变更命令、无工具或设计文档修改；分段写入、全文检查无截断/占位。浏览器动态与真机未测，不以静态门禁代替。
