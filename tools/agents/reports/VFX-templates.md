# VFX-templates 报告 · 外放招式 · 玄级 / 黄级统一特效模板、绑定表生成与单门套件检查脚本

## 1. 摘要（3–6 行）

- 完成3种Three.js模板、色板、无Composition CLI、7张image_gen原料、25张透明帧与6份demo。
- 全库绑定2788招：2541个显式ID全部覆盖，另展开247个已声明短后缀；绝招654、普通招2134。
- 完成单门套件检查、5项套件门禁单测；本轮修复鞭索误判与unknown模板入口，新增4项回归，六条指定验收命令均退出0。
- 449门没有声明招式ID、282招剑形兜底、34招性质缺省均列审计；不造新玩法ID、不冒充后续专属套件已制作。
- 静态峰值已目视，真实浏览器/GPU/CDN/真机及作者审批未完成；仅改授权路径，未执行改变仓库状态的git命令。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 / 数量 | 内容 |
|---|---:|---|
| `tools/vfx/web/vfx_player.js` / `timeline.js` / `test_timeline.mjs` | 309 / 112 / 170 | 调色、残影、普通招包络；11项Node测试 |
| `tools/vfx/build_demo.py` / `templates.py` / `test_templates.py` | 284 / 197 / 158 | 模板CLI、参数/schema校验、静态预览、5项集成测试 |
| `tools/vfx/cut_frames.py` / `README.md` | 297 / 189 | 普通招2–3帧例外、使用/交接命令 |
| `tools/vfx/bind_moves.py` / `test_bind_moves.py` | 404 / 194 | 确定性绑定、只读检查、审计、11项测试 |
| `tools/vfx/check_skill_suite.py` / `test_skill_suite.py` | 217 / 113 | 全招式四文件、引用/外链/哈希门禁；5项测试 |
| `assets/default/vfx/bindings.yaml` | 2790 | 2788个mv逐招记录 |
| `docs/design/vfx/palette.yaml` / `schema.yaml` / `binding-audit.yaml` | 9 / 400 / 553 | 色板、4类制作对象、完整缺项/兜底清单 |
| `docs/design/23-projection-vfx-pipeline.md` | 615 | §7.3统一模板/绑定；关联格式、校验、依赖；既有待决保留 |
| `assets/default/prompts/vfx.md` | 243 | §7.1模板原料提示词与真实生成说明 |
| `assets/default/vfx/templates/**` | 60文件；15,363,016 bytes | 7原图+25透明帧+7EffectSet+7quality+6HTML+6JSON+manifest+请求记录 |
| 模板 `manifest.yaml` / `source_requests.json` | 410 / 31 | 完整生成/编辑请求、来源、尺寸/哈希；58个文件完整性记录 |
| `tools/agents/reports/VFX-templates.md` | 109 | 本报告，≤120行 |

## 3. 关键结论与数值

- 4张玄级原图1254²→各4帧627²；3张普通招原图2172×724→各3帧724²；合计 `4×4+3×3=25` 透明帧。用内置image_gen生成，掌风首帧另编辑修正朝向；模型/推理档位未由工具返回，未猜测。
- 默认时间qi=0.60s、afterimage=0.48s、plain=0.32s；普通招 `0.0576+0.0384+0+0.224=0.32≤0.4s`，不改CT/命中/伤害。
- 残影4份、间距28px、拉伸0.04：末份峰值偏移112px、终点透明时140px，峰值最大沿向倍率1.16；份数允许3–5。
- 6份HTML均原尺寸无损WebP内嵌，最大1,319,170 bytes，占3,000,000预算约43.97%；唯一直接外链固定three r186。
- 去白重建最大误差0.39046个8-bit级数，半透明残白率均0；8px边框残留最大fan=0.12116%、plain impact=0.01309%，未达到旧建议0，保留原件与quality数据交人工确认，未腐蚀/裁掉细线。

## 4. 开放问题（附默认值）

