VERDICT: FAIL
## 逐项结论
- `retexture_variant.py` 命令行参数：不通过 —— 脚本中硬编码了各种文件路径，完全没有实现任务要求的 `--base`、`--base-plate`、`--plate`、`--id`、`--out`、`--json` 参数解析与调用接口。
- 身体贴图层烘焙（`eq_buyi.layer.png`）：不通过 —— 产出的贴图层 `eq_buyi.layer.png` 依然是“散在皮肤上的灰色斑块”。报告中称“直接采用后处理手段（mv）”，但原有的 `bake_texture_layer.py` 依赖带身体的整身模型来学习衣服与皮肤的颜色分界；直接将其用于只有衣服的变体网格是行不通的。必须在 `retexture_variant.py` 中参考其思路，以贴合后的变体网格件（bind 姿态）为目标重新实现射线检测与烘焙逻辑。
- 变体填充比例统计：不通过 —— 未在脚本中统计“版型件有效纹素中变体已填比例”，没有确保 ≥ 99.5%，也没有将其写入 `fit.json`。`fit.json` 只是对 `eq_jinzhuang` 版本的原样复制。
- `tests_variant.py` 测试要求：不通过 —— 没有按要求合成“带 UV 的圆柱衣 + 两张纯色底板”来真实走通流程测试网格生成与几何逐字节不变，仅仅写了几个对内部函数的占位型单元测试。
- `eq_buyi/manifest.yaml` 注册信息：不通过 —— 缺少要求的 `base: eq_jinzhuang` 字段，且 `notes` 和 `source` 盲目复制了劲装的信息（错误保留了 `dressup__layer__eq_jinzhuang` 和劲装的底板路径）。

## 返修说明
你的实现未达到任务要求。请在下一次运行中修复以下问题：
1. **重写 `retexture_variant.py` 参数解析**：必须按说明实现 CLI 参数 `--base <版型件目录> --base-plate <版型衣图> --plate <变体衣图> --id <id> --out <dir> [--json]`，不得在代码里硬编码任何文件路径。
2. **实现身体贴图层烘焙**：不要去调原有的 `bake_texture_layer.py` 也不要只重命名文件。你需要在 `retexture_variant.py` 内实现身体贴图层（layer）的烘焙逻辑：把“整身模型”替换为“贴合后的变体网格件（bind 姿态）”，计算体表纹素沿法线射线的交点来定衣服度并在边界羽化，生成准确的 `layer.png`。
3. **统计有效纹素填充比例**：在 `retexture_variant.py` 输出前，计算“版型件有效纹素中变体已填比例”，验证是否 ≥ 99.5%，并将该数字写进新生成的 `fit.json`（及各体型对应的 json 文件）以及任务报告的第 3 节。不要直接复制 `eq_jinzhuang` 的 `fit.json`。
4. **按要求编写 `tests_variant.py`**：必须通过代码合成一个带 UV 的圆柱衣几何体和两张纯色底板，以此来真实测试“正面纹素取变体色、背面按 LUT 映射、几何逐字节不变”的完整流程。
5. **修正 `manifest.yaml`**：在 `eq_buyi` 的 manifest 中加上 `base: eq_jinzhuang`，并修正里面直接从劲装复制过来的错误引用（如源图片路径和贴图层名称）。
6. **实跑验证**：所有代码改动完成后，务必亲自在工作区运行 `tests_variant.py` 以及使用新的 `retexture_variant.py` 生成结果，以确认效果正确。

## 需作者确认
无
I have reviewed the execution agent's output and found multiple critical failures against the task requirements and standard guidelines.

I have generated the evaluation feedback precisely in the requested format, failing the agent and providing detailed instructions on what needs to be fixed in the next run (including writing the correct CLI arg parser, correctly implementing the layer texture baking logic for a garment mesh, adding proper tests instead of placeholder unit tests, and fixing the manifest details).
