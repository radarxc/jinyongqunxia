# 角色分层部件 · 三视图切件规程（AR-29）

在仓库根目录执行；规格以 `docs/tech/09-character-rig.md` §1、§6 和 `docs/tech/07-asset-generation.md` §5.4 为准。AR-29 已把旧的 84 份“参考图 + 逐部件出图”规程改为“Gemini 一张三视图 + 工具切件”。

## 1. 已定约定

- `_L/_R` 只表示角色自身的解剖学左 / 右，不表示画面左右。
- `front34`、`side`、`back34` 都面向画面左，未镜像时近侧都是解剖学 `L`：front34 在画面右，side 投影在中间，back34 在画面左。
- 镜像才交换 L/R、UV、法线 X 与 z 值；未镜像三视图均须让 L 侧肢体在前。
- pivot / childJoint 优先取关键点与切件旁注；没有旁注时，`make_parts.py` 按三视图各自的 L/R 比例默认值回退。

## 2. 正式生产顺序

1. 从审定设定卡生成一张 A 字三视图，顺序 `front34 | side | back34`；三栏是同一个人、同一套衣着与配色，腋下和双腿之间可见背景。主角 / S 级上传立绘前，由作者自行关闭 Gemini 活动记录；其他角色只用文字事实。
2. 三栏拆图并归一为 256 px/m、脚底对齐；关键点检测后人工复核肩、肘、腕、髋、膝、踝，袍下髋膝不得盲信自动结果。
3. 工具按关节胶囊分区、补被遮区域、把四肢摆正，产出每视图 13 张 PNG 与 `keypoints.yaml` / `*.pivots.yaml`。
4. 运行：

   ```bash
   python3 tools/rig/make_parts.py assets/default/rig/<set>
   python3 tools/rig/make_parts.py assets/default/rig/<set> --check
   python3 tools/rig/preview.py assets/default/rig/<set> --out assets/default/rig/<set>/preview.png
   ```

5. 审核三视图与镜像的关节缝、近远遮挡、右衽 / 文字 / 伤疤；正式素材不得保留 `placeholder: true`。

## 3. 旧提示词状态

`rig/<set>/ref_<view>.md` 与 `rig/<set>/<view>/<part>.md` 是 AR-22 时期的历史队列，内含“近侧为右侧”等旧文案，**不得再执行**。逐部件出图流程作废；这些文件只保留追溯，后续由三视图切件任务统一退役，见 `tools/agents/reports/TOOL-rig-nearside.md` §7。

## 4. 占位与质检

- `tools/rig/make_placeholder_parts.py` 可重建 `male_std` / `female_std` 程序占位；manifest 明示 `placeholder: true`，不能冒充生成美术或发布素材。
- 每个正式 set 必须有 `3×13=39` 条 part 记录与 `nearSide: L`；有旁注时记录来源，无旁注时人工复核比例回退；alpha、描边、色槽、镜像安全规则见 tech/09。
- 预览里程序步态的姿势轮廓应保持原样；本修正预期只改变近远侧遮挡。
