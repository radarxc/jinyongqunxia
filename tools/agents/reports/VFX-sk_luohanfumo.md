# VFX-sk_luohanfumo 报告 · 招式特效 · 天级 罗汉伏魔神功（sk_luohanfumo，4 招）

## 1. 摘要（3–6 行）

- 完成家族、护体、诸相三套 image_gen 白底四帧原料，切出 12 张 RGBA，全部 `candidate`。
- 四招各交付 Composition YAML / JSON、1536×1024 峰值及 Three.js 演示；每个 HTML ≤3 MB。
- 仅伏魔真气为外放；周流 / 护体为自身，诸相为近身周围招，保持图鉴 `harmony / inner`。
- 直接引用共用 palm；源图与 YAML 和 HEAD 逐字节相同，未复制、修改发出方。
- 三项指定检查及四招 VFX 静态检查通过；原著逐字核对、浏览器和真机未完成，详见 §4。

## 2. 产出（文件、行数、主要章节）

路径相对 `assets/default/vfx/sk_luohanfumo/`；套件共 42 文件，约 19.44 MB，本报告另计。

| 文件 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| `effect/*/source_sheet.png`、`frame_*.png` | 3 原件 + 12 RGBA | 1536×1024 白底 2×2 图，单帧 768×512 |
| `effect/*/effect-set.yaml`、`quality.json` | 各 3；YAML 各 72 行 | 显式裁格、实测锚点、去白、逐帧质量 |
| `moves/*/composition.yaml`、`composition.json` | 各 4；分别 33 / 187 行 | 两部分引用、几何、节奏及脚本导出元数据 |
| `moves/*/peak.png`、`demo.html` | 各 4；HTML 各 497 行 | 静态峰值、内嵌原料实时合成 |
| `manifest.yaml` | 395 行 / 7 条 | 3 原料 + 4 招；41 个非 manifest 文件完整性记录 |
| `README.md`、`source_requests.json` | 83 / 42 行 | 原著边界、参数算式、复现 / 完整实发提示词与候选来源 |
| `measurements.json`、`verification.json` | 161 / 103 行 | 逐帧根部量法 / 三底目检、几何、原件和共享图核对 |

## 3. 关键结论与数值

