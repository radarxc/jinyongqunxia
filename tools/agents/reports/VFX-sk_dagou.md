# VFX-sk_dagou 报告 · 招式特效 · 天级 打狗棒法（sk_dagou，12 招）

## 1. 摘要（3–6 行）

- 完成图鉴实际定义的 11 个正式招式：每招 Composition YAML/JSON、1536×1024 峰值帧与 Three.js 演示。
- 完成家族与 3 个绝招共 4 套白底四帧原料，切出 16 张 straight RGBA；全部为 candidate。
- 发出方仅逐字节引用共享 staff；图鉴无 `projection:true`，未把远程长棒动作伪作真气外放。
- 任务清单中的 `mv_dagou_` 是不完整前缀，故标题 12 招与图鉴 11 招冲突；未伪造第十二招。
- 指定 image_gen 首轮约9分钟无回执，单图重试又因app-server权限失败；原料按仓库先例降级为可复现Pillow配方。

## 2. 产出（文件、行数、主要章节）

| 产出 | 数量 / 行数 | 主要内容 |
|---|---:|---|
| `assets/default/vfx/sk_dagou/effect` | 4 套 / 4 源图 / 16 RGBA | EffectSet、三底预览、quality.json |
| `assets/default/vfx/sk_dagou/moves` | 11 目录 / 44 文件 | 每招 YAML/JSON、peak、demo |
| `manifest.yaml` | 16 行 / 15 条 | 4 原料 + 11 招，完整性哈希 |
| README / source_requests / 4 个制作脚本 | 6 文件 | 依据、降级记录、可复现构建 |
| 资产目录合计 | 91 文件 | 仅写获准套件；本报告另计 |

## 3. 关键结论与数值

- 11=8 普通+3 绝招；4 套均为1536×1024白底2×2，每格768×512，phase=[0,.25,.5,1]，各1→1。
- nature=neutral，主色按项目规则取素白，辅暖灰/焦墨；无已核实原著颜色，全部造型（原创扩展）。
- staff E=[1189.5,645]，方向[1,0]、截面54px；Composition E=[650,512]、emitter_scale=.5，效果根目标宽27px。
- 参考长560px；沿向 `sx=L/560`。长度192/240/256/288/320/384px；其中引字诀 `range.max 3` 取 `3×128=384px`，其余为近身/架势局部【建议值】，不回填玩法。
- pulse=`.10+.15+.25+.10=.60s`；wave=`.15+.20+.40+.15=.90s`；峰值phase=.5，循环间隔另加.4s。
- 16/16帧8px边框alpha比与残白比均0；白底重建最大误差≤0.583/255。HTML 522,133–540,271 bytes，均<3,000,000。

## 4. 开放问题（附默认值）

| 问题 | 默认值 |
|---|---|
| image_gen 不可用 | 首轮无回执；单图重试在调用前报 app-server `Operation not permitted`。暂沿用Pillow candidate |
| “12 招”计数 | 以正式图鉴 11 招为准；`mv_dagou_` 只作前缀，不生成目录 |
| 作者审美审批 | 四套素白水墨维持 candidate，不把静态自检当 approved |
| 浏览器 / 真机 | 静态校验通过；CDN、连续帧、移动端混合及人物挂点仍（待实测） |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

无基准修改提案。计数是任务元数据错误，不修改正式图鉴或玩法基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 改什么 |
|---|---|---|
| `tools/agents/tasks.json` / VFX-sk_dagou | 标题、moves | “12 招”改为“11 招”，删除不完整前缀 `mv_dagou_` |
| VFX 生产环境 | image_gen 调用 | 查明 Codex 会话无回执；同类任务预先定义允许的确定性降级 |
| 运行时接入文档 | 打狗棒法挂点 | 11 招按动作事件接线；天下无狗三段、棒打双犬连锁不得由四帧图推导 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| mv | 绝招 | 外放 | 效果套 | 长度 | 节奏 |
|---|---|---|---|---:|---|
| `mv_dagou_aokouduozhang` | 是 | 否 | aokouduozhang | 256 | wave/.90s |
| `mv_dagou_ban` | 否 | 否 | family | 240【近身】 | pulse/.60s |
| `mv_dagou_bangdashuangquan` | 否 | 否 | family | 288【近身】 | pulse/.60s |
| `mv_dagou_bogouchaotian` | 否 | 否 | family | 288【近身】 | pulse/.60s |
| `mv_dagou_chan` | 否 | 否 | family | 256【近身】 | pulse/.60s |
| `mv_dagou_egoulanlu` | 否 | 否 | family | 192【架势】 | pulse/.60s |
| `mv_dagou_fanjiegoutun` | 否 | 否 | family | 288【近身】 | pulse/.60s |
| `mv_dagou_tianxiawugou` | 是 | 否 | tianxiawugou | 320【周身片段】 | wave/.90s |
| `mv_dagou_xiedagoubei` | 否 | 否 | family | 288【近身】 | pulse/.60s |
| `mv_dagou_yajiangoubei` | 是 | 否 | yajiangoubei | 320【近身】 | wave/.90s |
| `mv_dagou_yin` | 否 | 否 | family | 3×128=384 | pulse/.60s |

- ✅ 原料：family、aokouduozhang、tianxiawugou、yajiangoubei各1候选选1；普通招只复用family。
- ✅ 原著依据：沿图鉴的八字诀与“天下无狗四面八方尽是棒影”；具体招名场景/版本（待考），未编回目或引文；配色与独特轮廓标（原创扩展）。
- ✅ `view_image` 看过4张源图、4张黑底预览及引字诀/天下无狗峰值；效果从棒端沿右向发出、根部连续、无白边。
- ✅ `check_skill_suite`：图鉴11招齐全、0问题；`check_assets`：15图片/15条、0问题；`check_ids --strict`：新增严格失败0。
- ✅ 11个HTML仅含指定Three.js r186外链且≤3MB；共享staff两文件SHA-256与HEAD一致，未复制、未改。
- ✅ 只写指定资产目录与本报告；未改工具/设计/TODO，未执行改变仓库状态的git命令。
- ⚠️ image_gen失败与12/11计数冲突见§4；其余静态交付完成，浏览器/真机仍待实测。
