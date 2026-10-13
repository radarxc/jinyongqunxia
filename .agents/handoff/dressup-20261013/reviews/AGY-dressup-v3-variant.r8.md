VERDICT: FAIL

## 逐项结论
- 写集完整性：不通过 —— 工作区仍有被 `.gitignore` 隐藏的 [debug_alpha.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/scratch/debug_alpha.py) 和 [debug_skin.py](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/AGY-dressup-v3-variant/scratch/debug_skin.py)。两者创建于本任务执行期间，内容直接读取 `eq_jinzhuang` 并排查贴图有效像素、肤色纹素，属于本任务调试残留，但不在 WRITES 内，违反“结束前删除工作区里所有不在写集的文件”的明确裁定。普通 `git status --short` 不显示它们；`git status --short --ignored` 显示 `!! scratch/`。
- 变体衣图与 threeview manifest：通过 —— 衣图 SHA-256 与协调者指定的 `agy_imagetool_eq_buyi_front.aligned.png` 完全一致；灰褐粗麻、交领、腰带和人物轮廓符合要求，无文字或水印。`check_plate.py` 七项通过；衣服区 IoU 25/40/60 实测为 `0.956281/0.922671/0.783253`。
- `retexture_variant.py` 核心算法：通过 —— 使用动态投影标定、z-buffer、衣服区掩码及 `|n·z|≥0.35` 限制；背侧走 9³ Lab LUT，掠射处羽化；IoU `<0.95` 和填充率 `<0.995` 均为真实非零退出硬门。
- 网格贴图质量：通过 —— 三份 fit 均记录 `variantFillRatio=1.0`、`variantBrightRatio=0`、`variantSkinRatio=0.0140011`、投影覆盖率 `0.101177`；各 UV 岛有颜色，未见大片黑色或成串白线。
- 三模板 GLB：通过 —— 实际比较确认规范化 JSON 一致、所有非图片 bufferView 逐字节一致、8 个 accessor 及其字节一致；材质保持双面 `KHR_materials_unlit` 且只引用 JPEG q85 baseColor。
- 身体贴图层：通过 —— RGBA 贴图透明纹素 RGB 全为零；torsoUpper/Lower 为 `0.998621/1.0`，双上臂均为 `1.0`，双前臂为 `0.996628/0.998567`，禁区为零。前后预览不再是零散灰斑。
- 质检图：通过 —— 网格前后视图使用正确肤色和灰褐衣料；没有此前的蓝紫色或迷彩式 UV 采样错误。胸口肤色洞是版型件继承缺陷，已按协调者 18:40 裁定只报不判。
- manifest、fit、report：通过 —— `base: eq_jinzhuang`、`item: eq_buyi`、`status: draft`、`experimental: true`、哈希及文件大小均与产物一致；三模板 validate 的既有失败如实保留。
- 自动测试与总门禁：通过 —— 最终执行日志记录 `tests_variant.py` 6/6、`selftest.py` 7/7、`check_plate.py` 7/7、`pnpm check` 186 个测试文件/1322 项测试全部通过。本轮只读环境没有可用临时目录，未重新执行会创建临时文件的测试。
- 报告：通过 —— 七节齐全、33 行，产物数量、实跑数字、限制和 P3 命令序列均与当前产物一致。

## 返修说明
删除两个写集外调试残留：

- `scratch/debug_alpha.py`
- `scratch/debug_skin.py`

删除后用 `git status --short --ignored` 和 `find scratch -type f` 复核它们已不存在。无需修改任何已通过的代码、素材或门禁数字；随后重跑规定检查并再次提交审核。

## 需作者确认
无。