| 问题 | 默认值 / 交接 |
|---|---|
| 调和 / 中性两色取值 | 待作者确认，先淡金#E8D6A3 / 素白#F4F4F4，集中改palette后重建 |
| 上游未声明招式 | 449门=黄395+玄54，仅登记缺口，不新造mv；34招缺性质取neutral |
| 发出方判断不了 | 282招/81门按任务默认sword；完整逐招清单见审计，第7节列全部武学 |
| 共享发出方与内功残影 | 当前无共享emitters目录；12种图及YAML由协调者合入后做4种锚点抽测。demo显式复用基线掌/指；inner绑定null，残影缺真实角色图时报错 |
| 实际视觉与环境 | 候选状态不变；协调者验收6demo、边缘/根部/连续性、控件、CDN及传递模块、GPU编译与移动性能 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| VFX-P01（沿用并扩充说明） | §18登记design/23制作子契约，涵盖统一模板；玩法仍归05/09/21 | 避免平行定义制作接口；本任务未改基准 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 / 位置 | 改什么 |
|---|---|
| `docs/design/catalog/skills-*.md` 招式卡 | 按binding-audit补449门招式ID、282招动作/器械、34招性质；本轮未修改图鉴 |
| `docs/design/05-martial-arts-system.md` anim、`docs/tech/02-rendering.md` VFX | 消费绑定与施展者nature；inner/movement残影从角色精灵取图，不产生玩法效果 |
| `docs/tech/07-asset-generation.md` 素材 / 后续单门任务 | 引用design/23 §7.3套件结构、manifest与check_skill_suite；制作命令共享根后须收紧路径验收 |
| `assets/default/STYLE.md` 作者要求、共享发出方后续任务 | 同步玄黄模板方向；共享类别需明确；由协调者合入12种图与`emitters/<type>/emitter-plate.yaml`，完成五指/握持及4种锚点抽测 |
| 基准§18、`docs/README.md` | 处理既有VFX-P01归属/索引提案 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 模式：qi按palm/finger或sword/fist与其余兵器/sonic选fan/beam/impact/rings；shader按palette着色。afterimage复制真实发出方3–5份，默认4/28px/0.48s/0.04；plain为impact/arc/wave，normal、brightness=1、0.32s，运行时拒绝超过0.4s及参数/时间轴冲突。旧两段式26项回归保留并通过。
- ✅ palette：yin #5FB5B0、yang #D9483B、harmony #E8D6A3、neutral #F4F4F4；后两色待作者确认；调色不作用发出方及普通招。
- ✅ tier：tian356 / di1088 / xuan1184 / huang160 / ungraded0；mode：bespoke1444 / template1344；模板：qi25 / afterimage1159 / plain160。
- ✅ emitter：null524、afterimage191、fan8、finger80、fist370、instrument57、leg26、palm316、sabre189、spear54、staff95、sword683、throw128、whip67，总计2788。
- ✅ 单门检查覆盖绝招与普通招、4交付文件、effect/共享emitter及图片引用、HTML≤3MB与唯一r186直接外链、manifest size/sha256；通过/缺普通招/越界emitter/额外外链/坏哈希5用例通过，失败退出1。
- ✅ 本轮六条指定命令均退出0：Python unittest 47项通过；`node --test tools/vfx/web/` 11项通过；播放器`node --check`通过；bind_moves --check通过；check_assets模板7图片/0问题；check_ids --strict failure=0、新问题0（保留sk_babuganchan已知豁免1项）。
- ✅ 额外核验：首轮58项文件完整性、7份EffectSet、6份TemplateComposition与HTML全部通过；本轮保持对应文件逐字节不变，重验--check --audit与git diff --check；旧待决未删除。
- ⚠️ 样例待协调者浏览器验收；下表路径均相对 `assets/default/vfx/templates/`，没有宣称完成GPU或真机测试。

| demo | bytes |
|---|---:|
| `qi_projection/demo_palm_yin_palm.html` | 1319170 |
| `qi_projection/demo_finger_yang_finger.html` | 809269 |
| `afterimage/demo_palm_neutral_palm.html` | 582474 |
| `afterimage/demo_finger_neutral_finger.html` | 649112 |
| `plain_strike/demo_palm_neutral_palm.html` | 842268 |
| `plain_strike/demo_finger_neutral_finger.html` | 898789 |

⚠️ 判断不了的完整逐招/来源清单见 [`binding-audit.yaml`](../../../docs/design/vfx/binding-audit.yaml) 的 `sword_fallbacks`；以下列出全部81门（每门相关招式暂用sword）：

