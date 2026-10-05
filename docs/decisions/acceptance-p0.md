# 准出规范 · Phase G（P0 实现启动与文档收口）

> **归属**：执行流程与验收口径的集中登记（`tools/agents/README.md` 描述机制，本文描述"什么算通过"）。
> **上游**：`docs/tech/09-roadmap.md` §2（P0 量化退出标准）、§9（跨阶段门禁）；`docs/00-canon.md`；`docs/decisions/author-decisions.md`。
> **角色分工**（作者 2026-09-30 指示）：**规划 / 拆解 / 准出**由云端 Claude 会话负责；**执行 / 图像生成 / 多模态校验**由作者本机的 GPT CLI（TraeX `traex exec`，模型 GPT-6-Astra，起草 `ultra`、审校 `xhigh`）完成；**审定**（`approved`、作者闸门、设备与账号事实）只能由作者本人完成。
> 版本：v1.0（2026-09-30）。

## 1. 流程

```
拆解（云端）→ 执行（本机 GPT CLI，独立 worktree）→ 校验（run.py / step.py 自动规则）
→ 审校（本机 GPT CLI，xhigh；代码 / 素材用专用模板）→ 合入并推送分支
→ 准出（云端：拉取、复跑门禁、读报告、按本文清单判定）→ 通过 / 退回
→ 作者闸门（G3 / G4）与审定
```

- 每个任务的**自动校验**（`tasks.json` 的 `validate`）是最低门槛，不等于准出。
- **准出**在分支被推送后进行；结论记入 `tools/agents/reports/_acceptance-log.md`（任务 / 日期 / 结论 / 发现 / 处置）。
- **退回**的形式：(a) 用 `step.py start <ID> --note "<准出意见>"` 续作（任务尚未合入时）；(b) 已合入的，由准出方在 `tasks.json` 追加修订任务（`<ID>x`）并推送。不对已合入任务用 `--force` 重跑（见 SUPERVISOR.md "合入之后"）。

## 2. 全局门禁（每次准出都跑）

| 命令 | 通过条件 |
|---|---|
| `python3 tools/lint/check_ids.py --strict` | 新失败 0；冲突 0；套装不对称 0；基线只含 `sk_babuganchan` |
| `python3 tools/balance/damage_sim.py --check` | 全部通过，known deviations 0 |
| `python3 tools/balance/meridian_flow_sim.py --check` | 通过 |
| `python3 tools/map/render_map.py --check` | 城市 189 / 门派 99 / 图外 3；`special` 可增加 |
| `python3 -m unittest tools.lint.test_check_ids`（及新增的 lint 单测） | 通过 |
| `python3 tools/lint/check_quest_manifest.py content/chapters/<chid> --strict`（内容存在时） | 退出 0 |
| `python3 tools/lint/check_source_ratio.py`（L3 之后） | 生成报告；S2 之后 `--strict` 通过或有作者确认标注 |
| `python3 tools/lint/check_golden.py art/golden`（T4b 之后） | 通过 |
| `git diff --check`；无产物目录入库（`node_modules/ dist/ .cache/ art/work/`） | 通过 |
| GitHub Actions `ci.yml`（T0 之后） | 最新提交绿灯（云端 Node 版本可能低于工程要求，代码类以 CI 为准） |

## 3. 分类准出清单

### 3.1 文档类（A4、K2、M3、N2、S2、H2、P0A、Q*）

- [ ] 报告 7 节齐全且如实（未做 / 未核实的都写了）；审校报告有"通过 / 有条件通过 / 不通过"与严重度表。
- [ ] 只改了声明范围内的文件；被丢弃的越权改动不含必要内容（看提交正文"已丢弃"行）。
- [ ] 与基准无矛盾；概念只在归属文档定义，其他文档引用（抽查 5 处）。
- [ ] 数值可从公式推出（抽查 3 处复算）；（待考）没有被猜测清零；（原创扩展）有标注。
- [ ] 报告第 6 节"需同步到其他文档"逐条落到后续任务或 `_coordinator-notes.md`。
- [ ] 任务特定：A4——`canon-proposals-v1.2` 的每条"待 v1.3"有去向，G3 待确认项未被替作者填写；K2——`grep -rn recipeId docs` 只剩迁移语境；M3——每个 owner 文档有 `design/21` 引用且不重定义；N2——切片人物清单 = tech/09 §3.2；S2——总量 1,138 / 天级 51 不变；H2——`confirmed` 项均有书目或权威地理来源；Q*——任务数与 story §11 一致、每个 `dc_*` 在 manifest 中。

