# 本任务：动作原型 P0 · 修正 rig 近侧与左右约定（AR-29）

本任务改技术规格、工具和渲染代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

## 背景

作者决定做人物动作原型（见 `docs/decisions/author-requirements.md` AR-29），路线是「2D 分层部件 + CC0 动作库驱动 + Gemini 三视图切件」。调研报告 `tools/agents/reports/RESEARCH-anim-motion-library.md` 必读：§1.1 现状、§5.3 模块、**§5.5 规格缺陷**、§5.6 原型、§8.4 近侧向量验算。

切件和接动作之前，必须先修一个规格缺陷：

- 三个视图都「面向画面左」时，离镜头近的是角色**解剖学左侧**。front34 时近侧在画面右，side 时在中间，back34 时在画面左。
- 现状却是：
  - `docs/tech/09-character-rig.md` §1.3 写 `nearSide:R`，§1.4 的 z 表三个视图都把 `*_R` 放最前；
  - `tools/rig/make_parts.py` 和 `packages/render/src/rig/placeholder.ts` 把 `shoulder_R` 写死在画面右侧（宽度的 86%），三个视图一样；
  - rig 部件提示词写「近侧为右侧」，和「面向屏幕左下」互相矛盾。
- 程序步态左右对称，所以现在看不出来；一旦从物理正确的三视图切件，或者按 3D 片段投影，远侧手臂就会画到躯干前面。

## 要做的事（报告 §5.5 的默认修法，作者已同意做原型）

1. **`docs/tech/09-character-rig.md`**：
   - `_L/_R` 统一按解剖学左右理解；三个视图都面向画面左，近侧为 `L`；
   - §1.3 的 `nearSide` 改为 `L`；§1.4 的 z 表三个视图都改为 `*_L` 在前，镜像时仍只交换 L/R 的值；
   - 说明关节位置以后取自关键点（三视图切件流程），不再用写死的宽度比例；
   - 文首变更记录写一条。
   - `docs/tech/07-asset-generation.md` 里关于 rig 部件出图的说法同步：三视图 + 工具切件、近侧为左。
2. **代码**：
   - `tools/rig/make_parts.py`、`tools/rig/templates.py`（若有关节比例）：近侧改为 L，关节位置允许由旁注（keypoints / pivot 旁注文件）给出，没有旁注时才退回比例默认值，默认值也要按新约定左右对调；
   - `packages/render/src/rig/placeholder.ts`、`types.ts`、`manifest.ts`、`character.ts`：z 表、占位关节与近侧常量照新约定改；
   - 相关测试：`tools/rig/test_make_parts.py`、`packages/render/src/rig/*.test.ts` 同步更新，并**新增**一条测试，断言三个视图都是 L 侧肢体在前、镜像后变 R 在前。
3. **素材清单**：
   - `assets/default/rig/male_std`、`female_std` 下由 `make_parts.py` 生成的占位清单，用脚本重新生成，不手改；
   - `assets/default/prompts/rig/GUIDE.md` 里「近侧为右侧」的说法改正，并加一句：今后部件来自三视图切件，逐部件出图流程作废，见报告 §7。
4. 步态视觉保持不变：程序步态左右对称，修正后 `/rig-demo` 画面应与修正前一致或只有近远侧遮挡变正确。在报告里写明怎么核对的。

## 约束
- 只写：
  - `docs/tech/09-character-rig.md`
  - `docs/tech/07-asset-generation.md`
  - `tools/rig/**`
  - `packages/render/src/rig/**`
  - `assets/default/rig/**`
  - `assets/default/prompts/rig/GUIDE.md`
  - 本任务报告
- 不改 `packages/render` 里 rig 以外的目录：城镇、特效任务正在改别的目录。
- core 不动。
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 -m unittest discover -s tools -p "test_*.py"`
- `pnpm install --frozen-lockfile`
- `pnpm check`

`pnpm check` 里的 rig 100 角色性能门禁，在机器高负载（loadavg > 12）时可能偶发失败。若只这一项失败，在报告里写明负载和数值，**不要改门禁阈值或跳过**。

## 报告

第 3 节写：
- 改了哪些常量与表；
- 新测试；
- `/rig-demo` 前后对比的核对方式。

报告 ≤ 60 行。