- `sk_baicaobiandu`、`sk_baicaobianyao`、`sk_baidubianzheng`、`sk_baishouyujue`、`sk_baituodujing`、`sk_beisuqingfeng`、`sk_chengchuidafa`、`sk_chunqiubifa`。
- `sk_dabeidouzhen`、`sk_dagouzhen`、`sk_duanchangsan`、`sk_duyanfeisha`、`sk_erengushengcun`、`sk_eyingheji`、`sk_ezuijian`、`sk_feiyefeiye`。
- `sk_fenshuiemeici`、`sk_fushidu`、`sk_fuyushu`、`sk_gaibangqilingshu`、`sk_gaochangjiguan`、`sk_heifengzhen`、`sk_heweizhen`、`sk_hezuibifa`、`sk_huanyirongshu`、`sk_jiashafumogong`。
- `sk_jindifa`、`sk_jingangjue`、`sk_jiutianjiubu`、`sk_jiuyinliaoshangpian`、`sk_kaishanfufa`、`sk_kongquezhen`、`sk_kuaihuozhen`、`sk_langlifenshuici`。
- `sk_lianchongshu`、`sk_liuxingchui`、`sk_longfengshuanghuan`、`sk_luohanzhen`、`sk_mandaluozhen`、`sk_qihuangmifa`、`sk_qimenbuzhen`、`sk_qinglongcisha`。
- `sk_sanxiaoxiaoyaosan`、`sk_shaolinshangke`、`sk_shennongyaochu`、`sk_shexinshu`、`sk_shouchengfa`、`sk_shouchengzhen`、`sk_sishierduanzhen`、`sk_suogugong`。
- `sk_taiyueshibeishou`、`sk_tangmenjieqi`、`sk_taohuayaoli`、`sk_taohuazhen`、`sk_tiangang`、`sk_tianyishenshui`、`sk_tiebogong`、`sk_tiexueqigong`。
- `sk_tingfengbianwei`、`sk_tuinaliaofa`、`sk_wenjiawuxingzhen`、`sk_wudumichuan`、`sk_wuehezhen`、`sk_wulundazhuan`、`sk_wumuyishu`、`sk_wuxingqiling`。
- `sk_wuxingqizhen`、`sk_xiaoqimen`、`sk_yanluosan`、`sk_yaowangdujing`、`sk_yihun`、`sk_yirongshu`、`sk_yitiantulonggong`、`sk_yiyangshuzhi`。
- `sk_yufengshu`、`sk_yufengyin`、`sk_yushe`、`sk_yuwangzhen`、`sk_zhangmenboyi`、`sk_zhenwuqijie`、`sk_zuoyouhubo`。

### 第 2 次运行返修记录（2026-09-30）

- ✅ 默认入口改为`emitter-plate.yaml`并同步README；临时隔离池中运行真实CLI、不传`--emitter-path`的回归通过，未创建共享发出方资产。
- ✅ 兵器先取本武学类别/字段及名称，再取招式动作，排除“扇形”；点名四门全招式（含绝招）和7组类别/对手兵器场景通过。重算2788条，仅更新9门24条emitter：点名四门8条，六合枪/少林棍法/蝎尾鞭/劈卦刀/游氏双枪16条；其他绑定字段、兜底清单不变，审计统计已同步。
- ✅ 本轮仅改8个获准文件，每次补丁≤50行；60个模板文件及33个基线文件SHA-256与本轮开始时一致，原图、切帧、色板、播放器与六份demo均未重建。
- ⚠️ 共享12种发出方及4种锚点抽测仍待协调者合入后完成，未作通过声明；浏览器/真机、调和#E8D6A3与中性#F4F4F4确认沿用第4节默认值。

### 本轮返修（第 3 次运行，2026-09-30）

- ✅ 已解决鞭索误判：限定明确兵器词组/类别/持用，并排除对手持用；蜂语、循声、藏针、腐尸毒及同类共8门11招由whip改sword，其他绑定字段不变。兜底271→282招、79→81门，新增腐尸毒/高昌机关术；真实白绸索/金铃索/伏魔索/持长索回归通过。
- ✅ 已解决unknown入口拒绝：116条残影、5条普通招现可传入模板；普通招按兵器/palm/其他emitter选arc/wave/impact，保留unknown事实。真实绑定记录的API与CLI回归通过，测试使用临时发出方，不冒充共享图已交付。
- ✅ 六条验收在可写临时目录环境重跑，全部退出0；Python 47项（36.294s）、Node 11项。另验`--check --audit`及`git diff --check`；未复现上一轮只读沙箱的临时目录错误。
- ✅ 本轮仅改审核点名的7个文件，每次补丁≤50行；60个模板文件SHA-256与本轮开始时一致，已通过的图片、切帧、色板、播放器、demo及文档正文未改。
- ✅ bindings.yaml SHA-256：`686e607b07b0fc4a9e96d9a439d5a9907b460d00cfa25143f69b48be3d5299d8`。
- ✅ binding-audit.yaml SHA-256：`c12aec1156f14cfdbc6d89f3922b2e04b722f911f85cbffb3b2cb260fc09e969`。
