# 明·江南建筑 · 第3轮几何返修

- 仅重出审核点名的13种建筑，各最多2候选；源图、提示词、真实输入及测点分目录保存。
- `result.json` 区分改善候选与几何验收；替换不等于通过。精确投影或比例未验收的条目保持 `geometry_verified: false` / `geometry_release_ready: false`。
- 原源图、前两轮记录、未点名成品及两份提示词不改；`preservation_start.json` 记录221个既存文件的起始SHA。
- `wharf/normalize.py` 仅重建本轮河埠，保留全部非零alpha后裁切、等比LANCZOS和透明padding；原成品另存 `wharf/original.png`。
- 河埠两轴通过±0.03，宽深仍有2.28%残差；其测点图是质检附件，未混入根目录成品。
- 其他条目的选择理由、尺寸、锚点、源图及成品SHA以各自 `result.json` 为准；旧通用normalize脚本仍对应前轮源图，不用于重建本轮条目。
- 指定三项检查结果见 `checks.json`，只覆盖其脚本声明的文件/登记/ID范围，不能替代严格几何验收。
