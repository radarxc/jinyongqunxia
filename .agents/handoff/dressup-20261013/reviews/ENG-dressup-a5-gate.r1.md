VERDICT: FAIL

## 逐项结论

- 写集与依赖：通过 —— 所有改动都在允许路径内；只新增 `meshoptimizer@1.3.x`，未修改既有基础库、素材正本或已批准图片，未引入 Blender、新 pip 包或绝对路径。

- CLI 基础检查：通过 —— 四个 `--help` 均退出 0，`git diff --check` 通过；监督日志也记录 `pnpm check`、1274 项测试和产品门禁退出 0。

- 动态穿透门禁：[validate.py:97](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:97)：不通过 —— 同一节点的 translation、rotation、scale 三条 channel 每次都从静止 TRS 重新合成，后处理的 scale channel 覆盖了前两条动画结果。对真实正本在 `t=0.37s` 复测，walk/run/idle 的动画世界矩阵相对静止姿势最大差仅 `6.34e-7 / 5.23e-7 / 5.20e-7`，实际是在重复测 bind pose。因此报告中的三段 `0%` 不是有效动态穿透数据。

- 刚性 prop 门禁：[validate.py:164](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:164)：不通过 —— 代码在读取 `fit.kind` 前无条件调用 `asset.skin()`、检查 IBM 和蒙皮权重；而 spec §5.2 的规范 prop 是无 skin 的刚性单节点资产。因此合法 prop 会直接报输入错误，无法执行锚点、主轴和真实尺寸门禁。

- 门禁证据完整性：[validate.py:178](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/validate.py:178)：不通过 —— 缺失或空的 `jointsAllowed` 会回退为全部骨骼，等于关闭该项门禁；refit 的两个 p90 字段缺失时又默认成 `0`，虚构出通过结果。材质也只检查贴图尺寸，没有检查 `KHR_materials_unlit`、只引用 baseColor、衣物/发型 `doubleSided`。不满足“每件资产必须过完整 validate”。

- `textures.py`：[textures.py:70](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/textures.py:70)：通过 —— 能移除非 baseColor 纹理引用、重建 BIN/bufferView、重排 accessor 索引、输出 JPEG 并加入 unlit；实现未见覆盖正本或保留废弃图片块的问题。

- `pack_glb.mjs`：[pack_glb.mjs:172](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/pack_glb.mjs:172)：不通过 —— 编码后把原 bufferView 指向 `buffer: 1`，同时声明第二个无 `uri` 的 buffer，但 GLB 实际只写入一个 BIN chunk。自带解码器只读扩展数据所以能“解码通过”，不能证明产物是合法 glTF/GLB。LockBorder、区域边界锁定和只换索引的方向本身符合要求。

- `ingest.py`：[ingest.py:101](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/model3d/dressup/ingest.py:101)：部分通过 —— 状态映射、复制范围和路径限定提交符合要求；但它依赖上述存在漏检的 report，现阶段不能保证 AR-103 的“过 validate 才入库”。

- 构建期发布：[dressup-assets.ts:16](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/apps/game/build/dressup-assets.ts:16)：不通过 —— 解析器只接受两空格缩进的顶层字段，会遗漏 manifest `fits.<template>.file/report/status` 中的跨模板资产。测试只覆盖顶层 retained/rejected，没有覆盖 spec §7 的多模板变体。

- 自动测试：[dressup-assets.test.ts:31](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/apps/game/build/dressup-assets.test.ts:31)：不通过 —— 新测试只覆盖发布器；没有能发现动画 TRS 覆盖、刚性 prop、缺失门禁证据或非法 meshopt buffer 布局的数值断言。全仓测试绿色不足以证明 A5 契约完成。

- 报告：[ENG-dressup-a5-gate.md:21](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-a5-gate/tools/agents/reports/ENG-dressup-a5-gate.md:21)：不通过 —— 七节齐全且 49 行、B1 接口写清楚；但 `idle/walk/run=0%` 和“19/19 全部检查通过”建立在失效的动画采样及默认值放行上，不能作为合入证据。

## 返修说明

1. 修复 `_world_matrices`：先为每个节点保存一份 translation/rotation/scale，采完该节点全部 channel 后只 compose 一次；增加真实正本断言，确保 walk/run/idle 中间帧明显不同于 bind pose，并分别覆盖 LINEAR、STEP 和 CUBICSPLINE 拒绝。

2. 在读取 skin 前按 `fit.kind` 分流：garment/hair 等蒙皮件执行骨架、IBM、权重和动态穿透；prop 接受规范的无 skin、无节点 TRS 刚性资产，执行锚点、+Y 主轴、尺寸误差、面数、贴图和材质检查。

3. 必需证据不得用默认值伪造通过：蒙皮件必须有非空 `jointsAllowed`；refit 必须同时提供源件与目标件 p90；缺字段应生成 fail check。补 `KHR_materials_unlit`、仅 baseColor 引用、doubleSided 和 prop 无 TRS 门禁。

4. 修正 meshopt GLB 布局，不得声明没有 URI、也没有对应 BIN 数据的第二 buffer。用现有依赖验证：GLB buffer 结构合法、three `GLTFLoader` 可加载、解码后 UV/JOINTS/WEIGHTS/_REGION/IBM 与输入一致。

5. 发布器需识别顶层资产及 `fits` 下非 rejected 的 `file/report`，同时继续忽略 `source.file` 等非运行时字段；补 candidate/draft/rejected 多模板测试。

6. 重新跑合成正例和负例、真实正本 `textures + pack --simplify 0.4`、四个帮助命令及完整 `pnpm check`。报告更新真实动态穿透数字、刚性 prop 结果、合法 GLB 验证和最终测试数，不再保留当前失真的 19/19 结论。

## 需作者确认

无。