### 3.2 工具类（L2、L3）

- [ ] 只依赖标准库；`--json`、`--strict` 语义与 `check_ids.py` 一致；README 有用法与规则对照表。
- [ ] 单测覆盖每条实现规则的通过与失败各一例；未实现的规则清单明确写"由 tech/04 内容管线实现"。
- [ ] 对现有仓库运行成功（L3 在 S2 之前 FAIL 属预期）。

### 3.3 代码类（T0、T1、T2、T3、T4a、T5）

- [ ] CI 绿灯；报告写了每条验收命令的实际输出与数字（覆盖率、size-limit、P95 等）。
- [ ] 与技术文档的偏离处逐条列出并有理由；未擅自改 `docs/tech/*`。
- [ ] 确定性：core / shared 无禁用 API（`grep -rn "Math.random\|Date.now\|performance.now" packages/core packages/shared` 为空）；golden 与 Python 参考逐位相等。
- [ ] 无产物 / 密钥入库；`pnpm-lock.yaml` 已提交；`.gitignore` 覆盖。
- [ ] 任务特定：T0——确定性 lint 会真的报错、spec JSON 字段对照 tech/02；T1——录像重放哈希相等、事务回滚不变量有属性测试；T2——双构建逐字节一致、L6 可达性报告真实；T3——≥ 20,000 例投影属性测试、`desktop-smoke.json` 字段齐全、HUD 可导出、真机操作步骤写清；T4a——状态机 / stale 传播测试、`approve` 拒绝 AI 调用者、Blender 脚本 AST 通过；T5——401 / 409 / 损坏保留原件 / 离线重开 e2e 真实。

### 3.4 素材类（T4b + T4b.R 多模态校验）

- [ ] `check_golden.py` 通过；每张 golden 图有登记条目、请求文件、哈希一致。
- [ ] `T4b.R` 评分表逐张存在，8 项 ≥ 7 且一致性 ≥ 4；硬规则（右衽、朝代、无演员肖像、无文字水印）零违例。
- [ ] 登记状态最高 `review`；作者审定清单已列。
- [ ] 工具限制（分辨率、次数、参考图、水印、条款可见性）如实记录——这是 P02 实测证据的一部分。
- [ ] 准出方抽看 ≥ 6 张图（每主题 1 张）复核评分。

### 3.5 P0 出口（P0A）

按 `tech/09` §2.5 表逐行：包体、帧节拍（三机 × 常规 / 压力 × 冷 / 热）、持续 / 长帧、投影、地形、遮挡、韧性、数据、存档、访问、风格。每行必须有 `docs/evidence/p0/` 中的证据文件名；缺证据只能是"未测"，不能是"通过"。ADR-0001 / 0002 状态为 `accepted` 的前提是全部硬门通过；否则 `proposed` 并列出降级与复评条件。**P0 签出**同时要求：G3 / G4 已 approve；作者三机型号已登记（RD-01）；`STATUS.md` 中"进入 P1 的条件"逐项为是。

## 4. 阶段准出（Phase G 完成的定义）

1. 文档收口：A4、K2、M3、N2、Q01 全部准出通过；S2 通过或带作者确认标注；H2 完成（允许 `regional` 存在）。
2. P0 工程：T0–T5（含 T4b）全部准出通过，CI 绿灯，`bench-iso` 三机证据齐全。
3. P0 出口：P0A 准出通过，ADR 为 `accepted`，或 `proposed` 且作者接受降级方案并登记复评条件。
4. `TODO.md`、`docs/README.md` 更新为 Phase G 终态；`_acceptance-log.md` 完整。
5. 未完成的 Q02–Q14、M4 不阻断 P0 签出，但阻断 P1/M2（天龙切片需要 Q01；其余章节在各自阶段前完成）。

## 5. 准出不做的事

- 不替作者做 `approved`、不填作者决定、不代跑真机、不部署、不购买或开通服务。
- 不修改执行代理的产出正文来"帮它通过"；发现问题走退回流程，让证据留在报告里。
