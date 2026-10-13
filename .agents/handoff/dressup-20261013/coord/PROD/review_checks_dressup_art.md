# 审核要点 · ART-dressup-*（3D 纸娃娃换装出图 / Tripo，AR-102 / AR-104）

1. **出图合规**：图片必须来自 Codex `gpt-6-astra` image_gen（`_imagegen.md`）；不得用 Pillow / 代码变形、拼贴手臂或身体凑角度（对比原底图，手臂以外区域不应出现几何扭曲痕迹）。
2. **同一人**：与底图并排看，脸、五官、光头轮廓、唇色、眼周、身材比例、裹胸与三角裤、裸足不变；不得加发、饰物、鞋、衣物（AR-97 / AR-99 素体铁律）。
3. **门禁数字可复现**：报告里的 check_plate 数值与重跑 `check_plate.py … --arm-angle-deg 30 --arm-tol-deg 3 --json` 一致；左右臂角都在 30° ± 3°；头顶 / 脚底 < 2%；脸区 IoU ≥ 0.9。
4. **manifest**：新条目字段齐全（tool / model / source_path / prompt / references+sha256 / sha256 / size / check_plate / status: candidate）。
5. **不花点数**：T1 不得调用 Tripo；T2 / T5 报告写清点数消耗与余额，不得输密码、买点数、点条款。
6. **只改声明文件**；报告 7 节、≤ 60 行。
