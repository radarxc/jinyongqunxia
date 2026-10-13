VERDICT: FAIL

## 逐项结论

- 写集：通过 —— 相对基点 `0bd50e2be821f256a89e395542cee4526a9404eb` 的改动均位于允许路径；旧 `template_specs.json`、`derive_template.py`、`normalize_rig.py`、`export_skeleton.py`、`tpl_f_*` 未改。
- `fix_inverted_faces.py` / `tests_fix_faces.py`：通过 —— 支持多 primitive、共享索引、u8/u16/u32、交错 accessor、只读 `--check` 和幂等；已有实跑记录为 12/12。审核沙箱因无可写临时目录无法重跑合成套件，并非断言失败。
- 两个中等模板翻面：通过 —— 女 89 面、男 67 面；当前六模板倒置面均为 0。相对基点，女/男 GLB 分别仅有 324/244 个索引 accessor 字节变化，JSON、长度和全部索引外字节不变。
- `template_specs_v2.json` 与四体型派生：通过 —— 六行规格符合 T4b 补充裁定；四次真实 `derive_template.py --check` 均退出 0，最大比例误差 `3.430117e-8`，翻向和新增负点积面均为 0。
- 骨架与 section 颈环：通过 —— 六套 `normalize_rig.py --check`、`export_skeleton.py --check` 全过，均为 65 关节；最大 rest=bind 残差 `4.98e-7`。四派生颈环最大轴差为 `1.835194 mm < 2 mm`。
- GLB 契约：通过 —— 四派生的索引、JOINTS、WEIGHTS、UV、`_REGION`、joint 顺序与对应源一致；`_REGION` 为 u8 SCALAR；六套均为 `KHR_materials_unlit` 且只留 baseColor。
- `tests_derive.py` 授权补丁：通过 —— 原脚底阈值被逐位重算 LBS/防折叠校验替代；Hips bind、根运动和无 `rootOffset` 断言仍保留。近单位腿长与真实产物两项回归已独立通过。
- Manifest 与侧车：通过 —— 六份 body、skeleton、ring、regions、skull、derive 和 derived-source SHA 均与实际文件闭合，`mPerMu = defaultHeightM / heightMu`。
- 图片：通过 —— 六张 preview 均为 `640×960 RGB`；六模板 bind/walk 拼图体型递进清楚。男后脑 bind/walk/run 对照中暗像素由 `111/109/107` 降为 `0/0/0`，未见黑三角。
- 报告：通过 —— 7 节齐全、恰好 60 行，数值与产物一致，并交接了衣物、头和道具重贴合命令。
- 完成定义工具链：不通过 —— [报告第 18 行](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t5-bodies-v2-derive/tools/agents/reports/ENG-dressup-t5-bodies-v2-derive.md:18) 明确记录实际使用 Node `22.22.1`、pnpm `9.15.9`；任务附加规则及 [tech/01](/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/wt/ENG-dressup-t5-bodies-v2-derive/docs/tech/01-architecture.md:701) 要求 Node ≥24、pnpm 12.6.0。本机已有 `/usr/local/bin/node v24.13.0`，但本次 `pnpm install --frozen-lockfile` 和 `pnpm check` 未在指定工具链下执行。按“任一项不到位即 FAIL”处理。

## 返修说明

不需要重做模型、截图或 Python 产物。只需处理工具链门禁：

1. 由协调者先解决基点 `package.json` 锁定 pnpm 9 与任务要求 pnpm 12.6.0 的冲突；该文件不在本任务写集内，执行代理不得自行修改。
2. 在 Node 24.x、pnpm 12.6.0 环境下重新运行：
   - `pnpm install --frozen-lockfile`
   - `pnpm check`
3. 如果 pnpm 12 与现有 lockfile 不兼容，不得越权修改 `package.json` 或 lockfile；应将冲突交回协调者裁定。
4. 成功后刷新 `validation.pnpm-check.json`、`validation.summary.json` 和报告第 2、4、7 节中的真实版本、输出与偏差说明，再进入复审。

## 需作者确认

无。