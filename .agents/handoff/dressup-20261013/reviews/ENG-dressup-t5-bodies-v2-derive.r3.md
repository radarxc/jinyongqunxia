VERDICT: PASS

## 逐项结论

- 写集：通过 —— 所有已跟踪和未跟踪改动均位于授权路径；补充裁定授权的 `tests_derive.py` 在范围内。旧 `template_specs.json`、`derive_template.py`、`normalize_rig.py`、`export_skeleton.py`、基础库及旧 `tpl_f_*` 均未改动。
- 翻面工具与测试：通过 —— `fix_inverted_faces.py` 仅交换三角形第 2、3 个索引，支持多 primitive、共享 accessor、交错步长、原地幂等及只读 `--check`；测试覆盖四面体、立方体、u8/u16/u32、非法输入与非索引字节保护。
- 中等模板翻正：通过 —— 女模 `89→0`、男模 `67→0`；源/结果 SHA、中心 y 分布和前 50 个面号均已记录。女/男分别只改变 324/244 个索引字节，文件大小保持 8,575,592/8,670,272 B。
- T4b 源与规格：通过 —— 基点源 SHA 分别为任务指定的 `e528b178…d733e`、`d9db6f2d…b65d`；`template_specs_v2.json` 六行与最终补充裁定完全一致。
- 四套派生：通过 —— small/tall/lean/bulk 的实测身高、髋比、肩比均命中规格；最大比例误差 `3.43e-8`，位移均低于动态门限，翻向面和负点积面均为 0。
- 骨架与颈环：通过 —— 六模板均为 65 关节、rest=bind；独立运行六套 `fix --check`、`normalize --check`、`export --check` 及四套 `derive --check` 共 22 项全部退出 0。section 环均取 Neck→Head 15%，派生相对源最大轴差 `1.835194 mm < 2 mm`。
- GLB 契约：通过 —— 六套均保持共拓扑、UV、权重、JOINTS 和索引继承关系；`_REGION` 为 u8 SCALAR；材质均为 `KHR_materials_unlit` 且只引用 baseColor。
- Manifest 与侧车：通过 —— 六套 body、skeleton、ring、regions、skull profile、derive 的实际 SHA 均与 manifest 闭合；派生来源和输入 SHA 正确，状态保持 `candidate`；临时补丁及 `validation.floor-regression.json` 已删除。
- `tests_derive.py` 修订：通过 —— 仅替换获准移除的脚底差启发式，新增按声明分骨缩放重算骨架、LBS及防折叠结果的逐位检查，并覆盖近单位腿长和额外平移反例；原 Hips、动画轨、位移及几何门禁保留。
- 门禁证据：通过 —— 同一文件 SHA 的实跑记录显示 `tests_fix_faces.py` 12/12、`tests_derive.py` 10/10、`selftest.py` 7/7；Node 22.22.1、pnpm 9.15.9 下冻结安装及 `pnpm check` 退出 0，189 个测试文件、1339 项测试和全部内容/build/size 门通过。本轮只读环境无法创建 `tempfile`，但这属于审核环境限制，不是断言失败。
- 图片：通过 —— 六张 preview 均为 640×960 RGB、正面全身 bind；六模板统一米制 bind/walk 拼图中体型差异清晰，无撕裂、黑洞或异常翻面。男后脑 bind/walk/run 同机位对照中，修复后 ROI 暗像素均为 0，黑三角已消失。
- 报告：通过 —— 报告恰为 60 行，七节齐全，包含翻面数据、四套派生参数与误差、图片、开放问题以及衣物/头/道具重贴合和默认模板切换命令、输入 SHA。

## 需作者确认

无。