- 演示发劲宽 `W=320×0.6=192 px`，方向 0°；外放真气 `L=range.max×256=3×256=768 px`，三档均 `aoe_single`，不扩展横向范围。
- 周流局部长 `W=192`、护体 `2W=384`；诸相局部参考半径 `1×256=256 px`，三者 `range_hex=0`，不反推玩法射程。
- 根宽 / 参考长：family `251 / 572`、护体 `302 / 562.5`、诸相 `131 / 240.5`；诸相 `scaleY=(256/240.5)/(192/131)=0.7262647263` 保持圆形，关闭方向遮罩。
- 普通 pulse=`0.10+0.15+0.25+0.10=0.60 s`；绝招 wave=`0.15+0.20+0.40+0.15=0.90 s`，峰值分别 `5/12`、`7/18`；不换算 CT。
- 12 帧 8 px 边框残留 / 半透明白边比均 0，白底重建最大误差约 `1.01454/255 < 2/255`；最小几何安全边距 134.6 px，保守留白下界 43.716%。
- HTML：护体 2,339,477、真气 2,260,985、周流 2,086,237、诸相 2,129,349 bytes；均原尺寸无损 WebP 内嵌，唯一显式外链为规定 Three.js r186 importmap。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| 金墨审美与局部尺度 | 沿用本批造型、screen / 深墨底及所列尺寸；白底反解后淡金偏饱和，全部保留 candidate |
| 原件底色与边距 | 角落 254–255 近白按阈值 250 去底；三套最小有效留白 31 / 26 / 28 px，低于 32 px 建议但无触边，默认保留 |
| 根部与连续性 | 逐帧实测锚点对齐，原图并非漂移≤2 px；默认四帧叠化，连续播放与轮廓过渡（待实测） |
| 原著依据 | 三联 / 广州修订版《侠客行》泥人数量、图中文字、石破天习得顺序及显色（待考）；默认造型与招名均按原创扩展 |
| 实机与挂点 | 浏览器 / CDN 模块 / WebGL / 移动端混合未实跑；自身气场接真实角色挂点，掌图仅作演示，默认交下游 |
| 模型信息 | 工具未返回图像模型 / effort / 精确生成时刻；如实登记未返回 / 默认及任务日期，不虚构参数 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无。仅制作表现层素材，未改品阶、性质、射程、经脉、Buff 或伤害规则。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 文件 | 位置 | 改什么 |
|---|---|---|
| 素材审核页 / 展示索引 | 本门四招 | 收录 manifest 与四个 demo；后续按作者结论更新状态 |
| `assets/default/vfx/bindings.yaml`、`docs/tech/02-rendering.md` | 本门 inner 绑定与角色挂点 | 区分现有 `emitter:null` 的运行时语义与 palm 独立演示，按自身 / 近身 / 外放事件接入 |
| `tools/vfx/build_demo.py` | 通用 title / aria-label | 自身招仍显示“外放样例 / 外放招式预览”，建议后续改为中性“招式”；本任务未改工具 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 用的效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_luohanfumo_huti` | 是 | 否 | `mv_luohanfumo_huti` | 384 px，局部 | wave / 0.90 s |
| `mv_luohanfumo_zhenqi` | 否 | 是 | `family` | 768 px，3 格示意 | pulse / 0.60 s |
| `mv_luohanfumo_zhouliu` | 否 | 否 | `family` | 192 px，局部 | pulse / 0.60 s |
| `mv_luohanfumo_zhuxiang` | 是 | 否 | `mv_luohanfumo_zhuxiang` | 256 px，局部参考半径 | wave / 0.90 s |

| 原料清单（均为 source_sheet.png） | 候选数 → 入选 | 造型依据 |
|---|---:|---|
| `effect/family/` | 1 → 1 | 调和金色回卷双流（原创扩展） |
| `effect/mv_luohanfumo_huti/` | 1 → 1 | 护体招名意象的层叠气罩（原创扩展） |
| `effect/mv_luohanfumo_zhuxiang/` | 1 → 1 | 诸相招名意象的多瓣周向气旋（原创扩展） |

- ✅ 原著依据只引用图鉴 §2.2 的石破天与泥人经脉图传承摘要；显色无可靠逐字书证，依 harmony 取金色，未编造引文、回目或原著招名。
- ✅ 三套均用内置 image_gen，各只出 1 候选；原件经 view_image 自查、逐字节入库，再由 cut_frames.py 切为 4 帧 RGBA。普通招复用家族，绝招各有独有造型。
- ✅ 三套黑 / 灰 / 白预览及四张峰值均经 view_image；根部连着掌面、方向或周向局部展开可辨，未见明显白边；临时预览已清理。
- ✅ `check_skill_suite.py … --catalog docs/design/catalog/skills-xiake-bixue.md`：退出 0、0 问题，四招四件套齐全。
- ✅ `check_assets.py … --min 1 --max 60 --min-side 256`：退出 0、7 图 / 7 条 / 0 问题；四招均 pipeline: two-part，七条均 candidate。
- ✅ `check_ids.py --strict`：退出 0、新问题 0、strict failure 0；仓库既有 sk_babuganchan 未定义引用已在基线豁免，本任务未修改。
- ✅ 四招 check_vfx.py 均 valid、全帧几何通过；4 HTML 各含 6 张可解码图，脚本语法和唯一显式外链检查通过；YAML / JSON 逐字段一致，41 个非 manifest 文件均有哈希。
- ✅ 共用 palm 两文件与 HEAD 原字节一致；仅写授权目录与本报告，无工具 / 设计文档改动，无 git 状态变更命令，无临时整仓或整份 assets 复制。
- ⚠️ 需作者确认事项及默认值见 §4；不将静态检查当作浏览器实测或作者批准。自写文本分节落盘，每次≤150行；本报告≤100行，无未完占位。
