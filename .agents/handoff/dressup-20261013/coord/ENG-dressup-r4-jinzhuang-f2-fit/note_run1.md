协调者开工说明（2026-10-13，R3 已合入，源件 `garments/eq_jinzhuang/source_f2/tripo_dressed_rig.glb` 与两张 f2 底板都在工作区里）：
1. 第一个动作：用 shell 读 `assets/default/model3d/dressup/garments/eq_jinzhuang/extract_run/extract.json`，记下旧劲装抽衣用的 `--keep-regions` 等参数；第二个动作：直接运行任务书第 1 步的 `extract_garment.py` 命令（其余参数照旧 extract.json 补齐）。不要先写计划，不要只回文字就结束。
2. 每一步跑完先看退出码与质检图再进下一步；门禁不过就如实停下写报告交回协调者，不改工具、阈值、测试，不手改 report / fit。
3. 运行时实拍由协调者在审核前做，执行者不用起 dev 服务、不用截图。
4. 全分辨率贴合、128 视角遮罩烘焙等长步骤可能十几分钟没有输出：用 `> 日志 2>&1` 跑，定期 `tail` 日志看进度。
